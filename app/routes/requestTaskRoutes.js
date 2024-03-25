const express = require("express");
const router = express.Router();

module.exports = (connection) => {
  const requestTaskController = require("../controller/requestTaskController")(connection);

  router.post("/createRequestTask", requestTaskController.createRequestTask);
  router.post("/getRequestTask", requestTaskController.getRequestTask);
  return router;
};
