import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "../../utils/axios";


/**
 * Fetch all countries
 */
export const fetchCountries = createAsyncThunk(
  "countryStateAndCity/fetchCountries",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axios.get(`countryStateAndCity/countries`);
      return data.countries;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

/**
 * Fetch states by country name
 */
export const fetchStatesByCountry = createAsyncThunk(
  "countryStateAndCity/fetchStatesByCountry",
  async (countryName, { rejectWithValue }) => {
    try {
      const { data } = await axios.get(`countryStateAndCity/states/${countryName}`);
      return data.states;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

/**
 * Fetch cities by country name and state name
 */
export const fetchCitiesByState = createAsyncThunk(
  "countryStateAndCity/fetchCitiesByState",
  async ({ countryName, stateName }, { rejectWithValue }) => {
    try {
      const { data } = await axios.get(`countryStateAndCity/cities/${countryName}/${stateName}`);
      return data.cities;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const countryStateAndCitySlice = createSlice({
  name: "countryStateAndCity",
  initialState: {
    countries: [],
    states: [],
    cities: [],
    loading: false,
    error: null,
  },
  reducers: {
    clearStates: (state) => {
      state.states = [];
    },
    clearCities: (state) => {
      state.cities = [];
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Countries
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

      // Fetch States
      .addCase(fetchStatesByCountry.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchStatesByCountry.fulfilled, (state, action) => {
        state.loading = false;
        state.states = action.payload;
      })
      .addCase(fetchStatesByCountry.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch Cities
      .addCase(fetchCitiesByState.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCitiesByState.fulfilled, (state, action) => {
        state.loading = false;
        state.cities = action.payload;
      })
      .addCase(fetchCitiesByState.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearStates, clearCities } = countryStateAndCitySlice.actions;

export default countryStateAndCitySlice.reducer;
