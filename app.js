const express = require("express");
const cors = require("cors");
const {
  handleServerErrors,
  handleCustomErrors,
  handlePsqlErrors,
} = require("./errors/errors");

const apiRouter = require("./routes/api-router");
const app = express();
app.use(cors());
app.use(express.json());

app.use("/api", apiRouter);

app.all("*", (req, res) => {
  res.status(404).send({ msg: "Route not found" });
});

app.use(handleCustomErrors);
app.use(handlePsqlErrors);
app.use(handleServerErrors);

module.exports = app;
