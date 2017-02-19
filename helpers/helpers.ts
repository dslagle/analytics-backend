import * as _ from "lodash";

function arrayToObject(values: any[], key: string, keyTransform: (key: any) => any = (k) => k): any {
    return values.reduce(function(p, n) { return { ...p, [keyTransform(n[key])]: n } }, { })
}

function groupArray(values: any[], key: string): any {
    const combined: any = {};
    values.forEach(v => {
        if (!combined[v[key]])
            combined[v[key]] = [];
        
        combined[v[key]].push(v);
    });

    return combined;
}

function objectToArray(obj: any, filter: (item: any) => boolean = (i) => true) {
    let arr = [];
    for (const key in obj)
        if (filter(obj[key]))
            arr.push(obj[key]);
    return arr;
}

function memoize(keyGen: (args: any[]) => string = (args) => args.reduce((a1, a2) => `${a1},${a2}`)) {
    return function(target: any, key: string, descriptor: any) {
        const store: any = {};
        return {
            value: function (...args: any[]) {
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

export const Helpers = {
    ArrayToObject: arrayToObject,
    ObjectToArray: objectToArray,
    GroupArray: groupArray,
    memoize: memoize
};