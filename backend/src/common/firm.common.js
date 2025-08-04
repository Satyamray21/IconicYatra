import mongoose from "mongoose";

export const firmSchema = mongoose.Schema({
    firmType:{
        type:String,
        required:true
    },
    gstIn:{
        type:String,
       
    },
    cin:{
        type:String,
        
    },
    pan:{
        type:String,
       
    },
    existingTurnOver:{
        type:String,
       
    },
    firmName:{
        type:String,
        required:true
    },
    firmDescription:{
        type:String,

    },

},{_id:false})
