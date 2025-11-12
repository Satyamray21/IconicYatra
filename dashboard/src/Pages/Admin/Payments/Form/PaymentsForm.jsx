import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Grid,
  MenuItem,
  TextField,
  Typography,
  FormControl,
  InputLabel,
  Select,
  Paper,
  Avatar,
  Stack,
  Radio,
  RadioGroup,
  FormControlLabel,
  Link,
} from "@mui/material";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { createVoucher } from "../../../../features/payment/paymentSlice";
import axios from "../../../../utils/axios";
import PartySelector from "./PartySelector";

const paymentModes = ["Cash", "Yes Bank", "Kotak","Indusland"];
const paymentLink = "https://iconicyatra.com/payment";

const PaymentsForm = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [voucherType, setVoucherType] = useState("");
  const [previewImage, setPreviewImage] = useState(null);
  const [uploadFile, setUploadFile] = useState(null);
  const [companies, setCompanies] = useState([]);
  const [totalPaidTillDate, setTotalPaidTillDate] = useState(0);
  const [remainingAmount, setRemainingAmount] = useState(0);
  const [receiptCounter, setReceiptCounter] = useState(
    parseInt(localStorage.getItem("receiptCounter") || "1000", 10)
  );

  // ─────────────────────────────────────────────
  // 🧾 Formik setup
  // ─────────────────────────────────────────────
  const formik = useFormik({
    initialValues: {
      companyId: "",
      date: "",
      accountType: "",
      partyName: "",
      paymentMode: "",
      reference: "",
      particulars: "",
      amount: "",
      totalCost: "",
      paymentLinkUsed: false,
    },
    validationSchema: Yup.object({
      date: Yup.string().required("Date is required"),
      accountType: Yup.string().required("Select account type"),
      partyName: Yup.string().required("Select party name"),
      paymentMode: Yup.string().required("Select payment mode"),
      amount: Yup.number()
        .typeError("Amount must be a number")
        .required("Enter amount"),
      totalCost: Yup.number()
        .typeError("Total cost must be a number")
        .required("Enter total cost"),
    }),
    onSubmit: async (values, { resetForm }) => {
      try {
        let uploadedScreenshot = null;
        if (uploadFile) {
          const formData = new FormData();
          formData.append("file", uploadFile);
          const uploadRes = await axios.post("/upload/payment", formData, {
            headers: { "Content-Type": "multipart/form-data" },
          });
          uploadedScreenshot = uploadRes.data.url;
        }

        const nextInvoice = getNextInvoiceNumber();
        const nextReceipt = getNextReceiptNumber();

        const payload = {
          paymentType:
            voucherType === "receive" ? "Receive Voucher" : "Payment Voucher",
          companyId: values.companyId,
          date: values.date,
          accountType: values.accountType,
          partyName: values.partyName,
          paymentMode: values.paymentMode,
          referenceNumber: values.reference,
          particulars: values.particulars,
          amount: values.amount,
          totalCost: values.totalCost,
          remainingAmount: remainingAmount,
          invoice: nextInvoice,
          receiptNumber: nextReceipt,
          paymentScreenshot: uploadedScreenshot,
          drCr: voucherType === "receive" ? "Cr" : "Dr",
        };

        await dispatch(createVoucher(payload)).unwrap();
        toast.success("Voucher created successfully!");
        resetForm();
        setVoucherType("");
        navigate("/payments");
      } catch (err) {
        console.error(err);
        toast.error("Failed to create voucher!");
      }
    },
  });

  // ─────────────────────────────────────────────
  // 📄 Generate invoice & receipt number
  // ─────────────────────────────────────────────
  const getNextInvoiceNumber = () => {
    const current = parseInt(localStorage.getItem("invoiceCounter") || "0", 10) + 1;
    localStorage.setItem("invoiceCounter", current);
    return `INV-${String(current).padStart(4, "0")}`;
  };

  const getNextReceiptNumber = () => {
    const next = receiptCounter + 1;
    setReceiptCounter(next);
    localStorage.setItem("receiptCounter", next);
    return next;
  };

  // ─────────────────────────────────────────────
  // 🌐 Fetch company list
  // ─────────────────────────────────────────────
  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const { data } = await axios.get("/company");
        setCompanies(data?.data || data);
      } catch (error) {
        console.error("Error fetching companies:", error);
      }
    };
    fetchCompanies();
  }, []);

  // ─────────────────────────────────────────────
  // 💰 Fetch totalPaidTillDate
  // ─────────────────────────────────────────────
  useEffect(() => {
    const fetchTotalPaid = async () => {
      if (formik.values.partyName && formik.values.companyId) {
        try {
          const { data } = await axios.get(
            `/payment?companyId=${formik.values.companyId}`
          );
          const vouchers = data?.data || [];
          const partyVouchers = vouchers.filter(
            (v) => v.partyName === formik.values.partyName
          );
          const total = partyVouchers.reduce((sum, v) => sum + (v.amount || 0), 0);
          setTotalPaidTillDate(total);
        } catch (error) {
          console.error("Error fetching total paid till date:", error);
        }
      }
    };
    fetchTotalPaid();
  }, [formik.values.partyName, formik.values.companyId]);

  // ─────────────────────────────────────────────
  // 💵 Fetch totalCost for selected party & company
  // ─────────────────────────────────────────────
  useEffect(() => {
    const fetchTotalCost = async () => {
      if (formik.values.partyName && formik.values.companyId) {
        try {
          const { data } = await axios.get(
            `/payment?companyId=${formik.values.companyId}`
          );
          const vouchers = data?.data || [];
          const partyVouchers = vouchers.filter(
            (v) => v.partyName === formik.values.partyName
          );

          if (partyVouchers.length > 0) {
            const latest = partyVouchers[0]; // latest voucher
            if (latest.totalCost) {
              formik.setFieldValue("totalCost", latest.totalCost);
            }
          }
        } catch (error) {
          console.error("Error fetching total cost:", error);
        }
      }
    };
    fetchTotalCost();
  }, [formik.values.partyName, formik.values.companyId]);

  // ─────────────────────────────────────────────
  // 🔢 Auto-update remaining amount
  // ─────────────────────────────────────────────
  useEffect(() => {
    const total = parseFloat(formik.values.totalCost || 0);
    const paid = parseFloat(totalPaidTillDate || 0);
    const remaining = Math.max(total - paid, 0);
    setRemainingAmount(remaining);
  }, [formik.values.totalCost, totalPaidTillDate]);

  // ─────────────────────────────────────────────
  // 🧾 Payment link handler
  // ─────────────────────────────────────────────
  const handlePaymentLinkClick = () => {
    formik.setFieldValue("paymentLinkUsed", true);
    window.open(paymentLink, "_blank");
    if (!formik.values.reference) {
      formik.setFieldValue("reference", `Online-Payment-${Date.now()}`);
    }
  };

  // ─────────────────────────────────────────────
  // 🧱 Render
  // ─────────────────────────────────────────────
  return (
    <Paper
      elevation={5}
      sx={{
        p: 4,
        borderRadius: 4,
        maxWidth: 900,
        mx: "auto",
        mt: 5,
        bgcolor: "#f5f7fb",
      }}
    >
      {/* Voucher Type Selection */}
      <Box sx={{ mb: 3, textAlign: "center" }}>
        <Typography variant="h5" fontWeight="bold" color="primary" gutterBottom>
          {voucherType === "receive" ? "Receive Voucher" : "Payment Voucher"}
        </Typography>
        <RadioGroup
          row
          value={voucherType}
          onChange={(e) => setVoucherType(e.target.value)}
        >
          <FormControlLabel
            value="receive"
            control={<Radio color="primary" />}
            label="Receive Voucher"
          />
          <FormControlLabel
            value="payment"
            control={<Radio color="secondary" />}
            label="Payment Voucher"
          />
        </RadioGroup>
      </Box>

      {voucherType && (
        <form onSubmit={formik.handleSubmit} onReset={formik.handleReset}>
          <Grid container spacing={3}>
            {/* Date */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                type="date"
                label="Date"
                name="date"
                InputLabelProps={{ shrink: true }}
                value={formik.values.date}
                onChange={formik.handleChange}
                error={formik.touched.date && Boolean(formik.errors.date)}
                helperText={formik.touched.date && formik.errors.date}
                sx={{ bgcolor: "white" }}
              />
            </Grid>

            {/* Screenshot Upload */}
            <Grid item xs={12} md={6}>
              <Button variant="contained" component="label" fullWidth color="secondary">
                Upload Screenshot (Optional)
                <input
                  type="file"
                  hidden
                  accept="image/*"
                  onChange={(event) => {
                    const file = event.currentTarget.files[0];
                    setUploadFile(file);
                    if (file) {
                      const reader = new FileReader();
                      reader.onloadend = () => setPreviewImage(reader.result);
                      reader.readAsDataURL(file);
                    } else {
                      setPreviewImage(null);
                    }
                  }}
                />
              </Button>
              {previewImage && (
                <Box mt={1}>
                  <Typography variant="caption">Preview:</Typography>
                  <Avatar
                    src={previewImage}
                    variant="rounded"
                    sx={{ width: 60, height: 60, mt: 1 }}
                  />
                </Box>
              )}
            </Grid>

            {/* Account Type */}
            <Grid item xs={12} md={6}>
              <FormControl
                fullWidth
                error={formik.touched.accountType && Boolean(formik.errors.accountType)}
              >
                <InputLabel>Account Type</InputLabel>
                <Select
                  name="accountType"
                  value={formik.values.accountType}
                  onChange={formik.handleChange}
                  label="Account Type"
                  sx={{ bgcolor: "white" }}
                >
                  <MenuItem value="Client">Client</MenuItem>
                  <MenuItem value="Vendor">Vendor</MenuItem>
                  <MenuItem value="Vehicle">Vehicle</MenuItem>
                  <MenuItem value="Agent">Agent</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {/* Company */}
            <Grid item xs={12} md={6}>
              <TextField
                select
                fullWidth
                label="Company"
                name="companyId"
                value={formik.values.companyId}
                onChange={formik.handleChange}
                error={formik.touched.companyId && Boolean(formik.errors.companyId)}
                helperText={formik.touched.companyId && formik.errors.companyId}
                sx={{ bgcolor: "white" }}
              >
                {companies.map((company) => (
                  <MenuItem key={company._id} value={company._id}>
                    {company.companyName}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            {/* Party Name */}
            <Grid item xs={12} md={6}>
              <PartySelector formik={formik} />
            </Grid>

            {/* Payment Mode */}
            <Grid item xs={12} md={6}>
              <FormControl
                fullWidth
                error={formik.touched.paymentMode && Boolean(formik.errors.paymentMode)}
              >
                <InputLabel>Payment Mode</InputLabel>
                <Select
                  name="paymentMode"
                  value={formik.values.paymentMode}
                  onChange={formik.handleChange}
                  label="Payment Mode"
                  sx={{ bgcolor: "white" }}
                >
                  {paymentModes.map((mode) => (
                    <MenuItem key={mode} value={mode}>
                      {mode}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Reference */}
            {voucherType === "receive" && (
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Reference / Cash / Cheque"
                  name="reference"
                  value={formik.values.reference}
                  onChange={formik.handleChange}
                  error={formik.touched.reference && Boolean(formik.errors.reference)}
                  helperText={formik.touched.reference && formik.errors.reference}
                  sx={{ bgcolor: "white" }}
                />
              </Grid>
            )}

            {/* Particulars */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Particulars"
                name="particulars"
                multiline
                rows={2}
                value={formik.values.particulars}
                onChange={formik.handleChange}
                sx={{ bgcolor: "white" }}
              />
            </Grid>

            {/* Total Cost */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Total Cost"
                name="totalCost"
                type="number"
                value={formik.values.totalCost}
                onChange={formik.handleChange}
                error={formik.touched.totalCost && Boolean(formik.errors.totalCost)}
                helperText={formik.touched.totalCost && formik.errors.totalCost}
                sx={{ bgcolor: "white" }}
              />
            </Grid>

            {/* Total Paid Till Date */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Total Paid Till Date"
                value={totalPaidTillDate}
                InputProps={{ readOnly: true }}
                sx={{ bgcolor: "#e0f7fa" }}
              />
            </Grid>

            {/* Remaining Amount */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Remaining Amount"
                value={remainingAmount}
                InputProps={{ readOnly: true }}
                sx={{ bgcolor: "#fff8e1" }}
              />
            </Grid>

            {/* Payment Link (for payment vouchers only) */}
            {voucherType === "payment" && (
              <Grid item xs={12}>
                <Box
                  sx={{
                    p: 2,
                    border: "1px dashed #1976d2",
                    borderRadius: 2,
                    backgroundColor: "#e3f2fd",
                    textAlign: "center",
                  }}
                >
                  <Typography variant="h6" color="primary" gutterBottom>
                    Online Payment Link
                  </Typography>
                  <Button
                    variant="contained"
                    color="success"
                    onClick={handlePaymentLinkClick}
                    sx={{ mb: 1 }}
                  >
                    Pay Now via Iconic Yatra
                  </Button>
                  <Typography variant="body2" color="text.secondary">
                    Click above to make payment through secure gateway
                  </Typography>
                  <Link
                    href={paymentLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    sx={{ mt: 1, display: "block" }}
                  >
                    {paymentLink}
                  </Link>
                </Box>
              </Grid>
            )}

            {/* Amount */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Amount"
                name="amount"
                type="number"
                value={formik.values.amount}
                onChange={formik.handleChange}
                error={formik.touched.amount && Boolean(formik.errors.amount)}
                helperText={formik.touched.amount && formik.errors.amount}
                sx={{ bgcolor: "white" }}
              />
            </Grid>

            {/* Submit */}
            <Grid item xs={12}>
              <Stack direction="row" spacing={2} justifyContent="center" mt={2}>
                <Button type="submit" variant="contained" color="primary" size="large">
                  Submit
                </Button>
                <Button type="reset" variant="outlined" color="error" size="large">
                  Clear
                </Button>
              </Stack>
            </Grid>
          </Grid>
        </form>
      )}
    </Paper>
  );
};

export default PaymentsForm;
