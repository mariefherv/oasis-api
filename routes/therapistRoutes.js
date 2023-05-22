const express = require("express");
const auth = require("../auth");
const router = express.Router();

const therapistControllers = require("../controllers/therapistControllers");

const { verify, verifyAdmin, verifyTherapist } = auth;

//get a therapist detail (user only)
router.get("/view", verify, verifyTherapist, therapistControllers.getTherapistDetails);

//get all therapists
router.get("/viewAll", verify, therapistControllers.getDetails);

// add slot
router.post("/addSlot", verify, verifyTherapist, therapistControllers.addSlots)

// get slots by day
router.post("/getSlotsByDay/:therapist_id", verify, verifyTherapist, therapistControllers.getSlotsByDay)

// get slots by week
router.post("/getSlotsByWeek/:therapist_id", verify, verifyTherapist, therapistControllers.getSlotsByWeek)

// get slots by month
router.post("/getSlotsByMonth/:therapist_id", verify, verifyTherapist, therapistControllers.getSlotsByMonth)

module.exports = router;