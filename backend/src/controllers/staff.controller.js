import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Staff } from "../models/staff.model.js"; 
import { Country } from "../models/country.model.js";
import {State} from "../models/state.model.js";
import {City} from "../models/city.model.js"
import {Counter} from "../models/Counter.js"
import mongoose from "mongoose";

// CREATE Staff
export const createStaff = asyncHandler(async (req, res) => {
  const { personalDetails, staffLocation, address, firm, bank } = req.body;

  if (!personalDetails?.mobileNumber || !personalDetails?.firstName) {
    throw new ApiError(400, "Required fields missing in personalDetails");
  }

  const existing = await Staff.findOne({
    "personalDetails.mobileNumber": personalDetails.mobileNumber
  });

  if (existing) {
    throw new ApiError(409, "Staff with this mobile number already exists");
  }
  const staffCount = await Staff.countDocuments();
const staffId = `ICYR_ST${String(staffCount + 1).padStart(4, "0")}`;


  const staff = await Staff.create({
    staffId,
    personalDetails,
    staffLocation,
    address,
    firm,
    bank
  });

  return res
    .status(201)
    .json(new ApiResponse(201, staff, "Staff created successfully"));
});

// GET all staff
export const getAllStaff = asyncHandler(async (req, res) => {
  const staffList = await Staff.find()
    .populate("staffLocation.country")
    .populate("staffLocation.state")
    .populate("staffLocation.city");

  return res
    .status(200)
    .json(new ApiResponse(200, staffList, "All staff fetched successfully"));
});

// GET single staff
export const getStaffById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, "Invalid staff ID");
  }

  const staff = await Staff.findById(id)
    .populate("staffLocation.country")
    .populate("staffLocation.state")
    .populate("staffLocation.city");

  if (!staff) {
    throw new ApiError(404, "Staff not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, staff, "Staff fetched successfully"));
});

// UPDATE staff
export const updateStaff = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updateData = req.body;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, "Invalid staff ID");
  }

  const updated = await Staff.findByIdAndUpdate(id, updateData, {
    new: true,
    runValidators: true
  });

  if (!updated) {
    throw new ApiError(404, "Staff not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, updated, "Staff updated successfully"));
});

// DELETE staff
export const deleteStaff = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, "Invalid staff ID");
  }

  const deleted = await Staff.findByIdAndDelete(id);

  if (!deleted) {
    throw new ApiError(404, "Staff not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, deleted, "Staff deleted successfully"));
});
