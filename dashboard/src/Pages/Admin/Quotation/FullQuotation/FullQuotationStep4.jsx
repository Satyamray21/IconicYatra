import React, { useState, useEffect } from "react";
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
  Checkbox,
  FormControlLabel,
  FormGroup,
  CircularProgress,
} from "@mui/material";
import { useFormik } from "formik";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  step4Update,
  getQuotationById,
} from "../../../../features/quotation/fullQuotationSlice";

const hotelTypes = ["5 Star", "4 Star", "3 Star", "Budget", "Guest House"];
const roomTypes = ["Single", "Double", "Triple"];
const mealPlans = ["Breakfast Only", "Half Board", "Full Board"];

const initialHotelNames = [
  "Hotel Sea View",
  "Hotel Coral Reef",
  "Hotel Blue Lagoon",
  "Hotel Ocean Breeze",
];

const emptyAccommodationPlan = {
  hotelType: "",
  hotelName: "",
  roomType: "",
  mealPlan: "",
  noNights: 1,
  noOfRooms: 1,
  mattressForAdult: false,
  adultExBed: false,
  mattressForChildren: false,
  adultExMattress: 0,
  adultExCost: 0,
  childrenExMattress: 0,
  childrenExCost: 0,
  withoutMattress: false,
  withoutBedCost: 0,
  costNight: 0,
  totalCost: 0,
};

