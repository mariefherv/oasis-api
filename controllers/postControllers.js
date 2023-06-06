const db = require('../index');
const { v4: uuidv4 } = require('uuid')

// view all posts sort by recency
module.exports.viewAll = (req,res) => {
    const user_id = req.user.user_id

    let sql = `
    SELECT DISTINCT
        posts.post_id AS p_id,
        posts.subject,
        posts.content,
        posts.date_posted,
        posts.user_id,
        posts.edited,
        users.username,
        COALESCE(contacts.status, "INACTIVE") AS status,
        contacts.blocked_by,
        users.role,
        CASE
            WHEN users.role = 'Therapist'
            THEN (SELECT therapists.prefix FROM therapists INNER JOIN users ON therapists.user_id = users.user_id GROUP BY therapists.prefix)
            ELSE NULL
        END AS prefix,
        CASE
            WHEN users.role = 'Therapist'
            THEN (SELECT therapists.last_name FROM therapists INNER JOIN users ON therapists.user_id = users.user_id GROUP BY therapists.prefix)
            ELSE NULL
        END AS last_name,
        CASE
            WHEN users.role = 'Therapist'
            THEN (SELECT therapists.suffix FROM therapists INNER JOIN users ON therapists.user_id = users.user_id GROUP BY therapists.prefix)
            ELSE NULL
        END AS suffix
    FROM
        posts
        INNER JOIN users ON posts.user_id = users.user_id
        LEFT JOIN contacts ON ((posts.user_id = contacts.contact_person_id AND contacts.user_id = '${user_id}') OR (posts.user_id = contacts.user_id AND contacts.contact_person_id = '${user_id}'))
    ORDER BY
        posts.date_posted DESC;
`

    db.query(sql, (err,result) => {
		if(err) throw err;
		res.send(result)
	}
    )
}

// view all posts sort by likes
module.exports.viewAllByLikes = (req,res) => {
    const user_id = req.user.user_id

    let sql = `
    SELECT DISTINCT
        posts.post_id AS p_id,
        posts.subject,
        posts.content,
        posts.date_posted,
        posts.user_id,
        posts.edited,
        users.username,
        COALESCE(contacts.status, "INACTIVE") AS status,
        contacts.blocked_by,
        users.role,
        CASE
            WHEN users.role = 'Therapist'
            THEN (SELECT therapists.prefix FROM therapists INNER JOIN users ON therapists.user_id = users.user_id GROUP BY therapists.prefix)
            ELSE NULL
        END AS prefix,
        CASE
            WHEN users.role = 'Therapist'
            THEN (SELECT therapists.last_name FROM therapists INNER JOIN users ON therapists.user_id = users.user_id GROUP BY therapists.prefix)
            ELSE NULL
        END AS last_name,
        CASE
            WHEN users.role = 'Therapist'
            THEN (SELECT therapists.suffix FROM therapists INNER JOIN users ON therapists.user_id = users.user_id GROUP BY therapists.prefix)
            ELSE NULL
        END AS suffix
    FROM
        posts
        INNER JOIN users ON posts.user_id = users.user_id
        LEFT JOIN contacts ON ((posts.user_id = contacts.contact_person_id AND contacts.user_id = '${user_id}') OR (posts.user_id = contacts.user_id AND contacts.contact_person_id = '${user_id}'))
    ORDER BY (SELECT COUNT(like_id) FROM likes WHERE p_id = post_id) DESC`

    db.query(sql, (err,result) => {
		if(err) throw err;
		res.send(result)
	}
    )
}

