import mongoose from "mongoose";

const marginSchema = new mongoose.Schema(
  {
    standard: {
      marginPercent: { type: Number, default: 0 },
      marginAmount: { type: Number, default: 0 },
    },
    deluxe: {
      marginPercent: { type: Number, default: 0 },
      marginAmount: { type: Number, default: 0 },
    },
    superior: {
      marginPercent: { type: Number, default: 0 },
      marginAmount: { type: Number, default: 0 },
    },
  },
  { _id: false }
);

const discountSchema = new mongoose.Schema(
  {
    standardDiscountInRupees: { type: Number, default: 0 },
    standardDiscountPercent: { type: Number, default: 0 },
    deluxeDiscountInRupees: { type: Number, default: 0 },
    deluxeDiscountPercent: { type: Number, default: 0 },
    superiorDiscountInRupees: { type: Number, default: 0 },
    superiorDiscountPercent: { type: Number, default: 0 },
  },
  { _id: false }
);

const taxSchema = new mongoose.Schema(
  {
    gstOn: {
      type: String,
      enum: ["Full", "Margin", "None"],
      default: "Margin",
    },
    applyGST: { type: Boolean, default: false },
  },
  { _id: false }
);

export const pricingSchema = new mongoose.Schema(
  {
    companyMargin: marginSchema,
    agentMargin: marginSchema,
    discount: discountSchema,
    taxes: taxSchema,
  },
  { _id: false }
);
