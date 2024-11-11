import { pool } from '../config/database.js';

export const getAllComments = async (req, res) => {
    try {
        const results = await pool.query('SELECT * FROM comments');

        res.status(200).json(results.rows);
    } catch (error) {
        console.error('Error fetching comments:', error);
        res.status(500).json({ error: 'An unexpected error occurred when fetching comments' });
    };
};

export const getAllGivenCommentsByUserId = async (req, res) => {
    try {
        const { userId } = req.params;

        const results = await pool.query('SELECT * FROM comments WHERE user_id = $1', [userId]);

        res.status(200).json(results.rows);
    } catch (error) {
        console.error('Error fetching given comments by user id:', error);
        res.status(500).json({ error: 'An unexpected error occurred when fetching given comments by user id' });
    };
};

export const getAllReceivedCommentsByUserId = async (req, res) => {
    try {
        const { userId } = req.params;

        const submissions = await pool.query('SELECT * FROM submissions WHERE author_id = $1', [userId]);
        const submissionIds = submissions.rows.map(submission => submission.id);

        const results = await pool.query('SELECT * FROM comments WHERE submission_id = ANY($1)', [submissionIds]);

        res.status(200).json(results.rows);
    } catch (error) {
        console.error('Error fetching received comments by user id:', error);
        res.status(500).json({ error: 'An unexpected error occurred when fetching received comments by user id' });
    };
};

export const getAllCommentsBySubmissionId = async (req, res) => {
    try {
        const { submissionId } = req.params;

        const results = await pool.query('SELECT * FROM comments WHERE submission_id = $1', [submissionId]);

        res.status(200).json(results.rows);
    } catch (error) {
        console.error('Error fetching comments by submission id:', error);
        res.status(500).json({ error: 'An unexpected error occurred when fetching comments by submission id' });
    };
};

export const getAllCommentsByChallengeId = async (req, res) => {
    try {
        const { challengeId } = req.params;

        const submissions = await pool.query('SELECT * FROM submissions WHERE challenge_id = $1', [challengeId]);
        const submissionIds = submissions.rows.map(submission => submission.id);

        const results = await pool.query('SELECT * FROM comments WHERE submission_id = ANY($1)', [submissionIds]);

        res.status(200).json(results.rows);
    } catch (error) {
        console.error('Error fetching comments by challenge id:', error);
        res.status(500).json({ error: 'An unexpected error occurred when fetching comments by challenge id' });
    };
};

export const createNewComment = async (req, res) => {
    try {
        const { userId, submissionId } = req.params;

        const user = await pool.query('SELECT * FROM users WHERE id = $1', [userId]);
        const submission = await pool.query('SELECT * FROM submissions WHERE id = $1', [submissionId]);

        if (user.rows.length === 0) {
            return res.status(400).json({ error: 'User does not exist' });
        };

        if (submission.rows.length === 0) {
            return res.status(400).json({ error: 'Submission does not exist' });
        };

        const {
            parent_comment_id,
            content
        } = req.body;

        const results = await pool.query('INSERT INTO comments (parent_comment_id, user_id, submission_id, content) VALUES ($1, $2, $3, $4) RETURNING *', [parent_comment_id, userId, submissionId, content]);

        res.status(201).json(results.rows[0]);
    } catch (error) {
        console.error('Error creating new comment:', error);
        res.status(500).json({ error: 'An unexpected error occurred when creating new comment' });
    };
};

export const updateCommentByCommentId = async (req, res) => {
    try {
        const { commentId } = req.params;

        const comment = await pool.query('SELECT * FROM comments WHERE id = $1', [commentId]);

        if (comment.rows.length === 0) {
            return res.status(400).json({ error: 'Comment does not exist' });
        };

        const { content } = req.body;

        const results = await pool.query('UPDATE comments SET content = $1 WHERE id = $2 RETURNING *', [content, commentId]);

        res.status(200).json(results.rows[0]);
    } catch (error) {
        console.error('Error updating comment by comment id:', error);
        res.status(500).json({ error: 'An unexpected error occurred when updating comment by comment id' });
    };
};

export const deleteCommentByCommentId = async (req, res) => {
    try {
        const { commentId } = req.params;

        const comment = await pool.query('SELECT * FROM comments WHERE id = $1', [commentId]);

        if (comment.rows.length === 0) {
            return res.status(400).json({ error: 'Comment does not exist' });
        };

        await pool.query('DELETE FROM comments WHERE id = $1', [commentId]);

        res.status(204).json();
    } catch (error) {
        console.error('Error deleting comment by comment id:', error);
        res.status(500).json({ error: 'An unexpected error occurred when deleting comment by comment id' });
    };
};