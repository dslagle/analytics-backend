"use strict";
var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
const express_1 = require("express");
const helpers_1 = require("../helpers/helpers");
const router = express_1.Router();
let model;
router.get("/", function (request, response) {
    response.json(helpers_1.Helpers.ObjectToArray(model.Trips));
});
router.get("/:id/stops", function (request, response) {
    response.json(helpers_1.Helpers.ObjectToArray(model.TripStops, ts => ts.TripID === +request.params.id)
        .map(ts => { return __assign({}, ts, { Name: model.Stops[model.SubrouteStops[ts.SubrouteStopID].StopID].StopName }); }));
});
exports.TripRouter = (data) => { model = data; return router; };
//# sourceMappingURL=trip.router.js.map