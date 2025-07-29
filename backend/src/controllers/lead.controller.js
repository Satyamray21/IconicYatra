import {asyncHandler} from '../utils/asyncHandler.js';
import { Lead } from '../models/lead.model.js';
import  LeadSourceOption from '../models/LeadSourceOptions.model.js';
import {ApiResponse} from '../utils/ApiResponse.js';
import {ApiError} from '../utils/ApiError.js';
import { startOfDay, startOfMonth, subMonths } from "date-fns";
// create Lead
export const createLead = asyncHandler(async (req, res) => {
  const {
  fullName,
  mobile,
  alternateNumber,
  email,
  title,
  dob,
  source,
  assignedTo,
  businessType,
  priority,
  note,
  city,
  country,
  state,
  pincode,
  address1,
  address2,
  address3,
  referralBy,
  agentName,
} = req.body;

// Restructure to match schema
const personalDetails = {
  fullName,
  mobile,
  alternateNumber,
  emailId: email,
  title,
  dateOfBirth: dob,
};

const location = {
  country,
  state,
  city,
};

const address = {
  addressLine1: address1,
  addressLine2: address2,
  addressLine3: address3,
  pincode,
};

const officialDetail = {
  businessType,
  priority,
  source,
  agentName,
  referredBy: referralBy,
  assignedTo: assignedTo,
};

  if (!personalDetails || !officialDetail) {
    throw new ApiError(400, "Missing required personal or official details");
  }

  let sourceToSave = officialDetail.source;

  if (officialDetail?.sourceType === 'addMore' && officialDetail?.newSource) {
    const existing = await LeadSourceOption.findOne({
      businessType: officialDetail.businessType,
      sourceName: officialDetail.newSource,
    });

    if (!existing) {
      await SourceOption.create({
        businessType: officialDetail.businessType,
        sourceName: officialDetail.newSource,
      });
    }

    sourceToSave = officialDetail.newSource;
  }
  const totalLeads = await Lead.countDocuments();

  const nextIdNumber = totalLeads + 1;
  const leadId = `ICYR_${nextIdNumber.toString().padStart(4, '0')}`; 

  const newLead = await Lead.create({
    personalDetails,
    location,
    address,
    officialDetail: {
      ...officialDetail,
      source: sourceToSave,
    },
    leadId,
    status: 'Active',
  });

  return res.status(201).json(
    new ApiResponse(201, newLead, "Lead created successfully")
  );
});

// view Lead
export const viewAllLeads = asyncHandler(async (req,res)=>{
    try{
        const lead = await Lead.find();
        res.status(200)
        .json(new ApiResponse(200,lead,"All leads fetched successfully"))
    }
    catch(err)
    {
        console.log("Error",err.message);
        return new ApiError(404,{},"No lead found")
        
    }
})
//update Lead
export const updateLead = asyncHandler(async (req, res) => {
  const { leadId } = req.params;
  const { personalDetails, location, address, officialDetail } = req.body;

  if (!leadId) {
    throw new ApiError(400, "leadId is required");
  }

  console.log("➡️ Updating lead with ID:", leadId);

  const existingLead = await Lead.findOne({ leadId });

  if (!existingLead) {
    throw new ApiError(404, "Lead not found");
  }

  // Source default fallback
  let sourceToSave = officialDetail?.source || existingLead.officialDetail.source;

  // Handle new source creation
  if (officialDetail?.sourceType === 'addMore' && officialDetail?.newSource) {
    console.log("🆕 Adding new source:", officialDetail.newSource);

    const existingSource = await LeadSourceOption.findOne({
      businessType: officialDetail.businessType,
      sourceName: officialDetail.newSource,
    });

    if (!existingSource) {
      await LeadSourceOption.create({
        businessType: officialDetail.businessType,
        sourceName: officialDetail.newSource,
      });

      console.log("✅ New source created in LeadSourceOption");
    }

    sourceToSave = officialDetail.newSource;
  }

  // Update sections safely
  if (personalDetails) {
    console.log("✏️ Updating personalDetails");
    Object.assign(existingLead.personalDetails, personalDetails);
  }

  if (location) {
    console.log("📍 Updating location");
    Object.assign(existingLead.location, location);
  }

  if (address) {
    console.log("🏠 Updating address");
    Object.assign(existingLead.address, address);
  }

  if (officialDetail) {
    console.log("🗂️ Updating officialDetail");

    existingLead.officialDetail = {
      ...existingLead.officialDetail,
      ...officialDetail,
      source: sourceToSave, // override with correct source
    };
  }

  try {
    await existingLead.save();
    console.log("✅ Lead updated and saved successfully");
    res.status(200).json(new ApiResponse(200, existingLead, "Lead updated successfully"));
  } catch (error) {
    console.error("❌ Error saving lead:", error);
    throw new ApiError(500, error.message || "Failed to update lead");
  }
});

