import mongoose from "mongoose";

const receivedVoucherSchema = new mongoose.Schema(
  {
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: true,
    },

    // Which quotation type this payment belongs to
    quotationType: {
      type: String,
      enum: ["hotel", "vehicle", "flight", "custom", "full", "quick"],
      required: false,
    },

    // Quotation ID for ANY model
    quotationId: {
      type: mongoose.Schema.Types.ObjectId,
      required: false,
    },

    paymentType: {
      type: String,
      enum: ["Receive Voucher", "Payment Voucher"],
      default: "Receive Voucher",
    },

    date: {
      type: Date,
      required: true,
    },

    paymentScreenshot: {
      type: String,
    },

    accountType: {
      type: String,
      required: true,
    },

    partyName: {
      type: String,
      required: true,
    },

    paymentMode: {
      type: String,
      required: true,
    },

    referenceNumber: {
      type: String,
    },

    particulars: {
      type: String,
      required: true,
    },

    amount: {
      type: Number,
      required: true,
    },

    invoice: {
      type: String,
      unique: true,
    },

    drCr: {
      type: String,
      enum: ["Dr", "Cr"],
    },

    receiptNumber: {
      type: Number,
      required: true,
      unique: true,
    },

    invoiceId: {
      type: String,
      required: true,
      unique: true,
    },

    totalPaidTillDate: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Auto Dr/Cr
receivedVoucherSchema.pre("save", function (next) {
  this.drCr =
    this.paymentType === "Receive Voucher" ? "Cr" : "Dr";
  next();
});

// Auto-update totalPaidTillDate
receivedVoucherSchema.post("save", async function (doc, next) {
  try {
    const Model = mongoose.model("ReceivedVoucher");

    if (doc.quotationId) {
      const summary = await Model.aggregate([
        { $match: { quotationId: doc.quotationId } },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]);

      const totalPaid = summary[0]?.total || 0;

      await Model.updateMany(
        { quotationId: doc.quotationId },
        { $set: { totalPaidTillDate: totalPaid } }
      );

      return next();
    }

    const summary = await Model.aggregate([
      { $match: { partyName: doc.partyName, companyId: doc.companyId } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);

    const totalPaid = summary[0]?.total || 0;

    await Model.updateMany(
      { partyName: doc.partyName, companyId: doc.companyId },
      { $set: { totalPaidTillDate: totalPaid } }
    );

    next();
  } catch (err) {
    console.error("Error auto-updating totals:", err);
    next(err);
  }
});

const ReceivedVoucher = mongoose.model("ReceivedVoucher", receivedVoucherSchema);
export default ReceivedVoucher;
