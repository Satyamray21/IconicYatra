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

  // Format date from ISO string to DD/MM/YYYY
  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB');
  };

  // Calculate total tax amount
  const calculateTotalTax = () => {
    if (!invoiceData?.items) return 0;
    return invoiceData.items.reduce((total, item) => total + (item.taxAmount || 0), 0);
  };

  // Calculate subtotal (total amount without tax)
  const calculateSubtotal = () => {
    if (!invoiceData?.items) return 0;
    return invoiceData.items.reduce((total, item) => {
      const itemPrice = item.price || 0;
      const itemDiscount = item.discount || 0;
      return total + (itemPrice - itemDiscount);
    }, 0);
  };

  // Proper amount to words conversion
  const amountToWords = (amount) => {
    if (!amount || amount === 0) return "Zero Only INR";
    
    const ones = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine"];
    const teens = ["Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];
    const tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];

    function convertLessThanThousand(num) {
      if (num === 0) return "";
      if (num < 10) return ones[num];
      if (num < 20) return teens[num - 10];
      if (num < 100) return tens[Math.floor(num / 10)] + (num % 10 !== 0 ? " " + ones[num % 10] : "");
      return ones[Math.floor(num / 100)] + " Hundred" + (num % 100 !== 0 ? " " + convertLessThanThousand(num % 100) : "");
    }

    let result = "";
    let num = Math.floor(amount);

    if (num >= 10000000) {
      result += convertLessThanThousand(Math.floor(num / 10000000)) + " Crore ";
      num %= 10000000;
    }

    if (num >= 100000) {
      result += convertLessThanThousand(Math.floor(num / 100000)) + " Lakh ";
      num %= 100000;
    }

    if (num >= 1000) {
      result += convertLessThanThousand(Math.floor(num / 1000)) + " Thousand ";
      num %= 1000;
    }

    if (num > 0) {
      result += convertLessThanThousand(num);
    }

    return result.trim() + " Only INR";
  };

  const handleDownloadPDF = async () => {
    if (!componentRef.current) return;
    setIsGenerating(true);

    try {
      const element = componentRef.current;
      
      const canvas = await html2canvas(element, {
        scale: 1.2, // Balanced scale
        useCORS: true,
        backgroundColor: "#ffffff",
        logging: false,
        width: element.scrollWidth,
        height: element.scrollHeight,
        windowWidth: element.scrollWidth, // Set window width to content width
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      
      // Calculate dimensions to fit width properly
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const ratio = pdfWidth / imgWidth; // Fit to page width
      const scaledHeight = imgHeight * ratio;
      
      // Add image to PDF - fit to width
      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, scaledHeight);
      
      pdf.save(`Invoice-${invoiceData?.invoiceNo || "INV"}.pdf`);
    } catch (err) {
      console.error("Error generating PDF:", err);
      alert("Error generating PDF");
    } finally {
      setIsGenerating(false);
    }
  };

  // Use API data with fallbacks
  const billingName = invoiceData?.billingName || "N/A";
  const partyName = invoiceData?.partyName || "N/A";
  const gstin = invoiceData?.gstin || "N/A";
  const billingAddress = invoiceData?.billingAddress || "N/A";
  const stateOfSupply = invoiceData?.stateOfSupply || "N/A";
  const invoiceNo = invoiceData?.invoiceNo || "N/A";
  const invoiceDate = formatDate(invoiceData?.invoiceDate);
  const dueDate = formatDate(invoiceData?.dueDate);
  const items = invoiceData?.items || [];
  const totalAmount = invoiceData?.totalAmount || 0;
  const receivedAmount = invoiceData?.receivedAmount || 0;
  const balanceAmount = invoiceData?.balanceAmount || 0;
  const paymentMode = invoiceData?.paymentMode || "N/A";
  const referenceNo = invoiceData?.referenceNo || "N/A";
  const subtotal = calculateSubtotal();
  const totalTax = calculateTotalTax();

  return (
    <Box>
      {/* Download PDF Button */}
      <Box sx={{ mb: 2, textAlign: "right" }}>
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
        >
          {isGenerating ? "Generating..." : "Download PDF"}
        </Button>
      </Box>

      {/* Invoice Container - Optimized for A4 width */}
      <Box
        ref={componentRef}
        sx={{
          backgroundColor: "white",
          p: 2,
          width: "210mm", // Exact A4 width in mm
          maxWidth: "100%",
          mx: "auto",
          border: "1px solid #2196f3",
          borderRadius: "4px",
          fontFamily: "Arial, sans-serif",
          fontSize: "12px",
          lineHeight: 1.2,
          boxSizing: 'border-box',
        }}
      >
        {/* Header */}
        <Typography
          variant="h6"
          align="center"
          sx={{ 
            fontWeight: "bold", 
            color: "#1976d2", 
            mb: 1,
            fontSize: "16px"
          }}
        >
          Tax Invoice
        </Typography>

        {/* Company Info - Compact */}
        <Box sx={{ 
          display: "flex", 
          justifyContent: "space-between", 
          mb: 1, 
          alignItems: 'flex-start',
          gap: 1
        }}>
          <Box sx={{ flexShrink: 0 }}>
            <Box
              component="img"
              src="https://iconicyatra.com/assets/logoiconic-CDBgNKCW.jpg"
              alt="Company Logo"
              sx={{ 
                width: 80, 
                height: 'auto',
                maxWidth: '100%'
              }}
            />
          </Box>
          <Box sx={{ flex: 1, textAlign: "right", minWidth: 0 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: "bold", fontSize: '14px' }}>
              Iconic Yatra
            </Typography>
            <Typography variant="body2" sx={{ fontSize: '11px' }}>
              Noida - 201301, Uttar Pradesh
            </Typography>
            <Typography variant="body2" sx={{ fontSize: '11px' }}>
              Phone: +91 7053900957
            </Typography>
            <Typography variant="body2" sx={{ fontSize: '11px' }}>
              Email: info@iconicyatra.com
            </Typography>
            <Typography variant="body2" sx={{ fontSize: '11px' }}>
              State: 9 - Uttar Pradesh
            </Typography>
          </Box>
        </Box>

        <Divider sx={{ my: 1, borderColor: "#1976d2" }} />

        {/* Billing & Invoice Details - Optimized width */}
        <Box sx={{ 
          display: "flex", 
          gap: 1, 
          mb: 1,
          '& > *': { minWidth: 0 } // Prevent overflow
        }}>
          {/* Billing To */}
          <Box sx={{ flex: 1 }}>
            <Typography
              variant="subtitle2"
              sx={{ 
                fontWeight: "bold", 
                bgcolor: "#2196f3", 
                color: "white", 
                p: 0.5, 
                fontSize: '11px' 
              }}
            >
              Billing To
            </Typography>
            <Box sx={{ 
              p: 0.5, 
              border: "1px solid #2196f3", 
              minHeight: "70px",
              fontSize: '11px'
            }}>
              <Typography variant="body2" sx={{ fontSize: '11px', fontWeight: 'bold' }}>
                {partyName}
              </Typography>
              <Typography variant="body2" sx={{ fontSize: '11px' }}>
                {billingName}
              </Typography>
              <Typography variant="body2" sx={{ fontSize: '11px' }}>
                {billingAddress}
              </Typography>
              <Typography variant="body2" sx={{ fontSize: '11px' }}>
                GSTIN: {gstin}
              </Typography>
              <Typography variant="body2" sx={{ fontSize: '11px' }}>
                State: {stateOfSupply}
              </Typography>
            </Box>
          </Box>

          {/* Invoice Details */}
          <Box sx={{ flex: 1 }}>
            <Typography
              variant="subtitle2"
              sx={{ 
                fontWeight: "bold", 
                bgcolor: "#2196f3", 
                color: "white", 
                p: 0.5, 
                fontSize: '11px' 
              }}
            >
              Invoice Details
            </Typography>
            <Box sx={{ 
              p: 0.5, 
              border: "1px solid #2196f3", 
              minHeight: "70px",
              fontSize: '11px'
            }}>
              <Typography variant="body2" sx={{ fontSize: '11px' }}>
                <strong>Place:</strong> {stateOfSupply}
              </Typography>
              <Typography variant="body2" sx={{ fontSize: '11px' }}>
                <strong>Invoice No:</strong> {invoiceNo}
              </Typography>
              <Typography variant="body2" sx={{ fontSize: '11px' }}>
                <strong>Date:</strong> {invoiceDate}
              </Typography>
              <Typography variant="body2" sx={{ fontSize: '11px' }}>
                <strong>Due:</strong> {dueDate}
              </Typography>
              <Typography variant="body2" sx={{ fontSize: '11px' }}>
                <strong>Payment:</strong> {paymentMode}
              </Typography>
              {referenceNo !== "N/A" && (
                <Typography variant="body2" sx={{ fontSize: '11px' }}>
                  <strong>Ref:</strong> {referenceNo}
                </Typography>
              )}
            </Box>
          </Box>
        </Box>

        {/* Item Table - Optimized for width */}
        <Box sx={{ mb: 1 }}>
          <TableContainer component={Paper} sx={{ border: "1px solid #2196f3" }}>
            <Table size="small" sx={{ 
              '& .MuiTableCell-root': { 
                padding: '3px 4px', 
                fontSize: '10px',
                lineHeight: 1.1
              },
              '& .MuiTableCell-body': {
                fontSize: '10px'
              }
            }}>
              <TableBody>
                <TableRow sx={{ bgcolor: "#2196f3" }}>
                  <TableCell sx={{ color: "white", fontWeight: "bold", width: "5%" }}>#</TableCell>
                  <TableCell sx={{ color: "white", fontWeight: "bold", width: "30%" }}>Particulars</TableCell>
                  <TableCell sx={{ color: "white", fontWeight: "bold", width: "10%" }}>HSN/SAC</TableCell>
                  <TableCell align="right" sx={{ color: "white", fontWeight: "bold", width: "13%" }}>Price (₹)</TableCell>
                  <TableCell align="right" sx={{ color: "white", fontWeight: "bold", width: "13%" }}>Disc (₹)</TableCell>
                  <TableCell align="right" sx={{ color: "white", fontWeight: "bold", width: "14%" }}>GST (₹)</TableCell>
                  <TableCell align="right" sx={{ color: "white", fontWeight: "bold", width: "15%" }}>Amount (₹)</TableCell>
                </TableRow>

                {items.map((item, index) => (
                  <TableRow key={item._id || index}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell sx={{ fontSize: '10px' }}>{item.particulars || "N/A"}</TableCell>
                    <TableCell>-</TableCell>
                    <TableCell align="right">₹{item.price || 0}</TableCell>
                    <TableCell align="right">₹{item.discount || 0}</TableCell>
                    <TableCell align="right">₹{item.taxAmount || 0}</TableCell>
                    <TableCell align="right">₹{item.amount || 0}</TableCell>
                  </TableRow>
                ))}

                <TableRow sx={{ bgcolor: "#e3f2fd" }}>
                  <TableCell colSpan={6} align="right" sx={{ fontWeight: "bold", fontSize: '11px' }}>
                    Total
                  </TableCell>
                  <TableCell align="right" sx={{ fontWeight: "bold", fontSize: '11px' }}>
                    ₹{totalAmount}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </Box>

        {/* Combined GST and Amount Summary */}
        <Box sx={{ display: "flex", gap: 1, mb: 1 }}>
          {/* GST Details */}
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography
              variant="subtitle2"
              sx={{ 
                fontWeight: "bold", 
                bgcolor: "#2196f3", 
                color: "white", 
                p: 0.5, 
                fontSize: '11px' 
              }}
            >
              GST Details
            </Typography>
            <TableContainer component={Paper} sx={{ border: "1px solid #2196f3" }}>
              <Table size="small" sx={{ 
                '& .MuiTableCell-root': { 
                  padding: '2px 3px', 
                  fontSize: '9px',
                  lineHeight: 1
                } 
              }}>
                <TableBody>
                  <TableRow sx={{ bgcolor: "#e3f2fd" }}>
                    <TableCell sx={{ fontWeight: "bold" }}>Tax Type</TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>Taxable Amt</TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>Rate</TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>Tax Amt</TableCell>
                  </TableRow>
                  {items.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell>{invoiceData?.isInternational ? "IGST" : "CGST/SGST"}</TableCell>
                      <TableCell>₹{(item.price || 0) - (item.discount || 0)}</TableCell>
                      <TableCell>{item.taxPercent || 0}%</TableCell>
                      <TableCell>₹{item.taxAmount || 0}</TableCell>
                    </TableRow>
                  ))}
                  <TableRow sx={{ bgcolor: "#f5f5f5" }}>
                    <TableCell colSpan={3} sx={{ fontWeight: "bold", fontSize: '10px' }}>Total Tax</TableCell>
                    <TableCell sx={{ fontWeight: "bold", fontSize: '10px' }}>₹{totalTax}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </Box>

          {/* Amount Summary */}
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography
              variant="subtitle2"
              sx={{ 
                fontWeight: "bold", 
                bgcolor: "#2196f3", 
                color: "white", 
                p: 0.5, 
                fontSize: '11px' 
              }}
            >
              Amount Summary
            </Typography>
            <TableContainer component={Paper} sx={{ border: "1px solid #2196f3" }}>
              <Table size="small" sx={{ 
                '& .MuiTableCell-root': { 
                  padding: '2px 3px', 
                  fontSize: '10px',
                  lineHeight: 1
                } 
              }}>
                <TableBody>
                  <TableRow>
                    <TableCell sx={{ fontWeight: "bold" }}>Sub Total</TableCell>
                    <TableCell align="right">₹{subtotal}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell sx={{ fontWeight: "bold" }}>Total Tax</TableCell>
                    <TableCell align="right">₹{totalTax}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell sx={{ fontWeight: "bold" }}>Total Amount</TableCell>
                    <TableCell align="right">₹{totalAmount}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell sx={{ fontWeight: "bold" }}>Received</TableCell>
                    <TableCell align="right">₹{receivedAmount}</TableCell>
                  </TableRow>
                  <TableRow sx={{ bgcolor: "#e3f2fd" }}>
                    <TableCell sx={{ fontWeight: "bold" }}>Balance Due</TableCell>
                    <TableCell align="right" sx={{ fontWeight: "bold" }}>
                      ₹{balanceAmount}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        </Box>

        {/* Amount in Words & Payment Details */}
        <Box sx={{ display: "flex", gap: 1, mb: 1 }}>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography
              variant="subtitle2"
              sx={{ 
                fontWeight: "bold", 
                bgcolor: "#2196f3", 
                color: "white", 
                p: 0.5, 
                fontSize: '11px' 
              }}
            >
              Amount in Words
            </Typography>
            <Box sx={{ 
              border: "1px solid #2196f3", 
              p: 0.5, 
              minHeight: "35px",
              fontSize: '10px',
              lineHeight: 1.1
            }}>
              {amountToWords(totalAmount)}
            </Box>
          </Box>

          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography
              variant="subtitle2"
              sx={{ 
                fontWeight: "bold", 
                bgcolor: "#2196f3", 
                color: "white", 
                p: 0.5, 
                fontSize: '11px' 
              }}
            >
              Payment Details
            </Typography>
            <Box sx={{ 
              border: "1px solid #2196f3", 
              p: 0.5, 
              minHeight: "35px",
              fontSize: '11px'
            }}>
              <div>Mode: {paymentMode}</div>
              {referenceNo !== "N/A" && (
                <div>Ref: {referenceNo}</div>
              )}
            </Box>
          </Box>
        </Box>

        {/* Terms and Footer */}
        <Box sx={{ 
          display: "flex", 
          justifyContent: "space-between", 
          alignItems: "flex-start",
          gap: 1
        }}>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography
              variant="subtitle2"
              sx={{ 
                fontWeight: "bold", 
                bgcolor: "#2196f3", 
                color: "white", 
                p: 0.5, 
                fontSize: '11px' 
              }}
            >
              Terms & Conditions
            </Typography>
            <Box sx={{ 
              border: "1px solid #2196f3", 
              p: 0.5, 
              minHeight: "40px",
              fontSize: '11px'
            }}>
              This is invoice payment. Thanks for doing business with us!
            </Box>
          </Box>

          <Box sx={{ 
            flexShrink: 0, 
            textAlign: "center", 
            mt: 2,
            minWidth: 100
          }}>
            <Typography variant="body2" sx={{ fontWeight: "bold", fontSize: '11px' }}>
              For, Iconic Yatra
            </Typography>
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2" sx={{ fontSize: '11px' }}>
                <strong>Authorized Signatory</strong>
              </Typography>
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default InvoicePDF;