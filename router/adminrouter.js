const router = require("express").Router()
const Admin = require("../model/admins")
const aauth = require("../middleware/adminauth")

const jwt = require("jsonwebtoken")

router.get("/dashboard", aauth, (req, resp) => {
    resp.render("dashboard")
})

router.get("/admin", (req, resp) => {
    resp.render("admin_login")
})

router.post("/do_adminlogin", async (req, resp) => {
    try {
        const admin = await Admin.findOne({ uname: req.body.uname })

        if (admin.pass == req.body.pass) {
            const token = await jwt.sign({ _id: admin._id }, process.env.A_KEY)

            resp.cookie("ajwt", token)

            resp.redirect("dashboard")
        }
        else {
            resp.render("admin_login", { err: "Invalid credentials !!!" })
        }
    } catch (error) {
        console.log(error);
        resp.render("admin_login", { err: "Invalid credentials !!!" })

    }
})


router.get("/admin_logout", aauth, async (req, resp) => {
    try {

        resp.clearCookie("ajwt")
        resp.render("admin_login")

    } catch (error) {
        console.log(error);
    }
})



// *************************** Category***********************************

const Category = require("../model/categories")

router.get("/category",async(req, resp) => {
    try {
        const data = await Category.find()

        resp.render("category",{catdata:data})
    } catch (error) {

    }
})

router.post("/add_category", aauth, async (req, resp) => {
    try {
        const cat = new Category(req.body)
        await cat.save();
        resp.redirect("category")
    } catch (error) {
            console.log(error);
    }
})

router.get("/deletecategory",async(req,resp)=>{
    try {
      const id = req.query.catid
      const data =  await Category.findByIdAndDelete(id)
    //   fs.unlinkSync("public/img/"+udata.img)
      resp.redirect("category")
    } catch (error) {
      console.log(error); 
    }
  })
  
  router.get("/editcategory",async(req,resp)=>{
    try {
      const id = req.query.catid
      const data = await Category.findOne({_id : id})
      resp.render("updateCategory",{cdata: data})
    } catch (error) {
      console.log(error); 
    }
  })

  router.post("/update_category",async (req,resp)=>{
    try {
        const id = req.body.id
        // console.log(id)
        const cdata = await Category.findByIdAndUpdate(id,req.body)
        // console.log(cdata);
        resp.redirect("category")
    } catch (error) {
        console.log(error);
    }
  })
  /****************************product*************************/


  router.get("/products", (req, resp) => {
    try {
        resp.render("products")
    } catch (error) {

    }
})
module.exports = router;

