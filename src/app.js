const express = require("express");
const bodyParser = require("body-parser");
const app = express();

const { DBconnection } = require("./config/mongoDb");
DBconnection();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const userRoute = require("../src/routes/user");
app.use("/user", userRoute);

app.use((req, res) => {
  res.status(404).json({
    error: "bad request",
  });
});

module.exports = app;
