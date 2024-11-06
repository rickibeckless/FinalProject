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
        
        if (results.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        };
        
        res.status(200).json(results.rows);
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

        const adminEmails = process.env.ADMIN_EMAILS.split(',');
        const isAdmin = email === adminEmails[0] || email === adminEmails[1] ? true : false;

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        
        const results = await pool.query('INSERT INTO users (username, email, password, is_admin) VALUES ($1, $2, $3, $4) RETURNING *', [username, email, hashedPassword, isAdmin]);
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

export const editUser = async (req, res) => {
    try {
        const { username, email, about, skill_level, profile_picture_url } = req.body;

        const results = await pool.query('UPDATE users SET username = $1, email = $2, about = $3, skill_level = $4, profile_picture_url = $5 WHERE id = $6 RETURNING *', [username, email, about, skill_level, profile_picture_url, req.params.id]);
        
        if (results.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        };

        res.status(200).json(results.rows);
    } catch (error) {
        console.error('Error editing user:', error);
        res.status(500).json({ error: 'An unexpected error occurred' });
    };
};

export const bookmarkChallenge = async (req, res) => {
    try {
        const { id, challengeId } = req.params;

        const user = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
        const bookmarks = user.rows[0].bookmarked_challenges;
        let updatedBookmarks;

        if (bookmarks.includes(challengeId)) {
            updatedBookmarks = bookmarks.filter(bookmark => bookmark !== challengeId);
        } else {
            updatedBookmarks = [...bookmarks, challengeId];
        };

        const results = await pool.query('UPDATE users SET bookmarked_challenges = $1 WHERE id = $2 RETURNING *', [updatedBookmarks, id]);
        return res.status(200).json(results.rows);
    } catch (error) {
        console.error('Error bookmarking challenge:', error);
        res.status(500).json({ error: 'An unexpected error occurred' });
    };
};

export const deleteUser = async (req, res) => {
    // TODO: Add functionality to change users challenges, submissions, and comments to a default `deleted_user` user
    try {
        const results = await pool.query('DELETE FROM users WHERE id = $1 RETURNING *', [req.params.id]);
        
        if (results.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        };
        
        res.status(200).json(results.rows);
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({ error: 'An unexpected error occurred' });
    };
};