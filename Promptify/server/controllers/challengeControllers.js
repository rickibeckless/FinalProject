import { pool } from '../config/database.js';

export const getChallenges = async (req, res) => {
    try {
        const results = await pool.query('SELECT * FROM challenges');

        const now = new Date();
        const updates = [];

        for (let i = 0; i < results.rows.length; i++) {
            const challenge = results.rows[i];
            let status;

            const timeToStart = new Date(challenge.start_date_time) - now;
            const timeToEnd = new Date(challenge.end_date_time) - now;
            const timeToScore = new Date(challenge.end_date_time) + 3600000 - now;

            if (timeToStart > 0) {
                status = 'upcoming';
            } else if (timeToEnd > 0) {
                status = 'in-progress';
            } else if (timeToScore > 0) {
                status = 'scoring';
            } else {
                status = 'ended';
            }

            updates.push({
                id: challenge.id,
                status: status
            });
        };

        for (const update of updates) {
            await pool.query('UPDATE challenges SET status = $1 WHERE id = $2', [update.status, update.id]);
        };

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
                
        let available_points = 50;
        let timeConstraintBonus = 0;
        let requirementBonus = 0;

        const timeDifference = new Date(end_date_time) - new Date(start_date_time);
        if (timeDifference < 604800000) {
            timeConstraintBonus = 20;
        };

        let difficultyMultiplier = 1;
        if (skill_level === 'beginner') {
            difficultyMultiplier = 1;
        } else if (skill_level === 'intermediate') {
            difficultyMultiplier = 1.5;
        } else if (skill_level === 'advanced') {
            difficultyMultiplier = 2;
        };

        if (limitations.time_limit) {
            if (limitations.time_limit.min !== "" || limitations.time_limit.max !== "") {
                requirementBonus += 10;
            };
        };
        if (limitations.word_limit) {
            if (limitations.word_limit.min !== "" || limitations.word_limit.max !== "") {
                requirementBonus += 10;
            };
        };
        if (limitations.character_limit) {
            if (limitations.character_limit.min !== "" || limitations.character_limit.max !== "") {
                requirementBonus += 10;
            };
        };
        if (limitations.required_phrase) {
            if (limitations.required_phrase !== "") {
                requirementBonus += 10;
            };
        };

        available_points = (available_points * difficultyMultiplier) + timeConstraintBonus + requirementBonus;

        const results = await pool.query(
            'INSERT INTO challenges (author_id, name, description, prompt, start_date_time, end_date_time, skill_level, genre, limitations, available_points) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *',
            [author_id, name, description, prompt, start_date_time, end_date_time, skill_level, genre, limitations, available_points]
        );
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