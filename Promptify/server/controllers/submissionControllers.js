import { pool } from '../config/database.js';

export const getSubmissionsByUserId = async (req, res) => {
    try {
        const { userId } = req.params;
        const results = await pool.query('SELECT * FROM submissions WHERE author_id = $1', [userId]);

        res.status(200).json(results.rows);
    } catch (error) {
        console.error('Error fetching user submissions by user id:', error);
        res.status(500).json({ error: 'An unexpected error occurred when fetching user submissions by user id' });
    };
};

export const getSubmissionsByChallengeId = async (req, res) => {
    try {
        const { challengeId } = req.params;

        const results = await pool.query('SELECT * FROM submissions WHERE challenge_id = $1', [challengeId]);

        res.status(200).json(results.rows);
    } catch (error) {
        console.error('Error fetching challenge submissions by challenge id:', error);
        res.status(500).json({ error: 'An unexpected error occurred when fetching challenge submissions by challenge id' });
    };
};

export const getSubmissionByUserIdAndChallengeId = async (req, res) => {
    try {
        const { userId, challengeId } = req.params;

        const results = await pool.query('SELECT * FROM submissions WHERE author_id = $1 AND challenge_id = $2', [userId, challengeId]);

        res.status(200).json(results.rows);
    } catch (error) {
        console.error('Error fetching submission for challenge by challenge and user id:', error);
        res.status(500).json({ error: 'An unexpected error occurred when fetching submission for challenge by challenge and user id' });
    }
};

export const createSubmission = async (req, res) => {
    try {
        const { userId, challengeId } = req.params;

        const user = await pool.query('SELECT * FROM users WHERE id = $1', [userId]);

        const checkIfUserAlreadySubmitted = await pool.query('SELECT * FROM submissions WHERE author_id = $1 AND challenge_id = $2', [userId, challengeId]);

        if (checkIfUserAlreadySubmitted.rows.length > 0) {
            return res.status(400).json({ error: 'User has already submitted to this challenge' });
        };

        const {
            title,
            summary,
            content,
            genre,
            started_at,
            submitted_at
        } = req.body;

        const word_count = content.split(' ').length;
        const character_count = content.length;

        const results = await pool.query('INSERT INTO submissions (author_id, challenge_id, title, summary, content, genre, word_count, character_count, started_at, submitted_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *', [userId, challengeId, title, summary, content, genre, word_count, character_count, started_at, submitted_at]);

        if (results.rows.length === 0) {
            return res.status(400).json({ error: 'Submission could not be created' });
        };

        await pool.query('UPDATE challenges SET participation_count = participation_count + 1 WHERE id = $1', [challengeId]);
        await pool.query('UPDATE users SET completed_challenges = completed_challenges + 1, points = points + 50 WHERE id = $1', [userId]);

        let automaticComment;
        let username = user.rows[0].username;

        if (user.rows[0].completed_challenges <= 1) {
            automaticComment = {
                parent_comment_id: null,
                user_id: '11111111-aaaa-aaaa-aaaa-111111111111',
                submission_id: results.rows[0].id,
                content: `Congratulations on submitting your first story, ${username}! We hope you had fun writing it. Good luck!`,
            };
        } else {
            automaticComment = {
                parent_comment_id: null,
                user_id: '11111111-aaaa-aaaa-aaaa-111111111111',
                submission_id: results.rows[0].id,
                content: `Congratulations on submitting your story, ${username}! We hope you had fun writing it. Good luck!`,
            };
        };

        await pool.query('INSERT INTO comments (parent_comment_id, user_id, submission_id, content) VALUES ($1, $2, $3, $4)', [automaticComment.parent_comment_id, automaticComment.user_id, automaticComment.submission_id, automaticComment.content]);

        // TODO: update user badges

        res.status(201).json(results.rows);
    } catch (error) {
        console.error('Error creating submission:', error);
        res.status(500).json({ error: 'An unexpected error occurred when creating submission' });
    }
};

export const editSubmission = async (req, res) => {
    try {
        const { userId, challengeId } = req.params;

        const {
            title,
            summary,
            content,
            genre,
            started_at,
            submitted_at
        } = req.body;

        const word_count = content.split(' ').length;
        const character_count = content.length;

        const results = await pool.query('UPDATE submissions SET title = $1, summary = $2, content = $3, genre = $4, word_count = $5, character_count = $6, started_at = $7, submitted_at = $8 WHERE author_id = $9 AND challenge_id = $10 RETURNING *', [title, summary, content, genre, word_count, character_count, started_at, submitted_at, userId, challengeId]);

        res.status(200).json(results.rows);
    } catch (error) {
        console.error('Error editing submission:', error);
        res.status(500).json({ error: 'An unexpected error occurred when editing submission' });
    }
};

export const deleteSubmission = async (req, res) => {
    try {
        const { userId, challengeId } = req.params;

        const results = await pool.query('DELETE FROM submissions WHERE author_id = $1 AND challenge_id = $2 RETURNING *', [userId, challengeId]);

        if (results.rows.length === 0) {
            return res.status(404).json({ error: 'Submission not found' });
        };

        await pool.query('UPDATE challenges SET submission_count = submission_count - 1 WHERE id = $1', [challengeId]);
        await pool.query('UPDATE users SET completed_challenges = completed_challenges - 1 WHERE id = $1', [userId]);

        res.status(200).json(results.rows);
    } catch (error) {
        console.error('Error deleting submission:', error);
        res.status(500).json({ error: 'An unexpected error occurred when deleting submission' });
    }
};