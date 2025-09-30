import React, { useState } from "react";
import {
  Box,
  Button,
  Grid,
  MenuItem,
  TextField,
  Typography,
  Paper,
  IconButton,
} from "@mui/material";

import DeleteIcon from "@mui/icons-material/Delete";
import { useFormik, FieldArray, FormikProvider } from "formik";
import * as Yup from "yup";
import CustomQuotationStep3 from "./customquotationStep3";

const cities = ["Delhi", "Mumbai", "Bangalore", "Kolkata"];

const CustomQuotationStep2 = () => {
  const [showStep3, setShowStep3] = useState(false);

  const formik = useFormik({
    initialValues: {
      cities: [
        {
          cityName: "",
          nights: "",
        },
      ],
    },
    validationSchema: Yup.object({
      cities: Yup.array().of(
        Yup.object({
          cityName: Yup.string().required("City Name is required"),
          nights: Yup.number()
            .typeError("Must be a number")
            .positive("Must be positive")
            .integer("Must be an integer")
            .required("No. of Nights is required"),
        })
      ),
    }),
    onSubmit: (values) => {
      console.log("Step 2 Submitted:", values);
      setShowStep3(true); // open Step 3 form
    },
  });

  if (showStep3) {
    return <CustomQuotationStep3 />;
  }

  return (
    <Paper
      elevation={1}
      sx={{
        p: 3,
        width: "100%",
        maxWidth: 700,
        position: "relative",
        margin: "auto",
      }}
    >
      {/* Title */}
      <Typography variant="h6" fontWeight="bold" gutterBottom>
        Custom Quotation
      </Typography>

      {/* Section Title */}
      <Typography
        variant="subtitle1"
        fontWeight="bold"
        sx={{ borderBottom: "1px solid #ddd", mb: 2 }}
      >
        Pickup/Drop
      </Typography>

      <FormikProvider value={formik}>
        <form onSubmit={formik.handleSubmit}> 
          <FieldArray
            name="cities"
            render={(arrayHelpers) => (
              <>
                {formik.values.cities.map((city, index) => (
                  <Grid
                    container
                    spacing={2}
                    key={index}
                    alignItems="center"
                    sx={{ mb: 1 }}
                  >
                    {/* City Name */}
                    <Grid size={{xs:12, md:5}}>
                      <TextField
                        fullWidth
                        select
                        label="City Name"
                        name={`cities[${index}].cityName`}
                        value={city.cityName}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        error={
                          formik.touched.cities?.[index]?.cityName &&
                          Boolean(formik.errors.cities?.[index]?.cityName)
                        }
                        helperText={
                          formik.touched.cities?.[index]?.cityName &&
                          formik.errors.cities?.[index]?.cityName
                        }
                      >
                        {cities.map((c) => (
                          <MenuItem key={c} value={c}>
                            {c}
                          </MenuItem>
                        ))}
                      </TextField>
                    </Grid>

                    {/* No. of Nights */}
                    <Grid size={{xs:12, md:5}}>
                      <TextField
                        fullWidth
                        type="number"
                        label="No. of Nights"
                        name={`cities[${index}].nights`}
                        value={city.nights}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        error={
                          formik.touched.cities?.[index]?.nights &&
                          Boolean(formik.errors.cities?.[index]?.nights)
                        }
                        helperText={
                          formik.touched.cities?.[index]?.nights &&
                          formik.errors.cities?.[index]?.nights
                        }
                      />
                    </Grid>

                    {/* Delete Button */}
                    <Grid size={{xs:12, md:2}}>
                      <IconButton
                        color="error"
                        onClick={() => arrayHelpers.remove(index)}
                        disabled={formik.values.cities.length === 1}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Grid>
                  </Grid>
                ))}

                {/* Add City Button */}
                <Box sx={{ mb: 2 }}>
                  <Button
                    type="button"
                    variant="contained"
                    color="primary"
                    onClick={() =>
                      arrayHelpers.push({ cityName: "", nights: "" })
                    }
                  >
                    Add City
                  </Button>
                </Box>
              </>
            )}
          />

          {/* Next Button */}
          <Box textAlign="center">
            <Button type="submit" variant="contained" color="info">
              Next
            </Button>
          </Box>
        </form>
      </FormikProvider>
    </Paper>
  );
};

export default CustomQuotationStep2;
