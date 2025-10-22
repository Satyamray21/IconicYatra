import React from "react";
import {
  Box,
  Grid,
  Typography,
  TextField,
  RadioGroup,
  FormControlLabel,
  Radio,
  Button,
  MenuItem,
  Divider,
} from "@mui/material";
import { useFormik } from "formik";
import * as Yup from "yup";

const FullQuotationStep6 = () => {
  const formik = useFormik({
    initialValues: {
      // Company Margin
      standardMarginPercent: "",
      standardMarginValue: "",
      deluxeMarginPercent: "",
      deluxeMarginValue: "",
      superiorMarginPercent: "",
      superiorMarginValue: "",

      // Discount
      standardDiscount: "",
      deluxeDiscount: "",
      superiorDiscount: "",

      // Taxes
      gstOn: "Full",
      taxPercent: "",

      // Signature
      contactDetails: "",
    },
    validationSchema: Yup.object({
      standardMarginPercent: Yup.number().required("Required"),
      standardMarginValue: Yup.number().required("Required"),
      deluxeMarginPercent: Yup.number().required("Required"),
      deluxeMarginValue: Yup.number().required("Required"),
      superiorMarginPercent: Yup.number().required("Required"),
      superiorMarginValue: Yup.number().required("Required"),
      standardDiscount: Yup.number().required("Required"),
      deluxeDiscount: Yup.number().required("Required"),
      superiorDiscount: Yup.number().required("Required"),
      gstOn: Yup.string().required("Required"),
      taxPercent: Yup.string().required("Required"),
      contactDetails: Yup.string().required("Required"),
    }),
    onSubmit: (values) => {
      console.log("Form Data:", values);
      alert("Form Submitted");
    },
  });

  return (
    <Box
      component="form"
      onSubmit={formik.handleSubmit}
      sx={{
        border: "1px solid #ccc",
        borderRadius: 2,
        p: 3,
        mt: 2,
        maxWidth: 900,
        mx: "auto",
      }}
    >
      <Typography variant="h6" fontWeight={600} mb={2}>
        Quotation
      </Typography>

      {/* Company Margin Section */}
      <Box
        sx={{
          border: "1px solid #ddd",
          borderRadius: 2,
          p: 2,
          mb: 3,
        }}
      >
        <Typography variant="subtitle1" fontWeight={600} mb={2}>
          Company Margin
        </Typography>

        <Grid container spacing={2} alignItems="center">
          <Grid size={{xs:4}}> </Grid> 
          <Grid size={{xs:4}}>
            <Typography variant="body2" fontWeight={600}>
              Margin %
            </Typography>
          </Grid>
          <Grid size={{xs:4}}>
            <Typography variant="body2" fontWeight={600}>
              Margin ₹
            </Typography>
          </Grid>

          {/* Standard */}
          <Grid size={{xs:4}}>
            <Typography>Standard</Typography>
          </Grid>
          <Grid size={{xs:4}}>
            <TextField
              fullWidth
              name="standardMarginPercent"
              value={formik.values.standardMarginPercent}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={
                formik.touched.standardMarginPercent &&
                Boolean(formik.errors.standardMarginPercent)
              }
              helperText={
                formik.touched.standardMarginPercent &&
                formik.errors.standardMarginPercent
              }
            />
          </Grid>
          <Grid size={{xs:4}}>
            <TextField
              fullWidth
              name="standardMarginValue"
              value={formik.values.standardMarginValue}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={
                formik.touched.standardMarginValue &&
                Boolean(formik.errors.standardMarginValue)
              }
              helperText={
                formik.touched.standardMarginValue &&
                formik.errors.standardMarginValue
              }
            />
          </Grid>

          {/* Deluxe */}
          <Grid size={{xs:4}}>
            <Typography>Deluxe</Typography>
          </Grid>
          <Grid size={{xs:4}}>
            <TextField
              fullWidth
              name="deluxeMarginPercent"
              value={formik.values.deluxeMarginPercent}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={
                formik.touched.deluxeMarginPercent &&
                Boolean(formik.errors.deluxeMarginPercent)
              }
              helperText={
                formik.touched.deluxeMarginPercent &&
                formik.errors.deluxeMarginPercent
              }
            />
          </Grid>
          <Grid size={{xs:4}}>
            <TextField
              fullWidth
              name="deluxeMarginValue"
              value={formik.values.deluxeMarginValue}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={
                formik.touched.deluxeMarginValue &&
                Boolean(formik.errors.deluxeMarginValue)
              }
              helperText={
                formik.touched.deluxeMarginValue &&
                formik.errors.deluxeMarginValue
              }
            />
          </Grid>

          {/* Superior */}
          <Grid size={{xs:4}}>
            <Typography>Superior</Typography>
          </Grid>
          <Grid size={{xs:4}}>
            <TextField
              fullWidth
              name="superiorMarginPercent"
              value={formik.values.superiorMarginPercent}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={
                formik.touched.superiorMarginPercent &&
                Boolean(formik.errors.superiorMarginPercent)
              }
              helperText={
                formik.touched.superiorMarginPercent &&
                formik.errors.superiorMarginPercent
              }
            />
          </Grid>
          <Grid size={{xs:4}}>
            <TextField
              fullWidth
              name="superiorMarginValue"
              value={formik.values.superiorMarginValue}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={
                formik.touched.superiorMarginValue &&
                Boolean(formik.errors.superiorMarginValue)
              }
              helperText={
                formik.touched.superiorMarginValue &&
                formik.errors.superiorMarginValue
              }
            />
          </Grid>
        </Grid>
      </Box>

      {/* Discount Section */}
      <Box
        sx={{
          border: "1px solid #ddd",
          borderRadius: 2,
          p: 2,
          mb: 3,
        }}
      >
        <Typography variant="subtitle1" fontWeight={600} mb={2}>
          Discount
        </Typography>

        <Grid container spacing={2}>
          <Grid size={{xs:4}}>
            <TextField
              fullWidth
              label="Standard Discount"
              name="standardDiscount"
              value={formik.values.standardDiscount}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={
                formik.touched.standardDiscount &&
                Boolean(formik.errors.standardDiscount)
              }
              helperText={
                formik.touched.standardDiscount &&
                formik.errors.standardDiscount
              }
            />
          </Grid>

          <Grid size={{xs:4}}>
            <TextField
              fullWidth
              label="Deluxe Discount"
              name="deluxeDiscount"
              value={formik.values.deluxeDiscount}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={
                formik.touched.deluxeDiscount &&
                Boolean(formik.errors.deluxeDiscount)
              }
              helperText={
                formik.touched.deluxeDiscount && formik.errors.deluxeDiscount
              }
            />
          </Grid>

          <Grid size={{xs:4}}>
            <TextField
              fullWidth
              label="Superior Discount"
              name="superiorDiscount"
              value={formik.values.superiorDiscount}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={
                formik.touched.superiorDiscount &&
                Boolean(formik.errors.superiorDiscount)
              }
              helperText={
                formik.touched.superiorDiscount &&
                formik.errors.superiorDiscount
              }
            />
          </Grid>
        </Grid>
      </Box>

      {/* Taxes Section */}
      <Box
        sx={{
          border: "1px solid #ddd",
          borderRadius: 2,
          p: 2,
          mb: 3,
        }}
      >
        <Typography variant="subtitle1" fontWeight={600} mb={2}>
          Taxes
        </Typography>

        <RadioGroup
          row
          name="gstOn"
          value={formik.values.gstOn}
          onChange={formik.handleChange}
        >
          <FormControlLabel value="Full" control={<Radio />} label="Full" />
          <FormControlLabel value="Margin" control={<Radio />} label="Margin" />
          <FormControlLabel value="None" control={<Radio />} label="None" />
        </RadioGroup>

        <Box mt={2}>
          <TextField
            select
            fullWidth
            label="Apply GST (Tax %)"
            name="taxPercent"
            value={formik.values.taxPercent}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={
              formik.touched.taxPercent && Boolean(formik.errors.taxPercent)
            }
            helperText={formik.touched.taxPercent && formik.errors.taxPercent}
          >
            <MenuItem value="5">5%</MenuItem>
            <MenuItem value="12">12%</MenuItem>
            <MenuItem value="18">18%</MenuItem>
            <MenuItem value="28">28%</MenuItem>
          </TextField>
        </Box>
      </Box>

      {/* Signature Details */}
      <Box
        sx={{
          border: "1px solid #ddd",
          borderRadius: 2,
          p: 2,
          mb: 3,
        }}
      >
        <Typography variant="subtitle1" fontWeight={600} mb={2}>
          Signature Details
        </Typography>

        <TextField
          fullWidth
          multiline
          rows={2}
          label="Contact Details"
          name="contactDetails"
          value={formik.values.contactDetails}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          error={
            formik.touched.contactDetails &&
            Boolean(formik.errors.contactDetails)
          }
          helperText={
            formik.touched.contactDetails && formik.errors.contactDetails
          }
        />
      </Box>

      {/* Submit */}
      <Box textAlign="center">
        <Button type="submit" variant="contained">
          Submit
        </Button>
      </Box>
    </Box>
  );
};

export default FullQuotationStep6;
