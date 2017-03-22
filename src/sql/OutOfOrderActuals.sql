
declare @ordered table (
	DailyStopID INT PRIMARY KEY,
	DailyTripID INT,
	Scheduled DATETIME,
	Arrive DATETIME,
	Depart DATETIME,
	StopOrder INT,
	Method VARCHAR(255),
	DepartInputID INT,
	Canceled BIT,
	StopName VARCHAR(255),
	r INT
)

--DECLARE @date DATETIME = '2016-11-16'

INSERT INTO @ordered (DailyStopID, DailyTripID, Scheduled, Arrive, Depart, StopOrder, DepartInputID, Canceled, r, Method, StopName)
SELECT
	AST.DailyTimetableID,
	AST.DailyTripID,
	AST.ScheduledStopTime,
	AST.ArriveTime,
	AST.DepartTime,
	AST.StopOrder,
	AST.DepartInputID,
	AST.Cancelled,
	ROW_NUMBER() OVER (PARTITION BY AST.DailyTripID ORDER BY AST.StopOrder),
	InputTypes.DisplayName,
	ISNULL(RSE.Name, RSP.Name)
FROM tblActualFRRouteStopTimes AST
	JOIN tblActualFRTrips AT ON AT.DailyTripID = AST.DailyTripID AND AT.TripDate = @date
	JOIN t_FRRouteStop RS ON RS.FRRouteStopID = AST.FRRouteStopID
	JOIN t_FRRouteStopProperties RSP ON RSP.FRRouteStopID = RS.FRRouteStopID
		AND @date BETWEEN RSP.EffectiveStartDate AND RSP.EffectiveEndDate
		AND DATEPART(DW, @date) = RSP.DayOfWeek
	LEFT JOIN t_FRRouteStopPropertyExceptions RSE ON RSE.FRRouteStopPropertiesID = RSP.FRRouteStopPropertiesID
		AND RSE.ExceptionDate = @date
	LEFT JOIN ltblFixedRouteInputTypes InputTypes ON InputTypes.InternalID = AST.ArrivalInputID

SELECT
	AST1.DailyStopID,
	V.InternalVehicleID Vehicle,
	ISNULL(TE.TripDescription, TP.TripDescription) Trip,
	ISNULL(SRE.SubrouteName, SRP.SubrouteName) Subroute,
	AST1.StopName 'Stop 1',
	AST1.StopOrder,
	AST1.Scheduled,
	AST1.Arrive,
	AST1.Depart,
	AST1.Method 'Arrival Completion',
	AST2.StopName 'Stop 2',
	AST2.StopOrder,
	AST2.Scheduled,
	AST2.Arrive,
	AST2.Depart,
	AST2.Method 'Arrival Completion'
FROM @ordered AST1
	JOIN @ordered AST2 ON AST2.DailyTripID = AST1.DailyTripID AND AST2.r = AST1.r + 1
	JOIN tblActualFRTrips AT ON AT.DailyTripID = AST1.DailyTripID AND AT.TripDate = @date
	JOIN tblActualFRRuns AR ON AR.DailyRunID = AT.DailyRunID

	LEFT JOIN v_VehicleInstantiated V ON V.VehicleID = AR.VehicleID
		AND @date BETWEEN V.PropertyStartDateTime AND V.PropertyEndDateTime
	
	JOIN t_FRTrips T ON AT.FRTripsID = T.FRTripsID
	JOIN t_FRTripsProperties TP ON TP.FRTripsID = T.FRTripsID
		AND @date BETWEEN TP.EffectiveStartDate AND TP.EffectiveEndDate
		AND DATEPART(DW, @date) = TP.DayOfWeek
	LEFT JOIN t_FRTripsPropertyExceptions TE ON TE.FRTripsPropertiesID = TP.FRTripsPropertiesID
		AND TE.ExceptionDate = @date
	
	JOIN t_FRSubroute SR ON SR.FRSubrouteID = T.FRSubrouteID
	JOIN t_FRSubrouteProperties SRP ON SRP.FRSubrouteID = SR.FRSubrouteID
		AND @date BETWEEN SRP.EffectiveStartDate AND SRP.EffectiveEndDate
		AND DATEPART(DW, @date) = SRP.DayOfWeek
	LEFT JOIN t_FRSubroutePropertyExceptions SRE ON SRE.FRSubRoutePropertiesID = SRP.FRSubroutePropertiesID
		AND SRE.ExceptionDate = @date
WHERE AST1.Arrive >= AST2.Arrive

