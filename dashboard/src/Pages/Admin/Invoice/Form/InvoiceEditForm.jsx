import React, { useEffect, useState, useCallback } from "react";
import {
  Box,
  Grid,
  TextField,
  MenuItem,
  Button,
  Typography,
  Checkbox,
  FormControlLabel,
  RadioGroup,
  Radio,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  CircularProgress,
  Alert,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import { useDispatch, useSelector } from "react-redux";
import { useFormik, FieldArray, FormikProvider } from "formik";
import * as Yup from "yup";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";

// Import the PartySelector component
import PartySelector from "../../Payments/Form/PartySelector";

// Import your slices
import {
  createInvoice,
  updateInvoice,
  getInvoiceById,
  clearInvoiceState,
} from "../../../../features/invoice/invoiceSlice";

// Dropdown options
const states = ["Maharashtra", "Gujarat", "Delhi"];
const taxOptions = ["0%", "5%", "12%", "18%", "28%"];
const paymentModes = ["Cash", "Credit Card", "Bank Transfer", "Cheque"];

const InvoiceForm = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { invoiceId } = useParams();

  const { selectedInvoice, loading, successMessage, error } = useSelector(
    (state) => state.invoice
  );

  const [openDialog, setOpenDialog] = useState(false);
  const [paymentModeOptions, setPaymentModeOptions] = useState(paymentModes);

  // Debug logs
  useEffect(() => {
    console.log("🔄 InvoiceForm: Component mounted with ID:", invoiceId);
    if (invoiceId) {
      dispatch(getInvoiceById(invoiceId));
    }
  }, [invoiceId, dispatch]);

  useEffect(() => {
    console.log("📥 InvoiceForm: selectedInvoice", selectedInvoice);
    console.log("⏳ InvoiceForm: loading state", loading);
    console.log("❌ InvoiceForm: error state", error);
  }, [selectedInvoice, loading, error]);

  useEffect(() => {
    if (successMessage) {
      toast.success(successMessage);
      dispatch(clearInvoiceState());
      navigate("/invoices");
    }
  }, [successMessage, navigate, dispatch]);

  const handleAddNewPaymentMode = (newMode) => {
    if (newMode && !paymentModeOptions.includes(newMode)) {
      setPaymentModeOptions([...paymentModeOptions, newMode]);
    }
    setOpenDialog(false);
  };

  // Default empty invoice structure
  const emptyInvoice = {
    accountType: "",
    partyName: "",
    billingName: "",
    billingAddress: "",
    gstin: "",
    invoiceNo: "",
    invoiceDate: "",
    dueDate: "",
    stateOfSupply: "",
    isInternational: false,
    taxType: "withTax",
    items: [
      {
        particulars: "",
        price: "",
        discountPercent: "",
        discount: "",
        taxPercent: "",
        taxAmount: "",
        amount: "",
      },
    ],
    totalAmount: "",
    receivedAmount: "",
    balanceAmount: "",
    paymentMode: "",
    referenceNo: "",
    note: "",
  };

  // Calculate item totals function
  const calculateItemTotals = useCallback((items, receivedAmount = 0) => {
    let totalAmount = 0;
    
    const updatedItems = items.map((item) => {
      const price = parseFloat(item.price) || 0;
      const discountPercent = parseFloat(item.discountPercent) || 0;
      const taxPercent = parseFloat(item.taxPercent?.replace('%', '') || 0);

      const discount = (price * discountPercent) / 100;
      const discountedPrice = price - discount;
      const taxAmount = (discountedPrice * taxPercent) / 100;
      const amount = discountedPrice + taxAmount;

      totalAmount += amount;

      return {
        ...item,
        discount: Number(discount.toFixed(2)),
        taxAmount: Number(taxAmount.toFixed(2)),
        amount: Number(amount.toFixed(2)),
      };
    });

    const balanceAmount = Number((totalAmount - (parseFloat(receivedAmount) || 0)).toFixed(2));

    return {
      items: updatedItems,
      totalAmount: Number(totalAmount.toFixed(2)),
      balanceAmount
    };
  }, []);

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: invoiceId ? (selectedInvoice || emptyInvoice) : emptyInvoice,
    validationSchema: Yup.object({
      accountType: Yup.string().required("Required"),
      partyName: Yup.string().required("Required"),
      billingName: Yup.string().required("Required"),
      invoiceNo: Yup.string().required("Required"),
      invoiceDate: Yup.date().required("Required"),
      items: Yup.array().of(
        Yup.object().shape({
          particulars: Yup.string().required("Required"),
          price: Yup.number().typeError("Must be a number").required("Required"),
          taxPercent: Yup.string().required("Required"),
        })
      ),
    }),
    onSubmit: (values) => {
      console.log("📤 Submitting form with values:", values);
      
      if (invoiceId) {
        // Update existing invoice
        const updatedData = { ...values };
        delete updatedData.invoiceNo; // Prevent invoiceNo modification in edit
        dispatch(updateInvoice({ id: invoiceId, updatedData }));
      } else {
        // Create new invoice
        dispatch(createInvoice(values));
      }
    },
  });

  const { values, errors, touched, handleChange, handleSubmit, setFieldValue } = formik;

  // Handle item field changes with calculation
  const handleItemChange = useCallback((e, index) => {
    const { name, value } = e.target;
    const fieldName = `items[${index}].${name}`;
    
    // Update the field
    setFieldValue(fieldName, value);
    
    // Calculate totals after a short delay to avoid excessive calculations
    setTimeout(() => {
      const calculated = calculateItemTotals(values.items, values.receivedAmount);
      setFieldValue("items", calculated.items);
      setFieldValue("totalAmount", calculated.totalAmount);
      setFieldValue("balanceAmount", calculated.balanceAmount);
    }, 100);
  }, [values.items, values.receivedAmount, setFieldValue, calculateItemTotals]);

  // Handle received amount change
  const handleReceivedAmountChange = useCallback((e) => {
    const { value } = e.target;
    setFieldValue("receivedAmount", value);
    
    // Recalculate balance
    const totalAmount = parseFloat(values.totalAmount) || 0;
    const receivedAmount = parseFloat(value) || 0;
    setFieldValue("balanceAmount", Number((totalAmount - receivedAmount).toFixed(2)));
  }, [values.totalAmount, setFieldValue]);

  // Initialize calculations when form loads or invoice data is loaded
  useEffect(() => {
    if (values.items && values.items.length > 0 && (!values.totalAmount || values.totalAmount === 0)) {
      const calculated = calculateItemTotals(values.items, values.receivedAmount);
      setFieldValue("items", calculated.items);
      setFieldValue("totalAmount", calculated.totalAmount);
      setFieldValue("balanceAmount", calculated.balanceAmount);
    }
  }, [values.items, values.receivedAmount, values.totalAmount, setFieldValue, calculateItemTotals]);

  // Show loading state for edit
  if (invoiceId && loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "60vh" }}>
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>Loading invoice data...</Typography>
      </Box>
    );
  }

  // Show error state for edit
  if (invoiceId && error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          Error loading invoice: {error}
        </Alert>
        <Button 
          variant="contained" 
          onClick={() => dispatch(getInvoiceById(invoiceId))}
        >
          Retry Loading
        </Button>
        <Button 
          variant="outlined" 
          onClick={() => navigate("/invoices")}
          sx={{ ml: 2 }}
        >
          Back to Invoices
        </Button>
      </Box>
    );
  }

  // Show no data state for edit
  if (invoiceId && !selectedInvoice) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h6" color="error">
          No invoice data found
        </Typography>
        <Button 
          variant="contained" 
          onClick={() => dispatch(getInvoiceById(invoiceId))}
          sx={{ mt: 2 }}
        >
          Retry Loading
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        {invoiceId ? `Edit Invoice - ${values.invoiceNo || "Loading..."}` : "Create New Invoice"}
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <form onSubmit={handleSubmit}>
        {/* Top Section */}
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              select
              fullWidth
              label="Account Type"
              name="accountType"
              value={values.accountType}
              onChange={handleChange}
              error={touched.accountType && Boolean(errors.accountType)}
              helperText={touched.accountType && errors.accountType}
              required
            >
              <MenuItem value="Vendor">Vendor</MenuItem>
              <MenuItem value="Vehicle">Vehicle</MenuItem>
              <MenuItem value="Agent">Agent</MenuItem>
              <MenuItem value="Client">Client</MenuItem>
            </TextField>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            {/* Party Selector Component */}
            <PartySelector formik={formik} />
            {touched.partyName && errors.partyName && (
              <Typography variant="caption" color="error" sx={{ ml: 2 }}>
                {errors.partyName}
              </Typography>
            )}
          </Grid>

          {/* Invoice No (Read-only for edit, editable for create) */}
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              label="Invoice No"
              name="invoiceNo"
              value={values.invoiceNo}
              onChange={handleChange}
              error={touched.invoiceNo && Boolean(errors.invoiceNo)}
              helperText={touched.invoiceNo && errors.invoiceNo}
              required
              InputProps={
                invoiceId ? {
                  readOnly: true,
                  style: { backgroundColor: "#f5f5f5" },
                } : {}
              }
            />
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              type="date"
              label="Invoice Date"
              name="invoiceDate"
              InputLabelProps={{ shrink: true }}
              value={values.invoiceDate ? values.invoiceDate.split('T')[0] : ''}
              onChange={handleChange}
              error={touched.invoiceDate && Boolean(errors.invoiceDate)}
              helperText={touched.invoiceDate && errors.invoiceDate}
              required
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Billing Name"
              name="billingName"
              value={values.billingName}
              onChange={handleChange}
              error={touched.billingName && Boolean(errors.billingName)}
              helperText={touched.billingName && errors.billingName}
              required
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              multiline
              minRows={2}
              label="Billing Address"
              name="billingAddress"
              value={values.billingAddress}
              onChange={handleChange}
            />
          </Grid>

          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              label="GSTIN Number"
              name="gstin"
              value={values.gstin}
              onChange={handleChange}
            />
          </Grid>

          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              type="date"
              label="Due Date"
              name="dueDate"
              InputLabelProps={{ shrink: true }}
              value={values.dueDate ? values.dueDate.split('T')[0] : ''}
              onChange={handleChange}
            />
          </Grid>

          <Grid item xs={12} sm={4}>
            <TextField
              select
              fullWidth
              label="State of Supply"
              name="stateOfSupply"
              value={values.stateOfSupply}
              onChange={handleChange}
            >
              {states.map((state) => (
                <MenuItem key={state} value={state}>
                  {state}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Checkbox
                  name="isInternational"
                  checked={values.isInternational}
                  onChange={handleChange}
                />
              }
              label="International"
            />
          </Grid>
        </Grid>

        {/* Tax Type */}
        <RadioGroup
          row
          name="taxType"
          value={values.taxType}
          onChange={handleChange}
          sx={{ mt: 2 }}
        >
          <FormControlLabel value="withTax" control={<Radio />} label="With Tax" />
          <FormControlLabel value="withoutTax" control={<Radio />} label="Without Tax" />
        </RadioGroup>

        {/* Items Table */}
        <FormikProvider value={formik}>
          <FieldArray
            name="items"
            render={(arrayHelpers) => (
              <TableContainer component={Paper} sx={{ mt: 3 }}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>#</TableCell>
                      <TableCell>Particulars *</TableCell>
                      <TableCell>Price *</TableCell>
                      <TableCell>Discount %</TableCell>
                      <TableCell>Discount</TableCell>
                      <TableCell>Tax % *</TableCell>
                      <TableCell>Tax Amount</TableCell>
                      <TableCell>Amount</TableCell>
                      <TableCell align="center">Action</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {values.items && values.items.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell>{index + 1}</TableCell>
                        <TableCell>
                          <TextField
                            name={`particulars`}
                            value={item.particulars}
                            onChange={(e) => handleItemChange(e, index)}
                            fullWidth
                            error={touched.items?.[index]?.particulars && Boolean(errors.items?.[index]?.particulars)}
                            helperText={touched.items?.[index]?.particulars && errors.items?.[index]?.particulars}
                          />
                        </TableCell>
                        <TableCell>
                          <TextField
                            name={`price`}
                            value={item.price}
                            onChange={(e) => handleItemChange(e, index)}
                            fullWidth
                            type="number"
                            error={touched.items?.[index]?.price && Boolean(errors.items?.[index]?.price)}
                            helperText={touched.items?.[index]?.price && errors.items?.[index]?.price}
                          />
                        </TableCell>
                        <TableCell>
                          <TextField
                            name={`discountPercent`}
                            value={item.discountPercent}
                            onChange={(e) => handleItemChange(e, index)}
                            fullWidth
                            type="number"
                          />
                        </TableCell>
                        <TableCell>
                          <TextField
                            name={`discount`}
                            value={item.discount}
                            fullWidth
                            InputProps={{ readOnly: true }}
                            sx={{ backgroundColor: "#f5f5f5" }}
                          />
                        </TableCell>
                        <TableCell>
                          <TextField
                            select
                            name={`taxPercent`}
                            value={item.taxPercent}
                            onChange={(e) => handleItemChange(e, index)}
                            fullWidth
                            error={touched.items?.[index]?.taxPercent && Boolean(errors.items?.[index]?.taxPercent)}
                            helperText={touched.items?.[index]?.taxPercent && errors.items?.[index]?.taxPercent}
                          >
                            {taxOptions.map((tax) => (
                              <MenuItem key={tax} value={tax}>
                                {tax}
                              </MenuItem>
                            ))}
                          </TextField>
                        </TableCell>
                        <TableCell>
                          <TextField
                            name={`taxAmount`}
                            value={item.taxAmount}
                            fullWidth
                            InputProps={{ readOnly: true }}
                            sx={{ backgroundColor: "#f5f5f5" }}
                          />
                        </TableCell>
                        <TableCell>
                          <TextField
                            name={`amount`}
                            value={item.amount}
                            fullWidth
                            InputProps={{ readOnly: true }}
                            sx={{ backgroundColor: "#f5f5f5" }}
                          />
                        </TableCell>
                        <TableCell align="center">
                          <IconButton
                            color="error"
                            onClick={() => arrayHelpers.remove(index)}
                            disabled={values.items.length <= 1}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                <Box p={2}>
                  <Button
                    variant="contained"
                    onClick={() =>
                      arrayHelpers.push({
                        particulars: "",
                        price: "",
                        discountPercent: "",
                        discount: "",
                        taxPercent: "",
                        taxAmount: "",
                        amount: "",
                      })
                    }
                  >
                    Add New Item
                  </Button>
                </Box>
              </TableContainer>
            )}
          />
        </FormikProvider>

        {/* Payment Section */}
        <Grid container spacing={2} sx={{ mt: 2 }}>
          <Grid item xs={12} sm={4}>
            <TextField
              select
              fullWidth
              label="Payment Mode"
              name="paymentMode"
              value={values.paymentMode}
              onChange={handleChange}
            >
              {paymentModeOptions.map((mode) => (
                <MenuItem key={mode} value={mode}>
                  {mode}
                </MenuItem>
              ))}
              <MenuItem onClick={() => setOpenDialog(true)}>+ Add New</MenuItem>
            </TextField>
          </Grid>

          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              label="Reference/Cash/Cheque No."
              name="referenceNo"
              value={values.referenceNo}
              onChange={handleChange}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              multiline
              minRows={2}
              label="Additional Note"
              name="note"
              value={values.note}
              onChange={handleChange}
            />
          </Grid>
        </Grid>

        {/* Totals Section */}
        <Box sx={{ mt: 3 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={3}>
              <TextField
                fullWidth
                label="Total Amount"
                name="totalAmount"
                value={values.totalAmount}
                InputProps={{
                  readOnly: true,
                  style: { backgroundColor: "#f5f5f5" },
                }}
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                fullWidth
                label="Received Amount"
                name="receivedAmount"
                value={values.receivedAmount}
                onChange={handleReceivedAmountChange}
                type="number"
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                fullWidth
                label="Balance Amount"
                name="balanceAmount"
                value={values.balanceAmount}
                InputProps={{
                  readOnly: true,
                  style: { backgroundColor: "#f5f5f5" },
                }}
              />
            </Grid>
          </Grid>
        </Box>

        <Box sx={{ mt: 4, textAlign: "center" }}>
          <Button 
            type="submit" 
            variant="contained" 
            color="primary"
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : null}
          >
            {loading ? "Processing..." : (invoiceId ? "Update Invoice" : "Create Invoice")}
          </Button>
          <Button 
            variant="outlined" 
            onClick={() => navigate("/invoices")}
            sx={{ ml: 2 }}
          >
            Cancel
          </Button>
        </Box>
      </form>
    </Box>
  );
};

export default InvoiceForm;