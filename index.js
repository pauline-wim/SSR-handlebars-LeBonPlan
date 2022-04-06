const express = require("express");
const handlebars = require("express-handlebars");
const path = require("path");
const app = express();

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

// Routes
app.get("/", (req, res) => {
  res.render("homepage");
});
app.get("/signup", (req, res) => {
  res.render("signup");
});
app.get("/login", (req, res) => {
  res.render("login");
});

// Start server
app.listen(8000, () => console.log("Listening"));
