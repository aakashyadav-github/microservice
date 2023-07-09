module.exports = (connection) => {
    return {
      addRawMaterials: (req, res) => {
        const { raw_material_name, unit } = req.body;
        connection.query(
          "INSERT INTO raw_materials (raw_material_name, unit) VALUES ($1, $2) RETURNING *",
          [raw_material_name, unit],
          (err, result) => {
            if (err) {
              res.status(500).send(err.message);
            } else {
              res.json(result);
            }
          }
        );
      },
      getRawMaterials: (req, res) => {
        connection.query(
          "SELECT * FROM raw_materials;",
          (err, result) => {
            if (err) {
              res.status(500).send(err.message);
            } else {
              res.json(result);
            }
          }
        );
      },
      addProductRawMaterial: (req, res) => {
        const { product_id, raw_material_id, quantity_required } = req.body;
        connection.query(
          "INSERT INTO product_raw_materials (product_id, raw_material_id, quantity_required) VALUES ($1, $2, $3) RETURNING *;",
          [product_id, raw_material_id, quantity_required],
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
  