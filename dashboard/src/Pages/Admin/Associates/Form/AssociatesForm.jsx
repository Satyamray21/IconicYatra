import React from "react";
import {
  Box,
  Button,
  Grid,
  MenuItem,
  TextField,
  Typography,
  IconButton,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { useFormik } from "formik";
import * as Yup from "yup";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";

const countries = ["Albania", "India", "USA", "Canada"];
const states = ["State 1", "State 2"];
const cities = ["City 1", "City 2"];
const titles = ["Mr.", "Ms.", "Mrs.", "Dr."];
const associateTypes = ["Type A", "Type B"];

const validationSchema = Yup.object({
  firstName: Yup.string().required("Required"),
  lastName: Yup.string().required("Required"),
  email: Yup.string().email("Invalid email").required("Required"),
  dob: Yup.date().nullable(),
  associateType: Yup.string().required("Required"),
  country: Yup.string().required("Required"),
  state: Yup.string().required("Required"),
  city: Yup.string().required("Required"),
});

const AssociateDetailForm = () => {
  const formik = useFormik({
    initialValues: {
      firstName: "",
      lastName: "",
      mobile: "",
      alternateContact: "",
      associateType: "",
      email: "",
      title: "",
      dob: null,
      country: "Albania",
      state: "",
      city: "",
      address1: "",
      address2: "",
      address3: "",
      pincode: "",
    },
    validationSchema,
    onSubmit: (values) => {
      console.log("Form Submitted", values);
    },
    onReset: () => {
      formik.resetForm();
    },
  });

  return (
    <Box p={2} border="1px solid #ccc" borderRadius={2} position="relative">
      <IconButton
        size="small"
        sx={{ position: "absolute", top: 8, right: 8 }}
        onClick={() => console.log("Close form")}
      >
        <CloseIcon />
      </IconButton>

      <Typography variant="h6" gutterBottom>
        Associate Detail Form
      </Typography>

      <form onSubmit={formik.handleSubmit} onReset={formik.handleReset}>
        {/* Personal Details */}
        <Box mb={2}>
          <Typography fontWeight="bold" mb={1}>
            Associate’s Personal Details
          </Typography>
          <Grid container spacing={2}>
            <Grid size={{xs:12, sm:6, md:3}}>
              <TextField
                label="First Name"
                name="firstName"
                fullWidth
                size="small"
                value={formik.values.firstName}
                onChange={formik.handleChange}
                error={
                  formik.touched.firstName && Boolean(formik.errors.firstName)
                }
                helperText={formik.touched.firstName && formik.errors.firstName}
              />
            </Grid>
            <Grid size={{xs:12, sm:6, md:3}}>
              <TextField
                label="Last Name"
                name="lastName"
                fullWidth
                size="small"
                value={formik.values.lastName}
                onChange={formik.handleChange}
                error={
                  formik.touched.lastName && Boolean(formik.errors.lastName)
                }
                helperText={formik.touched.lastName && formik.errors.lastName}
              />
            </Grid>
            <Grid size={{xs:12, sm:6, md:3}}>
              <TextField
                label="Mobile Number"
                name="mobile"
                fullWidth
                size="small"
                value={formik.values.mobile}
                onChange={formik.handleChange}
              />
            </Grid>
            <Grid size={{xs:12, sm:6, md:3}}>
              <TextField
                label="Alternate Contact"
                name="alternateContact"
                fullWidth
                size="small"
                value={formik.values.alternateContact}
                onChange={formik.handleChange}
              />
            </Grid>
            <Grid size={{xs:12, sm:6, md:3}}>
              <TextField
                label="Associate Type"
                name="associateType"
                select
                fullWidth
                size="small"
                value={formik.values.associateType}
                onChange={formik.handleChange}
                error={
                  formik.touched.associateType &&
                  Boolean(formik.errors.associateType)
                }
                helperText={
                  formik.touched.associateType && formik.errors.associateType
                }
              >
                {associateTypes.map((type) => (
                  <MenuItem key={type} value={type}>
                    {type}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid size={{xs:12, sm:6, md:3}}>
              <TextField
                label="Email Id"
                name="email"
                fullWidth
                size="small"
                value={formik.values.email}
                onChange={formik.handleChange}
                error={formik.touched.email && Boolean(formik.errors.email)}
                helperText={formik.touched.email && formik.errors.email}
              />
            </Grid>
            <Grid size={{xs:12, sm:6, md:3}}>
              <TextField
                label="Title"
                name="title"
                select
                fullWidth
                size="small"
                value={formik.values.title}
                onChange={formik.handleChange}
              >
                {titles.map((title) => (
                  <MenuItem key={title} value={title}>
                    {title}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid size={{xs:12, sm:6, md:3}}>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DatePicker
                  label="Date of Birth"
                  value={formik.values.dob}
                  onChange={(value) => formik.setFieldValue("dob", value)}
                  renderInput={(params) => (
                    <TextField {...params} fullWidth size="small" name="dob" />
                  )}
                />
              </LocalizationProvider>
            </Grid>
          </Grid>
        </Box>

        {/* Location */}
        <Box mb={2}>
          <Typography fontWeight="bold" mb={1}>
            Associate’s Location
          </Typography>
          <Grid container spacing={2}>
            <Grid size={{xs:12, sm:4}}>
              <TextField
                label="Country"
                name="country"
                select
                fullWidth
                size="small"
                value={formik.values.country}
                onChange={formik.handleChange}
                error={formik.touched.country && Boolean(formik.errors.country)}
                helperText={formik.touched.country && formik.errors.country}
              >
                {countries.map((c) => (
                  <MenuItem key={c} value={c}>
                    {c}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid size={{xs:12, sm:4}}>
              <TextField
                label="State"
                name="state"
                select
                fullWidth
                size="small"
                value={formik.values.state}
                onChange={formik.handleChange}
                error={formik.touched.state && Boolean(formik.errors.state)}
                helperText={formik.touched.state && formik.errors.state}
              >
                {states.map((s) => (
                  <MenuItem key={s} value={s}>
                    {s}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid size={{xs:12, sm:4}}>
              <TextField
                label="City"
                name="city"
                select
                fullWidth
                size="small"
                value={formik.values.city}
                onChange={formik.handleChange}
                error={formik.touched.city && Boolean(formik.errors.city)}
                helperText={formik.touched.city && formik.errors.city}
              >
                {cities.map((c) => (
                  <MenuItem key={c} value={c}>
                    {c}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
          </Grid>
        </Box>

        {/* Address */}
        <Box mb={2}>
          <Typography fontWeight="bold" mb={1}>
            Address
          </Typography>
          <Grid container spacing={2}>
            <Grid size={{xs:12, sm:6}}>
              <TextField
                label="Address Line 1"
                name="address1"
                fullWidth
                size="small"
                value={formik.values.address1}
                onChange={formik.handleChange}
              />
            </Grid>
            <Grid size={{xs:12, sm:6}}>
              <TextField
                label="Address Line 2"
                name="address2"
                fullWidth
                size="small"
                value={formik.values.address2}
                onChange={formik.handleChange}
              />
            </Grid>
            <Grid size={{xs:12, sm:6}}>
              <TextField
                label="Address Line 3"
                name="address3"
                fullWidth
                size="small"
                value={formik.values.address3}
                onChange={formik.handleChange}
              />
            </Grid>
            <Grid size={{xs:12, sm:6}}>
              <TextField
                label="Pincode"
                name="pincode"
                fullWidth
                size="small"
                value={formik.values.pincode}
                onChange={formik.handleChange}
              />
            </Grid>
          </Grid>
        </Box>

        {/* Actions */}
        <Box display="flex" justifyContent="center" gap={2} mt={3}>
          <Button type="reset" variant="contained" color="info">
            Clear
          </Button>
          <Button type="submit" variant="contained" color="primary">
            Save & Continue
          </Button>
        </Box>
      </form>
    </Box>
  );
};

export default AssociateDetailForm;
