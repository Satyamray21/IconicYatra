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
  Card,
  CardContent,
} from "@mui/material";
import { useFormik } from "formik";
import * as yup from "yup";
import { useDispatch } from "react-redux";
import { createCustomQuotation } from "../../../../features/quotation/customQuotationSlice";
import { toast } from "react-toastify";

// ==============================================
// VALIDATION SCHEMA
// ==============================================
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
  superiorMattressCost: yup.number().min(0),
  deluxeMattressCost: yup.number().min(0),
  regardsText: yup.string(),
  signedBy: yup.string(),
});

const CustomQuotationForm = ({ formData, leadData, onSubmit, loading }) => {
  const dispatch = useDispatch();
  const { clientDetails, pickupDrop, tourDetails } = formData;
  const cities = pickupDrop || [];

  const leadTourDetails = leadData?.tourDetails;
  const leadMembers = leadTourDetails?.members;
  const leadAccommodation = leadTourDetails?.accommodation;

  // Initialize city hotel pricing structure
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

  // ==============================================
  // FORMIK INITIAL VALUES
  // ==============================================
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
      superiorMattressCost: 0,
      deluxeMattressCost: 0,
      marginPercent: 0,
      marginAmount: 0,
      discount: 0,
      gstOn: "Full",
      taxPercent: 0,
      regardsText: "Best Regards",
      signedBy: "",
    },

    validationSchema,
    onSubmit: async (values) => {
      try {
        // Calculate package totals (same as in the UI)
        const totals = calculateTotals(values);
        const previousStepTotalCost = Number(
          formData?.tourDetails?.vehicleDetails?.costDetails?.totalCost ||
          formData?.data?.tourDetails?.vehicleDetails?.costDetails?.totalCost ||
          0
        );

        // Mattress calculations
        const superiorMattressTotal =
          totals.totalNights *
          values.superiorMattressCost *
          values.noOfRooms;

        const deluxeMattressTotal =
          totals.totalNights *
          values.deluxeMattressCost *
          values.noOfRooms;

        const totalStandardWithRooms =
          totals.totalStandard * values.noOfRooms + superiorMattressTotal;
        const totalDeluxeWithRooms =
          totals.totalDeluxe * values.noOfRooms + deluxeMattressTotal;

        const totalStandardPackage = totalStandardWithRooms + previousStepTotalCost;
        const totalDeluxePackage = totalDeluxeWithRooms + previousStepTotalCost;

        // Margin & Discount calculations
        const baseWithoutMarginStandard = totalStandardPackage;
        const baseWithoutMarginDeluxe = totalDeluxePackage;

        const standardWithMargin =
          baseWithoutMarginStandard +
          (values.marginPercent / 100) * baseWithoutMarginStandard +
          Number(values.marginAmount);

        const deluxeWithMargin =
          baseWithoutMarginDeluxe +
          (values.marginPercent / 100) * baseWithoutMarginDeluxe +
          Number(values.marginAmount);

        // GST calculations
        const gstPercent = Number(values.taxPercent || 0);
        const standardTaxable = standardWithMargin - Number(values.discount);
        const deluxeTaxable = deluxeWithMargin - Number(values.discount);
        const standardGST = (gstPercent / 100) * standardTaxable;
        const deluxeGST = (gstPercent / 100) * deluxeTaxable;

        const finalStandardTotal = standardTaxable + standardGST;
        const finalDeluxeTotal = deluxeTaxable + deluxeGST;

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
              mattress: {
                superiorMattressCost: values.superiorMattressCost,
                deluxeMattressCost: values.deluxeMattressCost,
              },
              companyMargin: {
                marginPercent: values.marginPercent,
                marginAmount: values.marginAmount,
              },
              discount: values.discount,
              taxes: {
                gstOn: values.gstOn,
                taxPercent: values.taxPercent,
              },
              // ✅ NEW: Package Calculations added here
              packageCalculations: {
                standard: {
                  baseCost: baseWithoutMarginStandard,
                  afterMargin: standardWithMargin,
                  afterDiscount: standardTaxable,
                  gstAmount: standardGST,
                  gstPercentage: gstPercent,
                  finalTotal: finalStandardTotal,
                },
                deluxe: {
                  baseCost: baseWithoutMarginDeluxe,
                  afterMargin: deluxeWithMargin,
                  afterDiscount: deluxeTaxable,
                  gstAmount: deluxeGST,
                  gstPercentage: gstPercent,
                  finalTotal: finalDeluxeTotal,
                },
                superior: {
                  baseCost: 0,
                  afterMargin: 0,
                  afterDiscount: 0,
                  gstAmount: 0,
                  gstPercentage: 0,
                  finalTotal: 0,
                },
              },
              // ✅ FIX: Add signatureDetails to prevent validation error
              signatureDetails: {
                regardsText: values.regardsText,
                signedBy: values.signedBy,
              },
            },
          },
        };

        console.log("📦 Final Data with Package Calculations:", finalData);

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

  // ==============================================
  // TOTAL CALCULATIONS (Extracted to reusable function)
  // ==============================================
  const calculateTotals = (values = formik.values) => {
    const totals = {
      totalNights: 0,
      totalStandard: 0,
      totalDeluxe: 0,
    };

    cities.forEach((city, index) => {
      const nights = parseInt(city.nights) || 0;
      const standardPrice =
        parseFloat(values.cityPrices?.[index]?.standardPrice) || 0;
      const deluxePrice =
        parseFloat(values.cityPrices?.[index]?.deluxePrice) || 0;

      totals.totalNights += nights;
      totals.totalStandard += standardPrice * nights;
      totals.totalDeluxe += deluxePrice * nights;
    });

    return totals;
  };

  const totals = calculateTotals();

  // Vehicle cost
  const previousStepTotalCost = Number(
    formData?.tourDetails?.vehicleDetails?.costDetails?.totalCost ||
      formData?.data?.tourDetails?.vehicleDetails?.costDetails?.totalCost ||
      0
  );

  // Mattress calculations
  const superiorMattressTotal =
    totals.totalNights *
    formik.values.superiorMattressCost *
    formik.values.noOfRooms;

  const deluxeMattressTotal =
    totals.totalNights *
    formik.values.deluxeMattressCost *
    formik.values.noOfRooms;

  const totalStandardWithRooms =
    totals.totalStandard * formik.values.noOfRooms + superiorMattressTotal;
  const totalDeluxeWithRooms =
    totals.totalDeluxe * formik.values.noOfRooms + deluxeMattressTotal;

  const totalStandardPackage = totalStandardWithRooms + previousStepTotalCost;
  const totalDeluxePackage = totalDeluxeWithRooms + previousStepTotalCost;

  // ==============================================
  // MARGIN & DISCOUNT CALCULATIONS
  // ==============================================
  const baseWithoutMarginStandard = totalStandardPackage;
  const baseWithoutMarginDeluxe = totalDeluxePackage;

  const standardWithMargin =
    baseWithoutMarginStandard +
    (formik.values.marginPercent / 100) * baseWithoutMarginStandard +
    Number(formik.values.marginAmount);

  const deluxeWithMargin =
    baseWithoutMarginDeluxe +
    (formik.values.marginPercent / 100) * baseWithoutMarginDeluxe +
    Number(formik.values.marginAmount);

  // ==============================================
  // GST CALCULATIONS (5 / 12 / 18 / 28)
  // ==============================================
  const gstPercent = Number(formik.values.taxPercent || 0);

  const standardTaxable =
    standardWithMargin - Number(formik.values.discount);
  const deluxeTaxable =
    deluxeWithMargin - Number(formik.values.discount);

  const standardGST = (gstPercent / 100) * standardTaxable;
  const deluxeGST = (gstPercent / 100) * deluxeTaxable;

  const finalStandardTotal = standardTaxable + standardGST;
  const finalDeluxeTotal = deluxeTaxable + deluxeGST;

  // ==============================================
  // UI STARTS
  // ==============================================
  return (
    <Box sx={{ maxWidth: 1300, margin: "0 auto", p: 3 }}>
      <form onSubmit={formik.handleSubmit}>
        <Typography variant="h4" align="center" gutterBottom>
          Custom Quotation
        </Typography>

        {/* CLIENT SUMMARY */}
        <Paper sx={{ p: 2, mb: 3, backgroundColor: "#f5f5f5" }}>
          <Typography variant="h6" gutterBottom>
            Client Summary
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={6} sm={3}>
              <Typography>
                <strong>Client:</strong> {clientDetails?.clientName || "N/A"}
              </Typography>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Typography>
                <strong>Sector:</strong> {clientDetails?.sector || "N/A"}
              </Typography>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Typography>
                <strong>Arrival:</strong> {tourDetails?.arrivalCity || "N/A"}
              </Typography>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Typography>
                <strong>Departure:</strong> {tourDetails?.departureCity || "N/A"}
              </Typography>
            </Grid>
          </Grid>
        </Paper>

        {/* QUOTATION DETAILS */}
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Quotation Details
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={6} sm={3}>
              <TextField
                label="Adults"
                name="adult"
                type="number"
                fullWidth
                {...formik.getFieldProps("adult")}
              />
            </Grid>
            <Grid item xs={6} sm={3}>
              <TextField
                label="Children"
                name="child"
                type="number"
                fullWidth
                {...formik.getFieldProps("child")}
              />
            </Grid>
            <Grid item xs={6} sm={3}>
              <TextField
                label="Kids (W/O Mattress)"
                name="kid"
                type="number"
                fullWidth
                {...formik.getFieldProps("kid")}
              />
            </Grid>
            <Grid item xs={6} sm={3}>
              <TextField
                label="Infants"
                name="infants"
                type="number"
                fullWidth
                {...formik.getFieldProps("infants")}
              />
            </Grid>

            <Grid item xs={6} sm={3}>
              <TextField
                label="Meal Plan"
                name="mediPlan"
                fullWidth
                {...formik.getFieldProps("mediPlan")}
              />
            </Grid>
            <Grid item xs={6} sm={3}>
              <TextField
                label="No. of Rooms"
                name="noOfRooms"
                type="number"
                fullWidth
                {...formik.getFieldProps("noOfRooms")}
              />
            </Grid>
            <Grid item xs={6} sm={3}>
              <TextField
                label="Room Type"
                name="roomType"
                fullWidth
                {...formik.getFieldProps("roomType")}
              />
            </Grid>
            <Grid item xs={6} sm={3}>
              <TextField
                label="Sharing Type"
                name="sharingType"
                fullWidth
                {...formik.getFieldProps("sharingType")}
              />
            </Grid>
          </Grid>
        </Paper>

        {/* MATTRESS COST */}
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Mattress Cost (Per Night)
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Superior Mattress (Per Night)"
                name="superiorMattressCost"
                type="number"
                fullWidth
                {...formik.getFieldProps("superiorMattressCost")}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                label="Deluxe Mattress (Per Night)"
                name="deluxeMattressCost"
                type="number"
                fullWidth
                {...formik.getFieldProps("deluxeMattressCost")}
              />
            </Grid>
          </Grid>
        </Paper>

        {/* CITY PRICES */}
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Destinations & Prices
          </Typography>
          <TableContainer component={Paper} variant="outlined">
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Destination</TableCell>
                  <TableCell>Nights</TableCell>
                  <TableCell>Standard Hotel</TableCell>
                  <TableCell>Standard Price</TableCell>
                  <TableCell>Deluxe Hotel</TableCell>
                  <TableCell>Deluxe Price</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {cities.map((city, index) => (
                  <TableRow key={index}>
                    <TableCell>{city.cityName}</TableCell>
                    <TableCell>{city.nights}</TableCell>
                    <TableCell>
                      <TextField
                        fullWidth
                        size="small"
                        {...formik.getFieldProps(
                          `cityPrices[${index}].standardHotelName`
                        )}
                      />
                    </TableCell>
                    <TableCell>
                      <TextField
                        fullWidth
                        size="small"
                        type="number"
                        {...formik.getFieldProps(
                          `cityPrices[${index}].standardPrice`
                        )}
                      />
                    </TableCell>
                    <TableCell>
                      <TextField
                        fullWidth
                        size="small"
                        {...formik.getFieldProps(
                          `cityPrices[${index}].deluxeHotelName`
                        )}
                      />
                    </TableCell>
                    <TableCell>
                      <TextField
                        fullWidth
                        size="small"
                        type="number"
                        {...formik.getFieldProps(
                          `cityPrices[${index}].deluxePrice`
                        )}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {/* ===================================== BEAUTIFIED TOTAL SECTION ===================================== */}
          <Box sx={{ mt: 4 }}>
            <Typography variant="h5" fontWeight="bold" gutterBottom>
              Pricing Summary
            </Typography>

            <Divider sx={{ mb: 3 }} />

            <Grid container spacing={3}>
              {/* STANDARD PACKAGE CARD */}
              <Grid item xs={12} md={6}>
                <Card sx={{ borderLeft: "6px solid #1976d2" }}>
                  <CardContent>
                    <Typography
                      variant="h6"
                      sx={{ fontWeight: "bold", color: "#1976d2" }}
                    >
                      STANDARD PACKAGE
                    </Typography>

                    <Typography sx={{ mt: 1 }}>
                      <strong>Base Cost (No Margin):</strong>{" "}
                      ₹{baseWithoutMarginStandard.toFixed(2)}
                    </Typography>

                    <Typography>
                      <strong>After Margin:</strong>{" "}
                      ₹{standardWithMargin.toFixed(2)}
                    </Typography>

                    <Typography>
                      <strong>After Discount:</strong>{" "}
                      ₹{standardTaxable.toFixed(2)}
                    </Typography>

                    <Typography>
                      <strong>GST ({gstPercent}%):</strong>{" "}
                      ₹{standardGST.toFixed(2)}
                    </Typography>

                    <Divider sx={{ my: 1 }} />

                    <Typography
                      variant="h6"
                      sx={{ color: "green", fontWeight: "bold" }}
                    >
                      Final Total: ₹{finalStandardTotal.toFixed(2)}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              {/* DELUXE PACKAGE CARD */}
              <Grid item xs={12} md={6}>
                <Card sx={{ borderLeft: "6px solid #9c27b0" }}>
                  <CardContent>
                    <Typography
                      variant="h6"
                      sx={{ fontWeight: "bold", color: "#9c27b0" }}
                    >
                      DELUXE PACKAGE
                    </Typography>

                    <Typography sx={{ mt: 1 }}>
                      <strong>Base Cost (No Margin):</strong>{" "}
                      ₹{baseWithoutMarginDeluxe.toFixed(2)}
                    </Typography>

                    <Typography>
                      <strong>After Margin:</strong>{" "}
                      ₹{deluxeWithMargin.toFixed(2)}
                    </Typography>

                    <Typography>
                      <strong>After Discount:</strong>{" "}
                      ₹{deluxeTaxable.toFixed(2)}
                    </Typography>

                    <Typography>
                      <strong>GST ({gstPercent}%):</strong>{" "}
                      ₹{deluxeGST.toFixed(2)}
                    </Typography>

                    <Divider sx={{ my: 1 }} />

                    <Typography
                      variant="h6"
                      sx={{ color: "green", fontWeight: "bold" }}
                    >
                      Final Total: ₹{finalDeluxeTotal.toFixed(2)}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Box>
        </Paper>

        {/* MARGIN & TAXES */}
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Company Margin / Taxes
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={6} sm={3}>
              <TextField
                label="Margin (%)"
                name="marginPercent"
                type="number"
                fullWidth
                {...formik.getFieldProps("marginPercent")}
              />
            </Grid>
            <Grid item xs={6} sm={3}>
              <TextField
                label="Margin Amount"
                name="marginAmount"
                type="number"
                fullWidth
                {...formik.getFieldProps("marginAmount")}
              />
            </Grid>
            <Grid item xs={6} sm={3}>
              <TextField
                label="Discount"
                name="discount"
                type="number"
                fullWidth
                {...formik.getFieldProps("discount")}
              />
            </Grid>
            <Grid item xs={6} sm={3}>
              <FormControl fullWidth>
                <InputLabel>GST On</InputLabel>
                <Select
                  name="gstOn"
                  value={formik.values.gstOn}
                  onChange={formik.handleChange}
                >
                  <MenuItem value="Full">Full</MenuItem>
                  <MenuItem value="Partial">Partial</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={6} sm={3}>
              <TextField
                label="Tax (%)"
                name="taxPercent"
                type="number"
                fullWidth
                {...formik.getFieldProps("taxPercent")}
              />
            </Grid>
          </Grid>
        </Paper>

        {/* SIGNATURE DETAILS */}
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Signature Details
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Regards Text"
                name="regardsText"
                fullWidth
                {...formik.getFieldProps("regardsText")}
                helperText="Closing text (e.g., Best Regards, Sincerely)"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Signed By"
                name="signedBy"
                fullWidth
                {...formik.getFieldProps("signedBy")}
                helperText="Name of the person signing the quotation"
              />
            </Grid>
          </Grid>
        </Paper>

        {/* SUBMIT BUTTON */}
        <Box sx={{ textAlign: "center", mt: 4 }}>
          <Button
            type="submit"
            variant="contained"
            size="large"
            sx={{ px: 6, py: 1.5 }}
            disabled={loading}
          >
            {loading ? "Creating..." : "Submit Quotation"}
          </Button>
        </Box>
      </form>
    </Box>
  );
};

export default CustomQuotationForm;