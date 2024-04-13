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
        `SELECT RequestTasks.*, Products.unit, Products.product_name, Products.image_url
          FROM RequestTasks
          JOIN Products ON RequestTasks.productid = Products.id
          WHERE RequestTasks.recieverid = $1 and RequestTasks.status='Open'`,
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
    completeRequestTask: (req, res) => {
      const { requestid } = req.body;
      connection.query(
        `UPDATE RequestTasks SET status = 'Completed' WHERE requestid = $1;`,
        [requestid],
        (err, result) => {
          if (err) {
            res.status(500).send(err.message);
          } else {
            connection.query(
              `UPDATE warehouse_inventory
                SET quantity = warehouse_inventory.quantity + rt.quantity
                FROM RequestTasks rt
                WHERE warehouse_inventory.product_id = rt.product_id
                AND rt.product_id = $1`,
              [requestid],
              (err, result) => {
                if (err) {
                  res.status(500).send(err.message);
                } else {
                  res.status(201).json(result);
                }
              }
            );
          }
        }
      );
    },
  };
};