"use strict";
const db_1 = require("./repository/db");
const analytics_repository_1 = require("./repository/analytics.repository");
const db_config_1 = require("./db.config");
const moment = require("moment");
const co = require("co");
const terminal_kit_1 = require("terminal-kit");
let queriesProcessed = 0;
class TaskQueue {
    constructor(limit) {
        this._running = 0;
        this._tasks = [];
        this._consumers = [];
        this._limit = 1;
        this._limit = limit;
        this.SpawnWorkers(limit);
    }
    SpawnWorkers(limit) {
        const self = this;
        for (let i = 0; i < limit; i++) {
            co(function* () {
                while (true) {
                    const task = yield self.NextTask();
                    yield task;
                }
            });
        }
    }
    NextTask() {
        return (cb) => {
            if (this._tasks.length !== 0)
                cb(null, this._tasks.shift());
            else
                this._consumers.push(cb);
        };
    }
    PushTask(task) {
        if (this._consumers.length !== 0)
            this._consumers.shift()(null, task);
        else
            this._tasks.push(task);
    }
}
function run() {
    const db = new db_1.DB(db_config_1.qa2014);
    db.Connect()
        .then(() => {
        const repo = new analytics_repository_1.AnalyticsRepository(db);
        co(computeETA(moment("2017-02-22").utc(true), repo, () => db.Close()));
    });
}
function createProcessQueriesTask(buffer, repo) {
    return function* () {
        yield processQueries(buffer, repo);
    };
}
function* computeETA(date, repo, cb) {
    const tq = new TaskQueue(4);
    const queryStream = repo.StreamQueriesForDate(date);
    terminal_kit_1.terminal('Processed: ').saveCursor().green.bold(`${queriesProcessed}\n`);
    console.time("Total Time");
    let buffer = [];
    let bufferLimit = 100;
    let count = 0;
    queryStream.on('row', (row) => {
        count += 1;
        buffer.push(row);
        if (buffer.length === bufferLimit) {
            tq.PushTask(createProcessQueriesTask(buffer, repo));
            buffer = [];
        }
    });
    queryStream.on('done', (affected) => {
        //process any work remaining in the buffer since there is no more work to complete
        if (buffer.length > 0) {
            tq.PushTask(createProcessQueriesTask(buffer, repo));
            buffer = [];
        }
        tq.PushTask(function* () {
            const iv = setInterval(() => {
                //when all workers of the queue are idle
                if (tq._consumers.length === tq._limit) {
                    clearInterval(iv);
                    cb();
                    terminal_kit_1.terminal.restoreCursor().green.bold(`${queriesProcessed} `);
                    terminal_kit_1.terminal.blue.bold('Done!\n');
                    console.timeEnd("Total Time");
                }
            }, 200);
        });
    });
}
function* processQueries(queries, repo) {
    const stopsByQuery = yield repo.StopsForQueries(queries.map(q => q.QueryID));
    const rows = [];
    for (let i = 0; i < queries.length; i++) {
        const query = queries[i];
        const stops = stopsByQuery[query.QueryID]
            ? stopsByQuery[query.QueryID].sort((a, b) => a.StopOrder <= b.StopOrder ? -1 : 1)
            : [];
        rows.push(...processStopsForQueries({ stops, query }));
        queriesProcessed += 1;
    }
    yield repo.SaveETAsToStopN(rows);
    terminal_kit_1.terminal.restoreCursor().green.bold(`${queriesProcessed} `);
}
function processStopsForQueries(data) {
    let stops = data.stops;
    let query = data.query;
    let currentETA = moment(query.ETA).utc();
    let nextDepartByDwell = moment(currentETA).add(60, 'seconds');
    let nextDepartByTimePoint = moment(query.ScheduledDateTime).utc();
    let totalDwellTime = 0;
    let processed = [];
    let nextDepart = query.StopType == 1
        ? nextDepartByDwell
        : moment(Math.max(nextDepartByTimePoint.valueOf(), nextDepartByDwell.valueOf())).utc();
    processed.push({
        QueryID: query.QueryID,
        DailyStopID: query.DailyStopID,
        ActualTravelTime: query.ActualTravelTime,
        ETA: currentETA.toDate()
    });
    for (let i = 0; i < stops.length; i++) {
        const s = stops[i];
        currentETA = moment(nextDepart)
            .add(s.TravelTimeFromLastStop, 'seconds');
        nextDepartByDwell = moment(currentETA).add(60, 'seconds');
        nextDepartByTimePoint = moment(s.ScheduledDateTime).utc();
        nextDepart = s.StopType == 1
            ? nextDepartByDwell
            : moment(Math.max(nextDepartByTimePoint.valueOf(), nextDepartByDwell.valueOf())).utc();
        processed.push({
            QueryID: query.QueryID,
            DailyStopID: s.DailyStopID,
            ActualTravelTime: s.ActualTravelTime,
            ETA: currentETA.toDate()
        });
    }
    ;
    return processed;
}
run();
//# sourceMappingURL=ETAToStopN.js.map