import { pool } from '../config/database.js';

export const getAllUpvotes = async (req, res) => {
    try {
        const results = await pool.query('SELECT * FROM upvotes');

        res.status(200).json(results.rows);
    } catch (error) {
        console.error('Error fetching upvotes:', error);
        res.status(500).json({ error: 'An unexpected error occurred when fetching upvotes' });
    };
};

export const getAllGivenUpvotesByUserId = async (req, res) => {
    try {
        const { userId } = req.params;

        const results = await pool.query('SELECT * FROM upvotes WHERE user_id = $1', [userId]);

        res.status(200).json(results.rows);
    } catch (error) {
        console.error('Error fetching given upvotes by user id:', error);
        res.status(500).json({ error: 'An unexpected error occurred when fetching given upvotes by user id' });
    };
};

export const getAllReceivedUpvotesByUserId = async (req, res) => {
    try {
        const { userId } = req.params;

        const submissions = await pool.query('SELECT * FROM submissions WHERE author_id = $1', [userId]);
        const submissionIds = submissions.rows.map(submission => submission.id);

        const results = await pool.query('SELECT * FROM upvotes WHERE submission_id = ANY($1)', [submissionIds]);

        res.status(200).json(results.rows);
    } catch (error) {
        console.error('Error fetching received upvotes by user id:', error);
        res.status(500).json({ error: 'An unexpected error occurred when fetching received upvotes by user id' });
    };
};

export const getAllUpvotesBySubmissionId = async (req, res) => {
    try {
        const { submissionId } = req.params;

        const results = await pool.query('SELECT * FROM upvotes WHERE submission_id = $1', [submissionId]);

        res.status(200).json(results.rows);
    } catch (error) {
        console.error('Error fetching upvotes by submission id:', error);
        res.status(500).json({ error: 'An unexpected error occurred when fetching upvotes by submission id' });
    };
};

export const getAllUpvotesByChallengeId = async (req, res) => {
    try {
        const { challengeId } = req.params;

        const submissions = await pool.query('SELECT * FROM submissions WHERE challenge_id = $1', [challengeId]);
        const submissionIds = submissions.rows.map(submission => submission.id);

        const results = await pool.query('SELECT * FROM upvotes WHERE submission_id = ANY($1)', [submissionIds]);

        res.status(200).json(results.rows);
    } catch (error) {
        console.error('Error fetching upvotes by challenge id:', error);
        res.status(500).json({ error: 'An unexpected error occurred when fetching upvotes by challenge id' });
    };
};

export const handleUpvote = async (req, res) => {
    try {
        const { submissionId } = req.params;
        const { userId } = req.body;
        let guestAccount = false;

        if (!userId) {
            guestAccount = true;
        } else {
            const checkIfUserAlreadyUpvoted = await pool.query('SELECT * FROM upvotes WHERE user_id = $1 AND submission_id = $2', [userId, submissionId]);

            if (checkIfUserAlreadyUpvoted.rows.length > 0) {
                await pool.query('DELETE FROM upvotes WHERE user_id = $1 AND submission_id = $2', [userId, submissionId]);

                return res.status(200).json({ message: 'Upvote removed' });
            };
        };

        await pool.query('INSERT INTO upvotes (user_id, submission_id, guest_account) VALUES ($1, $2, $3)', [userId, submissionId, guestAccount]);

        res.status(201).json({ message: 'Upvote created' });
    } catch (error) {
        console.error('Error handling upvote:', error);
        res.status(500).json({ error: 'An unexpected error occurred when handling upvote' });
    };
};