"use strict";
const helpers_1 = require("../helpers/helpers");
class Model {
    constructor(model) {
        this.Addresses = helpers_1.Helpers.ArrayToObject(model[3], "AddressID");
        this.Routes = helpers_1.Helpers.ArrayToObject(model[0], "SburouteID");
        this.Stops = helpers_1.Helpers.ArrayToObject(model[4], "StopID");
        this.SubrouteStops = helpers_1.Helpers.ArrayToObject(model[5], "SubrouteStopID");
        this.Vehicles = helpers_1.Helpers.ArrayToObject(model[7], "VehicleID");
        this.Runs = helpers_1.Helpers.ArrayToObject(model[2], "RunID");
        this.Trips = helpers_1.Helpers.ArrayToObject(model[1], "TripID");
        this.TripStops = helpers_1.Helpers.ArrayToObject(model[6], "TripStopID");
    }
}
exports.Model = Model;
//# sourceMappingURL=model.js.map