import React, { useState } from "react";
import {
  Box,
  Grid,
  Typography,
  TextField,
  MenuItem,
  Button,
  Paper,
  RadioGroup,
  FormControlLabel,
  Radio,
  IconButton,
  Dialog,
  Divider,
  Chip,
  Avatar,
  useTheme,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import {
  DatePicker,
  TimePicker,
  LocalizationProvider,
} from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { useFormik } from "formik";
import * as Yup from "yup";
import DeleteIcon from "@mui/icons-material/Delete";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import VisibilityIcon from "@mui/icons-material/Visibility";
import {
  FlightTakeoff,
  FlightLand,
  AirlineSeatReclineNormal,
  Person,
  Phone,
  Email,
  Close
} from '@mui/icons-material';
import {createFlightQuotation} from "../../../../features/quotation/flightQuotationSlice"
import { useSelector, useDispatch } from "react-redux";
import {getAllLeads,getLeadOptions,addLeadOption} from "../../../../features/leads/leadSlice";

// Validation schema
const validationSchema = Yup.object({
  clientName: Yup.string().required("Client name is required"),
  from: Yup.string().required("From is required"),
  to: Yup.string().required("To is required"),
  airline: Yup.string().required("Preferred airline is required"),
  flightNo: Yup.string().required("Flight number is required"),
  fare: Yup.number().typeError("Must be a number").required("Fare is required"),
  departureDate: Yup.date().required("Departure date is required"),
  adults: Yup.number().min(1, "At least 1 adult").required("Required"),
  fullName: Yup.string().required("Full name is required"),
  mobile: Yup.string().required("Mobile number is required"),
  email: Yup.string().email("Invalid email").required("Email is required"),
});

const QuotationFlightForm = () => {
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewData, setPreviewData] = useState(null);
  const theme = useTheme();
  const dispatch = useDispatch();
   const {
        list: leadList = [],
        status,
         options=[], 
         loading: optionsLoading,
        error,
      } = useSelector((state) => state.leads);
  const initialValues = {
    tripType: "oneway",
    clientName: "",
    from: "",
    to: "",
    airline: "",
    flightNo: "",
    fare: "",
    departureDate: null,
    departureTime: null,
    returnFrom: "",
    returnTo: "",
    returnAirline: "",
    returnFlightNo: "",
    returnFare: "",
    returnDate: null,
    returnTime: null,
    additionalCities: [],
    adults: "",
    childs: "",
    infants: "",
    message: "",
    fullName: "",
    mobile: "",
    email: "",
  };

  const formik = useFormik({
  initialValues,
  validationSchema,
  onSubmit: async (values) => {
    const payload = {
      tripType: values.tripType,
      clientDetails: {
        clientName: values.clientName,
      },
      flightDetails: [
        {
          from: values.from,
          to: values.to,
           preferredAirline: values.airline,
          flightNo: values.flightNo,
          fare: Number(values.fare),
          departureDate: values.departureDate,
          departureTime: values.departureTime,
        },
      ],
      adults: Number(values.adults),
      childs: Number(values.childs),
      infants: Number(values.infants),
      anyMessage: values.message,
      personalDetails: {
        fullName: values.fullName,
        mobileNumber: values.mobile,
        emailId: values.email,
      },
    };

    // ✅ Handle roundtrip flights
    if (values.tripType === "roundtrip") {
      payload.flightDetails.push({
        from: values.returnFrom,
        to: values.returnTo,
        airline: values.returnAirline,
        flightNo: values.returnFlightNo,
        fare: Number(values.returnFare),
        departureDate: values.returnDate,
        departureTime: values.returnTime,
      });
    }

    // ✅ Handle multicity flights
    if (values.tripType === "multicity" && values.additionalCities.length > 0) {
      const multiCities = values.additionalCities.map((city) => ({
        from: city.from,
        to: city.to,
        airline: city.airline,
        flightNo: city.flightNo,
        fare: Number(city.fare),
        departureDate: city.date,
        departureTime: city.time,
      }));
      payload.flightDetails.push(...multiCities);
    }

    console.log("Final Payload:", payload);
    await dispatch(createFlightQuotation(payload));
    formik.resetForm();

        // Navigate back or to listing after success
        navigate("/quotation", { replace: true });
  },
});


  const addAnotherCity = () => {
    const newCity = {
      from: "",
      to: "",
      airline: "",
      flightNo: "",
      fare: "",
      date: null,
      time: null,
    };
    formik.setFieldValue("additionalCities", [
      ...formik.values.additionalCities,
      newCity,
    ]);
  };

  const handleAdditionalCityChange = (index, field, value) => {
    const updatedCities = [...formik.values.additionalCities];
    updatedCities[index][field] = value;
    formik.setFieldValue("additionalCities", updatedCities);
  };

  const deleteCity = (index) => {
    const updatedCities = formik.values.additionalCities.filter(
      (_, i) => i !== index
    );
    formik.setFieldValue("additionalCities", updatedCities);
  };

  const handlePreview = () => {
    setPreviewData(formik.values);
    setPreviewOpen(true);
  };
const handleClientChange = (event) => {
  event.preventDefault();
  const selectedClientName = event.target.value;

  // If user selects "Add New" client
  if (selectedClientName === "addNew") {
    setFieldType("client");
    setNewValue("");
    setOpenDialog(true);
    return;
  }

  // Update formik value for client name
  formik.setFieldValue("clientName", selectedClientName);

  // Find selected client details from leadList
  const selectedLead = leadList.find(
    (lead) => lead.personalDetails.fullName === selectedClientName
  );

  if (selectedLead) {
    const { personalDetails, tourDetails } = selectedLead;

    // Auto-fill personal details
    formik.setFieldValue("fullName", personalDetails.fullName || "");
    formik.setFieldValue("email", personalDetails.emailId || "");
    formik.setFieldValue("mobile", personalDetails.mobile || "");

    // Auto-fill tour-related fields if available
    formik.setFieldValue(
      "noOfDays",
      (tourDetails?.accommodation?.noOfNights || 0) + 1
    );
    formik.setFieldValue(
      "pickupDate",
      tourDetails?.pickupDrop?.arrivalDate
        ? new Date(tourDetails.pickupDrop.arrivalDate)
        : null
    );
    formik.setFieldValue(
      "pickupLocation",
      tourDetails?.pickupDrop?.arrivalLocation || ""
    );
    formik.setFieldValue(
      "dropDate",
      tourDetails?.pickupDrop?.departureDate
        ? new Date(tourDetails.pickupDrop.departureDate)
        : null
    );
    formik.setFieldValue(
      "dropLocation",
      tourDetails?.pickupDrop?.departureLocation || ""
    );
  }
};

  const renderFlightDetails = (prefix = "", values = formik.values) => (
    <>
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 6 }}>
          <TextField
            fullWidth
            label="From"
            name={`${prefix}from`}
            value={values[`${prefix}from`]}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={
              formik.touched[`${prefix}from`] &&
              Boolean(formik.errors[`${prefix}from`])
            }
            helperText={
              formik.touched[`${prefix}from`] && formik.errors[`${prefix}from`]
            }
          />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <TextField
            fullWidth
            label="To"
            name={`${prefix}to`}
            value={values[`${prefix}to`]}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={
              formik.touched[`${prefix}to`] &&
              Boolean(formik.errors[`${prefix}to`])
            }
            helperText={
              formik.touched[`${prefix}to`] && formik.errors[`${prefix}to`]
            }
          />
        </Grid>
        <Grid size={{ xs: 12 }}>
          <TextField
            fullWidth
            select
            label="Preferred Airline"
            name={`${prefix}airline`}
            value={values[`${prefix}airline`]}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={
              formik.touched[`${prefix}airline`] &&
              Boolean(formik.errors[`${prefix}airline`])
            }
            helperText={
              formik.touched[`${prefix}airline`] &&
              formik.errors[`${prefix}airline`]
            }
          >
            {[
              "AirIndia",
              "AirAsia",
              "IndiGo",
              "SpiceJet",
              "Vistara",
              "AirArabia",
              "AirDeccan",
              "GoAir",
            ].map((item) => (
              <MenuItem key={item} value={`airline${item}`}>
                {item}
              </MenuItem>
            ))}
          </TextField>
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <TextField
            fullWidth
            label="Flight No."
            name={`${prefix}flightNo`}
            value={values[`${prefix}flightNo`]}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={
              formik.touched[`${prefix}flightNo`] &&
              Boolean(formik.errors[`${prefix}flightNo`])
            }
            helperText={
              formik.touched[`${prefix}flightNo`] &&
              formik.errors[`${prefix}flightNo`]
            }
          />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <TextField
            fullWidth
            label="Fare"
            name={`${prefix}fare`}
            value={values[`${prefix}fare`]}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={
              formik.touched[`${prefix}fare`] &&
              Boolean(formik.errors[`${prefix}fare`])
            }
            helperText={
              formik.touched[`${prefix}fare`] && formik.errors[`${prefix}fare`]
            }
          />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <DatePicker
            label={`${prefix ? "Return " : "Departure "}Date`}
            value={
              values[`${prefix}departureDate`] || values[`${prefix}returnDate`]
            }
            onChange={(val) =>
              formik.setFieldValue(
                `${prefix}${prefix ? "return" : "departure"}Date`,
                val
              )
            }
            slotProps={{
              textField: {
                fullWidth: true,
                error:
                  formik.touched[
                    `${prefix}${prefix ? "return" : "departure"}Date`
                  ] &&
                  Boolean(
                    formik.errors[
                      `${prefix}${prefix ? "return" : "departure"}Date`
                    ]
                  ),
                helperText:
                  formik.touched[
                    `${prefix}${prefix ? "return" : "departure"}Date`
                  ] &&
                  formik.errors[
                    `${prefix}${prefix ? "return" : "departure"}Date`
                  ],
              },
            }}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <TimePicker
            label={`${prefix ? "Return " : "Departure "}Time`}
            value={
              values[`${prefix}departureTime`] || values[`${prefix}returnTime`]
            }
            onChange={(val) =>
              formik.setFieldValue(
                `${prefix}${prefix ? "return" : "departure"}Time`,
                val
              )
            }
            slotProps={{ textField: { fullWidth: true } }}
          />
        </Grid>
      </Grid>
    </>
  );

  const renderAdditionalCity = (city, index) => (
    <Paper key={index} sx={{ p: 3, mb: 3, position: "relative" }}>
      <IconButton
        sx={{ position: "absolute", top: 8, right: 8 }}
        onClick={() => deleteCity(index)}
        color="error"
      >
        <DeleteIcon />
      </IconButton>
      <Typography variant="subtitle1" gutterBottom>
        Additional City {index + 1}
      </Typography>
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 6 }}>
          <TextField
            fullWidth
            label="From"
            value={city.from}
            onChange={(e) =>
              handleAdditionalCityChange(index, "from", e.target.value)
            }
          />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <TextField
            fullWidth
            label="To"
            value={city.to}
            onChange={(e) =>
              handleAdditionalCityChange(index, "to", e.target.value)
            }
          />
        </Grid>
        <Grid size={{ xs: 12 }}>
          <TextField
            fullWidth
            select
            label="Preferred Airline"
            value={city.airline}
            onChange={(e) =>
              handleAdditionalCityChange(index, "airline", e.target.value)
            }
          >
            {[
              "AirIndia",
              "AirAsia",
              "IndiGo",
              "SpiceJet",
              "Vistara",
              "AirArabia",
              "AirDeccan",
              "GoAir",
            ].map((item) => (
              <MenuItem key={item} value={`airline${item}`}>
                {item}
              </MenuItem>
            ))}
          </TextField>
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <TextField
            fullWidth
            label="Flight No."
            value={city.flightNo}
            onChange={(e) =>
              handleAdditionalCityChange(index, "flightNo", e.target.value)
            }
          />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <TextField
            fullWidth
            label="Fare"
            value={city.fare}
            onChange={(e) =>
              handleAdditionalCityChange(index, "fare", e.target.value)
            }
          />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <DatePicker
            label="Date"
            value={city.date}
            onChange={(val) => handleAdditionalCityChange(index, "date", val)}
            slotProps={{ textField: { fullWidth: true } }}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <TimePicker
            label="Time"
            value={city.time}
            onChange={(val) => handleAdditionalCityChange(index, "time", val)}
            slotProps={{ textField: { fullWidth: true } }}
          />
        </Grid>
      </Grid>
    </Paper>
  );

    const PreviewDialog = () => (
        <Dialog
      open={previewOpen}
      onClose={() => setPreviewOpen(false)}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          overflow: 'hidden'
        }
      }}
    >
      <DialogTitle
        sx={{
          background: 'linear-gradient(135deg, #1976d2 0%, #004ba0 100%)',
          color: 'white',
          py: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}
      >
        <Box display="flex" alignItems="center">
          <FlightTakeoff sx={{ mr: 1, fontSize: 28 }} />
          <Typography variant="h5" component="div" fontWeight="600">
            Iconic Yatra
          </Typography>
        </Box>
        <Typography variant="h6" component="div">
          Flight Quotation Preview
        </Typography>
      </DialogTitle>

      <DialogContent sx={{ p: 0 }}>
        {previewData && (
          <Box>
            {/* Header with trip type and client */}
            <Box sx={{ p: 3, pb: 2, background: '#f9f9f9' }}>
              <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                <Chip
                  label={previewData.tripType.toUpperCase()}
                  color="primary"
                  variant="outlined"
                  sx={{ fontWeight: 'bold', fontSize: '0.9rem' }}
                />
                <Box textAlign="right">
                  <Typography variant="body2" color="textSecondary">
                    Prepared for
                  </Typography>
                  <Typography variant="h6" color="primary" fontWeight="600">
                    {previewData.clientName}
                  </Typography>
                </Box>
              </Box>
            </Box>

            {/* Flight Details */}
            <Box sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                <FlightTakeoff sx={{ mr: 1, color: 'primary.main' }} />
                Flight Details
              </Typography>
              
              <Paper variant="outlined" sx={{ p: 2, mb: 2, background: '#fafafa' }}>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Box>
                    <Typography variant="body2" color="textSecondary">
                      From
                    </Typography>
                    <Typography variant="h6" fontWeight="600">
                      {previewData.from}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ textAlign: 'center', flex: 1 }}>
                    <FlightTakeoff sx={{ color: 'success.main', fontSize: 20, verticalAlign: 'middle' }} />
                    <Box sx={{ 
                      display: 'inline-block', 
                      height: '2px', 
                      width: '40px', 
                      bgcolor: 'grey.300', 
                      mx: 1,
                      verticalAlign: 'middle'
                    }} />
                    <FlightLand sx={{ color: 'error.main', fontSize: 20, verticalAlign: 'middle' }} />
                  </Box>
                  
                  <Box sx={{ textAlign: 'right' }}>
                    <Typography variant="body2" color="textSecondary">
                      To
                    </Typography>
                    <Typography variant="h6" fontWeight="600">
                      {previewData.to}
                    </Typography>
                  </Box>
                </Box>
                
                <Divider sx={{ my: 2 }} />
                
                <Box display="flex" justifyContent="space-between">
                  <Box>
                    <Typography variant="body2" color="textSecondary">
                      Airline
                    </Typography>
                    <Typography variant="body1" fontWeight="500">
                      {previewData.airline}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="body2" color="textSecondary">
                      Flight No
                    </Typography>
                    <Typography variant="body1" fontWeight="500">
                      {previewData.flightNo}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ textAlign: 'right' }}>
                    <Typography variant="body2" color="textSecondary">
                      Fare
                    </Typography>
                    <Typography variant="body1" fontWeight="500" color="primary">
                      {previewData.fare}
                    </Typography>
                  </Box>
                </Box>
              </Paper>

              {/* Return Flight Details */}
              {previewData.tripType !== "oneway" && (
                <>
                  <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', mt: 3 }}>
                    <FlightLand sx={{ mr: 1, color: 'primary.main' }} />
                    Return Flight Details
                  </Typography>
                  
                  <Paper variant="outlined" sx={{ p: 2, mb: 2, background: '#fafafa' }}>
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                      <Box>
                        <Typography variant="body2" color="textSecondary">
                          From
                        </Typography>
                        <Typography variant="h6" fontWeight="600">
                          {previewData.returnfrom}
                        </Typography>
                      </Box>
                      
                      <Box sx={{ textAlign: 'center', flex: 1 }}>
                        <FlightTakeoff sx={{ color: 'success.main', fontSize: 20, verticalAlign: 'middle' }} />
                        <Box sx={{ 
                          display: 'inline-block', 
                          height: '2px', 
                          width: '40px', 
                          bgcolor: 'grey.300', 
                          mx: 1,
                          verticalAlign: 'middle'
                        }} />
                        <FlightLand sx={{ color: 'error.main', fontSize: 20, verticalAlign: 'middle' }} />
                      </Box>
                      
                      <Box sx={{ textAlign: 'right' }}>
                        <Typography variant="body2" color="textSecondary">
                          To
                        </Typography>
                        <Typography variant="h6" fontWeight="600">
                          {previewData.returnto}
                        </Typography>
                      </Box>
                    </Box>
                    
                    <Divider sx={{ my: 2 }} />
                    
                    <Box display="flex" justifyContent="space-between">
                      <Box>
                        <Typography variant="body2" color="textSecondary">
                          Airline
                        </Typography>
                        <Typography variant="body1" fontWeight="500">
                          {previewData.returnairline}
                        </Typography>
                      </Box>
                      
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="body2" color="textSecondary">
                          Flight No
                        </Typography>
                        <Typography variant="body1" fontWeight="500">
                          {previewData.returnflightNo}
                        </Typography>
                      </Box>
                      
                      <Box sx={{ textAlign: 'right' }}>
                        <Typography variant="body2" color="textSecondary">
                          Fare
                        </Typography>
                        <Typography variant="body1" fontWeight="500" color="primary">
                          {previewData.returnfare}
                        </Typography>
                      </Box>
                    </Box>
                  </Paper>
                </>
              )}

              {/* Additional Cities */}
              {previewData.additionalCities.length > 0 && (
                <>
                  <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
                    Additional Cities
                  </Typography>
                  
                  {previewData.additionalCities.map((city, index) => (
                    <Paper key={index} variant="outlined" sx={{ p: 2, mb: 2, background: '#fafafa' }}>
                      <Typography variant="subtitle1" fontWeight="600" gutterBottom>
                        City {index + 1}
                      </Typography>
                      
                      <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                        <Box>
                          <Typography variant="body2" color="textSecondary">
                            From
                          </Typography>
                          <Typography variant="body1" fontWeight="500">
                            {city.from}
                          </Typography>
                        </Box>
                        
                        <Box sx={{ textAlign: 'center', flex: 1 }}>
                          <FlightTakeoff sx={{ color: 'success.main', fontSize: 20, verticalAlign: 'middle' }} />
                          <Box sx={{ 
                            display: 'inline-block', 
                            height: '2px', 
                            width: '40px', 
                            bgcolor: 'grey.300', 
                            mx: 1,
                            verticalAlign: 'middle'
                          }} />
                          <FlightLand sx={{ color: 'error.main', fontSize: 20, verticalAlign: 'middle' }} />
                        </Box>
                        
                        <Box sx={{ textAlign: 'right' }}>
                          <Typography variant="body2" color="textSecondary">
                            To
                          </Typography>
                          <Typography variant="body1" fontWeight="500">
                            {city.to}
                          </Typography>
                        </Box>
                      </Box>
                      
                      <Divider sx={{ my: 1 }} />
                      
                      <Box display="flex" justifyContent="space-between">
                        <Box>
                          <Typography variant="body2" color="textSecondary">
                            Airline
                          </Typography>
                          <Typography variant="body1">
                            {city.airline}
                          </Typography>
                        </Box>
                        
                        <Box sx={{ textAlign: 'center' }}>
                          <Typography variant="body2" color="textSecondary">
                            Flight No
                          </Typography>
                          <Typography variant="body1">
                            {city.flightNo}
                          </Typography>
                        </Box>
                        
                        <Box sx={{ textAlign: 'right' }}>
                          <Typography variant="body2" color="textSecondary">
                            Fare
                          </Typography>
                          <Typography variant="body1" color="primary">
                            {city.fare}
                          </Typography>
                        </Box>
                      </Box>
                    </Paper>
                  ))}
                </>
              )}

              {/* Passengers */}
              <Box sx={{ mt: 3 }}>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                  <AirlineSeatReclineNormal sx={{ mr: 1, color: 'primary.main' }} />
                  Passengers
                </Typography>
                
                <Box display="flex" gap={2}>
                  <Chip
                    avatar={<Avatar>{previewData.adults}</Avatar>}
                    label="Adults"
                    variant="outlined"
                    color="primary"
                  />
                  <Chip
                    avatar={<Avatar>{previewData.childs}</Avatar>}
                    label="Children"
                    variant="outlined"
                    color="secondary"
                  />
                  <Chip
                    avatar={<Avatar>{previewData.infants}</Avatar>}
                    label="Infants"
                    variant="outlined"
                  />
                </Box>
              </Box>

              {/* Message */}
              {previewData.message && (
                <Box sx={{ mt: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    Message
                  </Typography>
                  <Paper variant="outlined" sx={{ p: 2, background: '#f9f9f9' }}>
                    <Typography variant="body2">
                      {previewData.message}
                    </Typography>
                  </Paper>
                </Box>
              )}

              {/* Personal Details */}
              <Box sx={{ mt: 3 }}>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                  <Person sx={{ mr: 1, color: 'primary.main' }} />
                  Personal Details
                </Typography>
                
                <Paper variant="outlined" sx={{ p: 2 }}>
                  <Box display="flex" alignItems="center" mb={1}>
                    <Person sx={{ mr: 1, color: 'action.active' }} />
                    <Typography variant="body1">
                      {previewData.fullName}
                    </Typography>
                  </Box>
                  
                  <Box display="flex" alignItems="center" mb={1}>
                    <Phone sx={{ mr: 1, color: 'action.active' }} />
                    <Typography variant="body1">
                      {previewData.mobile}
                    </Typography>
                  </Box>
                  
                  <Box display="flex" alignItems="center">
                    <Email sx={{ mr: 1, color: 'action.active' }} />
                    <Typography variant="body1">
                      {previewData.email}
                    </Typography>
                  </Box>
                </Paper>
              </Box>
            </Box>
          </Box>
        )}
      </DialogContent>
      
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button 
          onClick={() => setPreviewOpen(false)} 
          variant="outlined"
          startIcon={<Close />}
        >
          Close
        </Button>
        <Button 
          variant="contained"
          onClick={() => window.print()}
        >
          Print Quotation
        </Button>
      </DialogActions>
    </Dialog>
    );

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <form onSubmit={formik.handleSubmit}>
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Quotation Flight Section
          </Typography>
          <RadioGroup
            row
            name="tripType"
            value={formik.values.tripType}
            onChange={formik.handleChange}
          >
            {["oneway", "roundtrip", "multicity"].map((type) => (
              <FormControlLabel
                key={type}
                value={type}
                control={<Radio />}
                label={
                  type === "oneway"
                    ? "One Way"
                    : type === "roundtrip"
                    ? "Round-Trip"
                    : "Multi City"
                }
              />
            ))}
          </RadioGroup>
        </Paper>

        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="subtitle1">Client Details</Typography>
          <TextField
  select
  fullWidth
  label="Client Name"
  name="clientName"
  value={formik.values.clientName}
  onChange={handleClientChange}
