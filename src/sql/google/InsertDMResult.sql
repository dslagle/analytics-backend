
INSERT INTO ETA_DATA_GoogleResult (
    QueryID, EstimatedTravelTime, EstimatedTravelTimeInTraffic, EstimatedTravelDistanceInMeters, URL
)
VALUES (@QueryID, @TravelTime, @TravelTimeInTraffic, @DistanceInMeters, @URL)
