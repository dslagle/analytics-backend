import { DB, QueryArg } from "./db";
import * as SQL from "mssql";
import { Vehicle } from "../model/vehicle";
import * as fs from "fs";
import * as path from "path";

export class RunRepository {
    constructor(private db: DB) { }

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