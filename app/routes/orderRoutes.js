import { Router } from "express";
const router = Router();

export default (connection) => {
  const orderController = require("../controller/orderController")(connection);

  router.get("/get-orders", orderController.getOrders);
  return router;
};
