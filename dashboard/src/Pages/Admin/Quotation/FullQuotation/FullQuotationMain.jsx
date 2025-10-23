// FullQuotationMain.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Box, CircularProgress, Typography } from "@mui/material";
import {
  getQuotationById,
} from "../../../../features/quotation/fullQuotationSlice";

import FullQuotationStep1 from "./FullQuotationStep1";
import FullQuotationStep2 from "./FullQuotationStep2";
import FullQuotationStep3 from "./FullQuotationStep3";
import FullQuotationStep4 from "./FullQuotationStep4";
import FullQuotationStep5 from "./FullQuotationStep5";
import FullQuotationStep6 from "./FullQuotationStep6";

const FullQuotation = () => {
  const { quotationId, stepNumber } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { quotation, fetchLoading } = useSelector((state) => state.fullQuotation);

  const [currentStep, setCurrentStep] = useState(1);
  const [activeQuotationId, setActiveQuotationId] = useState(quotationId);

  // Fetch quotation only once per ID
  useEffect(() => {
    if (
      quotationId &&
      quotationId !== "new" &&
      (!quotation || quotation.quotationId !== quotationId)
    ) {
      dispatch(getQuotationById({ quotationId }));
      setActiveQuotationId(quotationId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quotationId]);

  // Step control from URL
  useEffect(() => {
    setCurrentStep(stepNumber ? parseInt(stepNumber) : 1);
  }, [stepNumber]);

  const handleStep1Complete = (newQuotationId) => {
    setActiveQuotationId(newQuotationId);
    navigate(`/fullquotation/${newQuotationId}/step/2`);
  };

  const renderStep = () => {
    const props = {
      quotationId: activeQuotationId,
      onNextStep: () =>
        navigate(`/fullquotation/${activeQuotationId}/step/${currentStep + 1}`),
    };

    switch (currentStep) {
      case 1:
        return <FullQuotationStep1 {...props} onNextStep={handleStep1Complete} />;
      case 2:
        return <FullQuotationStep2 {...props} />;
      case 3:
        return <FullQuotationStep3 {...props} stayLocations={quotation?.stayLocation || []} />;
      case 4:
        return <FullQuotationStep4 {...props} />;
      case 5:
        return <FullQuotationStep5 {...props} />;
      case 6:
        return (
          <FullQuotationStep6
            {...props}
            onFinalize={() => navigate(`/fullfinalize/${activeQuotationId}`)}
          />
        );
      default:
        return <FullQuotationStep1 {...props} onNextStep={handleStep1Complete} />;
    }
  };

  if (fetchLoading && quotationId && quotationId !== "new") {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Full Quotation{" "}
        {activeQuotationId && activeQuotationId !== "new"
          ? `- ${activeQuotationId}`
          : "(New)"}
      </Typography>

      <Typography variant="subtitle1" color="textSecondary" gutterBottom>
        Step {currentStep} of 6
      </Typography>

      {renderStep()}
    </Box>
  );
};

export default FullQuotation;
