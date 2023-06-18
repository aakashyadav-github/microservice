module.exports = (connection) => {
  return {
    getInactiveProducts: (req, res) => {
      const { name, password, role } = req.body;
      connection.query(
        `SELECT p.product_name,
        c.name AS category_name FROM products AS p
        JOIN categories AS c ON p.category_id = c.id WHERE p.status = 'inactive';
      `,
        (err, result) => {
          if (err) {
            res.status(500).send(err.message);
          } else {
            res.json(result);
          }
        }
      );
    },
    activateProducts: (req, res) => {
      const { productId } = req.body;
      connection.query(
        `UPDATE products set status='active' WHERE id = $1`
        [productId],
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
