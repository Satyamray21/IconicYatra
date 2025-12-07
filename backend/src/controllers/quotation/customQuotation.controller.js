import { CustomQuotation } from "../../models/quotation/customQuotation.model.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { uploadOnCloudinary } from "../../utils/cloudinary.js";
import mongoose from "mongoose";


// Counter Schema and Model
const counterSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  sequence: { type: Number, default: 0 }
});

const Counter = mongoose.models.Counter || mongoose.model("Counter", counterSchema);


// Generate quotation ID
const generateQuotationId = async () => {
  try {
    const counter = await Counter.findOneAndUpdate(
      { name: "customQuotation" },
      { $inc: { sequence: 1 } },
      { upsert: true, new: true, runValidators: true }
    );

    const sequenceNumber = counter.sequence;
    return `ICYR_CQ_${sequenceNumber.toString().padStart(4, "0")}`;
  } catch (error) {
    console.error("Error generating quotation ID:", error);

    // fallback
    const last = await CustomQuotation.findOne().sort({ createdAt: -1 });
    if (!last || !last.quotationId) return "ICYR_CQ_0001";

    const lastNum = parseInt(last.quotationId.split("_")[2], 10) + 1;
    return `ICYR_CQ_${lastNum.toString().padStart(4, "0")}`;
  }
};


// Create Quotation Step 1
export const createCustomQuotation = asyncHandler(async (req, res) => {
  let retries = 0;
  const maxRetries = 3;

  while (retries < maxRetries) {
    try {
      const quotationId = await generateQuotationId();

      const quotation = await CustomQuotation.create({
        ...req.body,
        quotationId,
        status: "In Progress",   // ⭐ DEFAULT STATUS ADDED
      });

      return res
        .status(201)
        .json(new ApiResponse(201, quotation, "Quotation created successfully"));

    } catch (error) {
      if (error.code === 11000) {
        retries++;
        await new Promise(res => setTimeout(res, 150 * retries));
      } else {
        throw error;
      }
    }
  }

  throw new ApiError(500, "Failed to generate quotation ID");
});


// Get All Quotations
export const getAllCustomQuotations = asyncHandler(async (req, res) => {
  const quotations = await CustomQuotation.find().sort({ createdAt: -1 });
  return res
    .status(200)
    .json(new ApiResponse(200, quotations, "Quotations fetched successfully"));
});


// Get Quotation by ID
export const getCustomQuotationById = asyncHandler(async (req, res) => {
  const quotation = await CustomQuotation.findOne({
    quotationId: req.params.quotationId,
  });

  if (!quotation) throw new ApiError(404, "Quotation not found");

  return res
    .status(200)
    .json(new ApiResponse(200, quotation, "Quotation fetched successfully"));
});


// Update Full Quotation
export const updateCustomQuotation = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const updated = await CustomQuotation.findByIdAndUpdate(
    id,
    { $set: req.body },
    { new: true }
  );

  if (!updated) throw new ApiError(404, "Quotation not found");

  return res
    .status(200)
    .json(new ApiResponse(200, updated, "Quotation updated successfully"));
});


