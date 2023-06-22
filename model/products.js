const mongoose = require("mongoose")

const productShema = new mongoose.Schema({
    catid:{
        type: mongoose.Schema.Types.ObjectId
    },
    pname:{
        type:String
    },
    price:{
        type:Number
    },
    qty:{
        type:Number
    },
    img:{
        type: String
    }
})



module.exports = new mongoose.model("Product",productShema)