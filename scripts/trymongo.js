const { MongoClient } = require("mongodb");

const url =
    "mongodb+srv://vignesh-arch:VickyCluster@cluster0.wn6w0dq.mongodb.net/?retryWrites=true&w=majority";

const client = new MongoClient(url, { useNewUrlParser: true });
function testWithCallbacks(callback) {
    client.connect((err, client) => {
        const db = client.db();
        const collection = db.collection("employees");
        const employee = {
            id: 1,
            fullName: {
                first: "vicky",
                last: "vel",
            },
            age: 28,
        };
        collection.insertOne(employee, (err, result) => {
            if (err) {
                client.close;
                callback(err);
                return;
            }
            console.log("Result from inserting an entry", result.insertedId);
            collection
                .find({ _id: result.insertedId })
                .toArray((err, result) => {
                    if (err) {
                        client.close;
                        callback(err);
                        return;
                    }
                    console.log("Result from retrieving the document", result);
                    client.close();
                    if (err) {
                        callback(err);
                    }
                });
        });
    });
}
testWithCallbacks((err) => {
    console.log(err);
});
