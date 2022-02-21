var express = require('express');
var router = express.Router();
const Joi = require('joi');
var mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;
require('dotenv').config();
const auth = require("../middleware/auth");
var [getMessage, insertMessage, deleteMessage] = require('../controllers/messages');

const message_structure = Joi.object({
    date: Joi.date()
        .required(),
    
    chat: Joi.string()
    .min(24)
    .required(),

    content: Joi.string()
        .required(),

    contentType: Joi.string()
        .required(),
});

/* GET message with an specific id */
router.get('/:id', auth, async function (req, res, next) {
    const rta = await getMessage(req.params.id).then((result) => {
        if (result === null || result[0] == null) {
            return res.status(404).send({ message: "No message found. Try with another id" });
        }
        res.status(200).send(result);
    });
});

/* POST message: with information as a JSON */
router.post('/', auth, async function (req, res, next) {

    const { error } = message_structure.validate
        ({
            date: req.body.date,
            chat: req.body.chat,
            content: req.body.content,
            contentType: req.body.contentType
        });

    if (error) {
        return res.status(400).send({ message: error });
    }

    else {
            var new_message =
            {
                owner: ObjectId(req.user.user_id),
                date: new Date(req.body.date +'T14:56:59.301Z'),
                chat: ObjectId(req.body.chat),
                content: req.body.content,
                contentType: req.body.contentType
            }
            const mess = await insertMessage(new_message);
            res.status(200).send(mess);
    }
});

/* DELETE message with an specific id */
router.delete('/:id', auth, async function (req, res, next) {
    var bool = true;
    var verificacion = await getMessage(req.params.id).then((result) => {
        if (result === null || result[0] == null) {
            bool = false;
            return res.status(404).send({ message: "The message with the given id was not found."});
        }
        else if(result[0].owner !== req.user.user_id){
            bool = false;
            return res.status(404).send({ message: "You dont have permissions to do this."});
        }
    });
    if (bool == true) {
        var eliminado = await deleteMessage(req.params.id).then((result) => {
            if (result.deletedCount === 1) {
                res.status(200).send({ message: "The message with the given id was removed." });
            }
            else {
                res.status(404).send({ message: "No message could be deleted. Try again" });
            }
        });;
    }
});

module.exports = router;
