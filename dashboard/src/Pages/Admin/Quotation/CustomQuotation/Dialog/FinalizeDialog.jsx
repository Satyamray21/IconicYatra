import React, { useState } from "react";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Box,
  Grid,
  Typography,
  Button,
  Divider,
  Radio,
} from "@mui/material";
import { Formik, Form } from "formik";
import { useSelector, useDispatch } from "react-redux";
import { updateQuotationStep } from "../../../../../features/quotation/customQuotationSlice";

import HotelVendorDialog from "./HotelVendor"; // receives finalizedPackage + returns step7 payload via onConfirm

const FinalizeDialog = ({ open, onClose, onConfirm }) => {
  const [selectedOption, setSelectedOption] = useState("");
  const [hotelVendorOpen, setHotelVendorOpen] = useState(false);

  const dispatch = useDispatch();
  const { selectedQuotation } = useSelector((state) => state.customQuotation);

  const quotationId = selectedQuotation?.quotationId;

  const standardCost =
    selectedQuotation?.tourDetails?.quotationDetails?.packageCalculations?.standard?.finalTotal ?? "N/A";

  const deluxeCost =
    selectedQuotation?.tourDetails?.quotationDetails?.packageCalculations?.deluxe?.finalTotal ?? "N/A";

  const standardHotel =
    selectedQuotation?.tourDetails?.quotationDetails?.destinations?.[0]?.standardHotels?.[0] ?? "N/A";

  const deluxeHotel =
    selectedQuotation?.tourDetails?.quotationDetails?.destinations?.[0]?.deluxeHotels?.[0] ?? "N/A";

  const quotationOptions = [
    { label: "Standard", hotel: standardHotel, cost: `₹ ${standardCost}` },
    { label: "Deluxe", hotel: deluxeHotel, cost: `₹ ${deluxeCost}` },
  ];

  // open hotel vendor wizard
  const handleMainConfirm = () => {
    if (!selectedOption) return;
    setHotelVendorOpen(true);
  };

  // receives final combined step7 data from HotelVendorDialog
  const handleHotelFinalize = async (step7Data) => {
    // Assemble packageSummary from current quotation (ensure numbers)
    const pkgCalcs = selectedQuotation?.tourDetails?.quotationDetails?.packageCalculations || {};
    const step7Payload = {
      ...step7Data,
      packageSummary: {
        standard: { totalCost: pkgCalcs.standard?.finalTotal ?? 0 },
        deluxe: { totalCost: pkgCalcs.deluxe?.finalTotal ?? 0 },
        superior: { totalCost: pkgCalcs.superior?.finalTotal ?? 0 },
      },
    };

    try {
      await dispatch(
        updateQuotationStep({
          quotationId,
          stepNumber: 7,
          stepData: step7Payload,
        })
      ).unwrap();

      if (onConfirm) onConfirm(step7Payload);
      setHotelVendorOpen(false);
      onClose();
    } catch (err) {
      console.error("Finalization update failed:", err);
    }
  };

  // Optional: prevent opening finalize if already Confirmed
  const isAlreadyConfirmed = selectedQuotation?.status === "Confirmed";

  return (
    <>
      <Dialog open={open } onClose={onClose} maxWidth="md" fullWidth>
        <DialogTitle sx={{ fontWeight: 600, color: "#1976d2" }}>
          Finalize Quotation
        </DialogTitle>

        <Formik initialValues={{ quotation: "" }}>
          {({ setFieldValue }) => (
            <Form>
              <DialogContent>
                <Typography
                  variant="subtitle1"
                  sx={{ fontWeight: 600, mb: 2 }}
                  color="text.primary"
                >
                  <span style={{ color: "red" }}>*</span> Quotation
                </Typography>

                <Grid container spacing={2}>
                  {quotationOptions.map((option) => {
                    const isSelected = selectedOption === option.label;

                    return (
                      <Grid item xs={12} md={4} key={option.label}>
                        <Box
                          onClick={() => {
                            setSelectedOption(option.label);
                            setFieldValue("quotation", option.label);
                          }}
                          sx={{
                            border: isSelected ? "2px solid #ff9800" : "1px solid #ccc",
                            borderRadius: 1,
                            p: 2,
                            cursor: "pointer",
                            textAlign: "center",
                            transition: "0.2s",
                            "&:hover": { borderColor: "#1976d2" },
                          }}
                        >
                          <Radio
                            checked={isSelected}
                            value={option.label}
                            name="quotation"
                            sx={{
                              color: "#ff9800",
                              "&.Mui-checked": { color: "#ff9800" },
                            }}
                          />
                          <Typography variant="subtitle1" sx={{ color: "#ff9800", fontWeight: 600 }}>
                            {option.label}
                          </Typography>

                          <Divider sx={{ my: 1, borderColor: "#ff9800" }} />

                          <Typography variant="body2" sx={{ mb: 1, color: "#1976d2" }}>
                            » {option.hotel}
                          </Typography>

                          <Typography variant="body2" color="text.secondary">
                            Total Cost: <span style={{ fontWeight: 600 }}>{option.cost}</span>
                          </Typography>
                        </Box>
                      </Grid>
                    );
                  })}
                </Grid>
              </DialogContent>

              <DialogActions sx={{ justifyContent: "center", pb: 2 }}>
                <Button
                  variant="contained"
                  color="primary"
                  type="button"
                  disabled={!selectedOption}
                  onClick={handleMainConfirm}
                  sx={{
                    textTransform: "none",
                    backgroundColor: selectedOption ? "#64b5f6" : "#bbdefb",
                    "&:hover": { backgroundColor: "#2196f3" },
                  }}
                >
                  Confirm
                </Button>

                <Button
                  variant="contained"
                  onClick={onClose}
                  sx={{
                    backgroundColor: "#f57c00",
                    textTransform: "none",
                    "&:hover": { backgroundColor: "#ef6c00" },
                  }}
                >
                  Cancel
                </Button>
              </DialogActions>
            </Form>
          )}
        </Formik>
      </Dialog>

      {/* hotel dialog gets selectedOption and returns final data via onConfirm */}
      <HotelVendorDialog
        open={hotelVendorOpen}
        onClose={() => setHotelVendorOpen(false)}
        finalizedPackage={selectedOption}
        onConfirm={handleHotelFinalize}
      />
    </>
  );
};

export default FinalizeDialog;
