import React, { useState } from "react";
import {
  Box,
  Grid,
  Typography,
  Button,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  List,
  ListItem,
  ListItemText,
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  IconButton,
} from "@mui/material";
import {
  FormatQuote as FormatQuoteIcon,
  Payment,
  Phone,
  AlternateEmail,
  CreditCard,
  Description,
  Person,
  LocationOn,
  CalendarToday,
  AccessTime,
  Route,
  Group,
  CheckCircle,
  Cancel,
  Warning,
  Business,
  Language,
  ExpandMore,
  Edit,
  Receipt,
  Route as RouteIcon,
  Visibility,
  Hotel as HotelIcon,
  AddCircleOutline,
  Image as ImageIcon,
  FormatQuote,
} from "@mui/icons-material";

import EmailQuotationDialog from "../VehicleQuotation/Dialog/EmailQuotationDialog";
import MakePaymentDialog from "../VehicleQuotation/Dialog/MakePaymentDialog";
import FinalizeDialog from "../VehicleQuotation/Dialog/FinalizeDialog";
import BankDetailsDialog from "../VehicleQuotation/Dialog/BankDetailsDialog";
import AddBankDialog from "../VehicleQuotation/Dialog/AddBankDialog";
import EditDialog from "../VehicleQuotation/Dialog/EditDialog";
import AddServiceDialog from "../VehicleQuotation/Dialog/AddServiceDialog";
import AddFlightDialog from "../HotelQuotation/Dialog/FlightDialog";

// Initial data separated into individual objects for better organization
const initialCustomer = {
  name: "Amit Jaiswal",
  location: "Andhya Pradesh",
  phone: "+91 7053900957",
  email: "amit.jaiswal@example.com",
};

const initialPickupDetails = {
  arrival: "Arrival: Lucknow (22/08/2025) at Airport, 3:35PM",
  departure: "Departure: Delhi (06/09/2025) from Local Address, 6:36PM",
};

const initialHotelDetails = {
  guests: "6 Adults",
  rooms: "3 Bedroom",
  mealPlan: "CP, AP, EP",
  destination: "3N Borong, 2N Damthang",
  itinerary:
    "This is only tentative schedule for sightseeing and travel. Actual sightseeing may get affected due to weather, road conditions, local authority notices, shortage of timing, or off days.",
};

const initialVehicle = [
  {
    pickup: { date: "22/08/2025", time: "3:35PM" },
    drop: { date: "06/09/2025", time: "6:36PM" },
  },
];

const initialPricing = {
  discount: "₹ 200",
  gst: "₹ 140",
  total: "₹ 3,340",
};

const initialPolicies = {
  inclusions: [
    "All transfers tours in a Private AC cab.",
    "Parking, Toll charges, Fuel and Driver expenses.",
    "Hotel Taxes.",
    "Car AC off during hill stations.",
  ],
  exclusions: "1. Any Cost change... (rest of exclusions)",
  paymentPolicy: "50% amount to pay at confirmation, balance before 10 days.",
  cancellationPolicy: "1. Before 15 days: 50%. 2. Within 7 days: 100%.",
  terms:
    "1. This is only a Quote. Availability is checked only on confirmation...",
};

const initialFooter = {
  contact: "Amit Jaiswal | +91 7053900957 (Noida)",
  phone: "+91 7053900957",
  email: "amit.jaiswal@example.com",
  received: "₹ 1,500",
  balance: "₹ 1,840",
  company: "Iconic Yatra",
  address: "Office No 15, Bhawani Market Sec 27, Noida, Uttar Pradesh – 201301",
  website: "https://www.iconicyatra.com",
};

const initialActions = [
  "Finalize",
  "Add Service",
  "Email Quotation",
  "Preview PDF",
  "Make Payment",
  "Add Flight", // Add this line
];

// Hotel pricing table data
const hotelPricingData = [
  {
    destination: "Borong",
    nights: "3 N",
    standard: "Tempo Heritage Resort",
    deluxe: "Tempo Heritage Resort",
    superior: "Yovage The Aryan Regency",
  },
  {
    destination: "Damthang",
    nights: "2 N",
    standard: "Tempo Heritage Resort",
    deluxe: "Tempo Heritage Resort",
    superior: "Yovage The Aryan Regency",
  },
  {
    destination: "Quotation Cost",
    nights: "-",
    standard: "₹ 40,366",
    deluxe: "₹ 440,829",
    superior: "₹ 92,358",
  },
  {
    destination: "IGST",
    nights: "-",
    standard: "₹ 2,018.3",
    deluxe: "₹ 22,041.4",
    superior: "₹ 4,617.9",
  },
  {
    destination: "Total Quotation Cost",
    nights: "5 N",
    standard: "₹ 42,384",
    deluxe: "₹ 462,870",
    superior: "₹ 96,976",
  },
];

