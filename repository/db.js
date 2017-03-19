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
    BulkInsert(rows) {
        const request = new mssql_1.Request(this._connection);
        return request.bulk(rows);
    }
    Stream(command, args) {
        const request = new mssql_1.Request(this._connection);
        request.stream = true;
        this.AddArgs(request, args).query(command);
        return request;
    }
    Query(command, args) {
        const request = new mssql_1.Request(this._connection);
        return this.AddArgs(request, args).query(command);
    }
    QueryMultiple(command, args) {
        const request = new mssql_1.Request(this._connection);
        request.multiple = true;
        return this.AddArgs(request, args).query(command);
    }
    Execute(sp, args) {
        const request = new mssql_1.Request(this._connection);
        return this.AddArgs(request, args).execute(sp);
    }
    AddArgs(request, args) {
        if (args) {
            for (const item of args) {
                request.input(item.name, item.type, item.value);
            }
        }
        return request;
    }
    Close() {
        return this._connection.close();
    }
}
DB.NotNullable = { nullable: false };
DB.Nullable = { nullable: true };
DB.PrimaryKey = { primary: true };
exports.DB = DB;
//# sourceMappingURL=db.js.map