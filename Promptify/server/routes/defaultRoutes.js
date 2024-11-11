import express from "express";
import { 
    resetFullDatabase, 
    createDefaultUsers, 
    createDefaultChallenges, 
    checkAndSetBaseData, 
    resetSingleTable 
} from "../controllers/defaultControllers.js";
import { requireRole } from "../middleware/auth.js";

// /api/admin/default

const router = express.Router();

router.post("/reset/:currentAdminId", requireRole(['admin']), resetFullDatabase); // POST reset full database
router.post("/base/reset", requireRole(['admin']), checkAndSetBaseData); // POST check and reset base users, challenges, submissions, upvotes, comments
router.post("/reset/:table", requireRole(['admin']), resetSingleTable); // POST reset single table by name
router.post("/users", requireRole(['admin']), createDefaultUsers); // POST new default users
router.post("/challenges", requireRole(['admin']), createDefaultChallenges); // POST new default challenges
// router.post("/submissions", requireRole(['admin']), createDefaultSubmissions); // POST new default submissions
// router.post("/upvotes", requireRole(['admin']), createDefaultUpvotes); // POST new default upvotes
// router.post("/comments", requireRole(['admin']), createDefaultComments); // POST new default comments

export default router;