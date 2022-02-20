const mdbconn = require('../lib/utils/mongo.js');
var mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;
let database = "IRC";
let collection = "chats";

function getChats() {
    const projection = { subject: 1 };
    return mdbconn.conn().then((client) => {
        return client.db(database).collection(collection).find({}).project(projection).toArray();
    });
}

function getChat(chatId) {
    return mdbconn.conn().then((client) => {
        return client.db(database).collection(collection).aggregate([{ $match: { _id: ObjectId(chatId) } }]).toArray();
    });
}

function insertChat(new_chat) {
    return mdbconn.conn().then((client) => {
        return client.db(database).collection(collection).insertOne(new_chat).finally();
    });
}

function changeChatSubject(id, detail) {
    return mdbconn.conn().then((client) => {
        return client.db(database).collection(collection).updateOne(
            { _id: ObjectId(id) }, // Filters the document we want to update
            { $set: { subject: detail } } // the change we want to make
        )
    });
}

function addMember(id, member_id) {
    return mdbconn.conn().then((client) => {
        return client.db(database).collection(collection).updateOne(
            { _id: ObjectId(id) },
            { $push: { membersList: ObjectId(member_id) } }
        )
    });
}

function addMessage(id, message_id) {
    return mdbconn.conn().then((client) => {
        return client.db(database).collection(collection).updateOne(
            { _id: ObjectId(id) },
            { $push: { messages: ObjectId(message_id) } }
        )
    });
}

module.exports = [getChats, getChat, insertChat, changeChatSubject, addMember, addMessage];