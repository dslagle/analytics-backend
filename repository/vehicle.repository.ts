import { DB, QueryArg } from "./db";
import * as SQL from "mssql";
import * as config from "../db.config";
//import { Queries } from "./Queries";
import { Vehicle } from "../model/vehicle";
import { primary } from "../db.config";
import * as fs from "fs";
import * as path from "path";

export class VehicleRepository {
    constructor(private db: DB) { }

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

    GetAllVehicleGPS(lastGPSDateTime?: Date) {
        const query = fs.readFileSync(path.join(__dirname, "../sql/gps.sql")).toString();
        
        return new Promise<any>((resolve, reject) => {
            this.db.Query(query)
                .then(data => { resolve(data); })
                .catch(err => { reject(err); })
        });
    }

    GetVehicleGPS(vid: number, lastGPSDateTime?: Date): Promise<any> {
        const db = new DB(primary);
        const args: QueryArg[]  = [
            { name: "VehicleID", type: SQL.Int, value: vid },
            { name: "LastGPSDateTime", type: SQL.DateTime, value: lastGPSDateTime }
        ];

        return new Promise<any>((resolve, reject) => {
            db.Connect()
                .then(() => {
                    db.Execute('spGPSForVehicle_DJS', args)
                        .then(data => { db.Close(); resolve(data[0][0]); })
                        .catch(err => { db.Close(); reject(err); })
                })
                .catch(err => reject(err));
        });
    }
}