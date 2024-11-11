import session from "express-session";
import passport from "passport";
import { Strategy as GitHubStrategy } from "passport-github2";
import { v4 as uuidv4 } from 'uuid';
import { pool } from "../config/database.js";
import jwt from "jsonwebtoken";
import config from "../config/config.js";

const authSession = session({
    secret: config.sessionSecret,
    resave: false,
    saveUninitialized: true,
});

passport.use(new GitHubStrategy(
    {
        clientID: config.github.clientID,
        clientSecret: config.github.clientSecret,
        callbackURL: config.github.callbackURL,
    }, async (accessToken, refreshToken, profile, callback) => {
        const { id, username, emails } = profile;
        const { login, avatar_url, bio } = profile._json;
        const userData = {
            githubId: id,
            username: username,
            email: emails[0].value,
            login: login,
            avatar_url: avatar_url,
            bio: bio,
            accessToken
        };

        try {
            const adminEmails = process.env.ADMIN_EMAILS.split(', ');
            const isAdmin = userData.email === adminEmails[0] || userData.email === adminEmails[1] ? true : false;

            const about = bio ? bio : 'This user has not set up an about yet.';
            const profilePictureUrl = avatar_url ? avatar_url : 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png';

            const userCheck = await pool.query('SELECT * FROM users WHERE email = $1', [userData.email]);
            const user = userCheck.rows[0];

            if (!user) {
                const welcomeNotification = {
                    id: uuidv4(),
                    title: "Welcome to Promptify!",
                    content: "We're excited to have you on board. Let's get started!",
                    type: "account_info",
                    status: "unread",
                    date_created: new Date().toISOString(),
                    date_deleted: null
                };

                const newUser = await pool.query('INSERT INTO users (github_id, email, username, profile_picture_url, access_token, about, is_admin, notifications, following) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *', [userData.githubId, userData.email, userData.username, profilePictureUrl, userData.accessToken, about, isAdmin, JSON.stringify([welcomeNotification]), 1]);
                const botUser = await pool.query('SELECT * FROM users WHERE id = $1', ['11111111-aaaa-aaaa-aaaa-111111111111']);
                const newBotUserFollowCount = botUser.rows[0].followers + 1;

                await pool.query(
                    'INSERT INTO user_followers (follower_id, following_id) VALUES ($1, $2)',
                    [newUser.rows[0].id, botUser.rows[0].id]
                );

                await pool.query('UPDATE users SET followers = $1 WHERE id = $2', [newBotUserFollowCount, botUser.rows[0].id]);

                const token = jwt.sign({ id: newUser.rows[0].id }, process.env.JWT_SECRET, { expiresIn: '5h' });

                return callback(null, { user: newUser.rows[0], token });
            }

            // update last_login

            await pool.query('UPDATE users SET last_login = $1 WHERE id = $2', [new Date().toISOString(), user.id]);

            const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '5h' });

            return callback(null, { user, token });
        } catch (error) {
            return callback(error);
        }
    }
));

passport.serializeUser((user, done) => {
    done(null, user);
});

passport.deserializeUser((obj, done) => {
    done(null, obj);
});

const requireRole = (roles) => (req, res, next) => {
    const userRole = req.headers.role;

    if (roles.includes(userRole)) {
        return next();
    };

    return res.status(403).json({ message: 'Forbidden' });
};

export { authSession, passport, requireRole };
