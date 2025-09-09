import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
} from "@mui/material";

const FinalizeDialog = ({ open, onClose, vendor, setVendor, onConfirm }) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ color: "primary.main" }}>Vehicle Vendor</DialogTitle>
      <DialogContent>
        <FormControl fullWidth margin="normal">
          <InputLabel required>Vehicle Vendor</InputLabel>
          <Select
            value={vendor}
            onChange={(e) => setVendor(e.target.value)}
            displayEmpty
          >
            <MenuItem value="Default Vehicle Vendor">
              Default Vehicle Vendor
            </MenuItem>
            <MenuItem value="Sukhbir Lepcha">Sukhbir Lepcha</MenuItem>
            <MenuItem value="Ketan Bhikhu">Ketan Bhikhu</MenuItem>
          </Select>
        </FormControl>
      </DialogContent>
      <DialogActions>
        <Button
          onClick={onConfirm}
          variant="contained"
          disabled={!vendor}
          sx={{ bgcolor: "skyblue", "&:hover": { bgcolor: "deepskyblue" } }}
        >
          Confirm
        </Button>
        <Button
          onClick={onClose}
          variant="contained"
          sx={{ bgcolor: "darkorange", "&:hover": { bgcolor: "orange" } }}
        >
          Cancel
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default FinalizeDialog;