
DECLARE @SubrouteStopID INT = 257756

DECLARE @temp TABLE (
	TripID INT,
	TripName VARCHAR(255),
	GPSTime DATETIME,
	NextStopName VARCHAR(255),
	PreviousStopName VARCHAR(255),
	ETA DATETIME,
	NextStopArrive DATETIME
)

INSERT INTO @temp (
	TripID,
	TripName,
	GPSTime,
	NextStopName,
	PreviousStopName,
	ETA,
	NextStopArrive
)
SELECT
	TP.FRTripsID TripID,
	ISNULL(TE.TripDescription, TP.TripDescription) TripName,
	D.GPSActual,
	D.NextStopName,
	D.PreviousStopName,
	D.ETA,
	D.NextStopArrive
FROM DJS_ETA_DATA D
	JOIN tblActualFRRouteStopTimes AST ON AST.DailyTimetableID = D.NextStopDailyID
	JOIN tblActualFRTrips AT ON AT.DailyTripID = AST.DailyTripID
	JOIN t_FRTripsProperties TP ON TP.FRTripsID = AT.FRTripsID
		AND AT.TripDate BETWEEN TP.EffectiveStartDate AND TP.EffectiveEndDate
		AND DATEPART(DW, AT.TripDate) = TP.DayOfWeek
	LEFT JOIN t_FRTripsPropertyExceptions TE ON TE.FRTripsPropertiesID = TP.FRTripsPropertiesID
		AND AT.TripDate = TE.ExceptionDate
WHERE D.SubrouteStopID = @SubrouteStopID
ORDER BY AT.FRTripsID, D.GPSActual

SELECT TOP 1 D.PreviousStopName, D.NextStopName
FROM DJS_ETA_DATA D WHERE D.SubrouteStopID = @SubrouteStopID

SELECT DISTINCT TripID, TripName FROM @temp

SELECT TripID, GPSTime, ETA, NextStopArrive FROM @temp