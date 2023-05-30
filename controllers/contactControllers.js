const db = require('../index');
const { v4: uuidv4 } = require('uuid')

// view all contacts
module.exports.viewAll = (req,res) => {
    const user_id = req.user.user_id

    let sql = `SELECT users.username, contacts.contact_person_id, contacts.contact_id, contacts.status FROM contacts INNER JOIN users ON users.user_id = contacts.contact_person_id WHERE contacts.user_id = '${user_id}'`

    db.query(sql, (err,result) => {
		if(err) throw err;
        if(result.length === 0){
            sql = `SELECT users.username, contacts.contact_id, contacts.user_id AS contact_person_id, contacts.status FROM contacts INNER JOIN users ON users.user_id = contacts.user_id WHERE contacts.contact_person_id = '${user_id}'`

            db.query(sql, (err,result) => {
				if(err) throw err;
				res.send(result)
			})
        } else {
            res.send(result)
        }
	}
    )
}

// view a contact
module.exports.viewContact = (req,res) => {
    const user_id = req.user.user_id
    const contact_person_id = req.params.contact_person_id

    let sql = `SELECT * FROM contacts WHERE(user_id = '${user_id}' AND contact_person_id = '${contact_person_id}') OR (user_id = '${contact_person_id}' AND contact_person_id = '${user_id}')`

    db.query(sql, (err,result) => {
		if(err) throw err;
		res.send(result)
	}
    )
}

// view contact details
module.exports.viewDetails = (req,res) => {
    const contact_id = req.params.contact_id

    let sql = `SELECT * FROM contacts WHERE contact_id = '${contact_id}'`

    db.query(sql, (err,result) => {
		if(err) throw err;
		res.send(result)
	}
    )
}

// add as contact
module.exports.addContact = (req,res) => {
    const user_id = req.user.user_id
    const contact_person_id = req.params.contact_person_id
    const id = uuidv4()

    let sql = `SELECT contact_id FROM contacts WHERE (user_id = '${user_id}' AND contact_person_id = '${contact_person_id}') OR (user_id = '${contact_person_id}' AND contact_person_id = '${user_id}')`

    db.query(sql, (err, result) => {
        if(err) throw err;
        if(result.length === 0) {
            let contact = {
                contact_id: id,
                contact_person_id: contact_person_id,
                user_id: user_id,
                requested_by: user_id,
            }
        
            sql = 'INSERT INTO contacts SET ?'
        
            db.query(sql, contact, (err,result) => {
                if(err) throw err;
                if (result.affectedRows !== 0){
                    let notification = {
                        user_id: contact_person_id,
                        triggered_by: user_id,
                        type: 'contact_request',
                        contact_id: id
                    }
                    
                    sql = 'INSERT INTO notifications SET ?'

                    db.query(sql, notification, (err, result) => {
                        if(err) throw err;
                        result.affectedRows !== 0 ? res.send({status:"PENDING"}) : res.send(false)                    
                    })
                    } else {
                        res.send(false)
                }
            }
            )
        } else {
            const contact_id = result[0].contact_id

            sql = `UPDATE contacts SET requested_by = '${user_id}' WHERE contact_id = '${contact_id}'`
            
            db.query(sql, (err, result) => {
                if(err) throw err;
                if (result.affectedRows !== 0){
                    let notification = {
                        user_id: contact_person_id,
                        triggered_by: user_id,
                        type: 'contact_request',
                        contact_id: contact_id
                    }
                    
                    sql = 'INSERT INTO notifications SET ?'

                    db.query(sql, notification, (err, result) => {
                        if(err) throw err;
                        result.affectedRows !== 0 ? res.send({status:"PENDING"}) : res.send(false)                    
                    })
                    } else {
                        res.send(false)
                }
            })
        }
    })
}

// confirm contact
module.exports.confirmContact = (req, res) => {
    const user_id = req.user.user_id;
    const contact_id = req.params.contact_id;
    const notification_id = req.body.notification_id;
    const contact_person_id = req.body.contact_person_id;

    const values = {
        user_id: contact_person_id,
        triggered_by: user_id,
        type: 'contact_request',
        contact_id: contact_id,
    };

    let updateContactsSQL = `UPDATE contacts SET status = 'ACTIVE', requested_by = NULL WHERE contact_id = ?`;
    let updateNotificationsSQL = `UPDATE notifications SET type = 'contact_confirmed' WHERE notification_id = ?`;
    let insertNotificationSQL = `INSERT INTO notifications SET ?`;

    db.query(updateContactsSQL, [contact_id], (err, contactsResult) => {
        if (err) throw err;

        db.query(updateNotificationsSQL, [notification_id], (err, notificationsResult) => {
        if (err) throw err;

        db.query(insertNotificationSQL, values, (err, insertResult) => {
            if (err) throw err;

        if (notificationsResult.changedRows !== 0) {
            res.send({ status: 'ACTIVE' });
            } else {
            res.send(false);
            }
        });
        });
    });
};


