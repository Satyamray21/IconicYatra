import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Grid,
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
import { useDispatch, useSelector } from "react-redux";

const TourDetailsForm = ({ clientName, sector, quotationId, onNext }) => {
  const [selectedLead, setSelectedLead] = useState(null);
  const [initialValuesSet, setInitialValuesSet] = useState(false);
  const dispatch = useDispatch();
  const { list: leadList = [] } = useSelector((state) => state.leads);

  // Find matching lead
  const findMatchingLead = (clientName, sector) => {
    if (!clientName || !sector) return null;
    const sectorLower = sector.trim().toLowerCase();
    return leadList.find((lead) => {
      const nameMatch =
        lead.personalDetails?.fullName?.trim().toLowerCase() ===
        clientName.trim().toLowerCase();

      const tourDestinations = lead.tourDetails?.tourDestination;
      const sectorMatch =
        (Array.isArray(tourDestinations)
          ? tourDestinations.some(
              (dest) => dest?.trim().toLowerCase() === sectorLower
            )
          : tourDestinations?.trim()?.toLowerCase() === sectorLower) ||
        lead.location?.state?.trim().toLowerCase() === sectorLower;

      return nameMatch && sectorMatch;
    });
  };

  useEffect(() => {
    const matched = findMatchingLead(clientName, sector);
    if (matched) setSelectedLead(matched);
  }, [clientName, sector, leadList]);

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      arrivalCity: "",
      departureCity: "",
      arrivalDate: null,
      departureDate: null,
      quotationTitle: "",
      notes:
        "This is only tentative schedule for sightseeing and travel. Actual sightseeing may get affected due to weather, road conditions, local authority notices, shortage of timing, or off days.",
      bannerImage: null,
      transport: "Yes",
      validFrom: null,
      validTill: null,
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
      const formData = new FormData();
      formData.append("quotationId", quotationId);
      formData.append("stepNumber", 3);
      formData.append(
        "stepData",
        JSON.stringify({
          ...values,
          quotationDetails: {
            adults: 1,
            children: 0,
            kids: 0,
            infants: 0,
            mealPlan: "N/A",
            destinations: [],
            rooms: {
              numberOfRooms: 1,
              roomType: "Standard",
              sharingType: "Single",
              showCostPerAdult: false,
            },
            companyMargin: { marginPercent: 0, marginAmount: 0 },
            discount: 0,
            taxes: { gstOn: "None", applyGST: false },
            signatureDetails: { regardsText: "Best Regards", signedBy: "" },
          },
        })
      );

      if (values.bannerImage) {
        formData.append("bannerImage", values.bannerImage);
      }

      onNext(formData);
    },
  });

  // Auto-fill from lead data
  useEffect(() => {
    if (selectedLead && !initialValuesSet) {
      const leadData = selectedLead.tourDetails?.pickupDrop || {};
      formik.setValues((prev) => ({
        ...prev,
        arrivalCity: leadData.arrivalCity || prev.arrivalCity,
        departureCity: leadData.departureCity || prev.departureCity,
        arrivalDate: leadData.arrivalDate
          ? new Date(leadData.arrivalDate)
          : prev.arrivalDate,
        departureDate: leadData.departureDate
          ? new Date(leadData.departureDate)
          : prev.departureDate,
        transport:
          selectedLead.tourDetails?.accommodation?.transport === false
            ? "No"
            : "Yes",
      }));
      setInitialValuesSet(true);
    }
  }, [selectedLead, initialValuesSet]);

  return (
    <Paper sx={{ p: 3, maxWidth: 900, mx: "auto" }}>
      <Typography variant="h6" fontWeight="bold" gutterBottom>
        Tour Details
      </Typography>

      <form onSubmit={formik.handleSubmit}>
        <Grid container spacing={2}>
          {/* Arrival City */}
          <Grid item xs={12} md={6}>
            <TextField
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
            />
          </Grid>

          {/* Departure City */}
          <Grid item xs={12} md={6}>
            <TextField
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
            />
          </Grid>

          {/* Quotation Title */}
          <Grid item xs={12}>
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
          <Grid item xs={12}>
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
          <Grid item xs={12} md={6}>
            <Typography>Banner Image (860px X 400px)</Typography>
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
          <Grid item xs={12} md={6}>
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
            <Grid item xs={12} md={6}>
              <DatePicker
                label="Valid From"
                value={formik.values.validFrom}
                onChange={(date) => formik.setFieldValue("validFrom", date)}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    fullWidth
                    error={
                      formik.touched.validFrom && Boolean(formik.errors.validFrom)
                    }
                    helperText={
                      formik.touched.validFrom && formik.errors.validFrom
                    }
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <DatePicker
                label="Valid Till"
                value={formik.values.validTill}
                onChange={(date) => formik.setFieldValue("validTill", date)}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    fullWidth
                    error={
                      formik.touched.validTill && Boolean(formik.errors.validTill)
                    }
                    helperText={
                      formik.touched.validTill && formik.errors.validTill
                    }
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} md={6}>
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

            <Grid item xs={12} md={6}>
              <DatePicker
                label="Departure Date"
                value={formik.values.departureDate}
                onChange={(date) => formik.setFieldValue("departureDate", date)}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    fullWidth
                    error={
                      formik.touched.departureDate &&
                      Boolean(formik.errors.departureDate)
                    }
                    helperText={
                      formik.touched.departureDate &&
                      formik.errors.departureDate
                    }
                  />
                )}
              />
            </Grid>
          </LocalizationProvider>

          <Grid item xs={12} textAlign="center" mt={2}>
            <Button type="submit" variant="contained" color="primary">
              Save & Continue
            </Button>
          </Grid>
        </Grid>
      </form>
    </Paper>
  );
};

export default TourDetailsForm;
