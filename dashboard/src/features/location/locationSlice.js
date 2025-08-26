// src/features/location/locationSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from "../../utils/axios";

export const fetchStates = createAsyncThunk('location/fetchStates', async () => {
    const res = await axios.get('state/states');
    
    return res.data; // make sure response format matches
});

export const fetchCities = createAsyncThunk('location/fetchCities', async (stateName) => {
    const encodedState = encodeURIComponent(stateName);
    const res = await axios.get(`state/cities/${encodedState}`);
   
    return res.data; 
});
export const fetchCountries = createAsyncThunk(
  "location/fetchCountries",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axios.get("/location/countries");
      return res.data.countries; // ✅ returns array of country names
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch countries");
    }
  }
);

// ✅ Fetch states by country
export const fetchStatesByCountry = createAsyncThunk(
  "location/fetchStatesByCountry",
  async (country, { rejectWithValue }) => {
    try {
      const res = await axios.get(`/location/states/${country}`);
      return res.data.states.map((s) => s.name); // ✅ returns array of state names only
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch states");
    }
  }
);
const locationSlice = createSlice({
    name: 'location',
    initialState: {
        states: [],
        cities: [],
        countries: [],
         internationalStates: [],
        loading: false,
        error: null,
    },
    reducers: {
        clearCities: (state) => {
            state.cities = [];
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchStates.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchStates.fulfilled, (state, action) => {
                state.states = action.payload;
                state.loading = false;
            })
            .addCase(fetchStates.rejected, (state, action) => {
                state.error = action.error.message;
                state.loading = false;
            })

            .addCase(fetchCities.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchCities.fulfilled, (state, action) => {
                state.cities = action.payload;
                state.loading = false;
            })
            .addCase(fetchCities.rejected, (state, action) => {
                state.error = action.error.message;
                state.loading = false;
            })
            .addCase(fetchCountries.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCountries.fulfilled, (state, action) => {
        state.loading = false;
        state.countries = action.payload;
      })
      .addCase(fetchCountries.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // ✅ Fetch States
      .addCase(fetchStatesByCountry.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchStatesByCountry.fulfilled, (state, action) => {
        state.loading = false;
        state.internationalStates = action.payload;
      })
      .addCase(fetchStatesByCountry.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
    },
});

export const { clearCities } = locationSlice.actions;
export default locationSlice.reducer;