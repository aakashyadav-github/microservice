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


const userRoutes = require('./app/routes/userRoutes');
app.use('/api/users', userRoutes(connection));

const outletRoutes = require('./app/routes/outletRoutes');
app.use('/api/outlet', outletRoutes(connection));

const categoryRoutes = require('./app/routes/categoryRoutes');
app.use('/api/category', categoryRoutes(connection));

const productRoutes = require('./app/routes/productRoutes');
app.use('/api/product', productRoutes(connection));

const orderRoutes = require('./app/routes/orderRoutes');
app.use('/api/order', orderRoutes(connection));

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
  LEFT JOIN outlet_inventory AS o ON p.id = o.product_id where p.status='active'
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
            const warehouseStock = product.warehouse_stock.find(
              (stock) => stock.warehouse_id === warehouse_id
            );
            if(!warehouseStock){
            product.warehouse_stock.push({
              warehouse_id,
              quantity: warehouse_qty,
            });
          }
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
            const warehouseStock = newProduct.warehouse_stock.find(
              (stock) => stock.warehouse_id === warehouse_id
            );
            if(!warehouseStock){
            newProduct.warehouse_stock.push({
              warehouse_id,
              quantity: warehouse_qty,
            });
          }
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

// Create a new product
app.post("/add-products",  async (req, res) => {
  try {
    const { product_name, price, unit, category_id } = req.body;

    // Insert new product into the products table
    const productQuery = `
    INSERT INTO Products (product_name, price, unit, category_id) VALUES ($1, $2, $3, $4) RETURNING id`;
    const productValues = [product_name, price, unit, category_id];
    const productResult = await connection.query(productQuery, productValues);
    const productId = productResult.rows[0].id;

    // Update warehouse inventory for the new product to 0
    const warehouseInventoryQuery = `
      INSERT INTO warehouse_inventory (warehouse_id, product_id, quantity_available)
      SELECT warehouse_id, $1, 0
      FROM warehouse
    `;
    await connection.query(warehouseInventoryQuery, [productId]);

    // Set outlet inventory for the new product to 0
    const outletInventoryQuery = `
      INSERT INTO outlet_inventory (outlet_id, product_id, quantity_available)
      SELECT outlet_id, $1, 0
      FROM outlets
    `;
    await connection.query(outletInventoryQuery, [productId]);

    res.status(201).json({ message: 'Product inserted and inventory set to 0 for all outlets and warehouses' });
  } catch (error) {
    console.error('Error inserting product:', error);
    res.status(500).json({ error: 'An error occurred while inserting the product' });
  }
});


// Create a new raw material
app.post("/rawmaterials", (req, res) => {
  const { rawmaterial_name, description } = req.body;
  connection.query(
    "INSERT INTO RawMaterials (rawmaterial_name, description) VALUES ($1, $2) RETURNING *",
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

//Add new expense
app.post("/add-expense", (req, res) => {
  const { amount, description, outlet_id } = req.body;
  const currentDate = new Date();
  connection.query(
    "INSERT INTO expenses (amount, description, outlet_id, expense_date) VALUES ($1, $2, $3, $4) RETURNING *",
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
    "SELECT * from expenses where outlet_id = $1",
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
app.post("/update-stock", (req, res) => {
  const { warehouseStock, outletStock, productId, outletId, warehouseId } = req.body;
  connection.query(
    "UPDATE warehouse_inventory SET quantity_available = $1 where product_id = $2 and warehouse_id = $3",
    [warehouseStock, productId, warehouseId],
    (err, result) => {
      if (err) {
        res.status(500).send(err.message);
      } else {
        connection.query(
          "UPDATE outlet_inventory SET quantity_available = $1 where product_id = $2 and outlet_id = $3",
          [outletStock, productId, outletId],
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

