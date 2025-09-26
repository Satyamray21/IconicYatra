import React, { useState } from "react";
import {
  Box,
  Grid,
  TextField,
  MenuItem,
  Button,
  Typography,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
} from "@mui/material";
import { useFormik } from "formik";
import HotelQuotationStep4 from "./HotelQuotationStep4";

const hotelTypes = ["5 Star", "4 Star", "3 Star", "Budget", "Guest House"];
const roomTypes = ["Single", "Double", "Triple"];
const mealPlans = ["Breakfast Only", "Half Board", "Full Board"];

const initialHotelNames = [
  "Hotel Sea View",
  "Hotel Coral Reef",
  "Hotel Blue Lagoon",
  "Hotel Ocean Breeze",
];

const emptySection = {
  hotelType: "",
  hotelName: "",
  roomType: "",
  mealPlan: "",
  noNights: "",
  noRooms: "",
  mattressAdult: "",
  mattressChild: "",
  costAdultEx: "",
  costChildEx: "",
  costWithout: "",
  costRoom: "",
  totalCost: "",
};

const QuotationForm = () => {
  const [hotelNames, setHotelNames] = useState(initialHotelNames);
  const [openDialog, setOpenDialog] = useState(false);
  const [newHotelName, setNewHotelName] = useState("");
  const [showStep4, setShowStep4] = useState(false);

  const formik = useFormik({
    initialValues: {
      sections: [
        { ...emptySection, label: "Standard (Anantpur)", removable: false },
        { ...emptySection, label: "Deluxe (Garacharma)", removable: false },
        { ...emptySection, label: "Superior (Garacharma)", removable: false },
      ],
    },
    onSubmit: (values) => {
      console.log("Form Values:", values);
    },
  });

  const handleAddHotel = () => {
    if (newHotelName.trim()) {
      setHotelNames([...hotelNames, newHotelName.trim()]);
      setNewHotelName("");
      setOpenDialog(false);
    }
  };

  const handleAddMore = () => {
    const count =
      formik.values.sections.filter((s) => s.removable).length / 3 + 1;

    const newGroup = [
      { ...emptySection, label: `Standard (City ${count})`, removable: true },
      { ...emptySection, label: `Deluxe (City ${count})`, removable: true },
      { ...emptySection, label: `Superior (City ${count})`, removable: true },
    ];

    formik.setFieldValue("sections", [...formik.values.sections, ...newGroup]);
  };

  const handleDeleteSection = (index) => {
    const updatedSections = formik.values.sections.filter(
      (_, i) => i !== index
    );
    formik.setFieldValue("sections", updatedSections);
  };

  const renderHotelSection = (section, index) => (
    <Paper
      sx={{ p: 2, mb: 2, position: "relative" }}
      variant="outlined"
      key={index}
    >
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={2}
      >
        <Typography variant="h6">{section.label}</Typography>

        {section.removable && (
          <Button
            color="error"
            variant="outlined"
            size="small"
            onClick={() => handleDeleteSection(index)}
          >
            Delete
          </Button>
        )}
      </Box>
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 3 }}>
          <TextField
            select
            fullWidth
            label="Hotel Type"
            name={`sections[${index}].hotelType`}
            value={formik.values.sections[index].hotelType}
            onChange={formik.handleChange}
          >
            {hotelTypes.map((type) => (
              <MenuItem key={type} value={type}>
                {type}
              </MenuItem>
            ))}
          </TextField>
        </Grid>

        {/* Hotel Name */}
        <Grid size={{ xs: 6, md: 3 }}>
          <TextField
            select
            fullWidth
            label="Hotel Name"
            name={`sections[${index}].hotelName`}
            value={formik.values.sections[index].hotelName}
            onChange={(e) => {
              if (e.target.value === "add_new") {
                setOpenDialog(true);
              } else {
                formik.handleChange(e);
              }
            }}
          >
            {hotelNames.map((name) => (
              <MenuItem key={name} value={name}>
                {name}
              </MenuItem>
            ))}
            <MenuItem
              value="add_new"
              sx={{ fontWeight: "bold", color: "blue" }}
            >
              + Add New
            </MenuItem>
          </TextField>
        </Grid>

        {/* Room Type */}
        <Grid size={{ xs: 6, md: 3 }}>
          <TextField
            select
            fullWidth
            label="Room Type"
            name={`sections[${index}].roomType`}
            value={formik.values.sections[index].roomType}
            onChange={formik.handleChange}
          >
            {roomTypes.map((type) => (
              <MenuItem key={type} value={type}>
                {type}
              </MenuItem>
            ))}
          </TextField>
        </Grid>

        {/* Meal Plan */}
        <Grid size={{ xs: 6, md: 3 }}>
          <TextField
            select
            fullWidth
            label="Meal Plan"
            name={`sections[${index}].mealPlan`}
            value={formik.values.sections[index].mealPlan}
            onChange={formik.handleChange}
          >
            {mealPlans.map((plan) => (
              <MenuItem key={plan} value={plan}>
                {plan}
              </MenuItem>
            ))}
          </TextField>
        </Grid>

        {/* Nights & Rooms */}
        <Grid size={{ xs: 6, md: 3 }}>
          <TextField
            fullWidth
            label="No Nights"
            name={`sections[${index}].noNights`}
            value={formik.values.sections[index].noNights}
            onChange={formik.handleChange}
          />
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <TextField
            fullWidth
            label="No of Rooms"
            name={`sections[${index}].noRooms`}
            value={formik.values.sections[index].noRooms}
            onChange={formik.handleChange}
          />
        </Grid>

        {/* Mattress */}
        <Grid size={{ xs: 6, md: 3 }}>
          <TextField
            fullWidth
            label="Mattress For Adult"
            name={`sections[${index}].mattressAdult`}
            value={formik.values.sections[index].mattressAdult}
            onChange={formik.handleChange}
          />
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <TextField
            fullWidth
            label="Mattress For Children"
            name={`sections[${index}].mattressChild`}
            value={formik.values.sections[index].mattressChild}
            onChange={formik.handleChange}
          />
        </Grid>

        {/* Divider row */}
        <Grid size={{ xs: 12 }}>
          <Divider color="#000" sx={{ my: 2 }}>
            <Typography variant="body1">Cost Per Unit</Typography>
          </Divider>
        </Grid>

        {/* Costs */}
        <Grid size={{ xs: 6, md: 3 }}>
          <TextField
            fullWidth
            label="Adult Ex Mattress"
            name={`sections[${index}].costAdultEx`}
            value={formik.values.sections[index].costAdultEx}
            onChange={formik.handleChange}
          />
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <TextField
            fullWidth
            label="Children Ex Mattress"
            name={`sections[${index}].costChildEx`}
            value={formik.values.sections[index].costChildEx}
            onChange={formik.handleChange}
          />
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <TextField
            fullWidth
            label="Without Mattress"
            name={`sections[${index}].costWithout`}
            value={formik.values.sections[index].costWithout}
            onChange={formik.handleChange}
          />
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <TextField
            fullWidth
            label="Room/Night"
            name={`sections[${index}].costRoom`}
            value={formik.values.sections[index].costRoom}
            onChange={formik.handleChange}
          />
        </Grid>

        {/* Total */}
        <Grid size={{ xs: 12, md: 6 }}>
          <TextField
            fullWidth
            label="Total Cost"
            name={`sections[${index}].totalCost`}
            value={formik.values.sections[index].totalCost}
            onChange={formik.handleChange}
          />
        </Grid>
      </Grid>
    </Paper>
  );
  if (showStep4) {
    return <HotelQuotationStep4 />;
  }
  return (
    <Box sx={{ p: 3 }}>
      <form onSubmit={formik.handleSubmit}>
        {formik.values.sections.map((section, index) =>
          renderHotelSection(section, index)
        )}

        <Box sx={{ mt: 2, textAlign: "center" }}>
          <Button
            type="button"
            variant="outlined"
            sx={{ mr: 2 }}
            onClick={handleAddMore}
          >
            + Add More
          </Button>
          <Box textAlign="center" sx={{ mt: 3 }}>
            <Button
              variant="contained"
              sx={{ px: 4, py: 1.5, borderRadius: 2 }}
              onClick={() => setShowStep4(true)}
            >
              Save & Continue
            </Button>
          </Box>
        </Box>
      </form>

      {/* Add Hotel Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>Add New Hotel</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Hotel Name"
            fullWidth
            value={newHotelName}
            onChange={(e) => setNewHotelName(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button onClick={handleAddHotel} variant="contained">
            Add
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default QuotationForm;
