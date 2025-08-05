import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "../../utils/axios"; // your axios instance

// Fetch all associates
export const fetchAllAssociates = createAsyncThunk("associate/fetchAll", async () => {
  const res = await axios.get("/associate");
  return res.data;
});

// Fetch single associate by ID
export const fetchAssociateById = createAsyncThunk("associate/fetchById", async (id) => {
  const res = await axios.get(`/associate/${id}`);
  return res.data;
});

// Create new associate
export const createAssociate = createAsyncThunk("associate/create", async (associateData) => {
  const res = await axios.post("/associate", associateData);
  return res.data;
});

// Update associate
export const updateAssociate = createAsyncThunk("associate/update", async ({ id, data }) => {
  const res = await axios.put(`/associate/${id}`, data);
  return res.data;
});

// Delete associate
export const deleteAssociate = createAsyncThunk("associate/delete", async (id) => {
  await axios.delete(`/associate/${id}`);
  return id;
});

const associateSlice = createSlice({
  name: "associate",
  initialState: {
    list: [],
    selected: null,
    loading: false,
    error: null,
  },
  reducers: {
    clearSelectedAssociate: (state) => {
      state.selected = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllAssociates.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchAllAssociates.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload;
      })
      .addCase(fetchAllAssociates.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(fetchAssociateById.fulfilled, (state, action) => {
        state.selected = action.payload;
      })
      .addCase(createAssociate.fulfilled, (state, action) => {
        state.list.unshift(action.payload);
      })
      .addCase(updateAssociate.fulfilled, (state, action) => {
        const idx = state.list.findIndex(item => item._id === action.payload._id);
        if (idx !== -1) state.list[idx] = action.payload;
      })
      .addCase(deleteAssociate.fulfilled, (state, action) => {
        state.list = state.list.filter(item => item._id !== action.payload);
      });
  },
});

export const { clearSelectedAssociate } = associateSlice.actions;
export default associateSlice.reducer;
