import {createSlice,createAsyncThunk} from "@reduxjs/toolkit";

import axios from "../../utils/axios"

export const createLead = createAsyncThunk(
  'lead/createLead',
  async (data, thunkApi) => {
    try {
      const res = await axios.post('/lead/create', data);
      return res.data.data;
    } catch (err) {
      return thunkApi.rejectWithValue(
        err?.response?.data?.message || 'Failed to create Lead'
      );
    }
  }
);

export const getAllLeads = createAsyncThunk(
  'lead/getAllLeads',
  async (_, thunkApi) => {
    try {
      const res = await axios.get('/lead/getAllLead');
      return res.data.data;
    } catch (err) {
      return thunkApi.rejectWithValue(
        err?.response?.data?.message || 'Failed to view Lead'
      );
    }
  }
);


const initialState = {
    list:[],
    form:{
         fullName: "",
              mobile: "",
              alternateNumber: "",
              email: "",
              title: "",
              dob: null,
              country: "India",
              state: "",
              city: "",
              address1: "",
              address2: "",
              address3: "",
              pincode: "",
              businessType: "B2B",
              priority: "",
              source: "",
              referralBy: "",
              agentName: "",
              assignedTo: "",
              note: "",
    },
    status: 'idle',
    error: null,
    viewedLead:null,

};

export const leadSlice = createSlice({
    name:'leads',
    initialState,
    reducers:{
                   setFormField: (state, action) => {
                      const { field, value } = action.payload;
                      state.form[field] = value;
                    },
                    resetForm: (state) => {
                      state.form = initialState.form;
                    },
                    addLeads: (state, action) => {
                      state.list.push(action.payload);
                    },
                    setLeads: (state, action) => {
                      state.list = action.payload;
                    },
                    clearViewedLeads:(state)=>{
                      state.viewedDriver=null
                    },
        },

    extraReducers:(builder)=>{
        builder
        .addCase(createLead.pending,(state)=>{
            state.loading=true,
            state.error=null
        })
        .addCase(createLead.fulfilled,(state,action)=>{
            state.loading=false;
            state.error=null
        })
        .addCase(createLead.rejected,(state,action)=>{
            state.loading=false;
            state.error=action.payload;
        })
        .addCase(getAllLeads.pending, (state) => {
                state.status = 'loading';
                state.error = null;
        })
        .addCase(getAllLeads.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.list = action.payload;
        })
        .addCase(getAllLeads.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
        })

    }

})
 export const { setFormField, resetForm, addLeads , setLeads,clearViewedLeads} = leadSlice.actions;

 export default leadSlice.reducer;