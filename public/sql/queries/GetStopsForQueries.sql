
--DECLARE @queryID VARCHAR(50) = '00004cb2-add8-4368-b358-9735546885f5'

ALTER PROCEDURE GetStopsForQueries (
    @queryIDs GUIDArray READONLY
)
AS

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
WHERE C.QueryID IN (SELECT ID FROM @queryIDs)
    -- '000eed65-1e73-4528-9624-edc3a1d9ec5c',
    -- '00f5df2a-f8d3-409b-a6d6-95129f656de6',
    -- '014fb140-85de-4a96-a8a5-151f3b5d3ab0',
    -- '01714944-b5ad-4c49-8ec4-3d2be052b5b8',
    -- '0192731b-4013-44e7-9e95-724382622f82',
    -- '024995a9-0541-4420-bfc2-59bf4dae5aba',
    -- '049c58d5-b64b-48ce-842d-060e0bd28933',
    -- '04a1c8ab-46af-4118-a3bd-4faf42e1e3d3'
-- )
-- ORDER BY SN.StopOrder
