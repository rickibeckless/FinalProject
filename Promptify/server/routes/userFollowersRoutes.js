import express from "express";
import '../config/dotenv.js';
import { 
    getAllFollowersByUserId,
    getAllFollowingByUserId,
    checkIfUserFollows,
    followUser
} from "../controllers/userFollowersControllers.js";
import { requireRole } from "../middleware/auth.js";

const router = express.Router();

// /api/user-followers

router.get("/:userId/followers", getAllFollowersByUserId); // GET all followers by user id
router.get("/:userId/following", getAllFollowingByUserId); // GET all following by user id
router.get("/:userId/following/:followingId", checkIfUserFollows); // GET check if user follows another user

router.post("/:userId/follow/:followingId", requireRole("user"), followUser); // POST follow user

export default router;