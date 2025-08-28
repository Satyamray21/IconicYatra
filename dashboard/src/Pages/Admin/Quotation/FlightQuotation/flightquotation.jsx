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
    onSubmit: (values) => {
      console.log("Form Submitted:", values);
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
    >
      <DialogTitle>Flight Quotation Preview</DialogTitle>
      <DialogContent>
        {previewData && (
          <Box>
            <Typography variant="h6" gutterBottom>
              Trip Type: {previewData.tripType}
            </Typography>

            <Typography variant="subtitle1" gutterBottom sx={{ mt: 2 }}>
              Client: {previewData.clientName}
            </Typography>

            <Typography variant="subtitle1" gutterBottom sx={{ mt: 2 }}>
              Flight Details:
            </Typography>
            <Typography variant="body2">From: {previewData.from}</Typography>
            <Typography variant="body2">To: {previewData.to}</Typography>
            <Typography variant="body2">
              Airline: {previewData.airline}
            </Typography>
            <Typography variant="body2">
              Flight No: {previewData.flightNo}
            </Typography>
            <Typography variant="body2">Fare: {previewData.fare}</Typography>

            {previewData.tripType !== "oneway" &&
              (console.log("here is my data", previewData),
              (
                <>
                  <Typography variant="subtitle1" gutterBottom sx={{ mt: 2 }}>
                    Return Flight Details:
                  </Typography>
                  <Typography variant="body2">
                    From: {previewData.returnfrom}
                  </Typography>
                  <Typography variant="body2">
                    To: {previewData.returnto}
                  </Typography>

                  <Typography variant="body2">
                    Airline: {previewData.returnairline}
                  </Typography>
                  <Typography variant="body2">
                    Flight No: {previewData.returnflightNo}
                  </Typography>
                  <Typography variant="body2">
                    Fare: {previewData.returnfare}
                  </Typography>
                </>
              ))}

            {previewData.additionalCities.length > 0 && (
              <>
                <Typography variant="subtitle1" gutterBottom sx={{ mt: 2 }}>
                  Additional Cities:
                </Typography>
                {previewData.additionalCities.map((city, index) => (
                  <Box key={index} sx={{ mb: 2 }}>
                    <Typography variant="body2">City {index + 1}:</Typography>
                    <Typography variant="body2">From: {city.from}</Typography>
                    <Typography variant="body2">To: {city.to}</Typography>
                    <Typography variant="body2">
                      Airline: {city.airline}
                    </Typography>
                    <Typography variant="body2">
                      Flight No: {city.flightNo}
                    </Typography>
                    <Typography variant="body2">Fare: {city.fare}</Typography>
                  </Box>
                ))}
              </>
            )}

            <Typography variant="subtitle1" gutterBottom sx={{ mt: 2 }}>
              Passengers:
            </Typography>
            <Typography variant="body2">
              Adults: {previewData.adults}, Children: {previewData.childs},
              Infants: {previewData.infants}
            </Typography>

            {previewData.message && (
              <>
                <Typography variant="subtitle1" gutterBottom sx={{ mt: 2 }}>
                  Message:
                </Typography>
                <Typography variant="body2">{previewData.message}</Typography>
              </>
            )}

            <Typography variant="subtitle1" gutterBottom sx={{ mt: 2 }}>
              Personal Details:
            </Typography>
            <Typography variant="body2">
              Name: {previewData.fullName}
            </Typography>
            <Typography variant="body2">
              Mobile: {previewData.mobile}
            </Typography>
            <Typography variant="body2">Email: {previewData.email}</Typography>
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setPreviewOpen(false)}>Close</Button>
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
            fullWidth
            select
            label="Client Name"
            name="clientName"
            value={formik.values.clientName}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={
              formik.touched.clientName && Boolean(formik.errors.clientName)
            }
            helperText={formik.touched.clientName && formik.errors.clientName}
            margin="normal"
          >
            {[1, 2].map((num) => (
              <MenuItem key={num} value={`client${num}`}>
                Client {num}
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
