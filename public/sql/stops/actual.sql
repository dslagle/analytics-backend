DECLARE @date DATETIME = '2017-01-31'
DECLARE @day INT = DATEPART(DW, @date)

SELECT AST.TripStopType, AST.DailyTimeTableID, RP.RunDescription, TP.TripDescription, SP.name, AST.ScheduledStopTime, AST.ArriveTime, AST.DepartTime FROM tblActualFRRouteStopTimes AST
    JOIN tblActualFRTrips AT ON AT.DailyTripID = AST.DailyTripID AND TripDate = @date
    JOIN tblActualFRRuns AR ON AR.DailyRunID = AT.DailyRunID

    JOIN tblFRRunsTemplate RP ON RP.RunID = AR.RunID
        AND @date BETWEEN RP.EffectiveStartDate AND RP.EffectiveEndDate
        AND @day = RP.DayOfWeek
    LEFT JOIN tblFRRunsTemplateExceptions RE ON RE.FRRunTemplateID = RP.FRRunTemplateID
        AND @date = RE.ExceptionDate

    JOIN t_FRTrips T ON T.FRTripsID = AT.FRTripsID
    JOIN t_FRTripsProperties TP ON TP.FRTripsID = T.FRTripsID
        AND @date BETWEEN TP.EffectiveStartDate AND TP.EffectiveEndDate
        AND @day = TP.DayOfWeek
    LEFT JOIN t_FRTripsPropertyExceptions TE ON TE.FRTripsPropertiesID = TP.FRTripsPropertiesID
        AND TE.ExceptionDate = @date

    JOIN t_FRRouteStop S ON S.FRRouteStopID = AST.FRRouteStopID
    JOIN t_FRRouteStopProperties SP ON SP.FRRouteStopID = S.FRRouteStopID
        AND @date BETWEEN SP.EffectiveStartDate AND SP.EffectiveEndDate
        AND @day = SP.DayOfWeek
WHERE (DATEDIFF(mi, AST.ScheduledStopTime, AST.DepartTime) > 15 OR AST.DepartTime < AST.ScheduledStopTime) AND AST.StopOrder = 1
ORDER BY AST.ScheduledStopTime