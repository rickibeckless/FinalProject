import session from "express-session";
import passport from "passport";
import { Strategy as GitHubStrategy } from "passport-github2";
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
                const newUser = await pool.query('INSERT INTO users (github_id, email, username, profile_picture_url, access_token, about, is_admin) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *', [userData.githubId, userData.email, userData.username, profilePictureUrl, userData.accessToken, about, isAdmin]);

                const token = jwt.sign({ id: newUser.rows[0].id }, process.env.JWT_SECRET, { expiresIn: '5h' });

                return callback(null, { user: newUser.rows[0], token });
            }

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
