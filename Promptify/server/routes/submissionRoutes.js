import express from "express";
import { getSubmissionsByUserId, getSubmissionsByChallengeId, getSubmissionByUserIdAndChallengeId, createSubmission, editSubmission, deleteSubmission } from "../controllers/submissionControllers.js";

const router = express.Router();

// /api/submissions

router.get("/user/:userId", getSubmissionsByUserId); // GET all submissions by user ID
router.get("/challenge/:challengeId", getSubmissionsByChallengeId); // GET all submissions by challenge ID
router.get("/user/:userId/challenge:challengeId", getSubmissionByUserIdAndChallengeId); // GET submission by user ID and challenge ID

router.post("/user/:userId/challenge:challengeId/create", createSubmission); // POST new submission

router.patch("/user/:userId/challenge:challengeId/edit", editSubmission); // PATCH submission

router.delete("/user/:userId/challenge:challengeId/delete", deleteSubmission); // DELETE submission

export default router;