const FullQuotationStep4 = ({ quotationId }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { quotation, fetchLoading, loading } = useSelector(
    (state) => state.fullQuotation
  );

  const [hotelNames, setHotelNames] = useState(initialHotelNames);
  const [openDialog, setOpenDialog] = useState(false);
  const [newHotelName, setNewHotelName] = useState("");
  const [initialized, setInitialized] = useState(false);
  const [dataFetched, setDataFetched] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Fetch quotation once
  useEffect(() => {
    if (
      quotationId &&
      quotationId !== "new" &&
      !dataFetched &&
      (!quotation || quotation.quotationId !== quotationId)
    ) {
      dispatch(getQuotationById({ quotationId }));
      setDataFetched(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quotationId]);

  // Initialize form when quotation data is loaded
  useEffect(() => {
    if (
      quotation?.stayLocation?.length > 0 &&
      !initialized &&
      !fetchLoading
    ) {
      formik.setValues({
        stayLocation: quotation.stayLocation.map((loc, i) => ({
          city: loc.city || `City ${i + 1}`,
          order: loc.order || i + 1,
          nights: loc.nights || 1,
          standard: loc.standard || { ...emptyAccommodationPlan },
          deluxe: loc.deluxe || { ...emptyAccommodationPlan },
          superior: loc.superior || { ...emptyAccommodationPlan },
        })),
      });
      setInitialized(true);
    }
  }, [quotation, fetchLoading, initialized]);

  // ---------- Formik ----------
  const formik = useFormik({
    initialValues: { stayLocation: [] },
    enableReinitialize: false,
    onSubmit: async (values) => {
      if (!quotationId || quotationId === "new") {
        toast.error("Quotation ID is missing!");
        return;
      }

      if (!values.stayLocation?.length) {
        toast.error("Please complete Step 2 before filling accommodations.");
        return;
      }

      setSubmitting(true);
      try {
        const res = await dispatch(
          step4Update({ quotationId, stayLocation: values.stayLocation })
        );
        if (step4Update.fulfilled.match(res)) {
          toast.success("Accommodation details saved successfully!");
          navigate(`/fullquotation/${quotationId}/step/5`);
        } else {
          toast.error(
            res.payload?.message || "Failed to save accommodation details"
          );
        }
      } catch (err) {
        console.error(err);
        toast.error("Unexpected error while saving");
      } finally {
        setSubmitting(false);
      }
    },
  });

  // ---------- Helpers ----------
  const calculateTotalCost = (cityIndex, category) => {
    const loc = formik.values.stayLocation[cityIndex];
    if (!loc) return;
    const plan = loc[category];

    const total =
      (plan.costNight || 0) * (plan.noOfRooms || 1) * (loc.nights || 1) +
      (plan.adultExCost || 0) * (plan.adultExMattress || 0) +
      (plan.childrenExCost || 0) * (plan.childrenExMattress || 0) +
      (plan.withoutBedCost || 0);

    formik.setFieldValue(
      `stayLocation[${cityIndex}].${category}.totalCost`,
      total
    );
  };

  const handleAddHotel = () => {
    if (newHotelName.trim()) {
      setHotelNames([...hotelNames, newHotelName.trim()]);
      toast.success("Hotel added successfully!");
      setNewHotelName("");
      setOpenDialog(false);
    }
  };

  // ---------- Render Accommodation Plan ----------
  const renderAccommodationPlan = (label, category, cityIndex) => {
    const loc = formik.values.stayLocation[cityIndex];
    const plan = loc[category] || {};

    return (
      <Paper sx={{ p: 2, bgcolor: "#fafafa" }} variant="outlined">
        <Typography variant="subtitle1" gutterBottom color="primary">
          {label}
        </Typography>
        <Grid container spacing={1.5}>
          {/* Hotel Type */}
          <Grid item xs={12}>
            <TextField
              select
              fullWidth
              size="small"
              label="Hotel Type"
              name={`stayLocation[${cityIndex}].${category}.hotelType`}
              value={plan.hotelType || ""}
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
          <Grid item xs={12}>
            <TextField
              select
              fullWidth
              size="small"
              label="Hotel Name"
              name={`stayLocation[${cityIndex}].${category}.hotelName`}
              value={plan.hotelName || ""}
              onChange={(e) => {
                if (e.target.value === "add_new") setOpenDialog(true);
                else formik.handleChange(e);
              }}
            >
              {hotelNames.map((name) => (
                <MenuItem key={name} value={name}>
                  {name}
                </MenuItem>
              ))}
              <MenuItem value="add_new" sx={{ color: "blue", fontWeight: "bold" }}>
                + Add New Hotel
              </MenuItem>
            </TextField>
          </Grid>

          {/* Room Type */}
          <Grid item xs={12}>
            <TextField
              select
              fullWidth
              size="small"
              label="Room Type"
              name={`stayLocation[${cityIndex}].${category}.roomType`}
              value={plan.roomType || ""}
              onChange={formik.handleChange}
            >
              {roomTypes.map((r) => (
                <MenuItem key={r} value={r}>
                  {r}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          {/* Meal Plan */}
          <Grid item xs={12}>
            <TextField
              select
              fullWidth
              size="small"
              label="Meal Plan"
              name={`stayLocation[${cityIndex}].${category}.mealPlan`}
              value={plan.mealPlan || ""}
              onChange={formik.handleChange}
            >
              {mealPlans.map((mp) => (
                <MenuItem key={mp} value={mp}>
                  {mp}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          {/* Nights & Rooms */}
          <Grid item xs={6}>
            <TextField
              fullWidth
              size="small"
              type="number"
              label="No of Nights"
              name={`stayLocation[${cityIndex}].${category}.noNights`}
              value={plan.noNights || 1}
              onChange={formik.handleChange}
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              fullWidth
              size="small"
              type="number"
              label="No of Rooms"
              name={`stayLocation[${cityIndex}].${category}.noOfRooms`}
              value={plan.noOfRooms || 1}
              onChange={(e) => {
                formik.handleChange(e);
                calculateTotalCost(cityIndex, category);
              }}
            />
          </Grid>

          {/* Cost/Night */}
          <Grid item xs={12}>
            <TextField
              fullWidth
              size="small"
              type="number"
              label="Cost per Night (₹)"
              name={`stayLocation[${cityIndex}].${category}.costNight`}
              value={plan.costNight || 0}
              onChange={(e) => {
                formik.handleChange(e);
                calculateTotalCost(cityIndex, category);
              }}
            />
          </Grid>

          <Grid item xs={12}>
            <Divider sx={{ my: 1 }} />
            <Typography variant="subtitle2">Extra Bed / Mattress Options</Typography>
          </Grid>

          {/* Checkboxes */}
          {[
            ["mattressForAdult", "Mattress For Adult"],
            ["adultExBed", "Adult Extra Bed"],
            ["mattressForChildren", "Mattress For Children"],
            ["withoutMattress", "Without Mattress"],
          ].map(([key, label]) => (
            <Grid item xs={12} key={key}>
              <FormControlLabel
                control={
                  <Checkbox
                    name={`stayLocation[${cityIndex}].${category}.${key}`}
                    checked={plan[key] || false}
                    onChange={formik.handleChange}
                  />
                }
                label={label}
              />
            </Grid>
          ))}

          {/* Extra Costs */}
          {[
            ["adultExMattress", "Adult Ex Mattress Qty"],
            ["adultExCost", "Adult Ex Cost (₹)"],
            ["childrenExMattress", "Child Ex Mattress Qty"],
            ["childrenExCost", "Child Ex Cost (₹)"],
            ["withoutBedCost", "Without Bed Cost (₹)"],
          ].map(([key, label]) => (
            <Grid item xs={12} key={key}>
              <TextField
                fullWidth
                size="small"
                type="number"
                label={label}
                name={`stayLocation[${cityIndex}].${category}.${key}`}
                value={plan[key] || 0}
                onChange={(e) => {
                  formik.handleChange(e);
                  calculateTotalCost(cityIndex, category);
                }}
              />
            </Grid>
          ))}

          {/* Total */}
          <Grid item xs={12}>
            <TextField
              fullWidth
              size="small"
              type="number"
              label="Total Cost (₹)"
              name={`stayLocation[${cityIndex}].${category}.totalCost`}
              value={plan.totalCost || 0}
              InputProps={{ readOnly: true }}
              sx={{ "& input": { fontWeight: "bold", color: "primary.main" } }}
            />
          </Grid>
        </Grid>
      </Paper>
    );
  };

  // ---------- Render City ----------
  const renderCityAccommodation = (city, i) => (
    <Paper sx={{ p: 3, mb: 3 }} variant="outlined" key={i}>
      <Typography variant="h6" gutterBottom>
        {city.city} – {city.nights} Night(s)
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={12} md={4}>
          {renderAccommodationPlan("Standard", "standard", i)}
        </Grid>
        <Grid item xs={12} md={4}>
          {renderAccommodationPlan("Deluxe", "deluxe", i)}
        </Grid>
        <Grid item xs={12} md={4}>
          {renderAccommodationPlan("Superior", "superior", i)}
        </Grid>
      </Grid>
    </Paper>
  );

  // ---------- Loading ----------
  if (fetchLoading && !initialized) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        height="50vh"
        flexDirection="column"
      >
        <CircularProgress />
        <Typography sx={{ mt: 2 }}>Loading accommodation details...</Typography>
      </Box>
    );
  }

  // ---------- Main UI ----------
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom fontWeight="bold">
        Step 4: Accommodation Details
      </Typography>

      {!initialized ? (
        <Paper sx={{ p: 4, textAlign: "center" }}>
          <Typography color="textSecondary" variant="h6">
            Please complete Step 2 to add stay locations.
          </Typography>
          <Button
            variant="contained"
            sx={{ mt: 2 }}
            onClick={() => navigate(`/fullquotation/${quotationId}/step/2`)}
          >
            Go to Step 2
          </Button>
        </Paper>
      ) : (
        <form onSubmit={formik.handleSubmit}>
          <Typography color="textSecondary" sx={{ mb: 2 }}>
            Configure accommodation details for each city in your quotation.
          </Typography>

          {formik.values.stayLocation.map((city, i) =>
            renderCityAccommodation(city, i)
          )}

          <Box
            mt={4}
            display="flex"
            justifyContent="center"
            gap={2}
            textAlign="center"
          >
            <Button
              variant="outlined"
              size="large"
              onClick={() =>
                navigate(`/fullquotation/${quotationId}/step/3`)
              }
              disabled={submitting}
            >
              Back
            </Button>
            <Button
              type="submit"
              variant="contained"
              size="large"
              disabled={submitting || loading}
            >
              {submitting ? "Saving..." : "Save & Continue → Step 5"}
            </Button>
          </Box>
        </form>
      )}

      {/* Add Hotel Dialog */}
      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Add New Hotel</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Hotel Name"
            autoFocus
            margin="dense"
            value={newHotelName}
            onChange={(e) => setNewHotelName(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleAddHotel()}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleAddHotel}
            disabled={!newHotelName.trim()}
          >
            Add
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default FullQuotationStep4;
