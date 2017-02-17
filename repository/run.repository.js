"use strict";
const SQL = require("mssql");
const fs = require("fs");
const path = require("path");
class RunRepository {
    constructor(db) {
        this.db = db;
    }
    Init() {
        return new Promise((resolve, reject) => {
            fs.readFile(path.join(__dirname, "../sql/runs/runs-actual.sql"), (err, data) => {
                if (err)
                    reject(err);
                else {
                    const q = data.toString();
                    this.db.Prepare(q, { Date: SQL.DateTime })
                        .then(s => { this._runStatement = s; resolve(); })
                        .catch(err => reject(err));
                }
            });
        });
    }
    ListRuns(date) {
        const query = fs.readFileSync(path.join(__dirname, "../sql/runs/runs-actual.sql")).toString();
        return this.db.Query(query, [{ name: "date", type: SQL.DateTime, value: date }]);
    }
    ListRunTrips(date, RunID) {
        const query = fs.readFileSync(path.join(__dirname, "../sql/runs/run-trips.sql")).toString();
        const inputs = [
            { name: "date", type: SQL.DateTime, value: date },
            { name: "RunID", type: SQL.Int, value: RunID }
        ];
        return this.db.Query(query, inputs);
    }
}
exports.RunRepository = RunRepository;
//# sourceMappingURL=run.repository.js.map