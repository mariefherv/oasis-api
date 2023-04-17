const db = require('../index');
const { v4: uuidv4 } = require('uuid')

// view all posts
module.exports.viewAll = (req,res) => {
    let sql = `SELECT posts.*, users.username FROM posts INNER JOIN users ON posts.user_id=users.user_id ORDER BY date_posted DESC`

    db.query(sql, (err,result) => {
		if(err) throw err;
		res.send(result)
	}
    )
}

// view a specific post
module.exports.view = (req,res) => {
    const post_id = req.params.post_id

    let sql = `SELECT posts.*, users.username FROM posts INNER JOIN users ON posts.user_id=users.user_id WHERE post_id='${post_id}'`

    db.query(sql, (err,result) => {
		if(err) throw err;
		res.send(result)
	}
    )
}

// view posts from a specific user
module.exports.viewByUser = (req,res) => {
    const user_id = req.params.user_id

    let sql = `SELECT * FROM posts WHERE user_id='${user_id}' ORDER BY date_posted ASC`
    
    db.query(sql, (err,result) => {
		if(err) throw err;
		res.send(result)
	}
    )
}

// create new post
module.exports.create = (req,res) => {
    const user_id = req.user.user_id
    const datetime = new Date()
    const id = uuidv4()

	let post = {
        post_id: id,
		subject: req.body.subject,
        content: req.body.content,
        user_id: user_id,
        date_posted: datetime
	}

	let sql = 'INSERT INTO posts SET ?'

	db.query(sql, post, (err,result) => {
		if(err) throw err;
		res.send(result)
	}
	)
}

// edit post
module.exports.edit = (req,res) => {
    const post_id = req.params.post_id
    const datetime = new Date()

    let sql = `SELECT * FROM posts WHERE user_id='${req.user.user_id}' AND post_id='${post_id}'`

    db.query(sql, (err, result) => {
		if(err) throw err;
		if(result.length !== 0){
			let task = {
                subject: req.body.subject,
                content: req.body.content,
                date_posted: datetime
			}

			sql = `UPDATE posts SET ? WHERE post_id='${post_id}'`

			db.query(sql, task, (err,result) => {
				if(err) throw err;
				res.send(true)
			})
		} else {
			res.send(false)
		}
	})
}

// Delete a post
module.exports.delete = (req,res) => {
    const post_id = req.params.post_id

    let sql = `SELECT * FROM posts WHERE user_id='${req.user.user_id}' AND post_id='${post_id}'`

    db.query(sql, (err, result) => {
		if(err) throw err;
		if(result.length !== 0){
            sql = `DELETE FROM posts WHERE post_id='${post_id}'`

            db.query(sql, (err, result) => {
                if(err) throw err;
                    res.send(true)
                }
            )
		} else {
			res.send(false)
		}
	})
}

// view comments on a post
module.exports.viewComments = (req,res) => {
    const post_id = req.params.post_id

    let sql = `SELECT comments.*, users.username FROM comments INNER JOIN users ON comments.user_id = users.user_id WHERE post_id='${post_id}' ORDER BY date_commented ASC`

    db.query(sql, (err, result) => {
        if(err) throw err;
        res.send(result)
    }
)
}

// comment on a post
module.exports.comment = (req,res) => {
    const user_id = req.user.user_id
    const post_id = req.params.post_id
    const datetime = new Date()
    const id = uuidv4()

	let comment = {
        comment_id: id,
        user_id: user_id,
		post_id: post_id,
        content: req.body.content,
        date_commented: datetime
	}

	let sql = 'INSERT INTO comments SET ?'

	db.query(sql, comment, (err,result) => {
		if(err) throw err;
		res.send(result)
	}
	)
}

// edit comment
module.exports.editComment = (req,res) => {
    const comment_id = req.params.comment_id
    const datetime = new Date()

    let sql = `SELECT * FROM comments WHERE user_id='${req.user.user_id}' AND comment_id='${comment_id}'`

    db.query(sql, (err, result) => {
        if(err) throw err;
		if(result.length !== 0){
            let comment = {
                content: req.body.content,
                date_commented: datetime
            }

            let sql = `UPDATE comments SET ? WHERE user_id='${req.user.user_id}' AND comment_id='${comment_id}'`

            db.query(sql, comment, (err, result) => {
                if(err) throw err;
                res.send(true)
            })
        } else {
            res.send(false)
        }
    })
}