// view a specific post
module.exports.view = (req,res) => {
    const post_id = req.params.post_id

    let sql = `SELECT         
    posts.post_id AS p_id,
    posts.subject,
    posts.content,
    posts.date_posted,
    posts.user_id,
    posts.edited,
    users.username,
    users.role,
    CASE
            WHEN users.role = 'Therapist'
            THEN (SELECT therapists.prefix FROM therapists INNER JOIN users ON therapists.user_id = users.user_id GROUP BY therapists.prefix)
            ELSE NULL
        END AS prefix,
        CASE
            WHEN users.role = 'Therapist'
            THEN (SELECT therapists.last_name FROM therapists INNER JOIN users ON therapists.user_id = users.user_id GROUP BY therapists.prefix)
            ELSE NULL
        END AS last_name,
        CASE
            WHEN users.role = 'Therapist'
            THEN (SELECT therapists.suffix FROM therapists INNER JOIN users ON therapists.user_id = users.user_id GROUP BY therapists.prefix)
            ELSE NULL
        END AS suffix
    FROM posts INNER JOIN users ON posts.user_id=users.user_id WHERE post_id='${post_id}'`

    db.query(sql, (err,result) => {
		if(err) throw err;
		res.send(result)
	}
    )
}

// view posts from a specific user
module.exports.viewByUser = (req,res) => {
    const user_id = req.params.user_id

    let sql = `SELECT 
        posts.post_id AS p_id,
        posts.subject,
        posts.content,
        posts.date_posted AS date_time,
        posts.user_id,
        posts.edited,
        users.role,
        users.username,
        CASE
            WHEN users.role = 'Therapist'
            THEN (SELECT therapists.prefix FROM therapists INNER JOIN users ON therapists.user_id = users.user_id GROUP BY therapists.prefix)
            ELSE NULL
        END AS prefix,
        CASE
            WHEN users.role = 'Therapist'
            THEN (SELECT therapists.last_name FROM therapists INNER JOIN users ON therapists.user_id = users.user_id GROUP BY therapists.prefix)
            ELSE NULL
        END AS last_name,
        CASE
            WHEN users.role = 'Therapist'
            THEN (SELECT therapists.suffix FROM therapists INNER JOIN users ON therapists.user_id = users.user_id GROUP BY therapists.prefix)
            ELSE NULL
        END AS suffix
     FROM posts INNER JOIN users ON posts.user_id=users.user_id WHERE posts.user_id='${user_id}' ORDER BY posts.date_posted DESC`
    
    db.query(sql, (err,result) => {
		if(err) throw err;
		res.send(result)
	}
    )
}

