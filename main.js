"use strict";
const fs = require("fs");
const path = require("path");
var test = {
    "1": "1",
    "2": "2",
    "3": "3",
    "4": "4"
};
const query = fs.readFileSync(path.join(__dirname, "./sql/test.sql")).toString();
console.log(query);
//# sourceMappingURL=main.js.map