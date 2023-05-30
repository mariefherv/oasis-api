const db = require('../index');
const { v4: uuidv4 } = require('uuid')

// view all notifications
module.exports.viewAll = (req,res) => {
    const user_id = req.user.user_id

    let sql = `SELECT notifications.*, u1.username AS user_username, u2.username AS triggered_by_username
    FROM notifications
    INNER JOIN users u1 ON u1.user_id = notifications.user_id
    INNER JOIN users u2 ON u2.user_id = notifications.triggered_by
    WHERE notifications.user_id = '${user_id}'
    ORDER BY notifications.created DESC;
    `

    db.query(sql, (err,result) => {
		if(err) throw err;
        res.send(result)
	}
    )
}

// view all unread
module.exports.viewUnread = (req,res) => {
    const user_id = req.user.user_id

    let sql = `SELECT notifications.*, u1.username AS user_username, u2.username AS triggered_by_username
    FROM notifications
    INNER JOIN users u1 ON u1.user_id = notifications.user_id
    INNER JOIN users u2 ON u2.user_id = notifications.triggered_by
    WHERE notifications.user_id = '${user_id}'
    ORDER BY notifications.created DESC;
    `

    db.query(sql, (err,result) => {
		if(err) throw err;
        res.send(result)
	}
    )
}

// mark notification as read

module.exports.markRead = (req,res) => {
    const user_id = req.user.user_id
    const notif_id = req.params.notif_id

    let sql = `UPDATE notifications SET marked_read = 1 WHERE notif_id = '${notif_id}' AND user_id = '${user_id}'`

    db.query(sql, (err,result) => {
		if(err) throw err;
        res.send(result)
	}
    )
}