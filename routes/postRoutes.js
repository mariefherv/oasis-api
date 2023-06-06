const express = require("express");
const auth = require("../auth");
const router = express.Router();

const postControllers = require("../controllers/postControllers");

const { verify } = auth;

//view a post
router.get("/view/:post_id", verify, postControllers.view);

// view all posts by recency
router.get("/viewAllByRecent", verify, postControllers.viewAll);

// view all posts by likes
router.get("/viewAllByLikes", verify, postControllers.viewAllByLikes);

// view all posts and comments by recency
router.get("/viewAllCommentsPostsByRecent/:user_id", verify, postControllers.viewAllCommentsPostsByRecent);

//view post and comments by User by likes
router.get("/viewAllCommentsPostsByLikes/:user_id", verify, postControllers.viewAllCommentsPostsByLikes);

//view post by User
router.get("/viewByUser/:user_id", verify, postControllers.viewByUser);

//view comments by User
router.get("/viewCommentsByUser/:user_id", verify, postControllers.viewCommentsByUser);

//view comments by User
router.get("/viewAllLikedCommentsPosts/:user_id", verify, postControllers.viewAllLikedCommentsPosts);

//create post
router.post("/create", verify, postControllers.create);

// edit post
router.put("/edit/:post_id", verify, postControllers.edit);

// delete post
router.delete("/delete/:post_id", verify, postControllers.delete);

// report post
router.post("/report/:post_id", verify, postControllers.report);

// view all comments on a post
router.get("/comment/:post_id", verify, postControllers.viewComments);

// comment on a post
router.post("/comment/:post_id", verify, postControllers.comment);

// edit comment
router.post("/comment/edit/:comment_id", verify, postControllers.editComment);

// view a comment on a post
router.get("/comment/view/:comment_id", verify, postControllers.viewSingleComment);


// delete comment
router.delete("/comment/delete/:comment_id", verify, postControllers.deleteComment);

// like a post
router.post("/like/:post_id", verify, postControllers.likePost)

// unlike a post
router.delete("/unlike/:post_id", verify, postControllers.unlikePost)

// check if user has liked the post
router.get("/checkLike/:post_id", verify, postControllers.checkLike)

// count number of likes of a post
router.get("/countLikes/:post_id", verify, postControllers.countLikes)

// count number of likes received by user
router.get("/countUserLikes/:user_id", verify, postControllers.countUserLikes)

// like a comment
router.post("/comment/like/:comment_id", verify, postControllers.likeComment)

// unlike a comment
router.delete("/comment/unlike/:comment_id", verify, postControllers.unlikeComment)

// check if user has liked the comment
router.get("/comment/checkLike/:comment_id", verify, postControllers.checkLikeComment)

// count number of likes of a comment
router.get("/comment/countLikes/:comment_id", verify, postControllers.countCommentLikes)

module.exports = router;