"use strict";
const db_1 = require("./repository/db");
const db_config_1 = require("./db.config");
const google_repository_1 = require("./repository/google.repository");
const analytics_repository_1 = require("./repository/analytics.repository");
const moment = require("moment");
const numeral = require("numeraljs");
const source = new db_1.DB(db_config_1.sql14a);
//const source = new DB(home);
const target = new db_1.DB(db_config_1.qa2014);
let google;
let analytics;
const start = moment().utc(true);
//const start = moment("2017-01-31T06:05:00Z").utc();
//const start = moment("2017-01-31T05:30:00Z");
let current = moment(start);
//const end = moment("2017-01-31T06:10:00Z");
//const end = moment("2017-01-31T05:30:30Z");
let timeout;
let index = 0;
function KickOff() {
    Promise.all([source.Connect(), target.Connect()])
        .then(() => {
        console.log("Connected!");
        google = new google_repository_1.GoogleRepository(target);
        analytics = new analytics_repository_1.AnalyticsRepository(source);
        return googleDirections();
    })
        .catch(err => { console.log(err); target.Close(); source.Close(); });
}
function googleDirections() {
    analytics.GetETACalcs(current)
        .then(data => {
        console.log(`Memory Used: ${numeral(process.memoryUsage().heapUsed).format("0.00 b")}, [${data.length}]: ${current.format("YYYY-MM-DD hh:mm:ss")}`);
        data.forEach(d => {
            const origin = { lat: d.OriginLat, lng: d.OriginLng };
            const destination = { lat: d.DestinationLat, lng: d.DestinationLng };
            google.DistanceMatrixRequest(origin, destination)
                .then(data => google.SaveDMResult(d.QueryID, data))
                .catch(err => google.SaveError(JSON.stringify(err), d.QueryID));
        });
        current = moment(data.map(d => moment(d.ActualDateTime).valueOf()).reduce((a, b) => Math.max(a, b), current.valueOf())).utc();
        timeout = setTimeout(() => googleDirections(), 5000);
        // if (current.valueOf() < end.valueOf()) {
        //     timeout = setTimeout(() => googleDirections(), 5000);
        //     return;
        // }
        // else { //we hit the end time so close everything
        //     clearTimeout(timeout);
        //     source.Close();
        //     target.Close();
        //     return;
        // }
    })
        .catch(err => {
        google.SaveError(err).catch(err => console.log(err));
        console.log("Error Logged");
        //try again - we want to keep going even if some of the results fail
        // start 5 seconds in the future, ignoring what already failed
        current.add(5, 'seconds');
        timeout = setTimeout(() => googleDirections(), 5000);
    });
}
KickOff();
//# sourceMappingURL=test.js.map