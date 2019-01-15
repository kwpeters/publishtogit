import * as yargs from "yargs";
import {Directory} from "./depot/directory";
import {publishToDir} from "./publishToDir";


// Each command is implemented in its own module.
yargs
.command({
    command: "dir <packageDir> <publishDir>",
    describe: "Publish to a directory",
    builder: function builder(argv: yargs.Argv): yargs.Argv {
        return argv
        .positional("packageDir", {
            describe: "The directory containing the package to be published",
            type: "string"
        })
        .positional("publishDir", {
            describe: "The directory to publish to",
            type: "string"
        });
    },
    handler: function handler(args: yargs.Arguments): void {
        publishToDir(new Directory(args.packageDir), new Directory(args.publishDir))
        .then(() => {
            process.exit(0);
        });
    }
})
.wrap(yargs.terminalWidth())
.help().argv;    // tslint:disable-line:no-unused-expression
