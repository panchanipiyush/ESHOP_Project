const router = require("express").Router()
const auth = require("../middleware/auth")
const Category = require("../model/categories")
const Product = require("../model/products")

router.get("/", async (req, resp) => {
    try {
        const data = await Category.find()
        const prod = await Product.find()
        resp.render("index", { catdata: data, proddata: prod })

    } catch (error) {
        console.log(error);
    }
})

router.get("/shop", async (req, resp) => {
    const data = await Category.find()
    resp.render("shop", { catdata: data })
})



router.get("/contact", (req, resp) => {
    resp.render("contact")
})

router.get("/registration", (req, resp) => {
    resp.render("registration")
})

router.get("/login", (req, resp) => {
    resp.render("login")
})

router.get("/details", async (req, resp) => {

    const id = req.query.pid
    try {
        const prod = await Product.findOne({ _id: id })
        resp.render("detail", { product: prod })
    } catch (error) {
        console.log(error);
    }

})


//****************************User Registration******************** */
const User = require("../model/users")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")

router.post("/do_register", async (req, resp) => {
    try {
        const user = new User(req.body)
        await user.save();
        resp.render("registration", { msg: "Registration successfully done !!!" })
    } catch (error) {
        console.log(error);
    }
})



router.post("/do_login", async (req, resp) => {
    try {

        const user = await User.findOne({ email: req.body.email })


        //  if(user.Tokens.length>=10)
        //  {

        //   resp.render("login",{err:"Max user limit reached"})
        //   return;
        //  }
        const isValid = await bcrypt.compare(req.body.pass, user.pass)

        if (isValid) {

            const token = await user.generateToken()

            resp.cookie("jwt", token)
            resp.redirect("/")
            // resp.render("/")    
        }
        else {
            resp.render("login", { err: "Invalid credentials !!!" })
        }

    } catch (error) {
        resp.render("login", { err: "Invalid credentials !!!" })
    }
})

/*******************CART***************************** */
const Cart = require("../model/carts")

router.get("/cart", auth, async (req, resp) => {

    const user = req.user

    try {
        // const cartdata = await Cart.find({ uid: user._id })
        const cartdata = await Cart.aggregate([{$match:{uid:user._id}},{$lookup:{from:"products",localField:"pid",foreignField:"_id",as:"product"}}])
        resp.render("cart", { currentuser: user.uname, cartdata: cartdata })

    } catch (error) {
        console.log(error);
    }


})


router.get("/add_cart", auth, async (req, resp) => {
    try {
        const pid = req.query.pid
        const uid = req.user._id

        const pdata = await Product.find({ _id: pid })

        const cart = new Cart({
            uid: uid,
            pid: pid,
            qty: 1,
            price: pdata.price,
            total: pdata.price
        })
        await cart.save()
        resp.redirect("/")

    } catch (error) {
        console.log(error);
    }
})
module.exports = router;