// view comments from a specific user
module.exports.viewCommentsByUser = (req,res) => {
    const user_id = req.params.user_id

    let sql = `SELECT
        comments.comment_id AS c_id,
        comments.content,
        comments.date_commented AS date_time,
        comments.user_id, 
        comments.post_id AS p_id,
        users.username,
        users.role,
        CASE
            WHEN users.role = 'Therapist'
            THEN (SELECT therapists.prefix FROM therapists INNER JOIN users ON therapists.user_id = users.user_id GROUP BY therapists.prefix)
            ELSE NULL
        END AS prefix,
        CASE
            WHEN users.role = 'Therapist'
            THEN (SELECT therapists.last_name FROM therapists INNER JOIN users ON therapists.user_id = users.user_id GROUP BY therapists.prefix)
            ELSE NULL
        END AS last_name,
        CASE
            WHEN users.role = 'Therapist'
            THEN (SELECT therapists.suffix FROM therapists INNER JOIN users ON therapists.user_id = users.user_id GROUP BY therapists.prefix)
            ELSE NULL
        END AS suffix
     FROM comments INNER JOIN users ON comments.user_id=users.user_id WHERE comments.user_id='${user_id}' ORDER BY comments.date_commented DESC`
    
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

    let sql = `SELECT * FROM posts WHERE user_id='${req.user.user_id}' AND post_id='${post_id}'`

    db.query(sql, (err, result) => {
		if(err) throw err;
		if(result.length !== 0){
			let task = {
                subject: req.body.subject,
                content: req.body.content,
                edited: req.body.edited
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

// report a post
module.exports.report = (req,res) => {
    const user_id = req.user.user_id
    const id = uuidv4()

	let report = {
        flag_id: id,
		post_id: req.params.post_id,
        reported_by: user_id,
        type: req.body.type,
        details: req.body.details
	}

	let sql = 'INSERT INTO flagged_posts SET ?'

	db.query(sql, report, (err,result) => {
		if(err) throw err;
		res.send(result)
	}
	)
}

// view comments on a post
module.exports.viewComments = (req,res) => {
    const post_id = req.params.post_id

    let sql = `SELECT comments.*,
    users.username, users.role,
    CASE
            WHEN users.role = 'Therapist'
            THEN (SELECT therapists.prefix FROM therapists INNER JOIN users ON therapists.user_id = users.user_id GROUP BY therapists.prefix)
            ELSE NULL
        END AS prefix,
        CASE
            WHEN users.role = 'Therapist'
            THEN (SELECT therapists.last_name FROM therapists INNER JOIN users ON therapists.user_id = users.user_id GROUP BY therapists.prefix)
            ELSE NULL
        END AS last_name,
        CASE
            WHEN users.role = 'Therapist'
            THEN (SELECT therapists.suffix FROM therapists INNER JOIN users ON therapists.user_id = users.user_id GROUP BY therapists.prefix)
            ELSE NULL
        END AS suffix 
    FROM comments INNER JOIN users ON comments.user_id = users.user_id WHERE post_id='${post_id}' ORDER BY date_commented ASC`

    db.query(sql, (err, result) => {
        if(err) throw err;
        res.send(result)
    }
)
}

module.exports.comment = (req, res) => {
    const user_id = req.user.user_id;
    const post_id = req.params.post_id;
    const datetime = new Date();
    const id = uuidv4();
    const notif_user_id = req.body.post_user_id;

    let comment = {
        comment_id: id,
        user_id: user_id,
        post_id: post_id,
        content: req.body.content,
        date_commented: datetime
    };

    let sql = 'INSERT INTO comments SET ?';

    db.query(sql, comment, (err, result) => {
        if (err) throw err;
        if (result.affectedRows !== 0) {
            sql = `SELECT notification_id FROM notifications WHERE type = "comment" AND post_id = '${post_id}'`;

            db.query(sql, (err, result) => {
                if (err) throw err;
                if (result.length === 0) {
                    if (user_id !== notif_user_id) {
                        let notification = {
                            user_id: notif_user_id,
                            triggered_by: user_id,
                            type: 'comment',
                            post_id: post_id
                        };

                        sql = 'INSERT INTO notifications SET ?';

                        db.query(sql, notification, (err, result) => {
                            if (err) throw err;
                            result.affectedRows !== 0 ? res.send(true) : res.send(false);
                        });
                    } else {
                        res.send(true);
                    }
                } else {
                    if (user_id !== notif_user_id) {
                    const notif_id = result[0].notification_id
                    sql = `UPDATE notifications SET marked_read = 0, triggered_by = '${user_id}' WHERE notification_id = '${notif_id}'`;

                    db.query(sql, (err, result) => {
                        if (err) throw err;
                        result.affectedRows !== 0 ? res.send(true) : res.send(false);
                    });} 
                    else {
                        res.send(true)
                    }
                }
            });
        } else {
            res.send(false);
        }
    });
};


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
    const notif_user_id = req.body.post_user_id

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
                if (result.affectedRows !== 0){
                    sql = `SELECT notification_id FROM notifications WHERE type = "like_post" AND post_id = '${post_id}'`

                    db.query(sql, (err, result) => {
                        if(result.length === 0){
                            if(user_id !== notif_user_id){
                                let notification = {
                                    user_id: notif_user_id,
                                    triggered_by: user_id,
                                    type: 'like_post',
                                    post_id: post_id
                                }
                                
                                sql = 'INSERT INTO notifications SET ?'
            
                                db.query(sql, notification, (err, result) => {
                                    if(err) throw err;
                                    result.affectedRows !== 0 ? res.send(true) : res.send(false)                    
                                })
                            } else {
                                res.send(true)
                        }} else {
                            if(user_id !== notif_user_id){
                                const notification_id = result[0].notification_id
                                sql = `UPDATE notifications SET marked_read = 0, triggered_by = '${user_id}' WHERE notification_id = '${notification_id}'`

                                db.query(sql, (err, result) => {
                                    if(err) throw err;
                                    result.affectedRows !== 0 ? res.send(true) : res.send(false)    
                            })} else {
                                res.send(true)
                            }
                    }
                    })
                } else {
                    res.send(false)
                }
            })
            }  else {
                res.send(false)
            }})
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
                if (result.affectedRows !== 0){
                    sql = `DELETE FROM notifications WHERE triggered_by = '${user_id}' AND post_id = '${post_id}'`

                    db.query(sql, (err, result) => {
                        if(err) throw err;
                        res.send(true)                 
                    })
                }
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

