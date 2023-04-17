const express = require("express");
const auth = require("../auth");
const router = express.Router();

const userControllers = require("../controllers/userControllers");

const { verify, verifyAdmin } = auth;

//register
router.post("/register",userControllers.register);

// login
router.post("/login", userControllers.login);

//get user details
router.get("/getUserDetails", verify, userControllers.getDetails);

// get list of users
router.get("/getUsers", verify, verifyAdmin, userControllers.getUsers)

// check if email exists
router.post("/checkEmail", userControllers.checkEmail)

// check if username exists
router.post("/checkUsername", userControllers.checkUsername)

// user to therapist
router.post("/toTherapist", verify, verifyAdmin, userControllers.toTherapist)

module.exports = router;