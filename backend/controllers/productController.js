import db from '../config/database.js';

export const getProducts = (req, res) => {
    const sql = `
        SELECT p.*, c.CATEGORY as category_name 
        FROM products p 
        JOIN product_categories c ON p.CATEGORY_ID = c.CATEGORY_ID
    `;
    db.query(sql, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
};

export const createProduct = (req, res) => {
    const { category_id, name, price, stock } = req.body;
    const sql = 'INSERT INTO products (CATEGORY_ID, PRODUCT_NAME, PRICE, STOCK, CREATED_AT, CREATED_BY, UPDATED_AT, UPDATED_BY) VALUES (?, ?, ?, ?, NOW(), "API", NOW(), "API")';
    db.query(sql, [category_id, name, price, stock], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.status(201).json({ id: result.insertId, ...req.body });
    });
};

export const updateProduct = (req, res) => {
    const { category_id, name, price, stock } = req.body;
    const { id } = req.params;
    const sql = 'UPDATE products SET CATEGORY_ID=?, PRODUCT_NAME=?, PRICE=?, STOCK=?, UPDATED_AT=NOW() WHERE PRODUCT_ID=?';
    db.query(sql, [category_id, name, price, stock, id], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Product updated' });
    });
};

export const deleteProduct = (req, res) => {
    const { id } = req.params;
    const sql = 'DELETE FROM products WHERE PRODUCT_ID = ?';
    db.query(sql, [id], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Product deleted' });
    });
};
