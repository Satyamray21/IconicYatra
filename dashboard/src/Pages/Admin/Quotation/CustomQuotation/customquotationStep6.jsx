import React, { useEffect } from 'react';
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
import { useDispatch } from "react-redux";
import { createCustomQuotation } from "../../../../features/quotation/customQuotationSlice";
import { toast } from "react-toastify";

// Validation schema
const validationSchema = yup.object({
  adult: yup.number().min(0, 'Must be positive').required('Required'),
  child: yup.number().min(0, 'Must be positive'),
  kid: yup.number().min(0, 'Must be positive'),
  infants: yup.number().min(0, 'Must be positive'),
  mediPlan: yup.string().required('Required'),
  noOfRooms: yup.number().min(1, 'At least 1 room required').required('Required'),
  roomType: yup.string().required('Required'),
  sharingType: yup.string().required('Required'),
  showCostPerAdult: yup.boolean(),
  marginPercent: yup.number().min(0, 'Must be positive').max(100, 'Cannot exceed 100%'),
  marginAmount: yup.number().min(0, 'Must be positive'),
  discount: yup.number().min(0, 'Must be positive'),
  gstOn: yup.string().required('Required'),
  taxPercent: yup.number().min(0, 'Must be positive').max(100, 'Cannot exceed 100%'),
});

