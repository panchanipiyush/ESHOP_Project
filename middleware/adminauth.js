const jwt = require("jsonwebtoken")
const Admin = require("../model/admins")



const aauth = async (req, resp, next) => {


    try {

        const token = req.cookies.ajwt

        const verifytoken = await jwt.verify(token, process.env.A_KEY)
        if (verifytoken) {
            const admindata = await Admin.findOne({ _id: verifytoken._id })
            // console.log(admindata);
            req.admin = admindata
            req.token = token
            next()
        }

    } catch (error) {
        console.log(error);
        resp.render("admin_login", { err: "Please login first !!!" })
    }


}

module.exports = aauth