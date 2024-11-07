import express from "express";
import { getSubmissionsByUserId, getSubmissionsByChallengeId, getSubmissionByUserIdAndChallengeId, createSubmission, editSubmission, deleteSubmission } from "../controllers/submissionControllers.js";

const router = express.Router();

// /api/submissions

router.get("/:userId", getSubmissionsByUserId); // GET all submissions by user ID
router.get("/:challengeId", getSubmissionsByChallengeId); // GET all submissions by challenge ID
router.get("/:userId/:challengeId", getSubmissionByUserIdAndChallengeId); // GET submission by user ID and challenge ID

router.post("/:userId/:challengeId/create", createSubmission); // POST new submission

router.patch("/:userId/:challengeId/edit", editSubmission); // PATCH submission

router.delete("/:userId/:challengeId/delete", deleteSubmission); // DELETE submission

export default router;