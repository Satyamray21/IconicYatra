// InvoiceForm.jsx
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
} from "@mui/material";
import { useFormik, FieldArray, FormikProvider } from "formik";
import * as Yup from "yup";
import DeleteIcon from "@mui/icons-material/Delete";
import { useDispatch, useSelector } from "react-redux";
import {
  createInvoice,
  recalculateInvoiceTotals,
  setSelectedInvoiceField,
} from "../../../../features/invoice/invoiceSlice";
import AddNewBank from "../Dialog/AddNewBank";
import axios from "../../../../utils/axios";

const accountTypes = ["Agent", "Supplier"];
const states = ["Maharashtra", "Gujarat", "Delhi"];
const taxOptions = ["0", "5", "12", "18", "28"];
const paymentModes = ["Cash", "Credit Card", "Bank Transfer", "Cheque"];

const InvoiceForm = () => {
  const [openDialog, setOpenDialog] = useState(false);
  const [paymentModeOptions, setPaymentModeOptions] = useState(paymentModes);
  const [isInitialSyncDone, setIsInitialSyncDone] = useState(false);
  const dispatch = useDispatch();
  const { loading, selectedInvoice } = useSelector((state) => state.invoice);
  const [companies, setCompanies] = useState([]);

  const handleAddNewPaymentMode = (newMode) => {
    if (newMode && !paymentModeOptions.includes(newMode)) {
      setPaymentModeOptions((p) => [...p, newMode]);
    }
    setOpenDialog(false);
  };

  const formik = useFormik({
    initialValues: {
      companyId: "",
      accountType: "",
      partyName: "",
      billingName: "",
      billingAddress: "",
      gstin: "",
      invoiceNo: "I-202517",
      invoiceDate: "",
      dueDate: "",
      stateOfSupply: "",
      taxType: "withTax",
      isInternational: false,
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
      paymentMode: "",
      referenceNo: "",
      note: "",
      invoiceValuePurchase: "",
      totalAmount: "",
      receivedAmount: "",
      balanceAmount: "",
    },
    validationSchema: Yup.object({
      companyId: Yup.string().required("Please select a company"),

      accountType: Yup.string().required("Required"),
      partyName: Yup.string().required("Required"),
      billingName: Yup.string().required("Required"),
      items: Yup.array().of(
        Yup.object().shape({
          particulars: Yup.string().required("Required"),
          price: Yup.number().typeError("Must be a number").required("Required"),
          taxPercent: Yup.string().required("Required"),
        })
      ),
    }),
    onSubmit: async (values, { resetForm }) => {
      try {
        await dispatch(createInvoice(values)).unwrap();
        alert("Invoice created successfully!");
        resetForm();
      } catch (err) {
        alert(err?.message || "Error creating invoice");
      }
    },
  });

  const { values, errors, touched, handleChange, handleSubmit, setFieldValue } = formik;

  // Helper to compute totals given items array and optionally received amount
  const computeTotals = useCallback((itemsArr, received) => {
    let total = 0;
    const recalculated = itemsArr.map((it) => {
      const price = parseFloat(it.price) || 0;
      const discountPercent = parseFloat(it.discountPercent) || 0;
      const taxPercent = parseFloat(it.taxPercent) || 0;

      const discount = (price * discountPercent) / 100;
      const discountedPrice = price - discount;
      const taxAmount = (discountedPrice * taxPercent) / 100;
      const amount = discountedPrice + taxAmount;

      total += amount;

      return {
        ...it,
        price: isNaN(price) ? "" : price,
        discountPercent: isNaN(discountPercent) ? "" : discountPercent,
        taxPercent: isNaN(taxPercent) ? "" : taxPercent,
        discount: Number(discount.toFixed(2)),
        taxAmount: Number(taxAmount.toFixed(2)),
        amount: Number(amount.toFixed(2)),
      };
    });

    const totalFixed = Number(total.toFixed(2));
    const rec = {
      items: recalculated,
      totalAmount: totalFixed,
      balanceAmount: Number((totalFixed - (parseFloat(received) || 0)).toFixed(2)),
    };
    return rec;
  }, []);

  // Centralized updater used when items or receivedAmount change
  const updateItemsAndTotals = useCallback(
    (updatedItems, receivedAmountVal = values.receivedAmount) => {
      const { items: recalcItems, totalAmount, balanceAmount } = computeTotals(
        updatedItems,
        receivedAmountVal
      );

      // update Formik
      setFieldValue("items", recalcItems, false);
      setFieldValue("totalAmount", totalAmount, false);
      setFieldValue("balanceAmount", balanceAmount, false);

      // sync to redux selectedInvoice
      dispatch(setSelectedInvoiceField({ field: "items", value: recalcItems }));
      dispatch(setSelectedInvoiceField({ field: "totalAmount", value: totalAmount }));
      dispatch(setSelectedInvoiceField({ field: "balanceAmount", value: balanceAmount }));

      // trigger slice-level recalc so slice keeps derived fields in sync
      dispatch(recalculateInvoiceTotals());
    },
    [computeTotals, dispatch, setFieldValue, values.receivedAmount]
  );

  // Sync Redux selectedInvoice values into Formik (for edit case)
  useEffect(() => {
  if (selectedInvoice && Object.keys(selectedInvoice).length && !isInitialSyncDone) {
    const merged = { ...formik.initialValues, ...selectedInvoice };
    formik.setValues({
      ...merged,
      items:
        merged.items && merged.items.length
          ? merged.items.map((it) => ({
              particulars: it.particulars ?? it.item ?? "",
              price: it.price ?? "",
              discountPercent: it.discountPercent ?? 0,
              discount: it.discount ?? 0,
              taxPercent: it.taxPercent ?? 0,
              taxAmount: it.taxAmount ?? 0,
              amount: it.amount ?? 0,
            }))
          : formik.initialValues.items,
    });
    setIsInitialSyncDone(true); // ✅ prevent future resets
  }
}, [selectedInvoice, isInitialSyncDone]);

  // When receivedAmount changes, update balance (and sync)
  useEffect(() => {
    const itemsCopy = values.items || [];
    updateItemsAndTotals(itemsCopy, values.receivedAmount);
  }, [values.receivedAmount, updateItemsAndTotals]); // eslint-disable-line
  useEffect(() => {
  const fetchCompanies = async () => {
    try {
      const { data } = await axios.get("/company");
      setCompanies(data?.data || data); // depends on your ApiResponse structure
    } catch (error) {
      console.error("Error fetching companies:", error);
    }
  };
  fetchCompanies();
}, []);

  // Called whenever a field in an item changes (price, taxPercent, discountPercent, particulars)
  const handleItemChange = (e, index) => {
    const { name, value } = e.target; // name like "items[0].price"
    // update Formik field first (this keeps touched/validation correct)
    setFieldValue(name, value, false);

    // build updated items locally and compute totals
    const updatedItems = (values.items || []).map((it, idx) =>
      idx === index
        ? {
            ...it,
            // update the specific property (extract after last dot)
            [name.split(".").pop()]: value,
          }
        : it
    );

    updateItemsAndTotals(updatedItems, values.receivedAmount);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        Invoice
      </Typography>

      <form onSubmit={handleSubmit}>
        <Grid container spacing={2}>
          {/* Company Name */}
<Grid item xs={12} sm={6} md={3}>
  <TextField
    select
    fullWidth
    label="Company"
    name="companyId"
    value={values.companyId || ""}
    onChange={(e) => {
      handleChange(e);
      // also sync to redux
      dispatch(setSelectedInvoiceField({ field: "companyId", value: e.target.value }));
    }}
  >
    {companies.map((company) => (
      <MenuItem key={company._id} value={company._id}>
        {company.companyName}
      </MenuItem>
    ))}
  </TextField>
</Grid>

          {/* Account Type */}
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
            >
              {accountTypes.map((type) => (
                <MenuItem key={type} value={type}>
                  {type}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          {/* Party Name */}
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              select
              fullWidth
              label="Party Name"
              name="partyName"
              value={values.partyName}
              onChange={handleChange}
              error={touched.partyName && Boolean(errors.partyName)}
              helperText={touched.partyName && errors.partyName}
            >
              <MenuItem value="ABC Travels">ABC Travels</MenuItem>
              <MenuItem value="XYZ Traders">XYZ Traders</MenuItem>
            </TextField>
          </Grid>

          {/* Invoice No */}
          <Grid item xs={12} sm={6} md={3}>
            <TextField fullWidth label="Invoice No" name="invoiceNo" value={values.invoiceNo} onChange={handleChange} />
          </Grid>

          {/* Invoice Date */}
          <Grid item xs={12} sm={6} md={3}>
            <TextField fullWidth type="date" label="Invoice Date" name="invoiceDate" InputLabelProps={{ shrink: true }} value={values.invoiceDate} onChange={handleChange} />
          </Grid>

          {/* Billing Name */}
          <Grid item xs={12} sm={6}>
            <TextField fullWidth label="Billing Name" name="billingName" value={values.billingName} onChange={handleChange} error={touched.billingName && Boolean(errors.billingName)} helperText={touched.billingName && errors.billingName} />
          </Grid>

          {/* Billing Address */}
          <Grid item xs={12} sm={6}>
            <TextField fullWidth multiline minRows={2} label="Billing Address" name="billingAddress" value={values.billingAddress} onChange={handleChange} />
          </Grid>

          {/* GSTIN, Due Date, State */}
          <Grid item xs={12} sm={4}>
            <TextField fullWidth label="GSTIN Number" name="gstin" value={values.gstin} onChange={handleChange} />
          </Grid>

          <Grid item xs={12} sm={4}>
            <TextField fullWidth type="date" label="Due Date" name="dueDate" InputLabelProps={{ shrink: true }} value={values.dueDate} onChange={handleChange} />
          </Grid>

          <Grid item xs={12} sm={4}>
            <TextField select fullWidth label="State of Supply" name="stateOfSupply" value={values.stateOfSupply} onChange={handleChange}>
              {states.map((state) => (
                <MenuItem key={state} value={state}>
                  {state}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid item xs={12}>
            <FormControlLabel control={<Checkbox name="isInternational" checked={values.isInternational} onChange={handleChange} />} label="International" />
          </Grid>
        </Grid>

        {/* Tax Type */}
        <RadioGroup row name="taxType" value={values.taxType} onChange={handleChange} sx={{ mt: 2 }}>
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
                      <TableCell>Particulars</TableCell>
                      <TableCell>Price</TableCell>
                      <TableCell>Discount %</TableCell>
                      <TableCell>Discount</TableCell>
                      <TableCell>Tax %</TableCell>
                      <TableCell>Tax Amount</TableCell>
                      <TableCell>Amount</TableCell>
                      <TableCell align="center">Action</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {values.items.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell>{index + 1}</TableCell>
                        {[
                          "particulars",
                          "price",
                          "discountPercent",
                          "discount",
                          "taxPercent",
                          "taxAmount",
                          "amount",
                        ].map((field) => (
                          <TableCell key={field}>
                            {field === "taxPercent" ? (
                              <TextField select name={`items[${index}].${field}`} value={item[field]} onChange={(e) => handleItemChange(e, index)} fullWidth>
                                {taxOptions.map((tax) => (
                                  <MenuItem key={tax} value={tax}>
                                    {tax}%
                                  </MenuItem>
                                ))}
                              </TextField>
                            ) : (
                              <TextField name={`items[${index}].${field}`} value={item[field]} onChange={(e) => handleItemChange(e, index)} fullWidth />
                            )}
                          </TableCell>
                        ))}
                        <TableCell align="center">
                          <IconButton
                            color="error"
                            onClick={() => {
                              arrayHelpers.remove(index);
                              // recompute after removal
                              const newItems = values.items.filter((_, i) => i !== index);
                              updateItemsAndTotals(newItems, values.receivedAmount);
                            }}
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
                    onClick={() => {
                      arrayHelpers.push({
                        particulars: "",
                        price: "",
                        discountPercent: "",
                        discount: "",
                        taxPercent: "",
                        taxAmount: "",
                        amount: "",
                      });
                      // push then compute (use current values plus the new blank item)
                      const newItems = [...values.items, { particulars: "", price: "", discountPercent: "", discount: "", taxPercent: "", taxAmount: "", amount: "" }];
                      updateItemsAndTotals(newItems, values.receivedAmount);
                    }}
                  >
                    Add New
                  </Button>
                </Box>
              </TableContainer>
            )}
          />
        </FormikProvider>

        {/* Payment / Totals */}
        <Grid container spacing={2} sx={{ mt: 2 }}>
          <Grid item xs={12} sm={4}>
            <TextField select fullWidth label="Payment Mode" name="paymentMode" value={values.paymentMode} onChange={handleChange}>
              {paymentModeOptions.map((mode) => (
                <MenuItem key={mode} value={mode}>
                  {mode}
                </MenuItem>
              ))}
              <MenuItem onClick={() => setOpenDialog(true)}>+ Add New</MenuItem>
            </TextField>
          </Grid>

          <Grid item xs={12} sm={4}>
            <TextField fullWidth label="Reference/Cash/Cheque No." name="referenceNo" value={values.referenceNo} onChange={handleChange} />
          </Grid>

          <Grid item xs={12}>
            <TextField fullWidth multiline minRows={2} label="Additional Note" name="note" value={values.note} onChange={handleChange} />
          </Grid>
        </Grid>

        {/* Totals Section */}
        <Box sx={{ mt: 3 }}>
          <Grid container spacing={2}>
            {["invoiceValuePurchase", "totalAmount", "receivedAmount", "balanceAmount"].map((field, i) => (
              <Grid item xs={12} sm={3} key={i}>
                <TextField
                  fullWidth
                  label={field.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase())}
                  name={field}
                  value={values[field]}
                  onChange={(e) => {
                    // special handling for receivedAmount -> recalc
                    handleChange(e);
                    if (field === "receivedAmount") {
                      // set then recompute
                      const newReceived = e.target.value;
                      updateItemsAndTotals(values.items || [], newReceived);
                      dispatch(setSelectedInvoiceField({ field: "receivedAmount", value: newReceived }));
                    } else {
                      handleChange(e);
                      dispatch(setSelectedInvoiceField({ field, value: e.target.value }));
                    }
                  }}
                />
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Submit */}
        <Box sx={{ mt: 4, textAlign: "center" }}>
          <Button type="submit" variant="contained" color="primary" disabled={loading}>
            {loading ? "Saving..." : "Submit"}
          </Button>
        </Box>
      </form>

      <AddNewBank open={openDialog} onClose={() => setOpenDialog(false)} onSave={handleAddNewPaymentMode} />
    </Box>
  );
};

export default InvoiceForm;
