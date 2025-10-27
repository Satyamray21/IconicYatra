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
    invoiceData?.items?.reduce(
      (t, i) => t + ((i.price || 0) - (i.discount || 0)),
      0
    ) || 0;

  const amountToWords = (amount) => {
    if (!amount) return "Zero Only INR";
    const ones = [
      "",
      "One",
      "Two",
      "Three",
      "Four",
      "Five",
      "Six",
      "Seven",
      "Eight",
      "Nine",
    ];
    const teens = [
      "Ten",
      "Eleven",
      "Twelve",
      "Thirteen",
      "Fourteen",
      "Fifteen",
      "Sixteen",
      "Seventeen",
      "Eighteen",
      "Nineteen",
    ];
    const tens = [
      "",
      "",
      "Twenty",
      "Thirty",
      "Forty",
      "Fifty",
      "Sixty",
      "Seventy",
      "Eighty",
      "Ninety",
    ];

    function convert(num) {
      if (num === 0) return "";
      if (num < 10) return ones[num];
      if (num < 20) return teens[num - 10];
      if (num < 100)
        return (
          tens[Math.floor(num / 10)] +
          (num % 10 ? " " + ones[num % 10] : "")
        );
      return (
        ones[Math.floor(num / 100)] +
        " Hundred" +
        (num % 100 ? " " + convert(num % 100) : "")
      );
    }

    let res = "",
      n = Math.floor(amount);
    if (n >= 10000000) {
      res += convert(Math.floor(n / 10000000)) + " Crore ";
      n %= 10000000;
    }
    if (n >= 100000) {
      res += convert(Math.floor(n / 100000)) + " Lakh ";
      n %= 100000;
    }
    if (n >= 1000) {
      res += convert(Math.floor(n / 1000)) + " Thousand ";
      n %= 1000;
    }
    if (n > 0) res += convert(n);
    return res.trim() + " Only INR";
  };

  const handleDownloadPDF = async () => {
    if (!componentRef.current) return;
    setIsGenerating(true);
    try {
      const canvas = await html2canvas(componentRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
      });
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const ratio = pdfWidth / canvas.width;
      const imgHeight = canvas.height * ratio;
      pdf.addImage(
        canvas.toDataURL("image/png"),
        "PNG",
        0,
        0,
        pdfWidth,
        imgHeight
      );
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
    <Box sx={{ bgcolor: "#f5f7fa", p: 2 }}>
      <Box sx={{ mb: 1, textAlign: "right" }}>
        <Button
          variant="contained"
          color="primary"
          startIcon={
            isGenerating ? (
              <CircularProgress size={20} color="inherit" />
            ) : (
              <PictureAsPdfIcon />
            )
          }
          onClick={handleDownloadPDF}
          disabled={isGenerating}
          sx={{
            textTransform: "none",
            fontWeight: 600,
            boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
          }}
        >
          {isGenerating ? "Generating..." : "Download PDF"}
        </Button>
      </Box>

      <Box
        ref={componentRef}
        sx={{
          backgroundColor: "#fff",
          p: 2,
          width: "210mm",
          mx: "auto",
          border: "1.5px solid #1565c0",
          borderRadius: "6px",
          fontFamily: "Segoe UI, Arial, sans-serif",
          fontSize: "11px",
          color: "#212121",
          boxShadow: "0 0 6px rgba(0,0,0,0.15)",
        }}
      >
        {/* Header */}
        <Typography
          align="center"
          sx={{
            fontWeight: "bold",
            color: "#0d47a1",
            fontSize: "16px",
            mb: 1,
            textTransform: "uppercase",
            letterSpacing: 0.5,
          }}
        >
          Tax Invoice
        </Typography>

        {/* Company Info */}
        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
          <img
            src="https://iconicyatra.com/assets/logoiconic-CDBgNKCW.jpg"
            alt="Logo"
            style={{ width: 85, objectFit: "contain" }}
          />
          <Box sx={{ textAlign: "right" }}>
            <Typography sx={{ fontWeight: "bold", fontSize: "13px" }}>
              Iconic Yatra
            </Typography>
            <Typography sx={{ fontSize: "10px" }}>
              Noida - 201301, Uttar Pradesh
            </Typography>
            <Typography sx={{ fontSize: "10px" }}>
              Phone: +91 7053900957
            </Typography>
            <Typography sx={{ fontSize: "10px" }}>
              Email: info@iconicyatra.com
            </Typography>
            <Typography sx={{ fontSize: "10px" }}>
              State Code: 09 (Uttar Pradesh)
            </Typography>
          </Box>
        </Box>

        <Divider sx={{ mb: 1, borderColor: "#1565c0" }} />

        {/* Billing & Invoice Info */}
        <Box sx={{ display: "flex", gap: 1, mb: 1 }}>
          {/* Billing */}
          <Box sx={{ flex: 1 }}>
            <Typography
              sx={{
                bgcolor: "#1565c0",
                color: "#fff",
                p: 0.5,
                fontWeight: "bold",
                fontSize: "10px",
              }}
            >
              Billing To
            </Typography>
            <Box
              sx={{
                border: "1px solid #1565c0",
                p: 0.5,
                borderRadius: "3px",
                minHeight: 65,
              }}
            >
              <b>{partyName}</b>
              <br />
              {billingName}
              <br />
              {billingAddress}
              <br />
              GSTIN: {gstin}
              <br />
              State: {stateOfSupply}
            </Box>
          </Box>

          {/* Invoice Info */}
          <Box sx={{ flex: 1 }}>
            <Typography
              sx={{
                bgcolor: "#1565c0",
                color: "#fff",
                p: 0.5,
                fontWeight: "bold",
                fontSize: "10px",
              }}
            >
              Invoice Details
            </Typography>
            <Box
              sx={{
                border: "1px solid #1565c0",
                p: 0.5,
                borderRadius: "3px",
                minHeight: 65,
              }}
            >
              <div>
                <b>Invoice No:</b> {invoiceNo}
              </div>
              <div>
                <b>Date:</b> {formatDate(invoiceDate)}
              </div>
              <div>
                <b>Due:</b> {formatDate(dueDate)}
              </div>
              <div>
                <b>Payment:</b> {paymentMode}
              </div>
              {referenceNo !== "N/A" && <div><b>Ref:</b> {referenceNo}</div>}
            </Box>
          </Box>
        </Box>

        {/* Items Table */}
        <TableContainer component={Paper} sx={{ mb: 1 }}>
          <Table size="small">
            <TableBody>
              <TableRow sx={{ bgcolor: "#1565c0" }}>
                {[
                  "#",
                  "Particulars",
                  "HSN/SAC",
                  "Price ₹",
                  "Disc ₹",
                  "GST ₹",
                  "Amount ₹",
                ].map((h, i) => (
                  <TableCell
                    key={i}
                    sx={{
                      color: "#fff",
                      fontWeight: "bold",
                      fontSize: "10px",
                      py: 0.5,
                    }}
                  >
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
                <TableCell colSpan={6} align="right" sx={{ fontWeight: "bold" }}>
                  Total
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: "bold" }}>
                  ₹{totalAmount}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>

        {/* Summary */}
        <Box sx={{ display: "flex", gap: 1, mb: 1 }}>
          {/* GST Details */}
          <Box sx={{ flex: 1 }}>
            <Typography
              sx={{
                bgcolor: "#1565c0",
                color: "#fff",
                p: 0.5,
                fontWeight: "bold",
                fontSize: "10px",
              }}
            >
              GST Details
            </Typography>
            <TableContainer component={Paper}>
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
                      <TableCell>
                        {invoiceData?.isInternational ? "IGST" : "CGST/SGST"}
                      </TableCell>
                      <TableCell>
                        ₹{(item.price || 0) - (item.discount || 0)}
                      </TableCell>
                      <TableCell>{item.taxPercent || 0}%</TableCell>
                      <TableCell>₹{item.taxAmount || 0}</TableCell>
                    </TableRow>
                  ))}
                  <TableRow sx={{ bgcolor: "#f5f5f5" }}>
                    <TableCell colSpan={3} sx={{ fontWeight: "bold" }}>
                      Total Tax
                    </TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>
                      ₹{totalTax}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </Box>

          {/* Amount Summary */}
          <Box sx={{ flex: 1 }}>
            <Typography
              sx={{
                bgcolor: "#1565c0",
                color: "#fff",
                p: 0.5,
                fontWeight: "bold",
                fontSize: "10px",
              }}
            >
              Amount Summary
            </Typography>
            <TableContainer component={Paper}>
              <Table size="small">
                <TableBody>
                  <TableRow>
                    <TableCell>Sub Total</TableCell>
                    <TableCell align="right">₹{subtotal}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Total Tax</TableCell>
                    <TableCell align="right">₹{totalTax}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Total</TableCell>
                    <TableCell align="right">₹{totalAmount}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Received</TableCell>
                    <TableCell align="right">₹{receivedAmount}</TableCell>
                  </TableRow>
                  <TableRow sx={{ bgcolor: "#e3f2fd" }}>
                    <TableCell sx={{ fontWeight: "bold" }}>
                      Balance Due
                    </TableCell>
                    <TableCell align="right" sx={{ fontWeight: "bold" }}>
                      ₹{balanceAmount}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        </Box>

        {/* Footer */}
        <Box sx={{ display: "flex", gap: 1 }}>
          <Box sx={{ flex: 1 }}>
            <Typography
              sx={{
                bgcolor: "#1565c0",
                color: "#fff",
                p: 0.5,
                fontWeight: "bold",
                fontSize: "10px",
              }}
            >
              Amount in Words
            </Typography>
            <Box sx={{ border: "1px solid #1565c0", p: 0.5 }}>
              {amountToWords(totalAmount)}
            </Box>
          </Box>

          <Box sx={{ flex: 1 }}>
            <Typography
              sx={{
                bgcolor: "#1565c0",
                color: "#fff",
                p: 0.5,
                fontWeight: "bold",
                fontSize: "10px",
              }}
            >
              Payment Details
            </Typography>
            <Box sx={{ border: "1px solid #1565c0", p: 0.5 }}>
              Mode: {paymentMode}
              <br />
              {referenceNo !== "N/A" && `Ref: ${referenceNo}`}
            </Box>
          </Box>
        </Box>

        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            mt: 1,
            alignItems: "flex-end",
          }}
        >
          <Box sx={{ flex: 1 }}>
            <Typography
              sx={{
                bgcolor: "#1565c0",
                color: "#fff",
                p: 0.5,
                fontWeight: "bold",
                fontSize: "10px",
              }}
            >
              Terms & Conditions
            </Typography>
            <Box sx={{ border: "1px solid #1565c0", p: 0.5 }}>
              This is a system-generated invoice. Thank you for your business!
            </Box>
          </Box>

          <Box sx={{ textAlign: "center", minWidth: 120 }}>
            <Typography sx={{ fontWeight: "bold", fontSize: "10px" }}>
              For, Iconic Yatra
            </Typography>
            <Box sx={{ mt: 1 }}>
              <Typography sx={{ fontSize: "10px" }}>
                Authorized Signatory
              </Typography>
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default InvoicePDF;
