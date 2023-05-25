const express = require("express");
const auth = require("../auth");
const router = express.Router();

const bookingControllers = require("../controllers/bookingControllers");

const { verify, verifyAdmin, verifyTherapist } = auth;

// book a slot
router.post("/bookSlot/:slot_id", verify, bookingControllers.bookSlot);

// retrieve booking detail
router.get("/getDetails/:booking_id", verify, bookingControllers.bookingDetails)

// retrieve all bookings
router.get("/retrieveSlots/:therapist_id", verify, verifyTherapist, bookingControllers.getBookings)

// get slots by day
router.post("/getSlotsByDay/:therapist_id", verify, verifyTherapist, bookingControllers.getSlotsByDay)

// get slots by week
router.post("/getSlotsByWeek/:therapist_id", verify, verifyTherapist, bookingControllers.getSlotsByWeek)

// get slots by month
router.post("/getSlotsByMonth/:therapist_id", verify, verifyTherapist, bookingControllers.getSlotsByMonth)

// confirm a booking
router.patch("/confirmBooking/:booking_id", verify, verifyTherapist, bookingControllers.confirmBooking)

// deny a booking
router.patch("/denyBooking/:booking_id", verify, verifyTherapist, bookingControllers.denyBooking)

// retrieve confirmed bookings by user
router.get("/retrieveConfirmedBookings", verify,  bookingControllers.retrieveConfirmedBookings)

// retrieve past bookings by user
router.get("/retrievePastBookings", verify,  bookingControllers.retrievePastBookings)

module.exports = router;