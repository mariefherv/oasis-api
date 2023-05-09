const db = require('../index');
const bcrypt = require('bcrypt');
const auth = require("../auth");
const { v4: uuidv4 } = require('uuid')

// get all therapists
module.exports.getDetails = (req, res) => {
    let sql = `SELECT * FROM therapists`

    db.query(sql, (err,result) => {
        if(err) throw err;
        res.send(result)
    })
}

// get therapist details
module.exports.getTherapistDetails = (req, res) => {
    const user_id = req.user.user_id

    let sql = `SELECT * FROM therapists WHERE user_id='${user_id}'`

    db.query(sql, (err,result) => {
        if(err) throw err;
        res.send(result)
    })
}