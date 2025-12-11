// models/QuotationPaymentLink.js
import mongoose from "mongoose";

const quotationPaymentLinkSchema = new mongoose.Schema({
  // Reference to the payment voucher
  voucherId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "ReceivedVoucher",
    required: true,
    index: true
  },
  
  // Reference to quotation (can be any of the 6 types)
  quotationId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    index: true
  },
  
  // Quotation type (to know which collection to query)
  quotationType: {
    type: String,
    enum: ["Hotel", "Quick", "Full", "Vehicle", "Custom", "Flight"],
    required: true,
    index: true
  },
  
  // Quotation reference number for display
  quotationReference: {
    type: String,
    required: true,
    index: true
  },
  
  // Amount allocated from this voucher to this quotation
  allocatedAmount: {
    type: Number,
    required: true,
    min: 0
  },
  
  // Description of this allocation
  description: {
    type: String,
    default: ""
  },
  
  // Company reference
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Company",
    required: true
  }
}, {
  timestamps: true
});

// Compound index for efficient queries
quotationPaymentLinkSchema.index({ voucherId: 1, quotationId: 1 }, { unique: true });

export const QuotationPaymentLink = mongoose.model("QuotationPaymentLink", quotationPaymentLinkSchema);