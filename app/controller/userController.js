module.exports = (connection) => {
  return {
    createUser: (req, res) => {
      const { name, password, role } = req.body;
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
    loginUser: (req, res) =>{
      const { name, password } = req.body;
      connection.query(
        "SELECT * from users where name = $1 and password = $2",
        [name, password],
        (err, result) => {
          if (err) {
            res.status(500).send(err.message);
          } else {
            res.json(result);
          }
        }
      );
    },
    getUsers: (req, res )=>{
      connection.query(
        "SELECT * from users",
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
