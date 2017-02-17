--DECLARE @Date DATETIME = '2017-01-28'
SELECT
    AR.RunID ScheduledRunID,
    AR.DailyRunID ActualRunID,
    AR.VehicleID,
    AR.DriverID,
    V.InternalVehicleID VehicleName,
    ISNULL(D.FirstName + ' ' + D.LastName, '<unknown>') DriverName,
    R.RunDescription Name,
    PulloutCompleted Started,
    PullinCompleted Completed,
    AR.ScheduledPullOut_Time ScheduledStartTime,
    AR.ScheduledPullIn_Time ScheduledEndTime,
    AR.PullOut_Time ActualStartTime,
    AR.PullIn_Time ActualEndTime
FROM tblActualFRRuns AR
    JOIN v_FRRuns R ON R.RunID = AR.RunID AND R.CalendarDate = AR.TripDate
    LEFT JOIN v_VehicleInstantiated V ON @date BETWEEN V.PropertyStartDateTime AND V.PropertyEndDateTime
        AND V.VehicleID = AR.VehicleID
    LEFT JOIN v_DriverInstantiated D ON @date BETWEEN D.PropertyStartDateTime AND D.PropertyEndDateTime
        AND D.DriverID = AR.DriverID
WHERE AR.TripDate = @date