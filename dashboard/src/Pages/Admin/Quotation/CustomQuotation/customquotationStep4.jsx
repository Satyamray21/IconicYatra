import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Grid,
  IconButton,
  Paper,
  TextField,
  Typography,
} from "@mui/material";
import { useFormik, FormikProvider } from "formik";
import * as Yup from "yup";
import DeleteIcon from "@mui/icons-material/Delete";

const validationSchema = Yup.object({
  days: Yup.array().of(
    Yup.object({
      dayTitle: Yup.string().required("Day Title is required"),
      dayNote: Yup.string().max(5000, "Max 5000 characters"),
      aboutCity: Yup.string().max(5000, "Max 5000 characters"),
    })
  ),
});

const CustomQuotationForm = ({
  clientName,
  sector,
  arrivalCity,
  departureCity,
  arrivalDate,
  departureDate,
  transport,
  cities,
  onNext
}) => {
  const [totalNights, setTotalNights] = useState(0);
  const [totalDays, setTotalDays] = useState(0);

  // Calculate total nights and days from cities data
  useEffect(() => {
    if (cities && cities.length > 0) {
      const nights = cities.reduce((sum, city) => sum + (parseInt(city.nights) || 0), 0);
      setTotalNights(nights);
      setTotalDays(nights + 1); // Total days = nights + 1 (including arrival day)
    }
  }, [cities]);

  // Generate initial days array based on total days
  const generateDaysArray = (daysCount) => {
    const days = [];
    for (let i = 1; i <= daysCount; i++) {
      days.push({
        dayTitle: `Day ${i}`,
        dayNote: "",
        aboutCity: "",
        image: null,
      });
    }
    return days;
  };

  const formik = useFormik({
    initialValues: {
      days: generateDaysArray(totalDays || 1), // Default to 1 day if no cities
    },
    validationSchema,
   onSubmit: (values) => {
  // Prepare only itinerary from Step 4
  const itineraryData = values.days.map((day) => ({
    dayTitle: day.dayTitle,
    dayNote: day.dayNote,
    aboutCity: day.aboutCity,
    image: day.image || null,
  }));

  // Call onNext with only itinerary
  onNext({ itinerary: itineraryData });
},

    enableReinitialize: true,
  });

  // Update days when totalDays changes
  useEffect(() => {
    if (totalDays > 0) {
      const newDays = generateDaysArray(totalDays);
      formik.setValues({ days: newDays });
    }
  }, [totalDays]);

  return (
    <FormikProvider value={formik}>
      <Paper sx={{ p: 3, position: "relative" }}>
        <Typography variant="h6" sx={{ mb: 2, fontWeight: "bold" }}>
          Custom Quotation - Itinerary
        </Typography>

        {/* Days Information */}
        <Box sx={{ mb: 3, p: 2, backgroundColor: '#f5f5f5', borderRadius: 1 }}>
          <Typography variant="body1">
            <strong>Total Nights:</strong> {totalNights} | <strong>Total Days:</strong> {totalDays}
          </Typography>
          <Typography variant="caption" color="textSecondary">
            {totalDays} days automatically generated based on {totalNights} nights from previous step
          </Typography>
        </Box>

        <form onSubmit={formik.handleSubmit}>
          {formik.values.days.map((day, index) => (
            <Paper
              key={index}
              sx={{ p: 2, mb: 2, border: "1px solid #ddd" }}
            >
              <Grid container spacing={2} alignItems="center">
                <Grid size={{ xs: 11 }}>
                  <Typography
                    variant="subtitle1"
                    sx={{ mb: 1, fontWeight: "bold" }}
                  >
                    Day {index + 1}
                  </Typography>
                </Grid>
                <Grid size={{ xs: 1 }}>
                  {formik.values.days.length > 1 && (
                    <IconButton
                      color="error"
                      onClick={() => {
                        const newDays = [...formik.values.days];
                        newDays.splice(index, 1);
                        formik.setValues({ days: newDays });
                      }}
                    >
                      <DeleteIcon />
                    </IconButton>
                  )}
                </Grid>

                {/* Day Title */}
                <Grid size={{ xs: 12 }}>
                  <TextField
                    fullWidth
                    required
                    label="Day Title"
                    name={`days[${index}].dayTitle`}
                    value={day.dayTitle}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={
                      formik.touched.days?.[index]?.dayTitle &&
                      Boolean(formik.errors.days?.[index]?.dayTitle)
                    }
                    helperText={
                      formik.touched.days?.[index]?.dayTitle &&
                      formik.errors.days?.[index]?.dayTitle
                    }
                  />
                </Grid>

                {/* Day Note */}
                <Grid size={{ xs: 12 }}>
                  <TextField
                    fullWidth
                    multiline
                    minRows={3}
                    label="Day Note"
                    name={`days[${index}].dayNote`}
                    value={day.dayNote}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                  />
                  <Typography variant="caption" color="green">
                    You have written {day.dayNote.length}/5000 characters
                  </Typography>
                </Grid>

                {/* About City */}
                <Grid size={{ xs: 12 }}>
                  <TextField
                    fullWidth
                    multiline
                    minRows={3}
                    label="About City"
                    name={`days[${index}].aboutCity`}
                    value={day.aboutCity}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                  />
                  <Typography variant="caption" color="green">
                    You have written {day.aboutCity.length}/5000 characters
                  </Typography>
                </Grid>

                {/* Image Upload */}
                <Grid size={{ xs: 12 }}>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    Add Image (For best view Image size - 430px X 185px)
                  </Typography>

                  <Button
                    variant="outlined"
                    component="label"
                    sx={{ width: 250, height: 50 }}
                  >
                    Choose File
                    <input
                      type="file"
                      accept="image/*"
                      hidden
                      onChange={(event) =>
                        formik.setFieldValue(
                          `days[${index}].image`,
                          event.currentTarget.files[0]
                        )
                      }
                    />
                  </Button>
                  {day.image && (
                    <Typography variant="caption" sx={{ ml: 2 }}>
                      {day.image.name}
                    </Typography>
                  )}
                </Grid>
              </Grid>
            </Paper>
          ))}

          {/* Submit Button */}
          <Grid container>
            <Grid size={{ xs: 12 }} textAlign="center">
              <Button type="submit" variant="contained" color="primary" size="large">
                Save & Continue
              </Button>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </FormikProvider>
  );
};

export default CustomQuotationForm;