// Delete a comment
module.exports.deleteComment = (req,res) => {
    const comment_id = req.params.comment_id

    let sql = `SELECT * FROM comments WHERE user_id='${req.user.user_id}' AND comment_id='${comment_id}'`

    db.query(sql, (err, result) => {
		if(err) throw err;
		if(result.length !== 0){
            sql = `DELETE FROM comments WHERE user_id='${req.user.user_id}' AND comment_id='${comment_id}'`

            db.query(sql, (err, result) => {
                if(err) throw err;
                    res.send(true)
                }
            )
		} else {
			res.send(false)
		}
	})
}

// Like a post
module.exports.likePost = (req,res) => {
    const id = uuidv4()
    const user_id = req.user.user_id
    const post_id = req.params.post_id
    const datetime = new Date()

    let sql = `SELECT * FROM likes WHERE user_id='${user_id}' AND post_id='${post_id}'`

    db.query(sql, (err, result) => {
        if(err) throw err;
        if(result.length === 0) {
            let sql = 'INSERT INTO likes SET ?'

            let like = {
                like_id: id,
                user_id: user_id,
                post_id: post_id,
                date_liked: datetime
            }

            db.query(sql, like, (err,result) => {
                if(err) throw err;
                res.send(result)
            }
            )
        } else {
            res.send(false)
        }
    }
    )
}

// Unlike a post
module.exports.unlikePost = (req,res) => {
    const user_id = req.user.user_id
    const post_id = req.params.post_id

    let sql = `SELECT * FROM likes WHERE user_id='${user_id}' AND post_id='${post_id}'`

    db.query(sql, (err, result) => {
		if(err) throw err;
		if(result.length !== 0){
            sql = `DELETE FROM likes WHERE user_id='${user_id}' AND post_id='${post_id}'`

            db.query(sql, (err, result) => {
                if(err) throw err;
                    res.send(true)
                }
            )
		} else {
			res.send(false)
		}
	})
}

// Check if user has liked the post
module.exports.checkLike = (req, res) => {
    const user_id = req.user.user_id
    const post_id = req.params.post_id

    let sql = `SELECT users.user_id, users.username FROM users INNER JOIN likes ON users.user_id=likes.user_id WHERE likes.post_id='${post_id}' AND likes.user_id = '${user_id}'`

    db.query(sql, (err,result) => {
		if(err) throw err;
		res.send(result)
	}
    )
}

// Like a comment
module.exports.likeComment = (req,res) => {
    const id = uuidv4()
    const user_id = req.user.user_id
    const comment_id = req.params.comment_id
    const datetime = new Date()

    let sql = `SELECT * FROM comment_likes WHERE user_id='${user_id}' AND comment_id='${comment_id}'`

    db.query(sql, (err, result) => {
        if(err) throw err;
        if(result.length === 0) {
            let sql = 'INSERT INTO comment_likes SET ?'

            let like = {
                like_id: id,
                user_id: user_id,
                comment_id: comment_id,
                date_liked: datetime
            }

            db.query(sql, like, (err,result) => {
                if(err) throw err;
                res.send(result)
            }
            )
        } else {
            res.send(false)
        }
    }
    )
}

// Unlike a comment
module.exports.unlikeComment = (req,res) => {
    const user_id = req.user.user_id
    const comment_id = req.params.comment_id

    let sql = `SELECT * FROM comment_likes WHERE user_id='${user_id}' AND comment_id='${comment_id}'`

    db.query(sql, (err, result) => {
		if(err) throw err;
		if(result.length !== 0){
            sql = `DELETE FROM comment_likes WHERE user_id='${user_id}' AND comment_id='${comment_id}'`

            db.query(sql, (err, result) => {
                if(err) throw err;
                    res.send(true)
                }
            )
		} else {
			res.send(false)
		}
	})
}

// Check if user has liked the comment
module.exports.checkLikeComment = (req, res) => {
    const user_id = req.user.user_id
    const comment_id = req.params.comment_id

    let sql = `SELECT users.user_id, users.username FROM users INNER JOIN comment_likes ON users.user_id=comment_likes.user_id WHERE comment_likes.comment_id='${comment_id}' AND comment_likes.user_id = '${user_id}'`

    db.query(sql, (err,result) => {
		if(err) throw err;
		res.send(result)
	}
    )
}