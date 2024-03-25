module.exports = (connection) => {
    return {
      createRequestTask: (req, res) => {
        const { requestorid, location, product, quantity, type } = req.body;
        connection.query(
          `INSERT INTO RequestTasks (requestorid, recieverid, productid, quantity, status, type) VALUES ($1, $2, $3, $4, 'Open', $5) RETURNING *;`,
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
      getRequestTask: (req, res) => {
        const { id } = req.body;
        connection.query(
          `SELECT RequestTasks.*, Products.unit, Products.product_name 
          FROM RequestTasks
          JOIN Products ON RequestTasks.productid = Products.id
          WHERE RequestTasks.recieverid = $1;`,
          [id],
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