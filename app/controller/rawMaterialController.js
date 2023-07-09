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
    };
  };
  