"use strict";
const SQL = require("mssql");
const fs = require("fs");
const path = require("path");
const moment = require("moment");
const key = "AIzaSyA3PCYWq3Dj7YpI2xlimqVxGi8igFmsPbs";
const googleMapsClient = require('@google/maps').createClient({ key });
const qSaveDMResult = fs.readFileSync(path.join(__dirname, "../sql/google/InsertDMResult.sql")).toString();
const qSaveError = fs.readFileSync(path.join(__dirname, "../sql/google/SaveError.sql")).toString();
const qGetETACalcs = fs.readFileSync(path.join(__dirname, "../sql/GetETACalcs.sql")).toString();
class GoogleRepository {
    constructor(db) {
        this.db = db;
    }
    SaveDMResult(queryID, result) {
        const data = result.rows[0].elements[0];
        const inputs = [
            { name: "QueryID", type: SQL.VarChar, value: queryID },
            { name: "TravelTime", type: SQL.Int, value: data.duration.value },
            { name: "TravelTimeInTraffic", type: SQL.Int, value: data.duration_in_traffic.value },
            { name: "DistanceInMeters", type: SQL.Int, value: data.distance.value }
        ];
        return this.db.Query(qSaveDMResult, inputs);
    }
    SaveError(error, queryID) {
        const inputs = [
            { name: "Date", type: SQL.DateTime, value: moment().utc(true).toDate() },
            { name: "Error", type: SQL.VarChar, value: error },
            { name: "QueryID", type: SQL.VarChar, value: queryID }
        ];
        return this.db.Query(qSaveError, inputs);
    }
    DistanceMatrixRequest(origin, destination) {
        return new Promise((resolve, reject) => {
            googleMapsClient.distanceMatrix({
                origins: [origin],
                destinations: [destination],
                departure_time: moment().toDate(),
                traffic_model: "best_guess",
                units: "imperial"
            }, (err, result) => { if (err)
                reject(err);
            else
                resolve(result.json); });
        });
    }
}
exports.GoogleRepository = GoogleRepository;
//# sourceMappingURL=google.repository.js.map