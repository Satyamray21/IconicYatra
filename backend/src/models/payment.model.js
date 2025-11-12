// models/payment.model.js
import mongoose from "mongoose";

const receivedVoucherSchema = new mongoose.Schema(
  {
    companyId: { type: mongoose.Schema.Types.ObjectId, ref: "Company", required: true },
    paymentType: {
      type: String,
      enum: ["Receive Voucher", "Payment Voucher"],
      default: "Receive Voucher",
    },
    date: { type: Date, required: true },
    accountType: { type: String, required: true },
    partyName: { type: String, required: true, index: true },
    paymentMode: { type: String, required: true },
    referenceNumber: String,
    particulars: { type: String, required: true },
    paymentScreenshot: String,

    totalCost: { type: Number, default: 0 },
    remainingAmount: { type: Number, default: 0 },
    amount: { type: Number, required: true },
    totalPaidTillDate: { type: Number, default: 0 },

    invoice: { type: String, unique: true },
    receiptNumber: { type: Number, required: true, unique: true },
    invoiceId: { type: String, required: true, unique: true },
    drCr: { type: String, enum: ["Dr", "Cr"] },
  },
  { timestamps: true }
);

// Automatically set Dr/Cr
receivedVoucherSchema.pre("save", function (next) {
  this.drCr = this.paymentType === "Receive Voucher" ? "Cr" : "Dr";
  next();
});

// Auto-update totalPaidTillDate & remainingAmount
receivedVoucherSchema.post("save", async function (doc, next) {
  try {
    const Model = mongoose.model("ReceivedVoucher");
    const totalPaid = await Model.aggregate([
      { $match: { partyName: doc.partyName, companyId: doc.companyId } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);

    const totalPaidTillDate = totalPaid[0]?.total || 0;
    const remainingAmount = Math.max((doc.totalCost || 0) - totalPaidTillDate, 0);

    await Model.updateMany(
      { partyName: doc.partyName, companyId: doc.companyId },
      { $set: { totalPaidTillDate, remainingAmount } }
    );
    next();
  } catch (err) {
    console.error("Error updating totals:", err);
    next(err);
  }
});

const ReceivedVoucher = mongoose.model("ReceivedVoucher", receivedVoucherSchema);
export default ReceivedVoucher;
