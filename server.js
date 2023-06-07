const express = require("express");
const app = express();
const port = 3002;
const { Client } = require('pg');

var cors = require("cors");

app.use(cors());

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

const bodyParser = require("body-parser");

app.use(bodyParser.json());

app.use(bodyParser.urlencoded({ extended: true }));

const connection = new Client({
  user: 'root',
  host: 'dpg-chu4v2ndvk4olivdc7og-a',
  database: 'ram_shiv_db',
  password: 'aAEKnxPOX7EksJRIb0fAR6Zh0dQckQq7',
  port: 5432, // default PostgreSQL port
});

// const connection = mysql.createConnection({
//   host: "",
//   user: "root",
//   password: "Aakash12@",
//   database: "ram-shiv-db",
// });

connection.connect((err) => {
  if (err) {
    console.error('Error connecting to PostgreSQL:', err);
  } else {
    console.log('Connected to PostgreSQL database!');
  }
});

// Retrieve all products
app.get('/products', (req, res) => {
  const query = `
  SELECT
  p.id,
  p.product_name,
  c.id AS category_id,
  c.name AS category_name,
  w.warehouse_id,
  w.quantity_available AS warehouse_qty,
  o.outlet_id,
  o.quantity_available AS outlet_qty
FROM
  products AS p
  JOIN categories AS c ON p.category_id = c.id
  LEFT JOIN warehouse_inventory AS w ON p.id = w.product_id
  LEFT JOIN outlet_inventory AS o ON p.id = o.product_id
  `;

  connection.query(query, (error, result) => {
    if (error) {
      res.status(500).json({ error: error.message });
    } else {
      const productData = [];
      
      for (const row of result.rows) {
        const {
          id,
          product_name,
          category_id,
          category_name,
          warehouse_id,
          warehouse_qty,
          outlet_id,
          outlet_qty,
        } = row;
        
        const product = productData.find((p) => p.id === id);
        if (product) {
          if (warehouse_id && warehouse_qty !== null) {
            product.warehouse_stock.push({
              warehouse_id,
              quantity: warehouse_qty,
            });
          }
  
          if (outlet_id && outlet_qty !== null) {
            product.outlet_stock.push({
              outlet_id,
              quantity: outlet_qty,
            });
          }
        } else {
          const newProduct = {
            id,
            product_name,
            category: {
              category_id,
              category_name,
            },
            warehouse_stock: [],
            outlet_stock: [],
          };
  
          if (warehouse_id && warehouse_qty !== null) {
            newProduct.warehouse_stock.push({
              warehouse_id,
              quantity: warehouse_qty,
            });
          }
  
          if (outlet_id && outlet_qty !== null) {
            newProduct.outlet_stock.push({
              outlet_id,
              quantity: outlet_qty,
            });
          }
  
          productData.push(newProduct);
        }
      }
  
      res.json(productData);
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

//Add new category
app.post("/categories", (req, res) => {
  const { categoryName } = req.body;
  connection.query(
    "INSERT INTO categories (name) VALUES ($1) RETURNING *",
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

//Get  categories
app.get("/get-categories", (req, res) => {
  const { categoryName } = req.body;
  connection.query(
  `SELECT c.name, c.id, COUNT(p.id) AS product_count FROM categories c
    LEFT JOIN products p ON c.id = p.category_id
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
});

// Create a new product
app.post("/add-products", (req, res) => {
  const { product_name, category_id, price, unit } = req.body;
  connection.query(
    "INSERT INTO Products (product_name, price, category_id, unit) VALUES (?, ?, ?, ?)",
    [product_name, price, category_id, unit],
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

//Add new expense
app.post("/add-expense", (req, res) => {
  const { amount, description, outlet_id } = req.body;
  const currentDate = new Date();
  connection.query(
    "INSERT INTO expenses (amount, description, outlet_id, expense_date) VALUES (?, ?, ?, ?)",
    [amount, description, outlet_id, currentDate],
    (err, result) => {
      if (err) {
        res.status(500).send(err.message);
      } else {
        res.json(result);
      }
    }
  );
});

//Get expense
app.post("/get-expense", (req, res) => {
  const { outlet_id } = req.body;
  connection.query(
    "SELECT * from expenses where outlet_id = ?",
    [outlet_id],
    (err, result) => {
      if (err) {
        res.status(500).send(err.message);
      } else {
        res.json(result);
      }
    }
  );
});

//Update stocks
app.post("./update-stock", (req, res) => {
  const { warehouseStock, outletStock, productId } = req.body;
  connection.query(
    "UPDATE warehouse_inventory SET quantity_available = ? where product_id = ?",
    [warehouseStock, productId],
    (err, result) => {
      if (err) {
        res.status(500).send(err.message);
      } else {
        connection.query(
          "UPDATE outlet_inventory SET quantity_available = ? where product_id = ?",
          [outletStock, productId],
          (err, result2) => {
            if (err) {
              res.status(500).send(err.message);
            } else {
              res.json(result2);
            }
          }
        );
      }
    }
  );
});
