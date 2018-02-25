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
        var cmdLineOpts, src, publishProjName, publishDir, publishRepoPath, publishRepo, newTagName, hasTag, msg, majorBranchName, majorBranch, minorBranchName, minorBranch, publishPackageJsonFile, publishPackageJson, commitMsg, msg, dependencyUrl, npmInstallCmd, doneMessage;
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
                    newTagName = "v" + src.pkg.config.version;
                    return [4 /*yield*/, publishRepo.hasTag(newTagName)];
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
                    // Apply a tag with the version number.
                    // TODO: If the source repo has a CHANGELOG.md, add its contents at the annotated tag message.
                    console.log("Applying tag: " + newTagName);
                    return [4 /*yield*/, publishRepo.createTag(newTagName)];
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
                    return [4 /*yield*/, publishRepo.pushTag(newTagName, "origin")];
                case 17:
                    _a.sent();
                    dependencyUrl = url_1.Url.setProtocol(src.publishToGitConfig.publishRepository, "git+https");
                    npmInstallCmd = "npm install " + dependencyUrl + "#" + newTagName;
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

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9wdWJsaXNoLXRvLWdpdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUVBLHlDQUFzQztBQUN0QywrQkFBNEI7QUFDNUIscUNBQWtDO0FBQ2xDLDJEQUE0RDtBQUU1RCw2Q0FBd0Q7QUFDeEQsNkNBQStEO0FBQy9ELG1DQUFnQztBQUNoQyx5Q0FBc0M7QUFDdEMsMEJBQTRCO0FBQzVCLDZCQUEwQjtBQUMxQiw2QkFBK0I7QUFVL0I7SUFDSSxJQUFNLElBQUksR0FBRyxLQUFLO1NBQ2pCLEtBQUssQ0FBQyxpRkFBaUYsQ0FBQztTQUN4RixJQUFJLEVBQUU7U0FDTixNQUFNLENBQ0gsU0FBUyxFQUNUO1FBQ0ksSUFBSSxFQUFFLFNBQVM7UUFDZixPQUFPLEVBQUUsS0FBSztRQUNkLFlBQVksRUFBRSxLQUFLO1FBQ25CLFFBQVEsRUFBRSxrREFBa0Q7S0FDL0QsQ0FDSjtTQUNBLE9BQU8sRUFBRSxDQUFFLDBDQUEwQztTQUNyRCxhQUFhLENBQUMsQ0FBQyxDQUFDO1NBQ2hCLElBQUksQ0FBQyxFQUFFLENBQUM7U0FDUixJQUFJLENBQUM7SUFFTiw0RUFBNEU7SUFDNUUsaURBQWlEO0lBQ2pELElBQU0sU0FBUyxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksR0FBRyxDQUFDO0lBQ25DLElBQU0sTUFBTSxHQUFHLElBQUkscUJBQVMsQ0FBQyxTQUFTLENBQUMsQ0FBQztJQUN4QyxFQUFFLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxVQUFVLEVBQUUsQ0FBQyxDQUN6QixDQUFDO1FBQ0csT0FBTyxDQUFDLEdBQUcsQ0FBQyxtQkFBaUIsU0FBUyxxQkFBa0IsQ0FBQyxDQUFDO1FBQzFELE1BQU0sQ0FBQyxTQUFTLENBQUM7SUFDckIsQ0FBQztJQUVELElBQU0sV0FBVyxHQUFHO1FBQ2hCLE1BQU0sRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDO1FBQ3ZC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ZXNDb250ZW50IjpbIiMhL3Vzci9iaW4vZW52IG5vZGVcblxuaW1wb3J0IHtEaXJlY3Rvcnl9IGZyb20gXCIuL2RpcmVjdG9yeVwiO1xuaW1wb3J0IHtGaWxlfSBmcm9tIFwiLi9maWxlXCI7XG5pbXBvcnQge0dpdFJlcG99IGZyb20gXCIuL2dpdFJlcG9cIjtcbmltcG9ydCB7Y29uZmlnIGFzIGdsb2JhbENvbmZpZ30gZnJvbSBcIi4vcHVibGlzaFRvR2l0Q29uZmlnXCI7XG5pbXBvcnQge0lQdWJsaXNoVG9HaXRDb25maWd9IGZyb20gXCIuL2NvbmZpZ0hlbHBlcnNcIjtcbmltcG9ydCB7SVBhY2thZ2VKc29uLCBOb2RlUGFja2FnZX0gZnJvbSBcIi4vbm9kZVBhY2thZ2VcIjtcbmltcG9ydCB7R2l0UmVwb1BhdGgsIGdpdFVybFRvUHJvamVjdE5hbWV9IGZyb20gXCIuL0dpdFJlcG9QYXRoXCI7XG5pbXBvcnQge1NlbVZlcn0gZnJvbSBcIi4vU2VtVmVyXCI7XG5pbXBvcnQge0dpdEJyYW5jaH0gZnJvbSBcIi4vZ2l0QnJhbmNoXCI7XG5pbXBvcnQgKiBhcyBfIGZyb20gXCJsb2Rhc2hcIjtcbmltcG9ydCB7VXJsfSBmcm9tIFwiLi91cmxcIjtcbmltcG9ydCAqIGFzIHlhcmdzIGZyb20gXCJ5YXJnc1wiO1xuXG5cbmludGVyZmFjZSBJQ21kTGluZU9wdHNcbntcbiAgICBkcnlSdW46IGJvb2xlYW47XG4gICAgc3JjRGlyOiBEaXJlY3Rvcnk7XG59XG5cblxuZnVuY3Rpb24gcGFyc2VBcmdzKCk6IElDbWRMaW5lT3B0cyB8IHVuZGVmaW5lZCB7XG4gICAgY29uc3QgYXJndiA9IHlhcmdzXG4gICAgLnVzYWdlKFwiUHVibGlzaGVzIGEgTm9kZSBwYWNrYWdlIHRvIGEgR2l0IHJlcG8uXFxuVXNhZ2U6ICQwIFstLWRyeS1ydW5dIHNvdXJjZV9kaXJlY3RvcnlcIilcbiAgICAuaGVscCgpXG4gICAgLm9wdGlvbihcbiAgICAgICAgXCJkcnktcnVuXCIsXG4gICAgICAgIHtcbiAgICAgICAgICAgIHR5cGU6IFwiYm9vbGVhblwiLFxuICAgICAgICAgICAgZGVmYXVsdDogZmFsc2UsXG4gICAgICAgICAgICBkZW1hbmRPcHRpb246IGZhbHNlLFxuICAgICAgICAgICAgZGVzY3JpYmU6IFwiUGVyZm9ybSBhbGwgb3BlcmF0aW9ucyBidXQgZG8gbm90IHB1c2ggdG8gb3JpZ2luXCJcbiAgICAgICAgfVxuICAgIClcbiAgICAudmVyc2lvbigpICAvLyB2ZXJzaW9uIHdpbGwgYmUgcmVhZCBmcm9tIHBhY2thZ2UuanNvbiFcbiAgICAuZGVtYW5kQ29tbWFuZCgxKVxuICAgIC53cmFwKDgwKVxuICAgIC5hcmd2O1xuXG4gICAgLy8gR2V0IHRoZSBzb3VyY2UgcHJvamVjdCBkaXJlY3RvcnkgZnJvbSB0aGUgY29tbWFuZCBsaW5lIGFyZ3VtZW50cy4gIElmIG5vdFxuICAgIC8vIHByZXNlbnQsIGFzc3VtZSB0aGUgY3VycmVudCB3b3JraW5nIGRpcmVjdG9yeS5cbiAgICBjb25zdCBzcmNEaXJTdHIgPSBhcmd2Ll9bMF0gfHwgXCIuXCI7XG4gICAgY29uc3Qgc3JjRGlyID0gbmV3IERpcmVjdG9yeShzcmNEaXJTdHIpO1xuICAgIGlmICghc3JjRGlyLmV4aXN0c1N5bmMoKSlcbiAgICB7XG4gICAgICAgIGNvbnNvbGUubG9nKGBUaGUgZGlyZWN0b3J5ICR7c3JjRGlyU3RyfSBkb2VzIG5vdCBleGlzdC5gKTtcbiAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICB9XG5cbiAgICBjb25zdCBjbWRMaW5lT3B0cyA9IHtcbiAgICAgICAgZHJ5UnVuOiBhcmd2W1wiZHJ5LXJ1blwiXSxcbiAgICAgICAgc3JjRGlyOiBzcmNEaXJcbiAgICB9O1xuICAgIHJldHVybiBjbWRMaW5lT3B0cztcbn1cblxuXG5hc3luYyBmdW5jdGlvbiBnZXRTcmMoY21kTGluZU9wdHM6IElDbWRMaW5lT3B0cyk6XG5Qcm9taXNlPHtcbiAgICBkaXI6IERpcmVjdG9yeSxcbiAgICByZXBvOiBHaXRSZXBvLFxuICAgIHBrZzogTm9kZVBhY2thZ2UsXG4gICAgdmVyc2lvbjogU2VtVmVyLFxuICAgIHB1Ymxpc2hUb0dpdENvbmZpZzogSVB1Ymxpc2hUb0dpdENvbmZpZ1xufT5cbntcbiAgICBjb25zdCBzcmNSZXBvID0gYXdhaXQgR2l0UmVwby5mcm9tRGlyZWN0b3J5KGNtZExpbmVPcHRzLnNyY0Rpcik7XG5cbiAgICAvLyBNYWtlIHN1cmUgdGhlIHNwZWNpZmllZCBkaXJlY3RvcnkgaXMgYSBOUE0gcHJvamVjdCAoY29udGFpbnMgYVxuICAgIC8vIHBhY2thZ2UuanNvbikuXG4gICAgY29uc3QgcGtnID0gYXdhaXQgTm9kZVBhY2thZ2UuZnJvbURpcmVjdG9yeShjbWRMaW5lT3B0cy5zcmNEaXIpXG4gICAgLmNhdGNoKCgpID0+IHtcbiAgICAgICAgcmV0dXJuIFByb21pc2UucmVqZWN0KG5ldyBFcnJvcihgVGhlIGRpcmVjdG9yeSAke2NtZExpbmVPcHRzLnNyY0Rpci50b1N0cmluZygpfSBpcyBub3QgYSBOUE0gcGFja2FnZS5gKSk7XG4gICAgfSk7XG5cbiAgICAvLyBNYWtlIHN1cmUgdGhlIHNwZWNpZmllZCBkaXJlY3RvcnkgaGFzIGEgcHVibGlzaHRvZ2l0Lmpzb24uXG4gICAgY29uc3QgY29uZmlnRmlsZSA9IG5ldyBGaWxlKGNtZExpbmVPcHRzLnNyY0RpciwgXCJwdWJsaXNodG9naXQuanNvblwiKTtcbiAgICBpZiAoIWNvbmZpZ0ZpbGUuZXhpc3RzU3luYygpKSB7XG4gICAgICAgIHJldHVybiBQcm9taXNlLnJlamVjdChuZXcgRXJyb3IoYENvdWxkIG5vdCBmaW5kIGZpbGUgJHtjb25maWdGaWxlLnRvU3RyaW5nKCl9LmApKTtcbiAgICB9XG5cbiAgICBjb25zdCBwdWJsaXNoVG9HaXRDb25maWcgPSBjb25maWdGaWxlLnJlYWRKc29uU3luYzxJUHVibGlzaFRvR2l0Q29uZmlnPigpO1xuICAgIGlmICghcHVibGlzaFRvR2l0Q29uZmlnKSB7XG4gICAgICAgIHJldHVybiBQcm9taXNlLnJlamVjdChuZXcgRXJyb3IoYENvdWxkIG5vdCByZWFkIGNvbmZpZ3VyYXRpb24gZnJvbSAke2NvbmZpZ0ZpbGUudG9TdHJpbmcoKX0uYCkpO1xuICAgIH1cblxuICAgIGNvbnN0IHNlbXZlciA9IFNlbVZlci5mcm9tU3RyaW5nKHBrZy5jb25maWcudmVyc2lvbik7XG4gICAgaWYgKCFzZW12ZXIpXG4gICAge1xuICAgICAgICByZXR1cm4gUHJvbWlzZS5yZWplY3QobmV3IEVycm9yKGBJbnZhbGlkIHNlbXZlciB2ZXJzaW9uIHN0cmluZyAke3BrZy5jb25maWcudmVyc2lvbn0uYCkpO1xuICAgIH1cblxuICAgIHJldHVybiB7XG4gICAgICAgIGRpcjogICAgICAgICAgICAgICAgY21kTGluZU9wdHMuc3JjRGlyLFxuICAgICAgICByZXBvOiAgICAgICAgICAgICAgIHNyY1JlcG8sXG4gICAgICAgIHBrZzogICAgICAgICAgICAgICAgcGtnLFxuICAgICAgICB2ZXJzaW9uOiAgICAgICAgICAgIHNlbXZlcixcbiAgICAgICAgcHVibGlzaFRvR2l0Q29uZmlnOiBwdWJsaXNoVG9HaXRDb25maWdcbiAgICB9O1xufVxuXG5cbmFzeW5jIGZ1bmN0aW9uIG1haW4oKTogUHJvbWlzZTx2b2lkPlxue1xuICAgIC8vXG4gICAgLy8gTWFrZSBzdXJlIHRoZSBnbG9iYWwgdG1wRGlyIGV4aXN0cy5cbiAgICAvL1xuICAgIGdsb2JhbENvbmZpZy50bXBEaXIuZW5zdXJlRXhpc3RzU3luYygpO1xuXG4gICAgY29uc3QgY21kTGluZU9wdHMgPSBwYXJzZUFyZ3MoKTtcbiAgICBpZiAoIWNtZExpbmVPcHRzKVxuICAgIHtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGNvbnN0IHNyYyA9IGF3YWl0IGdldFNyYyhjbWRMaW5lT3B0cyk7XG4gICAgY29uc29sZS5sb2coYFByb2plY3Qgd2lsbCBwdWJsaXNoIHRvIEdpdCByZXBvc2l0b3J5OiAke3NyYy5wdWJsaXNoVG9HaXRDb25maWcucHVibGlzaFJlcG9zaXRvcnl9LmApO1xuXG4gICAgLy9cbiAgICAvLyBUT0RPOiBJZiB0aGUgc291cmNlIHJlcG8gaGFzIGEgQ0hBTkdFTE9HLm1kLCBtYWtlIHN1cmUgaXQgaGFzIGEgc2VjdGlvblxuICAgIC8vIGRlc2NyaWJpbmcgdGhpcyByZWxlYXNlLiAgTWF5YmUgSSBjb3VsZCBoZWxwIGdlbmVyYXRlIGl0IGJ5IHByb3ZpZGluZyBhbGxcbiAgICAvLyBjb21taXRzIHNpbmNlIGxhc3QgbGFiZWw/XG4gICAgLy9cblxuICAgIC8vXG4gICAgLy8gRmlndXJlIG91dCB3aGF0IHRoZSBwdWJsaXNoIHJlcG8gZGlyZWN0b3J5IGFuZCBudWtlIGl0IGlmIGl0IGFscmVhZHlcbiAgICAvLyBleGlzdHMuXG4gICAgLy9cbiAgICBjb25zdCBwdWJsaXNoUHJvak5hbWUgPSBnaXRVcmxUb1Byb2plY3ROYW1lKHNyYy5wdWJsaXNoVG9HaXRDb25maWcucHVibGlzaFJlcG9zaXRvcnkpO1xuICAgIGNvbnN0IHB1Ymxpc2hEaXIgPSBuZXcgRGlyZWN0b3J5KGdsb2JhbENvbmZpZy50bXBEaXIsIHB1Ymxpc2hQcm9qTmFtZSk7XG4gICAgcHVibGlzaERpci5kZWxldGVTeW5jKCk7XG4gICAgY29uc29sZS5sb2coYFRlbXAgcHVibGlzaCBkaXJlY3Rvcnk6ICR7cHVibGlzaERpci50b1N0cmluZygpfWApO1xuXG4gICAgLy9cbiAgICAvLyBDbG9uZSB0aGUgcHVibGlzaCByZXBvLlxuICAgIC8vXG4gICAgY29uc3QgcHVibGlzaFJlcG9QYXRoID0gR2l0UmVwb1BhdGguZnJvbVVybChzcmMucHVibGlzaFRvR2l0Q29uZmlnLnB1Ymxpc2hSZXBvc2l0b3J5KTtcbiAgICBpZiAoIXB1Ymxpc2hSZXBvUGF0aCkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYEludmFsaWQgcHVibGlzaCByZXBvIFVSTCBcIiR7c3JjLnB1Ymxpc2hUb0dpdENvbmZpZy5wdWJsaXNoUmVwb3NpdG9yeX1cIi5gKTtcbiAgICB9XG4gICAgY29uc29sZS5sb2coYENsb25pbmcgcHVibGlzaCByZXBvLi4uYCk7XG4gICAgY29uc3QgcHVibGlzaFJlcG8gPSBhd2FpdCBHaXRSZXBvLmNsb25lKHB1Ymxpc2hSZXBvUGF0aCwgZ2xvYmFsQ29uZmlnLnRtcERpcik7XG5cbiAgICAvL1xuICAgIC8vIENoZWNrIHRvIHNlZSBpZiB0aGUgY3VycmVudCB2ZXJzaW9uIGhhcyBhbHJlYWR5IGJlZW4gcHVibGlzaGVkIHNvXG4gICAgLy8gdGhhdCB3ZSBjYW4gcmV0dXJuIGFuIGVycm9yIGJlZm9yZSB0YWtpbmcgYW55IGZ1cnRoZXIgYWN0aW9uLlxuICAgIC8vXG4gICAgY29uc3QgbmV3VGFnTmFtZSA9IGB2JHtzcmMucGtnLmNvbmZpZy52ZXJzaW9ufWA7XG4gICAgY29uc3QgaGFzVGFnID0gYXdhaXQgcHVibGlzaFJlcG8uaGFzVGFnKG5ld1RhZ05hbWUpO1xuICAgIGlmIChoYXNUYWcpXG4gICAge1xuICAgICAgICBjb25zdCBtc2cgPSBgVGhlIHB1Ymxpc2ggcmVwbyBhbHJlYWR5IGhhcyB0YWcgJHtzcmMudmVyc2lvbi5nZXRQYXRjaFZlcnNpb25TdHJpbmcoKX0uIGAgK1xuICAgICAgICAgICAgXCJIYXZlIHlvdSBmb3Jnb3R0ZW4gdG8gYnVtcCB0aGUgdmVyc2lvbiBudW1iZXI/XCI7XG4gICAgICAgIGNvbnNvbGUubG9nKG1zZyk7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihtc2cpO1xuICAgIH1cblxuICAgIC8vXG4gICAgLy8gVG8gbWFrZSB2aWV3aW5nIGRpZmZlcmVuY2VzIGJldHdlZW4gcmVsZWFzZXMgYSBsaXR0bGUgZWFzaWVyLCBjaGVja291dFxuICAgIC8vIHRoZSBicmFuY2ggbmFtZWQgYWZ0ZXIgdGhlIG1ham9yIHZlcnNpb24gYW5kIHRoZW4gdGhlIG1ham9yLm1pbm9yXG4gICAgLy8gdmVyc2lvbi5cbiAgICAvL1xuICAgIGNvbnN0IG1ham9yQnJhbmNoTmFtZSA9IHNyYy52ZXJzaW9uLmdldE1ham9yVmVyc2lvblN0cmluZygpO1xuICAgIGNvbnNvbGUubG9nKGBDaGVja2luZyBvdXQgYnJhbmNoOiAke21ham9yQnJhbmNoTmFtZX1gKTtcbiAgICBjb25zdCBtYWpvckJyYW5jaCA9IGF3YWl0IEdpdEJyYW5jaC5jcmVhdGUocHVibGlzaFJlcG8sIG1ham9yQnJhbmNoTmFtZSk7XG4gICAgYXdhaXQgcHVibGlzaFJlcG8uY2hlY2tvdXQobWFqb3JCcmFuY2gsIHRydWUpO1xuICAgIGF3YWl0IHB1Ymxpc2hSZXBvLnB1c2hDdXJyZW50QnJhbmNoKFwib3JpZ2luXCIsIHRydWUpO1xuXG4gICAgY29uc3QgbWlub3JCcmFuY2hOYW1lID0gc3JjLnZlcnNpb24uZ2V0TWlub3JWZXJzaW9uU3RyaW5nKCk7XG4gICAgY29uc29sZS5sb2coYENoZWNraW5nIG91dCBicmFuY2g6ICR7bWlub3JCcmFuY2hOYW1lfWApO1xuICAgIGNvbnN0IG1pbm9yQnJhbmNoID0gYXdhaXQgR2l0QnJhbmNoLmNyZWF0ZShwdWJsaXNoUmVwbywgbWlub3JCcmFuY2hOYW1lKTtcbiAgICBhd2FpdCBwdWJsaXNoUmVwby5jaGVja291dChtaW5vckJyYW5jaCwgdHJ1ZSk7XG4gICAgYXdhaXQgcHVibGlzaFJlcG8ucHVzaEN1cnJlbnRCcmFuY2goXCJvcmlnaW5cIiwgdHJ1ZSk7XG5cbiAgICAvL1xuICAgIC8vIFJlbW92ZSBhbGwgZmlsZXMgdW5kZXIgdmVyc2lvbiBjb250cm9sIGFuZCBwcnVuZSBkaXJlY3RvcmllcyB0aGF0IGFyZVxuICAgIC8vIGVtcHR5LlxuICAgIC8vXG4gICAgY29uc29sZS5sb2coXCJEZWxldGluZyBhbGwgZmlsZXMuLi5cIik7XG4gICAgYXdhaXQgZGVsZXRlVHJhY2tlZEZpbGVzKHB1Ymxpc2hSZXBvKTtcbiAgICBhd2FpdCBwdWJsaXNoRGlyLnBydW5lKCk7XG5cbiAgICAvL1xuICAgIC8vIFB1Ymxpc2ggdGhlIHNvdXJjZSByZXBvIHRvIHRoZSBwdWJsaXNoIGRpcmVjdG9yeS5cbiAgICAvL1xuICAgIGNvbnNvbGUubG9nKFwiUHVibGlzaGluZyBwYWNrYWdlIGNvbnRlbnRzIHRvIHB1Ymxpc2ggcmVwb3NpdG9yeS4uLlwiKTtcbiAgICBhd2FpdCBzcmMucGtnLnB1Ymxpc2gocHVibGlzaERpciwgZmFsc2UpO1xuXG4gICAgLy9cbiAgICAvLyBNb2RpZnkgdGhlIHBhY2thZ2UuanNvbiBmaWxlIHNvIHRoYXQgdGhlIHB1Ymxpc2ggcmVwbyBwYWNrYWdlXG4gICAgLy8gLSBpcyBuYW1lZCBhZnRlciB0aGUgcHVibGlzaCByZXBvXG4gICAgLy8gLSB0aGUgcmVwb3NpdG9yeSB1cmwgcG9pbnRzIHRvIHRoZSBwdWJsaXNoIHJlcG8gaW5zdGVhZCBvZiB0aGUgc291cmNlIHJlcG9cbiAgICAvL1xuICAgIGNvbnNvbGUubG9nKFwiVXBkYXRpbmcgcHVibGlzaCBwYWNrYWdlLmpzb24uLi5cIik7XG4gICAgY29uc3QgcHVibGlzaFBhY2thZ2VKc29uRmlsZSA9IG5ldyBGaWxlKHB1Ymxpc2hEaXIsIFwicGFja2FnZS5qc29uXCIpO1xuICAgIGNvbnN0IHB1Ymxpc2hQYWNrYWdlSnNvbiA9IHB1Ymxpc2hQYWNrYWdlSnNvbkZpbGUucmVhZEpzb25TeW5jPElQYWNrYWdlSnNvbj4oKTtcbiAgICBwdWJsaXNoUGFja2FnZUpzb24ucmVwb3NpdG9yeS51cmwgPSBzcmMucHVibGlzaFRvR2l0Q29uZmlnLnB1Ymxpc2hSZXBvc2l0b3J5O1xuICAgIHB1Ymxpc2hQYWNrYWdlSnNvbi5uYW1lID0gcHVibGlzaFByb2pOYW1lO1xuICAgIHB1Ymxpc2hQYWNrYWdlSnNvbkZpbGUud3JpdGVKc29uU3luYyhwdWJsaXNoUGFja2FnZUpzb24pO1xuXG4gICAgLy9cbiAgICAvLyBTdGFnZSBhbmQgY29tbWl0IHRoZSBwdWJsaXNoZWQgZmlsZXMuXG4gICAgLy9cbiAgICBjb25zb2xlLmxvZyhcIkNvbW1pdGluZyBwdWJsaXNoZWQgZmlsZXMuLi5cIik7XG4gICAgYXdhaXQgcHVibGlzaFJlcG8uc3RhZ2VBbGwoKTtcbiAgICBjb25zdCBjb21taXRNc2cgPSBgcHVibGlzaC10by1naXQgcHVibGlzaGluZyB2ZXJzaW9uICR7c3JjLnZlcnNpb24uZ2V0UGF0Y2hWZXJzaW9uU3RyaW5nKCl9LmA7XG4gICAgYXdhaXQgcHVibGlzaFJlcG8uY29tbWl0KGNvbW1pdE1zZyk7XG5cbiAgICAvLyBBcHBseSBhIHRhZyB3aXRoIHRoZSB2ZXJzaW9uIG51bWJlci5cbiAgICAvLyBUT0RPOiBJZiB0aGUgc291cmNlIHJlcG8gaGFzIGEgQ0hBTkdFTE9HLm1kLCBhZGQgaXRzIGNvbnRlbnRzIGF0IHRoZSBhbm5vdGF0ZWQgdGFnIG1lc3NhZ2UuXG4gICAgY29uc29sZS5sb2coYEFwcGx5aW5nIHRhZzogJHtuZXdUYWdOYW1lfWApO1xuICAgIGF3YWl0IHB1Ymxpc2hSZXBvLmNyZWF0ZVRhZyhuZXdUYWdOYW1lKTtcblxuICAgIGlmIChjbWRMaW5lT3B0cy5kcnlSdW4pXG4gICAge1xuICAgICAgICBjb25zdCBtc2cgPSBbXG4gICAgICAgICAgICBcIlJ1bm5pbmcgaW4gZHJ5LXJ1biBtb2RlLiAgVGhlIHJlcG9zaXRvcnkgaW4gdGhlIGZvbGxvd2luZyB0ZW1wb3JhcnkgZGlyZWN0b3J5XCIsXG4gICAgICAgICAgICBcImhhcyBiZWVuIGxlZnQgcmVhZHkgdG8gcHVzaCB0byBhIHB1YmxpYyBzZXJ2ZXIuXCIsXG4gICAgICAgICAgICBwdWJsaXNoRGlyLnRvU3RyaW5nKClcbiAgICAgICAgXTtcbiAgICAgICAgY29uc29sZS5sb2cobXNnLmpvaW4oXCJcXG5cIikpO1xuICAgICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgLy8gUHVzaCB0aGUgYnJhbmNoIGFuZCB0aGUgdGFnLlxuICAgIGNvbnNvbGUubG9nKFwiUHVzaGluZyB0byBvcmlnaW4uLi5cIik7XG4gICAgYXdhaXQgcHVibGlzaFJlcG8ucHVzaEN1cnJlbnRCcmFuY2goXCJvcmlnaW5cIik7XG4gICAgYXdhaXQgcHVibGlzaFJlcG8ucHVzaFRhZyhuZXdUYWdOYW1lLCBcIm9yaWdpblwiKTtcblxuICAgIC8vXG4gICAgLy8gUHJpbnQgYSBjb21wbGV0aW9uIG1lc3NhZ2UuXG4gICAgLy8gVGVsbCB0aGUgdXNlciBob3cgdG8gaW5jbHVkZSB0aGUgcHVibGlzaGVkIHJlcG9zaXRvcnkgaW50byBhbm90aGVyXG4gICAgLy8gcHJvamVjdCdzIGRlcGVuZGVuY2llcy5cbiAgICAvL1xuICAgIGNvbnN0IGRlcGVuZGVuY3lVcmwgPSBVcmwuc2V0UHJvdG9jb2woc3JjLnB1Ymxpc2hUb0dpdENvbmZpZy5wdWJsaXNoUmVwb3NpdG9yeSwgXCJnaXQraHR0cHNcIik7XG4gICAgY29uc3QgbnBtSW5zdGFsbENtZCA9IGBucG0gaW5zdGFsbCAke2RlcGVuZGVuY3lVcmx9IyR7bmV3VGFnTmFtZX1gO1xuICAgIGNvbnN0IGRvbmVNZXNzYWdlID0gW1xuICAgICAgICBcIkRvbmUuXCIsXG4gICAgICAgIFwiVG8gaW5jbHVkZSB0aGUgcHVibGlzaGVkIGxpYnJhcnkgaW4gYSBOb2RlLmpzIHByb2plY3QsIGV4ZWN1dGUgdGhlIGZvbGxvd2luZyBjb21tYW5kOlwiLFxuICAgICAgICBucG1JbnN0YWxsQ21kXG4gICAgXTtcbiAgICBjb25zb2xlLmxvZyhkb25lTWVzc2FnZS5qb2luKFwiXFxuXCIpKTtcblxuICAgIC8vIFwiZW5pcGpzLWNvcmVcIjogXCJnaXQraHR0cHM6Ly9tZnQucmEtaW50LmNvbS9naXRsYWIvYXBwLXBsYXRmb3JtL2VuaXBqcy1jb3JlLmdpdCM1OWYwOWI3XCJcbn1cblxuXG4vKipcbiAqIERlbGV0ZXMgYWxsIHRyYWNrZWQgZmlsZXMgd2l0aGluIGEgcmVwby5cbiAqIEBwYXJhbSByZXBvIC0gVGhlIHJlcG8gdG8gY2xlYXJcbiAqIEByZXR1cm4gQSBQcm9taXNlIHRoYXQgaXMgcmVzb2x2ZWQgd2hlbiBhbGwgZmlsZXMgaGF2ZSBiZWVuIGRlbGV0ZWQuXG4gKi9cbmFzeW5jIGZ1bmN0aW9uIGRlbGV0ZVRyYWNrZWRGaWxlcyhyZXBvOiBHaXRSZXBvKTogUHJvbWlzZTx2b2lkPlxue1xuICAgIGNvbnN0IGZpbGVzID0gYXdhaXQgcmVwby5maWxlcygpO1xuICAgIGNvbnN0IGRlbGV0ZVByb21pc2VzID0gXy5tYXAoZmlsZXMsIChjdXJGaWxlKSA9PiB7XG4gICAgICAgIHJldHVybiBjdXJGaWxlLmRlbGV0ZSgpO1xuICAgIH0pO1xuXG4gICAgYXdhaXQgUHJvbWlzZS5hbGwoZGVsZXRlUHJvbWlzZXMpO1xufVxuXG5cbm1haW4oKTtcbiJdfQ==
