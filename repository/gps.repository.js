"use strict";
const mongodb_1 = require("mongodb");
const mongoURL = "mongodb://127.0.0.1:27017/gps";
let mongo;
class GPSRepository {
    constructor(db) {
        this.db = db;
    }
    Init() {
        return new Promise((resolve, reject) => {
            mongodb_1.MongoClient.connect(mongoURL, (err, db) => {
                if (err)
                    reject(err);
                else {
                    mongo = db;
                    resolve();
                }
            });
        });
    }
    // StreamGPS(): Request {
    //     const query = fs.readFileSync(path.join(__dirname, "../gps.sql")).toString();
    //     return this.db.Stream<GPSEntry>(query);
    // }
    WriteToMongo(gps) {
        const col = mongo.collection("gpsdebug");
        col.insertOne(gps);
    }
}
exports.GPSRepository = GPSRepository;
//# sourceMappingURL=gps.repository.js.map