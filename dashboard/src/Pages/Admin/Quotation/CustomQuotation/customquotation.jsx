import React, { useState,useEffect } from "react";
import {
  Box,
  Button,
  Grid,
  MenuItem,
  TextField,
  Typography,
  RadioGroup,
  FormControlLabel,
  Radio,
  Paper,
  IconButton,
} from "@mui/material";

import { useFormik } from "formik";
import * as Yup from "yup";
import { useDispatch, useSelector } from "react-redux";
import {
  getAllLeads,
  getLeadOptions,
  addLeadOption,
} from "../../../../features/leads/leadSlice";
import CustomQuotationStep2 from "./customquotationStep2";

const clients = ["Client A", "Client B", "Client C"];

const domesticSectors = ["Delhi", "Mumbai", "Bangalore", "Kolkata"];
const internationalSectors = ["USA", "UK", "France", "Australia"];

const CustomQuotation = () => {
  const [showStep2, setShowStep2] = useState(false);
  const dispatch = useDispatch();
  const formik = useFormik({
    initialValues: {
      clientName: "",
      tourType: "Domestic",
      sector: "",
    },
    validationSchema: Yup.object({
      clientName: Yup.string().required("Client Name is required"),
      sector: Yup.string().required("Sector is required"),
    }),
    onSubmit: (values) => {
      console.log("Form Submitted:", values);
      setShowStep2(true);
    },
  });

  // Dynamic options for sector
  const sectors =
    formik.values.tourType === "Domestic"
      ? domesticSectors
      : internationalSectors;

 
const {
    list: leadList = [],     // main array of leads
    status,
    options = [],
    loading,
    error,
  } = useSelector((state) => state.leads);
   useEffect(() => {
    dispatch(getAllLeads());
  }, [dispatch]);
  const clientOptions = [
    ...new Set(leadList?.map((lead) => lead.personalDetails.fullName) || []),
  ];
  const selectedLead = leadList.find(
    (lead) => lead.personalDetails?.fullName === formik.values.clientName
  );
  const sectorOptions = [
  ...new Set(
    leadList
      .filter((lead) => lead.personalDetails?.fullName === formik.values.clientName)
      .map(
        (lead) =>
          lead.tourDetails?.tourDestination || lead.location?.state || ""
      )
      .filter(Boolean)
  ),
];

  useEffect(() => {
    if (selectedLead) {
      formik.setFieldValue(
        "sector",
        selectedLead.tourDetails?.tourDestination || selectedLead.location?.state || ""
      );
    }
  }, [formik.values.clientName, leadList])
   if (showStep2) {
    return <CustomQuotationStep2 sector={formik.values.sector} />;
  }
  return (
    <Paper
      elevation={1}
      sx={{
        p: 3,
        width: "100vw",
        maxWidth: 800,
        position: "relative",
        margin: "auto",
        justifyContent: "center",
      }}
    >
      
      {/* Title */}
      <Typography variant="h6" fontWeight="bold" gutterBottom>
        Custom Quotation
      </Typography>

      {/* Section Title */}
      <Typography
        variant="subtitle1"
        fontWeight="bold"
        sx={{ borderBottom: "1px solid #ddd", mb: 2 }}
      >
        Client Details
      </Typography>

      <form onSubmit={formik.handleSubmit}>
        <Grid container spacing={2}>
          {/* Tour Type */}
          <Grid size={{ xs: 12 }}>
            <Typography variant="body2" sx={{ mb: 1 }}>
              Tour Type
            </Typography>
            <RadioGroup
              row
              name="tourType"
              value={formik.values.tourType}
              onChange={(e) => {
                formik.handleChange(e);
                // reset sector when tour type changes
                formik.setFieldValue("sector", "");
              }}
            >
              <FormControlLabel
                value="Domestic"
                control={<Radio />}
                label="Domestic"
              />
              <FormControlLabel
                value="International"
                control={<Radio />}
                label="International"
              />
            </RadioGroup>
          </Grid>

          {/* Client Name */}
          <Grid size={{ xs: 12, md: 6 }}>
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
            >
              {clientOptions.map((c) => (
                              <MenuItem key={c} value={c}>
                                {c}
                              </MenuItem>
              ))}
            </TextField>
          </Grid>

          {/* Sector */}
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              select
              label="Sector"
              name="sector"
              value={formik.values.sector}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.sector && Boolean(formik.errors.sector)}
              helperText={formik.touched.sector && formik.errors.sector}
            >
              {sectorOptions.map((s) => (
                              <MenuItem key={s} value={s}>
                                {s}
                              </MenuItem>
              ))}
            </TextField>
          </Grid>

          {/* Save Button */}
          <Grid size={{ xs: 12 }}>
            <Box textAlign="center" sx={{ mt: 3 }}>
              <Button
                type="submit"
                variant="contained"
                sx={{ px: 4, py: 1.5, borderRadius: 2 }}
              >
                 Save & Continue
              </Button>
            </Box>
          </Grid>
        </Grid>
      </form>
    </Paper>
  );
};

export default CustomQuotation;
