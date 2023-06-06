
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

// ban user
router.patch("/banUser/:user_id", verify, verifyAdmin, adminControllers.banUser)

// unban user
router.patch("/unbanUser/:user_id", verify, verifyAdmin, adminControllers.unbanUser)

// user to therapist
router.post("/toTherapist/:user_id", verify, verifyAdmin, adminControllers.toTherapist)

// get list of posts
router.get("/getPosts", verify, verifyAdmin, adminControllers.viewPosts)

// get list of users with search
router.get("/getPostsSearch/:keyword", verify, verifyAdmin, adminControllers.viewPostsSearch)

// delete a post
router.delete("/deletePost/:post_id", verify, verifyAdmin, adminControllers.deletePost)

module.exports = router;