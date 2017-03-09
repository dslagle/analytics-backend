"use strict";
const db_1 = require("./repository/db");
const db_config_1 = require("./db.config");
const helpers_1 = require("./helpers/helpers");
const google_repository_1 = require("./repository/google.repository");
const analytics_repository_1 = require("./repository/analytics.repository");
const moment = require("moment");
const numeral = require("numeraljs");
function runTimes(date) {
    return [
        { start: moment(date).startOf('day').add(4, 'hours').add(30, 'minutes'), end: moment(date).startOf('day').add(11, 'hours') },
        { start: moment(date).startOf('day').add(16, 'hours'), end: moment(date).startOf('day').add(21, 'hours') }
    ];
}
let source;
let target;
let google;
let analytics;
let timeout;
let total = 0;
let googleSuccessCount = 0;
function KickOff(start, end) {
    source = new db_1.DB(db_config_1.sql14a);
    target = new db_1.DB(db_config_1.qa2014);
    Promise.all([source.Connect(), target.Connect()])
        .then(() => {
        console.log("Connected!");
        google = new google_repository_1.GoogleRepository(target);
        analytics = new analytics_repository_1.AnalyticsRepository(source);
        googleDirectionsWithWaypoints(start, end);
    })
        .catch(err => { console.log(err); target.Close(); source.Close(); });
}
function KickOffTest(start, end) {
    source = new db_1.DB(db_config_1.sql14a);
    target = new db_1.DB(db_config_1.home);
    Promise.all([source.Connect(), target.Connect()])
        .then(() => {
        console.log("Connected!");
        const start = moment("2017-03-08 08:00:00").utc(true);
        google = new google_repository_1.GoogleRepository(target);
        analytics = new analytics_repository_1.AnalyticsRepository(source);
        googleDirectionsWithWaypoints(start, moment(start).add(10, 'seconds'));
    })
        .catch(err => { console.log(err); target.Close(); source.Close(); });
}
function DMRequest(origin, destination, QueryID, google) {
    google.DistanceMatrixRequest(origin, destination)
        .then(result => {
        if (result.data.status == "OVER_QUERY_LIMIT") {
            //stop processing when we hit the google limit
            clearTimeout(timeout);
            console.log("Reached Google Query Limit");
            google.SaveError("Error calling google: Query limit reached")
                .then((err) => process.exit(0));
        }
        return google.SaveDMResult(QueryID, result.data, result.url)
            .catch(err => google.SaveError(`Error Saving Google Result: ${err}`));
    })
        .catch(err => google.SaveError(`Error Calling Google: ${err}`, QueryID));
}
function DirectionsRequest(origin, destination, QueryID, waypoints, google) {
    google.DirectionsRequest(origin, destination, waypoints)
        .then(data => {
        if (data.status == "OVER_QUERY_LIMIT") {
            //stop processing when we hit the google limit
            clearTimeout(timeout); //this is not gauranteed
            console.log("Reached Google Query Limit");
            google.SaveError("Error calling google: Query limit reached")
                .then((err) => process.exit(0));
        }
        else if (data.status != "OK") {
            google.SaveError("Error calling directions: " + JSON.stringify(data), QueryID);
            return;
        }
        return google.SaveDirectionResult(QueryID, data)
            .catch(err => google.SaveError(`Error Saving Google Result: ${err}`));
    })
        .catch(err => google.SaveError(`Error Calling Google: ${err}`, QueryID));
}
function googleDirectionsWithWaypoints(start, end) {
    analytics.GetETACalcsWithLRPoints(start)
        .then(data => {
        const results = data[0];
        const waypoints = helpers_1.Helpers.GroupArray(data[1], "QueryID");
        //safety net
        if (results.length > 50) {
            console.error("Something went wrong! " + results.length + " results were received!");
            process.exit(0);
        }
        total += results.length;
        console.log(`Memory Used: ${numeral(process.memoryUsage().heapUsed).format("0.00 b")}, [${results.length}]: ${start.format("HH:mm:ss.SSS")}, Total: ${total}, Google: ${googleSuccessCount}`);
        results.forEach(d => {
            const origin = { lat: d.OriginLat, lng: d.OriginLng };
            const destination = { lat: d.DestinationLat, lng: d.DestinationLng };
            DMRequest(origin, destination, d.QueryID, google);
            DirectionsRequest(origin, destination, d.QueryID, waypoints[d.QueryID], google);
        });
        const next = moment(Math.max(...results.map(d => moment(d.InsertDateTime).valueOf()), start.valueOf())).utc().add(1, 'millisecond');
        if (next.valueOf() < end.valueOf()) {
            timeout = setTimeout(() => googleDirectionsWithWaypoints(next, end), 5000);
        }
        else {
            console.log("End Time Reached");
        }
    })
        .catch(err => {
        google.SaveError(`Error Getting ETA Calcs: ${err}`);
        //try again - we want to keep going even if some of the results fail
        // start 5 seconds in the future, ignoring what already failed
        const next = moment(start).add(5, 'seconds');
        timeout = setTimeout(() => googleDirectionsWithWaypoints(next, end), 5000);
    });
}
function runETA(times) {
    times.forEach(span => {
        const waitTime = moment.duration(span.start.diff(moment().utc(true))).asMilliseconds();
        console.log(`Waiting... Running from ${span.start.format("HH:mm:ss")} to ${span.end.format("HH:mm:ss")}`);
        setTimeout(() => KickOff(span.start, span.end), waitTime);
    });
}
const times = runTimes(moment().utc(true));
runETA(times);
//# sourceMappingURL=test.js.map