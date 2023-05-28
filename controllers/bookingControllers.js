const db = require('../index');
const bcrypt = require('bcrypt');
const auth = require("../auth");
const { v4: uuidv4 } = require('uuid');
const { format, startOfWeek, parseISO, endOfWeek, startOfMonth, endOfMonth } = require('date-fns');
const { zonedTimeToUtc } = require('date-fns-tz');

// book a slot
module.exports.bookSlot = (req, res) => {
    const id = uuidv4()
    const timezone = 'Asia/Manila'
    const datetime = zonedTimeToUtc(req.body.consultation_date, timezone)

    let booking = {
        booking_id: id,
        user_id: req.user.user_id,
        therapist_id: req.body.therapist_id,
        slot_id: req.params.slot_id,
        consultation_date: datetime,
        consultation_type: req.body.consultation_type
    }

    let sql = `INSERT INTO bookings SET ?`

    db.query(sql, booking, (err, result) => {
        if(err) throw err;

        sql = `UPDATE slots SET availability = 0 WHERE slot_id = ${req.params.slot_id}`

        db.query(sql, (err, result) => {
            if(err) throw err;
            res.send(result)
        })
    })
}

// retrieve a booking
module.exports.bookingDetails = (req, res) => {
    const booking_id = req.params.booking_id

    let sql = `SELECT * FROM bookings WHERE booking_id = '${booking_id}'`

    db.query(sql, (err, result) => {
        if(err) throw err;
        res.send(result)
    })
}

// retrieve all bookings and slots
module.exports.getBookings = (req, res) => {
    const therapist_id = req.params.therapist_id

    let sql = `
    (SELECT 
        slots.slot_id,
        slots.availability,
        DATE_FORMAT(slots.date, '%Y-%m-%d') AS date,
        slots.time,
        slots.therapist_id,
        bookings.booking_id,
        bookings.user_id,
        users.username,
        bookings.confirmation,
        bookings.denied,
        bookings.consultation_type
    FROM slots LEFT JOIN bookings ON slots.slot_id = bookings.slot_id LEFT JOIN users ON bookings.user_id = users.user_id WHERE slots.therapist_id = ${therapist_id}
    UNION
    SELECT
        NULL AS slot_id,
        NULL AS availability,
        DATE_FORMAT(bookings.consultation_date, '%Y-%m-%d') AS date,
        TIME_FORMAT(bookings.consultation_date, '%H:%i:%s') AS time,
        bookings.therapist_id,
        bookings.booking_id,
        bookings.user_id,
        users.username,
        bookings.confirmation,
        bookings.denied,
        bookings.consultation_type
    FROM bookings LEFT JOIN users ON bookings.user_id = users.user_id WHERE bookings.slot_id IS NULL)
    ORDER BY date ASC, time ASC`

    db.query(sql, (err, result) => {
        if(err) throw err;
        res.send(result)
    })
}

// retrieve all upcoming bookings
module.exports.retrieveConfirmedBookings = (req, res) => {
    const user_id = req.user.user_id

    let sql = `SELECT 
        bookings.therapist_id,
        bookings.booking_id,
        DATE_FORMAT(bookings.consultation_date, '%Y-%m-%d') AS date,
        TIME_FORMAT(bookings.consultation_date, '%H:%i:%s') AS time,
        therapists.prefix, therapists.first_name, therapists.last_name, therapists.suffix,
        bookings.confirmation,
        bookings.denied,
        bookings.consultation_type
    FROM bookings LEFT JOIN therapists ON bookings.therapist_id = therapists.therapist_id
    WHERE bookings.user_id = '${user_id}' AND confirmation = 1 AND consultation_date > NOW() 
    ORDER BY consultation_date ASC`

    db.query(sql, (err, result) => {
        if(err) throw err;
        res.send(result)
    })
}

// retrieve all past bookings
module.exports.retrievePastBookings = (req, res) => {
    const user_id = req.user.user_id

    let sql = `SELECT 
        bookings.therapist_id,
        bookings.booking_id,
        DATE_FORMAT(bookings.consultation_date, '%Y-%m-%d') AS date,
        TIME_FORMAT(bookings.consultation_date, '%H:%i:%s') AS time,
        therapists.prefix, therapists.first_name, therapists.last_name, therapists.suffix,
        bookings.confirmation,
        bookings.denied,
        bookings.consultation_type
    FROM bookings LEFT JOIN therapists ON bookings.therapist_id = therapists.therapist_id
    WHERE bookings.user_id = '${user_id}' AND confirmation = 1 AND consultation_date < NOW() ORDER BY consultation_date DESC`

    db.query(sql, (err, result) => {
        if(err) throw err;
        res.send(result)
    })
}

