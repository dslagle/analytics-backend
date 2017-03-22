
--DECLARE @queryID VARCHAR(50) = '00004cb2-add8-4368-b358-9735546885f5'

SELECT
    C.QueryID,
    SN.DailyTripID,
    SN.DailyStopID,
    SN.StopOrder,
    SN.ArriveDateTime,
    SN.TravelTimeFromLastStop,
    SN.StopType,
    SN.ScheduledDateTime,
    DATEDIFF(SECOND, C.GPSActual, SN.ArriveDateTime) ActualTravelTime
FROM ETA_DATA_Calculations C
    JOIN ETA_DATA_ActualStops S ON C.NextStopDailyID = S.DailyStopID
    JOIN ETA_DATA_ActualStops SN ON SN.DailyTripID = S.DailyTripID
       AND SN.StopOrder > S.StopOrder
WHERE C.QueryID = @queryID
ORDER BY SN.StopOrder
