const express = require("express");
const router = express.Router();

module.exports = (connection) => {
  const orderController = require("../controller/orderController")(connection);

  router.get("/get-orders", orderController.getOrders);
  router.get("/get-orders-total", orderController.getOrdersTotal);
  router.post("/add-order", orderController.addOrder);
  return router;
};