// Count number of likes of a certain post
module.exports.countLikes = (req, res) => {
    const post_id = req.params.post_id

    let sql = `SELECT COUNT(like_id) AS count FROM likes WHERE post_id='${post_id}'`

    db.query(sql, (err,result) => {
		if(err) throw err;
		res.send(result)
	}
    )
}

// view a comment
module.exports.viewSingleComment = (req, res) => {
    const comment_id = req.params.comment_id

    let sql = `SELECT * FROM comments WHERE comment_id = '${comment_id}'`

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
    const notif_user_id = req.body.comment_user_id


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
                if (result.affectedRows !== 0){
                    sql = `SELECT notification_id FROM notifications WHERE type = "like_comment" AND comment_id = '${comment_id}'`

                    db.query(sql, (err, result) => {
                        if(result.length === 0){
                            if(user_id !== notif_user_id){
                                let notification = {
                                    user_id: notif_user_id,
                                    triggered_by: user_id,
                                    type: 'like_comment',
                                    comment_id: comment_id
                                }
                                
                                sql = 'INSERT INTO notifications SET ?'
            
                                db.query(sql, notification, (err, result) => {
                                    if(err) throw err;
                                    result.affectedRows !== 0 ? res.send(true) : res.send(false)                    
                                })
                            } else {
                                res.send(true)
                        }} else {
                            if(user_id !== notif_user_id){
                            const notification_id = result[0].notification_id
                            sql = `UPDATE notifications SET marked_read = 0, triggered_by = '${user_id}' WHERE notification_id = '${notification_id}'`

                            db.query(sql, (err, result) => {
                                if(err) throw err;
                                result.affectedRows !== 0 ? res.send(true) : res.send(false)    
                            })
                        } else {
                            res.send(true)
                        }
                    }
                    })
                } else {
                    res.send(false)
                }            }
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

// Count number of likes of a certain comment
module.exports.countCommentLikes = (req, res) => {
    const comment_id = req.params.comment_id

    let sql = `SELECT COUNT(like_id) AS count FROM comment_likes WHERE comment_id='${comment_id}'`

    db.query(sql, (err,result) => {
		if(err) throw err;
		res.send(result)
	}
    )
}

// Count number of likes received by user
module.exports.countUserLikes = (req, res) => {
    const user_id = req.params.user_id

    let sql = `SELECT COUNT(like_id) AS count FROM (SELECT like_id FROM likes INNER JOIN posts ON likes.post_id = posts.post_id INNER JOIN users ON posts.user_id = users.user_id WHERE users.user_id = '${user_id}'
    UNION
    SELECT like_id FROM comment_likes INNER JOIN comments ON comment_likes.comment_id = comments.comment_id INNER JOIN users ON comments.user_id = users.user_id WHERE users.user_id = '${user_id}') AS count`

    db.query(sql, (err,result) => {
		if(err) throw err;
		res.send(result)
	}
    )
}


