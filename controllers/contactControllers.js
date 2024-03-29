const db = require('../index');
const { v4: uuidv4 } = require('uuid')

// view all contacts
module.exports.viewAll = (req,res) => {
    const user_id = req.user.user_id

    let sql = `
    SELECT users.username, users.role, users.user_id, users.gender,
    contacts.status, contacts.requested_by, contacts.blocked_by, contacts.contact_id,
    CASE
        WHEN users.role = 'Therapist'
        THEN therapists.prefix
        ELSE NULL
    END AS prefix,
    CASE
        WHEN users.role = 'Therapist'
        THEN therapists.last_name
    END AS last_name,
    CASE
        WHEN users.role = 'Therapist'
        THEN therapists.suffix
        ELSE NULL
    END AS suffix,
    (SELECT COUNT(message_id) FROM messages WHERE receiver_id = '${user_id}' AND marked_read = 0 AND messages.contact_id = contacts.contact_id) AS message_count
    FROM contacts INNER JOIN users ON users.user_id = contacts.contact_person_id
    LEFT JOIN therapists ON users.user_id = therapists.user_id 
    WHERE contacts.user_id = '${user_id}'
    UNION
    SELECT users.username, users.role, users.user_id, users.gender,
    contacts.status, contacts.requested_by, contacts.blocked_by, contacts.contact_id,
    CASE
        WHEN users.role = 'Therapist'
        THEN therapists.prefix
        ELSE NULL
    END AS prefix,
    CASE
        WHEN users.role = 'Therapist'
        THEN therapists.last_name
        ELSE NULL
    END AS last_name,
    CASE
        WHEN users.role = 'Therapist'
        THEN therapists.suffix
        ELSE NULL
    END AS suffix,
    (SELECT COUNT(message_id) FROM messages WHERE receiver_id = '${user_id}' AND marked_read = 0 AND messages.contact_id = contacts.contact_id) AS message_count
    FROM contacts INNER JOIN users ON users.user_id = contacts.user_id
    LEFT JOIN therapists ON users.user_id = therapists.user_id 
    WHERE contacts.contact_person_id = '${user_id}'
    `

    db.query(sql, (err,result) => {
		if(err) throw err;
		res.send(result)
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

            sql = `UPDATE contacts SET status = "PENDING", requested_by = '${user_id}' WHERE contact_id = '${contact_id}'`
            
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

// confirm contact request
module.exports.confirmContact = (req, res) => {
    const user_id = req.user.user_id;
    const contact_person_id = req.params.contact_person_id;

    let sql = `SELECT contact_id FROM contacts WHERE (user_id = '${user_id}' AND contact_person_id = '${contact_person_id}') OR (user_id = '${contact_person_id}' AND contact_person_id = '${user_id}')`;

    db.query(sql, (err, result) => {
    if (err) {
        console.error(err);
        return res.status(500).send('Internal Server Error');
    }

    if (result.length !== 0) {
        const contact_id = result[0].contact_id;
        sql = `UPDATE contacts SET status = 'ACTIVE', requested_by = NULL WHERE contact_id = '${contact_id}'`;

    db.query(sql, (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Internal Server Error');
        }

        if (result.affectedRows !== 0) {
            sql = `UPDATE notifications SET type = 'contact_confirmed_user' WHERE contact_id = '${contact_id}' AND type = "contact_request"`;

        db.query(sql, (err, result) => {
            if (err) {
                console.error(err);
                return res.status(500).send('Internal Server Error');
            }

            if (result.affectedRows !== 0) {
            const notifications = {
                user_id: contact_person_id,
                triggered_by: user_id,
                type: 'contact_confirmed_triggered_by',
                contact_id: contact_id,
                };

            db.query('INSERT INTO notifications SET ?', notifications, (err, result) => {
                if (err) {
                    console.error(err);
                    return res.status(500).send('Internal Server Error');
                }

                if (result.affectedRows !== 0) {
                    res.send({ status:"ACTIVE"});
                } else {
                    res.send(false);
                }
                });
            } else {
                res.send(false);
            }
            });
        } else {
            res.send(false);
        }
        });
    } else {
        res.send(false);
    }
    });
};



// decline contact
module.exports.declineContact = (req,res) => {
    const user_id = req.user.user_id
    const contact_person_id = req.params.contact_person_id

    let sql = `SELECT contact_id FROM contacts WHERE (user_id = '${user_id}' AND contact_person_id = '${contact_person_id}') OR (user_id = '${contact_person_id}' AND contact_person_id = '${user_id}')`

    db.query(sql, (err, result) => {
        if(err) throw err;
        if(result.length !== 0) {
            const contact_id = result[0].contact_id
            let sql = `UPDATE contacts SET status = 'INACTIVE', requested_by = NULL WHERE contact_id = '${contact_id}'`

            db.query(sql, (err, result) => {
                if(err) throw err;
                if(result.changedRows !== 0) {
                    sql = `UPDATE notifications SET type = 'contact_declined' WHERE contact_id = '${contact_id}' AND type = "contact_request"`

                    db.query(sql, (err, result) => {
                        if(err) throw err;
                        result.affectedRows !== 0 ? res.send({status:"INACTIVE"}) : res.send(false)                  
                        })
                } else {
                    res.send(false)
                }})
        } else {
            res.send(false)
        }
    })
}

// cancel contact request
module.exports.cancelRequest = (req,res) => {
    const user_id = req.user.user_id
    const contact_person_id = req.params.contact_person_id

    let sql = `SELECT contact_id FROM contacts WHERE (user_id = '${user_id}' AND contact_person_id = '${contact_person_id}') OR (user_id = '${contact_person_id}' AND contact_person_id = '${user_id}')`

    db.query(sql, (err, result) => {
        if(err) throw err;
        if(result.length !== 0) {
            const contact_id = result[0].contact_id
            let sql = `UPDATE contacts SET status = 'INACTIVE', requested_by = NULL WHERE contact_id = '${contact_id}'`

            db.query(sql, (err, result) => {
                if(err) throw err;
                if(result.changedRows !== 0) {
                    sql = `DELETE FROM notifications WHERE triggered_by = '${user_id}' AND contact_id = '${contact_id}' ORDER BY created DESC LIMIT 1`

                    db.query(sql, (err, result) => {
                        if(err) throw err;
                        result.affectedRows !== 0 ? res.send({status:"INACTIVE"}) : res.send(false)                    
                    })
                } else {
                    res.send(false)
                }})
        } else {
            res.send(false)
        }
    })

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

	let sql = `SELECT contacts.user_id AS user_id, users.username, users.gender, users.role, contacts.status, contacts.blocked_by,
    CASE
        WHEN users.role = 'Therapist'
        THEN therapists.prefix
        ELSE NULL
    END AS prefix,
    CASE
        WHEN users.role = 'Therapist'
        THEN therapists.last_name
        ELSE NULL
    END AS last_name,
    CASE
        WHEN users.role = 'Therapist'
        THEN therapists.suffix
        ELSE NULL
    END AS suffix
    FROM users INNER JOIN contacts ON users.user_id = contacts.user_id 
    LEFT JOIN therapists ON users.user_id = therapists.user_id
    WHERE contacts.contact_person_id = '${user_id}' AND contacts.contact_id = '${contact_id}'
    `

    db.query(sql, (err,result) => {
		if(err) throw err;
        if(result.length !== 0){
            res.send(result)
        } else {
            sql = `SELECT contacts.contact_person_id AS user_id, users.username, users.role, users.gender, contacts.status, contacts.blocked_by,
            CASE
                WHEN users.role = 'Therapist'
                THEN therapists.prefix
            END AS prefix,
            CASE
                WHEN users.role = 'Therapist'
                THEN therapists.last_name
            END AS last_name,
            CASE
                WHEN users.role = 'Therapist'
                THEN therapists.suffix
                ELSE NULL
            END AS suffix
            FROM users INNER JOIN contacts ON users.user_id = contacts.contact_person_id
            LEFT JOIN therapists ON users.user_id = therapists.user_id WHERE contacts.user_id = '${user_id}' AND contacts.contact_id = '${contact_id}'`

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

    let sql = `SELECT messages.*, users.gender AS sender_gender, users.role AS sender_role FROM messages LEFT JOIN users ON messages.sender_id = users.user_id WHERE contact_id = '${contact_id}'`

    db.query(sql, (err,result) => {
		if(err) throw err;
		res.send(result)
	}
    )
}

// check if there are unread messages
module.exports.checkUnread = (req,res) => {
    const contact_id = req.params.contact_id    

    let sql = `SELECT COUNT(message_id) AS message_count FROM messages WHERE contact_id = '${contact_id}' AND receiver_id = '${req.user.user_id}' AND marked_read = 0`

    db.query(sql, (err,result) => {
		if(err) throw err;
		res.send(result)
	}
    )
}


// mark messages as read
module.exports.markRead = (req,res) => {
    const contact_id = req.params.contact_id    

    let sql = `UPDATE messages SET marked_read = 1 WHERE contact_id = '${contact_id}' AND receiver_id = '${req.user.user_id}'`

    db.query(sql, (err,result) => {
		if(err) throw err;
		res.send(result)
	}
    )
}
