import express from "express";
import { 
    getSubmissionsByUserId, 
    getSubmissionsByChallengeId, 
    getSubmissionBySubmissionId, 
    createSubmission, 
    getSubmissionByUserIdAndChallengeId,
    editSubmission, 
    deleteSubmission 
} from "../controllers/submissionControllers.js";
import { requireRole } from "../middleware/auth.js";

const router = express.Router();

// /api/submissions

router.get("/user/:userId", getSubmissionsByUserId); // GET all submissions by user ID
router.get("/challenge/:challengeId", getSubmissionsByChallengeId); // GET all submissions by challenge ID
router.get("/:submissionId", getSubmissionBySubmissionId); // GET submission by submission ID
router.get("/user/:userId/challenge/:challengeId", getSubmissionByUserIdAndChallengeId); // GET submission by user ID and challenge ID

router.post("/:userId/:challengeId/create", createSubmission); // POST new submission

router.patch("/user/:userId/challenge/:challengeId/edit", requireRole(['admin', 'author']), editSubmission); // PATCH submission

router.delete("/user/:userId/challenge/:challengeId/delete", requireRole(['admin', 'author']), deleteSubmission); // DELETE submission

export default router;