import mongoose from "mongoose";
const flightQuotationSchema= mongoose.Schema({
    tripType:{
        type:String,
        enum:['oneway','roundtrip','multicity'],
        required:true,
    },
    clientDetails:{
        clientName:{
            type:String,
            required:true,
        }
    },
    flightDetails:{
        from:{
            type:String,
            required:true
        },
        to:{
            type:String,
            required:true
        },
        preferredAirline:{
            type:String,
            required:true
        },
        flightNo:{
            type:String,
            required:true
        },
        fare:{
            type:String,
            required:true
        },
        departureDate:{
            type:String,
            required:true
        },
        departureTime:{
            type:String,
            required:true
        }

    },
    adults:{
        type:String,
        required:true
    },
    childs:{
        type:String,
        
    },
    infants:{
        type:String,
    },
    anyMessage:{
        type:String,
    },
    personalDetails:{
        fullName:{
            type:String,
            required:true
        },
        mobileNumber:{
            type:String,
            required:true
        },
        emailId:{
            type:String,
            required:true
        }

    }

},{timeStamps:true})

export const flightQuotation = mongoose.model("flightQuotation",flightQuotationSchema);