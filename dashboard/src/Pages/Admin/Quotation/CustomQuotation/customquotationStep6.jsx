import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Radio,
  RadioGroup,
  FormControlLabel,
  Button,
  Divider,
} from '@mui/material';
import { useFormik } from 'formik';
import * as yup from 'yup';
import { useDispatch, useSelector } from "react-redux";
import {createCustomQuotation} from "../../../../features/quotation/customQuotationSlice";
import { toast } from "react-toastify";

// Validation schema
const validationSchema = yup.object({
  // Quotation Details
  adult: yup.number().min(0, 'Must be positive').required('Required'),
  child: yup.number().min(0, 'Must be positive'),
  kid: yup.number().min(0, 'Must be positive'),
  infants: yup.number().min(0, 'Must be positive'),
  mediPlan: yup.string().required('Required'),
  
  // Room Details
  noOfRooms: yup.number().min(1, 'At least 1 room required').required('Required'),
  roomType: yup.string().required('Required'),
  sharingType: yup.string().required('Required'),
  showCostPerAdult: yup.boolean(),
  
  // Company Margin
  marginPercent: yup.number().min(0, 'Must be positive').max(100, 'Cannot exceed 100%'),
  marginAmount: yup.number().min(0, 'Must be positive'),
  
  // Discount
  discount: yup.number().min(0, 'Must be positive'),
  
  // Taxes
  gstOn: yup.string().required('Required'),
  taxPercent: yup.number().min(0, 'Must be positive').max(100, 'Cannot exceed 100%'),
});

