import mongoose from "mongoose";
const itemSchema = new mongoose.Schema({
     particulars: { type: String, required: true },
    price: { type: Number, required: true },
    discountPercent: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    taxPercent: { type: Number, default: 0 },
    taxAmount: { type: Number, default: 0 },
    amount: { type: Number, required: true },
});
const invoiceSchema = new mongoose.Schema(
    {
        companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: true,
    },
        accountType: { type: String, required: true },
        partyName: { type: String, required: true },
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
    }, { timestamps: true }

);


export default mongoose.model("Invoice", invoiceSchema);
