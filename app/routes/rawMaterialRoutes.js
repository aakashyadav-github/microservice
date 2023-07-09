const express = require("express");
const router = express.Router();

module.exports = (connection) => {
  const rawMaterialController = require("../controller/rawMaterialController")(connection);

  router.get("/", rawMaterialController.getRawMaterials);
  return router;
};