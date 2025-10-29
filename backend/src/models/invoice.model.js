import mongoose from "mongoose";

const itemSchema = new mongoose.Schema({
  particulars: { type: String, required: true },
  price: { type: Number, required: true }, // entered by user
  discountPercent: { type: Number, default: 0 },
  discount: { type: Number, default: 0 },
  taxPercent: { type: Number, default: 0 },
  taxAmount: { type: Number, default: 0 },
  amount: { type: Number, required: true }, // total after tax
  basePrice: { type: Number, default: 0 }, // ✅ will be auto-calculated
});

const invoiceSchema = new mongoose.Schema(
  {
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: true,
    },
    accountType: { type: String, required: true },
    mobile: { type: String, required: true },
    billingName: { type: String, required: true },
    billingAddress: { type: String },
    gstin: { type: String },
    invoiceNo: { type: String, unique: true, required: true },
    invoiceDate: { type: Date, required: true },
    dueDate: { type: Date },
    stateOfSupply: { type: String, required: true },
    isInternational: { type: Boolean, default: false },
    withTax: { type: Boolean, default: true },
    items: [itemSchema],
    totalAmount: { type: Number, required: true },
    receivedAmount: { type: Number, default: 0 },
    balanceAmount: { type: Number, default: 0 },
    paymentMode: { type: String, required: true },
    referenceNo: { type: String },
    additionalNote: { type: String },
  },
  { timestamps: true }
);

/* ✅ Auto-calculate basePrice for each item */
invoiceSchema.pre("save", function (next) {
  if (this.items && this.items.length > 0) {
    this.items = this.items.map((item) => {
      const itemObj = item.toObject ? item.toObject() : item;
      let basePrice = 0;

      if (this.withTax) {
        // withTax → base = amount - price
        basePrice = Number((itemObj.amount - itemObj.price).toFixed(2));
      } else {
        // withoutTax → base = price
        basePrice = Number((itemObj.price).toFixed(2));
      }

      return { ...itemObj, basePrice };
    });
  }
  next();
});

export default mongoose.model("Invoice", invoiceSchema);
