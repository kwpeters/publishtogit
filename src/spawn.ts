const cp = require("child_process");
import {PrefixStream} from "./prefixStream";


/**
 * Spawns a child process.  Each stdout and stderr output line is prefixed with
 * the specified label.
 * @param description - A textual description of the command that is output when
 *     the child process starts
 * @param label - A label that will prefix each line of stdout and stderr
 * @param cmd - The command to run
 * @param args - An array of arguments for cmd
 * @param cwd - The current working directory for the child process
 * @return {Promise<void>} A Promise that is resolved when the child process's
 *     exit code is 0 and is rejected when it is non-zero.
 */
export function spawn(
    description: string,
    label: string,
    cmd: string,
    args: Array<string>,
    cwd: string
) {
    console.log("--------------------------------------------------------------------------------");
    console.log(`${description}: ${label}`);
    console.log(`    ${getCommandLineRepresentation(cmd, args)}`);
    console.log("--------------------------------------------------------------------------------");

    const stdOutPrepender = new PrefixStream(label);
    const stdErrPrepender = new PrefixStream(label);

    return new Promise((resolve: () => void, reject: () => void) => {

        const childProcess = cp.spawn(cmd, args, {cwd: cwd, stdio: [process.stdin, "pipe", "pipe"]});

        // Pipe both of the child process's output streams through a prepender
        // and then to the corresponding stream of this process.
        childProcess.stdout
        .pipe(stdOutPrepender)
        .pipe(process.stdout);

        childProcess.stderr
        .pipe(stdErrPrepender)
        .pipe(process.stderr);

        childProcess.once("exit", (exitCode: number) => {

            // Wait for all steams to flush before reporting that the child
            // process has finished.
            Promise.all([
                (stdOutPrepender as any).flushedPromise,
                (stdErrPrepender as any).flushedPromise
            ])
            .then(() => {
                if (exitCode === 0) {
                    console.log(`${label}Child process succeeded.`);
                    resolve();
                } else {
                    console.log(`${label}Child proccess errored.`);
                    reject();
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
