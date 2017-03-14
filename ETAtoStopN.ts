import { DB } from "./repository/db";
import { AnalyticsRepository } from "./repository/analytics.repository";
import { home, qa2014, sql14a } from "./db.config";

function run() {
    const db: DB = new DB(qa2014);
    
    db.Connect()
        .then(() => {
            const repo: AnalyticsRepository = new AnalyticsRepository(db);
            computeETA(repo);
        });
}

function computeETA(repo: AnalyticsRepository) {
    
}