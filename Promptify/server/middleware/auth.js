// server/middleware/auth.js

import session from "express-session";
import passport from "passport";
import { Strategy as GitHubStrategy } from "passport-github2";
import config from "../config/config.js";

const authSession = session({
    secret: config.sessionSecret,
    resave: false,
    saveUninitialized: false,
});

passport.use(new GitHubStrategy({
    clientID: config.github.clientID,
    clientSecret: config.github.clientSecret,
    callbackURL: config.github.callbackURL,
}, async (accessToken, refreshToken, profile, done) => {
    const { username, emails } = profile;
    const email = emails[0].value;

    try {
        const userCheck = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        let user;

        if (userCheck.rows.length > 0) {
            user = userCheck.rows[0];
        } else {
            const newUser = await pool.query(
                'INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING *',
                [username, email, null]
            );
            user = newUser.rows[0];
        };

        return done(null, user);
    } catch (error) {
        console.error('Error during GitHub authentication:', error);
        return done(error, null);
    };
}));

passport.serializeUser((user, done) => {
    done(null, user);
});

passport.deserializeUser((obj, done) => {
    done(null, obj);
});

export { authSession, passport };
