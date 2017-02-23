"use strict";
const db_1 = require("./repository/db");
const db_config_1 = require("./db.config");
const google_repository_1 = require("./repository/google.repository");
const analytics_repository_1 = require("./repository/analytics.repository");
const moment = require("moment");
const numeral = require("numeraljs");
const source = new db_1.DB(db_config_1.sql14a);
const target = new db_1.DB(db_config_1.qa2014);
const test = new db_1.DB(db_config_1.home);
// const source = new DB(home);
// const target = new DB(home);
let google;
let analytics;
//const start = moment("2017-01-31T17:00:00Z").utc();
//const start = moment("2017-01-31T05:30:00Z");
//const end = moment("2017-01-31T06:10:00Z");
//const end = moment("2017-01-31T05:30:30Z");
let timeout;
let total = 0;
let googleSuccessCount = 0;
function KickOff() {
    Promise.all([source.Connect(), target.Connect()])
        .then(() => {
        console.log("Connected!");
        const start = moment().utc(true).add(5, 'hours');
        //const start = moment("2017-01-31T17:00:00Z").utc();
        google = new google_repository_1.GoogleRepository(target);
        analytics = new analytics_repository_1.AnalyticsRepository(source);
        googleDirections(start);
    })
        .catch(err => { console.log(err); target.Close(); source.Close(); });
}
function googleDirections(time) {
    analytics.GetETACalcs(time)
        .then(data => {
        total += data.length;
        console.log(`Memory Used: ${numeral(process.memoryUsage().heapUsed).format("0.00 b")}, [${data.length}]: ${time.format("HH:mm:ss.SSS")}, Total: ${total}, Google: ${googleSuccessCount}`);
        data.forEach(d => {
            const origin = { lat: d.OriginLat, lng: d.OriginLng };
            const destination = { lat: d.DestinationLat, lng: d.DestinationLng };
            google.DistanceMatrixRequest(origin, destination)
                .then(data => { return google.SaveDMResult(d.QueryID, data).catch(err => google.SaveError(`Error Saving Google Result: ${err}`)); })
                .then(() => googleSuccessCount += 1)
                .catch(err => google.SaveError(`Error Calling Google: ${err}`, d.QueryID));
        });
        const next = moment(Math.max(...data.map(d => moment(d.InsertDateTime).valueOf()), time.valueOf())).utc().add(1, 'millisecond');
        timeout = setTimeout(() => googleDirections(next), 5000);
    })
        .catch(err => {
        google.SaveError(`Error Getting ETA Calcs: ${err}`).catch(err => console.log(err));
        console.log("Error Logged");
        //try again - we want to keep going even if some of the results fail
        // start 5 seconds in the future, ignoring what already failed
        const next = moment(time).add(5, 'seconds');
        timeout = setTimeout(() => googleDirections(next), 5000);
    });
}
const waitTime = 500; //2*60*60*1000;
const startTime = moment().add(waitTime, 'milliseconds');
console.log("Waiting... Scheduled Start: " + startTime.format("hh:mm:ss"));
setTimeout(KickOff, waitTime);
// const d = moment("2017-02-23T14:00:00.341Z");
// console.log(d.toDate());
// test.Connect()
//     .then(() => test.Query(fs.readFileSync(path.join(__dirname, "sql/VH.sql")).toString(), [{ name: "date", type: SQL.DateTime, value: d.toDate() }]))
//     .then(data => console.log(data));
//# sourceMappingURL=test.js.map