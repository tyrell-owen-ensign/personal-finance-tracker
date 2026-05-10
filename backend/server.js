const express = require('express');
const pool = require('./db');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Test route
app.get('/health', async (req, res) => {
    try {
        await pool.query('SELECT 1');
        res.json({status: 'ok', database: 'connected'});
    } catch (error) {
        res.status(500).json({status: 'error', database: 'disconnected'});
    }
});

// Category Endpoints
// GET
app.get('/categories', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM category');
        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({status: 'error'});
    }
});

// Transaction Endpoints
// GET
app.get('/transactions', async (req, res) => {
    try {
        if (req.query.month == null) {
            const result = await pool.query('SELECT * FROM transaction');
            res.json(result.rows);
        } else {
            const month = req.query.month;
            const result = await pool.query("SELECT * FROM transaction WHERE to_char(date, 'YYYY-MM') = $1", [month]);
            res.json(result.rows);
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({status: 'error'});
    }
});

// POST
app.post('/transactions', async (req, res) => {
    try {
        const {name, type, amount, date, description, category_id} = req.body;
        const result = await pool.query("INSERT INTO transaction (name, type, amount, date, description, category_id) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *",
            [name, type, amount, date, description, category_id]);
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({status: 'error'});
    }
});

// PUT
app.put('/transactions/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const {name, type, amount, date, description, category_id} = req.body;
        const result = await pool.query("UPDATE transaction SET name = $1, type = $2, amount = $3, date = $4, description = $5, category_id = $6 WHERE id = $7 RETURNING *",
            [name, type, amount, date, description, category_id, id]);
        if (result.rows.length === 0) {
            res.status(404).json({status: 'error', message: 'Transaction not found'});
        } else {
            res.json(result.rows[0]);
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({status: 'error'});
    }
});

// DELETE
app.delete('/transactions/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const result = await pool.query("DELETE FROM transaction WHERE id = $1 RETURNING *", [id]);
        if (result.rows.length === 0) {
            res.status(404).json({status: 'error', message: 'Transaction not found'});
        } else {
            res.sendStatus(204);
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({status: 'error'});
    }
});

app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
});