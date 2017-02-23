"use strict";
const SQL = require("mssql");
const fs = require("fs");
const path = require("path");
const moment = require("moment");
const axios_1 = require("axios");
const key = "AIzaSyA3PCYWq3Dj7YpI2xlimqVxGi8igFmsPbs";
const base = `https://maps.googleapis.com/maps/api/distancematrix/json?units=imperial&traffic_model=best_guess&key=${key}`;
const googleMapsClient = require('@google/maps').createClient({ key });
const qSaveDMResult = fs.readFileSync(path.join(__dirname, "../sql/google/InsertDMResult.sql")).toString();
const qSaveError = fs.readFileSync(path.join(__dirname, "../sql/google/SaveError.sql")).toString();
const qGetETACalcs = fs.readFileSync(path.join(__dirname, "../sql/GetETACalcs.sql")).toString();
class GoogleRepository {
    constructor(db) {
        this.db = db;
    }
    SaveDMResult(queryID, result) {
        const data = result;
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
    DistanceMatrixRequest(origin, destination, retryCount = 3, retryDelay = 100) {
        return new Promise((resolve, reject) => {
            const url = `${base}&origins=${origin.lat},${origin.lng}&destinations=${destination.lat},${destination.lng}&departure_time=${moment().valueOf()}`;
            this.DistanceMatrixRequestWithRetry(url, retryCount, retryDelay, resolve, reject);
        });
    }
    DistanceMatrixRequestWithRetry(url, retryCount, retryDelay, resolve, reject) {
        axios_1.default.get(url)
            .then(response => resolve(response.data.rows[0].elements[0]))
            .catch(err => {
            if (retryCount > 0) {
                this.SaveError(`Error Calling Google: Retrying ${retryCount} time${retryCount === 1 ? "" : "s"}`);
                setTimeout(() => this.DistanceMatrixRequestWithRetry(url, --retryCount, retryDelay, resolve, reject), retryDelay);
            }
            else
                reject(err);
        });
    }
}
exports.GoogleRepository = GoogleRepository;
//# sourceMappingURL=google.repository.js.map