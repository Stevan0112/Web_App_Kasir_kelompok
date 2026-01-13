import db from '../config/database.js';

export const getTransactions = (req, res) => {
    const sql = `
        SELECT p.ORDER_ID as id, p.ORDER_DATE as transaction_date, p.TOTAL as total_amount, c.CUST_NAME as customer_name 
        FROM orders p 
        LEFT JOIN customers c ON p.CUST_ID = c.CUST_ID
        ORDER BY p.ORDER_DATE DESC
    `;
    db.query(sql, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
};

export const getTransactionById = (req, res) => {
    const { id } = req.params;
    const sqlHeader = `
        SELECT p.ORDER_ID as id, p.ORDER_DATE, p.TOTAL, c.CUST_NAME, c.EMAIL, c.CONTACT_NUMBER 
        FROM orders p 
        LEFT JOIN customers c ON p.CUST_ID = c.CUST_ID 
        WHERE p.ORDER_ID = ?
    `;
    const sqlDetails = `
        SELECT d.PRODUCT_ID, d.QTY, d.PRICE, pr.PRODUCT_NAME 
        FROM order_details d 
        JOIN products pr ON d.PRODUCT_ID = pr.PRODUCT_ID 
        WHERE d.ORDER_ID = ?
    `;

    db.query(sqlHeader, [id], (err, headers) => {
        if (err || headers.length === 0) return res.status(404).json({ error: 'Transaction not found' });

        db.query(sqlDetails, [id], (err, details) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ ...headers[0], items: details });
        });
    });
};

export const createTransaction = (req, res) => {
    const { customer_id, total_amount, items, user_id } = req.body;
    const cashierId = user_id || 'C001';

    const sqlOrder = 'INSERT INTO orders (CUST_ID, TOTAL, USER_ID, ORDER_DATE) VALUES (?, ?, ?, NOW())';
    db.query(sqlOrder, [customer_id, total_amount, cashierId], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });

        const orderId = result.insertId;
        const sqlDetails = 'INSERT INTO order_details (ORDER_ID, PRODUCT_ID, QTY, PRICE) VALUES ?';
        const values = items.map(item => [orderId, item.product_id, item.quantity, item.price]);

        db.query(sqlDetails, [values], (err, resultDetails) => {
            if (err) {
                return res.status(500).json({ error: 'Error inserting details: ' + err.message });
            }
            res.status(201).json({ message: 'Transaction created', id: orderId });
        });
    });
};
