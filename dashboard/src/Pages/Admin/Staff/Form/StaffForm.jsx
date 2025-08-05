import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Grid,
  TextField,
  MenuItem,
  Button,
  Typography,
  FormControl,
  InputLabel,
  Select,
} from "@mui/material";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { useFormik } from "formik";
import * as Yup from "yup";
import dayjs from "dayjs";
import StaffFormDetail from "./StaffFormDetail";
import { useDispatch } from "react-redux";
import { createStaff } from "../../../../features/staff/staffSlice" // Adjust path
const titles = ["Mr", "Mrs", "Ms", "Dr"];
const roles = ["Admin", "Manager", "Executive"];
const countries = ["India", "USA"];
const states = {
  India: ["Maharashtra", "Delhi", "Karnataka"],
  USA: ["California", "New York", "Texas"],
};
const cities = {
  Maharashtra: ["Mumbai", "Pune"],
  Delhi: ["New Delhi"],
  Karnataka: ["Bangalore"],
  California: ["Los Angeles", "San Francisco"],
  "New York": ["New York City"],
  Texas: ["Houston"],
};

const validationSchema = Yup.object().shape({
  fullName: Yup.string().required("Required"),
  mobile: Yup.string().required("Required"),
  alternateContact: Yup.string(),
  designation: Yup.string().required("Required"),
  userRole: Yup.string().required("Required"),
  email: Yup.string().email("Invalid email"),
  title: Yup.string(),
  dob: Yup.date().nullable(),
  country: Yup.string().required("Required"),
  state: Yup.string().required("Required"),
  city: Yup.string().required("Required"),
  address1: Yup.string(),
  address2: Yup.string(),
  address3: Yup.string(),
  pincode: Yup.string(),
});

