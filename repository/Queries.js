"use strict";
exports.Queries = {
    "listVehiclesForCurrentDate": `
            SELECT V.VehicleID, V.InternalVehicleID as Name FROM tblActualFRRuns R
                JOIN v_VehicleInstantiated V ON V.VehicleID = R.VehicleID AND R.TripDate BETWEEN V.PropertyStartDateTime AND V.PropertyEndDateTime
            WHERE R.TripDate = DATEADD(dd, 0, DATEDIFF(dd, 0, GETDATE())) AND R.PullOutCompleted = 1 AND R.PullInCompleted = 0
        `,
    "test": `
            SELECT name FROM sys.databases
        `,
    "test2": `
            SELECT TOP 1 * FROM tblActualFRRuns R ORDER BY TripDate DESC
        `
};
//# sourceMappingURL=Queries.js.map