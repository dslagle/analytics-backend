
--DECLARE @Threshold INT = 3;
--DECLARE @Date DATETIME = '2017-02-16'
DECLARE @Day INT = DATEPART(DW, @Date)

DECLARE @temp TABLE (
	SubrouteStopID INT,
	SubrouteID INT,
	Total INT,
	Count1 INT,
	GoogleUnder1 INT,
	GoogleOver1 INT,
	NumberUnder1 INT,
	NumberOver1 INT,
	Count2 INT,
	GoogleUnder2 INT,
	GoogleOver2 INT,
	NumberUnder2 INT,
	NumberOver2 INT
)

INSERT INTO @temp (SubrouteStopID, SubrouteID, Total,
	Count1,
	NumberUnder1, NumberOver1,
	GoogleUnder1, GoogleOver1,
	Count2,
	NumberUnder2, NumberOver2,
	GoogleUnder2, GoogleOver2
)
SELECT
	S.SubrouteStopID,
	T.SubrouteID,
	COUNT(*),

	COUNT(CASE WHEN (ActualTravelTime / 60.0) >= 9 AND (ActualTravelTime / 60.0) <= 11 THEN 1 ELSE NULL END),
	COUNT(CASE WHEN (ActualTravelTime / 60.0) >= 9 AND (ActualTravelTime / 60.0) <= 11 AND (D.EstimatedTravelTime - ActualTravelTime) < -@Threshold * 60 THEN 1 ELSE NULL END),
	COUNT(CASE WHEN (ActualTravelTime / 60.0) >= 9 AND (ActualTravelTime / 60.0) <= 11 AND (D.EstimatedTravelTime - ActualTravelTime) > @Threshold * 60 THEN 1 ELSE NULL END),
	
	COUNT(CASE WHEN (ActualTravelTime / 60.0) >= 9 AND (ActualTravelTime / 60.0) <= 11 AND (G.EstimatedTravelTimeInTraffic - ActualTravelTime) < -@Threshold * 60 THEN 1 ELSE NULL END),
	COUNT(CASE WHEN (ActualTravelTime / 60.0) >= 9 AND (ActualTravelTime / 60.0) <= 11 AND (G.EstimatedTravelTimeInTraffic - ActualTravelTime) > @Threshold * 60 THEN 1 ELSE NULL END),

	COUNT(CASE WHEN (ActualTravelTime / 60.0) >= 29 AND (ActualTravelTime / 60.0) <= 31 THEN 1 ELSE NULL END),
	COUNT(CASE WHEN (ActualTravelTime / 60.0) >= 29 AND (ActualTravelTime / 60.0) <= 31 AND (D.EstimatedTravelTime - ActualTravelTime) < -@Threshold * 60 THEN 1 ELSE NULL END),
	COUNT(CASE WHEN (ActualTravelTime / 60.0) >= 29 AND (ActualTravelTime / 60.0) <= 31 AND (D.EstimatedTravelTime - ActualTravelTime) > @Threshold * 60 THEN 1 ELSE NULL END),

	COUNT(CASE WHEN (ActualTravelTime / 60.0) >= 29 AND (ActualTravelTime / 60.0) <= 31 AND (G.EstimatedTravelTimeInTraffic - ActualTravelTime) < -@Threshold * 60 THEN 1 ELSE NULL END),
	COUNT(CASE WHEN (ActualTravelTime / 60.0) >= 29 AND (ActualTravelTime / 60.0) <= 31 AND (G.EstimatedTravelTimeInTraffic - ActualTravelTime) > @Threshold * 60 THEN 1 ELSE NULL END)
FROM ETA_DATA_Calculations D
    JOIN ETA_DATA_GoogleResult G ON G.QueryID = D.QueryID
    JOIN ETA_DATA_ActualStops S ON S.DailyStopID = D.NextStopDailyID
		AND S.TripDate = @date
    JOIN ETA_DATA_Trips T ON T.DailyTripID = S.DailyTripID
WHERE D.ActualTravelTime IS NOT NULL
GROUP BY T.SubrouteID, S.SubrouteStopID
ORDER BY T.SubrouteID, MIN(S.StopOrder)

SELECT
	T.SubrouteID,
	SR.SubrouteName,
	SUM(T.Count1) Total1,
	SUM(T.NumberUnder1) Under1,
	SUM(T.NumberOver1) Over1,
	SUM(T.GoogleUnder1) GoogleUnder1,
	SUM(T.GoogleOver1) GoogleOver1,

	SUM(T.Count2) Total2,
	SUM(T.NumberUnder2) Under2,
	SUM(T.NumberOver2) Over2,
	SUM(T.GoogleUnder2) GoogleUnder2,
	SUM(T.GoogleOver2) GoogleOver2
FROM @temp T
	JOIN ETA_DATA_Subroutes SR ON SR.SubrouteID = T.SubrouteID
		AND SR.TripDate = @date
GROUP BY T.SubrouteID, SR.SubrouteName