const express = require("express");
const multer = require('multer');
const app = express();
const port = 3001;
const { Client } = require('pg');

var cors = require("cors");

app.use("/uploads", express.static("uploads"));

app.use(cors());

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Specify the folder where images will be stored.
  },
  filename: (req, file, cb) => {
    // Use a unique filename for each image (you can customize this logic).
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  },
});

// Create a multer instance with the storage engine.
const upload = multer({ storage });


const bodyParser = require("body-parser");

app.use(bodyParser.json());

app.use(bodyParser.urlencoded({ extended: true }));

const connection = new Client({
  user: 'root',
  host: 'localhost',
  database: 'ram_shiv_db',
  password: 'RamshivDB',
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

const expenseRoutes = require('./app/routes/expenseRoutes');
app.use('/api/expense', expenseRoutes(connection));

const rawMaterialRoutes = require('./app/routes/rawMaterialRoutes');
app.use('/api/rawMaterial', rawMaterialRoutes(connection));

const employeeRoutes = require('./app/routes/employeeRoutes');
app.use('/api/employee', employeeRoutes(connection));

// Retrieve all products
app.get('/products', (req, res) => {
  const query = `
  SELECT
  p.id,
  p.product_name,
  p.price,
  p.unit,
  p.image_url,
  p.starred,
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
  LEFT JOIN outlet_inventory AS o ON p.id = o.product_id where p.status='active' and p.state='enable'
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
          price,
          unit,
          image_url,
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
            price,
            unit,
            image_url,
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

//Create new employee
app.post("/api/employee/add", upload.single('photo'),  async (req, res) => {
  try{
    const { name, aadhar, mobileno, address, salary, dateofjoining, working_area, dob, fathers_name, mothers_name, account_number, ifsc, bank_name, account_holder_name } =
        req.body;
      const photo = req.file ? req.file.path : '';
      const employeeQuery = `
        INSERT INTO employees (name, aadhar, mobileno, address, salary, dateofjoining, photo, working_area, dob, fathers_name, mothers_name, working_status) VALUES ($1, $2, $3, $4, $5, $6, $7,$8, $9, $10, $11, 'active') RETURNING *`;
        const employeeValues = [name, aadhar, mobileno, address, salary, dateofjoining, photo, working_area, dob, fathers_name, mothers_name];
        const employeeResult = await connection.query(employeeQuery, employeeValues);
        const employeeId = employeeResult.rows[0].employee_id;

        const bankAccountQuery = `
      INSERT INTO employee_bank_details (employee_id ,
        account_number ,
        bank_name ,
        ifsc_number ,
        account_holder_name)
        VALUES ($1, $2, $3, $4, $5) RETURNING *;
    `;
    await connection.query(bankAccountQuery, [employeeId,account_number, bank_name, ifsc, account_holder_name]);
        
  res.status(201).json({ message: 'Employee inserted Successfully' });
} catch (error) {
  console.error('Error inserting product:', error);
  res.status(500).json({ error: 'An error occurred while inserting the product' });
}
});

// Create a new product
app.post("/add-products", upload.single('productImage'),  async (req, res) => {
  try {
    const { product_name, price, unit, category_id, rawMaterial, min_stock } = req.body;

    const image_url = req.file ? req.file.path : '';

    // Insert new product into the products table
    const productQuery = `
    INSERT INTO Products (product_name, price, unit, category_id, min_stock, image_url, state) VALUES ($1, $2, $3, $4, $5, $6, 'enable') RETURNING id`;
    const productValues = [product_name, price, unit, category_id, min_stock, image_url];
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

    const productRawMaterialQuery = `
    INSERT INTO product_raw_materials (product_id, raw_material_id, quantity_required) VALUES ($1, $2, $3) RETURNING *;
    `;

    rawMaterial && rawMaterial.map(async (item) => {
       await connection.query(productRawMaterialQuery, [productId, item.raw_material_id, item.quantity_required]);
    })

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

