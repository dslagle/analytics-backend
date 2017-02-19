
--DECLARE @FromDateTime DATETIME = '2017-02-17 14:30:00'
--DECLARE @ToDateTime DATETIME = DATEADD(SECOND, 5, @FromDateTime)--'2017-01-31 05:30:31'

SELECT
    O.QueryID,
    O.OnRouteLatitude OriginLat,
    O.OnRouteLongitude OriginLng,
    A.Ycoordinate DestinationLat,
    A.Xcoordinate DestinationLng,
    GPS.ActualDateTime
FROM GetRouteStatus_Output O
    JOIN tblStreetRouteActual GPS ON GPS.Transaction_Tracking_value = O.QueryID
    JOIN tblActualFRRouteStopTimes AST ON AST.DailyTimetableID = O.DailyTimeTableID
    JOIN tblAddress A ON AST.AddressID = A.AddressID
WHERE GPS.ActualDateTime > @FromDateTime
    --AND GPS.ActualDateTime <= @ToDateTime
-- WHERE DATEADD(HOUR, -5, O.InsertDateTime) > @FromDateTime
--     AND DATEADD(HOUR, -5, O.InsertDateTime) < @ToDateTime