import { pool } from '../config/database.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { authSession, passport } from '../middleware/auth.js';

const userCheck = async (results, res) => {
    try {
        let updates = [];

        for (let i = 0; i < results.rows.length; i++) {
            const user = results.rows[i];
            const followers = await pool.query('SELECT COUNT(*) FROM user_followers WHERE following_id = $1', [user.id]);
            const following = await pool.query('SELECT COUNT(*) FROM user_followers WHERE follower_id = $1', [user.id]);
            const completedChallenges = await pool.query('SELECT COUNT(*) FROM submissions WHERE author_id = $1', [user.id]);

            updates.push({
                id: user.id,
                followers: followers.rows[0].count,
                following: following.rows[0].count,
                completedChallenges: completedChallenges.rows[0].count
            });
        };

        for (const update of updates) {
            await pool.query('UPDATE users SET followers = $1, following = $2, completed_challenges = $3 WHERE id = $4', [update.followers, update.following, update.completedChallenges, update.id]);
        };
    } catch (error) {
        console.error('Error checking user:', error);
        res.status(500).json({ error: 'An unexpected error occurred' });
    };
};

export const getUsers = async (req, res) => {
    try {
        const results = await pool.query('SELECT * FROM users');

        await userCheck(results, res);

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

        await userCheck(results, res);
        
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

        const adminEmails = process.env.ADMIN_EMAILS.split(', ');
        const isAdmin = email === adminEmails[0] || email === adminEmails[1] ? true : false;

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const welcomeNotification = {
            id: uuidv4(),
            title: "Welcome to Promptify!",
            content: "We're excited to have you on board. Let's get started!",
            type: "account_info",
            status: "unread",
            date_created: new Date().toISOString(),
            date_deleted: null
        };
        
        const results = await pool.query('INSERT INTO users (username, email, password, is_admin, notifications, following) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *', [username, email, hashedPassword, isAdmin, JSON.stringify([welcomeNotification]), 1]);
        const botUser = await pool.query('SELECT * FROM users WHERE id = $1', ['11111111-aaaa-aaaa-aaaa-111111111111']);
        const newBotUserFollowCount = botUser.rows[0].followers + 1;
        
        await pool.query(
            'INSERT INTO user_followers (follower_id, following_id) VALUES ($1, $2)',
            [results.rows[0].id, botUser.rows[0].id]
        );

        await pool.query('UPDATE users SET followers = $1 WHERE id = $2', [newBotUserFollowCount, botUser.rows[0].id]);

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

        await pool.query('UPDATE users SET last_login = $1 WHERE id = $2', [new Date().toISOString(), user.id]);

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
    try {
        const user = await pool.query('SELECT * FROM users WHERE id = $1', [req.params.id]);

        if (user.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        };

        // const userChallenges = await pool.query('SELECT * FROM challenges WHERE author_id = $1', [req.params.id]);
        // const userSubmissions = await pool.query('SELECT * FROM submissions WHERE author_id = $1', [req.params.id]);
        // const userComments = await pool.query('SELECT * FROM comments WHERE user_id = $1', [req.params.id]);

        // if (userChallenges.rows.length > 0) {
        //     for (const challenge of userChallenges.rows) {
        //         await pool.query('UPDATE challenges SET author_id = $1 WHERE id = $2', ['55555555-aaaa-aaaa-aaaa-555555555555', challenge.id]);
        //     };
        // };

        // if (userSubmissions.rows.length > 0) {
        //     for (const submission of userSubmissions.rows) {
        //         await pool.query('UPDATE submissions SET author_id = $1 WHERE id = $2', ['55555555-aaaa-aaaa-aaaa-555555555555', submission.id]);
        //     };
        // };

        // if (userComments.rows.length > 0) {
        //     for (const comment of userComments.rows) {
        //         await pool.query('UPDATE comments SET user_id = $1 WHERE id = $2', ['55555555-aaaa-aaaa-aaaa-555555555555', comment.id]);
        //     };
        // };

        const results = await pool.query('DELETE FROM users WHERE id = $1 RETURNING *', [req.params.id]);

        res.status(200).json(results.rows);
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({ error: 'An unexpected error occurred' });
    };
};