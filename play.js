const fs = require("fs");
const term = require("terminal-kit").terminal;

function* iter(arr) {
    for (let i = 0; i < arr.length; i++) {
        yield arr[i];
    }
}

function ST(timeout, cb) {
    setInterval(cb, timeout);
}

function* RF(cb) {
    const fn = "./sql/queries/GetQueriesForDate.sql";
    const text = yield fs.readFile(fn, cb);
    console.log(text);
}

function flow(gen) {
    function cb(err) {
        if (err) func.throw(err);

        const results = [...arguments].slice(1);
        func.next(results.length > 1 ? results : results[0]);
    }

    const func = gen(cb);
    func.next();
}

// let totalQueries = 100382;
// term('Total Queries: ').saveCursor().bold(`${totalQueries}\n`);

// setTimeout(() => term.restoreCursor().green.bold('blammo!\n'), 500);

let test = [ 'blue', 'red', 'green' ];
let a = test;
test.push('orange');
test = [];
test.push('black');
//console.log(a);

let order = [5, 2, 8, 4, 2, 0];
console.log(order.sort((a, b) => a <= b ? -1 : 1));
