import * as SQL from "mssql";
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
const heap = require("heapdump");

//const source = new DB(sql14a);
const source = new DB(home);
const target = new DB(home);

let google: GoogleRepository;
let analytics: AnalyticsRepository;

const start = moment().utc(true);
//const start = moment("2017-01-31T17:00:00Z").utc();
//const start = moment("2017-01-31T05:30:00Z");
let current = moment(start);
//const end = moment("2017-01-31T06:10:00Z");
//const end = moment("2017-01-31T05:30:30Z");

let timeout: any;
let index: number = 59;

function KickOff() {
    Promise.all([source.Connect(), target.Connect()])
        .then(() => {
            console.log("Connected!");
            
            google = new GoogleRepository(target);
            analytics = new AnalyticsRepository(source);

            return googleDirections();
        })
        //.then(() => { console.log("Done!"); target.Close(); source.Close(); })
        .catch(err => { console.log(err); target.Close(); source.Close(); });
}

function googleDirections() {
    analytics.GetETACalcs(current)
        .then(data => {
            
            console.log(`Memory Used: ${numeral(process.memoryUsage().heapUsed).format("0.00 b")}, [${data.length}]: ${current.format("YYYY-MM-DD hh:mm:ss")}`);
            
            //roughly every 5 minutes based on timeout of 5s for each iteration
            // if (++index % 12 === 0) {
            //     heap.writeSnapshot();
            // }

            data.forEach(d => {
                const origin = { lat: d.OriginLat, lng: d.OriginLng };
                const destination = { lat: d.DestinationLat, lng: d.DestinationLng };
                
                google.DistanceMatrixRequest(origin, destination)
                    .then(data => google.SaveDMResult(d.QueryID, data))
                    .catch(err => google.SaveError(err, d.QueryID));
            });

            current = moment(data.map(d => moment(d.ActualDateTime).valueOf()).reduce((a, b) => Math.max(a, b), current.valueOf())).utc();

            timeout = setTimeout(googleDirections, 3000);

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

//KickOff();


function memoize(keyGen: (args: any[]) => string = (args) => args.reduce((a1, a2) => `${a1},${a2}`)) {
    return function(target: any, key: string, descriptor: any) {
        const store: any = {};
        return {
            value: function (...args: any[]) {
                const key = keyGen(args);

                if (store[key]) {
                    console.log("Memoized!");
                    return store[key];
                }

                const result = descriptor.value.call(this, ...args);
                store[key] = result;
                return result;
            }
        };
    };
}

class Test {
    @memoize()
    test(first, second) {
        return `${first}, ${second}`;
    }
}

const t = new Test();

console.log(t.test("one", "two"));
console.log(t.test("three", "four"));
console.log(t.test("one", "two"));
