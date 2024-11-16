import { pool } from '../config/database.js';

export const getAllFollowersByUserId = async (req, res) => {
    try {
        const { userId } = req.params;

        const followers = await pool.query('SELECT * FROM user_followers WHERE following_id = $1', [userId]);

        const results = await pool.query('SELECT * FROM users WHERE id = ANY($1)', [followers.rows.map(follower => follower.follower_id)]);

        res.status(200).json(results.rows);
    } catch (error) {
        console.error('Error fetching followers by user id:', error);
        res.status(500).json({ error: 'An unexpected error occurred when fetching followers by user id' });
    };
};

export const getAllFollowingByUserId = async (req, res) => {
    try {
        const { userId } = req.params;

        const following = await pool.query('SELECT * FROM user_followers WHERE follower_id = $1', [userId]);

        const results = await pool.query('SELECT * FROM users WHERE id = ANY($1)', [following.rows.map(following => following.following_id)]);

        res.status(200).json(results.rows);
    } catch (error) {
        console.error('Error fetching following by user id:', error);
        res.status(500).json({ error: 'An unexpected error occurred when fetching following by user id' });
    };
}