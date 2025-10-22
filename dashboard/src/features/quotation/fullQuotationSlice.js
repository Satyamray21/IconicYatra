// features/quotation/fullQuotationSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "../../utils/axios"; // your axios instance

// ================== Async Thunks ================== //

// Step 1: Create or resume quotation
export const step1CreateOrResume = createAsyncThunk(
  "fullQuotation/step1CreateOrResume",
  async (data, { rejectWithValue }) => {
    try {
      const response = await axios.post("/fullQT/step1", data);
      return response.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

// Step 2: Update stay location
export const step2Update = createAsyncThunk(
  "fullQuotation/step2Update",
  async ({ quotationId, stayLocation }, { rejectWithValue }) => {
    try {
      const response = await axios.put(`/fullQT/step2/${quotationId}`, { stayLocation });
      return response.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

// Step 3: Update itinerary
export const step3Update = createAsyncThunk(
  "fullQuotation/step3Update",
  async ({ quotationId, itinerary }, { rejectWithValue }) => {
    try {
      const response = await axios.put(`/fullQT/step3/${quotationId}`, { itinerary });
      return response.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

// Step 4: Update vehicle & policies
export const step4Update = createAsyncThunk(
  "fullQuotation/step4Update",
  async ({ quotationId, vehicleDetails, policies }, { rejectWithValue }) => {
    try {
      const response = await axios.put(`/fullQT/step4/${quotationId}`, { vehicleDetails, policies });
      return response.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

// Step 5: Update pricing
export const step5Update = createAsyncThunk(
  "fullQuotation/step5Update",
  async ({ quotationId, pricing }, { rejectWithValue }) => {
    try {
      const response = await axios.put(`/fullQT/step5/${quotationId}`, { pricing });
      return response.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

// Finalize quotation
export const finalizeQuotationApi = createAsyncThunk(
  "fullQuotation/finalize",
  async ({ quotationId }, { rejectWithValue }) => {
    try {
      const response = await axios.put(`/fullQT/finalize/${quotationId}`);
      return response.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

// ================== Slice ================== //
const initialState = {
  quotation: null,
  loading: false,
  error: null,
  quotationId: null,
};

const fullQuotationSlice = createSlice({
  name: "fullQuotation",
  initialState,
  reducers: {
    resetQuotation: (state) => {
      state.quotation = null;
      state.loading = false;
      state.error = null;
      state.quotationId = null;
    },
  },
  extraReducers: (builder) => {
    // Step 1
    builder
      .addCase(step1CreateOrResume.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(step1CreateOrResume.fulfilled, (state, action) => {
        state.loading = false;
        state.quotation = action.payload;
        state.quotationId = action.payload.quotationId;
      })
      .addCase(step1CreateOrResume.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Step 2
    builder
      .addCase(step2Update.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(step2Update.fulfilled, (state, action) => { state.loading = false; state.quotation = action.payload; })
      .addCase(step2Update.rejected, (state, action) => { state.loading = false; state.error = action.payload; });

    // Step 3
    builder
      .addCase(step3Update.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(step3Update.fulfilled, (state, action) => { state.loading = false; state.quotation = action.payload; })
      .addCase(step3Update.rejected, (state, action) => { state.loading = false; state.error = action.payload; });

    // Step 4
    builder
      .addCase(step4Update.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(step4Update.fulfilled, (state, action) => { state.loading = false; state.quotation = action.payload; })
      .addCase(step4Update.rejected, (state, action) => { state.loading = false; state.error = action.payload; });

    // Step 5
    builder
      .addCase(step5Update.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(step5Update.fulfilled, (state, action) => { state.loading = false; state.quotation = action.payload; })
      .addCase(step5Update.rejected, (state, action) => { state.loading = false; state.error = action.payload; });

    // Finalize
    builder
      .addCase(finalizeQuotationApi.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(finalizeQuotationApi.fulfilled, (state, action) => { state.loading = false; state.quotation = action.payload; })
      .addCase(finalizeQuotationApi.rejected, (state, action) => { state.loading = false; state.error = action.payload; });
  },
});

export const { resetQuotation } = fullQuotationSlice.actions;
export default fullQuotationSlice.reducer;
