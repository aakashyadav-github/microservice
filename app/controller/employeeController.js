module.exports = (connection) => {
  return {
    fetchEmployee: (req, res) => {
      connection.query(`SELECT *
      FROM employees AS e
      INNER JOIN employee_bank_details AS eb
      ON e.employee_id = eb.employee_id;
      `, (err, result) => {
        if (err) {
          res.status(500).send(err.message);
        } else {
          res.json(result);
        }
      });
    },
  };
};
