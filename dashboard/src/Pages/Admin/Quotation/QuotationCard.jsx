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
import { getAllFlightQuotations } from "../../../features/quotation/flightQuotationSlice";

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

  const {
    list: vehicleList,
    loading: vehicleLoading,
    error: vehicleError,
  } = useSelector((state) => state.vehicleQuotation);

  const { quotations: flightList } = useSelector((state) => state.flightQuotation);


  const [open, setOpen] = useState(false);
  const [selectedType, setSelectedType] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    dispatch(getAllVehicleQuotations());
    dispatch(getAllFlightQuotations());
  }, [dispatch]);
useEffect(() => {
  console.log("Vehicle List:", vehicleList);
  console.log("Flight List:", flightList);
}, [vehicleList, flightList]);

  const handleDeleteClick = (id) => {
    console.log("Delete quotation id:", id);
  };

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

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

  // Format Date Safely
  const formatDate = (date) => {
    if (!date) return "N/A";
    try {
      return new Date(date).toLocaleDateString("en-IN");
    } catch {
      return "N/A";
    }
  };

  // Table Columns
  const columns = [
    { field: "id", headerName: "Sr No.", width: 80 },
    { field: "quoteId", headerName: "Quote Id", width: 140 },
    { field: "clientName", headerName: "Client Name", width: 200 },
    { field: "arrival", headerName: "Arrival", width: 140 },
    { field: "departure", headerName: "Departure", width: 140 },
    { field: "sector", headerName: "Sector", width: 180 },
    { field: "title", headerName: "Title", width: 180 },
    { field: "noOfNight", headerName: "No of Night", width: 120 },
    { field: "tourType", headerName: "Tour Type", width: 120 },
    { field: "type", headerName: "Type", width: 120 },
    { field: "quotationStatus", headerName: "Quotation Status", width: 160 },
    { field: "formStatus", headerName: "Form Status", width: 140 },
    { field: "businessType", headerName: "Business Type", width: 140 },
    {
      field: "action",
      headerName: "Action",
      width: 120,
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

  // Combine Vehicle + Flight Quotations
  const combinedList = [
    ...(vehicleList || []).map((item, index) => ({
      id: `V-${index + 1}`,
      quoteId: item?.vehicleQuotationId || "N/A",
      clientName: item?.basicsDetails?.clientName || "N/A",
      arrival: formatDate(item?.pickupDropDetails?.pickupDate),
      departure: formatDate(item?.pickupDropDetails?.dropDate),
      sector:
        item?.pickupDropDetails?.pickupLocation && item?.pickupDropDetails?.dropLocation
          ? `${item.pickupDropDetails.pickupLocation} → ${item.pickupDropDetails.dropLocation}`
          : "N/A",
      title: item?.basicsDetails?.vehicleType || "Vehicle Booking",
      noOfNight: item?.basicsDetails?.noOfDays || "-",
      tourType: item?.basicsDetails?.tripType || "-",
      type: "Vehicle",
      quotationStatus: item?.status || "Pending",
      formStatus: "Completed",
      businessType: "Travel",
    })),

    ...(flightList || []).map((item, index) => ({
      id: `F-${index + 1}`,
      quoteId: item?.flightQuotationId || "N/A",
      clientName: item?.clientDetails?.clientName || "N/A",
      arrival: formatDate(item?.flightDetails?.[0]?.departureDate),
      departure: formatDate(
        item?.flightDetails?.[item?.flightDetails?.length - 1]?.departureDate
      ),
      sector: Array.isArray(item?.flightDetails)
        ? item.flightDetails.map((f) => `${f.from} → ${f.to}`).join(", ")
        : "N/A",
      title: item?.title || "Flight Booking",
      noOfNight: "-",
      tourType: item?.tripType || "-",
      type: "Flight",
      quotationStatus: item?.status || "Pending",
      formStatus: "Completed",
      businessType: "Travel",
    })),
  ];

  // Search Filter
  const filteredList = combinedList.filter((row) =>
    Object.values(row).some((value) =>
      String(value).toLowerCase().includes(search.toLowerCase())
    )
  );

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
                  <Typography variant="body2">In Process: {item.inProcess}</Typography>
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
            value={search}
            onChange={(e) => setSearch(e.target.value)}
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
            {filteredList.length === 0 ? (
              <Typography
                variant="h6"
                color="textSecondary"
                align="center"
                sx={{ mt: 2 }}
              >
                No quotations available
              </Typography>
            ) : (
              <DataGrid
                rows={filteredList}
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

      {/* Quotation Type Modal */}
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ color: "#0b6396ff" }}>
          How would you like to create Quotation?
        </DialogTitle>
        <DialogContent>
          <RadioGroup
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
          >
            <Grid container spacing={2} mt={1}>
              {/* Full Quotation */}
              <Grid item xs={6} sm={4}>
                <Card
                  sx={{
                    height: "100%",
                    border:
                      selectedType === "full"
                        ? "2px solid #0b6396ff"
                        : "1px solid #ddd",
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
                      selectedType === "quick"
                        ? "2px solid #0b6396ff"
                        : "1px solid #ddd",
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
                      selectedType === "hotel"
                        ? "2px solid #0b6396ff"
                        : "1px solid #ddd",
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
                      selectedType === "vehicle"
                        ? "2px solid #0b6396ff"
                        : "1px solid #ddd",
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
                      selectedType === "flight"
                        ? "2px solid #0b6396ff"
                        : "1px solid #ddd",
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
                      selectedType === "custom"
                        ? "2px solid #0b6396ff"
                        : "1px solid #ddd",
                  }}
                >
                  <CardContent>
                    <FormControlLabel
                      value="custom"
                      control={<Radio />}
                      label={
                        <Box textAlign="center">
                          <Typography
                            variant="h4"
                            fontWeight="bold"
                            sx={{ color: "#0b6396ff" }}
                          >
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
