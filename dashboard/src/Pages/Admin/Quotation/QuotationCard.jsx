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
import { toast } from "react-toastify";

import { getAllVehicleQuotations } from "../../../features/quotation/vehicleQuotationSlice";
import { getAllFlightQuotations } from "../../../features/quotation/flightQuotationSlice";
import { getAllCustomQuotations } from "../../../features/quotation/customQuotationSlice";
import {
  getAllQuotations,
  getQuotationById,
} from "../../../features/quotation/fullQuotationSlice";

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

  const { list: vehicleList } = useSelector((state) => state.vehicleQuotation);
  const { quotations: flightList } = useSelector((state) => state.flightQuotation);
  const { quotations: customList = [] } = useSelector((state) => state.customQuotation);
  const { quotationsList = [], loading: fullLoading } = useSelector(
  (state) => state.fullQuotation
);

  const [open, setOpen] = useState(false);
  const [selectedType, setSelectedType] = useState("");
  const [search, setSearch] = useState("");

  // === Fetch all quotation data ===
  useEffect(() => {
    dispatch(getAllVehicleQuotations());
    dispatch(getAllFlightQuotations());
    dispatch(getAllCustomQuotations());
    dispatch(getAllQuotations());
  }, [dispatch]);

  // === Auto-resume draft quotation when found ===
  useEffect(() => {
    if (quotationsList && quotationsList.length > 0) {
      const draft = quotationsList.find((q) => q.isDraft === true);
      if (draft) {
        const nextStep = (draft.currentStep || 0) + 1;
        toast.info(`Resuming your draft quotation (${draft.quotationId})`);
        navigate(`/fullquotation/${draft.quotationId}/step/${nextStep}`, {
          state: { quotationData: draft },
        });
      }
    }
  }, [quotationsList, navigate]);

  const handleDeleteClick = (id) => {
    console.log("Delete quotation id:", id);
  };

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  // === Handle "Next" in Modal ===
  const handleNext = async () => {
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
        // 🔹 Check for draft before new full quotation
        const drafts = quotationsList?.filter((q) => q.isDraft === true);
        if (drafts?.length > 0) {
          const draft = drafts[0];
          toast.info(`Resuming your draft quotation (${draft.quotationId})`);
          navigate(`/fullquotation/${draft.quotationId}/step/${(draft.currentStep || 0) + 1}`, {
            state: { quotationData: draft },
          });
        } else {
          // Start a new one
          navigate("/fullquotation");
        }
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

  // === Helpers ===
  const formatDate = (date) => {
    if (!date) return "N/A";
    try {
      return new Date(date).toLocaleDateString("en-IN");
    } catch {
      return "N/A";
    }
  };

  const calculateTotalNights = (destinations = []) =>
    destinations.reduce((total, destination) => total + (destination.nights || 0), 0);

  // Helper to calculate total nights from stayLocation array
  const calculateFullQuotationNights = (stayLocations = []) =>
    stayLocations.reduce((total, location) => total + (location.nights || 0), 0);

  // Helper to get form status for full quotations
  const getFullQuotationFormStatus = (quotation) => {
    if (quotation.isFinalized) return "Finalized";
    if (quotation.isDraft) return `Draft (Step ${quotation.currentStep || 1})`;
    return "In Progress";
  };

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

  // === Combine all quotations ===
  const combinedList = [
    // Full Quotations
    ...(quotationsList || []).map((item, index) => ({
      id: `FQ-${index + 1}`,
      quoteId: item?.quotationId || "N/A",
      clientName: item?.clientDetails?.clientName || "N/A",
      arrival: formatDate(item?.pickupDrop?.arrivalDate),
      departure: formatDate(item?.pickupDrop?.departureDate),
      sector: item?.clientDetails?.sector || "N/A",
      title: item?.quotation?.quotationTitle || "Full Tour",
      noOfNight: calculateFullQuotationNights(item?.stayLocation) || "-",
      tourType: item?.clientDetails?.tourType || "-",
      type: "Full",
      quotationStatus: item?.isFinalized ? "Finalized" : "Pending",
      formStatus: getFullQuotationFormStatus(item),
      businessType: "Travel",
      rawData: item,
    })),
    
    // Vehicle Quotations
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
      rawData: item,
    })),
    
    // Flight Quotations
    ...(flightList || []).map((item, index) => ({
      id: `F-${index + 1}`,
      quoteId: item?.flightQuotationId || "N/A",
      clientName: item?.clientDetails?.clientName || "N/A",
      arrival: formatDate(item?.flightDetails?.[0]?.departureDate),
      departure: formatDate(item?.flightDetails?.[item?.flightDetails?.length - 1]?.departureDate),
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
      rawData: item,
    })),
    
    // Custom Quotations
    ...(customList || []).map((item, index) => ({
      id: `C-${index + 1}`,
      quoteId: item?.quotationId || "N/A",
      clientName: item?.clientDetails?.clientName || "N/A",
      arrival: formatDate(item?.tourDetails?.arrivalDate),
      departure: formatDate(item?.tourDetails?.departureDate),
      sector: item?.clientDetails?.sector || "N/A",
      title: item?.tourDetails?.quotationTitle || "Custom Tour",
      noOfNight:
        calculateTotalNights(item?.tourDetails?.quotationDetails?.destinations) || "-",
      tourType: item?.clientDetails?.tourType || "-",
      type: "Custom",
      quotationStatus: "Pending",
      formStatus: "Completed",
      businessType: "Travel",
      rawData: item,
    })),
  ];

  const filteredList = combinedList.filter((row) =>
    Object.values(row).some((value) =>
      String(value).toLowerCase().includes(search.toLowerCase())
    )
  );
