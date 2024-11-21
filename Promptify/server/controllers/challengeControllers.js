import { pool } from '../config/database.js';
import { io } from '../server.js';
import { v4 as uuidv4 } from 'uuid';
import fetch from 'node-fetch';
import { environmentUrl } from '../server.js';

const challengeCheck = async (results, res) => {
    try {
        let updates = [];

        for (let i = 0; i < results.rows.length; i++) {
            const challenge = results.rows[i];

            const now = new Date();
            let status;

            const timeToStart = new Date(challenge.start_date_time) - now;
            const timeToEnd = new Date(challenge.end_date_time) - now;
            let timeToScore = new Date(challenge.end_date_time) - now;
            timeToScore = timeToScore + 3600000;

            if (timeToStart > 0) {
                status = 'upcoming';
            } else if (timeToEnd > 0) {
                status = 'in-progress';
            } else if (timeToScore > 0) {
                status = 'scoring';
                if (!challenge.scored) { // only score if the challenge has not been scored yet
                    await challengeScoring(challenge, res);
                }
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
        const now = new Date();
        let timeToScore = new Date(challenge.end_date_time) - now;
        timeToScore = timeToScore + 3600000;

        if (timeToScore > 600000) { // only score if the challenge has 10 minutes left in the scoring period
            return;
        }

        const submissionsResults = await pool.query(
            `
                SELECT 
                    s.id, 
                    s.author_id, 
                    s.score, 
                    COUNT(u.id) AS upvotes 
                FROM submissions s
                LEFT JOIN upvotes u ON s.id = u.submission_id AND u.guest_account = false
                WHERE s.challenge_id = $1
                GROUP BY s.id
            `,
            [challenge.id]
        );

        const submissions = submissionsResults.rows;

        const eligibleSubmissions = submissions.filter(submission => submission.score >= 80);

        eligibleSubmissions.sort((a, b) => b.upvotes - a.upvotes);

        const winners = eligibleSubmissions.slice(0, 3);

        const first_place = winners[0]?.author_id || null;
        const second_place = winners[1]?.author_id || null;
        const third_place = winners[2]?.author_id || null;

        const results = await pool.query(`UPDATE challenges SET first_place = $1, second_place = $2, third_place = $3, scored = $4 WHERE id = $5 RETURNING *`,
            [first_place, second_place, third_place, true, challenge.id]
        );

        const points = challenge.available_points;

        const pointsToWinners = winners.map((winner, index) => {
            if (challenge.participation_count <= 1) {
                return Math.floor(points);
            } else if (challenge.participation_count < 3) {
                return Math.floor(points / challenge.participation_count);
            } else if (challenge.participation_count >= 3) {
                if (index === 0) {
                    return Math.floor(points * 0.5);
                } else if (index === 1) {
                    return Math.floor(points * 0.3);
                } else if (index === 2) {
                    return Math.floor(points * 0.2);
                };
            };
        });

        for (let i = 0; i < winners.length; i++) {
            const winner = winners[i];
            const points = pointsToWinners[i];

            await pool.query(
                `UPDATE users SET points = points + $1 WHERE id = $2`,
                [points, winner.author_id]
            );
        };

        const notifications = [];

        notifications.push({
            title: "Challenge Winners Announced!",
            content: `The winners of your challenge "${challenge.name}" have been announced! Check it out!`,
            type: "challenge_activity",
            to: [challenge.author_id],
        });

        const winnerIds = winners.map(winner => winner.author_id);
        if (winnerIds.length > 0) {
            notifications.push({
                title: "You Won A Challenge!",
                content: `Congratulations! You have won the challenge "${challenge.name}".`,
                type: "challenge_activity",
                to: winnerIds,
            });
        }

        const batchSize = 1000;
        for (let i = 0; i < notifications.length; i += batchSize) {
            const batch = notifications.slice(i, i + batchSize);
            await fetch(`${environmentUrl}/api/notifications/new/several`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    role: 'auto',
                },
                body: JSON.stringify(batch),
            });
        }

        return results.rows;
    } catch (error) {
        console.error("Error scoring challenge:", error);
        res.status(500).json({ error: "An unexpected error occurred" });
    }
};

