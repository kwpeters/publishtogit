#!/usr/bin/env node
"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = y[op[0] & 2 ? "return" : op[0] ? "throw" : "next"]) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [0, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var directory_1 = require("./directory");
var file_1 = require("./file");
var gitRepo_1 = require("./gitRepo");
var publishToGitConfig_1 = require("./publishToGitConfig");
var nodePackage_1 = require("./nodePackage");
var GitRepoPath_1 = require("./GitRepoPath");
var SemVer_1 = require("./SemVer");
var gitBranch_1 = require("./gitBranch");
var _ = require("lodash");
var url_1 = require("./url");
var yargs = require("yargs");
function parseArgs() {
    var argv = yargs
        .usage("Publishes a Node package to a Git repo.\nUsage: $0 [--dry-run] source_directory")
        .help()
        .option("dry-run", {
        type: "boolean",
        default: false,
        demandOption: false,
        describe: "Perform all operations but do not push to origin"
    })
        .version() // version will be read from package.json!
        .demandCommand(1)
        .wrap(80)
        .argv;
    // Get the source project directory from the command line arguments.  If not
    // present, assume the current working directory.
    var srcDirStr = argv._[0] || ".";
    var srcDir = new directory_1.Directory(srcDirStr);
    if (!srcDir.existsSync()) {
        console.log("The directory " + srcDirStr + " does not exist.");
        return undefined;
    }
    var cmdLineOpts = {
        dryRun: argv["dry-run"],
        srcDir: srcDir
    };
    return cmdLineOpts;
}
function getSrc(cmdLineOpts) {
    return __awaiter(this, void 0, void 0, function () {
        var srcRepo, pkg, configFile, publishToGitConfig, semver;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, gitRepo_1.GitRepo.fromDirectory(cmdLineOpts.srcDir)];
                case 1:
                    srcRepo = _a.sent();
                    return [4 /*yield*/, nodePackage_1.NodePackage.fromDirectory(cmdLineOpts.srcDir)
                            .catch(function () {
                            return Promise.reject(new Error("The directory " + cmdLineOpts.srcDir.toString() + " is not a NPM package."));
                        })];
                case 2:
                    pkg = _a.sent();
                    configFile = new file_1.File(cmdLineOpts.srcDir, "publishtogit.json");
                    if (!configFile.existsSync()) {
                        return [2 /*return*/, Promise.reject(new Error("Could not find file " + configFile.toString() + "."))];
                    }
                    publishToGitConfig = configFile.readJsonSync();
                    if (!publishToGitConfig) {
                        return [2 /*return*/, Promise.reject(new Error("Could not read configuration from " + configFile.toString() + "."))];
                    }
                    semver = SemVer_1.SemVer.fromString(pkg.config.version);
                    if (!semver) {
                        return [2 /*return*/, Promise.reject(new Error("Invalid semver version string " + pkg.config.version + "."))];
                    }
                    return [2 /*return*/, {
                            dir: cmdLineOpts.srcDir,
                            repo: srcRepo,
                            pkg: pkg,
                            version: semver,
                            publishToGitConfig: publishToGitConfig
                        }];
            }
        });
    });
}
function main() {
    return __awaiter(this, void 0, void 0, function () {
        var cmdLineOpts, src, publishProjName, publishDir, publishRepoPath, publishRepo, hasTag, msg, majorBranchName, majorBranch, minorBranchName, minorBranch, publishPackageJsonFile, publishPackageJson, commitMsg, tagName, msg, dependencyUrl, npmInstallCmd, doneMessage;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    //
                    // Make sure the global tmpDir exists.
                    //
                    publishToGitConfig_1.config.tmpDir.ensureExistsSync();
                    cmdLineOpts = parseArgs();
                    if (!cmdLineOpts) {
                        return [2 /*return*/];
                    }
                    return [4 /*yield*/, getSrc(cmdLineOpts)];
                case 1:
                    src = _a.sent();
                    console.log("Project will publish to Git repository: " + src.publishToGitConfig.publishRepository + ".");
                    publishProjName = GitRepoPath_1.gitUrlToProjectName(src.publishToGitConfig.publishRepository);
                    publishDir = new directory_1.Directory(publishToGitConfig_1.config.tmpDir, publishProjName);
                    publishDir.deleteSync();
                    console.log("Temp publish directory: " + publishDir.toString());
                    publishRepoPath = GitRepoPath_1.GitRepoPath.fromUrl(src.publishToGitConfig.publishRepository);
                    if (!publishRepoPath) {
                        throw new Error("Invalid publish repo URL \"" + src.publishToGitConfig.publishRepository + "\".");
                    }
                    console.log("Cloning publish repo...");
                    return [4 /*yield*/, gitRepo_1.GitRepo.clone(publishRepoPath, publishToGitConfig_1.config.tmpDir)];
                case 2:
                    publishRepo = _a.sent();
                    return [4 /*yield*/, publishRepo.hasTag(src.version.getPatchVersionString())];
                case 3:
                    hasTag = _a.sent();
                    if (hasTag) {
                        msg = "The publish repo already has tag " + src.version.getPatchVersionString() + ". " +
                            "Have you forgotten to bump the version number?";
                        console.log(msg);
                        throw new Error(msg);
                    }
                    majorBranchName = src.version.getMajorVersionString();
                    console.log("Checking out branch: " + majorBranchName);
                    return [4 /*yield*/, gitBranch_1.GitBranch.create(publishRepo, majorBranchName)];
                case 4:
                    majorBranch = _a.sent();
                    return [4 /*yield*/, publishRepo.checkout(majorBranch, true)];
                case 5:
                    _a.sent();
                    return [4 /*yield*/, publishRepo.pushCurrentBranch("origin", true)];
                case 6:
                    _a.sent();
                    minorBranchName = src.version.getMinorVersionString();
                    console.log("Checking out branch: " + minorBranchName);
                    return [4 /*yield*/, gitBranch_1.GitBranch.create(publishRepo, minorBranchName)];
                case 7:
                    minorBranch = _a.sent();
                    return [4 /*yield*/, publishRepo.checkout(minorBranch, true)];
                case 8:
                    _a.sent();
                    return [4 /*yield*/, publishRepo.pushCurrentBranch("origin", true)];
                case 9:
                    _a.sent();
                    //
                    // Remove all files under version control and prune directories that are
                    // empty.
                    //
                    console.log("Deleting all files...");
                    return [4 /*yield*/, deleteTrackedFiles(publishRepo)];
                case 10:
                    _a.sent();
                    return [4 /*yield*/, publishDir.prune()];
                case 11:
                    _a.sent();
                    //
                    // Publish the source repo to the publish directory.
                    //
                    console.log("Publishing package contents to publish repository...");
                    return [4 /*yield*/, src.pkg.publish(publishDir, false)];
                case 12:
                    _a.sent();
                    //
                    // Modify the package.json file so that the publish repo package
                    // - is named after the publish repo
                    // - the repository url points to the publish repo instead of the source repo
                    //
                    console.log("Updating publish package.json...");
                    publishPackageJsonFile = new file_1.File(publishDir, "package.json");
                    publishPackageJson = publishPackageJsonFile.readJsonSync();
                    publishPackageJson.repository.url = src.publishToGitConfig.publishRepository;
                    publishPackageJson.name = publishProjName;
                    publishPackageJsonFile.writeJsonSync(publishPackageJson);
                    //
                    // Stage and commit the published files.
                    //
                    console.log("Commiting published files...");
                    return [4 /*yield*/, publishRepo.stageAll()];
                case 13:
                    _a.sent();
                    commitMsg = "publish-to-git publishing version " + src.version.getPatchVersionString() + ".";
                    return [4 /*yield*/, publishRepo.commit(commitMsg)];
                case 14:
                    _a.sent();
                    tagName = src.version.getPatchVersionString();
                    console.log("Applying tag: " + tagName);
                    return [4 /*yield*/, publishRepo.createTag(tagName)];
                case 15:
                    _a.sent();
                    if (cmdLineOpts.dryRun) {
                        msg = [
                            "Running in dry-run mode.  The repository in the following temporary directory",
                            "has been left ready to push to a public server.",
                            publishDir.toString()
                        ];
                        console.log(msg.join("\n"));
                        return [2 /*return*/];
                    }
                    // Push the branch and the tag.
                    console.log("Pushing to origin...");
                    return [4 /*yield*/, publishRepo.pushCurrentBranch("origin")];
                case 16:
                    _a.sent();
                    return [4 /*yield*/, publishRepo.pushTag(tagName, "origin")];
                case 17:
                    _a.sent();
                    dependencyUrl = url_1.Url.setProtocol(src.publishToGitConfig.publishRepository, "git+https");
                    npmInstallCmd = "npm install " + dependencyUrl + "#" + tagName;
                    doneMessage = [
                        "Done.",
                        "To include the published library in a Node.js project, execute the following command:",
                        npmInstallCmd
                    ];
                    console.log(doneMessage.join("\n"));
                    return [2 /*return*/];
            }
        });
    });
}
/**
 * Deletes all tracked files within a repo.
 * @param repo - The repo to clear
 * @return A Promise that is resolved when all files have been deleted.
 */
