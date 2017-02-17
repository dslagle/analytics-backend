import { DB, QueryArg } from "./db";
import * as SQL from "mssql";
import { Vehicle } from "../model/vehicle";
import * as fs from "fs";
import * as path from "path";
import * as moment from "moment";

const qPatternsForRoute = fs.readFileSync(path.join(__dirname, "../sql/routes/route-patterns-for-route.sql")).toString();
const qRoutes = fs.readFileSync(path.join(__dirname, "../sql/routes/routes.sql")).toString();
const qPatterns = fs.readFileSync(path.join(__dirname, "../sql/routes/route-patterns.sql")).toString();

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