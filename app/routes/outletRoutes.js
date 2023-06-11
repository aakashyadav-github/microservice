const express = require("express");
const router = express.Router();

module.exports = (connection) => {
  const outletController = require("../controller/outletController")(connection);

  router.post("/", outletController.createOutlet);
  router.get("/",outletController.fetchOutlet);
  return router;
};
