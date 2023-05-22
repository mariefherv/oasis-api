const express = require("express");
const auth = require("../auth");
const router = express.Router();

const bookingControllers = require("../controllers/bookingControllers");

const { verify, verifyAdmin } = auth;

// view a contact
// router.get("/view/:contact_person_id", verify, contactControllers.viewContact);

module.exports = router;