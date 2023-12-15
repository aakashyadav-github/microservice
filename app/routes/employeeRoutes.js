const express = require("express");
const router = express.Router();

module.exports = (connection) => {
  const employeeController = require("../controller/employeeController")(connection);

  // router.post("/add", employeeController.createEmployee);
  router.get("/", employeeController.fetchEmployee);
  router.put('/updateWorkingStatus', employeeController.updateWorkingStatus);
  return router;
};
