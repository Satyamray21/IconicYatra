// customquotationStep4.jsx
import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Grid,
  IconButton,
  Paper,
  TextField,
  Typography,
  CircularProgress,
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

const CustomQuotationStep4 = ({
  clientName,
  sector,
  cities,
  onNext
}) => {
  const [totalNights, setTotalNights] = useState(0);
  const [totalDays, setTotalDays] = useState(0);
  const [uploading, setUploading] = useState(false);

  // Calculate total nights and days from cities data
  useEffect(() => {
    if (cities && cities.length > 0) {
      const nights = cities.reduce((sum, city) => sum + (parseInt(city.nights) || 0), 0);
      setTotalNights(nights);
      setTotalDays(nights + 1);
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
        imageFile: null, // For file object
      });
    }
    return days;
  };

  // customquotationStep4.jsx - Updated onSubmit function
const formik = useFormik({
  initialValues: {
    days: generateDaysArray(totalDays || 1),
  },
  validationSchema,
  onSubmit: async (values) => {
    setUploading(true);
    
    try {
      const formData = new FormData();
      
      // Append basic data
      formData.append('quotationId', localStorage.getItem('currentQuotationId'));
      formData.append('stepNumber', '4');
      formData.append('stepData', JSON.stringify({ 
        itinerary: values.days.map(day => ({
          dayTitle: day.dayTitle,
          dayNote: day.dayNote,
          aboutCity: day.aboutCity,
          image: day.image // Existing image URL if any
        }))
      }));

      // Append all image files with the same field name
      values.days.forEach((day, index) => {
        if (day.imageFile) {
          formData.append('itineraryImages', day.imageFile);
        }
      });

      await onNext(formData);
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setUploading(false);
    }
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

  const handleImageChange = (event, index) => {
    const file = event.target.files[0];
    if (file) {
      // Create preview URL
      const imageUrl = URL.createObjectURL(file);
      
      // Update formik values
      const newDays = [...formik.values.days];
      newDays[index] = {
        ...newDays[index],
        image: imageUrl, // For preview
        imageFile: file  // For upload
      };
      
      formik.setValues({ days: newDays });
    }
  };

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
            <Paper key={index} sx={{ p: 2, mb: 2, border: "1px solid #ddd" }}>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={11}>
                  <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: "bold" }}>
                    Day {index + 1}
                  </Typography>
                </Grid>
                <Grid item xs={1}>
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
                <Grid item xs={12}>
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
                <Grid item xs={12}>
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
                <Grid item xs={12}>
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
                <Grid item xs={12}>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    Add Image (For best view Image size - 430px X 185px)
                  </Typography>

                  {day.image && (
                    <Box sx={{ mb: 2 }}>
                      <img 
                        src={day.image} 
                        alt={`Day ${index + 1}`} 
                        style={{ 
                          maxWidth: '200px', 
                          maxHeight: '100px', 
                          objectFit: 'cover',
                          borderRadius: '4px'
                        }} 
                      />
                    </Box>
                  )}

                  <Button
                    variant="outlined"
                    component="label"
                    sx={{ width: 250, height: 50 }}
                    disabled={uploading}
                  >
                    {uploading ? <CircularProgress size={20} /> : "Choose File"}
                    <input
                      type="file"
                      accept="image/*"
                      hidden
                      onChange={(event) => handleImageChange(event, index)}
                    />
                  </Button>
                  {day.imageFile && (
                    <Typography variant="caption" sx={{ ml: 2 }}>
                      {day.imageFile.name}
                    </Typography>
                  )}
                </Grid>
              </Grid>
            </Paper>
          ))}

          {/* Submit Button */}
          <Grid container>
            <Grid item xs={12} textAlign="center">
              <Button 
                type="submit" 
                variant="contained" 
                color="primary" 
                size="large"
                disabled={uploading}
              >
                {uploading ? <CircularProgress size={24} /> : "Save & Continue"}
              </Button>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </FormikProvider>
  );
};

export default CustomQuotationStep4;