const express = require("express");
const auth = require("../auth");
const router = express.Router();

const postControllers = require("../controllers/postControllers");

const { verify, verifyAdmin } = auth;

//view a post
router.post("/view", verify, postControllers.view);

//view post by User
router.post("/viewByUser", verify, postControllers.viewByUser);

//create post
router.post("/create", verify, postControllers.create);

// edit post
router.post("/edit/:post_id", verify, postControllers.edit);

// delete post
router.delete("/delete/:post_id", verify, postControllers.delete);

// comment on a post
router.post("/comment/:post_id", verify, postControllers.comment);

// edit comment
router.post("/comment/edit/:comment_id", verify, postControllers.editComment);

// delete comment
router.delete("/comment/delete/:comment_id", verify, postControllers.deleteComment);

module.exports = router;