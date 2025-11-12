import React, { useEffect, useRef, useState } from "react";
import {
  Box,
  Typography,
  Divider,
  Grid,
  Paper,
  Stack,
  Link,
  Button,
  CircularProgress,
} from "@mui/material";
import { useParams } from "react-router-dom";
import { toWords } from "number-to-words";
import html2pdf from "html2pdf.js";
import DownloadIcon from "@mui/icons-material/Download";
import ShareIcon from "@mui/icons-material/Share";
import PaymentIcon from "@mui/icons-material/Payment";
import axios from "../utils/axios"; // ✅ axios instance

const InvoiceView = () => {
  const { id } = useParams();
  const invoiceRef = useRef();
  const [paymentData, setPaymentData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalPaidTillDate, setTotalPaidTillDate] = useState(0);
  const [remainingAmount, setRemainingAmount] = useState(0);

  // ✅ Fetch Payment Data
  useEffect(() => {
    const fetchPayment = async () => {
      try {
        setLoading(true);
        const { data } = await axios.get(`/payment/${id}`);
        const mainData = data?.data || data;
        setPaymentData(mainData);

        // 🧮 Fetch total paid till date
        if (mainData?.companyId?._id && mainData?.partyName) {
          const { data: allPayments } = await axios.get(
            `/payment?companyId=${mainData.companyId._id}`
          );
          const vouchers = allPayments?.data || [];
          const partyPayments = vouchers.filter(
            (v) => v.partyName === mainData.partyName
          );
          const totalPaid = partyPayments.reduce((sum, v) => sum + (v.amount || 0), 0);
          setTotalPaidTillDate(totalPaid);

          const remaining = Math.max(
            (mainData.totalCost || 0) - totalPaid,
            0
          );
          setRemainingAmount(remaining);
        }
      } catch (err) {
        console.error(err);
        setError("Failed to fetch payment details.");
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchPayment();
  }, [id]);

  if (loading)
    return (
      <Box textAlign="center" mt={10}>
        <CircularProgress />
        <Typography mt={2}>Loading invoice details...</Typography>
      </Box>
    );

  if (error) return <Typography color="error">{error}</Typography>;
  if (!paymentData) return <Typography>No payment data found.</Typography>;

  // ✅ Extract fields safely
  const {
    companyId: company = {},
    paymentType,
    date,
    accountType,
    partyName,
    paymentMode,
    referenceNumber,
    particulars,
    amount,
    totalCost,
    invoiceId,
  } = paymentData;

  const isReceipt = paymentType?.toLowerCase().includes("receive");
  const amountInWords = `${toWords(amount || 0)} only`.replace(/\b\w/g, (c) =>
    c.toUpperCase()
  );
  const formattedDate = new Date(date).toLocaleDateString("en-GB");
  const paymentLink = company.paymentLink || "https://iconicyatra.com/payment";

  // ✅ Download PDF
  const handleDownload = () => {
    const opt = {
      margin: 0.3,
      filename: `${invoiceId || "invoice"}.pdf`,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, logging: false },
      jsPDF: { unit: "in", format: "a4", orientation: "portrait" },
    };
    html2pdf().set(opt).from(invoiceRef.current).save();
  };

  // ✅ Share
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${paymentType} - ${invoiceId}`,
          text: `Please find the ${isReceipt ? "receipt" : "payment"} details. Amount: ₹${amount}`,
          url: window.location.href,
        });
      } catch (error) {
        console.log("Error sharing:", error);
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert("Link copied to clipboard!");
    }
  };

  // ✅ Payment
  const handlePaymentClick = () => {
    window.open(paymentLink, "_blank", "noopener,noreferrer");
  };

  return (
    <Box maxWidth="1000px" mx="auto" my={4}>
      {/* === Top Buttons === */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2} gap={2}>
        <Button
          variant="outlined"
          sx={{
            color: "#1976d2",
            borderColor: "#1976d2",
            px: 2.5,
            py: 1,
            borderRadius: 2,
            fontWeight: "bold",
            "&:hover": { backgroundColor: "#e3f2fd", borderColor: "#1565c0" },
          }}
          startIcon={<ShareIcon />}
          onClick={handleShare}
        >
          Share
        </Button>

        <Button
          variant="contained"
          sx={{
            background: "linear-gradient(to right, #1976d2, #004ba0)",
            color: "#fff",
            px: 3,
            py: 1.2,
            borderRadius: 2,
            fontWeight: "bold",
            "&:hover": {
              background: "linear-gradient(to right, #1565c0, #003c8f)",
            },
          }}
          startIcon={<DownloadIcon />}
          onClick={handleDownload}
        >
          Download PDF
        </Button>
      </Box>

      {/* === Invoice Paper === */}
      <Box
        component={Paper}
        elevation={10}
        ref={invoiceRef}
        sx={{
          p: { xs: 2, md: 3 },
          borderRadius: 4,
          backgroundColor: "#fff",
          position: "relative",
          overflow: "hidden",
          fontFamily: "Poppins, sans-serif",
          boxShadow: "0px 8px 30px rgba(0,0,0,0.08)",
        }}
      >
        {/* Watermark */}
        {company.logo && (
          <Box
            component="img"
            src={company.logo}
            alt="Watermark"
            sx={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              opacity: 0.05,
              height: 200,
              zIndex: 0,
            }}
          />
        )}

        {/* Title */}
        <Typography
          variant="h5"
          align="center"
          fontWeight={700}
          sx={{
            textTransform: "uppercase",
            color: "#0b5394",
            mb: 1,
            letterSpacing: 1,
            borderBottom: "2px solid #1976d2",
            pb: 0.5,
            position: "relative",
            zIndex: 1,
          }}
        >
          {isReceipt ? "Receive Voucher" : "Payment Voucher"}
        </Typography>

        {/* Company Header */}
        <Grid container justifyContent="space-between" alignItems="center" mt={2}>
          <Grid item xs={12} sm={6}>
            {company.logo && <img src={company.logo} alt="Logo" style={{ height: 50 }} />}
          </Grid>
          <Grid item xs={12} sm={6}>
            <Box textAlign={{ xs: "left", sm: "right" }}>
              <Typography variant="h6" fontWeight={700}>
                {company.companyName || "Company Name"}
              </Typography>
              {company.address && (
                <Typography fontSize={12}>{company.address}</Typography>
              )}
              {company.phone && (
                <Typography fontSize={12}>📞 {company.phone}</Typography>
              )}
              {company.email && (
                <Typography fontSize={12}>✉️ {company.email}</Typography>
              )}
              {company.termsConditions && (
                <Link
                  href={company.termsConditions}
                  target="_blank"
                  underline="hover"
                  color="primary"
                  fontSize={12}
                >
                  🌐 View Terms & Conditions
                </Link>
              )}
            </Box>
          </Grid>
        </Grid>

        <Divider sx={{ my: 2 }} />

        {/* Party Info */}
        <Stack spacing={0.3} mb={2}>
          <Typography variant="subtitle1" fontWeight={600} color="#1976d2">
            {isReceipt ? "Received From:" : "Paid To:"}
          </Typography>
          <Typography fontSize={14} fontWeight={500}>
            {partyName}
          </Typography>
          <Typography fontSize={12} color="text.secondary">
            {accountType}
          </Typography>
        </Stack>

        {/* Date + ID */}
        <Grid container justifyContent="space-between" mb={2}>
          <Grid item>
            <Typography fontSize={12}>
              <strong>Date:</strong> {formattedDate}
            </Typography>
          </Grid>
          <Grid item>
            <Typography fontSize={12}>
              <strong>{isReceipt ? "Receipt No:" : "Payment No:"}</strong> {invoiceId || "-"}
            </Typography>
          </Grid>
        </Grid>

        {/* Amount Summary */}
        <Box
          my={2}
          sx={{
            background: "linear-gradient(to right, #e3f2fd, #ffffff)",
            borderRadius: 2,
            border: "1px dashed #2196f3",
            p: 2,
          }}
        >
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Typography fontWeight={600} color="#0d47a1">
                 Package Cost
              </Typography>
              <Typography fontSize={15}>₹ {Number(totalCost || 0).toLocaleString()}</Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography fontWeight={600} color="#0d47a1">
                Total Received Amount 
              </Typography>
              <Typography fontSize={15}>₹ {Number(totalPaidTillDate).toLocaleString()}</Typography>
            </Grid>
            <Grid item xs={12}>
              <Typography fontWeight={600} color="#0d47a1">
                Remaining Amount
              </Typography>
              <Typography fontSize={15} color="#d32f2f">
                ₹ {Number(remainingAmount).toLocaleString()}
              </Typography>
            </Grid>
          </Grid>
        </Box>

        {/* Amount in Words */}
        <Box my={2}>
          <Typography fontWeight={600} color="#1976d2">
            Amount In Words
          </Typography>
          <Typography fontSize={14}>{amountInWords}</Typography>
        </Box>

        {/* Particulars */}
        <Box my={2}>
          <Typography fontWeight={600} color="#1976d2">
            Particulars
          </Typography>
          <Typography fontSize={14}>{particulars}</Typography>
        </Box>

        {/* Payment Mode */}
        <Box mb={2}>
          <Typography fontWeight={600} color="#1976d2">
            Payment Bank
          </Typography>
          <Typography fontSize={14}>{paymentMode}</Typography>
          {referenceNumber && (
            <Typography fontSize={13} color="text.secondary">
              Transaction ID: {referenceNumber}
            </Typography>
          )}
        </Box>

        {/* Online Payment Link */}
        {!isReceipt && (
          <Box
            mb={3}
            sx={{
              p: 2,
              border: "2px dashed #28a745",
              borderRadius: 2,
              backgroundColor: "#f8fff9",
              textAlign: "center",
            }}
          >
            <Typography variant="h6" fontWeight={700} color="#28a745" gutterBottom>
              💳 Online Payment
            </Typography>
            <Button
              variant="contained"
              sx={{
                background: "linear-gradient(to right, #28a745, #20c997)",
                color: "white",
                px: 3,
                py: 1,
                borderRadius: 2,
                fontWeight: "bold",
                mb: 1,
              }}
              startIcon={<PaymentIcon />}
              onClick={handlePaymentClick}
            >
              Pay ₹{Number(amount).toLocaleString()} Now
            </Button>
            <Typography variant="body2" color="text.secondary">
              Secure payment via {company.companyName || "Iconic Yatra"}
            </Typography>
            <Link
              href={paymentLink}
              target="_blank"
              rel="noopener noreferrer"
              sx={{
                mt: 0.5,
                display: "block",
                fontSize: "12px",
                color: "#1976d2",
                wordBreak: "break-all",
              }}
            >
              {paymentLink}
            </Link>
          </Box>
        )}

        <Divider sx={{ my: 1 }} />

        {/* Signature */}
        <Grid container justifyContent="space-between" alignItems="center" mt={2}>
          <Grid item>
            <Typography fontSize={12}>
              For, <strong>{company.companyName || "Company"}</strong>
            </Typography>
          </Grid>
          <Grid item>
            <Box textAlign="right">
              {company.authorizedSignatory?.signatureImage && (
                <img
                  src={company.authorizedSignatory.signatureImage}
                  alt="Signature"
                  style={{ height: "50px", width: "150px" }}
                />
              )}
              <Typography fontWeight={600} fontSize={12}>
                Authorized Signatory
              </Typography>
            </Box>
          </Grid>
        </Grid>

        <Box textAlign="center" mt={2}>
          <Typography variant="caption" color="gray" fontSize={11}>
            Powered by {company.companyName || "Our Company"} Billing System
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default InvoiceView;
