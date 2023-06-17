const router = require("express").Router()
const auth = require("../middleware/auth")

router.get("/",(req,resp)=>{
    resp.render("index")
})

router.get("/shop",(req,resp)=>{
    resp.render("shop")
})

router.get("/cart",auth,(req,resp)=>{
    resp.render("cart")
})

router.get("/contact",(req,resp)=>{
    resp.render("contact")
})

router.get("/registration",(req,resp)=>{
    resp.render("registration")
})

router.get("/login",(req,resp)=>{
    resp.render("login")
})

//****************************User Registration******************** */
const User = require("../model/users")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")

router.post("/do_register",async (req,resp)=>{
    try {
        const user = new User(req.body)
        await user.save();
        resp.render("registration",{msg:"Registration successfully done !!!"})
    } catch (error) {
        console.log(error);        
    }
})



router.post("/do_login",async(req,resp)=>{
    try {

        const user = await User.findOne({email:req.body.email})
  
       
         if(user.Tokens.length>=2)
         {
        
          resp.render("login",{err:"Max user limit reached"})
          return;
         }
          const isValid = await bcrypt.compare(req.body.pass,user.pass)
  
          if(isValid)
          {
  
              const token =  await user.generateToken()
              
              resp.cookie("jwt",token)
              resp.render("index")
          }
          else
          {
            resp.render("login",{err:"Invalid credentials !!!"})
          }
  
    } catch (error) {
      resp.render("login",{err:"Invalid credentials !!!"})
    }
  })


module.exports = router;