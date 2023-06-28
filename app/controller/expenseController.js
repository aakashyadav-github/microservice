module.exports = (connection) => {
    return {
      addExpense: (req, res) => {
        const { description, amount, outlet_id} = req.body;
        connection.query(
          "INSERT INTO expenses (description, amount, outlet_id, expense_date) VALUES ($1, $2, $3, CURRENT_DATE) RETURNING *",
          [description, amount, outlet_id],
          (err, result) => {
            if (err) {
              res.status(500).send(err.message);
            }else{
              res.json(result);
            }
          }
        );
      },
      fetchExpense: (req, res) => {
        connection.query(
        `SELECT * from expenses;
          `,
          (err, result) => {
            if (err) {
              res.status(500).send(err.message);
            } else {
              res.json(result);
            }
          }
        );
      },
    };
  };
  