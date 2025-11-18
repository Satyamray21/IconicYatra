import React, { useState, useEffect } from "react";
import {
  Box,
  Grid,
  Typography,
  TextField,
  Button,
  MenuItem,
  Paper,
  Dialog,
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

// Helper functions for time handling
const formatTimeForDisplay = (timeString) => {
  if (!timeString) return null;
  try {
    // If it's already a Date object
    if (timeString instanceof Date) return timeString;
    
    // If it's in HH:mm format
    if (typeof timeString === 'string' && timeString.includes(':')) {
      const [hours, minutes] = timeString.split(':');
      return new Date(1970, 0, 1, parseInt(hours), parseInt(minutes));
    }
    
    return null;
  } catch (error) {
    console.error('Error formatting time:', error);
    return null;
  }
};

const formatTimeForSubmit = (date) => {
  if (!date) return "12:00";
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
};

// Dynamic Validation Schema based on transport
const getValidationSchema = (transport) => {
  return Yup.object({
    clientName: Yup.string().required("Client Name is required"),
    vehicleType: Yup.string().required("Vehicle Type is required"),
    tripType: Yup.string().required("Trip Type is required"),
    totalCost: transport === "No" 
      ? Yup.number().typeError("Must be a number").notRequired()
      : Yup.number()
          .typeError("Must be a number")
          .required("Total Costing is required"),
  });
};

const tripTypes = ["One Way", "Round Trip"];

const CustomQuotationStep5 = ({ 
  clientName, 
  sector, 
  arrivalCity, 
  departureCity, 
  arrivalDate, 
  departureDate,
  transport,
  cities,
  vehicleDetails,
  onNext
}) => {
  const [clients, setClients] = useState(["Client A", "Client B"]);
  const [vehicleTypes, setVehicleTypes] = useState([
    "Sedan",
    "SUV",
    "Bus",
    "Tempo Traveller",
  ]);
  const [openDialog, setOpenDialog] = useState(false);
  const [newValue, setNewValue] = useState("");
  const [fieldType, setFieldType] = useState("");

  // Format dates for initial values
  const formatDateForPicker = (dateString) => {
    if (!dateString) return null;
    try {
      return new Date(dateString);
    } catch (error) {
      console.error('Error formatting date:', error);
      return null;
    }
  };

  const formik = useFormik({
    initialValues: {
      clientName: clientName || "",
      vehicleType: transport === "No" ? "No Transport" : (vehicleDetails?.basicsDetails?.vehicleType || ""),
      tripType: vehicleDetails?.basicsDetails?.tripType || "",
      noOfDays: vehicleDetails?.basicsDetails?.noOfDays || "",
      ratePerKm: vehicleDetails?.costDetails?.ratePerKm || "",
      kmPerDay: vehicleDetails?.costDetails?.kmPerDay || "",
      driverAllowance: vehicleDetails?.costDetails?.driverAllowance || "",
      tollParking: vehicleDetails?.costDetails?.tollParking || "",
      totalCost: transport === "No" ? "0" : (vehicleDetails?.costDetails?.totalCost || ""),
     pickupDate: vehicleDetails?.pickupDropDetails?.pickupDate
  ? new Date(vehicleDetails.pickupDropDetails.pickupDate)
  : arrivalDate ? new Date(arrivalDate) : null,

pickupTime: vehicleDetails?.pickupDropDetails?.pickupTime
  ? formatTimeForDisplay(vehicleDetails.pickupDropDetails.pickupTime)
  : null,

pickupLocation: vehicleDetails?.pickupDropDetails?.pickupLocation
  || arrivalCity || "",

dropDate: vehicleDetails?.pickupDropDetails?.dropDate
  ? new Date(vehicleDetails.pickupDropDetails.dropDate)
  : departureDate ? new Date(departureDate) : null,

dropTime: vehicleDetails?.pickupDropDetails?.dropTime
  ? formatTimeForDisplay(vehicleDetails.pickupDropDetails.dropTime)
  : null,

dropLocation: vehicleDetails?.pickupDropDetails?.dropLocation
  || departureCity || "",

    },
    validationSchema: getValidationSchema(transport),
    onSubmit: (values) => {
      const formattedData = {
        basicsDetails: {
          clientName: values.clientName,
          vehicleType: values.vehicleType,
          tripType: values.tripType,
          noOfDays: values.noOfDays,
          perDayCost: values.ratePerKm, // or calculate as needed
        },
        costDetails: {
          ratePerKm: values.ratePerKm,
          kmPerDay: values.kmPerDay,
          driverAllowance: values.driverAllowance,
          tollParking: values.tollParking,
          totalCost: values.totalCost,
        },
        pickupDropDetails: {
          pickupDate: values.pickupDate ? values.pickupDate.toISOString() : new Date().toISOString(),
          pickupTime: formatTimeForSubmit(values.pickupTime),
          pickupLocation: values.pickupLocation,
          dropDate: values.dropDate ? values.dropDate.toISOString() : new Date().toISOString(),
          dropTime: formatTimeForSubmit(values.dropTime),
          dropLocation: values.dropLocation,
        },
      };
      
      console.log("Step 5 Submitted:", formattedData);
      onNext(formattedData);
    },
    enableReinitialize: true,
  });

  // Auto-calculate total cost when relevant fields change (only if transport is Yes)
  useEffect(() => {
    if (transport !== "No") {
      const noOfDays = parseFloat(formik.values.noOfDays) || 0;
      const ratePerKm = parseFloat(formik.values.ratePerKm) || 0;
      const kmPerDay = parseFloat(formik.values.kmPerDay) || 0;
      const driverAllowance = parseFloat(formik.values.driverAllowance) || 0;
      const tollParking = parseFloat(formik.values.tollParking) || 0;

      if (noOfDays > 0 && ratePerKm > 0 && kmPerDay > 0) {
        const distanceCost = noOfDays * ratePerKm * kmPerDay;
        const totalCost = distanceCost + driverAllowance + tollParking;
        formik.setFieldValue("totalCost", totalCost.toFixed(2));
      }
    } else {
      // If transport is No, set total cost to 0
      formik.setFieldValue("totalCost", "0");
    }
  }, [
    formik.values.noOfDays,
    formik.values.ratePerKm,
    formik.values.kmPerDay,
    formik.values.driverAllowance,
    formik.values.tollParking,
    transport
  ]);

  // Auto-calculate noOfDays from cities
  useEffect(() => {
    if (cities && cities.length > 0 && transport !== "No") {
      const totalNights = cities.reduce((sum, city) => sum + (parseInt(city.nights) || 0), 0);
      const calculatedDays = totalNights + 1; // nights + 1 = days
      
      // Only set if not already manually set by user and no existing value from vehicleDetails
      if (!formik.values.noOfDays || formik.values.noOfDays === "") {
        formik.setFieldValue("noOfDays", calculatedDays);
      }
    }
  }, [cities, transport]);

  // Add client name to clients list if it's new
  useEffect(() => {
    if (clientName && !clients.includes(clientName)) {
      setClients((prev) => [...prev, clientName]);
    }
  }, [clientName]);

  // Handle dropdown change
  const handleClientChange = (event) => {
    if (event.target.value === "addNew") {
      setFieldType("client");
      setNewValue("");
      setOpenDialog(true);
    } else {
      formik.handleChange(event);
    }
  };

  const handleVehicleChange = (event) => {
    if (event.target.value === "addNew") {
      setFieldType("vehicle");
      setNewValue("");
      setOpenDialog(true);
    } else {
      formik.handleChange(event);
    }
  };

  const handleDialogSave = () => {
    if (newValue.trim() === "") return;
    if (fieldType === "client") {
      setClients((prev) => [...prev, newValue]);
      formik.setFieldValue("clientName", newValue);
    } else if (fieldType === "vehicle") {
      setVehicleTypes((prev) => [...prev, newValue]);
      formik.setFieldValue("vehicleType", newValue);
    }
    setOpenDialog(false);
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box sx={{ p: 3, maxWidth: 900, mx: "auto" }}>
        <form onSubmit={formik.handleSubmit}>
          <Typography variant="h6" gutterBottom>
            Vehicle Details
          </Typography>

          {transport === "No" && (
            <Paper sx={{ p: 2, mb: 2, backgroundColor: '#fff3cd' }}>
              <Typography variant="body2" color="text.secondary">
                <strong>Note:</strong> Transport is disabled as per previous selection. 
                Vehicle details are not required.
              </Typography>
            </Paper>
          )}

          {/* Basic Details */}
          <Box mb={2}>
            <Typography variant="subtitle1" fontWeight="bold">
              Basic Details
            </Typography>
            <Grid container spacing={2} mt={1}>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  select
                  label="Client Name"
                  name="clientName"
                  value={formik.values.clientName}
                  onChange={handleClientChange}
                  error={
                    formik.touched.clientName &&
                    Boolean(formik.errors.clientName)
                  }
                  helperText={
                    formik.touched.clientName && formik.errors.clientName
                  }
                  required
                >
                  {clients.map((client, idx) => (
                    <MenuItem key={idx} value={client}>
                      {client}
                    </MenuItem>
                  ))}
                  <MenuItem value="addNew">+ Add New</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  select
                  label="Vehicle Type"
                  name="vehicleType"
                  value={formik.values.vehicleType}
                  onChange={handleVehicleChange}
                  error={
                    formik.touched.vehicleType &&
                    Boolean(formik.errors.vehicleType)
                  }
                  helperText={
                    formik.touched.vehicleType && formik.errors.vehicleType
                  }
                  disabled={transport === "No"}
                  required
                >
                  {transport === "No" ? (
                    <MenuItem value="No Transport">No Transport</MenuItem>
                  ) : (
                    vehicleTypes.map((type, idx) => (
                      <MenuItem key={idx} value={type}>
                        {type}
                      </MenuItem>
                    ))
                  )}
                  {transport !== "No" && <MenuItem value="addNew">+ Add New</MenuItem>}
                </TextField>
                {transport === "No" && (
                  <Typography variant="caption" color="textSecondary">
                    Transport disabled as per previous selection
                  </Typography>
                )}
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  select
                  label="Trip Type"
                  name="tripType"
                  value={formik.values.tripType}
                  onChange={formik.handleChange}
                  required
                >
                  {tripTypes.map((type, idx) => (
                    <MenuItem key={idx} value={type}>
                      {type}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              
              {/* Only show these fields if transport is enabled */}
              {transport !== "No" && (
                <>
                  <Grid item xs={12} sm={4}>
                    <TextField
                      fullWidth
                      label="No Of Days"
                      name="noOfDays"
                      value={formik.values.noOfDays}
                      onChange={formik.handleChange}
                      type="number"
                      helperText="Automatically calculated from cities + 1"
                    />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <TextField
                      fullWidth
                      label="Rate Per Km"
                      name="ratePerKm"
                      value={formik.values.ratePerKm}
                      onChange={formik.handleChange}
                      type="number"
                    />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <TextField
                      fullWidth
                      label="Km Per Day"
                      name="kmPerDay"
                      value={formik.values.kmPerDay}
                      onChange={formik.handleChange}
                      type="number"
                    />
                  </Grid>
                </>
              )}
            </Grid>
          </Box>

          {/* Cost Details - Only show if transport is enabled */}
          {transport !== "No" && (
            <Box mb={2}>
              <Typography variant="subtitle1" fontWeight="bold">
                Cost Details
              </Typography>
              <Grid container spacing={2} mt={1}>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    label="Driver Allowance"
                    name="driverAllowance"
                    value={formik.values.driverAllowance}
                    onChange={formik.handleChange}
                    type="number"
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    label="Toll/Parking"
                    name="tollParking"
                    value={formik.values.tollParking}
                    onChange={formik.handleChange}
                    type="number"
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    label="Total Costing"
                    name="totalCost"
                    value={formik.values.totalCost}
                    onChange={formik.handleChange}
                    error={
                      formik.touched.totalCost &&
                      Boolean(formik.errors.totalCost)
                    }
                    helperText={
                      formik.touched.totalCost && formik.errors.totalCost
                    }
                    type="number"
                    required
                  />
                </Grid>
              </Grid>
            </Box>
          )}

          {/* Pickup/Drop Details */}
          <Box mb={2}>
            <Typography variant="subtitle1" fontWeight="bold">
              PickUp/Drop Details
            </Typography>
            <Grid container spacing={2} mt={1}>
              <Grid item xs={12} sm={4}>
                <DatePicker
                  label="Pickup Date"
                  value={formik.values.pickupDate}
                  onChange={(val) => formik.setFieldValue("pickupDate", val)}
                  renderInput={(params) => (
                    <TextField 
                      {...params} 
                      fullWidth 
                      error={formik.touched.pickupDate && Boolean(formik.errors.pickupDate)}
                      helperText={formik.touched.pickupDate && formik.errors.pickupDate}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TimePicker
                  label="Pickup Time"
                  value={formik.values.pickupTime}
                  onChange={(val) => formik.setFieldValue("pickupTime", val)}
                  renderInput={(params) => (
                    <TextField 
                      {...params} 
                      fullWidth 
                      error={formik.touched.pickupTime && Boolean(formik.errors.pickupTime)}
                      helperText={formik.touched.pickupTime && formik.errors.pickupTime}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="Pickup Location"
                  name="pickupLocation"
                  value={formik.values.pickupLocation}
                  onChange={formik.handleChange}
                  error={formik.touched.pickupLocation && Boolean(formik.errors.pickupLocation)}
                  helperText={formik.touched.pickupLocation && formik.errors.pickupLocation}
                />
              </Grid>

              <Grid item xs={12} sm={4}>
                <DatePicker
                  label="Drop Date"
                  value={formik.values.dropDate}
                  onChange={(val) => formik.setFieldValue("dropDate", val)}
                  renderInput={(params) => (
                    <TextField 
                      {...params} 
                      fullWidth 
                      error={formik.touched.dropDate && Boolean(formik.errors.dropDate)}
                      helperText={formik.touched.dropDate && formik.errors.dropDate}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TimePicker
                  label="Drop Time"
                  value={formik.values.dropTime}
                  onChange={(val) => formik.setFieldValue("dropTime", val)}
                  renderInput={(params) => (
                    <TextField 
                      {...params} 
                      fullWidth 
                      error={formik.touched.dropTime && Boolean(formik.errors.dropTime)}
                      helperText={formik.touched.dropTime && formik.errors.dropTime}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="Drop Location"
                  name="dropLocation"
                  value={formik.values.dropLocation}
                  onChange={formik.handleChange}
                  error={formik.touched.dropLocation && Boolean(formik.errors.dropLocation)}
                  helperText={formik.touched.dropLocation && formik.errors.dropLocation}
                />
              </Grid>
            </Grid>
          </Box>

          {/* Submit */}
          <Box textAlign="center" mt={2}>
            <Button 
              type="submit" 
              variant="contained" 
              color="primary"
              disabled={!formik.isValid}
              sx={{ px: 4, py: 1.5 }}
            >
              Save & Continue 
            </Button>
          </Box>
        </form>
      </Box>

      {/* Add New Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>
          Add New {fieldType === "client" ? "Client" : "Vehicle"}
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label={fieldType === "client" ? "Client Name" : "Vehicle Type"}
            fullWidth
            value={newValue}
            onChange={(e) => setNewValue(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleDialogSave}>
            Save & Add
          </Button>
        </DialogActions>
      </Dialog>
    </LocalizationProvider>
  );
};

export default CustomQuotationStep5;