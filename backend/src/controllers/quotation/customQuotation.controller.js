import { CustomQuotation } from "../../models/quotation/customQuotation.model.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";

// Helper to generate quotationId
const generateQuotationId = async () => {
  const lastQuotation = await CustomQuotation.findOne().sort({ createdAt: -1 });

  if (!lastQuotation || !lastQuotation.quotationId) {
    return "ICYR_C_0001";
  }

  const lastIdNum = parseInt(lastQuotation.quotationId.split("_")[2], 10);
  const newIdNum = lastIdNum + 1;

  return `ICYR_C_${newIdNum.toString().padStart(4, "0")}`;
};

// Create Quotation
export const createCustomQuotation = asyncHandler(async (req, res) => {
  const quotationId = await generateQuotationId();

  const quotation = await CustomQuotation.create({
    ...req.body,
    quotationId,
  });

  return res
    .status(201)
    .json(new ApiResponse(201, quotation, "Quotation created successfully"));
});

// Get All Quotations
export const getAllCustomQuotations = asyncHandler(async (req, res) => {
  const quotations = await CustomQuotation.find();

  return res
    .status(200)
    .json(new ApiResponse(200, quotations, "Quotations fetched successfully"));
});

// Get Single Quotation by ID
export const getCustomQuotationById = asyncHandler(async (req, res) => {
  const { quotationId } = req.params;

  const quotation = await CustomQuotation.findOne({quotationId});
  if (!quotation) {
    throw new ApiError(404, "Quotation not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, quotation, "Quotation fetched successfully"));
});

// Update Quotation
export const updateCustomQuotation = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const updatedQuotation = await CustomQuotation.findByIdAndUpdate(
    id,
    { $set: req.body },
    { new: true, runValidators: true }
  );

  if (!updatedQuotation) {
    throw new ApiError(404, "Quotation not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, updatedQuotation, "Quotation updated successfully"));
});

// Delete Quotation
export const deleteCustomQuotation = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const deletedQuotation = await CustomQuotation.findByIdAndDelete(id);
  if (!deletedQuotation) {
    throw new ApiError(404, "Quotation not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, deletedQuotation, "Quotation deleted successfully"));
});
