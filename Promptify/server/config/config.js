import "./dotenv.js";

const config = {
    sessionSecret: process.env.SESSION_SECRET,
    jwtSecret: process.env.JWT_SECRET,
    github: {
        clientID: process.env.GITHUB_CLIENT_ID,
        clientSecret: process.env.GITHUB_CLIENT_SECRET,
        callbackURL: process.env.GITHUB_CALLBACK_URL,
    },
    frontendURL: process.env.FRONTEND_URL || "http://localhost:5173",
    backendURL: process.env.BACKEND_URL || "http://localhost:8080",
};

export default config;