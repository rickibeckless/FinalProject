import express from "express";
import { getChallenges, getChallengeById, createChallenge, editChallenge, deleteChallenge } from "../controllers/challengeControllers.js";

const router = express.Router();

// /api/challenges

router.get("/", getChallenges); // GET all challenges
router.get("/:id", getChallengeById); // GET challenges by ID

router.post("/create", createChallenge); // POST new challenge
router.patch("/:id/edit", editChallenge); // PATCH edit challenge

router.delete("/:id/delete", deleteChallenge); // DELETE challenge

export default router;