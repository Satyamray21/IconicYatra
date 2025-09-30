import mongoose from "mongoose";

export const policySchema = new mongoose.Schema({
  inclusionPolicy: {
    type: [String], // or [String] if you want multiple bullet points
    default: ""
  },
  exclusionPolicy: {
    type: [String],
    default: ""
  },
  paymentPolicy: {
    type: [String],
    default: ""
  },
  cancellationPolicy: {
    type: [String],
    default: ""
  },
  termsAndConditions: {
    type: [String],
    default: ""
  }
}, { _id: false });  // _id: false so it won’t create extra _id for subdocument
