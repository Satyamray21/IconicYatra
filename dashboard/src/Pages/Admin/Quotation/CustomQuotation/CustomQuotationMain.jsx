import React, { useState, useEffect } from "react";
import { Box, Button, Typography, Paper } from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { createCustomQuotation } from "../../../../features/quotation/customQuotationSlice";
import { getAllLeads } from "../../../../features/leads/leadSlice"; // Import your lead action

// Import your step components
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
  const [selectedLead, setSelectedLead] = useState(null); // Add this state

  // Get leads from Redux store
  const { list: leadList = [] } = useSelector((state) => state.leads);

  // Fetch leads on component mount
  useEffect(() => {
    dispatch(getAllLeads());
  }, [dispatch]);

  console.log("🔍 Current step:", step);

  // unified formData across all steps
  const [formData, setFormData] = useState({
    clientDetails: {},
    pickupDrop: [],
    tourDetails: {},
    quotationDetails: {},
    itinerary: [],
    vehicleDetails: {}
  });

  // Helper function to find matching lead
  const findMatchingLead = (clientName, sector) => {
    if (!clientName || !sector) return null;
    
    const lead = leadList.find((lead) => {
      const nameMatch = lead.personalDetails?.fullName?.trim().toLowerCase() === clientName?.trim().toLowerCase();
      
      const sectorMatch = 
        lead.tourDetails?.tourDestination?.trim().toLowerCase() === sector?.trim().toLowerCase() ||
        lead.location?.state?.trim().toLowerCase() === sector?.trim().toLowerCase();
      
      return nameMatch && sectorMatch;
    });

    console.log("🔍 Found matching lead:", lead);
    return lead || null;
  };

  // Step 1: Client Details
  const handleStep1 = (data) => {
    console.log("📦 Received data from Step 1:", data);
    setFormData((prev) => ({ ...prev, clientDetails: data }));
    
    // Find and set the selected lead
    const matchingLead = findMatchingLead(data.clientName, data.sector);
    setSelectedLead(matchingLead);
    
    console.log("🧭 Moving to Step 2...");
    setStep(2);
  };

  // Step 2: Pickup/Drop Cities
  const handleStep2 = (data) => {
    setFormData((prev) => ({ 
      ...prev, 
      pickupDrop: data 
    }));
    setStep(3);
  };

  // Step 3: Tour Details
  const handleStep3 = (data) => {
    setFormData((prev) => ({ 
      ...prev, 
      tourDetails: { ...prev.tourDetails, ...data } 
    }));
    setStep(4);
  };

  // Step 4: Itinerary/Quotation Details
  const handleStep4 = (data) => {
    setFormData((prev) => ({ 
      ...prev, 
      quotationDetails: data 
    }));
    setStep(5);
  };

  // Step 5: Vehicle Details
  const handleStep5 = (data) => {
    setFormData((prev) => ({ 
      ...prev, 
      vehicleDetails: data 
    }));
    setStep(6);
  };

  // final submit in Step 6
  const handleFinalSubmit = async (finalData) => {
    try {
      setLoading(true);
      console.log("🔹 Final data to submit:", finalData);

      // Merge all data
      const completeData = {
        ...formData,
        ...finalData
      };

      await dispatch(createCustomQuotation(completeData)).unwrap();
      toast.success("Custom Quotation created successfully!");
      setLoading(false);
    } catch (err) {
      console.error("❌ Error creating quotation:", err);
      toast.error(err?.message || "Failed to create quotation");
      setLoading(false);
    }
  };

  // simple step tracker UI
  const renderStepIndicator = () => (
    <Typography variant="subtitle1" align="center" sx={{ mb: 2, fontWeight: "bold" }}>
      Step {step} of 6
    </Typography>
  );

  return (
    <Box sx={{ p: 3 }}>
      <Paper sx={{ p: 3, maxWidth: 1200, mx: "auto" }}>
        {renderStepIndicator()}

        {step === 1 && (
          <CustomQuotation onNext={handleStep1} />
        )}

        {step === 2 && (
          <CustomQuotationStep2
            sector={formData.clientDetails.sector}
            clientName={formData.clientDetails.clientName}
            onNext={handleStep2}
          />
        )}

        {step === 3 && (
          <CustomQuotationStep3
            clientName={formData.clientDetails.clientName}
            sector={formData.clientDetails.sector}
            cities={formData.pickupDrop}
            onNext={handleStep3}
          />
        )}

        {step === 4 && (
          <CustomQuotationStep4
            clientName={formData.clientDetails.clientName}
            sector={formData.clientDetails.sector}
            cities={formData.pickupDrop}
            tourDetails={formData.tourDetails}
            onNext={handleStep4}
          />
        )}

        {step === 5 && (
          <CustomQuotationStep5
            clientName={formData.clientDetails.clientName}
            sector={formData.clientDetails.sector}
            arrivalCity={formData.tourDetails?.arrivalCity || ""}
            departureCity={formData.tourDetails?.departureCity || ""}
            arrivalDate={formData.tourDetails?.arrivalDate || null}
            departureDate={formData.tourDetails?.departureDate || null}
            transport={formData.tourDetails?.transport || "Yes"}
            cities={formData.pickupDrop}
            onNext={handleStep5}
          />
        )}

        {step === 6 && (
          <CustomQuotationStep6
            formData={formData}
            leadData={selectedLead} // Now this is defined
            onSubmit={handleFinalSubmit}
            loading={loading}
          />
        )}

        {/* Optional Back Button */}
        {step > 1 && step <= 6 && (
          <Box textAlign="center" mt={3}>
            <Button
              variant="outlined"
              onClick={() => setStep((prev) => prev - 1)}
              disabled={loading}
            >
              Back
            </Button>
          </Box>
        )}
      </Paper>
    </Box>
  );
};

export default CustomQuotationMain;