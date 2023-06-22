const router = require("express").Router()
const Admin = require("../model/admins")
const aauth = require("../middleware/adminauth")
const multer = require("multer")

const storageEngine = multer.diskStorage({
    destination: "./public/productimage",
    filename: (req, file, cb) => {
      cb(null, `${Date.now()}--${file.originalname}`);
    },
  });
  
  const upload = multer({
    storage: storageEngine,
  });
  

const jwt = require("jsonwebtoken")

router.get("/dashboard", aauth,async (req, resp) => {
    const admin = req.admin
    try {      
    resp.render("dashboard",{currentadmin:admin.uname})
    } catch (error) {
        console.log(error);
    }
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

            resp.redirect("dashboard",)
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
const Product = require("../model/products");
// const products = require("../model/products");

router.get("/category", async (req, resp) => {
    try {
        const data = await Category.find()

        resp.render("category", { catdata: data })
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

router.get("/editcategory", async (req, resp) => {
    try {
        const id = req.query.catid
        const data = await Category.findOne({ _id: id })
        resp.render("updateCategory", { cdata: data })
    } catch (error) {
        console.log(error);
    }
})

router.get("/deletecategory", async (req, resp) => {
    try {
        const id = req.query.catid
        const data = await Category.findByIdAndDelete(id)
        //   fs.unlinkSync("public/img/"+udata.img)
        resp.redirect("category")
    } catch (error) {
        console.log(error);
    }
})



// router.post("/update_category", async (req, resp) => {
//     try {
//         const id = req.body.id
//         // console.log(id)
//         const cdata = await Category.findByIdAndUpdate(id, req.body)
//         // console.log(cdata);
//         resp.redirect("category")
//     } catch (error) {
//         console.log(error);
//     }
// })
/****************************product*************************/


router.get("/products",aauth, async (req, resp) => {
    try {
        const data = await Category.find()
        const prod = await Product.aggregate([{$lookup:{from:"categories",localField:"catid",foreignField:"_id",as:"category"}}])
        // console.log(prod[0].category[0]);
        resp.render("products", { catdata: data,proddata:prod })
    } catch (error) {
        console.log(error);
    }
})

router.post("/add_product",upload.single("file"),async (req,resp)=>{
    try {

//    if()

        const prod = new Product({
            catid: req.body.catid,
            pname: req.body.pname,
            price: req.body.price,
            qty: req.body.qty,
            img: req.file.filename
        })
        await prod.save()
        resp.redirect("products")
    } catch (error) {
        console.log(error);
    }
})

// router.get("/editproduct", async (req, resp) => {
//         const id = req.query.pid
//         const data = await Product.findOne({ _id: id })
//     try {
//         resp.render("updateProducts", { pdata: data })
//     } catch (error) {
//         console.log(error);
//     }
// })


/****************USER S******************* */

const User =  require("../model/users")

router.get("/viewusers",async(req,resp)=>{
    try {
        const users = await User.find()
        resp.render("users",{userdata:users})
    } catch (error) {
        console.log(error);
    }
})

module.exports = router;

