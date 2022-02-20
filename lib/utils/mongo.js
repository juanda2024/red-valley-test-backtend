require('dotenv').config();
const uri = process.env.MONGO_URI;
const MongoClient = require('mongodb').MongoClient;

function MongoUtils() {

    const mu = {};

    // Esta función retorna una nueva conexión a MongoDB.
    mu.conn = () => {
        const client = new MongoClient(uri, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        return client.connect();
    };
    return mu;
}
module.exports = MongoUtils();