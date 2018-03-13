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
        var modifiedFiles, untrackedFiles, existingTags, alreadyExist;
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
                    // Make sure the directory is a Node package.
                    if (!instanceConfig.pkg.config.version) {
                        throw new Error("Package does not have a version.");
                    }
                    if (!!instanceConfig.forceTags) return [3 /*break*/, 4];
                    return [4 /*yield*/, instanceConfig.devRepo.tags()];
                case 3:
                    existingTags = _a.sent();
                    alreadyExist = _.intersection(existingTags, instanceConfig.tags);
                    if (alreadyExist.length > 0) {
                        throw new Error("The following tags already exist: " + alreadyExist.join(", "));
                    }
                    _a.label = 4;
                case 4: return [2 /*return*/];
            }
        });
    });
}
function main() {
    return __awaiter(this, void 0, void 0, function () {
        var argv, instanceConfig, devCommitHash, publishDir, repoUrl, publishRepo, publishCommitHash, msg, dependencyUrl, doneMessage;
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
                    publishDir = new directory_1.Directory(publishToGitConfig_1.config.tmpDir, instanceConfig.pkg.projectName);
                    publishDir.deleteSync();
                    repoUrl = url_1.Url.fromString(instanceConfig.pkg.config.repository.url);
                    if (!repoUrl) {
                        throw new Error("Invalid repository URL.");
                    }
                    console.log("Creating temporary repo clone at " + publishDir.toString() + "...");
                    return [4 /*yield*/, gitRepo_1.GitRepo.clone(repoUrl, publishToGitConfig_1.config.tmpDir)];
                case 4:
                    publishRepo = _a.sent();
                    // Checkout the commit the devRepo is at.
                    publishRepo.checkoutCommit(devCommitHash);
                    console.log("Checking out current development commit " + devCommitHash + "...");
                    // Create a temporary branch on which the published files will be committed.
                    console.log("Creating temporary branch...");
                    return [4 /*yield*/, checkoutTempBranch(publishRepo, "publishtogit")];
                case 5:
                    _a.sent();
                    // Remove all files under version control and prune directories that are
                    // empty.
                    console.log("Deleting all files...");
                    return [4 /*yield*/, deleteTrackedFiles(publishRepo)];
                case 6:
                    _a.sent();
                    return [4 /*yield*/, publishRepo.directory.prune()];
                case 7:
                    _a.sent();
                    // Publish the dev repo to the publish directory.
                    console.log("Publishing package contents to publish repository...");
                    return [4 /*yield*/, instanceConfig.pkg.publish(publishDir, false)];
                case 8:
                    _a.sent();
                    // Stage and commit the published files.
                    console.log("Commiting published files...");
                    return [4 /*yield*/, publishRepo.stageAll()];
                case 9:
                    _a.sent();
                    return [4 /*yield*/, publishRepo.commit("Published using publish-to-git.")];
                case 10:
                    _a.sent();
                    return [4 /*yield*/, publishRepo.currentCommitHash()];
                case 11:
                    publishCommitHash = _a.sent();
                    // Apply tags.
                    return [4 /*yield*/, Promise.all(_.map(instanceConfig.tags, function (curTagName) {
                            console.log("Creating tag " + curTagName + "...");
                            return publishRepo.createTag(curTagName, "", true);
                        }))];
                case 12:
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
                case 13:
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

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9wdWJsaXNodG9naXQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFFQSwwQkFBNEI7QUFDNUIsMkRBQTREO0FBQzVELHlDQUFzQztBQUN0QyxxQ0FBa0M7QUFDbEMsNkNBQTBDO0FBQzFDLDZCQUErQjtBQUMvQiw2QkFBMEI7QUFDMUIseUNBQXNDO0FBQ3RDLHlCQUE0QjtBQWlCNUIsZ0ZBQWdGO0FBQ2hGLG1CQUFtQjtBQUNuQixnRkFBZ0Y7QUFFaEY7SUFFSSxNQUFNLENBQUMsS0FBSztTQUNYLEtBQUssQ0FBQyw0REFBNEQsQ0FBQztTQUNuRSxJQUFJLEVBQUU7U0FDTixNQUFNLENBQUMsS0FBSyxFQUNUO1FBQ0ksWUFBWSxFQUFFLEtBQUs7UUFDbkIsUUFBUSxFQUFFLDZFQUE2RTtLQUMxRixDQUNKO1NBQ0EsTUFBTSxDQUFDLGFBQWEsRUFDakI7UUFDSSxJQUFJLEVBQUUsU0FBUztRQUNmLE9BQU8sRUFBRSxLQUFLO1FBQ2QsWUFBWSxFQUFFLEtBQUs7UUFDbkIsUUFBUSxFQUFFLHlGQUF5RjtLQUN0RyxDQUNKO1NBQ0EsTUFBTSxDQUFDLFlBQVksRUFDaEI7UUFDSSxJQUFJLEVBQUUsU0FBUztRQUNmLE9BQU8sRUFBRSxLQUFLO1FBQ2QsWUFBWSxFQUFFLEtBQUs7UUFDbkIsUUFBUSxFQUFFLDBEQUEwRDtLQUN2RSxDQUNKO1NBQ0EsTUFBTSxDQUFDLFNBQVMsRUFDYjtRQUNJLElBQUksRUFBRSxTQUFTO1FBQ2YsT0FBTyxFQUFFLEtBQUs7UUFDZCxZQUFZLEVBQUUsS0FBSztRQUNuQixRQUFRLEVBQUUsa0RBQWtEO0tBQy9ELENBQ0o7U0FDQSxPQUFPLEVBQUUsQ0FBRSwwQ0FBMEM7U0FDckQsSUFBSSxDQUFDLEVBQUUsQ0FBQztTQUNSLElBQUksQ0FBQztBQUNWLENBQUM7QUFHRCwyQkFBaUMsSUFBcUI7Ozs7OztvQkFFNUMsTUFBTSxHQUFHLElBQUkscUJB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R0FDWCxHQUFHLENBQUMsV0FBVyxFQUFFLEdBQUcsR0FBRyxHQUFHLEdBQUcsQ0FBQyxRQUFRLEVBQUUsR0FBRyxHQUFHLEdBQUcsR0FBRyxDQUFDLE9BQU8sRUFBRSxHQUFHLEdBQUc7d0JBQ3BFLEdBQUcsQ0FBQyxRQUFRLEVBQUUsR0FBRyxHQUFHLEdBQUcsR0FBRyxDQUFDLFVBQVUsRUFBRSxHQUFHLEdBQUcsR0FBRyxHQUFHLENBQUMsVUFBVSxFQUFFLEdBQUcsR0FBRyxHQUFHLEdBQUcsQ0FBQyxlQUFlLEVBQUUsQ0FBQztvQkFFN0YsSUFBSSxHQUFHLGFBQVEsRUFBRSxDQUFDO29CQUVsQixhQUFhLEdBQU0sUUFBUSxTQUFJLElBQUksQ0FBQyxRQUFRLFNBQUksU0FBVyxDQUFDO29CQUNoRCxxQkFBTSxxQkFBUyxDQUFDLE1BQU0sQ0FBQyxJQUFJLEVBQUUsYUFBYSxDQUFDLEVBQUE7O29CQUF2RCxTQUFTLEdBQUcsU0FBMkM7b0JBQzdELHFCQUFNLElBQUksQ0FBQyxjQUFjLENBQUMsU0FBUyxFQUFFLElBQUksQ0FBQyxFQUFBOztvQkFBMUMsU0FBMEMsQ0FBQztvQkFDM0Msc0JBQU8sU0FBUyxFQUFDOzs7O0NBQ3BCO0FBR0Q7Ozs7R0FJRztBQUNILDRCQUFrQyxJQUFhOzs7Ozt3QkFFN0IscUJBQU0sSUFBSSxDQUFDLEtBQUssRUFBRSxFQUFBOztvQkFBMUIsS0FBSyxHQUFHLFNBQWtCO29CQUMxQixjQUFjLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxLQUFLLEVBQUUsVUFBQyxPQUFPO3dCQUN4QyxNQUFNLENBQUMsT0FBTyxDQUFDLE1BQU0sRUFBRSxDQUFDO29CQUM1QixDQUFDLENBQUMsQ0FBQztvQkFFSCxxQkFBTSxPQUFPLENBQUMsR0FBRyxDQUFDLGNBQWMsQ0FBQyxFQUFBOztvQkFBakMsU0FBaUMsQ0FBQzs7Ozs7Q0FDckMiLCJmaWxlIjoicHVibGlzaHRvZ2l0LmpzIiwic291cmNlc0NvbnRlbnQiOlsiIyEvdXNyL2Jpbi9lbnYgbm9kZVxuXG5pbXBvcnQgKiBhcyBfIGZyb20gXCJsb2Rhc2hcIjtcbmltcG9ydCB7Y29uZmlnIGFzIGdsb2JhbENvbmZpZ30gZnJvbSBcIi4vcHVibGlzaFRvR2l0Q29uZmlnXCI7XG5pbXBvcnQge0RpcmVjdG9yeX0gZnJvbSBcIi4vZGlyZWN0b3J5XCI7XG5pbXBvcnQge0dpdFJlcG99IGZyb20gXCIuL2dpdFJlcG9cIjtcbmltcG9ydCB7Tm9kZVBhY2thZ2V9IGZyb20gXCIuL25vZGVQYWNrYWdlXCI7XG5pbXBvcnQgKiBhcyB5YXJncyBmcm9tIFwieWFyZ3NcIjtcbmltcG9ydCB7VXJsfSBmcm9tIFwiLi91cmxcIjtcbmltcG9ydCB7R2l0QnJhbmNofSBmcm9tIFwiLi9naXRCcmFuY2hcIjtcbmltcG9ydCB7dXNlckluZm99IGZyb20gXCJvc1wiO1xuXG5cbi8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBUeXBlc1xuLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cblxuaW50ZXJmYWNlIElJbnN0YW5jZUNvbmZpZ1xue1xuICAgIGRldlJlcG86IEdpdFJlcG87XG4gICAgcGtnOiBOb2RlUGFja2FnZTtcbiAgICBkcnlSdW46IGJvb2xlYW47XG4gICAgdGFnczogQXJyYXk8c3RyaW5nPjtcbiAgICBmb3JjZVRhZ3M6IGJvb2xlYW47XG59XG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIEhlbHBlciBGdW5jdGlvbnNcbi8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG5cbmZ1bmN0aW9uIGdldEFyZ3MoKTogeWFyZ3MuQXJndW1lbnRzXG57XG4gICAgcmV0dXJuIHlhcmdzXG4gICAgLnVzYWdlKFwiUHVibGlzaGVzIGEgTm9kZS5qcyBwYWNrYWdlIHRvIGEgcHJvamVjdCdzIEdpdCByZXBvc2l0b3J5LlwiKVxuICAgIC5oZWxwKClcbiAgICAub3B0aW9uKFwidGFnXCIsXG4gICAgICAgIHtcbiAgICAgICAgICAgIGRlbWFuZE9wdGlvbjogZmFsc2UsXG4gICAgICAgICAgICBkZXNjcmliZTogXCJBcHBseSB0aGUgc3BlY2lmaWVkIHRhZyB0byB0aGUgcHVibGlzaCBjb21taXQgKGNhbiBiZSB1c2VkIG11bHRpcGxlIHRpbWVzKS5cIlxuICAgICAgICB9XG4gICAgKVxuICAgIC5vcHRpb24oXCJ0YWctdmVyc2lvblwiLFxuICAgICAgICB7XG4gICAgICAgICAgICB0eXBlOiBcImJvb2xlYW5cIixcbiAgICAgICAgICAgIGRlZmF1bHQ6IGZhbHNlLFxuICAgICAgICAgICAgZGVtYW5kT3B0aW9uOiBmYWxzZSxcbiAgICAgICAgICAgIGRlc2NyaWJlOiBcIkFwcGx5IGEgdGFnIHdpdGggdGhlIHByb2plY3QncyB2ZXJzaW9uIG51bWJlciAoZnJvbSBwYWNrYWdlLmpzb24pIHRvIHRoZSBwdWJsaXNoIGNvbW1pdFwiXG4gICAgICAgIH1cbiAgICApXG4gICAgLm9wdGlvbihcImZvcmNlLXRhZ3NcIixcbiAgICAgICAge1xuICAgICAgICAgICAgdHlwZTogXCJib29sZWFuXCIsXG4gICAgICAgICAgICBkZWZhdWx0OiBmYWxzZSxcbiAgICAgICAgICAgIGRlbWFuZE9wdGlvbjogZmFsc2UsXG4gICAgICAgICAgICBkZXNjcmliZTogXCJGb3JjZXMgdGFncyB0byBiZSBhcHBsaWVkLCBtb3ZpbmcgYW55IHRoYXQgYWxyZWFkeSBleGlzdFwiXG4gICAgICAgIH1cbiAgICApXG4gICAgLm9wdGlvbihcImRyeS1ydW5cIixcbiAgICAgICAge1xuICAgICAgICAgICAgdHlwZTogXCJib29sZWFuXCIsXG4gICAgICAgICAgICBkZWZhdWx0OiBmYWxzZSxcbiAgICAgICAgICAgIGRlbWFuZE9wdGlvbjogZmFsc2UsXG4gICAgICAgICAgICBkZXNjcmliZTogXCJQZXJmb3JtIGFsbCBvcGVyYXRpb25zIGJ1dCBkbyBub3QgcHVzaCB0byBvcmlnaW5cIlxuICAgICAgICB9XG4gICAgKVxuICAgIC52ZXJzaW9uKCkgIC8vIHZlcnNpb24gd2lsbCBiZSByZWFkIGZyb20gcGFja2FnZS5qc29uIVxuICAgIC53cmFwKDgwKVxuICAgIC5hcmd2O1xufVxuXG5cbmFzeW5jIGZ1bmN0aW9uIGdldEluc3RhbmNlQ29uZmlnKGFyZ3Y6IHlhcmdzLkFyZ3VtZW50cyk6IFByb21pc2U8SUluc3RhbmNlQ29uZmlnPlxue1xuICAgIGNvbnN0IGRldkRpciA9IG5ldyBEaXJlY3RvcnkoXCIuXCIpO1xuICAgIGNvbnN0IGRldlJlcG8gPSBhd2FpdCBHaXRSZXBvLmZyb21EaXJlY3RvcnkoZGV2RGlyKTtcbiAgICBjb25zdCBwa2cgPSBhd2FpdCBOb2RlUGFja2FnZS5mcm9tRGlyZWN0b3J5KGRldkRpcik7XG5cbiAgICAvLyBCdWlsZCB0aGUgYXJyYXkgb2YgdGFncyB0aGF0IHdpbGwgYmUgYXBwbGllZCB0byB0aGUgcHVibGlzaCBjb21taXQuXG4gICAgbGV0IHRhZ3M6IEFycmF5PHN0cmluZz4gPSBbXS5jb25jYXQoYXJndi50YWcgfHwgW10pO1xuICAgIGlmIChhcmd2W1widGFnLXZlcnNpb25cIl0pXG4gICAge1xuICAgICAgICB0YWdzLnB1c2goYHYke3BrZy5jb25maWcudmVyc2lvbn1gKTtcbiAgICB9XG5cbiAgICAvLyBNYWtlIHN1cmUgd2UgaGF2ZSBhdCBsZWFzdCAxIHRhZyB0byBhcHBseS4gIE90aGVyd2lzZSBnaXQgbWlnaHQgZ2FyYmFnZVxuICAgIC8vIGNvbGxlY3QgdGhlIHB1Ymxpc2ggY29tbWl0IHdlIGFyZSBhYm91dCB0byBjcmVhdGUuXG4gICAgaWYgKHRhZ3MubGVuZ3RoID09PSAwKVxuICAgIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiQXQgbGVhc3Qgb25lIHRhZyBtdXN0IGJlIGFwcGxpZWQgYnkgdXNpbmcgZWl0aGVyIC0tdGFnLXZlcnNpb24gb3IgLS10YWcuXCIpO1xuICAgIH1cblxuICAgIHJldHVybiB7XG4gICAgICAgIGRyeVJ1bjogYXJndltcImRyeS1ydW5cIl0sXG4gICAgICAgIHRhZ3M6IHRhZ3MsXG4gICAgICAgIGRldlJlcG86IGRldlJlcG8sXG4gICAgICAgIHBrZzogcGtnLFxuICAgICAgICBmb3JjZVRhZ3M6IGFyZ3ZbXCJmb3JjZS10YWdzXCJdXG4gICAgfTtcbn1cblxuXG5hc3luYyBmdW5jdGlvbiBjaGVja0luaXRpYWxDb25kaXRpb25zKGluc3RhbmNlQ29uZmlnOiBJSW5zdGFuY2VDb25maWcpOiBQcm9taXNlPHZvaWQ+XG57XG4gICAgLy8gTWFrZSBzdXJlIHRoZXJlIGFyZSBubyBtb2RpZmllZCBmaWxlcy5cbiAgICBjb25zdCBtb2RpZmllZEZpbGVzID0gYXdhaXQgaW5zdGFuY2VDb25maWcuZGV2UmVwby5tb2RpZmllZEZpbGVzKCk7XG4gICAgaWYgKG1vZGlmaWVkRmlsZXMubGVuZ3RoID4gMCApXG4gICAge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJUaGlzIHJlcG9zaXRvcnkgY29udGFpbnMgbW9kaWZpZWQgZmlsZXMuXCIpO1xuICAgIH1cblxuICAgIC8vIE1ha2Ugc3VyZSB0aGVyZSBhcmUgbm8gdW50cmFja2VkIGZpbGVzLlxuICAgIGNvbnN0IHVudHJhY2tlZEZpbGVzID0gYXdhaXQgaW5zdGFuY2VDb25maWcuZGV2UmVwby51bnRyYWNrZWRGaWxlcygpO1xuICAgIGlmICh1bnRyYWNrZWRGaWxlcy5sZW5ndGggPiAwIClcbiAgICB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcIlRoaXMgcmVwb3NpdG9yeSBjb250YWlucyB1bnRyYWNrZWQgZmlsZXMuXCIpO1xuICAgIH1cblxuICAgIC8vIE1ha2Ugc3VyZSB0aGUgZGlyZWN0b3J5IGlzIGEgTm9kZSBwYWNrYWdlLlxuICAgIGlmICghaW5zdGFuY2VDb25maWcucGtnLmNvbmZpZy52ZXJzaW9uKVxuICAgIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiUGFja2FnZSBkb2VzIG5vdCBoYXZlIGEgdmVyc2lvbi5cIik7XG4gICAgfVxuXG4gICAgLy8gSWYgd2UgYXJlIG5vdCBmb3JjaW5nIChpLmUuIG1vdmluZykgdGFncywgdGhlbiBtYWtlIHN1cmUgbm9uZSBvZiB0aGUgdGFnc1xuICAgIC8vIHdlIGFyZSBhcHBseWluZyBhbHJlYWR5IGV4aXN0LlxuICAgIGlmICghaW5zdGFuY2VDb25maWcuZm9yY2VUYWdzKVxuICAgIHtcbiAgICAgICAgY29uc3QgZXhpc3RpbmdUYWdzID0gYXdhaXQgaW5zdGFuY2VDb25maWcuZGV2UmVwby50YWdzKCk7XG4gICAgICAgIGNvbnN0IGFscmVhZHlFeGlzdCA9IF8uaW50ZXJzZWN0aW9uKGV4aXN0aW5nVGFncywgaW5zdGFuY2VDb25maWcudGFncyk7XG4gICAgICAgIGlmIChhbHJlYWR5RXhpc3QubGVuZ3RoID4gMClcbiAgICAgICAge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBUaGUgZm9sbG93aW5nIHRhZ3MgYWxyZWFkeSBleGlzdDogJHthbHJlYWR5RXhpc3Quam9pbihcIiwgXCIpfWApO1xuICAgICAgICB9XG4gICAgfVxufVxuXG5cbmFzeW5jIGZ1bmN0aW9uIG1haW4oKTogUHJvbWlzZTx2b2lkPlxue1xuICAgIC8vIEdldCB0aGUgY29tbWFuZCBsaW5lIGFyZ3MgZmlyc3QuICBJZiB0aGUgdXNlciBpcyBqdXN0IGRvaW5nIC0taGVscCwgd2VcbiAgICAvLyBkb24ndCB3YW50IHRvIGRvIGFueXRoaW5nIGVsc2UuXG4gICAgY29uc3QgYXJndiA9IGdldEFyZ3MoKTtcblxuICAgIGdsb2JhbENvbmZpZy5pbml0KCk7XG5cbiAgICAvLyBSZXNvbHZlIHRoZSBjb21tYW5kIGxpbmUgYXJndW1lbnRzIGludG8gYSBjb25jcmV0ZSBjb25maWd1cmF0aW9uIGZvciB0aGlzXG4gICAgLy8gaW5zdGFuY2UuXG4gICAgY29uc3QgaW5zdGFuY2VDb25maWcgPSBhd2FpdCBnZXRJbnN0YW5jZUNvbmZpZyhhcmd2KTtcblxuICAgIC8vIEdpdmVuIHRoZSBpbnN0YW5jZSBjb25maWd1cmF0aW9uLCBkZXRlcm1pbmUgaWYgZXZlcnl0aGluZyBpcyBpbiBhIHZhbGlkXG4gICAgLy8gc3RhdGUuXG4gICAgYXdhaXQgY2hlY2tJbml0aWFsQ29uZGl0aW9ucyhpbnN0YW5jZUNvbmZpZyk7XG5cbiAgICBjb25zdCBkZXZDb21taXRIYXNoID0gYXdhaXQgaW5zdGFuY2VDb25maWcuZGV2UmVwby5jdXJyZW50Q29tbWl0SGFzaCgpO1xuXG4gICAgLy8gQ2xlYXIgb3V0IHNwYWNlIGZvciB0aGUgcHVibGlzaCByZXBvLlxuICAgIGNvbnN0IHB1Ymxpc2hEaXIgPSBuZXcgRGlyZWN0b3J5KGdsb2JhbENvbmZpZy50bXBEaXIsIGluc3RhbmNlQ29uZmlnLnBrZy5wcm9qZWN0TmFtZSk7XG4gICAgcHVibGlzaERpci5kZWxldGVTeW5jKCk7XG5cbiAgICAvLyBDcmVhdGUgYSBjbG9uZSBvZiB0aGUgcmVwbyBmb3IgcHVibGlzaGluZyBwdXJwb3Nlcy5cbiAgICBjb25zdCByZXBvVXJsID0gVXJsLmZyb21TdHJpbmcoaW5zdGFuY2VDb25maWcucGtnLmNvbmZpZy5yZXBvc2l0b3J5LnVybCk7XG4gICAgaWYgKCFyZXBvVXJsKVxuICAgIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiSW52YWxpZCByZXBvc2l0b3J5IFVSTC5cIik7XG4gICAgfVxuICAgIGNvbnNvbGUubG9nKGBDcmVhdGluZyB0ZW1wb3JhcnkgcmVwbyBjbG9uZSBhdCAke3B1Ymxpc2hEaXIudG9TdHJpbmcoKX0uLi5gKTtcbiAgICBjb25zdCBwdWJsaXNoUmVwbyA9IGF3YWl0IEdpdFJlcG8uY2xvbmUocmVwb1VybCwgZ2xvYmFsQ29uZmlnLnRtcERpcik7XG5cbiAgICAvLyBDaGVja291dCB0aGUgY29tbWl0IHRoZSBkZXZSZXBvIGlzIGF0LlxuICAgIHB1Ymxpc2hSZXBvLmNoZWNrb3V0Q29tbWl0KGRldkNvbW1pdEhhc2gpO1xuICAgIGNvbnNvbGUubG9nKGBDaGVja2luZyBvdXQgY3VycmVudCBkZXZlbG9wbWVudCBjb21taXQgJHtkZXZDb21taXRIYXNofS4uLmApO1xuXG4gICAgLy8gQ3JlYXRlIGEgdGVtcG9yYXJ5IGJyYW5jaCBvbiB3aGljaCB0aGUgcHVibGlzaGVkIGZpbGVzIHdpbGwgYmUgY29tbWl0dGVkLlxuICAgIGNvbnNvbGUubG9nKFwiQ3JlYXRpbmcgdGVtcG9yYXJ5IGJyYW5jaC4uLlwiKTtcbiAgICBhd2FpdCBjaGVja291dFRlbXBCcmFuY2gocHVibGlzaFJlcG8sIFwicHVibGlzaHRvZ2l0XCIpO1xuXG4gICAgLy8gUmVtb3ZlIGFsbCBmaWxlcyB1bmRlciB2ZXJzaW9uIGNvbnRyb2wgYW5kIHBydW5lIGRpcmVjdG9yaWVzIHRoYXQgYXJlXG4gICAgLy8gZW1wdHkuXG4gICAgY29uc29sZS5sb2coXCJEZWxldGluZyBhbGwgZmlsZXMuLi5cIik7XG4gICAgYXdhaXQgZGVsZXRlVHJhY2tlZEZpbGVzKHB1Ymxpc2hSZXBvKTtcbiAgICBhd2FpdCBwdWJsaXNoUmVwby5kaXJlY3RvcnkucHJ1bmUoKTtcblxuICAgIC8vIFB1Ymxpc2ggdGhlIGRldiByZXBvIHRvIHRoZSBwdWJsaXNoIGRpcmVjdG9yeS5cbiAgICBjb25zb2xlLmxvZyhcIlB1Ymxpc2hpbmcgcGFja2FnZSBjb250ZW50cyB0byBwdWJsaXNoIHJlcG9zaXRvcnkuLi5cIik7XG4gICAgYXdhaXQgaW5zdGFuY2VDb25maWcucGtnLnB1Ymxpc2gocHVibGlzaERpciwgZmFsc2UpO1xuXG4gICAgLy8gU3RhZ2UgYW5kIGNvbW1pdCB0aGUgcHVibGlzaGVkIGZpbGVzLlxuICAgIGNvbnNvbGUubG9nKFwiQ29tbWl0aW5nIHB1Ymxpc2hlZCBmaWxlcy4uLlwiKTtcbiAgICBhd2FpdCBwdWJsaXNoUmVwby5zdGFnZUFsbCgpO1xuICAgIGF3YWl0IHB1Ymxpc2hSZXBvLmNvbW1pdChcIlB1Ymxpc2hlZCB1c2luZyBwdWJsaXNoLXRvLWdpdC5cIik7XG5cbiAgICAvLyBUT0RPOiBJZiB0aGUgc291cmNlIHJlcG8gaGFzIGEgQ0hBTkdFTE9HLm1kLCBhZGQgaXRzIGNvbnRlbnRzIGFzIHRoZSBhbm5vdGF0ZWQgdGFnIG1lc3NhZ2UuXG5cbiAgICBjb25zdCBwdWJsaXNoQ29tbWl0SGFzaCA9IGF3YWl0IHB1Ymxpc2hSZXBvLmN1cnJlbnRDb21taXRIYXNoKCk7XG5cbiAgICAvLyBBcHBseSB0YWdzLlxuICAgIGF3YWl0IFByb21pc2UuYWxsKF8ubWFwKGluc3RhbmNlQ29uZmlnLnRhZ3MsIChjdXJUYWdOYW1lKSA9PiB7XG4gICAgICAgIGNvbnNvbGUubG9nKGBDcmVhdGluZyB0YWcgJHtjdXJUYWdOYW1lfS4uLmApO1xuICAgICAgICByZXR1cm4gcHVibGlzaFJlcG8uY3JlYXRlVGFnKGN1clRhZ05hbWUsIFwiXCIsIHRydWUpO1xuICAgIH0pKTtcblxuICAgIC8vIElmIGRvaW5nIGEgXCJkcnkgcnVuXCIsIHN0b3AuXG4gICAgaWYgKGluc3RhbmNlQ29uZmlnLmRyeVJ1bilcbiAgICB7XG4gICAgICAgIGNvbnN0IG1zZyA9IFtcbiAgICAgICAgICAgIFwiUnVubmluZyBpbiBkcnktcnVuIG1vZGUuICBUaGUgcmVwb3NpdG9yeSBpbiB0aGUgZm9sbG93aW5nIHRlbXBvcmFyeSBkaXJlY3RvcnlcIixcbiAgICAgICAgICAgIFwiaGFzIGJlZW4gbGVmdCByZWFkeSB0byBwdXNoIHRvIGEgcHVibGljIHNlcnZlci5cIixcbiAgICAgICAgICAgIHB1Ymxpc2hSZXBvLmRpcmVjdG9yeS50b1N0cmluZygpXG4gICAgICAgIF07XG4gICAgICAgIGNvbnNvbGUubG9nKG1zZy5qb2luKFwiXFxuXCIpKTtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIC8vIFB1c2ggYWxsIHRhZ3MuXG4gICAgYXdhaXQgUHJvbWlzZS5hbGwoXy5tYXAoaW5zdGFuY2VDb25maWcudGFncywgKGN1clRhZ05hbWUpID0+IHtcbiAgICAgICAgY29uc29sZS5sb2coYFB1c2hpbmcgdGFnICR7Y3VyVGFnTmFtZX0gdG8gb3JpZ2luLmApO1xuICAgICAgICByZXR1cm4gcHVibGlzaFJlcG8ucHVzaFRhZyhjdXJUYWdOYW1lLCBcIm9yaWdpblwiLCB0cnVlKTtcbiAgICB9KSk7XG5cbiAgICAvLyBQcmludCBhIGNvbXBsZXRpb24gbWVzc2FnZS5cbiAgICAvLyBUZWxsIHRoZSB1c2VyIGhvdyB0byBpbmNsdWRlIHRoZSBwdWJsaXNoZWQgcmVwb3NpdG9yeSBpbnRvIGFub3RoZXJcbiAgICAvLyBwcm9qZWN0J3MgZGVwZW5kZW5jaWVzLlxuICAgIGNvbnN0IGRlcGVuZGVuY3lVcmwgPSByZXBvVXJsLnJlcGxhY2VQcm90b2NvbChcImdpdCtodHRwc1wiKS50b1N0cmluZygpO1xuICAgIGNvbnN0IGRvbmVNZXNzYWdlID0gW1xuICAgICAgICBcIkRvbmUuXCIsXG4gICAgICAgIFwiVG8gaW5jbHVkZSB0aGUgcHVibGlzaGVkIGxpYnJhcnkgaW4gYSBOb2RlLmpzIHByb2plY3QsIGV4ZWN1dGUgdGhlIGZvbGxvd2luZyBjb21tYW5kOlwiXG4gICAgXS5jb25jYXQoXy5tYXAoaW5zdGFuY2VDb25maWcudGFncywgKGN1clRhZ05hbWUpID0+IHtcbiAgICAgICAgcmV0dXJuIGBucG0gaW5zdGFsbCAke2RlcGVuZGVuY3lVcmx9IyR7Y3VyVGFnTmFtZX1gO1xuICAgIH0pKVxuICAgIC5jb25jYXQoYG5wbSBpbnN0YWxsICR7ZGVwZW5kZW5jeVVybH0jJHtwdWJsaXNoQ29tbWl0SGFzaC50b1Nob3J0U3RyaW5nKCl9YCk7XG4gICAgY29uc29sZS5sb2coZG9uZU1lc3NhZ2Uuam9pbihcIlxcblwiKSk7XG59XG5cblxubWFpbigpO1xuXG5cbmFzeW5jIGZ1bmN0aW9uIGNoZWNrb3V0VGVtcEJyYW5jaChyZXBvOiBHaXRSZXBvLCBiYXNlTmFtZTogc3RyaW5nKTogUHJvbWlzZTxHaXRCcmFuY2g+XG57XG4gICAgY29uc3Qgbm93ID0gbmV3IERhdGUoKTtcbiAgICBjb25zdCBkYXRlc3RhbXAgPVxuICAgICAgICBub3cuZ2V0RnVsbFllYXIoKSArIFwiX1wiICsgbm93LmdldE1vbnRoKCkgKyBcIl9cIiArIG5vdy5nZXREYXRlKCkgKyBcIl9cIiArXG4gICAgICAgIG5vdy5nZXRIb3VycygpICsgXCJfXCIgKyBub3cuZ2V0TWludXRlcygpICsgXCJfXCIgKyBub3cuZ2V0U2Vjb25kcygpICsgXCIuXCIgKyBub3cuZ2V0TWlsbGlzZWNvbmRzKCk7XG5cbiAgICBjb25zdCB1c2VyID0gdXNlckluZm8oKTtcblxuICAgIGNvbnN0IHRtcEJyYW5jaE5hbWUgPSBgJHtiYXNlTmFtZX0tJHt1c2VyLnVzZXJuYW1lfS0ke2RhdGVzdGFtcH1gO1xuICAgIGNvbnN0IHRtcEJyYW5jaCA9IGF3YWl0IEdpdEJyYW5jaC5jcmVhdGUocmVwbywgdG1wQnJhbmNoTmFtZSk7XG4gICAgYXdhaXQgcmVwby5jaGVja291dEJyYW5jaCh0bXBCcmFuY2gsIHRydWUpO1xuICAgIHJldHVybiB0bXBCcmFuY2g7XG59XG5cblxuLyoqXG4gKiBEZWxldGVzIGFsbCB0cmFja2VkIGZpbGVzIHdpdGhpbiBhIHJlcG8uXG4gKiBAcGFyYW0gcmVwbyAtIFRoZSByZXBvIHRvIGNsZWFyXG4gKiBAcmV0dXJuIEEgUHJvbWlzZSB0aGF0IGlzIHJlc29sdmVkIHdoZW4gYWxsIGZpbGVzIGhhdmUgYmVlbiBkZWxldGVkLlxuICovXG5hc3luYyBmdW5jdGlvbiBkZWxldGVUcmFja2VkRmlsZXMocmVwbzogR2l0UmVwbyk6IFByb21pc2U8dm9pZD5cbntcbiAgICBjb25zdCBmaWxlcyA9IGF3YWl0IHJlcG8uZmlsZXMoKTtcbiAgICBjb25zdCBkZWxldGVQcm9taXNlcyA9IF8ubWFwKGZpbGVzLCAoY3VyRmlsZSkgPT4ge1xuICAgICAgICByZXR1cm4gY3VyRmlsZS5kZWxldGUoKTtcbiAgICB9KTtcblxuICAgIGF3YWl0IFByb21pc2UuYWxsKGRlbGV0ZVByb21pc2VzKTtcbn1cbiJdfQ==
