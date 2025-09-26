import React, { useState } from "react";
import {
  Box,
  Grid,
  TextField,
  MenuItem,
  Button,
  Typography,
  Paper,
  RadioGroup,
  FormControlLabel,
  Radio,
  Checkbox,
  Autocomplete,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { useFormik } from "formik";
import * as Yup from "yup";

import HotelQuotationStep2 from "./HotelQuotationStep2";

const data = {
  clients: ["Client A", "Client B", "Client C"],
  sectors: [
    "Andhra Pradesh",
    "Arunachal Pradesh",
    "Assam",
    "Bihar",
    "Chhattisgarh",
    "Delhi",
    "Goa",
    "Gujarat",
    "Haryana",
    "Himachal Pradesh",
    "Manipur",
  ],
  countries: [
    "United States",
    "United Kingdom",
    "Canada",
    "Australia",
    "France",
    "Germany",
    "Japan",
    "Singapore",
    "Thailand",
    "UAE",
  ],
  cities: ["Delhi", "Mumbai", "Chennai"],
  locations: ["Airport", "Railway Station", "Hotel"],
  services: [
    "Air Ticket",
    "Bus Ticket",
    "Covid Pass",
    "Cruise",
    "Hotel",
    "Vehicle",
    "Visa",
  ],
  hotelTypes: ["3 Star", "4 Star", "5 Star"],
  mealPlans: ["Breakfast Only", "Half Board", "Full Board"],
  sharingTypes: ["Single", "Double", "Triple"],
};

const validationSchema = Yup.object({
  clientName: Yup.string().required("Required"),
  sector: Yup.string().required("Required"),
  arrivalDate: Yup.date().required("Required"),
  departureDate: Yup.date().required("Required"),
  quotationTitle: Yup.string().required("Required"),
  services: Yup.array().min(1, "At least one service is required").required(),
});

const Section = ({ title, children }) => (
  <Paper
    sx={{
      p: 3,
      mb: 3,
      borderRadius: 2,
      backgroundColor: "#fafafa",
      boxShadow: 2,
    }}
  >
    <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
      {title}
    </Typography>
    <Grid container spacing={2} sx={{ mt: 1 }}>
      {children}
    </Grid>
  </Paper>
);

const QuotationForm = () => {
  const [servicesList, setServicesList] = useState(data.services);
  const [openDialog, setOpenDialog] = useState(false);
  const [newService, setNewService] = useState("");
  const [showStep2, setShowStep2] = useState(false);
  const formik = useFormik({
    initialValues: {
      clientName: "",
      tourType: "Domestic",
      sector: "", 
      showCostPerAdult: false,
      services: [],
      adults: "",
      children: "",
      kids: "",
      infants: "",
      withoutMattress: false,
      hotelType: "",
      mealPlan: "",
      transport: "",
      sharingType: "",
      noOfRooms: "",
      noOfMattress: 0,
      arrivalDate: null,
      arrivalCity: "",
      arrivalLocation: "",
      departureDate: null,
      departureCity: "",
      departureLocation: "",
      nights: "",
      validFrom: null,
      validTill: null,
      createBy: "New Quotation",
      quotationTitle: "",
      initialNotes:
        "This is only tentative schedule for sightseeing and travel. Actual sightseeing may get affected due to weather, road conditions, local authority notices, shortage of timing, or off days.",
      banner: null,
    },
    validationSchema,
    onSubmit: (values) => {
      console.log("Form Data:", values);
      setShowStep2(true);
    },
  });

  const handleAddService = () => {
    if (newService && !servicesList.includes(newService)) {
      const updated = [...servicesList, newService];
      setServicesList(updated);
      formik.setFieldValue("services", [...formik.values.services, newService]);
    }
    setNewService("");
    setOpenDialog(false);
  };

  const pickupDropFields = [
    { name: "arrivalDate", label: "Arrival Date", type: "date" },
    { name: "arrivalCity", label: "Arrival City", options: data.cities },
    {
      name: "arrivalLocation",
      label: "Arrival Location",
      options: data.locations,
    },
    { name: "departureDate", label: "Departure Date", type: "date" },
    { name: "departureCity", label: "Departure City", options: data.cities },
    {
      name: "departureLocation",
      label: "Departure Location",
      options: data.locations,
    },
  ];

  if (showStep2) {
    return <HotelQuotationStep2 />;
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <form onSubmit={formik.handleSubmit}>
        {/* Client Details */}
        <Section title="Client Details">
          <Grid size={{ xs: 6 }}>
            <TextField
              select
              fullWidth
              name="clientName"
              label="Client Name"
              value={formik.values.clientName}
              onChange={formik.handleChange}
              error={formik.touched.clientName && !!formik.errors.clientName}
              helperText={formik.touched.clientName && formik.errors.clientName}
            >
              {data.clients.map((c) => (
                <MenuItem key={c} value={c}>
                  {c}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid size={{ xs: 6 }}>
            <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
              Tour Type
            </Typography>
            <RadioGroup
              row
              name="tourType"
              value={formik.values.tourType}
              onChange={formik.handleChange}
            >
              {["Domestic", "International"].map((t) => (
                <FormControlLabel
                  key={t}
                  value={t}
                  control={<Radio />}
                  label={t}
                />
              ))}
            </RadioGroup>
          </Grid>
          <Grid size={{ xs: 6 }}>
            <TextField
              select
              fullWidth
              name="sector"
              label="Sector"
              value={formik.values.sector}
              onChange={formik.handleChange}
              error={formik.touched.sector && !!formik.errors.sector}
              helperText={formik.touched.sector && formik.errors.sector}
            >
              {(formik.values.tourType === "Domestic"
                ? data.sectors
                : data.countries
              ).map((s) => (
                <MenuItem key={s} value={s}>
                  {s}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid size={{ xs: 6 }}>
            <FormControlLabel
              control={
                <Checkbox
                  name="showCostPerAdult"
                  checked={formik.values.showCostPerAdult}
                  onChange={formik.handleChange}
                />
              }
              label="Show Cost Per Adult"
            />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <Autocomplete
              multiple
              options={[...servicesList, "➕ Add New"]}
              value={formik.values.services}
              onChange={(_, val) => {
                if (val.includes("➕ Add New")) {
                  const filtered = val.filter((v) => v !== "➕ Add New");
                  formik.setFieldValue("services", filtered);
                  setOpenDialog(true);
                } else {
                  formik.setFieldValue("services", val);
                }
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Services Required"
                  error={formik.touched.services && !!formik.errors.services}
                  helperText={formik.touched.services && formik.errors.services}
                />
              )}
            />
          </Grid>
          {[
            { name: "adults", label: "No of Adults" },
            { name: "children", label: "No of Children" },
            { name: "kids", label: "No of Kids (2-5Yrs)" },
            { name: "infants", label: "No of Infants" },
          ].map((f) => (
            <Grid key={f.name} size={{ xs: 3 }}>
              <TextField
                fullWidth
                name={f.name}
                label={f.label}
                value={formik.values[f.name]}
                onChange={formik.handleChange}
              />
            </Grid>
          ))}
          <Grid size={{ xs: 12 }}>
            <FormControlLabel
              control={
                <Checkbox
                  name="withoutMattress"
                  checked={formik.values.withoutMattress}
                  onChange={formik.handleChange}
                />
              }
              label="Without Mattress"
              sx={{ color: "orange" }}
            />
          </Grid>
        </Section>

        {/* Accommodation */}
        <Section title="Accommodation & Facility">
          {[
            {
              name: "hotelType",
              label: "Hotel Type",
              options: data.hotelTypes,
            },
            { name: "mealPlan", label: "Meal Plan", options: data.mealPlans },
            {
              name: "sharingType",
              label: "Sharing Type",
              options: data.sharingTypes,
            },
          ].map((f) => (
            <Grid key={f.name} size={{ xs: 4 }}>
              <TextField
                select
                fullWidth
                name={f.name}
                label={f.label}
                value={formik.values[f.name]}
                onChange={formik.handleChange}
              >
                {f.options.map((o) => (
                  <MenuItem key={o} value={o}>
                    {o}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
          ))}
          <Grid size={{ xs: 4 }}>
            <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
              Transport
            </Typography>
            <RadioGroup
              row
              name="transport"
              value={formik.values.transport}
              onChange={formik.handleChange}
            >
              {["Yes", "No"].map((t) => (
                <FormControlLabel
                  key={t}
                  value={t}
                  control={<Radio />}
                  label={t}
                />
              ))}
            </RadioGroup>
          </Grid>
          {[
            { name: "noOfRooms", label: "No of Rooms" },
            { name: "noOfMattress", label: "No of Mattress", type: "number" },
          ].map((f) => (
            <Grid key={f.name} size={{ xs: 4 }}>
              <TextField
                fullWidth
                {...f}
                value={formik.values[f.name]}
                onChange={formik.handleChange}
              />
            </Grid>
          ))}
        </Section>

        {/* Pickup / Drop */}
        <Section title="Pickup / Drop">
          {pickupDropFields.map((f) => (
            <Grid key={f.name} size={{ xs: 4 }}>
              {f.type === "date" ? (
                <DatePicker
                  label={f.label}
                  value={formik.values[f.name]}
                  onChange={(v) => formik.setFieldValue(f.name, v)}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      error: formik.touched[f.name] && !!formik.errors[f.name],
                      helperText:
                        formik.touched[f.name] && formik.errors[f.name],
                    },
                  }}
                />
              ) : (
                <TextField
                  select
                  fullWidth
                  name={f.name}
                  label={f.label}
                  value={formik.values[f.name]}
                  onChange={formik.handleChange}
                >
                  {f.options.map((o) => (
                    <MenuItem key={o} value={o}>
                      {o}
                    </MenuItem>
                  ))}
                </TextField>
              )}
            </Grid>
          ))}
          <Grid size={{ xs: 4 }}>
            <TextField
              fullWidth
              name="nights"
              label="Nights"
              type="number"
              value={formik.values.nights}
              onChange={formik.handleChange}
            />
          </Grid>
        </Section>

        {/* Validity */}
        <Section title="Quotation Validity">
          {["validFrom", "validTill"].map((f) => (
            <Grid key={f} size={{ xs: 6 }}>
              <DatePicker
                label={f === "validFrom" ? "Valid From" : "Valid Till"}
                value={formik.values[f]}
                onChange={(v) => formik.setFieldValue(f, v)}
                slotProps={{ textField: { fullWidth: true } }}
              />
            </Grid>
          ))}
        </Section>

        {/* Quotation */}
        <Section title="Quotation">
          <Grid size={{ xs: 4 }}>
            <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
              Create By
            </Typography>
            <RadioGroup
              row
              name="createBy"
              value={formik.values.createBy}
              onChange={formik.handleChange}
            >
              <FormControlLabel
                value="New Quotation"
                control={<Radio />}
                label="New Quotation"
              />
            </RadioGroup>
          </Grid>
          <Grid size={{ xs: 8 }}>
            <TextField
              fullWidth
              name="quotationTitle"
              label="Quotation Title"
              value={formik.values.quotationTitle}
              onChange={formik.handleChange}
              error={
                formik.touched.quotationTitle && !!formik.errors.quotationTitle
              }
              helperText={
                formik.touched.quotationTitle && formik.errors.quotationTitle
              }
            />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <TextField
              fullWidth
              multiline
              rows={4}
              name="initialNotes"
              label="Initial Notes"
              value={formik.values.initialNotes}
              onChange={formik.handleChange}
              InputProps={{ sx: { color: "#555" } }}
            />
            <Typography variant="caption" color="green">
              {formik.values.initialNotes.length}/200 characters
            </Typography>
          </Grid>
          <Grid size={{ xs: 12 }}>
            <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
              Select Banner Image (860px X 400px)
            </Typography>
            <Button
              variant="outlined"
              component="label"
              sx={{ textTransform: "none", borderRadius: 2, px: 3, py: 1 }}
            >
              Upload Banner
              <input
                type="file"
                hidden
                onChange={(e) =>
                  formik.setFieldValue("banner", e.currentTarget.files[0])
                }
              />
            </Button>
            {formik.values.banner && (
              <Typography variant="body2" sx={{ ml: 2, mt: 1 }}>
                {formik.values.banner.name}
              </Typography>
            )}
          </Grid>
        </Section>

        <Box textAlign="center" sx={{ mt: 3 }}>
          <Button
            type="submit"
            variant="contained"
            sx={{ px: 4, py: 1.5, borderRadius: 2 }}
          >
            Save & Continue
          </Button>
        </Box>
      </form>
      {/* Add New Service Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>Add New Service</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Service Name"
            fullWidth
            value={newService}
            onChange={(e) => setNewService(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button onClick={handleAddService} variant="contained">
            Add
          </Button>
        </DialogActions>
      </Dialog>
    </LocalizationProvider>
  );
};

export default QuotationForm;
