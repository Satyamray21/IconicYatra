import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "../../utils/axios"; // custom axios instance

// ======================================================
// FETCH ALL VOUCHERS
// ======================================================
export const fetchAllVouchers = createAsyncThunk("voucher/fetchAll", async () => {
  const res = await axios.get("/payment");
  return res.data.data;
});

// ======================================================
// FETCH SINGLE VOUCHER BY ID
// ======================================================
export const fetchVoucherById = createAsyncThunk("voucher/fetchById", async (id) => {
  const res = await axios.get(`/payment/${id}`);
  return res.data.data;
});

// ======================================================
// CREATE VOUCHER
// ======================================================
export const createVoucher = createAsyncThunk("voucher/create", async (voucherData) => {
  const res = await axios.post("/payment", voucherData);
  return res.data.data;
});

// ======================================================
// UPDATE VOUCHER
// ======================================================
export const updateVoucher = createAsyncThunk(
  "voucher/update",
  async ({ id, data }) => {
    const res = await axios.put(`/payment/${id}`, data);
    return res.data.data;
  }
);

// ======================================================
// DELETE VOUCHER
// ======================================================
export const deleteVoucher = createAsyncThunk("voucher/delete", async (id) => {
  await axios.delete(`/payment/${id}`);
  return id;
});

// ======================================================
// 🔥 NEW — GET PAYMENT HISTORY (Transaction List)
// ======================================================
export const fetchPaymentHistory = createAsyncThunk(
  "voucher/history",
  async ({ type, quotationId }) => {
    const res = await axios.get(`/payment/history/${type}/${quotationId}`);
    return res.data.data;
  }
);

// ======================================================
// 🔥 NEW — GET PAYMENT SUMMARY (Total Paid)
// ======================================================
export const fetchPaymentSummary = createAsyncThunk(
  "voucher/summary",
  async ({ type, quotationId }) => {
    const res = await axios.get(`/payment/summary/${type}/${quotationId}`);
    return res.data;
  }
);

// ======================================================
// SLICE
// ======================================================
const voucherSlice = createSlice({
  name: "voucher",
  initialState: {
    list: [],
    selected: null,
    paymentHistory: [],
    paymentSummary: null,
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

      // ================================
      // GET ALL
      // ================================
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

      // ================================
      // GET BY ID
      // ================================
      .addCase(fetchVoucherById.fulfilled, (state, action) => {
        state.selected = action.payload;
      })

      // ================================
      // CREATE
      // ================================
      .addCase(createVoucher.fulfilled, (state, action) => {
        state.list.unshift(action.payload);
      })

      // ================================
      // UPDATE
      // ================================
      .addCase(updateVoucher.fulfilled, (state, action) => {
        const index = state.list.findIndex((item) => item._id === action.payload._id);
        if (index !== -1) {
          state.list[index] = action.payload;
        }
      })

      // ================================
      // DELETE
      // ================================
      .addCase(deleteVoucher.fulfilled, (state, action) => {
        state.list = state.list.filter((item) => item._id !== action.payload);
      })

      // ================================
      // PAYMENT HISTORY
      // ================================
      .addCase(fetchPaymentHistory.fulfilled, (state, action) => {
        state.paymentHistory = action.payload;
      })

      // ================================
      // PAYMENT SUMMARY
      // ================================
      .addCase(fetchPaymentSummary.fulfilled, (state, action) => {
        state.paymentSummary = action.payload;
      });
  },
});

export const { clearSelectedVoucher } = voucherSlice.actions;
export default voucherSlice.reducer;
