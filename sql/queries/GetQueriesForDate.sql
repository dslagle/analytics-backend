
DECLARE @date DATETIME = '2017-03-06'

SELECT
    C.QueryID,
    C.GPSActual,
    C.EstimatedTravelTime
FROM ETA_DATA_Calculations C
    JOIN ETA_DATA_ActualStops S ON C.NextStopDailyID = S.DailyStopID
        AND S.TripDate = @date
WHERE S.TripDate = @date
