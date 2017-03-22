import { Router } from "express";
import { Helpers } from "../helpers/helpers";
import * as math from "../model/math";

export const router = Router();

router.get("/fib/:num", function(request, response) {
    let num = +request.params.num;
    response.json({ result: math.fib(num) });
});

router.get("/average/:nums", function(request, response) {
    let nums = request.params.nums.split(",").map(n => +n);
    
    response.json({ result: math.average(nums) });
});

router.get("/median/:nums", function(request, response) {
    let nums = request.params.nums.split(",").map(n => +n);

    response.json({ result: math.median(nums) });
});