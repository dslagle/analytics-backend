--DECLARE @date DATETIME = '2017-01-30'
DECLARE @day INT = DATEPART(DW, @date)
--DECLARE @RunID INT = 67459
SELECT
    T.FRTripsID TripID,
    ISNULL(TE.TripDescription, TP.TripDescription) AS TripName,
    ISNULL(RE.RunDescription, RP.RunDescription) AS RunName,
    ISNULL(SRE.SubrouteName, SRP.SubrouteName) AS PatternName,
    ISNULL(MRE.Name, MRP.Name) AS RouteName
FROM tblActualFRTrips AT
    JOIN tblActualFRRuns AR ON AR.DailyRunID = AT.DailyRunID
        AND AR.DailyRunID = @RunID
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
WHERE AT.TripDate = @date