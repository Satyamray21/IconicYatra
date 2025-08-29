import { Vehicle } from "../../models/quotation/vehicle.model.js";
import {asyncHandler} from "../../utils/asyncHandler.js";
import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";

const generateVehicleQuotationId = async () => {
  const lastVehicle = await Vehicle.findOne({})
    .sort({ createdAt: -1 })
    .select("vehicleQuotationId");

  let nextNumber = "0001";

  if (lastVehicle?.vehicleQuotationId) {
    const lastNumber = parseInt(lastVehicle.vehicleQuotationId.split("_").pop());
    nextNumber = String(lastNumber + 1).padStart(4, "0");
  }

  return `ICYR_QT_V_${nextNumber}`;
};


export const createVehicle = asyncHandler(async (req, res) => {
  console.log("Req",req.body);
  const {
  basicsDetails: {
    clientName,
    vehicleType,
    tripType,
    noOfDays,
    perDayCost
  },
  costDetails: {
    totalCost,
    discount,
    gstOn,
    applyGst
  },
  pickupDropDetails: {
    pickupDate,
    pickupTime,
    pickupLocation,
    dropDate,
    dropTime,
    dropLocation
  },
  signatureDetails: {
    contactDetails
  }
} = req.body;

  // Required field validation
  if (
    !clientName ||
    !vehicleType ||
    !tripType ||
    !noOfDays ||
    !perDayCost ||
    !totalCost ||
    !pickupDate ||
    !pickupTime ||
    !pickupLocation ||
    !dropDate ||
    !dropTime ||
    !dropLocation ||
    !gstOn ||
    !applyGst
  ) {
    throw new ApiError(400, "Please provide all required fields!");
  }


  const vehicleQuotationId = await generateVehicleQuotationId();

 
  const newVehicle = await Vehicle.create({
    basicsDetails: {
      clientName,
      vehicleType,
      tripType,
      noOfDays,
      perDayCost,
    },
    costDetails: {
      totalCost,
    },
    pickupDropDetails: {
      pickupDate,
      pickupTime,
      pickupLocation,
      dropDate,
      dropTime,
      dropLocation,
    },
    discount,
    tax: {
      gstOn,
      applyGst,
    },
    signatureDetails: {
      contactDetails,
    },
    vehicleQuotationId,
  });

  if (!newVehicle) {
    throw new ApiError(500, "Failed to create vehicle quotation");
  }

  return res
    .status(201)
    .json(new ApiResponse(201, newVehicle, "Vehicle quotation created successfully"));
});


export const getAllVehicles = asyncHandler(async (req, res) => {
  const vehicles = await Vehicle.find().sort({ createdAt: -1 });

  return res
    .status(200)
    .json(new ApiResponse(200, vehicles, "Vehicle quotations fetched successfully"));
});


export const getVehicleById = asyncHandler(async (req, res) => {
  const { vehicleQuotationId} = req.params;

  const vehicle = await Vehicle.findOne({vehicleQuotationId});

  if (!vehicle) {
    throw new ApiError(404, "Vehicle quotation not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, vehicle, "Vehicle quotation fetched successfully"));
});
export const updateVehicle = asyncHandler(async (req, res) => {
  const { vehicleQuotationId } = req.params;

  const {
    clientName,
    vehicleType,
    tripType,
    noOfDays,
    perDayCost,
    totalCost,
    pickupDate,
    pickupTime,
    pickupLocation,
    dropDate,
    dropTime,
    dropLocation,
    discount,
    gstOn,
    applyGst,
    contactDetails,
  } = req.body;

  const updatedVehicle = await Vehicle.findByOneAndUpdate(
    {vehicleQuotationId},
    {
      basicsDetails: {
        clientName,
        vehicleType,
        tripType,
        noOfDays,
        perDayCost,
      },
      costDetails: {
        totalCost,
      },
      pickupDropDetails: {
        pickupDate,
        pickupTime,
        pickupLocation,
        dropDate,
        dropTime,
        dropLocation,
      },
      discount,
      tax: {
        gstOn,
        applyGst,
      },
      signatureDetails: {
        contactDetails,
      },
    },
    {
      new: true,
      runValidators: true,
    }
  );

  if (!updatedVehicle) {
    throw new ApiError(404, "Vehicle quotation not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, updatedVehicle, "Vehicle quotation updated successfully"));
});


export const deleteVehicle = asyncHandler(async (req, res) => {
  const {vehicleQuotationId } = req.params;

  const deletedVehicle = await Vehicle.findOneAndDelete({vehicleQuotationId});

  if (!deletedVehicle) {
    throw new ApiError(404, "Vehicle quotation not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Vehicle quotation deleted successfully"));
});
