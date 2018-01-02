const cp = require("child_process");
const gulp = require("gulp");


////////////////////////////////////////////////////////////////////////////////
// Default
////////////////////////////////////////////////////////////////////////////////

gulp.task("default", () => {
    const usage = [
        "Gulp tasks",
        "  tslint - Run TSLint on source files",
        "  ut     - Run unit tests"
    ];
    console.log(usage.join("\n"));
});


////////////////////////////////////////////////////////////////////////////////
// tslint
////////////////////////////////////////////////////////////////////////////////


gulp.task("tslint", function ()
{
    "use strict";
    return runTslint(true);
});


function runTslint(emitError)
{
    "use strict";

    let tslintArgs = [
        "--project", "./tsconfig.json",
        "--format", "stylish"
    ];

    // Add the globs defining source files to the list of arguments.
    tslintArgs = tslintArgs.concat(getSrcGlobs(true));

    return spawn(
        "./node_modules/.bin/tslint",
        tslintArgs,
        __dirname
    )
    .catch((err) => {
        // If we're supposed to emit an error, then go ahead and rethrow it.
        // Otherwise, just eat it.
        if (emitError) {
            throw err;
        }
    });
}


////////////////////////////////////////////////////////////////////////////////
// Unit Tests
////////////////////////////////////////////////////////////////////////////////

gulp.task("ut", () => {
    return spawn(
        "./node_modules/.bin/ts-node",
        [
            "./node_modules/.bin/jasmine",
            "JASMINE_CONFIG_PATH=spec/support/jasmine.json"
        ],
        __dirname
    );
});



////////////////////////////////////////////////////////////////////////////////
// Project Management
////////////////////////////////////////////////////////////////////////////////

function getSrcGlobs(includeSpecs)
{
    "use strict";
    const srcGlobs = ["src/**/*.ts"];
    if (includeSpecs) {
        srcGlobs.push("spec/**/*.ts");
    }

    return srcGlobs;
}


////////////////////////////////////////////////////////////////////////////////
// Misc
////////////////////////////////////////////////////////////////////////////////

function spawn(cmd, args, cwd) {

    return new Promise((resolve, reject) => {
        const childProc = cp.spawn(
            cmd,
            args,
            {
                cwd: cwd,
                stdio: "inherit"
            }
        );

        childProc.once("exit", (exitCode) => {
            if (exitCode === 0) {
                resolve();
            } else {
                reject(new Error(`Child process exit code: ${exitCode}.`));
            }
        });
    });
}
