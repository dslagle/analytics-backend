import * as fs from "fs";
import * as path from "path";

var test = {
    "1": "1",
    "2": "2",
    "3": "3",
    "4": "4"
}

const query = fs.readFileSync(path.join(__dirname, "./sql/test.sql")).toString();
console.log(query);