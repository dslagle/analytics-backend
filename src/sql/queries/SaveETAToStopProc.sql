
CREATE PROCEDURE SaveETAToStop (
    @Stops CalculationStopETAType READONLY
)
AS

SET NOCOUNT ON;

MERGE ETA_DATA_Calculations_StopETA AS TARGET
USING @Stops AS SOURCE
    ON SOURCE.QueryID = TARGET.QueryID AND SOURCE.DailyStopID = TARGET.DailyStopID
WHEN MATCHED THEN UPDATE
    SET ActualTravelTime = SOURCE.ActualTravelTime, ETA = SOURCE.ETA
WHEN NOT MATCHED THEN
    INSERT (QueryID, DailyStopID, ActualTravelTime, ETA)
    VALUES (SOURCE.QueryID, SOURCE.DailyStopID, SOURCE.ActualTravelTime, SOURCE.ETA);
