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
router.get("/getUserDetails", verify, verifyAdmin, userControllers.getDetails);

// check if email exists
router.post("/checkEmail", userControllers.checkEmail)

// check if username exists
router.post("/checkUsername", userControllers.checkUsername)

module.exports = router;