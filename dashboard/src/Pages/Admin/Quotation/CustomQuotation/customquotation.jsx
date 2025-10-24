import React, { useEffect } from "react";
import { Box, Button, Grid, MenuItem, TextField, Typography, RadioGroup, FormControlLabel, Radio, Paper } from "@mui/material";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useDispatch, useSelector } from "react-redux";
import { getAllLeads } from "../../../../features/leads/leadSlice";

const CustomQuotation = ({ onNext }) => {
  const dispatch = useDispatch();
  const { list: leadList = [] } = useSelector(state => state.leads);

  useEffect(() => {
    dispatch(getAllLeads());
  }, [dispatch]);

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
      onNext(values); // pass actual form values, no "N/A"
    },
  });

  const clientOptions = [...new Set(leadList.map(lead => lead.personalDetails.fullName).filter(Boolean))];
  const sectorOptions = [...new Set(
    leadList
      .filter(lead => lead.personalDetails?.fullName === formik.values.clientName)
      .map(lead => lead.tourDetails?.tourDestination || lead.location?.state)
      .filter(Boolean)
  )];

  useEffect(() => {
    formik.setFieldValue("sector", "");
  }, [formik.values.clientName]);

  return (
    <Paper elevation={1} sx={{ p: 3, width: "100%", maxWidth: 800, margin: "auto" }}>
      <Typography variant="h6" fontWeight="bold" gutterBottom>Custom Quotation</Typography>
      <Typography variant="subtitle1" fontWeight="bold" sx={{ borderBottom: "1px solid #ddd", mb: 2 }}>Client Details</Typography>

      <form onSubmit={formik.handleSubmit}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Typography variant="body2" sx={{ mb: 1 }}>Tour Type</Typography>
            <RadioGroup row name="tourType" value={formik.values.tourType} onChange={formik.handleChange}>
              <FormControlLabel value="Domestic" control={<Radio />} label="Domestic" />
              <FormControlLabel value="International" control={<Radio />} label="International" />
            </RadioGroup>
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField fullWidth select label="Client Name" id="clientName" name="clientName"
              value={formik.values.clientName} onChange={formik.handleChange} onBlur={formik.handleBlur}
              error={formik.touched.clientName && Boolean(formik.errors.clientName)}
              helperText={formik.touched.clientName && formik.errors.clientName}>
              {clientOptions.map(c => <MenuItem key={c} value={c}>{c}</MenuItem>)}
            </TextField>
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField fullWidth select label="Sector" id="sector" name="sector"
              value={formik.values.sector} onChange={formik.handleChange} onBlur={formik.handleBlur}
              error={formik.touched.sector && Boolean(formik.errors.sector)}
              helperText={formik.touched.sector && formik.errors.sector}>
              {sectorOptions.map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}
            </TextField>
          </Grid>

          <Grid item xs={12}>
            <Box textAlign="center" sx={{ mt: 3 }}>
              <Button type="submit" variant="contained" sx={{ px: 4, py: 1.5, borderRadius: 2 }} disabled={!formik.isValid}>
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
