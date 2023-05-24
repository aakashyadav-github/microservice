const express = require("express");
const app = express();
const port = 3002;

var cors = require('cors')

app.use(cors())

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

const bodyParser = require("body-parser");
const mysql = require("mysql2");

app.use(bodyParser.json());

const connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "Aakash12@",
  database: "ram-shiv-db",
});

connection.connect((err) => {
  if (err) {
    console.error("Error connecting to the database:", err);
  } else {
    console.log("Connected to the database");
  }
});

// Retrieve all products
app.get("/products", (req, res) => {
  connection.query("SELECT * FROM Products", (err, results) => {
    if (err) {
      res.status(500).send(err.message);
    } else {
      res.json(results);
    }
  });
});

// Retrieve all raw materials
app.get("/rawmaterials", (req, res) => {
  connection.query("SELECT * FROM RawMaterials", (err, results) => {
    if (err) {
      res.status(500).send(err.message);
    } else {
      res.json(results);
    }
  });
});

// Create a new outlet
app.post("/outlets", (req, res) => {
  const { outlet_name, address, phone, email } = req.body;
  connection.query(
    "INSERT INTO Outlets (outlet_name, address, phone, email) VALUES (?, ?, ?, ?)",
    [outlet_name, address, phone, email],
    (err, result) => {
      if (err) {
        res.status(500).send(err.message);
      } else {
        res.sendStatus(201);
      }
    }
  );
});

app.post("/categories", (req, res) => {
  const { categoryName } = req.body;
  connection.query(
    "INSERT INTO categories (name) VALUES (?)",
    [categoryName],
    (err, result) => {
      if (err) {
        res.status(500).send(err.message);
      } else {
        res.json(result);
      }
    }
  );
});

// Create a new product
app.post("/products", (req, res) => {
  const { product_name, description, price } = req.body;
  connection.query(
    "INSERT INTO Products (product_name, description, price) VALUES (?, ?, ?)",
    [product_name, description, price],
    (err, result) => {
      if (err) {
        res.status(500).send(err.message);
      } else {
        res.sendStatus(201);
      }
    }
  );
});

// Create a new raw material
app.post("/rawmaterials", (req, res) => {
  const { rawmaterial_name, description } = req.body;
  connection.query(
    "INSERT INTO RawMaterials (rawmaterial_name, description) VALUES (?, ?)",
    [rawmaterial_name, description],
    (err, result) => {
      if (err) {
        res.status(500).send(err.message);
      } else {
        res.sendStatus(201);
      }
    }
  );
});

// Update an outlet
app.put("/outlets/:id", (req, res) => {
  const { outlet_name, address, phone, email } = req.body;
  const outletId = req.params.id;
  connection.query(
    "UPDATE Outlets SET outlet_name = ?, address = ?, phone = ?, email = ? WHERE outlet_id = ?",
    [outlet_name, address, phone, email, outletId],
    (err, result) => {
      if (err) {
        res.status(500).send(err.message);
      } else {
        res.sendStatus(200);
      }
    }
  );
});
