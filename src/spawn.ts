import {CollectorStream} from "./collectorStream";
import * as cp from "child_process";
import {Writable} from "stream";
import {NullStream} from "./nullStream";
import {eventToPromise} from "./promiseHelpers";
import * as _ from "lodash";


/**
 * Spawns a child process.  Each stdout and stderr output line is prefixed with
 * the specified label.
 * @param description - A textual description of the command that is output when
 *     the child process starts
 * @param cmd - The command to run
 * @param args - An array of arguments for cmd
 * @param cwd - The current working directory for the child process
 * @param stdoutStream - The stream to receive stdout.  A NullStream if
 *     undefined.
 *     For example:
 *     `new CombinedStream(new PrefixStream("foo"), process.stdout)`
 * @param stderrStream - The stream to receive stderr  A NullStream if
 *     undefined. For example:
 *     `new CombinedStream(new PrefixStream(".    "), process.stderr)`
 * @return {Promise<string>} A Promise that is resolved when the child process's
 *     trimmed output when the exit code is 0 and is rejected when it is
 *     non-zero.
 */
export function spawn(
    cmd: string,
    args: Array<string>,
    cwd: string,
    description?: string,
    stdoutStream?: Writable,
    stderrStream?: Writable
): Promise<string> {
    const cmdLineRepresentation = getCommandLineRepresentation(cmd, args);

    if (description)
    {
        console.log("--------------------------------------------------------------------------------");
        console.log(`${description}`);
        console.log(`    ${cmdLineRepresentation}`);
        console.log("--------------------------------------------------------------------------------");
    }

    const stdoutCollector = new CollectorStream();
    const stderrCollector = new CollectorStream();


    return new Promise((resolve: (output: string) => void, reject: (err: {exitCode: number, stderr: string}) => void) => {

        const childProcess = cp.spawn(cmd, args, {cwd: cwd, stdio: [process.stdin, "pipe", "pipe"]});

        const outputStream = stdoutStream || new NullStream();

        childProcess.stdout
        .pipe(stdoutCollector)
        .pipe(outputStream);

        const errorStream = stderrStream || new NullStream();

        childProcess.stderr
        .pipe(stderrCollector)  // to capture stderr in case child process errors
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
                    resolve(_.trim(stdoutCollector.collected));
                } else {
                    if (description)
                    {
                        console.log(`Child process failed: ${cmdLineRepresentation}`);
                    }
                    reject({exitCode: exitCode, stderr: stderrCollector.collected});
                }
            });
        });

    });
}


function getCommandLineRepresentation(cmd: string, args: Array<string>): string
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
