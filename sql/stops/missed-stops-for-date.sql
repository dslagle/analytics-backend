
--DECLARE @date DATETIME = '2017-01-23'
DECLARE @dow INT = DATEPART(DW, @date)

SELECT
    ISNULL(SRE.SubrouteName, SRP.SubrouteName) Subroute,
    ISNULL(TE.TripDescription, TP.TripDescription) Trip,
    ISNULL(SE.name, SP.name) Stop,
    AST.StopOrder,
    AST.DailyTimetableID,
    AT.FRsubrouteID SubrouteID,
    AT.FRTripsID TripID,
    IT.DisplayName CompletionType,
    A.Ycoordinate Latitude,
    A.Xcoordinate Longitude
FROM tblActualFRTrips AT  
    JOIN tblActualFRRouteStopTimes AST ON AT.DailyTripID = AST.DailyTripID
        AND AST.ArrivalInputID <> 8
    JOIN t_FRSubrouteProperties SRP ON SRP.FRSubrouteID = AT.FRSubrouteID
        AND @date BETWEEN SRP.EffectiveStartDate AND SRP.EffectiveEndDate
        AND @dow = SRP.DayOfWeek
    LEFT JOIN t_FRSubroutePropertyExceptions SRE ON SRE.FRSubroutePropertiesID = SRP.FRSubroutePropertiesID
        AND @date = SRE.ExceptionDate
    JOIN t_FRTripsProperties TP ON TP.FRTripsID = AT.FRTripsID
        AND @date BETWEEN TP.EffectiveStartDate AND TP.EffectiveEndDate
        AND @dow = TP.DayOfWeek
    LEFT JOIN t_FRTripsPropertyExceptions TE ON TE.FRTripsPropertiesID = TP.FRTripsPropertiesID
        AND @date = TE.ExceptionDate
    JOIN t_FRRouteStopProperties SP ON SP.FRRouteStopID = AST.FRRouteStopID
        AND @date BETWEEN SP.EffectiveStartDate AND SP.EffectiveEndDate
        AND @dow = SP.DayOfWeek
    LEFT JOIN t_FRRouteStopPropertyExceptions SE ON SE.FRRouteStopPropertiesID = SP.FRRouteStopPropertiesID
        AND @date = SE.ExceptionDate
    JOIN ltblFixedRouteInputTypes IT ON IT.InternalID = AST.ArrivalInputID
    JOIN tblAddress A ON A.AddressID = AST.AddressID
WHERE AT.TripDate = @date
