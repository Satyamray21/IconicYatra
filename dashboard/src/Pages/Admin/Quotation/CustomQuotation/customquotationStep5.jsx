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

  const formik = useFormik({
    initialValues: {
      clientName: clientName || "",
      vehicleType: transport === "No" ? "No Transport" : "",
      tripType: "",
      noOfDays: "",
      ratePerKm: "",
      kmPerDay: "",
      driverAllowance: "",
      tollParking: "",
      totalCost: transport === "No" ? "0" : "",
      pickupDate: arrivalDate || null,
      pickupTime: null,
      pickupLocation: arrivalCity || "",
      dropDate: departureDate || null,
      dropTime: null,
      dropLocation: departureCity || "",
    },
    validationSchema: getValidationSchema(transport),
    onSubmit: (values) => {
      console.log("Step 5 Submitted:", values);
      onNext(values);
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
              <Grid size={{ xs: 12, sm: 4 }}>
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
              <Grid size={{ xs: 12, sm: 4 }}>
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
              <Grid size={{ xs: 12, sm: 4 }}>
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
                  <Grid size={{ xs: 12, sm: 4 }}>
                    <TextField
                      fullWidth
                      label="No Of Days"
                      name="noOfDays"
                      value={formik.values.noOfDays}
                      onChange={formik.handleChange}
                      type="number"
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 4 }}>
                    <TextField
                      fullWidth
                      label="Rate Per Km"
                      name="ratePerKm"
                      value={formik.values.ratePerKm}
                      onChange={formik.handleChange}
                      type="number"
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 4 }}>
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
                <Grid size={{ xs: 12, sm: 4 }}>
                  <TextField
                    fullWidth
                    label="Driver Allowance"
                    name="driverAllowance"
                    value={formik.values.driverAllowance}
                    onChange={formik.handleChange}
                    type="number"
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <TextField
                    fullWidth
                    label="Toll/Parking"
                    name="tollParking"
                    value={formik.values.tollParking}
                    onChange={formik.handleChange}
                    type="number"
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
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
              <Grid size={{ xs: 12, sm: 4 }}>
                <DatePicker
                  label="Pickup Date"
                  value={formik.values.pickupDate}
                  onChange={(val) => formik.setFieldValue("pickupDate", val)}
                  renderInput={(params) => <TextField {...params} fullWidth />}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <TimePicker
                  label="Pickup Time"
                  value={formik.values.pickupTime}
                  onChange={(val) => formik.setFieldValue("pickupTime", val)}
                  renderInput={(params) => <TextField {...params} fullWidth />}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <TextField
                  fullWidth
                  label="Pickup Location"
                  name="pickupLocation"
                  value={formik.values.pickupLocation}
                  onChange={formik.handleChange}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 4 }}>
                <DatePicker
                  label="Drop Date"
                  value={formik.values.dropDate}
                  onChange={(val) => formik.setFieldValue("dropDate", val)}
                  renderInput={(params) => <TextField {...params} fullWidth />}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <TimePicker
                  label="Drop Time"
                  value={formik.values.dropTime}
                  onChange={(val) => formik.setFieldValue("dropTime", val)}
                  renderInput={(params) => <TextField {...params} fullWidth />}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <TextField
                  fullWidth
                  label="Drop Location"
                  name="dropLocation"
                  value={formik.values.dropLocation}
                  onChange={formik.handleChange}
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