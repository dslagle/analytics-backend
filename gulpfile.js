var gulp = require("gulp");
var ts = require("gulp-typescript");
//var tslint = require("gulp-tslint");
var del = require("del");
var delEmpty = require("delete-empty");
var path = require("path");

var appDev = "src";
var appProd = "public";

var assets = [
    {
        src: path.join(appDev, "sql", "**/*.sql"),
        dest: path.join(appProd, "sql")
    }
];

var clientOptions = {
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true,
    "target": "es6",
    "moduleResolution": "node",
    "module": "commonjs",
    "outDir": appProd
};

gulp.task("clean", function(cb) {
    del(`${appProd}/**/*`)
        .then(() => delEmpty(appProd, () => cb()));
});

gulp.task("copy-assets", function(cb) {
    assets.forEach(a => {
        gulp.src(a.src)
            .pipe(gulp.dest(a.dest));
    })
    cb();
});

// gulp.task("lint", function() {
//     gulp.src([
//             "typings/index.d.ts",
//             "server.ts",
//             "models/**/*.ts",
//             "routes/**/*.ts",
//             "data/**/*.ts"
//         ], { base: "./" })
//         .pipe(tslint({ formatter: "verbose" }))
//         .pipe(tslint.report());
// });

gulp.task("compile", function() {
    return gulp.src([ `${appDev}/**/*.ts` ])
        .pipe(ts(clientOptions))
        .js.pipe(gulp.dest(appProd));
});

gulp.task("default", gulp.series("clean", "compile", "copy-assets"));
