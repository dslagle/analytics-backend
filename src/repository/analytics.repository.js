"use strict";
var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
const db_1 = require("./db");
const helpers_1 = require("../helpers/helpers");
const SQL = require("mssql");
const fs = require("fs");
const path = require("path");
const moment = require("moment");
const qGetETACalcs = fs.readFileSync(path.join(__dirname, "../sql/GetETACalcs.sql")).toString();
const qGetETACalcsWithLRPoints = fs.readFileSync(path.join(__dirname, "../sql/GetETACalcsWithLRPoints.sql")).toString();
const qQueriesForDate = fs.readFileSync(path.join(__dirname, "../sql/queries/GetQueriesForDate.sql")).toString();
const qStopsForQuery = fs.readFileSync(path.join(__dirname, "../sql/queries/GetStopsForQuery.sql")).toString();
const qStopsForQueries = fs.readFileSync(path.join(__dirname, "../sql/queries/GetStopsForQueries.sql")).toString();
const qPatternETAAnalytics = fs.readFileSync(path.join(__dirname, "../sql/routes/route-pattern-eta-analytics.sql")).toString();
const qPatternETAAnalyticsGoogle = fs.readFileSync(path.join(__dirname, "../sql/routes/pattern-analytics-google.sql")).toString();
const qStopETAAnalyticsByPattern = fs.readFileSync(path.join(__dirname, "../sql/routes/stop-eta-analytics-by-pattern.sql")).toString();
const qStopETAAnalyticsByPatternGoogle = fs.readFileSync(path.join(__dirname, "../sql/routes/stop-analytics-google.sql")).toString();
const qGPSForPatternStop = fs.readFileSync(path.join(__dirname, "../sql/routes/gps-for-pattern-stop.sql")).toString();
const qETASummary = fs.readFileSync(path.join(__dirname, "../sql/analytics/analytics-summary.sql")).toString();
class AnalyticsRepository {
    constructor(db) {
        this.db = db;
    }
    GetETACalcs(from) {
        const inputs = [
            { name: "FromDateTime", type: SQL.DateTime, value: from.toDate() }
        ];
        return this.db.Query(qGetETACalcs, inputs);
    }
    GetETACalcsWithLRPoints(from) {
        const inputs = [
            { name: "FromDateTime", type: SQL.DateTime, value: from.toDate() }
        ];
        return this.db.QueryMultiple(qGetETACalcsWithLRPoints, inputs);
    }
    // SaveETAToStopN(data: any) {
    //     const inputs: QueryArg[] = [
    //         { name: "QueryID", type: SQL.VarChar, value: data.QueryID },
    //         { name: "DailyStopID", type: SQL.Int, value: data.DailyStopID },
    //         { name: "ActualTravelTime", type: SQL.Int, value: data.ActualTravelTime },
    //         //{ name: "EstimatedTravelTime", type: SQL.Int, value: data.EstimatedTravelTime },
    //         { name: "ETA", type: SQL.DateTime, value: data.ETA }
    //     ];
    //     return this.db.Query<any>(qSaveETAtoStopN, inputs);
    // }
    SaveETAsToStopN(data) {
        const stops = new SQL.Table("ETA_DATA_Calculations_StopETA");
        stops.columns.add("QueryID", SQL.VarChar, __assign({}, db_1.DB.NotNullable, db_1.DB.PrimaryKey));
        stops.columns.add("DailyStopID", SQL.Int, __assign({}, db_1.DB.NotNullable, db_1.DB.PrimaryKey));
        stops.columns.add("ActualTravelTime", SQL.Int, db_1.DB.Nullable);
        stops.columns.add("ETA", SQL.DateTime, db_1.DB.NotNullable);
        stops.columns.add("EstimatedTravelTime", SQL.Int, db_1.DB.Nullable);
        stops.columns.add("TotalDwellTime", SQL.Int, db_1.DB.Nullable);
        stops.columns.add("TotalWaitTime", SQL.Int, db_1.DB.Nullable);
        data.map(d => stops.rows.add(d.QueryID, d.DailyStopID, d.ActualTravelTime, d.ETA, null, null, null));
        return this.db.BulkInsert(stops);
    }
    StreamStops(date) {
        const inputs = [
            { name: "date", type: SQL.DateTime, value: date.toDate() }
        ];
        return this.db.Query(qGetETACalcs, inputs);
    }
    StreamQueriesForDate(date) {
        const inputs = [
            { name: "date", type: SQL.DateTime, value: date.toDate() }
        ];
        return this.db.Stream(qQueriesForDate, inputs);
    }
    QueriesForDate(date) {
        const inputs = [
            { name: "date", type: SQL.DateTime, value: date.toDate() }
        ];
        return this.db.Query(qQueriesForDate, inputs);
    }
    StopsForQuery(queryID) {
        const inputs = [
            { name: "queryID", type: SQL.VarChar, value: queryID }
        ];
        return this.db.Query(qStopsForQuery, inputs);
    }
    StopsForQueries(queryIDs) {
        const idTable = new SQL.Table();
        idTable.columns.add("ID", SQL.VarChar, db_1.DB.NotNullable);
        queryIDs.map(id => idTable.rows.add(id));
        const inputs = [
            { name: "queryIDs", type: SQL.TVP, value: idTable }
        ];
        //console.log(qStopsForQueries);
        return this.db.Execute("GetStopsForQueries", inputs)
            .then(stops => { return helpers_1.Helpers.GroupArray(stops[0], "QueryID"); });
    }
    ETASummaryForRange(date, threshold, min, max) {
        const inputs = [
            { name: "min", type: SQL.Int, value: 60 * min },
            { name: "max", type: SQL.Int, value: 60 * max },
            { name: "threshold", type: SQL.Int, value: threshold * 60 },
            { name: "Date", type: SQL.DateTime, value: date.toDate() }
        ];
        return this.db.QueryMultiple(qETASummary, inputs)
            .then(data => {
            const answer = {
                routematch: {
                    byStop: __assign({}, data[0][0]),
                    byPoint: __assign({}, data[1][0])
                },
                google: {
                    byStop: __assign({}, data[2][0]),
                    byPoint: __assign({}, data[3][0])
                }
            };
            return Promise.resolve(answer);
        });
    }
    ETASummary(date, threshold) {
        const q1 = this.ETASummaryForRange(date, threshold, 9, 11);
        const q2 = this.ETASummaryForRange(date, threshold, 29, 31);
        return Promise.all([q1, q2])
            .then(results => {
            const margin10 = results[0];
            const margin30 = results[1];
            const answer = {
                10: __assign({}, results[0]),
                30: __assign({}, results[1])
            };
            return Promise.resolve(answer);
        });
    }
    ListETAAnalyticsForRoutePatterns(date, threshold) {
        const inputs = [
            { name: "Date", type: SQL.DateTime, value: date.toDate() },
            { name: "Threshold", type: SQL.Int, value: threshold }
        ];
        return this.db.Query(qPatternETAAnalyticsGoogle, inputs);
    }
    ListETAAnalyticsForRoutePattern(date, threshold, id) {
        const inputs = [
            { name: "Date", type: SQL.DateTime, value: date.toDate() },
            { name: "Threshold", type: SQL.Int, value: threshold },
            { name: "SubrouteID", type: SQL.Int, value: id }
        ];
        return this.db.Query(qStopETAAnalyticsByPatternGoogle, inputs);
    }
    ListGPSForPatternStop(date, id) {
        const inputs = [
            { name: "Date", type: SQL.DateTime, value: date.toDate() },
            { name: "SRID", type: SQL.Int, value: id }
        ];
        return this.db.QueryMultiple(qGPSForPatternStop, inputs);
    }
}
__decorate([
    helpers_1.Helpers.memoize(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number, Number, Number]),
    __metadata("design:returntype", Promise)
], AnalyticsRepository.prototype, "ETASummaryForRange", null);
__decorate([
    helpers_1.Helpers.memoize(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number]),
    __metadata("design:returntype", Promise)
], AnalyticsRepository.prototype, "ETASummary", null);
__decorate([
    helpers_1.Helpers.memoize(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number]),
    __metadata("design:returntype", Promise)
], AnalyticsRepository.prototype, "ListETAAnalyticsForRoutePatterns", null);
__decorate([
    helpers_1.Helpers.memoize(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number, Number]),
    __metadata("design:returntype", Promise)
], AnalyticsRepository.prototype, "ListETAAnalyticsForRoutePattern", null);
exports.AnalyticsRepository = AnalyticsRepository;
//# sourceMappingURL=analytics.repository.js.map