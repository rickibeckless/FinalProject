import { pool } from '../config/database.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export const getChallenges = async (req, res) => {
    try {
        const results = await pool.query('SELECT * FROM challenges');
        res.status(200).json(results.rows);
    } catch (error) {
        console.error('Error fetching challenges:', error);
        res.status(500).json({ error: 'An unexpected error occurred' });
    };
};

export const getChallengeById = async (req, res) => {
    try {
        const results = await pool.query('SELECT * FROM challenges WHERE id = $1', [req.params.id]);
        res.status(200).json(results.rows);

        if (results.rows.length === 0) {
            return res.status(404).json({ error: 'Challenge not found' });
        };

    } catch (error) {
        console.error('Error fetching challenge by ID:', error);
        res.status(500).json({ error: 'An unexpected error occurred' });
    };
};

export const createChallenge = async (req, res) => {
    try {
        const { 
            author_id, 
            name, 
            description, 
            prompt, 
            start_date_time, 
            end_date_time, 
            skill_level, 
            genre, 
            limitations 
        } = req.body;

        const results = await pool.query('INSERT INTO challenges (author_id, name, description, prompt, start_date_time, end_date_time, skill_level, genre, limitations) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *', [author_id, name, description, prompt, start_date_time, end_date_time, skill_level, genre, limitations]);
        res.status(201).json(results.rows);
    } catch (error) {
        console.error('Error creating challenge:', error);
        res.status(500).json({ error: 'An unexpected error occurred' });
    };
};

export const editChallenge = async (req, res) => {
    try {
        const { 
            name, 
            description, 
            prompt, 
            start_date_time, 
            end_date_time, 
            skill_level, 
            genre, 
            limitations 
        } = req.body;

        const results = await pool.query('UPDATE challenges SET name = $1, description = $2, prompt = $3, start_date_time = $4, end_date_time = $5, skill_level = $6, genre = $7, limitations = $8 WHERE id = $9 RETURNING *', [name, description, prompt, start_date_time, end_date_time, skill_level, genre, limitations, req.params.id]);
        res.status(200).json(results.rows);
    } catch (error) {
        console.error('Error updating challenge:', error);
        res.status(500).json({ error: 'An unexpected error occurred' });
    };
};

export const deleteChallenge = async (req, res) => {
    try {
        const results = await pool.query('DELETE FROM challenges WHERE id = $1 RETURNING *', [req.params.id]);
        res.status(200).json(results.rows);
    } catch (error) {
        console.error('Error deleting challenge:', error);
        res.status(500).json({ error: 'An unexpected error occurred' });
    };
};