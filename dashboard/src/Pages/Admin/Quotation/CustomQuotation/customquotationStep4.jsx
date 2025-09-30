import React, { useState } from "react";
import {
  Box,
  Button,
  Grid,
  IconButton,
  Paper,
  TextField,
  Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { useFormik, FormikProvider, FieldArray } from "formik";
import * as Yup from "yup";
import DeleteIcon from "@mui/icons-material/Delete";
import CustomQuotationStep5 from "./customquotationStep5";

const validationSchema = Yup.object({
  days: Yup.array().of(
    Yup.object({
      dayTitle: Yup.string().required("Day Title is required"),
      dayNote: Yup.string().max(5000, "Max 5000 characters"),
      aboutCity: Yup.string().max(5000, "Max 5000 characters"),
    })
  ),
});

const CustomQuotationForm = () => {
  const [showStep5, setShowStep5] = useState(false);

  const formik = useFormik({
    initialValues: {
      days: [
        {
          dayTitle: "",
          dayNote: "",
          aboutCity: "",
          image: null,
        },
      ],
    },
    validationSchema,
    onSubmit: (values) => {
      console.log("Step 4 Submitted:", values);
      setShowStep5(true); // switch to Step 5
    },
  });

  // when Save & Continue clicked, show Step 5
  if (showStep5) {
    return <CustomQuotationStep5 />;
  }

  return (
    <FormikProvider value={formik}>
      <Paper sx={{ p: 3, position: "relative" }}>
        <Typography variant="h6" sx={{ mb: 2, fontWeight: "bold" }}>
          Custom Quotation
        </Typography>

        <form onSubmit={formik.handleSubmit}>
          <FieldArray
            name="days"
            render={(arrayHelpers) => (
              <>
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
                            onClick={() => arrayHelpers.remove(index)}
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
                          You have written {day.aboutCity.length}/5000
                          characters
                        </Typography>
                      </Grid>

                      {/* Image Upload */}
                      <Grid size={{ xs: 11 }}>
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

                {/* Add Day Button */}
                <Box textAlign="center" mb={2}>
                  <Button
                    variant="outlined"
                    startIcon={<AddIcon />}
                    onClick={() =>
                      arrayHelpers.push({
                        dayTitle: "",
                        dayNote: "",
                        aboutCity: "",
                        image: null,
                      })
                    }
                  >
                    Add Day
                  </Button>
                </Box>
              </>
            )}
          />

          {/* Submit Button */}
          <Grid container>
            <Grid size={{ xs: 12 }} textAlign="center">
              <Button type="submit" variant="contained" color="primary">
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
