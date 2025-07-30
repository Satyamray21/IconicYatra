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

export const fetchLeadsReports = createAsyncThunk(
  "leadsReport/fetchLeadsReports",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axios.get("/lead/get-Count");
      return data.data; 
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to fetch lead reports");
    }
  }
);
export const changeLeadStatus = createAsyncThunk(
  'leads/changeLeadStatus',
  async ({ leadId, status }, { rejectWithValue }) => {
    try {
      const response = await axios.patch(`/lead/change-status/${leadId}`, { status });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to update lead status'
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
    
    loading: false,
    success: false,
    error: null,
    updatedLead: null,
    message: '',
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
                    resetLeadStatus(state) {
      state.loading = false;
      state.success = false;
      state.error = null;
      state.updatedLead = null;
      state.message = '';
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
        .addCase(fetchLeadsReports.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchLeadsReports.fulfilled, (state, action) => {
        state.loading = false;
        state.reports = action.payload;
      })
      .addCase(fetchLeadsReports.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(changeLeadStatus.pending, (state) => {
        state.loading = true;
        state.success = false;
        state.error = null;
        state.message = '';
      })
      .addCase(changeLeadStatus.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.updatedLead = action.payload.data;
        state.message = action.payload.message;
      })
      .addCase(changeLeadStatus.rejected, (state, action) => {
        state.loading = false;
        state.success = false;
        state.error = action.payload;
        state.message = '';
      });


    }

})
 export const { setFormField, resetForm, addLeads , setLeads,clearViewedLeads,resetLeadStatus} = leadSlice.actions;

 export default leadSlice.reducer;