import express from "express";
import {  } from "../controllers/commentControllers.js";

const router = express.Router();

// /api/comments

router.get("/", ); // GET all comments
router.get("/user/:userId", ); // GET all comments by user ID
router.get("/submission/:submissionId", ); // GET all comments by submission ID
router.get("/challenge/:challengeId", ); // GET all comments by challenge ID

router.post("/user/:userId/submission/:submissionId/create", ); // POST new comment

router.patch("/user/:userId/submission/:submissionId/edit", ); // PATCH comment

router.delete("/user/:userId/submission/:submissionId/delete", ); // DELETE comment

export default router;