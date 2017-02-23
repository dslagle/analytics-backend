import { DB, QueryArg } from "./db";
import * as SQL from "mssql";
import * as fs from "fs";
import * as path from "path";
import * as moment from "moment";
import Axios from "axios";

const key = "AIzaSyA3PCYWq3Dj7YpI2xlimqVxGi8igFmsPbs";
const base = `https://maps.googleapis.com/maps/api/distancematrix/json?units=imperial&traffic_model=best_guess&key=${key}`;

const googleMapsClient = require('@google/maps').createClient({ key });

const qSaveDMResult = fs.readFileSync(path.join(__dirname, "../sql/google/InsertDMResult.sql")).toString();
const qSaveError = fs.readFileSync(path.join(__dirname, "../sql/google/SaveError.sql")).toString();
const qGetETACalcs: string = fs.readFileSync(path.join(__dirname, "../sql/GetETACalcs.sql")).toString();

export class GoogleRepository {
    constructor(private db: DB) { }

    SaveDMResult(queryID: string, result: any): Promise<any> {
        const data = result;

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

    DistanceMatrixRequest(origin: any, destination: any, retryCount: number = 3, retryDelay: number = 100): Promise<any> {
        return new Promise<any>((resolve, reject) => {
            const url = `${base}&origins=${origin.lat},${origin.lng}&destinations=${destination.lat},${destination.lng}&departure_time=${moment().valueOf()}`;
            
            this.DistanceMatrixRequestWithRetry(url, retryCount, retryDelay, resolve, reject);
        });
    }

    private DistanceMatrixRequestWithRetry(url: string, retryCount: number, retryDelay: number, resolve: any, reject: any) {
        Axios.get(url)
            .then(response => resolve(response.data.rows[0].elements[0]))
            .catch(err => {
                if (retryCount > 0) {
                    this.SaveError(`Error Calling Google: Retrying ${retryCount} time${retryCount === 1 ? "" : "s"}`);
                    setTimeout(() => this.DistanceMatrixRequestWithRetry(url, --retryCount, retryDelay, resolve, reject), retryDelay);
                } else reject(err);
            });
    }
}