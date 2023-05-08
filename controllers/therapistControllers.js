const db = require('../index');
const bcrypt = require('bcrypt');
const auth = require("../auth");
const { v4: uuidv4 } = require('uuid')

// get therapist details
module.exports.getDetails = (req, res) => {
    let sql = `SELECT * FROM therapists`

    db.query(sql, (err,result) => {
        if(err) throw err;
        res.send(result)
    })
}