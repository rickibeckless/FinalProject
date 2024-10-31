import { pool } from '../config/database.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { authSession, passport } from '../middleware/auth.js';

export const getUsers = async (req, res) => {
    try {
        const results = await pool.query('SELECT * FROM users');
        res.status(200).json(results.rows);
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ error: 'An unexpected error occurred' });
    };
};

export const getUserById = async (req, res) => {
    try {
        const results = await pool.query('SELECT * FROM users WHERE id = $1', [req.params.id]);
        res.status(200).json(results.rows);

        if (results.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        };

    } catch (error) {
        console.error('Error fetching user by ID:', error);
        res.status(500).json({ error: 'An unexpected error occurred' });
    };
};

export const createUserWithConventional = async (req, res) => {
    try {
        const { username, email, password } = req.body;

        const checkUser = await pool.query('SELECT * FROM users WHERE email = $1', [email]);

        if (checkUser.rows.length > 0) {
            return res.status(400).json({ error: 'User already exists' });
        };

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        
        const results = await pool.query('INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING *', [username, email, hashedPassword]);
        res.status(201).json(results.rows);
    } catch (error) {
        console.error('Error creating user:', error);
        res.status(500).json({ error: 'An unexpected error occurred' });
    };
};

export const loginUserWithConventional = async (req, res) => {
    try {
        const { username_email, password } = req.body;
        let results;

        if (username_email.includes('@')) {
            results = await pool.query('SELECT * FROM users WHERE email = $1', [username_email]);
        } else {
            results = await pool.query('SELECT * FROM users WHERE username = $1', [username_email]);
        }

        if (results.rows.length === 0) {
            return res.status(400).json({ error: 'Invalid credentials' });
        };

        const user = results.rows[0];
        const validPassword = await bcrypt.compare(password, user.password);

        if (!validPassword) {
            return res.status(400).json({ error: 'Invalid credentials' });
        };

        const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '5h' });
        res.status(200).json({ token });
    } catch (error) {
        console.error('Error logging in user:', error);
        res.status(500).json({ error: 'An unexpected error occurred' });
    };
};