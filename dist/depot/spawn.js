"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var _ = require("lodash");
var BBPromise = require("bluebird");
var collectorStream_1 = require("./collectorStream");
var cp = require("child_process");
var nullStream_1 = require("./nullStream");
var promiseHelpers_1 = require("./promiseHelpers");
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
 * @return An object implementing ISpawnResult.
 */
function spawn(cmd, args, cwd, description, stdoutStream, stderrStream) {
    var cmdLineRepresentation = getCommandLineRepresentation(cmd, args);
    if (description) {
        console.log("--------------------------------------------------------------------------------");
        console.log("" + description);
        console.log("    " + cmdLineRepresentation);
        console.log("--------------------------------------------------------------------------------");
    }
    var stdoutCollector = new collectorStream_1.CollectorStream();
    var stderrCollector = new collectorStream_1.CollectorStream();
    var childProcess;
    var closePromise = new BBPromise(function (resolve, reject) {
        childProcess = cp.spawn(cmd, args, { cwd: cwd, stdio: [process.stdin, "pipe", "pipe"] });
        var outputStream = stdoutStream || new nullStream_1.NullStream();
        childProcess.stdout
            .pipe(stdoutCollector)
            .pipe(outputStream);
        var errorStream = stderrStream || new nullStream_1.NullStream();
        childProcess.stderr
            .pipe(stderrCollector) // to capture stderr in case child process errors
            .pipe(errorStream);
        childProcess.once("exit", function (exitCode) {
            // Wait for all steams to flush before reporting that the child
            // process has finished.
            promiseHelpers_1.eventToPromise(childProcess, "close")
                .then(function () {
                if (exitCode === 0) {
                    if (description) {
                        console.log("Child process succeeded: " + cmdLineRepresentation);
                    }
                    resolve(_.trim(stdoutCollector.collected));
                }
                else {
                    if (description) {
                        console.log("Child process failed: " + cmdLineRepresentation);
                    }
                    reject({ exitCode: exitCode, stderr: stderrCollector.collected });
                }
            });
        });
    });
    return {
        childProcess: childProcess,
        closePromise: closePromise
    };
}
exports.spawn = spawn;
function getCommandLineRepresentation(cmd, args) {
    args = args.map(function (curArg) {
        if (_.includes(curArg, " ")) {
            return "\"" + curArg + "\"";
        }
        else {
            return curArg;
        }
    });
    return cmd + " " + args.join(" ");
}

