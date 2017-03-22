
--DECLARE @Threshold INT = 5;
--DECLARE @Date DATETIME = '2017-01-31'
DECLARE @Day INT = DATEPART(DW, @Date)
DECLARE @Percent FLOAT = 0.10

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
	D.SubrouteStopID,
	D.PatternID,
	COUNT(ETAOffMinutes),

	COUNT(CASE WHEN MinutesToNextStop >= 0 AND MinutesToNextStop <= 5 THEN 1 ELSE NULL END),
	COUNT(CASE WHEN MinutesToNextStop >= 0 AND MinutesToNextStop <= 5 AND ETAOffMinutes < -@Threshold THEN 1 ELSE NULL END),
	COUNT(CASE WHEN MinutesToNextStop >= 0 AND MinutesToNextStop <= 5 AND ETAOffMinutes > @Threshold THEN 1 ELSE NULL END),

	COUNT(CASE WHEN MinutesToNextStop > 5 AND MinutesToNextStop <= 10 THEN 1 ELSE NULL END),
	COUNT(CASE WHEN MinutesToNextStop > 5 AND MinutesToNextStop <= 10 AND ETAOffMinutes < -@Threshold THEN 1 ELSE NULL END),
	COUNT(CASE WHEN MinutesToNextStop > 5 AND MinutesToNextStop <= 10 AND ETAOffMinutes > @Threshold THEN 1 ELSE NULL END),

	COUNT(CASE WHEN MinutesToNextStop > 10 AND MinutesToNextStop <= 15 THEN 1 ELSE NULL END),
	COUNT(CASE WHEN MinutesToNextStop > 10 AND MinutesToNextStop <= 15 AND ETAOffMinutes < -@Threshold THEN 1 ELSE NULL END),
	COUNT(CASE WHEN MinutesToNextStop > 10 AND MinutesToNextStop <= 15 AND ETAOffMinutes > @Threshold THEN 1 ELSE NULL END),
	
	COUNT(CASE WHEN MinutesToNextStop > 15 THEN 1 ELSE NULL END),
	COUNT(CASE WHEN MinutesToNextStop > 15 AND ETAOffMinutes < -@Threshold THEN 1 ELSE NULL END),
	COUNT(CASE WHEN MinutesToNextStop > 15 AND ETAOffMinutes > @Threshold THEN 1 ELSE NULL END)
FROM DJS_ETA_DATA D
WHERE ETAOffMinutes IS NOT NULL AND D.PatternID = @SubrouteID
GROUP BY D.PatternID, D.SubrouteStopID
ORDER BY D.PatternID, MIN(D.StopOrder)

SELECT
	T.SubrouteID,
	T.SubrouteStopID,
	ISNULL(SRE.SubrouteName, SRP.SubrouteName) SubrouteName,
	ISNULL(RSE.name, RSP.name) StopName,
	SRS.StopOrder,
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
	JOIN t_FRSubrouteProperties SRP ON SRP.FRSubrouteID = T.SubrouteID
		AND @Date BETWEEN SRP.EffectiveStartDate AND SRP.EffectiveEndDate
		AND @Day = SRP.DayOfWeek
	LEFT JOIN t_FRSubroutePropertyExceptions SRE ON SRE.FRSubroutePropertiesID = SRP.FRSubroutePropertiesID
		AND @Date = SRE.ExceptionDate
	
	JOIN t_FRSubroutePropertiesFRRouteStop SRS ON SRS.FRSubroutePropertiesFRRouteStopID = T.SubrouteStopID
	
	JOIN t_FRRouteStopProperties RSP ON RSP.FRRouteStopID = SRS.FRRouteStopID
		AND @Date BETWEEN RSP.EffectiveStartDate AND RSP.EffectiveEndDate
		AND @Day = RSP.DayOfWeek
	LEFT JOIN t_FRRouteStopPropertyExceptions RSE ON RSE.FRRouteStopPropertiesID = RSP.FRRouteStopPropertiesID
		AND @Date = RSE.ExceptionDate