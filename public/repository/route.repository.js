"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
const SQL = require("mssql");
const helpers_1 = require("../helpers/helpers");
const fs = require("fs");
const path = require("path");
const moment = require("moment");
const qPatternsForRoute = fs.readFileSync(path.join(__dirname, "../sql/routes/route-patterns-for-route.sql")).toString();
const qRoutes = fs.readFileSync(path.join(__dirname, "../sql/routes/routes.sql")).toString();
const qPatterns = fs.readFileSync(path.join(__dirname, "../sql/routes/route-patterns.sql")).toString();
const qMissedStopsCount = fs.readFileSync(path.join(__dirname, "../sql/stops/missed-stop-count.sql")).toString();
const qMissedStopsForDate = fs.readFileSync(path.join(__dirname, "../sql/stops/missed-stops-for-date.sql")).toString();
const qMissedStopDetails = fs.readFileSync(path.join(__dirname, "../sql/stops/missed-stop-details.sql")).toString();
const qMissedStopSummaryForDate = fs.readFileSync(path.join(__dirname, "../sql/stops/missed-info-for-date.sql")).toString();
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
    MissedStopCount(start, end) {
        const inputs = [
            { name: "start", type: SQL.DateTime, value: start.toDate() },
            { name: "end", type: SQL.DateTime, value: end.toDate() }
        ];
        return this.db.Query(qMissedStopsCount, inputs);
    }
    MissedStopsForDate(date) {
        const inputs = [
            { name: "date", type: SQL.DateTime, value: date.toDate() }
        ];
        return this.db.Query(qMissedStopsForDate, inputs)
            .then(data => {
            const srs = helpers_1.Helpers.GroupArray(data, "Subroute");
            for (const key in srs) {
                srs[key] = helpers_1.Helpers.GroupArray(srs[key], "Trip");
            }
            return Promise.resolve(srs);
        });
    }
    MissedStopSummaryForDate(date) {
        const inputs = [
            { name: "date", type: SQL.DateTime, value: date.toDate() }
        ];
        return this.db.Query(qMissedStopSummaryForDate, inputs)
            .then(d => { return d[0]; });
    }
    MissedStopDetails(date, dailyStopID) {
        console.log(date.toDate());
        const inputs = [
            { name: "date", type: SQL.DateTime, value: date.toDate() },
            { name: "DailyStopID", type: SQL.Int, value: dailyStopID }
        ];
        return this.db.Query(qMissedStopDetails, inputs);
    }
}
__decorate([
    helpers_1.Helpers.memoize(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], RouteRepository.prototype, "MissedStopCount", null);
__decorate([
    helpers_1.Helpers.memoize(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], RouteRepository.prototype, "MissedStopsForDate", null);
__decorate([
    helpers_1.Helpers.memoize(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], RouteRepository.prototype, "MissedStopSummaryForDate", null);
exports.RouteRepository = RouteRepository;
