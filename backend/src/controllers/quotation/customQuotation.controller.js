import { CustomQuotation } from "../../models/quotation/customQuotation.model.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { uploadOnCloudinary } from "../../utils/cloudinary.js";
import mongoose from "mongoose";

// Counter Schema and Model - defined in the same file
const counterSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  sequence: {
    type: Number,
    default: 0
  }
});

const Counter = mongoose.models.Counter || mongoose.model("Counter", counterSchema);

// Helper to generate quotationId with counter
// Helper to generate quotationId with counter - FIXED
const generateQuotationId = async () => {
  try {
    // Use atomic operation to get the next sequence number
    const counter = await Counter.findOneAndUpdate(
      { name: "customQuotation" },
      { $inc: { sequence: 1 } },
      { upsert: true, new: true, runValidators: true }
    );

    const sequenceNumber = counter.sequence;
    return `ICYR_CQ_${sequenceNumber.toString().padStart(4, "0")}`; // Changed to CQ
  } catch (error) {
    console.error("Error generating quotation ID with counter:", error);
    
    // Fallback: get the highest existing quotationId
    try {
      const lastQuotation = await CustomQuotation.findOne().sort({ createdAt: -1 });
      
      if (!lastQuotation || !lastQuotation.quotationId) {
        return "ICYR_CQ_0001"; // Changed to CQ
      }

      const lastIdNum = parseInt(lastQuotation.quotationId.split("_")[2], 10);
      const newIdNum = lastIdNum + 1;

      return `ICYR_CQ_${newIdNum.toString().padStart(4, "0")}`; // Changed to CQ
    } catch (fallbackError) {
      console.error("Fallback also failed:", fallbackError);
      // Ultimate fallback - timestamp based
      const timestamp = Date.now().toString().slice(-4);
      return `ICYR_CQ_${timestamp}`; // Changed to CQ
    }
  }
};

// Create Quotation (Step 1) with retry logic for extra safety
export const createCustomQuotation = asyncHandler(async (req, res) => {
  let retries = 0;
  const maxRetries = 3;
  
  while (retries < maxRetries) {
    try {
      const quotationId = await generateQuotationId();
      
      const quotation = await CustomQuotation.create({
        ...req.body,
        quotationId,
      });

      return res
        .status(201)
        .json(new ApiResponse(201, quotation, "Quotation created successfully"));
        
    } catch (error) {
      if (error.code === 11000 && error.keyPattern && error.keyPattern.quotationId) {
        // Duplicate key error, retry with new ID
        retries++;
        console.warn(`Duplicate quotationId detected, retry ${retries}/${maxRetries}`);
        
        if (retries === maxRetries) {
          throw new ApiError(500, "Failed to create quotation after multiple attempts. Please try again.");
        }
        // Wait before retrying (exponential backoff)
        await new Promise(resolve => setTimeout(resolve, 100 * retries));
      } else {
        // Some other error, throw it
        throw error;
      }
    }
  }
});

// Get All Quotations
export const getAllCustomQuotations = asyncHandler(async (req, res) => {
  const quotations = await CustomQuotation.find();

  return res
    .status(200)
    .json(new ApiResponse(200, quotations, "Quotations fetched successfully"));
});

// Get Single Quotation by quotationId
export const getCustomQuotationById = asyncHandler(async (req, res) => {
  const { quotationId } = req.params;

  const quotation = await CustomQuotation.findOne({ quotationId });
  if (!quotation) {
    throw new ApiError(404, "Quotation not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, quotation, "Quotation fetched successfully"));
});

// Update Full Quotation
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

// Step-wise Update
export const updateQuotationStep = asyncHandler(async (req, res) => {
  const { quotationId, stepNumber, stepData } = req.body;
  const files = req.files || []; // Now we get all files as an array

  const quotation = await CustomQuotation.findOne({ quotationId });
  if (!quotation) throw new ApiError(404, "Quotation not found");

  // Handle step 4 with image uploads
  if (stepNumber === 4) {
    let parsedStepData = typeof stepData === 'string' ? JSON.parse(stepData) : stepData;
    let processedItinerary = [...parsedStepData.itinerary];
    
    // Process uploaded files
    if (files.length > 0) {
      // Create a map of day index to uploaded files
      const fileMap = {};
      
      // You can include the day index in the filename or use order
      // For simplicity, we'll use the order of files
      files.forEach((file, index) => {
        if (index < processedItinerary.length) {
          fileMap[index] = file;
        }
      });

      // Upload files to Cloudinary and update itinerary
      for (let i = 0; i < processedItinerary.length; i++) {
        if (fileMap[i]) {
          const cloudinaryResponse = await uploadOnCloudinary(fileMap[i].path);
          if (cloudinaryResponse && cloudinaryResponse.url) {
            processedItinerary[i].image = cloudinaryResponse.url;
          }
        }
      }
    }
    
    quotation.tourDetails.itinerary = processedItinerary;
  } else {
    // Handle other steps normally (same as before)
    switch (stepNumber) {
      case 1:
        quotation.clientDetails = stepData;
        break;
      case 2:
        quotation.pickupDrop = stepData;
        break;
      case 3:
        quotation.tourDetails = { ...quotation.tourDetails, ...stepData };
        break;
      case 5:
        quotation.tourDetails.vehicleDetails = {
          basicsDetails: {
            clientName: stepData.clientName,
            vehicleType: stepData.vehicleType,
            tripType: stepData.tripType,
            noOfDays: stepData.noOfDays,
            perDayCost: stepData.perDayCost || stepData.totalCost || "0",
          },
          costDetails: {
            totalCost: stepData.totalCost || "0",
          },
          pickupDropDetails: {
            pickupDate: stepData.pickupDate || "",
            pickupTime: stepData.pickupTime || "",
            pickupLocation: stepData.pickupLocation || "",
            dropDate: stepData.dropDate || "",
            dropTime: stepData.dropTime || "",
            dropLocation: stepData.dropLocation || "",
          },
        };
        break;
      case 6:
        Object.assign(quotation, stepData);
        break;
      default:
        throw new ApiError(400, "Invalid step number");
    }
  }

  await quotation.save();

  return res
    .status(200)
    .json(new ApiResponse(200, quotation, `Step ${stepNumber} updated successfully`));
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

// Optional: Reset counter (for testing purposes)
export const resetQuotationCounter = asyncHandler(async (req, res) => {
  await Counter.findOneAndUpdate(
    { name: "customQuotation" },
    { sequence: 0 },
    { upsert: true }
  );
  
  return res
    .status(200)
    .json(new ApiResponse(200, null, "Quotation counter reset successfully"));
});