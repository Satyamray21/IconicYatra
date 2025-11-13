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

  const [formData, setFormData] = useState({
    clientDetails: {},
    pickupDrop: [],
    tourDetails: {},
    quotationDetails: {},
    itinerary: [],
    vehicleDetails: {},
  });

  useEffect(() => {
    dispatch(getAllLeads());
    const savedQuotationId = localStorage.getItem("currentQuotationId");
    if (savedQuotationId) {
      setQuotationId(savedQuotationId);
      console.log("📋 Restored quotationId from localStorage:", savedQuotationId);
    }
  }, [dispatch]);

  // 🔍 Find matching lead
  const findMatchingLead = (clientName, sector) => {
    if (!clientName || !sector) return null;

    return (
      leadList.find((lead) => {
        const nameMatch =
          lead.personalDetails?.fullName?.trim().toLowerCase() ===
          clientName?.trim().toLowerCase();

        const tourDestinations = lead.tourDetails?.tourDestination;
        const sectorLower = sector?.trim().toLowerCase();

        const sectorMatch =
          (Array.isArray(tourDestinations)
            ? tourDestinations.some(
                (dest) => dest?.trim().toLowerCase() === sectorLower
              )
            : tourDestinations?.trim?.().toLowerCase() === sectorLower) ||
          lead.location?.state?.trim().toLowerCase() === sectorLower;

        return nameMatch && sectorMatch;
      }) || null
    );
  };

  // 💾 Save each step to backend
  const saveStep = async (stepNumber, stepData) => {
    try {
      let currentQuotationId = quotationId;

      if (!currentQuotationId) {
        currentQuotationId = localStorage.getItem("currentQuotationId");
        if (currentQuotationId) {
          setQuotationId(currentQuotationId);
          console.log("🔄 Retrieved quotationId from localStorage:", currentQuotationId);
        }
      }

      if (!currentQuotationId) {
        console.error("❌ No quotationId found");
        toast.error("Quotation ID not found. Please start from step 1.");
        return;
      }

      console.log("💾 Saving step:", stepNumber, "with quotationId:", currentQuotationId);

      await dispatch(
        updateQuotationStep({
          quotationId: currentQuotationId,
          stepNumber,
          stepData,
        })
      ).unwrap();

      console.log("✅ Step", stepNumber, "saved successfully");
    } catch (err) {
      console.error("❌ Step save failed:", err);
      toast.error(err?.message || "Step save failed");
    }
  };

  // 🧩 Step 1
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

    const matchedLead = findMatchingLead(data.clientName, data.sector);
    setSelectedLead(matchedLead);

    const members = matchedLead?.tourDetails?.members || {};
    const accommodation = matchedLead?.tourDetails?.accommodation || {};
    const pickupDropLead = matchedLead?.tourDetails?.pickupDrop || {};

    const noOfNights = accommodation?.noOfNights || 0;
    const noOfDays = noOfNights > 0 ? noOfNights + 1 : 1;

    setFormData((prev) => ({ ...prev, clientDetails: sanitizedClientDetails }));

    const initialQuotationData = {
      clientDetails: sanitizedClientDetails,
      pickupDrop: [{ cityName: "TBC", nights: 0 }],
      tourDetails: {
        arrivalCity: pickupDropLead?.arrivalCity || "TBD",
        departureCity: pickupDropLead?.departureCity || "TBD",
        arrivalDate: pickupDropLead?.arrivalDate || new Date().toISOString(),
        departureDate: pickupDropLead?.departureDate || new Date().toISOString(),
        quotationTitle: `Quotation for ${sanitizedClientDetails.clientName}`,
        initalNotes: "",
        bannerImage: "",
        transport: accommodation?.transport ? "Yes" : "No",
        itinerary: [],
        policies: {},
        quotationDetails: {
          adults: members?.adults || 1,
          children: members?.children || 0,
          kids: members?.kidsWithoutMattress || 0,
          infants: members?.infants || 0,
          mealPlan: accommodation?.mealPlan || "N/A",
          destinations: [],
          rooms: {
            numberOfRooms: accommodation?.noOfRooms || 1,
            roomType: accommodation?.hotelType?.[0] || "Standard",
            sharingType: accommodation?.sharingType || "Double",
            showCostPerAdult: false,
          },
          companyMargin: { marginPercent: 0, marginAmount: 0 },
          discount: 0,
          taxes: { gstOn: "None", applyGST: false },
          signatureDetails: { regardsText: "Best Regards", signedBy: "" },
        },
        vehicleDetails: {
          basicsDetails: {
            clientName: sanitizedClientDetails.clientName,
            vehicleType: "Sedan",
            tripType: "One Way",
            noOfDays,
            perDayCost: 0,
          },
          costDetails: { totalCost: 0 },
          pickupDropDetails: {
            pickupDate: pickupDropLead?.arrivalDate || new Date().toISOString(),
            pickupTime: "12:00",
            pickupLocation: pickupDropLead?.arrivalLocation || "TBD",
            dropDate: pickupDropLead?.departureDate || new Date().toISOString(),
            dropTime: "12:00",
            dropLocation: pickupDropLead?.departureLocation || "TBD",
          },
        },
      },
    };

    try {
      console.log("🚀 Creating new quotation...");
      const created = await dispatch(createCustomQuotation(initialQuotationData)).unwrap();
      console.log("✅ Quotation created:", created.quotationId);
      setQuotationId(created.quotationId);
      localStorage.setItem("currentQuotationId", created.quotationId);
      setStep(2);
    } catch (err) {
      console.error("❌ Quotation creation failed:", err);
      toast.error(err?.message || "Failed to create quotation");
    } finally {
      setLoading(false);
    }
  };

  // 🧩 Step 2
  const handleStep2 = async (data) => {
    console.log("📝 Step 2 data:", data);
    setFormData((prev) => ({
      ...prev,
      pickupDrop: data,
      // preserve arrival/departure info if step 2 gives any
      tourDetails: {
        ...prev.tourDetails,
        arrivalCity: data?.[0]?.arrivalCity || prev.tourDetails?.arrivalCity,
        departureCity: data?.[0]?.departureCity || prev.tourDetails?.departureCity,
        arrivalDate: data?.[0]?.arrivalDate || prev.tourDetails?.arrivalDate,
        departureDate: data?.[0]?.departureDate || prev.tourDetails?.departureDate,
      },
    }));
    await saveStep(2, data);
    setStep(3);
  };

  // 🧩 Step 3 — Fixed merge (preserves tour info)
  const handleStep3 = async (data) => {
    console.log("📝 Step 3 data:", data);
    setFormData((prev) => ({
      ...prev,
      tourDetails: {
        ...prev.tourDetails,
        ...data,
        arrivalCity: prev.tourDetails?.arrivalCity || data.arrivalCity || "TBD",
        departureCity: prev.tourDetails?.departureCity || data.departureCity || "TBD",
        arrivalDate:
          prev.tourDetails?.arrivalDate || data.arrivalDate || new Date().toISOString(),
        departureDate:
          prev.tourDetails?.departureDate || data.departureDate || new Date().toISOString(),
      },
    }));
    await saveStep(3, data);
    setStep(4);
  };

  // 🧩 Step 4
  const handleStep4 = async (data) => {
    console.log("📝 Step 4 data:", data);
    setFormData((prev) => ({ ...prev, quotationDetails: data }));
    await saveStep(4, data);
    setStep(5);
  };

  // 🧩 Step 5
  const handleStep5 = async (data) => {
    console.log("📝 Step 5 data:", data);
    setFormData((prev) => ({ ...prev, vehicleDetails: data }));
    await saveStep(5, data);
    setStep(6);
  };

  // 🧩 Step 6 (final)
  const handleFinalSubmit = async (finalData) => {
    console.log("📝 Final step data:", finalData);
    setFormData((prev) => ({ ...prev, ...finalData }));
    await saveStep(6, finalData);
    localStorage.removeItem("currentQuotationId");
    toast.success("Custom Quotation saved successfully!");
  };

  const renderStepIndicator = () => (
    <Typography
      variant="subtitle1"
      align="center"
      sx={{ mb: 2, fontWeight: "bold" }}
    >
      Step {step} of 6 {quotationId && `- Quotation ID: ${quotationId}`}
    </Typography>
  );

  return (
    <Box sx={{ p: 3 }}>
      <Paper sx={{ p: 3, maxWidth: 1200, mx: "auto" }}>
        {renderStepIndicator()}

        {step === 1 && <CustomQuotation onNext={handleStep1} />}
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
            leadData={selectedLead}
            onSubmit={handleFinalSubmit}
            loading={loading}
          />
        )}

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
