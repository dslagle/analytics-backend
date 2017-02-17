import { Router } from "express";
import { Model } from "../model/model";
import { Helpers } from "../helpers/helpers";

const router = Router();
let model: Model;

router.get("/", function(request, response) {
    response.json(Helpers.ObjectToArray(model.Trips));
});

router.get("/:id/stops", function(request, response) {
    response.json(
        Helpers.ObjectToArray(model.TripStops, ts => ts.TripID === +request.params.id)
            .map(ts => { return { ...ts, Name: model.Stops[model.SubrouteStops[ts.SubrouteStopID].StopID].StopName }; })
    );
});

export const TripRouter = (data) => { model = data; return router; };