import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "../../utils/axios";

// ========== CREATE VEHICLE QUOTATION ==========
export const createVehicleQuotation = createAsyncThunk(
  "vehicleQuotation/createVehicleQuotation",
  async (data, thunkApi) => {
    try {
      const res = await axios.post("/vehicleQT", data);
      return res.data.data;
    } catch (err) {
      return thunkApi.rejectWithValue(
        err?.response?.data?.message || "Failed to create Vehicle Quotation"
      );
    }
  }
);

// ========== GET ALL VEHICLE QUOTATIONS ==========
export const getAllVehicleQuotations = createAsyncThunk(
  "vehicleQuotation/getAllVehicleQuotations",
  async (_, thunkApi) => {
    try {
      const res = await axios.get("/vehicleQT");
      return res.data.data;
    } catch (err) {
      return thunkApi.rejectWithValue(
        err?.response?.data?.message || "Failed to fetch Vehicle Quotations"
      );
    }
  }
);

// ========== GET VEHICLE QUOTATION BY ID ==========
export const getVehicleQuotationById = createAsyncThunk(
  "vehicleQuotation/getVehicleQuotationById",
  async (vehicleQuotationId, thunkApi) => {
    try {
      const res = await axios.get(`/vehicleQT/${vehicleQuotationId}`);
      return res.data.data;
    } catch (err) {
      return thunkApi.rejectWithValue(
        err?.response?.data?.message || "Vehicle Quotation not found"
      );
    }
  }
);

// ========== UPDATE VEHICLE QUOTATION ==========
export const updateVehicleQuotation = createAsyncThunk(
  "vehicleQuotation/updateVehicleQuotation",
  async ({ vehicleQuotationId, data }, thunkApi) => {
    try {
      const res = await axios.put(`/vehicleQT/${vehicleQuotationId}`, data);
      return res.data.data;
    } catch (err) {
      return thunkApi.rejectWithValue(
        err?.response?.data?.message || "Failed to update Vehicle Quotation"
      );
    }
  }
);

// ========== DELETE VEHICLE QUOTATION ==========
export const deleteVehicleQuotation = createAsyncThunk(
  "vehicleQuotation/deleteVehicleQuotation",
  async (vehicleQuotationId, thunkApi) => {
    try {
      await axios.delete(`/vehicleQT/${vehicleQuotationId}`);
      return vehicleQuotationId;
    } catch (err) {
      return thunkApi.rejectWithValue(
        err?.response?.data?.message || "Failed to delete Vehicle Quotation"
      );
    }
  }
);

// ========== INITIAL STATE ==========
const initialState = {
  list: [],
  form: {
    clientName: "",
    vehicleType: "",
    tripType: "",
    noOfDays: "",
    perDayCost: "",
    totalCost: "",
    pickupDate: null,
    pickupTime: "",
    pickupLocation: "",
    dropDate: null,
    dropTime: "",
    dropLocation: "",
    discount: "",
    gstOn: "",
    applyGst: "",
    contactDetails: "",
  },
  loading: false,
  success: false,
  error: null,
  message: "",
  viewedVehicleQuotation: null,
  updatedVehicleQuotation: null,
};

// ========== SLICE ==========
export const vehicleQuotationSlice = createSlice({
  name: "vehicleQuotation",
  initialState,
  reducers: {
    setFormField: (state, action) => {
      const { field, value } = action.payload;
      state.form[field] = value;
    },
    resetForm: (state) => {
      state.form = initialState.form;
    },
    addVehicleQuotation: (state, action) => {
      state.list.push(action.payload);
    },
    setVehicleQuotations: (state, action) => {
      state.list = action.payload;
    },
    clearViewedVehicleQuotation: (state) => {
      state.viewedVehicleQuotation = null;
    },
    resetVehicleQuotationStatus: (state) => {
      state.loading = false;
      state.success = false;
      state.error = null;
      state.updatedVehicleQuotation = null;
      state.message = "";
    },
  },
  extraReducers: (builder) => {
    builder
      // CREATE VEHICLE QUOTATION
      .addCase(createVehicleQuotation.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createVehicleQuotation.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.list.unshift(action.payload);
        state.message = "Vehicle quotation created successfully";
      })
      .addCase(createVehicleQuotation.rejected, (state, action) => {
        state.loading = false;
        state.success = false;
        state.error = action.payload;
      })

      // GET ALL VEHICLE QUOTATIONS
      .addCase(getAllVehicleQuotations.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAllVehicleQuotations.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload;
      })
      .addCase(getAllVehicleQuotations.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // GET VEHICLE QUOTATION BY ID
      .addCase(getVehicleQuotationById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      // In your extraReducers for getVehicleQuotationById.fulfilled
.addCase(getVehicleQuotationById.fulfilled, (state, action) => {
  state.loading = false;
  // Transform the API response to match your expected structure
  const transformedData = {
    ...action.payload,
    vehicle: {
      ...action.payload.vehicle,
      pickupDrop: action.payload.vehicle.pickupDropDetails
    }
  };
  state.viewedVehicleQuotation = transformedData;
})
      .addCase(getVehicleQuotationById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // UPDATE VEHICLE QUOTATION
      .addCase(updateVehicleQuotation.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateVehicleQuotation.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.updatedVehicleQuotation = action.payload;
        state.list = state.list.map((quotation) =>
          quotation.vehicleQuotationId === action.payload.vehicleQuotationId
            ? action.payload
            : quotation
        );
        if (
          state.viewedVehicleQuotation?.vehicleQuotationId ===
          action.payload.vehicleQuotationId
        ) {
          state.viewedVehicleQuotation = action.payload;
        }
        state.message = "Vehicle quotation updated successfully";
      })
      .addCase(updateVehicleQuotation.rejected, (state, action) => {
        state.loading = false;
        state.success = false;
        state.error = action.payload;
      })

      // DELETE VEHICLE QUOTATION
      .addCase(deleteVehicleQuotation.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteVehicleQuotation.fulfilled, (state, action) => {
        state.loading = false;
        state.list = state.list.filter(
          (quotation) => quotation.vehicleQuotationId !== action.payload
        );
        state.message = "Vehicle quotation deleted successfully";
      })
      .addCase(deleteVehicleQuotation.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const {
  setFormField,
  resetForm,
  addVehicleQuotation,
  setVehicleQuotations,
  clearViewedVehicleQuotation,
  resetVehicleQuotationStatus,
} = vehicleQuotationSlice.actions;

export default vehicleQuotationSlice.reducer;
