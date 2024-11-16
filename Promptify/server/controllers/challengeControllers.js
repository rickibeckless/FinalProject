import { pool } from '../config/database.js';

const challengeCheck = async (results, res) => {
    try {
        let updates = [];

        for (let i = 0; i < results.rows.length; i++) {
            const challenge = results.rows[i];

            const now = new Date();
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
                await challengeScoring(challenge, res);
            } else {
                status = 'ended';
            }

            const participationResults = await pool.query('SELECT COUNT(*) FROM submissions WHERE challenge_id = $1', [challenge.id]);

            updates.push({
                id: challenge.id,
                status: status,
                participationCount: participationResults.rows[0].count
            });
        };

        for (const update of updates) {
            await pool.query('UPDATE challenges SET status = $1, participation_count = $2 WHERE id = $3', [update.status, update.participationCount, update.id]);
        };
    } catch (error) {
        console.error('Error checking challenge:', error);
        res.status(500).json({ error: 'An unexpected error occurred' });
    };
};

const challengeScoring = async (challenge, res) => {
    try {
        console.log("handling scoring for challenge:", challenge);
    } catch (error) {
        console.error('Error scoring challenge:', error);
        res.status(500).json({ error: 'An unexpected error occurred' });
    };
};

export const getChallenges = async (req, res) => {
    try {
        const results = await pool.query('SELECT * FROM challenges');

        // const now = new Date();
        // const updates = [];

        // for (let i = 0; i < results.rows.length; i++) {
        //     const challenge = results.rows[i];
        //     let status;

        //     const timeToStart = new Date(challenge.start_date_time) - now;
        //     const timeToEnd = new Date(challenge.end_date_time) - now;
        //     const timeToScore = new Date(challenge.end_date_time) + 3600000 - now;

        //     if (timeToStart > 0) {
        //         status = 'upcoming';
        //     } else if (timeToEnd > 0) {
        //         status = 'in-progress';
        //     } else if (timeToScore > 0) {
        //         status = 'scoring';
        //     } else {
        //         status = 'ended';
        //     }

        //     const participationResults = await pool.query('SELECT COUNT(*) FROM submissions WHERE challenge_id = $1', [challenge.id]);

        //     updates.push({
        //         id: challenge.id,
        //         status: status,
        //         participationCount: participationResults.rows[0].count
        //     });
        // };

        // for (const update of updates) {
        //     await pool.query('UPDATE challenges SET status = $1, participation_count = $2 WHERE id = $3', [update.status, update.participationCount, update.id]);
        // };

        await challengeCheck(results, res);

        res.status(200).json(results.rows);
    } catch (error) {
        console.error('Error fetching challenges:', error);
        res.status(500).json({ error: 'An unexpected error occurred' });
    };
};

export const getChallengeById = async (req, res) => {
    try {
        const results = await pool.query('SELECT * FROM challenges WHERE id = $1', [req.params.id]);
        
        if (results.rows.length === 0) {
            return res.status(404).json({ error: 'Challenge not found' });
        };

        await challengeCheck(results, res);
        
        res.status(200).json(results.rows);
    } catch (error) {
        console.error('Error fetching challenge by ID:', error);
        res.status(500).json({ error: 'An unexpected error occurred' });
    };
};

export const getChallengesByGenre = async (req, res) => {
    try {
        const results = await pool.query('SELECT * FROM challenges WHERE genre = $1', [req.params.genre]);

        if (results.rows.length === 0) {
            return res.status(404).json({ error: 'Challenges not found' });
        };

        await challengeCheck(results, res);

        res.status(200).json(results.rows);
    } catch (error) {
        console.error('Error fetching challenges by genre:', error);
        res.status(500).json({ error: 'An unexpected error occurred' });
    };
};

export const getChallengesBySkillLevel = async (req, res) => {
    try {
        const results = await pool.query('SELECT * FROM challenges WHERE skill_level = $1', [req.params.skill_level]);

        if (results.rows.length === 0) {
            return res.status(404).json({ error: 'Challenges not found' });
        };

        await challengeCheck(results, res);

        res.status(200).json(results.rows);
    } catch (error) {
        console.error('Error fetching challenges by skill level:', error);
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

        const notNullCheck = (value) => { 
            return (
                value !== null &&
                value !== undefined &&
                value !== "" &&
                value !== 0 &&
                value !== "0" &&
                !(Array.isArray(value) && value.length === 0) &&
                !(typeof value === 'object' && Object.keys(value).length === 0) &&
                value !== "[]" &&
                value !== "{}"
            );
        };        

        if (limitations.time_limit) {
            if (notNullCheck(limitations.time_limit.min) || notNullCheck(limitations.time_limit.max)) {
                requirementBonus += 10;
            };

            /*
                if (limitations.time_limit.min !== "" || limitations.time_limit.max !== "") {
                    requirementBonus += 10;
                };
            */
        };
        if (limitations.word_limit) {
            if (notNullCheck(limitations.word_limit.min) || notNullCheck(limitations.word_limit.max)) {
                requirementBonus += 10;
            };

            /*
                if (limitations.word_limit.min !== "" || limitations.word_limit.max !== "") {
                    requirementBonus += 10;
                };
            */
        };
        if (limitations.character_limit) {
            if (notNullCheck(limitations.character_limit.min) || notNullCheck(limitations.character_limit.max)) {
                requirementBonus += 10;
            };
            
            /*
                if (limitations.character_limit.min !== "" || limitations.character_limit.max !== "") {
                    requirementBonus += 10;
                };
            */
        };
        if (limitations.required_phrase) {
            if (notNullCheck(limitations.required_phrase)) {
                requirementBonus += 10;
            };
        };
        /*
            if (limitations.required_phrase) {
                if (limitations.required_phrase !== "") {
                    requirementBonus += 10;
                };
            };
        */

        available_points = (available_points * difficultyMultiplier) + timeConstraintBonus + requirementBonus;

        const results = await pool.query(
            'INSERT INTO challenges (author_id, name, description, prompt, start_date_time, end_date_time, skill_level, genre, limitations, available_points) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *',
            [author_id, name, description, prompt, start_date_time, end_date_time, skill_level, genre, limitations, available_points]
        );

        /** need to send several notifications:
        * - to the author of the challenge
        *   - `Your challenge ${challenge.name} has been created! It is now live and ready for submissions.` or `Your challenge ${challenge.name} has been created! It will be live on ${challenge.start_date_time}.`
        * - to users who follow the author
        *   - `A new challenge ${challenge.name} has been created by ${author.username}. Check it out!`
        * - to users who are following the challenge genre (excluding the author)
        *   - `A new challenge ${challenge.name} has been created in the ${challenge.genre} genre. Check it out!`
        * - to users who are following the challenge skill level (excluding the author)
        *   - `A new challenge ${challenge.name} has been created for ${challenge.skill_level} writers. Check it out!`
        */

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