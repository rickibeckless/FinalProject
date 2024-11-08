import express from "express";
import {  } from "../controllers/upvoteControllers.js";

const router = express.Router();

// /api/upvotes

router.get("/", ); // GET all upvotes
router.get("/user/:userId", ); // GET all upvotes by user ID
router.get("/submission/:submissionId", ); // GET all upvotes by submission ID
router.get("/challenge/:challengeId", ); // GET all upvotes by challenge ID

router.post("/user/:userId/submission/:submissionId/create", ); // POST new upvote

router.delete("/user/:userId/submission/:submissionId/delete", ); // DELETE upvote

export default router;