import { pool } from '../config/database.js';
import bcrypt from 'bcryptjs';
import fs from 'fs';

// const users = JSON.parse(fs.readFileSync('./data/defaultData/defaultUsers.json', 'utf8'));
// const users_two = JSON.parse(fs.readFileSync('./data/defaultData/mock_user_data(2).json', 'utf8'));
// const challenges = JSON.parse(fs.readFileSync('./data/defaultData/defaultChallenges.json', 'utf8'));
// const submissions = JSON.parse(fs.readFileSync('./data/defaultData/defaultSubmissions.json', 'utf8'));
// const upvotes = JSON.parse(fs.readFileSync('./data/defaultData/defaultUpvotes.json', 'utf8'));
// const comments = JSON.parse(fs.readFileSync('./data/defaultData/defaultComments.json', 'utf8'));

export const resetFullDatabase = async (req, res) => {
    try {
        const { currentAdminId } = req.params;
        const baseUserIds = ['55555555-aaaa-aaaa-aaaa-555555555555', '11111111-aaaa-aaaa-aaaa-111111111111', currentAdminId];
        const baseChallengeIds = ['66666666-bbbb-bbbb-bbbb-666666666666', '77777777-bbbb-bbbb-bbbb-777777777777', '88888888-bbbb-bbbb-bbbb-888888888888'];
        const baseSubmissionIds = ['44444444-cccc-cccc-cccc-444444444444'];
        const baseCommentIds = ['11111111-dddd-dddd-dddd-111111111111'];

        await pool.query('DELETE FROM users WHERE id != $1 AND id != $2 AND id != $3', baseUserIds);
        await pool.query('DELETE FROM challenges WHERE id != $1 AND id != $2 AND id != $3', baseChallengeIds);
        await pool.query('DELETE FROM submissions WHERE id != $1', baseSubmissionIds);
        await pool.query('DELETE FROM comments WHERE id != $1', baseCommentIds);
        await pool.query('DELETE FROM user_followers WHERE follower_id != $1 AND following_id != $2', baseUserIds);
        await pool.query('DELETE FROM upvotes');

        checkAndSetBaseData();

        res.status(200).json({ message: 'Database reset' });
    } catch (error) {
        console.error('Error resetting database:', error);
        res.status(500).json({ error: 'An unexpected error occurred' });
    };
};

export const resetSingleTable = async (req, res) => {
    try {
        const { table } = req.params;

        if (table === 'users') {
            await pool.query(`DELETE FROM ${table} WHERE id != '55555555-aaaa-aaaa-aaaa-555555555555' AND id != '11111111-aaaa-aaaa-aaaa-111111111111'`);
        } else if (table === 'challenges') {
            await pool.query(`DELETE FROM ${table} WHERE id != '66666666-bbbb-bbbb-bbbb-666666666666' AND id != '77777777-bbbb-bbbb-bbbb-777777777777' AND id != '88888888-bbbb-bbbb-bbbb-888888888888'`);
        } else if (table === 'submissions') {
            await pool.query(`DELETE FROM ${table} WHERE id != '44444444-cccc-cccc-cccc-444444444444'`);
        } else if (table === 'comments') {
            await pool.query(`DELETE FROM ${table} WHERE id != '11111111-dddd-dddd-dddd-111111111111'`);
        } else if (table === 'upvotes') {
            await pool.query(`DELETE FROM ${table}`);
        } else {
            return res.status(400).json({ error: 'Invalid table name' });
        };

        res.status(200).json({ message: `${table} table reset` });
    } catch (error) {
        console.error('Error resetting table:', error);
        res.status(500).json({ error: 'An unexpected error occurred' });
    };
};

