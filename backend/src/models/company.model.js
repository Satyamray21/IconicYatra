
import mongoose from "mongoose";

const companySchema = new mongoose.Schema(
  {
    companyName: { type: String, required: true },
    address: { type: String, required: true },
    phone: { type: String },
    email: { type: String },
    gstin: { type: String },
    stateCode: { type: String },
    logo: { type: String }, // Cloudinary or local file URL
    authorizedSignatory: {
      name: { type: String },
      designation: { type: String },
      signatureImage: { type: String }, // optional signature image (Cloudinary URL)
    },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model("Company", companySchema);
