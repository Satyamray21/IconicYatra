// FullQuotation.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Box, CircularProgress, Typography } from "@mui/material";
import FullQuotationStep1 from "./FullQuotationStep1";
import FullQuotationStep2 from "./FullQuotationStep2";
import FullQuotationStep3 from "./FullQuotationStep3";
import FullQuotationStep4 from "./FullQuotationStep4";
import FullQuotationStep5 from "./FullQuotationStep5";
import FullQuotationStep6 from "./FullQuotationStep6";
import { getQuotationById } from "../../../../features/quotation/fullQuotationSlice";

const FullQuotation = () => {
  const { quotationId, stepNumber } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const { quotation, loading } = useSelector((state) => state.fullQuotation);
  const [currentStep, setCurrentStep] = useState(1);

  useEffect(() => {
    // If quotationId exists in URL, fetch the quotation data
    if (quotationId) {
      dispatch(getQuotationById({ quotationId }));
    }
  }, [quotationId, dispatch]);

  useEffect(() => {
    // Set current step based on URL or quotation data
    if (stepNumber) {
      setCurrentStep(parseInt(stepNumber));
    } else if (quotation?.currentStep) {
      setCurrentStep(quotation.currentStep);
    }
  }, [stepNumber, quotation]);

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <FullQuotationStep1 
                 quotationId={quotationId} 
                 onNextStep={() => navigate(`/fullquotation/${quotationId || quotation?.quotationId}/step/2`)}
               />;
      case 2:
        return <FullQuotationStep2 
                 quotationId={quotationId || quotation?.quotationId}
                 onNextStep={() => navigate(`/fullquotation/${quotationId || quotation?.quotationId}/step/3`)}
               />;
      case 3:
        return <FullQuotationStep3 
                 quotationId={quotationId || quotation?.quotationId}
                 stayLocations={quotation?.stayLocation || []}
                 onNextStep={() => navigate(`/fullquotation/${quotationId || quotation?.quotationId}/step/4`)}
               />;
      case 4:
        return <FullQuotationStep4 
                 onNextStep={() => navigate(`/fullquotation/${quotationId || quotation?.quotationId}/step/5`)}
               />;
      case 5:
        return <FullQuotationStep5 
                 onNextStep={() => navigate(`/fullquotation/${quotationId || quotation?.quotationId}/step/6`)}
               />;
      case 6:
        return <FullQuotationStep6 
                 quotationId={quotationId || quotation?.quotationId}
                 onFinalize={() => navigate(`/fullfinalize/${quotationId || quotation?.quotationId}`)}
               />;
      default:
        return <FullQuotationStep1 
                 quotationId={quotationId}
                 onNextStep={() => navigate(`/fullquotation/${quotationId || quotation?.quotationId}/step/2`)}
               />;
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Full Quotation {quotationId ? `- ${quotationId}` : ''}
      </Typography>
      <Typography variant="subtitle1" color="textSecondary" gutterBottom>
        Step {currentStep} of 6
      </Typography>
      
      {renderStep()}
    </Box>
  );
};

export default FullQuotation;