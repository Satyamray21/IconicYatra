import {asyncHandler} from '../utils/asyncHandler.js';
import { Lead } from '../models/lead.model.js';
import  LeadSourceOption from '../models/LeadSourceOptions.model.js';
import {ApiResponse} from '../utils/ApiResponse.js';
import {ApiError} from '../utils/ApiError.js';

// create Lead
export const createLead = asyncHandler(async (req, res) => {
  const {
    personalDetails,
    location,
    address,
    officialDetail,
  } = req.body;

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

//delete lead
export const deleteLead = asyncHandler(async (req,res)=>{
    const {leadId} = req.body;
    try{
        const lead = await Lead.findOneAndDelete({leadId});
        res.status(200)
        .json(new ApiResponse(201,{},"Lead Deleted Successfully"));
    }
    catch(err)
    {
        console.log("Error",err.message);
        new ApiError(404,"Lead not found");
    }

})
