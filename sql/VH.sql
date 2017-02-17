
DECLARE @Threshold INT = 5;
DECLARE @Date DATETIME = '2017-01-31'
DECLARE @Day INT = DATEPART(DW, @Date)
DECLARE @SubrouteID INT = 3745


SELECT TOP 10 O.InsertDateTime, GPS.ActualDateTime, GPS.ReceivedDateTime
FROM GetRouteStatus_Output O
    JOIN tblStreetRouteActual GPS ON GPS.Transaction_Tracking_value = O.QueryID
