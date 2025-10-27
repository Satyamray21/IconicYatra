import React, { useRef, useState } from "react";
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Paper,
  Button,
  CircularProgress,
  Divider,
} from "@mui/material";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

const InvoicePDF = ({ invoiceData }) => {
  const componentRef = useRef();
  const [isGenerating, setIsGenerating] = useState(false);

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB");
  };

  const calculateTotalTax = () =>
    invoiceData?.items?.reduce((t, i) => t + (i.taxAmount || 0), 0) || 0;

  const calculateSubtotal = () =>
    invoiceData?.items?.reduce((t, i) => t + ((i.price || 0) - (i.discount || 0)), 0) || 0;

  const amountToWords = (amount) => {
    if (!amount) return "Zero Only INR";
    const ones = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine"];
    const teens = ["Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];
    const tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];
    function convert(num) {
      if (num === 0) return "";
      if (num < 10) return ones[num];
      if (num < 20) return teens[num - 10];
      if (num < 100) return tens[Math.floor(num / 10)] + (num % 10 ? " " + ones[num % 10] : "");
      return ones[Math.floor(num / 100)] + " Hundred" + (num % 100 ? " " + convert(num % 100) : "");
    }
    let res = "", n = Math.floor(amount);
    if (n >= 10000000) { res += convert(Math.floor(n / 10000000)) + " Crore "; n %= 10000000; }
    if (n >= 100000) { res += convert(Math.floor(n / 100000)) + " Lakh "; n %= 100000; }
    if (n >= 1000) { res += convert(Math.floor(n / 1000)) + " Thousand "; n %= 1000; }
    if (n > 0) res += convert(n);
    return res.trim() + " Only INR";
  };

  const handleDownloadPDF = async () => {
    if (!componentRef.current) return;
    setIsGenerating(true);
    try {
      const canvas = await html2canvas(componentRef.current, {
        scale: 1.5,
        useCORS: true,
        backgroundColor: "#fff",
      });
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const ratio = pdfWidth / canvas.width;
      const imgHeight = canvas.height * ratio;
      pdf.addImage(canvas.toDataURL("image/png"), "PNG", 0, 0, pdfWidth, imgHeight);
      pdf.save(`Invoice-${invoiceData?.invoiceNo || "INV"}.pdf`);
    } catch (e) {
      console.error(e);
      alert("Error generating PDF");
    } finally {
      setIsGenerating(false);
    }
  };

  const {
    billingName = "N/A",
    partyName = "N/A",
    gstin = "N/A",
    billingAddress = "N/A",
    stateOfSupply = "N/A",
    invoiceNo = "N/A",
    invoiceDate,
    dueDate,
    items = [],
    totalAmount = 0,
    receivedAmount = 0,
    balanceAmount = 0,
    paymentMode = "N/A",
    referenceNo = "N/A",
  } = invoiceData || {};

  const subtotal = calculateSubtotal();
  const totalTax = calculateTotalTax();

  return (
    <Box>
      <Box sx={{ mb: 1, textAlign: "right" }}>
        <Button
          variant="contained"
          color="primary"
          startIcon={isGenerating ? <CircularProgress size={20} color="inherit" /> : <PictureAsPdfIcon />}
          onClick={handleDownloadPDF}
          disabled={isGenerating}
          sx={{ textTransform: "none" }}
        >
          {isGenerating ? "Generating..." : "Download PDF"}
        </Button>
      </Box>

      <Box
        ref={componentRef}
        sx={{
          backgroundColor: "#fff",
          p: 1.2,
          width: "210mm",
          mx: "auto",
          border: "1px solid #2196f3",
          borderRadius: "4px",
          fontFamily: "Arial, sans-serif",
          fontSize: "11px",
          lineHeight: 1.1,
          boxSizing: "border-box",
        }}
      >
        {/* Header */}
        <Typography align="center" sx={{ fontWeight: "bold", color: "#1976d2", fontSize: "15px", mb: 0.5 }}>
          Tax Invoice
        </Typography>

        {/* Company Info */}
        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
          <img
            src="https://iconicyatra.com/assets/logoiconic-CDBgNKCW.jpg"
            alt="Logo"
            style={{ width: 70 }}
          />
          <Box sx={{ textAlign: "right" }}>
            <Typography sx={{ fontWeight: "bold", fontSize: "13px" }}>Iconic Yatra</Typography>
            <Typography sx={{ fontSize: "10px" }}>Noida - 201301, Uttar Pradesh</Typography>
            <Typography sx={{ fontSize: "10px" }}>Phone: +91 7053900957</Typography>
            <Typography sx={{ fontSize: "10px" }}>Email: info@iconicyatra.com</Typography>
            <Typography sx={{ fontSize: "10px" }}>State: 9 - Uttar Pradesh</Typography>
          </Box>
        </Box>

        <Divider sx={{ mb: 0.6, borderColor: "#1976d2" }} />

        {/* Billing & Invoice Info */}
        <Box sx={{ display: "flex", gap: 0.6, mb: 0.8 }}>
          <Box sx={{ flex: 1 }}>
            <Typography sx={{ bgcolor: "#2196f3", color: "#fff", p: 0.3, fontWeight: "bold", fontSize: "10px" }}>
              Billing To
            </Typography>
            <Box sx={{ border: "1px solid #2196f3", p: 0.3 }}>
              <b>{partyName}</b><br />
              {billingName}<br />
              {billingAddress}<br />
              GSTIN: {gstin}<br />
              State: {stateOfSupply}
            </Box>
          </Box>

          <Box sx={{ flex: 1 }}>
            <Typography sx={{ bgcolor: "#2196f3", color: "#fff", p: 0.3, fontWeight: "bold", fontSize: "10px" }}>
              Invoice Details
            </Typography>
            <Box sx={{ border: "1px solid #2196f3", p: 0.3 }}>
              <div><b>Invoice:</b> {invoiceNo}</div>
              <div><b>Date:</b> {formatDate(invoiceDate)}</div>
              <div><b>Due:</b> {formatDate(dueDate)}</div>
              <div><b>Payment:</b> {paymentMode}</div>
              {referenceNo !== "N/A" && <div><b>Ref:</b> {referenceNo}</div>}
            </Box>
          </Box>
        </Box>

        {/* Items Table */}
        <TableContainer component={Paper} sx={{ border: "1px solid #2196f3", mb: 0.6 }}>
          <Table size="small">
            <TableBody>
              <TableRow sx={{ bgcolor: "#2196f3" }}>
                {["#", "Particulars", "HSN/SAC", "Price ₹", "Disc ₹", "GST ₹", "Amount ₹"].map((h, i) => (
                  <TableCell key={i} sx={{ color: "#fff", fontWeight: "bold", fontSize: "9.5px", py: 0.5 }}>
                    {h}
                  </TableCell>
                ))}
              </TableRow>
              {items.map((item, i) => (
                <TableRow key={i}>
                  <TableCell>{i + 1}</TableCell>
                  <TableCell>{item.particulars}</TableCell>
                  <TableCell>-</TableCell>
                  <TableCell align="right">₹{item.price || 0}</TableCell>
                  <TableCell align="right">₹{item.discount || 0}</TableCell>
                  <TableCell align="right">₹{item.taxAmount || 0}</TableCell>
                  <TableCell align="right">₹{item.amount || 0}</TableCell>
                </TableRow>
              ))}
              <TableRow sx={{ bgcolor: "#e3f2fd" }}>
                <TableCell colSpan={6} align="right" sx={{ fontWeight: "bold" }}>Total</TableCell>
                <TableCell align="right" sx={{ fontWeight: "bold" }}>₹{totalAmount}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>

        {/* GST + Amount Summary */}
        <Box sx={{ display: "flex", gap: 0.8, mb: 0.8 }}>
          <Box sx={{ flex: 1 }}>
            <Typography sx={{ bgcolor: "#2196f3", color: "#fff", p: 0.3, fontWeight: "bold", fontSize: "10px" }}>
              GST Details
            </Typography>
            <TableContainer component={Paper} sx={{ border: "1px solid #2196f3" }}>
              <Table size="small">
                <TableBody>
                  <TableRow sx={{ bgcolor: "#e3f2fd" }}>
                    <TableCell sx={{ fontWeight: "bold" }}>Type</TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>Amt ₹</TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>Rate</TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>Tax ₹</TableCell>
                  </TableRow>
                  {items.map((item, i) => (
                    <TableRow key={i}>
                      <TableCell>{invoiceData?.isInternational ? "IGST" : "CGST/SGST"}</TableCell>
                      <TableCell>₹{(item.price || 0) - (item.discount || 0)}</TableCell>
                      <TableCell>{item.taxPercent || 0}%</TableCell>
                      <TableCell>₹{item.taxAmount || 0}</TableCell>
                    </TableRow>
                  ))}
                  <TableRow sx={{ bgcolor: "#f5f5f5" }}>
                    <TableCell colSpan={3} sx={{ fontWeight: "bold" }}>Total Tax</TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>₹{totalTax}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </Box>

          <Box sx={{ flex: 1 }}>
            <Typography sx={{ bgcolor: "#2196f3", color: "#fff", p: 0.3, fontWeight: "bold", fontSize: "10px" }}>
              Amount Summary
            </Typography>
            <TableContainer component={Paper} sx={{ border: "1px solid #2196f3" }}>
              <Table size="small">
                <TableBody>
                  <TableRow><TableCell>Sub Total</TableCell><TableCell align="right">₹{subtotal}</TableCell></TableRow>
                  <TableRow><TableCell>Total Tax</TableCell><TableCell align="right">₹{totalTax}</TableCell></TableRow>
                  <TableRow><TableCell>Total</TableCell><TableCell align="right">₹{totalAmount}</TableCell></TableRow>
                  <TableRow><TableCell>Received</TableCell><TableCell align="right">₹{receivedAmount}</TableCell></TableRow>
                  <TableRow sx={{ bgcolor: "#e3f2fd" }}>
                    <TableCell sx={{ fontWeight: "bold" }}>Balance Due</TableCell>
                    <TableCell align="right" sx={{ fontWeight: "bold" }}>₹{balanceAmount}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        </Box>

        {/* Footer */}
        <Box sx={{ display: "flex", gap: 0.8 }}>
          <Box sx={{ flex: 1 }}>
            <Typography sx={{ bgcolor: "#2196f3", color: "#fff", p: 0.3, fontWeight: "bold", fontSize: "10px" }}>
              Amount in Words
            </Typography>
            <Box sx={{ border: "1px solid #2196f3", p: 0.4 }}>{amountToWords(totalAmount)}</Box>
          </Box>

          <Box sx={{ flex: 1 }}>
            <Typography sx={{ bgcolor: "#2196f3", color: "#fff", p: 0.3, fontWeight: "bold", fontSize: "10px" }}>
              Payment Details
            </Typography>
            <Box sx={{ border: "1px solid #2196f3", p: 0.4 }}>
              Mode: {paymentMode}<br />
              {referenceNo !== "N/A" && `Ref: ${referenceNo}`}
            </Box>
          </Box>
        </Box>

        <Box sx={{ display: "flex", justifyContent: "space-between", mt: 0.8 }}>
          <Box sx={{ flex: 1 }}>
            <Typography sx={{ bgcolor: "#2196f3", color: "#fff", p: 0.3, fontWeight: "bold", fontSize: "10px" }}>
              Terms & Conditions
            </Typography>
            <Box sx={{ border: "1px solid #2196f3", p: 0.4 }}>
              This is invoice payment. Thanks for doing business with us!
            </Box>
          </Box>

          <Box sx={{ textAlign: "center", minWidth: 110 }}>
            <Typography sx={{ fontWeight: "bold", fontSize: "10px" }}>For, Iconic Yatra</Typography>
            <Box sx={{ mt: 1 }}>
              <Typography sx={{ fontSize: "10px" }}>Authorized Signatory</Typography>
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default InvoicePDF;
