const express = require("express");
const router = express.Router();

module.exports = (connection) => {
  const categoryController = require("../controller/categoryController")(connection);

  router.post("/add", categoryController.createCategory);
  router.get("/get",categoryController.fetchCategory);
  return router;
};
