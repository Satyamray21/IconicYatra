import React, { useState, useEffect } from "react";
import {
  Box,
  Grid,
  Typography,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
} from "@mui/material";
import {
  Phone,
  AlternateEmail,
  CreditCard,
  Description,
  Person,
  LocationOn,
} from "@mui/icons-material";
import { getVehicleQuotationById } from "../../../../features/quotation/vehicleQuotationSlice";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";

const VehicleQuotationPage = () => {
  const [activeInfo, setActiveInfo] = useState(null);
  const dispatch = useDispatch();
  const { id } = useParams();

  const { viewedVehicleQuotation: q, loading } = useSelector(
    (state) => state.vehicleQuotation
  );

  useEffect(() => {
    if (id) {
      dispatch(getVehicleQuotationById(id));
    }
  }, [dispatch, id]);

  if (loading || !q) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="70vh">
        <CircularProgress />
      </Box>
    );
  }

  // Extract data with proper fallbacks for API response structure
  const vehicle = q.vehicle || {};
  const lead = q.lead || {};
  const basicsDetails = vehicle.basicsDetails || {};
  const costDetails = vehicle.costDetails || {};
  const pickupDropDetails = vehicle.pickupDropDetails || {};
  const personalDetails = lead.personalDetails || {};
  const location = lead.location || {};

  const infoMap = {
    call: `📞 ${personalDetails.mobile || "N/A"}`,
    email: `✉️ ${personalDetails.emailId || "N/A"}`,
    payment: `Received: 0\n Balance: 0`,
    quotation: `Total Quotation Cost: ${costDetails.totalCost || "N/A"}`,
    guest: `No. of Guests: ${lead.tourDetails?.members?.adults || 0}`,
  };

  const infoChips = [
    { k: "call", icon: <Phone /> },
    { k: "email", icon: <AlternateEmail /> },
    { k: "payment", icon: <CreditCard /> },
    { k: "quotation", icon: <Description /> },
    { k: "guest", icon: <Person /> },
  ];

  return (
    <Box>
      {/* Action Buttons */}
      <Box display="flex" justifyContent="flex-end" gap={1} mb={2} flexWrap="wrap">
        <Button variant="contained">Finalize</Button>
        <Button variant="contained">Add Service</Button>
        <Button variant="contained">Email Quotation</Button>
        <Button variant="contained">Preview PDF</Button>
        <Button variant="contained">Make Payment</Button>
      </Box>

      {/* Main Layout */}
      <Grid container spacing={2}>
        <Grid item xs={12} md={3}>
          {/* Left Sidebar */}
          <Box sx={{ position: "sticky", top: 0 }}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" mb={1}>
                  <Person color="primary" sx={{ mr: 1 }} />
                  <Typography variant="h6">
                    {basicsDetails.clientName || "N/A"}
                  </Typography>
                </Box>
                <Box display="flex" alignItems="center" mb={2}>
                  <LocationOn sx={{ fontSize: 18, mr: 0.5, color: "text.secondary" }} />
                  <Typography variant="body2" color="text.secondary">
                    {location.state || "N/A"}
                  </Typography>
                </Box>
                <Box display="flex" gap={1} sx={{ flexWrap: "wrap", mb: 2 }}>
                  {infoChips.map(({ k, icon }) => (
                    <Chip
                      key={k}
                      icon={icon}
                      label={k}
                      size="small"
                      variant="outlined"
                      onClick={() => setActiveInfo(k)}
                    />
                  ))}
                </Box>
                {activeInfo && (
                  <Typography variant="body2" whiteSpace="pre-line">
                    {infoMap[activeInfo]}
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Box>
        </Grid>

        <Grid item xs={12} md={9}>
          {/* Main Content */}
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Vehicle Quotation For {basicsDetails.clientName || "N/A"}
              </Typography>
              <Typography variant="body2" gutterBottom>
                Vehicle Type: {basicsDetails.vehicleType || "N/A"}
              </Typography>
              <Typography variant="body2" gutterBottom>
                Trip Type: {basicsDetails.tripType || "N/A"}
              </Typography>
              <Typography variant="body2" gutterBottom>
                Pickup: {pickupDropDetails.pickupLocation || "N/A"} at{" "}
                {pickupDropDetails.pickupTime ? new Date(pickupDropDetails.pickupTime).toLocaleString() : "N/A"}
              </Typography>
              <Typography variant="body2" gutterBottom>
                Drop: {pickupDropDetails.dropLocation || "N/A"} at{" "}
                {pickupDropDetails.dropTime ? new Date(pickupDropDetails.dropTime).toLocaleString() : "N/A"}
              </Typography>
              <Typography variant="body2" gutterBottom>
                Total Cost: ₹{costDetails.totalCost || "N/A"}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default VehicleQuotationPage;