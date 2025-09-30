import React, { useState } from "react";
import {
  Box,
  Button,
  Grid,
  MenuItem,
  Paper,
  Radio,
  RadioGroup,
  FormControlLabel,
  TextField,
  Typography,
} from "@mui/material";
import { useFormik } from "formik";
import * as Yup from "yup";
import { LocalizationProvider, DatePicker } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import CustomQuotationStep4 from "./customquotationStep4";

const cities = ["Delhi", "Mumbai", "Bangalore", "Kolkata"];

const TourDetailsForm = () => {
  const [showStep4, setShowStep4] = useState(false);

  const formik = useFormik({
    initialValues: {
      arrivalCity: "",
      departureCity: "",
      quotationTitle: "",
      notes:
        "This is only tentative schedule for sightseeing and travel. Actual sightseeing may get affected due to weather, road conditions, local authority notices, shortage of timing, or off days.",
      bannerImage: null,
      transport: "Yes",
      validFrom: null,
      validTill: null,
      arrivalDate: null,
      departureDate: null,
    },
    validationSchema: Yup.object({
      arrivalCity: Yup.string().required("Arrival City is required"),
      departureCity: Yup.string().required("Departure City is required"),
      quotationTitle: Yup.string().required("Quotation Title is required"),
      notes: Yup.string().max(300, "Max 300 characters allowed"),
      bannerImage: Yup.mixed().nullable(),
      transport: Yup.string().required("Transport is required"),
      validFrom: Yup.date().nullable().required("Valid From is required"),
      validTill: Yup.date().nullable().required("Valid Till is required"),
      arrivalDate: Yup.date().nullable().required("Arrival Date is required"),
      departureDate: Yup.date().nullable(),
    }),
    onSubmit: (values) => {
      console.log("Step 3 Submitted:", values);
      setShowStep4(true); // open Step 4 form
    },
  });

  if (showStep4) {
    return <CustomQuotationStep4 />;
  }

  return (
    <Paper sx={{ p: 3, maxWidth: 900, mx: "auto" }}>
      <Typography variant="h6" fontWeight="bold" gutterBottom>
        Tour Details
      </Typography>

      <form onSubmit={formik.handleSubmit}>
        <Grid container spacing={2}>
          {/* Arrival City */}
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              select
              fullWidth
              label="Arrival City"
              name="arrivalCity"
              value={formik.values.arrivalCity}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={
                formik.touched.arrivalCity && Boolean(formik.errors.arrivalCity)
              }
              helperText={
                formik.touched.arrivalCity && formik.errors.arrivalCity
              }
            >
              {cities.map((city) => (
                <MenuItem key={city} value={city}>
                  {city}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          {/* Departure City */}
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              select
              fullWidth
              label="Departure City"
              name="departureCity"
              value={formik.values.departureCity}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={
                formik.touched.departureCity &&
                Boolean(formik.errors.departureCity)
              }
              helperText={
                formik.touched.departureCity && formik.errors.departureCity
              }
            >
              {cities.map((city) => (
                <MenuItem key={city} value={city}>
                  {city}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          {/* Quotation Title */}
          <Grid size={{ xs: 12 }}>
            <TextField
              fullWidth
              label="Quotation Title"
              name="quotationTitle"
              value={formik.values.quotationTitle}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={
                formik.touched.quotationTitle &&
                Boolean(formik.errors.quotationTitle)
              }
              helperText={
                formik.touched.quotationTitle && formik.errors.quotationTitle
              }
            />
          </Grid>

          {/* Notes */}
          <Grid size={{ xs: 12 }}>
            <TextField
              fullWidth
              multiline
              rows={3}
              label="Initial Notes"
              name="notes"
              value={formik.values.notes}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.notes && Boolean(formik.errors.notes)}
              helperText={`${formik.values.notes.length}/300`}
            />
          </Grid>

          {/* Banner Image */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Typography>
              Banner Image (For best view - 860px X 400px)
            </Typography>
            <Button variant="outlined" component="label" fullWidth>
              Choose File
              <input
                hidden
                type="file"
                accept="image/*"
                name="bannerImage"
                onChange={(e) =>
                  formik.setFieldValue("bannerImage", e.currentTarget.files[0])
                }
              />
            </Button>
            {formik.values.bannerImage && (
              <Typography variant="body2" mt={1}>
                {formik.values.bannerImage.name}
              </Typography>
            )}
          </Grid>

          {/* Transport */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Typography variant="subtitle1">Transport</Typography>
            <RadioGroup
              row
              name="transport"
              value={formik.values.transport}
              onChange={formik.handleChange}
            >
              <FormControlLabel value="Yes" control={<Radio />} label="Yes" />
              <FormControlLabel value="No" control={<Radio />} label="No" />
            </RadioGroup>
          </Grid>

          {/* Dates */}
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <Grid size={{ xs: 12, md: 6 }}>
              <DatePicker
                label="Valid From"
                value={formik.values.validFrom}
                onChange={(date) => formik.setFieldValue("validFrom", date)}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    fullWidth
                    error={
                      formik.touched.validFrom &&
                      Boolean(formik.errors.validFrom)
                    }
                    helperText={
                      formik.touched.validFrom && formik.errors.validFrom
                    }
                  />
                )}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <DatePicker
                label="Valid Till"
                value={formik.values.validTill}
                onChange={(date) => formik.setFieldValue("validTill", date)}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    fullWidth
                    error={
                      formik.touched.validTill &&
                      Boolean(formik.errors.validTill)
                    }
                    helperText={
                      formik.touched.validTill && formik.errors.validTill
                    }
                  />
                )}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <DatePicker
                label="Arrival Date"
                value={formik.values.arrivalDate}
                onChange={(date) => formik.setFieldValue("arrivalDate", date)}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    fullWidth
                    error={
                      formik.touched.arrivalDate &&
                      Boolean(formik.errors.arrivalDate)
                    }
                    helperText={
                      formik.touched.arrivalDate && formik.errors.arrivalDate
                    }
                  />
                )}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <DatePicker
                label="Departure Date"
                value={formik.values.departureDate}
                onChange={(date) => formik.setFieldValue("departureDate", date)}
                renderInput={(params) => <TextField {...params} fullWidth />}
              />
            </Grid>
          </LocalizationProvider>

          <Grid container>
            <Grid size={{ xs: 12 }} textAlign="center">
              <Button type="submit" variant="contained" color="primary">
                Save & Continue
              </Button>
            </Grid>
          </Grid>
        </Grid>
      </form>
    </Paper>
  );
};

export default TourDetailsForm;
