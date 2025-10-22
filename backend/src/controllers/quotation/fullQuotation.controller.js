// controllers/fullQuotation/fullQuotation.controller.js
import { fullQuotation } from "../../models/quotation/fullQuotation.model.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { v4 as uuidv4 } from "uuid";

/* =====================================================
   STEP 1 - CREATE OR RESUME QUOTATION
===================================================== */
export const createOrResumeStep1 = asyncHandler(async (req, res) => {
  let {
    clientDetails,
    accommodation,
    pickupDrop,
    quotationValidity,
    quotation,
  } = req.body;

  // Parse JSON strings sent from frontend
  clientDetails = JSON.parse(clientDetails || "{}");
  accommodation = JSON.parse(accommodation || "{}");
  pickupDrop = JSON.parse(pickupDrop || "{}");
  quotationValidity = JSON.parse(quotationValidity || "{}");
  quotation = JSON.parse(quotation || "{}");

  // If banner file uploaded
  if (req.file) {
    quotation.bannerImage = req.file.path; // or store filename/cloudinary URL
  }

  // Resume existing quotation if quotationId provided
  if (req.body.quotationId) {
    const existing = await fullQuotation.findOne({ quotationId: req.body.quotationId });
    if (existing) {
      return res
        .status(200)
        .json(new ApiResponse(200, existing, "Resumed existing quotation draft"));
    }
  }

  if (!clientDetails.clientName || !quotation.quotationTitle) {
    throw new ApiError(400, "Missing required client or quotation details");
  }

  const quotationId = `QT-${uuidv4().slice(0, 8).toUpperCase()}`;

  const newQuotation = await fullQuotation.create({
    quotationId,
    clientDetails,
    accommodation,
    pickupDrop,
    quotationValidity,
    quotation,
    currentStep: 1,
  });

  return res
    .status(201)
    .json(new ApiResponse(201, newQuotation, "Step 1: Quotation draft created"));
});


/* =====================================================
   STEP 2 - UPDATE STAY LOCATION
===================================================== */
export const updateStep2 = asyncHandler(async (req, res) => {
  const { quotationId } = req.params;
  const { stayLocation } = req.body;

  const quotation = await fullQuotation.findOne({ quotationId });
  if (!quotation) throw new ApiError(404, "Quotation not found");

  quotation.stayLocation = stayLocation;
  quotation.currentStep = Math.max(quotation.currentStep, 2);
  await quotation.save();

  return res
    .status(200)
    .json(new ApiResponse(200, quotation, "Step 2: Stay location saved"));
});

/* =====================================================
   STEP 3 - UPDATE ITINERARY
===================================================== */
export const updateStep3 = asyncHandler(async (req, res) => {
  const { quotationId } = req.params;
  const { itinerary } = req.body;

  const quotation = await fullQuotation.findOne({ quotationId });
  if (!quotation) throw new ApiError(404, "Quotation not found");

  quotation.itinerary = itinerary;
  quotation.currentStep = Math.max(quotation.currentStep, 3);
  await quotation.save();

  return res
    .status(200)
    .json(new ApiResponse(200, quotation, "Step 3: Itinerary saved"));
});

/* =====================================================
   STEP 4 - VEHICLE & POLICIES
===================================================== */
export const updateStep4 = asyncHandler(async (req, res) => {
  const { quotationId } = req.params;
  const { vehicleDetails, policies } = req.body;

  const quotation = await fullQuotation.findOne({ quotationId });
  if (!quotation) throw new ApiError(404, "Quotation not found");

  quotation.vehicleDetails = vehicleDetails;
  quotation.policies = policies;
  quotation.currentStep = Math.max(quotation.currentStep, 4);
  await quotation.save();

  return res
    .status(200)
    .json(new ApiResponse(200, quotation, "Step 4: Vehicle & policies saved"));
});

/* =====================================================
   STEP 5 - PRICING DETAILS
===================================================== */
export const updateStep5 = asyncHandler(async (req, res) => {
  const { quotationId } = req.params;
  const { pricing } = req.body;

  const quotation = await fullQuotation.findOne({ quotationId });
  if (!quotation) throw new ApiError(404, "Quotation not found");

  quotation.pricing = pricing;
  quotation.currentStep = Math.max(quotation.currentStep, 5);
  await quotation.save();

  return res
    .status(200)
    .json(new ApiResponse(200, quotation, "Step 5: Pricing saved"));
});

/* =====================================================
   FINAL STEP - SUBMIT
===================================================== */
export const finalizeQuotation = asyncHandler(async (req, res) => {
  const { quotationId } = req.params;

  const quotation = await fullQuotation.findOne({ quotationId });
  if (!quotation) throw new ApiError(404, "Quotation not found");

  quotation.isDraft = false;
  quotation.isFinalized = true;
  quotation.status = "Submitted";
  quotation.submittedAt = new Date();
  await quotation.save();

  return res
    .status(200)
    .json(new ApiResponse(200, quotation, "Quotation finalized successfully"));
});
