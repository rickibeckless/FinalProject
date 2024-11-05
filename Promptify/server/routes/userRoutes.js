import express from "express";
import passport from "passport";
import rateLimit from 'express-rate-limit';
import { getUsers, getUserById, createUserWithConventional, loginUserWithConventional, deleteUser } from "../controllers/userControllers.js";

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

router.get("/auth/github", passport.authenticate("github", { scope: ["user:email"] }));
router.get("/auth/github/callback", passport.authenticate("github", { failureRedirect: "/" }),
    (req, res) => {
        res.status(200).json(req.user);
    }
);

router.delete("/delete", deleteUser); // DELETE user

export default router;