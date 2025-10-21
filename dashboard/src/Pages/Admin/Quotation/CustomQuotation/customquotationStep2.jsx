import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Grid,
  MenuItem,
  TextField,
  Typography,
  Paper,
  IconButton,
  Alert,
} from "@mui/material";

import DeleteIcon from "@mui/icons-material/Delete";
import { useFormik, FieldArray, FormikProvider } from "formik";
import * as Yup from "yup";
import { useDispatch, useSelector } from "react-redux";
import { fetchCitiesByState } from "../../../../features/location/locationSlice";
import { getAllLeads } from "../../../../features/leads/leadSlice";

const CustomQuotationStep2 = ({ sector, clientName, onNext }) => {
  const [totalNightsFromLead, setTotalNightsFromLead] = useState(0);
  const [calculatedTotalNights, setCalculatedTotalNights] = useState(0);
  const dispatch = useDispatch();

  const { cities = [], loading, error } = useSelector((state) => state.location);
  const { list: leadList = [] } = useSelector((state) => state.leads);

  useEffect(() => {
    if (sector) {
      dispatch(fetchCitiesByState({ countryName: "India", stateName: sector }));
    }
    dispatch(getAllLeads());
  }, [dispatch, sector]);

  // Find matching lead and get total nights
  useEffect(() => {
    if (clientName && sector && leadList.length > 0) {
      const lead = leadList.find((lead) => {
        const nameMatch = lead.personalDetails?.fullName?.trim().toLowerCase() === clientName?.trim().toLowerCase();
        const sectorMatch = 
          lead.tourDetails?.tourDestination?.trim().toLowerCase() === sector?.trim().toLowerCase() ||
          lead.location?.state?.trim().toLowerCase() === sector?.trim().toLowerCase();
        
        return nameMatch && sectorMatch;
      });

      if (lead) {
        const nights = lead.tourDetails?.accommodation?.noOfNights || 0;
        setTotalNightsFromLead(nights);
        console.log("🔍 Total nights from lead:", nights);
      }
    }
  }, [clientName, sector, leadList]);

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
      // Calculate total nights from all cities
      const totalNights = values.cities.reduce((sum, city) => {
        return sum + (parseInt(city.nights) || 0);
      }, 0);

      setCalculatedTotalNights(totalNights);

      // Validate if total nights match the lead data
      if (totalNightsFromLead > 0 && totalNights !== totalNightsFromLead) {
        formik.setFieldError('cities', `Total nights allocated (${totalNights}) does not match required nights (${totalNightsFromLead})`);
        return;
      }

      console.log("Step 2 Submitted - Cities:", values.cities);
      onNext(values.cities);
    },
  });

  // Calculate total nights whenever cities change
  useEffect(() => {
    const totalNights = formik.values.cities.reduce((sum, city) => {
      return sum + (parseInt(city.nights) || 0);
    }, 0);
    setCalculatedTotalNights(totalNights);
  }, [formik.values.cities]);

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

      {/* Total Nights Information */}
      {totalNightsFromLead > 0 && (
        <Alert 
          severity="info" 
          sx={{ mb: 2 }}
        >
          Total no. of nights allocated for this quotation: <strong>{totalNightsFromLead} nights</strong>
        </Alert>
      )}

      {/* Nights Validation Alert */}
      {totalNightsFromLead > 0 && calculatedTotalNights !== totalNightsFromLead && (
        <Alert 
          severity="warning" 
          sx={{ mb: 2 }}
        >
          Current total nights: <strong>{calculatedTotalNights}</strong> | Required: <strong>{totalNightsFromLead}</strong>
        </Alert>
      )}

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
                    <Grid size={{ xs: 12, md: 5 }}>
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
                        {cities.map((c, idx) => (
                          <MenuItem key={idx} value={c.name}>
                            {c.name}
                          </MenuItem>
                        ))}
                      </TextField>
                    </Grid>

                    {/* No. of Nights */}
                    <Grid size={{ xs: 12, md: 5 }}>
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
                    <Grid size={{ xs: 12, md: 2 }}>
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

          {/* Current Total Nights Display */}
          <Box sx={{ mb: 2, p: 1, backgroundColor: '#f5f5f5', borderRadius: 1 }}>
            <Typography variant="body2">
              <strong>Current Total Nights:</strong> {calculatedTotalNights}
              {totalNightsFromLead > 0 && (
                <span style={{ marginLeft: '10px', color: calculatedTotalNights === totalNightsFromLead ? 'green' : 'orange' }}>
                  ({calculatedTotalNights === totalNightsFromLead ? '✓ Matched' : 'Not matched'})
                </span>
              )}
            </Typography>
          </Box>

          {/* Next Button - Disabled if nights don't match */}
          <Box textAlign="center">
            <Button 
              type="submit" 
              variant="contained" 
              color="info"
              disabled={totalNightsFromLead > 0 && calculatedTotalNights !== totalNightsFromLead}
            >
              Next
            </Button>
          </Box>

          {/* Validation Error */}
          {formik.errors.cities && typeof formik.errors.cities === 'string' && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {formik.errors.cities}
            </Alert>
          )}
        </form>
      </FormikProvider>
    </Paper>
  );
};

export default CustomQuotationStep2;