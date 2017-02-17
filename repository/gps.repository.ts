import { DB, QueryArg } from "./db";
import * as SQL from "mssql";
import { Request } from "mssql";
import { GPSEntry } from "../model/gps-entry";
import { MongoClient, ObjectID, Db } from "mongodb";
import * as fs from "fs";
import * as path from "path";

const mongoURL = "mongodb://127.0.0.1:27017/gps";

let mongo: Db;

export class GPSRepository {
    constructor(private db: DB) { }

    Init(): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            MongoClient.connect(mongoURL, (err, db) => {
                if (err) reject(err);
                else { mongo = db; resolve(); }
            });
        });
    }

    StreamGPS(): Request {
        const query = fs.readFileSync(path.join(__dirname, "../gps.sql")).toString();
        
        return this.db.Stream<GPSEntry>(query);
    }

    WriteToMongo(gps: any) {
        const col = mongo.collection("gpsdebug");
        col.insertOne(gps);
    }
}