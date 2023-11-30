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
      fetchOutletExpense: (req, res) => {
        const { selectedOutlet, dbDate } = req.body;
        connection.query(
        `SELECT * from expenses where outlet_id=$1 and expense_date = $2;`,
        [selectedOutlet, dbDate],
          (err, result) => {
            if (err) {
              res.status(500).send(err.message);
            } else {
              res.json(result);
            }
          }
        );
      },
      fetchAllOutletExpense: (req, res) => {
        connection.query(
        `SELECT expense_date, outlet_id, SUM(amount) AS total_amount
        FROM expenses
        GROUP BY expense_date, outlet_id
        ORDER BY expense_date, outlet_id;
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
  