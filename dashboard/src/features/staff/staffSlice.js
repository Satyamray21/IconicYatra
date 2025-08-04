import {createSlice,createAsyncThunk} from "@reduxjs/toolkit";

import axios from "../../utils/axios";


export const fetchAllStaff = createAsyncThunk("staff/fetchAll", async () => {
  const res = await axios.get("/staff");
  return res.data.data;
});

export const fetchStaffById = createAsyncThunk("staff/fetchById", async (id) => {
  const res = await axios.get(`/staff/${id}`);
  return res.data.data;
});

export const createStaff = createAsyncThunk("staff/create", async (staffData) => {
  const res = await axios.post("/staff", staffData);
  return res.data.data;
});

export const updateStaff = createAsyncThunk("staff/update", async ({ id, data }) => {
  const res = await axios.put(`/api/v1/staff/${id}`, data);
  return res.data.data;
});

export const deleteStaff = createAsyncThunk("staff/delete", async (id) => {
  await axios.delete(`/api/v1/staff/${id}`);
  return id;
});

const staffSlice = createSlice({
  name: "staff",
  initialState: {
    list: [],
    selected: null,
    loading: false,
    error: null,
  },
  reducers: {
    clearSelectedStaff: (state) => {
      state.selected = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllStaff.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchAllStaff.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload;
      })
      .addCase(fetchAllStaff.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(fetchStaffById.fulfilled, (state, action) => {
        state.selected = action.payload;
      })
      .addCase(createStaff.fulfilled, (state, action) => {
        state.list.push(action.payload);
      })
      .addCase(updateStaff.fulfilled, (state, action) => {
        const idx = state.list.findIndex(staff => staff._id === action.payload._id);
        if (idx !== -1) state.list[idx] = action.payload;
      })
      .addCase(deleteStaff.fulfilled, (state, action) => {
        state.list = state.list.filter(staff => staff._id !== action.payload);
      });
  }
});

export const { clearSelectedStaff } = staffSlice.actions;
export default staffSlice.reducer;