export const checkAndSetBaseData = async (req, res) => {
    try {
        const baseUserIds = ['55555555-aaaa-aaaa-aaaa-555555555555', '11111111-aaaa-aaaa-aaaa-111111111111'];
        const baseChallengeIds = ['66666666-bbbb-bbbb-bbbb-666666666666', '77777777-bbbb-bbbb-bbbb-777777777777', '88888888-bbbb-bbbb-bbbb-888888888888'];
        const baseSubmissionIds = ['44444444-cccc-cccc-cccc-444444444444'];
        const baseCommentIds = ['11111111-dddd-dddd-dddd-111111111111'];

        const checkBaseUsers = await pool.query('SELECT * FROM users WHERE id = $1 OR id = $2', baseUserIds);
        const checkBaseChallenges = await pool.query('SELECT * FROM challenges WHERE id = $1 OR id = $2 OR id = $3', baseChallengeIds);
        const checkBaseSubmissions = await pool.query('SELECT * FROM submissions WHERE id = $1', baseSubmissionIds);
        const checkBaseComments = await pool.query('SELECT * FROM comments WHERE id = $1', baseCommentIds);

        if (checkBaseUsers.rows.length === 2) {
            console.log("Base user data already set");
        } else {
            const deletedUserValues = {
                id: '55555555-aaaa-aaaa-aaaa-555555555555',
                username: 'deleted_user',
                about: 'This user has been deleted.',
                notifications_settings: {
                    "allow_notifications": false,
                    "allow_email_notifications": false,
                    "allow_push_notifications": false,
                    "allow_following_user_notifications": false,
                    "allow_follower_notifications": false,
                    "allow_feedback_notifications": false,
                    "allow_challenge_notifications": false,
                    "allow_daily_notifications": false,
                    "allow_weekly_notifications": false,
                    "allow_skill_level_notifications": false,
                    "allow_following_genre_notifications": false
                }
            };

            const promptifyBotUserValues = {
                id: '11111111-aaaa-aaaa-aaaa-111111111111',
                username: 'PromptifyBot',
                profile_picture_url: 'https://i.ibb.co/550MskP/Promptify-Icon.png',
                about: 'Hi! I\'m the Promptify Bot! I have some challenges that you can check out, they\'re never ending!',
                skill_level: 'advanced',
                badges: {
                    "first_win": true,
                    "tenth_win": true,
                    "third_win": true,
                    "first_vote": true,
                    "registered": true,
                    "first_comment": true,
                    "first_submission": true,
                    "tenth_submission": true,
                    "poetry_submission": true,
                    "fantasy_submission": true,
                    "thriller_submission": true,
                    "non_fiction_submission": true
                },
                completed_challenges: 1027, // My cat La'Gaia's birthday!
                points: 184860, // La'Gaia's birthday x 180 (it may be cheesy, but... meh🤷🏽‍♀️)
                notifications_settings: {
                    "allow_notifications": false,
                    "allow_email_notifications": false,
                    "allow_push_notifications": false,
                    "allow_following_user_notifications": false,
                    "allow_follower_notifications": false,
                    "allow_feedback_notifications": false,
                    "allow_challenge_notifications": false,
                    "allow_daily_notifications": false,
                    "allow_weekly_notifications": false,
                    "allow_skill_level_notifications": false,
                    "allow_following_genre_notifications": false
                }
            };

            await pool.query('INSERT INTO users (id, username, about, notifications_settings) VALUES ($1, $2, $3, $4) RETURNING *', [deletedUserValues.id, deletedUserValues.username, deletedUserValues.about, deletedUserValues.notifications_settings]);
            await pool.query('INSERT INTO users (id, username, profile_picture_url, about, skill_level, badges, completed_challenges, points, notifications_settings) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *', [promptifyBotUserValues.id, promptifyBotUserValues.username, promptifyBotUserValues.profile_picture_url, promptifyBotUserValues.about, promptifyBotUserValues.skill_level, promptifyBotUserValues.badges, promptifyBotUserValues.completed_challenges, promptifyBotUserValues.points, promptifyBotUserValues.notifications_settings]);
        };

        if (checkBaseChallenges.rows.length === 3) {
            console.log("Base challenge data already set");
        } else {
            const defaultBeginnerChallengeValues = {
                id: '66666666-bbbb-bbbb-bbbb-666666666666',
                author_id: '11111111-aaaa-aaaa-aaaa-111111111111',
                name: "Memory Snapshot",
                description: "Capture a vivid moment from a personal memory in a few paragraphs, focusing on sensory details to bring it to life.",
                prompt: "Think of a memory that stands out to you—perhaps a favorite place, a joyful moment, or even something bittersweet. Describe it as if you were painting a picture with words. Focus on using sensory details like sights, sounds, smells, and textures to fully immerse the reader. There are no restrictions on word count or structure; just aim to make the memory feel as real as possible for the reader.",
                start_date_time: '2024-11-07T00:00:00.000Z',
                end_date_time: '3004-08-13T00:00:00.000Z',
                skill_level: 'beginner',
                genre: 'non-fiction',
                limitations: {
                    time_limit: { min: null, max: null },
                    word_limit: { min: null, max: null },
                    character_limit: { min: null, max: null },
                    required_phrase: []
                },
                available_points: 50,
                participation_count: 1
            };

            const defaultIntermediateChallengeValues = {
                id: '77777777-bbbb-bbbb-bbbb-777777777777',
                author_id: '11111111-aaaa-aaaa-aaaa-111111111111',
                name: "Lost in Time: Sci-Fi Flashback",
                description: "Tell a story of a character who is unexpectedly transported to a different era. Focus on how they adapt (or struggle) with the change.",
                prompt: "Write about a character who wakes up in a time far removed from their own—whether it's centuries into the future, where advanced AI runs society, or in a past era full of unknown dangers. Describe their confusion, awe, or fear as they encounter technologies or social customs they can't understand. How do they try to survive and make sense of their surroundings?",
                start_date_time: '2024-11-07T00:00:00.000Z',
                end_date_time: '3004-08-13T00:00:00.000Z',
                skill_level: 'intermediate',
                genre: 'general',
                limitations: {
                    time_limit: { min: null, max: 120 },
                    word_limit: { min: 500, max: null },
                    character_limit: { min: null, max: null },
                    required_phrase: []
                },
                available_points: 95,
                participation_count: 0
            };

            const defaultAdvancedChallengeValues = {
                id: '88888888-bbbb-bbbb-bbbb-888888888888',
                author_id: '11111111-aaaa-aaaa-aaaa-111111111111',
                name: "Urban Fantasy Creature Encounter",
                description: "Create a story where a mythical creature appears in a modern city. Focus on how the creature and people react to each other.",
                prompt: "Imagine a modern-day city where a mythical creature—a dragon, phoenix, or even a griffin—suddenly appears and disrupts daily life. Describe the creature's appearance, behavior, and how it reacts to the sights and sounds of the city. Show both the humans' astonishment and the creature's possible confusion or curiosity. Use the phrase 'a legend reborn in an unlikely world' to capture the magic and surrealism of this encounter. How do the people react? Do they attempt to befriend or capture it? How does the creature perceive this new world?",
                start_date_time: '2024-11-07T00:00:00.000Z',
                end_date_time: '3004-08-13T00:00:00.000Z',
                skill_level: 'advanced',
                genre: 'fantasy',
                limitations: {
                    time_limit: { min: 60, max: 120 },
                    word_limit: { min: 1000, max: null },
                    character_limit: { min: 3000, max: null },
                    required_phrase: [
                        'a legend reborn in an unlikely world'
                    ]
                },
                available_points: 140,
                participation_count: 0
            };

            const defaultChallengeValues = [defaultBeginnerChallengeValues, defaultIntermediateChallengeValues, defaultAdvancedChallengeValues];

            for (const challenge of defaultChallengeValues) {
                await pool.query('INSERT INTO challenges (id, author_id, name, description, prompt, start_date_time, end_date_time, skill_level, genre, limitations, available_points, participation_count) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING *', [challenge.id, challenge.author_id, challenge.name, challenge.description, challenge.prompt, challenge.start_date_time, challenge.end_date_time, challenge.skill_level, challenge.genre, challenge.limitations, challenge.available_points, challenge.participation_count]);
            };
        };

        if (checkBaseSubmissions.rows.length === 3) {
            console.log("Base submission data already set");
        } else {
            const defaultBeginnerSubmissionValues = {
                id: '44444444-cccc-cccc-cccc-444444444444',
                author_id: '11111111-aaaa-aaaa-aaaa-111111111111',
                challenge_id: '66666666-bbbb-bbbb-bbbb-666666666666',
                title: 'Sunlit Summer Afternoon',
                summary: 'A nostalgic memory of a warm summer day spent in a peaceful garden, capturing the beauty of the moment through vivid sensory details. DISCLAIMER: This is a fictional piece generated by AI.',
                content: '<p><i>It was one of those rare, golden afternoons</i> that seemed to hover in the air, just out of reach of ordinary time. The sun poured down in <strong>thick, syrupy waves</strong>, warming every blade of grass and leaf in sight. I remember stretching out on the soft, slightly prickly lawn, feeling each blade poking up against my bare arms. The smell of freshly cut grass mingled with the earthy aroma of damp soil, and somewhere nearby, the faint hum of a bee filled the air, weaving in and out of the lazy silence.</p><p>Above, the sky was an <i>endless, cloudless blue</i>, the kind that makes you feel like you could fall right up into it if you looked too long. I closed my eyes, letting the warmth seep into my skin, feeling the slight tickle of a breeze as it carried whispers of lavender and sun-warmed rosemary from the garden beds nearby. It was peaceful, almost too perfect, and in that moment, everything felt connected—the sky, the earth, the buzzing bee, and me. The world was vast, yet incredibly close. And for those few timeless moments, I was exactly where I wanted to be, wrapped in the comforting blanket of a summer afternoon.</p>',
                word_count: 203,
                character_count: 1113,
                genre: 'non-fiction',
                started_at: '2024-11-07T14:30:00.000Z',
                submitted_at: '2024-11-07T14:50:00.000Z'
            };

            await pool.query('INSERT INTO submissions (id, author_id, challenge_id, title, summary, content, word_count, character_count, genre, started_at, submitted_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *', [defaultBeginnerSubmissionValues.id, defaultBeginnerSubmissionValues.author_id, defaultBeginnerSubmissionValues.challenge_id, defaultBeginnerSubmissionValues.title, defaultBeginnerSubmissionValues.summary, defaultBeginnerSubmissionValues.content, defaultBeginnerSubmissionValues.word_count, defaultBeginnerSubmissionValues.character_count, defaultBeginnerSubmissionValues.genre, defaultBeginnerSubmissionValues.started_at, defaultBeginnerSubmissionValues.submitted_at]);

            const botUser = await pool.query('SELECT * FROM users WHERE id = $1', ['11111111-aaaa-aaaa-aaaa-111111111111']);
            const newBotUserCompletedChallengesCount = botUser.rows[0].completed_challenges + 1;

            await pool.query('UPDATE users SET completed_challenges = $1 WHERE id = $2', [newBotUserCompletedChallengesCount, botUser.rows[0].id]);
        };

        if (checkBaseComments.rows.length === 3) {
            console.log("Base comment data already set");
        } else {
            const defaultBeginnerCommentValues = {
                id: '11111111-dddd-dddd-dddd-111111111111',
                parent_comment_id: null,
                user_id: '11111111-aaaa-aaaa-aaaa-111111111111',
                submission_id: '44444444-cccc-cccc-cccc-444444444444',
                content: 'Now you try! If you haven\'t created a submission to a challenge yet, this would be a good one to start with! Even if you don\'t submit it, it\'s a great way to practice your writing skills. 😊',
            };

            await pool.query('INSERT INTO comments (id, parent_comment_id, user_id, submission_id, content) VALUES ($1, $2, $3, $4, $5) RETURNING *', [defaultBeginnerCommentValues.id, defaultBeginnerCommentValues.parent_comment_id, defaultBeginnerCommentValues.user_id, defaultBeginnerCommentValues.submission_id, defaultBeginnerCommentValues.content]);
        };

    } catch (error) {
        console.error('Error checking and setting base data:', error);
        res.status(500).json({ error: 'An unexpected error occurred' });
    };
};

