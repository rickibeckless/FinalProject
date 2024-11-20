import { pool } from '../config/database.js';

export const checkScore = async (submission) => {
    try {
        const totalScore = 100;
        let score = totalScore;

        const challengeResults = await pool.query('SELECT * FROM challenges WHERE id = $1', [submission.challenge_id]);
        const challenge = challengeResults.rows[0];

        const challengeLimitations = challenge.limitations;
        const timeLimit = challengeLimitations.time_limit.min || challengeLimitations.time_limit.max;
        const wordLimit = challengeLimitations.word_limit.min || challengeLimitations.word_limit.max;
        const characterLimit = challengeLimitations.character_limit.min || challengeLimitations.character_limit.max;
        const requiredPhrase = challengeLimitations.required_phrase.length > 0;

        let trueLimits = [];

        if (timeLimit) trueLimits.push(timeLimit);
        if (wordLimit) trueLimits.push(wordLimit);
        if (characterLimit) trueLimits.push(characterLimit);
        if (requiredPhrase) trueLimits.push(requiredPhrase);

        if (trueLimits.length === 0) {
            return score;
        };

        const weight = trueLimits.length > 0 ? totalScore / trueLimits.length : 0;

        if (challengeLimitations.time_limit.min) {
            const timeLimitMin = challengeLimitations.time_limit.min * 60000;
            const timeDifference = Math.abs(new Date(submission.submitted_at) - new Date(submission.started_at)) / 60000;

            if (timeDifference < timeLimitMin) {
                score -= weight;
            }
        }

        if (challengeLimitations.time_limit.max) {
            const timeLimitMax = challengeLimitations.time_limit.max * 60000;
            const timeDifference = Math.abs(new Date(submission.submitted_at) - new Date(submission.started_at)) / 60000;

            if (timeDifference > timeLimitMax) {
                score -= weight;
            }
        }

        if (challengeLimitations.word_limit.min) {
            if (submission.word_count < challengeLimitations.word_limit.min) {
                score -= weight;
            }
        }
        if (challengeLimitations.word_limit.max) {
            if (submission.word_count > challengeLimitations.word_limit.max) {
                score -= weight;
            }
        }

        if (challengeLimitations.character_limit.min) {
            if (submission.character_count < challengeLimitations.character_limit.min) {
                score -= weight;
            }
        }
        if (challengeLimitations.character_limit.max) {
            if (submission.character_count > challengeLimitations.character_limit.max) {
                score -= weight;
            }
        }

        if (challengeLimitations.required_phrase.length > 0) {
            const dividedWeight = weight / challengeLimitations.required_phrase.length;

            for (let i = 0; i < challengeLimitations.required_phrase.length; i++) {
                if (!submission.content.includes(challengeLimitations.required_phrase[i])) {
                    score -= dividedWeight;
                }
            }
        }

        score = Math.max(0, score);

        return score;
    } catch (error) {
        console.error('Error checking score:', error);
        return null;
    };
};

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

export const getSubmissionBySubmissionId = async (req, res) => {
    try {
        const { submissionId } = req.params;

        const results = await pool.query('SELECT * FROM submissions WHERE id = $1', [submissionId]);

        if (results.rows.length === 0) {
            return res.status(404).json({ error: 'Submission not found' });
        };

        res.status(200).json(results.rows);
    } catch (error) {
        console.error('Error fetching submission by submission id:', error);
        res.status(500).json({ error: 'An unexpected error occurred when fetching submission by submission id' });
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
            submitted_at,
            word_count,
            character_count
        } = req.body;

        // const word_count = content.split(' ').length;
        // const character_count = content.length;

        const submission = {
            challenge_id: challengeId,
            title,
            summary,
            content,
            genre,
            word_count,
            character_count,
            started_at,
            submitted_at
        };

        const score = await checkScore(submission);

        if (score === null) {
            return res.status(500).json({ error: 'Error calculating score' });
        }

        console.log(submission, score)

        const results = await pool.query('INSERT INTO submissions (author_id, challenge_id, title, summary, content, genre, word_count, character_count, started_at, submitted_at, score) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *', [userId, challengeId, title, summary, content, genre, word_count, character_count, started_at, submitted_at, score]);

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