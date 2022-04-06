const express = require("express");
const mongoose = require("mongoose");
const handlebars = require("express-handlebars");
const path = require("path");
const dotenv = require("dotenv");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
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
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "/public")));
app.use("/users", usersRouter);
app.use("/products", productsRouter);
app.use(express.urlencoded({ extended: true }));
const auth = (req, _res, next) => {
  let data;
  if (!req.cookies) {
    console.log("if ok");
    req.isLoggedIn = false;
  } else {
    console.log("if ko");
    try {
      data = jwt.decode(req.cookies.jwt);
      req.userId = data.id;
      req.isLoggedIn = true;
      console.log("User authentified: Request granted!");
    } catch (err) {
      req.isLoggedIn = false;
    }
  }
  next();
};

// ROUTES
// Home
app.get("/", auth, (req, res) => {
  res.render("homepage", {
    isLoggedIn: req.isLoggedIn,
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
// Login to personal account
app.post("/login", async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username });
  if (!user) {
    return res.status(400).json({
      message: "Invalid username or password",
    });
  }
  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    return res.status(400).json({
      message: "Invalid username or password",
    });
  }
  const token = jwt.sign({ id: user._id }, secret);
  res
    .cookie("jwt", token, { httpOnly: true, secure: false })
    .redirect("/profile");
  console.log(`${username} user successfully CONNECTED`);
});
//
app.get("/profile", auth, (req, res) => {
  res.render("profile", { isLoggedIn: req.isLoggedIn });
});

// Start server
app.listen(8000, () => console.log("Listening"));
