
--DECLARE @Threshold INT = 5 * 60;
--DECLARE @Date DATETIME = '2017-01-31'
DECLARE @Day INT = DATEPART(DW, @Date)

DECLARE @temp TABLE (
	SubrouteStopID INT,
	SubrouteID INT,
	Total INT,
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

INSERT INTO @temp (SubrouteStopID, SubrouteID, Total,
	Count1, NumberUnder1, NumberOver1,
	Count2, NumberUnder2, NumberOver2,
	Count3, NumberUnder3, NumberOver3,
	Count4, NumberUnder4, NumberOver4
)
SELECT
	S.SubrouteStopID,
	T.SubrouteID,
	COUNT(*),

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
		AND S.TripDate = @date
    JOIN ETA_DATA_Trips T ON T.DailyTripID = S.DailyTripID
WHERE ActualTravelTime IS NOT NULL
GROUP BY T.SubrouteID, S.SubrouteStopID
ORDER BY T.SubrouteID, MIN(S.StopOrder)

SELECT
	T.SubrouteID,
	SR.SubrouteName,
	SUM(T.Count1) Total1,
	SUM(T.NumberUnder1) Under1,
	SUM(T.NumberOver1) Over1,

	SUM(T.Count2) Total2,
	SUM(T.NumberUnder2) Under2,
	SUM(T.NumberOver2) Over2,
	
	SUM(T.Count3) Total3,
	SUM(T.NumberUnder3) Under3,
	SUM(T.NumberOver3) Over3,
	
	SUM(T.Count4) Total4,
	SUM(T.NumberUnder4) Under4,
	SUM(T.NumberOver4) Over4
FROM @temp T
	JOIN ETA_DATA_Subroutes SR ON SR.SubrouteID = T.SubrouteID
GROUP BY T.SubrouteID, SR.SubrouteName