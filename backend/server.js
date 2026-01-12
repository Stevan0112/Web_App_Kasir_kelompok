const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Database Connection
const db = mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'genexmart'
});

db.connect((err) => {
    if (err) {
        console.error('Error connecting to database:', err);
        return;
    }
    console.log('Connected to MySQL Database');
});

// Basic Route
app.get('/', (req, res) => {
    res.send('Backend API is running...');
});

// Helper to generate IDs (simple alpha-numeric)
const generateId = (length) => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
};

// --- API ROUTES (Using genexmart.sql schema) ---

// 1. PRODUCT CATEGORIES (Table: product_categories)
// Cols: CATEGORY_ID (char 2), CATEGORY
app.get('/api/categories', (req, res) => {
    const sql = 'SELECT * FROM product_categories';
    db.query(sql, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

app.post('/api/categories', (req, res) => {
    const { name } = req.body; // name maps to CATEGORY
    const id = generateId(2); // Generate 2-char ID
    const sql = 'INSERT INTO product_categories (CATEGORY_ID, CATEGORY) VALUES (?, ?)';
    db.query(sql, [id, name], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.status(201).json({ id, name });
    });
});

app.put('/api/categories/:id', (req, res) => {
    const { name } = req.body;
    const { id } = req.params;
    const sql = 'UPDATE product_categories SET CATEGORY = ? WHERE CATEGORY_ID = ?';
    db.query(sql, [name, id], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Category updated' });
    });
});

app.delete('/api/categories/:id', (req, res) => {
    const { id } = req.params;
    const sql = 'DELETE FROM product_categories WHERE CATEGORY_ID = ?';
    db.query(sql, [id], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Category deleted' });
    });
});

// 2. PRODUCTS (Table: products)
// Cols: PRODUCT_ID (AI), PRODUCT_NAME, PRICE, CATEGORY_ID, STOCK, (No desc/image_url in genexmart.sql usually, but kept from requirement if altering, otherwise just map basic)
// genexmart.sql columns: PRODUCT_ID, PRODUCT_NAME, PRICE, CATEGORY_ID, CREATED_AT, CREATED_BY, UPDATED_AT, UPDATED_BY, STOCK
// Note: Created/Updated AT/BY are required constraints usually? We will try default or pass dummy.
app.get('/api/products', (req, res) => {
    const sql = `
        SELECT p.*, c.CATEGORY as category_name 
        FROM products p 
        JOIN product_categories c ON p.CATEGORY_ID = c.CATEGORY_ID
    `;
    db.query(sql, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

app.post('/api/products', (req, res) => {
    const { category_id, name, price, stock } = req.body;
    // Assuming Created/Updated cols have default or we pass NOW()
    const sql = 'INSERT INTO products (CATEGORY_ID, PRODUCT_NAME, PRICE, STOCK, CREATED_AT, CREATED_BY, UPDATED_AT, UPDATED_BY) VALUES (?, ?, ?, ?, NOW(), "API", NOW(), "API")';
    db.query(sql, [category_id, name, price, stock], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.status(201).json({ id: result.insertId, ...req.body });
    });
});

app.put('/api/products/:id', (req, res) => {
    const { category_id, name, price, stock } = req.body;
    const { id } = req.params;
    const sql = 'UPDATE products SET CATEGORY_ID=?, PRODUCT_NAME=?, PRICE=?, STOCK=?, UPDATED_AT=NOW() WHERE PRODUCT_ID=?';
    db.query(sql, [category_id, name, price, stock, id], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Product updated' });
    });
});

app.delete('/api/products/:id', (req, res) => {
    const { id } = req.params;
    const sql = 'DELETE FROM products WHERE PRODUCT_ID = ?';
    db.query(sql, [id], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Product deleted' });
    });
});

// 3. CUSTOMERS (Table: customers)
// Cols: CUST_ID (char), CUST_NAME, ADDRESS, PLACE_OF_BIRTH, DATE_OF_BIRTH, CONTACT_NUMBER, EMAIL, GENDER_ID, timestamps...
// Simplified for API if possible, but must match constraints.
app.get('/api/customers', (req, res) => {
    const sql = 'SELECT * FROM customers';
    db.query(sql, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

app.post('/api/customers', (req, res) => {
    const { name, email, phone, address, gender_id } = req.body;
    const id = generateId(8);
    // Need defaults for birth/gender if not provided? Assuming req.body has them or we provide logical defaults
    const sql = 'INSERT INTO customers (CUST_ID, CUST_NAME, EMAIL, CONTACT_NUMBER, ADDRESS, GENDER_ID, DATE_OF_BIRTH, PLACE_OF_BIRTH, CREATED_AT) VALUES (?, ?, ?, ?, ?, ?, "2000-01-01", "City", NOW())';
    // Fallback gender 'L' if not provided?
    const g_id = gender_id || 'L';
    db.query(sql, [id, name, email, phone, address, g_id], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.status(201).json({ id, ...req.body });
    });
});

app.put('/api/customers/:id', (req, res) => {
    const { name, email, phone, address } = req.body;
    const { id } = req.params;
    const sql = 'UPDATE customers SET CUST_NAME=?, EMAIL=?, CONTACT_NUMBER=?, ADDRESS=?, UPDATED_AT=NOW() WHERE CUST_ID=?';
    db.query(sql, [name, email, phone, address, id], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Customer updated' });
    });
});

app.delete('/api/customers/:id', (req, res) => {
    const { id } = req.params;
    const sql = 'DELETE FROM customers WHERE CUST_ID = ?';
    db.query(sql, [id], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Customer deleted' });
    });
});

// 4. TRANSACTION (Table: orders & order_details)
// orders: ORDER_ID (AI), ORDER_DATE, CUST_ID, USER_ID (Cashier), TOTAL, METHOD_ID, ...
// order_details: QTY, PRICE, ORDER_ID, PRODUCT_ID
app.get('/api/penjualan', (req, res) => {
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
});

app.get('/api/penjualan/:id', (req, res) => {
    const { id } = req.params;
    // Get Header
    const sqlHeader = `
        SELECT p.ORDER_ID as id, p.ORDER_DATE, p.TOTAL, c.CUST_NAME, c.EMAIL, c.CONTACT_NUMBER 
        FROM orders p 
        LEFT JOIN customers c ON p.CUST_ID = c.CUST_ID 
        WHERE p.ORDER_ID = ?
    `;
    // Get Details
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
});

app.post('/api/penjualan', (req, res) => {
    const { customer_id, total_amount, items, user_id } = req.body;
    // items = [{ product_id, quantity, price }]
    // Need user_id for cashier? Default to a known one if missing or handle constraints
    const cashierId = user_id || 'C001'; // Example default cashier

    const sqlOrder = 'INSERT INTO orders (CUST_ID, TOTAL, USER_ID, ORDER_DATE) VALUES (?, ?, ?, NOW())';
    db.query(sqlOrder, [customer_id, total_amount, cashierId], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });

        const orderId = result.insertId;
        const sqlDetails = 'INSERT INTO order_details (ORDER_ID, PRODUCT_ID, QTY, PRICE) VALUES ?';

        // Prepare bulk insert data
        const values = items.map(item => [orderId, item.product_id, item.quantity, item.price]);

        db.query(sqlDetails, [values], (err, resultDetails) => {
            if (err) {
                return res.status(500).json({ error: 'Error inserting details: ' + err.message });
            }
            res.status(201).json({ message: 'Transaction created', id: orderId });
        });
    });
});

// Start Server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