// ⭐ STEP-WISE UPDATE PROCESSOR
export const updateQuotationStep = asyncHandler(async (req, res) => {
  let { quotationId, stepNumber, stepData } = req.body;
  const files = req.files || {};

  if (!quotationId) throw new ApiError(400, "Quotation ID is required");
  if (!stepNumber) throw new ApiError(400, "Step number is required");

  stepNumber = Number(stepNumber);
  if (typeof stepData === "string") stepData = JSON.parse(stepData);

  const quotation = await CustomQuotation.findOne({ quotationId });
  if (!quotation) throw new ApiError(404, "Quotation not found");


  // -------------------------------
  // ⭐ STEP 3 – TOUR DETAILS + BANNER
  // -------------------------------
  if (stepNumber === 3) {
    let banner = quotation.tourDetails?.bannerImage;

    if (files.bannerImage?.[0]) {
      const upload = await uploadOnCloudinary(files.bannerImage[0].path);
      banner = upload?.url || banner;
    }

    const updateFields = {
      arrivalCity: stepData.arrivalCity,
      departureCity: stepData.departureCity,
      arrivalDate: stepData.arrivalDate,
      departureDate: stepData.departureDate,
      quotationTitle: stepData.quotationTitle,
      initalNotes: stepData.initalNotes,
      transport: stepData.transport,
      validFrom: stepData.validFrom,
      validTill: stepData.validTill,
      bannerImage: banner,
    };

    Object.entries(updateFields).forEach(([k, v]) => {
      if (v !== undefined) quotation.tourDetails[k] = v;
    });
  }


  // -------------------------------
  // ⭐ STEP 4 – ITINERARY + IMAGES
  // -------------------------------
  else if (stepNumber === 4) {
    const itinerary = [...stepData.itinerary];

    const imgFiles = Array.isArray(files.itineraryImages)
      ? files.itineraryImages
      : [];

    for (let i = 0; i < itinerary.length; i++) {
      if (imgFiles[i]) {
        const upload = await uploadOnCloudinary(imgFiles[i].path);
        itinerary[i].image = upload?.url || null;
      }
    }

    quotation.tourDetails.itinerary = itinerary;
  }


  // -------------------------------
  // ⭐ STEP 5 – VEHICLE DETAILS
  // -------------------------------
  else if (stepNumber === 5) {
    quotation.tourDetails.vehicleDetails = stepData;
  }


  // -------------------------------
  // ⭐ STEP 6 – FINAL QUOTATION MERGE
  // -------------------------------
  else if (stepNumber === 6) {
    quotation.clientDetails = { ...quotation.clientDetails, ...stepData.clientDetails };

    if (stepData.pickupDrop) quotation.pickupDrop = stepData.pickupDrop;

    if (stepData.tourDetails) {
      quotation.tourDetails = {
        ...quotation.tourDetails,
        ...stepData.tourDetails,
      };
    }
  }


  // -------------------------------
  // ⭐ STEP 7 – FINALIZE QUOTATION
  // -------------------------------
  else if (stepNumber === 7) {
    quotation.finalizedQuotation = {
      vendorType: stepData.vendorType,

      hotelVendor: stepData.hotelVendor ? {
        packageType: stepData.hotelVendor.packageType,
        vendorName: stepData.hotelVendor.vendorName,
        nights: stepData.hotelVendor.nights,
        amount: stepData.hotelVendor.amount,
        maxLimit: stepData.hotelVendor.maxLimit,
      } : {},

      vehicleVendor: stepData.vehicleVendor ? {
        vendorName: stepData.vehicleVendor.vendorName,
        amount: stepData.vehicleVendor.amount,
      } : {},

      packageSummary: {
        standard: { totalCost: stepData.packageSummary?.standard?.totalCost || 0 },
        deluxe: { totalCost: stepData.packageSummary?.deluxe?.totalCost || 0 },
        superior: { totalCost: stepData.packageSummary?.superior?.totalCost || 0 },
      }
    };

    // 🔥 Mark quotation as confirmed when finalized
    quotation.status = "Confirmed";
  }


  // Invalid Step
  else {
    throw new ApiError(400, "Invalid step number");
  }


  await quotation.save();

  return res
    .status(200)
    .json(new ApiResponse(200, quotation, `Step ${stepNumber} updated successfully`));
});



// Delete Quotation
export const deleteCustomQuotation = asyncHandler(async (req, res) => {
  const deleted = await CustomQuotation.findByIdAndDelete(req.params.id);
  if (!deleted) throw new ApiError(404, "Quotation not found");

  return res
    .status(200)
    .json(new ApiResponse(200, deleted, "Quotation deleted successfully"));
});


// Reset Counter
export const resetQuotationCounter = asyncHandler(async (req, res) => {
  await Counter.findOneAndUpdate(
    { name: "customQuotation" },
    { sequence: 0 },
    { upsert: true }
  );

  return res
    .status(200)
    .json(new ApiResponse(200, null, "Quotation counter reset"));
});


// ⭐ Update Package Calculations
export const updatePackageCalculations = asyncHandler(async (req, res) => {
  const { quotationId } = req.params;
  const { packageCalculations } = req.body;

  const quotation = await CustomQuotation.findOne({ quotationId });
  if (!quotation) throw new ApiError(404, "Quotation not found");

  quotation.tourDetails.quotationDetails.packageCalculations = {
    ...quotation.tourDetails.quotationDetails.packageCalculations,
    ...packageCalculations,
  };

  await quotation.save();

  return res
    .status(200)
    .json(new ApiResponse(200, quotation, "Package calculations updated"));
});
