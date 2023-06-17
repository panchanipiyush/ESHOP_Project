const express = require("express")
const app = express()
const mongoose = require("mongoose")

const hbs = require("hbs")
const path = require("path")
var bodyParser = require('body-parser')
const cookieParser = require("cookie-parser")

require("dotenv").config()

const PORT = process.env.PORT
const DB_URL = process.env.DB_URL

mongoose.connect(DB_URL).then(() => {
    console.log("My DataBase Connected");
}).catch(err => {
    console.log(err);
})

app.use(cookieParser())
app.use(bodyParser.urlencoded({ extended: false }))
const publicPath = path.join(__dirname, "../public")
const viewPath = path.join(__dirname, "../templetes/views")
const partialPath = path.join(__dirname, "../templetes/partials")

app.set("view engine", "hbs")
app.set("views", viewPath)
hbs.registerPartials(partialPath)
app.use(express.static(publicPath))


app.use("/", require("../router/userrouter"))
app.use("/", require("../router/adminrouter"))

app.listen(PORT, () => {
    console.log("Server Running On PORT No : " + PORT);
})