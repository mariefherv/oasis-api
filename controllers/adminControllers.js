const db = require('../index');

// get list of users
module.exports.getUsers = (req, res) => {
    let sql =
    `SELECT users.user_id, users.username, users.role, users.gender,
    users.fb_link, users.twt_link, users.li_link, users.banned,
    therapists.prefix, therapists.first_name, therapists.last_name,
    therapists.suffix, therapists.field, therapists.description,
    therapists.online, therapists.in_person
    FROM users LEFT JOIN therapists ON therapists.user_id = users.user_id`

    db.query(sql, (err,result) => {
        if(err) throw err;
        res.send(result)
    })
}

// get list of with search
module.exports.getUsersSearch = (req, res) => {
    const keyword = req.params.keyword

    let sql =
    `SELECT users.user_id, users.username, users.role, users.gender,
    users.fb_link, users.twt_link, users.li_link, users.banned,
    therapists.prefix, therapists.first_name, therapists.last_name,
    therapists.suffix, therapists.field, therapists.description,
    therapists.online, therapists.in_person
    FROM users LEFT JOIN therapists ON therapists.user_id = users.user_id
    WHERE users.username LIKE '${keyword}%'`

    db.query(sql, (err,result) => {
        if(err) throw err;
        res.send(result)
    })
}

// update role (user or admin)
module.exports.updateRole = (req, res) => {
    const user_id = req.params.user_id;
    const role = req.body.role;

    let sql = `UPDATE users SET role='${role}' WHERE user_id='${user_id}'`
    db.query(sql, (err,result) => {
        if(err) throw err;
        res.send(result)
    })
}

// make a user into a therapist
module.exports.toTherapist = (req,res) => {
    let user_id = req.params.user_id;

	let sql = `SELECT * FROM therapists WHERE user_id='${user_id}'`
    let therapist = {
        user_id: user_id,
        first_name: req.body.first_name,
        last_name: req.body.last_name,
        prefix: req.body.prefix,
        suffix: req.body.suffix,
        field: req.body.field,
        description: req.body.description,
        online: req.body.online,
        in_person: req.body.in_person
    }

    let links = {
        fb_link: req.body.fb_link,
        twt_link: req.body.twt_link,
        li_link: req.body.li_link
    }

    // Confirm first if user is not yet a therapist
	db.query(sql, (err,result) => {
		if(err) throw err;
        // if no existing record, proceed
		if(result.length === 0){

            sql = 'INSERT INTO therapists SET ?'

            db.query(sql, therapist, (err) => {
                if(err) throw err;
                let new_sql = `UPDATE users SET role="Therapist" WHERE user_id='${therapist.user_id}'`
                db.query(new_sql, (err,result) => {
                    if(err) throw err;
                    result.affectedRows !== 0 ? res.send(true) : res.send(false)
            })})
        } else {
            
            sql = `UPDATE therapists SET ? WHERE user_id = '${user_id}'`

            db.query(sql, therapist, (err,result) => {
                if(err) throw err;
                if(result.affectedRows !== 0){
                    sql = `UPDATE users SET ? WHERE user_id = '${user_id}'`

                    db.query(sql, links, (err,result) => {
                        if(err) throw err;
                        result.affectedRows !== 0 ? res.send(true) : res.send(false)
                    }) 
                } else {
                    res.send(false)
                }
            })  
        }
	}
	)
}

// ban user
module.exports.banUser = (req, res) => {
    const user_id = req.params.user_id;

    let sql = `UPDATE users SET banned=1 WHERE user_id='${user_id}'`
    db.query(sql, (err,result) => {
        if(err) throw err;
        res.send(result)
    })
}

// unban user
module.exports.unbanUser = (req, res) => {
    const user_id = req.params.user_id;

    let sql = `UPDATE users SET banned=0 WHERE user_id='${user_id}'`
    db.query(sql, (err,result) => {
        if(err) throw err;
        res.send(result)
    })
}

// view all posts sort by recency
module.exports.viewPosts = (req,res) => {

    let sql = `
    SELECT DISTINCT
    posts.post_id AS p_id,
    posts.subject,
    posts.content,
    posts.date_posted,
    posts.user_id,
    posts.edited,
    users.username,
    users.gender,
    CASE
        WHEN (SELECT COUNT(flag_id) FROM flagged_posts WHERE flagged_posts.post_id = posts.post_id) > 0
        THEN 1
        ELSE 0
    END AS reported
    FROM
        posts
        INNER JOIN users ON posts.user_id = users.user_id
    ORDER BY
        posts.date_posted ASC;
    `

    db.query(sql, (err,result) => {
		if(err) throw err;
		res.send(result)
	}
    )
}

// view all posts sort by recency with search
module.exports.viewPostsSearch = (req,res) => {
    const keyword = req.params.keyword
    
    let sql = `
    SELECT DISTINCT
    posts.post_id AS p_id,
    posts.subject,
    posts.content,
    posts.date_posted,
    posts.user_id,
    posts.edited,
    users.username,
    users.gender,
    CASE
        WHEN (SELECT COUNT(flag_id) FROM flagged_posts WHERE flagged_posts.post_id = posts.post_id) > 0
        THEN 1
        ELSE 0
    END AS reported
    FROM
        posts
        INNER JOIN users ON posts.user_id = users.user_id
    WHERE users.username LIKE '${keyword}%'
    ORDER BY
        posts.date_posted ASC
`

    db.query(sql, (err,result) => {
		if(err) throw err;
		res.send(result)
	}
    )
}

// Delete a post
module.exports.deletePost = (req,res) => {
    const post_id = req.params.post_id

    let sql = `DELETE FROM posts WHERE post_id='${post_id}'`

    db.query(sql, (err, result) => {
		if(err) throw err;
		res.send(result)
	})
}

// View reports of a flagged post
module.exports.viewReports = (req,res) => {
    const post_id = req.params.post_id

    let sql = `SELECT flagged_posts.*, posts.subject, users.username 
    FROM flagged_posts
    INNER JOIN users ON flagged_posts.reported_by = users.user_id
    INNER JOIN posts ON flagged_posts.post_id = posts.post_id
    WHERE flagged_posts.post_id='${post_id}'`

    db.query(sql, (err, result) => {
		if(err) throw err;
		res.send(result)
	})
}