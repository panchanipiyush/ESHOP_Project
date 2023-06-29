const mongoose = require("mongoose")


const adminSchema = new mongoose.Schema({

    uname: {
        type: String
    },
    pass: {
        type: String
    },
    token: {
        type: String
    }

})

// adminSchema.methods.generateToken = async function () {

//     try {
//         const token = await jwt.sign({ _id: this._id }, process.env.A_KEY)
//         this.Tokens = this.Tokens.concat({ token: token })
//         this.save()
//         return token;
//     } catch (error) {

//     }
// }


module.exports = new mongoose.model("Admin", adminSchema)
