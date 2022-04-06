const express = require("express");
const handlebars = require("express-handlebars");
const path = require("path");
const dotenv = require("dotenv");
const app = express();
dotenv.config({
  path: "./config.env",
});

// Handlebars config
app.engine("handlebars", handlebars.engine());
app.set("view engine", "handlebars");

// Routers
const usersRouter = require("./routes/usersRouter");
const productsRouter = require("./routes/productsRouter");

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

// Routes
app.get("/", (req, res) => {
  res.render("homepage", {
    isLoggedIn: false,
  });
});
app.get("/signup", (req, res) => {
  res.render("signup");
});
app.get("/login", (req, res) => {
  res.render("login");
});

// Start server
app.listen(8000, () => console.log("Listening"));
