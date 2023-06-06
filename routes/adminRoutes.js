
const express = require("express");
const auth = require("../auth");
const router = express.Router();

const adminControllers = require("../controllers/adminControllers");

const { verify, verifyAdmin } = auth;

// get list of users
router.get("/getUsers", verify, verifyAdmin, adminControllers.getUsers)

// update roles (user or admin)
router.post("/updateRole/:user_id", verify, verifyAdmin, adminControllers.updateRole)

// user to therapist
router.post("/toTherapist/:user_id", verify, verifyAdmin, adminControllers.toTherapist)

module.exports = router;