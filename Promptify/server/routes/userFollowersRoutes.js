import express from "express";
import '../config/dotenv.js';
import { 
    getAllFollowersByUserId,
    getAllFollowingByUserId,
    followUser,
    unfollowUser
} from "../controllers/userFollowersControllers.js";
import { requireRole } from "../middleware/auth.js";

const router = express.Router();

// /api/user-followers

router.get("/:userId/followers", getAllFollowersByUserId); // GET all followers by user id
router.get("/:userId/following", getAllFollowingByUserId); // GET all following by user id

router.post("/:userId/follow/:followingId", requireRole("user"), followUser); // POST follow user
router.delete("/:userId/unfollow/:followingId", requireRole("user"), unfollowUser); // DELETE unfollow user

export default router;