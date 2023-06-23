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
  };
};
