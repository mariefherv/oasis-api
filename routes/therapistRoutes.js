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

// get slot by a selected date
router.post("/getSlotsByDate/:therapist_id", verify, therapistControllers.getSlotsByDate)

// get slot by a selected date
router.post("/getTimeSlotByDate/:therapist_id", verify, therapistControllers.getTimeSlotByDate)

// get slot by a selected date
router.get("/getDays/:therapist_id", verify, therapistControllers.getDays)

module.exports = router;