// view all posts and comments
module.exports.viewAllCommentsPostsByRecent = (req, res) => {
    const user_id = req.params.user_id

    let sql = `SELECT 
                post_id AS p_id,
                NULL AS c_id,
                subject,
                content,
                date_posted AS date_time,
                posts.user_id AS user_id,
                users.username,
                edited,
                'post' AS type,
                users.role,
                CASE
                    WHEN users.role = 'Therapist'
                    THEN (SELECT therapists.prefix FROM therapists INNER JOIN users ON therapists.user_id = users.user_id GROUP BY therapists.prefix)
                    ELSE NULL
                END AS prefix,
                CASE
                    WHEN users.role = 'Therapist'
                    THEN (SELECT therapists.last_name FROM therapists INNER JOIN users ON therapists.user_id = users.user_id GROUP BY therapists.prefix)
                    ELSE NULL
                END AS last_name,
                CASE
                    WHEN users.role = 'Therapist'
                    THEN (SELECT therapists.suffix FROM therapists INNER JOIN users ON therapists.user_id = users.user_id GROUP BY therapists.prefix)
                    ELSE NULL
                END AS suffix
            FROM 
                posts
            LEFT JOIN 
                users ON posts.user_id = users.user_id
            WHERE 
                posts.user_id = '${user_id}'
            UNION
            SELECT 
                post_id AS p_id,
                comment_id AS c_id,
                NULL AS subject,
                content,
                date_commented AS date_time,
                comments.user_id AS user_id,
                users.username,
                NULL AS edited,
                'comment' AS type,
                users.role,
                CASE
                    WHEN users.role = 'Therapist'
                    THEN (SELECT therapists.prefix FROM therapists INNER JOIN users ON therapists.user_id = users.user_id GROUP BY therapists.prefix)
                    ELSE NULL
                END AS prefix,
                CASE
                    WHEN users.role = 'Therapist'
                    THEN (SELECT therapists.last_name FROM therapists INNER JOIN users ON therapists.user_id = users.user_id GROUP BY therapists.prefix)
                    ELSE NULL
                END AS last_name,
                CASE
                    WHEN users.role = 'Therapist'
                    THEN (SELECT therapists.suffix FROM therapists INNER JOIN users ON therapists.user_id = users.user_id GROUP BY therapists.prefix)
                    ELSE NULL
                END AS suffix
            FROM 
                comments
            LEFT JOIN 
                users ON comments.user_id = users.user_id
            WHERE 
                comments.user_id = '${user_id}'
            ORDER BY 
                date_time DESC;
            `

    db.query(sql, (err,result) => {
        if(err) throw err;
        res.send(result)
    }
    )
}

// view all posts and comments by likes
module.exports.viewAllCommentsPostsByLikes = (req, res) => {
    const user_id = req.params.user_id

    let sql = `SELECT 
                    post_id AS p_id,
                    NULL AS c_id,
                    subject,
                    content,
                    date_posted AS date_time,
                    posts.user_id AS user_id,
                    users.username,
                    edited,
                    'post' AS type,
                    users.role,
                    CASE
                        WHEN users.role = 'Therapist'
                        THEN (SELECT therapists.prefix FROM therapists INNER JOIN users ON therapists.user_id = users.user_id GROUP BY therapists.prefix)
                        ELSE NULL
                    END AS prefix,
                    CASE
                        WHEN users.role = 'Therapist'
                        THEN (SELECT therapists.last_name FROM therapists INNER JOIN users ON therapists.user_id = users.user_id GROUP BY therapists.prefix)
                        ELSE NULL
                    END AS last_name,
                    CASE
                        WHEN users.role = 'Therapist'
                        THEN (SELECT therapists.suffix FROM therapists INNER JOIN users ON therapists.user_id = users.user_id GROUP BY therapists.prefix)
                        ELSE NULL
                    END AS suffix
                FROM 
                    posts
                LEFT JOIN 
                    users ON posts.user_id = users.user_id
                WHERE 
                    posts.user_id = '${user_id}'
                UNION
                SELECT 
                    post_id AS p_id,
                    comment_id AS c_id,
                    NULL AS subject,
                    content,
                    date_commented AS date_time,
                    comments.user_id AS user_id,
                    users.username,
                    NULL AS edited,
                    'comment' AS type,
                    users.role,
                    CASE
                        WHEN users.role = 'Therapist'
                        THEN (SELECT therapists.prefix FROM therapists INNER JOIN users ON therapists.user_id = users.user_id GROUP BY therapists.prefix)
                        ELSE NULL
                    END AS prefix,
                    CASE
                        WHEN users.role = 'Therapist'
                        THEN (SELECT therapists.last_name FROM therapists INNER JOIN users ON therapists.user_id = users.user_id GROUP BY therapists.prefix)
                        ELSE NULL
                    END AS last_name,
                    CASE
                        WHEN users.role = 'Therapist'
                        THEN (SELECT therapists.suffix FROM therapists INNER JOIN users ON therapists.user_id = users.user_id GROUP BY therapists.prefix)
                        ELSE NULL
                    END AS suffix
                FROM 
                    comments
                LEFT JOIN 
                    users ON comments.user_id = users.user_id
                WHERE 
                    comments.user_id = '${user_id}'
                ORDER BY 
                    CASE 
                        WHEN type = 'post' 
                        THEN (
                            SELECT COUNT(like_id) 
                            FROM likes 
                            WHERE p_id = post_id
                        ) 
                        ELSE (
                            SELECT COUNT(like_id) 
                            FROM comment_likes 
                            WHERE c_id = comment_id
                        )
                    END 
                    DESC;
                `

    db.query(sql, (err,result) => {
        if(err) throw err;
        res.send(result)
    }
    )
}

