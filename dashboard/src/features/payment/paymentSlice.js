import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "../../utils/axios"; // your custom axios instance

// Fetch all vouchers
export const fetchAllVouchers = createAsyncThunk("voucher/fetchAll", async () => {
  const res = await axios.get("/voucher");
  return res.data.data;
});

// Fetch single voucher by ID
export const fetchVoucherById = createAsyncThunk("voucher/fetchById", async (id) => {
  const res = await axios.get(`/voucher/${id}`);
  return res.data.data;
});

// Create new voucher
export const createVoucher = createAsyncThunk("voucher/create", async (voucherData) => {
  const res = await axios.post("/voucher", voucherData);
  return res.data.data;
});

// Update voucher
export const updateVoucher = createAsyncThunk("voucher/update", async ({ id, data }) => {
  const res = await axios.put(`/voucher/${id}`, data);
  return res.data.data;
});

// Delete voucher
export const deleteVoucher = createAsyncThunk("voucher/delete", async (id) => {
  await axios.delete(`/voucher/${id}`);
  return id;
});

const voucherSlice = createSlice({
  name: "voucher",
  initialState: {
    list: [],
    selected: null,
    loading: false,
    error: null,
  },
  reducers: {
    clearSelectedVoucher: (state) => {
      state.selected = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Get All
      .addCase(fetchAllVouchers.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchAllVouchers.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload;
      })
      .addCase(fetchAllVouchers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })

      // Get By ID
      .addCase(fetchVoucherById.fulfilled, (state, action) => {
        state.selected = action.payload;
      })

      // Create
      .addCase(createVoucher.fulfilled, (state, action) => {
        state.list.unshift(action.payload);
      })

      // Update
      .addCase(updateVoucher.fulfilled, (state, action) => {
        const index = state.list.findIndex(item => item._id === action.payload._id);
        if (index !== -1) {
          state.list[index] = action.payload;
        }
      })

      // Delete
      .addCase(deleteVoucher.fulfilled, (state, action) => {
        state.list = state.list.filter(item => item._id !== action.payload);
      });
  },
});

export const { clearSelectedVoucher } = voucherSlice.actions;
export default voucherSlice.reducer;
