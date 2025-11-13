import React from "react";
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
  Divider,
  Button,
} from "@mui/material";
import { useFormik } from "formik";
import * as yup from "yup";
import { useDispatch } from "react-redux";
import { createCustomQuotation } from "../../../../features/quotation/customQuotationSlice";
import { toast } from "react-toastify";

// ✅ Validation Schema
const validationSchema = yup.object({
  adult: yup.number().min(0, "Must be positive").required("Required"),
  child: yup.number().min(0, "Must be positive"),
  kid: yup.number().min(0, "Must be positive"),
  infants: yup.number().min(0, "Must be positive"),
  mediPlan: yup.string().required("Required"),
  noOfRooms: yup.number().min(1, "At least 1 room required").required("Required"),
  roomType: yup.string().required("Required"),
  sharingType: yup.string().required("Required"),
  marginPercent: yup.number().min(0).max(100),
  marginAmount: yup.number().min(0),
  discount: yup.number().min(0),
  gstOn: yup.string().required("Required"),
  taxPercent: yup.number().min(0).max(100),
});

const CustomQuotationForm = ({ formData, leadData, onSubmit, loading }) => {
  const dispatch = useDispatch();
  const { clientDetails, pickupDrop, tourDetails } = formData;
  const cities = pickupDrop || [];
  const leadTourDetails = leadData?.tourDetails;
  const leadMembers = leadTourDetails?.members;
  const leadAccommodation = leadTourDetails?.accommodation;

  // ✅ Initialize City Prices
  const initializeCityPrices = (cities) => {
    return cities.reduce((acc, city, index) => {
      acc[index] = {
        standardHotelName: "",
        standardPrice: "",
        deluxeHotelName: "",
        deluxePrice: "",
      };
      return acc;
    }, {});
  };

  const formik = useFormik({
    initialValues: {
      adult: leadMembers?.adults || 0,
      child: leadMembers?.children || 0,
      kid: leadMembers?.kidsWithoutMattress || 0,
      infants: leadMembers?.infants || 0,
      mediPlan: leadAccommodation?.mealPlan || "",
      noOfRooms: leadAccommodation?.noOfRooms || 1,
      roomType: leadAccommodation?.hotelType?.[0] || "",
      sharingType: leadAccommodation?.sharingType || "",
      cityPrices: initializeCityPrices(cities),
      marginPercent: 0,
      marginAmount: 0,
      discount: 0,
      gstOn: "Full",
      taxPercent: 0,
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
                standardHotels: [values.cityPrices[index]?.standardHotelName || ""],
                deluxeHotels: [values.cityPrices[index]?.deluxeHotelName || ""],
                prices: {
                  standard: Number(values.cityPrices[index]?.standardPrice) || 0,
                  deluxe: Number(values.cityPrices[index]?.deluxePrice) || 0,
                },
              })),
              rooms: {
                numberOfRooms: values.noOfRooms,
                roomType: values.roomType,
                sharingType: values.sharingType,
              },
              companyMargin: {
                marginPercent: values.marginPercent || 0,
                marginAmount: values.marginAmount || 0,
              },
              discount: values.discount || 0,
              taxes: {
                gstOn: values.gstOn || "None",
                taxPercent: values.taxPercent || 0,
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
        console.error("❌ Submission error:", error);
        toast.error("Failed to create quotation");
      }
    },
  });

  // ✅ Calculate Totals
  const calculateTotals = () => {
    const totals = {
      totalNights: 0,
      totalStandard: 0,
      totalDeluxe: 0,
    };

    cities.forEach((city, index) => {
      const nights = parseInt(city.nights) || 0;
      const standardPrice = parseFloat(formik.values.cityPrices?.[index]?.standardPrice) || 0;
      const deluxePrice = parseFloat(formik.values.cityPrices?.[index]?.deluxePrice) || 0;

      totals.totalNights += nights;
      totals.totalStandard += standardPrice * nights;
      totals.totalDeluxe += deluxePrice * nights;
    });

    return totals;
  };

  const totals = calculateTotals();
 const previousStepTotalCost = Number(
  formData?.tourDetails?.vehicleDetails?.costDetails?.totalCost ||
  formData?.data?.tourDetails?.vehicleDetails?.costDetails?.totalCost ||
  0
);


 

  const totalStandardWithRooms = totals.totalStandard * (formik.values.noOfRooms || 1);
  const totalDeluxeWithRooms = totals.totalDeluxe * (formik.values.noOfRooms || 1);
  const totalStandardPackage = totalStandardWithRooms + previousStepTotalCost;
  const totalDeluxePackage = totalDeluxeWithRooms + previousStepTotalCost;

  return (
    <Box sx={{ maxWidth: 1200, margin: "0 auto", p: 3 }}>
      <form onSubmit={formik.handleSubmit}>
        <Typography variant="h4" align="center" gutterBottom>
          Custom Quotation
        </Typography>

        {/* ===== Client Summary ===== */}
        <Paper sx={{ p: 2, mb: 3, backgroundColor: "#f5f5f5" }}>
          <Typography variant="h6" gutterBottom>Client Summary</Typography>
          <Grid container spacing={2}>
            <Grid item xs={6} sm={3}><Typography><strong>Client:</strong> {clientDetails?.clientName || "N/A"}</Typography></Grid>
            <Grid item xs={6} sm={3}><Typography><strong>Sector:</strong> {clientDetails?.sector || "N/A"}</Typography></Grid>
            <Grid item xs={6} sm={3}><Typography><strong>Arrival:</strong> {tourDetails?.arrivalCity || "N/A"}</Typography></Grid>
            <Grid item xs={6} sm={3}><Typography><strong>Departure:</strong> {tourDetails?.departureCity || "N/A"}</Typography></Grid>
          </Grid>
        </Paper>

        {/* ===== Quotation Details ===== */}
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>Quotation Details</Typography>
          <Grid container spacing={2}>
            <Grid item xs={6} sm={3}><TextField label="Adults" name="adult" type="number" fullWidth {...formik.getFieldProps("adult")} /></Grid>
            <Grid item xs={6} sm={3}><TextField label="Children" name="child" type="number" fullWidth {...formik.getFieldProps("child")} /></Grid>
            <Grid item xs={6} sm={3}><TextField label="Kids (W/O Mattress)" name="kid" type="number" fullWidth {...formik.getFieldProps("kid")} /></Grid>
            <Grid item xs={6} sm={3}><TextField label="Infants" name="infants" type="number" fullWidth {...formik.getFieldProps("infants")} /></Grid>

            <Grid item xs={6} sm={3}><TextField label="Meal Plan" name="mediPlan" fullWidth {...formik.getFieldProps("mediPlan")} /></Grid>
            <Grid item xs={6} sm={3}><TextField label="No. of Rooms" name="noOfRooms" type="number" fullWidth {...formik.getFieldProps("noOfRooms")} /></Grid>
            <Grid item xs={6} sm={3}><TextField label="Room Type" name="roomType" fullWidth {...formik.getFieldProps("roomType")} /></Grid>
            <Grid item xs={6} sm={3}><TextField label="Sharing Type" name="sharingType" fullWidth {...formik.getFieldProps("sharingType")} /></Grid>
          </Grid>
        </Paper>

        {/* ===== City Prices Table ===== */}
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>Destinations & Prices</Typography>
          <TableContainer component={Paper} variant="outlined">
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Destination</TableCell>
                  <TableCell>Nights</TableCell>
                  <TableCell>Standard Hotel Name</TableCell>
                  <TableCell>Standard Price</TableCell>
                  <TableCell>Deluxe Hotel Name</TableCell>
                  <TableCell>Deluxe Price</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {cities.map((city, index) => (
                  <TableRow key={index}>
                    <TableCell>{city.cityName}</TableCell>
                    <TableCell>{city.nights}</TableCell>
                    <TableCell><TextField fullWidth size="small" {...formik.getFieldProps(`cityPrices[${index}].standardHotelName`)} /></TableCell>
                    <TableCell><TextField fullWidth size="small" type="number" {...formik.getFieldProps(`cityPrices[${index}].standardPrice`)} /></TableCell>
                    <TableCell><TextField fullWidth size="small" {...formik.getFieldProps(`cityPrices[${index}].deluxeHotelName`)} /></TableCell>
                    <TableCell><TextField fullWidth size="small" type="number" {...formik.getFieldProps(`cityPrices[${index}].deluxePrice`)} /></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {/* ===== Totals ===== */}
          <Box sx={{ mt: 2, p: 2, backgroundColor: "#f5f5f5", borderRadius: 1 }}>
            <Typography variant="h6">Totals</Typography>
            <Typography>Total Nights: {totals.totalNights}</Typography>
           <Typography>Vehicle Total Cost: ₹{previousStepTotalCost.toFixed(2)}</Typography>

            <Divider sx={{ my: 1 }} />

            <Typography variant="subtitle1"><strong>Standard Package</strong></Typography>
            <Typography>Base Total: ₹{totals.totalStandard.toFixed(2)}</Typography>
            <Typography>× Rooms ({formik.values.noOfRooms}): ₹{totalStandardWithRooms.toFixed(2)}</Typography>
            <Typography variant="h6" color="primary">
              ➤ Total Standard Package: ₹{totalStandardPackage.toFixed(2)}
            </Typography>

            <Divider sx={{ my: 2 }} />

            <Typography variant="subtitle1"><strong>Deluxe Package</strong></Typography>
            <Typography>Base Total: ₹{totals.totalDeluxe.toFixed(2)}</Typography>
            <Typography>× Rooms ({formik.values.noOfRooms}): ₹{totalDeluxeWithRooms.toFixed(2)}</Typography>
            <Typography variant="h6" color="secondary">
              ➤ Total Deluxe Package: ₹{totalDeluxePackage.toFixed(2)}
            </Typography>
          </Box>
        </Paper>

        {/* ===== Company Margin & Taxes ===== */}
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>Company Margin / Taxes</Typography>
          <Grid container spacing={2}>
            <Grid item xs={6} sm={3}><TextField label="Margin (%)" name="marginPercent" type="number" fullWidth {...formik.getFieldProps("marginPercent")} /></Grid>
            <Grid item xs={6} sm={3}><TextField label="Margin Amount" name="marginAmount" type="number" fullWidth {...formik.getFieldProps("marginAmount")} /></Grid>
            <Grid item xs={6} sm={3}><TextField label="Discount" name="discount" type="number" fullWidth {...formik.getFieldProps("discount")} /></Grid>
            <Grid item xs={6} sm={3}>
              <FormControl fullWidth>
                <InputLabel>GST On</InputLabel>
                <Select name="gstOn" value={formik.values.gstOn} onChange={formik.handleChange}>
                  <MenuItem value="Full">Full</MenuItem>
                  <MenuItem value="Partial">Partial</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={6} sm={3}><TextField label="Tax (%)" name="taxPercent" type="number" fullWidth {...formik.getFieldProps("taxPercent")} /></Grid>
          </Grid>
        </Paper>

        <Box sx={{ textAlign: "center", mt: 4 }}>
          <Button type="submit" variant="contained" size="large" sx={{ px: 6, py: 1.5 }} disabled={loading}>
            {loading ? "Creating..." : "Submit Quotation"}
          </Button>
        </Box>
      </form>
    </Box>
  );
};

export default CustomQuotationForm;
