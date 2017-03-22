"use strict";
var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
function arrayToObject(values, key, keyTransform = (k) => k) {
    return values.reduce(function (p, n) { return __assign({}, p, { [keyTransform(n[key])]: n }); }, {});
}
function groupArray(values, key) {
    const combined = {};
    values.forEach(v => {
        if (!combined[v[key]])
            combined[v[key]] = [];
        combined[v[key]].push(v);
    });
    return combined;
}
function objectToArray(obj, filter = (i) => true) {
    let arr = [];
    for (const key in obj)
        if (filter(obj[key]))
            arr.push(obj[key]);
    return arr;
}
function memoize(keyGen = (args) => args.reduce((a1, a2) => `${a1},${a2}`)) {
    return function (target, key, descriptor) {
        const store = {};
        return {
            value: function (...args) {
                const key = keyGen(args);
                if (store[key]) {
                    return store[key];
                }
                const result = descriptor.value.call(this, ...args);
                store[key] = result;
                return result;
            }
        };
    };
}
exports.Helpers = {
    ArrayToObject: arrayToObject,
    ObjectToArray: objectToArray,
    GroupArray: groupArray,
    memoize: memoize
};
//# sourceMappingURL=helpers.js.map