import React, { useState } from "react";
import {
  Box,
  Grid,
  TextField,
  Typography,
  Button,
  MenuItem,
  InputLabel,
  IconButton,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import { useDispatch } from "react-redux";
import { step3Update } from "../../../../features/quotation/fullQuotationSlice";
import { useNavigate } from "react-router-dom";
import * as Yup from "yup";
import { toast } from "react-toastify";

// Yup schema (image optional)
const daySchema = Yup.object({
  arrivalAt: Yup.string().required("Required"),
  driveTo: Yup.string().required("Required"),
  distance: Yup.string().required("Required"),
  duration: Yup.string().required("Required"),
  title: Yup.string().required("Required"),
  itineraryDetails: Yup.string().required("Required"),
  aboutCity: Yup.string().required("Required"),
  dayImage: Yup.mixed(), // optional
});

// Dummy data for Drive To dropdown
const dummyDriveToOptions = [
  "Gangtok", "Lachung", "Pelling", "Ravangla", "Namchi",
  "Yumthang Valley", "Tsomgo Lake", "Nathula Pass", "Zuluk",
  "Kalimpong", "Darjeeling", "Mirik", "Kurseong", "Lava", "Lolegaon"
];

const FullQuotationStep3 = ({ quotationId, stayLocations }) => {
  const [days, setDays] = useState([{
    arrivalAt: "",
    driveTo: "",
    distance: "",
    duration: "",
    title: "",
    itineraryDetails: "",
    aboutCity: "",
    dayImage: null,
  }]);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const driveToOptions = stayLocations && stayLocations.length > 0
    ? stayLocations.map(loc => loc.city || loc.name)
    : dummyDriveToOptions;

  const handleAddDay = () => {
    setDays(prev => [
      ...prev,
      { arrivalAt: "", driveTo: "", distance: "", duration: "", title: "", itineraryDetails: "", aboutCity: "", dayImage: null }
    ]);
  };

  const handleRemoveDay = (index) => {
    setDays(prev => prev.filter((_, i) => i !== index));
  };

  const handleChange = (index, field, value) => {
    setDays(prev => prev.map((day, i) => i === index ? { ...day, [field]: value } : day));
  };

  const handleSave = async () => {
    try {
      // Validate each day
      await Promise.all(days.map(day => daySchema.validate(day)));

      // Prepare data for API
      const uploadedDays = await Promise.all(days.map(async day => {
        let imageUrl = "";

        // Upload if it's a new File
        if (day.dayImage instanceof File) {
          const formData = new FormData();
          formData.append("file", day.dayImage);
          formData.append("upload_preset", "your_cloudinary_preset");

          const uploadRes = await fetch(
            "https://api.cloudinary.com/v1_1/YOUR_CLOUD_NAME/image/upload",
            { method: "POST", body: formData }
          );
          const data = await uploadRes.json();
          imageUrl = data.secure_url;
        }

        // If dayImage is already a URL, use it
        if (!imageUrl && typeof day.dayImage === "string") {
          imageUrl = day.dayImage;
        }

        // Always send a string to backend
        return {
          dayTitle: day.title,
          dayNote: day.itineraryDetails || "",
          aboutCity: day.aboutCity || "",
          arrivalAt: day.arrivalAt || "",
          driveTo: day.driveTo || "",
          distance: day.distance || "",
          duration: day.duration || "",
          image: imageUrl || "", // ✅ empty string if no image
        };
      }));

      const resultAction = await dispatch(step3Update({ quotationId, itinerary: uploadedDays }));

      if (step3Update.fulfilled.match(resultAction)) {
        toast.success("Step 3 saved successfully!");
        navigate(`/fullquotation/${quotationId}/step/4`);
      } else {
        toast.error("Failed to save Step 3");
        console.error("Error:", resultAction.payload);
      }
    } catch (err) {
      toast.error(`Validation Error: ${err.message}`);
    }
  };

  return (
    <Box sx={{ border: "1px solid #ccc", borderRadius: 2, p: 3, mt: 2, maxWidth: 900, mx: "auto" }}>
      <Typography variant="h6" fontWeight={600} mb={2}>
        Quotation Itinerary
      </Typography>

      {days.map((day, index) => (
        <Box key={index} sx={{ border: "1px solid #ddd", borderRadius: 2, p: 2, mb: 3, position: "relative" }}>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="subtitle1" fontWeight={600}>
              Day {index + 1} Itinerary
            </Typography>
            {days.length > 1 && (
              <IconButton color="error" onClick={() => handleRemoveDay(index)} size="small">
                <DeleteIcon />
              </IconButton>
            )}
          </Box>

          <Grid container spacing={2} mt={1}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth label="Arrival At"
                value={day.arrivalAt}
                onChange={(e) => handleChange(index, "arrivalAt", e.target.value)}
                placeholder="e.g., Bagdogra Airport"
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                select fullWidth label="Drive To"
                value={day.driveTo}
                onChange={(e) => handleChange(index, "driveTo", e.target.value)}
                helperText={stayLocations && stayLocations.length > 0 ? "From selected stay locations" : "Popular destinations"}
              >
                {driveToOptions.map((location, idx) => (
                  <MenuItem key={idx} value={location}>{location}</MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth label="Distance (Km)"
                value={day.distance}
                onChange={(e) => handleChange(index, "distance", e.target.value)}
                placeholder="e.g., 120"
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth label="Duration (HH:MM)"
                value={day.duration}
                onChange={(e) => handleChange(index, "duration", e.target.value)}
                placeholder="e.g., 04:30"
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth label="Day Title"
                value={day.title}
                onChange={(e) => handleChange(index, "title", e.target.value)}
                placeholder="e.g., Arrival in Gangtok"
              />
            </Grid>

            <Grid item xs={12}>
              <Typography variant="body2" color="textSecondary" mb={1}>
                Day {index + 1} Itinerary Details
              </Typography>
              <TextField
                multiline rows={4} fullWidth
                placeholder="Describe the day's activities"
                value={day.itineraryDetails}
                onChange={(e) => handleChange(index, "itineraryDetails", e.target.value)}
              />
              <Typography variant="caption" color={day.itineraryDetails.length > 10000 ? "error" : "green"}>
                {day.itineraryDetails.length}/10000 characters
              </Typography>
            </Grid>

            <Grid item xs={12}>
              <Typography variant="body2" color="textSecondary" mb={1}>
                About City/Destination
              </Typography>
              <TextField
                multiline rows={3} fullWidth
                placeholder="Describe the city"
                value={day.aboutCity}
                onChange={(e) => handleChange(index, "aboutCity", e.target.value)}
              />
              <Typography variant="caption" color={day.aboutCity.length > 10000 ? "error" : "green"}>
                {day.aboutCity.length}/10000 characters
              </Typography>
            </Grid>

            <Grid item xs={12}>
              <InputLabel>Select Day {index + 1} Image (optional)</InputLabel>
              <Button variant="outlined" component="label" sx={{ mt: 1, mr: 2 }}>
                Choose File
                <input
                  type="file" hidden accept="image/*"
                  onChange={(e) => handleChange(index, "dayImage", e.currentTarget.files[0])}
                />
              </Button>
              {day.dayImage && (
                <Typography variant="caption" color="success.main">
                  Selected: {day.dayImage.name || "Already uploaded"}
                </Typography>
              )}
            </Grid>
          </Grid>
        </Box>
      ))}

      <Box textAlign="center" mb={2}>
        <Button variant="outlined" onClick={handleAddDay} sx={{ mb: 2 }}>+ Add More Day</Button>
        <Typography variant="caption" color="textSecondary" display="block">
          {stayLocations && stayLocations.length > 0
            ? `Using ${stayLocations.length} locations from Step 2`
            : "Using popular destination options"}
        </Typography>
      </Box>

      <Box textAlign="center">
        <Button
          variant="contained"
          sx={{ px: 4, py: 1.5, borderRadius: 2 }}
          onClick={handleSave}
        >
          Save & Continue to Step 4
        </Button>
      </Box>
    </Box>
  );
};

export default FullQuotationStep3;
