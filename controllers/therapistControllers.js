const db = require('../index');
const bcrypt = require('bcrypt');
const auth = require("../auth");
const { v4: uuidv4 } = require('uuid');
const { format, startOfWeek, parseISO, endOfWeek, startOfMonth, endOfMonth } = require('date-fns');

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

// retrieve slots by day
module.exports.getSlotsByDay = (req, res) => {
    const date = format(new Date(req.body.date), 'yyyy-MM-dd')

    let sql = `SELECT * FROM slots WHERE date = '${date}' AND therapist_id = ${req.params.therapist_id} ORDER BY date ASC, time ASC`

    db.query(sql, (err, result) => {
        if(err) throw err;
        res.send(result)
    })
}

// retrieve slots by week
module.exports.getSlotsByWeek = (req, res) => {
    const date = req.body.date
    const start = format(startOfWeek(parseISO(date)), 'yyyy-MM-dd')
    const end = format(endOfWeek(parseISO(date)), 'yyyy-MM-dd')

    let sql = `SELECT * FROM slots WHERE date BETWEEN '${start}' AND '${end}' AND therapist_id = ${req.params.therapist_id} ORDER BY date ASC, time ASC`

    db.query(sql, (err, result) => {
        if(err) throw err;
        res.send(result)
    })
}

// retrieve slots by month
module.exports.getSlotsByMonth = (req, res) => {
    const date = req.body.date
    const start = format(startOfMonth(parseISO(date)), 'yyyy-MM-dd')
    const end = format(endOfMonth(parseISO(date)), 'yyyy-MM-dd')

    let sql = `SELECT * FROM slots WHERE date BETWEEN '${start}' AND '${end}' AND therapist_id = ${req.params.therapist_id} ORDER BY date ASC, time ASC`

    db.query(sql, (err, result) => {
        if(err) throw err;
        res.send(result)
    })
}