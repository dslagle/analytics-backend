
-- DECLARE @Threshold INT = 5;
-- DECLARE @Date DATETIME = '2017-02-16'
-- DECLARE @Day INT = DATEPART(DW, @Date)
-- DECLARE @SubrouteID INT = 3745

SELECT CASE WHEN '2017-02-23 14:00:00.342' > @date THEN 'True' ELSE 'False' END