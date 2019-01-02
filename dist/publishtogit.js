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
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
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
var os_1 = require("os");
var _ = require("lodash");
var yargs = require("yargs");
var directory_1 = require("./depot/directory");
var nodePackage_1 = require("./depot/nodePackage");
var url_1 = require("./depot/url");
var gitRepo_1 = require("./depot/gitRepo");
var gitBranch_1 = require("./depot/gitBranch");
var publishToGitConfig_1 = require("./publishToGitConfig");
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
                    console.log("Checking out current development commit " + devCommitHash.toShortString() + "...");
                    return [4 /*yield*/, publishRepo.checkoutCommit(devCommitHash)];
                case 6:
                    _a.sent();
                    // Create a temporary branch on which the published files will be committed.
                    console.log("Creating temporary branch...");
                    return [4 /*yield*/, checkoutTempBranch(publishRepo, "publishtogit")];
                case 7:
                    _a.sent();
                    // Remove all files under version control and prune directories that are
                    // empty.
                    console.log("Deleting all files...");
                    return [4 /*yield*/, deleteTrackedFiles(publishRepo)];
                case 8:
                    _a.sent();
                    return [4 /*yield*/, publishRepo.directory.prune()];
                case 9:
                    _a.sent();
                    // Publish the dev repo to the publish directory.
                    console.log("Publishing package contents to publish repository...");
                    return [4 /*yield*/, instanceConfig.pkg.publish(publishDir, false, publishToGitConfig_1.config.tmpDir)];
                case 10:
                    _a.sent();
                    // Stage and commit the published files.
                    console.log("Commiting published files...");
                    return [4 /*yield*/, publishRepo.stageAll()];
                case 11:
                    _a.sent();
                    return [4 /*yield*/, publishRepo.commit("Published using publish-to-git.")];
                case 12:
                    _a.sent();
                    return [4 /*yield*/, publishRepo.currentCommitHash()];
                case 13:
                    publishCommitHash = _a.sent();
                    // Apply tags.
                    return [4 /*yield*/, Promise.all(_.map(instanceConfig.tags, function (curTagName) {
                            console.log("Creating tag " + curTagName + "...");
                            var tagMessage = "Published using publishtogit.\n" +
                                ("Source branch: " + devBranch.name + "\n") +
                                ("Source commit: " + devCommitHash.toString() + " [" + devCommitHash.toShortString() + "]");
                            return publishRepo.createTag(curTagName, tagMessage, true);
                        }))];
                case 14:
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
                case 15:
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
main()
    .catch(function (err) {
    console.log(JSON.stringify(err, undefined, 4));
    throw err;
});

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9wdWJsaXNodG9naXQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFFQSx5QkFBNEI7QUFDNUIsMEJBQTRCO0FBQzVCLDZCQUErQjtBQUMvQiwrQ0FBNEM7QUFDNUMsbURBQWdEO0FBQ2hELG1DQUFnQztBQUNoQywyQ0FBd0M7QUFDeEMsK0NBQTRDO0FBQzVDLDJEQUE0RDtBQWlCNUQsZ0ZBQWdGO0FBQ2hGLG1CQUFtQjtBQUNuQixnRkFBZ0Y7QUFFaEY7SUFFSSxPQUFPLEtBQUs7U0FDWCxLQUFLLENBQUMsNERBQTRELENBQUM7U0FDbkUsSUFBSSxFQUFFO1NBQ04sTUFBTSxDQUFDLEtBQUssRUFDVDtRQUNJLFlBQVksRUFBRSxLQUFLO1FBQ25CLFFBQVEsRUFBRSw2RUFBNkU7S0FDMUYsQ0FDSjtTQUNBLE1BQU0sQ0FBQyxhQUFhLEVBQ2pCO1FBQ0ksSUFBSSxFQUFFLFNBQVM7UUFDZixPQUFPLEVBQUUsS0FBSztRQUNkLFlBQVksRUFBRSxLQUFLO1FBQ25CLFFBQVEsRUFBRSx5RkFBeUY7S0FDdEcsQ0FDSjtTQUNBLE1BQU0sQ0FBQyxZQUFZLEVBQ2hCO1FBQ0ksSUFBSSxFQUFFLFNBQVM7UUFDZixPQUFPLEVBQUUsS0FBSztRQUNkLFlBQVksRUFBRSxLQUFLO1FBQ25CLFFBQVEsRUFBRSwwREFBMEQ7S0FDdkUsQ0FDSjtTQUNBLE1BQU0sQ0FBQyxTQUFTLEVBQ2I7UUFDSSxJQUFJLEVBQUUsU0FBUztRQUNmLE9BQU8sRUFBRSxLQUFLO1FBQ2QsWUFBWSxFQUFFLEtBQUs7UUFDbkIsUUFBUSxFQUFFLGtEQUFrRDtLQUMvRCxDQUNKO1NBQ0EsT0FBTyxFQUFFLENBQUUsMENBQTBDO1NBQ3JELElBQUksQ0FBQyxFQUFFLENBQUM7U0FDUixJQUFJLENBQUM7QUFDVixDQUFDO0FBR0QsMkJBQWlDLElBQXFCOzs7Ozs7b0JBRTVDLE1BQU0sR0FBRyxJQUFJLHFCQUFTLENBQUMsR0FBRyxDQUFDLENBQUM7b0JBQ2xCLHFCQUFNLGlCQUFPLENBQUMsYUFBYSxDQUFDLE1BQU0sQ0FBQyxFQUFBOztvQkFBN0MsT0FBTyxHQUFHLFNBQW1DO29CQUN2QyxxQkFBTSx5QkFBVyxDQUFDLGFBQWEsQ0FBQyxNQUFNLENBQUMsRUFBQTs7b0JBQTdDLEdBQUcsR0FBRyxTQUF1QztvQkFHL0MsSUFBSSxHQUFrQixFQUFFLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxHQUFHLElBQUksRUFBRSxDQUFDLENBQUM7b0JBQ3BELElBQUksSUFBSSxDQUFDLGFBQWEsQ0FBQyxFQUN2Qjt3QkFDSSxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQUksR0FBRyxDQUFDLE1BQU0sQ0FBQyxPQUFTLENBQUMsQ0FBQztxQkFDdkM7b0JBRUQsMEVBQTBFO29CQUMxRSxxREFBcUQ7b0JBQ3JELElBQUksSUFBSSxDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQ3JCO3dCQUNJLE1BQU0sSUFBSSxLQUFLLENBQUMsMEVBQTBFLENBQUMsQ0FBQztxQkFDL0Y7b0JBRUQsc0JBQU87NEJBQ0gsTUFBTSxFQUFFLElBQUksQ0FBQyxTQUFTLENBQUM7NEJBQ3ZCLElBQUksRUFBRSxJQUFJOzRCQUNWLE9BQU8sRUFBRSxPQUFPOzRCQUNoQixHQUFHLEVBQUUsR0FBRzs0QkFDUixTQUFTLEVBQUUsSUFBSSxDQUFDLFlBQVksQ0FBQzt5QkFDaEMsRUFBQzs7OztDQUNMO0FBR0QsZ0NBQXNDLGNBQStCOzs7Ozt3QkFHM0MscUJBQU0sY0FBYyxDQUFDLE9BQU8sQ0FBQyxhQUFhLEVBQUUsRUFBQTs7b0JBQTVELGFBQWEsR0FBRyxTQUE0QztvQkFDbEUsSUFBSSxhQUFhLENBQUMsTUFBTSxHQUFHLENBQUMsRUFDNUI7d0JBQ0ksTUFBTSxJQUFJLEtBQUssQ0FBQywwQ0FBMEMsQ0FBQyxDQUFDO3FCQUMvRDtvQkFHc0IscUJBQU0sY0FBYyxDQUFDLE9BQU8sQ0FBQyxjQUFjLEVBQUUsRUFBQTs7b0JBQTlELGNBQWMsR0FBRyxTQUE2QztvQkFDcEUsSUFBSSxjQUFjLENBQUMsTUFBTSxHQUFHLENBQUMsRUFDN0I7d0JBQ0ksTUFBTSxJQUFJLEtBQUssQ0FBQywyQ0FBMkMsQ0FBQyxDQUFDO3FCQUNoRTtvQkFHaUIscUJBQU0sY0FBYyxDQUFDLE9BQU8sQ0FBQyxnQkFBZ0IsRUFBRSxFQUFBOztvQkFBM0QsU0FBUyxHQUFHLFNBQStDO29CQUNqRSxJQUFJLENBQUMsU0FBUyxFQUNkO3dCQUNJLE1BQU0sSUFBSSxLQUFLLENBQUMsMENBQTBDLENBQUMsQ0FBQztxQkFDL0Q7b0JBR2MscUJBQU0sY0FBYyxDQUFDLE9BQU8sQ0FBQyxlQUFlLENBQUMsUUFBUSxDQUFDLEVBQUE7O29CQUEvRCxNQUFNLEdBQUcsU0FBc0Q7b0JBQ3JFLElBQUksQ0FBQyxNQUFNLENBQUMsS0FBSyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsRUFDN0M7d0JBQ0ksTUFBTSxJQUFJLEtBQUssQ0FBQyxtQkFBaUIsTUFBTSxDQUFDLEtBQUssMkJBQXNCLE1BQU0sQ0FBQyxNQUFNLHFCQUFrQixDQUFDLENBQUM7cUJBQ3ZHO29CQUVELDZDQUE2QztvQkFDN0MsSUFBSSxDQUFDLGNBQWMsQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLE9BQU8sRUFDdEM7d0JBQ0ksTUFBTSxJQUFJLEtBQUssQ0FBQyxrQ0FBa0MsQ0FBQyxDQUFDO3FCQUN2RDt5QkFJRyxDQUFDLGNBQWMsQ0FBQyxTQUFTLEVBQXpCLHdCQUF5QjtvQkFFSixxQkFBTSxjQUFjLENBQUMsT0FBTyxDQUFDLElBQUksRUFBRSxFQUFBOztvQkFBbEQsWUFBWSxHQUFHLFNBQW1DO29CQUNsRCxZQUFZLEdBQUcsQ0FBQyxDQUFDLFlBQVksQ0FBQyxZQUFZLEVBQUUsY0FBYyxDQUFDLElBQUksQ0FBQyxDQUFDO29CQUN2RSxJQUFJLFlBQVksQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUMzQjt3QkFDSSxNQUFNLElBQUksS0FBSyxDQUFDLHVDQUFxQyxZQUFZLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBRyxDQUFDLENBQUM7cUJBQ25GOzs7Ozs7Q0FFUjtBQUdEOzs7Ozs7b0JBSVUsSUFBSSxHQUFHLE9BQU8sRUFBRSxDQUFDO29CQUV2QiwyQkFBWSxDQUFDLElBQUksRUFBRSxDQUFDO29CQUlHLHFCQUFNLGlCQUFpQixDQUFDLElBQUksQ0FBQyxFQUFBOztvQkFBOUMsY0FBYyxHQUFHLFNBQTZCO29CQUVwRCwwRUFBMEU7b0JBQzFFLFNBQVM7b0JBQ1QscUJBQU0sc0JBQXNCLENBQUMsY0FBYyxDQUFDLEVBQUE7O29CQUY1QywwRUFBMEU7b0JBQzFFLFNBQVM7b0JBQ1QsU0FBNEMsQ0FBQztvQkFFdkIscUJBQU0sY0FBYyxDQUFDLE9BQU8sQ0FBQyxpQkFBaUIsRUFBRSxFQUFBOztvQkFBaEUsYUFBYSxHQUFHLFNBQWdEO29CQUNuRCxxQkFBTSxjQUFjLENBQUMsT0FBTyxDQUFDLGdCQUFnQixFQUFFLEVBQUE7O29CQUE1RCxTQUFTLEdBQUcsQ0FBQyxTQUErQyxDQUFFO29CQUc5RCxVQUFVLEdBQUcsSUFBSSxxQkFBUyxDQUFDLDJCQUFZLENBQUMsTUFBTSxFQUFFLGNBQWMsQ0FBQyxHQUFHLENBQUMsV0FBVyxDQUFDLENBQUM7b0JBQ3RGLFVBQVUsQ0FBQyxVQUFVLEVBQUUsQ0FBQztvQkFHbEIsT0FBTyxHQUFHLFNBQUcsQ0FBQyxVQUFVLENBQUMsY0FBYyxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBQyxDQUFDO29CQUN6RSxJQUFJLENBQUMsT0FBTyxFQUNaO3dCQUNJLE1BQU0sSUFBSSxLQUFLLENBQUMseUJBQXlCLENBQUMsQ0FBQztxQkFDOUM7b0JBQ0QsT0FBTyxDQUFDLEdBQUcsQ0FBQyxzQ0FBb0MsVUFBVSxDQUFDLFFBQVEsRUFBRSxRQUFLLENBQUMsQ0FBQztvQkFDeEQscUJBQU0saUJBQU8sQ0FBQyxLQUFLLENBQUMsT0FBTyxFQUFFLDJCQUFZLENBQUMsTUFBTSxDQUFDLEVBQUE7O29CQUEvRCxXQUFXLEdBQUcsU0FBaUQ7b0JBRXJFLHlDQUF5QztvQkFDekMsT0FBTyxDQUFDLEdBQUcsQ0FBQyw2Q0FBMkMsYUFBYSxDQUFDLGFBQWEsRUFBRSxRQUFLLENBQUMsQ0FBQztvQkFDM0YscUJBQU0sV0FBVyxDQUFDLGNBQWMsQ0FBQyxhQUFhLENBQUMsRUFBQTs7b0JBQS9DLFNBQStDLENBQUM7b0JBRWhELDRFQUE0RTtvQkFDNUUsT0FBTyxDQUFDLEdBQUcsQ0FBQyw4QkFBOEIsQ0FBQyxDQUFDO29CQUM1QyxxQkFBTSxrQkFBa0IsQ0FBQyxXQUFXLEVBQUUsY0FBYyxDQUFDLEVBQUE7O29CQUFyRCxTQUFxRCxDQUFDO29CQUV0RCx3RUFBd0U7b0JBQ3hFLFNBQVM7b0JBQ1QsT0FBTyxDQUFDLEdBQUcsQ0FBQyx1QkFBdUIsQ0FBQyxDQUFDO29CQUNyQyxxQkFBTSxrQkFBa0IsQ0FBQyxXQUFXLENBQUMsRUFBQTs7b0JBQXJDLFNBQXFDLENBQUM7b0JBQ3RDLHFCQUFNLFdBQVcsQ0FBQyxTQUFTLENBQUMsS0FBSyxFQUFFLEVBQUE7O29CQUFuQyxTQUFtQyxDQUFDO29CQUVwQyxpREFBaUQ7b0JBQ2pELE9BQU8sQ0FBQyxHQUFHLENBQUMsc0RBQXNELENBQUMsQ0FBQztvQkFDcEUscUJBQU0sY0FBYyxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsVUFBVSxFQUFFLEtBQUssRUFBRSwyQkFBWSxDQUFDLE1BQU0sQ0FBQyxFQUFBOztvQkFBeEUsU0FBd0UsQ0FBQztvQkFFekUsd0NBQXdDO29CQUN4QyxPQUFPLENBQUMsR0FBRyxDQUFDLDhCQUE4QixDQUFDLENBQUM7b0JBQzVDLHFCQUFNLFdBQVcsQ0FBQyxRQUFRLEVBQUUsRUFBQTs7b0JBQTVCLFNBQTRCLENBQUM7b0JBQzdCLHFCQUFNLFdBQVcsQ0FBQyxNQUFNLENBQUMsaUNBQWlDLENBQUMsRUFBQTs7b0JBQTNELFNBQTJELENBQUM7b0JBSWxDLHFCQUFNLFdBQVcsQ0FBQyxpQkFBaUIsRUFBRSxFQUFBOztvQkFBekQsaUJBQWlCLEdBQUcsU0FBcUM7b0JBRS9ELGNBQWM7b0JBQ2QscUJBQU0sT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLGNBQWMsQ0FBQyxJQUFJLEVBQUUsVUFBQyxVQUFVOzRCQUNwRCxPQUFPLENBQUMsR0FBRyxDQUFDLGtCQUFnQixVQUFVLFFBQUssQ0FBQyxDQUFDOzRCQUM3QyxJQUFNLFVBQVUsR0FDWixpQ0FBaUM7aUNBQ2pDLG9CQUFrQixTQUFTLENBQUMsSUFBSSxPQUFJLENBQUE7aUNBQ3BDLG9CQUFrQixhQUFhLENBQUMsUUFBUSxFQUFFLFVBQUssYUFBYSxDQUFDLGFBQWEsRUFBRSxNQUFHLENBQUEsQ0FBQzs0QkFDcEYsT0FBTyxXQUFXLENBQUMsU0FBUyxDQUFDLFVBQVUsRUFBRSxVQUFVLEVBQUUsSUFBSSxDQUFDLENBQUM7d0JBQy9ELENBQUMsQ0FBQyxDQUFDLEVBQUE7O29CQVJILGNBQWM7b0JBQ2QsU0FPRyxDQUFDO29CQUVKLDhCQUE4QjtvQkFDOUIsSUFBSSxjQUFjLENBQUMsTUFBTSxFQUN6Qjt3QkFDVSxHQUFHLEdBQUc7NEJBQ1IsK0VBQStFOzRCQUMvRSxpREFBaUQ7NEJBQ2pELFdBQVcsQ0FBQyxTQUFTLENBQUMsUUFBUSxFQUFFO3lCQUNuQyxDQUFDO3dCQUNGLE9BQU8sQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO3dCQUM1QixzQkFBTztxQkFDVjtvQkFFRCxpQkFBaUI7b0JBQ2pCLHFCQUFNLE9BQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxjQUFjLENBQUMsSUFBSSxFQUFFLFVBQUMsVUFBVTs0QkFDcEQsT0FBTyxDQUFDLEdBQUcsQ0FBQyxpQkFBZSxVQUFVLGdCQUFhLENBQUMsQ0FBQzs0QkFDcEQsT0FBTyxXQUFXLENBQUMsT0FBTyxDQUFDLFVBQVUsRUFBRSxRQUFRLEVBQUUsSUFBSSxDQUFDLENBQUM7d0JBQzNELENBQUMsQ0FBQyxDQUFDLEVBQUE7O29CQUpILGlCQUFpQjtvQkFDakIsU0FHRyxDQUFDO29CQUtFLGFBQWEsR0FBRyxPQUFPLENBQUMsZUFBZSxDQUFDLFdBQVcsQ0FBQyxDQUFDLFFBQVEsRUFBRSxDQUFDO29CQUNoRSxXQUFXLEdBQUc7d0JBQ2hCLE9BQU87d0JBQ1AsdUZBQXVGO3FCQUMxRixDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLGNBQWMsQ0FBQyxJQUFJLEVBQUUsVUFBQyxVQUFVO3dCQUMzQyxPQUFPLGlCQUFlLGFBQWEsU0FBSSxVQUFZLENBQUM7b0JBQ3hELENBQUMsQ0FBQyxDQUFDO3lCQUNGLE1BQU0sQ0FBQyxpQkFBZSxhQUFhLFNBQUksaUJBQWlCLENBQUMsYUFBYSxFQUFJLENBQUMsQ0FBQztvQkFDN0UsT0FBTyxDQUFDLEdBQUcsQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7Ozs7O0NBQ3ZDO0FBR0QsNEJBQWtDLElBQWEsRUFBRSxRQUFnQjs7Ozs7O29CQUV2RCxHQUFHLEdBQUcsSUFBSSxJQUFJLEVBQUUsQ0FBQztvQkFDakIsU0FBUyxHQUNYLEdBQUcsQ0FBQyxXQUFXLEVBQUUsR0FBRyxHQUFHLEdBQUcsR0FBRyxDQUFDLFFBQVEsRUFBRSxHQUFHLEdBQUcsR0FBRyxHQUFHLENBQUMsT0FBTyxFQUFFLEdBQUcsR0FBRzt3QkFDcEUsR0FBRyxDQUFDLFFBQVEsRUFBRSxHQUFHLEdBQUcsR0FBRyxHQUFHLENBQUMsVUFBVSxFQUFFLEdBQUcsR0FBRyxHQUFHLEdBQUcsQ0FBQyxVQUFVLEVBQUUsR0FBRyxHQUFHLEdBQUcsR0FBRyxDQUFDLGVBQWUsRUFBRSxDQUFDO29CQUU3RixJQUFJLEdBQUcsYUFBUSxFQUFFLENBQUM7b0JBRWxCLGFBQWEsR0FBTSxRQUFRLFNBQUksSUFBSSxDQUFDLFFBQVEsU0FBSSxTQUFXLENBQUM7b0JBQ2hELHFCQUFNLHFCQUFTLENBQUMsTUFBTSxDQUFDLElBQUksRUFBRSxhQUFhLENBQUMsRUFBQTs7b0JBQXZELFNBQVMsR0FBRyxTQUEyQztvQkFDN0QscUJBQU0sSUFBSSxDQUFDLGNBQWMsQ0FBQyxTQUFTLEVBQUUsSUFBSSxDQUFDLEVBQUE7O29CQUExQyxTQUEwQyxDQUFDO29CQUMzQyxzQkFBTyxTQUFTLEVBQUM7Ozs7Q0FDcEI7QUFHRDs7OztHQUlHO0FBQ0gsNEJBQWtDLElBQWE7Ozs7O3dCQUU3QixxQkFBTSxJQUFJLENBQUMsS0FBSyxFQUFFLEVBQUE7O29CQUExQixLQUFLLEdBQUcsU0FBa0I7b0JBQzFCLGNBQWMsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLEtBQUssRUFBRSxVQUFDLE9BQU87d0JBQ3hDLE9BQU8sT0FBTyxDQUFDLE1BQU0sRUFBRSxDQUFDO29CQUM1QixDQUFDLENBQUMsQ0FBQztvQkFFSCxxQkFBTSxPQUFPLENBQUMsR0FBRyxDQUFDLGNBQWMsQ0FBQyxFQUFBOztvQkFBakMsU0FBaUMsQ0FBQzs7Ozs7Q0FDckM7QUFHRCxJQUFJLEVBQUU7S0FDTCxLQUFLLENBQUMsVUFBQyxHQUFHO0lBQ1AsT0FBTyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLEdBQUcsRUFBRSxTQUFTLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUMvQyxNQUFNLEdBQUcsQ0FBQztBQUNkLENBQUMsQ0FBQyxDQUFDIiwiZmlsZSI6InB1Ymxpc2h0b2dpdC5qcyIsInNvdXJjZXNDb250ZW50IjpbIiMhL3Vzci9iaW4vZW52IG5vZGVcblxuaW1wb3J0IHt1c2VySW5mb30gZnJvbSBcIm9zXCI7XG5pbXBvcnQgKiBhcyBfIGZyb20gXCJsb2Rhc2hcIjtcbmltcG9ydCAqIGFzIHlhcmdzIGZyb20gXCJ5YXJnc1wiO1xuaW1wb3J0IHtEaXJlY3Rvcnl9IGZyb20gXCIuL2RlcG90L2RpcmVjdG9yeVwiO1xuaW1wb3J0IHtOb2RlUGFja2FnZX0gZnJvbSBcIi4vZGVwb3Qvbm9kZVBhY2thZ2VcIjtcbmltcG9ydCB7VXJsfSBmcm9tIFwiLi9kZXBvdC91cmxcIjtcbmltcG9ydCB7R2l0UmVwb30gZnJvbSBcIi4vZGVwb3QvZ2l0UmVwb1wiO1xuaW1wb3J0IHtHaXRCcmFuY2h9IGZyb20gXCIuL2RlcG90L2dpdEJyYW5jaFwiO1xuaW1wb3J0IHtjb25maWcgYXMgZ2xvYmFsQ29uZmlnfSBmcm9tIFwiLi9wdWJsaXNoVG9HaXRDb25maWdcIjtcblxuXG4vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gVHlwZXNcbi8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG5cbmludGVyZmFjZSBJSW5zdGFuY2VDb25maWdcbntcbiAgICBkZXZSZXBvOiBHaXRSZXBvO1xuICAgIHBrZzogTm9kZVBhY2thZ2U7XG4gICAgZHJ5UnVuOiBib29sZWFuO1xuICAgIHRhZ3M6IEFycmF5PHN0cmluZz47XG4gICAgZm9yY2VUYWdzOiBib29sZWFuO1xufVxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBIZWxwZXIgRnVuY3Rpb25zXG4vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuXG5mdW5jdGlvbiBnZXRBcmdzKCk6IHlhcmdzLkFyZ3VtZW50c1xue1xuICAgIHJldHVybiB5YXJnc1xuICAgIC51c2FnZShcIlB1Ymxpc2hlcyBhIE5vZGUuanMgcGFja2FnZSB0byBhIHByb2plY3QncyBHaXQgcmVwb3NpdG9yeS5cIilcbiAgICAuaGVscCgpXG4gICAgLm9wdGlvbihcInRhZ1wiLFxuICAgICAgICB7XG4gICAgICAgICAgICBkZW1hbmRPcHRpb246IGZhbHNlLFxuICAgICAgICAgICAgZGVzY3JpYmU6IFwiQXBwbHkgdGhlIHNwZWNpZmllZCB0YWcgdG8gdGhlIHB1Ymxpc2ggY29tbWl0IChjYW4gYmUgdXNlZCBtdWx0aXBsZSB0aW1lcykuXCJcbiAgICAgICAgfVxuICAgIClcbiAgICAub3B0aW9uKFwidGFnLXZlcnNpb25cIixcbiAgICAgICAge1xuICAgICAgICAgICAgdHlwZTogXCJib29sZWFuXCIsXG4gICAgICAgICAgICBkZWZhdWx0OiBmYWxzZSxcbiAgICAgICAgICAgIGRlbWFuZE9wdGlvbjogZmFsc2UsXG4gICAgICAgICAgICBkZXNjcmliZTogXCJBcHBseSBhIHRhZyB3aXRoIHRoZSBwcm9qZWN0J3MgdmVyc2lvbiBudW1iZXIgKGZyb20gcGFja2FnZS5qc29uKSB0byB0aGUgcHVibGlzaCBjb21taXRcIlxuICAgICAgICB9XG4gICAgKVxuICAgIC5vcHRpb24oXCJmb3JjZS10YWdzXCIsXG4gICAgICAgIHtcbiAgICAgICAgICAgIHR5cGU6IFwiYm9vbGVhblwiLFxuICAgICAgICAgICAgZGVmYXVsdDogZmFsc2UsXG4gICAgICAgICAgICBkZW1hbmRPcHRpb246IGZhbHNlLFxuICAgICAgICAgICAgZGVzY3JpYmU6IFwiRm9yY2VzIHRhZ3MgdG8gYmUgYXBwbGllZCwgbW92aW5nIGFueSB0aGF0IGFscmVhZHkgZXhpc3RcIlxuICAgICAgICB9XG4gICAgKVxuICAgIC5vcHRpb24oXCJkcnktcnVuXCIsXG4gICAgICAgIHtcbiAgICAgICAgICAgIHR5cGU6IFwiYm9vbGVhblwiLFxuICAgICAgICAgICAgZGVmYXVsdDogZmFsc2UsXG4gICAgICAgICAgICBkZW1hbmRPcHRpb246IGZhbHNlLFxuICAgICAgICAgICAgZGVzY3JpYmU6IFwiUGVyZm9ybSBhbGwgb3BlcmF0aW9ucyBidXQgZG8gbm90IHB1c2ggdG8gb3JpZ2luXCJcbiAgICAgICAgfVxuICAgIClcbiAgICAudmVyc2lvbigpICAvLyB2ZXJzaW9uIHdpbGwgYmUgcmVhZCBmcm9tIHBhY2thZ2UuanNvbiFcbiAgICAud3JhcCg4MClcbiAgICAuYXJndjtcbn1cblxuXG5hc3luYyBmdW5jdGlvbiBnZXRJbnN0YW5jZUNvbmZpZyhhcmd2OiB5YXJncy5Bcmd1bWVudHMpOiBQcm9taXNlPElJbnN0YW5jZUNvbmZpZz5cbntcbiAgICBjb25zdCBkZXZEaXIgPSBuZXcgRGlyZWN0b3J5KFwiLlwiKTtcbiAgICBjb25zdCBkZXZSZXBvID0gYXdhaXQgR2l0UmVwby5mcm9tRGlyZWN0b3J5KGRldkRpcik7XG4gICAgY29uc3QgcGtnID0gYXdhaXQgTm9kZVBhY2thZ2UuZnJvbURpcmVjdG9yeShkZXZEaXIpO1xuXG4gICAgLy8gQnVpbGQgdGhlIGFycmF5IG9mIHRhZ3MgdGhhdCB3aWxsIGJlIGFwcGxpZWQgdG8gdGhlIHB1Ymxpc2ggY29tbWl0LlxuICAgIGxldCB0YWdzOiBBcnJheTxzdHJpbmc+ID0gW10uY29uY2F0KGFyZ3YudGFnIHx8IFtdKTtcbiAgICBpZiAoYXJndltcInRhZy12ZXJzaW9uXCJdKVxuICAgIHtcbiAgICAgICAgdGFncy5wdXNoKGB2JHtwa2cuY29uZmlnLnZlcnNpb259YCk7XG4gICAgfVxuXG4gICAgLy8gTWFrZSBzdXJlIHdlIGhhdmUgYXQgbGVhc3QgMSB0YWcgdG8gYXBwbHkuICBPdGhlcndpc2UgZ2l0IG1pZ2h0IGdhcmJhZ2VcbiAgICAvLyBjb2xsZWN0IHRoZSBwdWJsaXNoIGNvbW1pdCB3ZSBhcmUgYWJvdXQgdG8gY3JlYXRlLlxuICAgIGlmICh0YWdzLmxlbmd0aCA9PT0gMClcbiAgICB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcIkF0IGxlYXN0IG9uZSB0YWcgbXVzdCBiZSBhcHBsaWVkIGJ5IHVzaW5nIGVpdGhlciAtLXRhZy12ZXJzaW9uIG9yIC0tdGFnLlwiKTtcbiAgICB9XG5cbiAgICByZXR1cm4ge1xuICAgICAgICBkcnlSdW46IGFyZ3ZbXCJkcnktcnVuXCJdLFxuICAgICAgICB0YWdzOiB0YWdzLFxuICAgICAgICBkZXZSZXBvOiBkZXZSZXBvLFxuICAgICAgICBwa2c6IHBrZyxcbiAgICAgICAgZm9yY2VUYWdzOiBhcmd2W1wiZm9yY2UtdGFnc1wiXVxuICAgIH07XG59XG5cblxuYXN5bmMgZnVuY3Rpb24gY2hlY2tJbml0aWFsQ29uZGl0aW9ucyhpbnN0YW5jZUNvbmZpZzogSUluc3RhbmNlQ29uZmlnKTogUHJvbWlzZTx2b2lkPlxue1xuICAgIC8vIE1ha2Ugc3VyZSB0aGVyZSBhcmUgbm8gbW9kaWZpZWQgZmlsZXMuXG4gICAgY29uc3QgbW9kaWZpZWRGaWxlcyA9IGF3YWl0IGluc3RhbmNlQ29uZmlnLmRldlJlcG8ubW9kaWZpZWRGaWxlcygpO1xuICAgIGlmIChtb2RpZmllZEZpbGVzLmxlbmd0aCA+IDAgKVxuICAgIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiVGhpcyByZXBvc2l0b3J5IGNvbnRhaW5zIG1vZGlmaWVkIGZpbGVzLlwiKTtcbiAgICB9XG5cbiAgICAvLyBNYWtlIHN1cmUgdGhlcmUgYXJlIG5vIHVudHJhY2tlZCBmaWxlcy5cbiAgICBjb25zdCB1bnRyYWNrZWRGaWxlcyA9IGF3YWl0IGluc3RhbmNlQ29uZmlnLmRldlJlcG8udW50cmFja2VkRmlsZXMoKTtcbiAgICBpZiAodW50cmFja2VkRmlsZXMubGVuZ3RoID4gMCApXG4gICAge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJUaGlzIHJlcG9zaXRvcnkgY29udGFpbnMgdW50cmFja2VkIGZpbGVzLlwiKTtcbiAgICB9XG5cbiAgICAvLyBUaGUgZGV2ZWxvcG1lbnQgcmVwbyBzaG91bGQgYmUgYXQgdGhlIGhlYWQgb2YgYSBHaXQgYnJhbmNoLlxuICAgIGNvbnN0IGRldkJyYW5jaCA9IGF3YWl0IGluc3RhbmNlQ29uZmlnLmRldlJlcG8uZ2V0Q3VycmVudEJyYW5jaCgpO1xuICAgIGlmICghZGV2QnJhbmNoKVxuICAgIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiSEVBRCBkb2VzIG5vdCBjdXJyZW50IHBvaW50IHRvIGEgYnJhbmNoLlwiKTtcbiAgICB9XG5cbiAgICAvLyBUaGUgZGV2ZWxvcG1lbnQgcmVwbyBzaG91bGQgYmUgcHVzaGVkIHRvIG9yaWdpbi5cbiAgICBjb25zdCBkZWx0YXMgPSBhd2FpdCBpbnN0YW5jZUNvbmZpZy5kZXZSZXBvLmdldENvbW1pdERlbHRhcyhcIm9yaWdpblwiKTtcbiAgICBpZiAoKGRlbHRhcy5haGVhZCA+IDApIHx8IChkZWx0YXMuYmVoaW5kID4gMCkpXG4gICAge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYFRoZSBicmFuY2ggaXMgJHtkZWx0YXMuYWhlYWR9IGNvbW1pdHMgYWhlYWQgYW5kICR7ZGVsdGFzLmJlaGluZH0gY29tbWl0cyBiZWhpbmQuYCk7XG4gICAgfVxuXG4gICAgLy8gTWFrZSBzdXJlIHRoZSBkaXJlY3RvcnkgaXMgYSBOb2RlIHBhY2thZ2UuXG4gICAgaWYgKCFpbnN0YW5jZUNvbmZpZy5wa2cuY29uZmlnLnZlcnNpb24pXG4gICAge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJQYWNrYWdlIGRvZXMgbm90IGhhdmUgYSB2ZXJzaW9uLlwiKTtcbiAgICB9XG5cbiAgICAvLyBJZiB3ZSBhcmUgbm90IGZvcmNpbmcgKGkuZS4gbW92aW5nKSB0YWdzLCB0aGVuIG1ha2Ugc3VyZSBub25lIG9mIHRoZSB0YWdzXG4gICAgLy8gd2UgYXJlIGFwcGx5aW5nIGFscmVhZHkgZXhpc3QuXG4gICAgaWYgKCFpbnN0YW5jZUNvbmZpZy5mb3JjZVRhZ3MpXG4gICAge1xuICAgICAgICBjb25zdCBleGlzdGluZ1RhZ3MgPSBhd2FpdCBpbnN0YW5jZUNvbmZpZy5kZXZSZXBvLnRhZ3MoKTtcbiAgICAgICAgY29uc3QgYWxyZWFkeUV4aXN0ID0gXy5pbnRlcnNlY3Rpb24oZXhpc3RpbmdUYWdzLCBpbnN0YW5jZUNvbmZpZy50YWdzKTtcbiAgICAgICAgaWYgKGFscmVhZHlFeGlzdC5sZW5ndGggPiAwKVxuICAgICAgICB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYFRoZSBmb2xsb3dpbmcgdGFncyBhbHJlYWR5IGV4aXN0OiAke2FscmVhZHlFeGlzdC5qb2luKFwiLCBcIil9YCk7XG4gICAgICAgIH1cbiAgICB9XG59XG5cblxuYXN5bmMgZnVuY3Rpb24gbWFpbigpOiBQcm9taXNlPHZvaWQ+XG57XG4gICAgLy8gR2V0IHRoZSBjb21tYW5kIGxpbmUgYXJncyBmaXJzdC4gIElmIHRoZSB1c2VyIGlzIGp1c3QgZG9pbmcgLS1oZWxwLCB3ZVxuICAgIC8vIGRvbid0IHdhbnQgdG8gZG8gYW55dGhpbmcgZWxzZS5cbiAgICBjb25zdCBhcmd2ID0gZ2V0QXJncygpO1xuXG4gICAgZ2xvYmFsQ29uZmlnLmluaXQoKTtcblxuICAgIC8vIFJlc29sdmUgdGhlIGNvbW1hbmQgbGluZSBhcmd1bWVudHMgaW50byBhIGNvbmNyZXRlIGNvbmZpZ3VyYXRpb24gZm9yIHRoaXNcbiAgICAvLyBpbnN0YW5jZS5cbiAgICBjb25zdCBpbnN0YW5jZUNvbmZpZyA9IGF3YWl0IGdldEluc3RhbmNlQ29uZmlnKGFyZ3YpO1xuXG4gICAgLy8gR2l2ZW4gdGhlIGluc3RhbmNlIGNvbmZpZ3VyYXRpb24sIGRldGVybWluZSBpZiBldmVyeXRoaW5nIGlzIGluIGEgdmFsaWRcbiAgICAvLyBzdGF0ZS5cbiAgICBhd2FpdCBjaGVja0luaXRpYWxDb25kaXRpb25zKGluc3RhbmNlQ29uZmlnKTtcblxuICAgIGNvbnN0IGRldkNvbW1pdEhhc2ggPSBhd2FpdCBpbnN0YW5jZUNvbmZpZy5kZXZSZXBvLmN1cnJlbnRDb21taXRIYXNoKCk7XG4gICAgY29uc3QgZGV2QnJhbmNoID0gKGF3YWl0IGluc3RhbmNlQ29uZmlnLmRldlJlcG8uZ2V0Q3VycmVudEJyYW5jaCgpKSE7XG5cbiAgICAvLyBDbGVhciBvdXQgc3BhY2UgZm9yIHRoZSBwdWJsaXNoIHJlcG8uXG4gICAgY29uc3QgcHVibGlzaERpciA9IG5ldyBEaXJlY3RvcnkoZ2xvYmFsQ29uZmlnLnRtcERpciwgaW5zdGFuY2VDb25maWcucGtnLnByb2plY3ROYW1lKTtcbiAgICBwdWJsaXNoRGlyLmRlbGV0ZVN5bmMoKTtcblxuICAgIC8vIENyZWF0ZSBhIGNsb25lIG9mIHRoZSByZXBvIGZvciBwdWJsaXNoaW5nIHB1cnBvc2VzLlxuICAgIGNvbnN0IHJlcG9VcmwgPSBVcmwuZnJvbVN0cmluZyhpbnN0YW5jZUNvbmZpZy5wa2cuY29uZmlnLnJlcG9zaXRvcnkudXJsKTtcbiAgICBpZiAoIXJlcG9VcmwpXG4gICAge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJJbnZhbGlkIHJlcG9zaXRvcnkgVVJMLlwiKTtcbiAgICB9XG4gICAgY29uc29sZS5sb2coYENyZWF0aW5nIHRlbXBvcmFyeSByZXBvIGNsb25lIGF0ICR7cHVibGlzaERpci50b1N0cmluZygpfS4uLmApO1xuICAgIGNvbnN0IHB1Ymxpc2hSZXBvID0gYXdhaXQgR2l0UmVwby5jbG9uZShyZXBvVXJsLCBnbG9iYWxDb25maWcudG1wRGlyKTtcblxuICAgIC8vIENoZWNrb3V0IHRoZSBjb21taXQgdGhlIGRldlJlcG8gaXMgYXQuXG4gICAgY29uc29sZS5sb2coYENoZWNraW5nIG91dCBjdXJyZW50IGRldmVsb3BtZW50IGNvbW1pdCAke2RldkNvbW1pdEhhc2gudG9TaG9ydFN0cmluZygpfS4uLmApO1xuICAgIGF3YWl0IHB1Ymxpc2hSZXBvLmNoZWNrb3V0Q29tbWl0KGRldkNvbW1pdEhhc2gpO1xuXG4gICAgLy8gQ3JlYXRlIGEgdGVtcG9yYXJ5IGJyYW5jaCBvbiB3aGljaCB0aGUgcHVibGlzaGVkIGZpbGVzIHdpbGwgYmUgY29tbWl0dGVkLlxuICAgIGNvbnNvbGUubG9nKFwiQ3JlYXRpbmcgdGVtcG9yYXJ5IGJyYW5jaC4uLlwiKTtcbiAgICBhd2FpdCBjaGVja291dFRlbXBCcmFuY2gocHVibGlzaFJlcG8sIFwicHVibGlzaHRvZ2l0XCIpO1xuXG4gICAgLy8gUmVtb3ZlIGFsbCBmaWxlcyB1bmRlciB2ZXJzaW9uIGNvbnRyb2wgYW5kIHBydW5lIGRpcmVjdG9yaWVzIHRoYXQgYXJlXG4gICAgLy8gZW1wdHkuXG4gICAgY29uc29sZS5sb2coXCJEZWxldGluZyBhbGwgZmlsZXMuLi5cIik7XG4gICAgYXdhaXQgZGVsZXRlVHJhY2tlZEZpbGVzKHB1Ymxpc2hSZXBvKTtcbiAgICBhd2FpdCBwdWJsaXNoUmVwby5kaXJlY3RvcnkucHJ1bmUoKTtcblxuICAgIC8vIFB1Ymxpc2ggdGhlIGRldiByZXBvIHRvIHRoZSBwdWJsaXNoIGRpcmVjdG9yeS5cbiAgICBjb25zb2xlLmxvZyhcIlB1Ymxpc2hpbmcgcGFja2FnZSBjb250ZW50cyB0byBwdWJsaXNoIHJlcG9zaXRvcnkuLi5cIik7XG4gICAgYXdhaXQgaW5zdGFuY2VDb25maWcucGtnLnB1Ymxpc2gocHVibGlzaERpciwgZmFsc2UsIGdsb2JhbENvbmZpZy50bXBEaXIpO1xuXG4gICAgLy8gU3RhZ2UgYW5kIGNvbW1pdCB0aGUgcHVibGlzaGVkIGZpbGVzLlxuICAgIGNvbnNvbGUubG9nKFwiQ29tbWl0aW5nIHB1Ymxpc2hlZCBmaWxlcy4uLlwiKTtcbiAgICBhd2FpdCBwdWJsaXNoUmVwby5zdGFnZUFsbCgpO1xuICAgIGF3YWl0IHB1Ymxpc2hSZXBvLmNvbW1pdChcIlB1Ymxpc2hlZCB1c2luZyBwdWJsaXNoLXRvLWdpdC5cIik7XG5cbiAgICAvLyBUT0RPOiBJZiB0aGUgc291cmNlIHJlcG8gaGFzIGEgQ0hBTkdFTE9HLm1kLCBhZGQgaXRzIGNvbnRlbnRzIGFzIHRoZSBhbm5vdGF0ZWQgdGFnIG1lc3NhZ2UuXG5cbiAgICBjb25zdCBwdWJsaXNoQ29tbWl0SGFzaCA9IGF3YWl0IHB1Ymxpc2hSZXBvLmN1cnJlbnRDb21taXRIYXNoKCk7XG5cbiAgICAvLyBBcHBseSB0YWdzLlxuICAgIGF3YWl0IFByb21pc2UuYWxsKF8ubWFwKGluc3RhbmNlQ29uZmlnLnRhZ3MsIChjdXJUYWdOYW1lKSA9PiB7XG4gICAgICAgIGNvbnNvbGUubG9nKGBDcmVhdGluZyB0YWcgJHtjdXJUYWdOYW1lfS4uLmApO1xuICAgICAgICBjb25zdCB0YWdNZXNzYWdlID1cbiAgICAgICAgICAgIFwiUHVibGlzaGVkIHVzaW5nIHB1Ymxpc2h0b2dpdC5cXG5cIiArXG4gICAgICAgICAgICBgU291cmNlIGJyYW5jaDogJHtkZXZCcmFuY2gubmFtZX1cXG5gICtcbiAgICAgICAgICAgIGBTb3VyY2UgY29tbWl0OiAke2RldkNvbW1pdEhhc2gudG9TdHJpbmcoKX0gWyR7ZGV2Q29tbWl0SGFzaC50b1Nob3J0U3RyaW5nKCl9XWA7XG4gICAgICAgIHJldHVybiBwdWJsaXNoUmVwby5jcmVhdGVUYWcoY3VyVGFnTmFtZSwgdGFnTWVzc2FnZSwgdHJ1ZSk7XG4gICAgfSkpO1xuXG4gICAgLy8gSWYgZG9pbmcgYSBcImRyeSBydW5cIiwgc3RvcC5cbiAgICBpZiAoaW5zdGFuY2VDb25maWcuZHJ5UnVuKVxuICAgIHtcbiAgICAgICAgY29uc3QgbXNnID0gW1xuICAgICAgICAgICAgXCJSdW5uaW5nIGluIGRyeS1ydW4gbW9kZS4gIFRoZSByZXBvc2l0b3J5IGluIHRoZSBmb2xsb3dpbmcgdGVtcG9yYXJ5IGRpcmVjdG9yeVwiLFxuICAgICAgICAgICAgXCJoYXMgYmVlbiBsZWZ0IHJlYWR5IHRvIHB1c2ggdG8gYSBwdWJsaWMgc2VydmVyLlwiLFxuICAgICAgICAgICAgcHVibGlzaFJlcG8uZGlyZWN0b3J5LnRvU3RyaW5nKClcbiAgICAgICAgXTtcbiAgICAgICAgY29uc29sZS5sb2cobXNnLmpvaW4oXCJcXG5cIikpO1xuICAgICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgLy8gUHVzaCBhbGwgdGFncy5cbiAgICBhd2FpdCBQcm9taXNlLmFsbChfLm1hcChpbnN0YW5jZUNvbmZpZy50YWdzLCAoY3VyVGFnTmFtZSkgPT4ge1xuICAgICAgICBjb25zb2xlLmxvZyhgUHVzaGluZyB0YWcgJHtjdXJUYWdOYW1lfSB0byBvcmlnaW4uYCk7XG4gICAgICAgIHJldHVybiBwdWJsaXNoUmVwby5wdXNoVGFnKGN1clRhZ05hbWUsIFwib3JpZ2luXCIsIHRydWUpO1xuICAgIH0pKTtcblxuICAgIC8vIFByaW50IGEgY29tcGxldGlvbiBtZXNzYWdlLlxuICAgIC8vIFRlbGwgdGhlIHVzZXIgaG93IHRvIGluY2x1ZGUgdGhlIHB1Ymxpc2hlZCByZXBvc2l0b3J5IGludG8gYW5vdGhlclxuICAgIC8vIHByb2plY3QncyBkZXBlbmRlbmNpZXMuXG4gICAgY29uc3QgZGVwZW5kZW5jeVVybCA9IHJlcG9VcmwucmVwbGFjZVByb3RvY29sKFwiZ2l0K2h0dHBzXCIpLnRvU3RyaW5nKCk7XG4gICAgY29uc3QgZG9uZU1lc3NhZ2UgPSBbXG4gICAgICAgIFwiRG9uZS5cIixcbiAgICAgICAgXCJUbyBpbmNsdWRlIHRoZSBwdWJsaXNoZWQgbGlicmFyeSBpbiBhIE5vZGUuanMgcHJvamVjdCwgZXhlY3V0ZSB0aGUgZm9sbG93aW5nIGNvbW1hbmQ6XCJcbiAgICBdLmNvbmNhdChfLm1hcChpbnN0YW5jZUNvbmZpZy50YWdzLCAoY3VyVGFnTmFtZSkgPT4ge1xuICAgICAgICByZXR1cm4gYG5wbSBpbnN0YWxsICR7ZGVwZW5kZW5jeVVybH0jJHtjdXJUYWdOYW1lfWA7XG4gICAgfSkpXG4gICAgLmNvbmNhdChgbnBtIGluc3RhbGwgJHtkZXBlbmRlbmN5VXJsfSMke3B1Ymxpc2hDb21taXRIYXNoLnRvU2hvcnRTdHJpbmcoKX1gKTtcbiAgICBjb25zb2xlLmxvZyhkb25lTWVzc2FnZS5qb2luKFwiXFxuXCIpKTtcbn1cblxuXG5hc3luYyBmdW5jdGlvbiBjaGVja291dFRlbXBCcmFuY2gocmVwbzogR2l0UmVwbywgYmFzZU5hbWU6IHN0cmluZyk6IFByb21pc2U8R2l0QnJhbmNoPlxue1xuICAgIGNvbnN0IG5vdyA9IG5ldyBEYXRlKCk7XG4gICAgY29uc3QgZGF0ZXN0YW1wID1cbiAgICAgICAgbm93LmdldEZ1bGxZZWFyKCkgKyBcIl9cIiArIG5vdy5nZXRNb250aCgpICsgXCJfXCIgKyBub3cuZ2V0RGF0ZSgpICsgXCJfXCIgK1xuICAgICAgICBub3cuZ2V0SG91cnMoKSArIFwiX1wiICsgbm93LmdldE1pbnV0ZXMoKSArIFwiX1wiICsgbm93LmdldFNlY29uZHMoKSArIFwiLlwiICsgbm93LmdldE1pbGxpc2Vjb25kcygpO1xuXG4gICAgY29uc3QgdXNlciA9IHVzZXJJbmZvKCk7XG5cbiAgICBjb25zdCB0bXBCcmFuY2hOYW1lID0gYCR7YmFzZU5hbWV9LSR7dXNlci51c2VybmFtZX0tJHtkYXRlc3RhbXB9YDtcbiAgICBjb25zdCB0bXBCcmFuY2ggPSBhd2FpdCBHaXRCcmFuY2guY3JlYXRlKHJlcG8sIHRtcEJyYW5jaE5hbWUpO1xuICAgIGF3YWl0IHJlcG8uY2hlY2tvdXRCcmFuY2godG1wQnJhbmNoLCB0cnVlKTtcbiAgICByZXR1cm4gdG1wQnJhbmNoO1xufVxuXG5cbi8qKlxuICogRGVsZXRlcyBhbGwgdHJhY2tlZCBmaWxlcyB3aXRoaW4gYSByZXBvLlxuICogQHBhcmFtIHJlcG8gLSBUaGUgcmVwbyB0byBjbGVhclxuICogQHJldHVybiBBIFByb21pc2UgdGhhdCBpcyByZXNvbHZlZCB3aGVuIGFsbCBmaWxlcyBoYXZlIGJlZW4gZGVsZXRlZC5cbiAqL1xuYXN5bmMgZnVuY3Rpb24gZGVsZXRlVHJhY2tlZEZpbGVzKHJlcG86IEdpdFJlcG8pOiBQcm9taXNlPHZvaWQ+XG57XG4gICAgY29uc3QgZmlsZXMgPSBhd2FpdCByZXBvLmZpbGVzKCk7XG4gICAgY29uc3QgZGVsZXRlUHJvbWlzZXMgPSBfLm1hcChmaWxlcywgKGN1ckZpbGUpID0+IHtcbiAgICAgICAgcmV0dXJuIGN1ckZpbGUuZGVsZXRlKCk7XG4gICAgfSk7XG5cbiAgICBhd2FpdCBQcm9taXNlLmFsbChkZWxldGVQcm9taXNlcyk7XG59XG5cblxubWFpbigpXG4uY2F0Y2goKGVycikgPT4ge1xuICAgIGNvbnNvbGUubG9nKEpTT04uc3RyaW5naWZ5KGVyciwgdW5kZWZpbmVkLCA0KSk7XG4gICAgdGhyb3cgZXJyO1xufSk7XG4iXX0=
