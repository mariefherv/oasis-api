
const express = require("express");
const auth = require("../auth");
const router = express.Router();

const adminControllers = require("../controllers/adminControllers");

const { verify, verifyAdmin } = auth;

// get list of users
router.get("/getUsers", verify, verifyAdmin, adminControllers.getUsers)

// get list of users with search
router.get("/getUsersSearch/:keyword", verify, verifyAdmin, adminControllers.getUsersSearch)

// update roles (user or admin)
router.post("/updateRole/:user_id", verify, verifyAdmin, adminControllers.updateRole)

// user to therapist
router.post("/toTherapist/:user_id", verify, verifyAdmin, adminControllers.toTherapist)

// get list of posts
router.get("/getPosts", verify, verifyAdmin, adminControllers.viewPosts)

// get list of users with search
router.get("/getPostsSearch/:keyword", verify, verifyAdmin, adminControllers.viewPostsSearch)

module.exports = router;