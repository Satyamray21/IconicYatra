import ReceivedVoucher from "../models/payment.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import Company from "../models/company.model.js";

/* ==========================================================
   @desc    Create a new voucher
   @route   POST /api/vouchers
   @access  Private
   ========================================================== */
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
    totalCost,
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
    totalCost,
    invoice,
    receiptNumber: nextReceiptNumber,
    invoiceId,
    companyId,
  });

  // Recalculate totalPaidTillDate for this party
  const totalPaid = await ReceivedVoucher.aggregate([
    { $match: { partyName, companyId: voucher.companyId } },
    { $group: { _id: null, total: { $sum: "$amount" } } },
  ]);

  const totalPaidTillDate = totalPaid.length > 0 ? totalPaid[0].total : 0;

  await ReceivedVoucher.updateMany(
    { partyName, companyId: voucher.companyId },
    { $set: { totalPaidTillDate } }
  );

  res.status(201).json({
    success: true,
    message: "Voucher created successfully",
    data: { ...voucher.toObject(), totalPaidTillDate },
  });
});

/* ==========================================================
   @desc    Get all vouchers (optionally filtered by company)
   @route   GET /api/vouchers
   @access  Private
   ========================================================== */
export const getAllVouchers = asyncHandler(async (req, res) => {
  const { companyId } = req.query;
  const filter = companyId ? { companyId } : {};

  const vouchers = await ReceivedVoucher.find(filter)
    .sort({ createdAt: -1 })
    .populate("companyId", "companyName logo");

  res.status(200).json({
    success: true,
    count: vouchers.length,
    data: vouchers,
  });
});

/* ==========================================================
   @desc    Get voucher by ID
   @route   GET /api/vouchers/:id
   @access  Private
   ========================================================== */
export const getVoucherById = asyncHandler(async (req, res) => {
  const voucher = await ReceivedVoucher.findById(req.params.id).populate(
    "companyId",
    "companyName address phone email gstin stateCode logo authorizedSignatory termsConditions paymentLink"
  );

  if (!voucher) {
    res.status(404);
    throw new Error("Voucher not found");
  }

  res.status(200).json({
    success: true,
    data: voucher,
  });
});

/* ==========================================================
   @desc    Update voucher
   @route   PUT /api/vouchers/:id
   @access  Private
   ========================================================== */
export const updateVoucher = asyncHandler(async (req, res) => {
  const oldVoucher = await ReceivedVoucher.findById(req.params.id);
  if (!oldVoucher) {
    res.status(404);
    throw new Error("Voucher not found");
  }

  const updatedVoucher = await ReceivedVoucher.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  );

  if (req.body.amount || req.body.partyName) {
    const totalPaid = await ReceivedVoucher.aggregate([
      { $match: { partyName: updatedVoucher.partyName, companyId: updatedVoucher.companyId } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);

    const totalPaidTillDate = totalPaid.length > 0 ? totalPaid[0].total : 0;

    await ReceivedVoucher.updateMany(
      { partyName: updatedVoucher.partyName, companyId: updatedVoucher.companyId },
      { $set: { totalPaidTillDate } }
    );
  }

  res.status(200).json({
    success: true,
    message: "Voucher updated successfully",
    data: updatedVoucher,
  });
});

/* ==========================================================
   @desc    Delete voucher
   @route   DELETE /api/vouchers/:id
   @access  Private
   ========================================================== */
export const deleteVoucher = asyncHandler(async (req, res) => {
  const deleted = await ReceivedVoucher.findByIdAndDelete(req.params.id);
  if (!deleted) {
    res.status(404);
    throw new Error("Voucher not found");
  }

  const totalPaid = await ReceivedVoucher.aggregate([
    { $match: { partyName: deleted.partyName, companyId: deleted.companyId } },
    { $group: { _id: null, total: { $sum: "$amount" } } },
  ]);

  const totalPaidTillDate = totalPaid.length > 0 ? totalPaid[0].total : 0;

  await ReceivedVoucher.updateMany(
    { partyName: deleted.partyName, companyId: deleted.companyId },
    { $set: { totalPaidTillDate } }
  );

  res.status(200).json({
    success: true,
    message: "Voucher deleted successfully",
  });
});