function deleteTrackedFiles(repo) {
    return __awaiter(this, void 0, void 0, function () {
        var files, deletePromises;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, repo.files()];
                case 1:
                    files = _a.sent();
                    deletePromises = _.map(files, function (curFile) {
                        return curFile.delete();
                    });
                    return [4 /*yield*/, Promise.all(deletePromises)];
                case 2:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
main();

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9wdWJsaXNoLXRvLWdpdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUVBLHlDQUFzQztBQUN0QywrQkFBNEI7QUFDNUIscUNBQWtDO0FBQ2xDLDJEQUE0RDtBQUU1RCw2Q0FBd0Q7QUFDeEQsNkNBQStEO0FBQy9ELG1DQUFnQztBQUNoQyx5Q0FBc0M7QUFDdEMsMEJBQTRCO0FBQzVCLDZCQUEwQjtBQUMxQiw2QkFBK0I7QUFVL0I7SUFDSSxJQUFNLElBQUksR0FBRyxLQUFLO1NBQ2pCLEtBQUssQ0FBQyxpRkFBaUYsQ0FBQztTQUN4RixJQUFJLEVBQUU7U0FDTixNQUFNLENBQ0gsU0FBUyxFQUNUO1FBQ0ksSUFBSSxFQUFFLFNBQVM7UUFDZixPQUFPLEVBQUUsS0FBSztRQUNkLFlBQVksRUFBRSxLQUFLO1FBQ25CLFFBQVEsRUFBRSxrREFBa0Q7S0FDL0QsQ0FDSjtTQUNBLE9BQU8sRUFBRSxDQUFFLDBDQUEwQztTQUNyRCxhQUFhLENBQUMsQ0FBQyxDQUFDO1NBQ2hCLElBQUksQ0FBQyxFQUFFLENBQUM7U0FDUixJQUFJLENBQUM7SUFFTiw0RUFBNEU7SUFDNUUsaURBQWlEO0lBQ2pELElBQU0sU0FBUyxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksR0FBRyxDQUFDO0lBQ25DLElBQU0sTUFBTSxHQUFHLElBQUkscUJBQVMsQ0FBQyxTQUFTLENBQUMsQ0FBQztJQUN4QyxFQUFFLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxVQUFVLEVBQUUsQ0FBQyxDQUN6QixDQUFDO1FBQ0csT0FBTyxDQUFDLEdBQUcsQ0FBQyxtQkFBaUIsU0FBUyxxQkFBa0IsQ0FBQyxDQUFDO1FBQzFELE1BQU0sQ0FBQyxTQUFTLENBQUM7SUFDckIsQ0FBQztJQUVELElBQU0sV0FBVyxHQUFHO1FBQ2hCLE1BQU0sRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDO1FBQ3ZC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IjpbIiMhL3Vzci9iaW4vZW52IG5vZGVcblxuaW1wb3J0IHtEaXJlY3Rvcnl9IGZyb20gXCIuL2RpcmVjdG9yeVwiO1xuaW1wb3J0IHtGaWxlfSBmcm9tIFwiLi9maWxlXCI7XG5pbXBvcnQge0dpdFJlcG99IGZyb20gXCIuL2dpdFJlcG9cIjtcbmltcG9ydCB7Y29uZmlnIGFzIGdsb2JhbENvbmZpZ30gZnJvbSBcIi4vcHVibGlzaFRvR2l0Q29uZmlnXCI7XG5pbXBvcnQge0lQdWJsaXNoVG9HaXRDb25maWd9IGZyb20gXCIuL2NvbmZpZ0hlbHBlcnNcIjtcbmltcG9ydCB7SVBhY2thZ2VKc29uLCBOb2RlUGFja2FnZX0gZnJvbSBcIi4vbm9kZVBhY2thZ2VcIjtcbmltcG9ydCB7R2l0UmVwb1BhdGgsIGdpdFVybFRvUHJvamVjdE5hbWV9IGZyb20gXCIuL0dpdFJlcG9QYXRoXCI7XG5pbXBvcnQge1NlbVZlcn0gZnJvbSBcIi4vU2VtVmVyXCI7XG5pbXBvcnQge0dpdEJyYW5jaH0gZnJvbSBcIi4vZ2l0QnJhbmNoXCI7XG5pbXBvcnQgKiBhcyBfIGZyb20gXCJsb2Rhc2hcIjtcbmltcG9ydCB7VXJsfSBmcm9tIFwiLi91cmxcIjtcbmltcG9ydCAqIGFzIHlhcmdzIGZyb20gXCJ5YXJnc1wiO1xuXG5cbmludGVyZmFjZSBJQ21kTGluZU9wdHNcbntcbiAgICBkcnlSdW46IGJvb2xlYW47XG4gICAgc3JjRGlyOiBEaXJlY3Rvcnk7XG59XG5cblxuZnVuY3Rpb24gcGFyc2VBcmdzKCk6IElDbWRMaW5lT3B0cyB8IHVuZGVmaW5lZCB7XG4gICAgY29uc3QgYXJndiA9IHlhcmdzXG4gICAgLnVzYWdlKFwiUHVibGlzaGVzIGEgTm9kZSBwYWNrYWdlIHRvIGEgR2l0IHJlcG8uXFxuVXNhZ2U6ICQwIFstLWRyeS1ydW5dIHNvdXJjZV9kaXJlY3RvcnlcIilcbiAgICAuaGVscCgpXG4gICAgLm9wdGlvbihcbiAgICAgICAgXCJkcnktcnVuXCIsXG4gICAgICAgIHtcbiAgICAgICAgICAgIHR5cGU6IFwiYm9vbGVhblwiLFxuICAgICAgICAgICAgZGVmYXVsdDogZmFsc2UsXG4gICAgICAgICAgICBkZW1hbmRPcHRpb246IGZhbHNlLFxuICAgICAgICAgICAgZGVzY3JpYmU6IFwiUGVyZm9ybSBhbGwgb3BlcmF0aW9ucyBidXQgZG8gbm90IHB1c2ggdG8gb3JpZ2luXCJcbiAgICAgICAgfVxuICAgIClcbiAgICAudmVyc2lvbigpICAvLyB2ZXJzaW9uIHdpbGwgYmUgcmVhZCBmcm9tIHBhY2thZ2UuanNvbiFcbiAgICAuZGVtYW5kQ29tbWFuZCgxKVxuICAgIC53cmFwKDgwKVxuICAgIC5hcmd2O1xuXG4gICAgLy8gR2V0IHRoZSBzb3VyY2UgcHJvamVjdCBkaXJlY3RvcnkgZnJvbSB0aGUgY29tbWFuZCBsaW5lIGFyZ3VtZW50cy4gIElmIG5vdFxuICAgIC8vIHByZXNlbnQsIGFzc3VtZSB0aGUgY3VycmVudCB3b3JraW5nIGRpcmVjdG9yeS5cbiAgICBjb25zdCBzcmNEaXJTdHIgPSBhcmd2Ll9bMF0gfHwgXCIuXCI7XG4gICAgY29uc3Qgc3JjRGlyID0gbmV3IERpcmVjdG9yeShzcmNEaXJTdHIpO1xuICAgIGlmICghc3JjRGlyLmV4aXN0c1N5bmMoKSlcbiAgICB7XG4gICAgICAgIGNvbnNvbGUubG9nKGBUaGUgZGlyZWN0b3J5ICR7c3JjRGlyU3RyfSBkb2VzIG5vdCBleGlzdC5gKTtcbiAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICB9XG5cbiAgICBjb25zdCBjbWRMaW5lT3B0cyA9IHtcbiAgICAgICAgZHJ5UnVuOiBhcmd2W1wiZHJ5LXJ1blwiXSxcbiAgICAgICAgc3JjRGlyOiBzcmNEaXJcbiAgICB9O1xuICAgIHJldHVybiBjbWRMaW5lT3B0cztcbn1cblxuXG5hc3luYyBmdW5jdGlvbiBnZXRTcmMoY21kTGluZU9wdHM6IElDbWRMaW5lT3B0cyk6XG5Qcm9taXNlPHtcbiAgICBkaXI6IERpcmVjdG9yeSxcbiAgICByZXBvOiBHaXRSZXBvLFxuICAgIHBrZzogTm9kZVBhY2thZ2UsXG4gICAgdmVyc2lvbjogU2VtVmVyLFxuICAgIHB1Ymxpc2hUb0dpdENvbmZpZzogSVB1Ymxpc2hUb0dpdENvbmZpZ1xufT5cbntcbiAgICBjb25zdCBzcmNSZXBvID0gYXdhaXQgR2l0UmVwby5mcm9tRGlyZWN0b3J5KGNtZExpbmVPcHRzLnNyY0Rpcik7XG5cbiAgICAvLyBNYWtlIHN1cmUgdGhlIHNwZWNpZmllZCBkaXJlY3RvcnkgaXMgYSBOUE0gcHJvamVjdCAoY29udGFpbnMgYVxuICAgIC8vIHBhY2thZ2UuanNvbikuXG4gICAgY29uc3QgcGtnID0gYXdhaXQgTm9kZVBhY2thZ2UuZnJvbURpcmVjdG9yeShjbWRMaW5lT3B0cy5zcmNEaXIpXG4gICAgLmNhdGNoKCgpID0+IHtcbiAgICAgICAgcmV0dXJuIFByb21pc2UucmVqZWN0KG5ldyBFcnJvcihgVGhlIGRpcmVjdG9yeSAke2NtZExpbmVPcHRzLnNyY0Rpci50b1N0cmluZygpfSBpcyBub3QgYSBOUE0gcGFja2FnZS5gKSk7XG4gICAgfSk7XG5cbiAgICAvLyBNYWtlIHN1cmUgdGhlIHNwZWNpZmllZCBkaXJlY3RvcnkgaGFzIGEgcHVibGlzaHRvZ2l0Lmpzb24uXG4gICAgY29uc3QgY29uZmlnRmlsZSA9IG5ldyBGaWxlKGNtZExpbmVPcHRzLnNyY0RpciwgXCJwdWJsaXNodG9naXQuanNvblwiKTtcbiAgICBpZiAoIWNvbmZpZ0ZpbGUuZXhpc3RzU3luYygpKSB7XG4gICAgICAgIHJldHVybiBQcm9taXNlLnJlamVjdChuZXcgRXJyb3IoYENvdWxkIG5vdCBmaW5kIGZpbGUgJHtjb25maWdGaWxlLnRvU3RyaW5nKCl9LmApKTtcbiAgICB9XG5cbiAgICBjb25zdCBwdWJsaXNoVG9HaXRDb25maWcgPSBjb25maWdGaWxlLnJlYWRKc29uU3luYzxJUHVibGlzaFRvR2l0Q29uZmlnPigpO1xuICAgIGlmICghcHVibGlzaFRvR2l0Q29uZmlnKSB7XG4gICAgICAgIHJldHVybiBQcm9taXNlLnJlamVjdChuZXcgRXJyb3IoYENvdWxkIG5vdCByZWFkIGNvbmZpZ3VyYXRpb24gZnJvbSAke2NvbmZpZ0ZpbGUudG9TdHJpbmcoKX0uYCkpO1xuICAgIH1cblxuICAgIGNvbnN0IHNlbXZlciA9IFNlbVZlci5mcm9tU3RyaW5nKHBrZy5jb25maWcudmVyc2lvbik7XG4gICAgaWYgKCFzZW12ZXIpXG4gICAge1xuICAgICAgICByZXR1cm4gUHJvbWlzZS5yZWplY3QobmV3IEVycm9yKGBJbnZhbGlkIHNlbXZlciB2ZXJzaW9uIHN0cmluZyAke3BrZy5jb25maWcudmVyc2lvbn0uYCkpO1xuICAgIH1cblxuICAgIHJldHVybiB7XG4gICAgICAgIGRpcjogICAgICAgICAgICAgICAgY21kTGluZU9wdHMuc3JjRGlyLFxuICAgICAgICByZXBvOiAgICAgICAgICAgICAgIHNyY1JlcG8sXG4gICAgICAgIHBrZzogICAgICAgICAgICAgICAgcGtnLFxuICAgICAgICB2ZXJzaW9uOiAgICAgICAgICAgIHNlbXZlcixcbiAgICAgICAgcHVibGlzaFRvR2l0Q29uZmlnOiBwdWJsaXNoVG9HaXRDb25maWdcbiAgICB9O1xufVxuXG5cbmFzeW5jIGZ1bmN0aW9uIG1haW4oKTogUHJvbWlzZTx2b2lkPlxue1xuICAgIC8vXG4gICAgLy8gTWFrZSBzdXJlIHRoZSBnbG9iYWwgdG1wRGlyIGV4aXN0cy5cbiAgICAvL1xuICAgIGdsb2JhbENvbmZpZy50bXBEaXIuZW5zdXJlRXhpc3RzU3luYygpO1xuXG4gICAgY29uc3QgY21kTGluZU9wdHMgPSBwYXJzZUFyZ3MoKTtcbiAgICBpZiAoIWNtZExpbmVPcHRzKVxuICAgIHtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGNvbnN0IHNyYyA9IGF3YWl0IGdldFNyYyhjbWRMaW5lT3B0cyk7XG4gICAgY29uc29sZS5sb2coYFByb2plY3Qgd2lsbCBwdWJsaXNoIHRvIEdpdCByZXBvc2l0b3J5OiAke3NyYy5wdWJsaXNoVG9HaXRDb25maWcucHVibGlzaFJlcG9zaXRvcnl9LmApO1xuXG4gICAgLy9cbiAgICAvLyBUT0RPOiBJZiB0aGUgc291cmNlIHJlcG8gaGFzIGEgQ0hBTkdFTE9HLm1kLCBtYWtlIHN1cmUgaXQgaGFzIGEgc2VjdGlvblxuICAgIC8vIGRlc2NyaWJpbmcgdGhpcyByZWxlYXNlLiAgTWF5YmUgSSBjb3VsZCBoZWxwIGdlbmVyYXRlIGl0IGJ5IHByb3ZpZGluZyBhbGxcbiAgICAvLyBjb21taXRzIHNpbmNlIGxhc3QgbGFiZWw/XG4gICAgLy9cblxuICAgIC8vXG4gICAgLy8gRmlndXJlIG91dCB3aGF0IHRoZSBwdWJsaXNoIHJlcG8gZGlyZWN0b3J5IGFuZCBudWtlIGl0IGlmIGl0IGFscmVhZHlcbiAgICAvLyBleGlzdHMuXG4gICAgLy9cbiAgICBjb25zdCBwdWJsaXNoUHJvak5hbWUgPSBnaXRVcmxUb1Byb2plY3ROYW1lKHNyYy5wdWJsaXNoVG9HaXRDb25maWcucHVibGlzaFJlcG9zaXRvcnkpO1xuICAgIGNvbnN0IHB1Ymxpc2hEaXIgPSBuZXcgRGlyZWN0b3J5KGdsb2JhbENvbmZpZy50bXBEaXIsIHB1Ymxpc2hQcm9qTmFtZSk7XG4gICAgcHVibGlzaERpci5kZWxldGVTeW5jKCk7XG4gICAgY29uc29sZS5sb2coYFRlbXAgcHVibGlzaCBkaXJlY3Rvcnk6ICR7cHVibGlzaERpci50b1N0cmluZygpfWApO1xuXG4gICAgLy9cbiAgICAvLyBDbG9uZSB0aGUgcHVibGlzaCByZXBvLlxuICAgIC8vXG4gICAgY29uc3QgcHVibGlzaFJlcG9QYXRoID0gR2l0UmVwb1BhdGguZnJvbVVybChzcmMucHVibGlzaFRvR2l0Q29uZmlnLnB1Ymxpc2hSZXBvc2l0b3J5KTtcbiAgICBpZiAoIXB1Ymxpc2hSZXBvUGF0aCkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYEludmFsaWQgcHVibGlzaCByZXBvIFVSTCBcIiR7c3JjLnB1Ymxpc2hUb0dpdENvbmZpZy5wdWJsaXNoUmVwb3NpdG9yeX1cIi5gKTtcbiAgICB9XG4gICAgY29uc29sZS5sb2coYENsb25pbmcgcHVibGlzaCByZXBvLi4uYCk7XG4gICAgY29uc3QgcHVibGlzaFJlcG8gPSBhd2FpdCBHaXRSZXBvLmNsb25lKHB1Ymxpc2hSZXBvUGF0aCwgZ2xvYmFsQ29uZmlnLnRtcERpcik7XG5cbiAgICAvL1xuICAgIC8vIENoZWNrIHRvIHNlZSBpZiB0aGUgY3VycmVudCB2ZXJzaW9uIGhhcyBhbHJlYWR5IGJlZW4gcHVibGlzaGVkIHNvXG4gICAgLy8gdGhhdCB3ZSBjYW4gcmV0dXJuIGFuIGVycm9yIGJlZm9yZSB0YWtpbmcgYW55IGZ1cnRoZXIgYWN0aW9uLlxuICAgIC8vXG4gICAgY29uc3QgaGFzVGFnID0gYXdhaXQgcHVibGlzaFJlcG8uaGFzVGFnKHNyYy52ZXJzaW9uLmdldFBhdGNoVmVyc2lvblN0cmluZygpKTtcbiAgICBpZiAoaGFzVGFnKVxuICAgIHtcbiAgICAgICAgY29uc3QgbXNnID0gYFRoZSBwdWJsaXNoIHJlcG8gYWxyZWFkeSBoYXMgdGFnICR7c3JjLnZlcnNpb24uZ2V0UGF0Y2hWZXJzaW9uU3RyaW5nKCl9LiBgICtcbiAgICAgICAgICAgIFwiSGF2ZSB5b3UgZm9yZ290dGVuIHRvIGJ1bXAgdGhlIHZlcnNpb24gbnVtYmVyP1wiO1xuICAgICAgICBjb25zb2xlLmxvZyhtc2cpO1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IobXNnKTtcbiAgICB9XG5cbiAgICAvL1xuICAgIC8vIFRvIG1ha2Ugdmlld2luZyBkaWZmZXJlbmNlcyBiZXR3ZWVuIHJlbGVhc2VzIGEgbGl0dGxlIGVhc2llciwgY2hlY2tvdXRcbiAgICAvLyB0aGUgYnJhbmNoIG5hbWVkIGFmdGVyIHRoZSBtYWpvciB2ZXJzaW9uIGFuZCB0aGVuIHRoZSBtYWpvci5taW5vclxuICAgIC8vIHZlcnNpb24uXG4gICAgLy9cbiAgICBjb25zdCBtYWpvckJyYW5jaE5hbWUgPSBzcmMudmVyc2lvbi5nZXRNYWpvclZlcnNpb25TdHJpbmcoKTtcbiAgICBjb25zb2xlLmxvZyhgQ2hlY2tpbmcgb3V0IGJyYW5jaDogJHttYWpvckJyYW5jaE5hbWV9YCk7XG4gICAgY29uc3QgbWFqb3JCcmFuY2ggPSBhd2FpdCBHaXRCcmFuY2guY3JlYXRlKHB1Ymxpc2hSZXBvLCBtYWpvckJyYW5jaE5hbWUpO1xuICAgIGF3YWl0IHB1Ymxpc2hSZXBvLmNoZWNrb3V0KG1ham9yQnJhbmNoLCB0cnVlKTtcbiAgICBhd2FpdCBwdWJsaXNoUmVwby5wdXNoQ3VycmVudEJyYW5jaChcIm9yaWdpblwiLCB0cnVlKTtcblxuICAgIGNvbnN0IG1pbm9yQnJhbmNoTmFtZSA9IHNyYy52ZXJzaW9uLmdldE1pbm9yVmVyc2lvblN0cmluZygpO1xuICAgIGNvbnNvbGUubG9nKGBDaGVja2luZyBvdXQgYnJhbmNoOiAke21pbm9yQnJhbmNoTmFtZX1gKTtcbiAgICBjb25zdCBtaW5vckJyYW5jaCA9IGF3YWl0IEdpdEJyYW5jaC5jcmVhdGUocHVibGlzaFJlcG8sIG1pbm9yQnJhbmNoTmFtZSk7XG4gICAgYXdhaXQgcHVibGlzaFJlcG8uY2hlY2tvdXQobWlub3JCcmFuY2gsIHRydWUpO1xuICAgIGF3YWl0IHB1Ymxpc2hSZXBvLnB1c2hDdXJyZW50QnJhbmNoKFwib3JpZ2luXCIsIHRydWUpO1xuXG4gICAgLy9cbiAgICAvLyBSZW1vdmUgYWxsIGZpbGVzIHVuZGVyIHZlcnNpb24gY29udHJvbCBhbmQgcHJ1bmUgZGlyZWN0b3JpZXMgdGhhdCBhcmVcbiAgICAvLyBlbXB0eS5cbiAgICAvL1xuICAgIGNvbnNvbGUubG9nKFwiRGVsZXRpbmcgYWxsIGZpbGVzLi4uXCIpO1xuICAgIGF3YWl0IGRlbGV0ZVRyYWNrZWRGaWxlcyhwdWJsaXNoUmVwbyk7XG4gICAgYXdhaXQgcHVibGlzaERpci5wcnVuZSgpO1xuXG4gICAgLy9cbiAgICAvLyBQdWJsaXNoIHRoZSBzb3VyY2UgcmVwbyB0byB0aGUgcHVibGlzaCBkaXJlY3RvcnkuXG4gICAgLy9cbiAgICBjb25zb2xlLmxvZyhcIlB1Ymxpc2hpbmcgcGFja2FnZSBjb250ZW50cyB0byBwdWJsaXNoIHJlcG9zaXRvcnkuLi5cIik7XG4gICAgYXdhaXQgc3JjLnBrZy5wdWJsaXNoKHB1Ymxpc2hEaXIsIGZhbHNlKTtcblxuICAgIC8vXG4gICAgLy8gTW9kaWZ5IHRoZSBwYWNrYWdlLmpzb24gZmlsZSBzbyB0aGF0IHRoZSBwdWJsaXNoIHJlcG8gcGFja2FnZVxuICAgIC8vIC0gaXMgbmFtZWQgYWZ0ZXIgdGhlIHB1Ymxpc2ggcmVwb1xuICAgIC8vIC0gdGhlIHJlcG9zaXRvcnkgdXJsIHBvaW50cyB0byB0aGUgcHVibGlzaCByZXBvIGluc3RlYWQgb2YgdGhlIHNvdXJjZSByZXBvXG4gICAgLy9cbiAgICBjb25zb2xlLmxvZyhcIlVwZGF0aW5nIHB1Ymxpc2ggcGFja2FnZS5qc29uLi4uXCIpO1xuICAgIGNvbnN0IHB1Ymxpc2hQYWNrYWdlSnNvbkZpbGUgPSBuZXcgRmlsZShwdWJsaXNoRGlyLCBcInBhY2thZ2UuanNvblwiKTtcbiAgICBjb25zdCBwdWJsaXNoUGFja2FnZUpzb24gPSBwdWJsaXNoUGFja2FnZUpzb25GaWxlLnJlYWRKc29uU3luYzxJUGFja2FnZUpzb24+KCk7XG4gICAgcHVibGlzaFBhY2thZ2VKc29uLnJlcG9zaXRvcnkudXJsID0gc3JjLnB1Ymxpc2hUb0dpdENvbmZpZy5wdWJsaXNoUmVwb3NpdG9yeTtcbiAgICBwdWJsaXNoUGFja2FnZUpzb24ubmFtZSA9IHB1Ymxpc2hQcm9qTmFtZTtcbiAgICBwdWJsaXNoUGFja2FnZUpzb25GaWxlLndyaXRlSnNvblN5bmMocHVibGlzaFBhY2thZ2VKc29uKTtcblxuICAgIC8vXG4gICAgLy8gU3RhZ2UgYW5kIGNvbW1pdCB0aGUgcHVibGlzaGVkIGZpbGVzLlxuICAgIC8vXG4gICAgY29uc29sZS5sb2coXCJDb21taXRpbmcgcHVibGlzaGVkIGZpbGVzLi4uXCIpO1xuICAgIGF3YWl0IHB1Ymxpc2hSZXBvLnN0YWdlQWxsKCk7XG4gICAgY29uc3QgY29tbWl0TXNnID0gYHB1Ymxpc2gtdG8tZ2l0IHB1Ymxpc2hpbmcgdmVyc2lvbiAke3NyYy52ZXJzaW9uLmdldFBhdGNoVmVyc2lvblN0cmluZygpfS5gO1xuICAgIGF3YWl0IHB1Ymxpc2hSZXBvLmNvbW1pdChjb21taXRNc2cpO1xuXG4gICAgLy8gQXBwbHkgYSB0YWcgd2l0aCB0aGUgdmVyc2lvbiBudW1iZXIuXG4gICAgLy8gVE9ETzogSWYgdGhlIHNvdXJjZSByZXBvIGhhcyBhIENIQU5HRUxPRy5tZCwgYWRkIGl0cyBjb250ZW50cyBhdCB0aGUgYW5ub3RhdGVkIHRhZyBtZXNzYWdlLlxuICAgIGNvbnN0IHRhZ05hbWUgPSBzcmMudmVyc2lvbi5nZXRQYXRjaFZlcnNpb25TdHJpbmcoKTtcbiAgICBjb25zb2xlLmxvZyhgQXBwbHlpbmcgdGFnOiAke3RhZ05hbWV9YCk7XG4gICAgYXdhaXQgcHVibGlzaFJlcG8uY3JlYXRlVGFnKHRhZ05hbWUpO1xuXG4gICAgaWYgKGNtZExpbmVPcHRzLmRyeVJ1bilcbiAgICB7XG4gICAgICAgIGNvbnN0IG1zZyA9IFtcbiAgICAgICAgICAgIFwiUnVubmluZyBpbiBkcnktcnVuIG1vZGUuICBUaGUgcmVwb3NpdG9yeSBpbiB0aGUgZm9sbG93aW5nIHRlbXBvcmFyeSBkaXJlY3RvcnlcIixcbiAgICAgICAgICAgIFwiaGFzIGJlZW4gbGVmdCByZWFkeSB0byBwdXNoIHRvIGEgcHVibGljIHNlcnZlci5cIixcbiAgICAgICAgICAgIHB1Ymxpc2hEaXIudG9TdHJpbmcoKVxuICAgICAgICBdO1xuICAgICAgICBjb25zb2xlLmxvZyhtc2cuam9pbihcIlxcblwiKSk7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICAvLyBQdXNoIHRoZSBicmFuY2ggYW5kIHRoZSB0YWcuXG4gICAgY29uc29sZS5sb2coXCJQdXNoaW5nIHRvIG9yaWdpbi4uLlwiKTtcbiAgICBhd2FpdCBwdWJsaXNoUmVwby5wdXNoQ3VycmVudEJyYW5jaChcIm9yaWdpblwiKTtcbiAgICBhd2FpdCBwdWJsaXNoUmVwby5wdXNoVGFnKHRhZ05hbWUsIFwib3JpZ2luXCIpO1xuXG4gICAgLy9cbiAgICAvLyBQcmludCBhIGNvbXBsZXRpb24gbWVzc2FnZS5cbiAgICAvLyBUZWxsIHRoZSB1c2VyIGhvdyB0byBpbmNsdWRlIHRoZSBwdWJsaXNoZWQgcmVwb3NpdG9yeSBpbnRvIGFub3RoZXJcbiAgICAvLyBwcm9qZWN0J3MgZGVwZW5kZW5jaWVzLlxuICAgIC8vXG4gICAgY29uc3QgZGVwZW5kZW5jeVVybCA9IFVybC5zZXRQcm90b2NvbChzcmMucHVibGlzaFRvR2l0Q29uZmlnLnB1Ymxpc2hSZXBvc2l0b3J5LCBcImdpdCtodHRwc1wiKTtcbiAgICBjb25zdCBucG1JbnN0YWxsQ21kID0gYG5wbSBpbnN0YWxsICR7ZGVwZW5kZW5jeVVybH0jJHt0YWdOYW1lfWA7XG4gICAgY29uc3QgZG9uZU1lc3NhZ2UgPSBbXG4gICAgICAgIFwiRG9uZS5cIixcbiAgICAgICAgXCJUbyBpbmNsdWRlIHRoZSBwdWJsaXNoZWQgbGlicmFyeSBpbiBhIE5vZGUuanMgcHJvamVjdCwgZXhlY3V0ZSB0aGUgZm9sbG93aW5nIGNvbW1hbmQ6XCIsXG4gICAgICAgIG5wbUluc3RhbGxDbWRcbiAgICBdO1xuICAgIGNvbnNvbGUubG9nKGRvbmVNZXNzYWdlLmpvaW4oXCJcXG5cIikpO1xuXG4gICAgLy8gXCJlbmlwanMtY29yZVwiOiBcImdpdCtodHRwczovL21mdC5yYS1pbnQuY29tL2dpdGxhYi9hcHAtcGxhdGZvcm0vZW5pcGpzLWNvcmUuZ2l0IzU5ZjA5YjdcIlxufVxuXG5cbi8qKlxuICogRGVsZXRlcyBhbGwgdHJhY2tlZCBmaWxlcyB3aXRoaW4gYSByZXBvLlxuICogQHBhcmFtIHJlcG8gLSBUaGUgcmVwbyB0byBjbGVhclxuICogQHJldHVybiBBIFByb21pc2UgdGhhdCBpcyByZXNvbHZlZCB3aGVuIGFsbCBmaWxlcyBoYXZlIGJlZW4gZGVsZXRlZC5cbiAqL1xuYXN5bmMgZnVuY3Rpb24gZGVsZXRlVHJhY2tlZEZpbGVzKHJlcG86IEdpdFJlcG8pOiBQcm9taXNlPHZvaWQ+XG57XG4gICAgY29uc3QgZmlsZXMgPSBhd2FpdCByZXBvLmZpbGVzKCk7XG4gICAgY29uc3QgZGVsZXRlUHJvbWlzZXMgPSBfLm1hcChmaWxlcywgKGN1ckZpbGUpID0+IHtcbiAgICAgICAgcmV0dXJuIGN1ckZpbGUuZGVsZXRlKCk7XG4gICAgfSk7XG5cbiAgICBhd2FpdCBQcm9taXNlLmFsbChkZWxldGVQcm9taXNlcyk7XG59XG5cblxubWFpbigpO1xuIl19
