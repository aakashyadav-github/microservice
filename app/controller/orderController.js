module.exports = (connection) => {
  return {
    getOrders: (req, res) => {
      const { name, password, role } = req.body;
      connection.query(
        "SELECT * FROM orders",
        [name, password, role],
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
