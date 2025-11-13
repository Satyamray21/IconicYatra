import React, { useState, useEffect } from "react";
import {
  Box,
  Grid,
  Typography,
  TextField,
  Button,
  MenuItem,
  Paper,
} from "@mui/material";
import {
  DatePicker,
  TimePicker,
  LocalizationProvider,
} from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { useFormik } from "formik";
import * as Yup from "yup";

const tripTypes = ["One Way", "Round Trip"];
const vehicleTypesDefault = ["Sedan", "SUV", "Bus", "Tempo Traveller"];

// Validation schema
const getValidationSchema = (transport) =>
  Yup.object({
    clientName: Yup.string().required("Client Name is required"),
    vehicleType: Yup.string().required("Vehicle Type is required"),
    tripType: Yup.string().required("Trip Type is required"),
    perDayCost:
      transport === "No"
        ? Yup.number().notRequired()
        : Yup.number()
            .typeError("Must be a number")
            .min(0, "Must be positive")
            .nullable(),
    ratePerKm:
      transport === "No"
        ? Yup.number().notRequired()
        : Yup.number()
            .typeError("Must be a number")
            .min(0, "Must be positive")
            .nullable(),
    totalCost:
      transport === "No"
        ? Yup.number().nullable()
        : Yup.number()
            .typeError("Total Cost must be a number")
            .required("Total Cost is required"),
  });

const CustomQuotationStep5 = ({
  clientName,
  arrivalCity,
  departureCity,
  arrivalDate,
  departureDate,
  transport,
  nights,
  onNext,
}) => {
  const [vehicleTypes] = useState(vehicleTypesDefault);

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      clientName: clientName || "",
      vehicleType: transport === "No" ? "No Transport" : "",
      tripType: "",
      noOfDays: nights ? nights + 1 : "",
      perDayCost: "",
      ratePerKm: "",
      kmPerDay: "",
      driverAllowance: "",
      tollParking: "",
      totalCost: transport === "No" ? 0 : "",
      pickupDate: arrivalDate || null,
      pickupTime: null,
      pickupLocation: arrivalCity || "",
      dropDate: departureDate || null,
      dropTime: null,
      dropLocation: departureCity || "",
    },
    validationSchema: getValidationSchema(transport),
    onSubmit: (values) => {
      onNext(values);
    },
  });

  // Auto-calculate noOfDays based on pickup/drop dates
  useEffect(() => {
    if (formik.values.pickupDate && formik.values.dropDate) {
      const start = new Date(formik.values.pickupDate);
      const end = new Date(formik.values.dropDate);
      const diffDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
      formik.setFieldValue("noOfDays", diffDays > 0 ? diffDays : 1);
    }
  }, [formik.values.pickupDate, formik.values.dropDate]);

  // Auto-calculate totalCost
  useEffect(() => {
    if (transport === "No") {
      formik.setFieldValue("totalCost", 0);
      return;
    }

    const {
      perDayCost,
      noOfDays,
      ratePerKm,
      kmPerDay,
      driverAllowance,
      tollParking,
    } = formik.values;

    let total = 0;
    const days = parseFloat(noOfDays) || 0;

    if (perDayCost && perDayCost > 0) total += perDayCost * days;
    else if (ratePerKm && kmPerDay) total += ratePerKm * kmPerDay * days;

    total += parseFloat(driverAllowance || 0) + parseFloat(tollParking || 0);

    formik.setFieldValue("totalCost", total.toFixed(2));
  }, [
    formik.values.noOfDays,
    formik.values.perDayCost,
    formik.values.ratePerKm,
    formik.values.kmPerDay,
    formik.values.driverAllowance,
    formik.values.tollParking,
    transport,
  ]);

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box sx={{ p: 3, maxWidth: 900, mx: "auto" }}>
        <form onSubmit={formik.handleSubmit}>
          <Typography variant="h6" gutterBottom>
            Vehicle Details
          </Typography>

          {transport === "No" && (
            <Paper sx={{ p: 2, mb: 2, backgroundColor: "#fff3cd" }}>
              <Typography variant="body2" color="text.secondary">
                <strong>Note:</strong> Transport is disabled. Vehicle details
                are not required.
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
                  label="Client Name"
                  name="clientName"
                  value={formik.values.clientName}
                  disabled
                />
              </Grid>

              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  select
                  label="Vehicle Type"
                  name="vehicleType"
                  value={formik.values.vehicleType}
                  onChange={formik.handleChange}
                  disabled={transport === "No"}
                >
                  {transport === "No" ? (
                    <MenuItem value="No Transport">No Transport</MenuItem>
                  ) : (
                    vehicleTypes.map((type) => (
                      <MenuItem key={type} value={type}>
                        {type}
                      </MenuItem>
                    ))
                  )}
                </TextField>
              </Grid>

              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  select
                  label="Trip Type"
                  name="tripType"
                  value={formik.values.tripType}
                  onChange={formik.handleChange}
                >
                  {tripTypes.map((type) => (
                    <MenuItem key={type} value={type}>
                      {type}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              {transport !== "No" && (
                <>
                  <Grid item xs={12} sm={4}>
                    <TextField
                      fullWidth
                      label="No of Days"
                      name="noOfDays"
                      value={formik.values.noOfDays}
                      disabled
                    />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <TextField
                      fullWidth
                      label="Per Day Cost"
                      name="perDayCost"
                      type="number"
                      value={formik.values.perDayCost}
                      onChange={formik.handleChange}
                    />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <TextField
                      fullWidth
                      label="Rate per Km"
                      name="ratePerKm"
                      type="number"
                      value={formik.values.ratePerKm}
                      onChange={formik.handleChange}
                    />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <TextField
                      fullWidth
                      label="Km per Day"
                      name="kmPerDay"
                      type="number"
                      value={formik.values.kmPerDay}
                      onChange={formik.handleChange}
                    />
                  </Grid>
                </>
              )}
            </Grid>
          </Box>

          {/* Cost Details */}
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
                    type="number"
                    value={formik.values.driverAllowance}
                    onChange={formik.handleChange}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    label="Toll/Parking"
                    name="tollParking"
                    type="number"
                    value={formik.values.tollParking}
                    onChange={formik.handleChange}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    label="Total Costing"
                    name="totalCost"
                    type="number"
                    value={formik.values.totalCost}
                    disabled={transport !== "No"}
                  />
                </Grid>
              </Grid>
            </Box>
          )}

          {/* Pickup/Drop */}
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
                  renderInput={(params) => <TextField fullWidth {...params} />}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TimePicker
                  label="Pickup Time"
                  value={formik.values.pickupTime}
                  onChange={(val) => formik.setFieldValue("pickupTime", val)}
                  renderInput={(params) => <TextField fullWidth {...params} />}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="Pickup Location"
                  name="pickupLocation"
                  value={formik.values.pickupLocation}
                  onChange={formik.handleChange}
                />
              </Grid>

              <Grid item xs={12} sm={4}>
                <DatePicker
                  label="Drop Date"
                  value={formik.values.dropDate}
                  onChange={(val) => formik.setFieldValue("dropDate", val)}
                  renderInput={(params) => <TextField fullWidth {...params} />}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TimePicker
                  label="Drop Time"
                  value={formik.values.dropTime}
                  onChange={(val) => formik.setFieldValue("dropTime", val)}
                  renderInput={(params) => <TextField fullWidth {...params} />}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
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

          <Box textAlign="center" mt={2}>
            <Button type="submit" variant="contained" color="primary">
              Save & Continue
            </Button>
          </Box>
        </form>
      </Box>
    </LocalizationProvider>
  );
};

export default CustomQuotationStep5;
