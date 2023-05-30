const db = require('../index');
const bcrypt = require('bcrypt');
const auth = require("../auth");
const { v4: uuidv4 } = require('uuid');
const { format, startOfWeek, parseISO, endOfWeek, startOfMonth, endOfMonth, parse } = require('date-fns');

// get all therapists
module.exports.getDetails = (req, res) => {
    let sql = `SELECT therapists.*, users.fb_link, users.twt_link, users.li_link FROM therapists LEFT JOIN users ON therapists.user_id = users.user_id`

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

// add slots
module.exports.addSlots = (req, res) => {
    let slot = {
        therapist_id: req.body.therapist_id,
        date: req.body.date,
        time: req.body.time,
    }

    let sql = `INSERT INTO slots SET ?`

    db.query(sql, slot, (err, result) => {
        if(err) throw err;
        res.send(result)
    })
}

// retrieve a slots by a given date
module.exports.getSlotsByDate = (req, res) => {
    const date = req.body.date
    const time = req.body.time

    let sql = `SELECT 
        slot_id,
        therapist_id,
        DATE_FORMAT(date, '%Y-%m-%d') AS date,         
        time,
        availability
    FROM slots WHERE therapist_id = ${req.params.therapist_id} AND date='${date}' AND time='${time}' ORDER BY date ASC, time ASC`

    db.query(sql, (err, result) => {
        if(err) throw err;
        res.send(result)
    })
}

// retrieve available slot time by a given date
module.exports.getTimeSlotByDate = (req, res) => {
    const date = req.body.date

    let sql = `SELECT       
        time,
        availability
    FROM slots WHERE therapist_id = ${req.params.therapist_id} AND date='${date}' AND availability=1  ORDER BY date ASC, time ASC`

    db.query(sql, (err, result) => {
        if(err) throw err;
        res.send(result)
    })
}

//  retrieve days of slots available
module.exports.getDays = (req, res) => {

    let sql = `SELECT DISTINCT       
        DATE_FORMAT(date, '%Y-%m-%d') AS date
    FROM slots WHERE therapist_id = ${req.params.therapist_id} AND availability=1 ORDER BY date ASC, time ASC`

    db.query(sql, (err, result) => {
        if(err) throw err;
        res.send(result)
    })
}

// check if therapist has available slots
module.exports.checkSlots = (req, res) => {

    let sql = `SELECT slot_id
    FROM slots WHERE therapist_id = ${req.params.therapist_id} AND availability=1 AND date > NOW() ORDER BY date ASC, time ASC`

    db.query(sql, (err, result) => {
        if(err) throw err;
        res.send(result)
    })
}