export const createDefaultUsers = async (req, res) => {
    /*
    try {
        const all_users = [...users, ...users_two];
        
        for (const user of all_users) {
            const check = await Promise.all([
                pool.query('SELECT * FROM users WHERE username = $1', [user.username]),
                pool.query('SELECT * FROM users WHERE email = $1', [user.email]),
                pool.query('SELECT * FROM users WHERE id = $1', [user.id])
            ]);
            
            if (check.some(result => result.rows.length > 0)) {
                await pool.query('UPDATE users SET following = following + 1 WHERE id = $1', [user.id]);
                return res.status(400).json({ error: 'User already exists' });
            }

            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(user.password, salt);

            await pool.query('INSERT INTO users (id, email, password, username) VALUES ($1, $2, $3, $4) RETURNING *', [user.id, user.email, hashedPassword, user.username]);

            const welcomeNotification = {
                id: user.id,
                title: "Welcome to Promptify!",
                content: "We're excited to have you on board. Let's get started!",
                type: "account_info",
                status: "unread",
                date_created: new Date().toISOString(),
                date_deleted: null
            };

            await pool.query('UPDATE users SET notifications = $1 WHERE id = $2', [JSON.stringify([welcomeNotification]), user.id]);

            const botUser = await pool.query('SELECT * FROM users WHERE id = $1', ['11111111-aaaa-aaaa-aaaa-111111111111']);
            const newBotUserFollowCount = botUser.rows[0].followers + 1;

            await pool.query('UPDATE users SET following = following + 1 WHERE id = $1', [user.id]);

            await pool.query('INSERT INTO user_followers (follower_id, following_id) VALUES ($1, $2)', [user.id, botUser.rows[0].id]);

            await pool.query('UPDATE users SET followers = $1 WHERE id = $2', [newBotUserFollowCount, botUser.rows[0].id]);
        };

        res.status(201).json({ message: 'Default users created' });
    } catch (error) {
        console.error('Error creating default users:', error);
        console.error('Error details:', error.detail);
        res.status(500).json({ error: 'An unexpected error occurred' });
    };
    */
};

export const createDefaultChallenges = async (req, res) => {
    /*
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
    */
};