// Add this useEffect to debug the data
useEffect(() => {
  console.log("Full Quotations Data:", quotationsList);
  console.log("Vehicle Quotations:", vehicleList);
  console.log("Flight Quotations:", flightList);
  console.log("Custom Quotations:", customList);
}, [quotationsList, vehicleList, flightList, customList]);

// Also add this to see the combined list
useEffect(() => {
  console.log("Combined List:", combinedList);
}, [combinedList]);
  const handleRowClick = (params) => {
    switch (params.row.type) {
      case "Full":
        if (params.row.rawData.isDraft) {
          // Navigate to continue draft
          navigate(`/fullquotation/${params.row.quoteId}/step/${params.row.rawData.currentStep + 1}`, {
            state: { quotationData: params.row.rawData },
          });
        } else {
          // Navigate to view finalized quotation
          navigate(`/fullfinalize/${params.row.quoteId}`, {
            state: { quotationData: params.row.rawData },
          });
        }
        break;
      case "Flight":
        navigate(`/flightfinalize/${params.row.quoteId}`);
        break;
      case "Vehicle":
        navigate(`/vehiclefinalize/${params.row.quoteId}`);
        break;
      case "Custom":
        navigate(`/customfinalize/${params.row.quoteId}`, {
          state: { quotationData: params.row.rawData },
        });
        break;
      default:
        break;
    }
  };

  return (
    <Container maxWidth="xl">
      <Box py={3}>
        {/* Stat Cards */}
        <Grid container spacing={2}>
          {stats.map((item, index) => (
            <Grid key={index} item xs={12} sm={6} md={4} lg={2.4}>
              <Card sx={{ backgroundColor: "#0b6396ff", color: "#fff" }}>
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

        {/* Toolbar */}
        <Box
          mt={3}
          mb={2}
          display="flex"
          flexDirection={{ xs: "column", sm: "row" }}
          justifyContent="space-between"
          alignItems={{ xs: "stretch", sm: "center" }}
          gap={2}
        >
          <Button variant="contained" color="warning" onClick={handleOpen}>
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

        {/* Data Table */}
        <Box sx={{ width: "100%", overflowX: "auto" }}>
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
              rowsPerPageOptions={[7, 25, 50]}
              autoHeight
              disableRowSelectionOnClick
              onRowClick={handleRowClick}
            />
          )}
        </Box>
      </Box>

      {/* Quotation Type Dialog */}
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
              {/* Full */}
              <Grid item xs={6} sm={4}>
                <Card
                  sx={{
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
                          <Typography>Full</Typography>
                        </Box>
                      }
                    />
                  </CardContent>
                </Card>
              </Grid>

              {/* Quick */}
              <Grid item xs={6} sm={4}>
                <Card
                  sx={{
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
                          <Typography>Quick</Typography>
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
              <Grid item xs={6} sm={4}>
                <Card
                  sx={{
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

              {/* Custom */}
              <Grid item xs={6} sm={4}>
                <Card
                  sx={{
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
                          <Typography>Custom</Typography>
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