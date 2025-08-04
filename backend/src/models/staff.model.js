import mongoose from "mongoose"
import { addressSchema } from "../common/address.common.js";
import { firmSchema } from "../common/firm.common.js";
import { bankSchema } from "../common/bankDetails.common.js";
const staffSchema = new mongoose.Schema({
    personalDetails :{
        firstName:{
            type:String,
            required:true
        },
        lastName:{
            type:String,
            required:true
        },
        mobileNumber:{
            type:String,
            required:true,
            unique:true
        },
        alternateContact:{
            type:String,
            unique:true
        },
        designation:{
            type:String,
            required:true
        },
        userRole:{
            type:String,
            enum:['Superadmin','Admin','executive'],
            required:true
        }

    },
    staffLocation:{
    country: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Country",
      required: true
    },
    state: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "State",
      required: true
    },
    city: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "City",
      required: true
    }
},
address:addressSchema,
firm:firmSchema,
bank:bankSchema,
},{timestamps:true});        

export const Staff = new mongoose.model("Staff",staffSchema);