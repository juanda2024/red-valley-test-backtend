var express = require('express');
var router = express.Router();
const Joi = require('joi');
var mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;
const bcrypt = require('bcrypt');
var jwt = require('jsonwebtoken');
require('dotenv').config();
const auth = require("../middleware/auth");
var [getUserById, getUserByEmail, getUserByUsername, createUser, updateUserPassword, updateUserEmail, updateUserUsername, addChat, deleteUser] = require('../controllers/users');

const user_structure = Joi.object({

    first_name: Joi.string()
        .required(),

    last_name: Joi.string()
        .required(),

    email: Joi.string()
        .required(),
    
    username: Joi.string()
        .required(),

    password: Joi.string()
        .required()
});

const password_dto = Joi.object({
    password: Joi.string()
        .required()
});

const login_dto = Joi.object({
    email: Joi.string()
    .required(),
    password: Joi.string()
        .required()
});

const email_dto = Joi.object({
    email: Joi.string()
        .required()
});

const username_dto = Joi.object({
    username: Joi.string()
        .required()
});

const newChat_dto = Joi.object({
    id: Joi.string()
        .required()
});

/* GET user with an specific id */
router.get('/:id', async function (req, res, next) {
    res.set('Access-Control-Allow-Origin', '*');
    const rta = await getUserById(req.params.id).then((result) => {
        if (result === null || result[0] == null) {
            return res.status(404).send({ message: "No user found. Try with another id" });
        }
        res.status(200).send(result);
    });
});

/* GET user with an specific email */
router.get('/email/:email', async function (req, res, next) {
    res.set('Access-Control-Allow-Origin', '*');
    const rta = await getUserByEmail(req.params.email).then((result) => {
        if (result === null || result[0] == null) {
            return res.status(404).send({ message: "No user found. Try with another email" });
        }
        res.status(200).send(result);
    });
});

/* GET user with an specific username */
router.get('/username/:username', async function (req, res, next) {
    const rta = await getUserByUsername(req.params.username).then((result) => {
        if (result === null || result[0] == null) {
            return res.status(404).send({ message: "No user found. Try with another email" });
        }
        res.status(200).send(result);
    });
});

/* POST user: login with information given as a JSON */
router.post('/login', async function (req, res, next) {
    res.header("Access-Control-Allow-Origin", '*');
    res.header("Access-Control-Allow-Credentials", true);
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
    res.header("Access-Control-Allow-Headers", 'Origin,X-Requested-With,Content-Type,Accept,content-type,application/json');
    const { error } = login_dto.validate
        ({
            email: req.body.email,
            password: req.body.password
        });

    if (error) {
        return res.status(400).send({ message: error });
    }
    else {
        var bool = true;
        var findedUser = undefined;
        var user_password = '';
        var verificacion = await getUserByEmail(req.body.email).then((result) => {
            if (result === null || result[0] == null) {
                bool = false;
                return res.status(404).send({ message: "The user with the given email was not found."});
            }
            else{
                findedUser = result[0]? result[0]: undefined;
                user_password = result[0]? result[0].password: '';
            }
        });
        if (bool == true) {
            if(await bcrypt.compare(req.body.password, user_password)){
                const token = jwt.sign({ user_id: findedUser._id, email: findedUser.email },process.env.ACCESS_TOKEN_SECRET,{expiresIn: "2h"});
                findedUser.token = token;
                res.status(200).send({ message: "User logged succesfully.", token:  token, user: findedUser});
            }
            else{
                res.status(215).send({ message: "The password is incorrect" });
            }
        }
    }
});

/* POST user: with information as a JSON */
router.post('/', async function (req, res, next) {
    res.set('Access-Control-Allow-Origin', '*');
    const { error } = user_structure.validate
        ({
            first_name: req.body.first_name,
            last_name: req.body.last_name,
            email: req.body.email,
            username: req.body.username,
            password: req.body.password
        });

    if (error) {
        return res.status(400).send({ message: error });
    }
    else {
        const alreadyRegisteredEmail = await getUserByEmail(req.body.email);
        const usernameAlreadyExist = await getUserByUsername(req.body.username);

        if (alreadyRegisteredEmail === undefined || alreadyRegisteredEmail.length !== 0) {
            return res.status(409).send({message: "This email is already registered. try to Login"});
        }
        if(usernameAlreadyExist === undefined || usernameAlreadyExist.length !== 0){
            return res.status(409).send({message: "This username is already taken. try with another"});
        }

        const encryptedPassword = await bcrypt.hash(req.body.password, 10);

        var new_user =
        {
            first_name: req.body.first_name,
            last_name: req.body.last_name,
            email: req.body.email.toLowerCase(),
            username: req.body.username,
            password: encryptedPassword,
            chats: []
        }
        const mensaje = await createUser(new_user);
        const accessToken = jwt.sign(new_user,process.env.ACCESS_TOKEN_SECRET,{expiresIn: "2h"});
        new_user.token = accessToken;
        
        res.status(200).send(new_user);
    }
});

