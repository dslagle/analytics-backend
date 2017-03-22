import { Address } from "./address";
import { RoutePattern } from "./subroute";
import { SubrouteStop } from "./subroutestop";
import { Vehicle } from "./vehicle";
import { Stop } from "./stop";
import { Run } from "./run";
import { Trip } from "./trip";
import { TripStop } from "./tripstop";
import { Helpers } from "../helpers/helpers";

export class Model {
    // Addresses: Address[];
    // Routes: RoutePattern[];
    // Stops: Stop[];
    // SubrouteStops: SubrouteStop[];
    // Vehicles: Vehicle[];
    // Runs: Run[];
    // Trips: Trip[];
    // TripStops: TripStop[];

    Addresses: any;
    Routes: any;
    Stops: any;
    SubrouteStops: any;
    Vehicles: any;
    Runs: any;
    Trips: any;
    TripStops: any;

    constructor(model: any) {
        this.Addresses = Helpers.ArrayToObject(model[3], "AddressID");
        this.Routes = Helpers.ArrayToObject(model[0], "SburouteID");
        this.Stops = Helpers.ArrayToObject(model[4], "StopID");
        this.SubrouteStops = Helpers.ArrayToObject(model[5], "SubrouteStopID");
        this.Vehicles = Helpers.ArrayToObject(model[7], "VehicleID");
        this.Runs = Helpers.ArrayToObject(model[2], "RunID");
        this.Trips = Helpers.ArrayToObject(model[1], "TripID");
        this.TripStops = Helpers.ArrayToObject(model[6], "TripStopID");
    }
}