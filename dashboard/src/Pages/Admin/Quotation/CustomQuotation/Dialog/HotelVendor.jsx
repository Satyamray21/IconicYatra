import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  RadioGroup,
  FormControlLabel,
  Radio,
  Typography,
  Divider,
  Box,
  TextField,
  Button,
  Checkbox,
  FormLabel,
  Select,
  MenuItem,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import { useFormik } from "formik";
import * as Yup from "yup";
import AddIcon from "@mui/icons-material/Add";
import BankDetailsDialog from "./BankDetailsDialog";
import AddBankDialog from "./AddBankDialog";
import AssociateDetailForm from "../../../Associates/Form/AssociatesForm";
import { useSelector } from "react-redux";

/**
 * Fixed HotelVendorDialog.jsx
 * - Uses "Single Vendor" / "Multiple Vendor"
 * - Formik integrated correctly with MUI Select (formik.setFieldValue)
 * - Add New Vendor handled via sentinel value "__add_new_vendor__"
 * - Vehicle select uses controlled state updates
 * - Builds step7 payload exactly as backend expects
 */

const HotelVendorDialog = ({ open, onClose, finalizedPackage, onConfirm }) => {
  const { list: associates = [] } = useSelector((state) => state.associate);

  // step control
  const [hotelStepOpen, setHotelStepOpen] = useState(true);
  const [vehicleStepOpen, setVehicleStepOpen] = useState(false);
  const [bankStepOpen, setBankStepOpen] = useState(false);

  // add dialogs
  const [addVendorDialogOpen, setAddVendorDialogOpen] = useState(false);
  const [addBankDialogOpen, setAddBankDialogOpen] = useState(false);

  // lists
  const [vendors, setVendors] = useState([]);
  const [vehicleVendors, setVehicleVendors] = useState([]);

  // vehicle vendor form state
  const [vehicleVendorForm, setVehicleVendorForm] = useState({
    vehicleVendorName: "",
    amount: "",
    showAllVehicle: false,
  });

  // bank fields
  const [accountType, setAccountType] = useState("company");
  const [accountName, setAccountName] = useState("");
  const [accountOptions, setAccountOptions] = useState([]);

  // new bank object (for AddBankDialog)
  const [newBankDetails, setNewBankDetails] = useState({
    bankName: "",
    branchName: "",
    accountHolderName: "",
    accountNumber: "",
    ifscCode: "",
    openingBalance: "",
  });

  // initial hotel form values
  const initialHotelValues = {
    vendorType: "Single Vendor", // default value must match schema enum
    vendorName: "",
    amount: "",
    nights: "",
    maxLimit: 50000,
    showAll: false,
    same: false,
  };

  const hotelAssoc = associates.filter(
    (item) => item?.personalDetails?.associateType === "Hotel Vendor"
  );
  const vehicleAssoc = associates.filter(
    (item) => item?.personalDetails?.associateType === "Vehicle Vendor"
  );

 useEffect(() => {
  if (!open) return; // update only when dialog opens

  setVendors(hotelAssoc.map((v) => v.personalDetails.fullName));
  setVehicleVendors(vehicleAssoc.map((v) => v.personalDetails.fullName));

  setAccountOptions([
    { value: "account1", label: "Account 1" },
    { value: "account2", label: "Account 2" },
  ]);
}, [associates, open]);


  // Formik
  const formik = useFormik({
    initialValues: initialHotelValues,
    enableReinitialize: true,
    validationSchema: Yup.object({
      vendorType: Yup.string().required("Required"),
      vendorName: Yup.string().when("vendorType", {
        is: "Single Vendor",
        then: (schema) => schema.required("Vendor name is required"),
        otherwise: (schema) => schema.notRequired(),
      }),
      amount: Yup.number().min(0).nullable(),
      nights: Yup.number().min(0).nullable(),
      maxLimit: Yup.number().min(0).nullable(),
    }),
    onSubmit: (values) => {
      // move to vehicle step after hotel confirm
      setHotelStepOpen(false);
      setVehicleStepOpen(true);
    },
  });

  // ---- Helpers to render selects with Add option ----
  const renderVendorSelect = (name, value) => (
    <Select
      name={name}
      value={value}
      onChange={(e) => {
        const val = e.target.value;
        if (val === "__add_new_vendor__") {
          // open add vendor dialog (keeps select open/unchanged)
          setAddVendorDialogOpen(true);
          return;
        }
        // update formik value properly
        formik.setFieldValue(name, val);
      }}
      fullWidth
      displayEmpty
    >
      <MenuItem value="">Select Hotel Vendor</MenuItem>
      {vendors.map((vendor) => (
        <MenuItem key={vendor} value={vendor}>
          {vendor}
        </MenuItem>
      ))}
      <MenuItem value="__add_new_vendor__">
        <ListItemIcon>
          <AddIcon fontSize="small" />
        </ListItemIcon>
        <ListItemText>Add New Vendor</ListItemText>
      </MenuItem>
    </Select>
  );

  const renderVehicleVendorSelect = () => (
    <Select
      name="vehicleVendorName"
      value={vehicleVendorForm.vehicleVendorName}
      onChange={(e) => {
        const val = e.target.value;
        if (val === "__add_new_vendor__") {
          setAddVendorDialogOpen(true);
          return;
        }
        setVehicleVendorForm((prev) => ({ ...prev, vehicleVendorName: val }));
      }}
      fullWidth
      displayEmpty
    >
      <MenuItem value="">Select Vehicle Vendor</MenuItem>
      {vehicleVendors.map((vendor) => (
        <MenuItem key={vendor} value={vendor}>
          {vendor}
        </MenuItem>
      ))}
      <MenuItem value="__add_new_vendor__">
        <ListItemIcon>
          <AddIcon fontSize="small" />
        </ListItemIcon>
        <ListItemText>Add New Vendor</ListItemText>
      </MenuItem>
    </Select>
  );

  // ---- Handlers ----
  const handleVendorTypeChange = (e) => {
    const value = e.target.value;
    formik.setFieldValue("vendorType", value);
    // optionally clear vendorName when switching types to avoid stale values:
    // formik.setFieldValue("vendorName", "");
  };

  const handleAddVendorSuccess = (newVendor) => {
    const name = newVendor.name || newVendor;
    if (name && !vendors.includes(name)) {
      setVendors((prev) => [...prev, name]);
      // set it as selected in formik if currently on hotel step
      if (hotelStepOpen) formik.setFieldValue("vendorName", name);
      // if vehicle dialog open, set vehicle vendor
      if (vehicleStepOpen) setVehicleVendorForm((p) => ({ ...p, vehicleVendorName: name }));
    }
    setAddVendorDialogOpen(false);
  };

  const handleVehicleConfirm = () => {
    setVehicleStepOpen(false);
    setBankStepOpen(true);
  };

  const handleBankConfirm = () => {
    // build payload following backend schema exactly
    const step7Data = {
      finalizedPackage: finalizedPackage || null,
      vendorType: formik.values.vendorType, // "Single Vendor" | "Multiple Vendor"
      hotelVendor: {
        packageType: finalizedPackage || null,
        vendorName: formik.values.vendorName || "",
        nights: formik.values.nights ? Number(formik.values.nights) : 0,
        amount: formik.values.amount ? Number(formik.values.amount) : 0,
        maxLimit: formik.values.maxLimit ? Number(formik.values.maxLimit) : 0,
      },
      vehicleVendor: {
        vendorName: vehicleVendorForm.vehicleVendorName || "",
        amount: vehicleVendorForm.amount ? Number(vehicleVendorForm.amount) : 0,
      },
      // packageSummary will be attached by parent (FinalizeDialog)
      // bank details (optional; included for frontend reference)
      bankDetails: {
        accountType,
        accountName,
      },
    };

    // debug log (remove in production)
    // console.log("STEP7 payload ->", step7Data);

    if (onConfirm) onConfirm(step7Data);

    // reset/close
    setBankStepOpen(false);
    setVehicleStepOpen(false);
    setHotelStepOpen(true);
    if (onClose) onClose();
  };

  const handleAddBank = () => {
    const newOption = {
      value: newBankDetails.accountNumber,
      label: `${newBankDetails.bankName} - ${newBankDetails.accountHolderName}`,
    };
    setAccountOptions((prev) => [...prev, newOption]);
    setAccountName(newOption.value);
    setNewBankDetails({
      bankName: "",
      branchName: "",
      accountHolderName: "",
      accountNumber: "",
      ifscCode: "",
      openingBalance: "",
    });
    setAddBankDialogOpen(false);
  };

  // ---- Render ----
  return (
    <>
      {/* HOTEL STEP */}
      <Dialog open={open && hotelStepOpen} onClose={onClose} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: "bold", color: "#1976d2" }}>Select Hotel Vendor</DialogTitle>
        <DialogContent>
          <Box sx={{ mb: 2 }}>
            <FormLabel sx={{ fontWeight: "bold", color: "#34495e" }}>*Vendor Type</FormLabel>
            <RadioGroup row name="vendorType" value={formik.values.vendorType} onChange={handleVendorTypeChange}>
              <FormControlLabel value="Single Vendor" control={<Radio />} label="Single Vendor" />
              <FormControlLabel value="Multiple Vendor" control={<Radio />} label="Multiple Vendor" />
            </RadioGroup>
          </Box>

          <Divider sx={{ mb: 2 }} />

          {formik.values.vendorType === "Single Vendor" ? (
            <>
              <Typography variant="body1" sx={{ fontWeight: 600, color: "#e74c3c", mb: 1 }}>
                *Hotel Vendor
              </Typography>

              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                {renderVendorSelect("vendorName", formik.values.vendorName)}
                <FormControlLabel
                  control={
                    <Checkbox
                      name="showAll"
                      checked={formik.values.showAll}
                      onChange={(e) => formik.setFieldValue("showAll", e.target.checked)}
                    />
                  }
                  label="Show All"
                />
              </Box>
            </>
          ) : (
            <>
              <Typography variant="body1" sx={{ color: "#f39c12", fontWeight: "bold", mb: 1 }}>
                Standard
              </Typography>
              <Typography variant="body2" sx={{ color: "#e74c3c", mb: 1, fontWeight: "bold" }}>
                Max Amount Limit ₹ 50,000
              </Typography>

              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Typography sx={{ fontWeight: "bold", color: "#34495e" }}>*Sikkim Resto Aritar (5N)</Typography>
                <FormControlLabel
                  control={
                    <Checkbox name="same" checked={formik.values.same} onChange={(e) => formik.setFieldValue("same", e.target.checked)} />
                  }
                  label="Same"
                />
              </Box>

              <Box sx={{ display: "flex", alignItems: "center", gap: 2, mt: 1 }}>
                {renderVendorSelect("vendorName", formik.values.vendorName)}
                <TextField
                  name="amount"
                  label="Amount"
                  value={formik.values.amount}
                  onChange={(e) => formik.setFieldValue("amount", e.target.value)}
                  type="number"
                  sx={{ width: "40%" }}
                />
              </Box>

              <FormControlLabel
                control={<Checkbox name="showAll" checked={formik.values.showAll} onChange={(e) => formik.setFieldValue("showAll", e.target.checked)} />}
                label="Show All"
                sx={{ mt: 1 }}
              />
            </>
          )}

          {/* nights / maxLimit inputs */}
          <Box sx={{ display: "flex", gap: 2, mt: 2 }}>
            <TextField
              label="Nights"
              value={formik.values.nights}
              onChange={(e) => formik.setFieldValue("nights", e.target.value)}
              type="number"
              sx={{ width: "150px" }}
            />
            <TextField
              label="Max Limit (₹)"
              value={formik.values.maxLimit}
              onChange={(e) => formik.setFieldValue("maxLimit", e.target.value)}
              type="number"
              sx={{ width: "200px" }}
            />
          </Box>

          <Box sx={{ display: "flex", justifyContent: "center", gap: 2, mt: 3 }}>
            <Button variant="contained" sx={{ background: "#90caf9", color: "#fff" }} onClick={() => formik.handleSubmit()}>
              Confirm (Hotel)
            </Button>
            <Button variant="contained" sx={{ background: "#e67e22", color: "#fff" }} onClick={onClose}>
              Cancel
            </Button>
          </Box>
        </DialogContent>
      </Dialog>

      {/* ADD VENDOR DIALOG */}
      <Dialog open={addVendorDialogOpen} onClose={() => setAddVendorDialogOpen(false)} maxWidth="md" fullWidth>
        <AssociateDetailForm
          onClose={() => setAddVendorDialogOpen(false)}
          onSuccess={(newVendor) => handleAddVendorSuccess(newVendor)}
        />
      </Dialog>

      {/* VEHICLE STEP */}
      <Dialog open={vehicleStepOpen} onClose={() => setVehicleStepOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: "bold", color: "#1976d2", textAlign: "center" }}>Vehicle Vendor</DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
            <Checkbox
              name="showAllVehicle"
              checked={vehicleVendorForm.showAllVehicle}
              onChange={(e) => setVehicleVendorForm((p) => ({ ...p, showAllVehicle: e.target.checked }))}
            />
            <Typography variant="body2" sx={{ fontWeight: "medium" }}>
              Show All
            </Typography>
          </Box>

          {renderVehicleVendorSelect()}

          <Box sx={{ mt: 2 }}>
            <TextField
              label="Amount"
              name="amount"
              value={vehicleVendorForm.amount}
              onChange={(e) => setVehicleVendorForm((p) => ({ ...p, amount: e.target.value }))}
              type="number"
              fullWidth
            />
          </Box>

          <Divider sx={{ mb: 3, mt: 2 }} />

          <Box sx={{ display: "flex", justifyContent: "center", gap: 2 }}>
            <Button variant="contained" sx={{ background: "#90caf9", color: "#fff" }} onClick={handleVehicleConfirm}>
              Confirm (Vehicle)
            </Button>
            <Button variant="contained" sx={{ background: "#e67e22", color: "#fff" }} onClick={() => setVehicleStepOpen(false)}>
              Cancel
            </Button>
          </Box>
        </DialogContent>
      </Dialog>

      {/* BANK STEP */}
      <BankDetailsDialog
        open={bankStepOpen}
        onClose={() => setBankStepOpen(false)}
        accountType={accountType}
        setAccountType={setAccountType}
        accountName={accountName}
        setAccountName={setAccountName}
        accountOptions={accountOptions}
        onAddBankOpen={() => setAddBankDialogOpen(true)}
        onConfirm={handleBankConfirm}
      />

      {/* ADD BANK */}
      <AddBankDialog
        open={addBankDialogOpen}
        onClose={() => setAddBankDialogOpen(false)}
        newBankDetails={newBankDetails}
        onNewBankChange={(field, value) => setNewBankDetails((p) => ({ ...p, [field]: value }))}
        onAddBank={handleAddBank}
      />
    </>
  );
};

export default HotelVendorDialog;
