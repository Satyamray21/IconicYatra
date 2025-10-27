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

  const handleDownloadPDF = async () => {
    if (!componentRef.current) return;
    setIsGenerating(true);

    try {
      const element = componentRef.current;
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgHeight = (canvas.height * pdfWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, "PNG", 0, position, pdfWidth, imgHeight);
      heightLeft -= pdfHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, position, pdfWidth, imgHeight);
        heightLeft -= pdfHeight;
      }

      pdf.save(`Invoice-${invoiceData?.invoiceNo || "INV"}.pdf`);
    } catch (err) {
      console.error("Error generating PDF:", err);
      alert("Error generating PDF");
    } finally {
      setIsGenerating(false);
    }
  };

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

      {/* Invoice Container */}
      <Box
        ref={componentRef}
        sx={{
          backgroundColor: "white",
          p: 3,
          maxWidth: 900,
          mx: "auto",
          border: "2px solid #2196f3",
          borderRadius: "4px",
          fontFamily: "Arial, sans-serif",
        }}
      >
        {/* Header */}
        <Typography
          variant="h5"
          align="center"
          sx={{ fontWeight: "bold", color: "#1976d2", mb: 2 }}
        >
          Tax Invoice
        </Typography>

        {/* Company Info */}
        <Box sx={{ display: "flex", justifyContent: "space-between" }}>
          <Box sx={{ flex: 1 }}>
            <Box
              component="img"
              src="https://iconicyatra.com/assets/logoiconic-CDBgNKCW.jpg"
              alt="Company Logo"
              sx={{ maxWidth: 200 }}
            />
          </Box>
          <Box sx={{ flex: 3, textAlign: "right" }}>
            <Typography variant="h6" sx={{ fontWeight: "bold" }}>
              Iconic Yatra
            </Typography>
            <Typography variant="body2">
              Noida - 201301, Uttar Pradesh - India
            </Typography>
            <Typography variant="body2">
              Phone No: +91 7053900957 | Email: info@iconicyatra.com
            </Typography>
            <Typography variant="body2">State: 9 - Uttar Pradesh</Typography>
          </Box>
        </Box>

        <Divider sx={{ my: 2, borderColor: "#1976d2" }} />

        {/* Billing & Invoice Details */}
        <Box sx={{ display: "flex", gap: 2 }}>
          {/* Billing To */}
          <Box sx={{ flex: 1 }}>
            <Typography
              variant="subtitle1"
              sx={{ fontWeight: "bold", bgcolor: "#2196f3", color: "white", p: 1 }}
            >
              Billing To
            </Typography>
            <Box sx={{ p: 1, border: "1px solid #2196f3" }}>
              <Typography variant="body2">
                <strong>{invoiceData?.partyName || "Amit Jainwal"}</strong>
              </Typography>
              <Typography variant="body2">
                Mobile No: {invoiceData?.mobile || "8787874347"}
              </Typography>
              <Typography variant="body2">
                Email: {invoiceData?.email || "abc@gmail.com"}
              </Typography>
              <Typography variant="body2">
                State: {invoiceData?.state || "28 - Andhra Pradesh (Old)"}
              </Typography>
            </Box>
          </Box>

          {/* Invoice Details */}
          <Box sx={{ flex: 1 }}>
            <Typography
              variant="subtitle1"
              sx={{ fontWeight: "bold", bgcolor: "#2196f3", color: "white", p: 1 }}
            >
              Invoice Details
            </Typography>
            <Box sx={{ p: 1, border: "1px solid #2196f3" }}>
              <Typography variant="body2">
                Place of supply: {invoiceData?.stateOfSupply || "Uttar Pradesh"}
              </Typography>
              <Typography variant="body2">
                Invoice No: {invoiceData?.invoiceNo || "INV-001"}
              </Typography>
              <Typography variant="body2">
                Invoice Date: {invoiceData?.invoiceDate || "06/10/2025"}
              </Typography>
              <Typography variant="body2">
                Due Date: {invoiceData?.dueDate || "21/10/2025"}
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Item Table */}
        <Box sx={{ mt: 2 }}>
          <TableContainer component={Paper} sx={{ border: "1px solid #2196f3" }}>
            <Table size="small">
              <TableBody>
                <TableRow sx={{ bgcolor: "#2196f3" }}>
                  <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                    #
                  </TableCell>
                  <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                    Particulars
                  </TableCell>
                  <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                    HSN/SAC
                  </TableCell>
                  <TableCell
                    align="right"
                    sx={{ color: "white", fontWeight: "bold" }}
                  >
                    Price (₹)
                  </TableCell>
                  <TableCell
                    align="right"
                    sx={{ color: "white", fontWeight: "bold" }}
                  >
                    GST (₹)
                  </TableCell>
                  <TableCell
                    align="right"
                    sx={{ color: "white", fontWeight: "bold" }}
                  >
                    Amount (₹)
                  </TableCell>
                </TableRow>

                {invoiceData?.items?.map((item, index) => (
  <TableRow key={item._id || index}>
    <TableCell>{index + 1}</TableCell>
    <TableCell>{item.particulars}</TableCell>
    <TableCell></TableCell>
    <TableCell align="right">{item.price}</TableCell>
    <TableCell align="right">{item.discount}</TableCell>
    <TableCell align="right">
      {item.taxAmount} ({item.taxPercent}%)
    </TableCell>
    <TableCell align="right">{item.amount}</TableCell>
  </TableRow>
))}

                <TableRow sx={{ bgcolor: "#e3f2fd" }}>
                  <TableCell colSpan={5} align="right" sx={{ fontWeight: "bold" }}>
                    Total
                  </TableCell>
                  <TableCell align="right" sx={{ fontWeight: "bold" }}>
                    {invoiceData?.items?.[0]?.prices}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </Box>

        {/* GST Details */}
        <Box sx={{ mt: 3 }}>
          <Typography
            variant="subtitle1"
            sx={{ fontWeight: "bold", bgcolor: "#2196f3", color: "white", p: 1 }}
          >
            GST Details
          </Typography>
          <TableContainer component={Paper} sx={{ border: "1px solid #2196f3" }}>
            <Table size="small">
              <TableBody>
                <TableRow sx={{ bgcolor: "#e3f2fd" }}>
                  <TableCell sx={{ fontWeight: "bold" }}>Tax Type</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>Taxable Amount</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>Rate</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>Tax Amount</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>IGST</TableCell>
                  <TableCell>₹500</TableCell>
                  <TableCell>18%</TableCell>
                  <TableCell>₹90</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </Box>

        {/* Amount Summary */}
        <Box sx={{ mt: 3 }}>
          <TableContainer component={Paper} sx={{ border: "1px solid #2196f3" }}>
            <Table size="small">
              <TableBody>
                <TableRow>
                  <TableCell sx={{ fontWeight: "bold" }}>Sub Total</TableCell>
                  <TableCell align="right">₹590</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={{ fontWeight: "bold" }}>Total</TableCell>
                  <TableCell align="right">₹590</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={{ fontWeight: "bold" }}>Received</TableCell>
                  <TableCell align="right">₹0</TableCell>
                </TableRow>
                <TableRow sx={{ bgcolor: "#e3f2fd" }}>
                  <TableCell sx={{ fontWeight: "bold" }}>Balance</TableCell>
                  <TableCell align="right" sx={{ fontWeight: "bold" }}>
                    ₹590
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </Box>

        {/* Amount in Words & Description */}
        <Box sx={{ display: "flex", gap: 2, mt: 3 }}>
          <Box sx={{ flex: 1 }}>
            <Typography
              variant="subtitle1"
              sx={{ fontWeight: "bold", bgcolor: "#2196f3", color: "white", p: 1 }}
            >
              Invoice Amount in Words
            </Typography>
            <Box sx={{ border: "1px solid #2196f3", p: 1 }}>
              <Typography variant="body2">
                Five Hundred Ninety Only INR
              </Typography>
            </Box>
          </Box>

          <Box sx={{ flex: 1 }}>
            <Typography
              variant="subtitle1"
              sx={{ fontWeight: "bold", bgcolor: "#2196f3", color: "white", p: 1 }}
            >
              Description
            </Typography>
            <Box sx={{ border: "1px solid #2196f3", p: 1 }}>
              <Typography variant="body2">
                Additional service abc
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Terms and Footer */}
        <Box sx={{ mt: 3, display: "flex", justifyContent: "space-between" }}>
          <Box sx={{ flex: 1 }}>
            <Typography
              variant="subtitle1"
              sx={{ fontWeight: "bold", bgcolor: "#2196f3", color: "white", p: 1 }}
            >
              Terms and Conditions
            </Typography>
            <Box sx={{ border: "1px solid #2196f3", p: 1 }}>
              <Typography variant="body2">
                This is invoice payment. Thanks for doing business with us!
              </Typography>
            </Box>
          </Box>

          <Box sx={{ flex: 1, textAlign: "right", mt: 4 }}>
            <Typography variant="body2" sx={{ fontWeight: "bold" }}>
              For, Iconic Yatra
            </Typography>
            <Typography variant="body2" sx={{ mt: 6 }}>
              <strong>Authorized Signatory</strong>
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default InvoicePDF;
