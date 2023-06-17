const router = require("express").Router()
const Admin = require("../model/admins")
const aauth = require("../middleware/adminauth")

const jwt = require("jsonwebtoken")

router.get("/dashboard",aauth,(req,resp)=>{
    resp.render("dashboard")
})

router.get("/admin",(req,resp)=>{
    resp.render("admin_login")
})

router.post("/do_adminlogin", async (req,resp)=>{
    try {
        const admin = await Admin.findOne({uname: req.body.uname})

        if(admin.pass == req.body.pass) 
        {
            const token = await jwt.sign({_id : admin._id},process.env.A_KEY)
            
            resp.cookie("ajwt",token)
        
            resp.redirect("dashboard")
        }
        else
        {
            resp.render("admin_login",{err:"Invalid credentials !!!"})
        }
    } catch (error) {
        console.log(error);
        resp.render("admin_login",{err:"Invalid credentials !!!"})
        
    }
})


router.get("/admin_logout",aauth,async (req,resp)=>{
        try {
            
            resp.clearCookie("ajwt")
            resp.render("admin_login")

        } catch (error) {
            console.log(error);
        }
})


module.exports = router;

