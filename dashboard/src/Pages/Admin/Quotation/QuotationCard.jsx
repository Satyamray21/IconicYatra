import React, { useEffect, useState } from "react";
import {
  Box,
  Grid,
  Typography,
  Button,
  Card,
  CardContent,
  TextField,
  InputAdornment,
  IconButton,
  Container,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  RadioGroup,
  FormControlLabel,
  Radio,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import SearchIcon from "@mui/icons-material/Search";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import FlightIcon from "@mui/icons-material/Flight";
import HotelIcon from "@mui/icons-material/Hotel";
import DirectionsCarIcon from "@mui/icons-material/DirectionsCar";
import ShoppingBasketIcon from "@mui/icons-material/ShoppingBasket";
import QuestionAnswerIcon from "@mui/icons-material/QuestionAnswer";

import { getAllVehicleQuotations } from "../../../features/quotation/vehicleQuotationSlice";

const stats = [
  { title: "Today's", confirmed: 0, inProcess: 0, cancelledIncomplete: 0 },
  { title: "This Month", confirmed: 0, inProcess: 0, cancelledIncomplete: 0 },
  { title: "Last 3 Months", confirmed: 0, inProcess: 0, cancelledIncomplete: 0 },
  { title: "Last 6 Months", confirmed: 0, inProcess: 0, cancelledIncomplete: 0 },
  { title: "Last 12 Months", confirmed: 15, inProcess: 0, cancelledIncomplete: 0 },
];

const QuotationCard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // ✅ Redux State
  const { list, loading, error } = useSelector((state) => state.vehicleQuotation);

  // Local state for modal
  const [open, setOpen] = useState(false);
  const [selectedType, setSelectedType] = useState("");

  // ✅ Fetch data from API on mount
  useEffect(() => {
    dispatch(getAllVehicleQuotations());
  }, [dispatch]);

  // Delete handler (temporarily local, will connect to API later)
  const handleDeleteClick = (id) => {
    console.log("Delete quotation id:", id);
  };

  // Modal controls
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  // Navigate to selected quotation type
  const handleNext = () => {
    handleClose();
    switch (selectedType) {
      case "vehicle":
        navigate("/vehiclequotation");
        break;
      case "hotel":
        navigate("/hotelquotation");
        break;
      case "flight":
        navigate("/flightquotation");
        break;
      case "full":
        navigate("/fullquotation");
        break;
      case "quick":
        navigate("/quickquotation");
        break;
      case "custom":
        navigate("/customquotation");
        break;
      default:
        break;
    }
  };

  const columns = [
    { field: "id", headerName: "Sr No.", width: 60 },
    { field: "quoteId", headerName: "Quote Id", width: 140 },
    { field: "clientName", headerName: "Client Name", width: 200 },
    { field: "arrival", headerName: "Arrival", width: 120 },
    { field: "departure", headerName: "Departure", width: 120 },
    { field: "sector", headerName: "Sector", width: 120 },
    { field: "title", headerName: "Title", width: 120 },
    { field: "noOfNight", headerName: "No of Night", width: 120 },
    { field: "tourType", headerName: "Tour Type", width: 120 },
    { field: "type", headerName: "Type", width: 120 },
    { field: "quotationStatus", headerName: "Quotation Status", width: 150 },
    { field: "formStatus", headerName: "Form Status", width: 120 },
    { field: "businessType", headerName: "Business Type", width: 120 },
    {
      field: "action",
      headerName: "Action",
      width: 100,
      renderCell: (params) => (
        <Box display="flex" gap={1}>
          <IconButton color="primary" size="small">
            <EditIcon fontSize="small" />
          </IconButton>
          <IconButton
            color="error"
            size="small"
            onClick={() => handleDeleteClick(params.row.id)}
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Box>
      ),
    },
  ];

  return (
    <Container maxWidth="xl">
      <Box py={3}>
        {/* Stat Cards */}
        <Grid container spacing={2}>
          {stats.map((item, index) => (
            <Grid key={index} item xs={12} sm={6} md={4} lg={2.4}>
              <Card sx={{ backgroundColor: "#0b6396ff", color: "#fff", height: "100%" }}>
                <CardContent>
                  <Typography variant="h6">
                    {item.title}: {item.confirmed}
                  </Typography>
                  <Typography variant="body2">Confirmed: {item.confirmed}</Typography>
                  <Typography variant="body2">
                    In Process: {item.inProcess}
                  </Typography>
                  <Typography variant="body2">
                    Cancelled/Incomplete: {item.cancelledIncomplete}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Actions */}
        <Box
          mt={3}
          mb={2}
          display="flex"
          flexDirection={{ xs: "column", sm: "row" }}
          justifyContent="space-between"
          alignItems={{ xs: "stretch", sm: "center" }}
          gap={2}
        >
          <Button
            variant="contained"
            color="warning"
            sx={{ minWidth: 100 }}
            onClick={handleOpen}
          >
            Add
          </Button>

          <TextField
            variant="outlined"
            size="small"
            placeholder="Search..."
            sx={{ width: { xs: "100%", sm: 300 } }}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton>
                    <SearchIcon />
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
        </Box>

        {/* Data Grid */}
        <Box sx={{ width: "100%", overflowX: "auto" }}>
          <Box sx={{ minWidth: "600px" }}>
            {loading ? (
              <Typography>Loading quotations...</Typography>
            ) : error ? (
              <Typography color="error">{error}</Typography>
            ) : (
              <DataGrid
              rows={list.map((item, index) => ({
  id: index + 1,
  quoteId: item.vehicleQuotationId,
  clientName: item.basicsDetails.clientName,
  arrival: new Date(item.pickupDropDetails.pickupDate).toLocaleDateString(),
  departure: new Date(item.pickupDropDetails.dropDate).toLocaleDateString(),
  sector: item.pickupDropDetails.pickupLocation + " → " + item.pickupDropDetails.dropLocation,
  title: item.basicsDetails.vehicleType,
  noOfNight: item.basicsDetails.noOfDays,
  tourType: item.basicsDetails.tripType,
  type: "Vehicle",
  quotationStatus: "Pending", // You can update if API provides status
  formStatus: "Completed",    // Placeholder for now
  businessType: "Travel",     // Placeholder for now
}))}

                columns={columns}
                pageSize={7}
                rowsPerPageOptions={[7, 25, 50, 100]}
                autoHeight
                disableRowSelectionOnClick
              />
            )}
          </Box>
        </Box>
      </Box>

      {/* Modal */}
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ color: "#0b6396ff" }}>
          How would you like to create Quotation?
        </DialogTitle>
        <DialogContent>
          <RadioGroup value={selectedType} onChange={(e) => setSelectedType(e.target.value)}>
            <Grid container spacing={2} mt={1}>
              {/* Full Quotation */}
              <Grid item xs={6} sm={4}>
                <Card
                  sx={{
                    height: "100%",
                    border:
                      selectedType === "full" ? "2px solid #0b6396ff" : "1px solid #ddd",
                  }}
                >
                  <CardContent>
                    <FormControlLabel
                      value="full"
                      control={<Radio />}
                      label={
                        <Box textAlign="center">
                          <ShoppingBasketIcon fontSize="large" sx={{ color: "#0b6396ff" }} />
                          <Typography>Full Quotation</Typography>
                        </Box>
                      }
                    />
                  </CardContent>
                </Card>
              </Grid>

              {/* Quick Quotation */}
              <Grid item xs={6} sm={4}>
                <Card
                  sx={{
                    height: "100%",
                    border:
                      selectedType === "quick" ? "2px solid #0b6396ff" : "1px solid #ddd",
                  }}
                >
                  <CardContent>
                    <FormControlLabel
                      value="quick"
                      control={<Radio />}
                      label={
                        <Box textAlign="center">
                          <QuestionAnswerIcon fontSize="large" sx={{ color: "#0b6396ff" }} />
                          <Typography>Quick Quotation</Typography>
                        </Box>
                      }
                    />
                  </CardContent>
                </Card>
              </Grid>

              {/* Hotel */}
              <Grid item xs={6} sm={4}>
                <Card
                  sx={{
                    height: "100%",
                    border:
                      selectedType === "hotel" ? "2px solid #0b6396ff" : "1px solid #ddd",
                  }}
                >
                  <CardContent>
                    <FormControlLabel
                      value="hotel"
                      control={<Radio />}
                      label={
                        <Box textAlign="center">
                          <HotelIcon fontSize="large" sx={{ color: "#0b6396ff" }} />
                          <Typography>Hotel</Typography>
                        </Box>
                      }
                    />
                  </CardContent>
                </Card>
              </Grid>

              {/* Vehicle */}
              <Grid item xs={12} sm={4}>
                <Card
                  sx={{
                    height: "100%",
                    border:
                      selectedType === "vehicle" ? "2px solid #0b6396ff" : "1px solid #ddd",
                  }}
                >
                  <CardContent>
                    <FormControlLabel
                      value="vehicle"
                      control={<Radio />}
                      label={
                        <Box textAlign="center">
                          <DirectionsCarIcon fontSize="large" sx={{ color: "#0b6396ff" }} />
                          <Typography>Vehicle</Typography>
                        </Box>
                      }
                    />
                  </CardContent>
                </Card>
              </Grid>

              {/* Flight */}
              <Grid item xs={6} sm={4}>
                <Card
                  sx={{
                    height: "100%",
                    border:
                      selectedType === "flight" ? "2px solid #0b6396ff" : "1px solid #ddd",
                  }}
                >
                  <CardContent>
                    <FormControlLabel
                      value="flight"
                      control={<Radio />}
                      label={
                        <Box textAlign="center">
                          <FlightIcon fontSize="large" sx={{ color: "#0b6396ff" }} />
                          <Typography>Flight</Typography>
                        </Box>
                      }
                    />
                  </CardContent>
                </Card>
              </Grid>

              {/* Custom Quotation */}
              <Grid item xs={6} sm={4}>
                <Card
                  sx={{
                    height: "100%",
                    border:
                      selectedType === "custom" ? "2px solid #0b6396ff" : "1px solid #ddd",
                  }}
                >
                  <CardContent>
                    <FormControlLabel
                      value="custom"
                      control={<Radio />}
                      label={
                        <Box textAlign="center">
                          <Typography variant="h4" fontWeight="bold" sx={{ color: "#0b6396ff" }}>
                            CQ
                          </Typography>
                          <Typography>Custom Quotation</Typography>
                        </Box>
                      }
                    />
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </RadioGroup>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button variant="contained" onClick={handleNext} disabled={!selectedType}>
            Next
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default QuotationCard;
