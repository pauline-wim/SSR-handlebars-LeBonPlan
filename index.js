const express = require("express");
const mongoose = require("mongoose");
const handlebars = require("express-handlebars");
const path = require("path");
const dotenv = require("dotenv");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
// const cookieParser = require("cookie-parser");
const app = express();
dotenv.config({
  path: "./config.env",
});

const secret = process.env.DB_SECRET;

// Handlebars config
app.engine("handlebars", handlebars.engine());
app.set("view engine", "handlebars");

// Models
const User = require("./models/userModel");

// Routers
const usersRouter = require("./routes/usersRouter");
const productsRouter = require("./routes/productsRouter");

// Connexion to MongoDB
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
  })
  .then(() => console.log("Connected to mongoDB"));

// Middlewares
app.use(express.static(path.join(__dirname, "/public")));
app.use("/users", usersRouter);
app.use("/products", productsRouter);
app.use(express.urlencoded({ extended: true }));
const auth = (req, res, next) => {
  let data;
  try {
    data = jwt.verify(req.cookies.jwt, secret);
    req.userId = data.id;
    console.log("User authentified: Request granted!");
  } catch (err) {
    return res.status(401).json({
      message: "Your token is not valid",
    });
  }
  next();
};

// ROUTES
// Home
app.get("/", (req, res) => {
  res.render("homepage", {
    isLoggedIn: false,
  });
});
// Signup
app.get("/signup", (req, res) => {
  res.render("signup");
});
// Create account & store in DB
app.post("/signup", async (req, res) => {
  const regex = /^(?=.*\d).{6,}$/;
  if (!regex.test(req.body.password)) {
    return res.status(400).json({
      message:
        "Error: Your password must contain at least 6 characters and one digit",
    });
  }
  const hashedPassword = await bcrypt.hash(req.body.password, 12);
  try {
    await User.create({
      username: req.body.username,
      password: hashedPassword,
      firstName: req.body.firstName,
      lastName: req.body.lastName,
    });
  } catch (err) {
    return res.status(400).json({
      message: `ERROR: ${err}`,
    });
  }
  console.log(`User account for ${req.body.username} was CREATED`);
  res.render("login");
});
// Login
app.get("/login", (req, res) => {
  res.render("login");
});

// Start server
app.listen(8000, () => console.log("Listening"));
