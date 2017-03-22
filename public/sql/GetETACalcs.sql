
--DECLARE @FromDateTime DATETIME = '2017-03-13 16:25:00'
--DECLARE @ToDateTime DATETIME = DATEADD(SECOND, 5, @FromDateTime)--'2017-01-31 05:30:31'

DECLARE @From DATETIME = DATEADD(HOUR, 4, @FromDateTime)
DECLARE @Date DATETIME = DATEADD(dd, 0, DATEDIFF(dd, 0, @FromDateTime))

SELECT
    O.QueryID,
    O.OnRouteLatitude OriginLat,
    O.OnRouteLongitude OriginLng,
    A.Ycoordinate DestinationLat,
    A.Xcoordinate DestinationLng,
    GPS.ActualDateTime,
    GPS.ReceivedDateTime,
    DATEADD(HOUR, -4, O.InsertDateTime) InsertDateTime
FROM GetRouteStatus_Output O
    JOIN tblStreetRouteActual GPS ON GPS.Transaction_Tracking_value = O.QueryID
        AND GPS.ActualDateTime > @Date--performance only
    JOIN tblActualFRRouteStopTimes AST ON AST.DailyTimetableID = O.DailyTimeTableID
    JOIN tblAddress A ON AST.AddressID = A.AddressID
WHERE O.InsertDateTime > @From
--WHERE GPS.ActualDateTime > @FromDateTime
    --AND GPS.ReceivedDateTime <= @ToDateTime
    --AND GPS.ActualDateTime <= @ToDateTime
-- WHERE DATEADD(HOUR, -5, O.InsertDateTime) > @FromDateTime
--     AND DATEADD(HOUR, -5, O.InsertDateTime) < @ToDateTime

--57136