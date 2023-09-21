module.exports = (connection) => {
  return {
    getOrders: (req, res) => {
      const { type } = req.query;
      connection.query(
        "SELECT * FROM orders where type=$1;",
        [type],
        (err, result) => {
          if (err) {
            res.status(500).send(err.message);
          } else {
            res.json(result);
          }
        }
      );
    },
    getOrdersTotal: (req, res) => {
      connection.query(
        `SELECT
        'monthly' AS data_type,
        DATE_TRUNC('month', order_date) AS date,
        SUM(total_amount) AS total_amount_all_orders,
        SUM(CASE WHEN type = 'special' THEN total_amount ELSE 0 END) AS total_amount_special_orders,
        SUM(CASE WHEN type = 'normal' THEN total_amount ELSE 0 END) AS total_amount_normal_orders
    FROM orders
    GROUP BY data_type, date
    
    UNION ALL
    
    SELECT
        'daily' AS data_type,
        DATE_TRUNC('day', order_date) AS date,
        SUM(total_amount) AS total_amount_all_orders,
        SUM(CASE WHEN type = 'special' THEN total_amount ELSE 0 END) AS total_amount_special_orders,
        SUM(CASE WHEN type = 'normal' THEN total_amount ELSE 0 END) AS total_amount_normal_orders
    FROM orders
    GROUP BY data_type, date
    ORDER BY data_type, date;`,
        (err, result) => {
          if (err) {
            res.status(500).send(err.message);
          } else {
            res.json(result);
          }
        }
      );
    },
    addOrder: async (req, res) => {
      try {
        const {
          customer_name,
          mobile_number,
          total_amount,
          type,
          customer_address,
          delivery_date,
          delivery_time,
          discount,
          note,
          productsForBill,
        } = req.body;
        const orderQuery = `INSERT INTO orders (customer_name, mobile_number, total_amount, type, order_date,customer_address,delivery_date,delivery_time,discount,note,productsForBill) 
        VALUES ($1, $2, $3, $4, CURRENT_DATE, $5,$6,$7,$8,$9) RETURNING order_id`;
        const orderValues = [
          customer_name,
          mobile_number,
          total_amount,
          type,
          customer_address,
          delivery_date,
          delivery_time,
          discount,
          note,
        ];
        const orderResult = await connection.query(orderQuery, orderValues);
        const orderId = orderResult.rows[0].order_id;

        const orderItemQuery = `INSERT INTO order_items (order_id, product_id, quantity, price) VALUES ($1,$2,$3,$4)`;
        {
          productsForBill &&
            productsForBill.map(async (order_item) => {
              await connection.query(orderItemQuery, [
                orderId,
                order_item.selectedProduct.id,
                order_item.quantity,
                order_item.selectedProduct.price,
              ]);
            });
        }
        res
          .status(201)
          .json({
            message:
              "Order Added successfully",
          });
      } catch (error) {
        console.error("Error inserting product:", error);
        res
          .status(500)
          .json({ error: "An error occurred while inserting the product" });
      }
    },
  };
};
