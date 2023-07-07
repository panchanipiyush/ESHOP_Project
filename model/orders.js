const mongoose = require("mongoose")

const orderSchema = new mongoose.Schema({
    uid :{
        type : mongoose.Schema.Types.ObjectId
    },
    payid : {
        type : String
    },
    products : [
        {
            pname : {
                type : String
            },
            qty : {
                type : Number
            },
            price : {
                type : Number
            }
        }
    ],
    total : {
        type : Number
    },
    date : {
        type : Date,
        default  : Date.now()
    }
})

module.exports = new mongoose.model("Order",orderSchema)