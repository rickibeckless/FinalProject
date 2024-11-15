import express from "express";
import passport from "passport";
import rateLimit from 'express-rate-limit';
import '../config/dotenv.js';
import { 
    getUsers, 
    getUserById, 
    createUserWithConventional, 
    loginUserWithConventional, 
    editUser, 
    bookmarkChallenge, 
    deleteUser 
} from "../controllers/userControllers.js";
import { requireRole } from "../middleware/auth.js";
import { environmentUrl } from "../server.js";

const router = express.Router();

const loginLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 5,
    message: 'Too many login attempts. Please try again after a minute.'
});

// /api/users

router.get("/", getUsers); // GET all users
router.get("/:id", getUserById); // GET user by ID

router.post("/sign-up", createUserWithConventional); // POST new user
router.post("/login", loginLimiter, loginUserWithConventional); // POST login

router.get('/auth/github/login/success', (req, res) => {
    if (req.user) {
        res.status(200).json({ success: true, user: req.user.user, token: req.user.token });
    }
});

router.get('/auth/github/login/failed', (req, res) => {
    res.status(401).json({ success: true, message: "failure" })
});

router.get('/auth/github/logout', (req, res, next) => {
    req.logout((err) => {
        if (err) return next(err);
    });

    res.session.destroy((err) => {
        res.clearCookie('connect.sid');
        res.json({ status: "logout", user: {} });
    });
});

router.get("/auth/github", passport.authenticate("github", { scope: ["read:user"] }));
router.get("/auth/github/callback", passport.authenticate("github", { 
    failureRedirect: "/api/users/auth/github/login/failed",
}),
    (req, res) => {
        const token = req.user.token;
        res.send(`
            <script>
                window.opener.postMessage({ token: "${token}" }, "${environmentUrl}");
                window.close();
            </script>
        `);
    }
);

router.patch("/:id/edit", requireRole(['admin', 'user']), editUser); // PATCH user
router.patch("/:id/:challengeId/bookmark", requireRole(['user']), bookmarkChallenge); // PATCH bookmark challenge

router.delete("/:id/delete", requireRole(['admin', 'user']), deleteUser); // DELETE user

export default router;