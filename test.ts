import * as SQL from "mssql";
import { RequestError } from "mssql";
import { Connection, Request } from "mssql";
import { DB } from "./repository/db";
import { home, qa2014, sql14a } from "./db.config";
import { Helpers } from "./helpers/helpers";
import { GoogleRepository } from "./repository/google.repository";
import { AnalyticsRepository } from "./repository/analytics.repository";
import * as moment from "moment";
import * as fs from "fs";
import * as path from "path";

const numeral = require("numeraljs");

function runTimes(date: moment.Moment) {
    return [
        { start: moment(date).startOf('day').add(4, 'hours').add(30, 'minutes'), end: moment(date).startOf('day').add(11, 'hours') },
        { start: moment(date).startOf('day').add(16, 'hours'), end: moment(date).startOf('day').add(21, 'hours') }
    ];
}

let source: DB;
let target: DB;

let google: GoogleRepository;
let analytics: AnalyticsRepository;

let timeout: any;
let total: number = 0;
let googleSuccessCount = 0;

function KickOff(start: moment.Moment, end: moment.Moment) {
    source = new DB(sql14a);
    target = new DB(qa2014);

    Promise.all([source.Connect(), target.Connect()])
        .then(() => {
            console.log("Connected!");

            google = new GoogleRepository(target);
            analytics = new AnalyticsRepository(source);

            googleDirections(start, end);
        })
        .catch(err => { console.log(err); target.Close(); source.Close(); });
}

function KickOffTest(start: moment.Moment, end: moment.Moment) {
    source = new DB(sql14a);
    target = new DB(home);

    Promise.all([source.Connect(), target.Connect()])
        .then(() => {
            console.log("Connected!");
            const start = moment("2017-03-08 08:00:00").utc(true);

            google = new GoogleRepository(target);
            analytics = new AnalyticsRepository(source);

            googleDirectionsWithWaypoints(start, moment(start).add(10, 'seconds'));
        })
        .catch(err => { console.log(err); target.Close(); source.Close(); });
}

function DMRequest(origin: any, destination: any, QueryID: string, google: GoogleRepository) {
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
                .catch(err => google.SaveError(`Error Saving Google Result: ${err}`))
        })
        .catch(err => google.SaveError(`Error Calling Google: ${err}`, QueryID));
}

function DirectionsRequest(origin: any, destination: any, QueryID: string, waypoints: any[], google: GoogleRepository) {
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
                .catch(err => google.SaveError(`Error Saving Google Result: ${err}`))
        })
        .catch(err => google.SaveError(`Error Calling Google: ${err}`, QueryID));
}

function googleDirections(start: moment.Moment, end: moment.Moment) {
    analytics.GetETACalcs(start)
        .then(data => {
            const results = data;
            //const waypoints = Helpers.GroupArray(data[1], "QueryID");

            //safety net
            // if (results.length > 50) {
            //     console.error("Something went wrong! " + results.length + " results were received!");
            //     process.exit(0);
            // }

            total += results.length;
            console.log(`Memory Used: ${numeral(process.memoryUsage().heapUsed).format("0.00 b")}, [${results.length}]: ${start.format("HH:mm:ss.SSS")}, Total: ${total}, Google: ${googleSuccessCount}`);
            
            results.forEach(d => {
                const origin = { lat: d.OriginLat, lng: d.OriginLng };
                const destination = { lat: d.DestinationLat, lng: d.DestinationLng };
                
                DMRequest(origin, destination, d.QueryID, google);
            });

            const next = moment(Math.max(...results.map(d => moment(d.InsertDateTime).valueOf()), start.valueOf())).utc().add(1, 'millisecond');

            if (next.valueOf() < end.valueOf()) {
                timeout = setTimeout(() => googleDirections(next, end), 5000);
            } else {
                console.log("End Time Reached");
            }
        })
        .catch(err => {
            google.SaveError(`Error Getting ETA Calcs: ${err}`);
            
            //try again - we want to keep going even if some of the results fail
            // start 5 seconds in the future, ignoring what already failed
            const next = moment(start).add(5, 'seconds');
            timeout = setTimeout(() => googleDirections(next, end), 5000);
        });
}

function googleDirectionsWithWaypoints(start: moment.Moment, end: moment.Moment) {
    analytics.GetETACalcsWithLRPoints(start)
        .then(data => {
            const results = data[0];
            const waypoints = Helpers.GroupArray(data[1], "QueryID");

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
            } else {
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

function runETA(times: any[]) {
    times.forEach(span => {
        const waitTime = moment.duration(span.start.diff(moment().utc(true))).asMilliseconds();

        console.log(`Waiting... Running from ${span.start.format()} to ${span.end.format()}`);
        setTimeout(() => KickOff(span.start, span.end), waitTime);
    });
}

//const times = runTimes(moment().utc(true));
//runETA(times);

//runETA([{ start: moment().utc(true).startOf('day').add(4, 'hours'), end: moment().utc(true).startOf('day').add(21, 'hours') }]);

//runETA([{ start: moment().utc(true).startOf('day').add(4, 'hours').add(30, 'minutes'), end: moment().utc(true).startOf('day').add(21, 'hours') }]);

function DoStuffToStuff() {
    console.log(this.color);
}

class Test {
    obj = {
        color: 'blue',
        flavor: 'chocolate'
    }
    
    DoStuff() {
        DoStuffToStuff.call(this.obj);
    }
}

new Test().DoStuff();
