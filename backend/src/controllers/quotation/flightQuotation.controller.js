import { FlightQuotation } from "../../models/quotation/flightQuotation.model.js";
import {asyncHandler} from "../../utils/asyncHandler.js";
import {ApiError} from "../../utils/ApiError.js";
import {ApiResponse} from "../../utils/ApiResponse.js";
import {Lead} from "../../models/lead.model.js"
const generateFlightQuotationId = async () => {
  const lastQuotation = await FlightQuotation.findOne({})
    .sort({ createdAt: -1 })
    .select("flightQuotationId");

  let nextNumber = "0001";

  if (lastQuotation?.flightQuotationId) {
    const lastNumber = parseInt(lastQuotation.flightQuotationId.split("_").pop());
    nextNumber = String(lastNumber + 1).padStart(4, "0");
  }

  return `ICYR_QT_F_${nextNumber}`;
};
export const createFlightQuotation = asyncHandler(async (req, res) => {
    console.log("Req",req.body);
    const {
        tripType,
        clientDetails,
        flightDetails,
        adults,
        childs,
        infants,
        anyMessage,
        personalDetails,
        status // optional from client
    } = req.body;

    // Validate required fields
    if (
        !tripType ||
        !clientDetails?.clientName ||
        !personalDetails?.fullName ||
        !personalDetails?.mobileNumber ||
        !personalDetails?.emailId
    ) {
        throw new ApiError(400, "Required fields are missing");
    }

    // Validate flightDetails count based on tripType
    if (tripType === "oneway" && flightDetails.length !== 1) {
        throw new ApiError(400, "Oneway trip must have exactly 1 flight detail");
    }
    if (tripType === "roundtrip" && flightDetails.length !== 2) {
        throw new ApiError(400, "Roundtrip must have exactly 2 flight details");
    }
    if (tripType === "multicity" && flightDetails.length < 2) {
        throw new ApiError(400, "Multicity trip must have at least 2 flight details");
    }

    // Generate dynamic title
    const title = `Flight Quotation for ${clientDetails.clientName}`;
    const lead = await Lead.findOne({ "personalDetails.fullName": clientDetails.clientName });

    if (!lead) {
        throw new ApiError(404, `Lead not found for client ${clientDetails.clientName}`);
    }
    // Generate unique Flight Quotation ID
    const flightQuotationId = await generateFlightQuotationId();

    // Create quotation
    const quotation = await FlightQuotation.create({
        flightQuotationId,
        tripType,
        clientDetails,
        title,
        flightDetails,
        adults,
        childs,
        infants,
        anyMessage,
        personalDetails,
        status: status || "New" ,
        quotation_type: "flight" ,
        leadId: lead.leadId
    });

    return res
        .status(201)
        .json(new ApiResponse(201, quotation, "Flight quotation created successfully"));
});



export const getAllFlightQuotations = asyncHandler(async (req, res) => {
    const quotations = await FlightQuotation.find().sort({ createdAt: -1 });

    return res
        .status(200)
        .json(new ApiResponse(200, quotations, "Flight quotations fetched successfully"));
});


export const getFlightQuotationById = asyncHandler(async (req, res) => {
    const { flightQuotationId } = req.params;

    const quotation = await FlightQuotation.findOne({ flightQuotationId});
    if (!quotation) throw new ApiError(404, "Flight quotation not found");

    return res
        .status(200)
        .json(new ApiResponse(200, quotation, "Flight quotation fetched successfully"));
});


export const updateFlightQuotationById = asyncHandler(async (req, res) => {
  const { flightQuotationId } = req.params;
  const updateData = req.body;

  const quotation = await FlightQuotation.findOneAndUpdate(
    { flightQuotationId },
    { $set: updateData },
    { new: true, runValidators: true }
  );

  if (!quotation) throw new ApiError(404, "Flight quotation not found");

  return res
    .status(200)
    .json(new ApiResponse(200, quotation, "Flight quotation updated successfully"));
});

export const deleteFlightQuotationById = asyncHandler(async (req, res) => {
  const { flightQuotationId } = req.params;

  const quotation = await FlightQuotation.findOneAndDelete({ flightQuotationId });

  if (!quotation) throw new ApiError(404, "Flight quotation not found");

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Flight quotation deleted successfully"));
});


// ✅ Confirm Flight Quotation API
export const confirmFlightQuotation = asyncHandler(async (req, res) => {
  const { flightQuotationId } = req.params;
  const { pnrList, finalFare } = req.body;

  // Find quotation
  const quotation = await FlightQuotation.findOne({flightQuotationId});

  if (!quotation) {
    throw new ApiError(404, "Flight quotation not found");
  }

  // Block confirmation if already confirmed
  if (quotation.status === "Confirmed") {
    throw new ApiError(400, "Quotation is already confirmed");
  }

  // Block confirmation if cancelled
  if (quotation.status === "Cancelled") {
    throw new ApiError(400, "Cannot confirm a cancelled quotation");
  }

  // ✅ Auto-set "New" quotations to "Completed"
  if (quotation.status === "New") {
    quotation.status = "Completed";
  }

  // Update PNR list if provided
  if (pnrList && Array.isArray(pnrList)) {
    quotation.pnrList = pnrList;
  }

  // Update final fare
  if (finalFare) {
    quotation.finalFare = finalFare;
  }

  // ✅ Set status to Confirmed
  quotation.status = "Confirmed";

  await quotation.save();

  return res
    .status(200)
    .json(new ApiResponse(200, quotation, "Flight quotation confirmed successfully"));
});
