const express = require("express");
const auth = require("../auth");
const router = express.Router();

const therapistControllers = require("../controllers/therapistControllers");

const { verify, verifyAdmin } = auth;

//get a therapist detail 
router.get("/view", verify, therapistControllers.getTherapistDetails);

//get all therapists
router.get("/viewAll", verify, therapistControllers.getDetails);

module.exports = router;