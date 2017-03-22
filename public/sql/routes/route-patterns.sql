--DECLARE @date DATETIME = '2017-01-30'
DECLARE @day INT = DATEPART(DW, @Date)

SELECT
    SR.FRSubrouteID,
    SR.FRMasterRouteID,
    ISNULL(SRE.SubrouteName, SRP.SubrouteName) AS Name
FROM t_FRSubroute SR
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
WHERE
    CASE WHEN SRE.FRSubRoutePropertyExceptionID IS NULL THEN SRP.Cancelled ELSE SRE.Cancelled END = 0
        AND
    CASE WHEN MRE.FRMasterRoutePropertyExceptionID IS NULL THEN MRP.Cancelled ELSE MRE.Cancelled END = 0