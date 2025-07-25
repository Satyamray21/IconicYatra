import React, { useState } from "react";
import {
  Box,
  Grid,
  TextField,
  MenuItem,
  Button,
  Typography,
  InputLabel,
  Select,
  FormControl,
} from "@mui/material";
import { useFormik } from "formik";
import * as Yup from "yup";

const hotelTypes = ["Resort", "Hostel", "Boutique", "Business", "Budget"];
const countries = ["India"];
const states = ["Maharashtra", "Delhi", "Karnataka"];
const cities = ["Mumbai", "Delhi", "Bangalore"];

const validationSchema = Yup.object().shape({
  hotelName: Yup.string().required("Required"),
  hotelType: Yup.string().required("Required"),
  email: Yup.string().email("Invalid email").required("Required"),
  mobile: Yup.string().required("Required"),
  alternateContact: Yup.string().required("Required"),
  designation: Yup.string().required("Required"),
  contactPerson: Yup.string().required("Required"),
  description: Yup.string().required("Required"),
  cancellationPolicy: Yup.string().required("Required"),
  facilities: Yup.string().required("Required"),
  country: Yup.string().required("Required"),
  state: Yup.string().required("Required"),
  city: Yup.string().required("Required"),
  address1: Yup.string().required("Required"),
  address2: Yup.string().required("Required"),
  address3: Yup.string().required("Required"),
  pincode: Yup.string().required("Required"),
  latitude: Yup.string().required("Required"),
  longitude: Yup.string().required("Required"),
  website: Yup.string().required("Required"),
  facebook: Yup.string().required("Required"),
  twitter: Yup.string().required("Required"),
  instagram: Yup.string().required("Required"),
  youtube: Yup.string().required("Required"),
  tripadvisor: Yup.string().required("Required"),
  policy: Yup.string().required("Required"),
});

const HotelEntryForm = () => {
  const [viewMode, setViewMode] = useState(false);

  const formik = useFormik({
    initialValues: {
      hotelName: "",
      hotelType: "",
      email: "",
      mobile: "",
      alternateContact: "",
      designation: "",
      contactPerson: "",
      description: "",
      cancellationPolicy: "",
      facilities: "",
      mainImage: null,
      country: "India",
      state: "",
      city: "",
      address1: "",
      address2: "",
      address3: "",
      pincode: "",
      latitude: "",
      longitude: "",
      website: "",
      facebook: "",
      twitter: "",
      instagram: "",
      youtube: "",
      tripadvisor: "",
      policy: "",
    },
    validationSchema,
    onSubmit: (values) => {
      setViewMode(true);
    },
  });

  const renderField = (name, label, multiline = false, rows = 1) => (
    <TextField
      label={label}
      name={name}
      fullWidth
      size="small"
      required
      value={formik.values[name]}
      onChange={formik.handleChange}
      error={formik.touched[name] && Boolean(formik.errors[name])}
      helperText={formik.touched[name] && formik.errors[name]}
      multiline={multiline}
      rows={rows}
      InputProps={{ readOnly: viewMode }}
    />
  );

  return (
    <Box component="form" onSubmit={formik.handleSubmit} p={2}>
      <Typography variant="h6" gutterBottom>
        Hotel Entry Form
      </Typography>

      <Box border={1} borderRadius={1} p={2} mb={3}>
        <Typography variant="subtitle1">Hotel Details</Typography>
        <Grid container spacing={2} mt={1}>
          <Grid size={{xs:12, sm:6}}>{renderField("hotelName", "Hotel Name")}</Grid>
          <Grid size={{xs:12, sm:6}}>
            {viewMode ? (
              renderField("hotelType", "Hotel Type")
            ) : (
              <FormControl fullWidth size="small" required>
                <InputLabel>Hotel Type</InputLabel>
                <Select name="hotelType" value={formik.values.hotelType} onChange={formik.handleChange}>
                  {hotelTypes.map((type) => (
                    <MenuItem key={type} value={type}>{type}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}
          </Grid>
          <Grid size={{xs:12}}>{renderField("email", "Email")}</Grid>
          <Grid size={{xs:12, sm:6}}>{renderField("mobile", "Mobile")}</Grid>
          <Grid size={{xs:12, sm:6}}>{renderField("alternateContact", "Alternate Contact")}</Grid>
          <Grid size={{xs:12, sm:6}}>{renderField("designation", "Designation")}</Grid>
          <Grid size={{xs:12, sm:6}}>{renderField("contactPerson", "Contact Person")}</Grid>
          <Grid size={{xs:12}}>{renderField("description", "Hotel Description", true, 2)}</Grid>
          <Grid size={{xs:12}}>{renderField("cancellationPolicy", "Cancellation Policy", true, 2)}</Grid>
          <Grid size={{xs:12}}>{renderField("facilities", "Facilities")}</Grid>
        </Grid>
      </Box>

      <Box border={1} borderRadius={1} p={2} mb={3}>
        <Typography variant="subtitle1">Hotel Location</Typography>
        <Grid container spacing={2} mt={1}>
          <Grid size={{xs:12, sm:4}}>{renderField("country", "Country")}</Grid>
          <Grid size={{xs:12, sm:4}}>{renderField("state", "State")}</Grid>
          <Grid size={{xs:12, sm:4}}>{renderField("city", "City")}</Grid>
          <Grid size={{xs:12, sm:4}}>{renderField("address1", "Address 1")}</Grid>
          <Grid size={{xs:12, sm:4}}>{renderField("address2", "Address 2")}</Grid>
          <Grid size={{xs:12, sm:4}}>{renderField("address3", "Address 3")}</Grid>
          <Grid size={{xs:12, sm:4}}>{renderField("pincode", "Pincode")}</Grid>
          <Grid size={{xs:12, sm:4}}>{renderField("latitude", "Latitude")}</Grid>
          <Grid size={{xs:12, sm:4}}>{renderField("longitude", "Longitude")}</Grid>
        </Grid>
      </Box>

      <Box border={1} borderRadius={1} p={2} mb={3}>
        <Typography variant="subtitle1">Social Media</Typography>
        <Grid container spacing={2} mt={1}>
          <Grid size={{xs:12, sm:6}}>{renderField("website", "Website")}</Grid>
          <Grid size={{xs:12, sm:6}}>{renderField("twitter", "Twitter")}</Grid>
          <Grid size={{xs:12, sm:6}}>{renderField("facebook", "Facebook")}</Grid>
          <Grid size={{xs:12, sm:6}}>{renderField("instagram", "Instagram")}</Grid>
          <Grid size={{xs:12, sm:6}}>{renderField("youtube", "YouTube")}</Grid>
          <Grid size={{xs:12, sm:6}}>{renderField("tripadvisor", "TripAdvisor")}</Grid>
        </Grid>
      </Box>

      <Box border={1} borderRadius={1} p={2} mb={3}>
        <Typography variant="subtitle1">Hotel Policy</Typography>
        {renderField("policy", "Hotel Policy", true, 4)}
      </Box>

      <Box textAlign="center">
        {viewMode ? (
          <>
            <Button variant="contained" color="primary" sx={{ mr: 2 }}>Continue</Button>
            <Button variant="outlined" color="secondary" onClick={() => setViewMode(false)}>Cancel</Button>
          </>
        ) : (
          <Button variant="contained" color="primary" type="submit">View</Button>
        )}
      </Box>
    </Box>
  );
};

export default HotelEntryForm;
