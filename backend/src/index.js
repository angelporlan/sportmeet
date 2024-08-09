const express = require("express");
const mongoose = require("mongoose");
require("dotenv").config();
const userRoute = require("./routes/user");
const eventRoute = require("./routes/event");

const app = express();
const port = process.env.PORT || 9000;

app.use(express.json());
app.use("/api", userRoute, eventRoute);

app.get("/", (req, res) => {
  res.send("Welcome to my API");
});

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch((error) => console.error(error));

// server listening
app.listen(port, () => console.log("Server listening to", port));

