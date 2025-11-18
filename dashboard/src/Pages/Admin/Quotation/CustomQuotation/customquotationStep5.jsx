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

// TIME HELPERS ======================
const formatTimeForDisplay = (timeString) => {
  if (!timeString) return null;
  try {
    if (timeString instanceof Date) return timeString;
    if (typeof timeString === "string" && timeString.includes(":")) {
      const [h, m] = timeString.split(":");
      return new Date(1970, 0, 1, Number(h), Number(m));
    }
    return null;
  } catch {
    return null;
  }
};

const formatTimeForSubmit = (date) => {
  if (!date) return "12:00";
  return `${String(date.getHours()).padStart(2, "0")}:${String(
    date.getMinutes()
  ).padStart(2, "0")}`;
};

// VALIDATION ==========================
const getValidationSchema = (transport) =>
  Yup.object({
    clientName: Yup.string().required("Required"),
    vehicleType:
      transport === "No"
        ? Yup.string().notRequired()
        : Yup.string().required("Vehicle Type is required"),
    tripType: Yup.string().required("Trip Type is required"),
  });

// TRIP TYPES ==========================
const tripTypes = ["One Way", "Round Trip"];

// =======================================================
const CustomQuotationStep5 = ({
  clientName,
  arrivalCity,
  departureCity,
  arrivalDate,
  departureDate,
  transport,
  cities,
  vehicleDetails,
  onNext,
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

  // ====================== FORMIK ============================
  const formik = useFormik({
    initialValues: {
      clientName: clientName || "",

      // FIX: vehicle type is now selectable properly
      vehicleType:
        transport === "No"
          ? "No Transport"
          : vehicleDetails?.basicsDetails?.vehicleType || "",

      tripType: vehicleDetails?.basicsDetails?.tripType || "",

      noOfDays: vehicleDetails?.basicsDetails?.noOfDays || "",

      perDayCost: vehicleDetails?.costDetails?.perDayCost || "",
      ratePerKm: vehicleDetails?.costDetails?.ratePerKm || "",
      kmPerDay: vehicleDetails?.costDetails?.kmPerDay || "",
      driverAllowance: vehicleDetails?.costDetails?.driverAllowance || "",
      tollParking: vehicleDetails?.costDetails?.tollParking || "",
      totalCost: vehicleDetails?.costDetails?.totalCost || "0",

      pickupDate: vehicleDetails?.pickupDropDetails?.pickupDate
        ? new Date(vehicleDetails.pickupDropDetails.pickupDate)
        : arrivalDate
        ? new Date(arrivalDate)
        : null,

      pickupTime: vehicleDetails?.pickupDropDetails?.pickupTime
        ? formatTimeForDisplay(vehicleDetails.pickupDropDetails.pickupTime)
        : null,

      pickupLocation:
        vehicleDetails?.pickupDropDetails?.pickupLocation ||
        arrivalCity ||
        "",

      dropDate: vehicleDetails?.pickupDropDetails?.dropDate
        ? new Date(vehicleDetails.pickupDropDetails.dropDate)
        : departureDate
        ? new Date(departureDate)
        : null,

      dropTime: vehicleDetails?.pickupDropDetails?.dropTime
        ? formatTimeForDisplay(vehicleDetails.pickupDropDetails.dropTime)
        : null,

      dropLocation:
        vehicleDetails?.pickupDropDetails?.dropLocation ||
        departureCity ||
        "",
    },

    validationSchema: getValidationSchema(transport),

    onSubmit: (values) => {
      const formattedData = {
        basicsDetails: {
          clientName: values.clientName,
          vehicleType: values.vehicleType,
          tripType: values.tripType,
          noOfDays: values.noOfDays,
          perDayCost: values.perDayCost,
        },
        costDetails: {
          perDayCost: values.perDayCost,
          ratePerKm: values.ratePerKm,
          kmPerDay: values.kmPerDay,
          driverAllowance: values.driverAllowance,
          tollParking: values.tollParking,
          totalCost: values.totalCost,
        },
        pickupDropDetails: {
          pickupDate: values.pickupDate
            ? values.pickupDate.toISOString()
            : null,
          pickupTime: formatTimeForSubmit(values.pickupTime),
          pickupLocation: values.pickupLocation,

          dropDate: values.dropDate ? values.dropDate.toISOString() : null,
          dropTime: formatTimeForSubmit(values.dropTime),
          dropLocation: values.dropLocation,
        },
      };

      onNext(formattedData);
    },
    enableReinitialize: true,
  });

  // ======================================
  // FIX 2: AUTO CALC NO OF DAYS FROM PICKUP + DROP DATE
  // ======================================
  useEffect(() => {
    const { pickupDate, dropDate } = formik.values;

    if (pickupDate && dropDate) {
      const diffTime = dropDate - pickupDate;
      const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

      if (!isNaN(days) && days > 0) {
        formik.setFieldValue("noOfDays", days);
      }
    }
  }, [formik.values.pickupDate, formik.values.dropDate]);

  // ================= CALC TOTAL COST ========================
  useEffect(() => {
    if (transport === "No") {
      formik.setFieldValue("totalCost", "0");
      return;
    }

    const noOfDays = parseFloat(formik.values.noOfDays) || 0;
    const perDayCost = parseFloat(formik.values.perDayCost) || 0;
    const ratePerKm = parseFloat(formik.values.ratePerKm) || 0;
    const kmPerDay = parseFloat(formik.values.kmPerDay) || 0;
    const driverAllowance = parseFloat(formik.values.driverAllowance) || 0;
    const tollParking = parseFloat(formik.values.tollParking) || 0;

    let total = 0;

    if (perDayCost > 0 && noOfDays > 0) {
      total = perDayCost * noOfDays + driverAllowance + tollParking;
    } else if (ratePerKm > 0 && kmPerDay > 0 && noOfDays > 0) {
      total = ratePerKm * kmPerDay * noOfDays + driverAllowance + tollParking;
    }

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

  // ADD CLIENT AUTO
  useEffect(() => {
    if (clientName && !clients.includes(clientName)) {
      setClients((prev) => [...prev, clientName]);
    }
  }, [clientName]);

  // ===================== UI ================================
  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box sx={{ p: 3, maxWidth: 900, mx: "auto" }}>
        <form onSubmit={formik.handleSubmit}>
          <Typography variant="h6">Vehicle Details</Typography>

          {/* BASIC */}
          <Box mt={2}>
            <Grid container spacing={2}>
              {/* CLIENT NAME */}
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  select
                  label="Client Name"
                  name="clientName"
                  value={formik.values.clientName}
                  onChange={(e) => {
                    if (e.target.value === "addNew") {
                      setFieldType("client");
                      setOpenDialog(true);
                    } else formik.handleChange(e);
                  }}
                  required
                >
                  {clients.map((c, i) => (
                    <MenuItem key={i} value={c}>
                      {c}
                    </MenuItem>
                  ))}
                  <MenuItem value="addNew">+ Add New</MenuItem>
                </TextField>
              </Grid>

              {/* VEHICLE TYPE (FIXED) */}
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  select
                  label="Vehicle Type"
                  name="vehicleType"
                  disabled={transport === "No"}
                  value={formik.values.vehicleType}
                  onChange={(e) => {
                    if (e.target.value === "addNew") {
                      setFieldType("vehicle");
                      setOpenDialog(true);
                    } else formik.handleChange(e);
                  }}
                  required={transport !== "No"}
                >
                  {transport === "No" ? (
                    <MenuItem value="No Transport">No Transport</MenuItem>
                  ) : (
                    <>
                      {vehicleTypes.map((v, i) => (
                        <MenuItem key={i} value={v}>
                          {v}
                        </MenuItem>
                      ))}
                      <MenuItem value="addNew">+ Add New</MenuItem>
                    </>
                  )}
                </TextField>
              </Grid>

              {/* TRIP TYPE */}
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  select
                  label="Trip Type"
                  name="tripType"
                  value={formik.values.tripType}
                  onChange={formik.handleChange}
                >
                  {tripTypes.map((t, i) => (
                    <MenuItem key={i} value={t}>
                      {t}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              {/* NO OF DAYS (AUTO) */}
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="No of Days"
                  name="noOfDays"
                  type="number"
                  value={formik.values.noOfDays}
                  onChange={formik.handleChange}
                />
              </Grid>

              {/* PER DAY COST */}
              {transport !== "No" && (
                <>
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
                      label="Rate Per KM"
                      name="ratePerKm"
                      type="number"
                      value={formik.values.ratePerKm}
                      onChange={formik.handleChange}
                    />
                  </Grid>

                  <Grid item xs={12} sm={4}>
                    <TextField
                      fullWidth
                      label="KM Per Day"
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

          {/* COST SECTION */}
          {transport !== "No" && (
            <Box mt={3}>
              <Typography fontWeight="bold">Cost Details</Typography>
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
                    label="Toll / Parking"
                    name="tollParking"
                    type="number"
                    value={formik.values.tollParking}
                    onChange={formik.handleChange}
                  />
                </Grid>

                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    label="Total Cost"
                    name="totalCost"
                    type="number"
                    value={formik.values.totalCost}
                    onChange={formik.handleChange}
                  />
                </Grid>
              </Grid>
            </Box>
          )}

          {/* PICKUP / DROP SECTION */}
          <Box mt={3}>
            <Typography fontWeight="bold">Pickup / Drop Details</Typography>
            <Grid container spacing={2} mt={1}>
              {/* PICKUP */}
              <Grid item xs={12} sm={4}>
                <DatePicker
                  label="Pickup Date"
                  value={formik.values.pickupDate}
                  onChange={(v) => formik.setFieldValue("pickupDate", v)}
                  renderInput={(p) => <TextField fullWidth {...p} />}
                />
              </Grid>

              <Grid item xs={12} sm={4}>
                <TimePicker
                  label="Pickup Time"
                  value={formik.values.pickupTime}
                  onChange={(v) => formik.setFieldValue("pickupTime", v)}
                  renderInput={(p) => <TextField fullWidth {...p} />}
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

              {/* DROP */}
              <Grid item xs={12} sm={4}>
                <DatePicker
                  label="Drop Date"
                  value={formik.values.dropDate}
                  onChange={(v) => formik.setFieldValue("dropDate", v)}
                  renderInput={(p) => <TextField fullWidth {...p} />}
                />
              </Grid>

              <Grid item xs={12} sm={4}>
                <TimePicker
                  label="Drop Time"
                  value={formik.values.dropTime}
                  onChange={(v) => formik.setFieldValue("dropTime", v)}
                  renderInput={(p) => <TextField fullWidth {...p} />}
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

          <Box textAlign="center" mt={3}>
            <Button type="submit" variant="contained">
              Save & Continue
            </Button>
          </Box>
        </form>
      </Box>

      {/* ADD NEW DIALOG */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>
          Add New {fieldType === "client" ? "Client" : "Vehicle"}
        </DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            autoFocus
            margin="dense"
            label={
              fieldType === "client" ? "Client Name" : "Vehicle Type Name"
            }
            value={newValue}
            onChange={(e) => setNewValue(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={() => {
              if (!newValue.trim()) return;
              if (fieldType === "client") {
                setClients((prev) => [...prev, newValue]);
                formik.setFieldValue("clientName", newValue);
              } else {
                setVehicleTypes((prev) => [...prev, newValue]);
                formik.setFieldValue("vehicleType", newValue);
              }
              setOpenDialog(false);
            }}
          >
            Save & Add
          </Button>
        </DialogActions>
      </Dialog>
    </LocalizationProvider>
  );
};

export default CustomQuotationStep5;
