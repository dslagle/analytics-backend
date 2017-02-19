
-- DECLARE @date DATETIME = '2017-02-17'
-- DECLARE @threshold INT = 3*60
-- DECLARE @min INT = 60*9
-- DECLARE @max INT = 60*11

DECLARE @averagesByStop TABLE (
	SubrouteStopID INT,
	DailyStopID INT PRIMARY KEY,
	TotalCount INT,
	SecondsOver INT,
	SecondsUnder INT
)

DECLARE @googleAveragesByStop TABLE (
	SubrouteStopID INT,
	DailyStopID INT PRIMARY KEY,
	TotalCount INT,
	SecondsOver INT,
	SecondsUnder INT
)

INSERT INTO @averagesByStop (SubrouteStopID, DailyStopID, TotalCount, SecondsOver, SecondsUnder)
SELECT
	S.SubrouteStopID,
	S.DailyStopID,
	COUNT(*),
	AVG(CASE WHEN C.EstimatedTravelTime > C.ActualTravelTime THEN C.EstimatedTravelTime - C.ActualTravelTime ELSE 0 END),
	AVG(CASE WHEN C.EstimatedTravelTime < C.ActualTravelTime THEN C.EstimatedTravelTime - C.ActualTravelTime ELSE 0 END)
FROM ETA_DATA_Calculations C
	JOIN ETA_DATA_ActualStops S ON S.DailyStopID = C.NextStopDailyID
		AND S.TripDate = @date
		AND S.ArriveInput = 'Auto Completion'
WHERE C.ActualTravelTime BETWEEN @min AND @max
GROUP BY
	S.DailyStopID, S.SubrouteStopID

INSERT INTO @googleaveragesByStop (SubrouteStopID, DailyStopID, TotalCount, SecondsOver, SecondsUnder)
SELECT
	S.SubrouteStopID,
	S.DailyStopID,
	COUNT(*),
	AVG(CASE WHEN G.EstimatedTravelTimeInTraffic >= C.ActualTravelTime THEN G.EstimatedTravelTimeInTraffic - C.ActualTravelTime ELSE 0 END),
	AVG(CASE WHEN G.EstimatedTravelTimeInTraffic < C.ActualTravelTime THEN G.EstimatedTravelTimeInTraffic - C.ActualTravelTime ELSE 0 END)
FROM ETA_DATA_Calculations C
	JOIN ETA_DATA_ActualStops S ON S.DailyStopID = C.NextStopDailyID
		AND S.TripDate = @date
		AND S.ArriveInput = 'Auto Completion'
	JOIN ETA_DATA_GoogleResult G ON G.QueryID = C.QueryID
WHERE C.ActualTravelTime BETWEEN @min AND @max
GROUP BY
	S.DailyStopID, S.SubrouteStopID

SELECT
	COUNT(*) Total,
	CASE WHEN COUNT(*) > 0
    	THEN COUNT(CASE WHEN SecondsOver > @threshold THEN 1 ELSE NULL END) / CAST(COUNT(*) AS FLOAT)
        ELSE NULL
    END PercentOver,
	CASE WHEN COUNT(*) > 0
    	THEN COUNT(CASE WHEN SecondsUnder < -@threshold THEN 1 ELSE NULL END) / CAST(COUNT(*) AS FLOAT)
        ELSE NULL
    END PercentUnder,
	CASE WHEN COUNT(*) > 0
    	THEN COUNT(CASE WHEN SecondsOver <= @threshold AND SecondsUnder >= -@threshold THEN 1 ELSE NULL END) / CAST(COUNT(*) AS FLOAT)
        ELSE NULL
    END PercentOnTime,
	
	AVG(SecondsOver) AverageOver,
	AVG(SecondsUnder) AverageUnder,
	MAX(SecondsOver) MaxOver,
	MIN(SecondsUnder) MaxUnder
FROM @averagesByStop

