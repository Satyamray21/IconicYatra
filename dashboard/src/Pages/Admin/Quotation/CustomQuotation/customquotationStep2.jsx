import React from "react";
import {
  Box,
  Button,
  Grid,
  MenuItem,
  TextField,
  Typography,
  Paper,
  IconButton,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { useFormik } from "formik";
import * as Yup from "yup";

const cities = ["Delhi", "Mumbai", "Bangalore", "Kolkata"];

const CustomQuotationStep2 = ({ onClose }) => {
  const formik = useFormik({
    initialValues: {
      cityName: "",
      nights: "",
    },
    validationSchema: Yup.object({
      cityName: Yup.string().required("City Name is required"),
      nights: Yup.number()
        .typeError("Must be a number")
        .positive("Must be positive")
        .integer("Must be an integer")
        .required("No. of Nights is required"),
    }),
    onSubmit: (values) => {
      console.log("Form Submitted:", values);
    },
  });

  return (
    <Paper
      elevation={1}
      sx={{
        p: 3,
        width: "100%",
        maxWidth: 700,
        position: "relative",
        margin: "auto",
      }}
    >
      {/* Close Button */}
      <IconButton
        onClick={onClose}
        sx={{ position: "absolute", top: 8, right: 8 }}
      >
        <CloseIcon color="primary" />
      </IconButton>

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
        Pickup/Drop
      </Typography>

      <form onSubmit={formik.handleSubmit}>
        <Grid container spacing={2}>
          {/* City Name */}
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              select
              label="City Name"
              name="cityName"
              value={formik.values.cityName}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.cityName && Boolean(formik.errors.cityName)}
              helperText={formik.touched.cityName && formik.errors.cityName}
            >
              {cities.map((city) => (
                <MenuItem key={city} value={city}>
                  {city}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          {/* No. of Nights */}
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              type="number"
              label="No. of Nights"
              name="nights"
              value={formik.values.nights}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.nights && Boolean(formik.errors.nights)}
              helperText={formik.touched.nights && formik.errors.nights}
            />
          </Grid>

          {/* Buttons */}
          <Grid item xs={12}>
            <Box sx={{ display: "flex", gap: 2 }}>
              <Button
                type="button"
                variant="contained"
                color="primary"
                onClick={() => alert("Add City clicked")}
              >
                Add City
              </Button>
              <Button type="submit" variant="contained" color="info">
                Next
              </Button>
            </Box>
          </Grid>
        </Grid>
      </form>
    </Paper>
  );
};

export default CustomQuotationStep2;
