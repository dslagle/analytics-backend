"use strict";
var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
exports.sql14a = {
    "user": "pmuser",
    "password": "pmtrip00",
    "server": "atl-sqla.rmasp2.local\\sqla",
    "database": "RM_GA_GRTA"
};
exports.sql08c = {
    "user": "pmuser",
    "password": "pmtrip00",
    "server": "atl-sql08c.rmasp2.local",
    "database": "master"
};
exports.sql08d = {
    "user": "pmuser",
    "password": "pmtrip00",
    "server": "atl-sql08d.rmasp2.local",
    "database": "master"
};
exports.sql08e = {
    "user": "pmuser",
    "password": "pmtrip00",
    "server": "atl-sql08e.rmasp2.local",
    "database": "master"
};
exports.home = {
    "user": "DJS",
    "password": "MooShoGaiPan10!",
    "server": "50.167.185.158",
    "database": "RM_GA_GRTA"
};
exports.qa2014 = {
    "user": "pmuser",
    "password": "pmtrip00",
    "server": "RMSQL2014\\SQL_2014",
    "database": "RM_ETA_Analytics"
};
exports.primary = __assign({}, exports.home, { "database": "RM_GA_GRTA" });
//export const primary: config = { ...sql08d, "database": "RM_CA_Porterville" }; 
//# sourceMappingURL=db.config.js.map