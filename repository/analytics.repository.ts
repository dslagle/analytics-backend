import { DB, QueryArg } from "./db";
import * as SQL from "mssql";
import * as fs from "fs";
import * as path from "path";
import * as moment from "moment";

const qGetETACalcs: string = fs.readFileSync(path.join(__dirname, "../sql/GetETACalcs.sql")).toString();
const qPatternETAAnalytics = fs.readFileSync(path.join(__dirname, "../sql/routes/route-pattern-eta-analytics.sql")).toString();
const qStopETAAnalyticsByPattern = fs.readFileSync(path.join(__dirname, "../sql/routes/stop-eta-analytics-by-pattern.sql")).toString();
const qGPSForPatternStop = fs.readFileSync(path.join(__dirname, "../sql/routes/gps-for-pattern-stop.sql")).toString();

export class AnalyticsRepository {
    constructor(private db: DB) { }

    GetETACalcs(from: moment.Moment): Promise<any[]> {
        console.log(from.toDate());
        
        const inputs: QueryArg[] = [
            { name: "FromDateTime", type: SQL.DateTime, value: from.toDate() }
        ];

        return this.db.Query(qGetETACalcs, inputs);
    }

    ListETAAnalyticsForRoutePatterns(date: moment.Moment, threshold: number): Promise<any> {
        const inputs: QueryArg[] = [
            { name: "Date", type: SQL.DateTime, value: date.toDate() },
            { name: "Threshold", type: SQL.Int, value: threshold }
        ];

        return this.db.Query(qPatternETAAnalytics, inputs);
    }

    ListETAAnalyticsForRoutePattern(date: moment.Moment, threshold: number, id: number): Promise<any> {
        const inputs: QueryArg[] = [
            { name: "Date", type: SQL.DateTime, value: date.toDate() },
            { name: "Threshold", type: SQL.Int, value: threshold },
            { name: "SubrouteID", type: SQL.Int, value: id }
        ];

        return this.db.Query(qStopETAAnalyticsByPattern, inputs);
    }

    ListGPSForPatternStop(date: moment.Moment, id: number): Promise<any> {
        const inputs: QueryArg[] = [
            { name: "Date", type: SQL.DateTime, value: date.toDate() },
            { name: "SRID", type: SQL.Int, value: id }
        ];

        return this.db.QueryMultiple(qGPSForPatternStop, inputs);
    }
}