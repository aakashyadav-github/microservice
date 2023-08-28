module.exports = (connection) => {
  return {
    getOrders: (req, res) => {
      connection.query(
        "SELECT * FROM orders;",
        (err, result) => {
          if (err) {
            res.status(500).send(err.message);
          } else {
            res.json(result);
          }
        }
      );
    },
    addOrder: (req, res) => {
      const {customer_name, mobile_number,total_amount, type} = req.body;
      `INSERT into orders (customer_name, mobile_number,total_amount, type) VALUES ($1, $2, $3, $4) RETURNING *`,
      [customer_name, mobile_number,total_amount, type],
      (err, result) => {
        if (err) {
          res.status(500).send(err.message);
        }else{
          res.json(result);
        }
      } 
    }
  };
};
