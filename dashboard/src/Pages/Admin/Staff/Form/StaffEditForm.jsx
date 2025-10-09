import React, { useState, useEffect } from "react";
import {
  Box,
  Grid,
  Typography,
  TextField,
  MenuItem,
  Button,
  FormControl,
  InputLabel,
  Select,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
} from "@mui/material";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { useFormik } from "formik";
import * as Yup from "yup";
import dayjs from "dayjs";
import { fetchStaffById, updateStaff } from "../../../../features/staff/staffSlice";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchCountries,
  fetchStatesByCountry,
  fetchCitiesByState,
  clearStates,
  clearCities,
} from "../../../../features/location/locationSlice";
import { useParams } from "react-router-dom";

// -------- Dropdown data ----------
const titles = ["Mr", "Mrs", "Ms", "Dr"];
const roles = ["Admin", "Manager", "Executive"];

// -------- Validation schema ----------
const validationSchema = Yup.object({
  // Staff
  title: Yup.string(),
  fullName: Yup.string().required("Full name is required"),
  mobile: Yup.string().required("Mobile number is required"),
  alternateContact: Yup.string(),
  designation: Yup.string().required("Designation is required"),
  userRole: Yup.string().required("User role is required"),
  email: Yup.string().email("Invalid email"),
  dob: Yup.date().nullable(),
  country: Yup.string().required("Country is required"),
  state: Yup.string().required("State is required"),
  city: Yup.string().required("City is required"),
  address1: Yup.string(),
  address2: Yup.string(),
  address3: Yup.string(),
  pincode: Yup.string(),

  // Firm
  firmType: Yup.string().required("Firm Type is required"),
  firmName: Yup.string().required("Firm Name is required"),
  gstin: Yup.string(),
  cin: Yup.string(),
  pan: Yup.string(),
  turnover: Yup.string(),
  firmDescription: Yup.string(),

  // Bank
  bankName: Yup.string(),
  branchName: Yup.string(),
  accountHolderName: Yup.string(),
  accountNumber: Yup.string(),
  ifscCode: Yup.string(),
});

