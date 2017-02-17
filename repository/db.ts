import * as SQL from "mssql";
import { Connection, Request, config, PreparedStatement } from "mssql";
import * as assert from "assert";
import * as fs from "fs";

export class QueryArg {
    name: string;
    value: any;
    type: any;
}

export class DB {
    private _connection: Connection;

    private _runStatement: PreparedStatement;

    constructor(config: config) {
        this._connection = new Connection(config);
    }

    Prepare(query: string, inputs?: any): Promise<PreparedStatement> {
        return new Promise<PreparedStatement>((resolve, reject) => {
            const ps = new PreparedStatement(this._connection);
            
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

    Connect(): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            this._connection.connect()
                .then(conn => resolve())
                .catch(err => reject(err));
        });
    }

    Stream<T>(command: string, args?: QueryArg[]): Request {
        const request: Request = new Request(this._connection);
        request.stream = true;

        if (args) {
            for (const item of args) {
                request.input(item.name, item.type, item.value);
            }
        }

        request.query<T>(command);
        return request;
    }

    Query<T>(command: string, args?: QueryArg[]): Promise<T[]> {
        const request: Request = new Request(this._connection);

        if (args) {
            for (const item of args) {
                request.input(item.name, item.type, item.value);
            }
        }

        return request.query<T>(command);
    }

    QueryMultiple(command: string, args?: QueryArg[]): Promise<any> {
        const request: Request = new Request(this._connection);
        request.multiple = true;

        if (args) {
            for (const item of args) {
                request.input(item.name, item.type, item.value);
            }
        }

        return request.query(command);
    }

    Execute<T>(sp: string, args?: QueryArg[]): Promise<T[]> {
        const request: Request = new Request(this._connection);
        
        if (args) {
            for (const item of args) {
                request.input(item.name, item.type, item.value);
            }
        }

        return request.execute(sp);
    }

    Close(): Promise<void> {
        return this._connection.close();
    }
}