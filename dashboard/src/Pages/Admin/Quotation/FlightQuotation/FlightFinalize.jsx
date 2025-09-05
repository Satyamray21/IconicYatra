import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Typography,
  Grid,
  Paper,
  Chip,
  Divider,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Snackbar,
  Alert,
  TextField,
  CircularProgress,
} from "@mui/material";
import {
  Flight,
  Person,
  LocationOn,
  Download,
  CheckCircle,
  Flag,
} from "@mui/icons-material";
import { useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  getFlightQuotationById,
  confirmFlightQuotation,
} from "../../../../features/quotation/flightQuotationSlice";

const FlightFinalize = () => {
  const [openDialog, setOpenDialog] = useState(false);
const [pnrList, setPnrList] = useState([]);

  const [finalFare, setFinalFare] = useState("");
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const { id } = useParams();
  const dispatch = useDispatch();

  const { quotationDetails, loading, error } = useSelector(
    (state) => state.flightQuotation
  );
  const quotation = quotationDetails || null;

  const flightData = quotation?.flightDetails || [];

  // Fetch quotation when ID changes
  useEffect(() => {
    if (id) {
      dispatch(getFlightQuotationById(id));
    }
  }, [id, dispatch]);
  useEffect(() => {
  if (quotation?.flightDetails?.length) {
    setPnrList(Array(quotation.flightDetails.length).fill(""));
  }
}, [quotation]);


  if (!quotation || !quotation.flightDetails || quotation.flightDetails?.length === 0) {
    return (
      <Box sx={{ textAlign: "center", mt: 5 }}>
        <Alert severity="warning">No flight quotation found!</Alert>
      </Box>
    );
  }

  // Handle confirm
 const handleConfirmFinalize = async () => {
  if (pnrList.some((pnr) => !pnr) || !finalFare) {
    alert("Please enter PNR for all flights and the final fare before confirming!");
    return;
  }

  try {
    await dispatch(
      confirmFlightQuotation({
        flightQuotationId: quotation.flightQuotationId, // ✅ Keep using custom ID
        pnrList,  // ✅ Send array of PNRs
        finalFare,
      })
    ).unwrap();

    setOpenDialog(false);
    setOpenSnackbar(true);
    setPnrList(Array(flightData.length).fill(""));
    setFinalFare("");
  } catch (err) {
    console.error("Error confirming quotation:", err);
  }
};



  const handleDownloadPDF = () => {
    const pdfContent = `
      FLIGHT QUOTATION
      =================
      Reference No: ${quotation.refNo}
      Date: ${quotation.date}
      Customer: ${quotation.customer}
      Country: ${quotation.country}
      Status: ${quotation.status}
      PNR: ${pnr}
      Final Fare: ₹ ${finalFare}
      Generated on: ${new Date().toLocaleDateString()}
    `;
    const blob = new Blob([pdfContent], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Flight_Quotation_${quotation.refNo}.pdf`;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 100);
  };

  return (
    <>
      <Grid container>
        {/* Sidebar */}
        <Grid
          size={{ xs: 12, md: 3 }}
          sx={{
            borderRight: { md: "1px solid #ddd" },
            p: 3,
            minHeight: "100vh",
            bgcolor: "#f8f9fa",
            textAlign: "center",
          }}
        >
          <Chip
            icon={<Flight />}
            label="Flight Quotation"
            color="primary"
            variant="outlined"
            sx={{ mb: 3 }}
          />
          <Box
            sx={{
              width: 80,
              height: 80,
              borderRadius: "50%",
              bgcolor: "#1976d2",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              m: "16px auto",
              color: "white",
              fontSize: 32,
              boxShadow: 2,
            }}
          >
            <Person sx={{ fontSize: 60 }} />
          </Box>
          <Typography variant="h6" fontWeight="bold">
            {quotation?.clientDetails?.clientName ||
              quotation?.personalDetails?.fullName}
          </Typography>
          <Box display="flex" justifyContent="center" alignItems="center">
            <Flag sx={{ fontSize: 16, mr: 0.5, color: "text.secondary" }} />
            <Typography variant="body2">{quotation.country}</Typography>
          </Box>
          <Paper variant="outlined" sx={{ p: 2, mt: 4 }}>
            <Typography variant="subtitle2">Booking Summary</Typography>
            <Divider sx={{ my: 1 }} />
            {[
              ["Reference No:", `#${quotation.refNo}`],
              ["Date:", quotation.date],
            ].map(([k, v]) => (
              <Box key={k} display="flex" justifyContent="space-between" mb={1}>
                <Typography variant="body2">{k}</Typography>
                <Typography variant="body2" fontWeight="bold">
                  {v}
                </Typography>
              </Box>
            ))}
            <Box display="flex" justifyContent="space-between">
              <Typography variant="body2">Status:</Typography>
              <Chip
                label={quotation.status}
                color={quotation.status === "Confirmed" ? "success" : "default"}
                size="small"
              />
            </Box>
          </Paper>
        </Grid>

        {/* Content */}
        <Grid size={{ xs: 12, md: 9 }} sx={{ p: 3 }}>
          <Box display="flex" gap={2} mb={3}>
            <Button
              variant="contained"
              startIcon={<CheckCircle />}
              onClick={() => setOpenDialog(true)}
              disabled={quotation.status === "Confirmed"}
            >
              {quotation.status === "Confirmed"
                ? "Booking Confirmed"
                : "Finalize Booking"}
            </Button>
            <Button
              variant="outlined"
              startIcon={<Download />}
              onClick={handleDownloadPDF}
            >
              Download PDF
            </Button>
          </Box>

          {/* Flight Details */}
          <Paper variant="outlined" sx={{ p: 3, borderRadius: 2 }}>
            <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
              <Box display="flex" alignItems="center">
                <Flight sx={{ color: "orange", mr: 1 }} />
                <Typography variant="h6" color="orange">
                  <b>
                    Flight Booking Details{" "}
                    {quotation?.tripType === "oneway"
                      ? "(One Way Trip)"
                      : quotation?.tripType === "roundtrip"
                      ? "(Round Trip)"
                      : quotation?.tripType === "multicity"
                      ? "(Multi City Trip)"
                      : ""}
                  </b>
                </Typography>
              </Box>
              <Chip
                label={`Total Fare: ₹ ${flightData.reduce(
                  (total, flight) => total + (parseFloat(flight.fare) || 0),
                  0
                )}`}
                color="success"
                variant="outlined"
                sx={{ fontWeight: "bold", fontSize: "14px" }}
              />
            </Box>

            {/* Flight Details Section */}
            <Grid container spacing={2}>
              {flightData.map((flight, index) => (
                <Paper
                  key={index}
                  elevation={3}
                  sx={{
                    p: 2,
                    mb: 2,
                    borderRadius: 2,
                    bgcolor: index % 2 === 0 ? "#f9f9f9" : "#eef7ff",
                    border: "1px solid #ddd",
                    boxShadow: "0px 2px 6px rgba(0,0,0,0.1)",
                  }}
                >
                  <Box
                    display="flex"
                    alignItems="center"
                    justifyContent="space-between"
                    mb={1}
                    sx={{ borderBottom: "1px solid #ccc", pb: 1 }}
                  >
                    <Typography variant="h6" fontWeight="bold" color="primary">
                      ✈️ Flight {index + 1}
                    </Typography>
                    <Chip
                      label={`₹ ${flight.fare}`}
                      color="success"
                      variant="outlined"
                      sx={{ fontWeight: "bold" }}
                    />
                  </Box>
                  <Grid container spacing={2}>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <Typography fontWeight="bold">From:</Typography>
                      <Typography>{flight.from}</Typography>
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <Typography fontWeight="bold">To:</Typography>
                      <Typography>{flight.to}</Typography>
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <Typography fontWeight="bold">Airline:</Typography>
                      <Typography>{flight.preferredAirline}</Typography>
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <Typography fontWeight="bold">Flight Number:</Typography>
                      <Typography>{flight.flightNo}</Typography>
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <Typography fontWeight="bold">Fare:</Typography>
                      <Typography color="green" fontWeight="bold">
                        ₹ {flight.fare}
                      </Typography>
                    </Grid>
                  </Grid>
                </Paper>
              ))}
            </Grid>
          </Paper>
        </Grid>
      </Grid>

      {/* Confirmation Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: "bold", textAlign: "center" }}>
          Finalize Flight Booking
        </DialogTitle>
        <DialogContent>
  <Grid container spacing={2}>
    {flightData.map((flight, index) => (
      <Grid key={index} size={{ xs: 12 }}>
        <TextField
          label={`PNR for Flight ${index + 1}`}
          fullWidth
          value={pnrList[index] || ""}
          onChange={(e) => {
            const updatedPnrs = [...pnrList];
            updatedPnrs[index] = e.target.value;
            setPnrList(updatedPnrs);
          }}
          variant="outlined"
          size="small"
        />
      </Grid>
    ))}

    <Grid size={{ xs: 12 }}>
      <TextField
        label="Final Total Fare (₹)"
        type="number"
        fullWidth
        value={finalFare}
        onChange={(e) => setFinalFare(e.target.value)}
        variant="outlined"
        size="small"
      />
    </Grid>
  </Grid>
</DialogContent>

        <DialogActions sx={{ justifyContent: "center", pb: 2 }}>
          <Button onClick={() => setOpenDialog(false)} color="inherit">
            Cancel
          </Button>
          <Button
            onClick={handleConfirmFinalize}
            variant="contained"
            color="primary"
            startIcon={loading ? <CircularProgress size={18} /> : <CheckCircle />}
            disabled={loading}
          >
            {loading ? "Confirming..." : "Confirm Booking"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Success Snackbar */}
      <Snackbar
        open={openSnackbar}
        autoHideDuration={4000}
        onClose={() => setOpenSnackbar(false)}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={() => setOpenSnackbar(false)}
          severity="success"
          sx={{ width: "100%" }}
        >
          Flight booking has been successfully confirmed!
        </Alert>
      </Snackbar>
    </>
  );
};

export default FlightFinalize;
