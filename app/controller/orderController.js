module.exports = (connection) => {
  return {
    getOrders: (req, res) => {
      const { type } = req.query;
      connection.query(
        "SELECT * FROM orders where type=$1;",
        [type],
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
      const {
        customer_name,
        mobile_number,
        total_amount,
        type,
        customer_address,
        delivery_date,
        delivery_time,
        discount,
        note,
      } = req.body;
      connection.query(
        `INSERT INTO orders (customer_name, mobile_number, total_amount, type, order_date,customer_address,delivery_date,delivery_time,discount,note) VALUES ($1, $2, $3, $4, CURRENT_DATE, $5,$6,$7,$8,$9) RETURNING *`,
        [
          customer_name,
          mobile_number,
          total_amount,
          type,
          customer_address,
          delivery_date,
          delivery_time,
          discount,
          note,
        ],
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
