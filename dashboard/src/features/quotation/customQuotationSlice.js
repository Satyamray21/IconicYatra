import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "../../utils/axios";

// -------------------- Thunks --------------------

// Create new quotation
export const createCustomQuotation = createAsyncThunk(
  "customQuotation/create",
  async (formData, { rejectWithValue }) => {
    try {
      const res = await axios.post("/customQT/", formData);
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Create failed");
    }
  }
);

// Get all quotations
export const getAllCustomQuotations = createAsyncThunk(
  "customQuotation/getAll",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axios.get("/customQT");
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Fetch failed");
    }
  }
);

// Get single quotation by ID
export const getCustomQuotationById = createAsyncThunk(
  "customQuotation/getById",
  async (quotationId, { rejectWithValue }) => {
    try {
      const res = await axios.get(`/customQT/${quotationId}`);
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Fetch failed");
    }
  }
);

// Update full quotation
export const updateCustomQuotation = createAsyncThunk(
  "customQuotation/update",
  async ({ id, formData }, { rejectWithValue }) => {
    try {
      const res = await axios.put(`/customQT/${id}`, formData);
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Update failed");
    }
  }
);

// -------------------- New Step-wise Update --------------------
// customQuotationSlice.js - Update the updateQuotationStep thunk
// -------------------- New Step-wise Update --------------------
export const updateQuotationStep = createAsyncThunk(
  "customQuotation/updateStep",
  async ({ quotationId, stepNumber, stepData }, { rejectWithValue }) => {
    try {
      console.log("🔄 Redux: Sending update request", { 
        quotationId, 
        stepNumber, 
        stepDataType: typeof stepData,
        isFormData: stepData instanceof FormData
      });

      let requestData;
      let config = {};

      if (stepData instanceof FormData) {
        // For file uploads - append to existing FormData
        stepData.append('quotationId', quotationId);
        stepData.append('stepNumber', stepNumber.toString());
        requestData = stepData;
        config.headers = {
          'Content-Type': 'multipart/form-data',
        };
      } else {
        // For regular data - create new object
        requestData = {
          quotationId,
          stepNumber,
          stepData
        };
      }

      console.log("📦 Redux: Final request data:", requestData);
      
      const res = await axios.post("/customQT/update-step", requestData, config);
      console.log("✅ Redux: Update successful");
      return res.data.data;
    } catch (err) {
      console.error("❌ Redux: Step update failed:", err);
      console.error("❌ Error response:", err.response?.data);
      return rejectWithValue(err.response?.data?.message || "Step update failed");
    }
  }
);

// Delete quotation
export const deleteCustomQuotation = createAsyncThunk(
  "customQuotation/delete",
  async (id, { rejectWithValue }) => {
    try {
      const res = await axios.delete(`/customQT/${id}`);
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Delete failed");
    }
  }
);

// -------------------- Slice --------------------
const customQuotationSlice = createSlice({
  name: "customQuotation",
  initialState: {
    quotations: [],
    selectedQuotation: null,
    loading: false,
    error: null,
    searchResult: null,
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSearchResult: (state) => {
      state.searchResult = null;
    },
  },
  extraReducers: (builder) => {
    // Create
    builder.addCase(createCustomQuotation.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(createCustomQuotation.fulfilled, (state, action) => {
      state.loading = false;
      state.quotations.push(action.payload);
    });
    builder.addCase(createCustomQuotation.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
    });

    // Get All
    builder.addCase(getAllCustomQuotations.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(getAllCustomQuotations.fulfilled, (state, action) => {
      state.loading = false;
      state.quotations = action.payload;
    });
    builder.addCase(getAllCustomQuotations.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
    });

    // Get By Id
    builder.addCase(getCustomQuotationById.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(getCustomQuotationById.fulfilled, (state, action) => {
      state.loading = false;
      state.selectedQuotation = action.payload;
    });
    builder.addCase(getCustomQuotationById.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
    });

    // Full Update
    builder.addCase(updateCustomQuotation.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(updateCustomQuotation.fulfilled, (state, action) => {
      state.loading = false;
      const idx = state.quotations.findIndex(
        (q) => q._id === action.payload._id
      );
      if (idx !== -1) state.quotations[idx] = action.payload;
      if (state.selectedQuotation?._id === action.payload._id) {
        state.selectedQuotation = action.payload;
      }
    });
    builder.addCase(updateCustomQuotation.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
    });

    // Step-wise Update
    builder.addCase(updateQuotationStep.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(updateQuotationStep.fulfilled, (state, action) => {
      state.loading = false;
      const idx = state.quotations.findIndex(
        (q) => q._id === action.payload._id
      );
      if (idx !== -1) state.quotations[idx] = action.payload;
      if (state.selectedQuotation?._id === action.payload._id) {
        state.selectedQuotation = action.payload;
      }
    });
    builder.addCase(updateQuotationStep.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
    });

    // Delete
    builder.addCase(deleteCustomQuotation.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(deleteCustomQuotation.fulfilled, (state, action) => {
      state.loading = false;
      state.quotations = state.quotations.filter(
        (q) => q._id !== action.payload._id
      );
      if (state.selectedQuotation?._id === action.payload._id) {
        state.selectedQuotation = null;
      }
    });
    builder.addCase(deleteCustomQuotation.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
    });
  },
});

export const { clearError, clearSearchResult } = customQuotationSlice.actions;
export default customQuotationSlice.reducer;
