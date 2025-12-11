// controllers/paymentLinkController.js
import { QuotationPaymentLink } from "../models/QuotationPaymentLink.js";
import mongoose from "mongoose";

// Helper function to get quotation model by type
const getQuotationModel = (type) => {
  switch(type) {
    case "Custom": return mongoose.model("CustomQuotation");
    case "Hotel": return mongoose.model("HotelQuotation");
    case "Vehicle": return mongoose.model("VehicleQuotation");
    case "Flight": return mongoose.model("FlightQuotation");
    case "Quick": return mongoose.model("QuickQuotation");
    case "Full": return mongoose.model("FullQuotation");
    default: throw new Error(`Unknown quotation type: ${type}`);
  }
};

// 1. Link payment to quotation
export const linkPaymentToQuotation = async (req, res) => {
  try {
    const { voucherId, quotationId, quotationType, allocatedAmount, description, companyId } = req.body;
    
    // Check if voucher exists
    const ReceivedVoucher = mongoose.model("ReceivedVoucher");
    const voucher = await ReceivedVoucher.findById(voucherId);
    if (!voucher) {
      return res.status(404).json({ error: "Payment voucher not found" });
    }
    
    // Check if quotation exists
    const QuotationModel = getQuotationModel(quotationType);
    const quotation = await QuotationModel.findById(quotationId);
    if (!quotation) {
      return res.status(404).json({ error: "Quotation not found" });
    }
    
    // Check voucher balance
    const totalAllocated = await QuotationPaymentLink.aggregate([
      { $match: { voucherId: voucher._id } },
      { $group: { _id: null, total: { $sum: "$allocatedAmount" } } }
    ]);
    
    const alreadyAllocated = totalAllocated[0]?.total || 0;
    const availableBalance = voucher.amount - alreadyAllocated;
    
    if (allocatedAmount > availableBalance) {
      return res.status(400).json({ 
        error: "Insufficient voucher balance", 
        availableBalance 
      });
    }
    
    // Create the link
    const link = new QuotationPaymentLink({
      voucherId,
      quotationId,
      quotationType,
      quotationReference: quotation.quotationId || quotation.referenceNumber || `Q-${quotationId}`,
      allocatedAmount,
      description,
      companyId
    });
    
    await link.save();
    
    res.status(201).json({
      success: true,
      message: "Payment linked successfully",
      data: link,
      voucherBalance: availableBalance - allocatedAmount
    });
    
  } catch (error) {
    console.error("Error linking payment:", error);
    res.status(500).json({ error: error.message });
  }
};

// 2. Get all payments for a quotation
export const getQuotationPayments = async (req, res) => {
  try {
    const { id } = req.params;
    const { type } = req.query; // quotation type
    
    if (!type) {
      return res.status(400).json({ error: "Quotation type is required" });
    }
    
    // Get all payment links for this quotation
    const paymentLinks = await QuotationPaymentLink.find({ 
      quotationId: id,
      quotationType: type 
    }).populate({
      path: 'voucherId',
      select: 'date paymentType partyName amount paymentMode referenceNumber drCr particulars receiptNumber invoiceId paymentScreenshot'
    }).sort({ createdAt: -1 });
    
    // Calculate summary
    let totalAllocated = 0;
    const payments = paymentLinks.map(link => {
      totalAllocated += link.allocatedAmount;
      return {
        linkId: link._id,
        allocatedAmount: link.allocatedAmount,
        description: link.description,
        linkedAt: link.createdAt,
        ...link.voucherId.toObject()
      };
    });
    
    // Get quotation total
    const QuotationModel = getQuotationModel(type);
    const quotation = await QuotationModel.findById(id);
    
    // Extract total amount based on quotation type
    let totalAmount = 0;
    if (quotation) {
      if (type === "Custom") {
        totalAmount = quotation?.tourDetails?.quotationDetails?.packageCalculations?.standard?.finalTotal || 0;
      } else if (type === "Hotel") {
        totalAmount = quotation?.totalAmount || quotation?.pricing?.totalCost || 0;
      } else if (type === "Vehicle") {
        totalAmount = quotation?.totalAmount || quotation?.pricing?.totalCost || 0;
      }
      // Add other quotation types as needed
    }
    
    const balance = totalAmount - totalAllocated;
    
    res.status(200).json({
      success: true,
      data: {
        payments,
        summary: {
          totalAmount,
          totalAllocated,
          balance,
          paymentCount: payments.length,
          paymentStatus: balance <= 0 ? "Paid" : totalAllocated > 0 ? "Partially Paid" : "Unpaid"
        }
      }
    });
    
  } catch (error) {
    console.error("Error fetching quotation payments:", error);
    res.status(500).json({ error: error.message });
  }
};

