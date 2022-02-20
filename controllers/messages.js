const mdbconn = require('../lib/utils/mongo.js');
var mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;
let database = "IRC";
let collection = "messages";


function getMessage(id) {
    return mdbconn.conn().then((client) => {
        return client.db(database).collection(collection).aggregate([{ $match: { _id: ObjectId(id) } }]).toArray();
    });
}

function insertMessage(new_message) {
    return mdbconn.conn().then((client) => {
        return client.db(database).collection(collection).insertOne(new_message).finally();
    });
}

function deleteMessage(id) {
    return mdbconn.conn().then((client) => {
        return client.db(database).collection(collection).deleteOne({ _id: ObjectId(id) })
    });
}

module.exports = [getMessage, insertMessage, deleteMessage];