export const getChallenges = async (req, res) => {
    try {
        const results = await pool.query('SELECT * FROM challenges');

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

export const getChallengesByUser = async (req, res) => {
    try {
        const results = await pool.query('SELECT * FROM challenges WHERE author_id = $1', [req.params.userId]);

        if (results.rows.length === 0) {
            return res.status(404).json({ error: 'Challenges not found' });
        };

        await challengeCheck(results, res);

        res.status(200).json(results.rows);
    } catch (error) {
        console.error('Error fetching challenges by user:', error);
        res.status(500).json({ error: 'An unexpected error occurred' });
    };
};

export const createChallenge = async (req, res) => {
    try {
        let {
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

        start_date_time = new Date(start_date_time).toISOString();
        end_date_time = new Date(end_date_time).toISOString();

        const validGenres = ['non-fiction', 'thriller', 'poetry', 'general', 'fantasy'];
        const validSkillLevels = ['beginner', 'intermediate', 'advanced'];

        if (!validGenres.includes(genre)) {
            genre = 'general';
        };
        if (!validSkillLevels.includes(skill_level)) {
            skill_level = 'beginner';
        };

        if (limitations.required_phrase.includes('\n')) {
            limitations.required_phrase = limitations.required_phrase.split('\n');
        } else {
            limitations.required_phrase = [limitations.required_phrase];
        };

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
        };
        if (limitations.word_limit) {
            if (notNullCheck(limitations.word_limit.min) || notNullCheck(limitations.word_limit.max)) {
                requirementBonus += 10;
            };
        };
        if (limitations.character_limit) {
            if (notNullCheck(limitations.character_limit.min) || notNullCheck(limitations.character_limit.max)) {
                requirementBonus += 10;
            };
        };
        if (limitations.required_phrase) {
            if (notNullCheck(limitations.required_phrase)) {
                requirementBonus += 10;
            };
        };

        available_points = (available_points * difficultyMultiplier) + timeConstraintBonus + requirementBonus;

        const results = await pool.query(
            'INSERT INTO challenges (author_id, name, description, prompt, start_date_time, end_date_time, skill_level, genre, limitations, available_points) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *',
            [author_id, name, description, prompt, start_date_time, end_date_time, skill_level, genre, limitations, available_points]
        );

        const notifications = new Set();

        const addNotification = (notification) => {
            notifications.add(notification);
        };

        const authorNotification = {
            title: "New Challenge Created!",
            content: `Your challenge ${results.rows[0].name} has been created!`,
            type: "challenge_activity",
            to: [author_id]
        };
        addNotification(authorNotification);

        const authorFollowersResults = await pool.query('SELECT * FROM user_followers WHERE following_id = $1', [author_id]);
        let followerIds = authorFollowersResults.rows.map(f => f.follower_id);
        let authorFollowers = await pool.query('SELECT * FROM users WHERE id = ANY($1)', [followerIds]);

        authorFollowers = authorFollowers.rows.filter(user => user.notifications_settings.allow_following_user_notifications);
        const authorFollowersIds = authorFollowers.map(follower => follower.id);
        for (const followerId of authorFollowersIds) {
            const followerNotification = {
                title: "New Challenge From Someone You Follow!",
                content: `A new challenge ${results.rows[0].name} has been created by a user you follow. Check it out!`,
                type: "challenge_activity",
                to: [followerId]
            };
            addNotification(followerNotification);
        }

        const genreFollowersResults = await pool.query('SELECT * FROM users WHERE following_genres @> $1', [[genre]]);
        let genreFollowers = genreFollowersResults.rows.filter(user => user.id !== author_id && user.notifications_settings.allow_following_genre_notifications);

        const genreFollowersIds = genreFollowers.map(user => user.id).filter(id => !notifications.has(id));
        for (const followerId of genreFollowersIds) {
            const followerNotification = {
                title: "New Challenge In A Genre You Follow!",
                content: `A new challenge ${results.rows[0].name} has been created in the ${genre} genre. Check it out!`,
                type: "challenge_activity",
                to: [followerId]
            };
            addNotification(followerNotification);
        }

        const skillLevelFollowersResults = await pool.query('SELECT * FROM users WHERE skill_level = $1', [skill_level]);
        let skillLevelFollowers = skillLevelFollowersResults.rows.filter(user => user.id !== author_id && user.notifications_settings.allow_skill_level_notifications);

        const skillLevelFollowersIds = skillLevelFollowers.map(user => user.id).filter(id => !notifications.has(id));
        for (const followerId of skillLevelFollowersIds) {
            const followerNotification = {
                title: "New Challenge In Your Skill Level!",
                content: `A new challenge ${results.rows[0].name} has been created for ${skill_level} writers. Check it out!`,
                type: "challenge_activity",
                to: [followerId]
            };
            addNotification(followerNotification);
        }

        const notificationArray = Array.from(notifications);
        const batchSize = 1000;

        for (let i = 0; i < notificationArray.length; i += batchSize) {
            const batch = notificationArray.slice(i, i + batchSize);

            await fetch(`${environmentUrl}/api/notifications/new/several`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    role: 'auto'
                },
                body: JSON.stringify(batch)
            });
        };

        res.status(201).json(results.rows);
    } catch (error) {
        console.error('Error creating challenge:', error);
        res.status(500).json({ error: 'An unexpected error occurred' });
    };
};

export const editChallenge = async (req, res) => {
    try {
        const challengeId = req.params.id;

        const challengeResults = await pool.query('SELECT * FROM challenges WHERE id = $1', [challengeId]);

        if (challengeResults.rows.length === 0) {
            return res.status(404).json({ error: 'Challenge not found' });
        };

        if (challengeResults.rows[0].status !== 'upcoming') {
            return res.status(403).json({ error: 'Challenge is not editable' });
        };

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

        const results = await pool.query('UPDATE challenges SET name = $1, description = $2, prompt = $3, start_date_time = $4, end_date_time = $5, skill_level = $6, genre = $7, limitations = $8 WHERE id = $9 RETURNING *', [name, description, prompt, start_date_time, end_date_time, skill_level, genre, limitations, challengeId]);

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