const CustomQuotationForm = ({ 
  formData,
  leadData, // Receive lead data for auto-population
  onSubmit, 
  loading 
}) => {
  const { 
    clientDetails, 
    pickupDrop, 
    tourDetails, 
    quotationDetails, 
    vehicleDetails 
  } = formData;
  
  const clientName = clientDetails?.clientName || "N/A";
  const sector = clientDetails?.sector || "N/A";
  const arrivalCity = tourDetails?.arrivalCity || "N/A";
  const departureCity = tourDetails?.departureCity || "N/A";
  const cities = pickupDrop || [];

  // Extract data from lead for auto-population
  const leadTourDetails = leadData?.tourDetails;
  const leadMembers = leadTourDetails?.members;
  const leadAccommodation = leadTourDetails?.accommodation;

  const formik = useFormik({
    initialValues: {
      // Quotation Details - Auto-populated from lead
      adult: leadMembers?.adults || 0,
      child: leadMembers?.children || 0,
      kid: leadMembers?.kidsWithoutMattress || 0,
      infants: leadMembers?.infants || 0,
      mediPlan: leadAccommodation?.mealPlan || '',
      
      // Room Details - Auto-populated from lead
      noOfRooms: leadAccommodation?.noOfRooms || 1,
      roomType: leadAccommodation?.hotelType?.[0] || '', // Take first hotel type
      sharingType: leadAccommodation?.sharingType || '',
      showCostPerAdult: true,
      
      // Hotel Prices
      standardPrice: '',
      deluxePrice: '',
      superiorPrice: '',
      
      // Company Margin
      marginPercent: 0,
      marginAmount: 0,
      
      // Discount
      discount: 0,
      
      // Taxes
      gstOn: 'Full',
      taxPercent: 0,
      applyGST: false,
    },
    validationSchema: validationSchema,
    onSubmit: async (values) => {
      try {
        const finalData = {
          ...formData,
          tourDetails: {
            ...formData.tourDetails,
            quotationDetails: {
              adults: values.adult,
              children: values.child,
              kids: values.kid,
              infants: values.infants,
              mealPlan: values.mediPlan,

              destinations: formData.pickupDrop.map(city => ({
                cityName: city.cityName,
                nights: city.nights,
                prices: {
                  standard: values.standardPrice || 0,
                  deluxe: values.deluxePrice || 0,
                  superior: values.superiorPrice || 0,
                },
              })),

              rooms: {
                numberOfRooms: values.noOfRooms,
                roomType: values.roomType,
                sharingType: values.sharingType,
                showCostPerAdult: values.showCostPerAdult,
              },

              companyMargin: {
                marginPercent: values.marginPercent || 0,
                marginAmount: values.marginAmount || 0,
              },

              discount: values.discount || 0,

              taxes: {
                gstOn: values.gstOn || "None",
                applyGST: values.applyGST || false,
              },

              signatureDetails: {
                regardsText: "Best Regards",
                signedBy: "",
              },
            },
          },
        };
        
        await onSubmit(finalData);
      } catch (error) {
        console.error("Submission error:", error);
      }
    },
  });

  // Debug log to see what data is being used
  useEffect(() => {
    console.log("🔍 Lead Data for Auto-population:", {
      leadMembers,
      leadAccommodation,
      initialValues: formik.initialValues
    });
  }, []);

  return (
    <Box sx={{ maxWidth: 1200, margin: '0 auto', p: 3 }}>
      <form onSubmit={formik.handleSubmit}>
        {/* Header */}
        <Typography variant="h4" component="h1" gutterBottom align="center">
          Custom Quotation
        </Typography>

        {/* Client Summary */}
        <Paper sx={{ p: 2, mb: 3, backgroundColor: '#f5f5f5' }}>
          <Typography variant="h6" gutterBottom>
            Client Summary {leadData && "✓ Auto-filled from Lead Data"}
          </Typography>
          <Grid container spacing={2}>
            <Grid size={{xs:12, sm:6, md:3}}>
              <Typography variant="body2"><strong>Client:</strong> {clientName}</Typography>
            </Grid>
            <Grid size={{xs:12, sm:6, md:3}}>
              <Typography variant="body2"><strong>Sector:</strong> {sector}</Typography>
            </Grid>
            <Grid size={{xs:12, sm:6, md:3}}>
              <Typography variant="body2"><strong>Arrival:</strong> {arrivalCity}</Typography>
            </Grid>
            <Grid size={{xs:12, sm:6, md:3}}>
              <Typography variant="body2"><strong>Departure:</strong> {departureCity}</Typography>
            </Grid>
          </Grid>
        </Paper>

        {/* Quotation Details Section */}
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Quotation Details {leadData && "✓ Auto-filled from Lead Data"}
          </Typography>
          
          <Grid container spacing={3} sx={{ mb: 2 }}>
            <Grid size={{xs:12, sm:6, md:2.4}}>
              <TextField
                fullWidth
                id="adult"
                name="adult"
                label="Adult"
                type="number"
                value={formik.values.adult}
                onChange={formik.handleChange}
                error={formik.touched.adult && Boolean(formik.errors.adult)}
                helperText={formik.touched.adult && formik.errors.adult}
                required
              />
            </Grid>
            <Grid size={{xs:12, sm:6, md:2.4}}>
              <TextField
                fullWidth
                id="child"
                name="child"
                label="Child(6-12yrs)"
                type="number"
                value={formik.values.child}
                onChange={formik.handleChange}
                error={formik.touched.child && Boolean(formik.errors.child)}
                helperText={formik.touched.child && formik.errors.child}
              />
            </Grid>
            <Grid size={{xs:12, sm:6, md:2.4}}>
              <TextField
                fullWidth
                id="kid"
                name="kid"
                label="Kid(2-5yrs)"
                type="number"
                value={formik.values.kid}
                onChange={formik.handleChange}
                error={formik.touched.kid && Boolean(formik.errors.kid)}
                helperText={formik.touched.kid && formik.errors.kid}
              />
            </Grid>
            <Grid size={{xs:12, sm:6, md:2.4}}>
              <TextField
                fullWidth
                id="infants"
                name="infants"
                label="Infants"
                type="number"
                value={formik.values.infants}
                onChange={formik.handleChange}
                error={formik.touched.infants && Boolean(formik.errors.infants)}
                helperText={formik.touched.infants && formik.errors.infants}
              />
            </Grid>
            <Grid size={{xs:12, sm:6, md:2.4}}>
              <TextField
                fullWidth
                id="mediPlan"
                name="mediPlan"
                label="Meal Plan"
                value={formik.values.mediPlan}
                onChange={formik.handleChange}
                error={formik.touched.mediPlan && Boolean(formik.errors.mediPlan)}
                helperText={formik.touched.mediPlan && formik.errors.mediPlan}
                required
              />
            </Grid>
          </Grid>

          {/* Destination Table */}
          <TableContainer component={Paper} variant="outlined">
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Destination</TableCell>
                  <TableCell>Nights</TableCell>
                  <TableCell>Standard Price</TableCell>
                  <TableCell>Deluxe Price</TableCell>
                  <TableCell>Superior Price</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {cities && cities.map((city, index) => (
                  <TableRow key={index}>
                    <TableCell>{city.cityName}</TableCell>
                    <TableCell>{city.nights}</TableCell>
                    <TableCell>
                      <TextField
                        fullWidth
                        size="small"
                        placeholder="Price"
                        name="standardPrice"
                        value={formik.values.standardPrice}
                        onChange={formik.handleChange}
                      />
                    </TableCell>
                    <TableCell>
                      <TextField
                        fullWidth
                        size="small"
                        placeholder="Price"
                        name="deluxePrice"
                        value={formik.values.deluxePrice}
                        onChange={formik.handleChange}
                      />
                    </TableCell>
                    <TableCell>
                      <TextField
                        fullWidth
                        size="small"
                        placeholder="Price"
                        name="superiorPrice"
                        value={formik.values.superiorPrice}
                        onChange={formik.handleChange}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Room Details */}
          <Typography variant="subtitle1" gutterBottom sx={{ mt: 3, fontWeight: 'bold' }}>
            Room Details {leadData && "✓ Auto-filled from Lead Data"}
          </Typography>
          <Grid container spacing={3} sx={{ mt: 1 }}>
            <Grid size={{xs:12, sm:4}}>
              <Typography variant="subtitle2" gutterBottom>
                No. of Rooms
              </Typography>
              <TextField
                fullWidth
                id="noOfRooms"
                name="noOfRooms"
                type="number"
                value={formik.values.noOfRooms}
                onChange={formik.handleChange}
                error={formik.touched.noOfRooms && Boolean(formik.errors.noOfRooms)}
                helperText={formik.touched.noOfRooms && formik.errors.noOfRooms}
                required
              />
            </Grid>
            <Grid size={{xs:12, sm:4}}>
              <FormControl fullWidth>
                <InputLabel id="room-type-label">Room Type *</InputLabel>
                <Select
                  labelId="room-type-label"
                  id="roomType"
                  name="roomType"
                  value={formik.values.roomType}
                  onChange={formik.handleChange}
                  error={formik.touched.roomType && Boolean(formik.errors.roomType)}
                  label="Room Type *"
                  required
                >
                  <MenuItem value="standard">Standard</MenuItem>
                  <MenuItem value="deluxe">Deluxe</MenuItem>
                  <MenuItem value="superior">Superior</MenuItem>
                  <MenuItem value="4 star">4 Star</MenuItem>
                  <MenuItem value="5 star">5 Star</MenuItem>
                  <MenuItem value="7 STAR">7 Star</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{xs:12, sm:4}}>
              <FormControl fullWidth>
                <InputLabel id="sharing-type-label">Sharing Type *</InputLabel>
                <Select
                  labelId="sharing-type-label"
                  id="sharingType"
                  name="sharingType"
                  value={formik.values.sharingType}
                  onChange={formik.handleChange}
                  error={formik.touched.sharingType && Boolean(formik.errors.sharingType)}
                  label="Sharing Type *"
                  required
                >
                  <MenuItem value="single">Single</MenuItem>
                  <MenuItem value="double">Double</MenuItem>
                  <MenuItem value="triple">Triple</MenuItem>
                  <MenuItem value="quad">Quad</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>

          {/* Show Cost Per Adult */}
          <FormControlLabel
            control={
              <Radio
                checked={formik.values.showCostPerAdult}
                onChange={(e) => formik.setFieldValue('showCostPerAdult', e.target.checked)}
                name="showCostPerAdult"
              />
            }
            label="Show Cost Per Adult"
            sx={{ mt: 2 }}
          />
        </Paper>

        {/* Rest of the component remains the same */}
        <Divider sx={{ my: 3 }} />

        {/* Company Margin Section */}
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Company Margin
          </Typography>
          <Grid container spacing={3}>
            <Grid size={{xs:12, sm:6}}>
              <TextField
                fullWidth
                id="marginPercent"
                name="marginPercent"
                label="Margin %"
                type="number"
                value={formik.values.marginPercent}
                onChange={formik.handleChange}
                error={formik.touched.marginPercent && Boolean(formik.errors.marginPercent)}
                helperText={formik.touched.marginPercent && formik.errors.marginPercent}
              />
            </Grid>
            <Grid size={{xs:12, sm:6}}>
              <TextField
                fullWidth
                id="marginAmount"
                name="marginAmount"
                label="Margin ₹"
                type="number"
                value={formik.values.marginAmount}
                onChange={formik.handleChange}
                error={formik.touched.marginAmount && Boolean(formik.errors.marginAmount)}
                helperText={formik.touched.marginAmount && formik.errors.marginAmount}
              />
            </Grid>
          </Grid>
        </Paper>

        {/* Discount Section */}
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Discount
          </Typography>
          <TextField
            fullWidth
            id="discount"
            name="discount"
            label="Discount Amount"
            type="number"
            value={formik.values.discount}
            onChange={formik.handleChange}
            error={formik.touched.discount && Boolean(formik.errors.discount)}
            helperText={formik.touched.discount && formik.errors.discount}
          />
        </Paper>

        <Divider sx={{ my: 3 }} />

        {/* Taxes Section */}
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h5" gutterBottom>
            Taxes
          </Typography>
          
          <Typography variant="subtitle1" gutterBottom sx={{ mt: 2 }}>
            GST ON
          </Typography>
          <FormControl component="fieldset">
            <RadioGroup
              row
              name="gstOn"
              value={formik.values.gstOn}
              onChange={formik.handleChange}
            >
              <FormControlLabel value="Full" control={<Radio />} label="Full" />
              <FormControlLabel value="Margin" control={<Radio />} label="Margin" />
              <FormControlLabel value="None" control={<Radio />} label="None" />
            </RadioGroup>
          </FormControl>

          <Typography variant="subtitle1" gutterBottom sx={{ mt: 3 }}>
            Apply GST
          </Typography>
          <FormControlLabel
            control={
              <Radio
                checked={formik.values.applyGST}
                onChange={(e) => formik.setFieldValue('applyGST', e.target.checked)}
                name="applyGST"
              />
            }
            label="Apply GST"
          />
          {formik.values.applyGST && (
            <TextField
              fullWidth
              id="taxPercent"
              name="taxPercent"
              label="Tax %"
              type="number"
              value={formik.values.taxPercent}
              onChange={formik.handleChange}
              error={formik.touched.taxPercent && Boolean(formik.errors.taxPercent)}
              helperText={formik.touched.taxPercent && formik.errors.taxPercent}
              sx={{ maxWidth: 200, mt: 1 }}
            />
          )}
        </Paper>

        {/* Submit Button */}
        <Box sx={{ textAlign: 'center', mt: 4 }}>
          <Button
            type="submit"
            variant="contained"
            size="large"
            sx={{ px: 6, py: 1.5 }}
            disabled={loading}
          >
            {loading ? 'Creating...' : 'Submit Quotation'}
          </Button>
        </Box>
      </form>
    </Box>
  );
};

export default CustomQuotationForm;