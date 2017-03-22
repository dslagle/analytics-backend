
--DECLARE @date DATETIME = '2017-03-03'
--DECLARE @queryID VARCHAR(50) = '228c98d3-9201-4320-ab3e-4bb88d7d6c4b'

SELECT
    C.QueryID,
    C.GPSActual,
    C.EstimatedTravelTime,
    C.ETA,
    S.DailyTripID,
    S.DailyStopID,
    S.StopOrder,
    S.ArriveDateTime,
    S.TravelTimeFromLastStop,
    S.StopType,
    S.ScheduledDateTime,
    DATEDIFF(SECOND, C.GPSActual, S.ArriveDateTime) ActualTravelTime
FROM ETA_DATA_Calculations C
    JOIN ETA_DATA_ActualStops S ON C.NextStopDailyID = S.DailyStopID
        AND S.TripDate = @date
--WHERE C.QueryID = @queryID
    -- AND C.QueryID in (
    --     '0001158a-7819-4d31-b096-eb4baf31c53c',
    --     '00020b13-00ed-4d1c-9eaa-689d81c94783',
    --     '00020e9f-2b09-4e56-ac6f-2356dae2f46a',
    --     '0002da63-d7ca-43bd-98a4-965809eee86f',
    --     '00036eae-2fbf-4cac-83f7-e645601413cf',
    --     '0004f1cf-e422-4c43-a7c1-6adf0d1b747c',
    --     '000502c5-6ce0-4130-967d-9029f9b44052',
    --     '00056228-a494-4266-9cb1-368ff6712560',
    --     '0005b6cb-4555-48cf-b303-ee00dfbd83ac',
    --     '0006e0da-9d10-43e0-9623-b815f9785c7c',
    --     '0006e1d5-d60a-46b6-871d-b59be8e74706'
    -- )