>
  {leadList.map((lead, index) => (
    <MenuItem key={index} value={lead.personalDetails.fullName}>
      {lead.personalDetails.fullName}
    </MenuItem>
  ))}
  </TextField>
        </Paper>

        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Paper sx={{ p: 3, mb: 3 }}>
              <Typography variant="subtitle1" gutterBottom>
                Flight Details
              </Typography>
              {renderFlightDetails()}
            </Paper>
          </Grid>

          {(formik.values.tripType === "roundtrip" ||
            formik.values.tripType === "multicity") && (
            <Grid size={{ xs: 12, md: 6 }}>
              <Paper sx={{ p: 3, mb: 3 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Flight Details
                </Typography>
                {renderFlightDetails("return", formik.values)}
              </Paper>
            </Grid>
          )}
        </Grid>
        {formik.values.tripType === "multicity" && (
          <Grid container spacing={2}>
            {formik.values.additionalCities.map((city, index) => (
              <Grid size={{ xs: 12, md: 6 }} key={index}>
                {renderAdditionalCity(city, index)}
              </Grid>
            ))}
            <Grid size={{ xs: 12 }}>
              <Button
                variant="contained"
                color="primary"
                startIcon={<AddCircleOutlineIcon />}
                onClick={addAnotherCity}
                sx={{
                  mb: 3,
                  borderRadius: "5px",
                  textTransform: "none",
                  px: 3,
                  py: 1,
                  fontWeight: "bold",
                  boxShadow: 3,
                  "&:hover": {
                    backgroundColor: "#1565c0",
                    transform: "scale(1.05)",
                    transition: "all 0.2s ease-in-out",
                  },
                }}
              >
                Add Another City
              </Button>
            </Grid>
          </Grid>
        )}

        <Paper sx={{ p: 3, mb: 3 }}>
          <Grid container spacing={2}>
            {["adults", "childs", "infants"].map((field) => (
              <Grid key={field} size={{ xs: 4 }}>
                <TextField
                  fullWidth
                  label={
                    field === "adults"
                      ? "Adults (12+ Yrs)"
                      : field === "childs"
                      ? "Childs (2-11 Yrs)"
                      : "Infants (Under 2 Yrs)"
                  }
                  name={field}
                  value={formik.values[field]}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched[field] && Boolean(formik.errors[field])}
                  helperText={formik.touched[field] && formik.errors[field]}
                />
              </Grid>
            ))}
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                multiline
                rows={2}
                label="Any Message"
                name="message"
                value={formik.values.message}
                onChange={formik.handleChange}
              />
            </Grid>
          </Grid>
        </Paper>

        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="subtitle1">Personal Details</Typography>
          <Grid container spacing={2}>
            {["fullName", "mobile", "email"].map((field, index) => (
              <Grid key={field} size={{ xs: index === 2 ? 12 : 6 }}>
                <TextField
                  fullWidth
                  label={
                    field === "fullName"
                      ? "Full Name"
                      : field === "mobile"
                      ? "Mobile Number"
                      : "Email Id"
                  }
                  name={field}
                  value={formik.values[field]}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched[field] && Boolean(formik.errors[field])}
                  helperText={formik.touched[field] && formik.errors[field]}
                />
              </Grid>
            ))}
          </Grid>
        </Paper>

        <Box display="flex" gap={2}>
          <Button type="submit" variant="contained" color="primary">
            Save
          </Button>
          <Button
            variant="outlined"
            color="info"
            startIcon={<VisibilityIcon />}
            onClick={handlePreview}
          >
            View
          </Button>
          <Button
            type="reset"
            variant="outlined"
            color="secondary"
            onClick={formik.handleReset}
          >
            Clear Form
          </Button>
        </Box>

        <PreviewDialog />
      </form>
    </LocalizationProvider>
  );
};
export default QuotationFlightForm;