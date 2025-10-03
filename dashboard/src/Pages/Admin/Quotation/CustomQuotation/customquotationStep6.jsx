import React from 'react';
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

// Validation schema
const validationSchema = yup.object({
  // Quotation Details
  adult: yup.number().min(0, 'Must be positive').required('Required'),
  child: yup.number().min(0, 'Must be positive'),
  kid: yup.number().min(0, 'Must be positive'),
  infants: yup.number().min(0, 'Must be positive'),
  mediPlan: yup.string(),
  
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

const CustomQuotationForm = () => {
  const formik = useFormik({
    initialValues: {
      // Quotation Details
      adult: 0,
      child: 0,
      kid: 0,
      infants: 0,
      mediPlan: '',
      
      // Room Details
      noOfRooms: 1,
      roomType: '',
      sharingType: '',
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
      gstOn: 'full',
      taxPercent: 0,
    },
    validationSchema: validationSchema,
    onSubmit: (values) => {
      console.log('Form submitted:', values);
      // Handle form submission here
    },
  });

  return (
    <Box sx={{ maxWidth: 1200, margin: '0 auto', p: 3 }}>
      <form onSubmit={formik.handleSubmit}>
        {/* Header */}
        <Typography variant="h4" component="h1" gutterBottom align="center">
          Custom Quotation
        </Typography>

        {/* Quotation Details Section */}
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Quotation Details
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
              />
            </Grid>
            <Grid  size={{xs:12, sm:6, md:2.4}}>
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
                label="Medi Plan"
                value={formik.values.mediPlan}
                onChange={formik.handleChange}
                error={formik.touched.mediPlan && Boolean(formik.errors.mediPlan)}
                helperText={formik.touched.mediPlan && formik.errors.mediPlan}
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
                  <TableCell>Standard</TableCell>
                  <TableCell>Deluxe</TableCell>
                  <TableCell>Superior</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow>
                  <TableCell>Baba Mandir</TableCell>
                  <TableCell>5</TableCell>
                  <TableCell>
                    <TextField
                      fullWidth
                      size="small"
                      placeholder="Hotel Name"
                    />
                  </TableCell>
                  <TableCell>
                    <TextField
                      fullWidth
                      size="small"
                      placeholder="Hotel Name"
                    />
                  </TableCell>
                  <TableCell>
                    <TextField
                      fullWidth
                      size="small"
                      placeholder="Hotel Name"
                    />
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Total Cost</TableCell>
                  <TableCell>5</TableCell>
                  <TableCell>
                    <TextField
                      fullWidth
                      size="small"
                      name="standardPrice"
                      value={formik.values.standardPrice}
                      onChange={formik.handleChange}
                      placeholder="Price"
                    />
                  </TableCell>
                  <TableCell>
                    <TextField
                      fullWidth
                      size="small"
                      name="deluxePrice"
                      value={formik.values.deluxePrice}
                      onChange={formik.handleChange}
                      placeholder="Price"
                    />
                  </TableCell>
                  <TableCell>
                    <TextField
                      fullWidth
                      size="small"
                      name="superiorPrice"
                      value={formik.values.superiorPrice}
                      onChange={formik.handleChange}
                      placeholder="Price"
                    />
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>

          {/* Room Details */}
          <Grid container spacing={3} sx={{ mt: 2 }}>
            <Grid  size={{xs:12, sm:4}}>
              <Typography variant="subtitle1" gutterBottom>
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
              />
            </Grid>
            <Grid size={{xs:12, sm:4}}>
              <FormControl fullWidth>
                <InputLabel id="room-type-label">Room Type</InputLabel>
                <Select
                  labelId="room-type-label"
                  id="roomType"
                  name="roomType"
                  value={formik.values.roomType}
                  onChange={formik.handleChange}
                  error={formik.touched.roomType && Boolean(formik.errors.roomType)}
                  label="Room Type"
                >
                  <MenuItem value="standard">Standard</MenuItem>
                  <MenuItem value="deluxe">Deluxe</MenuItem>
                  <MenuItem value="superior">Superior</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{xs:12, sm:4}}>
              <FormControl fullWidth>
                <InputLabel id="sharing-type-label">Sharing Type</InputLabel>
                <Select
                  labelId="sharing-type-label"
                  id="sharingType"
                  name="sharingType"
                  value={formik.values.sharingType}
                  onChange={formik.handleChange}
                  error={formik.touched.sharingType && Boolean(formik.errors.sharingType)}
                  label="Sharing Type"
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
              <FormControlLabel value="full" control={<Radio />} label="Full" />
              <FormControlLabel value="margin" control={<Radio />} label="Margin" />
              <FormControlLabel value="none" control={<Radio />} label="None" />
            </RadioGroup>
          </FormControl>

          <Typography variant="subtitle1" gutterBottom sx={{ mt: 3 }}>
            Apply GST
          </Typography>
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
            sx={{ maxWidth: 200 }}
          />
        </Paper>

        {/* Signature Details */}
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Signature Details
          </Typography>
          <Typography variant="body1" sx={{ fontStyle: 'italic' }}>
            Best Regards
          </Typography>
          <Typography variant="body1" sx={{ mt: 1 }}>
            Subham Baskar +917053900957 (Noida)
          </Typography>
        </Paper>

        {/* Submit Button */}
        <Box sx={{ textAlign: 'center', mt: 4 }}>
          <Button
            type="submit"
            variant="contained"
            size="large"
            sx={{ px: 6, py: 1.5 }}
          >
            Submit
          </Button>
        </Box>
      </form>
    </Box>
  );
};

export default CustomQuotationForm;