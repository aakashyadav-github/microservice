module.exports = (connection) => {
  return {
    createUser: (req, res) => {
      const { name, password, role } = req.body;
      const currentDate = new Date();
      connection.query(
        "INSERT INTO users (name, password, role) VALUES ($1, $2, $3) RETURNING *",
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
