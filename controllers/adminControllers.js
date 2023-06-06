const db = require('../index');
const bcrypt = require('bcrypt');
const auth = require("../auth");
const { v4: uuidv4 } = require('uuid')


// get list of users
module.exports.getUsers = (req, res) => {
    keyword = req.params.keyword

    let sql = keyword !== 'empty' ? 
    `SELECT users.user_id, users.username, users.role,
    users.fb_link, users.twt_link, users.li_link, 
    therapists.prefix, therapists.first_name, therapists.last_name,
    therapists.suffix, therapists.field, therapists.description,
    therapists.online, therapists.in_person
    FROM users LEFT JOIN therapists ON therapists.user_id = users.user_id
    WHERE users.username LIKE '${keyword}%'`
    :
    `SELECT users.user_id, users.username, users.role,
    users.fb_link, users.twt_link, users.li_link, 
    therapists.prefix, therapists.first_name, therapists.last_name,
    therapists.suffix, therapists.field, therapists.description,
    therapists.online, therapists.in_person
    FROM users LEFT JOIN therapists ON therapists.user_id = users.user_id
    WHERE users.username LIKE '%%'`

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

// view all posts