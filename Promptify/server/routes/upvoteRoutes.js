import express from "express";
import { 
    getAllUpvotes,
    getAllGivenUpvotesByUserId,
    getAllReceivedUpvotesByUserId,
    getAllUpvotesBySubmissionId,
    getAllUpvotesByChallengeId,
    handleUpvote
} from "../controllers/upvoteControllers.js";

const router = express.Router();

// /api/upvotes

router.get("/", getAllUpvotes); // GET all upvotes
router.get("/user/:userId/given", getAllGivenUpvotesByUserId); // GET all given upvotes by user ID
router.get("/user/:userId/received", getAllReceivedUpvotesByUserId); // GET all received upvotes by user ID
router.get("/submission/:submissionId", getAllUpvotesBySubmissionId); // GET all upvotes by submission ID
router.get("/challenge/:challengeId", getAllUpvotesByChallengeId); // GET all upvotes by challenge ID

router.post("/:submissionId/upvote", handleUpvote); // Create or remove upvote

export default router;