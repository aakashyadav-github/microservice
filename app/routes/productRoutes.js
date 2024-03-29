const express = require("express");
const router = express.Router();

module.exports = (connection) => {
  const productController = require("../controller/productController")(connection);

  router.get("/get-inactive", productController.getInactiveProducts);
  router.post("/activateProduct", productController.activateProducts);
  router.post("/makeInactive", productController.makeInactive);
  router.post("/starMark", productController.starMark);
  router.post("/delete", productController.deleteProduct);
  router.post("/fetchCategoryProducts", productController.fetchCategoryProducts);
  router.post("/updateProductPrice", productController.updateProductPrice);
  return router;
};
