
--DECLARE @Threshold INT = 5;
--DECLARE @Date DATETIME = '2017-02-16'
--DECLARE @SubrouteID INT = 3745

DECLARE @temp TABLE (
	SubrouteStopID INT,
	SubrouteID INT,
    DailyStopID INT,
	Count1 INT,
	NumberUnder1 INT,
	NumberOver1 INT,
    GoogleUnder1 INT,
    GoogleOver1 INT,
	Count2 INT,
	NumberUnder2 INT,
	NumberOver2 INT,
    GoogleUnder2 INT,
    GoogleOver2 INT
)

INSERT INTO @temp (SubrouteStopID, SubrouteID, DailyStopID,
	Count1,
    NumberUnder1, NumberOver1,
    GoogleUnder1, GoogleOver1,
	Count2,
    NumberUnder2, NumberOver2,
    GoogleUnder2, GoogleOver2
)
SELECT
	S.SubrouteStopID,
	MIN(T.SubrouteID),
    MIN(S.DailyStopID),

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
		AND S.TripDate = @Date
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

    T.GoogleUnder1,
    T.GoogleOver1,

	T.Count2 Total2,
	T.NumberUnder2 Under2,
	T.NumberOver2 Over2,

    T.GoogleUnder2,
    T.GoogleOver2
FROM @temp T
    JOIN ETA_DATA_ActualStops S ON S.DailyStopID = T.DailyStopID
    JOIN ETA_DATA_Trips Trip ON Trip.DailyTripID = S.DailyTripID
    JOIN ETA_DATA_Subroutes SR ON SR.SubrouteID = Trip.SubrouteID
		AND SR.TripDate = Trip.TripDate