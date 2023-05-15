const db = require('../index');
const { v4: uuidv4 } = require('uuid')

// view all contacts
module.exports.viewAll = (req,res) => {
    const user_id = req.user.user_id

    let sql = `SELECT users.username, contacts.contact_id FROM contacts INNER JOIN users ON users.user_id = contacts.contact_person_id WHERE contacts.user_id = '${user_id}' AND contacts.status = 'ACTIVE'`

    db.query(sql, (err,result) => {
		if(err) throw err;
        if(result.length === 0){
            sql = `SELECT users.username, contacts.contact_id FROM contacts INNER JOIN users ON users.user_id = contacts.user_id WHERE contacts.contact_person_id = '${user_id}' AND contacts.status = 'ACTIVE'`

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
    const contact_id = req.params.contact_id

    let sql = `SELECT * FROM contacts WHERE contact_id = '${contact_id}' AND user_id = '${user_id}'`

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
            }
        
            sql = 'INSERT INTO contacts SET ?'
        
            db.query(sql, contact, (err,result) => {
                if(err) throw err;
                res.send(result)
            }
            )
        } else {
            const contact_id = result[0].contact_id

            sql = `UPDATE contacts SET status='ACTIVE' WHERE contact_id = '${contact_id}'`
            
            db.query(sql, (err, result) => {
                if(err) throw err;
                res.send(result)
            })
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
                res.send(result)
            })
        }
    })
}

// block contact
module.exports.blockContact = (req, res) => {
    const user_id = req.user.user_id
    const contact_person_id = req.params.contact_person_id

    let sql = `SELECT contact_id FROM contacts WHERE (user_id = '${user_id}' AND contact_person_id = '${contact_person_id}') OR (user_id = '${contact_person_id}' AND contact_person_id = '${user_id}')`

    db.query(sql, (err, result) => {
        if(err) throw err;
        if(result.length === 0) {
            res.send(false)
        } else {
            const contact_id = result[0].contact_id

            sql = `UPDATE contacts SET status="BLOCKED", blocked_by='${user_id}' WHERE contact_id = '${contact_id}'`
            
            db.query(sql, (err, result) => {
                if(err) throw err;
                res.send(result)
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
                res.send(result)
            })
        }
    })
}

// retrieve details from contacts
module.exports.retrieveContactDetails = (req, res) => {
    const user_id = req.user.user_id
    const contact_id = req.params.contact_id

	let sql = `SELECT contacts.user_id AS user_id, users.username, contacts.status FROM users INNER JOIN contacts ON users.user_id = contacts.user_id WHERE contacts.contact_person_id = '${user_id}' AND contacts.contact_id = '${contact_id}'`
    db.query(sql, (err,result) => {
		if(err) throw err;
        if(result.length !== 0){
            res.send(result)
        } else {
            sql = `SELECT contacts.contact_person_id AS user_id, users.username, contacts.status FROM users INNER JOIN contacts ON users.user_id = contacts.contact_person_id WHERE contacts.user_id = '${user_id}' AND contacts.contact_id = '${contact_id}'`

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

