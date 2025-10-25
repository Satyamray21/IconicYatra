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
// In your customQuotation.controller.js - Update the updateQuotationStep function
export const updateQuotationStep = asyncHandler(async (req, res) => {
  console.log("🔄 ========== UPDATE STEP REQUEST START ==========");
  
  let quotationId, stepNumber, stepData;
  const files = req.files || [];

  // Debug the incoming request
  console.log("📦 Request body keys:", Object.keys(req.body));
  console.log("📦 Files received:", files.length);

  // Handle FormData request (for step 4)
  if (req.body.quotationId && req.body.stepNumber && req.body.stepData) {
    quotationId = req.body.quotationId;
    stepNumber = parseInt(req.body.stepNumber, 10);
    stepData = typeof req.body.stepData === 'string' ? JSON.parse(req.body.stepData) : req.body.stepData;
    
    console.log("📦 FormData Parsed:");
    console.log("  quotationId:", quotationId);
    console.log("  stepNumber:", stepNumber, "(type:", typeof stepNumber, ")");
    console.log("  stepData:", stepData);
  } else {
    // Handle regular JSON request
    ({ quotationId, stepNumber, stepData } = req.body);
    console.log("📦 JSON Request:", { quotationId, stepNumber, stepData });
  }

  // Validate input
  if (!quotationId) {
    console.error("❌ MISSING quotationId");
    throw new ApiError(400, "Quotation ID is required");
  }

  if (!stepNumber || isNaN(stepNumber)) {
    console.error("❌ INVALID stepNumber:", stepNumber);
    throw new ApiError(400, "Valid step number is required");
  }

  console.log("🔍 Searching for quotation with ID:", quotationId);
  
  const quotation = await CustomQuotation.findOne({ quotationId });
  
  if (!quotation) {
    console.error("❌ QUOTATION NOT FOUND:", quotationId);
    throw new ApiError(404, `Quotation not found: ${quotationId}`);
  }

  console.log("✅ Quotation FOUND:", quotation.quotationId);
  console.log("📝 Updating step:", stepNumber);

  try {
    // Handle step 4 with image uploads
    if (stepNumber === 4) {
      console.log("🎯 Processing Step 4 - Itinerary with images");
      
      let processedItinerary = [...stepData.itinerary];
      console.log("📋 Itinerary days to process:", processedItinerary.length);
      
      // Process uploaded files
      if (files.length > 0) {
        console.log("📸 Processing", files.length, "uploaded files");
        
        // Create a map of files by index
        const fileMap = {};
        files.forEach((file, index) => {
          console.log(`   File ${index}:`, file.originalname);
          if (index < processedItinerary.length) {
            fileMap[index] = file;
          }
        });

        // Upload files to Cloudinary and update itinerary
        for (let i = 0; i < processedItinerary.length; i++) {
          if (fileMap[i]) {
            console.log(`☁️ Uploading image for day ${i + 1}`);
            try {
              const cloudinaryResponse = await uploadOnCloudinary(fileMap[i].path);
              if (cloudinaryResponse && cloudinaryResponse.url) {
                processedItinerary[i].image = cloudinaryResponse.url;
                console.log("✅ Image uploaded to:", cloudinaryResponse.url);
              } else {
                console.log("❌ Cloudinary upload failed for day", i + 1);
                processedItinerary[i].image = null;
              }
            } catch (uploadError) {
              console.error("💥 Cloudinary upload error:", uploadError);
              processedItinerary[i].image = null;
            }
          } else {
            console.log(`📭 No image file for day ${i + 1}`);
            // Keep existing image if no new file uploaded
            if (!processedItinerary[i].image) {
              processedItinerary[i].image = null;
            }
          }
        }
      } else {
        console.log("📭 No files uploaded, keeping existing images");
      }
      
      // Update the quotation
      quotation.tourDetails.itinerary = processedItinerary;
      console.log("✅ Itinerary updated with", processedItinerary.length, "days");
      
    } else {
      // Handle other steps (1, 2, 3, 5, 6) - your existing code
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
  console.log("🧩 Processing Step 6 - Final quotation details");

  // Merge client details
  if (stepData.clientDetails) {
    quotation.clientDetails = {
      ...quotation.clientDetails,
      ...stepData.clientDetails,
    };
  }

  // Merge pickupDrop
  if (stepData.pickupDrop && Array.isArray(stepData.pickupDrop)) {
    quotation.pickupDrop = stepData.pickupDrop;
  }

  // Merge tour details and quotation details
  if (stepData.tourDetails) {
    quotation.tourDetails = {
      ...quotation.tourDetails,
      ...stepData.tourDetails,
    };

    // If tourDetails.quotationDetails is included, merge it separately
    if (stepData.tourDetails.quotationDetails) {
      quotation.tourDetails.quotationDetails = {
        ...quotation.tourDetails.quotationDetails,
        ...stepData.tourDetails.quotationDetails,
      };
    }
  }

  // Merge vehicle details (optional, if included in stepData)
  if (stepData.vehicleDetails) {
    quotation.tourDetails.vehicleDetails = {
      ...quotation.tourDetails.vehicleDetails,
      ...stepData.vehicleDetails,
    };
  }

  break;

        default:
          console.error("❌ INVALID STEP NUMBER:", stepNumber);
          throw new ApiError(400, `Invalid step number: ${stepNumber}`);
      }
    }

    await quotation.save();
    console.log("✅ Step", stepNumber, "updated successfully!");
    console.log("========== UPDATE STEP REQUEST END ==========");

    return res
      .status(200)
      .json(new ApiResponse(200, quotation, `Step ${stepNumber} updated successfully`));
      
  } catch (saveError) {
    console.error("💥 ERROR during quotation update:", saveError);
    throw saveError;
  }
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