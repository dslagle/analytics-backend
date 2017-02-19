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
    DistanceMatrixRequest(origin, destination) {
        return new Promise((resolve, reject) => {
            const url = `${base}&origins=${origin.lat},${origin.lng}&destinations=${destination.lat},${destination.lng}&departure_time=${moment().valueOf()}`;
            //console.log(url);
            //resolve({ duration: { value: 100 }, duration_in_traffic: { value: 200 }, distance: { value: 50 } });
            axios_1.default.get(url)
                .then(response => resolve(response.data.rows[0].elements[0]))
                .catch(err => reject(err));
            // googleMapsClient.distanceMatrix(
            //     {
            //         origins: [ origin ],
            //         destinations: [ destination ],
            //         departure_time: moment().toDate(),
            //         traffic_model: "best_guess",
            //         units: "imperial"
            //     },
            //     (err, result) => { if (err) reject(err); else resolve(result.json.rows[0].elements[0]); }
            // );
        });
    }
}
exports.GoogleRepository = GoogleRepository;
//# sourceMappingURL=google.repository.js.map