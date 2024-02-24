require("dotenv").config();
const { MongoClient } = require("mongodb");
let db;

const url =
    process.env.DB_URL ||
    "mongodb+srv://vignesh-arch:Vignesh@cluster0.yvud6vl.mongodb.net/issuetracker?retryWrites=true&w=majority";

async function connectToDB() {
    const client = new MongoClient(url, { useNewUrlParser: true });
    await client.connect();
    console.log("Connected to MongoDB Database", url);
    db = client.db();
}

async function getNextSequence(name) {
    const result = await db
        .collection("counters")
        .findOneAndUpdate(
            { _id: name },
            { $inc: { current: 1 } },
            { returnOriginal: false }
        );
    return result.value.current;
}

function getDB() {
    return db;
}

module.exports = { connectToDB, getNextSequence, getDB };
