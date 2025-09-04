import React, { useState,useEffect } from "react";
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
  DialogContentText,
  DialogTitle,
  Snackbar,
  Alert,
} from "@mui/material";
import {
  Flight,
  Person,
  LocationOn,
  Event,
  Schedule,
  ConfirmationNumber,
  Group,
  AttachMoney,
  Download,
  CheckCircle,
  Flag,
  FlightClass,
  AirplaneTicket,
} from "@mui/icons-material";
import { useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { getFlightQuotationById } from "../../../../features/quotation/flightQuotationSlice";
const FlightFinalize = () => {
  const [openDialog, setOpenDialog] = useState(false);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [bookingStatus, setBookingStatus] = useState("Pending");
  const { id } = useParams();
  const dispatch = useDispatch();
  const { quotationDetails, loading, error } = useSelector((state) => state.flightQuotation);
  const quotation = quotationDetails || null;

   const flightData = quotation?.flightDetails || [];



  // Fetch quotation when ID changes
  useEffect(() => {
    if (id) {
      dispatch(getFlightQuotationById(id));
    }
  }, [id, dispatch]);
  if (!quotation || !quotation.flightDetails || quotation.flightDetails?.length === 0) {
 
  return (
    <Box sx={{ textAlign: "center", mt: 5 }}>
      <Alert severity="warning">No flight quotation found!</Alert>
    </Box>
  );
}

  const handleConfirmFinalize = () => {
    setBookingStatus("Confirmed");
    setOpenDialog(false);
    setOpenSnackbar(true);
  };

  const handleDownloadPDF = () => {
    const pdfContent = `
      FLIGHT QUOTATION
      =================
      Reference No: ${quotation.refNo}
      Date: ${quotation.date}
      Customer: ${quotation.customer}
      Country: ${quotation.country}
      From: ${quotation.flight.from} To: ${quotation.flight.to}
      Airline: ${quotation.flight.airline}
      Date: ${quotation.flight.date} Time: ${quotation.flight.time}
      Flight No: ${quotation.flight.flightNo} PNR: ${quotation.flight.pnr}
      Passengers: ${quotation.flight.passengers}
      Class: ${quotation.flight.class} Baggage: ${quotation.flight.baggage}
      Price: ${quotation.flight.price}
      Status: ${bookingStatus}
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
        <Grid size={{xs:12, md:3}}
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
            {quotation?.clientDetails?.clientName || quotation?.personalDetails?.fullName}
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
                label={bookingStatus}
                color={bookingStatus === "Confirmed" ? "success" : "default"}
                size="small"
              />
            </Box>
          </Paper>
        </Grid>

        {/* Content */}
        <Grid size={{xs:12, md:9}} sx={{ p: 3 }}>
          <Box display="flex" gap={2} mb={3}>
            <Button
              variant="contained"
              startIcon={<CheckCircle />}
              onClick={() => setOpenDialog(true)}
              disabled={bookingStatus === "Confirmed"}
            >
              {bookingStatus === "Confirmed"
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

          <Paper variant="outlined" sx={{ p: 2, mb: 3, bgcolor: "#f8f9fa" }}>
            <Typography variant="subtitle2" gutterBottom>
              <Person sx={{ fontSize: 16, mr: 1 }} />
              Kind Attention
            </Typography>
            <Typography variant="h6">{quotation?.clientDetails?.clientName || quotation?.personalDetails?.fullName}</Typography>
            <Box display="flex" alignItems="center">
              <LocationOn
                sx={{ fontSize: 16, mr: 0.5, color: "text.secondary" }}
              />
              <Typography variant="body2">{quotation.country}</Typography>
            </Box>
          </Paper>

          <Paper variant="outlined" sx={{ p: 3, borderRadius: 2 }}>
  {/* Header Section */}
  <Box
    display="flex"
    alignItems="center"
    justifyContent="space-between"
    mb={2}
  >
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

    {/* Total Fare Chip */}
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
        {/* Flight Header */}
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

        {/* Flight Info */}
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
          <Grid size={{ xs: 12, md: 6 }}>
            <Typography fontWeight="bold">Departure:</Typography>
            <Typography>
              {new Date(flight.departureDate).toLocaleDateString()} —{" "}
              {new Date(flight.departureTime).toLocaleTimeString()}
            </Typography>
          </Grid>
        </Grid>
      </Paper>
    ))}
  </Grid>
</Paper>

          <Box mt={3} textAlign="center">
            <Typography variant="body2" color="textSecondary">
              For any changes or queries, please contact our support team
            </Typography>
          </Box>
        </Grid>
      </Grid>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>Confirm Flight Booking Finalization</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to finalize this flight booking? This action
            cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>No, Cancel</Button>
          <Button onClick={handleConfirmFinalize} variant="contained" autoFocus>
            Yes, Finalize
          </Button>
        </DialogActions>
      </Dialog>

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