// view all posts and comments liked by the user
module.exports.viewAllLikedCommentsPosts = (req, res) => {
    const user_id = req.params.user_id

    let sql = `SELECT
                    posts.post_id AS p_id,
                    NULL AS c_id,
                    posts.subject,
                    posts.content,
                    posts.date_posted AS date_time,
                    posts.user_id AS user_id,
                    posts.edited,
                    'post' AS type,
                    users.role,
                    CASE
                        WHEN users.role = 'Therapist'
                        THEN (SELECT therapists.prefix FROM therapists INNER JOIN users ON therapists.user_id = users.user_id GROUP BY therapists.prefix)
                        ELSE NULL
                    END AS prefix,
                    CASE
                        WHEN users.role = 'Therapist'
                        THEN (SELECT therapists.last_name FROM therapists INNER JOIN users ON therapists.user_id = users.user_id GROUP BY therapists.prefix)
                        ELSE NULL
                    END AS last_name,
                    CASE
                        WHEN users.role = 'Therapist'
                        THEN (SELECT therapists.suffix FROM therapists INNER JOIN users ON therapists.user_id = users.user_id GROUP BY therapists.prefix)
                        ELSE NULL
                    END AS suffix
                FROM posts INNER JOIN likes ON posts.post_id = likes.post_id 
                INNER JOIN users ON likes.user_id = users.user_id 
                WHERE likes.user_id = '${user_id}'
                UNION
                SELECT
                    comments.post_id AS p_id,
                    comments.comment_id AS c_id,
                    NULL AS subject,
                    comments.content,
                    comments.date_commented AS date_time,
                    comments.user_id AS user_id,
                    NULL AS edited,
                    'comment' AS type,
                    users.role,
                    CASE
                        WHEN users.role = 'Therapist'
                        THEN (SELECT therapists.prefix FROM therapists INNER JOIN users ON therapists.user_id = users.user_id GROUP BY therapists.prefix)
                        ELSE NULL
                    END AS prefix,
                    CASE
                        WHEN users.role = 'Therapist'
                        THEN (SELECT therapists.last_name FROM therapists INNER JOIN users ON therapists.user_id = users.user_id GROUP BY therapists.prefix)
                        ELSE NULL
                    END AS last_name,
                    CASE
                        WHEN users.role = 'Therapist'
                        THEN (SELECT therapists.suffix FROM therapists INNER JOIN users ON therapists.user_id = users.user_id GROUP BY therapists.prefix)
                        ELSE NULL
                    END AS suffix
                FROM comments INNER JOIN comment_likes ON comments.comment_id = comment_likes.comment_id
                INNER JOIN users ON comment_likes.user_id = users.user_id 
                WHERE comment_likes.user_id = '${user_id}'
                `

    db.query(sql, (err,result) => {
        if(err) throw err;
        res.send(result)
    }
    )
}