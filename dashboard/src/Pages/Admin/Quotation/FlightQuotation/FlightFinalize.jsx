import React, { useState } from "react";
import {
  Box,
  Button,
  Typography,
  Grid,
  Paper,
  IconButton,
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
  Luggage,
} from "@mui/icons-material";

const FlightFinalize = () => {
  const [openDialog, setOpenDialog] = useState(false);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [bookingStatus, setBookingStatus] = useState("Pending");

  const quotation = {
    refNo: 33,
    date: "25/08/2025",
    customer: "Mr Anuj Kumar",
    country: "India",
    flight: {
      from: "Bhuj (BHJ)",
      to: "Bhubaneswar (BJB)",
      airline: "Air Arabia",
      date: "30 August 2025",
      time: "4:48 PM",
      flightNo: "G9 415",
      pnr: "K5TQF7R",
      passengers: "Adults (2), Children (1)",
      price: "₹ 25,000",
      baggage: "20kg",
      class: "Economy",
    },
  };

  const handleOpenDialog = () => {
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleConfirmFinalize = () => {
    setBookingStatus("Confirmed");
    setOpenDialog(false);
    setOpenSnackbar(true);
  };

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
  };

  const handleDownloadPDF = () => {
    // Create a PDF content (this is a simplified example)
    const pdfContent = `
      FLIGHT QUOTATION
      =================
      
      Reference No: ${quotation.refNo}
      Date: ${quotation.date}
      
      Customer Details:
      ----------------
      Name: ${quotation.customer}
      Country: ${quotation.country}
      
      Flight Details:
      ---------------
      From: ${quotation.flight.from}
      To: ${quotation.flight.to}
      Airline: ${quotation.flight.airline}
      Date: ${quotation.flight.date}
      Time: ${quotation.flight.time}
      Flight No: ${quotation.flight.flightNo}
      PNR: ${quotation.flight.pnr}
      Passengers: ${quotation.flight.passengers}
      Class: ${quotation.flight.class}
      Baggage: ${quotation.flight.baggage}
      
      Price: ${quotation.flight.price}
      
      Status: ${bookingStatus}
      
      Generated on: ${new Date().toLocaleDateString()}
    `;

    // Create a Blob with the PDF content
    const blob = new Blob([pdfContent], { type: 'application/pdf' });
    
    // Create a URL for the Blob
    const url = URL.createObjectURL(blob);
    
    // Create a temporary anchor element to trigger the download
    const a = document.createElement('a');
    a.href = url;
    a.download = `Flight_Quotation_${quotation.refNo}.pdf`;
    document.body.appendChild(a);
    a.click();
    
    // Clean up
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 100);
  };

  return (
    <>
      <Grid container>
        {/* Left sidebar */}
        <Grid size={{xs:12, md:3}}
          sx={{
            borderRight: { md: "1px solid #ddd" },
            p: 3,
            minHeight: "100vh",
            backgroundColor: "#f8f9fa",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <Box sx={{ width: "100%", mb: 3, textAlign:'center' }}>
            <Chip
              icon={<Flight />}
              label="Flight Quotation"
              color="primary"
              variant="outlined"
            />
          </Box>

          <Box textAlign="center" mt={2}>
            <Box
              sx={{
                width: 80,
                height: 80,
                borderRadius: "50%",
                backgroundColor: "#1976d2",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                margin: "16px auto",
                color: "white",
                fontSize: 32,
                fontWeight: "bold",
                boxShadow: 2,
              }}
            >
              <Person sx={{ fontSize: 60 }} />
            </Box>
            
            <Typography variant="h6" gutterBottom sx={{ fontWeight: "bold" }}>
              {quotation.customer}
            </Typography>
            
            <Box display="flex" alignItems="center" justifyContent="center">
              <Flag sx={{ fontSize: 16, mr: 0.5, color: "text.secondary" }} />
              <Typography variant="body2" color="textSecondary">
                {quotation.country}
              </Typography>
            </Box>
          </Box>

          <Box sx={{ mt: 4, width: "100%" }}>
            <Paper variant="outlined" sx={{ p: 2, backgroundColor: "white" }}>
              <Typography variant="subtitle2" gutterBottom>
                Booking Summary
              </Typography>
              <Divider sx={{ my: 1 }} />
              <Box display="flex" justifyContent="space-between" mb={1}>
                <Typography variant="body2">Reference No:</Typography>
                <Typography variant="body2" fontWeight="bold">
                  #{quotation.refNo}
                </Typography>
              </Box>
              <Box display="flex" justifyContent="space-between" mb={1}>
                <Typography variant="body2">Date:</Typography>
                <Typography variant="body2" fontWeight="bold">
                  {quotation.date}
                </Typography>
              </Box>
              <Box display="flex" justifyContent="space-between">
                <Typography variant="body2">Status:</Typography>
                <Chip 
                  label={bookingStatus} 
                  color={bookingStatus === "Confirmed" ? "success" : "default"} 
                  size="small"
                />
              </Box>
            </Paper>
          </Box>
        </Grid>

        {/* Right content */}
        <Grid size={{xs:12, md:9}} sx={{ p: 3 }}>
          {/* Top actions */}
          <Box display="flex" justifyContent="flex-start" gap={2} mb={3}>
            <Button 
              variant="contained" 
              startIcon={<CheckCircle />}
              sx={{ borderRadius: 2 }}
              onClick={handleOpenDialog}
              disabled={bookingStatus === "Confirmed"}
            >
              {bookingStatus === "Confirmed" ? "Booking Confirmed" : "Finalize Booking"}
            </Button>
            <Button 
              variant="outlined" 
              startIcon={<Download />}
              sx={{ borderRadius: 2 }}
              onClick={handleDownloadPDF}
            >
              Download PDF
            </Button>
          </Box>

          {/* Customer details */}
          <Paper variant="outlined" sx={{ p: 2, mb: 3, backgroundColor: "#f8f9fa" }}>
            <Typography variant="subtitle2" color="textSecondary" gutterBottom>
              <Person sx={{ fontSize: 16, verticalAlign: "bottom", mr: 1 }} />
              Kind Attention
            </Typography>
            <Typography variant="h6" gutterBottom>
              {quotation.customer}
            </Typography>
            <Box display="flex" alignItems="center">
              <LocationOn sx={{ fontSize: 16, mr: 0.5, color: "text.secondary" }} />
              <Typography variant="body2">
                {quotation.country}
              </Typography>
            </Box>
          </Paper>

          {/* Flight details */}
          <Paper variant="outlined" sx={{ p: 3, borderRadius: 2 }}>
            <Box
              display="flex"
              alignItems="center"
              justifyContent="space-between"
              mb={2}
            >
              <Box display="flex" alignItems="center">
                <Flight sx={{ color: "orange", mr: 1 }} />
                <Typography variant="h6" sx={{ color: "orange" }}>
                  <b>Flight Booking Details (One Way)</b>
                </Typography>
              </Box>
             
            </Box>

            <Grid container spacing={2}>
              <Grid size={{xs:12, md:6}}>
                <Box display="flex" alignItems="center" mb={1}>
                  <LocationOn color="primary" sx={{ mr: 1 }} />
                  <Typography variant="body2" fontWeight="bold">
                    From
                  </Typography>
                </Box>
                <Typography variant="body1" sx={{ ml: 4 }}>
                  {quotation.flight.from}
                </Typography>
              </Grid>
              
              <Grid size={{xs:12, md:6}}>
                <Box display="flex" alignItems="center" mb={1}>
                  <LocationOn color="primary" sx={{ mr: 1 }} />
                  <Typography variant="body2" fontWeight="bold">
                    To
                  </Typography>
                </Box>
                <Typography variant="body1" sx={{ ml: 4 }}>
                  {quotation.flight.to}
                </Typography>
              </Grid>
              
              <Grid size={{xs:12, md:6}}>
                <Box display="flex" alignItems="center" mb={1}>
                  <Event color="primary" sx={{ mr: 1 }} />
                  <Typography variant="body2" fontWeight="bold">
                    Date
                  </Typography>
                </Box>
                <Typography variant="body1" sx={{ ml: 4 }}>
                  {quotation.flight.date}
                </Typography>
              </Grid>
              
              <Grid size={{xs:12, md:6}}>
                <Box display="flex" alignItems="center" mb={1}>
                  <Schedule color="primary" sx={{ mr: 1 }} />
                  <Typography variant="body2" fontWeight="bold">
                    Departure Time
                  </Typography>
                </Box>
                <Typography variant="body1" sx={{ ml: 4 }}>
                  {quotation.flight.time}
                </Typography>
              </Grid>

               <Grid size={{xs:12, md:6}}>
                <Box display="flex" alignItems="center" mb={1}>
                  <Flight color="primary" sx={{ mr: 1 }} />
                  <Typography variant="body2" fontWeight="bold">
                   Airline
                  </Typography>
                </Box>
                <Typography variant="body1" sx={{ ml: 4 }}>
                  {quotation.flight.airline}
                </Typography>
              </Grid>
              
               <Grid size={{xs:12, md:6}}>
                <Box display="flex" alignItems="center" mb={1}>
                  <FlightClass color="primary" sx={{ mr: 1 }} />
                  <Typography variant="body2" fontWeight="bold">
                   Class
                  </Typography>
                </Box>
                <Typography variant="body1" sx={{ ml: 4 }}>
                  {quotation.flight.class}
                </Typography>
              </Grid>

              <Grid size={{xs:12, md:6}}>
                <Box display="flex" alignItems="center" mb={1}>
                  <AirplaneTicket color="primary" sx={{ mr: 1 }} />
                  <Typography variant="body2" fontWeight="bold">
                    Flight Number
                  </Typography>
                </Box>
                <Typography variant="body1" sx={{ ml: 4 }}>
                  {quotation.flight.flightNo}
                </Typography>
              </Grid>


               <Grid size={{xs:12, md:6}}>
                <Box display="flex" alignItems="center" mb={1}>
                  <ConfirmationNumber color="primary" sx={{ mr: 1 }} />
                  <Typography variant="body2" fontWeight="bold">
                    PNR
                  </Typography>
                </Box>
                <Typography variant="body1" sx={{ ml: 4 }}>
                  {quotation.flight.pnr}
                </Typography>
              </Grid>

                {/* <Grid size={{xs:12, md:6}}>
                <Box display="flex" alignItems="center" mb={1}>
                  <Luggage color="primary" sx={{ mr: 1 }} />
                  <Typography variant="body2" fontWeight="bold">
                    Baggage
                  </Typography>
                </Box>
                <Typography variant="body1" sx={{ ml: 4 }}>
                  {quotation.flight.baggage}
                </Typography>
              </Grid>
               */}
              <Grid size={{xs:12, md:6}}>
                <Box display="flex" alignItems="center" mb={1}>
                  <Group color="primary" sx={{ mr: 1 }} />
                  <Typography variant="body2" fontWeight="bold">
                    Passengers
                  </Typography>
                </Box>
                <Typography variant="body1" sx={{ ml: 4 }}>
                  {quotation.flight.passengers}
                </Typography>
              </Grid>
              
              <Grid size={{xs:12, md:6}}>
                <Box display="flex" alignItems="center" mb={1}>
                  <AttachMoney color="primary" sx={{ mr: 1 }} />
                  <Typography variant="body2" fontWeight="bold">
                    Total Price
                  </Typography>
                </Box>
                <Typography variant="h6" sx={{ color: "orange", ml: 4 }}>
                  {quotation.flight.price}
                </Typography>
              </Grid>
            </Grid>
          </Paper>

          {/* Additional information */}
          <Box mt={3} textAlign="center">
            <Typography variant="body2" color="textSecondary">
              For any changes or queries, please contact our support team
            </Typography>
          </Box>
        </Grid>
      </Grid>

      {/* Confirmation Dialog */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          {"Confirm Flight Booking Finalization"}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Are you sure you want to finalize this flight booking? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>No, Cancel</Button>
          <Button onClick={handleConfirmFinalize} autoFocus variant="contained">
            Yes, Finalize
          </Button>
        </DialogActions>
      </Dialog>

      {/* Success Snackbar */}
      <Snackbar 
        open={openSnackbar} 
        autoHideDuration={4000} 
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity="success" sx={{ width: '100%' }}>
          Flight booking has been successfully confirmed!
        </Alert>
      </Snackbar>
    </>
  );
};

export default FlightFinalize;