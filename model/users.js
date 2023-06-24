const mongoose = require("mongoose")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")

const userSchema =  new mongoose.Schema({
    uname:{
        type:String
        
    },
    email:{
        type:String
    },
    pass:{
        type:String
    },
    phone:{
        type:Number
    },
    Tokens : [
        {
            token : {
                type : String
            }
        }
    ]
})

userSchema.pre("save",async function(){
    try {
        if(this.isModified("pass"))
        {
            this.pass = await bcrypt.hash(this.pass,10)
        }

    } catch (error) {
        console.log(error);
    }
})

userSchema.methods.generateToken = async function(){
   
    try {
        const token  = await jwt.sign({_id:this._id},process.env.S_KEY)
        this.Tokens = this.Tokens.concat({token:token})
        this.save()
        return token;
    } catch (error) {
        
    }
}

module.exports = new mongoose.model("User",userSchema)