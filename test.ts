import * as SQL from "mssql";
import { Connection, Request } from "mssql";
import { Queries } from "./repository/Queries";
import { DB } from "./repository/db";
import { home, qa2014, sql14a } from "./db.config";
import { Helpers } from "./helpers/helpers";
import { GoogleRepository } from "./repository/google.repository";
import { AnalyticsRepository } from "./repository/analytics.repository";
import * as moment from "moment";
import * as fs from "fs";
import * as path from "path";

const source = new DB(sql14a);
const target = new DB(qa2014);

let google: GoogleRepository;
let analytics: AnalyticsRepository;

const start = moment("2017-02-16T05:00:00Z").utc();
//const start = moment("2017-01-31T05:30:00Z");
let current = moment(start);
const end = moment("2017-02-16T09:00:00Z");
//const end = moment("2017-01-31T05:30:30Z");

let timeout: any;
let index: number = 0;

function KickOff() {
    Promise.all([source.Connect(), target.Connect()])
        .then(() => {
            console.log("Connected!");
            
            google = new GoogleRepository(target);
            analytics = new AnalyticsRepository(source);

            return googleDirections();
        })
        .then(() => { console.log("Done!"); target.Close(); source.Close(); })
        .catch(err => { console.log(err); target.Close(); source.Close(); });
}

function googleDirections() {
    return new Promise<any>((resolve, reject) => {
        analytics.GetETACalcs(current)
            .then(data => {
                console.log(`${data.length}: ${current.format()}`);
                if (data.length === 0) {
                    console.log("Still waiting for input - Start Time: " + current.utc().format());
                    timeout = setTimeout(() => googleDirections(), 5000);
                    return;
                }
                
                data.forEach(d => {
                    const origin = { lat: d.OriginLat, lng: d.OriginLng };
                    const destination = { lat: d.DestinationLat, lng: d.DestinationLng };
                    
                    google.DistanceMatrixRequest(origin, destination)
                        .then(data => google.SaveDMResult(d.QueryID, data))
                        .catch(err => google.SaveError(JSON.stringify(err), d.QueryID));
                });

                current = moment(data.map(d => moment(d.ActualDateTime).valueOf()).reduce((a, b) => Math.max(a, b))).utc();
                
                if (current.valueOf() < end.valueOf()) {
                    timeout = setTimeout(() => googleDirections(), 5000);
                }
                else {
                    clearTimeout(timeout);
                    resolve();
                }
            })
            .catch(err => {
                google.SaveError(err).catch(err => console.log(err));
                console.log("Error Logged");
                //try again - we want to keep going even if some of the results fail
                // start 5 seconds in the future, ignoring what already failed
                current.add(5, 'seconds');
                timeout = setTimeout(() => googleDirections(), 5000);
            });
    });
}

//wait 4 1/2 hours before starting
setTimeout(() => KickOff(), 16200000);
