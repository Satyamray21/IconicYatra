import React, { useState, useEffect } from "react";
import { Box, Button, Typography, Paper } from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import {
  createCustomQuotation,
  updateQuotationStep,
} from "../../../../features/quotation/customQuotationSlice";
import { getAllLeads } from "../../../../features/leads/leadSlice";

// Step components
import CustomQuotation from "./CustomQuotation";
import CustomQuotationStep2 from "./customquotationStep2";
import CustomQuotationStep3 from "./customquotationStep3";
import CustomQuotationStep4 from "./customquotationStep4";
import CustomQuotationStep5 from "./customquotationStep5";
import CustomQuotationStep6 from "./customquotationStep6";

const CustomQuotationMain = () => {
  const dispatch = useDispatch();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [selectedLead, setSelectedLead] = useState(null);

  const { list: leadList = [] } = useSelector((state) => state.leads);

  const [quotationId, setQuotationId] = useState(null);

  useEffect(() => {
    dispatch(getAllLeads());
  }, [dispatch]);

  const [formData, setFormData] = useState({
    clientDetails: {},
    pickupDrop: [],
    tourDetails: {},
    quotationDetails: {},
    itinerary: [],
    vehicleDetails: {},
  });

  const findMatchingLead = (clientName, sector) => {
    if (!clientName || !sector) return null;
    return (
      leadList.find((lead) => {
        const nameMatch =
          lead.personalDetails?.fullName?.trim().toLowerCase() ===
          clientName?.trim().toLowerCase();
        const sectorMatch =
          lead.tourDetails?.tourDestination?.trim().toLowerCase() ===
            sector?.trim().toLowerCase() ||
          lead.location?.state?.trim().toLowerCase() === sector?.trim().toLowerCase();
        return nameMatch && sectorMatch;
      }) || null
    );
  };

  const saveStep = async (stepNumber, stepData) => {
    try {
      if (!quotationId) return;
      await dispatch(updateQuotationStep({ quotationId, stepNumber, stepData })).unwrap();
    } catch (err) {
      console.error("Step save failed:", err);
      toast.error(err?.message || "Step save failed");
    }
  };

  // Step 1: Client Details
  const handleStep1 = async (data) => {
    if (!data.clientName || !data.sector) {
      toast.error("Client Name and Sector are required.");
      return;
    }

    setLoading(true);

    const sanitizedClientDetails = {
      clientName: data.clientName.trim(),
      tourType: data.tourType,
      sector: data.sector.trim(),
    };

    setFormData((prev) => ({ ...prev, clientDetails: sanitizedClientDetails }));

    const initialQuotationData = {
      clientDetails: sanitizedClientDetails,
      tourDetails: {
        arrivalCity: "TBD",
        departureCity: "TBD",
        quotationTitle: `Quotation for ${sanitizedClientDetails.clientName}`,
        arrivalDate: new Date().toISOString(),
        departureDate: new Date().toISOString(),
        initalNotes: "",
        bannerImage: "",
        transport: "Yes",
        itinerary: [],
        policies: {},
        quotationDetails: {
          adults: 1,
          children: 0,
          kids: 0,
          infants: 0,
          mealPlan: "N/A",
          destinations: [],
          rooms: {
            numberOfRooms: 1,
            roomType: "Standard",
            sharingType: "Single",
            showCostPerAdult: false,
          },
          companyMargin: { marginPercent: 0, marginAmount: 0 },
          discount: 0,
          taxes: { gstOn: "None", applyGST: false },
          signatureDetails: { regardsText: "Best Regards", signedBy: "" },
        },
        vehicleDetails: {
          pickupDropDetails: {
            pickupLocation: "TBD",
            pickupDate: new Date().toISOString(),
            pickupTime: "12:00",
            dropLocation: "TBD",
            dropDate: new Date().toISOString(),
            dropTime: "12:00",
          },
          basicsDetails: {
            vehicleType: "Sedan",
            tripType: "One Way", // matches enum
            noOfDays: 1,
            perDayCost: 0,
            clientName: sanitizedClientDetails.clientName,
          },
          costDetails: { totalCost: 0 },
        },
      },
    };

    try {
      const created = await dispatch(createCustomQuotation(initialQuotationData)).unwrap();
      setQuotationId(created.quotationId);
      setStep(2);
    } catch (err) {
      console.error(err);
      toast.error(err?.message || "Failed to create quotation");
    } finally {
      setLoading(false);
    }
  };

  // Step 2-6 handlers remain unchanged
  const handleStep2 = async (data) => { setFormData(prev => ({ ...prev, pickupDrop: data })); await saveStep(2, data); setStep(3); };
  const handleStep3 = async (data) => { setFormData(prev => ({ ...prev, tourDetails: { ...prev.tourDetails, ...data } })); await saveStep(3, data); setStep(4); };
  const handleStep4 = async (data) => { setFormData(prev => ({ ...prev, quotationDetails: data })); await saveStep(4, data); setStep(5); };
  const handleStep5 = async (data) => { setFormData(prev => ({ ...prev, vehicleDetails: data })); await saveStep(5, data); setStep(6); };
  const handleFinalSubmit = async (finalData) => { setFormData(prev => ({ ...prev, ...finalData })); await saveStep(6, finalData); toast.success("Custom Quotation saved successfully!"); };

  const renderStepIndicator = () => (
    <Typography variant="subtitle1" align="center" sx={{ mb: 2, fontWeight: "bold" }}>
      Step {step} of 6
    </Typography>
  );

  return (
    <Box sx={{ p: 3 }}>
      <Paper sx={{ p: 3, maxWidth: 1200, mx: "auto" }}>
        {renderStepIndicator()}

        {step === 1 && <CustomQuotation onNext={handleStep1} />}
        {step === 2 && <CustomQuotationStep2 sector={formData.clientDetails.sector} clientName={formData.clientDetails.clientName} onNext={handleStep2} />}
        {step === 3 && <CustomQuotationStep3 clientName={formData.clientDetails.clientName} sector={formData.clientDetails.sector} cities={formData.pickupDrop} onNext={handleStep3} />}
        {step === 4 && <CustomQuotationStep4 clientName={formData.clientDetails.clientName} sector={formData.clientDetails.sector} cities={formData.pickupDrop} tourDetails={formData.tourDetails} onNext={handleStep4} />}
        {step === 5 && <CustomQuotationStep5 clientName={formData.clientDetails.clientName} sector={formData.clientDetails.sector} arrivalCity={formData.tourDetails?.arrivalCity || ""} departureCity={formData.tourDetails?.departureCity || ""} arrivalDate={formData.tourDetails?.arrivalDate || null} departureDate={formData.tourDetails?.departureDate || null} transport={formData.tourDetails?.transport || "Yes"} cities={formData.pickupDrop} onNext={handleStep5} />}
        {step === 6 && <CustomQuotationStep6 formData={formData} leadData={selectedLead} onSubmit={handleFinalSubmit} loading={loading} />}

        {step > 1 && step <= 6 && (
          <Box textAlign="center" mt={3}>
            <Button variant="outlined" onClick={() => setStep(prev => prev - 1)} disabled={loading}>Back</Button>
          </Box>
        )}
      </Paper>
    </Box>
  );
};

export default CustomQuotationMain;
