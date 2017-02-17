import { DB, QueryArg } from "./db";
import * as SQL from "mssql";
import { PreparedStatement } from "mssql";
import * as config from "../db.config";
import { Queries } from "./Queries";
import { Vehicle } from "../model/vehicle";
import { primary } from "../db.config";
import * as fs from "fs";
import * as path from "path";
import * as moment from "moment";

const key = "AIzaSyA3PCYWq3Dj7YpI2xlimqVxGi8igFmsPbs";

const googleMapsClient = require('@google/maps').createClient({ key });

const qSaveDMResult = fs.readFileSync(path.join(__dirname, "../sql/google/InsertDMResult.sql")).toString();
const qSaveError = fs.readFileSync(path.join(__dirname, "../sql/google/SaveError.sql")).toString();
const qGetETACalcs: string = fs.readFileSync(path.join(__dirname, "../sql/GetETACalcs.sql")).toString();

export class GoogleRepository {
    constructor(private db: DB) { }

    SaveDMResult(queryID: string, result: any): Promise<any> {
        const data = result.rows[0].elements[0];

        const inputs: QueryArg[] = [
            { name: "QueryID", type: SQL.VarChar, value: queryID },
            { name: "TravelTime", type: SQL.Int, value: data.duration.value },
            { name: "TravelTimeInTraffic", type: SQL.Int, value: data.duration_in_traffic.value },
            { name: "DistanceInMeters", type: SQL.Int, value: data.distance.value }
        ];

        return this.db.Query(qSaveDMResult, inputs);
    }

    SaveError(error: string, queryID?: string): Promise<any> {
        const inputs: QueryArg[] = [
            { name: "Date", type: SQL.DateTime, value: moment().utc(true).toDate() },
            { name: "Error", type: SQL.VarChar, value: error },
            { name: "QueryID", type: SQL.VarChar, value: queryID }
        ];

        return this.db.Query(qSaveError, inputs);
    }

    DistanceMatrixRequest(origin: any, destination: any): Promise<any> {
        return new Promise<any>((resolve, reject) => {
            googleMapsClient.distanceMatrix(
                {
                    origins: [ origin ],
                    destinations: [ destination ],
                    departure_time: moment().toDate(),
                    traffic_model: "best_guess",
                    units: "imperial"
                },
                (err, result) => { if (err) reject(err); else resolve(result.json); }
            );
        });
    }
}