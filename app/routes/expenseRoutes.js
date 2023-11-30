const express = require("express");
const router = express.Router();

module.exports = (connection) => {
  const expenseController = require("../controller/expenseController")(connection);

  router.get("/get-expense",expenseController.fetchExpense);
  router.post("/add-expense",expenseController.addExpense);
  router.post('/get-outlet-expense',expenseController.fetchOutletExpense);
  router.get('/get-all-outlet-expense', expenseController.fetchAllOutletExpense);
  return router;
};
