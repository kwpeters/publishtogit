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
                    // Fetch the newly created tags into the dev repo.
                    return [4 /*yield*/, instanceConfig.devRepo.fetch("origin", true)];
                case 16:
                    // Fetch the newly created tags into the dev repo.
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

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9wdWJsaXNodG9naXQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFFQSx5QkFBNEI7QUFDNUIsMEJBQTRCO0FBQzVCLDZCQUErQjtBQUMvQiwrQ0FBNEM7QUFDNUMsbURBQWdEO0FBQ2hELG1DQUFnQztBQUNoQywyQ0FBd0M7QUFDeEMsK0NBQTRDO0FBQzVDLDJEQUE0RDtBQWlCNUQsZ0ZBQWdGO0FBQ2hGLG1CQUFtQjtBQUNuQixnRkFBZ0Y7QUFFaEY7SUFFSSxPQUFPLEtBQUs7U0FDWCxLQUFLLENBQUMsNERBQTRELENBQUM7U0FDbkUsSUFBSSxFQUFFO1NBQ04sTUFBTSxDQUFDLEtBQUssRUFDVDtRQUNJLFlBQVksRUFBRSxLQUFLO1FBQ25CLFFBQVEsRUFBRSw2RUFBNkU7S0FDMUYsQ0FDSjtTQUNBLE1BQU0sQ0FBQyxhQUFhLEVBQ2pCO1FBQ0ksSUFBSSxFQUFFLFNBQVM7UUFDZixPQUFPLEVBQUUsS0FBSztRQUNkLFlBQVksRUFBRSxLQUFLO1FBQ25CLFFBQVEsRUFBRSx5RkFBeUY7S0FDdEcsQ0FDSjtTQUNBLE1BQU0sQ0FBQyxZQUFZLEVBQ2hCO1FBQ0ksSUFBSSxFQUFFLFNBQVM7UUFDZixPQUFPLEVBQUUsS0FBSztRQUNkLFlBQVksRUFBRSxLQUFLO1FBQ25CLFFBQVEsRUFBRSwwREFBMEQ7S0FDdkUsQ0FDSjtTQUNBLE1BQU0sQ0FBQyxTQUFTLEVBQ2I7UUFDSSxJQUFJLEVBQUUsU0FBUztRQUNmLE9BQU8sRUFBRSxLQUFLO1FBQ2QsWUFBWSxFQUFFLEtBQUs7UUFDbkIsUUFBUSxFQUFFLGtEQUFrRDtLQUMvRCxDQUNKO1NBQ0EsT0FBTyxFQUFFLENBQUUsMENBQTBDO1NBQ3JELElBQUksQ0FBQyxFQUFFLENBQUM7U0FDUixJQUFJLENBQUM7QUFDVixDQUFDO0FBR0QsMkJBQWlDLElBQXFCOzs7Ozs7b0JBRTVDLE1BQU0sR0FBRyxJQUFJLHFCQUFTLENB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VyxDQUFDO29CQUNoRCxxQkFBTSxxQkFBUyxDQUFDLE1BQU0sQ0FBQyxJQUFJLEVBQUUsYUFBYSxDQUFDLEVBQUE7O29CQUF2RCxTQUFTLEdBQUcsU0FBMkM7b0JBQzdELHFCQUFNLElBQUksQ0FBQyxjQUFjLENBQUMsU0FBUyxFQUFFLElBQUksQ0FBQyxFQUFBOztvQkFBMUMsU0FBMEMsQ0FBQztvQkFDM0Msc0JBQU8sU0FBUyxFQUFDOzs7O0NBQ3BCO0FBR0Q7Ozs7R0FJRztBQUNILDRCQUFrQyxJQUFhOzs7Ozt3QkFFN0IscUJBQU0sSUFBSSxDQUFDLEtBQUssRUFBRSxFQUFBOztvQkFBMUIsS0FBSyxHQUFHLFNBQWtCO29CQUMxQixjQUFjLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxLQUFLLEVBQUUsVUFBQyxPQUFPO3dCQUN4QyxPQUFPLE9BQU8sQ0FBQyxNQUFNLEVBQUUsQ0FBQztvQkFDNUIsQ0FBQyxDQUFDLENBQUM7b0JBRUgscUJBQU0sT0FBTyxDQUFDLEdBQUcsQ0FBQyxjQUFjLENBQUMsRUFBQTs7b0JBQWpDLFNBQWlDLENBQUM7Ozs7O0NBQ3JDO0FBR0QsSUFBSSxFQUFFO0tBQ0wsS0FBSyxDQUFDLFVBQUMsR0FBRztJQUNQLE9BQU8sQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxHQUFHLEVBQUUsU0FBUyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDL0MsTUFBTSxHQUFHLENBQUM7QUFDZCxDQUFDLENBQUMsQ0FBQyIsImZpbGUiOiJwdWJsaXNodG9naXQuanMiLCJzb3VyY2VzQ29udGVudCI6WyIjIS91c3IvYmluL2VudiBub2RlXG5cbmltcG9ydCB7dXNlckluZm99IGZyb20gXCJvc1wiO1xuaW1wb3J0ICogYXMgXyBmcm9tIFwibG9kYXNoXCI7XG5pbXBvcnQgKiBhcyB5YXJncyBmcm9tIFwieWFyZ3NcIjtcbmltcG9ydCB7RGlyZWN0b3J5fSBmcm9tIFwiLi9kZXBvdC9kaXJlY3RvcnlcIjtcbmltcG9ydCB7Tm9kZVBhY2thZ2V9IGZyb20gXCIuL2RlcG90L25vZGVQYWNrYWdlXCI7XG5pbXBvcnQge1VybH0gZnJvbSBcIi4vZGVwb3QvdXJsXCI7XG5pbXBvcnQge0dpdFJlcG99IGZyb20gXCIuL2RlcG90L2dpdFJlcG9cIjtcbmltcG9ydCB7R2l0QnJhbmNofSBmcm9tIFwiLi9kZXBvdC9naXRCcmFuY2hcIjtcbmltcG9ydCB7Y29uZmlnIGFzIGdsb2JhbENvbmZpZ30gZnJvbSBcIi4vcHVibGlzaFRvR2l0Q29uZmlnXCI7XG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFR5cGVzXG4vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuXG5pbnRlcmZhY2UgSUluc3RhbmNlQ29uZmlnXG57XG4gICAgZGV2UmVwbzogR2l0UmVwbztcbiAgICBwa2c6IE5vZGVQYWNrYWdlO1xuICAgIGRyeVJ1bjogYm9vbGVhbjtcbiAgICB0YWdzOiBBcnJheTxzdHJpbmc+O1xuICAgIGZvcmNlVGFnczogYm9vbGVhbjtcbn1cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gSGVscGVyIEZ1bmN0aW9uc1xuLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cblxuZnVuY3Rpb24gZ2V0QXJncygpOiB5YXJncy5Bcmd1bWVudHNcbntcbiAgICByZXR1cm4geWFyZ3NcbiAgICAudXNhZ2UoXCJQdWJsaXNoZXMgYSBOb2RlLmpzIHBhY2thZ2UgdG8gYSBwcm9qZWN0J3MgR2l0IHJlcG9zaXRvcnkuXCIpXG4gICAgLmhlbHAoKVxuICAgIC5vcHRpb24oXCJ0YWdcIixcbiAgICAgICAge1xuICAgICAgICAgICAgZGVtYW5kT3B0aW9uOiBmYWxzZSxcbiAgICAgICAgICAgIGRlc2NyaWJlOiBcIkFwcGx5IHRoZSBzcGVjaWZpZWQgdGFnIHRvIHRoZSBwdWJsaXNoIGNvbW1pdCAoY2FuIGJlIHVzZWQgbXVsdGlwbGUgdGltZXMpLlwiXG4gICAgICAgIH1cbiAgICApXG4gICAgLm9wdGlvbihcInRhZy12ZXJzaW9uXCIsXG4gICAgICAgIHtcbiAgICAgICAgICAgIHR5cGU6IFwiYm9vbGVhblwiLFxuICAgICAgICAgICAgZGVmYXVsdDogZmFsc2UsXG4gICAgICAgICAgICBkZW1hbmRPcHRpb246IGZhbHNlLFxuICAgICAgICAgICAgZGVzY3JpYmU6IFwiQXBwbHkgYSB0YWcgd2l0aCB0aGUgcHJvamVjdCdzIHZlcnNpb24gbnVtYmVyIChmcm9tIHBhY2thZ2UuanNvbikgdG8gdGhlIHB1Ymxpc2ggY29tbWl0XCJcbiAgICAgICAgfVxuICAgIClcbiAgICAub3B0aW9uKFwiZm9yY2UtdGFnc1wiLFxuICAgICAgICB7XG4gICAgICAgICAgICB0eXBlOiBcImJvb2xlYW5cIixcbiAgICAgICAgICAgIGRlZmF1bHQ6IGZhbHNlLFxuICAgICAgICAgICAgZGVtYW5kT3B0aW9uOiBmYWxzZSxcbiAgICAgICAgICAgIGRlc2NyaWJlOiBcIkZvcmNlcyB0YWdzIHRvIGJlIGFwcGxpZWQsIG1vdmluZyBhbnkgdGhhdCBhbHJlYWR5IGV4aXN0XCJcbiAgICAgICAgfVxuICAgIClcbiAgICAub3B0aW9uKFwiZHJ5LXJ1blwiLFxuICAgICAgICB7XG4gICAgICAgICAgICB0eXBlOiBcImJvb2xlYW5cIixcbiAgICAgICAgICAgIGRlZmF1bHQ6IGZhbHNlLFxuICAgICAgICAgICAgZGVtYW5kT3B0aW9uOiBmYWxzZSxcbiAgICAgICAgICAgIGRlc2NyaWJlOiBcIlBlcmZvcm0gYWxsIG9wZXJhdGlvbnMgYnV0IGRvIG5vdCBwdXNoIHRvIG9yaWdpblwiXG4gICAgICAgIH1cbiAgICApXG4gICAgLnZlcnNpb24oKSAgLy8gdmVyc2lvbiB3aWxsIGJlIHJlYWQgZnJvbSBwYWNrYWdlLmpzb24hXG4gICAgLndyYXAoODApXG4gICAgLmFyZ3Y7XG59XG5cblxuYXN5bmMgZnVuY3Rpb24gZ2V0SW5zdGFuY2VDb25maWcoYXJndjogeWFyZ3MuQXJndW1lbnRzKTogUHJvbWlzZTxJSW5zdGFuY2VDb25maWc+XG57XG4gICAgY29uc3QgZGV2RGlyID0gbmV3IERpcmVjdG9yeShcIi5cIik7XG4gICAgY29uc3QgZGV2UmVwbyA9IGF3YWl0IEdpdFJlcG8uZnJvbURpcmVjdG9yeShkZXZEaXIpO1xuICAgIGNvbnN0IHBrZyA9IGF3YWl0IE5vZGVQYWNrYWdlLmZyb21EaXJlY3RvcnkoZGV2RGlyKTtcblxuICAgIC8vIEJ1aWxkIHRoZSBhcnJheSBvZiB0YWdzIHRoYXQgd2lsbCBiZSBhcHBsaWVkIHRvIHRoZSBwdWJsaXNoIGNvbW1pdC5cbiAgICBsZXQgdGFnczogQXJyYXk8c3RyaW5nPiA9IFtdLmNvbmNhdChhcmd2LnRhZyB8fCBbXSk7XG4gICAgaWYgKGFyZ3ZbXCJ0YWctdmVyc2lvblwiXSlcbiAgICB7XG4gICAgICAgIHRhZ3MucHVzaChgdiR7cGtnLmNvbmZpZy52ZXJzaW9ufWApO1xuICAgIH1cblxuICAgIC8vIE1ha2Ugc3VyZSB3ZSBoYXZlIGF0IGxlYXN0IDEgdGFnIHRvIGFwcGx5LiAgT3RoZXJ3aXNlIGdpdCBtaWdodCBnYXJiYWdlXG4gICAgLy8gY29sbGVjdCB0aGUgcHVibGlzaCBjb21taXQgd2UgYXJlIGFib3V0IHRvIGNyZWF0ZS5cbiAgICBpZiAodGFncy5sZW5ndGggPT09IDApXG4gICAge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJBdCBsZWFzdCBvbmUgdGFnIG11c3QgYmUgYXBwbGllZCBieSB1c2luZyBlaXRoZXIgLS10YWctdmVyc2lvbiBvciAtLXRhZy5cIik7XG4gICAgfVxuXG4gICAgcmV0dXJuIHtcbiAgICAgICAgZHJ5UnVuOiBhcmd2W1wiZHJ5LXJ1blwiXSxcbiAgICAgICAgdGFnczogdGFncyxcbiAgICAgICAgZGV2UmVwbzogZGV2UmVwbyxcbiAgICAgICAgcGtnOiBwa2csXG4gICAgICAgIGZvcmNlVGFnczogYXJndltcImZvcmNlLXRhZ3NcIl1cbiAgICB9O1xufVxuXG5cbmFzeW5jIGZ1bmN0aW9uIGNoZWNrSW5pdGlhbENvbmRpdGlvbnMoaW5zdGFuY2VDb25maWc6IElJbnN0YW5jZUNvbmZpZyk6IFByb21pc2U8dm9pZD5cbntcbiAgICAvLyBNYWtlIHN1cmUgdGhlcmUgYXJlIG5vIG1vZGlmaWVkIGZpbGVzLlxuICAgIGNvbnN0IG1vZGlmaWVkRmlsZXMgPSBhd2FpdCBpbnN0YW5jZUNvbmZpZy5kZXZSZXBvLm1vZGlmaWVkRmlsZXMoKTtcbiAgICBpZiAobW9kaWZpZWRGaWxlcy5sZW5ndGggPiAwIClcbiAgICB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcIlRoaXMgcmVwb3NpdG9yeSBjb250YWlucyBtb2RpZmllZCBmaWxlcy5cIik7XG4gICAgfVxuXG4gICAgLy8gTWFrZSBzdXJlIHRoZXJlIGFyZSBubyB1bnRyYWNrZWQgZmlsZXMuXG4gICAgY29uc3QgdW50cmFja2VkRmlsZXMgPSBhd2FpdCBpbnN0YW5jZUNvbmZpZy5kZXZSZXBvLnVudHJhY2tlZEZpbGVzKCk7XG4gICAgaWYgKHVudHJhY2tlZEZpbGVzLmxlbmd0aCA+IDAgKVxuICAgIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiVGhpcyByZXBvc2l0b3J5IGNvbnRhaW5zIHVudHJhY2tlZCBmaWxlcy5cIik7XG4gICAgfVxuXG4gICAgLy8gVGhlIGRldmVsb3BtZW50IHJlcG8gc2hvdWxkIGJlIGF0IHRoZSBoZWFkIG9mIGEgR2l0IGJyYW5jaC5cbiAgICBjb25zdCBkZXZCcmFuY2ggPSBhd2FpdCBpbnN0YW5jZUNvbmZpZy5kZXZSZXBvLmdldEN1cnJlbnRCcmFuY2goKTtcbiAgICBpZiAoIWRldkJyYW5jaClcbiAgICB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcIkhFQUQgZG9lcyBub3QgY3VycmVudCBwb2ludCB0byBhIGJyYW5jaC5cIik7XG4gICAgfVxuXG4gICAgLy8gVGhlIGRldmVsb3BtZW50IHJlcG8gc2hvdWxkIGJlIHB1c2hlZCB0byBvcmlnaW4uXG4gICAgY29uc3QgZGVsdGFzID0gYXdhaXQgaW5zdGFuY2VDb25maWcuZGV2UmVwby5nZXRDb21taXREZWx0YXMoXCJvcmlnaW5cIik7XG4gICAgaWYgKChkZWx0YXMuYWhlYWQgPiAwKSB8fCAoZGVsdGFzLmJlaGluZCA+IDApKVxuICAgIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBUaGUgYnJhbmNoIGlzICR7ZGVsdGFzLmFoZWFkfSBjb21taXRzIGFoZWFkIGFuZCAke2RlbHRhcy5iZWhpbmR9IGNvbW1pdHMgYmVoaW5kLmApO1xuICAgIH1cblxuICAgIC8vIE1ha2Ugc3VyZSB0aGUgZGlyZWN0b3J5IGlzIGEgTm9kZSBwYWNrYWdlLlxuICAgIGlmICghaW5zdGFuY2VDb25maWcucGtnLmNvbmZpZy52ZXJzaW9uKVxuICAgIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiUGFja2FnZSBkb2VzIG5vdCBoYXZlIGEgdmVyc2lvbi5cIik7XG4gICAgfVxuXG4gICAgLy8gSWYgd2UgYXJlIG5vdCBmb3JjaW5nIChpLmUuIG1vdmluZykgdGFncywgdGhlbiBtYWtlIHN1cmUgbm9uZSBvZiB0aGUgdGFnc1xuICAgIC8vIHdlIGFyZSBhcHBseWluZyBhbHJlYWR5IGV4aXN0LlxuICAgIGlmICghaW5zdGFuY2VDb25maWcuZm9yY2VUYWdzKVxuICAgIHtcbiAgICAgICAgY29uc3QgZXhpc3RpbmdUYWdzID0gYXdhaXQgaW5zdGFuY2VDb25maWcuZGV2UmVwby50YWdzKCk7XG4gICAgICAgIGNvbnN0IGFscmVhZHlFeGlzdCA9IF8uaW50ZXJzZWN0aW9uKGV4aXN0aW5nVGFncywgaW5zdGFuY2VDb25maWcudGFncyk7XG4gICAgICAgIGlmIChhbHJlYWR5RXhpc3QubGVuZ3RoID4gMClcbiAgICAgICAge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBUaGUgZm9sbG93aW5nIHRhZ3MgYWxyZWFkeSBleGlzdDogJHthbHJlYWR5RXhpc3Quam9pbihcIiwgXCIpfWApO1xuICAgICAgICB9XG4gICAgfVxufVxuXG5cbmFzeW5jIGZ1bmN0aW9uIG1haW4oKTogUHJvbWlzZTx2b2lkPlxue1xuICAgIC8vIEdldCB0aGUgY29tbWFuZCBsaW5lIGFyZ3MgZmlyc3QuICBJZiB0aGUgdXNlciBpcyBqdXN0IGRvaW5nIC0taGVscCwgd2VcbiAgICAvLyBkb24ndCB3YW50IHRvIGRvIGFueXRoaW5nIGVsc2UuXG4gICAgY29uc3QgYXJndiA9IGdldEFyZ3MoKTtcblxuICAgIGdsb2JhbENvbmZpZy5pbml0KCk7XG5cbiAgICAvLyBSZXNvbHZlIHRoZSBjb21tYW5kIGxpbmUgYXJndW1lbnRzIGludG8gYSBjb25jcmV0ZSBjb25maWd1cmF0aW9uIGZvciB0aGlzXG4gICAgLy8gaW5zdGFuY2UuXG4gICAgY29uc3QgaW5zdGFuY2VDb25maWcgPSBhd2FpdCBnZXRJbnN0YW5jZUNvbmZpZyhhcmd2KTtcblxuICAgIC8vIEdpdmVuIHRoZSBpbnN0YW5jZSBjb25maWd1cmF0aW9uLCBkZXRlcm1pbmUgaWYgZXZlcnl0aGluZyBpcyBpbiBhIHZhbGlkXG4gICAgLy8gc3RhdGUuXG4gICAgYXdhaXQgY2hlY2tJbml0aWFsQ29uZGl0aW9ucyhpbnN0YW5jZUNvbmZpZyk7XG5cbiAgICBjb25zdCBkZXZDb21taXRIYXNoID0gYXdhaXQgaW5zdGFuY2VDb25maWcuZGV2UmVwby5jdXJyZW50Q29tbWl0SGFzaCgpO1xuICAgIGNvbnN0IGRldkJyYW5jaCA9IChhd2FpdCBpbnN0YW5jZUNvbmZpZy5kZXZSZXBvLmdldEN1cnJlbnRCcmFuY2goKSkhO1xuXG4gICAgLy8gQ2xlYXIgb3V0IHNwYWNlIGZvciB0aGUgcHVibGlzaCByZXBvLlxuICAgIGNvbnN0IHB1Ymxpc2hEaXIgPSBuZXcgRGlyZWN0b3J5KGdsb2JhbENvbmZpZy50bXBEaXIsIGluc3RhbmNlQ29uZmlnLnBrZy5wcm9qZWN0TmFtZSk7XG4gICAgcHVibGlzaERpci5kZWxldGVTeW5jKCk7XG5cbiAgICAvLyBDcmVhdGUgYSBjbG9uZSBvZiB0aGUgcmVwbyBmb3IgcHVibGlzaGluZyBwdXJwb3Nlcy5cbiAgICBjb25zdCByZXBvVXJsID0gVXJsLmZyb21TdHJpbmcoaW5zdGFuY2VDb25maWcucGtnLmNvbmZpZy5yZXBvc2l0b3J5LnVybCk7XG4gICAgaWYgKCFyZXBvVXJsKVxuICAgIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiSW52YWxpZCByZXBvc2l0b3J5IFVSTC5cIik7XG4gICAgfVxuICAgIGNvbnNvbGUubG9nKGBDcmVhdGluZyB0ZW1wb3JhcnkgcmVwbyBjbG9uZSBhdCAke3B1Ymxpc2hEaXIudG9TdHJpbmcoKX0uLi5gKTtcbiAgICBjb25zdCBwdWJsaXNoUmVwbyA9IGF3YWl0IEdpdFJlcG8uY2xvbmUocmVwb1VybCwgZ2xvYmFsQ29uZmlnLnRtcERpcik7XG5cbiAgICAvLyBDaGVja291dCB0aGUgY29tbWl0IHRoZSBkZXZSZXBvIGlzIGF0LlxuICAgIGNvbnNvbGUubG9nKGBDaGVja2luZyBvdXQgY3VycmVudCBkZXZlbG9wbWVudCBjb21taXQgJHtkZXZDb21taXRIYXNoLnRvU2hvcnRTdHJpbmcoKX0uLi5gKTtcbiAgICBhd2FpdCBwdWJsaXNoUmVwby5jaGVja291dENvbW1pdChkZXZDb21taXRIYXNoKTtcblxuICAgIC8vIENyZWF0ZSBhIHRlbXBvcmFyeSBicmFuY2ggb24gd2hpY2ggdGhlIHB1Ymxpc2hlZCBmaWxlcyB3aWxsIGJlIGNvbW1pdHRlZC5cbiAgICBjb25zb2xlLmxvZyhcIkNyZWF0aW5nIHRlbXBvcmFyeSBicmFuY2guLi5cIik7XG4gICAgYXdhaXQgY2hlY2tvdXRUZW1wQnJhbmNoKHB1Ymxpc2hSZXBvLCBcInB1Ymxpc2h0b2dpdFwiKTtcblxuICAgIC8vIFJlbW92ZSBhbGwgZmlsZXMgdW5kZXIgdmVyc2lvbiBjb250cm9sIGFuZCBwcnVuZSBkaXJlY3RvcmllcyB0aGF0IGFyZVxuICAgIC8vIGVtcHR5LlxuICAgIGNvbnNvbGUubG9nKFwiRGVsZXRpbmcgYWxsIGZpbGVzLi4uXCIpO1xuICAgIGF3YWl0IGRlbGV0ZVRyYWNrZWRGaWxlcyhwdWJsaXNoUmVwbyk7XG4gICAgYXdhaXQgcHVibGlzaFJlcG8uZGlyZWN0b3J5LnBydW5lKCk7XG5cbiAgICAvLyBQdWJsaXNoIHRoZSBkZXYgcmVwbyB0byB0aGUgcHVibGlzaCBkaXJlY3RvcnkuXG4gICAgY29uc29sZS5sb2coXCJQdWJsaXNoaW5nIHBhY2thZ2UgY29udGVudHMgdG8gcHVibGlzaCByZXBvc2l0b3J5Li4uXCIpO1xuICAgIGF3YWl0IGluc3RhbmNlQ29uZmlnLnBrZy5wdWJsaXNoKHB1Ymxpc2hEaXIsIGZhbHNlLCBnbG9iYWxDb25maWcudG1wRGlyKTtcblxuICAgIC8vIFN0YWdlIGFuZCBjb21taXQgdGhlIHB1Ymxpc2hlZCBmaWxlcy5cbiAgICBjb25zb2xlLmxvZyhcIkNvbW1pdGluZyBwdWJsaXNoZWQgZmlsZXMuLi5cIik7XG4gICAgYXdhaXQgcHVibGlzaFJlcG8uc3RhZ2VBbGwoKTtcbiAgICBhd2FpdCBwdWJsaXNoUmVwby5jb21taXQoXCJQdWJsaXNoZWQgdXNpbmcgcHVibGlzaC10by1naXQuXCIpO1xuXG4gICAgLy8gVE9ETzogSWYgdGhlIHNvdXJjZSByZXBvIGhhcyBhIENIQU5HRUxPRy5tZCwgYWRkIGl0cyBjb250ZW50cyBhcyB0aGUgYW5ub3RhdGVkIHRhZyBtZXNzYWdlLlxuXG4gICAgY29uc3QgcHVibGlzaENvbW1pdEhhc2ggPSBhd2FpdCBwdWJsaXNoUmVwby5jdXJyZW50Q29tbWl0SGFzaCgpO1xuXG4gICAgLy8gQXBwbHkgdGFncy5cbiAgICBhd2FpdCBQcm9taXNlLmFsbChfLm1hcChpbnN0YW5jZUNvbmZpZy50YWdzLCAoY3VyVGFnTmFtZSkgPT4ge1xuICAgICAgICBjb25zb2xlLmxvZyhgQ3JlYXRpbmcgdGFnICR7Y3VyVGFnTmFtZX0uLi5gKTtcbiAgICAgICAgY29uc3QgdGFnTWVzc2FnZSA9XG4gICAgICAgICAgICBcIlB1Ymxpc2hlZCB1c2luZyBwdWJsaXNodG9naXQuXFxuXCIgK1xuICAgICAgICAgICAgYFNvdXJjZSBicmFuY2g6ICR7ZGV2QnJhbmNoLm5hbWV9XFxuYCArXG4gICAgICAgICAgICBgU291cmNlIGNvbW1pdDogJHtkZXZDb21taXRIYXNoLnRvU3RyaW5nKCl9IFske2RldkNvbW1pdEhhc2gudG9TaG9ydFN0cmluZygpfV1gO1xuICAgICAgICByZXR1cm4gcHVibGlzaFJlcG8uY3JlYXRlVGFnKGN1clRhZ05hbWUsIHRhZ01lc3NhZ2UsIHRydWUpO1xuICAgIH0pKTtcblxuICAgIC8vIElmIGRvaW5nIGEgXCJkcnkgcnVuXCIsIHN0b3AuXG4gICAgaWYgKGluc3RhbmNlQ29uZmlnLmRyeVJ1bilcbiAgICB7XG4gICAgICAgIGNvbnN0IG1zZyA9IFtcbiAgICAgICAgICAgIFwiUnVubmluZyBpbiBkcnktcnVuIG1vZGUuICBUaGUgcmVwb3NpdG9yeSBpbiB0aGUgZm9sbG93aW5nIHRlbXBvcmFyeSBkaXJlY3RvcnlcIixcbiAgICAgICAgICAgIFwiaGFzIGJlZW4gbGVmdCByZWFkeSB0byBwdXNoIHRvIGEgcHVibGljIHNlcnZlci5cIixcbiAgICAgICAgICAgIHB1Ymxpc2hSZXBvLmRpcmVjdG9yeS50b1N0cmluZygpXG4gICAgICAgIF07XG4gICAgICAgIGNvbnNvbGUubG9nKG1zZy5qb2luKFwiXFxuXCIpKTtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIC8vIFB1c2ggYWxsIHRhZ3MuXG4gICAgYXdhaXQgUHJvbWlzZS5hbGwoXy5tYXAoaW5zdGFuY2VDb25maWcudGFncywgKGN1clRhZ05hbWUpID0+IHtcbiAgICAgICAgY29uc29sZS5sb2coYFB1c2hpbmcgdGFnICR7Y3VyVGFnTmFtZX0gdG8gb3JpZ2luLmApO1xuICAgICAgICByZXR1cm4gcHVibGlzaFJlcG8ucHVzaFRhZyhjdXJUYWdOYW1lLCBcIm9yaWdpblwiLCB0cnVlKTtcbiAgICB9KSk7XG5cbiAgICAvLyBGZXRjaCB0aGUgbmV3bHkgY3JlYXRlZCB0YWdzIGludG8gdGhlIGRldiByZXBvLlxuICAgIGF3YWl0IGluc3RhbmNlQ29uZmlnLmRldlJlcG8uZmV0Y2goXCJvcmlnaW5cIiwgdHJ1ZSk7XG5cbiAgICAvLyBQcmludCBhIGNvbXBsZXRpb24gbWVzc2FnZS5cbiAgICAvLyBUZWxsIHRoZSB1c2VyIGhvdyB0byBpbmNsdWRlIHRoZSBwdWJsaXNoZWQgcmVwb3NpdG9yeSBpbnRvIGFub3RoZXJcbiAgICAvLyBwcm9qZWN0J3MgZGVwZW5kZW5jaWVzLlxuICAgIGNvbnN0IGRlcGVuZGVuY3lVcmwgPSByZXBvVXJsLnJlcGxhY2VQcm90b2NvbChcImdpdCtodHRwc1wiKS50b1N0cmluZygpO1xuICAgIGNvbnN0IGRvbmVNZXNzYWdlID0gW1xuICAgICAgICBcIkRvbmUuXCIsXG4gICAgICAgIFwiVG8gaW5jbHVkZSB0aGUgcHVibGlzaGVkIGxpYnJhcnkgaW4gYSBOb2RlLmpzIHByb2plY3QsIGV4ZWN1dGUgdGhlIGZvbGxvd2luZyBjb21tYW5kOlwiXG4gICAgXS5jb25jYXQoXy5tYXAoaW5zdGFuY2VDb25maWcudGFncywgKGN1clRhZ05hbWUpID0+IHtcbiAgICAgICAgcmV0dXJuIGBucG0gaW5zdGFsbCAke2RlcGVuZGVuY3lVcmx9IyR7Y3VyVGFnTmFtZX1gO1xuICAgIH0pKVxuICAgIC5jb25jYXQoYG5wbSBpbnN0YWxsICR7ZGVwZW5kZW5jeVVybH0jJHtwdWJsaXNoQ29tbWl0SGFzaC50b1Nob3J0U3RyaW5nKCl9YCk7XG4gICAgY29uc29sZS5sb2coZG9uZU1lc3NhZ2Uuam9pbihcIlxcblwiKSk7XG59XG5cblxuYXN5bmMgZnVuY3Rpb24gY2hlY2tvdXRUZW1wQnJhbmNoKHJlcG86IEdpdFJlcG8sIGJhc2VOYW1lOiBzdHJpbmcpOiBQcm9taXNlPEdpdEJyYW5jaD5cbntcbiAgICBjb25zdCBub3cgPSBuZXcgRGF0ZSgpO1xuICAgIGNvbnN0IGRhdGVzdGFtcCA9XG4gICAgICAgIG5vdy5nZXRGdWxsWWVhcigpICsgXCJfXCIgKyBub3cuZ2V0TW9udGgoKSArIFwiX1wiICsgbm93LmdldERhdGUoKSArIFwiX1wiICtcbiAgICAgICAgbm93LmdldEhvdXJzKCkgKyBcIl9cIiArIG5vdy5nZXRNaW51dGVzKCkgKyBcIl9cIiArIG5vdy5nZXRTZWNvbmRzKCkgKyBcIi5cIiArIG5vdy5nZXRNaWxsaXNlY29uZHMoKTtcblxuICAgIGNvbnN0IHVzZXIgPSB1c2VySW5mbygpO1xuXG4gICAgY29uc3QgdG1wQnJhbmNoTmFtZSA9IGAke2Jhc2VOYW1lfS0ke3VzZXIudXNlcm5hbWV9LSR7ZGF0ZXN0YW1wfWA7XG4gICAgY29uc3QgdG1wQnJhbmNoID0gYXdhaXQgR2l0QnJhbmNoLmNyZWF0ZShyZXBvLCB0bXBCcmFuY2hOYW1lKTtcbiAgICBhd2FpdCByZXBvLmNoZWNrb3V0QnJhbmNoKHRtcEJyYW5jaCwgdHJ1ZSk7XG4gICAgcmV0dXJuIHRtcEJyYW5jaDtcbn1cblxuXG4vKipcbiAqIERlbGV0ZXMgYWxsIHRyYWNrZWQgZmlsZXMgd2l0aGluIGEgcmVwby5cbiAqIEBwYXJhbSByZXBvIC0gVGhlIHJlcG8gdG8gY2xlYXJcbiAqIEByZXR1cm4gQSBQcm9taXNlIHRoYXQgaXMgcmVzb2x2ZWQgd2hlbiBhbGwgZmlsZXMgaGF2ZSBiZWVuIGRlbGV0ZWQuXG4gKi9cbmFzeW5jIGZ1bmN0aW9uIGRlbGV0ZVRyYWNrZWRGaWxlcyhyZXBvOiBHaXRSZXBvKTogUHJvbWlzZTx2b2lkPlxue1xuICAgIGNvbnN0IGZpbGVzID0gYXdhaXQgcmVwby5maWxlcygpO1xuICAgIGNvbnN0IGRlbGV0ZVByb21pc2VzID0gXy5tYXAoZmlsZXMsIChjdXJGaWxlKSA9PiB7XG4gICAgICAgIHJldHVybiBjdXJGaWxlLmRlbGV0ZSgpO1xuICAgIH0pO1xuXG4gICAgYXdhaXQgUHJvbWlzZS5hbGwoZGVsZXRlUHJvbWlzZXMpO1xufVxuXG5cbm1haW4oKVxuLmNhdGNoKChlcnIpID0+IHtcbiAgICBjb25zb2xlLmxvZyhKU09OLnN0cmluZ2lmeShlcnIsIHVuZGVmaW5lZCwgNCkpO1xuICAgIHRocm93IGVycjtcbn0pO1xuIl19