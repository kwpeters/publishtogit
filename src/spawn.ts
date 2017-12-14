import {CollectorStream} from "./collectorStream";

const cp = require("child_process");
import {PrefixStream} from "./prefixStream";
import {Writable} from "stream";
import {NullStream} from "./nullStream";
import {eventToPromise, streamToPromise} from "./promiseHelpers";
import {CombinedStream} from "./combinedStream";


// TODO: Enhance spawn() to take writable streams where stdout and stderr can be
// redirected to.  This will make the unit test output cleaner.

/**
 * Spawns a child process.  Each stdout and stderr output line is prefixed with
 * the specified label.
 * @param description - A textual description of the command that is output when
 *     the child process starts
  * @param cmd - The command to run
 * @param args - An array of arguments for cmd
 * @param cwd - The current working directory for the child process
 * @param stdoutStream - The stream to receive stdout.  A NullStream if
 * undefined.
 * For example:
 * `new CombinedStream(new PrefixStream("foo"), process.stdout)`
 * @param stderrStream - The stream to receive stderr  A NullStream if undefined.
 * For example:
 * `new CombinedStream(new PrefixStream(".    "), process.stderr)`
 * @return {Promise<void>} A Promise that is resolved when the child process's
 *     exit code is 0 and is rejected when it is non-zero.
 */
export function spawn(
    cmd: string,
    args: Array<string>,
    cwd: string,
    description?: string,
    stdoutStream?: Writable,
    stderrStream?: Writable
) {
    const cmdLineRepresentation = getCommandLineRepresentation(cmd, args);

    if (description)
    {
        console.log("--------------------------------------------------------------------------------");
        console.log(`${description}`);
        console.log(`    ${cmdLineRepresentation}`);
        console.log("--------------------------------------------------------------------------------");
    }

    const stdErrCollector = new CollectorStream();

    return new Promise((resolve: () => void, reject: (err: {exitCode: number, stderr: string}) => void) => {

        const childProcess = cp.spawn(cmd, args, {cwd: cwd, stdio: [process.stdin, "pipe", "pipe"]});

        const outputStream = stdoutStream || new NullStream();

        childProcess.stdout
        .pipe(outputStream);

        const errorStream = stderrStream || new NullStream();

        childProcess.stderr
        .pipe(stdErrCollector)  // to capture stderr in case child process errors
        .pipe(errorStream);

        childProcess.once("exit", (exitCode: number) => {
            // Wait for all steams to flush before reporting that the child
            // process has finished.
            eventToPromise(childProcess, "close")
            .then(() => {
                if (exitCode === 0) {
                    if (description)
                    {
                        console.log(`Child process succeeded: ${cmdLineRepresentation}`);
                    }
                    resolve();
                } else {
                    if (description)
                    {
                        console.log(`Child process failed: ${cmdLineRepresentation}`);
                    }
                    reject({exitCode: exitCode, stderr: stdErrCollector.collected});
                }
            });
        });

    });
}


function getCommandLineRepresentation(cmd: string, args: Array<string>)
{
    args = args.map((curArg) =>
    {
        if (curArg.includes(" "))
        {
            return `"${curArg}"`;
        } else
        {
            return curArg;
        }
    });

    return `${cmd} ${args.join(" ")}`;
}
