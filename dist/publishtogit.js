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
var _ = require("lodash");
var publishToGitConfig_1 = require("./publishToGitConfig");
var directory_1 = require("./directory");
var gitRepo_1 = require("./gitRepo");
var nodePackage_1 = require("./nodePackage");
var yargs = require("yargs");
var url_1 = require("./url");
var gitBranch_1 = require("./gitBranch");
var os_1 = require("os");
////////////////////////////////////////////////////////////////////////////////
// Helper Functions
////////////////////////////////////////////////////////////////////////////////
function getArgs() {
    return yargs
        .usage("Publishes a Node.js package to a project's Git repository.")
        .help()
        .option("tag", {
        demandOption: false,
        describe: "Apply the specified tag to the publish commit (can be used multiple times)."
    })
        .option("tag-version", {
        type: "boolean",
        default: false,
        demandOption: false,
        describe: "Apply a tag with the project's version number (from package.json) to the publish commit"
    })
        .option("force-tags", {
        type: "boolean",
        default: false,
        demandOption: false,
        describe: "Forces tags to be applied, moving any that already exist"
    })
        .option("dry-run", {
        type: "boolean",
        default: false,
        demandOption: false,
        describe: "Perform all operations but do not push to origin"
    })
        .version() // version will be read from package.json!
        .wrap(80)
        .argv;
}
function getInstanceConfig(argv) {
    return __awaiter(this, void 0, void 0, function () {
        var devDir, devRepo, pkg, tags;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    devDir = new directory_1.Directory(".");
                    return [4 /*yield*/, gitRepo_1.GitRepo.fromDirectory(devDir)];
                case 1:
                    devRepo = _a.sent();
                    return [4 /*yield*/, nodePackage_1.NodePackage.fromDirectory(devDir)];
                case 2:
                    pkg = _a.sent();
                    tags = [].concat(argv.tag || []);
                    if (argv["tag-version"]) {
                        tags.push("v" + pkg.config.version);
                    }
                    // Make sure we have at least 1 tag to apply.  Otherwise git might garbage
                    // collect the publish commit we are about to create.
                    if (tags.length === 0) {
                        throw new Error("At least one tag must be applied by using either --tag-version or --tag.");
                    }
                    return [2 /*return*/, {
                            dryRun: argv["dry-run"],
                            tags: tags,
                            devRepo: devRepo,
                            pkg: pkg,
                            forceTags: argv["force-tags"]
                        }];
            }
        });
    });
}
function checkInitialConditions(instanceConfig) {
    return __awaiter(this, void 0, void 0, function () {
        var modifiedFiles, untrackedFiles, devBranch, deltas, existingTags, alreadyExist;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, instanceConfig.devRepo.modifiedFiles()];
                case 1:
                    modifiedFiles = _a.sent();
                    if (modifiedFiles.length > 0) {
                        throw new Error("This repository contains modified files.");
                    }
                    return [4 /*yield*/, instanceConfig.devRepo.untrackedFiles()];
                case 2:
                    untrackedFiles = _a.sent();
                    if (untrackedFiles.length > 0) {
                        throw new Error("This repository contains untracked files.");
                    }
                    return [4 /*yield*/, instanceConfig.devRepo.getCurrentBranch()];
                case 3:
                    devBranch = _a.sent();
                    if (!devBranch) {
                        throw new Error("HEAD does not current point to a branch.");
                    }
                    return [4 /*yield*/, instanceConfig.devRepo.getCommitDeltas("origin")];
                case 4:
                    deltas = _a.sent();
                    if ((deltas.ahead > 0) || (deltas.behind > 0)) {
                        throw new Error("The branch is " + deltas.ahead + " commits ahead and " + deltas.behind + " commits behind.");
                    }
                    // Make sure the directory is a Node package.
                    if (!instanceConfig.pkg.config.version) {
                        throw new Error("Package does not have a version.");
                    }
                    if (!!instanceConfig.forceTags) return [3 /*break*/, 6];
                    return [4 /*yield*/, instanceConfig.devRepo.tags()];
                case 5:
                    existingTags = _a.sent();
                    alreadyExist = _.intersection(existingTags, instanceConfig.tags);
                    if (alreadyExist.length > 0) {
                        throw new Error("The following tags already exist: " + alreadyExist.join(", "));
                    }
                    _a.label = 6;
                case 6: return [2 /*return*/];
            }
        });
    });
}
function main() {
    return __awaiter(this, void 0, void 0, function () {
        var argv, instanceConfig, devCommitHash, devBranch, publishDir, repoUrl, publishRepo, publishCommitHash, msg, dependencyUrl, doneMessage;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    argv = getArgs();
                    publishToGitConfig_1.config.init();
                    return [4 /*yield*/, getInstanceConfig(argv)];
                case 1:
                    instanceConfig = _a.sent();
                    // Given the instance configuration, determine if everything is in a valid
                    // state.
                    return [4 /*yield*/, checkInitialConditions(instanceConfig)];
                case 2:
                    // Given the instance configuration, determine if everything is in a valid
                    // state.
                    _a.sent();
                    return [4 /*yield*/, instanceConfig.devRepo.currentCommitHash()];
                case 3:
                    devCommitHash = _a.sent();
                    return [4 /*yield*/, instanceConfig.devRepo.getCurrentBranch()];
                case 4:
                    devBranch = (_a.sent());
                    publishDir = new directory_1.Directory(publishToGitConfig_1.config.tmpDir, instanceConfig.pkg.projectName);
                    publishDir.deleteSync();
                    repoUrl = url_1.Url.fromString(instanceConfig.pkg.config.repository.url);
                    if (!repoUrl) {
                        throw new Error("Invalid repository URL.");
                    }
                    console.log("Creating temporary repo clone at " + publishDir.toString() + "...");
                    return [4 /*yield*/, gitRepo_1.GitRepo.clone(repoUrl, publishToGitConfig_1.config.tmpDir)];
                case 5:
                    publishRepo = _a.sent();
                    // Checkout the commit the devRepo is at.
                    publishRepo.checkoutCommit(devCommitHash);
                    console.log("Checking out current development commit " + devCommitHash + "...");
                    // Create a temporary branch on which the published files will be committed.
                    console.log("Creating temporary branch...");
                    return [4 /*yield*/, checkoutTempBranch(publishRepo, "publishtogit")];
                case 6:
                    _a.sent();
                    // Remove all files under version control and prune directories that are
                    // empty.
                    console.log("Deleting all files...");
                    return [4 /*yield*/, deleteTrackedFiles(publishRepo)];
                case 7:
                    _a.sent();
                    return [4 /*yield*/, publishRepo.directory.prune()];
                case 8:
                    _a.sent();
                    // Publish the dev repo to the publish directory.
                    console.log("Publishing package contents to publish repository...");
                    return [4 /*yield*/, instanceConfig.pkg.publish(publishDir, false)];
                case 9:
                    _a.sent();
                    // Stage and commit the published files.
                    console.log("Commiting published files...");
                    return [4 /*yield*/, publishRepo.stageAll()];
                case 10:
                    _a.sent();
                    return [4 /*yield*/, publishRepo.commit("Published using publish-to-git.")];
                case 11:
                    _a.sent();
                    return [4 /*yield*/, publishRepo.currentCommitHash()];
                case 12:
                    publishCommitHash = _a.sent();
                    // Apply tags.
                    return [4 /*yield*/, Promise.all(_.map(instanceConfig.tags, function (curTagName) {
                            console.log("Creating tag " + curTagName + "...");
                            var tagMessage = "Published using publishtogit.\n" +
                                ("Source branch: " + devBranch.name + "\n") +
                                ("Source commit: " + devCommitHash.toString() + " [" + devCommitHash.toShortString() + "]");
                            return publishRepo.createTag(curTagName, tagMessage, true);
                        }))];
                case 13:
                    // Apply tags.
                    _a.sent();
                    // If doing a "dry run", stop.
                    if (instanceConfig.dryRun) {
                        msg = [
                            "Running in dry-run mode.  The repository in the following temporary directory",
                            "has been left ready to push to a public server.",
                            publishRepo.directory.toString()
                        ];
                        console.log(msg.join("\n"));
                        return [2 /*return*/];
                    }
                    // Push all tags.
                    return [4 /*yield*/, Promise.all(_.map(instanceConfig.tags, function (curTagName) {
                            console.log("Pushing tag " + curTagName + " to origin.");
                            return publishRepo.pushTag(curTagName, "origin", true);
                        }))];
                case 14:
                    // Push all tags.
                    _a.sent();
                    dependencyUrl = repoUrl.replaceProtocol("git+https").toString();
                    doneMessage = [
                        "Done.",
                        "To include the published library in a Node.js project, execute the following command:"
                    ].concat(_.map(instanceConfig.tags, function (curTagName) {
                        return "npm install " + dependencyUrl + "#" + curTagName;
                    }))
                        .concat("npm install " + dependencyUrl + "#" + publishCommitHash.toShortString());
                    console.log(doneMessage.join("\n"));
                    return [2 /*return*/];
            }
        });
    });
}
main();
function checkoutTempBranch(repo, baseName) {
    return __awaiter(this, void 0, void 0, function () {
        var now, datestamp, user, tmpBranchName, tmpBranch;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    now = new Date();
                    datestamp = now.getFullYear() + "_" + now.getMonth() + "_" + now.getDate() + "_" +
                        now.getHours() + "_" + now.getMinutes() + "_" + now.getSeconds() + "." + now.getMilliseconds();
                    user = os_1.userInfo();
                    tmpBranchName = baseName + "-" + user.username + "-" + datestamp;
                    return [4 /*yield*/, gitBranch_1.GitBranch.create(repo, tmpBranchName)];
                case 1:
                    tmpBranch = _a.sent();
                    return [4 /*yield*/, repo.checkoutBranch(tmpBranch, true)];
                case 2:
                    _a.sent();
                    return [2 /*return*/, tmpBranch];
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

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9wdWJsaXNodG9naXQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFFQSwwQkFBNEI7QUFDNUIsMkRBQTREO0FBQzVELHlDQUFzQztBQUN0QyxxQ0FBa0M7QUFDbEMsNkNBQTBDO0FBQzFDLDZCQUErQjtBQUMvQiw2QkFBMEI7QUFDMUIseUNBQXNDO0FBQ3RDLHlCQUE0QjtBQWlCNUIsZ0ZBQWdGO0FBQ2hGLG1CQUFtQjtBQUNuQixnRkFBZ0Y7QUFFaEY7SUFFSSxNQUFNLENBQUMsS0FBSztTQUNYLEtBQUssQ0FBQyw0REFBNEQsQ0FBQztTQUNuRSxJQUFJLEVBQUU7U0FDTixNQUFNLENBQUMsS0FBSyxFQUNUO1FBQ0ksWUFBWSxFQUFFLEtBQUs7UUFDbkIsUUFBUSxFQUFFLDZFQUE2RTtLQUMxRixDQUNKO1NBQ0EsTUFBTSxDQUFDLGFBQWEsRUFDakI7UUFDSSxJQUFJLEVBQUUsU0FBUztRQUNmLE9BQU8sRUFBRSxLQUFLO1FBQ2QsWUFBWSxFQUFFLEtBQUs7UUFDbkIsUUFBUSxFQUFFLHlGQUF5RjtLQUN0RyxDQUNKO1NBQ0EsTUFBTSxDQUFDLFlBQVksRUFDaEI7UUFDSSxJQUFJLEVBQUUsU0FBUztRQUNmLE9BQU8sRUFBRSxLQUFLO1FBQ2QsWUFBWSxFQUFFLEtBQUs7UUFDbkIsUUFBUSxFQUFFLDBEQUEwRDtLQUN2RSxDQUNKO1NBQ0EsTUFBTSxDQUFDLFNBQVMsRUFDYjtRQUNJLElBQUksRUFBRSxTQUFTO1FBQ2YsT0FBTyxFQUFFLEtBQUs7UUFDZCxZQUFZLEVBQUUsS0FBSztRQUNuQixRQUFRLEVBQUUsa0RBQWtEO0tBQy9ELENBQ0o7U0FDQSxPQUFPLEVBQUUsQ0FBRSwwQ0FBMEM7U0FDckQsSUFBSSxDQUFDLEVBQUUsQ0FBQztTQUNSLElBQUksQ0FBQztBQUNWLENBQUM7QUFHRCwyQkFBaUMsSUFBcUI7Ozs7OztvQkFFNUMsTUFBTSxHQUFHLElBQUkscUJB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RyxHQUFHLEdBQUcsR0FBRyxDQUFDLGVBQWUsRUFBRSxDQUFDO29CQUU3RixJQUFJLEdBQUcsYUFBUSxFQUFFLENBQUM7b0JBRWxCLGFBQWEsR0FBTSxRQUFRLFNBQUksSUFBSSxDQUFDLFFBQVEsU0FBSSxTQUFXLENBQUM7b0JBQ2hELHFCQUFNLHFCQUFTLENBQUMsTUFBTSxDQUFDLElBQUksRUFBRSxhQUFhLENBQUMsRUFBQTs7b0JBQXZELFNBQVMsR0FBRyxTQUEyQztvQkFDN0QscUJBQU0sSUFBSSxDQUFDLGNBQWMsQ0FBQyxTQUFTLEVBQUUsSUFBSSxDQUFDLEVBQUE7O29CQUExQyxTQUEwQyxDQUFDO29CQUMzQyxzQkFBTyxTQUFTLEVBQUM7Ozs7Q0FDcEI7QUFHRDs7OztHQUlHO0FBQ0gsNEJBQWtDLElBQWE7Ozs7O3dCQUU3QixxQkFBTSxJQUFJLENBQUMsS0FBSyxFQUFFLEVBQUE7O29CQUExQixLQUFLLEdBQUcsU0FBa0I7b0JBQzFCLGNBQWMsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLEtBQUssRUFBRSxVQUFDLE9BQU87d0JBQ3hDLE1BQU0sQ0FBQyxPQUFPLENBQUMsTUFBTSxFQUFFLENBQUM7b0JBQzVCLENBQUMsQ0FBQyxDQUFDO29CQUVILHFCQUFNLE9BQU8sQ0FBQyxHQUFHLENBQUMsY0FBYyxDQUFDLEVBQUE7O29CQUFqQyxTQUFpQyxDQUFDOzs7OztDQUNyQyIsImZpbGUiOiJwdWJsaXNodG9naXQuanMiLCJzb3VyY2VzQ29udGVudCI6WyIjIS91c3IvYmluL2VudiBub2RlXG5cbmltcG9ydCAqIGFzIF8gZnJvbSBcImxvZGFzaFwiO1xuaW1wb3J0IHtjb25maWcgYXMgZ2xvYmFsQ29uZmlnfSBmcm9tIFwiLi9wdWJsaXNoVG9HaXRDb25maWdcIjtcbmltcG9ydCB7RGlyZWN0b3J5fSBmcm9tIFwiLi9kaXJlY3RvcnlcIjtcbmltcG9ydCB7R2l0UmVwb30gZnJvbSBcIi4vZ2l0UmVwb1wiO1xuaW1wb3J0IHtOb2RlUGFja2FnZX0gZnJvbSBcIi4vbm9kZVBhY2thZ2VcIjtcbmltcG9ydCAqIGFzIHlhcmdzIGZyb20gXCJ5YXJnc1wiO1xuaW1wb3J0IHtVcmx9IGZyb20gXCIuL3VybFwiO1xuaW1wb3J0IHtHaXRCcmFuY2h9IGZyb20gXCIuL2dpdEJyYW5jaFwiO1xuaW1wb3J0IHt1c2VySW5mb30gZnJvbSBcIm9zXCI7XG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFR5cGVzXG4vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuXG5pbnRlcmZhY2UgSUluc3RhbmNlQ29uZmlnXG57XG4gICAgZGV2UmVwbzogR2l0UmVwbztcbiAgICBwa2c6IE5vZGVQYWNrYWdlO1xuICAgIGRyeVJ1bjogYm9vbGVhbjtcbiAgICB0YWdzOiBBcnJheTxzdHJpbmc+O1xuICAgIGZvcmNlVGFnczogYm9vbGVhbjtcbn1cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gSGVscGVyIEZ1bmN0aW9uc1xuLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cblxuZnVuY3Rpb24gZ2V0QXJncygpOiB5YXJncy5Bcmd1bWVudHNcbntcbiAgICByZXR1cm4geWFyZ3NcbiAgICAudXNhZ2UoXCJQdWJsaXNoZXMgYSBOb2RlLmpzIHBhY2thZ2UgdG8gYSBwcm9qZWN0J3MgR2l0IHJlcG9zaXRvcnkuXCIpXG4gICAgLmhlbHAoKVxuICAgIC5vcHRpb24oXCJ0YWdcIixcbiAgICAgICAge1xuICAgICAgICAgICAgZGVtYW5kT3B0aW9uOiBmYWxzZSxcbiAgICAgICAgICAgIGRlc2NyaWJlOiBcIkFwcGx5IHRoZSBzcGVjaWZpZWQgdGFnIHRvIHRoZSBwdWJsaXNoIGNvbW1pdCAoY2FuIGJlIHVzZWQgbXVsdGlwbGUgdGltZXMpLlwiXG4gICAgICAgIH1cbiAgICApXG4gICAgLm9wdGlvbihcInRhZy12ZXJzaW9uXCIsXG4gICAgICAgIHtcbiAgICAgICAgICAgIHR5cGU6IFwiYm9vbGVhblwiLFxuICAgICAgICAgICAgZGVmYXVsdDogZmFsc2UsXG4gICAgICAgICAgICBkZW1hbmRPcHRpb246IGZhbHNlLFxuICAgICAgICAgICAgZGVzY3JpYmU6IFwiQXBwbHkgYSB0YWcgd2l0aCB0aGUgcHJvamVjdCdzIHZlcnNpb24gbnVtYmVyIChmcm9tIHBhY2thZ2UuanNvbikgdG8gdGhlIHB1Ymxpc2ggY29tbWl0XCJcbiAgICAgICAgfVxuICAgIClcbiAgICAub3B0aW9uKFwiZm9yY2UtdGFnc1wiLFxuICAgICAgICB7XG4gICAgICAgICAgICB0eXBlOiBcImJvb2xlYW5cIixcbiAgICAgICAgICAgIGRlZmF1bHQ6IGZhbHNlLFxuICAgICAgICAgICAgZGVtYW5kT3B0aW9uOiBmYWxzZSxcbiAgICAgICAgICAgIGRlc2NyaWJlOiBcIkZvcmNlcyB0YWdzIHRvIGJlIGFwcGxpZWQsIG1vdmluZyBhbnkgdGhhdCBhbHJlYWR5IGV4aXN0XCJcbiAgICAgICAgfVxuICAgIClcbiAgICAub3B0aW9uKFwiZHJ5LXJ1blwiLFxuICAgICAgICB7XG4gICAgICAgICAgICB0eXBlOiBcImJvb2xlYW5cIixcbiAgICAgICAgICAgIGRlZmF1bHQ6IGZhbHNlLFxuICAgICAgICAgICAgZGVtYW5kT3B0aW9uOiBmYWxzZSxcbiAgICAgICAgICAgIGRlc2NyaWJlOiBcIlBlcmZvcm0gYWxsIG9wZXJhdGlvbnMgYnV0IGRvIG5vdCBwdXNoIHRvIG9yaWdpblwiXG4gICAgICAgIH1cbiAgICApXG4gICAgLnZlcnNpb24oKSAgLy8gdmVyc2lvbiB3aWxsIGJlIHJlYWQgZnJvbSBwYWNrYWdlLmpzb24hXG4gICAgLndyYXAoODApXG4gICAgLmFyZ3Y7XG59XG5cblxuYXN5bmMgZnVuY3Rpb24gZ2V0SW5zdGFuY2VDb25maWcoYXJndjogeWFyZ3MuQXJndW1lbnRzKTogUHJvbWlzZTxJSW5zdGFuY2VDb25maWc+XG57XG4gICAgY29uc3QgZGV2RGlyID0gbmV3IERpcmVjdG9yeShcIi5cIik7XG4gICAgY29uc3QgZGV2UmVwbyA9IGF3YWl0IEdpdFJlcG8uZnJvbURpcmVjdG9yeShkZXZEaXIpO1xuICAgIGNvbnN0IHBrZyA9IGF3YWl0IE5vZGVQYWNrYWdlLmZyb21EaXJlY3RvcnkoZGV2RGlyKTtcblxuICAgIC8vIEJ1aWxkIHRoZSBhcnJheSBvZiB0YWdzIHRoYXQgd2lsbCBiZSBhcHBsaWVkIHRvIHRoZSBwdWJsaXNoIGNvbW1pdC5cbiAgICBsZXQgdGFnczogQXJyYXk8c3RyaW5nPiA9IFtdLmNvbmNhdChhcmd2LnRhZyB8fCBbXSk7XG4gICAgaWYgKGFyZ3ZbXCJ0YWctdmVyc2lvblwiXSlcbiAgICB7XG4gICAgICAgIHRhZ3MucHVzaChgdiR7cGtnLmNvbmZpZy52ZXJzaW9ufWApO1xuICAgIH1cblxuICAgIC8vIE1ha2Ugc3VyZSB3ZSBoYXZlIGF0IGxlYXN0IDEgdGFnIHRvIGFwcGx5LiAgT3RoZXJ3aXNlIGdpdCBtaWdodCBnYXJiYWdlXG4gICAgLy8gY29sbGVjdCB0aGUgcHVibGlzaCBjb21taXQgd2UgYXJlIGFib3V0IHRvIGNyZWF0ZS5cbiAgICBpZiAodGFncy5sZW5ndGggPT09IDApXG4gICAge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJBdCBsZWFzdCBvbmUgdGFnIG11c3QgYmUgYXBwbGllZCBieSB1c2luZyBlaXRoZXIgLS10YWctdmVyc2lvbiBvciAtLXRhZy5cIik7XG4gICAgfVxuXG4gICAgcmV0dXJuIHtcbiAgICAgICAgZHJ5UnVuOiBhcmd2W1wiZHJ5LXJ1blwiXSxcbiAgICAgICAgdGFnczogdGFncyxcbiAgICAgICAgZGV2UmVwbzogZGV2UmVwbyxcbiAgICAgICAgcGtnOiBwa2csXG4gICAgICAgIGZvcmNlVGFnczogYXJndltcImZvcmNlLXRhZ3NcIl1cbiAgICB9O1xufVxuXG5cbmFzeW5jIGZ1bmN0aW9uIGNoZWNrSW5pdGlhbENvbmRpdGlvbnMoaW5zdGFuY2VDb25maWc6IElJbnN0YW5jZUNvbmZpZyk6IFByb21pc2U8dm9pZD5cbntcbiAgICAvLyBNYWtlIHN1cmUgdGhlcmUgYXJlIG5vIG1vZGlmaWVkIGZpbGVzLlxuICAgIGNvbnN0IG1vZGlmaWVkRmlsZXMgPSBhd2FpdCBpbnN0YW5jZUNvbmZpZy5kZXZSZXBvLm1vZGlmaWVkRmlsZXMoKTtcbiAgICBpZiAobW9kaWZpZWRGaWxlcy5sZW5ndGggPiAwIClcbiAgICB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcIlRoaXMgcmVwb3NpdG9yeSBjb250YWlucyBtb2RpZmllZCBmaWxlcy5cIik7XG4gICAgfVxuXG4gICAgLy8gTWFrZSBzdXJlIHRoZXJlIGFyZSBubyB1bnRyYWNrZWQgZmlsZXMuXG4gICAgY29uc3QgdW50cmFja2VkRmlsZXMgPSBhd2FpdCBpbnN0YW5jZUNvbmZpZy5kZXZSZXBvLnVudHJhY2tlZEZpbGVzKCk7XG4gICAgaWYgKHVudHJhY2tlZEZpbGVzLmxlbmd0aCA+IDAgKVxuICAgIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiVGhpcyByZXBvc2l0b3J5IGNvbnRhaW5zIHVudHJhY2tlZCBmaWxlcy5cIik7XG4gICAgfVxuXG4gICAgLy8gVGhlIGRldmVsb3BtZW50IHJlcG8gc2hvdWxkIGJlIGF0IHRoZSBoZWFkIG9mIGEgR2l0IGJyYW5jaC5cbiAgICBjb25zdCBkZXZCcmFuY2ggPSBhd2FpdCBpbnN0YW5jZUNvbmZpZy5kZXZSZXBvLmdldEN1cnJlbnRCcmFuY2goKTtcbiAgICBpZiAoIWRldkJyYW5jaClcbiAgICB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcIkhFQUQgZG9lcyBub3QgY3VycmVudCBwb2ludCB0byBhIGJyYW5jaC5cIik7XG4gICAgfVxuXG4gICAgLy8gVGhlIGRldmVsb3BtZW50IHJlcG8gc2hvdWxkIGJlIHB1c2hlZCB0byBvcmlnaW4uXG4gICAgY29uc3QgZGVsdGFzID0gYXdhaXQgaW5zdGFuY2VDb25maWcuZGV2UmVwby5nZXRDb21taXREZWx0YXMoXCJvcmlnaW5cIik7XG4gICAgaWYgKChkZWx0YXMuYWhlYWQgPiAwKSB8fCAoZGVsdGFzLmJlaGluZCA+IDApKVxuICAgIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBUaGUgYnJhbmNoIGlzICR7ZGVsdGFzLmFoZWFkfSBjb21taXRzIGFoZWFkIGFuZCAke2RlbHRhcy5iZWhpbmR9IGNvbW1pdHMgYmVoaW5kLmApO1xuICAgIH1cblxuICAgIC8vIE1ha2Ugc3VyZSB0aGUgZGlyZWN0b3J5IGlzIGEgTm9kZSBwYWNrYWdlLlxuICAgIGlmICghaW5zdGFuY2VDb25maWcucGtnLmNvbmZpZy52ZXJzaW9uKVxuICAgIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiUGFja2FnZSBkb2VzIG5vdCBoYXZlIGEgdmVyc2lvbi5cIik7XG4gICAgfVxuXG4gICAgLy8gSWYgd2UgYXJlIG5vdCBmb3JjaW5nIChpLmUuIG1vdmluZykgdGFncywgdGhlbiBtYWtlIHN1cmUgbm9uZSBvZiB0aGUgdGFnc1xuICAgIC8vIHdlIGFyZSBhcHBseWluZyBhbHJlYWR5IGV4aXN0LlxuICAgIGlmICghaW5zdGFuY2VDb25maWcuZm9yY2VUYWdzKVxuICAgIHtcbiAgICAgICAgY29uc3QgZXhpc3RpbmdUYWdzID0gYXdhaXQgaW5zdGFuY2VDb25maWcuZGV2UmVwby50YWdzKCk7XG4gICAgICAgIGNvbnN0IGFscmVhZHlFeGlzdCA9IF8uaW50ZXJzZWN0aW9uKGV4aXN0aW5nVGFncywgaW5zdGFuY2VDb25maWcudGFncyk7XG4gICAgICAgIGlmIChhbHJlYWR5RXhpc3QubGVuZ3RoID4gMClcbiAgICAgICAge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBUaGUgZm9sbG93aW5nIHRhZ3MgYWxyZWFkeSBleGlzdDogJHthbHJlYWR5RXhpc3Quam9pbihcIiwgXCIpfWApO1xuICAgICAgICB9XG4gICAgfVxufVxuXG5cbmFzeW5jIGZ1bmN0aW9uIG1haW4oKTogUHJvbWlzZTx2b2lkPlxue1xuICAgIC8vIEdldCB0aGUgY29tbWFuZCBsaW5lIGFyZ3MgZmlyc3QuICBJZiB0aGUgdXNlciBpcyBqdXN0IGRvaW5nIC0taGVscCwgd2VcbiAgICAvLyBkb24ndCB3YW50IHRvIGRvIGFueXRoaW5nIGVsc2UuXG4gICAgY29uc3QgYXJndiA9IGdldEFyZ3MoKTtcblxuICAgIGdsb2JhbENvbmZpZy5pbml0KCk7XG5cbiAgICAvLyBSZXNvbHZlIHRoZSBjb21tYW5kIGxpbmUgYXJndW1lbnRzIGludG8gYSBjb25jcmV0ZSBjb25maWd1cmF0aW9uIGZvciB0aGlzXG4gICAgLy8gaW5zdGFuY2UuXG4gICAgY29uc3QgaW5zdGFuY2VDb25maWcgPSBhd2FpdCBnZXRJbnN0YW5jZUNvbmZpZyhhcmd2KTtcblxuICAgIC8vIEdpdmVuIHRoZSBpbnN0YW5jZSBjb25maWd1cmF0aW9uLCBkZXRlcm1pbmUgaWYgZXZlcnl0aGluZyBpcyBpbiBhIHZhbGlkXG4gICAgLy8gc3RhdGUuXG4gICAgYXdhaXQgY2hlY2tJbml0aWFsQ29uZGl0aW9ucyhpbnN0YW5jZUNvbmZpZyk7XG5cbiAgICBjb25zdCBkZXZDb21taXRIYXNoID0gYXdhaXQgaW5zdGFuY2VDb25maWcuZGV2UmVwby5jdXJyZW50Q29tbWl0SGFzaCgpO1xuICAgIGNvbnN0IGRldkJyYW5jaCA9IChhd2FpdCBpbnN0YW5jZUNvbmZpZy5kZXZSZXBvLmdldEN1cnJlbnRCcmFuY2goKSkhO1xuXG4gICAgLy8gQ2xlYXIgb3V0IHNwYWNlIGZvciB0aGUgcHVibGlzaCByZXBvLlxuICAgIGNvbnN0IHB1Ymxpc2hEaXIgPSBuZXcgRGlyZWN0b3J5KGdsb2JhbENvbmZpZy50bXBEaXIsIGluc3RhbmNlQ29uZmlnLnBrZy5wcm9qZWN0TmFtZSk7XG4gICAgcHVibGlzaERpci5kZWxldGVTeW5jKCk7XG5cbiAgICAvLyBDcmVhdGUgYSBjbG9uZSBvZiB0aGUgcmVwbyBmb3IgcHVibGlzaGluZyBwdXJwb3Nlcy5cbiAgICBjb25zdCByZXBvVXJsID0gVXJsLmZyb21TdHJpbmcoaW5zdGFuY2VDb25maWcucGtnLmNvbmZpZy5yZXBvc2l0b3J5LnVybCk7XG4gICAgaWYgKCFyZXBvVXJsKVxuICAgIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiSW52YWxpZCByZXBvc2l0b3J5IFVSTC5cIik7XG4gICAgfVxuICAgIGNvbnNvbGUubG9nKGBDcmVhdGluZyB0ZW1wb3JhcnkgcmVwbyBjbG9uZSBhdCAke3B1Ymxpc2hEaXIudG9TdHJpbmcoKX0uLi5gKTtcbiAgICBjb25zdCBwdWJsaXNoUmVwbyA9IGF3YWl0IEdpdFJlcG8uY2xvbmUocmVwb1VybCwgZ2xvYmFsQ29uZmlnLnRtcERpcik7XG5cbiAgICAvLyBDaGVja291dCB0aGUgY29tbWl0IHRoZSBkZXZSZXBvIGlzIGF0LlxuICAgIHB1Ymxpc2hSZXBvLmNoZWNrb3V0Q29tbWl0KGRldkNvbW1pdEhhc2gpO1xuICAgIGNvbnNvbGUubG9nKGBDaGVja2luZyBvdXQgY3VycmVudCBkZXZlbG9wbWVudCBjb21taXQgJHtkZXZDb21taXRIYXNofS4uLmApO1xuXG4gICAgLy8gQ3JlYXRlIGEgdGVtcG9yYXJ5IGJyYW5jaCBvbiB3aGljaCB0aGUgcHVibGlzaGVkIGZpbGVzIHdpbGwgYmUgY29tbWl0dGVkLlxuICAgIGNvbnNvbGUubG9nKFwiQ3JlYXRpbmcgdGVtcG9yYXJ5IGJyYW5jaC4uLlwiKTtcbiAgICBhd2FpdCBjaGVja291dFRlbXBCcmFuY2gocHVibGlzaFJlcG8sIFwicHVibGlzaHRvZ2l0XCIpO1xuXG4gICAgLy8gUmVtb3ZlIGFsbCBmaWxlcyB1bmRlciB2ZXJzaW9uIGNvbnRyb2wgYW5kIHBydW5lIGRpcmVjdG9yaWVzIHRoYXQgYXJlXG4gICAgLy8gZW1wdHkuXG4gICAgY29uc29sZS5sb2coXCJEZWxldGluZyBhbGwgZmlsZXMuLi5cIik7XG4gICAgYXdhaXQgZGVsZXRlVHJhY2tlZEZpbGVzKHB1Ymxpc2hSZXBvKTtcbiAgICBhd2FpdCBwdWJsaXNoUmVwby5kaXJlY3RvcnkucHJ1bmUoKTtcblxuICAgIC8vIFB1Ymxpc2ggdGhlIGRldiByZXBvIHRvIHRoZSBwdWJsaXNoIGRpcmVjdG9yeS5cbiAgICBjb25zb2xlLmxvZyhcIlB1Ymxpc2hpbmcgcGFja2FnZSBjb250ZW50cyB0byBwdWJsaXNoIHJlcG9zaXRvcnkuLi5cIik7XG4gICAgYXdhaXQgaW5zdGFuY2VDb25maWcucGtnLnB1Ymxpc2gocHVibGlzaERpciwgZmFsc2UpO1xuXG4gICAgLy8gU3RhZ2UgYW5kIGNvbW1pdCB0aGUgcHVibGlzaGVkIGZpbGVzLlxuICAgIGNvbnNvbGUubG9nKFwiQ29tbWl0aW5nIHB1Ymxpc2hlZCBmaWxlcy4uLlwiKTtcbiAgICBhd2FpdCBwdWJsaXNoUmVwby5zdGFnZUFsbCgpO1xuICAgIGF3YWl0IHB1Ymxpc2hSZXBvLmNvbW1pdChcIlB1Ymxpc2hlZCB1c2luZyBwdWJsaXNoLXRvLWdpdC5cIik7XG5cbiAgICAvLyBUT0RPOiBJZiB0aGUgc291cmNlIHJlcG8gaGFzIGEgQ0hBTkdFTE9HLm1kLCBhZGQgaXRzIGNvbnRlbnRzIGFzIHRoZSBhbm5vdGF0ZWQgdGFnIG1lc3NhZ2UuXG5cbiAgICBjb25zdCBwdWJsaXNoQ29tbWl0SGFzaCA9IGF3YWl0IHB1Ymxpc2hSZXBvLmN1cnJlbnRDb21taXRIYXNoKCk7XG5cbiAgICAvLyBBcHBseSB0YWdzLlxuICAgIGF3YWl0IFByb21pc2UuYWxsKF8ubWFwKGluc3RhbmNlQ29uZmlnLnRhZ3MsIChjdXJUYWdOYW1lKSA9PiB7XG4gICAgICAgIGNvbnNvbGUubG9nKGBDcmVhdGluZyB0YWcgJHtjdXJUYWdOYW1lfS4uLmApO1xuICAgICAgICBjb25zdCB0YWdNZXNzYWdlID1cbiAgICAgICAgICAgIFwiUHVibGlzaGVkIHVzaW5nIHB1Ymxpc2h0b2dpdC5cXG5cIiArXG4gICAgICAgICAgICBgU291cmNlIGJyYW5jaDogJHtkZXZCcmFuY2gubmFtZX1cXG5gICtcbiAgICAgICAgICAgIGBTb3VyY2UgY29tbWl0OiAke2RldkNvbW1pdEhhc2gudG9TdHJpbmcoKX0gWyR7ZGV2Q29tbWl0SGFzaC50b1Nob3J0U3RyaW5nKCl9XWA7XG4gICAgICAgIHJldHVybiBwdWJsaXNoUmVwby5jcmVhdGVUYWcoY3VyVGFnTmFtZSwgdGFnTWVzc2FnZSwgdHJ1ZSk7XG4gICAgfSkpO1xuXG4gICAgLy8gSWYgZG9pbmcgYSBcImRyeSBydW5cIiwgc3RvcC5cbiAgICBpZiAoaW5zdGFuY2VDb25maWcuZHJ5UnVuKVxuICAgIHtcbiAgICAgICAgY29uc3QgbXNnID0gW1xuICAgICAgICAgICAgXCJSdW5uaW5nIGluIGRyeS1ydW4gbW9kZS4gIFRoZSByZXBvc2l0b3J5IGluIHRoZSBmb2xsb3dpbmcgdGVtcG9yYXJ5IGRpcmVjdG9yeVwiLFxuICAgICAgICAgICAgXCJoYXMgYmVlbiBsZWZ0IHJlYWR5IHRvIHB1c2ggdG8gYSBwdWJsaWMgc2VydmVyLlwiLFxuICAgICAgICAgICAgcHVibGlzaFJlcG8uZGlyZWN0b3J5LnRvU3RyaW5nKClcbiAgICAgICAgXTtcbiAgICAgICAgY29uc29sZS5sb2cobXNnLmpvaW4oXCJcXG5cIikpO1xuICAgICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgLy8gUHVzaCBhbGwgdGFncy5cbiAgICBhd2FpdCBQcm9taXNlLmFsbChfLm1hcChpbnN0YW5jZUNvbmZpZy50YWdzLCAoY3VyVGFnTmFtZSkgPT4ge1xuICAgICAgICBjb25zb2xlLmxvZyhgUHVzaGluZyB0YWcgJHtjdXJUYWdOYW1lfSB0byBvcmlnaW4uYCk7XG4gICAgICAgIHJldHVybiBwdWJsaXNoUmVwby5wdXNoVGFnKGN1clRhZ05hbWUsIFwib3JpZ2luXCIsIHRydWUpO1xuICAgIH0pKTtcblxuICAgIC8vIFByaW50IGEgY29tcGxldGlvbiBtZXNzYWdlLlxuICAgIC8vIFRlbGwgdGhlIHVzZXIgaG93IHRvIGluY2x1ZGUgdGhlIHB1Ymxpc2hlZCByZXBvc2l0b3J5IGludG8gYW5vdGhlclxuICAgIC8vIHByb2plY3QncyBkZXBlbmRlbmNpZXMuXG4gICAgY29uc3QgZGVwZW5kZW5jeVVybCA9IHJlcG9VcmwucmVwbGFjZVByb3RvY29sKFwiZ2l0K2h0dHBzXCIpLnRvU3RyaW5nKCk7XG4gICAgY29uc3QgZG9uZU1lc3NhZ2UgPSBbXG4gICAgICAgIFwiRG9uZS5cIixcbiAgICAgICAgXCJUbyBpbmNsdWRlIHRoZSBwdWJsaXNoZWQgbGlicmFyeSBpbiBhIE5vZGUuanMgcHJvamVjdCwgZXhlY3V0ZSB0aGUgZm9sbG93aW5nIGNvbW1hbmQ6XCJcbiAgICBdLmNvbmNhdChfLm1hcChpbnN0YW5jZUNvbmZpZy50YWdzLCAoY3VyVGFnTmFtZSkgPT4ge1xuICAgICAgICByZXR1cm4gYG5wbSBpbnN0YWxsICR7ZGVwZW5kZW5jeVVybH0jJHtjdXJUYWdOYW1lfWA7XG4gICAgfSkpXG4gICAgLmNvbmNhdChgbnBtIGluc3RhbGwgJHtkZXBlbmRlbmN5VXJsfSMke3B1Ymxpc2hDb21taXRIYXNoLnRvU2hvcnRTdHJpbmcoKX1gKTtcbiAgICBjb25zb2xlLmxvZyhkb25lTWVzc2FnZS5qb2luKFwiXFxuXCIpKTtcbn1cblxuXG5tYWluKCk7XG5cblxuYXN5bmMgZnVuY3Rpb24gY2hlY2tvdXRUZW1wQnJhbmNoKHJlcG86IEdpdFJlcG8sIGJhc2VOYW1lOiBzdHJpbmcpOiBQcm9taXNlPEdpdEJyYW5jaD5cbntcbiAgICBjb25zdCBub3cgPSBuZXcgRGF0ZSgpO1xuICAgIGNvbnN0IGRhdGVzdGFtcCA9XG4gICAgICAgIG5vdy5nZXRGdWxsWWVhcigpICsgXCJfXCIgKyBub3cuZ2V0TW9udGgoKSArIFwiX1wiICsgbm93LmdldERhdGUoKSArIFwiX1wiICtcbiAgICAgICAgbm93LmdldEhvdXJzKCkgKyBcIl9cIiArIG5vdy5nZXRNaW51dGVzKCkgKyBcIl9cIiArIG5vdy5nZXRTZWNvbmRzKCkgKyBcIi5cIiArIG5vdy5nZXRNaWxsaXNlY29uZHMoKTtcblxuICAgIGNvbnN0IHVzZXIgPSB1c2VySW5mbygpO1xuXG4gICAgY29uc3QgdG1wQnJhbmNoTmFtZSA9IGAke2Jhc2VOYW1lfS0ke3VzZXIudXNlcm5hbWV9LSR7ZGF0ZXN0YW1wfWA7XG4gICAgY29uc3QgdG1wQnJhbmNoID0gYXdhaXQgR2l0QnJhbmNoLmNyZWF0ZShyZXBvLCB0bXBCcmFuY2hOYW1lKTtcbiAgICBhd2FpdCByZXBvLmNoZWNrb3V0QnJhbmNoKHRtcEJyYW5jaCwgdHJ1ZSk7XG4gICAgcmV0dXJuIHRtcEJyYW5jaDtcbn1cblxuXG4vKipcbiAqIERlbGV0ZXMgYWxsIHRyYWNrZWQgZmlsZXMgd2l0aGluIGEgcmVwby5cbiAqIEBwYXJhbSByZXBvIC0gVGhlIHJlcG8gdG8gY2xlYXJcbiAqIEByZXR1cm4gQSBQcm9taXNlIHRoYXQgaXMgcmVzb2x2ZWQgd2hlbiBhbGwgZmlsZXMgaGF2ZSBiZWVuIGRlbGV0ZWQuXG4gKi9cbmFzeW5jIGZ1bmN0aW9uIGRlbGV0ZVRyYWNrZWRGaWxlcyhyZXBvOiBHaXRSZXBvKTogUHJvbWlzZTx2b2lkPlxue1xuICAgIGNvbnN0IGZpbGVzID0gYXdhaXQgcmVwby5maWxlcygpO1xuICAgIGNvbnN0IGRlbGV0ZVByb21pc2VzID0gXy5tYXAoZmlsZXMsIChjdXJGaWxlKSA9PiB7XG4gICAgICAgIHJldHVybiBjdXJGaWxlLmRlbGV0ZSgpO1xuICAgIH0pO1xuXG4gICAgYXdhaXQgUHJvbWlzZS5hbGwoZGVsZXRlUHJvbWlzZXMpO1xufVxuIl19
