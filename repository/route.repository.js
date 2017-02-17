"use strict";
const SQL = require("mssql");
const fs = require("fs");
const path = require("path");
const qPatternsForRoute = fs.readFileSync(path.join(__dirname, "../sql/routes/route-patterns-for-route.sql")).toString();
const qRoutes = fs.readFileSync(path.join(__dirname, "../sql/routes/routes.sql")).toString();
const qPatterns = fs.readFileSync(path.join(__dirname, "../sql/routes/route-patterns.sql")).toString();
const qPatternETAAnalytics = fs.readFileSync(path.join(__dirname, "../sql/routes/route-pattern-eta-analytics.sql")).toString();
const qStopETAAnalyticsByPattern = fs.readFileSync(path.join(__dirname, "../sql/routes/stop-eta-analytics-by-pattern.sql")).toString();
const qGPSForPatternStop = fs.readFileSync(path.join(__dirname, "../sql/routes/gps-for-pattern-stop.sql")).toString();
class RouteRepository {
    constructor(db) {
        this.db = db;
    }
    ListRoutes(date) {
        return this.db.Query(qRoutes, [{ name: "Date", type: SQL.DateTime, value: date.toDate() }]);
    }
    ListRoutePatterns(date) {
        return this.db.Query(qPatterns, [{ name: "Date", type: SQL.DateTime, value: date }]);
    }
    ListRoutePatternsForRoute(date, masterRotueID) {
        const inputs = [
            { name: "Date", type: SQL.DateTime, value: date.toDate() },
            { name: "MasterRouteID", type: SQL.Int, value: masterRotueID }
        ];
        return this.db.Query(qPatternsForRoute, inputs);
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
    ListStops(date) {
        const query = fs.readFileSync(path.join(__dirname, "../sql/stops/actual.sql")).toString();
        const inputs = [
            { name: "date", type: SQL.DateTime, value: date }
        ];
        return this.db.Query(query);
    }
    ActualsProblems(date) {
        const query = fs.readFileSync(path.join(__dirname, "../sql/OutOfOrderActuals.sql")).toString();
        const inputs = [
            { name: "date", type: SQL.DateTime, value: date.toDate() }
        ];
        return this.db.Query(query, inputs);
    }
    ActualsProblemsCount(sdate, edate) {
        const query = fs.readFileSync(path.join(__dirname, "../sql/ProblemCounts.sql")).toString();
        const inputs = [
            { name: "sdate", type: SQL.DateTime, value: sdate.toDate() },
            { name: "edate", type: SQL.DateTime, value: edate.toDate() }
        ];
        return this.db.Query(query, inputs);
    }
}
exports.RouteRepository = RouteRepository;
//# sourceMappingURL=route.repository.js.map