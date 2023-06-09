const express = require("express");
const auth = require("../auth");
const router = express.Router();

const notificationControllers = require("../controllers/notificationControllers");

const { verify } = auth;

// view all notifications
router.get("/viewAll", verify, notificationControllers.viewAll);

// view all unread notifications
router.get("/viewUnread", verify, notificationControllers.viewUnread);

// mark notification as read
router.patch("/markRead/:notification_id", verify, notificationControllers.markRead);

module.exports = router;