//view Data wise 
export const viewAllLeadsReports = asyncHandler(async (req, res) => {
  try {
    const leads = await Lead.find();

    const now = new Date();

    // Define date ranges
    const todayStart = startOfDay(now);
    const monthStart = startOfMonth(now);
    const last3Months = subMonths(now, 3);
    const last6Months = subMonths(now, 6);
    const last12Months = subMonths(now, 12);

    // Helper to count by status in a given date range
    const getStatusCounts = async (fromDate) => {
      const result = await Lead.aggregate([
        {
          $match: {
            createdAt: { $gte: fromDate },
          },
        },
        {
          $group: {
            _id: "$status",
            count: { $sum: 1 },
          },
        },
      ]);

      const counts = {
        Active: 0,
        Confirmed: 0,
        Cancelled: 0,
      };

      result.forEach((item) => {
        counts[item._id] = item.count;
      });

      return counts;
    };

    const today = await getStatusCounts(todayStart);
    const thisMonth = await getStatusCounts(monthStart);
    const last3 = await getStatusCounts(last3Months);
    const last6 = await getStatusCounts(last6Months);
    const last12 = await getStatusCounts(last12Months);

    const stats = [
      { title: "Today's", ...today },
      { title: "This Month", ...thisMonth },
      { title: "Last 3 Months", ...last3 },
      { title: "Last 6 Months", ...last6 },
      { title: "Last 12 Months", ...last12 },
    ];

    res
      .status(200)
      .json(new ApiResponse(200, stats, "All leads fetched successfully"));
  } catch (err) {
    console.log("Error", err.message);
    throw new ApiError(404, {}, "No lead found");
  }
});


// Delete Lead
export const deleteLead = asyncHandler(async (req, res) => {
  const { leadId } = req.body;

  if (!leadId) {
    throw new ApiError(400, "leadId is required");
  }

  const deletedLead = await Lead.findOneAndDelete({ leadId });

  if (!deletedLead) {
    throw new ApiError(404, "Lead not found");
  }

  res.status(200).json(new ApiResponse(200, {}, "Lead deleted successfully"));
});

//view by LeadId 
export const viewByLeadId = asyncHandler(async (req,res)=>{
  const {leadId} = req.params;
  try{
    const lead = await Lead.findOne({leadId});
    if(!lead)
    {
      throw new ApiError(404,"Lead not found");
    }
    res.status(200)
    .json(new ApiResponse(201,lead,"Lead fetched Successfully By given Id"));
    
  }
  catch(err)
  {
    console.log("Error",err.message);
  }
})
//change in Status
export const changeLeadStatus = asyncHandler(async (req, res) => {
  const { leadId } = req.params;
  const { status } = req.body;

  const allowedStatuses = ['Active', 'Cancelled', 'Confirmed'];

  if (!leadId) {
    throw new ApiError(400, "leadId is required");
  }

  if (!status || !allowedStatuses.includes(status)) {
    throw new ApiError(400, "Valid status is required (Active, Cancelled, Confirmed)");
  }

  const lead = await Lead.findOne({ leadId });

  if (!lead) {
    throw new ApiError(404, "Lead not found");
  }

  const currentStatus = lead.status;


  if (currentStatus === 'Cancelled') {
    throw new ApiError(400, "Cancelled lead cannot be changed to another status");
  }

  if (currentStatus === 'Confirmed' && status === 'Active') {
    throw new ApiError(400, "Confirmed lead cannot be changed back to Active");
  }

  if (currentStatus === status) {
    return res.status(200).json(new ApiResponse(200, lead, `Status is already ${status}`));
  }

  lead.status = status;
  await lead.save();

  return res
    .status(200)
    .json(new ApiResponse(200, lead, `Lead status updated from ${currentStatus} to ${status}`));
});
