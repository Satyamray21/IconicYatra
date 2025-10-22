import React, { useState } from "react";
import {
  Box,
  Grid,
  TextField,
  Typography,
  Button,
  MenuItem,
  InputLabel,
  FormHelperText,
  IconButton,
} from "@mui/material";
import { useFormik } from "formik";
import * as Yup from "yup";
import DeleteIcon from "@mui/icons-material/Delete";
import FullQuotationStep4 from "./FullQuotationStep4";

const daySchema = Yup.object({
  arrivalAt: Yup.string().required("Required"),
  driveTo: Yup.string().required("Required"),
  distance: Yup.string().required("Required"),
  duration: Yup.string().required("Required"),
  title: Yup.string().required("Required"),
  itineraryDetails: Yup.string().required("Required"),
  aboutCity: Yup.string().required("Required"),
  dayImage: Yup.mixed().required("Image is required"),
});

const FullQuotationStep3 = () => {
  const [days, setDays] = useState([
    {
      arrivalAt: "",
      driveTo: "",
      distance: "",
      duration: "",
      title: "",
      itineraryDetails: "",
      aboutCity: "",
      dayImage: null,
    },
  ]);
  const [showStep4, setShowStep4] = useState(false);

  const handleAddDay = () => {
    setDays((prev) => [
      ...prev,
      {
        arrivalAt: "",
        driveTo: "",
        distance: "",
        duration: "",
        title: "",
        itineraryDetails: "",
        aboutCity: "",
        dayImage: null,
      },
    ]);
  };

  const handleRemoveDay = (index) => {
    setDays((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // validate all days before submitting
      await Promise.all(days.map((day) => daySchema.validate(day)));
      console.log("Form Data:", days);
      alert("Form Submitted Successfully!");
    } catch (err) {
      alert(`Validation Error: ${err.message}`);
    }
  };

  const handleChange = (index, field, value) => {
    setDays((prev) =>
      prev.map((day, i) => (i === index ? { ...day, [field]: value } : day))
    );
  };

   if (showStep4) {
      return <FullQuotationStep4 />;
    }

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
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

      {days.map((day, index) => (
        <Box
          key={index}
          sx={{
            border: "1px solid #ddd",
            borderRadius: 2,
            p: 2,
            mb: 3,
            position: "relative",
          }}
        >
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="subtitle1" fontWeight={600}>
              Day {index + 1} Itinerary 
            </Typography>
            {days.length > 1 && (
              <IconButton
                color="error"
                onClick={() => handleRemoveDay(index)}
                size="small"
              >
                <DeleteIcon />
              </IconButton>
            )}
          </Box>

          <Grid container spacing={2} mt={1}>
            {/* Arrival At */}
            <Grid size={{xs:12, sm:6}}>
              <TextField
                fullWidth
                label="Arrival At"
                value={day.arrivalAt}
                onChange={(e) =>
                  handleChange(index, "arrivalAt", e.target.value)
                }
              />
            </Grid>

            {/* Drive To */}
            <Grid size={{xs:12, sm:6}}>
              <TextField
                select
                fullWidth
                label="Drive To"
                value={day.driveTo}
                onChange={(e) => handleChange(index, "driveTo", e.target.value)}
              >
                <MenuItem value="Araku Valley">Araku Valley</MenuItem>
                <MenuItem value="Visakhapatnam">Visakhapatnam</MenuItem>
                <MenuItem value="Hyderabad">Hyderabad</MenuItem>
              </TextField>
            </Grid>

            {/* Distance */}
            <Grid size={{xs:12, sm:6}}>
              <TextField
                fullWidth
                label="Distance (Km)"
                value={day.distance}
                onChange={(e) => handleChange(index, "distance", e.target.value)}
              />
            </Grid>

            {/* Duration */}
            <Grid size={{xs:12, sm:6}}>
              <TextField
                fullWidth
                label="Duration (HH:MM)"
                value={day.duration}
                onChange={(e) => handleChange(index, "duration", e.target.value)}
              />
            </Grid>

            {/* Title */}
            <Grid size={{xs:12}}>
              <TextField
                fullWidth
                label="Title"
                value={day.title}
                onChange={(e) => handleChange(index, "title", e.target.value)}
              />
            </Grid>

            {/* Itinerary Details */}
            <Grid size={{xs:12}}>
              <Typography color="error" fontSize={14} mb={1}>
                Sightseeing locations are not available for this city. You can
                add sightseeing details in the note below.
              </Typography>
              <TextField
                multiline
                rows={4}
                fullWidth
                label={`Day ${index + 1} Itinerary Details`}
                value={day.itineraryDetails}
                onChange={(e) =>
                  handleChange(index, "itineraryDetails", e.target.value)
                }
              />
              <Typography variant="caption" color="green">
                You have written {day.itineraryDetails.length}/10000 characters
              </Typography>
            </Grid>

            {/* About City */}
            <Grid size={{xs:12}}>
              <TextField
                multiline
                rows={3}
                fullWidth
                label="About City"
                value={day.aboutCity}
                onChange={(e) =>
                  handleChange(index, "aboutCity", e.target.value)
                }
              />
              <Typography variant="caption" color="green">
                You have written {day.aboutCity.length}/10000 characters
              </Typography>
            </Grid>

            {/* Image Upload */}
            <Grid size={{xs:12}}>
              <InputLabel>Select Day {index + 1} Image (430px x 185px)</InputLabel>
              <Button variant="outlined" component="label" sx={{ mt: 1 }}>
                Choose File
                <input
                  type="file"
                  hidden
                  accept="image/*"
                  onChange={(e) =>
                    handleChange(index, "dayImage", e.currentTarget.files[0])
                  }
                />
              </Button>
              {!day.dayImage && (
                <FormHelperText error>Image is required</FormHelperText>
              )}
            </Grid>
          </Grid>
        </Box>
      ))}

      {/* Add Day Button */}
      <Box textAlign="center" mb={2}>
        <Button variant="outlined" onClick={handleAddDay}>
          + Add More Day
        </Button>
      </Box>

      {/* Submit */}
      <Box textAlign="center">
        <Typography variant="caption" color="error" display="block" mb={1}>
          * Fields Are Mandatory
        </Typography>
         <Button
                  variant="contained"
                  sx={{ px: 4, py: 1.5, borderRadius: 2 }}
                  onClick={() => setShowStep4(true)}
                >
                  Save & Continue
                </Button>
      </Box>
    </Box>
  );
};

export default FullQuotationStep3;
