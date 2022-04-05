const express = require("express");
const handlebars = require("express-handlebars");
const app = express();

// Handlebars config
app.engine("handlebars", handlebars.engine());
app.set("view engine", "handlebars");

// Routers
const usersRouter = require("./routes/usersRouter");
const productsRouter = require("./routes/productsRouter");

// Middlewares
app.use("/users", usersRouter);
app.use("/products", productsRouter);

// Start server
app.listen(8000, () => console.log("Listening"));
