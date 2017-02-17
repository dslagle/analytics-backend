DECLARE @LastGPSDateTime DATETIME = NULL
DECLARE @Date DATETIME = ISNULL(@LastGPSDateTime, DATEADD(MINUTE, -210, GETDATE()))
DECLARE @DatePart DATETIME = DATEADD(DD, 0, DATEDIFF(DD, 0, @Date))
DECLARE @day INT = DATEPART(DW, @Date)

DECLARE @StopMax TABLE (
    VehicleID INT,
    VehicleName VARCHAR(255),
    DeviceID INT,
    Scheduled DATETIME,
    PRIMARY KEY (DeviceID, Scheduled)
)
DECLARE @NextStop TABLE (
    Name VARCHAR(255),
    VehicleID INT,
    RouteID INT,
    RouteName VARCHAR(255),
    PatternID INT,
    PatternName VARCHAR(255),
    RunID INT,
    RunStarted BIT,
    TripID INT,
    Latitude float,
    Longitude float,
    ETA DATETIME
)

DECLARE @gps TABLE (
    VehicleID INT,
    ActualTime DATETIME,
    DeviceID INT,
    x FLOAT,
    y FLOAT,
    r INT,
    PRIMARY KEY (DeviceID, r)
)

INSERT INTO @StopMax (VehicleID, VehicleName, DeviceID, Scheduled)
SELECT R.VehicleID, V.InternalVehicleID, V.OnboardDeviceID, MIN(S.ScheduledStopTime) FROM tblActualFRRuns R
    JOIN tblActualFRTrips T ON T.DailyRunID = R.DailyRunID and T.TripDate = R.TripDate
    JOIN tblActualFRRouteStopTimes S ON S.DailyTripID = T.DailyTripID AND S.ArriveCompleted = 0
    JOIN v_VehicleInstantiated V ON V.VehicleID = R.VehicleID AND @Date BETWEEN V.PropertyStartDateTime AND V.PropertyEndDateTime
WHERE R.TripDate = @DatePart AND R.PullinCompleted = 0 AND R.PulloutCompleted = 1
GROUP BY R.VehicleID, V.InternalVehicleID, V.OnboardDeviceID

INSERT INTO @NextStop (VehicleID, RunID, TripID, RunStarted, Name, Latitude, Longitude, ETA, RouteName, PatternName)
SELECT
    R.VehicleID, R.RunID, T.FRTripsID, R.PulloutCompleted, RS.name, A.Ycoordinate, A.Xcoordinate, S.ETARealArriveDateTime,
    ISNULL(MRE.Name, MRP.Name), ISNULL(SRE.SubrouteName, SRP.SubrouteName)
FROM tblActualFRRuns R
    JOIN tblActualFRTrips T ON T.DailyRunID = R.DailyRunID and T.TripDate = R.TripDate
    JOIN tblActualFRRouteStopTimes S ON S.DailyTripID = T.DailyTripID AND S.ArriveCompleted = 0
    JOIN @StopMax M ON R.VehicleID = M.VehicleID AND S.ScheduledStopTime = M.Scheduled
    JOIN tblAddress A ON A.AddressID = S.AddressID
    JOIN v_FRRouteStopCal RS ON RS.FRRouteStopID = S.FRRouteStopID AND RS.CalendarDate = R.TripDate
    
    JOIN t_FRSubroute SR ON SR.FRSubrouteID = T.FRSubrouteID
    JOIN t_FRSubrouteProperties SRP ON SRP.FRSubrouteID = SR.FRSubrouteID
        AND @date BETWEEN SRP.EffectiveStartDate AND SRP.EffectiveEndDate
        AND @day = SRP.DayOfWeek
    LEFT JOIN t_FRSubroutePropertyExceptions SRE ON SRE.FRSubroutePropertiesID = SRP.FRSubroutePropertiesID
        AND SRE.ExceptionDate = @date
    JOIN t_FRMasterRoute MR ON MR.FRMasterRouteID = SR.FRMasterRouteID
    JOIN t_FRMasterRouteProperties MRP ON MRP.FRMasterRouteID = MR.FRMasterRouteID
        AND @date BETWEEN MRP.EffectiveStartDate AND MRP.EffectiveEndDate
        AND @day = MRP.DayOfWeek
    LEFT JOIN t_FRMasterRoutePropertyExceptions MRE ON MRE.FRMasterRoutePropertiesID = MRP.FRMasterRoutePropertiesID
        AND MRE.ExceptionDate = @date
WHERE R.TripDate = @DatePart

INSERT INTO @gps (VehicleID, ActualTime, DeviceID, x, y, r)
SELECT N.VehicleID, ActualDateTime, OnboardDeviceID, GPS.Latitude, GPS.Longitude, ROW_NUMBER() OVER (PARTITION BY OnboardDeviceID ORDER BY ActualDateTime DESC)
FROM @StopMax N
JOIN tblStreetRouteActual GPS ON GPS.ActualDateTime > @Date AND GPS.OnboardDeviceID = N.DeviceID

SELECT
    S.VehicleID, S.VehicleName, S.DeviceID, ActualTime, N.RunStarted, G.x GPS_X, G.y GPS_Y,
    N.Name StopName, N.Latitude DEST_X, N.Longitude DEST_Y, N.ETA, S.Scheduled,
    N.PatternName, N.RouteName
FROM @StopMax S
    LEFT JOIN @gps G ON G.r = 1 AND G.DeviceID = S.DeviceID
    LEFT JOIN @NextStop N ON S.VehicleID = N.VehicleID
