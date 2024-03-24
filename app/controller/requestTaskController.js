module.exports = (connection) => {
    return {
      createRequestTask: (req, res) => {
        const { requestorid, location, product, quantity, type } = req.body;
        connection.query(
          `INSERT INTO RequestTasks (requestorid, recieverid, productid, quantity, status, type) ($1, $2, $3, 'open', $4) RETURNING *;`,
          [requestorid, location, product, quantity, type],
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