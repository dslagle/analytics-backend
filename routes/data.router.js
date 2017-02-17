"use strict";
const express_1 = require("express");
const db_1 = require("../repository/db");
const db_config_1 = require("../db.config");
const helpers_1 = require("../helpers/helpers");
const vehicle_repository_1 = require("../repository/vehicle.repository");
const analytics_repository_1 = require("../repository/analytics.repository");
const run_repository_1 = require("../repository/run.repository");
const route_repository_1 = require("../repository/route.repository");
const moment = require("moment");
//import { googleDirections } from "../test";
const apiKey = "AIzaSyA3PCYWq3Dj7YpI2xlimqVxGi8igFmsPbs";
const router = express_1.Router();
const db = new db_1.DB(db_config_1.primary);
let vehicleRepo;
let runRepo;
let routeRepo;
let analyticsRepo;
let model;
let data;
let server;
init();
function init() {
    const dbAnalytics = new db_1.DB(db_config_1.qa2014);
    const db = new db_1.DB(db_config_1.home);
    // server.on("connect", (socket) => {
    //     console.log("Connected!");
    //     socket.on("disconnect", () => {
    //         console.log("Disconnected!");
    //     });
    // });
    Promise.all([db.Connect(), dbAnalytics.Connect()])
        .then(() => {
        console.log("Connected to RM");
        vehicleRepo = new vehicle_repository_1.VehicleRepository(db);
        runRepo = new run_repository_1.RunRepository(db);
        routeRepo = new route_repository_1.RouteRepository(db);
        analyticsRepo = new analytics_repository_1.AnalyticsRepository(dbAnalytics);
        // vehicleRepo.GetAllVehicleGPS().then(d => {
        //     server.emit("updateGPS");
        // });
        //getData();
        //setInterval(() => getData(), 10000);
    })
        .catch(err => console.log(err));
}
function RMDateNow() {
    return RMDate(Date.now());
}
function RMDate(date) {
    const d = new Date(date);
    return new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
}
/*
function getData(): void {
    let ids = new SQL.Table("");
    ids.columns.add("id", SQL.Int, { });

    let request = new Request(c);
    request.input("ContextStr", "");
    request.input("Date", SQL.DateTime, new Date("2017-01-25"));
    request.input("SubrouteIDs", SQL.TVP, ids);

    request.execute('spFRGetHeadwayInformation')
        .then((d) => {
                model = new Model(d);
                router.unsubscribe("/trips");
                router.use("/trips", TripRouter(model));
        })
        .catch((err) => {
            console.error(err);
            throw err;
        });
}
*/
router.get("/", function (request, response) {
    response.json(model);
});
// router.get("/google", function(request, response) {
//     googleDirections()
//         .then(data => response.json(data))
//         .catch(err => response.json({ error: err }));
// });
router.get("/vehicle", function (request, response) {
    vehicleRepo.ListVehicles()
        .then(list => {
        response.json(list);
    })
        .catch(err => response.status(404).json({ error: err }));
});
router.get("/stops", function (request, response) {
    routeRepo.ListStops(RMDateNow())
        .then(list => {
        response.json(list);
    })
        .catch(err => response.status(404).json({ error: err }));
});
router.get("/vehicles/gps", function (request, response) {
    vehicleRepo.GetAllVehicleGPS()
        .then(list => {
        response.json(list);
    })
        .catch(err => response.status(404).json({ error: err }));
});
router.get("/vehicle/:id/gps", function (request, response) {
    vehicleRepo.GetVehicleGPS(request.params.id)
        .then(data => {
        response.json({
            VehicleID: data.VehicleID,
            OriginDateTime: data.ActualTime,
            Origin: { Latitude: data.x, Longitude: data.y },
            Destination: { Latitude: data.Latitude, Longitude: data.Longitude },
            DestinationStopName: data.Name,
            DestinationETA: data.ETA
        });
    })
        .catch(err => response.status(404).json({ error: err }));
});
// router.get("/travelinfo/:vid", function(request, response) {
//     model.
// });
router.get("/address", function (request, response) {
    response.json(model.Addresses);
});
router.get("/runs", function (request, response) {
    runRepo.ListRuns(RMDateNow())
        .then(runs => response.json(runs))
        .catch(err => response.status(501).json({ error: err }));
});
router.get("/runs/:id/trips", function (request, response) {
    runRepo.ListRunTrips(RMDateNow(), +request.params.id)
        .then(runs => response.json(runs))
        .catch(err => response.status(501).json({ error: err }));
});
router.get("/vehicle/:id/runs", function (request, response) {
    const vid = +request.params.id;
    response.json(helpers_1.Helpers.ObjectToArray(model.Runs).filter(r => r.VehicleID === vid));
});
router.get("/outoforder/:date", function (request, response) {
    const date = moment(+request.params.date);
    routeRepo.ActualsProblems(date)
        .then(routes => response.json(routes))
        .catch(err => response.status(501).json({ error: err }));
});
router.get("/problemcounts/:sdate/:edate", function (request, response) {
    const sdate = moment(+request.params.sdate).utc(true);
    const edate = moment(+request.params.edate).utc(true);
    routeRepo.ActualsProblemsCount(sdate, edate)
        .then(routes => {
        // response.json({
        //     [sdate.format("YYYY-MM-DD")]: { ...Helpers.ArrayToObject(routes, "CalendarDate", k => moment(k).utc().format("YYYY-MM-DD")) }
        // });
        response.json(helpers_1.Helpers.ArrayToObject(routes, "CalendarDate", k => moment(k).utc().format("YYYY-MM-DD")));
    })
        .catch(err => response.status(501).json({ error: err }));
});
router.get("/routes/:date", function (request, response) {
    routeRepo.ListRoutes(moment(+request.params.date).utc())
        .then(routes => response.json(routes))
        .catch(err => response.status(501).json({ error: err }));
});
router.get("/routes/:date/:id/patterns", function (request, response) {
    routeRepo.ListRoutePatternsForRoute(moment(+request.params.date).utc(), +request.params.id)
        .then(data => response.json(data))
        .catch(err => response.status(501).json({ error: err }));
});
router.get("/analytics/eta/patterns", function (request, response) {
    const date = request.query.date ? moment(+request.query.date).utc() : moment().startOf('day').utc(true);
    const threshold = +request.query.threshold || 5;
    analyticsRepo.ListETAAnalyticsForRoutePatterns(date, threshold)
        .then(data => response.json(data))
        .catch(err => response.status(501).json({ error: err }));
});
router.get("/analytics/eta/patterns/stops/:id", function (request, response) {
    const date = request.query.date ? moment(+request.query.date).utc() : moment().startOf('day').utc(true);
    const id = +request.params.id;
    analyticsRepo.ListGPSForPatternStop(date, id)
        .then(data => response.json({ stops: data[0], trips: data[1], gps: helpers_1.Helpers.GroupArray(data[2], '') }))
        .catch(err => response.status(501).json({ error: err }));
});
router.get("/analytics/eta/patterns/:id", function (request, response) {
    const id = +request.params.id;
    const date = request.query.date ? moment(+request.query.date).utc() : moment().startOf('day').utc(true);
    const threshold = +request.query.threshold || 5;
    analyticsRepo.ListETAAnalyticsForRoutePattern(date, threshold, id)
        .then(data => response.json(data))
        .catch(err => response.status(501).json({ error: err }));
});
router.get("/patterns", function (request, response) {
    routeRepo.ListRoutePatterns(RMDateNow())
        .then(data => response.json(data))
        .catch(err => response.status(501).json({ error: err }));
});
router.get("/routes/:id/addresses", function (request, response) {
    let subrouteID = request.params.id;
    let value = helpers_1.Helpers.ObjectToArray(model.SubrouteStops)
        .filter((sss) => sss.SubrouteID == subrouteID)
        .map((sss) => model.Stops[sss.StopID])
        .map((s) => model.Addresses[s.AddressID]);
    response.json(value);
});
exports.DataRouter = (sio) => { server = sio; return router; };
//# sourceMappingURL=data.router.js.map