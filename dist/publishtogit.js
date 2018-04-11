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
var oofs_1 = require("oofs");
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
                    devDir = new oofs_1.Directory(".");
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
                    publishDir = new oofs_1.Directory(publishToGitConfig_1.config.tmpDir, instanceConfig.pkg.projectName);
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
                    return [4 /*yield*/, instanceConfig.pkg.publish(publishDir, false)];
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

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9wdWJsaXNodG9naXQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFFQSwwQkFBNEI7QUFDNUIsMkRBQTREO0FBQzVELDZCQUErQjtBQUMvQixxQ0FBa0M7QUFDbEMsNkNBQTBDO0FBQzFDLDZCQUErQjtBQUMvQiw2QkFBMEI7QUFDMUIseUNBQXNDO0FBQ3RDLHlCQUE0QjtBQWlCNUIsZ0ZBQWdGO0FBQ2hGLG1CQUFtQjtBQUNuQixnRkFBZ0Y7QUFFaEY7SUFFSSxNQUFNLENBQUMsS0FBSztTQUNYLEtBQUssQ0FBQyw0REFBNEQsQ0FBQztTQUNuRSxJQUFJLEVBQUU7U0FDTixNQUFNLENBQUMsS0FBSyxFQUNUO1FBQ0ksWUFBWSxFQUFFLEtBQUs7UUFDbkIsUUFBUSxFQUFFLDZFQUE2RTtLQUMxRixDQUNKO1NBQ0EsTUFBTSxDQUFDLGFBQWEsRUFDakI7UUFDSSxJQUFJLEVBQUUsU0FBUztRQUNmLE9BQU8sRUFBRSxLQUFLO1FBQ2QsWUFBWSxFQUFFLEtBQUs7UUFDbkIsUUFBUSxFQUFFLHlGQUF5RjtLQUN0RyxDQUNKO1NBQ0EsTUFBTSxDQUFDLFlBQVksRUFDaEI7UUFDSSxJQUFJLEVBQUUsU0FBUztRQUNmLE9BQU8sRUFBRSxLQUFLO1FBQ2QsWUFBWSxFQUFFLEtBQUs7UUFDbkIsUUFBUSxFQUFFLDBEQUEwRDtLQUN2RSxDQUNKO1NBQ0EsTUFBTSxDQUFDLFNBQVMsRUFDYjtRQUNJLElBQUksRUFBRSxTQUFTO1FBQ2YsT0FBTyxFQUFFLEtBQUs7UUFDZCxZQUFZLEVBQUUsS0FBSztRQUNuQixRQUFRLEVBQUUsa0RBQWtEO0tBQy9ELENBQ0o7U0FDQSxPQUFPLEVBQUUsQ0FBRSwwQ0FBMEM7U0FDckQsSUFBSSxDQUFDLEVBQUUsQ0FBQztTQUNSLElBQUksQ0FBQztBQUNWLENBQUM7QUFHRCwyQkFBaUMsSUFBcUI7Ozs7OztvQkFFNUMsTUFBTSxHQUFHLElBQUksZ0JB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RyxDQUFDLFVBQVUsRUFBRSxHQUFHLEdBQUcsR0FBRyxHQUFHLENBQUMsZUFBZSxFQUFFLENBQUM7b0JBRTdGLElBQUksR0FBRyxhQUFRLEVBQUUsQ0FBQztvQkFFbEIsYUFBYSxHQUFNLFFBQVEsU0FBSSxJQUFJLENBQUMsUUFBUSxTQUFJLFNBQVcsQ0FBQztvQkFDaEQscUJBQU0scUJBQVMsQ0FBQyxNQUFNLENBQUMsSUFBSSxFQUFFLGFBQWEsQ0FBQyxFQUFBOztvQkFBdkQsU0FBUyxHQUFHLFNBQTJDO29CQUM3RCxxQkFBTSxJQUFJLENBQUMsY0FBYyxDQUFDLFNBQVMsRUFBRSxJQUFJLENBQUMsRUFBQTs7b0JBQTFDLFNBQTBDLENBQUM7b0JBQzNDLHNCQUFPLFNBQVMsRUFBQzs7OztDQUNwQjtBQUdEOzs7O0dBSUc7QUFDSCw0QkFBa0MsSUFBYTs7Ozs7d0JBRTdCLHFCQUFNLElBQUksQ0FBQyxLQUFLLEVBQUUsRUFBQTs7b0JBQTFCLEtBQUssR0FBRyxTQUFrQjtvQkFDMUIsY0FBYyxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsS0FBSyxFQUFFLFVBQUMsT0FBTzt3QkFDeEMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxNQUFNLEVBQUUsQ0FBQztvQkFDNUIsQ0FBQyxDQUFDLENBQUM7b0JBRUgscUJBQU0sT0FBTyxDQUFDLEdBQUcsQ0FBQyxjQUFjLENBQUMsRUFBQTs7b0JBQWpDLFNBQWlDLENBQUM7Ozs7O0NBQ3JDO0FBR0QsSUFBSSxFQUFFO0tBQ0wsS0FBSyxDQUFDLFVBQUMsR0FBRztJQUNQLE9BQU8sQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxHQUFHLEVBQUUsU0FBUyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDL0MsTUFBTSxHQUFHLENBQUM7QUFDZCxDQUFDLENBQUMsQ0FBQyIsImZpbGUiOiJwdWJsaXNodG9naXQuanMiLCJzb3VyY2VzQ29udGVudCI6WyIjIS91c3IvYmluL2VudiBub2RlXG5cbmltcG9ydCAqIGFzIF8gZnJvbSBcImxvZGFzaFwiO1xuaW1wb3J0IHtjb25maWcgYXMgZ2xvYmFsQ29uZmlnfSBmcm9tIFwiLi9wdWJsaXNoVG9HaXRDb25maWdcIjtcbmltcG9ydCB7RGlyZWN0b3J5fSBmcm9tIFwib29mc1wiO1xuaW1wb3J0IHtHaXRSZXBvfSBmcm9tIFwiLi9naXRSZXBvXCI7XG5pbXBvcnQge05vZGVQYWNrYWdlfSBmcm9tIFwiLi9ub2RlUGFja2FnZVwiO1xuaW1wb3J0ICogYXMgeWFyZ3MgZnJvbSBcInlhcmdzXCI7XG5pbXBvcnQge1VybH0gZnJvbSBcIi4vdXJsXCI7XG5pbXBvcnQge0dpdEJyYW5jaH0gZnJvbSBcIi4vZ2l0QnJhbmNoXCI7XG5pbXBvcnQge3VzZXJJbmZvfSBmcm9tIFwib3NcIjtcblxuXG4vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gVHlwZXNcbi8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG5cbmludGVyZmFjZSBJSW5zdGFuY2VDb25maWdcbntcbiAgICBkZXZSZXBvOiBHaXRSZXBvO1xuICAgIHBrZzogTm9kZVBhY2thZ2U7XG4gICAgZHJ5UnVuOiBib29sZWFuO1xuICAgIHRhZ3M6IEFycmF5PHN0cmluZz47XG4gICAgZm9yY2VUYWdzOiBib29sZWFuO1xufVxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBIZWxwZXIgRnVuY3Rpb25zXG4vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuXG5mdW5jdGlvbiBnZXRBcmdzKCk6IHlhcmdzLkFyZ3VtZW50c1xue1xuICAgIHJldHVybiB5YXJnc1xuICAgIC51c2FnZShcIlB1Ymxpc2hlcyBhIE5vZGUuanMgcGFja2FnZSB0byBhIHByb2plY3QncyBHaXQgcmVwb3NpdG9yeS5cIilcbiAgICAuaGVscCgpXG4gICAgLm9wdGlvbihcInRhZ1wiLFxuICAgICAgICB7XG4gICAgICAgICAgICBkZW1hbmRPcHRpb246IGZhbHNlLFxuICAgICAgICAgICAgZGVzY3JpYmU6IFwiQXBwbHkgdGhlIHNwZWNpZmllZCB0YWcgdG8gdGhlIHB1Ymxpc2ggY29tbWl0IChjYW4gYmUgdXNlZCBtdWx0aXBsZSB0aW1lcykuXCJcbiAgICAgICAgfVxuICAgIClcbiAgICAub3B0aW9uKFwidGFnLXZlcnNpb25cIixcbiAgICAgICAge1xuICAgICAgICAgICAgdHlwZTogXCJib29sZWFuXCIsXG4gICAgICAgICAgICBkZWZhdWx0OiBmYWxzZSxcbiAgICAgICAgICAgIGRlbWFuZE9wdGlvbjogZmFsc2UsXG4gICAgICAgICAgICBkZXNjcmliZTogXCJBcHBseSBhIHRhZyB3aXRoIHRoZSBwcm9qZWN0J3MgdmVyc2lvbiBudW1iZXIgKGZyb20gcGFja2FnZS5qc29uKSB0byB0aGUgcHVibGlzaCBjb21taXRcIlxuICAgICAgICB9XG4gICAgKVxuICAgIC5vcHRpb24oXCJmb3JjZS10YWdzXCIsXG4gICAgICAgIHtcbiAgICAgICAgICAgIHR5cGU6IFwiYm9vbGVhblwiLFxuICAgICAgICAgICAgZGVmYXVsdDogZmFsc2UsXG4gICAgICAgICAgICBkZW1hbmRPcHRpb246IGZhbHNlLFxuICAgICAgICAgICAgZGVzY3JpYmU6IFwiRm9yY2VzIHRhZ3MgdG8gYmUgYXBwbGllZCwgbW92aW5nIGFueSB0aGF0IGFscmVhZHkgZXhpc3RcIlxuICAgICAgICB9XG4gICAgKVxuICAgIC5vcHRpb24oXCJkcnktcnVuXCIsXG4gICAgICAgIHtcbiAgICAgICAgICAgIHR5cGU6IFwiYm9vbGVhblwiLFxuICAgICAgICAgICAgZGVmYXVsdDogZmFsc2UsXG4gICAgICAgICAgICBkZW1hbmRPcHRpb246IGZhbHNlLFxuICAgICAgICAgICAgZGVzY3JpYmU6IFwiUGVyZm9ybSBhbGwgb3BlcmF0aW9ucyBidXQgZG8gbm90IHB1c2ggdG8gb3JpZ2luXCJcbiAgICAgICAgfVxuICAgIClcbiAgICAudmVyc2lvbigpICAvLyB2ZXJzaW9uIHdpbGwgYmUgcmVhZCBmcm9tIHBhY2thZ2UuanNvbiFcbiAgICAud3JhcCg4MClcbiAgICAuYXJndjtcbn1cblxuXG5hc3luYyBmdW5jdGlvbiBnZXRJbnN0YW5jZUNvbmZpZyhhcmd2OiB5YXJncy5Bcmd1bWVudHMpOiBQcm9taXNlPElJbnN0YW5jZUNvbmZpZz5cbntcbiAgICBjb25zdCBkZXZEaXIgPSBuZXcgRGlyZWN0b3J5KFwiLlwiKTtcbiAgICBjb25zdCBkZXZSZXBvID0gYXdhaXQgR2l0UmVwby5mcm9tRGlyZWN0b3J5KGRldkRpcik7XG4gICAgY29uc3QgcGtnID0gYXdhaXQgTm9kZVBhY2thZ2UuZnJvbURpcmVjdG9yeShkZXZEaXIpO1xuXG4gICAgLy8gQnVpbGQgdGhlIGFycmF5IG9mIHRhZ3MgdGhhdCB3aWxsIGJlIGFwcGxpZWQgdG8gdGhlIHB1Ymxpc2ggY29tbWl0LlxuICAgIGxldCB0YWdzOiBBcnJheTxzdHJpbmc+ID0gW10uY29uY2F0KGFyZ3YudGFnIHx8IFtdKTtcbiAgICBpZiAoYXJndltcInRhZy12ZXJzaW9uXCJdKVxuICAgIHtcbiAgICAgICAgdGFncy5wdXNoKGB2JHtwa2cuY29uZmlnLnZlcnNpb259YCk7XG4gICAgfVxuXG4gICAgLy8gTWFrZSBzdXJlIHdlIGhhdmUgYXQgbGVhc3QgMSB0YWcgdG8gYXBwbHkuICBPdGhlcndpc2UgZ2l0IG1pZ2h0IGdhcmJhZ2VcbiAgICAvLyBjb2xsZWN0IHRoZSBwdWJsaXNoIGNvbW1pdCB3ZSBhcmUgYWJvdXQgdG8gY3JlYXRlLlxuICAgIGlmICh0YWdzLmxlbmd0aCA9PT0gMClcbiAgICB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcIkF0IGxlYXN0IG9uZSB0YWcgbXVzdCBiZSBhcHBsaWVkIGJ5IHVzaW5nIGVpdGhlciAtLXRhZy12ZXJzaW9uIG9yIC0tdGFnLlwiKTtcbiAgICB9XG5cbiAgICByZXR1cm4ge1xuICAgICAgICBkcnlSdW46IGFyZ3ZbXCJkcnktcnVuXCJdLFxuICAgICAgICB0YWdzOiB0YWdzLFxuICAgICAgICBkZXZSZXBvOiBkZXZSZXBvLFxuICAgICAgICBwa2c6IHBrZyxcbiAgICAgICAgZm9yY2VUYWdzOiBhcmd2W1wiZm9yY2UtdGFnc1wiXVxuICAgIH07XG59XG5cblxuYXN5bmMgZnVuY3Rpb24gY2hlY2tJbml0aWFsQ29uZGl0aW9ucyhpbnN0YW5jZUNvbmZpZzogSUluc3RhbmNlQ29uZmlnKTogUHJvbWlzZTx2b2lkPlxue1xuICAgIC8vIE1ha2Ugc3VyZSB0aGVyZSBhcmUgbm8gbW9kaWZpZWQgZmlsZXMuXG4gICAgY29uc3QgbW9kaWZpZWRGaWxlcyA9IGF3YWl0IGluc3RhbmNlQ29uZmlnLmRldlJlcG8ubW9kaWZpZWRGaWxlcygpO1xuICAgIGlmIChtb2RpZmllZEZpbGVzLmxlbmd0aCA+IDAgKVxuICAgIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiVGhpcyByZXBvc2l0b3J5IGNvbnRhaW5zIG1vZGlmaWVkIGZpbGVzLlwiKTtcbiAgICB9XG5cbiAgICAvLyBNYWtlIHN1cmUgdGhlcmUgYXJlIG5vIHVudHJhY2tlZCBmaWxlcy5cbiAgICBjb25zdCB1bnRyYWNrZWRGaWxlcyA9IGF3YWl0IGluc3RhbmNlQ29uZmlnLmRldlJlcG8udW50cmFja2VkRmlsZXMoKTtcbiAgICBpZiAodW50cmFja2VkRmlsZXMubGVuZ3RoID4gMCApXG4gICAge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJUaGlzIHJlcG9zaXRvcnkgY29udGFpbnMgdW50cmFja2VkIGZpbGVzLlwiKTtcbiAgICB9XG5cbiAgICAvLyBUaGUgZGV2ZWxvcG1lbnQgcmVwbyBzaG91bGQgYmUgYXQgdGhlIGhlYWQgb2YgYSBHaXQgYnJhbmNoLlxuICAgIGNvbnN0IGRldkJyYW5jaCA9IGF3YWl0IGluc3RhbmNlQ29uZmlnLmRldlJlcG8uZ2V0Q3VycmVudEJyYW5jaCgpO1xuICAgIGlmICghZGV2QnJhbmNoKVxuICAgIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiSEVBRCBkb2VzIG5vdCBjdXJyZW50IHBvaW50IHRvIGEgYnJhbmNoLlwiKTtcbiAgICB9XG5cbiAgICAvLyBUaGUgZGV2ZWxvcG1lbnQgcmVwbyBzaG91bGQgYmUgcHVzaGVkIHRvIG9yaWdpbi5cbiAgICBjb25zdCBkZWx0YXMgPSBhd2FpdCBpbnN0YW5jZUNvbmZpZy5kZXZSZXBvLmdldENvbW1pdERlbHRhcyhcIm9yaWdpblwiKTtcbiAgICBpZiAoKGRlbHRhcy5haGVhZCA+IDApIHx8IChkZWx0YXMuYmVoaW5kID4gMCkpXG4gICAge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYFRoZSBicmFuY2ggaXMgJHtkZWx0YXMuYWhlYWR9IGNvbW1pdHMgYWhlYWQgYW5kICR7ZGVsdGFzLmJlaGluZH0gY29tbWl0cyBiZWhpbmQuYCk7XG4gICAgfVxuXG4gICAgLy8gTWFrZSBzdXJlIHRoZSBkaXJlY3RvcnkgaXMgYSBOb2RlIHBhY2thZ2UuXG4gICAgaWYgKCFpbnN0YW5jZUNvbmZpZy5wa2cuY29uZmlnLnZlcnNpb24pXG4gICAge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJQYWNrYWdlIGRvZXMgbm90IGhhdmUgYSB2ZXJzaW9uLlwiKTtcbiAgICB9XG5cbiAgICAvLyBJZiB3ZSBhcmUgbm90IGZvcmNpbmcgKGkuZS4gbW92aW5nKSB0YWdzLCB0aGVuIG1ha2Ugc3VyZSBub25lIG9mIHRoZSB0YWdzXG4gICAgLy8gd2UgYXJlIGFwcGx5aW5nIGFscmVhZHkgZXhpc3QuXG4gICAgaWYgKCFpbnN0YW5jZUNvbmZpZy5mb3JjZVRhZ3MpXG4gICAge1xuICAgICAgICBjb25zdCBleGlzdGluZ1RhZ3MgPSBhd2FpdCBpbnN0YW5jZUNvbmZpZy5kZXZSZXBvLnRhZ3MoKTtcbiAgICAgICAgY29uc3QgYWxyZWFkeUV4aXN0ID0gXy5pbnRlcnNlY3Rpb24oZXhpc3RpbmdUYWdzLCBpbnN0YW5jZUNvbmZpZy50YWdzKTtcbiAgICAgICAgaWYgKGFscmVhZHlFeGlzdC5sZW5ndGggPiAwKVxuICAgICAgICB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYFRoZSBmb2xsb3dpbmcgdGFncyBhbHJlYWR5IGV4aXN0OiAke2FscmVhZHlFeGlzdC5qb2luKFwiLCBcIil9YCk7XG4gICAgICAgIH1cbiAgICB9XG59XG5cblxuYXN5bmMgZnVuY3Rpb24gbWFpbigpOiBQcm9taXNlPHZvaWQ+XG57XG4gICAgLy8gR2V0IHRoZSBjb21tYW5kIGxpbmUgYXJncyBmaXJzdC4gIElmIHRoZSB1c2VyIGlzIGp1c3QgZG9pbmcgLS1oZWxwLCB3ZVxuICAgIC8vIGRvbid0IHdhbnQgdG8gZG8gYW55dGhpbmcgZWxzZS5cbiAgICBjb25zdCBhcmd2ID0gZ2V0QXJncygpO1xuXG4gICAgZ2xvYmFsQ29uZmlnLmluaXQoKTtcblxuICAgIC8vIFJlc29sdmUgdGhlIGNvbW1hbmQgbGluZSBhcmd1bWVudHMgaW50byBhIGNvbmNyZXRlIGNvbmZpZ3VyYXRpb24gZm9yIHRoaXNcbiAgICAvLyBpbnN0YW5jZS5cbiAgICBjb25zdCBpbnN0YW5jZUNvbmZpZyA9IGF3YWl0IGdldEluc3RhbmNlQ29uZmlnKGFyZ3YpO1xuXG4gICAgLy8gR2l2ZW4gdGhlIGluc3RhbmNlIGNvbmZpZ3VyYXRpb24sIGRldGVybWluZSBpZiBldmVyeXRoaW5nIGlzIGluIGEgdmFsaWRcbiAgICAvLyBzdGF0ZS5cbiAgICBhd2FpdCBjaGVja0luaXRpYWxDb25kaXRpb25zKGluc3RhbmNlQ29uZmlnKTtcblxuICAgIGNvbnN0IGRldkNvbW1pdEhhc2ggPSBhd2FpdCBpbnN0YW5jZUNvbmZpZy5kZXZSZXBvLmN1cnJlbnRDb21taXRIYXNoKCk7XG4gICAgY29uc3QgZGV2QnJhbmNoID0gKGF3YWl0IGluc3RhbmNlQ29uZmlnLmRldlJlcG8uZ2V0Q3VycmVudEJyYW5jaCgpKSE7XG5cbiAgICAvLyBDbGVhciBvdXQgc3BhY2UgZm9yIHRoZSBwdWJsaXNoIHJlcG8uXG4gICAgY29uc3QgcHVibGlzaERpciA9IG5ldyBEaXJlY3RvcnkoZ2xvYmFsQ29uZmlnLnRtcERpciwgaW5zdGFuY2VDb25maWcucGtnLnByb2plY3ROYW1lKTtcbiAgICBwdWJsaXNoRGlyLmRlbGV0ZVN5bmMoKTtcblxuICAgIC8vIENyZWF0ZSBhIGNsb25lIG9mIHRoZSByZXBvIGZvciBwdWJsaXNoaW5nIHB1cnBvc2VzLlxuICAgIGNvbnN0IHJlcG9VcmwgPSBVcmwuZnJvbVN0cmluZyhpbnN0YW5jZUNvbmZpZy5wa2cuY29uZmlnLnJlcG9zaXRvcnkudXJsKTtcbiAgICBpZiAoIXJlcG9VcmwpXG4gICAge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJJbnZhbGlkIHJlcG9zaXRvcnkgVVJMLlwiKTtcbiAgICB9XG4gICAgY29uc29sZS5sb2coYENyZWF0aW5nIHRlbXBvcmFyeSByZXBvIGNsb25lIGF0ICR7cHVibGlzaERpci50b1N0cmluZygpfS4uLmApO1xuICAgIGNvbnN0IHB1Ymxpc2hSZXBvID0gYXdhaXQgR2l0UmVwby5jbG9uZShyZXBvVXJsLCBnbG9iYWxDb25maWcudG1wRGlyKTtcblxuICAgIC8vIENoZWNrb3V0IHRoZSBjb21taXQgdGhlIGRldlJlcG8gaXMgYXQuXG4gICAgY29uc29sZS5sb2coYENoZWNraW5nIG91dCBjdXJyZW50IGRldmVsb3BtZW50IGNvbW1pdCAke2RldkNvbW1pdEhhc2gudG9TaG9ydFN0cmluZygpfS4uLmApO1xuICAgIGF3YWl0IHB1Ymxpc2hSZXBvLmNoZWNrb3V0Q29tbWl0KGRldkNvbW1pdEhhc2gpO1xuXG4gICAgLy8gQ3JlYXRlIGEgdGVtcG9yYXJ5IGJyYW5jaCBvbiB3aGljaCB0aGUgcHVibGlzaGVkIGZpbGVzIHdpbGwgYmUgY29tbWl0dGVkLlxuICAgIGNvbnNvbGUubG9nKFwiQ3JlYXRpbmcgdGVtcG9yYXJ5IGJyYW5jaC4uLlwiKTtcbiAgICBhd2FpdCBjaGVja291dFRlbXBCcmFuY2gocHVibGlzaFJlcG8sIFwicHVibGlzaHRvZ2l0XCIpO1xuXG4gICAgLy8gUmVtb3ZlIGFsbCBmaWxlcyB1bmRlciB2ZXJzaW9uIGNvbnRyb2wgYW5kIHBydW5lIGRpcmVjdG9yaWVzIHRoYXQgYXJlXG4gICAgLy8gZW1wdHkuXG4gICAgY29uc29sZS5sb2coXCJEZWxldGluZyBhbGwgZmlsZXMuLi5cIik7XG4gICAgYXdhaXQgZGVsZXRlVHJhY2tlZEZpbGVzKHB1Ymxpc2hSZXBvKTtcbiAgICBhd2FpdCBwdWJsaXNoUmVwby5kaXJlY3RvcnkucHJ1bmUoKTtcblxuICAgIC8vIFB1Ymxpc2ggdGhlIGRldiByZXBvIHRvIHRoZSBwdWJsaXNoIGRpcmVjdG9yeS5cbiAgICBjb25zb2xlLmxvZyhcIlB1Ymxpc2hpbmcgcGFja2FnZSBjb250ZW50cyB0byBwdWJsaXNoIHJlcG9zaXRvcnkuLi5cIik7XG4gICAgYXdhaXQgaW5zdGFuY2VDb25maWcucGtnLnB1Ymxpc2gocHVibGlzaERpciwgZmFsc2UpO1xuXG4gICAgLy8gU3RhZ2UgYW5kIGNvbW1pdCB0aGUgcHVibGlzaGVkIGZpbGVzLlxuICAgIGNvbnNvbGUubG9nKFwiQ29tbWl0aW5nIHB1Ymxpc2hlZCBmaWxlcy4uLlwiKTtcbiAgICBhd2FpdCBwdWJsaXNoUmVwby5zdGFnZUFsbCgpO1xuICAgIGF3YWl0IHB1Ymxpc2hSZXBvLmNvbW1pdChcIlB1Ymxpc2hlZCB1c2luZyBwdWJsaXNoLXRvLWdpdC5cIik7XG5cbiAgICAvLyBUT0RPOiBJZiB0aGUgc291cmNlIHJlcG8gaGFzIGEgQ0hBTkdFTE9HLm1kLCBhZGQgaXRzIGNvbnRlbnRzIGFzIHRoZSBhbm5vdGF0ZWQgdGFnIG1lc3NhZ2UuXG5cbiAgICBjb25zdCBwdWJsaXNoQ29tbWl0SGFzaCA9IGF3YWl0IHB1Ymxpc2hSZXBvLmN1cnJlbnRDb21taXRIYXNoKCk7XG5cbiAgICAvLyBBcHBseSB0YWdzLlxuICAgIGF3YWl0IFByb21pc2UuYWxsKF8ubWFwKGluc3RhbmNlQ29uZmlnLnRhZ3MsIChjdXJUYWdOYW1lKSA9PiB7XG4gICAgICAgIGNvbnNvbGUubG9nKGBDcmVhdGluZyB0YWcgJHtjdXJUYWdOYW1lfS4uLmApO1xuICAgICAgICBjb25zdCB0YWdNZXNzYWdlID1cbiAgICAgICAgICAgIFwiUHVibGlzaGVkIHVzaW5nIHB1Ymxpc2h0b2dpdC5cXG5cIiArXG4gICAgICAgICAgICBgU291cmNlIGJyYW5jaDogJHtkZXZCcmFuY2gubmFtZX1cXG5gICtcbiAgICAgICAgICAgIGBTb3VyY2UgY29tbWl0OiAke2RldkNvbW1pdEhhc2gudG9TdHJpbmcoKX0gWyR7ZGV2Q29tbWl0SGFzaC50b1Nob3J0U3RyaW5nKCl9XWA7XG4gICAgICAgIHJldHVybiBwdWJsaXNoUmVwby5jcmVhdGVUYWcoY3VyVGFnTmFtZSwgdGFnTWVzc2FnZSwgdHJ1ZSk7XG4gICAgfSkpO1xuXG4gICAgLy8gSWYgZG9pbmcgYSBcImRyeSBydW5cIiwgc3RvcC5cbiAgICBpZiAoaW5zdGFuY2VDb25maWcuZHJ5UnVuKVxuICAgIHtcbiAgICAgICAgY29uc3QgbXNnID0gW1xuICAgICAgICAgICAgXCJSdW5uaW5nIGluIGRyeS1ydW4gbW9kZS4gIFRoZSByZXBvc2l0b3J5IGluIHRoZSBmb2xsb3dpbmcgdGVtcG9yYXJ5IGRpcmVjdG9yeVwiLFxuICAgICAgICAgICAgXCJoYXMgYmVlbiBsZWZ0IHJlYWR5IHRvIHB1c2ggdG8gYSBwdWJsaWMgc2VydmVyLlwiLFxuICAgICAgICAgICAgcHVibGlzaFJlcG8uZGlyZWN0b3J5LnRvU3RyaW5nKClcbiAgICAgICAgXTtcbiAgICAgICAgY29uc29sZS5sb2cobXNnLmpvaW4oXCJcXG5cIikpO1xuICAgICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgLy8gUHVzaCBhbGwgdGFncy5cbiAgICBhd2FpdCBQcm9taXNlLmFsbChfLm1hcChpbnN0YW5jZUNvbmZpZy50YWdzLCAoY3VyVGFnTmFtZSkgPT4ge1xuICAgICAgICBjb25zb2xlLmxvZyhgUHVzaGluZyB0YWcgJHtjdXJUYWdOYW1lfSB0byBvcmlnaW4uYCk7XG4gICAgICAgIHJldHVybiBwdWJsaXNoUmVwby5wdXNoVGFnKGN1clRhZ05hbWUsIFwib3JpZ2luXCIsIHRydWUpO1xuICAgIH0pKTtcblxuICAgIC8vIFByaW50IGEgY29tcGxldGlvbiBtZXNzYWdlLlxuICAgIC8vIFRlbGwgdGhlIHVzZXIgaG93IHRvIGluY2x1ZGUgdGhlIHB1Ymxpc2hlZCByZXBvc2l0b3J5IGludG8gYW5vdGhlclxuICAgIC8vIHByb2plY3QncyBkZXBlbmRlbmNpZXMuXG4gICAgY29uc3QgZGVwZW5kZW5jeVVybCA9IHJlcG9VcmwucmVwbGFjZVByb3RvY29sKFwiZ2l0K2h0dHBzXCIpLnRvU3RyaW5nKCk7XG4gICAgY29uc3QgZG9uZU1lc3NhZ2UgPSBbXG4gICAgICAgIFwiRG9uZS5cIixcbiAgICAgICAgXCJUbyBpbmNsdWRlIHRoZSBwdWJsaXNoZWQgbGlicmFyeSBpbiBhIE5vZGUuanMgcHJvamVjdCwgZXhlY3V0ZSB0aGUgZm9sbG93aW5nIGNvbW1hbmQ6XCJcbiAgICBdLmNvbmNhdChfLm1hcChpbnN0YW5jZUNvbmZpZy50YWdzLCAoY3VyVGFnTmFtZSkgPT4ge1xuICAgICAgICByZXR1cm4gYG5wbSBpbnN0YWxsICR7ZGVwZW5kZW5jeVVybH0jJHtjdXJUYWdOYW1lfWA7XG4gICAgfSkpXG4gICAgLmNvbmNhdChgbnBtIGluc3RhbGwgJHtkZXBlbmRlbmN5VXJsfSMke3B1Ymxpc2hDb21taXRIYXNoLnRvU2hvcnRTdHJpbmcoKX1gKTtcbiAgICBjb25zb2xlLmxvZyhkb25lTWVzc2FnZS5qb2luKFwiXFxuXCIpKTtcbn1cblxuXG5hc3luYyBmdW5jdGlvbiBjaGVja291dFRlbXBCcmFuY2gocmVwbzogR2l0UmVwbywgYmFzZU5hbWU6IHN0cmluZyk6IFByb21pc2U8R2l0QnJhbmNoPlxue1xuICAgIGNvbnN0IG5vdyA9IG5ldyBEYXRlKCk7XG4gICAgY29uc3QgZGF0ZXN0YW1wID1cbiAgICAgICAgbm93LmdldEZ1bGxZZWFyKCkgKyBcIl9cIiArIG5vdy5nZXRNb250aCgpICsgXCJfXCIgKyBub3cuZ2V0RGF0ZSgpICsgXCJfXCIgK1xuICAgICAgICBub3cuZ2V0SG91cnMoKSArIFwiX1wiICsgbm93LmdldE1pbnV0ZXMoKSArIFwiX1wiICsgbm93LmdldFNlY29uZHMoKSArIFwiLlwiICsgbm93LmdldE1pbGxpc2Vjb25kcygpO1xuXG4gICAgY29uc3QgdXNlciA9IHVzZXJJbmZvKCk7XG5cbiAgICBjb25zdCB0bXBCcmFuY2hOYW1lID0gYCR7YmFzZU5hbWV9LSR7dXNlci51c2VybmFtZX0tJHtkYXRlc3RhbXB9YDtcbiAgICBjb25zdCB0bXBCcmFuY2ggPSBhd2FpdCBHaXRCcmFuY2guY3JlYXRlKHJlcG8sIHRtcEJyYW5jaE5hbWUpO1xuICAgIGF3YWl0IHJlcG8uY2hlY2tvdXRCcmFuY2godG1wQnJhbmNoLCB0cnVlKTtcbiAgICByZXR1cm4gdG1wQnJhbmNoO1xufVxuXG5cbi8qKlxuICogRGVsZXRlcyBhbGwgdHJhY2tlZCBmaWxlcyB3aXRoaW4gYSByZXBvLlxuICogQHBhcmFtIHJlcG8gLSBUaGUgcmVwbyB0byBjbGVhclxuICogQHJldHVybiBBIFByb21pc2UgdGhhdCBpcyByZXNvbHZlZCB3aGVuIGFsbCBmaWxlcyBoYXZlIGJlZW4gZGVsZXRlZC5cbiAqL1xuYXN5bmMgZnVuY3Rpb24gZGVsZXRlVHJhY2tlZEZpbGVzKHJlcG86IEdpdFJlcG8pOiBQcm9taXNlPHZvaWQ+XG57XG4gICAgY29uc3QgZmlsZXMgPSBhd2FpdCByZXBvLmZpbGVzKCk7XG4gICAgY29uc3QgZGVsZXRlUHJvbWlzZXMgPSBfLm1hcChmaWxlcywgKGN1ckZpbGUpID0+IHtcbiAgICAgICAgcmV0dXJuIGN1ckZpbGUuZGVsZXRlKCk7XG4gICAgfSk7XG5cbiAgICBhd2FpdCBQcm9taXNlLmFsbChkZWxldGVQcm9taXNlcyk7XG59XG5cblxubWFpbigpXG4uY2F0Y2goKGVycikgPT4ge1xuICAgIGNvbnNvbGUubG9nKEpTT04uc3RyaW5naWZ5KGVyciwgdW5kZWZpbmVkLCA0KSk7XG4gICAgdGhyb3cgZXJyO1xufSk7XG4iXX0=