// retrieve all  bookings and slots by day
module.exports.getSlotsByDay = (req, res) => {
    const therapist_id = req.params.therapist_id
    const date = format(new Date(req.body.date), 'yyyy-MM-dd')

    let sql = `
    (SELECT 
        slots.slot_id,
        slots.availability,
        DATE_FORMAT(slots.date, '%Y-%m-%d') AS date,
        slots.time,
        slots.therapist_id,
        bookings.booking_id,
        bookings.user_id,
        users.username,
        bookings.confirmation,
        bookings.denied,
        bookings.consultation_type
    FROM slots LEFT JOIN bookings ON slots.slot_id = bookings.slot_id LEFT JOIN users ON bookings.user_id = users.user_id WHERE date = '${date}' AND slots.therapist_id = ${therapist_id}
    UNION
    SELECT
        NULL AS slot_id,
        NULL AS availability,
        DATE_FORMAT(bookings.consultation_date, '%Y-%m-%d') AS date,
        TIME_FORMAT(bookings.consultation_date, '%H:%i:%s') AS time,
        bookings.therapist_id,
        bookings.booking_id,
        bookings.user_id,
        users.username,
        bookings.confirmation,
        bookings.denied,
        bookings.consultation_type
    FROM bookings LEFT JOIN users ON bookings.user_id = users.user_id WHERE bookings.slot_id IS NULL AND DATE_FORMAT(bookings.consultation_date, '%Y-%m-%d') = '${date}' AND bookings.therapist_id = ${therapist_id})
    ORDER BY date ASC, time ASC
    `

    db.query(sql, (err, result) => {
        if(err) throw err;
        res.send(result)
    })
}

// retrieve all bookings and slots by week
module.exports.getSlotsByWeek = (req, res) => {
    const therapist_id = req.params.therapist_id
    const date = req.body.date
    const start = format(startOfWeek(parseISO(date)), 'yyyy-MM-dd')
    const end = format(endOfWeek(parseISO(date)), 'yyyy-MM-dd')

    let sql = `
    (SELECT 
        slots.slot_id,
        slots.availability,
        DATE_FORMAT(slots.date, '%Y-%m-%d') AS date,
        slots.time,
        slots.therapist_id,
        bookings.booking_id,
        bookings.user_id,
        users.username,
        bookings.confirmation,
        bookings.denied,
        bookings.consultation_type
    FROM slots LEFT JOIN bookings ON slots.slot_id = bookings.slot_id LEFT JOIN users ON bookings.user_id = users.user_id WHERE date BETWEEN '${start}' AND '${end}' AND slots.therapist_id = ${therapist_id}
    UNION
    SELECT
        NULL AS slot_id,
        NULL AS availability,
        DATE_FORMAT(bookings.consultation_date, '%Y-%m-%d') AS date,
        TIME_FORMAT(bookings.consultation_date, '%H:%i:%s') AS time,
        bookings.therapist_id,
        bookings.booking_id,
        bookings.user_id,
        users.username,
        bookings.confirmation,
        bookings.denied,
        bookings.consultation_type
    FROM bookings LEFT JOIN users ON bookings.user_id = users.user_id WHERE bookings.slot_id IS NULL AND DATE_FORMAT(bookings.consultation_date, '%Y-%m-%d') BETWEEN '${start}' AND '${end}' AND bookings.therapist_id = ${therapist_id})
    ORDER BY date ASC, time ASC`

    db.query(sql, (err, result) => {
        if(err) throw err;
        res.send(result)
    })
}

// retrieve all bookings and slots by month
module.exports.getSlotsByMonth = (req, res) => {
    const therapist_id = req.params.therapist_id
    const date = req.body.date
    const start = format(startOfMonth(parseISO(date)), 'yyyy-MM-dd')
    const end = format(endOfMonth(parseISO(date)), 'yyyy-MM-dd')

    let sql = `
    (SELECT 
        slots.slot_id,
        slots.availability,
        DATE_FORMAT(slots.date, '%Y-%m-%d') AS date,
        slots.time,
        slots.therapist_id,
        bookings.booking_id,
        bookings.user_id,
        users.username,
        bookings.confirmation,
        bookings.denied,
        bookings.consultation_type
    FROM slots LEFT JOIN bookings ON slots.slot_id = bookings.slot_id LEFT JOIN users ON bookings.user_id = users.user_id WHERE date BETWEEN '${start}' AND '${end}' AND slots.therapist_id = ${therapist_id}
    UNION
    SELECT
        NULL AS slot_id,
        NULL AS availability,
        DATE_FORMAT(bookings.consultation_date, '%Y-%m-%d') AS date,
        TIME_FORMAT(bookings.consultation_date, '%H:%i:%s') AS time,
        bookings.therapist_id,
        bookings.booking_id,
        bookings.user_id,
        users.username,
        bookings.confirmation,
        bookings.denied,
        bookings.consultation_type
    FROM bookings LEFT JOIN users ON bookings.user_id = users.user_id WHERE bookings.slot_id IS NULL AND DATE_FORMAT(bookings.consultation_date, '%Y-%m-%d') BETWEEN '${start}' AND '${end}' AND bookings.therapist_id = ${therapist_id})
    ORDER BY date ASC, time ASC`

    db.query(sql, (err, result) => {
        if(err) throw err;
        res.send(result)
    })
}

// confirm booking
module.exports.confirmBooking = (req, res) => {
    const booking_id = req.params.booking_id

    let sql = `UPDATE bookings SET confirmation = 1 WHERE booking_id = '${booking_id}'`
    db.query(sql, (err, result) => {
        if(err) throw err;
        res.send(result)
    })
}

// deny booking
module.exports.denyBooking = (req, res) => {
    const booking_id = req.params.booking_id

    let sql = `UPDATE slots
    LEFT JOIN bookings ON slots.slot_id = bookings.slot_id
    SET slots.availability = 1
    WHERE bookings.booking_id = '${booking_id}'`

    db.query(sql, (err, result) => {
        if(err) throw err;

        sql = `UPDATE bookings
        SET denied = 1, slot_id = NULL
        WHERE booking_id = '${booking_id}'`
        
        db.query(sql, (err, result) => {
            if(err) throw err;
            res.send(result)
        })
    })
}