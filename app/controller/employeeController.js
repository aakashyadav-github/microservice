module.exports = (connection) => {
  return {
    // createEmployee: (req, res) => {
    //   const { name, aadhar, mobileno, address, salary, dateofjoining, working_area, working_status, dob, fathers_name, mothers_name } =
    //     req.body;
    //   const photo = req.file ? req.file.path : '';
    //   connection.query(
    //     "INSERT INTO employees (name, aadhar, mobileno, address, salary, dateofjoining, photo, working_area, working_status, dob, fathers_name, mothers_name) VALUES ($1, $2, $3, $4, $5, $6, $7,$8, $9, $10, $11, $12) RETURNING *",
    //     [name, aadhar, mobileno, address, salary, dateofjoining, photo, working_area, working_status, dob, fathers_name, mothers_name],
    //     (err, result) => {
    //       if (err) {
    //         res.status(201).send(err.message);
    //       } else {
    //         res.json(result);
    //       }
    //     }
    //   );
    // },
    fetchEmployee: (req, res) => {
      connection.query(`SELECT * from employees;`, (err, result) => {
        if (err) {
          res.status(500).send(err.message);
        } else {
          res.json(result);
        }
      });
    },
  };
};
