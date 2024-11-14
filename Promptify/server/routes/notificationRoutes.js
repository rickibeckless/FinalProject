import express from "express";
import { 
    getAllNotifications,
    getNotificationsByUserId,
    getNotificationsByNotificationId,
    updateNotificationStatus,
    sendNotificationToUser
} from "../controllers/notificationControllers.js";
import { requireRole } from "../middleware/auth.js";

const router = express.Router();

// /api/notifications

router.get("/", getAllNotifications); // GET all notifications
router.get("/:userId", getNotificationsByUserId); // GET all notifications by user ID
router.get("/:userId/:notificationId", getNotificationsByNotificationId); // GET notification by user ID and notification ID

router.patch("/:userId/:notificationId/:status", updateNotificationStatus); // PATCH notification by user ID and notification ID

router.post("/new", requireRole(['admin']), sendNotificationToUser); // POST notification by author ID

export default router;