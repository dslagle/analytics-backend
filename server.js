"use strict";
const express = require("express");
const bp = require("body-parser");
const http = require("http");
const data_router_1 = require("./routes/data.router");
let app = express();
const address = "localhost";
const port = 9000;
let server = http.createServer(app);
const io = null; //sio(server);
app.use(bp.urlencoded({ extended: true }));
app.use(bp.json());
app.use(function (request, response, next) {
    response.setHeader("Access-Control-Allow-Origin", "*");
    response.setHeader("Access-Control-Allow-Methods", "POST, GET, PATH, DELETE");
    response.setHeader("Access-Control-Allow-Headers", "Content-Type");
    next();
});
app.use('/data', data_router_1.DataRouter(io));
server.listen(port, () => {
    console.log(`Listening @ ${address}:${port}`);
});
//# sourceMappingURL=server.js.map