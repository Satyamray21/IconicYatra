import React, { useState, useEffect } from "react";
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
import { getAllLeads } from "../../../../features/leads/leadSlice";
import { useDispatch, useSelector } from "react-redux";

import CustomQuotationStep4 from "./customquotationStep4";

const TourDetailsForm = ({ clientName, sector,cities,onNext }) => {
  console.log("Step 3 - Received cities:", cities);
    console.log("🔍 Step 3 - Received cities prop:", cities);
  console.log("🔍 Step 3 - cities type:", typeof cities);
  console.log("🔍 Step 3 - cities length:", cities ? cities.length : 0);
  const [showStep4, setShowStep4] = useState(false);
  const [selectedLead, setSelectedLead] = useState(null);
  const [initialValuesSet, setInitialValuesSet] = useState(false);
  const dispatch = useDispatch();
  const { list: leadList = [] } = useSelector((state) => state.leads);
  
  useEffect(() => {
    dispatch(getAllLeads());
  }, [dispatch]);

  // Find matching lead
  useEffect(() => {
    const lead = leadList.find((lead) => {
      const nameMatch = lead.personalDetails?.fullName?.trim().toLowerCase() === clientName?.trim().toLowerCase();
      
      const sectorMatch = 
        lead.tourDetails?.tourDestination?.trim().toLowerCase() === sector?.trim().toLowerCase() ||
        lead.location?.state?.trim().toLowerCase() === sector?.trim().toLowerCase();
      
      return nameMatch && sectorMatch;
    });

    setSelectedLead(lead || null);
  }, [clientName, sector, leadList]);

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      arrivalCity: "",
      departureCity: "",
      arrivalDate: null,
      departureDate: null,
      quotationTitle: "",
      notes: "This is only tentative schedule for sightseeing and travel. Actual sightseeing may get affected due to weather, road conditions, local authority notices, shortage of timing, or off days.",
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
  const step3Data = {
    ...values,
    quotationDetails: {
      adults: 1,
      children: 0,
      kids: 0,
      infants: 0,
      mealPlan: "N/A",
      destinations: [], // optional, can populate later
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
  };

  console.log("Step 3 Submitted:", step3Data);
  onNext(step3Data);
},

  });

  // Auto-fill from lead data only once when lead is found
  useEffect(() => {
  if (selectedLead && !initialValuesSet) {
    const leadData = selectedLead.tourDetails?.pickupDrop;
    if (leadData) {
      formik.setValues({
        ...formik.values,
        arrivalCity: leadData.arrivalCity || "",
        departureCity: leadData.departureCity || "",
        arrivalDate: leadData.arrivalDate ? new Date(leadData.arrivalDate) : null,
        departureDate: leadData.departureDate ? new Date(leadData.departureDate) : null,
        transport: selectedLead.tourDetails?.accommodation?.transport === false ? "No" : "Yes"
      });
      setInitialValuesSet(true);
    }
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
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              label="Arrival City"
              name="arrivalCity"
              value={formik.values.arrivalCity || ""}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.arrivalCity && Boolean(formik.errors.arrivalCity)}
              helperText={formik.touched.arrivalCity && formik.errors.arrivalCity}
            />
          </Grid>

          {/* Departure City */}
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              label="Departure City"
              name="departureCity"
              value={formik.values.departureCity || ""}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.departureCity && Boolean(formik.errors.departureCity)}
              helperText={formik.touched.departureCity && formik.errors.departureCity}
            />
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
           // In the transport RadioGroup section, ensure it uses "Yes"/"No" values:
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