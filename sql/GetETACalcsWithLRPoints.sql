
--DECLARE @FromDateTime DATETIME = '2017'

DECLARE @From DATETIME = DATEADD(HOUR, 5, @FromDateTime)
DECLARE @To DATETIME = DATEADD(SECOND, 5, @From)

DECLARE @calcs TABLE (
	QueryID VARCHAR(50),
	OriginLat FLOAT,
    OriginLng FLOAT,
    DestinationLat FLOAT,
    DestinationLng FLOAT,
    ActualDateTime DATETIME,
    ReceivedDateTime DATETIME,
    InsertDateTime DATETIME,
	PreviousStopID INT,
	NextStopID INT
)

DECLARE @result TABLE (
    QueryID VARCHAR(50),
    PairID INT IDENTITY(1, 1) NOT NULL,
    OriginLat FLOAT,
    OriginLng FLOAT,
    DestinationLat FLOAT,
    DestinationLng FLOAT,
	PreviousSubrouteStopID INT,
    NextSubrouteStopID INT,
	PreviousLongLatSequence INT,
	CurrentLongLatSequence INT,
	NextLongLatSequence INT
)

DECLARE @points TABLE (
    RN INT,
    CN INT,
    QueryID VARCHAR(50),
    Lat FLOAT,
    Lng FLOAT,
	ID INT,
    SequenceNumber INT
)

INSERT INTO @calcs (QueryID, OriginLat, OriginLng, DestinationLat, DestinationLng, ActualDateTime, ReceivedDateTime, InsertDateTime, PreviousStopID, NextStopID)
SELECT
    O.QueryID,
    O.OnRouteLatitude OriginLat,
    O.OnRouteLongitude OriginLng,
    A.Ycoordinate DestinationLat,
    A.Xcoordinate DestinationLng,
    GPS.ActualDateTime,
    GPS.ReceivedDateTime,
    DATEADD(HOUR, -5, O.InsertDateTime),
	ASTP.FRTripsPropertiesFRRouteStopID,
	ASTN.FRTripsPropertiesFRRouteStopID
FROM GetRouteStatus_Output O
    JOIN tblStreetRouteActual GPS ON GPS.Transaction_Tracking_value = O.QueryID
	JOIN tblActualFRRouteStopTimes ASTN ON ASTN.DailyTimetableID = O.DailyTimeTableID
	JOIN tblActualFRRouteStopTimes ASTP ON ASTP.DailyTripID = ASTN.DailyTripID
		AND ASTP.StopOrder = ASTN.StopOrder - 1
    JOIN tblAddress A ON ASTN.AddressID = A.AddressID
WHERE O.InsertDateTime > @From
    AND O.InsertDateTime < @To
	--AND O.QueryID = '087c6c1b-545a-42cf-b43b-ef16b3ca1634'

INSERT INTO @result (QueryID, OriginLat, OriginLng, DestinationLat, DestinationLng, PreviousSubrouteStopID, NextSubrouteStopID, PreviousLongLatSequence, CurrentLongLatSequence, NextLongLatSequence)
SELECT
	C.QueryID,
    C.OriginLat,
	C.OriginLng,
	C.DestinationLat,
	C.DestinationLng,
	TSP.FRSubroutePropertiesFRRouteStopID,
	TSN.FRSubroutePropertiesFRRouteStopID,
	LRLPP.LongLatSequence,
    LRLPC.LongLatSequence,
	LRLPN.LongLatSequence
FROM @calcs C
    JOIN t_FRTripsPropertiesFRRouteStop TSP ON TSP.FRTripsPropertiesFRRouteStopID = C.PreviousStopID
	JOIN t_FRTripsPropertiesFRRouteStop TSN ON TSN.FRTripsPropertiesFRRouteStopID = C.NextStopID
    JOIN t_FRSubroutePropertiesFRRouteStop SRSP ON SRSP.FRSubroutePropertiesFRRouteStopID = TSP.FRSubroutePropertiesFRRouteStopID
	JOIN t_FRSubroutePropertiesFRRouteStop SRSN ON SRSN.FRSubroutePropertiesFRRouteStopID = TSN.FRSubroutePropertiesFRRouteStopID
	JOIN t_FRSubrouteProperties SRP ON SRP.FRSubroutePropertiesID = SRSP.FRSubroutePropertiesID
    JOIN tblLandRoute LR ON LR.LandRouteID = SRP.LandRouteID
    JOIN tblLandRouteLine LRL ON LRL.LandRouteLineID = LR.LandRouteLineID
	JOIN tblLandRouteLinePoints LRLPP ON LRLPP.LandRouteLinePointsID = SRSP.LandRouteLinePointsID
	JOIN tblLandRouteLinePoints LRLPN ON LRLPN.LandRouteLinePointsID = SRSN.LandRouteLinePointsID
	CROSS APPLY (
		SELECT * FROM (
			SELECT
				*,
				ROW_NUMBER() OVER (PARTITION BY LP.Latitude, LP.Longitude ORDER BY LongLatSequence DESC) AS RND,
				ROW_NUMBER() OVER (
					ORDER BY SQRT(POWER(C.OriginLng - LP.Longitude, 2)
					+ POWER(C.OriginLat - LP.Latitude, 2))
				) AS RN
			FROM tblLandRouteLinePoints LP WHERE LP.LandRouteLineID = LRL.LandRouteLineID
				AND LP.LongLatSequence > LRLPP.LongLatSequence AND LP.LongLatSequence <= LRLPN.LongLatSequence
		) AS Ordered
		WHERE Ordered.RN = 1 AND Ordered.RND = 1
	) AS LRLPC
	

INSERT INTO @points (RN, CN, QueryID, Lat, Lng, SequenceNumber, ID)
SELECT
    ROW_NUMBER() OVER (PARTITION BY R.PairID ORDER BY LRLP.LongLatSequence),
    COUNT(*) OVER (PARTITION BY R.PairID),
    R.QueryID,
    LRLP.Latitude,
    LRLP.Longitude,
	LRLP.LongLatSequence,
	LRLP.Attributes
FROM @result R
    JOIN t_FRSubroutePropertiesFRRouteStop SRSP ON SRSP.FRSubroutePropertiesFRRouteStopID = R.PreviousSubrouteStopID
    JOIN t_FRSubrouteProperties SRP ON SRP.FRSubroutePropertiesID = SRSP.FRSubroutePropertiesID
    JOIN tblLandRoute LR ON LR.LandRouteID = SRP.LandRouteID
    JOIN tblLandRouteLine LRL ON LRL.LandRouteLineID = LR.LandRouteLineID
    JOIN tblLandRouteLinePoints LRLP ON LRLP.LandRoutelineID = LRL.LandRoutelineID
        AND LRLP.LongLatSequence > R.CurrentLongLatSequence AND LRLP.LongLatSequence < R.NextLongLatSequence

SELECT * FROM @calcs

SELECT P.QueryID, P.SequenceNumber, P.Lat, P.Lng, P.ID Attributes
FROM @points P
WHERE CASE WHEN CN <= 20 THEN 0 ELSE (P.RN % CEILING(CN / 23.0)) END = 0
ORDER bY P.RN