//# sourceMappingURL=data:application/json;charset=utf8;base64,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QUFNO1FBRW5CLElBQUksQ0FBQyxDQUFDLFFBQVEsQ0FBQyxNQUFNLEVBQUUsR0FBRyxDQUFDLEVBQzNCO1lBQ0ksT0FBTyxPQUFJLE1BQU0sT0FBRyxDQUFDO1NBQ3hCO2FBQ0Q7WUFDSSxPQUFPLE1BQU0sQ0FBQztTQUNqQjtJQUNMLENBQUMsQ0FBQyxDQUFDO0lBRUgsT0FBVSxHQUFHLFNBQUksSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUcsQ0FBQztBQUN0QyxDQUFDIiwiZmlsZSI6ImRlcG90L3NwYXduLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0ICogYXMgXyBmcm9tIFwibG9kYXNoXCI7XG5pbXBvcnQgKiBhcyBCQlByb21pc2UgZnJvbSBcImJsdWViaXJkXCI7XG5pbXBvcnQge0NvbGxlY3RvclN0cmVhbX0gZnJvbSBcIi4vY29sbGVjdG9yU3RyZWFtXCI7XG5pbXBvcnQgKiBhcyBjcCBmcm9tIFwiY2hpbGRfcHJvY2Vzc1wiO1xuaW1wb3J0IHtXcml0YWJsZX0gZnJvbSBcInN0cmVhbVwiO1xuaW1wb3J0IHtOdWxsU3RyZWFtfSBmcm9tIFwiLi9udWxsU3RyZWFtXCI7XG5pbXBvcnQge2V2ZW50VG9Qcm9taXNlfSBmcm9tIFwiLi9wcm9taXNlSGVscGVyc1wiO1xuXG5leHBvcnQgaW50ZXJmYWNlIElTcGF3blJlc3VsdFxue1xuICAgIC8qKlxuICAgICAqIFRoZSB1bmRlcmx5aW5nIGNoaWxkIHByb2Nlc3MuICBUaGlzIGlzIHByb3ZpZGVkIHNvIHRoYXQgY2xpZW50cyBjYW4gZG9cbiAgICAgKiB0aGluZ3MgbGlrZSBraWxsKCkgdGhlbS5cbiAgICAgKi9cbiAgICBjaGlsZFByb2Nlc3M6IGNwLkNoaWxkUHJvY2VzcztcbiAgICAvKipcbiAgICAgKiBBIFByb21pc2UgdGhhdCBpcyByZXNvbHZlZCB3aXRoIHRoZSBjaGlsZCBwcm9jZXNzJ3MgdHJpbW1lZCBvdXRwdXQgd2hlblxuICAgICAqIHRoZSBleGl0IGNvZGUgaXMgMCBhbmQgaXMgcmVqZWN0ZWQgd2hlbiBpdCBpcyBub24temVyby5cbiAgICAgKi9cbiAgICBjbG9zZVByb21pc2U6IFByb21pc2U8c3RyaW5nPjtcbn1cblxuLyoqXG4gKiBTcGF3bnMgYSBjaGlsZCBwcm9jZXNzLiAgRWFjaCBzdGRvdXQgYW5kIHN0ZGVyciBvdXRwdXQgbGluZSBpcyBwcmVmaXhlZCB3aXRoXG4gKiB0aGUgc3BlY2lmaWVkIGxhYmVsLlxuICogQHBhcmFtIGRlc2NyaXB0aW9uIC0gQSB0ZXh0dWFsIGRlc2NyaXB0aW9uIG9mIHRoZSBjb21tYW5kIHRoYXQgaXMgb3V0cHV0IHdoZW5cbiAqICAgICB0aGUgY2hpbGQgcHJvY2VzcyBzdGFydHNcbiAqIEBwYXJhbSBjbWQgLSBUaGUgY29tbWFuZCB0byBydW5cbiAqIEBwYXJhbSBhcmdzIC0gQW4gYXJyYXkgb2YgYXJndW1lbnRzIGZvciBjbWRcbiAqIEBwYXJhbSBjd2QgLSBUaGUgY3VycmVudCB3b3JraW5nIGRpcmVjdG9yeSBmb3IgdGhlIGNoaWxkIHByb2Nlc3NcbiAqIEBwYXJhbSBzdGRvdXRTdHJlYW0gLSBUaGUgc3RyZWFtIHRvIHJlY2VpdmUgc3Rkb3V0LiAgQSBOdWxsU3RyZWFtIGlmXG4gKiAgICAgdW5kZWZpbmVkLlxuICogICAgIEZvciBleGFtcGxlOlxuICogICAgIGBuZXcgQ29tYmluZWRTdHJlYW0obmV3IFByZWZpeFN0cmVhbShcImZvb1wiKSwgcHJvY2Vzcy5zdGRvdXQpYFxuICogQHBhcmFtIHN0ZGVyclN0cmVhbSAtIFRoZSBzdHJlYW0gdG8gcmVjZWl2ZSBzdGRlcnIgIEEgTnVsbFN0cmVhbSBpZlxuICogICAgIHVuZGVmaW5lZC4gRm9yIGV4YW1wbGU6XG4gKiAgICAgYG5ldyBDb21iaW5lZFN0cmVhbShuZXcgUHJlZml4U3RyZWFtKFwiLiAgICBcIiksIHByb2Nlc3Muc3RkZXJyKWBcbiAqIEByZXR1cm4gQW4gb2JqZWN0IGltcGxlbWVudGluZyBJU3Bhd25SZXN1bHQuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBzcGF3bihcbiAgICBjbWQ6IHN0cmluZyxcbiAgICBhcmdzOiBBcnJheTxzdHJpbmc+LFxuICAgIGN3ZD86IHN0cmluZyxcbiAgICBkZXNjcmlwdGlvbj86IHN0cmluZyxcbiAgICBzdGRvdXRTdHJlYW0/OiBXcml0YWJsZSxcbiAgICBzdGRlcnJTdHJlYW0/OiBXcml0YWJsZVxuKTogSVNwYXduUmVzdWx0IHtcbiAgICBjb25zdCBjbWRMaW5lUmVwcmVzZW50YXRpb24gPSBnZXRDb21tYW5kTGluZVJlcHJlc2VudGF0aW9uKGNtZCwgYXJncyk7XG5cbiAgICBpZiAoZGVzY3JpcHRpb24pXG4gICAge1xuICAgICAgICBjb25zb2xlLmxvZyhcIi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXCIpO1xuICAgICAgICBjb25zb2xlLmxvZyhgJHtkZXNjcmlwdGlvbn1gKTtcbiAgICAgICAgY29uc29sZS5sb2coYCAgICAke2NtZExpbmVSZXByZXNlbnRhdGlvbn1gKTtcbiAgICAgICAgY29uc29sZS5sb2coXCItLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVwiKTtcbiAgICB9XG5cbiAgICBjb25zdCBzdGRvdXRDb2xsZWN0b3IgPSBuZXcgQ29sbGVjdG9yU3RyZWFtKCk7XG4gICAgY29uc3Qgc3RkZXJyQ29sbGVjdG9yID0gbmV3IENvbGxlY3RvclN0cmVhbSgpO1xuICAgIGxldCBjaGlsZFByb2Nlc3M6IGNwLkNoaWxkUHJvY2VzcztcblxuICAgIGNvbnN0IGNsb3NlUHJvbWlzZSA9IG5ldyBCQlByb21pc2UoKHJlc29sdmU6IChvdXRwdXQ6IHN0cmluZykgPT4gdm9pZCwgcmVqZWN0OiAoZXJyOiB7ZXhpdENvZGU6IG51bWJlciwgc3RkZXJyOiBzdHJpbmd9KSA9PiB2b2lkKSA9PiB7XG5cbiAgICAgICAgY2hpbGRQcm9jZXNzID0gY3Auc3Bhd24oY21kLCBhcmdzLCB7Y3dkOiBjd2QsIHN0ZGlvOiBbcHJvY2Vzcy5zdGRpbiwgXCJwaXBlXCIsIFwicGlwZVwiXX0pO1xuXG4gICAgICAgIGNvbnN0IG91dHB1dFN0cmVhbSA9IHN0ZG91dFN0cmVhbSB8fCBuZXcgTnVsbFN0cmVhbSgpO1xuXG4gICAgICAgIGNoaWxkUHJvY2Vzcy5zdGRvdXRcbiAgICAgICAgLnBpcGUoc3Rkb3V0Q29sbGVjdG9yKVxuICAgICAgICAucGlwZShvdXRwdXRTdHJlYW0pO1xuXG4gICAgICAgIGNvbnN0IGVycm9yU3RyZWFtID0gc3RkZXJyU3RyZWFtIHx8IG5ldyBOdWxsU3RyZWFtKCk7XG5cbiAgICAgICAgY2hpbGRQcm9jZXNzLnN0ZGVyclxuICAgICAgICAucGlwZShzdGRlcnJDb2xsZWN0b3IpICAvLyB0byBjYXB0dXJlIHN0ZGVyciBpbiBjYXNlIGNoaWxkIHByb2Nlc3MgZXJyb3JzXG4gICAgICAgIC5waXBlKGVycm9yU3RyZWFtKTtcblxuICAgICAgICBjaGlsZFByb2Nlc3Mub25jZShcImV4aXRcIiwgKGV4aXRDb2RlOiBudW1iZXIpID0+IHtcbiAgICAgICAgICAgIC8vIFdhaXQgZm9yIGFsbCBzdGVhbXMgdG8gZmx1c2ggYmVmb3JlIHJlcG9ydGluZyB0aGF0IHRoZSBjaGlsZFxuICAgICAgICAgICAgLy8gcHJvY2VzcyBoYXMgZmluaXNoZWQuXG4gICAgICAgICAgICBldmVudFRvUHJvbWlzZShjaGlsZFByb2Nlc3MsIFwiY2xvc2VcIilcbiAgICAgICAgICAgIC50aGVuKCgpID0+IHtcbiAgICAgICAgICAgICAgICBpZiAoZXhpdENvZGUgPT09IDApIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGRlc2NyaXB0aW9uKVxuICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhgQ2hpbGQgcHJvY2VzcyBzdWNjZWVkZWQ6ICR7Y21kTGluZVJlcHJlc2VudGF0aW9ufWApO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIHJlc29sdmUoXy50cmltKHN0ZG91dENvbGxlY3Rvci5jb2xsZWN0ZWQpKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBpZiAoZGVzY3JpcHRpb24pXG4gICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGBDaGlsZCBwcm9jZXNzIGZhaWxlZDogJHtjbWRMaW5lUmVwcmVzZW50YXRpb259YCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgcmVqZWN0KHtleGl0Q29kZTogZXhpdENvZGUsIHN0ZGVycjogc3RkZXJyQ29sbGVjdG9yLmNvbGxlY3RlZH0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcblxuICAgIH0pO1xuXG4gICAgcmV0dXJuIHtcbiAgICAgICAgY2hpbGRQcm9jZXNzOiBjaGlsZFByb2Nlc3MhLFxuICAgICAgICBjbG9zZVByb21pc2U6IGNsb3NlUHJvbWlzZVxuICAgIH07XG59XG5cblxuZnVuY3Rpb24gZ2V0Q29tbWFuZExpbmVSZXByZXNlbnRhdGlvbihjbWQ6IHN0cmluZywgYXJnczogQXJyYXk8c3RyaW5nPik6IHN0cmluZ1xue1xuICAgIGFyZ3MgPSBhcmdzLm1hcCgoY3VyQXJnKSA9PlxuICAgIHtcbiAgICAgICAgaWYgKF8uaW5jbHVkZXMoY3VyQXJnLCBcIiBcIikpXG4gICAgICAgIHtcbiAgICAgICAgICAgIHJldHVybiBgXCIke2N1ckFyZ31cImA7XG4gICAgICAgIH0gZWxzZVxuICAgICAgICB7XG4gICAgICAgICAgICByZXR1cm4gY3VyQXJnO1xuICAgICAgICB9XG4gICAgfSk7XG5cbiAgICByZXR1cm4gYCR7Y21kfSAke2FyZ3Muam9pbihcIiBcIil9YDtcbn1cbiJdfQ==