const StaffEditForm = () => {
  const { staffId } = useParams();
  const dispatch = useDispatch();
  const { selected: staff, loading } = useSelector((state) => state.staffs);
  const {
    countries: countriesData,
    states: statesData,
    cities: citiesData,
    loading: locationLoading,
  } = useSelector((state) => state.location);
  
  const [firmTypes, setFirmTypes] = useState([
    "Proprietorship",
    "Partnership",
    "LLP",
    "Private Ltd",
    "Public Ltd",
  ]);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [newFirmType, setNewFirmType] = useState("");

  // Fetch staff data
  useEffect(() => {
    if (staffId) {
      dispatch(fetchStaffById(staffId));
    }
  }, [dispatch, staffId]);

  // Fetch countries
  useEffect(() => {
    dispatch(fetchCountries());
  }, [dispatch]);

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      title: staff?.personalDetails?.title || "",
      fullName: staff?.personalDetails?.fullName || "",
      mobile: staff?.personalDetails?.mobileNumber || "",
      alternateContact: staff?.personalDetails?.alternateContact || "",
      designation: staff?.personalDetails?.designation || "",
      userRole: staff?.personalDetails?.userRole || "",
      email: staff?.personalDetails?.email || "",
      dob: staff?.personalDetails?.dateOfBirth || null,
      country: staff?.staffLocation?.country?.name || "",
      state: staff?.staffLocation?.state?.name || "",
      city: staff?.staffLocation?.city?.name || "",
      address1: staff?.address?.addressLine1 || "",
      address2: staff?.address?.addressLine2 || "",
      address3: staff?.address?.addressLine3 || "",
      pincode: staff?.address?.pincode || "",
      firmType: staff?.firm?.firmType || "",
      firmName: staff?.firm?.firmName || "",
      gstin: staff?.firm?.gstin || "",
      cin: staff?.firm?.cin || "",
      pan: staff?.firm?.pan || "",
      turnover: staff?.firm?.turnover || "",
      firmDescription: staff?.firm?.firmDescription || "",
      bankName: staff?.bank?.bankName || "",
      branchName: staff?.bank?.branchName || "",
      accountHolderName: staff?.bank?.accountHolderName || "",
      accountNumber: staff?.bank?.accountNumber || "",
      ifscCode: staff?.bank?.ifscCode || "",
    },
    validationSchema,
    onSubmit: (values) => {
      dispatch(updateStaff({ id: staffId, data: values }));
    },
  });

  const { values, errors, touched, handleChange, setFieldValue } = formik;

  // Fetch states when country changes
  useEffect(() => {
    if (values.country) {
      dispatch(fetchStatesByCountry(values.country));
      setFieldValue("state", "");
      setFieldValue("city", "");
      dispatch(clearCities());
    } else {
      dispatch(clearStates());
      dispatch(clearCities());
    }
  }, [values.country, dispatch, setFieldValue]);

  // Fetch cities when state changes
  useEffect(() => {
    if (values.state && values.country) {
      dispatch(
        fetchCitiesByState({
          countryName: values.country,
          stateName: values.state,
        })
      );
    } else {
      dispatch(clearCities());
    }
  }, [values.state, values.country, dispatch]);

  const renderSelectOptions = (options, loadingText = "Loading...") => {
    if (locationLoading) {
      return <MenuItem disabled>{loadingText}</MenuItem>;
    }
    
    if (!options || options.length === 0) {
      return <MenuItem disabled>No options available</MenuItem>;
    }

    return options.map((option) => (
      <MenuItem key={option} value={option}>
        {option}
      </MenuItem>
    ));
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
        <Typography ml={2}>Loading staff data...</Typography>
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Typography variant="h6" gutterBottom>
        Edit Staff & Firm Details
      </Typography>

      <form onSubmit={formik.handleSubmit}>
        {/* ---------- Personal Details ---------- */}
        <Box border={1} borderColor="divider" borderRadius={2} p={2} mb={3}>
          <Typography variant="subtitle1" gutterBottom>
            Staff's Personal Details
          </Typography>
          <Grid container spacing={2}>
            <Grid size={{xs:3}}>
              <FormControl fullWidth>
                <InputLabel>Title</InputLabel>
                <Select name="title" value={values.title} onChange={handleChange}>
                  {titles.map((title) => (
                    <MenuItem key={title} value={title}>
                      {title}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{xs:3}}>
              <TextField
                name="fullName"
                label="Full Name"
                fullWidth
                required
                value={values.fullName}
                onChange={handleChange}
                error={touched.fullName && Boolean(errors.fullName)}
                helperText={touched.fullName && errors.fullName}
              />
            </Grid>
            <Grid size={{xs:3}}>
              <TextField
                name="mobile"
                label="Mobile Number"
                fullWidth
                value={values.mobile}
                onChange={handleChange}
                error={touched.mobile && Boolean(errors.mobile)}
                helperText={touched.mobile && errors.mobile}
              />
            </Grid>
            <Grid size={{xs:3}}>
              <TextField
                name="alternateContact"
                label="Alternate Contact"
                fullWidth
                value={values.alternateContact}
                onChange={handleChange}
              />
            </Grid>
            <Grid size={{xs:3}}>
              <TextField
                name="designation"
                label="Designation"
                fullWidth
                required
                value={values.designation}
                onChange={handleChange}
                error={touched.designation && Boolean(errors.designation)}
                helperText={touched.designation && errors.designation}
              />
            </Grid>
            <Grid size={{xs:3}}>
              <FormControl
                fullWidth
                required
                error={touched.userRole && Boolean(errors.userRole)}
              >
                <InputLabel>User Role</InputLabel>
                <Select
                  name="userRole"
                  value={values.userRole}
                  onChange={handleChange}
                >
                  {roles.map((role) => (
                    <MenuItem key={role} value={role}>
                      {role}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{xs:3}}>
              <TextField
                name="email"
                label="Email"
                fullWidth
                value={values.email}
                onChange={handleChange}
              />
            </Grid>
            <Grid size={{xs:3}}>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DatePicker
                  label="Date of Birth"
                  value={values.dob ? dayjs(values.dob) : null}
                  onChange={(date) => setFieldValue("dob", date)}
                  format="DD-MM-YYYY"
                  slotProps={{ textField: { fullWidth: true } }}
                />
              </LocalizationProvider>
            </Grid>
          </Grid>
        </Box>

        {/* ---------- Location ---------- */}
        <Box border={1} borderColor="divider" borderRadius={2} p={2} mb={3}>
          <Typography variant="subtitle1" gutterBottom>
            Staff's Location
          </Typography>
          <Grid container spacing={2}>
            <Grid size={{xs:4}}>
              <FormControl fullWidth required>
                <InputLabel>Country</InputLabel>
                <Select
                  name="country"
                  value={values.country}
                  onChange={(e) => {
                    handleChange(e);
                    setFieldValue("state", "");
                    setFieldValue("city", "");
                  }}
                >
                  {renderSelectOptions(
                    countriesData?.map((c) => c.name),
                    "Loading countries..."
                  )}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{xs:4}}>
              <FormControl fullWidth required>
                <InputLabel>State</InputLabel>
                <Select
                  name="state"
                  value={values.state}
                  onChange={(e) => {
                    handleChange(e);
                    setFieldValue("city", "");
                  }}
                  disabled={!values.country}
                >
                  {renderSelectOptions(
                    statesData?.map((s) => s.name),
                    "Loading states..."
                  )}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{xs:4}}>
              <FormControl fullWidth required>
                <InputLabel>City</InputLabel>
                <Select
                  name="city"
                  value={values.city}
                  onChange={handleChange}
                  disabled={!values.state}
                >
                  {renderSelectOptions(
                    citiesData?.map((c) => c.name),
                    "Loading cities..."
                  )}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </Box>

        {/* ---------- Address ---------- */}
        <Box border={1} borderColor="divider" borderRadius={2} p={2} mb={3}>
          <Typography variant="subtitle1" gutterBottom>
            Address
          </Typography>
          <Grid container spacing={2}>
            <Grid size={{xs:12}}>
              <TextField
                name="address1"
                label="Address Line 1"
                fullWidth
                value={values.address1}
                onChange={handleChange}
              />
            </Grid>
            <Grid size={{xs:12}}>
              <TextField
                name="address2"
                label="Address Line 2"
                fullWidth
                value={values.address2}
                onChange={handleChange}
              />
            </Grid>
            <Grid size={{xs:6}}>
              <TextField
                name="address3"
                label="Address Line 3"
                fullWidth
                value={values.address3}
                onChange={handleChange}
              />
            </Grid>
            <Grid size={{xs:6}}>
              <TextField
                name="pincode"
                label="Pincode"
                fullWidth
                value={values.pincode}
                onChange={handleChange}
              />
            </Grid>
          </Grid>
        </Box>

        {/* ---------- Firm Details ---------- */}
        <Box border={1} borderColor="divider" borderRadius={2} p={2} mb={3}>
          <Typography variant="subtitle1" gutterBottom>
            Firm Details
          </Typography>

          <FormControl fullWidth margin="normal">
            <InputLabel>Firm Type *</InputLabel>
            <Select
              name="firmType"
              value={values.firmType}
              onChange={(e) => {
                if (e.target.value === "__add_new__") {
                  setAddDialogOpen(true);
                } else {
                  setFieldValue("firmType", e.target.value);
                }
              }}
              error={touched.firmType && Boolean(errors.firmType)}
            >
              {firmTypes.map((type) => (
                <MenuItem key={type} value={type}>
                  {type}
                </MenuItem>
              ))}
              <MenuItem value="__add_new__">+ Add New</MenuItem>
            </Select>
          </FormControl>

          <Grid container spacing={2} mt={1}>
            <Grid size={{xs:4}}>
              <TextField
                fullWidth
                label="GSTIN Number"
                name="gstin"
                value={values.gstin}
                onChange={handleChange}
              />
            </Grid>
            <Grid size={{xs:4}}>
              <TextField
                fullWidth
                label="CIN Number"
                name="cin"
                value={values.cin}
                onChange={handleChange}
              />
            </Grid>
            <Grid size={{xs:4}}>
              <TextField
                fullWidth
                label="PAN Number"
                name="pan"
                value={values.pan}
                onChange={handleChange}
              />
            </Grid>
            <Grid size={{xs:6}}>
              <TextField
                fullWidth
                label="Existing Turnover"
                name="turnover"
                value={values.turnover}
                onChange={handleChange}
              />
            </Grid>
            <Grid size={{xs:6}}>
              <TextField
                fullWidth
                required
                label="Firm Name"
                name="firmName"
                value={values.firmName}
                onChange={handleChange}
                error={touched.firmName && Boolean(errors.firmName)}
                helperText={touched.firmName && errors.firmName}
              />
            </Grid>
            <Grid size={{xs:12}}>
              <TextField
                fullWidth
                label="Firm Description"
                name="firmDescription"
                multiline
                minRows={3}
                value={values.firmDescription}
                onChange={handleChange}
              />
            </Grid>
          </Grid>
        </Box>

        {/* ---------- Bank Details ---------- */}
        <Box border={1} borderColor="divider" borderRadius={2} p={2} mb={3}>
          <Typography variant="subtitle1" gutterBottom>
            Bank Details
          </Typography>

          <Grid container spacing={2}>
            <Grid size={{xs:6}}>
              <TextField
                fullWidth
                label="Name of Bank"
                name="bankName"
                value={values.bankName}
                onChange={handleChange}
              />
            </Grid>
            <Grid size={{xs:6}}>
              <TextField
                fullWidth
                label="Branch Name"
                name="branchName"
                value={values.branchName}
                onChange={handleChange}
              />
            </Grid>
            <Grid size={{xs:12}}>
              <TextField
                fullWidth
                label="Account Holder Name"
                name="accountHolderName"
                value={values.accountHolderName}
                onChange={handleChange}
              />
            </Grid>
            <Grid size={{xs:6}}>
              <TextField
                fullWidth
                label="Account Number"
                name="accountNumber"
                value={values.accountNumber}
                onChange={handleChange}
              />
            </Grid>
            <Grid size={{xs:6}}>
              <TextField
                fullWidth
                label="IFSC Code"
                name="ifscCode"
                value={values.ifscCode}
                onChange={handleChange}
              />
            </Grid>
          </Grid>
        </Box>

        <Box display="flex" justifyContent="center" mt={3}>
          <Button type="submit" variant="contained" color="primary">
            Save Changes
          </Button>
        </Box>
      </form>

      {/* Add New Firm Type Dialog */}
      <Dialog open={addDialogOpen} onClose={() => setAddDialogOpen(false)}>
        <DialogTitle>Add New Firm Type</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            autoFocus
            margin="dense"
            label="Firm Type"
            value={newFirmType}
            onChange={(e) => setNewFirmType(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={() => {
              const trimmed = newFirmType.trim();
              if (trimmed && !firmTypes.includes(trimmed)) {
                setFirmTypes((prev) => [...prev, trimmed]);
                setFieldValue("firmType", trimmed);
              }
              setNewFirmType("");
              setAddDialogOpen(false);
            }}
          >
            Add
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default StaffEditForm;