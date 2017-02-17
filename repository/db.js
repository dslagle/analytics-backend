"use strict";
const mssql_1 = require("mssql");
class QueryArg {
}
exports.QueryArg = QueryArg;
class DB {
    constructor(config) {
        this._connection = new mssql_1.Connection(config);
    }
    Prepare(query, inputs) {
        return new Promise((resolve, reject) => {
            const ps = new mssql_1.PreparedStatement(this._connection);
            if (inputs) {
                for (const key in inputs) {
                    ps.input(key, inputs[key]);
                }
            }
            ps.prepare(query)
                .then(() => resolve(ps))
                .catch(err => reject(err));
        });
    }
    Connect() {
        return new Promise((resolve, reject) => {
            this._connection.connect()
                .then(conn => resolve())
                .catch(err => reject(err));
        });
    }
    Stream(command, args) {
        const request = new mssql_1.Request(this._connection);
        request.stream = true;
        if (args) {
            for (const item of args) {
                request.input(item.name, item.type, item.value);
            }
        }
        request.query(command);
        return request;
    }
    Query(command, args) {
        const request = new mssql_1.Request(this._connection);
        if (args) {
            for (const item of args) {
                request.input(item.name, item.type, item.value);
            }
        }
        return request.query(command);
    }
    QueryMultiple(command, args) {
        const request = new mssql_1.Request(this._connection);
        request.multiple = true;
        if (args) {
            for (const item of args) {
                request.input(item.name, item.type, item.value);
            }
        }
        return request.query(command);
    }
    Execute(sp, args) {
        const request = new mssql_1.Request(this._connection);
        if (args) {
            for (const item of args) {
                request.input(item.name, item.type, item.value);
            }
        }
        return request.execute(sp);
    }
    Close() {
        return this._connection.close();
    }
}
exports.DB = DB;
//# sourceMappingURL=db.js.map