"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
const db_1 = require("./repository/db");
const db_config_1 = require("./db.config");
const google_repository_1 = require("./repository/google.repository");
const analytics_repository_1 = require("./repository/analytics.repository");
const moment = require("moment");
const numeral = require("numeraljs");
const heap = require("heapdump");
//const source = new DB(sql14a);
const source = new db_1.DB(db_config_1.home);
const target = new db_1.DB(db_config_1.home);
let google;
let analytics;
const start = moment().utc(true);
//const start = moment("2017-01-31T17:00:00Z").utc();
//const start = moment("2017-01-31T05:30:00Z");
let current = moment(start);
//const end = moment("2017-01-31T06:10:00Z");
//const end = moment("2017-01-31T05:30:30Z");
let timeout;
let index = 59;
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
function memoize(keyGen = (args) => args.reduce((a1, a2) => `${a1},${a2}`)) {
    return function (target, key, descriptor) {
        const store = {};
        return {
            value: function (...args) {
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
    test(first, second) {
        return `${first}, ${second}`;
    }
}
__decorate([
    memoize(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], Test.prototype, "test", null);
const t = new Test();
console.log(t.test("one", "two"));
console.log(t.test("three", "four"));
console.log(t.test("one", "two"));
//# sourceMappingURL=test.js.map