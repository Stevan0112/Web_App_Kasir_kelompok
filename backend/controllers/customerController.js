import db from '../config/database.js';
import { generateId } from '../utils/helper.js';

export const getCustomers = (req, res) => {
    const sql = 'SELECT * FROM customers';
    db.query(sql, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
};

export const createCustomer = (req, res) => {
    const { name, email, phone, address, gender_id } = req.body;
    const id = generateId(8);
    const sql = 'INSERT INTO customers (CUST_ID, CUST_NAME, EMAIL, CONTACT_NUMBER, ADDRESS, GENDER_ID, DATE_OF_BIRTH, PLACE_OF_BIRTH, CREATED_AT) VALUES (?, ?, ?, ?, ?, ?, "2000-01-01", "City", NOW())';
    const g_id = gender_id || 'L';
    db.query(sql, [id, name, email, phone, address, g_id], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.status(201).json({ id, ...req.body });
    });
};

export const updateCustomer = (req, res) => {
    const { name, email, phone, address } = req.body;
    const { id } = req.params;
    const sql = 'UPDATE customers SET CUST_NAME=?, EMAIL=?, CONTACT_NUMBER=?, ADDRESS=?, UPDATED_AT=NOW() WHERE CUST_ID=?';
    db.query(sql, [name, email, phone, address, id], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Customer updated' });
    });
};

export const deleteCustomer = (req, res) => {
    const { id } = req.params;
    const sql = 'DELETE FROM customers WHERE CUST_ID = ?';
    db.query(sql, [id], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Customer deleted' });
    });
};
