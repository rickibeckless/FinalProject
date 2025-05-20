import express from "express";
import { 
    getAllIssues, getOneIssue,
    getAllCurrentIssues, getAllArchivedIssues,
    submitIssue, approveIssue, archiveIssue,
    archiveAllCurrent, deleteIssue,
    deleteAllCurrent, deleteAllArchived
} from "../controllers/issueControllers.js";
import { requireRole } from "../middleware/auth.js";

const router = express.Router();

// /api/issues

router.get("/list", getAllIssues); // GET all issues
router.get("/current", getAllCurrentIssues); // GET all current issues
router.get("/archived", getAllArchivedIssues); // GET all archived issues
router.get("/list/:issueId", getOneIssue); // GET one issue by id

router.post("/submit", submitIssue); // POST one issue

router.put("/current/archive", requireRole(['admin']), archiveAllCurrent); // PUT all current issues to archive
router.put("/:issueId/approve", requireRole(['admin']), approveIssue); // PUT one issue to approve
router.put("/:issueId/archive", requireRole(['admin']), archiveIssue); // PUT one issue to archive

router.delete("/current/delete", requireRole(['admin']), deleteAllCurrent); // DELETE all current issues
router.delete("/archived/delete", requireRole(['admin']), deleteAllArchived); // DELETE all archived issues
router.delete("/:issueId/delete", requireRole(['admin']), deleteIssue); // DELETE one issue

export default router;