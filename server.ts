import * as express from "express";
import * as path from "path";
import * as bp from "body-parser";
import * as http from "http";
import * as sio from "socket.io";
import { DataRouter } from "./routes/data.router";

let app = express();

const address: string = "localhost";
const port: number = 9000;

let server = http.createServer(app);
const io = null;//sio(server);

app.use(bp.urlencoded({ extended: true }));
app.use(bp.json());

app.use(function(request, response, next) {
    response.setHeader("Access-Control-Allow-Origin", "*");
    response.setHeader("Access-Control-Allow-Methods", "POST, GET, PATH, DELETE");
    response.setHeader("Access-Control-Allow-Headers", "Content-Type");
    next();
});

app.use('/data', DataRouter(io));

server.listen(port, () => {
    console.log(`Listening @ ${address}:${port}`);
});