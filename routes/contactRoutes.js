const express = require("express");
const auth = require("../auth");
const router = express.Router();

const contactControllers = require("../controllers/contactControllers");

const { verify } = auth;

// view a contact
router.get("/view/:contact_person_id", verify, contactControllers.viewContact);

// view contact details
router.get("/viewDetails/:contact_id", verify, contactControllers.viewDetails);

// view all contacts
router.get("/viewAll", verify, contactControllers.viewAll);

// add contact
router.put("/addContact/:contact_person_id", verify, contactControllers.addContact);

// confirm contact
router.patch("/confirmContact/:contact_person_id", verify, contactControllers.confirmContact);

// cancel contact
router.delete("/cancelContact/:contact_person_id", verify, contactControllers.cancelRequest);

// decline contact
router.patch("/declineContact/:contact_person_id", verify, contactControllers.declineContact);

// remove contact
router.patch("/removeContact/:contact_person_id", verify, contactControllers.removeContact);

// block contact
router.put("/blockContact/:contact_person_id", verify, contactControllers.blockContact);

// unblock contact
router.patch("/unblockContact/:contact_person_id", verify, contactControllers.unblockContact);

// send person a message
router.post("/sendMessage/:contact_person_id", verify, contactControllers.sendMessage)

// view messages
router.get("/viewMessages/:contact_id", verify, contactControllers.viewAllMessages)

// retrieve contact details of others
router.get("/viewContactDetails/:contact_id", verify, contactControllers.retrieveContactDetails)

module.exports = router;