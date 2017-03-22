
INSERT INTO ETA_DATA_GoogleDirectionResult (
    QueryID, EstimatedTravelTime, EstimatedTravelTimeInTraffic, EstimatedTravelDistanceInMeters, Polyline
)
VALUES (@QueryID, @TravelTime, @TravelTimeInTraffic, @DistanceInMeters, @Polyline)