// decline contact
module.exports.declineContact = (req,res) => {
    const contact_id = req.params.contact_id
    const notification_id = req.body.notification_id

    let sql = `UPDATE contacts SET status = 'INACTIVE', requested_by = NULL WHERE contact_id = '${contact_id}'`

    db.query(sql, (err, result) => {
        if(err) throw err;
        if(result.changedRows !== 0) {
            sql = `UPDATE notifications SET type = 'contact_declined' WHERE notification_id = '${notification_id}'`

            db.query(sql, (err, result) => {
                if(err) throw err;
                result.affectedRows !== 0 ? res.send({status:"INACTIVE"}) : res.send(false)                    
            })
        } else {
            res.send(false)
        }    })
}

// remove as contact
module.exports.removeContact = (req, res) => {
    const user_id = req.user.user_id
    const contact_person_id = req.params.contact_person_id

    let sql = `SELECT contact_id FROM contacts WHERE (user_id = '${user_id}' AND contact_person_id = '${contact_person_id}') OR (user_id = '${contact_person_id}' AND contact_person_id = '${user_id}')`

    db.query(sql, (err, result) => {
        if(err) throw err;
        if(result.length === 0) {
            res.send(false)
        } else {
            const contact_id = result[0].contact_id

            sql = `UPDATE contacts SET status='INACTIVE' WHERE contact_id = '${contact_id}'`
            
            db.query(sql, (err, result) => {
                if(err) throw err;
                result.changedRows !== 0 ? res.send({status:"INACTIVE"}) : res.send(false)
            })
        }
    })
}

// block contact
module.exports.blockContact = (req, res) => {
    const user_id = req.user.user_id
    const contact_person_id = req.params.contact_person_id
    const id = uuidv4()

    let sql = `SELECT contact_id FROM contacts WHERE (user_id = '${user_id}' AND contact_person_id = '${contact_person_id}') OR (user_id = '${contact_person_id}' AND contact_person_id = '${user_id}')`

    db.query(sql, (err, result) => {
        if(err) throw err;
        if(result.length === 0) {
            let contact = {
                contact_id: id,
                contact_person_id: contact_person_id,
                user_id: user_id,
                status: 'BLOCKED',
                blocked_by: user_id
            }
        
            sql = 'INSERT INTO contacts SET ?'
        
            db.query(sql, contact, (err,result) => {
                if(err) throw err;
                res.send({status:"BLOCKED"})
            }
            )
        } else {
            const contact_id = result[0].contact_id

            sql = `UPDATE contacts SET status="BLOCKED", blocked_by='${user_id}' WHERE contact_id = '${contact_id}'`
            
            db.query(sql, (err, result) => {
                if(err) throw err;
                result.changedRows !== 0 ? res.send({status:"BLOCKED"}) : res.send(false)
            })
        }
    })
}

// unblock contact
module.exports.unblockContact = (req, res) => {
    const user_id = req.user.user_id
    const contact_person_id = req.params.contact_person_id

    let sql = `SELECT contact_id FROM contacts WHERE (user_id = '${user_id}' AND contact_person_id = '${contact_person_id}') OR (user_id = '${contact_person_id}' AND contact_person_id = '${user_id}')`

    db.query(sql, (err, result) => {
        if(err) throw err;
        if(result.length === 0) {
            res.send(false)
        } else {
            const contact_id = result[0].contact_id

            sql = `UPDATE contacts SET status='INACTIVE', blocked_by = NULL WHERE contact_id = '${contact_id}'`
            
            db.query(sql, (err, result) => {
                if(err) throw err;
                result.changedRows !== 0 ? res.send({status:"INACTIVE"}) : res.send(false)
            })
        }
    })
}

// retrieve details from contacts
module.exports.retrieveContactDetails = (req, res) => {
    const user_id = req.user.user_id
    const contact_id = req.params.contact_id

	let sql = `SELECT contacts.user_id AS user_id, users.username, contacts.status, contacts.blocked_by FROM users INNER JOIN contacts ON users.user_id = contacts.user_id WHERE contacts.contact_person_id = '${user_id}' AND contacts.contact_id = '${contact_id}'`
    db.query(sql, (err,result) => {
		if(err) throw err;
        if(result.length !== 0){
            res.send(result)
        } else {
            sql = `SELECT contacts.contact_person_id AS user_id, users.username, contacts.status, contacts.blocked_by FROM users INNER JOIN contacts ON users.user_id = contacts.contact_person_id WHERE contacts.user_id = '${user_id}' AND contacts.contact_id = '${contact_id}'`

            db.query(sql, (err,result) => {
                if(err) throw err;
                res.send(result)
            })
        }
    })
}

// send message
module.exports.sendMessage = (req,res) => {
    const user_id = req.user.user_id

	let message = {
        content: req.body.content,
        contact_id: req.body.contact_id,
        sender_id: user_id,
        receiver_id: req.params.contact_person_id
    }

	let sql = 'INSERT INTO messages SET ?'

	db.query(sql, message, (err,result) => {
		if(err) throw err;
		res.send(result)
	}
	)
}

// view all messages
module.exports.viewAllMessages = (req,res) => {
    const contact_id = req.params.contact_id    

    let sql = `SELECT messages.* FROM messages INNER JOIN contacts ON messages.contact_id =  contacts.contact_id WHERE messages.contact_id = '${contact_id}'`

    db.query(sql, (err,result) => {
		if(err) throw err;
		res.send(result)
	}
    )
}