// 3. Get all quotations for a payment voucher
export const getVoucherQuotations = async (req, res) => {
  try {
    const { voucherId } = req.params;
    
    const links = await QuotationPaymentLink.find({ voucherId })
      .sort({ createdAt: -1 });
    
    // Group by quotation type and fetch details
    const quotationsByType = {};
    
    for (const link of links) {
      if (!quotationsByType[link.quotationType]) {
        quotationsByType[link.quotationType] = [];
      }
      
      try {
        const QuotationModel = getQuotationModel(link.quotationType);
        const quotation = await QuotationModel.findById(link.quotationId)
          .select('quotationId clientDetails totalAmount status createdAt');
        
        if (quotation) {
          quotationsByType[link.quotationType].push({
            ...quotation.toObject(),
            allocatedAmount: link.allocatedAmount,
            description: link.description,
            linkedAt: link.createdAt
          });
        }
      } catch (err) {
        console.error(`Error fetching ${link.quotationType} quotation:`, err);
      }
    }
    
    // Calculate voucher summary
    const totalAllocated = links.reduce((sum, link) => sum + link.allocatedAmount, 0);
    const voucher = await mongoose.model("ReceivedVoucher").findById(voucherId);
    const unallocated = voucher ? voucher.amount - totalAllocated : 0;
    
    res.status(200).json({
      success: true,
      data: {
        voucher: {
          id: voucherId,
          amount: voucher?.amount,
          date: voucher?.date,
          partyName: voucher?.partyName
        },
        quotations: quotationsByType,
        allocationSummary: {
          totalAllocated,
          unallocated,
          allocationPercentage: voucher ? (totalAllocated / voucher.amount * 100).toFixed(2) : 0
        }
      }
    });
    
  } catch (error) {
    console.error("Error fetching voucher quotations:", error);
    res.status(500).json({ error: error.message });
  }
};

// 4. Remove payment link
export const removePaymentLink = async (req, res) => {
  try {
    const { linkId } = req.params;
    
    const link = await QuotationPaymentLink.findById(linkId);
    if (!link) {
      return res.status(404).json({ error: "Payment link not found" });
    }
    
    await link.deleteOne();
    
    res.status(200).json({
      success: true,
      message: "Payment link removed successfully",
      releasedAmount: link.allocatedAmount
    });
    
  } catch (error) {
    console.error("Error removing payment link:", error);
    res.status(500).json({ error: error.message });
  }
};

// 5. Search available vouchers for a quotation
export const searchAvailableVouchers = async (req, res) => {
  try {
    const { quotationId, quotationType, clientName, minAmount, maxAmount, companyId } = req.query;
    
    if (!companyId) {
      return res.status(400).json({ error: "Company ID is required" });
    }
    
    // Build query for ReceivedVoucher
    let voucherQuery = {
      companyId,
      partyName: clientName ? { $regex: clientName, $options: 'i' } : undefined,
      amount: {}
    };
    
    if (minAmount) voucherQuery.amount.$gte = parseFloat(minAmount);
    if (maxAmount) voucherQuery.amount.$lte = parseFloat(maxAmount);
    
    // Remove undefined fields
    Object.keys(voucherQuery).forEach(key => 
      voucherQuery[key] === undefined && delete voucherQuery[key]
    );
    if (Object.keys(voucherQuery.amount).length === 0) delete voucherQuery.amount;
    
    const vouchers = await mongoose.model("ReceivedVoucher")
      .find(voucherQuery)
      .select('date paymentType partyName amount paymentMode referenceNumber drCr particulars receiptNumber')
      .sort({ date: -1 })
      .limit(50);
    
    // Calculate available balance for each voucher
    const vouchersWithBalance = await Promise.all(
      vouchers.map(async (voucher) => {
        const totalAllocated = await QuotationPaymentLink.aggregate([
          { $match: { voucherId: voucher._id } },
          { $group: { _id: null, total: { $sum: "$allocatedAmount" } } }
        ]);
        
        const allocated = totalAllocated[0]?.total || 0;
        const available = voucher.amount - allocated;
        
        return {
          ...voucher.toObject(),
          allocatedAmount: allocated,
          availableBalance: available,
          canAllocate: available > 0
        };
      })
    );
    
    // Filter vouchers with positive balance
    const availableVouchers = vouchersWithBalance.filter(v => v.availableBalance > 0);
    
    res.status(200).json({
      success: true,
      data: availableVouchers,
      count: availableVouchers.length
    });
    
  } catch (error) {
    console.error("Error searching vouchers:", error);
    res.status(500).json({ error: error.message });
  }
};

// 6. Update payment allocation amount
export const updatePaymentAllocation = async (req, res) => {
  try {
    const { linkId } = req.params;
    const { allocatedAmount, description } = req.body;
    
    const link = await QuotationPaymentLink.findById(linkId);
    if (!link) {
      return res.status(404).json({ error: "Payment link not found" });
    }
    
    // Get the voucher
    const voucher = await mongoose.model("ReceivedVoucher").findById(link.voucherId);
    if (!voucher) {
      return res.status(404).json({ error: "Voucher not found" });
    }
    
    // Calculate total allocated to this voucher excluding current link
    const otherAllocations = await QuotationPaymentLink.aggregate([
      { $match: { 
        voucherId: voucher._id,
        _id: { $ne: link._id }
      }},
      { $group: { _id: null, total: { $sum: "$allocatedAmount" } } }
    ]);
    
    const otherAllocated = otherAllocations[0]?.total || 0;
    const availableBalance = voucher.amount - otherAllocated;
    
    if (allocatedAmount > availableBalance) {
      return res.status(400).json({ 
        error: "Insufficient voucher balance", 
        availableBalance 
      });
    }
    
    // Update the link
    link.allocatedAmount = allocatedAmount;
    if (description) link.description = description;
    await link.save();
    
    res.status(200).json({
      success: true,
      message: "Allocation updated successfully",
      data: link,
      voucherBalance: availableBalance - allocatedAmount
    });
    
  } catch (error) {
    console.error("Error updating allocation:", error);
    res.status(500).json({ error: error.message });
  }
};