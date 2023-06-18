const express = require("express");
const router = express.Router();

module.exports = (connection) => {
  const productController = require("../controller/productController")(connection);

  router.get("/get-inactive", productController.getInactiveProducts);
  router.post("/activateProduct", productController.activateProducts);
  return router;
};