SELECT
	COUNT(*) Total,
	CASE WHEN COUNT(*) > 0
    	THEN COUNT(CASE WHEN C.EstimatedTravelTime - C.ActualTravelTime < -@threshold THEN 1 ELSE NULL END) / CAST(COUNT(*) AS FLOAT)
        ELSE NULL
    END PercentUnder,
	CASE WHEN COUNT(*) > 0
    	THEN COUNT(CASE WHEN C.EstimatedTravelTime - C.ActualTravelTime > @threshold THEN 1 ELSE NULL END) / CAST(COUNT(*) AS FLOAT)
        ELSE NULL
    END PercentOver,
	CASE WHEN COUNT(*) > 0
    	THEN COUNT(CASE WHEN ABS(C.EstimatedTravelTime - C.ActualTravelTime) <= @threshold THEN 1 ELSE NULL END) / CAST(COUNT(*) AS FLOAT)
        ELSE NULL
    END PercentOnTime,

	AVG(CASE WHEN C.EstimatedTravelTime > C.ActualTravelTime THEN C.EstimatedTravelTime - C.ActualTravelTime ELSE 0 END) AverageOver,
	AVG(CASE WHEN C.EstimatedTravelTime < C.ActualTravelTime THEN C.EstimatedTravelTime - C.ActualTravelTime ELSE 0 END) AverageUnder,
	MIN(CASE WHEN C.EstimatedTravelTime > C.ActualTravelTime THEN C.EstimatedTravelTime - C.ActualTravelTime ELSE 0 END) MaxOver,
	MIN(CASE WHEN C.EstimatedTravelTime < C.ActualTravelTime THEN C.EstimatedTravelTime - C.ActualTravelTime ELSE 0 END) MaxUnder
FROM ETA_DATA_Calculations C
	JOIN ETA_DATA_ActualStops S ON S.DailyStopID = C.NextStopDailyID
		AND S.TripDate = @date
		AND S.ArriveInput = 'Auto Completion'
WHERE C.ActualTravelTime BETWEEN @min AND @max

SELECT
	COUNT(*) Total,
	CASE WHEN COUNT(*) > 0
    	THEN COUNT(CASE WHEN SecondsOver > @threshold THEN 1 ELSE NULL END) / CAST(COUNT(*) AS FLOAT)
        ELSE NULL
    END PercentOver,
	CASE WHEN COUNT(*) > 0
    	THEN COUNT(CASE WHEN SecondsUnder < -@threshold THEN 1 ELSE NULL END) / CAST(COUNT(*) AS FLOAT)
        ELSE NULL
    END PercentUnder,
	CASE WHEN COUNT(*) > 0
    	THEN COUNT(CASE WHEN SecondsOver <= @threshold AND SecondsUnder >= -@threshold THEN 1 ELSE NULL END) / CAST(COUNT(*) AS FLOAT)
        ELSE NULL
    END PercentOnTime,

	AVG(SecondsOver) AverageOver,
	AVG(SecondsUnder) AverageUnder,
	MAX(SecondsOver) MaxOver,
	MIN(SecondsUnder) MaxUnder
FROM @googleaveragesByStop

SELECT
	COUNT(*) Total,
    CASE WHEN COUNT(*) > 0
    	THEN COUNT(CASE WHEN G.EstimatedTravelTimeInTraffic - C.ActualTravelTime < -@threshold THEN 1 ELSE NULL END) / CAST(COUNT(*) AS FLOAT)
        ELSE NULL
    END PercentUnder,
	CASE WHEN COUNT(*) > 0
    	THEN COUNT(CASE WHEN G.EstimatedTravelTimeInTraffic - C.ActualTravelTime > @threshold THEN 1 ELSE NULL END)  / CAST(COUNT(*) AS FLOAT)
        ELSE NULL
    END PercentOver,
	CASE WHEN COUNT(*) > 0
    	THEN COUNT(CASE WHEN ABS(G.EstimatedTravelTimeInTraffic - C.ActualTravelTime) <= @threshold THEN 1 ELSE NULL END) / CAST(COUNT(*) AS FLOAT)
        ELSE NULL
    END PercentOnTime,

	AVG(CASE WHEN G.EstimatedTravelTimeInTraffic > C.ActualTravelTime THEN G.EstimatedTravelTimeInTraffic - C.ActualTravelTime ELSE 0 END) AverageOver,
	AVG(CASE WHEN G.EstimatedTravelTimeInTraffic < C.ActualTravelTime THEN G.EstimatedTravelTimeInTraffic - C.ActualTravelTime ELSE 0 END) AverageUnder,
	MIN(CASE WHEN G.EstimatedTravelTimeInTraffic > C.ActualTravelTime THEN G.EstimatedTravelTimeInTraffic - C.ActualTravelTime ELSE 0 END) MaxOver,
	MIN(CASE WHEN G.EstimatedTravelTimeInTraffic < C.ActualTravelTime THEN G.EstimatedTravelTimeInTraffic - C.ActualTravelTime ELSE 0 END) MaxUnder
FROM ETA_DATA_Calculations C
	JOIN ETA_DATA_ActualStops S ON S.DailyStopID = C.NextStopDailyID
		AND S.TripDate = @date
		AND S.ArriveInput = 'Auto Completion'
	JOIN ETA_DATA_GoogleResult G ON G.QueryID = C.QueryID
WHERE C.ActualTravelTime BETWEEN @min AND @max