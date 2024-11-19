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
};

export const checkIfUserFollows = async (req, res) => {
    try {
        const { userId, followingId } = req.params;

        const existingFollow = await pool.query('SELECT * FROM user_followers WHERE follower_id = $1 AND following_id = $2', [userId, followingId]);

        if (existingFollow.rows.length > 0) {
            res.status(200).json({ message: true });
        } else {
            res.status(200).json({ message: false });
        };
    } catch (error) {
        console.error('Error checking if user follows another user:', error);
        res.status(500).json({ error: 'An unexpected error occurred when checking if user follows another user' });
    };
};

export const followUser = async (req, res) => {
    try {
        const { userId, followingId } = req.params;

        // check if user is already following the user
        const existingFollow = await pool.query('SELECT * FROM user_followers WHERE follower_id = $1 AND following_id = $2', [userId, followingId]);

        if (existingFollow.rows.length > 0) {
            // unfollow user
            await pool.query('DELETE FROM user_followers WHERE follower_id = $1 AND following_id = $2', [userId, followingId]);

            await pool.query('UPDATE users SET following = following - 1 WHERE id = $1', [userId]);
            await pool.query('UPDATE users SET followers = followers - 1 WHERE id = $1', [followingId]);
            console.log('User unfollowed successfully');
        } else {
            await pool.query('INSERT INTO user_followers (follower_id, following_id) VALUES ($1, $2)', [userId, followingId]);

            await pool.query('UPDATE users SET following = following + 1 WHERE id = $1', [userId]);
            await pool.query('UPDATE users SET followers = followers + 1 WHERE id = $1', [followingId]);
            console.log('User followed successfully');
        };

        res.status(200).json({ message: 'User follow updated successfully' });
    } catch (error) {
        console.error('Error following user:', error);
        res.status(500).json({ error: 'An unexpected error occurred when following user' });
    };
};