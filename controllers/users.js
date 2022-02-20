const mdbconn = require('../lib/utils/mongo.js');
var mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;
let database = "IRC";
let collection = "users";

function getUserById(userId) {
    return mdbconn.conn().then((client) => {
        return client.db(database).collection(collection).aggregate([{ $match: { _id: ObjectId(userId) } }]).toArray();
    });
}

function getUserByEmail(userEmail) {
    return mdbconn.conn().then((client) => {
        return client.db(database).collection(collection).aggregate([{ $match: { email: userEmail } }]).toArray();
    });
}

function getUserByUsername(username) {
    return mdbconn.conn().then((client) => {
        return client.db(database).collection(collection).aggregate([{ $match: { username: username } }]).toArray();
    });
}

function createUser(new_user) {
    return mdbconn.conn().then((client) => {
        return client.db(database).collection(collection).insertOne(new_user).finally();
    });
}

function updateUserPassword(id, password) {
    return mdbconn.conn().then((client) => {
        return client.db(database).collection(collection).updateOne(
            { _id: ObjectId(id) },
            { $set: { password: password } }
        )
    });
}

function updateUserEmail(id, email) {
    return mdbconn.conn().then((client) => {
        return client.db(database).collection(collection).updateOne(
            { _id: ObjectId(id) },
            { $set: { email: email } }
        )
    });
}

function updateUserUsername(id, username) {
    return mdbconn.conn().then((client) => {
        return client.db(database).collection(collection).updateOne(
            { _id: ObjectId(id) }, // Filtro al documento que queremos modificar
            { $set: { username: username } } // El cambio que se quiere realizar
        )
    });
}

function addChat(id, chat_id) {
    return mdbconn.conn().then((client) => {
        return client.db(database).collection(collection).updateOne(
            { _id: ObjectId(id) },
            { $push: { chats: ObjectId(chat_id) } }
        )
    });
}

function deleteUser(id) {
    return mdbconn.conn().then((client) => {
        return client.db(database).collection(collection).deleteOne({ _id: ObjectId(id) })
    });
}

module.exports = [getUserById, getUserByEmail, getUserByUsername, createUser, updateUserPassword, updateUserEmail, updateUserUsername, addChat, deleteUser];