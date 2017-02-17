"use strict";
const SQL = require("mssql");
const fs = require("fs");
const path = require("path");
const qGetETACalcs = fs.readFileSync(path.join(__dirname, "../sql/GetETACalcs.sql")).toString();
const qPatternETAAnalytics = fs.readFileSync(path.join(__dirname, "../sql/routes/route-pattern-eta-analytics.sql")).toString();
const qStopETAAnalyticsByPattern = fs.readFileSync(path.join(__dirname, "../sql/routes/stop-eta-analytics-by-pattern.sql")).toString();
const qGPSForPatternStop = fs.readFileSync(path.join(__dirname, "../sql/routes/gps-for-pattern-stop.sql")).toString();
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
    ListETAAnalyticsForRoutePatterns(date, threshold) {
        const inputs = [
            { name: "Date", type: SQL.DateTime, value: date.toDate() },
            { name: "Threshold", type: SQL.Int, value: threshold }
        ];
        return this.db.Query(qPatternETAAnalytics, inputs);
    }
    ListETAAnalyticsForRoutePattern(date, threshold, id) {
        const inputs = [
            { name: "Date", type: SQL.DateTime, value: date.toDate() },
            { name: "Threshold", type: SQL.Int, value: threshold },
            { name: "SubrouteID", type: SQL.Int, value: id }
        ];
        return this.db.Query(qStopETAAnalyticsByPattern, inputs);
    }
    ListGPSForPatternStop(date, id) {
        const inputs = [
            { name: "Date", type: SQL.DateTime, value: date.toDate() },
            { name: "SRID", type: SQL.Int, value: id }
        ];
        return this.db.QueryMultiple(qGPSForPatternStop, inputs);
    }
}
exports.AnalyticsRepository = AnalyticsRepository;
//# sourceMappingURL=analytics.repository.js.map