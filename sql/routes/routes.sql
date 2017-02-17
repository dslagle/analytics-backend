--DECLARE @date DATETIME = '2017-01-30'
DECLARE @day INT = DATEPART(DW, @Date)

SELECT
    MR.FRMasterRouteID,
    ISNULL(MRE.Name, MRP.Name) AS Name
FROM t_FRMasterRoute MR
    JOIN t_FRMasterRouteProperties MRP ON MRP.FRMasterRouteID = MR.FRMasterRouteID
        AND @date BETWEEN MRP.EffectiveStartDate AND MRP.EffectiveEndDate
        AND @day = MRP.DayOfWeek
    LEFT JOIN t_FRMasterRoutePropertyExceptions MRE ON MRE.FRMasterRoutePropertiesID = MRP.FRMasterRoutePropertiesID
        AND MRE.ExceptionDate = @date
WHERE
    CASE WHEN MRE.FRMasterRoutePropertyExceptionID IS NULL THEN MRP.Cancelled ELSE MRE.Cancelled END = 0