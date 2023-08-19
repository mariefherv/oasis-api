const dayjs = require('dayjs');
const db = require('../index');

// get all therapists
module.exports.getDetails = (req, res) => {
    let sql = `SELECT therapists.*, users.user_id AS user_therapist_id, users.fb_link, users.twt_link, users.li_link, users.gender FROM therapists LEFT JOIN users ON therapists.user_id = users.user_id`

    db.query(sql, (err,result) => {
        if(err) throw err;
        res.send(result)
    })
}

// get all therapists by consultation type
module.exports.getDetailsByConsultation = (req, res) => {
    const type = req.params.type

    let sql = `SELECT therapists.*, users.user_id AS user_therapist_id, users.fb_link, users.twt_link, users.li_link, users.gender FROM therapists LEFT JOIN users ON therapists.user_id = users.user_id WHERE therapists.${type} = 1`

    db.query(sql, (err,result) => {
        if(err) throw err;
        res.send(result)
    })
}

// get all therapists by available slots
module.exports.getDetailsByAvailability = (req, res) => {
    const date = req.params.date

    let sql = `SELECT therapists.*, users.user_id AS user_therapist_id, users.fb_link, users.twt_link, users.li_link, users.gender FROM therapists LEFT JOIN users ON therapists.user_id = users.user_id WHERE (SELECT COUNT(slots.slot_id) FROM slots WHERE slots.therapist_id = therapists.therapist_id AND availability=1 AND slots.date > CURDATE() AND ${date}(slots.date) = ${date}(CURDATE())) > 0`

    db.query(sql, (err,result) => {
        if(err) throw err;
        res.send(result)
    })
}

// get all therapists by available slots
module.exports.getDetailsByConsultationAvailability = (req, res) => {
    const type = req.params.type
    const date = req.params.date

    let sql = `SELECT therapists.*, users.user_id AS user_therapist_id, users.fb_link, users.twt_link, users.li_link, users.gender FROM therapists LEFT JOIN users ON therapists.user_id = users.user_id WHERE (SELECT COUNT(slots.slot_id) FROM slots WHERE slots.therapist_id = therapists.therapist_id AND therapists.${type} = 1 AND availability=1 AND slots.date > CURDATE() AND ${date}(slots.date) = ${date}(CURDATE())) > 0`

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
        result.affectedRows !== 0 ? res.send(true) : res.send(false)
    })
}

// notification slot
module.exports.notifySlots = (req, res) => {
    
    let sql = 'INSERT INTO notifications SET ?'

    let notification = {
        triggered_by: req.user.user_id,
        type: 'slots'
    }

    db.query(sql, notification, (err, result) => {
        if(err) throw err;
        result.affectedRows !== 0 ? res.send(true) : res.send(false)                    
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
    let date = req.body.date

    if(date === 'Invalid Date'){
        date = dayjs(new Date()).format('YYYY-MM-DD')
    }

    let sql = `SELECT
        slot_id,       
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

    let sql = `SELECT
        slot_id,       
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