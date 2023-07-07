const router = require("express").Router()
const auth = require("../middleware/auth")
const Category = require("../model/categories")
const Product = require("../model/products")
const Razorpay = require("razorpay")
// const Order = require("../model/orders")

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
        const cartdata = await Cart.aggregate([
            { $match: { uid: user._id } },
            { $lookup: { from: "products", localField: "pid", foreignField: "_id", as: "product" } }
        ])
        var sum = 0;
        for (var i = 0; i < cartdata.length; i++) {
            // console.log(cartdata[i].total);
            sum = sum + cartdata[i].total;
        }
        resp.render("cart", { currentuser: user.uname, cartdata: cartdata, Total: sum })
    } catch (error) {
        console.log(error);
    }
})

router.get("/add_cart", auth, async (req, resp) => {
    const pid = req.query.pid
    const uid = req.user._id

    try {

        const data = await Cart.findOne({$and : [{pid:pid},{uid:uid}]})
        if(data){
            var qty = data.qty;
            qty++;
            var price = data.price * qty
            await Cart.findByIdAndUpdate(data._id,{qty:qty,total:price});
            resp.send("Product added into cart !!!")
        }
        else
        {
        const pdata = await Product.findOne({_id:pid})
        const cart = new Cart({
            uid:uid,
            pid:pid,
            price:pdata.price,
            qty:1,
            total:pdata.price
        })
        await cart.save()
        resp.send("Product added into cart !!!")
        }
     } catch (error) {
        console.log(error);
     }

})

router.get("/removefromcart", async (req, resp) => {
    try {
        const _id = req.query.pid;
        await Cart.findByIdAndDelete(_id)
        resp.send("Product removed from cart")
        // resp.redirect("cart")
    } catch (error) {
        console.log(error);
    }
})

router.get("/changeqty",auth,async (req,resp)=>{
    try {
        const cid = req.query.cid
        const value = req.query.value

        const cartdata = await Cart.findOne({_id:cid})
        var qty = cartdata.qty+Number(value) 
        if(qty!=0)
        { 
        var price = cartdata.price*qty
        await Cart.findByIdAndUpdate(cid,{qty : qty,total:price})
        resp.send("updated")
        }
        else
        {
            resp.send("")
        }
} catch (error) {
    console.log(error);
}
})

//********************payment******************** */
var nodemailer = require('nodemailer')
const Order = require("../model/orders")

var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'panchani47@gmail.com',
        pass: 'zofktpmofsyxsjwv'
    }
});
router.get("/payment", (req, resp) => {

    const amt = req.query.amt;
    var instance = new Razorpay({
        key_id: 'rzp_test_T9BoEU6kfey5L8',
        key_secret: 'DIdxD6Em4LM0CCVc5ZuTQMV0',
    });

    var options = {
        amount:Number(amt)*100 ,  // amount in the smallest currency unit
        currency: "INR",
        receipt: "order_rcptid_11"
      };

      instance.orders.create(options, function(err, order) {
        resp.send(order)
       });



})

router.get("/confirmOrder", auth, async (req, resp) => {
    try {
        const payid = req.query.pid
        const uid = req.user._id

        const cartProduct = await Cart.find({ uid: uid })
        var productlist = [];
        var alltotal = 0;
        var row = "";
        for (var i = 0; i < cartProduct.length; i++) {

            const prod = await Product.findOne({ _id: cartProduct[i].pid })

            var pname = prod.pname
            var price = prod.price
            var qty = cartProduct[i].qty
            var total = Number(price) * Number(qty)

            productlist[i] = {
                pname: pname,
                price: price,
                qty: qty,
                total: total
            }
            alltotal = alltotal + total;
            row = row + "<tr><td>" + pname + "</td><td>" + price + "</td><td>" + qty + "</td><td>" + total + "</td></tr>"
        }

        const order = new Order({ 
            payid: payid, 
            uid: uid, 
            product: productlist,
            date : Date.now(),
            total: alltotal })
        await order.save()
        await Cart.deleteMany({uid:uid})
        var mailOptions = {
            from: 'panchani47@gmail.com',
            to: req.user.email,
            subject: 'Order Conformation',
            html: "<table border='1'><tr><th>ProductName</th><th>Price</th><th>qty</th><th>Total</th></tr>" + row + "<tr><td>All total</td><td>" + alltotal + "</td></tr></table>"
        };

        transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                console.log(error);
            } else {
                resp.send("Order confirmed !!!")
            }
        });

    } catch (error) {
        console.log(error);
    }
})

module.exports = router;