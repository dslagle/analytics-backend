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

export const Helpers = {
    ArrayToObject: arrayToObject,
    ObjectToArray: objectToArray,
    GroupArray: groupArray
};