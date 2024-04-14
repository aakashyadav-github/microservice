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
      const { requestid, quantity, productid } = req.body;
      connection.query(
        `UPDATE RequestTasks SET status = 'Completed' WHERE requestid = $1;`,
        [requestid],
        (err, result) => {
          if (err) {
            res.status(500).send(err.message);
          } else {
            connection.query(
              `UPDATE warehouse_inventory
                SET quantity_available = warehouse_inventory.quantity_available + $1
                WHERE warehouse_inventory.product_id = $2`,
              [quantity, productid],
              (errWareInv, resultWareInv) => {
                if (errWareInv) {
                  res.status(500).send(errWareInv.message);
                } else {
                  res.json(resultWareInv);
                }
              }
            );
          }
        }
      );
    },
  };
};
