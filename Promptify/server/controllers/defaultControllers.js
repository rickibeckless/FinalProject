import { pool } from '../config/database.js';
import bcrypt from 'bcryptjs';
import fs from 'fs';

const users = JSON.parse(fs.readFileSync('./data/defaultData/defaultUsers.json', 'utf8'));
const challenges = JSON.parse(fs.readFileSync('./data/defaultData/defaultChallenges.json', 'utf8'));
// const submissions = JSON.parse(fs.readFileSync('./data/defaultData/defaultSubmissions.json', 'utf8'));
// const upvotes = JSON.parse(fs.readFileSync('./data/defaultData/defaultUpvotes.json', 'utf8'));
// const comments = JSON.parse(fs.readFileSync('./data/defaultData/defaultComments.json', 'utf8'));

export const createDefaultUsers = async (req, res) => {
    try {
        for (const user of users) {
            // check if username, email, or id already exists
            const check = [user.username, user.email, user.id].map(async (field) => {
                return await pool.query('SELECT * FROM users WHERE $1 = $2', [field, user[field]]);
            });

            if (check.includes(true)) {
                return res.status(400).json({ error: 'User already exists' });
            };

            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(user.password, salt);

            await pool.query('INSERT INTO users (id, email, password, username) VALUES ($1, $2, $3, $4) RETURNING *', [user.id, user.email, hashedPassword, user.username]);
        };

        res.status(201).json({ message: 'Default users created' });
    } catch (error) {
        console.error('Error creating default users:', error);
        console.error('Error details:', error.detail);
        res.status(500).json({ error: 'An unexpected error occurred' });
    };
};

export const createDefaultChallenges = async (req, res) => {
    try {
        for (const challenge of challenges) {
            // check if challenge name or id already exists
            const check = [challenge.name, challenge.id].map(async (field) => {
                return await pool.query('SELECT * FROM challenges WHERE $1 = $2', [field, challenge[field]]);
            });

            if (check.includes(true)) {
                return res.status(400).json({ error: 'Challenge already exists' });
            };

            let available_points = 50;
            let timeConstraintBonus = 0;
            let requirementBonus = 0;

            const timeDifference = new Date(challenge.end_date_time) - new Date(challenge.start_date_time);
            if (timeDifference < 604800000) {
                timeConstraintBonus = 20;
            };

            let difficultyMultiplier = 1;
            if (challenge.skill_level === 'beginner') {
                difficultyMultiplier = 1;
            } else if (challenge.skill_level === 'intermediate') {
                difficultyMultiplier = 1.5;
            } else if (challenge.skill_level === 'advanced') {
                difficultyMultiplier = 2;
            };

            if (challenge.limitations.time_limit) {
                if (challenge.limitations.time_limit.min !== "" || challenge.limitations.time_limit.max !== "") {
                    requirementBonus += 10;
                };
            };
            if (challenge.limitations.word_limit) {
                if (challenge.limitations.word_limit.min !== "" || challenge.limitations.word_limit.max !== "") {
                    requirementBonus += 10;
                };
            };
            if (challenge.limitations.character_limit) {
                if (challenge.limitations.character_limit.min !== "" || challenge.limitations.character_limit.max !== "") {
                    requirementBonus += 10;
                };
            };
            if (challenge.limitations.required_phrase) {
                if (challenge.limitations.required_phrase !== "") {
                    requirementBonus += 10;
                };
            };

            available_points = (available_points * difficultyMultiplier) + timeConstraintBonus + requirementBonus;

            await pool.query('INSERT INTO challenges (id, author_id, name, description, prompt, start_date_time, end_date_time, skill_level, genre, limitations, available_points) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *', [challenge.id, challenge.author_id, challenge.name, challenge.description, challenge.prompt, challenge.start_date_time, challenge.end_date_time, challenge.skill_level, challenge.genre, challenge.limitations, available_points]);
        };

        res.status(201).json({ message: 'Default challenges created' });
    } catch (error) {
        console.error('Error creating default challenges:', error);
        res.status(500).json({ error: 'An unexpected error occurred' });
    };
};