const taxOptions = [
  { value: "gst5", label: "GST 5%", rate: 5 },
  { value: "gst18", label: "GST 18%", rate: 18 },
  { value: "non", label: "Non", rate: 0 },
];

const CustomFinalize = () => {
  // State management
  const [activeInfo, setActiveInfo] = useState(null);
  const [openFinalize, setOpenFinalize] = useState(false);
  const [vendor, setVendor] = useState("");
  const [isFinalized, setIsFinalized] = useState(false);
  const [invoiceGenerated, setInvoiceGenerated] = useState(false);

  // Data state
  const [quotation, setQuotation] = useState({
    date: "27/08/2025",
    reference: "41",
    actions: initialActions,
    customer: initialCustomer,
    pickup: initialPickupDetails,
    hotel: initialHotelDetails,
    vehicles: initialVehicle,
    pricing: initialPricing,
    policies: initialPolicies,
    footer: initialFooter,
    bannerImage: "",
  });

  // Dialog states
  const [editDialog, setEditDialog] = useState({
    open: false,
    field: "",
    value: "",
    title: "",
    nested: false,
    nestedKey: "",
  });

  const [openAddService, setOpenAddService] = useState(false);
  const [services, setServices] = useState([]);
  const [currentService, setCurrentService] = useState({
    included: "no",
    particulars: "",
    amount: "",
    taxType: "",
  });

  const [openEmailDialog, setOpenEmailDialog] = useState(false);
  const [openPaymentDialog, setOpenPaymentDialog] = useState(false);
  const [openBankDialog, setOpenBankDialog] = useState(false);
  const [openAddFlight, setOpenAddFlight] = useState(false);
  const [flights, setFlights] = useState([]);

  // Bank details state
  const [accountType, setAccountType] = useState("company");
  const [accountName, setAccountName] = useState("Iconic Yatra");
  const [accountNumber, setAccountNumber] = useState("");
  const [ifscCode, setIfscCode] = useState("");
  const [bankName, setBankName] = useState("");
  const [branchName, setBranchName] = useState("");

  const [openAddBankDialog, setOpenAddBankDialog] = useState(false);
  const [newBankDetails, setNewBankDetails] = useState({
    bankName: "",
    branchName: "",
    accountHolderName: "",
    accountNumber: "",
    ifscCode: "",
    openingBalance: "",
  });

  const [accountOptions, setAccountOptions] = useState([
    { value: "Cash", label: "Cash" },
    { value: "KOTAK Bank", label: "KOTAK Bank" },
    { value: "YES Bank", label: "YES Bank" },
  ]);

  // Helper functions
  const handleEditOpen = (
    field,
    value,
    title,
    nested = false,
    nestedKey = ""
  ) => {
    setEditDialog({ open: true, field, value, title, nested, nestedKey });
  };

  const handleEditClose = () => {
    setEditDialog({
      open: false,
      field: "",
      value: "",
      title: "",
      nested: false,
      nestedKey: "",
    });
  };

  const handleEditSave = () => {
    if (editDialog.nested) {
      setQuotation((prev) => ({
        ...prev,
        [editDialog.field]: {
          ...prev[editDialog.field],
          [editDialog.nestedKey]: editDialog.value,
        },
      }));
    } else {
      setQuotation((prev) => ({
        ...prev,
        [editDialog.field]: editDialog.value,
      }));
    }
    handleEditClose();
  };

  const handleEditValueChange = (e) => {
    setEditDialog({ ...editDialog, value: e.target.value });
  };

  const handleConfirm = () => {
    setIsFinalized(true);
    setOpenFinalize(false);
    setOpenBankDialog(true);
  };

  const handleBankDialogClose = () => {
    setOpenBankDialog(false);
    setAccountType("company");
    setAccountName("Iconic Yatra");
    setAccountNumber("");
    setIfscCode("");
    setBankName("");
    setBranchName("");
  };

  const handleBankConfirm = () => {
    console.log("Bank details:", {
      accountType,
      accountName,
      accountNumber,
      ifscCode,
      bankName,
      branchName,
    });
    setInvoiceGenerated(true);
    handleBankDialogClose();
  };

  const handleAddBankOpen = () => {
    setOpenAddBankDialog(true);
  };

  const handleAddBankClose = () => {
    setOpenAddBankDialog(false);
    setNewBankDetails({
      bankName: "",
      branchName: "",
      accountHolderName: "",
      accountNumber: "",
      ifscCode: "",
      openingBalance: "",
    });
  }; 
 
  const handleNewBankChange = (field, value) => {
    setNewBankDetails((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleAddBank = () => {
    if (
      !newBankDetails.bankName ||
      !newBankDetails.accountHolderName ||
      !newBankDetails.accountNumber
    ) {
      alert("Please fill in all required fields");
      return;
    }

    const newAccount = {
      value: newBankDetails.bankName,
      label: `${newBankDetails.bankName} - ${newBankDetails.accountHolderName}`,
    };

    setAccountOptions((prev) => [...prev, newAccount]);
    setAccountName(newAccount.value);
    handleAddBankClose();
  };

  const handleServiceChange = (field, value) => {     
    setCurrentService((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleAddService = () => {
    if (
      !currentService.particulars ||
      (currentService.included === "no" && !currentService.amount)
    ) {
      alert("Please fill in all required fields");
      return;
    }

    const selectedTax = taxOptions.find(
      (option) => option.value === currentService.taxType
    );
    const taxRate = selectedTax ? selectedTax.rate : 0;

    const amount =
      currentService.included === "yes" ? 0 : parseFloat(currentService.amount);
    const taxAmount = amount * (taxRate / 100) || 0;

    const newService = {
      ...currentService,
      id: Date.now(),
      amount: amount,
      taxRate,
      taxAmount,
      totalAmount: amount + taxAmount,
      taxLabel: selectedTax ? selectedTax.label : "Non",
    };

    setServices((prev) => [...prev, newService]);
    setCurrentService({
      included: "yes",
      particulars: "",
      amount: "",
      taxType: "",
    });
  };

  const handleClearService = () => {
    setCurrentService({
      included: "yes",
      particulars: "",
      amount: "",
      taxType: "",
    });
  };

  const handleRemoveService = (id) => {
    setServices((prev) => prev.filter((service) => service.id !== id));
  };

  const handleSaveServices = () => {
    console.log("Services saved:", services);
    setOpenAddService(false);
  };

  const handleGenerateInvoice = () => {
    console.log("Generate Invoice clicked");
    setOpenBankDialog(true);
  };

  const handleViewInvoice = () => {
    console.log("View Invoice clicked");
  };

  const handleAddServiceOpen = () => setOpenAddService(true);
  const handleAddServiceClose = () => {
    setOpenAddService(false);
    setCurrentService({
      included: "yes",
      particulars: "",
      amount: "",
      taxType: "",
    });
  };
  const handleEmailOpen = () => setOpenEmailDialog(true);
  const handleEmailClose = () => setOpenEmailDialog(false);
  const handlePaymentOpen = () => setOpenPaymentDialog(true);
  const handlePaymentClose = () => setOpenPaymentDialog(false);
  const handleFinalizeOpen = () => setOpenFinalize(true);
  const handleFinalizeClose = () => setOpenFinalize(false);

  // Add flight handlers
  const handleAddFlightOpen = () => setOpenAddFlight(true);
  const handleAddFlightClose = () => setOpenAddFlight(false);
  const handleAddFlight = (flightDetails) => {
    setFlights((prev) => [...prev, { ...flightDetails, id: Date.now() }]);
    console.log("Flight added:", flightDetails);
  };

  // Constants for UI rendering
  const infoMap = {
    call: `📞 ${quotation.footer.phone}`,
    email: `✉️ ${quotation.footer.email}`,
    payment: `Received: ${quotation.footer.received}\n Balance: ${quotation.footer.balance}`,
    quotation: `Total Quotation Cost: ${quotation.pricing.total}`,
    guest: `No. of Guests: ${quotation.hotel.guests}`,
  };

  const infoChips = [
    { k: "call", icon: <Phone /> },
    { k: "email", icon: <AlternateEmail /> },
    { k: "payment", icon: <CreditCard /> },
    { k: "quotation", icon: <Description /> },
    { k: "guest", icon: <Person /> },
  ];

  const Accordions = [
    { title: "Hotel Details" },
    { title: "Vehicle Details" },
    { title: "Company Margin" },
    { title: "Agent Margin" },
  ];

  const Policies = [
    {
      title: "Inclusion Policy",
      icon: <CheckCircle sx={{ mr: 0.5, color: "success.main" }} />,
      content: (
        <List dense>
          {quotation.policies.inclusions.map((i, k) => (
            <ListItem key={k}>
              <ListItemText primary={i} />
            </ListItem>
          ))}
        </List>
      ),
      field: "policies.inclusions",
      isArray: true,
    },
    {
      title: "Exclusion Policy",
      icon: <Cancel sx={{ mr: 0.5, color: "error.main" }} />,
      content: quotation.policies.exclusions,
      field: "policies.exclusions",
    },
    {
      title: "Payment Policy",
      icon: <Payment sx={{ mr: 0.5, color: "primary.main" }} />,
      content: quotation.policies.paymentPolicy,
      field: "policies.paymentPolicy",
    },
    {
      title: "Cancellation & Refund",
      icon: <Warning sx={{ mr: 0.5, color: "warning.main" }} />,
      content: quotation.policies.cancellationPolicy,
      field: "policies.cancellationPolicy",
    },
  ];

  const pickupDetails = [
    {
      icon: (
        <CheckCircle sx={{ fontSize: 16, mr: 0.5, color: "success.main" }} />
      ),
      text: quotation.pickup.arrival,
      editable: true,
      field: "pickup",
      nestedKey: "arrival",
    },
    {
      icon: <Cancel sx={{ fontSize: 16, mr: 0.5, color: "error.main" }} />,
      text: quotation.pickup.departure,
      editable: true,
      field: "pickup",
      nestedKey: "departure",
    },
    {
      icon: <Group sx={{ fontSize: 16, mr: 0.5 }} />,
      text: `No of Guest: ${quotation.hotel.guests}`,
      editable: true,
      field: "hotel.guests",
    },
  ];

  const hotelTableHeaders = [
    "Destination",
    "Nights",
    "Standard",
    "Deluxe",
    "Superior",
  ];

  // Action handlers
  const actionHandlers = {
    Finalize: handleFinalizeOpen,
    "Add Service": handleAddServiceOpen,
    "Email Quotation": handleEmailOpen,
    "Preview PDF": () => console.log("Preview PDF clicked"),
    "Make Payment": handlePaymentOpen,
    "Add Flight": handleAddFlightOpen, // Add this line
  };

  return (
    <Box>
      <Box
        display="flex"
        justifyContent="flex-end"
        gap={1}
        mb={2}
        flexWrap="wrap"
      >
        {quotation.actions.map((a, i) => {
          if (a === "Finalize" && isFinalized) return null;

          return (
            <Button key={i} variant="contained" onClick={actionHandlers[a]}>
              {a}
            </Button>
          );
        })}

        {isFinalized && !invoiceGenerated && (
          <Button
            variant="contained"
            color="success"
            startIcon={<Receipt />}
            onClick={handleGenerateInvoice}
          >
            Generate Invoice
          </Button>
        )}

        {invoiceGenerated && (
          <Button
            variant="contained"
            color="info"
            startIcon={<Visibility />}
            onClick={handleViewInvoice}
          >
            View Invoice
          </Button>
        )}
      </Box>

      <Grid container spacing={2}>
        <Grid
          size={{ xs: 12, md: 3 }}
          sx={{
            borderRight: { md: "1px solid #ddd" },
            pt: 3,
            minHeight: "100vh",
            bgcolor: "#f8f9fa",
            textAlign: "center",
          }}
        >
          <Chip
            icon={<FormatQuoteIcon />}
            label="Custom Quotation"
            color="primary"
            variant="outlined"
            sx={{ mb: 3 }}
          />
          <Box sx={{ position: "sticky", top: 0 }}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" mb={1}>
                  <Person color="primary" sx={{ mr: 1 }} />
                  <Typography variant="h6">
                    {quotation.customer.name}
                  </Typography>
                </Box>
                <Box display="flex" alignItems="center" mb={2}>
                  <LocationOn
                    sx={{ fontSize: 18, mr: 0.5, color: "text.secondary" }}
                  />
                  <Typography variant="body2" color="text.secondary">
                    {quotation.customer.location}
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
                <Typography
                  variant="subtitle1"
                  fontWeight="bold"
                  color="warning.main"
                  mt={8}
                  textAlign="center"
                >
                  Margin & Taxes (B2C)
                </Typography>
                {Accordions.map((a, i) => (
                  <Accordion key={i}>
                    <AccordionSummary expandIcon={<ExpandMore />}>
                      <Typography color="primary" fontWeight="bold">
                        {a.title}
                      </Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Typography variant="body2">Details go here.</Typography>
                    </AccordionDetails>
                  </Accordion>
                ))}
              </CardContent>
            </Card>
          </Box>
        </Grid>

        <Grid size={{ xs: 12, md: 9 }}>
          <Card>
            <CardContent>
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
              >
                <Box display="flex" alignItems="center">
                  <CalendarToday sx={{ fontSize: 18, mr: 0.5 }} />
                  <Typography variant="body2" fontWeight="bold">
                    Date: {quotation.date}
                  </Typography>
                </Box>

                {isFinalized && (
                  <Typography
                    variant="h6"
                    color="success.main"
                    fontWeight="bold"
                    display="flex"
                    alignItems="center"
                  >
                    <CheckCircle sx={{ mr: 1 }} />
                    Confirmation Voucher
                  </Typography>
                )}
              </Box>

              <Box display="flex" alignItems="center" mt={1}>
                <Description sx={{ fontSize: 18, mr: 0.5 }} />
                <Typography variant="body2" fontWeight="bold">
                  Ref: {quotation.reference}
                </Typography>
              </Box>
              <Box display="flex" alignItems="center" mt={2}>
                <Person sx={{ fontSize: 18, mr: 0.5 }} />
                <Typography variant="subtitle1" fontWeight="bold">
                  Kind Attention: {quotation.customer.name}
                </Typography>
              </Box>

              <Box
                mt={2}
                p={2}
                sx={{ backgroundColor: "grey.50", borderRadius: 1 }}
              >
                <Box
                  display="flex"
                  alignItems="center"
                  justifyContent="space-between"
                  mb={1}
                >
                  <Typography
                    variant="subtitle2"
                    fontWeight="bold"
                    display="flex"
                    alignItems="center"
                    sx={{ fontSize: "0.875rem" }}
                  >
                    <RouteIcon sx={{ mr: 0.5 }} />
                   Pickup/Drop Details
                  </Typography>
                </Box>
                {pickupDetails.map((i, k) => (
                  <Box key={k} display="flex" alignItems="center" mb={0.5}>
                    {i.icon}
                    <Typography variant="body2" sx={{ mr: 1 }}>
                      {i.text}
                    </Typography>
                    {i.editable && (
                      <IconButton
                        size="small"
                        onClick={() =>
                          handleEditOpen(
                            i.field,
                            i.text,
                            i.nestedKey || i.field,
                            !!i.nestedKey,
                            i.nestedKey
                          )
                        }
                      >
                        <Edit fontSize="small" />
                      </IconButton>
                    )}
                  </Box>
                ))}
              </Box>

              <Box mt={3}>
                <Box display="flex" alignItems="center">
                  <FormatQuoteIcon sx={{ mr: 1 }} />
                  <Typography
                    variant="h6"
                    fontWeight="bold"
                    color="warning.main"
                  >
                    Custom Quotation For {quotation.customer.name}
                  </Typography>
                </Box>
                <Box display="flex" alignItems="center" mt={1}>
                  <Route sx={{ mr: 0.5 }} />
                  <Typography variant="subtitle2">
                    Destination : {quotation.hotel.destination}
                  </Typography>
                </Box>
                <Box display="flex" alignItems="center" mt={1}>
                  <ImageIcon sx={{ mr: 0.5 }} />
                  <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
                    Add Banner Image
                  </Typography>
                  <Button component="label" sx={{ textTransform: "none" }}>
                    <AddCircleOutline />
                    <input
                      type="file"
                      hidden
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) {
                          // Set the file name to display
                          setQuotation((prev) => ({
                            ...prev,
                            bannerImage: file.name,
                          }));

                          // You can also handle the file upload here
                          console.log("Selected file:", file);
                        }
                      }}
                    />
                  </Button>
                  {quotation.bannerImage && (
                    <Typography
                      variant="body2"
                      sx={{ ml: 2, fontStyle: "italic" }}
                    >
                      Selected: {quotation.bannerImage}
                    </Typography>
                  )}
                </Box>

                <Box display="flex" flexDirection="column" mt={2}>
                  <Box display="flex" alignItems="center" mb={1}>
                    <Warning sx={{ mr: 1, color: "warning.main" }} />
                    <Typography
                      variant="h6"
                      fontWeight="bold"
                      color="warning.main"
                    >
                      Day Wise Itinerary
                    </Typography>
                  </Box>

                  <Box
                    display="flex"
                    alignItems="center"
                    justifyContent="space-between"
                  >
                    <Typography variant="body2" sx={{ flex: 1, mr: 2 }}>
                      {quotation.hotel.itinerary}
                    </Typography>
                    <IconButton
                      size="small"
                      onClick={() =>
                        handleEditOpen(
                          "hotel.itinerary",
                          quotation.hotel.itinerary,
                          "Itinerary Note"
                        )
                      }
                    >
                      <Edit fontSize="small" />
                    </IconButton>
                  </Box>
                </Box>
              </Box>

              <Box display="flex" flexDirection="column" mt={2}>
                <Box display="flex" alignItems="center" mb={1}>
                  <FormatQuote sx={{ mr: 1, color: "warning.main" }} />
                  <Typography
                    variant="h6"
                    fontWeight="bold"
                    color="warning.main"
                  >
                    Quotation Details
                  </Typography>
                </Box>

                <Box>
                  <Typography variant="body2" sx={{ flex: 1, mr: 2 }}>
                    No of Guest : {quotation.hotel.guests}
                  </Typography>
                  <Typography variant="body2" sx={{ flex: 1, mr: 2 }}>
                    No of Rooms : {quotation.hotel.rooms}
                  </Typography>
                  <Typography variant="body2" sx={{ flex: 1, mr: 2 }}>
                    Meal Plan : {quotation.hotel.mealPlan}
                  </Typography>
                </Box>
              </Box>

              {/* Hotel Pricing Table */}
              <Box mt={3}>
                <TableContainer component={Paper} variant="outlined">
                  <Table>
                    <TableHead sx={{ backgroundColor: "primary.light" }}>
                      <TableRow>
                        {hotelTableHeaders.map((h) => (
                          <TableCell
                            key={h}
                            sx={{ color: "white", fontWeight: "bold" }}
                          >
                            {h}
                          </TableCell>
                        ))}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {hotelPricingData.map((row, index) => (
                        <TableRow
                          key={index}
                          sx={{
                            backgroundColor:
                              index >= hotelPricingData.length - 2
                                ? "grey.50"
                                : "inherit",
                            fontWeight:
                              index === hotelPricingData.length - 1
                                ? "bold"
                                : "normal",
                          }}
                        >
                          <TableCell>{row.destination}</TableCell>
                          <TableCell>{row.nights}</TableCell>
                          <TableCell>{row.standard}</TableCell>
                          <TableCell>{row.deluxe}</TableCell>
                          <TableCell>{row.superior}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>

              <Grid container spacing={2} mt={1}>
                {Policies.map((p, i) => (
                  <Grid size={{ xs: 12 }} key={i}>
                    <Card variant="outlined"> 
                      <CardContent>
                        <Box
                          display="flex"
                          alignItems="center"
                          justifyContent="space-between"
                        >
                          <Typography
                            variant="subtitle2"
                            gutterBottom
                            display="flex"
                            alignItems="center"
                            sx={{ fontSize: "0.875rem" }}
                          >
                            {p.icon}
                            {p.title}
                          </Typography>
                          <IconButton
                            size="small"
                            onClick={() =>
                              handleEditOpen(
                                p.field,
                                p.isArray
                                  ? JSON.stringify(p.content)
                                  : p.content,
                                p.title
                              )
                            }
                          >
                            <Edit fontSize="small" />
                          </IconButton>
                        </Box>
                        <Typography variant="body2">{p.content}</Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>

              <Box mt={2}>
                <Card variant="outlined">
                  <CardContent>
                    <Box
                      display="flex"
                      alignItems="center"
                      justifyContent="space-between"
                    >
                      <Typography
                        variant="subtitle2"
                        gutterBottom
                        display="flex"
                        alignItems="center"
                        sx={{ fontSize: "0.875rem" }}
                      >
                        <Description sx={{ mr: 0.5 }} />
                        Terms & Condition
                      </Typography>
                      <IconButton
                        size="small"
                        onClick={() =>
                          handleEditOpen(
                            "policies.terms",
                            quotation.policies.terms,
                            "Terms & Conditions"
                          )
                        }
                      >
                        <Edit fontSize="small" />
                      </IconButton>
                    </Box>
                    <Typography variant="body2">
                      {quotation.policies.terms}
                    </Typography>
                  </CardContent>
                </Card>
              </Box>

              <Box
                mt={4}
                p={2}
                sx={{
                  backgroundColor: "primary.light",
                  borderRadius: 1,
                  color: "white",
                }}
              >
                <Box
                  display="flex"
                  alignItems="center"
                  justifyContent="space-between"
                >
                  <Typography variant="body2">
                    Thanks & Regards,
                    <br />
                    <Person sx={{ mr: 0.5, fontSize: 18 }} />
                    {quotation.footer.contact}
                  </Typography>
                  <IconButton
                    size="small"
                    sx={{ color: "white" }}
                    onClick={() =>
                      handleEditOpen(
                        "footer.contact",
                        quotation.footer.contact,
                        "Footer Contact",
                        false
                      )
                    }
                  >
                    <Edit fontSize="small" />
                  </IconButton>
                </Box>
                <Typography
                  variant="subtitle1"
                  sx={{ mt: 1, fontWeight: "bold" }}
                >
                  {quotation.footer.company}
                </Typography>
                <Box display="flex" alignItems="center" mt={0.5}>
                  <Business sx={{ mr: 0.5, fontSize: 18 }} />
                  {quotation.footer.address}
                </Box>
                <Box display="flex" alignItems="center" mt={0.5}>
                  <Language sx={{ mr: 0.5, fontSize: 18 }} />
                  <a
                    href={quotation.footer.website}
                    target="_blank"
                    rel="noreferrer"
                    style={{ color: "white", textDecoration: "underline" }}
                  >
                    {quotation.footer.website}
                  </a>
                  <Typography variant="subtitle1" sx={{ ml: 2 }}>
                    GST : 09EYCPK8832C1ZC
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Dialogs */}
      <FinalizeDialog
        open={openFinalize}
        onClose={handleFinalizeClose}
        vendor={vendor}
        setVendor={setVendor}
        onConfirm={handleConfirm}
      />

      <BankDetailsDialog
        open={openBankDialog}
        onClose={handleBankDialogClose}
        accountType={accountType}
        setAccountType={setAccountType}
        accountName={accountName}
        setAccountName={setAccountName}
        accountOptions={accountOptions}
        onAddBankOpen={handleAddBankOpen}
        onConfirm={handleBankConfirm}
      />

      <AddBankDialog
        open={openAddBankDialog}
        onClose={handleAddBankClose}
        newBankDetails={newBankDetails}
        onNewBankChange={handleNewBankChange}
        onAddBank={handleAddBank}
      />

      <EditDialog
        open={editDialog.open}
        onClose={handleEditClose}
        title={editDialog.title}
        value={editDialog.value}
        onValueChange={handleEditValueChange}
        onSave={handleEditSave}
      />

      <AddServiceDialog
        open={openAddService}
        onClose={handleAddServiceClose}
        currentService={currentService}
        onServiceChange={handleServiceChange}
        services={services}
        onAddService={handleAddService}
        onClearService={handleClearService}
        onRemoveService={handleRemoveService}
        onSaveServices={handleSaveServices}
        taxOptions={taxOptions}
      />

      <AddFlightDialog // Add this dialog
        open={openAddFlight}
        onClose={handleAddFlightClose}
        onSave={handleAddFlight}
      />

      <EmailQuotationDialog
        open={openEmailDialog}
        onClose={handleEmailClose}
        customer={quotation.customer}
      />

      <MakePaymentDialog
        open={openPaymentDialog}
        onClose={handlePaymentClose}
      />
    </Box>
  );
};

export default CustomFinalize;
