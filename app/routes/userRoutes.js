const express = require("express");
const router = express.Router();

module.exports = (connection) => {
  const userController = require("../controller/userController")(connection);

  router.post("/", userController.createUser);
  return router;
};
