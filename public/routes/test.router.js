"use strict";
const express_1 = require("express");
const math = require("../model/math");
exports.router = express_1.Router();
exports.router.get("/fib/:num", function (request, response) {
    let num = +request.params.num;
    response.json({ result: math.fib(num) });
});
exports.router.get("/average/:nums", function (request, response) {
    let nums = request.params.nums.split(",").map(n => +n);
    response.json({ result: math.average(nums) });
});
exports.router.get("/median/:nums", function (request, response) {
    let nums = request.params.nums.split(",").map(n => +n);
    response.json({ result: math.median(nums) });
});
