import express from "express";
import '../config/dotenv.js';
import { 
    getAllFollowersByUserId,
    getAllFollowingByUserId
} from "../controllers/userFollowersControllers.js";
import { requireRole } from "../middleware/auth.js";

const router = express.Router();

// /api/user-followers

router.get("/:userId/followers", getAllFollowersByUserId); // GET all followers by user id
router.get("/:userId/following", getAllFollowingByUserId); // GET all following by user id

export default router;