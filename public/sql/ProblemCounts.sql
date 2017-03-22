--DECLARE @sdate DATETIME = '2016-11-01'
--DECLARE @edate DATETIME = '2016-11-30'

declare @ordered table (
	TripDate DATETIME,
	DailyTripID INT,
	DailyStopID INT,
	Arrive DATETIME,
	r INT,
	PRIMARY KEY (DailyTripID, DailyStopID)
)

declare @problems table (
	TripDate DATETIME PRIMARY KEY,
	Number INT
)

INSERT INTO @ordered (TripDate, DailyTripID, DailyStopID, Arrive, r)
SELECT
	AT.TripDate,
	AT.DailyTripID,
	AST.DailyTimetableID,
	AST.ArriveTime,
	ROW_NUMBER() OVER (PARTITION BY AST.DailyTripID ORDER BY AST.StopOrder)
FROM tblActualFRRouteStopTimes AST
	JOIN tblActualFRTrips AT ON AT.DailyTripID = AST.DailyTripID AND AT.TripDate BETWEEN @sdate AND @edate

INSERT INTO @problems (TripDate, Number)
SELECT
	AST1.TripDate,
	COUNT(*)
FROM 
	@ordered AST1
	JOIN @ordered AST2 ON AST2.DailyTripID = AST1.DailyTripID AND AST2.r = AST1.r + 1
WHERE AST1.Arrive >= AST2.Arrive
GROUP BY AST1.TripDate

SELECT CalendarDate, ISNULL(Number, 0) Count FROM tblCalendar
LEFT JOIN @problems ON TripDate = CalendarDate
WHERE CalendarDate BETWEEN @sdate AND @edate
