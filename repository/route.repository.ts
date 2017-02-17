import { DB, QueryArg } from "./db";
import * as SQL from "mssql";
import { PreparedStatement } from "mssql";
import * as config from "../db.config";
import { Queries } from "./Queries";
import { Vehicle } from "../model/vehicle";
import { primary } from "../db.config";
import * as fs from "fs";
import * as path from "path";
import * as moment from "moment";

const qPatternsForRoute = fs.readFileSync(path.join(__dirname, "../sql/routes/route-patterns-for-route.sql")).toString();
const qRoutes = fs.readFileSync(path.join(__dirname, "../sql/routes/routes.sql")).toString();
const qPatterns = fs.readFileSync(path.join(__dirname, "../sql/routes/route-patterns.sql")).toString();
const qPatternETAAnalytics = fs.readFileSync(path.join(__dirname, "../sql/routes/route-pattern-eta-analytics.sql")).toString();
const qStopETAAnalyticsByPattern = fs.readFileSync(path.join(__dirname, "../sql/routes/stop-eta-analytics-by-pattern.sql")).toString();
const qGPSForPatternStop = fs.readFileSync(path.join(__dirname, "../sql/routes/gps-for-pattern-stop.sql")).toString();

export class RouteRepository {
    constructor(private db: DB) { }

    ListRoutes(date: moment.Moment): Promise<any> {
        return this.db.Query(qRoutes, [ { name: "Date", type: SQL.DateTime, value: date.toDate() } ]);
    }

    ListRoutePatterns(date: Date): Promise<any> {
        return this.db.Query(qPatterns, [ { name: "Date", type: SQL.DateTime, value: date } ]);
    }

    ListRoutePatternsForRoute(date: moment.Moment, masterRotueID: number): Promise<any> {
        const inputs: QueryArg[] = [
            { name: "Date", type: SQL.DateTime, value: date.toDate() },
            { name: "MasterRouteID", type: SQL.Int, value: masterRotueID }
        ];

        return this.db.Query(qPatternsForRoute, inputs);
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

    ListStops(date: Date): Promise<any> {
        const query = fs.readFileSync(path.join(__dirname, "../sql/stops/actual.sql")).toString();

        const inputs: QueryArg[] = [
            { name: "date", type: SQL.DateTime, value: date }
        ];

        return this.db.Query(query);
    }

    ActualsProblems(date: moment.Moment): Promise<any> {
        const query = fs.readFileSync(path.join(__dirname, "../sql/OutOfOrderActuals.sql")).toString();

        const inputs: QueryArg[] = [
            { name: "date", type: SQL.DateTime, value: date.toDate() }
        ];

        return this.db.Query(query, inputs);
    }

    ActualsProblemsCount(sdate: moment.Moment, edate: moment.Moment): Promise<any> {
        const query = fs.readFileSync(path.join(__dirname, "../sql/ProblemCounts.sql")).toString();

        const inputs: QueryArg[] = [
            { name: "sdate", type: SQL.DateTime, value: sdate.toDate() },
            { name: "edate", type: SQL.DateTime, value: edate.toDate() }
        ];

        return this.db.Query(query, inputs);
    }
}