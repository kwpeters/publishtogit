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
                    newTagName = src.pkg.config.version;
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

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9wdWJsaXNoLXRvLWdpdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUVBLHlDQUFzQztBQUN0QywrQkFBNEI7QUFDNUIscUNBQWtDO0FBQ2xDLDJEQUE0RDtBQUU1RCw2Q0FBd0Q7QUFDeEQsNkNBQStEO0FBQy9ELG1DQUFnQztBQUNoQyx5Q0FBc0M7QUFDdEMsMEJBQTRCO0FBQzVCLDZCQUEwQjtBQUMxQiw2QkFBK0I7QUFVL0I7SUFDSSxJQUFNLElBQUksR0FBRyxLQUFLO1NBQ2pCLEtBQUssQ0FBQyxpRkFBaUYsQ0FBQztTQUN4RixJQUFJLEVBQUU7U0FDTixNQUFNLENBQ0gsU0FBUyxFQUNUO1FBQ0ksSUFBSSxFQUFFLFNBQVM7UUFDZixPQUFPLEVBQUUsS0FBSztRQUNkLFlBQVksRUFBRSxLQUFLO1FBQ25CLFFBQVEsRUFBRSxrREFBa0Q7S0FDL0QsQ0FDSjtTQUNBLE9BQU8sRUFBRSxDQUFFLDBDQUEwQztTQUNyRCxhQUFhLENBQUMsQ0FBQyxDQUFDO1NBQ2hCLElBQUksQ0FBQyxFQUFFLENBQUM7U0FDUixJQUFJLENBQUM7SUFFTiw0RUFBNEU7SUFDNUUsaURBQWlEO0lBQ2pELElBQU0sU0FBUyxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksR0FBRyxDQUFDO0lBQ25DLElBQU0sTUFBTSxHQUFHLElBQUkscUJBQVMsQ0FBQyxTQUFTLENBQUMsQ0FBQztJQUN4QyxFQUFFLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxVQUFVLEVBQUUsQ0FBQyxDQUN6QixDQUFDO1FBQ0csT0FBTyxDQUFDLEdBQUcsQ0FBQyxtQkFBaUIsU0FBUyxxQkFBa0IsQ0FBQyxDQUFDO1FBQzFELE1BQU0sQ0FBQyxTQUFTLENBQUM7SUFDckIsQ0FBQztJQUVELElBQU0sV0FBVyxHQUFHO1FBQ2hCLE1BQU0sRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDO1FBQ3ZC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dGVudCI6WyIjIS91c3IvYmluL2VudiBub2RlXG5cbmltcG9ydCB7RGlyZWN0b3J5fSBmcm9tIFwiLi9kaXJlY3RvcnlcIjtcbmltcG9ydCB7RmlsZX0gZnJvbSBcIi4vZmlsZVwiO1xuaW1wb3J0IHtHaXRSZXBvfSBmcm9tIFwiLi9naXRSZXBvXCI7XG5pbXBvcnQge2NvbmZpZyBhcyBnbG9iYWxDb25maWd9IGZyb20gXCIuL3B1Ymxpc2hUb0dpdENvbmZpZ1wiO1xuaW1wb3J0IHtJUHVibGlzaFRvR2l0Q29uZmlnfSBmcm9tIFwiLi9jb25maWdIZWxwZXJzXCI7XG5pbXBvcnQge0lQYWNrYWdlSnNvbiwgTm9kZVBhY2thZ2V9IGZyb20gXCIuL25vZGVQYWNrYWdlXCI7XG5pbXBvcnQge0dpdFJlcG9QYXRoLCBnaXRVcmxUb1Byb2plY3ROYW1lfSBmcm9tIFwiLi9HaXRSZXBvUGF0aFwiO1xuaW1wb3J0IHtTZW1WZXJ9IGZyb20gXCIuL1NlbVZlclwiO1xuaW1wb3J0IHtHaXRCcmFuY2h9IGZyb20gXCIuL2dpdEJyYW5jaFwiO1xuaW1wb3J0ICogYXMgXyBmcm9tIFwibG9kYXNoXCI7XG5pbXBvcnQge1VybH0gZnJvbSBcIi4vdXJsXCI7XG5pbXBvcnQgKiBhcyB5YXJncyBmcm9tIFwieWFyZ3NcIjtcblxuXG5pbnRlcmZhY2UgSUNtZExpbmVPcHRzXG57XG4gICAgZHJ5UnVuOiBib29sZWFuO1xuICAgIHNyY0RpcjogRGlyZWN0b3J5O1xufVxuXG5cbmZ1bmN0aW9uIHBhcnNlQXJncygpOiBJQ21kTGluZU9wdHMgfCB1bmRlZmluZWQge1xuICAgIGNvbnN0IGFyZ3YgPSB5YXJnc1xuICAgIC51c2FnZShcIlB1Ymxpc2hlcyBhIE5vZGUgcGFja2FnZSB0byBhIEdpdCByZXBvLlxcblVzYWdlOiAkMCBbLS1kcnktcnVuXSBzb3VyY2VfZGlyZWN0b3J5XCIpXG4gICAgLmhlbHAoKVxuICAgIC5vcHRpb24oXG4gICAgICAgIFwiZHJ5LXJ1blwiLFxuICAgICAgICB7XG4gICAgICAgICAgICB0eXBlOiBcImJvb2xlYW5cIixcbiAgICAgICAgICAgIGRlZmF1bHQ6IGZhbHNlLFxuICAgICAgICAgICAgZGVtYW5kT3B0aW9uOiBmYWxzZSxcbiAgICAgICAgICAgIGRlc2NyaWJlOiBcIlBlcmZvcm0gYWxsIG9wZXJhdGlvbnMgYnV0IGRvIG5vdCBwdXNoIHRvIG9yaWdpblwiXG4gICAgICAgIH1cbiAgICApXG4gICAgLnZlcnNpb24oKSAgLy8gdmVyc2lvbiB3aWxsIGJlIHJlYWQgZnJvbSBwYWNrYWdlLmpzb24hXG4gICAgLmRlbWFuZENvbW1hbmQoMSlcbiAgICAud3JhcCg4MClcbiAgICAuYXJndjtcblxuICAgIC8vIEdldCB0aGUgc291cmNlIHByb2plY3QgZGlyZWN0b3J5IGZyb20gdGhlIGNvbW1hbmQgbGluZSBhcmd1bWVudHMuICBJZiBub3RcbiAgICAvLyBwcmVzZW50LCBhc3N1bWUgdGhlIGN1cnJlbnQgd29ya2luZyBkaXJlY3RvcnkuXG4gICAgY29uc3Qgc3JjRGlyU3RyID0gYXJndi5fWzBdIHx8IFwiLlwiO1xuICAgIGNvbnN0IHNyY0RpciA9IG5ldyBEaXJlY3Rvcnkoc3JjRGlyU3RyKTtcbiAgICBpZiAoIXNyY0Rpci5leGlzdHNTeW5jKCkpXG4gICAge1xuICAgICAgICBjb25zb2xlLmxvZyhgVGhlIGRpcmVjdG9yeSAke3NyY0RpclN0cn0gZG9lcyBub3QgZXhpc3QuYCk7XG4gICAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgfVxuXG4gICAgY29uc3QgY21kTGluZU9wdHMgPSB7XG4gICAgICAgIGRyeVJ1bjogYXJndltcImRyeS1ydW5cIl0sXG4gICAgICAgIHNyY0Rpcjogc3JjRGlyXG4gICAgfTtcbiAgICByZXR1cm4gY21kTGluZU9wdHM7XG59XG5cblxuYXN5bmMgZnVuY3Rpb24gZ2V0U3JjKGNtZExpbmVPcHRzOiBJQ21kTGluZU9wdHMpOlxuUHJvbWlzZTx7XG4gICAgZGlyOiBEaXJlY3RvcnksXG4gICAgcmVwbzogR2l0UmVwbyxcbiAgICBwa2c6IE5vZGVQYWNrYWdlLFxuICAgIHZlcnNpb246IFNlbVZlcixcbiAgICBwdWJsaXNoVG9HaXRDb25maWc6IElQdWJsaXNoVG9HaXRDb25maWdcbn0+XG57XG4gICAgY29uc3Qgc3JjUmVwbyA9IGF3YWl0IEdpdFJlcG8uZnJvbURpcmVjdG9yeShjbWRMaW5lT3B0cy5zcmNEaXIpO1xuXG4gICAgLy8gTWFrZSBzdXJlIHRoZSBzcGVjaWZpZWQgZGlyZWN0b3J5IGlzIGEgTlBNIHByb2plY3QgKGNvbnRhaW5zIGFcbiAgICAvLyBwYWNrYWdlLmpzb24pLlxuICAgIGNvbnN0IHBrZyA9IGF3YWl0IE5vZGVQYWNrYWdlLmZyb21EaXJlY3RvcnkoY21kTGluZU9wdHMuc3JjRGlyKVxuICAgIC5jYXRjaCgoKSA9PiB7XG4gICAgICAgIHJldHVybiBQcm9taXNlLnJlamVjdChuZXcgRXJyb3IoYFRoZSBkaXJlY3RvcnkgJHtjbWRMaW5lT3B0cy5zcmNEaXIudG9TdHJpbmcoKX0gaXMgbm90IGEgTlBNIHBhY2thZ2UuYCkpO1xuICAgIH0pO1xuXG4gICAgLy8gTWFrZSBzdXJlIHRoZSBzcGVjaWZpZWQgZGlyZWN0b3J5IGhhcyBhIHB1Ymxpc2h0b2dpdC5qc29uLlxuICAgIGNvbnN0IGNvbmZpZ0ZpbGUgPSBuZXcgRmlsZShjbWRMaW5lT3B0cy5zcmNEaXIsIFwicHVibGlzaHRvZ2l0Lmpzb25cIik7XG4gICAgaWYgKCFjb25maWdGaWxlLmV4aXN0c1N5bmMoKSkge1xuICAgICAgICByZXR1cm4gUHJvbWlzZS5yZWplY3QobmV3IEVycm9yKGBDb3VsZCBub3QgZmluZCBmaWxlICR7Y29uZmlnRmlsZS50b1N0cmluZygpfS5gKSk7XG4gICAgfVxuXG4gICAgY29uc3QgcHVibGlzaFRvR2l0Q29uZmlnID0gY29uZmlnRmlsZS5yZWFkSnNvblN5bmM8SVB1Ymxpc2hUb0dpdENvbmZpZz4oKTtcbiAgICBpZiAoIXB1Ymxpc2hUb0dpdENvbmZpZykge1xuICAgICAgICByZXR1cm4gUHJvbWlzZS5yZWplY3QobmV3IEVycm9yKGBDb3VsZCBub3QgcmVhZCBjb25maWd1cmF0aW9uIGZyb20gJHtjb25maWdGaWxlLnRvU3RyaW5nKCl9LmApKTtcbiAgICB9XG5cbiAgICBjb25zdCBzZW12ZXIgPSBTZW1WZXIuZnJvbVN0cmluZyhwa2cuY29uZmlnLnZlcnNpb24pO1xuICAgIGlmICghc2VtdmVyKVxuICAgIHtcbiAgICAgICAgcmV0dXJuIFByb21pc2UucmVqZWN0KG5ldyBFcnJvcihgSW52YWxpZCBzZW12ZXIgdmVyc2lvbiBzdHJpbmcgJHtwa2cuY29uZmlnLnZlcnNpb259LmApKTtcbiAgICB9XG5cbiAgICByZXR1cm4ge1xuICAgICAgICBkaXI6ICAgICAgICAgICAgICAgIGNtZExpbmVPcHRzLnNyY0RpcixcbiAgICAgICAgcmVwbzogICAgICAgICAgICAgICBzcmNSZXBvLFxuICAgICAgICBwa2c6ICAgICAgICAgICAgICAgIHBrZyxcbiAgICAgICAgdmVyc2lvbjogICAgICAgICAgICBzZW12ZXIsXG4gICAgICAgIHB1Ymxpc2hUb0dpdENvbmZpZzogcHVibGlzaFRvR2l0Q29uZmlnXG4gICAgfTtcbn1cblxuXG5hc3luYyBmdW5jdGlvbiBtYWluKCk6IFByb21pc2U8dm9pZD5cbntcbiAgICAvL1xuICAgIC8vIE1ha2Ugc3VyZSB0aGUgZ2xvYmFsIHRtcERpciBleGlzdHMuXG4gICAgLy9cbiAgICBnbG9iYWxDb25maWcudG1wRGlyLmVuc3VyZUV4aXN0c1N5bmMoKTtcblxuICAgIGNvbnN0IGNtZExpbmVPcHRzID0gcGFyc2VBcmdzKCk7XG4gICAgaWYgKCFjbWRMaW5lT3B0cylcbiAgICB7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBjb25zdCBzcmMgPSBhd2FpdCBnZXRTcmMoY21kTGluZU9wdHMpO1xuICAgIGNvbnNvbGUubG9nKGBQcm9qZWN0IHdpbGwgcHVibGlzaCB0byBHaXQgcmVwb3NpdG9yeTogJHtzcmMucHVibGlzaFRvR2l0Q29uZmlnLnB1Ymxpc2hSZXBvc2l0b3J5fS5gKTtcblxuICAgIC8vXG4gICAgLy8gVE9ETzogSWYgdGhlIHNvdXJjZSByZXBvIGhhcyBhIENIQU5HRUxPRy5tZCwgbWFrZSBzdXJlIGl0IGhhcyBhIHNlY3Rpb25cbiAgICAvLyBkZXNjcmliaW5nIHRoaXMgcmVsZWFzZS4gIE1heWJlIEkgY291bGQgaGVscCBnZW5lcmF0ZSBpdCBieSBwcm92aWRpbmcgYWxsXG4gICAgLy8gY29tbWl0cyBzaW5jZSBsYXN0IGxhYmVsP1xuICAgIC8vXG5cbiAgICAvL1xuICAgIC8vIEZpZ3VyZSBvdXQgd2hhdCB0aGUgcHVibGlzaCByZXBvIGRpcmVjdG9yeSBhbmQgbnVrZSBpdCBpZiBpdCBhbHJlYWR5XG4gICAgLy8gZXhpc3RzLlxuICAgIC8vXG4gICAgY29uc3QgcHVibGlzaFByb2pOYW1lID0gZ2l0VXJsVG9Qcm9qZWN0TmFtZShzcmMucHVibGlzaFRvR2l0Q29uZmlnLnB1Ymxpc2hSZXBvc2l0b3J5KTtcbiAgICBjb25zdCBwdWJsaXNoRGlyID0gbmV3IERpcmVjdG9yeShnbG9iYWxDb25maWcudG1wRGlyLCBwdWJsaXNoUHJvak5hbWUpO1xuICAgIHB1Ymxpc2hEaXIuZGVsZXRlU3luYygpO1xuICAgIGNvbnNvbGUubG9nKGBUZW1wIHB1Ymxpc2ggZGlyZWN0b3J5OiAke3B1Ymxpc2hEaXIudG9TdHJpbmcoKX1gKTtcblxuICAgIC8vXG4gICAgLy8gQ2xvbmUgdGhlIHB1Ymxpc2ggcmVwby5cbiAgICAvL1xuICAgIGNvbnN0IHB1Ymxpc2hSZXBvUGF0aCA9IEdpdFJlcG9QYXRoLmZyb21Vcmwoc3JjLnB1Ymxpc2hUb0dpdENvbmZpZy5wdWJsaXNoUmVwb3NpdG9yeSk7XG4gICAgaWYgKCFwdWJsaXNoUmVwb1BhdGgpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBJbnZhbGlkIHB1Ymxpc2ggcmVwbyBVUkwgXCIke3NyYy5wdWJsaXNoVG9HaXRDb25maWcucHVibGlzaFJlcG9zaXRvcnl9XCIuYCk7XG4gICAgfVxuICAgIGNvbnNvbGUubG9nKGBDbG9uaW5nIHB1Ymxpc2ggcmVwby4uLmApO1xuICAgIGNvbnN0IHB1Ymxpc2hSZXBvID0gYXdhaXQgR2l0UmVwby5jbG9uZShwdWJsaXNoUmVwb1BhdGgsIGdsb2JhbENvbmZpZy50bXBEaXIpO1xuXG4gICAgLy9cbiAgICAvLyBDaGVjayB0byBzZWUgaWYgdGhlIGN1cnJlbnQgdmVyc2lvbiBoYXMgYWxyZWFkeSBiZWVuIHB1Ymxpc2hlZCBzb1xuICAgIC8vIHRoYXQgd2UgY2FuIHJldHVybiBhbiBlcnJvciBiZWZvcmUgdGFraW5nIGFueSBmdXJ0aGVyIGFjdGlvbi5cbiAgICAvL1xuICAgIGNvbnN0IG5ld1RhZ05hbWUgPSBzcmMucGtnLmNvbmZpZy52ZXJzaW9uO1xuICAgIGNvbnN0IGhhc1RhZyA9IGF3YWl0IHB1Ymxpc2hSZXBvLmhhc1RhZyhuZXdUYWdOYW1lKTtcbiAgICBpZiAoaGFzVGFnKVxuICAgIHtcbiAgICAgICAgY29uc3QgbXNnID0gYFRoZSBwdWJsaXNoIHJlcG8gYWxyZWFkeSBoYXMgdGFnICR7c3JjLnZlcnNpb24uZ2V0UGF0Y2hWZXJzaW9uU3RyaW5nKCl9LiBgICtcbiAgICAgICAgICAgIFwiSGF2ZSB5b3UgZm9yZ290dGVuIHRvIGJ1bXAgdGhlIHZlcnNpb24gbnVtYmVyP1wiO1xuICAgICAgICBjb25zb2xlLmxvZyhtc2cpO1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IobXNnKTtcbiAgICB9XG5cbiAgICAvL1xuICAgIC8vIFRvIG1ha2Ugdmlld2luZyBkaWZmZXJlbmNlcyBiZXR3ZWVuIHJlbGVhc2VzIGEgbGl0dGxlIGVhc2llciwgY2hlY2tvdXRcbiAgICAvLyB0aGUgYnJhbmNoIG5hbWVkIGFmdGVyIHRoZSBtYWpvciB2ZXJzaW9uIGFuZCB0aGVuIHRoZSBtYWpvci5taW5vclxuICAgIC8vIHZlcnNpb24uXG4gICAgLy9cbiAgICBjb25zdCBtYWpvckJyYW5jaE5hbWUgPSBzcmMudmVyc2lvbi5nZXRNYWpvclZlcnNpb25TdHJpbmcoKTtcbiAgICBjb25zb2xlLmxvZyhgQ2hlY2tpbmcgb3V0IGJyYW5jaDogJHttYWpvckJyYW5jaE5hbWV9YCk7XG4gICAgY29uc3QgbWFqb3JCcmFuY2ggPSBhd2FpdCBHaXRCcmFuY2guY3JlYXRlKHB1Ymxpc2hSZXBvLCBtYWpvckJyYW5jaE5hbWUpO1xuICAgIGF3YWl0IHB1Ymxpc2hSZXBvLmNoZWNrb3V0KG1ham9yQnJhbmNoLCB0cnVlKTtcbiAgICBhd2FpdCBwdWJsaXNoUmVwby5wdXNoQ3VycmVudEJyYW5jaChcIm9yaWdpblwiLCB0cnVlKTtcblxuICAgIGNvbnN0IG1pbm9yQnJhbmNoTmFtZSA9IHNyYy52ZXJzaW9uLmdldE1pbm9yVmVyc2lvblN0cmluZygpO1xuICAgIGNvbnNvbGUubG9nKGBDaGVja2luZyBvdXQgYnJhbmNoOiAke21pbm9yQnJhbmNoTmFtZX1gKTtcbiAgICBjb25zdCBtaW5vckJyYW5jaCA9IGF3YWl0IEdpdEJyYW5jaC5jcmVhdGUocHVibGlzaFJlcG8sIG1pbm9yQnJhbmNoTmFtZSk7XG4gICAgYXdhaXQgcHVibGlzaFJlcG8uY2hlY2tvdXQobWlub3JCcmFuY2gsIHRydWUpO1xuICAgIGF3YWl0IHB1Ymxpc2hSZXBvLnB1c2hDdXJyZW50QnJhbmNoKFwib3JpZ2luXCIsIHRydWUpO1xuXG4gICAgLy9cbiAgICAvLyBSZW1vdmUgYWxsIGZpbGVzIHVuZGVyIHZlcnNpb24gY29udHJvbCBhbmQgcHJ1bmUgZGlyZWN0b3JpZXMgdGhhdCBhcmVcbiAgICAvLyBlbXB0eS5cbiAgICAvL1xuICAgIGNvbnNvbGUubG9nKFwiRGVsZXRpbmcgYWxsIGZpbGVzLi4uXCIpO1xuICAgIGF3YWl0IGRlbGV0ZVRyYWNrZWRGaWxlcyhwdWJsaXNoUmVwbyk7XG4gICAgYXdhaXQgcHVibGlzaERpci5wcnVuZSgpO1xuXG4gICAgLy9cbiAgICAvLyBQdWJsaXNoIHRoZSBzb3VyY2UgcmVwbyB0byB0aGUgcHVibGlzaCBkaXJlY3RvcnkuXG4gICAgLy9cbiAgICBjb25zb2xlLmxvZyhcIlB1Ymxpc2hpbmcgcGFja2FnZSBjb250ZW50cyB0byBwdWJsaXNoIHJlcG9zaXRvcnkuLi5cIik7XG4gICAgYXdhaXQgc3JjLnBrZy5wdWJsaXNoKHB1Ymxpc2hEaXIsIGZhbHNlKTtcblxuICAgIC8vXG4gICAgLy8gTW9kaWZ5IHRoZSBwYWNrYWdlLmpzb24gZmlsZSBzbyB0aGF0IHRoZSBwdWJsaXNoIHJlcG8gcGFja2FnZVxuICAgIC8vIC0gaXMgbmFtZWQgYWZ0ZXIgdGhlIHB1Ymxpc2ggcmVwb1xuICAgIC8vIC0gdGhlIHJlcG9zaXRvcnkgdXJsIHBvaW50cyB0byB0aGUgcHVibGlzaCByZXBvIGluc3RlYWQgb2YgdGhlIHNvdXJjZSByZXBvXG4gICAgLy9cbiAgICBjb25zb2xlLmxvZyhcIlVwZGF0aW5nIHB1Ymxpc2ggcGFja2FnZS5qc29uLi4uXCIpO1xuICAgIGNvbnN0IHB1Ymxpc2hQYWNrYWdlSnNvbkZpbGUgPSBuZXcgRmlsZShwdWJsaXNoRGlyLCBcInBhY2thZ2UuanNvblwiKTtcbiAgICBjb25zdCBwdWJsaXNoUGFja2FnZUpzb24gPSBwdWJsaXNoUGFja2FnZUpzb25GaWxlLnJlYWRKc29uU3luYzxJUGFja2FnZUpzb24+KCk7XG4gICAgcHVibGlzaFBhY2thZ2VKc29uLnJlcG9zaXRvcnkudXJsID0gc3JjLnB1Ymxpc2hUb0dpdENvbmZpZy5wdWJsaXNoUmVwb3NpdG9yeTtcbiAgICBwdWJsaXNoUGFja2FnZUpzb24ubmFtZSA9IHB1Ymxpc2hQcm9qTmFtZTtcbiAgICBwdWJsaXNoUGFja2FnZUpzb25GaWxlLndyaXRlSnNvblN5bmMocHVibGlzaFBhY2thZ2VKc29uKTtcblxuICAgIC8vXG4gICAgLy8gU3RhZ2UgYW5kIGNvbW1pdCB0aGUgcHVibGlzaGVkIGZpbGVzLlxuICAgIC8vXG4gICAgY29uc29sZS5sb2coXCJDb21taXRpbmcgcHVibGlzaGVkIGZpbGVzLi4uXCIpO1xuICAgIGF3YWl0IHB1Ymxpc2hSZXBvLnN0YWdlQWxsKCk7XG4gICAgY29uc3QgY29tbWl0TXNnID0gYHB1Ymxpc2gtdG8tZ2l0IHB1Ymxpc2hpbmcgdmVyc2lvbiAke3NyYy52ZXJzaW9uLmdldFBhdGNoVmVyc2lvblN0cmluZygpfS5gO1xuICAgIGF3YWl0IHB1Ymxpc2hSZXBvLmNvbW1pdChjb21taXRNc2cpO1xuXG4gICAgLy8gQXBwbHkgYSB0YWcgd2l0aCB0aGUgdmVyc2lvbiBudW1iZXIuXG4gICAgLy8gVE9ETzogSWYgdGhlIHNvdXJjZSByZXBvIGhhcyBhIENIQU5HRUxPRy5tZCwgYWRkIGl0cyBjb250ZW50cyBhdCB0aGUgYW5ub3RhdGVkIHRhZyBtZXNzYWdlLlxuICAgIGNvbnNvbGUubG9nKGBBcHBseWluZyB0YWc6ICR7bmV3VGFnTmFtZX1gKTtcbiAgICBhd2FpdCBwdWJsaXNoUmVwby5jcmVhdGVUYWcobmV3VGFnTmFtZSk7XG5cbiAgICBpZiAoY21kTGluZU9wdHMuZHJ5UnVuKVxuICAgIHtcbiAgICAgICAgY29uc3QgbXNnID0gW1xuICAgICAgICAgICAgXCJSdW5uaW5nIGluIGRyeS1ydW4gbW9kZS4gIFRoZSByZXBvc2l0b3J5IGluIHRoZSBmb2xsb3dpbmcgdGVtcG9yYXJ5IGRpcmVjdG9yeVwiLFxuICAgICAgICAgICAgXCJoYXMgYmVlbiBsZWZ0IHJlYWR5IHRvIHB1c2ggdG8gYSBwdWJsaWMgc2VydmVyLlwiLFxuICAgICAgICAgICAgcHVibGlzaERpci50b1N0cmluZygpXG4gICAgICAgIF07XG4gICAgICAgIGNvbnNvbGUubG9nKG1zZy5qb2luKFwiXFxuXCIpKTtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIC8vIFB1c2ggdGhlIGJyYW5jaCBhbmQgdGhlIHRhZy5cbiAgICBjb25zb2xlLmxvZyhcIlB1c2hpbmcgdG8gb3JpZ2luLi4uXCIpO1xuICAgIGF3YWl0IHB1Ymxpc2hSZXBvLnB1c2hDdXJyZW50QnJhbmNoKFwib3JpZ2luXCIpO1xuICAgIGF3YWl0IHB1Ymxpc2hSZXBvLnB1c2hUYWcobmV3VGFnTmFtZSwgXCJvcmlnaW5cIik7XG5cbiAgICAvL1xuICAgIC8vIFByaW50IGEgY29tcGxldGlvbiBtZXNzYWdlLlxuICAgIC8vIFRlbGwgdGhlIHVzZXIgaG93IHRvIGluY2x1ZGUgdGhlIHB1Ymxpc2hlZCByZXBvc2l0b3J5IGludG8gYW5vdGhlclxuICAgIC8vIHByb2plY3QncyBkZXBlbmRlbmNpZXMuXG4gICAgLy9cbiAgICBjb25zdCBkZXBlbmRlbmN5VXJsID0gVXJsLnNldFByb3RvY29sKHNyYy5wdWJsaXNoVG9HaXRDb25maWcucHVibGlzaFJlcG9zaXRvcnksIFwiZ2l0K2h0dHBzXCIpO1xuICAgIGNvbnN0IG5wbUluc3RhbGxDbWQgPSBgbnBtIGluc3RhbGwgJHtkZXBlbmRlbmN5VXJsfSMke25ld1RhZ05hbWV9YDtcbiAgICBjb25zdCBkb25lTWVzc2FnZSA9IFtcbiAgICAgICAgXCJEb25lLlwiLFxuICAgICAgICBcIlRvIGluY2x1ZGUgdGhlIHB1Ymxpc2hlZCBsaWJyYXJ5IGluIGEgTm9kZS5qcyBwcm9qZWN0LCBleGVjdXRlIHRoZSBmb2xsb3dpbmcgY29tbWFuZDpcIixcbiAgICAgICAgbnBtSW5zdGFsbENtZFxuICAgIF07XG4gICAgY29uc29sZS5sb2coZG9uZU1lc3NhZ2Uuam9pbihcIlxcblwiKSk7XG5cbiAgICAvLyBcImVuaXBqcy1jb3JlXCI6IFwiZ2l0K2h0dHBzOi8vbWZ0LnJhLWludC5jb20vZ2l0bGFiL2FwcC1wbGF0Zm9ybS9lbmlwanMtY29yZS5naXQjNTlmMDliN1wiXG59XG5cblxuLyoqXG4gKiBEZWxldGVzIGFsbCB0cmFja2VkIGZpbGVzIHdpdGhpbiBhIHJlcG8uXG4gKiBAcGFyYW0gcmVwbyAtIFRoZSByZXBvIHRvIGNsZWFyXG4gKiBAcmV0dXJuIEEgUHJvbWlzZSB0aGF0IGlzIHJlc29sdmVkIHdoZW4gYWxsIGZpbGVzIGhhdmUgYmVlbiBkZWxldGVkLlxuICovXG5hc3luYyBmdW5jdGlvbiBkZWxldGVUcmFja2VkRmlsZXMocmVwbzogR2l0UmVwbyk6IFByb21pc2U8dm9pZD5cbntcbiAgICBjb25zdCBmaWxlcyA9IGF3YWl0IHJlcG8uZmlsZXMoKTtcbiAgICBjb25zdCBkZWxldGVQcm9taXNlcyA9IF8ubWFwKGZpbGVzLCAoY3VyRmlsZSkgPT4ge1xuICAgICAgICByZXR1cm4gY3VyRmlsZS5kZWxldGUoKTtcbiAgICB9KTtcblxuICAgIGF3YWl0IFByb21pc2UuYWxsKGRlbGV0ZVByb21pc2VzKTtcbn1cblxuXG5tYWluKCk7XG4iXX0=
