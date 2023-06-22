const express = require("express");
const router = express.Router();

module.exports = (connection) => {
  const orderController = require("../controller/orderController")(connection);

  router.get("/get-orders", orderController.getOrders);
  return router;
};
