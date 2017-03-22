
-- DECLARE @start DATETIME = '2016-12-01'
-- DECLARE @end DATETIME = '2016-12-31 23:59:59'

SELECT C.CalendarDate, COUNT(AST.DailyTimetableID) "Count"
FROM tblCalendar C
    LEFT JOIN tblActualFRTrips AT ON AT.TripDate = C.CalendarDate
    LEFT JOIN tblActualFRRouteStopTimes AST ON AT.DailyTripID = AST.DailyTripID
        AND AST.ArrivalInputID <> 8
WHERE C.CalendarDate BETWEEN @start AND @end
GROUP BY C.CalendarDate
ORDER BY C.CalendarDate
