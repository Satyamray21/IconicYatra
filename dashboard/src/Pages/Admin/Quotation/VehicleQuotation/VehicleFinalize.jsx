import React, { useState, useEffect } from "react";
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
  CircularProgress,
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
  Visibility,
} from "@mui/icons-material";
import EmailQuotationDialog from "./Dialog/EmailQuotationDialog";
import MakePaymentDialog from "./Dialog/MakePaymentDialog";
import FinalizeDialog from "./Dialog/FinalizeDialog";
import BankDetailsDialog from "./Dialog/BankDetailsDialog";
import AddBankDialog from "./Dialog/AddBankDialog";
import EditDialog from "./Dialog/EditDialog";
import AddServiceDialog from "./Dialog/AddServiceDialog";
import { getVehicleQuotationById } from "../../../../features/quotation/vehicleQuotationSlice";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { useRef } from "react";
import logo from "../../../../assets/logo.png";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import html2canvas from "html2canvas";


const VehicleQuotationPage = () => {
  const [logoBase64, setLogoBase64] = useState(null);
  const [activeInfo, setActiveInfo] = useState(null);
  const [openFinalize, setOpenFinalize] = useState(false);
  const [vendor, setVendor] = useState("");
  const [isFinalized, setIsFinalized] = useState(false);
  const [invoiceGenerated, setInvoiceGenerated] = useState(false);
  const dispatch = useDispatch();
  const { id } = useParams();
  const pdfRef = useRef();
  const { viewedVehicleQuotation: q, loading } = useSelector(
    (state) => state.vehicleQuotation
  );

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

  const taxOptions = [
    { value: "gst5", label: "GST 5%", rate: 5 },
    { value: "gst18", label: "GST 18%", rate: 18 },
    { value: "non", label: "Non", rate: 0 },
  ];

  useEffect(() => {
    if (id) {
      dispatch(getVehicleQuotationById(id));
    }
  }, [dispatch, id]);
useEffect(() => {
    const convertImageToBase64 = (img) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
      return canvas.toDataURL('image/png');
    };

    const img = new Image();
    img.onload = () => {
      setLogoBase64(convertImageToBase64(img));
    };
    img.src = logo;
  }, []);
  const actions = [
    "Finalize",
    "Add Service",
    "Email Quotation",
    "Preview PDF",
    "Client PDF",
    "Make Payment",
  ];

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
    // This would typically update the backend via an API call
    // For now, we'll just close the dialog
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

  // Add New Bank Functions
  const handleAddBankOpen = () => {
    setOpenAddBankDialog(true);
  };
  
  const handlePreviewPdf = async () => {
    const element = pdfRef.current;
    if (!element) {
      console.error("PDF ref not available");
      return;
    }
    
    const canvas = await html2canvas(element, { 
      scale: 2,
      useCORS: true,
      logging: false
    });
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "mm", "a4");

    const imgWidth = 210; // A4 width
    const pageHeight = 297;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    let heightLeft = imgHeight;
    let position = 0;

    pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    while (heightLeft > 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    // Use a safe reference for the filename
    const vehicleQuotationId = q?.vehicle?.vehicleQuotationId || "preview";
    pdf.save(`quotation_${vehicleQuotationId}.pdf`);
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

  const handleGenerateInvoice = () => {
    console.log("Generate Invoice clicked");
    setOpenBankDialog(true);
  };

  const handleViewInvoice = () => {
    console.log("View Invoice clicked");
  };

  const handleActionClick = (action) => {
    switch (action) {
      case "Finalize":
        handleFinalizeOpen();
        break;
      case "Add Service":
        handleAddServiceOpen();
        break;
      case "Email Quotation":
        handleEmailOpen();
        break;
      case "Preview PDF":
        handlePreviewPdf();
        break;
        case "Client PDF":  // ✅ New dynamic client PDF
        handleClientPdf();
        break;
      case "Make Payment":
        handlePaymentOpen();
        break;
      default:
        console.log("Unknown action:", action);
    }
  };

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
  const tourDetails = lead.tourDetails || {};
  const members = tourDetails.members || {};

  const infoMap = {
    call: `📞 ${personalDetails.mobile || "N/A"}`,
    email: `✉️ ${personalDetails.emailId || "N/A"}`,
    payment: `Received: 0\n Balance: ${costDetails.totalCost || "N/A"}`,
    quotation: `Total Quotation Cost: ${costDetails.totalCost || "N/A"}`,
    guest: `No. of Guests: ${members.adults || 0}`,
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

  // Default policies if not provided in API response
  const defaultPolicies = {
    inclusions: [
      "All transfers tours in a Private AC cab.",
      "Parking, Toll charges, Fuel and Driver expenses.",
      "Hotel Taxes.",
      "Car AC off during hill stations.",
    ],
    exclusions: "1. Any Cost change due to change in Government guidelines like GST, Fuel price, etc.\n2. Any personal expenses like laundry, telephone bills, tips, etc.\n3. Anything not mentioned in the inclusions.",
    paymentPolicy: "50% amount to pay at confirmation, balance before 10 days.",
    cancellationPolicy: "1. Before 15 days: 50%. 2. Within 7 days: 100%.",
  };

  const Policies = [
    {
      title: "Inclusion Policy",
      icon: <CheckCircle sx={{ mr: 0.5, color: "success.main" }} />,
      content: defaultPolicies.inclusions,
      field: "inclusions",
      isArray: true,
    },
    {
      title: "Exclusion Policy",
      icon: <Cancel sx={{ mr: 0.5, color: "error.main" }} />,
      content: defaultPolicies.exclusions,
      field: "exclusions",
      isArray: false,
    },
    {
      title: "Payment Policy",
      icon: <Payment sx={{ mr: 0.5, color: "primary.main" }} />,
      content: defaultPolicies.paymentPolicy,
      field: "paymentPolicy",
      isArray: false,
    },
    {
      title: "Cancellation & Refund",
      icon: <Warning sx={{ mr: 0.5, color: "warning.main" }} />,
      content: defaultPolicies.cancellationPolicy,
      field: "cancellationPolicy",
      isArray: false,
    },
  ];

  const pickupDetails = [
    {
      icon: <CheckCircle sx={{ fontSize: 16, mr: 0.5, color: "success.main" }} />,
      text: `Arrival: ${pickupDropDetails.pickupLocation || "N/A"} (${pickupDropDetails.pickupDate ? new Date(pickupDropDetails.pickupDate).toLocaleDateString() : "N/A"})`,
      editable: true,
      field: "pickup",
      nestedKey: "arrival",
    },
    {
      icon: <Cancel sx={{ fontSize: 16, mr: 0.5, color: "error.main" }} />,
      text: `Departure: ${pickupDropDetails.dropLocation || "N/A"} (${pickupDropDetails.dropDate ? new Date(pickupDropDetails.dropDate).toLocaleDateString() : "N/A"})`,
      editable: true,
      field: "pickup",
      nestedKey: "departure",
    },
    {
      icon: <Group sx={{ fontSize: 16, mr: 0.5 }} />,
      text: `No of Guest: ${members.adults || 0}`,
      editable: true,
      field: "guests",
    },
  ];

  const tableHeaders = ["Vehicle Name", "Pickup", "Drop", "Cost"];

  const terms = "1. This is only a Quote. Availability is checked only on confirmation.\n2. Rates are subject to change without prior notice.\n3. All disputes are subject to Noida Jurisdiction only.";

  const footer = {
    contact: `${personalDetails.fullName || "N/A"} | ${personalDetails.mobile || "N/A"}`,
    phone: personalDetails.mobile || "N/A",
    email: personalDetails.emailId || "N/A",
    received: "₹ 0",
    balance: `₹ ${costDetails.totalCost || "N/A"}`,
    company: "Iconic Yatra",
    address: "Office No 15, Bhawani Market Sec 27, Noida, Uttar Pradesh – 201301",
    website: "https://www.iconicyatra.com",
  };

const handleClientPdf = () => {
  const pdf = new jsPDF("p", "mm", "a4");
  let y = 20;
  
  // Colors
  const primaryColor = [0, 102, 204]; // Blue
  const secondaryColor = [255, 153, 0]; // Orange
  const darkColor = [51, 51, 51]; // Dark gray
  
  // Add logo function
   const addLogo = (x, y, width = 40) => {
      if (logoBase64) {
        pdf.addImage(logoBase64, 'PNG', x, y, width, width * 0.3);
      } else {
        // Fallback to text if no logo
        pdf.setFillColor(240, 240, 240);
        pdf.roundedRect(x, y, width, width/3, 2, 2, 'F');
        pdf.setFontSize(10);
        pdf.setTextColor(primaryColor);
        pdf.setFont(undefined, 'bold');
        pdf.text("ICONIC YATRA", x + width/2, y + width/6, { align: 'center' });
        pdf.setFontSize(6);
        pdf.setTextColor(100, 100, 100);
        pdf.setFont(undefined, 'normal');
        pdf.text("TRAVEL AND TOURISM AGENCY", x + width/2, y + width/4, { align: 'center' });
      }
    };

    // Add logo at the top
    addLogo(15, 15, 40);
  // Header with blue background
  pdf.setFillColor(...primaryColor);
  pdf.rect(60, 15, 135, 12, 'F');
  
  pdf.setFontSize(16);
  pdf.setTextColor(255, 255, 255);
  pdf.text("TRAVEL QUOTATION", 127.5, 22, { align: 'center' });
  
  y = 35;

  // ---------- Client Details ----------
  pdf.setFillColor(250, 250, 250);
  pdf.roundedRect(15, y, 180, 25, 3, 3, 'F');
  pdf.setDrawColor(220, 220, 220);
  pdf.roundedRect(15, y, 180, 25, 3, 3);
  
  pdf.setFontSize(12);
  pdf.setTextColor(...primaryColor);
  pdf.text("QUOTATION FOR", 20, y + 8);
  
  pdf.setFontSize(16);
  pdf.setFont(undefined, 'bold');
  pdf.setTextColor(...darkColor);
  pdf.text(basicsDetails.clientName || "CLIENT NAME", 20, y + 16);
  
  pdf.setFontSize(11);
  pdf.setFont(undefined, 'normal');
  pdf.setTextColor(100, 100, 100);
  pdf.text(location.state || "Location", 20, y + 22);
  
  // Quotation details on right side
  const today = new Date();
  pdf.setFontSize(9);
  pdf.setTextColor(100, 100, 100);
  pdf.text(`Date: ${today.toLocaleDateString()}`, 160, y + 8);
  pdf.text(`Ref: ${vehicle.vehicleQuotationId || "N/A"}`, 160, y + 13);
  pdf.text(`Valid Until: ${pickupDropDetails.validTo || "N/A"}`, 160, y + 18);
  
  y += 35;

  // ---------- About Us ----------
  pdf.setFontSize(12);
  pdf.setTextColor(...primaryColor);
  pdf.setFont(undefined, 'bold');
  pdf.text("About Us", 15, y);
  y += 6;
  
  pdf.setFontSize(10);
  pdf.setTextColor(80, 80, 80);
  pdf.setFont(undefined, 'normal');
  pdf.text("Iconic Yatra is a premier online tour operator platform specializing in both Domestic and", 15, y, { maxWidth: 180 });
  y += 5;
  pdf.text("International tour packages. We offer comprehensive travel services tailored to meet your needs.", 15, y, { maxWidth: 180 });
  y += 10;

  // ---------- Travel Details Card ----------
  pdf.setFillColor(248, 248, 248);
  pdf.roundedRect(15, y, 180, 40, 3, 3, 'F');
  pdf.setDrawColor(220, 220, 220);
  pdf.roundedRect(15, y, 180, 40, 3, 3);
  
  pdf.setFontSize(11);
  pdf.setTextColor(...primaryColor);
  pdf.setFont(undefined, 'bold');
  pdf.text("TRAVEL ITINERARY", 20, y + 8);
  
  pdf.setFontSize(10);
  pdf.setTextColor(...darkColor);
  
  // Arrival
  pdf.text("Arrival", 20, y + 18);
  pdf.setTextColor(80, 80, 80);
  const arrivalText = `${pickupDropDetails.pickupLocation || "N/A"} | ${pickupDropDetails.pickupDate ? new Date(pickupDropDetails.pickupDate).toLocaleDateString() : "N/A"}`;
  pdf.text(arrivalText, 20, y + 24, { maxWidth: 70 });
  
  // Departure
  pdf.setTextColor(...darkColor);
  pdf.text("Departure", 110, y + 18);
  pdf.setTextColor(80, 80, 80);
  const departureText = `${pickupDropDetails.dropLocation || "N/A"} | ${pickupDropDetails.dropDate ? new Date(pickupDropDetails.dropDate).toLocaleDateString() : "N/A"}`;
  pdf.text(departureText, 110, y + 24, { maxWidth: 70 });
  
  // Guests
  pdf.setTextColor(...darkColor);
  pdf.text("Guests", 20, y + 34);
  pdf.setTextColor(80, 80, 80);
  pdf.text(`${members.adults || 0} Adults`, 20, y + 40);
  
  y += 50;

  // ---------- Vehicle & Pricing ----------
  pdf.setFontSize(12);
  pdf.setTextColor(...primaryColor);
  pdf.setFont(undefined, 'bold');
  pdf.text("Vehicle & Pricing Details", 15, y);
  y += 8;

  // Table with improved styling
  autoTable(pdf, {
    startY: y,
    head: [
      [
        {content: "Vehicle", styles: {fillColor: primaryColor, textColor: 255, fontStyle: 'bold', halign: 'center'}},
        {content: "Pickup Date", styles: {fillColor: primaryColor, textColor: 255, fontStyle: 'bold', halign: 'center'}},
        {content: "Drop Date", styles: {fillColor: primaryColor, textColor: 255, fontStyle: 'bold', halign: 'center'}},
        {content: "Cost (₹)", styles: {fillColor: primaryColor, textColor: 255, fontStyle: 'bold', halign: 'center'}}
      ]
    ],
    body: [
      [
        {content: basicsDetails.vehicleType || "N/A", styles: {halign: 'center'}},
        {content: pickupDropDetails.pickupDate ? new Date(pickupDropDetails.pickupDate).toLocaleDateString() : "N/A", styles: {halign: 'center'}},
        {content: pickupDropDetails.dropDate ? new Date(pickupDropDetails.dropDate).toLocaleDateString() : "N/A", styles: {halign: 'center'}},
        {content: (costDetails.totalCost || "0").toLocaleString('en-IN'), styles: {fontStyle: 'bold', halign: 'center'}}
      ]
    ],
    theme: 'grid',
    styles: {fontSize: 10, cellPadding: 4, lineColor: [200, 200, 200]},
    headStyles: {halign: 'center'},
    margin: {left: 15, right: 15}
  });
  
  // Total row with different styling - FIXED to be in the same table
  autoTable(pdf, {
    startY: pdf.lastAutoTable.finalY,
    body: [
      [
        {content: "Total Package Cost", colSpan: 3, styles: {fillColor: [240, 240, 240], fontStyle: 'bold', halign: 'right', cellPadding: 5}},
        {content: `₹ ${(costDetails.totalCost || "0").toLocaleString('en-IN')}`, styles: {fillColor: secondaryColor, textColor: 255, fontStyle: 'bold', halign: 'center', cellPadding: 5}}
      ]
    ],
    theme: 'grid',
    styles: {fontSize: 11, lineColor: [200, 200, 200]},
    margin: {left: 15, right: 15}
  });
  
  y = pdf.lastAutoTable.finalY + 15;

  // ---------- Policies Section ----------
  // Create a new page if needed
  if (y > 180) {
    pdf.addPage();
    // Add logo on the new page
    addLogo(15, 15, 40);
    y = 35;
  }
  
  pdf.setFontSize(12);
  pdf.setTextColor(...primaryColor);
  pdf.setFont(undefined, 'bold');
  pdf.text("Package Policies", 15, y);
  y += 8;
  
  // Inclusion Policy
  pdf.setFontSize(11);
  pdf.setTextColor(...primaryColor);
  pdf.setFont(undefined, 'bold');
  pdf.text("Inclusions:", 15, y);
  y += 6;
  
  pdf.setFontSize(10);
  pdf.setTextColor(80, 80, 80);
  pdf.setFont(undefined, 'normal');
  const inclusions = defaultPolicies.inclusions;
  if (Array.isArray(inclusions)) {
    inclusions.forEach((item, index) => {
      pdf.text(`• ${item}`, 18, y);
      y += 5;
    });
  }
  
  // Special note
  y += 3;
  pdf.setTextColor(90, 90, 90);
  pdf.text("* Due to low temperature, AC will be off during hill station tours.", 18, y);
  y += 8;

  // Exclusion Policy
  pdf.setFontSize(11);
  pdf.setTextColor(...primaryColor);
  pdf.setFont(undefined, 'bold');
  pdf.text("Exclusions:", 15, y);
  y += 6;
  
  pdf.setFontSize(10);
  pdf.setTextColor(80, 80, 80);
  pdf.setFont(undefined, 'normal');
  const exclusions = defaultPolicies.exclusions.split('\n');
  exclusions.forEach((item) => {
    pdf.text(`• ${item}`, 18, y);
    y += 5;
  });
  y += 8;

  // Payment Policy
  pdf.setFontSize(11);
  pdf.setTextColor(...primaryColor);
  pdf.setFont(undefined, 'bold');
  pdf.text("Payment Terms:", 15, y);
  y += 6;
  
  pdf.setFontSize(10);
  pdf.setTextColor(80, 80, 80);
  pdf.setFont(undefined, 'normal');
  pdf.text("• 50% advance at confirmation", 18, y);
  y += 5;
  pdf.text("• 50% balance 10 days before tour start", 18, y);
  y += 8;

  // Cancellation Policy
  pdf.setFontSize(11);
  pdf.setTextColor(...primaryColor);
  pdf.setFont(undefined, 'bold');
  pdf.text("Cancellation Policy:", 15, y);
  y += 6;
  
  pdf.setFontSize(10);
  pdf.setTextColor(80, 80, 80);
  pdf.setFont(undefined, 'normal');
  pdf.text("• Before 15 days: 50% retention", 18, y);
  y += 5;
  pdf.text("• Within 7 days: 100% charges applicable", 18, y);
  y += 15;

  // ---------- Terms & Conditions ----------
  if (y > 170) {
    pdf.addPage();
    // Add logo on the new page
    addLogo(15, 15, 40);
    y = 35;
  }
  
  pdf.setFontSize(12);
  pdf.setTextColor(...primaryColor);
  pdf.setFont(undefined, 'bold');
  pdf.text("Terms & Conditions", 15, y);
  y += 8;
  
  pdf.setFontSize(9);
  pdf.setTextColor(70, 70, 70);
  
  const terms = [
    "1. This quotation is subject to vehicle availability at the time of confirmation.",
    "2. Any route deviations or extra kilometers will incur additional charges payable directly to the driver.",
    "3. Additional sightseeing locations require separate payment to local operators.",
    "4. During peak seasons, traffic delays may occur. During winter, road conditions may be affected by snow.",
    "5. We recommend keeping buffer time for connections to avoid missing flights/trains.",
    "6. Company is not liable for missed connections due to unforeseen circumstances.",
    "7. Please inform in advance if you require GST invoice."
  ];
  
  terms.forEach((term, index) => {
    pdf.text(term, 18, y, { maxWidth: 175 });
    y += 6;
  });

  // ---------- Footer ----------
  const pageHeight = pdf.internal.pageSize.height;
  
  // Add logo above footer if there's space
  if (y < pageHeight - 50) {
    addLogo(15, y + 10, 30);
    y += 20;
  }
  
  y = pageHeight - 40;
  
  pdf.setDrawColor(...primaryColor);
  pdf.setLineWidth(0.5);
  pdf.line(15, y, 195, y);
  y += 5;
  
  pdf.setFontSize(10);
  pdf.setTextColor(...primaryColor);
  pdf.setFont(undefined, 'bold');
  pdf.text("Thanks & Regards,", 15, y);
  y += 5;
  
  pdf.setTextColor(...darkColor);
  pdf.setFont(undefined, 'normal');
  pdf.text("Amit Jaiswal | +91 7053900957", 15, y);
  y += 5;
  
  pdf.setFontSize(11);
  pdf.setTextColor(...primaryColor);
  pdf.setFont(undefined, 'bold');
  pdf.text("ICONIC YATRA", 15, y);
  y += 5;
  
  pdf.setFontSize(9);
  pdf.setTextColor(100, 100, 100);
  pdf.text("Office No 15, Bhawani Market Sec 27, Noida, Uttar Pradesh – 201301", 15, y);
  y += 4;
  
  pdf.setTextColor(...primaryColor);
  pdf.text("https://www.iconicyatra.com | GST: 09EYCPK8832CIZC", 15, y);

  // Add page numbers
  const pageCount = pdf.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    pdf.setPage(i);
    pdf.setFontSize(8);
    pdf.setTextColor(150, 150, 150);
    pdf.text(`Page ${i} of ${pageCount}`, 105, pageHeight - 10, { align: 'center' });
  }

  pdf.save(`IconicYatra_Quotation_${vehicle.vehicleQuotationId || "0000"}.pdf`);
};


  return (
    <Box ref={pdfRef} sx={{ backgroundColor: 'white', minHeight: '100vh' }} >
      <Box
        display="flex"
        justifyContent="flex-end"
        gap={1}
        mb={2}
        flexWrap="wrap"
      >
        {actions.map((a, i) => {
          if (a === "Finalize" && isFinalized) return null;
          return (
            <Button
              key={i}
              variant="contained"
              onClick={() => handleActionClick(a)}
            >
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
        <Grid item xs={12} md={3}>
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
                  <LocationOn
                    sx={{ fontSize: 18, mr: 0.5, color: "text.secondary" }}
                  />
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
                      {a.title === "Vehicle Details" ? (
                        <Box>
                          <Typography variant="h5" color="primary" gutterBottom>
                            {Number(costDetails.totalCost || 0).toLocaleString("en-IN", {
                              style: "currency",
                              currency: "INR",
                              maximumFractionDigits: 0,
                            })}
                          </Typography>

                          <Typography variant="body1">
                            Pickup :{" "}
                            {pickupDropDetails.pickupDate
                              ? new Date(pickupDropDetails.pickupDate).toLocaleDateString(
                                  "en-GB",
                                  { day: "2-digit", month: "2-digit", year: "numeric" }
                                )
                              : "N/A"}
                          </Typography>

                          <Typography variant="body1">
                            Drop :{" "}
                            {pickupDropDetails.dropDate
                              ? new Date(pickupDropDetails.dropDate).toLocaleDateString(
                                  "en-GB",
                                  { day: "2-digit", month: "2-digit", year: "numeric" }
                                )
                              : "N/A"}
                          </Typography>
                        </Box>
                      ) : a.title === "Company Margin" ? (
                        <Typography variant="body2">
                          Company Margin details go here...
                        </Typography>
                      ) : (
                        <Typography variant="body2">Details go here.</Typography>
                      )}
                    </AccordionDetails>
                  </Accordion>
                ))}
              </CardContent>
            </Card>
          </Box>
        </Grid>

        <Grid item xs={12} md={9}>
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
                    Date: {new Date().toLocaleDateString()}
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
                  Ref: {vehicle.vehicleQuotationId || "N/A"}
                </Typography>
              </Box>
              <Box display="flex" alignItems="center" mt={2}>
                <Person sx={{ fontSize: 18, mr: 0.5 }} />
                <Typography variant="subtitle1" fontWeight="bold">
                  Kind Attention: {basicsDetails.clientName || "N/A"}
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
                    Vehicle Quotation For {basicsDetails.clientName || "N/A"}
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
                  <Typography variant="body2">
                    This is only tentative schedule for sightseeing and travel. The actual sequence might change depending on the local conditions.
                  </Typography>
                  <IconButton
                    size="small"
                    onClick={() =>
                      handleEditOpen(
                        "itineraryNote",
                        "This is only tentative schedule for sightseeing and travel. The actual sequence might change depending on the local conditions.",
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
                      <TableRow>
                        <TableCell>
                          <DirectionsCar
                            sx={{ mr: 1, color: "primary.main" }}
                          />
                          {basicsDetails.vehicleType || "N/A"}
                        </TableCell>
                        <TableCell>
                          <CalendarToday sx={{ fontSize: 16, mr: 0.5 }} />
                          {pickupDropDetails.pickupDate ? new Date(pickupDropDetails.pickupDate).toLocaleDateString() : "N/A"}
                          <br />
                          <AccessTime sx={{ fontSize: 16, mr: 0.5 }} />
                          {pickupDropDetails.pickupTime ? new Date(pickupDropDetails.pickupTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : "N/A"}
                        </TableCell>
                        <TableCell>
                          <CalendarToday sx={{ fontSize: 16, mr: 0.5 }} />
                          {pickupDropDetails.dropDate ? new Date(pickupDropDetails.dropDate).toLocaleDateString() : "N/A"}
                          <br />
                          <AccessTime sx={{ fontSize: 16, mr: 0.5 }} />
                          {pickupDropDetails.dropTime ? new Date(pickupDropDetails.dropTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : "N/A"}
                        </TableCell>
                        <TableCell>₹{costDetails.totalCost || "N/A"}</TableCell>
                      </TableRow>
                      <TableRow sx={{ backgroundColor: "grey.50" }}>
                        <TableCell>Discount</TableCell>
                        <TableCell colSpan={2} />
                        <TableCell>-₹{vehicle.discount || "0"}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>GST ({vehicle.tax?.applyGst || "0%"})</TableCell>
                        <TableCell colSpan={2} />
                        <TableCell>
                          ₹{vehicle.tax?.applyGst ? (parseInt(costDetails.totalCost || 0) * parseInt(vehicle.tax.applyGst) / 100) : "0"}
                        </TableCell>
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
                          ₹{costDetails.totalCost || "N/A"}
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>

              <Grid container spacing={2} mt={1}>
                {Policies.map((p, i) => (
                  <Grid item xs={12} key={i}>
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
                        {p.isArray ? (
                          <List dense>
                            {p.content.map((item, index) => (
                              <ListItem key={index}>
                                <ListItemText primary={item} />
                              </ListItem>
                            ))}
                          </List>
                        ) : (
                          <Typography variant="body2" whiteSpace="pre-line">
                            {p.content}
                          </Typography>
                        )}
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
                          handleEditOpen("terms", terms, "Terms & Conditions")
                        }
                      >
                        <Edit fontSize="small" />
                      </IconButton>
                    </Box>
                    <Typography variant="body2" whiteSpace="pre-line">
                      {terms}
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
                    {footer.contact}
                  </Typography>
                  <IconButton
                    size="small"
                    sx={{ color: "white" }}
                    onClick={() =>
                      handleEditOpen(
                        "footer",
                        footer.contact,
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
                  {footer.company}
                </Typography>
                <Box display="flex" alignItems="center" mt={0.5}>
                  <Business sx={{ mr: 0.5, fontSize: 18 }} />
                  {footer.address}
                </Box>
                <Box display="flex" alignItems="center" mt={0.5}>
                  <Language sx={{ mr: 0.5, fontSize: 18 }} />
                  <a
                    href={footer.website}
                    target="_blank"
                    rel="noreferrer"
                    style={{ color: "white", textDecoration: "underline" }}
                  >
                    {footer.website}
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
        customer={{ name: basicsDetails.clientName || "N/A" }}
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