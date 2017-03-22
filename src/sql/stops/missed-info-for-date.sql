

--DECLARE @date DATETIME = '2017-02-01'

DECLARE @DistanceFromStop FLOAT = 0.5
DECLARE @HeadingThreshold INT = 15

DECLARE @dow INT = DATEPART(DW, @date)

CREATE TABLE #MissedDailyStops (
	DailyStopID INT,
	DailyTripID INT,
	DailyRunID INT,
	TripStopID INT,
	VehicleID INT,
	DeviceID INT,
	TripDate DATETIME,
	StopTime DATETIME
)

CREATE TABLE #ArriveTargets (
	DailyStopID INT,
	TargetActualID INT,
	Latitude FLOAT NOT NULL,
	Longitude FLOAT NOT NULL,
	Radius INT NOT NULL,
	Heading INT,
	Attributes INT,
	StopTime DATETIME
)

CREATE TABLE #GPSCloseToTarget (
	ID INT,
	DailyStopID INT,
	TargetActualID INT,
	ActualDateTime DATETIME,
	DistanceInYards FLOAT,
	GPSHeading INT,
	GPSLat FLOAT,
	GPSLng FLOAT
)

BEGIN TRY

INSERT INTO #MissedDailyStops
SELECT
	AST.DailyTimetableID,
	AT.DailyTripID,
	AT.DailyRunID,
	AST.FRTripsPropertiesFRRouteStopID,
	AR.VehicleID,
	V.OnboardDeviceID,
	AT.TripDate,
	AST.ScheduledStopTime
FROM tblActualFRRouteStopTimes AST
	JOIN tblActualFRTrips AT ON AT.DailyTripID = AST.DailyTripID
		AND AT.TripDate = @date
	JOIN tblActualFRRuns AR ON AR.DailyRunID = AT.DailyRunID
	JOIN v_VehicleInstantiated V ON AT.TripDate BETWEEN V.PropertyStartDateTime AND V.PropertyEndDateTime
		AND V.VehicleID = AR.VehicleID
WHERE AST.ArrivalInputID <> 8

INSERT INTO #ArriveTargets (DailyStopID, TargetActualID, StopTime, Latitude, Longitude, Radius, Heading, Attributes)
SELECT
	M.DailyStopID,
	ASTT.TargetActualID,
	M.StopTime,
	TA.Latitude,
	TA.Longitude,
	TA.Radius,
	TA.Heading,
	TA.Attributes
FROM #MissedDailyStops M
	JOIN ktblActualFRRouteStopTimesTargets ASTT ON ASTT.DailyTimeTableID = M.DailyStopID
	
	JOIN (
		SELECT
			TargetActualID,
			Attributes,
			Heading,
			Radius,
			Latitude * PI() / 180 AS Latitude,
			Longitude * PI() / 180 AS Longitude
		FROM tblTargetActual
	) AS TA ON TA.TargetActualID = ASTT.TargetActualID
		AND (TA.Attributes & 0x1 = 0x1 OR TA.Attributes & 0x10 = 0x10)
----WHERE AST.DailyTimetableID = 1253460



INSERT INTO #GPSCloseToTarget (ID, DailyStopID, TargetActualID, ActualDateTime, DistanceInYards, GPSHeading, GPSLat, GPSLng)
SELECT
	GPS.ID,
	M.DailyStopID,
	TARGETS.TargetActualID,
	GPS.ActualDateTime,
	GPS.DistanceInYards,
	GPS.Heading,
	GPS.Latitude,
	GPS.Longitude
FROM #MissedDailyStops M
	JOIN #ArriveTargets TARGETS ON TARGETS.DailyStopID = M.DailyStopID

	CROSS APPLY (
		SELECT
			ID,
			OnboardDeviceID,
			Heading,
			Latitude * PI() / 180 AS Latitude,
			Longitude * PI() / 180 AS Longitude,
			ActualDateTime,
			OnRouteLatitude * PI() / 180 AS LRLat,
			OnRouteLongitude * PI() / 180 AS LRLng,
			SQRT(
				POWER((GPS.Longitude * PI() / 180 - TARGETS.Longitude) * COS(0.5*(GPS.Latitude * PI() / 180 + TARGETS.Latitude)), 2)
					+ POWER(GPS.Latitude * PI() / 180 - TARGETS.Latitude, 2)
			) * 3963.19 * 1760 AS DistanceInYards
		FROM tblStreetRouteActual GPS
		WHERE ActualDateTime BETWEEN @date AND DATEADD(DAY, 1, @date)
			AND GPS.OnboardDeviceID = M.DeviceID
			AND DATEDIFF(MINUTE, M.StopTime, GPS.ActualDateTime) BETWEEN -20 AND 90
			AND SQRT(
				POWER((GPS.Longitude * PI() / 180 - TARGETS.Longitude) * COS(0.5*(GPS.Latitude * PI() / 180 + TARGETS.Latitude)), 2)
					+ POWER(GPS.Latitude * PI() / 180 - TARGETS.Latitude, 2)
			) * 3963.19 < @DistanceFromStop
	) AS GPS

SELECT
    @date Date,
	COUNT(DISTINCT M.DailyStopID) AS TotalMissedStops,
	COUNT(DISTINCT TARGETS.DailyStopID) AS WithArriveTarget,
	COUNT(DISTINCT GPSC.DailyStopID) AS WithGPSinTarget,
	COUNT(DISTINCT GPS_W_HEADING.DailyStopID) WithHeading
FROM #MissedDailyStops M
	LEFT JOIN #ArriveTargets TARGETS ON TARGETS.DailyStopID = M.DailyStopID
	LEFT JOIN #GPSCloseToTarget GPSC ON GPSC.TargetActualID = TARGETS.TargetActualID
			AND GPSC.DistanceInYards < TARGETS.Radius
	LEFT JOIN #GPSCloseToTarget GPS_W_HEADING ON GPS_W_HEADING.TargetActualID = TARGETS.TargetActualID
			AND GPS_W_HEADING.DistanceInYards < TARGETS.Radius
			AND (TARGETS.Heading IS NULL OR ABS(GPS_W_HEADING.GPSHeading - TARGETS.Heading) < @HeadingThreshold)

END TRY
BEGIN CATCH

END CATCH

DROP TABLE #GPSCloseToTarget
DROP TABLE #MissedDailyStops
DROP TABLE #ArriveTargets