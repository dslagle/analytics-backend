"use strict";
const db_1 = require("./db");
const SQL = require("mssql");
const db_config_1 = require("../db.config");
const fs = require("fs");
const path = require("path");
class VehicleRepository {
    constructor(db) {
        this.db = db;
    }
    // ListVehicles(): Promise<Vehicle[]> {
    //     const db = new DB(primary);
    //     return new Promise<Vehicle[]>((resolve, reject) => {
    //         db.Connect()
    //             .then(() => {
    //                 db.Query(Queries.listVehiclesForCurrentDate)
    //                     .then(data =>  { db.Close(); resolve(data.map(d => <Vehicle>d)) })
    //                     .catch(err => { db.Close(); reject(err); })
    //             })
    //             .catch(err => reject(err));
    //     });
    // }
    GetAllVehicleGPS(lastGPSDateTime) {
        const query = fs.readFileSync(path.join(__dirname, "../sql/gps.sql")).toString();
        return new Promise((resolve, reject) => {
            this.db.Query(query)
                .then(data => { resolve(data); })
                .catch(err => { reject(err); });
        });
    }
    GetVehicleGPS(vid, lastGPSDateTime) {
        const db = new db_1.DB(db_config_1.primary);
        const args = [
            { name: "VehicleID", type: SQL.Int, value: vid },
            { name: "LastGPSDateTime", type: SQL.DateTime, value: lastGPSDateTime }
        ];
        return new Promise((resolve, reject) => {
            db.Connect()
                .then(() => {
                db.Execute('spGPSForVehicle_DJS', args)
                    .then(data => { db.Close(); resolve(data[0][0]); })
                    .catch(err => { db.Close(); reject(err); });
            })
                .catch(err => reject(err));
        });
    }
}
exports.VehicleRepository = VehicleRepository;
