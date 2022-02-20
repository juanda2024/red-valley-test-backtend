var express = require('express');
var router = express.Router();
const Joi = require('joi');
var mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;
require('dotenv').config();
const auth = require("../middleware/auth");
var [getChats ,getChat, insertChat, changeChatSubject, addMember, addMessage] = require('../controllers/chats');

const chats_structure = Joi.object({
    subject: Joi.string()
        .required()
});

const member_dto = Joi.object({
    member: Joi.string()
        .required()
});

const message_dto = Joi.object({
    message: Joi.string()
        .required()
});

/* GET all chats */
router.get('/', async function (req, res, next) {
    const chats = await getChats().then((result) => {
        if (result == null || result[0] == null) {
            res.status(404).send({ message: "No chats where found." })
        }
        else {
            res.status(200).send(result);
        }
    });
});


/* GET chats with an specific id */
router.get('/:id', async function (req, res, next) {
    const rta = await getChat(req.params.id).then((result) => {
        if (result === null || result[0] == null) {
            return res.status(404).send({ message: "The chat was not found. Try with another id" });
        }
        res.status(200).send(result);
    });
});

/* POST chat: with information as a JSON */
router.post('/', auth, async function (req, res, next) {

    const { error } = chats_structure.validate
        ({
            subject: req.body.subject
        });

    if (error) {
        return res.status(400).send({ message: error });
    }

    else {
        var new_chat =
        {
            subject: req.body.subject,
            membersList: [],
            messages: []
        }
        const rta = await insertChat(new_chat);
        res.status(200).send(rta);
    }
});

/* PUT chat: updates the chat with a new subject by the given user */
router.put('/subject/:id', auth, async function (req, res, next) {
    var bool = true;
    var verification = await getChat(req.params.id).then((result) => {
        if (result === null || result[0] == null) {
            bool = false;
            return res.status(404).send({ message: "The chat with that id was not found."});

        }
    });
    if (bool == true) {
        const { error } = chats_structure.validate
            ({
                subject: req.body.subject
            });

        if (error) {
            return res.status(400).send({ message: error });
        }
        else {
            var rta = await changeChatSubject(req.params.id, req.body.subject).then((result) => {
                if (result[0] !== 0) {
                    res.status(200).send({ message: "The chat´s subject was updated succesfully!" });
                }
            });
        }
    }
});

/* PUT chat: add a chat´s member */
router.put('/addMember/:id', auth, async function (req, res, next) {
    var bool = true;
    var verify = await getChat(req.params.id).then((result) => {
        if (result === null || result[0] == null) {
            bool = false;
            return res.status(404).send({ message: "The chat with that id was not found."});
        }
        if(req.user._id !== req.body.member) {
            bool = false;
            return res.status(404).send({ message: "You dont have permissions to do this."});
        }
        if(result[0].membersList.includes(req.user._id)){
            bool = false;
            return res.status(404).send({ message: "The user is already registered in this chat."}); 
        }
    });
    if (bool == true) {
        const { error } = member_dto.validate
            ({
                member: req.body.member
            });

        if (error) {
            return res.status(400).send({ message: error });
        }
        else {
            var rta = await addMember(req.params.id, req.body.member).then((result) => {
                if (result[0] !== 0) {
                    res.status(200).send({ message: "The chat´s member was added succesfully!" });
                }
            });
        }
    }
});

/* PUT chat: add a chat´s message */
router.put('/addMessage/:id', auth, async function (req, res, next) {
    var bool = true;
    var verify = await getChat(req.params.id).then((result) => {
        if (result === null || result[0] == null) {
            bool = false;
            return res.status(404).send({ message: "The chat with that id was not found."});
        }
    });
    if (bool == true) {
        const { error } = message_dto.validate
            ({
                message: req.body.message
            });

        if (error) {
            return res.status(400).send({ message: error });
        }
        else {
            var rta = await addMessage(req.params.id, req.body.message).then((result) => {
                if (result[0] !== 0) {
                    res.status(200).send({ message: "The chat´s message was added succesfully!" });
                }
            });
        }
    }
});

module.exports = router;
