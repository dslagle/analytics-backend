"use strict";
const SQL = require("mssql");
const fs = require("fs");
const path = require("path");
const qGetETACalcs = fs.readFileSync(path.join(__dirname, "../sql/GetETACalcs.sql")).toString();
class AnalyticsRepository {
    constructor(db) {
        this.db = db;
    }
    GetETACalcs(from) {
        console.log(from.toDate());
        const inputs = [
            { name: "FromDateTime", type: SQL.DateTime, value: from.toDate() }
        ];
        return this.db.Query(qGetETACalcs, inputs);
    }
}
exports.AnalyticsRepository = AnalyticsRepository;
//# sourceMappingURL=analytics.repository.js.map