import { DB, QueryArg } from "./db";
import * as SQL from "mssql";
import { PreparedStatement } from "mssql";
import * as config from "../db.config";
import { Queries } from "./Queries";
import { Vehicle } from "../model/vehicle";
import { primary } from "../db.config";
import * as fs from "fs";
import * as path from "path";

export class RunRepository {
    _runStatement: PreparedStatement;

    constructor(private db: DB) { }

    Init(): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            fs.readFile(path.join(__dirname, "../sql/runs/runs-actual.sql"), (err, data) => {
                if (err) reject(err);
                else {
                    const q = data.toString();
                    this.db.Prepare(q, { Date: SQL.DateTime })
                        .then(s => { this._runStatement = s; resolve(); })
                        .catch(err => reject(err));
                }
            });
        });
    }

    ListRuns(date: Date): Promise<any> {
        const query = fs.readFileSync(path.join(__dirname, "../sql/runs/runs-actual.sql")).toString();

        return this.db.Query(query, [ { name: "date", type: SQL.DateTime, value: date } ]);
    }

    ListRunTrips(date: Date, RunID: number): Promise<any> {
        const query = fs.readFileSync(path.join(__dirname, "../sql/runs/run-trips.sql")).toString();

        const inputs: QueryArg[] = [
            { name: "date", type: SQL.DateTime, value: date },
            { name: "RunID", type: SQL.Int, value: RunID }
        ];

        return this.db.Query(query, inputs);
    }
}