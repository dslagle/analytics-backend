import { config } from "mssql"

export const sql14a: config = {
    "user": "pmuser",
    "password": "pmtrip00",
    "server": "atl-sqla.rmasp2.local\\sqla",
    "database": "RM_GA_GRTA"
};

export const sql08c: config = {
    "user": "pmuser",
    "password": "pmtrip00",
    "server": "atl-sql08c.rmasp2.local",
    "database": "master"
};

export const sql08d: config = {
    "user": "pmuser",
    "password": "pmtrip00",
    "server": "atl-sql08d.rmasp2.local",
    "database": "master"
};

export const sql08e: config = {
    "user": "pmuser",
    "password": "pmtrip00",
    "server": "atl-sql08e.rmasp2.local",
    "database": "master"
};

export const home: config = {
    "user": "DJS",
    "password": "MooShoGaiPan10!",
    "server": "50.167.185.158",
    "database": "RM_GA_GRTA"
};

export const qa2014: config = {
    "user": "pmuser",
    "password": "pmtrip00",
    "server": "RMSQL2014\\SQL_2014",
    "database": "RM_ETA_Analytics"
};

export const primary: config = { ...home, "database": "RM_GA_GRTA" }
//export const primary: config = { ...sql08d, "database": "RM_CA_Porterville" };