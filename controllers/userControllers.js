const db = require('../index');
const bcrypt = require('bcrypt');
const auth = require("../auth");
const { v4: uuidv4 } = require('uuid')

// register new user
module.exports.register = (req,res) => {
    let email = req.body.email;
    let username = req.body.username;

	let sql = `SELECT * FROM users WHERE email='${email}' OR username='${username}'`

	db.query(sql, (err,result) => {
		if(err) throw err;
        // if email isn't used yet, continue registration
		if(result.length === 0){
            const hashedPw = bcrypt.hashSync(req.body.password,10)
            const id = uuidv4()

            let user = {
                user_id: id,
                username:req.body.username,
                email:req.body.email,
                password:hashedPw
            }

            sql = 'INSERT INTO users SET ?'

            db.query(sql, user, (err) => {
                if(err) throw err;
                // after registering, generate access token
                let new_sql = `SELECT * FROM users WHERE user_id='${id}'`
                db.query(new_sql, (err,result) => {
                    if(err) throw err;
                    res.send({accessToken: auth.createAccessToken(result[0])})
            })})
        } else {
            res.send(false)
        }
	}
	)
}
	
// login user
module.exports.login = (req,res) => {
    let username = req.body.username;

	let sql = `SELECT * FROM users WHERE username='${username}'`

	db.query(sql, (err,result) => {
		if(err) throw err;
        // if user exists, compare password
		if(result.length === 1){
            let foundUser = result[0]

            const isPasswordCorrect = bcrypt.compareSync(req.body.password,foundUser.password)

            isPasswordCorrect ? res.send({accessToken: auth.createAccessToken(foundUser)}) : res.send(false)
        } else {
            res.send(false)
        }
	}
	)
}

// check if email already exists
module.exports.checkEmail = (req,res) => {
    let email = req.body.email;

	let sql = `SELECT * FROM users WHERE email='${email}'`

	db.query(sql, (err,result) => {
		if(err) throw err;
        // if email already exists, send true
		if(result.length === 1){
            res.send(true)
        } else {
            res.send(false)
        }
	}
	)
}

// check if username exists
module.exports.checkUsername = (req,res) => {
    let username = req.body.username;

	let sql = `SELECT * FROM users WHERE username='${username}'`

	db.query(sql, (err,result) => {
		if(err) throw err;
        // if username already exists, send true
		if(result.length === 1){
            res.send(true)
        } else {
            res.send(false)
        }
	}
	)
}

// get user details
module.exports.getDetails = (req,res) => {
    let sql = `SELECT user_id, username, email, role FROM users WHERE user_id=${req.user.user_id}`
    db.query(sql, (err,result) => {
        if(err) throw err;
        res.send(result)
    })
}