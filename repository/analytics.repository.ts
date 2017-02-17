import { DB, QueryArg } from "./db";
import * as SQL from "mssql";
import * as fs from "fs";
import * as path from "path";
import * as moment from "moment";

const qGetETACalcs: string = fs.readFileSync(path.join(__dirname, "../sql/GetETACalcs.sql")).toString();

export class AnalyticsRepository {
    constructor(private db: DB) { }

    GetETACalcs(from: moment.Moment): Promise<any[]> {
        console.log(from.toDate());
        
        const inputs: QueryArg[] = [
            { name: "FromDateTime", type: SQL.DateTime, value: from.toDate() }
        ];

        return this.db.Query(qGetETACalcs, inputs);
    }
}