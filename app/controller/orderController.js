module.exports = (connection) => {
  return {
    getOrders: (req, res) => {
      const { type } = req.query;
      connection.query(
        `SELECT
        o.*,
        json_agg(oi.*) AS order_items
      FROM orders AS o
      LEFT JOIN order_items AS oi ON o.order_id = oi.order_id where type=$1
      GROUP BY o.order_id
      ORDER BY o.delivery_date;`,
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
          advance_amount,
          pending_amount,
          type,
          customer_address,
          delivery_date,
          delivery_time,
          discount,
          note,
          productsForBill,
          outletId,
        } = req.body;
        const orderQuery = `INSERT INTO orders (customer_name, mobile_number, total_amount, advance_amount, pending_amount, type, order_date,customer_address,delivery_date,delivery_time,discount,note) 
        VALUES ($1, $2, $3, $4, $5, $6, CURRENT_DATE, $7,$8,$9,$10,$11) RETURNING order_id`;
        const orderValues = [
          customer_name,
          mobile_number,
          total_amount,
          advance_amount,
          pending_amount,
          type,
          customer_address,
          delivery_date,
          delivery_time,
          discount,
          note,
        ];
        const orderResult = await connection.query(orderQuery, orderValues);
        const orderId = orderResult.rows[0].order_id;

        const orderItemQuery = `INSERT INTO order_items (order_id, product_id, quantity, price, product_name, category_name, product_unit) VALUES ($1,$2,$3,$4,$5,$6,$7)`;
        const outletInventoryQuery = `UPDATE outlet_inventory SET quantity_available = quantity_available - $1 where product_id = $2 and outlet_id = $3;`;
        {
          productsForBill &&
            productsForBill.map(async (order_item) => {
              await connection.query(orderItemQuery, [
                orderId,
                order_item.selectedProduct.id,
                order_item.quantity,
                order_item.selectedProduct.price,
                order_item.selectedProduct.product_name,
                order_item.selectedProduct.category.category_name,
                order_item.selectedProduct.unit,
              ]);
              await connection.query (outletInventoryQuery, [
                order_item.quantity,
                order_item.selectedProduct.id,
                outletId
              ])
            });
        }
        res
          .status(201)
          .json({
            message:
              "Order Added successfully",
              orderId: orderId
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
