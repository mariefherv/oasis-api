const db = require('../index');
const { v4: uuidv4 } = require('uuid')

// view a specific post
module.exports.view = (req,res) => {
    const post_id = req.body.post_id

    let sql = `SELECT * FROM posts WHERE post_id='${post_id}'`

    db.query(sql, (err,result) => {
		if(err) throw err;
		res.send(result)
	}
    )
}

// view posts from a specific user
module.exports.viewByUser = (req,res) => {
    const user_id = req.body.user_id

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

    let sql = `DELETE FROM posts WHERE user_id='${req.user.user_id}' AND post_id='${post_id}'`

    db.query(sql, (err, result) => {
		if(err) throw err;
            res.send(true)
        }
    )
}