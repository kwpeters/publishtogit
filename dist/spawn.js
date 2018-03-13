"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var collectorStream_1 = require("./collectorStream");
var cp = require("child_process");
var nullStream_1 = require("./nullStream");
var promiseHelpers_1 = require("./promiseHelpers");
var _ = require("lodash");
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
    return new Promise(function (resolve, reject) {
        var childProcess = cp.spawn(cmd, args, { cwd: cwd, stdio: [process.stdin, "pipe", "pipe"] });
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
}
exports.spawn = spawn;
function getCommandLineRepresentation(cmd, args) {
    args = args.map(function (curArg) {
        if (curArg.includes(" ")) {
            return "\"" + curArg + "\"";
        }
        else {
            return curArg;
        }
    });
    return cmd + " " + args.join(" ");
}

//# sourceMappingURL=data:application/json;charset=utf8;base64,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Q0FBQyxHQUFHLENBQUMsVUFBQyxNQUFNO1FBRW5CLEVBQUUsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FDekIsQ0FBQztZQUNHLE1BQU0sQ0FBQyxPQUFJLE1BQU0sT0FBRyxDQUFDO1FBQ3pCLENBQUM7UUFBQyxJQUFJLENBQ04sQ0FBQztZQUNHLE1BQU0sQ0FBQyxNQUFNLENBQUM7UUFDbEIsQ0FBQztJQUNMLENBQUMsQ0FBQyxDQUFDO0lBRUgsTUFBTSxDQUFJLEdBQUcsU0FBSSxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBRyxDQUFDO0FBQ3RDLENBQUMiLCJmaWxlIjoic3Bhd24uanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge0NvbGxlY3RvclN0cmVhbX0gZnJvbSBcIi4vY29sbGVjdG9yU3RyZWFtXCI7XG5pbXBvcnQgKiBhcyBjcCBmcm9tIFwiY2hpbGRfcHJvY2Vzc1wiO1xuaW1wb3J0IHtXcml0YWJsZX0gZnJvbSBcInN0cmVhbVwiO1xuaW1wb3J0IHtOdWxsU3RyZWFtfSBmcm9tIFwiLi9udWxsU3RyZWFtXCI7XG5pbXBvcnQge2V2ZW50VG9Qcm9taXNlfSBmcm9tIFwiLi9wcm9taXNlSGVscGVyc1wiO1xuaW1wb3J0ICogYXMgXyBmcm9tIFwibG9kYXNoXCI7XG5cblxuLyoqXG4gKiBTcGF3bnMgYSBjaGlsZCBwcm9jZXNzLiAgRWFjaCBzdGRvdXQgYW5kIHN0ZGVyciBvdXRwdXQgbGluZSBpcyBwcmVmaXhlZCB3aXRoXG4gKiB0aGUgc3BlY2lmaWVkIGxhYmVsLlxuICogQHBhcmFtIGRlc2NyaXB0aW9uIC0gQSB0ZXh0dWFsIGRlc2NyaXB0aW9uIG9mIHRoZSBjb21tYW5kIHRoYXQgaXMgb3V0cHV0IHdoZW5cbiAqICAgICB0aGUgY2hpbGQgcHJvY2VzcyBzdGFydHNcbiAqIEBwYXJhbSBjbWQgLSBUaGUgY29tbWFuZCB0byBydW5cbiAqIEBwYXJhbSBhcmdzIC0gQW4gYXJyYXkgb2YgYXJndW1lbnRzIGZvciBjbWRcbiAqIEBwYXJhbSBjd2QgLSBUaGUgY3VycmVudCB3b3JraW5nIGRpcmVjdG9yeSBmb3IgdGhlIGNoaWxkIHByb2Nlc3NcbiAqIEBwYXJhbSBzdGRvdXRTdHJlYW0gLSBUaGUgc3RyZWFtIHRvIHJlY2VpdmUgc3Rkb3V0LiAgQSBOdWxsU3RyZWFtIGlmXG4gKiAgICAgdW5kZWZpbmVkLlxuICogICAgIEZvciBleGFtcGxlOlxuICogICAgIGBuZXcgQ29tYmluZWRTdHJlYW0obmV3IFByZWZpeFN0cmVhbShcImZvb1wiKSwgcHJvY2Vzcy5zdGRvdXQpYFxuICogQHBhcmFtIHN0ZGVyclN0cmVhbSAtIFRoZSBzdHJlYW0gdG8gcmVjZWl2ZSBzdGRlcnIgIEEgTnVsbFN0cmVhbSBpZlxuICogICAgIHVuZGVmaW5lZC4gRm9yIGV4YW1wbGU6XG4gKiAgICAgYG5ldyBDb21iaW5lZFN0cmVhbShuZXcgUHJlZml4U3RyZWFtKFwiLiAgICBcIiksIHByb2Nlc3Muc3RkZXJyKWBcbiAqIEByZXR1cm4ge1Byb21pc2U8c3RyaW5nPn0gQSBQcm9taXNlIHRoYXQgaXMgcmVzb2x2ZWQgd2hlbiB0aGUgY2hpbGQgcHJvY2VzcydzXG4gKiAgICAgdHJpbW1lZCBvdXRwdXQgd2hlbiB0aGUgZXhpdCBjb2RlIGlzIDAgYW5kIGlzIHJlamVjdGVkIHdoZW4gaXQgaXNcbiAqICAgICBub24temVyby5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHNwYXduKFxuICAgIGNtZDogc3RyaW5nLFxuICAgIGFyZ3M6IEFycmF5PHN0cmluZz4sXG4gICAgY3dkPzogc3RyaW5nLFxuICAgIGRlc2NyaXB0aW9uPzogc3RyaW5nLFxuICAgIHN0ZG91dFN0cmVhbT86IFdyaXRhYmxlLFxuICAgIHN0ZGVyclN0cmVhbT86IFdyaXRhYmxlXG4pOiBQcm9taXNlPHN0cmluZz4ge1xuICAgIGNvbnN0IGNtZExpbmVSZXByZXNlbnRhdGlvbiA9IGdldENvbW1hbmRMaW5lUmVwcmVzZW50YXRpb24oY21kLCBhcmdzKTtcblxuICAgIGlmIChkZXNjcmlwdGlvbilcbiAgICB7XG4gICAgICAgIGNvbnNvbGUubG9nKFwiLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cIik7XG4gICAgICAgIGNvbnNvbGUubG9nKGAke2Rlc2NyaXB0aW9ufWApO1xuICAgICAgICBjb25zb2xlLmxvZyhgICAgICR7Y21kTGluZVJlcHJlc2VudGF0aW9ufWApO1xuICAgICAgICBjb25zb2xlLmxvZyhcIi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXCIpO1xuICAgIH1cblxuICAgIGNvbnN0IHN0ZG91dENvbGxlY3RvciA9IG5ldyBDb2xsZWN0b3JTdHJlYW0oKTtcbiAgICBjb25zdCBzdGRlcnJDb2xsZWN0b3IgPSBuZXcgQ29sbGVjdG9yU3RyZWFtKCk7XG5cblxuICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZTogKG91dHB1dDogc3RyaW5nKSA9PiB2b2lkLCByZWplY3Q6IChlcnI6IHtleGl0Q29kZTogbnVtYmVyLCBzdGRlcnI6IHN0cmluZ30pID0+IHZvaWQpID0+IHtcblxuICAgICAgICBjb25zdCBjaGlsZFByb2Nlc3MgPSBjcC5zcGF3bihjbWQsIGFyZ3MsIHtjd2Q6IGN3ZCwgc3RkaW86IFtwcm9jZXNzLnN0ZGluLCBcInBpcGVcIiwgXCJwaXBlXCJdfSk7XG5cbiAgICAgICAgY29uc3Qgb3V0cHV0U3RyZWFtID0gc3Rkb3V0U3RyZWFtIHx8IG5ldyBOdWxsU3RyZWFtKCk7XG5cbiAgICAgICAgY2hpbGRQcm9jZXNzLnN0ZG91dFxuICAgICAgICAucGlwZShzdGRvdXRDb2xsZWN0b3IpXG4gICAgICAgIC5waXBlKG91dHB1dFN0cmVhbSk7XG5cbiAgICAgICAgY29uc3QgZXJyb3JTdHJlYW0gPSBzdGRlcnJTdHJlYW0gfHwgbmV3IE51bGxTdHJlYW0oKTtcblxuICAgICAgICBjaGlsZFByb2Nlc3Muc3RkZXJyXG4gICAgICAgIC5waXBlKHN0ZGVyckNvbGxlY3RvcikgIC8vIHRvIGNhcHR1cmUgc3RkZXJyIGluIGNhc2UgY2hpbGQgcHJvY2VzcyBlcnJvcnNcbiAgICAgICAgLnBpcGUoZXJyb3JTdHJlYW0pO1xuXG4gICAgICAgIGNoaWxkUHJvY2Vzcy5vbmNlKFwiZXhpdFwiLCAoZXhpdENvZGU6IG51bWJlcikgPT4ge1xuICAgICAgICAgICAgLy8gV2FpdCBmb3IgYWxsIHN0ZWFtcyB0byBmbHVzaCBiZWZvcmUgcmVwb3J0aW5nIHRoYXQgdGhlIGNoaWxkXG4gICAgICAgICAgICAvLyBwcm9jZXNzIGhhcyBmaW5pc2hlZC5cbiAgICAgICAgICAgIGV2ZW50VG9Qcm9taXNlKGNoaWxkUHJvY2VzcywgXCJjbG9zZVwiKVxuICAgICAgICAgICAgLnRoZW4oKCkgPT4ge1xuICAgICAgICAgICAgICAgIGlmIChleGl0Q29kZSA9PT0gMCkge1xuICAgICAgICAgICAgICAgICAgICBpZiAoZGVzY3JpcHRpb24pXG4gICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGBDaGlsZCBwcm9jZXNzIHN1Y2NlZWRlZDogJHtjbWRMaW5lUmVwcmVzZW50YXRpb259YCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZShfLnRyaW0oc3Rkb3V0Q29sbGVjdG9yLmNvbGxlY3RlZCkpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChkZXNjcmlwdGlvbilcbiAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coYENoaWxkIHByb2Nlc3MgZmFpbGVkOiAke2NtZExpbmVSZXByZXNlbnRhdGlvbn1gKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICByZWplY3Qoe2V4aXRDb2RlOiBleGl0Q29kZSwgc3RkZXJyOiBzdGRlcnJDb2xsZWN0b3IuY29sbGVjdGVkfSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuXG4gICAgfSk7XG59XG5cblxuZnVuY3Rpb24gZ2V0Q29tbWFuZExpbmVSZXByZXNlbnRhdGlvbihjbWQ6IHN0cmluZywgYXJnczogQXJyYXk8c3RyaW5nPik6IHN0cmluZ1xue1xuICAgIGFyZ3MgPSBhcmdzLm1hcCgoY3VyQXJnKSA9PlxuICAgIHtcbiAgICAgICAgaWYgKGN1ckFyZy5pbmNsdWRlcyhcIiBcIikpXG4gICAgICAgIHtcbiAgICAgICAgICAgIHJldHVybiBgXCIke2N1ckFyZ31cImA7XG4gICAgICAgIH0gZWxzZVxuICAgICAgICB7XG4gICAgICAgICAgICByZXR1cm4gY3VyQXJnO1xuICAgICAgICB9XG4gICAgfSk7XG5cbiAgICByZXR1cm4gYCR7Y21kfSAke2FyZ3Muam9pbihcIiBcIil9YDtcbn1cbiJdfQ==
