
--DECLARE @Threshold INT = 5;
--DECLARE @Date DATETIME = '2017-01-31'
DECLARE @Day INT = DATEPART(DW, @Date)
--DECLARE @SubrouteID INT = 3745

DECLARE @temp TABLE (
	SubrouteStopID INT,
	SubrouteID INT,
    DailyStopID INT,
	Count1 INT,
	NumberUnder1 INT,
	NumberOver1 INT,
	Count2 INT,
	NumberUnder2 INT,
	NumberOver2 INT,
	Count3 INT,
	NumberUnder3 INT,
	NumberOver3 INT,
	Count4 INT,
	NumberUnder4 INT,
	NumberOver4 INT
)

INSERT INTO @temp (SubrouteStopID, SubrouteID, DailyStopID,
	Count1, NumberUnder1, NumberOver1,
	Count2, NumberUnder2, NumberOver2,
	Count3, NumberUnder3, NumberOver3,
	Count4, NumberUnder4, NumberOver4
)
SELECT
	S.SubrouteStopID,
	MIN(T.SubrouteID),
    MIN(S.DailyStopID),

	COUNT(CASE WHEN (ActualTravelTime / 60.0) >= 9 AND (ActualTravelTime / 60.0) <= 11 THEN 1 ELSE NULL END),
	COUNT(CASE WHEN (ActualTravelTime / 60.0) >= 9 AND (ActualTravelTime / 60.0) <= 11 AND (EstimatedTravelTime - ActualTravelTime) < -@Threshold * 60 THEN 1 ELSE NULL END),
	COUNT(CASE WHEN (ActualTravelTime / 60.0) >= 9 AND (ActualTravelTime / 60.0) <= 11 AND (EstimatedTravelTime - ActualTravelTime) > @Threshold * 60 THEN 1 ELSE NULL END),

	COUNT(CASE WHEN (ActualTravelTime / 60.0) > 29 AND (ActualTravelTime / 60.0) <= 31 THEN 1 ELSE NULL END),
	COUNT(CASE WHEN (ActualTravelTime / 60.0) > 29 AND (ActualTravelTime / 60.0) <= 31 AND (EstimatedTravelTime - ActualTravelTime) < -@Threshold * 60 THEN 1 ELSE NULL END),
	COUNT(CASE WHEN (ActualTravelTime / 60.0) > 29 AND (ActualTravelTime / 60.0) <= 31 AND (EstimatedTravelTime - ActualTravelTime) > @Threshold * 60 THEN 1 ELSE NULL END),

	COUNT(CASE WHEN (ActualTravelTime / 60.0) > 10 AND (ActualTravelTime / 60.0) <= 15 THEN 1 ELSE NULL END),
	COUNT(CASE WHEN (ActualTravelTime / 60.0) > 10 AND (ActualTravelTime / 60.0) <= 15 AND (EstimatedTravelTime - ActualTravelTime) < -@Threshold * 60 THEN 1 ELSE NULL END),
	COUNT(CASE WHEN (ActualTravelTime / 60.0) > 10 AND (ActualTravelTime / 60.0) <= 15 AND (EstimatedTravelTime - ActualTravelTime) > @Threshold * 60 THEN 1 ELSE NULL END),
	
	COUNT(CASE WHEN (ActualTravelTime / 60.0) > 15 THEN 1 ELSE NULL END),
	COUNT(CASE WHEN (ActualTravelTime / 60.0) > 15 AND (EstimatedTravelTime - ActualTravelTime) < -@Threshold * 60 THEN 1 ELSE NULL END),
	COUNT(CASE WHEN (ActualTravelTime / 60.0) > 15 AND (EstimatedTravelTime - ActualTravelTime) > @Threshold * 60 THEN 1 ELSE NULL END)
FROM ETA_DATA_Calculations D
    JOIN ETA_DATA_ActualStops S ON S.DailyStopID = D.NextStopDailyID
    JOIN ETA_DATA_Trips T ON T.DailyTripID = S.DailyTripID
WHERE ActualTravelTime IS NOT NULL AND T.SubrouteID = @SubrouteID
GROUP BY S.SubrouteStopID
ORDER BY MIN(S.StopOrder)

SELECT
	T.SubrouteID,
	T.SubrouteStopID,
	SR.SubrouteName,
	S.StopName,
	S.StopOrder,
	T.Count1 Total1,
	T.NumberUnder1 Under1,
	T.NumberOver1 Over1,

	T.Count2 Total2,
	T.NumberUnder2 Under2,
	T.NumberOver2 Over2,

	T.Count3 Total3,
	T.NumberUnder3 Under3,
	T.NumberOver3 Over3,

	T.Count4 Total4,
	T.NumberUnder4 Under4,
	T.NumberOver4 Over4
FROM @temp T
    JOIN ETA_DATA_ActualStops S ON S.DailyStopID = T.DailyStopID
    JOIN ETA_DATA_Trips Trip ON Trip.DailyTripID = S.DailyTripID
    JOIN ETA_DATA_Subroutes SR ON SR.SubrouteID = Trip.SubrouteID