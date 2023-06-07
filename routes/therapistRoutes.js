const express = require("express");
const auth = require("../auth");
const router = express.Router();

const therapistControllers = require("../controllers/therapistControllers");

const { verify, verifyTherapist } = auth;

//get a therapist detail (user only)
router.get("/view", verify, verifyTherapist, therapistControllers.getTherapistDetails);

//get all therapists
router.get("/viewAll", verify, therapistControllers.getDetails);

//get all therapists by consultation type
router.get("/viewAllByConsultation/:type", verify, therapistControllers.getDetailsByConsultation);

//get all therapists by availability
router.get("/viewAllByAvailability/:date", verify, therapistControllers.getDetailsByAvailability);

//get all therapists by consultation type and availability
router.get("/viewAllByConsultationAvailability/:type/:date/", verify, therapistControllers.getDetailsByConsultationAvailability);

// add slot
router.post("/addSlot", verify, verifyTherapist, therapistControllers.addSlots)

// create notification slots
router.post("/notification", verify, verifyTherapist, therapistControllers.notifySlots)

// get slot by a selected date
router.post("/getSlotsByDate/:therapist_id", verify, therapistControllers.getSlotsByDate)

// get slot by a selected date
router.post("/getTimeSlotByDate/:therapist_id", verify, therapistControllers.getTimeSlotByDate)

// get slot by a selected date
router.get("/getDays/:therapist_id", verify, therapistControllers.getDays)

// check slots
router.get("/checkSlots/:therapist_id", verify, therapistControllers.checkSlots)

module.exports = router;