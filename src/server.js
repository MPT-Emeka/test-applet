const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config({ path: "./config.env" });
const app = require("../app.js");

app.use(express.json());


app.listen(process.env.DB_PORT, () => {
  console.log("APP IS LISTENING ON PORT " + process.env.DB_PORT);
});
