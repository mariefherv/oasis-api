const express = require("express");
const auth = require("../auth");
const router = express.Router();

const contactControllers = require("../controllers/contactControllers");

const { verify, verifyAdmin } = auth;

// view a contact
router.get("/view/:contact_id", verify, contactControllers.viewContact);

// view all contacts
router.get("/viewAll", verify, contactControllers.viewAll);

// add contact
router.post("/addContact/:contact_person_id", verify, contactControllers.addContact);

// send person a message
router.post("/sendMessage/:contact_person_id", verify, contactControllers.sendMessage)

// view messages
router.get("/viewMessages/:contact_id", verify, contactControllers.viewAllMessages)

// retrieve contact details of others
router.get("/viewContactDetails/:contact_id", verify, contactControllers.retrieveContactDetails)

module.exports = router;