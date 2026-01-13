import db from '../config/database.js';
import { generateId } from '../utils/helper.js';

export const getCategories = (req, res) => {
    const sql = 'SELECT * FROM product_categories';
    db.query(sql, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
};

export const createCategory = (req, res) => {
    const { name } = req.body;
    const id = generateId(2);
    const sql = 'INSERT INTO product_categories (CATEGORY_ID, CATEGORY) VALUES (?, ?)';
    db.query(sql, [id, name], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.status(201).json({ id, name });
    });
};

export const updateCategory = (req, res) => {
    const { name } = req.body;
    const { id } = req.params;
    const sql = 'UPDATE product_categories SET CATEGORY = ? WHERE CATEGORY_ID = ?';
    db.query(sql, [name, id], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Category updated' });
    });
};

export const deleteCategory = (req, res) => {
    const { id } = req.params;
    const sql = 'DELETE FROM product_categories WHERE CATEGORY_ID = ?';
    db.query(sql, [id], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Category deleted' });
    });
};
