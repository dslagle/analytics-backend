"use strict";
const express_1 = require("express");
const vehicle_repository_1 = require("../repository/vehicle.repository");
const db_1 = require("../repository/db");
const db_config_1 = require("../db.config");
const helpers_1 = require("../helpers/helpers");
const apiKey = "AIzaSyA3PCYWq3Dj7YpI2xlimqVxGi8igFmsPbs";
const router = express_1.Router();
const db = new db_1.DB(db_config_1.primary);
let vehicleRepo;
let model;
init();
function init() {
    const db = new db_1.DB(db_config_1.primary);
    db.Connect()
        .then(() => {
        console.log("Connected to RM");
        vehicleRepo = new vehicle_repository_1.VehicleRepository(db);
        //getData();
        //setInterval(() => getData(), 10000);
    })
        .catch(err => console.log(err));
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
router.get("/vehicle", function (request, response) {
    vehicleRepo.ListVehicles()
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
    response.json(helpers_1.Helpers.ObjectToArray(model.Runs).filter(r => r.VehicleID && r.Started && !r.Completed));
});
router.get("/runs/:id/trips", function (request, response) {
    response.json(helpers_1.Helpers.ObjectToArray(model.Trips).filter(t => t.RunID === +request.params.id));
});
router.get("/vehicle/:id/runs", function (request, response) {
    const vid = +request.params.id;
    response.json(helpers_1.Helpers.ObjectToArray(model.Runs).filter(r => r.VehicleID === vid));
});
router.get("/route", function (request, response) {
    response.json(helpers_1.Helpers.ObjectToArray(model.Routes));
});
router.get("/route/:id/addresses", function (request, response) {
    let subrouteID = request.params.id;
    let value = helpers_1.Helpers.ObjectToArray(model.SubrouteStops)
        .filter((sss) => sss.SubrouteID == subrouteID)
        .map((sss) => model.Stops[sss.StopID])
        .map((s) => model.Addresses[s.AddressID]);
    response.json(value);
});
module.exports = router;
//# sourceMappingURL=gps.router.js.map