const express = require("express");
const auth = require("../auth");
const router = express.Router();

const bookingControllers = require("../controllers/bookingControllers");

const { verify, verifyAdmin } = auth;

// book a slot
router.post("/bookSlot/:slot_id", verify, bookingControllers.bookSlot);

// 

module.exports = router;