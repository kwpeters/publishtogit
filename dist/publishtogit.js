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
var file_1 = require("./depot/file");
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
        describe: "Perform all operations but do not push the publish commit to the project's repo"
    })
        .option("remove-types", {
        type: "boolean",
        default: false,
        demandOption: false,
        describe: "Remove '@types' packages from package.json in published commit"
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
                            forceTags: argv["force-tags"],
                            removeTypes: argv["remove-types"]
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
                        throw new Error("HEAD does not currently point to a branch.");
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
        var argv, instanceConfig, devCommitHash, devBranch, publishDir, repoUrl, publishRepo, pkgJson, exists, pkgJsonContents, _i, _a, curPackageName, _b, _c, curPackageName, publishCommitHash, msg, dependencyUrl, doneMessage;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    argv = getArgs();
                    publishToGitConfig_1.config.init();
                    return [4 /*yield*/, getInstanceConfig(argv)];
                case 1:
                    instanceConfig = _d.sent();
                    // Given the instance configuration, determine if everything is in a valid
                    // state.
                    return [4 /*yield*/, checkInitialConditions(instanceConfig)];
                case 2:
                    // Given the instance configuration, determine if everything is in a valid
                    // state.
                    _d.sent();
                    return [4 /*yield*/, instanceConfig.devRepo.currentCommitHash()];
                case 3:
                    devCommitHash = _d.sent();
                    return [4 /*yield*/, instanceConfig.devRepo.getCurrentBranch()];
                case 4:
                    devBranch = (_d.sent());
                    publishDir = new directory_1.Directory(publishToGitConfig_1.config.tmpDir, instanceConfig.pkg.projectName);
                    publishDir.deleteSync();
                    repoUrl = url_1.Url.fromString(instanceConfig.pkg.config.repository.url);
                    if (!repoUrl) {
                        throw new Error("Invalid repository URL.");
                    }
                    console.log("Creating temporary repo clone at " + publishDir.toString() + "...");
                    return [4 /*yield*/, gitRepo_1.GitRepo.clone(repoUrl, publishToGitConfig_1.config.tmpDir)];
                case 5:
                    publishRepo = _d.sent();
                    // Checkout the commit the devRepo is at.
                    console.log("Checking out current development commit " + devCommitHash.toShortString() + "...");
                    return [4 /*yield*/, publishRepo.checkoutCommit(devCommitHash)];
                case 6:
                    _d.sent();
                    // Create a temporary branch on which the published files will be committed.
                    console.log("Creating temporary branch...");
                    return [4 /*yield*/, checkoutTempBranch(publishRepo, "publishtogit")];
                case 7:
                    _d.sent();
                    // Remove all files under version control and prune directories that are
                    // empty.
                    console.log("Deleting all files...");
                    return [4 /*yield*/, deleteTrackedFiles(publishRepo)];
                case 8:
                    _d.sent();
                    return [4 /*yield*/, publishRepo.directory.prune()];
                case 9:
                    _d.sent();
                    // Publish the dev repo to the publish directory.
                    console.log("Publishing package contents to publish repository...");
                    return [4 /*yield*/, instanceConfig.pkg.publish(publishDir, false, publishToGitConfig_1.config.tmpDir)];
                case 10:
                    _d.sent();
                    // If requested, remove all "@types" packages from package.json.
                    if (instanceConfig.removeTypes) {
                        pkgJson = new file_1.File(publishDir, "package.json");
                        exists = pkgJson.existsSync();
                        if (!exists) {
                            throw new Error("Did not find a package.json file in the published contents.");
                        }
                        pkgJsonContents = pkgJson.readJsonSync();
                        // Remove @types from devDependencies
                        for (_i = 0, _a = Object.keys(pkgJsonContents.devDependencies); _i < _a.length; _i++) {
                            curPackageName = _a[_i];
                            if (/^@types\//.test(curPackageName)) {
                                delete pkgJsonContents.devDependencies[curPackageName];
                            }
                        }
                        // Remove @types from dependencies
                        for (_b = 0, _c = Object.keys(pkgJsonContents.dependencies); _b < _c.length; _b++) {
                            curPackageName = _c[_b];
                            if (/^@types\//.test(curPackageName)) {
                                delete pkgJsonContents.dependencies[curPackageName];
                            }
                        }
                        pkgJson.writeJsonSync(pkgJsonContents);
                    }
                    // Stage and commit the published files.
                    console.log("Commiting published files...");
                    return [4 /*yield*/, publishRepo.stageAll()];
                case 11:
                    _d.sent();
                    return [4 /*yield*/, publishRepo.commit("Published using publish-to-git.")];
                case 12:
                    _d.sent();
                    return [4 /*yield*/, publishRepo.currentCommitHash()];
                case 13:
                    publishCommitHash = _d.sent();
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
                    _d.sent();
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
                            // TODO: Change the following "origin" in text output to the repo's URL.
                            // Note:  It is ok to keep the "origin" in the pushTag() call.
                            console.log("Pushing tag " + curTagName + " to origin.");
                            return publishRepo.pushTag(curTagName, "origin", true);
                        }))];
                case 15:
                    // Push all tags.
                    _d.sent();
                    // Fetch the newly created tags into the dev repo.
                    // TODO: Change the following remote name to the remote discovered above.
                    return [4 /*yield*/, instanceConfig.devRepo.fetch("origin", true)];
                case 16:
                    // Fetch the newly created tags into the dev repo.
                    // TODO: Change the following remote name to the remote discovered above.
                    _d.sent();
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

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9wdWJsaXNodG9naXQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFFQSx5QkFBNEI7QUFDNUIsMEJBQTRCO0FBQzVCLDZCQUErQjtBQUMvQiwrQ0FBNEM7QUFDNUMscUNBQWtDO0FBQ2xDLG1EQUFnRDtBQUNoRCxtQ0FBZ0M7QUFDaEMsMkNBQXdDO0FBQ3hDLCtDQUE0QztBQUM1QywyREFBNEQ7QUFrQjVELGdGQUFnRjtBQUNoRixtQkFBbUI7QUFDbkIsZ0ZBQWdGO0FBRWhGO0lBRUksT0FBTyxLQUFLO1NBQ1gsS0FBSyxDQUFDLDREQUE0RCxDQUFDO1NBQ25FLElBQUksRUFBRTtTQUNOLE1BQU0sQ0FBQyxLQUFLLEVBQ1Q7UUFDSSxZQUFZLEVBQUUsS0FBSztRQUNuQixRQUFRLEVBQUUsNkVBQTZFO0tBQzFGLENBQ0o7U0FDQSxNQUFNLENBQUMsYUFBYSxFQUNqQjtRQUNJLElBQUksRUFBRSxTQUFTO1FBQ2YsT0FBTyxFQUFFLEtBQUs7UUFDZCxZQUFZLEVBQUUsS0FBSztRQUNuQixRQUFRLEVBQUUseUZBQXlGO0tBQ3RHLENBQ0o7U0FDQSxNQUFNLENBQUMsWUFBWSxFQUNoQjtRQUNJLElBQUksRUFBRSxTQUFTO1FBQ2YsT0FBTyxFQUFFLEtBQUs7UUFDZCxZQUFZLEVBQUUsS0FBSztRQUNuQixRQUFRLEVBQUUsMERBQTBEO0tBQ3ZFLENBQ0o7U0FDQSxNQUFNLENBQUMsU0FBUyxFQUNiO1FBQ0ksSUFBSSxFQUFFLFNBQVM7UUFDZixPQUFPLEVBQUUsS0FBSztRQUNkLFlBQVksRUFBRSxLQUFLO1FBQ25CLFFBQVEsRUFBRSxpRkFBaUY7S0FDOUYsQ0FDSjtTQUNBLE1BQU0sQ0FBQyxjQUFjLEVBQ2xCO1FBQ0ksSUFBSSxFQUFFLFNBQVM7UUFDZixPQUFPLEVBQUUsS0FBSztRQUNkLFlBQVksRUFBRSxLQUFLO1FBQ25CLFFBQVEsRUFBRSxnRUFBZ0U7S0FDN0UsQ0FD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LENBQUM7b0JBRTdGLElBQUksR0FBRyxhQUFRLEVBQUUsQ0FBQztvQkFFbEIsYUFBYSxHQUFNLFFBQVEsU0FBSSxJQUFJLENBQUMsUUFBUSxTQUFJLFNBQVcsQ0FBQztvQkFDaEQscUJBQU0scUJBQVMsQ0FBQyxNQUFNLENBQUMsSUFBSSxFQUFFLGFBQWEsQ0FBQyxFQUFBOztvQkFBdkQsU0FBUyxHQUFHLFNBQTJDO29CQUM3RCxxQkFBTSxJQUFJLENBQUMsY0FBYyxDQUFDLFNBQVMsRUFBRSxJQUFJLENBQUMsRUFBQTs7b0JBQTFDLFNBQTBDLENBQUM7b0JBQzNDLHNCQUFPLFNBQVMsRUFBQzs7OztDQUNwQjtBQUdEOzs7O0dBSUc7QUFDSCw0QkFBa0MsSUFBYTs7Ozs7d0JBRTdCLHFCQUFNLElBQUksQ0FBQyxLQUFLLEVBQUUsRUFBQTs7b0JBQTFCLEtBQUssR0FBRyxTQUFrQjtvQkFDMUIsY0FBYyxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsS0FBSyxFQUFFLFVBQUMsT0FBTzt3QkFDeEMsT0FBTyxPQUFPLENBQUMsTUFBTSxFQUFFLENBQUM7b0JBQzVCLENBQUMsQ0FBQyxDQUFDO29CQUVILHFCQUFNLE9BQU8sQ0FBQyxHQUFHLENBQUMsY0FBYyxDQUFDLEVBQUE7O29CQUFqQyxTQUFpQyxDQUFDOzs7OztDQUNyQztBQUdELElBQUksRUFBRTtLQUNMLEtBQUssQ0FBQyxVQUFDLEdBQUc7SUFDUCxPQUFPLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsR0FBRyxFQUFFLFNBQVMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQy9DLE1BQU0sR0FBRyxDQUFDO0FBQ2QsQ0FBQyxDQUFDLENBQUMiLCJmaWxlIjoicHVibGlzaHRvZ2l0LmpzIiwic291cmNlc0NvbnRlbnQiOlsiIyEvdXNyL2Jpbi9lbnYgbm9kZVxuXG5pbXBvcnQge3VzZXJJbmZvfSBmcm9tIFwib3NcIjtcbmltcG9ydCAqIGFzIF8gZnJvbSBcImxvZGFzaFwiO1xuaW1wb3J0ICogYXMgeWFyZ3MgZnJvbSBcInlhcmdzXCI7XG5pbXBvcnQge0RpcmVjdG9yeX0gZnJvbSBcIi4vZGVwb3QvZGlyZWN0b3J5XCI7XG5pbXBvcnQge0ZpbGV9IGZyb20gXCIuL2RlcG90L2ZpbGVcIjtcbmltcG9ydCB7Tm9kZVBhY2thZ2V9IGZyb20gXCIuL2RlcG90L25vZGVQYWNrYWdlXCI7XG5pbXBvcnQge1VybH0gZnJvbSBcIi4vZGVwb3QvdXJsXCI7XG5pbXBvcnQge0dpdFJlcG99IGZyb20gXCIuL2RlcG90L2dpdFJlcG9cIjtcbmltcG9ydCB7R2l0QnJhbmNofSBmcm9tIFwiLi9kZXBvdC9naXRCcmFuY2hcIjtcbmltcG9ydCB7Y29uZmlnIGFzIGdsb2JhbENvbmZpZ30gZnJvbSBcIi4vcHVibGlzaFRvR2l0Q29uZmlnXCI7XG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFR5cGVzXG4vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuXG5pbnRlcmZhY2UgSUluc3RhbmNlQ29uZmlnXG57XG4gICAgZGV2UmVwbzogR2l0UmVwbztcbiAgICBwa2c6IE5vZGVQYWNrYWdlO1xuICAgIGRyeVJ1bjogYm9vbGVhbjtcbiAgICB0YWdzOiBBcnJheTxzdHJpbmc+O1xuICAgIGZvcmNlVGFnczogYm9vbGVhbjtcbiAgICByZW1vdmVUeXBlczogYm9vbGVhbjtcbn1cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gSGVscGVyIEZ1bmN0aW9uc1xuLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cblxuZnVuY3Rpb24gZ2V0QXJncygpOiB5YXJncy5Bcmd1bWVudHNcbntcbiAgICByZXR1cm4geWFyZ3NcbiAgICAudXNhZ2UoXCJQdWJsaXNoZXMgYSBOb2RlLmpzIHBhY2thZ2UgdG8gYSBwcm9qZWN0J3MgR2l0IHJlcG9zaXRvcnkuXCIpXG4gICAgLmhlbHAoKVxuICAgIC5vcHRpb24oXCJ0YWdcIixcbiAgICAgICAge1xuICAgICAgICAgICAgZGVtYW5kT3B0aW9uOiBmYWxzZSxcbiAgICAgICAgICAgIGRlc2NyaWJlOiBcIkFwcGx5IHRoZSBzcGVjaWZpZWQgdGFnIHRvIHRoZSBwdWJsaXNoIGNvbW1pdCAoY2FuIGJlIHVzZWQgbXVsdGlwbGUgdGltZXMpLlwiXG4gICAgICAgIH1cbiAgICApXG4gICAgLm9wdGlvbihcInRhZy12ZXJzaW9uXCIsXG4gICAgICAgIHtcbiAgICAgICAgICAgIHR5cGU6IFwiYm9vbGVhblwiLFxuICAgICAgICAgICAgZGVmYXVsdDogZmFsc2UsXG4gICAgICAgICAgICBkZW1hbmRPcHRpb246IGZhbHNlLFxuICAgICAgICAgICAgZGVzY3JpYmU6IFwiQXBwbHkgYSB0YWcgd2l0aCB0aGUgcHJvamVjdCdzIHZlcnNpb24gbnVtYmVyIChmcm9tIHBhY2thZ2UuanNvbikgdG8gdGhlIHB1Ymxpc2ggY29tbWl0XCJcbiAgICAgICAgfVxuICAgIClcbiAgICAub3B0aW9uKFwiZm9yY2UtdGFnc1wiLFxuICAgICAgICB7XG4gICAgICAgICAgICB0eXBlOiBcImJvb2xlYW5cIixcbiAgICAgICAgICAgIGRlZmF1bHQ6IGZhbHNlLFxuICAgICAgICAgICAgZGVtYW5kT3B0aW9uOiBmYWxzZSxcbiAgICAgICAgICAgIGRlc2NyaWJlOiBcIkZvcmNlcyB0YWdzIHRvIGJlIGFwcGxpZWQsIG1vdmluZyBhbnkgdGhhdCBhbHJlYWR5IGV4aXN0XCJcbiAgICAgICAgfVxuICAgIClcbiAgICAub3B0aW9uKFwiZHJ5LXJ1blwiLFxuICAgICAgICB7XG4gICAgICAgICAgICB0eXBlOiBcImJvb2xlYW5cIixcbiAgICAgICAgICAgIGRlZmF1bHQ6IGZhbHNlLFxuICAgICAgICAgICAgZGVtYW5kT3B0aW9uOiBmYWxzZSxcbiAgICAgICAgICAgIGRlc2NyaWJlOiBcIlBlcmZvcm0gYWxsIG9wZXJhdGlvbnMgYnV0IGRvIG5vdCBwdXNoIHRoZSBwdWJsaXNoIGNvbW1pdCB0byB0aGUgcHJvamVjdCdzIHJlcG9cIlxuICAgICAgICB9XG4gICAgKVxuICAgIC5vcHRpb24oXCJyZW1vdmUtdHlwZXNcIixcbiAgICAgICAge1xuICAgICAgICAgICAgdHlwZTogXCJib29sZWFuXCIsXG4gICAgICAgICAgICBkZWZhdWx0OiBmYWxzZSxcbiAgICAgICAgICAgIGRlbWFuZE9wdGlvbjogZmFsc2UsXG4gICAgICAgICAgICBkZXNjcmliZTogXCJSZW1vdmUgJ0B0eXBlcycgcGFja2FnZXMgZnJvbSBwYWNrYWdlLmpzb24gaW4gcHVibGlzaGVkIGNvbW1pdFwiXG4gICAgICAgIH1cbiAgICApXG4gICAgLnZlcnNpb24oKSAgLy8gdmVyc2lvbiB3aWxsIGJlIHJlYWQgZnJvbSBwYWNrYWdlLmpzb24hXG4gICAgLndyYXAoODApXG4gICAgLmFyZ3Y7XG59XG5cblxuYXN5bmMgZnVuY3Rpb24gZ2V0SW5zdGFuY2VDb25maWcoYXJndjogeWFyZ3MuQXJndW1lbnRzKTogUHJvbWlzZTxJSW5zdGFuY2VDb25maWc+XG57XG4gICAgY29uc3QgZGV2RGlyID0gbmV3IERpcmVjdG9yeShcIi5cIik7XG4gICAgY29uc3QgZGV2UmVwbyA9IGF3YWl0IEdpdFJlcG8uZnJvbURpcmVjdG9yeShkZXZEaXIpO1xuICAgIGNvbnN0IHBrZyA9IGF3YWl0IE5vZGVQYWNrYWdlLmZyb21EaXJlY3RvcnkoZGV2RGlyKTtcblxuICAgIC8vIEJ1aWxkIHRoZSBhcnJheSBvZiB0YWdzIHRoYXQgd2lsbCBiZSBhcHBsaWVkIHRvIHRoZSBwdWJsaXNoIGNvbW1pdC5cbiAgICBsZXQgdGFnczogQXJyYXk8c3RyaW5nPiA9IFtdLmNvbmNhdChhcmd2LnRhZyB8fCBbXSk7XG4gICAgaWYgKGFyZ3ZbXCJ0YWctdmVyc2lvblwiXSlcbiAgICB7XG4gICAgICAgIHRhZ3MucHVzaChgdiR7cGtnLmNvbmZpZy52ZXJzaW9ufWApO1xuICAgIH1cblxuICAgIC8vIE1ha2Ugc3VyZSB3ZSBoYXZlIGF0IGxlYXN0IDEgdGFnIHRvIGFwcGx5LiAgT3RoZXJ3aXNlIGdpdCBtaWdodCBnYXJiYWdlXG4gICAgLy8gY29sbGVjdCB0aGUgcHVibGlzaCBjb21taXQgd2UgYXJlIGFib3V0IHRvIGNyZWF0ZS5cbiAgICBpZiAodGFncy5sZW5ndGggPT09IDApXG4gICAge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJBdCBsZWFzdCBvbmUgdGFnIG11c3QgYmUgYXBwbGllZCBieSB1c2luZyBlaXRoZXIgLS10YWctdmVyc2lvbiBvciAtLXRhZy5cIik7XG4gICAgfVxuXG4gICAgcmV0dXJuIHtcbiAgICAgICAgZHJ5UnVuOiBhcmd2W1wiZHJ5LXJ1blwiXSxcbiAgICAgICAgdGFnczogdGFncyxcbiAgICAgICAgZGV2UmVwbzogZGV2UmVwbyxcbiAgICAgICAgcGtnOiBwa2csXG4gICAgICAgIGZvcmNlVGFnczogYXJndltcImZvcmNlLXRhZ3NcIl0sXG4gICAgICAgIHJlbW92ZVR5cGVzOiBhcmd2W1wicmVtb3ZlLXR5cGVzXCJdXG4gICAgfTtcbn1cblxuXG5hc3luYyBmdW5jdGlvbiBjaGVja0luaXRpYWxDb25kaXRpb25zKGluc3RhbmNlQ29uZmlnOiBJSW5zdGFuY2VDb25maWcpOiBQcm9taXNlPHZvaWQ+XG57XG4gICAgLy8gVE9ETzogV2Ugc2hvdWxkIG1ha2Ugc3VyZSB0aGF0IHRoZSBvcmlnaW4gcmVtb3RlLi4uXG4gICAgLy8gICQgZ2l0IHJlbW90ZSAtdnZcbiAgICAvLyAgb3JpZ2luICBodHRwczovL2dpdGh1Yi5jb20va3dwZXRlcnMvcHVibGlzaHRvZ2l0LmdpdCAoZmV0Y2gpXG4gICAgLy8gIG9yaWdpbiAgaHR0cHM6Ly9naXRodWIuY29tL2t3cGV0ZXJzL3B1Ymxpc2h0b2dpdC5naXQgKHB1c2gpXG4gICAgLy8gIC4uLiBwb2ludHMgdG8gdGhlIHNhbWUgcmVwbyBhcyBwYWNrYWdlLmpzb25cbiAgICAvLyAgKGluc3RhbmNlQ29uZmlnLnBrZy5jb25maWcucmVwb3NpdG9yeS51cmwpLi4uXG4gICAgLy8gIFwicmVwb3NpdG9yeVwiOiB7XG4gICAgLy8gICAgICBcInR5cGVcIjogXCJnaXRcIixcbiAgICAvLyAgICAgIFwidXJsXCI6IFwiZ2l0K2h0dHBzOi8vZ2l0aHViLmNvbS9rd3BldGVycy9wdWJsaXNodG9naXQuZ2l0XCJcbiAgICAvLyAgICB9XG5cbiAgICAvLyBUT0RPOiBXZSBjb3VsZCBqdXN0IGZpZ3VyZSBvdXQgd2hhdCBicmFuY2ggaXMgYmVpbmcgdHJhY2tlZCB1c2luZyB0aGVcbiAgICAvLyAgZm9sbG93aW5nIGNvbW1hbmQuICBUaGVuLCBnZXQgdGhlIHJlbW90ZSdzIG5hbWUgYW5kIHRoZSByZW1vdGUncyBVUkwuXG4gICAgLy8gICQgZ2l0IGJyYW5jaCAtdnZcbiAgICAvLyAgICBkZXZlbG9wICAgICAgICAgICAgICAgICAgY2FmZjlmMSBbb3JpZ2luL2RldmVsb3A6IGJlaGluZCAyXSBNZXJnZSBicmFuY2ggJ2ZlYXR1cmUvMTkzX3Byb2R1Y3Rpb25fb3V0YWdlcy9jb2RlJyBpbnRvICdkZXZlbG9wJ1xuICAgIC8vICAqIHRvZG8vdHNfc3VwcG9ydCAgICAgICAgICA0ZjIwM2QxIFtvcmlnaW4vdG9kby90c19zdXBwb3J0XSBSZXZlcnRlZCB0aGUgcmVwb3NpdG9yeSBwcm9wZXJ0eSBhZnRlciB0ZXN0aW5nLlxuICAgIC8vIC4uLiBvciBldmVuIGJldHRlciAuLi5cbiAgICAvLyAkIGdpdCBzdGF0dXMgLXNiXG4gICAgLy8gIyMgdG9kby90c19zdXBwb3J0Li4ub3JpZ2luL3RvZG8vdHNfc3VwcG9ydFxuXG4gICAgLy8gTWFrZSBzdXJlIHRoZXJlIGFyZSBubyBtb2RpZmllZCBmaWxlcy5cbiAgICBjb25zdCBtb2RpZmllZEZpbGVzID0gYXdhaXQgaW5zdGFuY2VDb25maWcuZGV2UmVwby5tb2RpZmllZEZpbGVzKCk7XG4gICAgaWYgKG1vZGlmaWVkRmlsZXMubGVuZ3RoID4gMCApXG4gICAge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJUaGlzIHJlcG9zaXRvcnkgY29udGFpbnMgbW9kaWZpZWQgZmlsZXMuXCIpO1xuICAgIH1cblxuICAgIC8vIE1ha2Ugc3VyZSB0aGVyZSBhcmUgbm8gdW50cmFja2VkIGZpbGVzLlxuICAgIGNvbnN0IHVudHJhY2tlZEZpbGVzID0gYXdhaXQgaW5zdGFuY2VDb25maWcuZGV2UmVwby51bnRyYWNrZWRGaWxlcygpO1xuICAgIGlmICh1bnRyYWNrZWRGaWxlcy5sZW5ndGggPiAwIClcbiAgICB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcIlRoaXMgcmVwb3NpdG9yeSBjb250YWlucyB1bnRyYWNrZWQgZmlsZXMuXCIpO1xuICAgIH1cblxuICAgIC8vIFRoZSBkZXZlbG9wbWVudCByZXBvIHNob3VsZCBiZSBhdCB0aGUgaGVhZCBvZiBhIEdpdCBicmFuY2guXG4gICAgY29uc3QgZGV2QnJhbmNoID0gYXdhaXQgaW5zdGFuY2VDb25maWcuZGV2UmVwby5nZXRDdXJyZW50QnJhbmNoKCk7XG4gICAgaWYgKCFkZXZCcmFuY2gpXG4gICAge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJIRUFEIGRvZXMgbm90IGN1cnJlbnRseSBwb2ludCB0byBhIGJyYW5jaC5cIik7XG4gICAgfVxuXG4gICAgLy8gVGhlIGRldmVsb3BtZW50IHJlcG8gc2hvdWxkIGJlIHB1c2hlZCB0byBvcmlnaW4uXG4gICAgLy8gTm90ZTogIEhlcmUgd2UgYXJlIGFzc3VtaW5nIHRoYXQgb3JpZ2luIGluIGRldiByZXBvIHBvaW50cyB0byB0aGUgR2l0XG4gICAgLy8gcmVwb3NpdG9yeSBzcGVjaWZpZWQgaW4gcGFja2FnZS5qc29uJ3MgYHJlcG9zaXRvcnlgIHByb3BlcnR5LlxuICAgIGNvbnN0IGRlbHRhcyA9IGF3YWl0IGluc3RhbmNlQ29uZmlnLmRldlJlcG8uZ2V0Q29tbWl0RGVsdGFzKFwib3JpZ2luXCIpO1xuICAgIGlmICgoZGVsdGFzLmFoZWFkID4gMCkgfHwgKGRlbHRhcy5iZWhpbmQgPiAwKSlcbiAgICB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihgVGhlIGJyYW5jaCBpcyAke2RlbHRhcy5haGVhZH0gY29tbWl0cyBhaGVhZCBhbmQgJHtkZWx0YXMuYmVoaW5kfSBjb21taXRzIGJlaGluZC5gKTtcbiAgICB9XG5cbiAgICAvLyBNYWtlIHN1cmUgdGhlIGRpcmVjdG9yeSBpcyBhIE5vZGUgcGFja2FnZS5cbiAgICBpZiAoIWluc3RhbmNlQ29uZmlnLnBrZy5jb25maWcudmVyc2lvbilcbiAgICB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcIlBhY2thZ2UgZG9lcyBub3QgaGF2ZSBhIHZlcnNpb24uXCIpO1xuICAgIH1cblxuICAgIC8vIElmIHdlIGFyZSBub3QgZm9yY2luZyAoaS5lLiBtb3ZpbmcpIHRhZ3MsIHRoZW4gbWFrZSBzdXJlIG5vbmUgb2YgdGhlIHRhZ3NcbiAgICAvLyB3ZSBhcmUgYXBwbHlpbmcgYWxyZWFkeSBleGlzdC5cbiAgICBpZiAoIWluc3RhbmNlQ29uZmlnLmZvcmNlVGFncylcbiAgICB7XG4gICAgICAgIGNvbnN0IGV4aXN0aW5nVGFncyA9IGF3YWl0IGluc3RhbmNlQ29uZmlnLmRldlJlcG8udGFncygpO1xuICAgICAgICBjb25zdCBhbHJlYWR5RXhpc3QgPSBfLmludGVyc2VjdGlvbihleGlzdGluZ1RhZ3MsIGluc3RhbmNlQ29uZmlnLnRhZ3MpO1xuICAgICAgICBpZiAoYWxyZWFkeUV4aXN0Lmxlbmd0aCA+IDApXG4gICAgICAgIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgVGhlIGZvbGxvd2luZyB0YWdzIGFscmVhZHkgZXhpc3Q6ICR7YWxyZWFkeUV4aXN0LmpvaW4oXCIsIFwiKX1gKTtcbiAgICAgICAgfVxuICAgIH1cbn1cblxuXG5hc3luYyBmdW5jdGlvbiBtYWluKCk6IFByb21pc2U8dm9pZD5cbntcbiAgICAvLyBHZXQgdGhlIGNvbW1hbmQgbGluZSBhcmdzIGZpcnN0LiAgSWYgdGhlIHVzZXIgaXMganVzdCBkb2luZyAtLWhlbHAsIHdlXG4gICAgLy8gZG9uJ3Qgd2FudCB0byBkbyBhbnl0aGluZyBlbHNlLlxuICAgIGNvbnN0IGFyZ3YgPSBnZXRBcmdzKCk7XG5cbiAgICBnbG9iYWxDb25maWcuaW5pdCgpO1xuXG4gICAgLy8gUmVzb2x2ZSB0aGUgY29tbWFuZCBsaW5lIGFyZ3VtZW50cyBpbnRvIGEgY29uY3JldGUgY29uZmlndXJhdGlvbiBmb3IgdGhpc1xuICAgIC8vIGluc3RhbmNlLlxuICAgIGNvbnN0IGluc3RhbmNlQ29uZmlnID0gYXdhaXQgZ2V0SW5zdGFuY2VDb25maWcoYXJndik7XG5cbiAgICAvLyBHaXZlbiB0aGUgaW5zdGFuY2UgY29uZmlndXJhdGlvbiwgZGV0ZXJtaW5lIGlmIGV2ZXJ5dGhpbmcgaXMgaW4gYSB2YWxpZFxuICAgIC8vIHN0YXRlLlxuICAgIGF3YWl0IGNoZWNrSW5pdGlhbENvbmRpdGlvbnMoaW5zdGFuY2VDb25maWcpO1xuXG4gICAgY29uc3QgZGV2Q29tbWl0SGFzaCA9IGF3YWl0IGluc3RhbmNlQ29uZmlnLmRldlJlcG8uY3VycmVudENvbW1pdEhhc2goKTtcbiAgICBjb25zdCBkZXZCcmFuY2ggPSAoYXdhaXQgaW5zdGFuY2VDb25maWcuZGV2UmVwby5nZXRDdXJyZW50QnJhbmNoKCkpITtcblxuICAgIC8vIENsZWFyIG91dCBzcGFjZSBmb3IgdGhlIHB1Ymxpc2ggcmVwby5cbiAgICBjb25zdCBwdWJsaXNoRGlyID0gbmV3IERpcmVjdG9yeShnbG9iYWxDb25maWcudG1wRGlyLCBpbnN0YW5jZUNvbmZpZy5wa2cucHJvamVjdE5hbWUpO1xuICAgIHB1Ymxpc2hEaXIuZGVsZXRlU3luYygpO1xuXG4gICAgLy8gVE9ETzogUHJpbnQgb3V0IHRoZSBVUkwgb2YgdGhlIHJlcG9zaXRvcnkgY2xvbmluZyBmcm9tIChhbmQgcHVibGlzaGluZyB0bykuXG5cbiAgICAvLyBDcmVhdGUgYSBjbG9uZSBvZiB0aGUgcmVwbyBmb3IgcHVibGlzaGluZyBwdXJwb3Nlcy5cbiAgICBjb25zdCByZXBvVXJsID0gVXJsLmZyb21TdHJpbmcoaW5zdGFuY2VDb25maWcucGtnLmNvbmZpZy5yZXBvc2l0b3J5LnVybCk7XG4gICAgaWYgKCFyZXBvVXJsKVxuICAgIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiSW52YWxpZCByZXBvc2l0b3J5IFVSTC5cIik7XG4gICAgfVxuICAgIGNvbnNvbGUubG9nKGBDcmVhdGluZyB0ZW1wb3JhcnkgcmVwbyBjbG9uZSBhdCAke3B1Ymxpc2hEaXIudG9TdHJpbmcoKX0uLi5gKTtcbiAgICBjb25zdCBwdWJsaXNoUmVwbyA9IGF3YWl0IEdpdFJlcG8uY2xvbmUocmVwb1VybCwgZ2xvYmFsQ29uZmlnLnRtcERpcik7XG5cbiAgICAvLyBDaGVja291dCB0aGUgY29tbWl0IHRoZSBkZXZSZXBvIGlzIGF0LlxuICAgIGNvbnNvbGUubG9nKGBDaGVja2luZyBvdXQgY3VycmVudCBkZXZlbG9wbWVudCBjb21taXQgJHtkZXZDb21taXRIYXNoLnRvU2hvcnRTdHJpbmcoKX0uLi5gKTtcbiAgICBhd2FpdCBwdWJsaXNoUmVwby5jaGVja291dENvbW1pdChkZXZDb21taXRIYXNoKTtcblxuICAgIC8vIENyZWF0ZSBhIHRlbXBvcmFyeSBicmFuY2ggb24gd2hpY2ggdGhlIHB1Ymxpc2hlZCBmaWxlcyB3aWxsIGJlIGNvbW1pdHRlZC5cbiAgICBjb25zb2xlLmxvZyhcIkNyZWF0aW5nIHRlbXBvcmFyeSBicmFuY2guLi5cIik7XG4gICAgYXdhaXQgY2hlY2tvdXRUZW1wQnJhbmNoKHB1Ymxpc2hSZXBvLCBcInB1Ymxpc2h0b2dpdFwiKTtcblxuICAgIC8vIFJlbW92ZSBhbGwgZmlsZXMgdW5kZXIgdmVyc2lvbiBjb250cm9sIGFuZCBwcnVuZSBkaXJlY3RvcmllcyB0aGF0IGFyZVxuICAgIC8vIGVtcHR5LlxuICAgIGNvbnNvbGUubG9nKFwiRGVsZXRpbmcgYWxsIGZpbGVzLi4uXCIpO1xuICAgIGF3YWl0IGRlbGV0ZVRyYWNrZWRGaWxlcyhwdWJsaXNoUmVwbyk7XG4gICAgYXdhaXQgcHVibGlzaFJlcG8uZGlyZWN0b3J5LnBydW5lKCk7XG5cbiAgICAvLyBQdWJsaXNoIHRoZSBkZXYgcmVwbyB0byB0aGUgcHVibGlzaCBkaXJlY3RvcnkuXG4gICAgY29uc29sZS5sb2coXCJQdWJsaXNoaW5nIHBhY2thZ2UgY29udGVudHMgdG8gcHVibGlzaCByZXBvc2l0b3J5Li4uXCIpO1xuICAgIGF3YWl0IGluc3RhbmNlQ29uZmlnLnBrZy5wdWJsaXNoKHB1Ymxpc2hEaXIsIGZhbHNlLCBnbG9iYWxDb25maWcudG1wRGlyKTtcblxuICAgIC8vIElmIHJlcXVlc3RlZCwgcmVtb3ZlIGFsbCBcIkB0eXBlc1wiIHBhY2thZ2VzIGZyb20gcGFja2FnZS5qc29uLlxuICAgIGlmIChpbnN0YW5jZUNvbmZpZy5yZW1vdmVUeXBlcykge1xuICAgICAgICBjb25zdCBwa2dKc29uID0gbmV3IEZpbGUocHVibGlzaERpciwgXCJwYWNrYWdlLmpzb25cIik7XG4gICAgICAgIGNvbnN0IGV4aXN0cyA9IHBrZ0pzb24uZXhpc3RzU3luYygpO1xuICAgICAgICBpZiAoIWV4aXN0cykge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiRGlkIG5vdCBmaW5kIGEgcGFja2FnZS5qc29uIGZpbGUgaW4gdGhlIHB1Ymxpc2hlZCBjb250ZW50cy5cIik7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBwa2dKc29uQ29udGVudHMgPSBwa2dKc29uLnJlYWRKc29uU3luYzxhbnk+KCk7XG5cbiAgICAgICAgLy8gUmVtb3ZlIEB0eXBlcyBmcm9tIGRldkRlcGVuZGVuY2llc1xuICAgICAgICBmb3IgKGNvbnN0IGN1clBhY2thZ2VOYW1lIG9mIE9iamVjdC5rZXlzKHBrZ0pzb25Db250ZW50cy5kZXZEZXBlbmRlbmNpZXMpKSB7XG4gICAgICAgICAgICBpZiAoL15AdHlwZXNcXC8vLnRlc3QoY3VyUGFja2FnZU5hbWUpKSB7XG4gICAgICAgICAgICAgICAgZGVsZXRlIHBrZ0pzb25Db250ZW50cy5kZXZEZXBlbmRlbmNpZXNbY3VyUGFja2FnZU5hbWVdO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgLy8gUmVtb3ZlIEB0eXBlcyBmcm9tIGRlcGVuZGVuY2llc1xuICAgICAgICBmb3IgKGNvbnN0IGN1clBhY2thZ2VOYW1lIG9mIE9iamVjdC5rZXlzKHBrZ0pzb25Db250ZW50cy5kZXBlbmRlbmNpZXMpKSB7XG4gICAgICAgICAgICBpZiAoL15AdHlwZXNcXC8vLnRlc3QoY3VyUGFja2FnZU5hbWUpKSB7XG4gICAgICAgICAgICAgICAgZGVsZXRlIHBrZ0pzb25Db250ZW50cy5kZXBlbmRlbmNpZXNbY3VyUGFja2FnZU5hbWVdO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcGtnSnNvbi53cml0ZUpzb25TeW5jKHBrZ0pzb25Db250ZW50cyk7XG4gICAgfVxuXG5cbiAgICAvLyBTdGFnZSBhbmQgY29tbWl0IHRoZSBwdWJsaXNoZWQgZmlsZXMuXG4gICAgY29uc29sZS5sb2coXCJDb21taXRpbmcgcHVibGlzaGVkIGZpbGVzLi4uXCIpO1xuICAgIGF3YWl0IHB1Ymxpc2hSZXBvLnN0YWdlQWxsKCk7XG4gICAgYXdhaXQgcHVibGlzaFJlcG8uY29tbWl0KFwiUHVibGlzaGVkIHVzaW5nIHB1Ymxpc2gtdG8tZ2l0LlwiKTtcblxuICAgIC8vIFRPRE86IElmIHRoZSBzb3VyY2UgcmVwbyBoYXMgYSBDSEFOR0VMT0cubWQsIGFkZCBpdHMgY29udGVudHMgYXMgdGhlIGFubm90YXRlZCB0YWcgbWVzc2FnZS5cblxuICAgIGNvbnN0IHB1Ymxpc2hDb21taXRIYXNoID0gYXdhaXQgcHVibGlzaFJlcG8uY3VycmVudENvbW1pdEhhc2goKTtcblxuICAgIC8vIEFwcGx5IHRhZ3MuXG4gICAgYXdhaXQgUHJvbWlzZS5hbGwoXy5tYXAoaW5zdGFuY2VDb25maWcudGFncywgKGN1clRhZ05hbWUpID0+IHtcbiAgICAgICAgY29uc29sZS5sb2coYENyZWF0aW5nIHRhZyAke2N1clRhZ05hbWV9Li4uYCk7XG4gICAgICAgIGNvbnN0IHRhZ01lc3NhZ2UgPVxuICAgICAgICAgICAgXCJQdWJsaXNoZWQgdXNpbmcgcHVibGlzaHRvZ2l0LlxcblwiICtcbiAgICAgICAgICAgIGBTb3VyY2UgYnJhbmNoOiAke2RldkJyYW5jaC5uYW1lfVxcbmAgK1xuICAgICAgICAgICAgYFNvdXJjZSBjb21taXQ6ICR7ZGV2Q29tbWl0SGFzaC50b1N0cmluZygpfSBbJHtkZXZDb21taXRIYXNoLnRvU2hvcnRTdHJpbmcoKX1dYDtcbiAgICAgICAgcmV0dXJuIHB1Ymxpc2hSZXBvLmNyZWF0ZVRhZyhjdXJUYWdOYW1lLCB0YWdNZXNzYWdlLCB0cnVlKTtcbiAgICB9KSk7XG5cbiAgICAvLyBJZiBkb2luZyBhIFwiZHJ5IHJ1blwiLCBzdG9wLlxuICAgIGlmIChpbnN0YW5jZUNvbmZpZy5kcnlSdW4pXG4gICAge1xuICAgICAgICBjb25zdCBtc2cgPSBbXG4gICAgICAgICAgICBcIlJ1bm5pbmcgaW4gZHJ5LXJ1biBtb2RlLiAgVGhlIHJlcG9zaXRvcnkgaW4gdGhlIGZvbGxvd2luZyB0ZW1wb3JhcnkgZGlyZWN0b3J5XCIsXG4gICAgICAgICAgICBcImhhcyBiZWVuIGxlZnQgcmVhZHkgdG8gcHVzaCB0byBhIHB1YmxpYyBzZXJ2ZXIuXCIsXG4gICAgICAgICAgICBwdWJsaXNoUmVwby5kaXJlY3RvcnkudG9TdHJpbmcoKVxuICAgICAgICBdO1xuICAgICAgICBjb25zb2xlLmxvZyhtc2cuam9pbihcIlxcblwiKSk7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICAvLyBQdXNoIGFsbCB0YWdzLlxuICAgIGF3YWl0IFByb21pc2UuYWxsKF8ubWFwKGluc3RhbmNlQ29uZmlnLnRhZ3MsIChjdXJUYWdOYW1lKSA9PiB7XG4gICAgICAgIC8vIFRPRE86IENoYW5nZSB0aGUgZm9sbG93aW5nIFwib3JpZ2luXCIgaW4gdGV4dCBvdXRwdXQgdG8gdGhlIHJlcG8ncyBVUkwuXG4gICAgICAgIC8vIE5vdGU6ICBJdCBpcyBvayB0byBrZWVwIHRoZSBcIm9yaWdpblwiIGluIHRoZSBwdXNoVGFnKCkgY2FsbC5cbiAgICAgICAgY29uc29sZS5sb2coYFB1c2hpbmcgdGFnICR7Y3VyVGFnTmFtZX0gdG8gb3JpZ2luLmApO1xuICAgICAgICByZXR1cm4gcHVibGlzaFJlcG8ucHVzaFRhZyhjdXJUYWdOYW1lLCBcIm9yaWdpblwiLCB0cnVlKTtcbiAgICB9KSk7XG5cbiAgICAvLyBGZXRjaCB0aGUgbmV3bHkgY3JlYXRlZCB0YWdzIGludG8gdGhlIGRldiByZXBvLlxuICAgIC8vIFRPRE86IENoYW5nZSB0aGUgZm9sbG93aW5nIHJlbW90ZSBuYW1lIHRvIHRoZSByZW1vdGUgZGlzY292ZXJlZCBhYm92ZS5cbiAgICBhd2FpdCBpbnN0YW5jZUNvbmZpZy5kZXZSZXBvLmZldGNoKFwib3JpZ2luXCIsIHRydWUpO1xuXG4gICAgLy8gUHJpbnQgYSBjb21wbGV0aW9uIG1lc3NhZ2UuXG4gICAgLy8gVGVsbCB0aGUgdXNlciBob3cgdG8gaW5jbHVkZSB0aGUgcHVibGlzaGVkIHJlcG9zaXRvcnkgaW50byBhbm90aGVyXG4gICAgLy8gcHJvamVjdCdzIGRlcGVuZGVuY2llcy5cbiAgICBjb25zdCBkZXBlbmRlbmN5VXJsID0gcmVwb1VybC5yZXBsYWNlUHJvdG9jb2woXCJnaXQraHR0cHNcIikudG9TdHJpbmcoKTtcbiAgICBjb25zdCBkb25lTWVzc2FnZSA9IFtcbiAgICAgICAgXCJEb25lLlwiLFxuICAgICAgICBcIlRvIGluY2x1ZGUgdGhlIHB1Ymxpc2hlZCBsaWJyYXJ5IGluIGEgTm9kZS5qcyBwcm9qZWN0LCBleGVjdXRlIHRoZSBmb2xsb3dpbmcgY29tbWFuZDpcIlxuICAgIF0uY29uY2F0KF8ubWFwKGluc3RhbmNlQ29uZmlnLnRhZ3MsIChjdXJUYWdOYW1lKSA9PiB7XG4gICAgICAgIHJldHVybiBgbnBtIGluc3RhbGwgJHtkZXBlbmRlbmN5VXJsfSMke2N1clRhZ05hbWV9YDtcbiAgICB9KSlcbiAgICAuY29uY2F0KGBucG0gaW5zdGFsbCAke2RlcGVuZGVuY3lVcmx9IyR7cHVibGlzaENvbW1pdEhhc2gudG9TaG9ydFN0cmluZygpfWApO1xuICAgIGNvbnNvbGUubG9nKGRvbmVNZXNzYWdlLmpvaW4oXCJcXG5cIikpO1xufVxuXG5cbmFzeW5jIGZ1bmN0aW9uIGNoZWNrb3V0VGVtcEJyYW5jaChyZXBvOiBHaXRSZXBvLCBiYXNlTmFtZTogc3RyaW5nKTogUHJvbWlzZTxHaXRCcmFuY2g+XG57XG4gICAgY29uc3Qgbm93ID0gbmV3IERhdGUoKTtcbiAgICBjb25zdCBkYXRlc3RhbXAgPVxuICAgICAgICBub3cuZ2V0RnVsbFllYXIoKSArIFwiX1wiICsgbm93LmdldE1vbnRoKCkgKyBcIl9cIiArIG5vdy5nZXREYXRlKCkgKyBcIl9cIiArXG4gICAgICAgIG5vdy5nZXRIb3VycygpICsgXCJfXCIgKyBub3cuZ2V0TWludXRlcygpICsgXCJfXCIgKyBub3cuZ2V0U2Vjb25kcygpICsgXCIuXCIgKyBub3cuZ2V0TWlsbGlzZWNvbmRzKCk7XG5cbiAgICBjb25zdCB1c2VyID0gdXNlckluZm8oKTtcblxuICAgIGNvbnN0IHRtcEJyYW5jaE5hbWUgPSBgJHtiYXNlTmFtZX0tJHt1c2VyLnVzZXJuYW1lfS0ke2RhdGVzdGFtcH1gO1xuICAgIGNvbnN0IHRtcEJyYW5jaCA9IGF3YWl0IEdpdEJyYW5jaC5jcmVhdGUocmVwbywgdG1wQnJhbmNoTmFtZSk7XG4gICAgYXdhaXQgcmVwby5jaGVja291dEJyYW5jaCh0bXBCcmFuY2gsIHRydWUpO1xuICAgIHJldHVybiB0bXBCcmFuY2g7XG59XG5cblxuLyoqXG4gKiBEZWxldGVzIGFsbCB0cmFja2VkIGZpbGVzIHdpdGhpbiBhIHJlcG8uXG4gKiBAcGFyYW0gcmVwbyAtIFRoZSByZXBvIHRvIGNsZWFyXG4gKiBAcmV0dXJuIEEgUHJvbWlzZSB0aGF0IGlzIHJlc29sdmVkIHdoZW4gYWxsIGZpbGVzIGhhdmUgYmVlbiBkZWxldGVkLlxuICovXG5hc3luYyBmdW5jdGlvbiBkZWxldGVUcmFja2VkRmlsZXMocmVwbzogR2l0UmVwbyk6IFByb21pc2U8dm9pZD5cbntcbiAgICBjb25zdCBmaWxlcyA9IGF3YWl0IHJlcG8uZmlsZXMoKTtcbiAgICBjb25zdCBkZWxldGVQcm9taXNlcyA9IF8ubWFwKGZpbGVzLCAoY3VyRmlsZSkgPT4ge1xuICAgICAgICByZXR1cm4gY3VyRmlsZS5kZWxldGUoKTtcbiAgICB9KTtcblxuICAgIGF3YWl0IFByb21pc2UuYWxsKGRlbGV0ZVByb21pc2VzKTtcbn1cblxuXG5tYWluKClcbi5jYXRjaCgoZXJyKSA9PiB7XG4gICAgY29uc29sZS5sb2coSlNPTi5zdHJpbmdpZnkoZXJyLCB1bmRlZmluZWQsIDQpKTtcbiAgICB0aHJvdyBlcnI7XG59KTtcbiJdfQ==
