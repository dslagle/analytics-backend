"use strict";
const db_1 = require("./repository/db");
const analytics_repository_1 = require("./repository/analytics.repository");
const db_config_1 = require("./db.config");
function run() {
    const db = new db_1.DB(db_config_1.qa2014);
    db.Connect()
        .then(() => {
        const repo = new analytics_repository_1.AnalyticsRepository(db);
        computeETA(repo);
    });
}
function computeETA(repo) {
}
//# sourceMappingURL=ETAtoStopN.js.map