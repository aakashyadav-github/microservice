module.exports = (connection) => {
  return {
    getInactiveProducts: (req, res) => {
      const { name, password, role } = req.body;
      connection.query(
        `SELECT p.product_name, c.name AS category_name, p.id FROM products AS p
        JOIN categories AS c ON p.category_id = c.id WHERE p.status = 'inactive';`,
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
        "UPDATE products SET status = 'active' WHERE id = $1;",
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
    makeInactive: (req, res) => {
      const { productId } = req.body;
      connection.query(
        "UPDATE products SET status = 'inactive' WHERE id = $1;",
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
    deleteProduct: (req, res) => {
      const { productId } = req.body;
      connection.query(
        "DELETE FROM product WHERE product_id = $1;",
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
    fetchCategoryProducts: (req, res) => {
      const { category_id } = req.body;
      connection.query(
        `SELECT * FROM products WHERE category_id = $1;
        `,
        [category_id],
        (err, result) => {
          if (err) {
            res.status(500).send(err.message);
          } else {
            res.json(result);
          }
        }
      );
    },
    updateProductPrice: (req, res) => {
      const { id, price } = req.body;
      connection.query(
        `UPDATE products SET price = $1 WHERE id = $2;
        `,
        [id,price],
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
