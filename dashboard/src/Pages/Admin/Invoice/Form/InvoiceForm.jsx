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
import {
  fetchCountries,
  fetchStatesByCountry,
} from "../../../../features/location/locationSlice";
import AddNewBank from "../Dialog/AddNewBank";
import axios from "../../../../utils/axios";

const taxOptions = ["0", "5", "12", "18", "28"];
const paymentModes = ["Cash", "Credit Card", "Bank Transfer", "Cheque"];

const InvoiceForm = () => {
  const [openDialog, setOpenDialog] = useState(false);
  const [paymentModeOptions, setPaymentModeOptions] = useState(paymentModes);
  const [isInitialSyncDone, setIsInitialSyncDone] = useState(false);
  const dispatch = useDispatch();

  const { loading, selectedInvoice } = useSelector((state) => state.invoice);
  const { countries, states } = useSelector(
    (state) => state.location
  );

  const [companies, setCompanies] = useState([]);

  // --- Fetch companies
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

  // --- Fetch countries (for international) & Indian states (default)
  useEffect(() => {
    dispatch(fetchCountries());
    dispatch(fetchStatesByCountry("India"));
  }, [dispatch]);

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
      mobile: "",
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
      mobile: Yup.string()
        .matches(/^[0-9]{10}$/, "Enter valid mobile number")
        .required("Required"),
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

  const { values, errors, touched, handleChange, handleSubmit, setFieldValue } =
    formik;

  // === Compute Totals ===
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
        discount: Number(discount.toFixed(2)),
        taxAmount: Number(taxAmount.toFixed(2)),
        amount: Number(amount.toFixed(2)),
      };
    });

    const totalFixed = Number(total.toFixed(2));
    return {
      items: recalculated,
      totalAmount: totalFixed,
      balanceAmount: Number(
        (totalFixed - (parseFloat(received) || 0)).toFixed(2)
      ),
    };
  }, []);

  // === Update Items & Totals ===
  const updateItemsAndTotals = useCallback(
    (updatedItems, receivedAmountVal = values.receivedAmount) => {
      const { items: recalcItems, totalAmount, balanceAmount } = computeTotals(
        updatedItems,
        receivedAmountVal
      );
      setFieldValue("items", recalcItems, false);
      setFieldValue("totalAmount", totalAmount, false);
      setFieldValue("balanceAmount", balanceAmount, false);

      dispatch(setSelectedInvoiceField({ field: "items", value: recalcItems }));
      dispatch(
        setSelectedInvoiceField({ field: "totalAmount", value: totalAmount })
      );
      dispatch(
        setSelectedInvoiceField({ field: "balanceAmount", value: balanceAmount })
      );

      dispatch(recalculateInvoiceTotals());
    },
    [computeTotals, dispatch, setFieldValue, values.receivedAmount]
  );

  // === Handle receivedAmount change ===
  useEffect(() => {
    updateItemsAndTotals(values.items || [], values.receivedAmount);
  }, [values.receivedAmount, updateItemsAndTotals]);

  // === Handle item change ===
  const handleItemChange = (e, index) => {
    const { name, value } = e.target;
    setFieldValue(name, value, false);

    const updatedItems = values.items.map((it, idx) =>
      idx === index
        ? { ...it, [name.split(".").pop()]: value }
        : it
    );
    updateItemsAndTotals(updatedItems, values.receivedAmount);
  };

  // === Handle isInternational toggle ===
  useEffect(() => {
    if (values.isInternational) {
      dispatch(fetchCountries());
    } else {
      dispatch(fetchStatesByCountry("India"));
    }
  }, [values.isInternational, dispatch]);

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        Invoice
      </Typography>

      <form onSubmit={handleSubmit}>
        <Grid container spacing={2}>
          {/* Company */}
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              select
              fullWidth
              label="Company"
              name="companyId"
              value={values.companyId}
              onChange={(e) => {
                handleChange(e);
                dispatch(
                  setSelectedInvoiceField({
                    field: "companyId",
                    value: e.target.value,
                  })
                );
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
              {["Agent", "Supplier"].map((type) => (
                <MenuItem key={type} value={type}>
                  {type}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          {/* Mobile */}
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              label="Mobile"
              name="mobile"
              value={values.mobile}
              onChange={handleChange}
              error={touched.mobile && Boolean(errors.mobile)}
              helperText={touched.mobile && errors.mobile}
            />
          </Grid>

          {/* Invoice No */}
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              label="Invoice No"
              name="invoiceNo"
              value={values.invoiceNo}
              onChange={handleChange}
            />
          </Grid>

          {/* Invoice Date */}
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              type="date"
              label="Invoice Date"
              name="invoiceDate"
              InputLabelProps={{ shrink: true }}
              value={values.invoiceDate}
              onChange={handleChange}
            />
          </Grid>

          {/* Billing Name */}
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Billing Name"
              name="billingName"
              value={values.billingName}
              onChange={handleChange}
            />
          </Grid>

          {/* Billing Address */}
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

          {/* GSTIN, Due Date */}
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              label="GSTIN"
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
              value={values.dueDate}
              onChange={handleChange}
            />
          </Grid>

          {/* State or Country */}
          <Grid item xs={12} sm={4}>
            <TextField
              select
              fullWidth
              label={
                values.isInternational ? "Country of Supply" : "State of Supply"
              }
              name="stateOfSupply"
              value={values.stateOfSupply}
              onChange={handleChange}
            >
              {(values.isInternational ? countries : states).map((item, i) => (
                <MenuItem key={i} value={item.name || item}>
                  {item.name || item}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          {/* International checkbox */}
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
