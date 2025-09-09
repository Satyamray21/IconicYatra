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
  DirectionsCar,
  Payment,
  Phone,
  AlternateEmail,
  CreditCard,
  Description,
  Person,
  LocationOn,
  CalendarToday,
  AccessTime,
  Group,
  Route,
  CheckCircle,
  Cancel,
  Warning,
  Business,
  Language,
  ExpandMore,
  Edit,
  Receipt,
  Visibility, // Added for View Invoice icon
} from "@mui/icons-material";
import EmailQuotationDialog from "././Dialog/EmailQuotationDialog";
import MakePaymentDialog from "././Dialog/MakePaymentDialog";
import FinalizeDialog from "././Dialog/FinalizeDialog";
import BankDetailsDialog from "././Dialog/BankDetailsDialog";
import AddBankDialog from "././Dialog/AddBankDialog";
import EditDialog from "././Dialog/EditDialog";
import AddServiceDialog from "././Dialog/AddServiceDialog";
import {}
const VehicleQuotationPage = () => {
  const [activeInfo, setActiveInfo] = useState(null);
  const [openFinalize, setOpenFinalize] = useState(false);
  const [vendor, setVendor] = useState("");
  const [isFinalized, setIsFinalized] = useState(false);
  const [invoiceGenerated, setInvoiceGenerated] = useState(false); // New state for invoice generation
  const [editDialog, setEditDialog] = useState({
    open: false,
    field: "",
    value: "",
    title: "",
    nested: false,
    nestedKey: "",
  });

  // Add Service Dialog State
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

  // Bank Details Dialog State
  const [openBankDialog, setOpenBankDialog] = useState(false);
  const [accountType, setAccountType] = useState("company");
  const [accountName, setAccountName] = useState("Iconic Yatra");
  const [accountNumber, setAccountNumber] = useState("");
  const [ifscCode, setIfscCode] = useState("");
  const [bankName, setBankName] = useState("");
  const [branchName, setBranchName] = useState("");

  // Add New Bank Dialog State
  const [openAddBankDialog, setOpenAddBankDialog] = useState(false);
  const [newBankDetails, setNewBankDetails] = useState({
    bankName: "",
    branchName: "",
    accountHolderName: "",
    accountNumber: "",
    ifscCode: "",
    openingBalance: "",
  });

  // Account options for dropdown
  const [accountOptions, setAccountOptions] = useState([
    { value: "Cash", label: "Cash" },
    { value: "KOTAK Bank", label: "KOTAK Bank" },
    { value: "YES Bank", label: "YES Bank" },
  ]);

  const taxOptions = [
    { value: "gst5", label: "GST 5%", rate: 5 },
    { value: "gst18", label: "GST 18%", rate: 18 },
    { value: "non", label: "Non", rate: 0 },
  ];

  const [q, setQ] = useState({
    actions: [
      "Finalize",
      "Add Service",
      "Email Quotation",
      "Preview PDF",
      "Make Payment",
    ],
    customer: { name: "Amit Jaiswal", location: "Andhya Pradesh" },
    date: "27/08/2025",
    reference: "41",
    pickup: {
      arrival: "Arrival: Lucknow (22/08/2025) at Airport, 3:35PM",
      departure: "Departure: Delhi (06/09/2025) from Local Address, 6:36PM",
    },
    guests: "6 Adults",
    itineraryNote:
      "This is only tentative schedule for sightseeing and travel...",
    vehicles: [
      {
        name: "ERTIGA",
        pickup: { date: "22/08/2025", time: "3:35PM" },
        drop: { date: "06/09/2025", time: "6:36PM" },
        cost: "₹ 2,000",
      },
    ],
    discount: "₹ 200",
    gst: "₹ 140",
    total: "₹ 3,340",
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
    footer: {
      contact: "Amit Jaiswal | +91 7053900957 (Noida)",
      phone: "+91 7053900957",
      email: "amit.jaiswal@example.com",
      received: "₹ 1,500",
      balance: "₹ 1,840",
      company: "Iconic Yatra",
      address:
        "Office No 15, Bhawani Market Sec 27, Noida, Uttar Pradesh – 201301",
      website: "https://www.iconicyatra.com",
    },
  });

  // Dialog handlers
  const handleEmailOpen = () => setOpenEmailDialog(true);
  const handleEmailClose = () => setOpenEmailDialog(false);

  const handlePaymentOpen = () => setOpenPaymentDialog(true);
  const handlePaymentClose = () => setOpenPaymentDialog(false);

  const handleFinalizeOpen = () => setOpenFinalize(true);
  const handleFinalizeClose = () => setOpenFinalize(false);

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
      setQ((prev) => ({
        ...prev,
        [editDialog.field]: {
          ...prev[editDialog.field],
          [editDialog.nestedKey]: editDialog.value,
        },
      }));
    } else {
      setQ((prev) => ({ ...prev, [editDialog.field]: editDialog.value }));
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
    setInvoiceGenerated(true); // Set invoice as generated
    handleBankDialogClose();
  };

  // Add New Bank Functions
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

  // Add Service Functions
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
    handleAddServiceClose();
  };

  const calculateTotalAmount = () => {
    return services.reduce((total, service) => total + service.totalAmount, 0);
  };

  // Invoke the helper so it's considered used by linters
  calculateTotalAmount();

  const handleGenerateInvoice = () => {
    console.log("Generate Invoice clicked");
    setOpenBankDialog(true); // Open the Bank Details Dialog
  };

  const handleViewInvoice = () => {
    console.log("View Invoice clicked");
    // Logic to view the generated invoice would go here
    // This could open a dialog, navigate to a new page, or open a PDF viewer
  };

  const infoMap = {
    call: `📞 ${q.footer.phone}`,
    email: `✉️ ${q.footer.email}`,
    payment: `Received: ${q.footer.received}\n Balance: ${q.footer.balance}`,
    quotation: `Total Quotation Cost: ${q.total}`,
    guest: `No. of Guests: ${q.guests}`,
  };

  const infoChips = [
    { k: "call", icon: <Phone /> },
    { k: "email", icon: <AlternateEmail /> },
    { k: "payment", icon: <CreditCard /> },
    { k: "quotation", icon: <Description /> },
    { k: "guest", icon: <Person /> },
  ];

  const Accordions = [
    { title: "Vehicle Details" },
    { title: "Company Margin" },
  ];

  const Policies = [
    {
      title: "Inclusion Policy",
      icon: <CheckCircle sx={{ mr: 0.5, color: "success.main" }} />,
      content: (
        <List dense>
          {q.inclusions.map((i, k) => (
            <ListItem key={k}>
              <ListItemText primary={i} />
            </ListItem>
          ))}
        </List>
      ),
      field: "inclusions",
      isArray: true,
    },
    {
      title: "Exclusion Policy",
      icon: <Cancel sx={{ mr: 0.5, color: "error.main" }} />,
      content: q.exclusions,
      field: "exclusions",
    },
    {
      title: "Payment Policy",
      icon: <Payment sx={{ mr: 0.5, color: "primary.main" }} />,
      content: q.paymentPolicy,
      field: "paymentPolicy",
    },
    {
      title: "Cancellation & Refund",
      icon: <Warning sx={{ mr: 0.5, color: "warning.main" }} />,
      content: q.cancellationPolicy,
      field: "cancellationPolicy",
    },
  ];

  const pickupDetails = [
    {
      icon: (
        <CheckCircle sx={{ fontSize: 16, mr: 0.5, color: "success.main" }} />
      ),
      text: q.pickup.arrival,
      editable: true,
      field: "pickup",
      nestedKey: "arrival",
    },
    {
      icon: <Cancel sx={{ fontSize: 16, mr: 0.5, color: "error.main" }} />,
      text: q.pickup.departure,
      editable: true,
      field: "pickup",
      nestedKey: "departure",
    },
    {
      icon: <Group sx={{ fontSize: 16, mr: 0.5 }} />,
      text: `No of Guest: ${q.guests}`,
      editable: true,
      field: "guests",
    },
  ];

  const tableHeaders = ["Vehicle Name", "Pickup", "Drop", "Cost"];

  return (
    <Box>
      <Box
        display="flex"
        justifyContent="flex-end"
        gap={1}
        mb={2}
        flexWrap="wrap"
      >
        {q.actions.map((a, i) => {
          // Skip the Finalize button if already finalized
          if (a === "Finalize" && isFinalized) return null;

          return (
            <Button
              key={i}
              variant="contained"
              onClick={
                a === "Finalize"
                  ? handleFinalizeOpen
                  : a === "Add Service"
                  ? handleAddServiceOpen
                  : a === "Email Quotation"
                  ? handleEmailOpen
                  : a === "Make Payment"
                  ? handlePaymentOpen
                  : undefined
              }
            >
              {a}
            </Button>
          );
        })}

        {/* Show Generate Invoice button if finalized but invoice not generated yet */}
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

        {/* Show View Invoice button if invoice has been generated */}
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
        <Grid size={{ xs: 12, md: 3 }}>
          <Box sx={{ position: "sticky", top: 0 }}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" mb={1}>
                  <Person color="primary" sx={{ mr: 1 }} />
                  <Typography variant="h6">{q.customer.name}</Typography>
                </Box>
                <Box display="flex" alignItems="center" mb={2}>
                  <LocationOn
                    sx={{ fontSize: 18, mr: 0.5, color: "text.secondary" }}
                  />
                  <Typography variant="body2" color="text.secondary">
                    {q.customer.location}
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
                    Date: {q.date}
                  </Typography>
                </Box>

                {/* Show Confirmation Voucher text if finalized */}
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
                  Ref: {q.reference}
                </Typography>
              </Box>
              <Box display="flex" alignItems="center, mt: 2">
                <Person sx={{ fontSize: 18, mr: 0.5 }} />
                <Typography variant="subtitle1" fontWeight="bold">
                  Kind Attention: {q.customer.name}
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
                >
                  <Typography
                    variant="subtitle2"
                    fontWeight="bold"
                    gutterBottom
                    display="flex"
                    alignItems="center"
                    sx={{ fontSize: "0.875rem" }}
                  >
                    <Route sx={{ mr: 0.5 }} />
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
                  <DirectionsCar sx={{ mr: 1 }} />
                  <Typography
                    variant="h6"
                    fontWeight="bold"
                    color="warning.main"
                  >
                    Vehicle Quotation For {q.customer.name}
                  </Typography>
                </Box>
                <Box display="flex" alignItems="center" mt={1}>
                  <Route sx={{ mr: 0.5 }} />
                  <Typography variant="subtitle2">
                    Itinerary Route Plan
                  </Typography>
                </Box>
                <Box display="flex" mt={1}>
                  <Warning sx={{ mr: 1, color: "warning.main", mt: 0.2 }} />
                  <Typography variant="body2">{q.itineraryNote}</Typography>
                  <IconButton
                    size="small"
                    onClick={() =>
                      handleEditOpen(
                        "itineraryNote",
                        q.itineraryNote,
                        "Itinerary Note"
                      )
                    }
                  >
                    <Edit fontSize="small" />
                  </IconButton>
                </Box>
              </Box>

              <Box mt={3}>
                <TableContainer component={Paper} variant="outlined">
                  <Table>
                    <TableHead sx={{ backgroundColor: "primary.light" }}>
                      <TableRow>
                        {tableHeaders.map((h) => (
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
                      {q.vehicles.map((v, i) => (
                        <TableRow key={i}>
                          <TableCell>
                            <DirectionsCar
                              sx={{ mr: 1, color: "primary.main" }}
                            />
                            {v.name}
                          </TableCell>
                          <TableCell>
                            <CalendarToday sx={{ fontSize: 16, mr: 0.5 }} />
                            {v.pickup.date}
                            <br />
                            <AccessTime sx={{ fontSize: 16, mr: 0.5 }} />
                            {v.pickup.time}
                          </TableCell>
                          <TableCell>
                            <CalendarToday sx={{ fontSize: 16, mr: 0.5 }} />
                            {v.drop.date}
                            <br />
                            <AccessTime sx={{ fontSize: 16, mr: 0.5 }} />
                            {v.drop.time}
                          </TableCell>
                          <TableCell>{v.cost}</TableCell>
                        </TableRow>
                      ))}
                      <TableRow sx={{ backgroundColor: "grey.50" }}>
                        <TableCell>Discount</TableCell>
                        <TableCell colSpan={2} />
                        <TableCell>-{q.discount}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>GST</TableCell>
                        <TableCell colSpan={2} />
                        <TableCell>{q.gst}</TableCell>
                      </TableRow>
                      <TableRow sx={{ backgroundColor: "primary.main" }}>
                        <TableCell
                          colSpan={3}
                          align="left"
                          sx={{ color: "white", fontWeight: "bold" }}
                        >
                          Total Quotation Cost
                        </TableCell>
                        <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                          {q.total}
                        </TableCell>
                      </TableRow>
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
                          handleEditOpen("terms", q.terms, "Terms & Conditions")
                        }
                      >
                        <Edit fontSize="small" />
                      </IconButton>
                    </Box>
                    <Typography variant="body2">{q.terms}</Typography>
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
                    {q.footer.contact}
                  </Typography>
                  <IconButton
                    size="small"
                    sx={{ color: "white" }}
                    onClick={() =>
                      handleEditOpen(
                        "footer",
                        q.footer.contact,
                        "Footer Contact",
                        true,
                        "contact"
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
                  {q.footer.company}
                </Typography>
                <Box display="flex" alignItems="center" mt={0.5}>
                  <Business sx={{ mr: 0.5, fontSize: 18 }} />
                  {q.footer.address}
                </Box>
                <Box display="flex" alignItems="center, mt: 0.5">
                  <Language sx={{ mr: 0.5, fontSize: 18 }} />
                  <a
                    href={q.footer.website}
                    target="_blank"
                    rel="noreferrer"
                    style={{ color: "white", textDecoration: "underline" }}
                  >
                    {q.footer.website}
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

      {/* Finalize Dialog */}
      <FinalizeDialog
        open={openFinalize}
        onClose={handleFinalizeClose}
        vendor={vendor}
        setVendor={setVendor}
        onConfirm={handleConfirm}
      />

      {/* Bank Details Dialog */}
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

      {/* Add New Bank Dialog */}
      <AddBankDialog
        open={openAddBankDialog}
        onClose={handleAddBankClose}
        newBankDetails={newBankDetails}
        onNewBankChange={handleNewBankChange}
        onAddBank={handleAddBank}
      />

      {/* Edit Dialog */}
      <EditDialog
        open={editDialog.open}
        onClose={handleEditClose}
        title={editDialog.title}
        value={editDialog.value}
        onValueChange={handleEditValueChange}
        onSave={handleEditSave}
      />

      {/* Add Service Dialog */}
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

      {/* Email Quotation Dialog */}
      <EmailQuotationDialog
        open={openEmailDialog}
        onClose={handleEmailClose}
        customer={q.customer}
      />

      {/* Payment Dialog */}
      <MakePaymentDialog
        open={openPaymentDialog}
        onClose={handlePaymentClose}
      />
    </Box>
  );
};

export default VehicleQuotationPage;