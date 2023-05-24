const db = require('../index');
const bcrypt = require('bcrypt');
const auth = require("../auth");
const { v4: uuidv4 } = require('uuid');
const { format, startOfWeek, parseISO, endOfWeek, startOfMonth, endOfMonth } = require('date-fns');


// book a slot
module.exports.bookSlot = (req, res) => {
    const id = uuidv4()

    let booking = {
        booking_id: id,
        user_id: req.user.user_id,
        therapist_id: req.body.therapist_id,
        slot_id: req.params.slot_id,
        consultation_date: req.body.consultation_date,
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