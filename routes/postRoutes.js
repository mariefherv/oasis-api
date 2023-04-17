const express = require("express");
const auth = require("../auth");
const router = express.Router();

const postControllers = require("../controllers/postControllers");

const { verify, verifyAdmin } = auth;

//view a post
router.get("/view/:post_id", verify, postControllers.view);

// view all posts
router.get("/viewAll", verify, postControllers.viewAll);

//view post by User
router.get("/viewByUser/:user_id", verify, postControllers.viewByUser);

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