import { configureStore } from '@reduxjs/toolkit';
import LeadReducer from "../features/leads/leadSlice"
export const store = configureStore({
  reducer: {
    leads:LeadReducer,
  },
});

export default store;
