import { configureStore } from '@reduxjs/toolkit';
import LeadReducer from "../features/leads/leadSlice"
import StaffReducer from "../features/staff/staffSlice"
import AssociateReducer from "../features/associate/associateSlice"
import paymentReducer from "../features/payment/paymentSlice"
import locationReducer from "../features/location/locationSlice"
import vehicleQuotationReducer from "../features/quotation/vehicleQuotationSlice"
export const store = configureStore({
  reducer: {
    leads:LeadReducer,
    staffs:StaffReducer,
    associate:AssociateReducer,
    payment:paymentReducer,
    location: locationReducer,
    vehicleQuotation:vehicleQuotationReducer,

  },
});

export default store;
