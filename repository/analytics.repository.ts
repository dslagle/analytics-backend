import { DB, QueryArg } from "./db";
import { Helpers } from "../helpers/helpers";
import * as SQL from "mssql";
import * as fs from "fs";
import * as path from "path";
import * as moment from "moment";

const qGetETACalcs: string = fs.readFileSync(path.join(__dirname, "../sql/GetETACalcs.sql")).toString();
const qPatternETAAnalytics = fs.readFileSync(path.join(__dirname, "../sql/routes/route-pattern-eta-analytics.sql")).toString();
const qPatternETAAnalyticsGoogle = fs.readFileSync(path.join(__dirname, "../sql/routes/pattern-analytics-google.sql")).toString();
const qStopETAAnalyticsByPattern = fs.readFileSync(path.join(__dirname, "../sql/routes/stop-eta-analytics-by-pattern.sql")).toString();
const qStopETAAnalyticsByPatternGoogle = fs.readFileSync(path.join(__dirname, "../sql/routes/stop-analytics-google.sql")).toString();
const qGPSForPatternStop = fs.readFileSync(path.join(__dirname, "../sql/routes/gps-for-pattern-stop.sql")).toString();
const qETASummary = fs.readFileSync(path.join(__dirname, "../sql/analytics/analytics-summary.sql")).toString();

export class AnalyticsRepository {
    constructor(private db: DB) { }

    GetETACalcs(from: moment.Moment): Promise<any[]> {
        const inputs: QueryArg[] = [
            { name: "FromDateTime", type: SQL.DateTime, value: from.toDate() }
        ];

        return this.db.Query(qGetETACalcs, inputs);
    }

    @Helpers.memoize()
    ETASummaryForRange(date: moment.Moment, threshold: number, min: number, max: number) : Promise<any> {
        const inputs: QueryArg[] = [
            { name: "min", type: SQL.Int, value: 60*min },
            { name: "max", type: SQL.Int, value: 60*max },
            { name: "threshold", type: SQL.Int, value: threshold*60 },
            { name: "Date", type: SQL.DateTime, value: date.toDate() }
        ];

        return this.db.QueryMultiple(qETASummary, inputs)
            .then(data => {
                const answer = {
                    routematch: {
                        byStop: {
                            ...data[0][0]
                        },
                        byPoint: {
                            ...data[1][0]
                        }
                    },
                    google: {
                        byStop: {
                            ...data[2][0]
                        },
                        byPoint: {
                            ...data[3][0]
                        }
                    }
                };

                return Promise.resolve(answer);
            })
    }

    @Helpers.memoize()
    ETASummary(date: moment.Moment, threshold: number): Promise<any> {
        const q1 = this.ETASummaryForRange(date, threshold, 9, 11);
        const q2 = this.ETASummaryForRange(date, threshold, 29, 31);

        return Promise.all([q1, q2])
            .then(results => {
                const margin10 = results[0];
                const margin30 = results[1];

                const answer = {
                    10: { ...results[0] },
                    30: { ...results[1] }
                };

                return Promise.resolve(answer);
            });
    }

    @Helpers.memoize()
    ListETAAnalyticsForRoutePatterns(date: moment.Moment, threshold: number): Promise<any> {
        const inputs: QueryArg[] = [
            { name: "Date", type: SQL.DateTime, value: date.toDate() },
            { name: "Threshold", type: SQL.Int, value: threshold }
        ];

        return this.db.Query(qPatternETAAnalyticsGoogle, inputs);
    }

    @Helpers.memoize()
    ListETAAnalyticsForRoutePattern(date: moment.Moment, threshold: number, id: number): Promise<any> {
        const inputs: QueryArg[] = [
            { name: "Date", type: SQL.DateTime, value: date.toDate() },
            { name: "Threshold", type: SQL.Int, value: threshold },
            { name: "SubrouteID", type: SQL.Int, value: id }
        ];

        return this.db.Query(qStopETAAnalyticsByPatternGoogle, inputs);
    }

    ListGPSForPatternStop(date: moment.Moment, id: number): Promise<any> {
        const inputs: QueryArg[] = [
            { name: "Date", type: SQL.DateTime, value: date.toDate() },
            { name: "SRID", type: SQL.Int, value: id }
        ];

        return this.db.QueryMultiple(qGPSForPatternStop, inputs);
    }
}