const CustomQuotationForm = ({ formData, leadData, onSubmit, loading }) => {
  const dispatch = useDispatch();

  const { clientDetails, pickupDrop, tourDetails } = formData;
  const cities = pickupDrop || [];
  const leadTourDetails = leadData?.tourDetails;
  const leadMembers = leadTourDetails?.members;
  const leadAccommodation = leadTourDetails?.accommodation;

  const initializeCityPrices = (cities) => {
    return cities.reduce((acc, city, index) => {
      acc[index] = { hotelName: '', standardPrice: '', deluxePrice: '', superiorPrice: '' };
      return acc;
    }, {});
  };

  const formik = useFormik({
    initialValues: {
      adult: leadMembers?.adults || 0,
      child: leadMembers?.children || 0,
      kid: leadMembers?.kidsWithoutMattress || 0,
      infants: 0,
      mediPlan: leadAccommodation?.mealPlan || '',
      noOfRooms: leadAccommodation?.noOfRooms || 1,
      roomType: leadAccommodation?.hotelType?.[0] || '',
      sharingType: leadAccommodation?.sharingType || '',
      showCostPerAdult: true,
      cityPrices: initializeCityPrices(cities),
      marginPercent: 0,
      marginAmount: 0,
      discount: 0,
      gstOn: 'Full',
      taxPercent: 0,
      applyGST: false,
    },
    validationSchema,
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
              destinations: cities.map((city, index) => ({
                cityName: city.cityName,
                nights: city.nights,
                hotelName: values.cityPrices[index]?.hotelName || '',
                prices: {
                  standard: values.cityPrices[index]?.standardPrice || 0,
                  deluxe: values.cityPrices[index]?.deluxePrice || 0,
                  superior: values.cityPrices[index]?.superiorPrice || 0,
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
                taxPercent: values.taxPercent || 0,
              },
              signatureDetails: {
                regardsText: "Best Regards",
                signedBy: "",
              },
            },
          },
        };
        if (onSubmit) {
          await onSubmit(finalData);
        } else {
          await dispatch(createCustomQuotation(finalData)).unwrap();
          toast.success("Quotation created successfully!");
        }
      } catch (error) {
        console.error(error);
        toast.error("Failed to create quotation");
      }
    },
  });

  useEffect(() => {
    if (cities.length > 0) {
      formik.setFieldValue('cityPrices', initializeCityPrices(cities));
    }
  }, [cities.length]);

  const calculateTotals = () => {
    const totals = { totalNights: 0, totalStandard: 0, totalDeluxe: 0, totalSuperior: 0 };
    cities.forEach((city, index) => {
      const nights = parseInt(city.nights) || 0;
      const standardPrice = parseFloat(formik.values.cityPrices?.[index]?.standardPrice) || 0;
      const deluxePrice = parseFloat(formik.values.cityPrices?.[index]?.deluxePrice) || 0;
      const superiorPrice = parseFloat(formik.values.cityPrices?.[index]?.superiorPrice) || 0;
      totals.totalNights += nights;
      totals.totalStandard += standardPrice * nights;
      totals.totalDeluxe += deluxePrice * nights;
      totals.totalSuperior += superiorPrice * nights;
    });
    return totals;
  };

  const totals = calculateTotals();

  return (
    <Box sx={{ maxWidth: 1200, margin: '0 auto', p: 3 }}>
      <form onSubmit={formik.handleSubmit}>
        <Typography variant="h4" align="center" gutterBottom>Custom Quotation</Typography>

        {/* Client Summary */}
        <Paper sx={{ p: 2, mb: 3, backgroundColor: '#f5f5f5' }}>
          <Typography variant="h6" gutterBottom>Client Summary {leadData && "✓ Auto-filled from Lead Data"}</Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3}><Typography><strong>Client:</strong> {clientDetails?.clientName || "N/A"}</Typography></Grid>
            <Grid item xs={12} sm={6} md={3}><Typography><strong>Sector:</strong> {clientDetails?.sector || "N/A"}</Typography></Grid>
            <Grid item xs={12} sm={6} md={3}><Typography><strong>Arrival:</strong> {tourDetails?.arrivalCity || "N/A"}</Typography></Grid>
            <Grid item xs={12} sm={6} md={3}><Typography><strong>Departure:</strong> {tourDetails?.departureCity || "N/A"}</Typography></Grid>
          </Grid>
        </Paper>

        {/* Quotation Details */}
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>Quotation Details {leadData && "✓ Auto-filled from Lead Data"}</Typography>
          <Grid container spacing={3} sx={{ mb: 2 }}>
            <Grid item xs={12} sm={6} md={2.4}>
              <TextField fullWidth id="adult" name="adult" label="Adult" type="number" value={formik.values.adult} onChange={formik.handleChange} error={formik.touched.adult && Boolean(formik.errors.adult)} helperText={formik.touched.adult && formik.errors.adult} required />
            </Grid>
            <Grid item xs={12} sm={6} md={2.4}>
              <TextField fullWidth id="child" name="child" label="Child(6-12yrs)" type="number" value={formik.values.child} onChange={formik.handleChange} error={formik.touched.child && Boolean(formik.errors.child)} helperText={formik.touched.child && formik.errors.child} />
            </Grid>
            <Grid item xs={12} sm={6} md={2.4}>
              <TextField fullWidth id="kid" name="kid" label="Kid(2-5yrs)" type="number" value={formik.values.kid} onChange={formik.handleChange} error={formik.touched.kid && Boolean(formik.errors.kid)} helperText={formik.touched.kid && formik.errors.kid} />
            </Grid>
            <Grid item xs={12} sm={6} md={2.4}>
              <TextField fullWidth id="infants" name="infants" label="Infants" type="number" value={formik.values.infants} onChange={formik.handleChange} error={formik.touched.infants && Boolean(formik.errors.infants)} helperText={formik.touched.infants && formik.errors.infants} />
            </Grid>
            <Grid item xs={12} sm={6} md={2.4}>
              <TextField fullWidth id="mediPlan" name="mediPlan" label="Meal Plan" value={formik.values.mediPlan} onChange={formik.handleChange} error={formik.touched.mediPlan && Boolean(formik.errors.mediPlan)} helperText={formik.touched.mediPlan && formik.errors.mediPlan} required />
            </Grid>
          </Grid>

          {/* Room Details */}
          <Grid container spacing={3} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={4}>
              <TextField fullWidth id="noOfRooms" name="noOfRooms" type="number" label="No. of Rooms" value={formik.values.noOfRooms} onChange={formik.handleChange} error={formik.touched.noOfRooms && Boolean(formik.errors.noOfRooms)} helperText={formik.touched.noOfRooms && formik.errors.noOfRooms} required />
            </Grid>
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth>
                <InputLabel id="room-type-label">Room Type *</InputLabel>
                <Select labelId="room-type-label" id="roomType" name="roomType" value={formik.values.roomType} onChange={formik.handleChange} required>
                  <MenuItem value="standard">Standard</MenuItem>
                  <MenuItem value="deluxe">Deluxe</MenuItem>
                  <MenuItem value="superior">Superior</MenuItem>
                  <MenuItem value="4 star">4 Star</MenuItem>
                  <MenuItem value="5 star">5 Star</MenuItem>
                  <MenuItem value="7 STAR">7 Star</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth>
                <InputLabel id="sharing-type-label">Sharing Type *</InputLabel>
                <Select labelId="sharing-type-label" id="sharingType" name="sharingType" value={formik.values.sharingType} onChange={formik.handleChange} required>
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
            control={<Radio checked={formik.values.showCostPerAdult} onChange={(e) => formik.setFieldValue('showCostPerAdult', e.target.checked)} name="showCostPerAdult" />}
            label="Show Cost Per Adult"
            sx={{ mt: 2 }}
          />
        </Paper>

        {/* ====== City Prices Table ====== */}
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>Destinations & Prices</Typography>
          <TableContainer component={Paper} variant="outlined">
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Destination</TableCell>
                  <TableCell>Hotel Name</TableCell>
                  <TableCell>Nights</TableCell>
                  <TableCell>Standard Price</TableCell>
                  <TableCell>Deluxe Price</TableCell>
                  <TableCell>Superior Price</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {cities.map((city, index) => (
                  <TableRow key={index}>
                    <TableCell>{city.cityName}</TableCell>
                    <TableCell>
                      <TextField fullWidth size="small" placeholder="Hotel Name" name={`cityPrices[${index}].hotelName`} value={formik.values.cityPrices?.[index]?.hotelName || ''} onChange={formik.handleChange} />
                    </TableCell>
                    <TableCell>{city.nights}</TableCell>
                    <TableCell>
                      <TextField fullWidth size="small" type="number" name={`cityPrices[${index}].standardPrice`} value={formik.values.cityPrices?.[index]?.standardPrice || ''} onChange={formik.handleChange} />
                    </TableCell>
                    <TableCell>
                      <TextField fullWidth size="small" type="number" name={`cityPrices[${index}].deluxePrice`} value={formik.values.cityPrices?.[index]?.deluxePrice || ''} onChange={formik.handleChange} />
                    </TableCell>
                    <TableCell>
                      <TextField fullWidth size="small" type="number" name={`cityPrices[${index}].superiorPrice`} value={formik.values.cityPrices?.[index]?.superiorPrice || ''} onChange={formik.handleChange} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          <Box sx={{ mt: 2 }}>
            <Typography>Total Nights: {totals.totalNights}</Typography>
            <Typography>Total Standard: {totals.totalStandard}</Typography>
            <Typography>Total Deluxe: {totals.totalDeluxe}</Typography>
            <Typography>Total Superior: {totals.totalSuperior}</Typography>
          </Box>
        </Paper>

        {/* ====== Margins, Discounts, Taxes ====== */}
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>Company Margin</Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Margin %" type="number" name="marginPercent" value={formik.values.marginPercent} onChange={formik.handleChange} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Margin Amount" type="number" name="marginAmount" value={formik.values.marginAmount} onChange={formik.handleChange} />
            </Grid>
          </Grid>

          <Divider sx={{ my: 2 }} />

          <Typography variant="h6" gutterBottom>Discount & Taxes</Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={4}>
              <TextField fullWidth label="Discount" type="number" name="discount" value={formik.values.discount} onChange={formik.handleChange} />
            </Grid>
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth>
                <InputLabel>GST On</InputLabel>
                <Select name="gstOn" value={formik.values.gstOn} onChange={formik.handleChange}>
                  <MenuItem value="Full">Full</MenuItem>
                  <MenuItem value="Net">Net</MenuItem>
                  <MenuItem value="None">None</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField fullWidth label="Tax %" type="number" name="taxPercent" value={formik.values.taxPercent} onChange={formik.handleChange} />
            </Grid>
          </Grid>
        </Paper>

        <Box sx={{ textAlign: 'center', mt: 4 }}>
          <Button type="submit" variant="contained" size="large" sx={{ px: 6, py: 1.5 }} disabled={loading}>
            {loading ? 'Creating...' : 'Submit Quotation'}
          </Button>
        </Box>
      </form>
    </Box>
  );
};

export default CustomQuotationForm;
