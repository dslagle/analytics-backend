
-- SELECT
--     MIN(D.NextStopName) Destination,
--     Min(D.StopOrder) StopOrder,
--     AVG(D.ETAOffMinutes) Diff,
--     MIN(D.NextStopScheduled) Scheduled,
--     MIN(D.NextStopArrive) Actual
-- FROM DJS_ETA_DATA D
-- WHERE D.ETAOffMinutes > 5 AND D.NextStopArrive > D.NextStopScheduled
--     AND CHARINDEX('P&R', D.NextStopName) = 0
-- GROUP BY D.NextStopDailyID
-- ORDER BY Scheduled

DECLARE @date DATETIME = '2017-01-31'
DECLARE @FromDateTime DATETIME = '2017-01-31 17:00:00'
DECLARE @ToDateTime DATETIME = DATEADD(SECOND, 10, @FromDateTime)

DECLARE @result TABLE (
    QueryID VARCHAR(50),
    PairID INT IDENTITY(1, 1) NOT NULL,
    OriginLat FLOAT,
    OriginLng FLOAT,
    DestinationLat FLOAT,
    DestinationLng FLOAT,
    SubrouteStopID INT,
    DeviceID INT
)

DECLARE @points TABLE (
    PairID INT,
    RN INT,
    CN INT,
    SubrouteID INT,
    Lat FLOAT,
    Lng FLOAT
)

DECLARE @reduced TABLE (
    SubrouteID INT,
    Lat FLOAT,
    Lng FLOAT
)

DECLARE @count INT

INSERT INTO @result (QueryID, OriginLat, OriginLng, DestinationLat, DestinationLng, SubrouteStopID, DeviceID)
SELECT
    O.QueryID,
    O.OnRouteLatitude LR_LAT,
    O.OnRouteLongitude LR_LNG,
    A.Ycoordinate NextStop_LAT,
    A.Xcoordinate NextStop_LNG, 
    TSP.FRSubroutePropertiesFRRouteStopID SubrouteStopID,
    GPS.OnboardDeviceID
FROM GetRouteStatus_Output O
    JOIN tblStreetRouteActual GPS ON GPS.Transaction_Tracking_value = O.QueryID
    JOIN tblActualFRRouteStopTimes AST ON AST.DailyTimetableID = O.DailyTimeTableID
    JOIN t_FRTripsPropertiesFRRouteStop TSP ON TSP.FRTripsPropertiesFRRouteStopID = AST.FRTripsPropertiesFRRouteStopID
    JOIN tblAddress A ON AST.AddressID = A.AddressID
WHERE GPS.ActualDateTime > @FromDateTime AND GPS.ActualDateTime < @ToDateTime

INSERT INTO @points (PairID, RN, CN, SubrouteID, Lat, Lng)
SELECT
    R.PairID,
    ROW_NUMBER() OVER (PARTITION BY R.PairID ORDER BY LRLP.LongLatSequence),
    COUNT(*) OVER (PARTITION BY R.PairID),
    SRP.FRSubrouteID,
    LRLP.Latitude,
    LRLP.Longitude
FROM @result R
    JOIN t_FRSubroutePropertiesFRRouteStop SRSP ON SRSP.FRSubroutePropertiesFRRouteStopID = R.SubrouteStopID

    JOIN t_FRSubrouteProperties SRP ON SRP.FRSubroutePropertiesID = SRSP.FRSubroutePropertiesID
    JOIN tblLandRoute LR ON LR.LandRouteID = SRP.LandRouteID
    JOIN tblLandRouteLine LRL ON LRL.LandRouteLineID = LR.LandRouteLineID
    JOIN tblLandRouteLinePoints LRLP ON LRLP.LandRouteLineID = LRL.LandRouteLineID
        AND LRLP.LongLatSequence > (
            SELECT LRLP2.LongLatSequence FROM tblLandRouteLinePoints LRLP2
                WHERE LRLP2.LandRouteLinePointsID = SRSP.LandRouteLinePointsID
        )

INSERT INTO @reduced (SubrouteID, Lat, Lng)
SELECT P.PairID, P.Lat, P.Lng
FROM @points P
WHERE CASE WHEN CN <= 20 THEN 0 ELSE (P.RN % FLOOR(CN / 20.0)) END = 0
ORDER bY P.RN

SELECT * FROM @result

SELECT SubrouteID, COUNT(*)
FROM @reduced
GROUP BY SubrouteID
