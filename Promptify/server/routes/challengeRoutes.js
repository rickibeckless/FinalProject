import express from "express";
import { getChallenges, getChallengeById, createChallenge, editChallenge, deleteChallenge } from "../controllers/challengeControllers.js";

const router = express.Router();

// /api/challenges

router.get("/", getChallenges); // GET all challenges
router.get("/:id", getChallengeById); // GET challenges by ID

router.post("/create", createChallenge); // POST new challenge
router.patch("/edit/:id", editChallenge); // PATCH edit challenge

router.delete("/delete/:id", deleteChallenge); // DELETE challenge

export default router;