const StaffForm = () => {
  const [step, setStep] = useState(1);
  const navigate = useNavigate();
 const dispatch = useDispatch();

const handleFinalSubmit = () => {
  const formattedData = {
    personalDetails: {
      title: values.title,
      firstName: values.fullName.split(" ")[0] || "",
      lastName: values.fullName.split(" ").slice(1).join(" ") || "",
      mobileNumber: values.mobile,
      alternateContact: values.alternateContact,
      designation: values.designation,
      userRole: values.userRole,
      email: values.email,
      dob: values.dob,
    },
    staffLocation: {
      country: values.country,
      state: values.state,
      city: values.city,
    },
    address: {
      address1: values.address1,
      address2: values.address2,
      address3: values.address3,
      pincode: values.pincode,
    },
    firm: {
  firmType: values.firmType,
  gstin: values.gstin,
  cin: values.cin,
  pan: values.pan,
  turnover: values.turnover,
  firmName: values.firmName,
  firmDescription: values.firmDescription,
  sameAsContact: values.sameAsContact,
  address1: values.firmAddress1,
  address2: values.firmAddress2,
  address3: values.firmAddress3,
  supportingDocs: values.supportingDocs,
},

    bank: {
 bankName: values.bankName,
  branchName: values.branchName,
  //nameOfBranch: values.nameOfBranch,
  accountHolderName: values.accountHolderName,
  accountNumber: values.accountNumber,
  ifscCode: values.ifscCode,
}

  };

  dispatch(createStaff(formattedData))
    .unwrap()
    .then(() => {
      navigate("/staff"); // or wherever you want
    })
    .catch((err) => {
      console.error("Staff creation failed:", err);
    });
};
  const formik = useFormik({
   initialValues: {
  fullName: "",
  mobile: "",
  alternateContact: "",
  designation: "",
  userRole: "",
  email: "",
  title: "",
  dob: null,

  // Staff Address
  address1: "",
  address2: "",
  address3: "",
  pincode: "",
  country: "",
  state: "",
  city: "",

  // Firm
  firmType: "",
  gstin: "",
  cin: "",
  pan: "",
  turnover: "",
  firmName: "",
  firmDescription: "",
  sameAsContact: false,
  supportingDocs: null,
  firmAddress1: "",  // 👈 rename
  firmAddress2: "",
  firmAddress3: "",

  // Bank
  bankName: "",
  branchName: "",
  accountHolderName: "",
  accountNumber: "",
  ifscCode: "",
  nameOfBranch: "",
},

    validationSchema,
 onSubmit: (values) => {
  if (step === 1) {
    setStep(2);
  } else {
    const formattedData = {
      personalDetails: {
        fullName: values.fullName,
        title: values.title,
        firstName: values.fullName.split(" ")[0] || "",
        lastName: values.fullName.split(" ").slice(1).join(" ") || "",
        mobileNumber: values.mobile,
        alternateContact: values.alternateContact,
        designation: values.designation,
        userRole: values.userRole,
        email: values.email,
        dob: values.dob,
      },
      staffLocation: {
        country: values.country,
        state: values.state,
        city: values.city,
      },
      address: {
        addressLine1: values.address1,
        addressLine2: values.address2,
        addressLine3: values.address3,
        pincode: values.pincode,
      },
      firm: {
        firmType: values.firmType,
        gstin: values.gstin,
        cin: values.cin,
        pan: values.pan,
        turnover: values.turnover,
        firmName: values.firmName,
        firmDescription: values.firmDescription,
        sameAsContact: values.sameAsContact,
        address1: values.address1,
        address2: values.address2,
        address3: values.address3,
        supportingDocs: values.supportingDocs,
      },
      bank: {
        bankName: values.bankName,
        branchName: values.branchName,
        accountHolderName: values.accountHolderName,
        accountNumber: values.accountNumber,
        ifscCode: values.ifscCode,
      },
    };

    dispatch(createStaff(formattedData))
      .unwrap()
      .then(() => {
        navigate("/staff");
      })
      .catch((err) => {
        console.error("Staff creation failed:", err);
      });
  }
}


    ,
  });

  const {
    values,
    errors,
    touched,
    handleChange,
    handleSubmit,
    setFieldValue,
    resetForm,
  } = formik;
 


  return (
    <Box p={3}>
      <Typography variant="h6" gutterBottom>
        Staff Detail Form
      </Typography>
      <form onSubmit={handleSubmit}>
        {step === 1 && (
          <>
            {/* Personal Details */}
            <Box border={1} borderColor="divider" borderRadius={2} p={2} mb={3}>
              <Typography variant="subtitle1" gutterBottom>
                Staff's Personal Details
              </Typography>
              <Grid container spacing={2}>
                 <Grid size={{ xs: 3 }}>
                  <FormControl fullWidth>
                    <InputLabel>Title</InputLabel>
                    <Select
                      name="title"
                      value={values.title}
                      onChange={handleChange}
                    >
                      {titles.map((title) => (
                        <MenuItem key={title} value={title}>
                          {title}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid size={{ xs: 3 }}>
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
               
                <Grid size={{ xs: 3 }}>
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
                <Grid size={{ xs: 3 }}>
                  <TextField
                    name="alternateContact"
                    label="Alternate Contact"
                    fullWidth
                    value={values.alternateContact}
                    onChange={handleChange}
                  />
                </Grid>
                <Grid size={{ xs: 3 }}>
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
                <Grid size={{ xs: 3 }}>
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
                <Grid size={{ xs: 3 }}>
                  <TextField
                    name="email"
                    label="Email Id"
                    fullWidth
                    value={values.email}
                    onChange={handleChange}
                  />
                </Grid>
               
                <Grid size={{ xs: 3 }}>
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

            {/* Location */}
            <Box border={1} borderColor="divider" borderRadius={2} p={2} mb={3}>
              <Typography variant="subtitle1" gutterBottom>
                Staff's Location
              </Typography>
              <Grid container spacing={2}>
                <Grid size={{ xs: 4 }}>
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
                      {countries.map((c) => (
                        <MenuItem key={c} value={c}>
                          {c}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid size={{ xs: 4 }}>
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
                      {(states[values.country] || []).map((s) => (
                        <MenuItem key={s} value={s}>
                          {s}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid size={{ xs: 4 }}>
                  <FormControl fullWidth required>
                    <InputLabel>City</InputLabel>
                    <Select
                      name="city"
                      value={values.city}
                      onChange={handleChange}
                      disabled={!values.state}
                    >
                      {(cities[values.state] || []).map((c) => (
                        <MenuItem key={c} value={c}>
                          {c}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            </Box>

            {/* Address Section */}
            <Box border={1} borderColor="divider" borderRadius={2} p={2} mb={3}>
              <Typography variant="subtitle1" gutterBottom>
                Address
              </Typography>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12 }}>
                  <TextField
                    name="address1"
                    label="Address Line 1"
                    placeholder="Address Line1"
                    fullWidth
                    value={values.address1}
                    onChange={handleChange}
                  />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <TextField
                    name="address2"
                    label="Address Line 2"
                    placeholder="Address Line2"
                    fullWidth
                    value={values.address2}
                    onChange={handleChange}
                  />
                </Grid>
                <Grid size={{ xs: 6 }}>
                  <TextField
                    name="address3"
                    label="Address Line 3"
                    placeholder="Address Line3"
                    fullWidth
                    value={values.address3}
                    onChange={handleChange}
                  />
                </Grid>
                <Grid size={{ xs: 6 }}>
                  <TextField
                    name="pincode"
                    label="Pincode"
                    placeholder="Pincode"
                    fullWidth
                    value={values.pincode}
                    onChange={handleChange}
                  />
                </Grid>
              </Grid>
            </Box>
          </>
        )}

       {step === 2 && (
  <>
    <StaffFormDetail formik={formik} />

    <Box display="flex" gap={2} justifyContent="center" mt={3}>
      <Button
        variant="contained"
        color="secondary"
        onClick={() => setStep(1)}
      >
        Back
      </Button>
      <Button type="submit" variant="contained" color="primary">
        Submit Final
      </Button>
    </Box>
  </>
)}


        <Box display="flex" gap={2} justifyContent="center" mt={3}>
          {step === 1 && (
            <>
              <Button
                variant="contained"
                color="error"
                onClick={() => resetForm()}
              >
                Clear
              </Button>
              <Button variant="contained" type="submit">
                Save & Continue
              </Button>
            </>
          )}
        </Box>
      </form>
    </Box>
  );
};

export default StaffForm;