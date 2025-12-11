import ReceivedVoucher from "../models/payment.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import Company from "../models/company.model.js";
import mongoose from "mongoose";
import { HotelQuotation } from "../models/quotation/hotelQuotation.model.js";
import { Vehicle } from "../models/quotation/vehicle.model.js";
import { FlightQuotation } from "../models/quotation/flightQuotation.model.js";
import { CustomQuotation } from "../models/quotation/customQuotation.model.js";
import { fullQuotation } from "../models/quotation/fullQuotation.model.js";

// Mapping quotation types → exact models
const QuotationModels = {
    hotel: HotelQuotation,
    vehicle: Vehicle,
    flight: FlightQuotation,
    custom: CustomQuotation,
    full: fullQuotation,
};


// -----------------------------------------------
// CREATE VOUCHER
// -----------------------------------------------
export const createVoucher = asyncHandler(async (req, res) => {
    const {
        paymentType,
        date,
        accountType,
        partyName,
        paymentMode,
        referenceNumber,
        particulars,
        amount,
        invoice,
        companyId,
        quotationType,
        quotationId
    } = req.body;

    if (!date || !accountType || !partyName || !paymentMode || !particulars || !amount) {
        res.status(400);
        throw new Error("Please provide all required fields.");
    }

    const lastVoucher = await ReceivedVoucher.findOne().sort({ receiptNumber: -1 });
    const nextReceiptNumber = lastVoucher?.receiptNumber ? lastVoucher.receiptNumber + 1 : 1;
    const invoiceId = `R-${nextReceiptNumber}`;

    const voucher = await ReceivedVoucher.create({
        paymentType,
        date,
        accountType,
        partyName,
        paymentMode,
        referenceNumber,
        particulars,
        amount,
        invoice,
        receiptNumber: nextReceiptNumber,
        invoiceId,
        companyId,
        quotationType,
        quotationId
    });

    // Auto-update total paid for this quotation
    if (quotationId && quotationType) {
        await updateQuotationPaymentTotal(quotationType, quotationId);
    }

    res.status(201).json({
        success: true,
        message: "Voucher created successfully",
        data: voucher,
    });
});


// -----------------------------------------------
// AUTO UPDATE TOTAL PAID FOR A QUOTATION
// -----------------------------------------------
const updateQuotationPaymentTotal = async (type, quotationId) => {
    const totalPaidResult = await ReceivedVoucher.aggregate([
        { $match: { quotationId: new mongoose.Types.ObjectId(quotationId) } },
        { $group: { _id: null, totalPaid: { $sum: "$amount" } } }
    ]);

    const totalPaid = totalPaidResult[0]?.totalPaid || 0;

    const Model = QuotationModels[type];
    if (Model) {
        await Model.findByIdAndUpdate(quotationId, {
            totalPaidTillDate: totalPaid
        });
    }

    await ReceivedVoucher.updateMany(
        { quotationId },
        { $set: { totalPaidTillDate: totalPaid } }
    );
};


// -----------------------------------------------
// GET ALL VOUCHERS
// -----------------------------------------------
export const getAllVouchers = asyncHandler(async (req, res) => {
    const vouchers = await ReceivedVoucher.find()
        .sort({ createdAt: -1 });

    res.status(200).json({
        success: true,
        count: vouchers.length,
        data: vouchers
    });
});


// -----------------------------------------------
// GET VOUCHER BY ID
// -----------------------------------------------
export const getVoucherById = asyncHandler(async (req, res) => {
    const voucher = await ReceivedVoucher.findById(req.params.id)
        .populate({
            path: "companyId",
            select:
                "companyName address phone email gstin stateCode logo authorizedSignatory termsConditions paymentLink",
        });

    if (!voucher) {
        res.status(404);
        throw new Error("Voucher not found");
    }

    let quotationDetails = null;

    if (voucher.quotationId && voucher.quotationType) {
        const Model = QuotationModels[voucher.quotationType];
        if (Model) {
            quotationDetails = await Model.findById(voucher.quotationId);
        }
    }

    res.status(200).json({
        success: true,
        data: {
            ...voucher.toObject(),
            quotationDetails
        },
    });
});


// -----------------------------------------------

// -----------------------------------------------
export const getPaymentHistory = asyncHandler(async (req, res) => {
    const { type, quotationId } = req.params;

    const history = await ReceivedVoucher.find({
        quotationType: type,
        quotationId
    }).sort({ date: -1 });

    res.status(200).json({
        success: true,
        count: history.length,
        data: history
    });
});


// -----------------------------------------------
// PAYMENT SUMMARY FOR RECEIPT SCREEN
// /payments/summary/:type/:quotationId
// -----------------------------------------------
export const getPaymentSummary = asyncHandler(async (req, res) => {
    const { type, quotationId } = req.params;

    const summaryData = await ReceivedVoucher.aggregate([
        { $match: { quotationType: type, quotationId: new mongoose.Types.ObjectId(quotationId) } },
        { $group: { _id: null, totalPaid: { $sum: "$amount" } } }
    ]);

    const totalPaid = summaryData[0]?.totalPaid || 0;

    res.status(200).json({
        success: true,
        quotationId,
        type,
        totalPaid
    });
});


// -----------------------------------------------
// UPDATE VOUCHER
// -----------------------------------------------
export const updateVoucher = asyncHandler(async (req, res) => {
    const updatedVoucher = await ReceivedVoucher.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true, runValidators: true }
    );

    if (!updatedVoucher) {
        res.status(404);
        throw new Error("Voucher not found");
    }

    res.status(200).json({
        success: true,
        message: "Voucher updated",
        data: updatedVoucher
    });
});


// -----------------------------------------------
// DELETE VOUCHER
// -----------------------------------------------
export const deleteVoucher = asyncHandler(async (req, res) => {
    const deleted = await ReceivedVoucher.findByIdAndDelete(req.params.id);

    if (!deleted) {
        res.status(404);
        throw new Error("Voucher not found");
    }

    res.status(200).json({
        success: true,
        message: "Voucher deleted"
    });
});
