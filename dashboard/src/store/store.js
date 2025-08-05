import { configureStore } from '@reduxjs/toolkit';
import LeadReducer from "../features/leads/leadSlice"
import StaffReducer from "../features/staff/staffSlice"
import AssociateReducer from "../features/associate/associateSlice"
export const store = configureStore({
  reducer: {
    leads:LeadReducer,
    staffs:StaffReducer,
    associate:AssociateReducer,

  },
});

export default store;
