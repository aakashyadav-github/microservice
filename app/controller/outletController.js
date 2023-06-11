module.exports = (connection) => {
    return {
      createOutlet: (req, res) => {
        const { outlet_name, address, phone } = req.body;
        connection.query(
          "INSERT INTO outlets (name, password, role) VALUES ($1, $2, $3) RETURNING *",
          [outlet_name, address, phone],
          (err, result) => {
            if (err) {
              res.status(500).send(err.message);
            } else {
              res.json(result);
            }
          }
        );
      },
      fetchOutlet: (req, res) => {
        const { name, password, role } = req.body;
        connection.query(
          "SELECT * FROM outlets",
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
  