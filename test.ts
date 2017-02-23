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

const source = new DB(sql14a);
const target = new DB(qa2014);

const test = new DB(home);

// const source = new DB(home);
// const target = new DB(home);

let google: GoogleRepository;
let analytics: AnalyticsRepository;

//const start = moment("2017-01-31T17:00:00Z").utc();
//const start = moment("2017-01-31T05:30:00Z");
//const end = moment("2017-01-31T06:10:00Z");
//const end = moment("2017-01-31T05:30:30Z");

let timeout: any;
let total: number = 0;
let googleSuccessCount = 0;

function KickOff() {
    Promise.all([source.Connect(), target.Connect()])
        .then(() => {
            console.log("Connected!");
            const start = moment().utc(true).add(5, 'hours');
            //const start = moment("2017-01-31T17:00:00Z").utc();
            
            google = new GoogleRepository(target);
            analytics = new AnalyticsRepository(source);

            googleDirections(start);
        })
        //.then(() => { console.log("Done!"); target.Close(); source.Close(); })
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
                    .then(data => { return google.SaveDMResult(d.QueryID, data).catch(err => google.SaveError(`Error Saving Google Result: ${err}`)) })
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

const waitTime = 500;//2*60*60*1000;
const startTime = moment().add(waitTime, 'milliseconds');

console.log("Waiting... Scheduled Start: " + startTime.format("hh:mm:ss"));
setTimeout(KickOff, waitTime);

// const d = moment("2017-02-23T14:00:00.341Z");
// console.log(d.toDate());
// test.Connect()
//     .then(() => test.Query(fs.readFileSync(path.join(__dirname, "sql/VH.sql")).toString(), [{ name: "date", type: SQL.DateTime, value: d.toDate() }]))
//     .then(data => console.log(data));