/* PUT user: updates the user´s password */
router.put('/password/:id', auth, async function (req, res, next) {
    res.set('Access-Control-Allow-Origin', '*');
    var bool = true;
    var verificacion = await getUserById(req.params.id).then((result) => {
        if (result === null || result[0] == null) {
            bool = false;
            return res.status(404).send({ message: "The user with the given id was not found."});
        }
        else if(req.params.id !== req.user.user_id){
            bool = false;
            return res.status(404).send({ message: "You cannot update someone´s else password."});
        }
    });
    if (bool == true) {
        const { error } = password_dto.validate
            ({
                password: req.body.password
            });

        if (error) {
            return res.status(400).send({ message: error });
        }
        else {
            const encryptedPassword = await bcrypt.hash(req.body.password, 10);
            var resultado = await updateUserPassword(req.params.id, encryptedPassword).then((result) => {
                if (result[0] !== 0) {
                    res.status(200).send({ message: "The user´s password was updated succesfully!" });
                }
            });
        }
    }
});

/* PUT user: updates the user´s email */
router.put('/email/:id', auth,  async function (req, res, next) {
    res.set('Access-Control-Allow-Origin', '*');
    var bool = true;
    var verificacion = await getUserById(req.params.id).then((result) => {
        if (result === null || result[0] == null) {
            bool = false;
            return res.status(404).send({ message: "The user with the given id was not found."});
        }
        else if(req.params.id !== req.user.user_id){
            bool = false;
            return res.status(404).send({ message: "You cannot update someone´s else email."});
        }
    });
    if (bool == true) {
        const { error } = email_dto.validate
            ({
                email: req.body.email
            });

        if (error) {
            return res.status(400).send({ message: error });
        }
        else {
            var resultado = await updateUserEmail(req.params.id, req.body.email).then((result) => {
                if (result[0] !== 0) {
                    res.status(200).send({ message: "The user´s email was updated succesfully!" });
                }
            });
        }
    }
});

/* PUT user: updates the user´s username */
router.put('/username/:id', auth, async function (req, res, next) {
    res.set('Access-Control-Allow-Origin', '*');
    var bool = true;
    var verificacion = await getUserById(req.params.id).then((result) => {
        if (result === null || result[0] == null) {
            bool = false;
            return res.status(404).send({ message: "The user with the given id was not found."});
        }
        else if(req.params.id !== req.user.user_id){
            bool = false;
            return res.status(404).send({ message: "You cannot update someone´s else username."});
        }
    });
    if (bool == true) {
        const { error } = username_dto.validate
            ({
                username: req.body.username
            });

        if (error) {
            return res.status(400).send({ message: error });
        }
        else {
            var resultado = await updateUserUsername(req.params.id, req.body.username).then((result) => {
                if (result[0] !== 0) {
                    res.status(200).send({ message: "The user´s username was updated succesfully!" });
                }
            });
        }
    }
});

/* PUT user: add a user´s chat */
router.put('/addChat/:id', auth, async function (req, res, next) {
    res.set('Access-Control-Allow-Origin', '*');
    var bool = true;
    var verificacion = await getUserById(req.params.id).then((result) => {
        if (result === null || result[0] == null) {
            bool = false;
            return res.status(404).send({ message: "The user with the given id was not found."});
        }
        else if(req.params.id !== req.user.user_id){
            bool = false;
            return res.status(404).send({ message: "You dont have permissions to do this."});
        }
    });
    if (bool == true) {
        const { error } = newChat_dto.validate
            ({
                id: req.body.id
            });

        if (error) {
            return res.status(400).send({ message: error });
        }
        else {
            var resultado = await addChat(req.params.id, req.body.id).then((result) => {
                if (result[0] !== 0) {
                    res.status(200).send({ message: "The user`s chat was added succesfully!" });
                }
            });
        }
    }
});

/* DELETE user with an specific id */
router.delete('/:id', auth, async function (req, res, next) {
    res.set('Access-Control-Allow-Origin', '*');
    var bool = true;
    var verificacion = await getUserById(req.params.id).then((result) => {
        if (result === null || result[0] == null) {
            bool = false;
            return res.status(404).send({ message: "The user with the given id was not found."});
        }
        else if(req.params.id !== req.user.user_id){
            bool = false;
            return res.status(404).send({ message: "You dont have permissions to do this."});
        }
    });
    if (bool == true) {
        var eliminado = await deleteUser(req.params.id).then((result) => {
            if (result.deletedCount === 1) {
                res.status(200).send({ message: "The user with the given id was removed." });
            }
            else {
                res.status(404).send({ message: "No user could be deleted. Try again" });
            }
        });;
    }
});

module.exports = router;
