module.exports = (connection) => {
    return {
      createCategory: (req, res) => {
        const { categoryName } = req.body;
        connection.query(
          "INSERT INTO categories (name) VALUES ($1) RETURNING *",
          [categoryName],
          (err, result) => {
            if (err) {
              res.status(500).send(err.message);
            }else{
              res.json(result);
            }
          }
        );
      },
      fetchCategory: (req, res) => {
        connection.query(
        `SELECT c.name, c.id, COUNT(p.id) AS product_count
        FROM categories c
        LEFT JOIN products p ON c.id = p.category_id
        WHERE c.status = 'enable'
        GROUP BY c.id, c.name;
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
    };
  };
  