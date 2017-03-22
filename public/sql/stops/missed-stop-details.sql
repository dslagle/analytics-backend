
--DECLARE @DailyStopID INT = 1068910
--DECLARE @date DATETIME = '2016-12-01';

DECLARE @min DATETIME
DECLARE @max DATETIME

DECLARE @vid INT, @did INT

SELECT
    @min = MIN(AST2.ScheduledStopTime),
    @max = MAX(AST2.ScheduledStopTime),
    @vid = MIN(AR.VehicleID)
FROM tblActualFRRouteStopTimes AST
    JOIN tblActualFRTrips AT ON AT.DailyTripID = AST.DailyTripID
    JOIN tblActualFRRuns AR ON AR.DailyRunID = AT.DailyRunID
    JOIN tblActualFRRouteStopTimes AST2 ON AST2.DailyTripID = AT.DailyTripID
WHERE AST.DailytimetableID = @DailyStopID

SELECT @did = OnboardDeviceID
FROM v_VehicleInstantiated V
WHERE V.VehicleID = @vid
    AND @date BETWEEN V.PropertyStartDateTime AND V.PropertyEndDateTime

SELECT *
FROM tblStreetRouteActual GPS
WHERE GPS.OnboardDeviceID = @did
    AND GPS.ActualDateTime BETWEEN @min AND @max
ORDER BY GPS.ActualDateTime
