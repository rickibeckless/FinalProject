import express from "express";
import { 
    getAllComments,
    getAllGivenCommentsByUserId,
    getAllReceivedCommentsByUserId,
    getAllCommentsBySubmissionId,
    getAllCommentsByChallengeId,
    createNewComment,
    updateCommentByCommentId,
    deleteCommentByCommentId
} from "../controllers/commentControllers.js";
import { requireRole } from "../middleware/auth.js";

const router = express.Router();

// /api/comments

router.get("/", getAllComments); // GET all comments
router.get("/user/:userId/given", getAllGivenCommentsByUserId); // GET all given comments by user ID
router.get("/user/:userId/received", getAllReceivedCommentsByUserId); // GET all received comments by user ID
router.get("/submission/:submissionId", getAllCommentsBySubmissionId); // GET all comments by submission ID
router.get("/challenge/:challengeId", getAllCommentsByChallengeId); // GET all comments by challenge ID

router.post("/user/:userId/submission/:submissionId/create", createNewComment); // POST new comment

router.patch("/:commentId/edit", requireRole(['admin', 'author']), updateCommentByCommentId); // PATCH comment

router.delete("/:commentId/delete", requireRole(['admin', 'author']), deleteCommentByCommentId ); // DELETE comment

export default router;