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
        .option("tag", {
        demandOption: false,
        describe: "An additional tag to apply to the published commit (can " +
            "be used multiple times).  If the tag already exists, it " +
            "will be moved."
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
    if (argv.tag) {
        cmdLineOpts.additionalTags = [].concat(argv.tag);
    }
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
        var cmdLineOpts, src, publishProjName, publishDir, publishRepoPath, publishRepo, newTagName, hasTag, msg, majorBranchName, majorBranch, minorBranchName, minorBranch, publishPackageJsonFile, publishPackageJson, commitMsg, tags, msg, dependencyUrl, npmInstallCmd, doneMessage;
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
                    tags = [newTagName];
                    if (cmdLineOpts.additionalTags) {
                        tags = tags.concat(cmdLineOpts.additionalTags);
                    }
                    return [4 /*yield*/, Promise.all(_.map(tags, function (curTag) {
                            console.log("Creating tag: " + curTag);
                            return publishRepo.createTag(curTag, "", true);
                        }))];
                case 15:
                    _a.sent();
                    //
                    // If doing a "dry run", stop.
                    //
                    if (cmdLineOpts.dryRun) {
                        msg = [
                            "Running in dry-run mode.  The repository in the following temporary directory",
                            "has been left ready to push to a public server.",
                            publishDir.toString()
                        ];
                        console.log(msg.join("\n"));
                        return [2 /*return*/];
                    }
                    //
                    // Push the branch.
                    //
                    console.log("Pushing branch to origin...");
                    return [4 /*yield*/, publishRepo.pushCurrentBranch("origin")];
                case 16:
                    _a.sent();
                    //
                    // Push all tags.
                    //
                    return [4 /*yield*/, Promise.all(_.map(tags, function (curTag) {
                            console.log("Pushing tag " + curTag + " to origin.");
                            return publishRepo.pushTag(curTag, "origin", true);
                        }))];
                case 17:
                    //
                    // Push all tags.
                    //
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

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9wdWJsaXNoLXRvLWdpdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUVBLHlDQUFzQztBQUN0QywrQkFBNEI7QUFDNUIscUNBQWtDO0FBQ2xDLDJEQUE0RDtBQUU1RCw2Q0FBd0Q7QUFDeEQsNkNBQStEO0FBQy9ELG1DQUFnQztBQUNoQyx5Q0FBc0M7QUFDdEMsMEJBQTRCO0FBQzVCLDZCQUEwQjtBQUMxQiw2QkFBK0I7QUFXL0I7SUFFSSxJQUFNLElBQUksR0FBRyxLQUFLO1NBQ2pCLEtBQUssQ0FBQyxpRkFBaUYsQ0FBQztTQUN4RixJQUFJLEVBQUU7U0FDTixNQUFNLENBQ0gsU0FBUyxFQUNUO1FBQ0ksSUFBSSxFQUFFLFNBQVM7UUFDZixPQUFPLEVBQUUsS0FBSztRQUNkLFlBQVksRUFBRSxLQUFLO1FBQ25CLFFBQVEsRUFBRSxrREFBa0Q7S0FDL0QsQ0FDSjtTQUNBLE1BQU0sQ0FDSCxLQUFLLEVBQ0w7UUFDSSxZQUFZLEVBQUUsS0FBSztRQUNuQixRQUFRLEVBQUUsMERBQTBEO1lBQzFELDBEQUEwRDtZQUMxRCxnQkFBZ0I7S0FDN0IsQ0FDSjtTQUNBLE9BQU8sRUFBRSxDQUFFLDBDQUEwQztTQUNyRCxhQUFhLENBQUMsQ0FBQyxDQUFDO1NBQ2hCLElBQUksQ0FBQyxFQUFFLENBQUM7U0FDUixJQUFJLENBQUM7SUFFTiw0RUFBNEU7SUFDNUUsaURBQWlEO0lBQ2pELElBQU0sU0FBUyxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksR0FBRyxDQUFDO0lBQ25DLElBQU0sTUFBTSxHQUFHLElBQUkscUJBQVMsQ0FBQyxTQUFTLENBQUMsQ0FBQztJQUN4QyxFQUFFLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxVQUFVLEVBQUUsQ0FBQyxDQUN6QixDQUFDO1FBQ0csT0FBTyxDQUFDLEdBQUcsQ0FBQyxtQkFBaUIsU0FBUyxxQkFBa0IsQ0FB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TSxnQkFBYSxDQUFDLENBQUM7NEJBQ2hELE1BQU0sQ0FBQyxXQUFXLENBQUMsT0FBTyxDQUFDLE1BQU0sRUFBRSxRQUFRLEVBQUUsSUFBSSxDQUFDLENBQUM7d0JBQ3ZELENBQUMsQ0FBQyxDQUFDLEVBQUE7O29CQU5ILEVBQUU7b0JBQ0YsaUJBQWlCO29CQUNqQixFQUFFO29CQUNGLFNBR0csQ0FBQztvQkFPRSxhQUFhLEdBQUcsU0FBRyxDQUFDLFdBQVcsQ0FBQyxHQUFHLENBQUMsa0JBQWtCLENBQUMsaUJBQWlCLEVBQUUsV0FBVyxDQUFDLENBQUM7b0JBQ3ZGLGFBQWEsR0FBRyxpQkFBZSxhQUFhLFNBQUksVUFBWSxDQUFDO29CQUM3RCxXQUFXLEdBQUc7d0JBQ2hCLE9BQU87d0JBQ1AsdUZBQXVGO3dCQUN2RixhQUFhO3FCQUNoQixDQUFDO29CQUNGLE9BQU8sQ0FBQyxHQUFHLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDOzs7OztDQUd2QztBQUdEOzs7O0dBSUc7QUFDSCw0QkFBa0MsSUFBYTs7Ozs7d0JBRTdCLHFCQUFNLElBQUksQ0FBQyxLQUFLLEVBQUUsRUFBQTs7b0JBQTFCLEtBQUssR0FBRyxTQUFrQjtvQkFDMUIsY0FBYyxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsS0FBSyxFQUFFLFVBQUMsT0FBTzt3QkFDeEMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxNQUFNLEVBQUUsQ0FBQztvQkFDNUIsQ0FBQyxDQUFDLENBQUM7b0JBRUgscUJBQU0sT0FBTyxDQUFDLEdBQUcsQ0FBQyxjQUFjLENBQUMsRUFBQTs7b0JBQWpDLFNBQWlDLENBQUM7Ozs7O0NBQ3JDO0FBR0QsSUFBSSxFQUFFLENBQUMiLCJmaWxlIjoicHVibGlzaC10by1naXQuanMiLCJzb3VyY2VzQ29udGVudCI6WyIjIS91c3IvYmluL2VudiBub2RlXG5cbmltcG9ydCB7RGlyZWN0b3J5fSBmcm9tIFwiLi9kaXJlY3RvcnlcIjtcbmltcG9ydCB7RmlsZX0gZnJvbSBcIi4vZmlsZVwiO1xuaW1wb3J0IHtHaXRSZXBvfSBmcm9tIFwiLi9naXRSZXBvXCI7XG5pbXBvcnQge2NvbmZpZyBhcyBnbG9iYWxDb25maWd9IGZyb20gXCIuL3B1Ymxpc2hUb0dpdENvbmZpZ1wiO1xuaW1wb3J0IHtJUHVibGlzaFRvR2l0Q29uZmlnfSBmcm9tIFwiLi9jb25maWdIZWxwZXJzXCI7XG5pbXBvcnQge0lQYWNrYWdlSnNvbiwgTm9kZVBhY2thZ2V9IGZyb20gXCIuL25vZGVQYWNrYWdlXCI7XG5pbXBvcnQge0dpdFJlcG9QYXRoLCBnaXRVcmxUb1Byb2plY3ROYW1lfSBmcm9tIFwiLi9HaXRSZXBvUGF0aFwiO1xuaW1wb3J0IHtTZW1WZXJ9IGZyb20gXCIuL1NlbVZlclwiO1xuaW1wb3J0IHtHaXRCcmFuY2h9IGZyb20gXCIuL2dpdEJyYW5jaFwiO1xuaW1wb3J0ICogYXMgXyBmcm9tIFwibG9kYXNoXCI7XG5pbXBvcnQge1VybH0gZnJvbSBcIi4vdXJsXCI7XG5pbXBvcnQgKiBhcyB5YXJncyBmcm9tIFwieWFyZ3NcIjtcblxuXG5pbnRlcmZhY2UgSUNtZExpbmVPcHRzXG57XG4gICAgZHJ5UnVuOiBib29sZWFuO1xuICAgIHNyY0RpcjogRGlyZWN0b3J5O1xuICAgIGFkZGl0aW9uYWxUYWdzPzogQXJyYXk8c3RyaW5nPjtcbn1cblxuXG5mdW5jdGlvbiBwYXJzZUFyZ3MoKTogSUNtZExpbmVPcHRzIHwgdW5kZWZpbmVkXG57XG4gICAgY29uc3QgYXJndiA9IHlhcmdzXG4gICAgLnVzYWdlKFwiUHVibGlzaGVzIGEgTm9kZSBwYWNrYWdlIHRvIGEgR2l0IHJlcG8uXFxuVXNhZ2U6ICQwIFstLWRyeS1ydW5dIHNvdXJjZV9kaXJlY3RvcnlcIilcbiAgICAuaGVscCgpXG4gICAgLm9wdGlvbihcbiAgICAgICAgXCJkcnktcnVuXCIsXG4gICAgICAgIHtcbiAgICAgICAgICAgIHR5cGU6IFwiYm9vbGVhblwiLFxuICAgICAgICAgICAgZGVmYXVsdDogZmFsc2UsXG4gICAgICAgICAgICBkZW1hbmRPcHRpb246IGZhbHNlLFxuICAgICAgICAgICAgZGVzY3JpYmU6IFwiUGVyZm9ybSBhbGwgb3BlcmF0aW9ucyBidXQgZG8gbm90IHB1c2ggdG8gb3JpZ2luXCJcbiAgICAgICAgfVxuICAgIClcbiAgICAub3B0aW9uKFxuICAgICAgICBcInRhZ1wiLFxuICAgICAgICB7XG4gICAgICAgICAgICBkZW1hbmRPcHRpb246IGZhbHNlLFxuICAgICAgICAgICAgZGVzY3JpYmU6IFwiQW4gYWRkaXRpb25hbCB0YWcgdG8gYXBwbHkgdG8gdGhlIHB1Ymxpc2hlZCBjb21taXQgKGNhbiBcIiArXG4gICAgICAgICAgICAgICAgICAgICAgXCJiZSB1c2VkIG11bHRpcGxlIHRpbWVzKS4gIElmIHRoZSB0YWcgYWxyZWFkeSBleGlzdHMsIGl0IFwiICtcbiAgICAgICAgICAgICAgICAgICAgICBcIndpbGwgYmUgbW92ZWQuXCJcbiAgICAgICAgfVxuICAgIClcbiAgICAudmVyc2lvbigpICAvLyB2ZXJzaW9uIHdpbGwgYmUgcmVhZCBmcm9tIHBhY2thZ2UuanNvbiFcbiAgICAuZGVtYW5kQ29tbWFuZCgxKVxuICAgIC53cmFwKDgwKVxuICAgIC5hcmd2O1xuXG4gICAgLy8gR2V0IHRoZSBzb3VyY2UgcHJvamVjdCBkaXJlY3RvcnkgZnJvbSB0aGUgY29tbWFuZCBsaW5lIGFyZ3VtZW50cy4gIElmIG5vdFxuICAgIC8vIHByZXNlbnQsIGFzc3VtZSB0aGUgY3VycmVudCB3b3JraW5nIGRpcmVjdG9yeS5cbiAgICBjb25zdCBzcmNEaXJTdHIgPSBhcmd2Ll9bMF0gfHwgXCIuXCI7XG4gICAgY29uc3Qgc3JjRGlyID0gbmV3IERpcmVjdG9yeShzcmNEaXJTdHIpO1xuICAgIGlmICghc3JjRGlyLmV4aXN0c1N5bmMoKSlcbiAgICB7XG4gICAgICAgIGNvbnNvbGUubG9nKGBUaGUgZGlyZWN0b3J5ICR7c3JjRGlyU3RyfSBkb2VzIG5vdCBleGlzdC5gKTtcbiAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICB9XG5cbiAgICBjb25zdCBjbWRMaW5lT3B0czogSUNtZExpbmVPcHRzID0ge1xuICAgICAgICBkcnlSdW46IGFyZ3ZbXCJkcnktcnVuXCJdLFxuICAgICAgICBzcmNEaXI6IHNyY0RpclxuICAgIH07XG5cbiAgICBpZiAoYXJndi50YWcpIHtcbiAgICAgICAgY21kTGluZU9wdHMuYWRkaXRpb25hbFRhZ3MgPSBbXS5jb25jYXQoYXJndi50YWcpO1xuICAgIH1cblxuICAgIHJldHVybiBjbWRMaW5lT3B0cztcbn1cblxuXG5hc3luYyBmdW5jdGlvbiBnZXRTcmMoY21kTGluZU9wdHM6IElDbWRMaW5lT3B0cyk6XG5Qcm9taXNlPHtcbiAgICBkaXI6IERpcmVjdG9yeSxcbiAgICByZXBvOiBHaXRSZXBvLFxuICAgIHBrZzogTm9kZVBhY2thZ2UsXG4gICAgdmVyc2lvbjogU2VtVmVyLFxuICAgIHB1Ymxpc2hUb0dpdENvbmZpZzogSVB1Ymxpc2hUb0dpdENvbmZpZ1xufT5cbntcbiAgICBjb25zdCBzcmNSZXBvID0gYXdhaXQgR2l0UmVwby5mcm9tRGlyZWN0b3J5KGNtZExpbmVPcHRzLnNyY0Rpcik7XG5cbiAgICAvLyBNYWtlIHN1cmUgdGhlIHNwZWNpZmllZCBkaXJlY3RvcnkgaXMgYSBOUE0gcHJvamVjdCAoY29udGFpbnMgYVxuICAgIC8vIHBhY2thZ2UuanNvbikuXG4gICAgY29uc3QgcGtnID0gYXdhaXQgTm9kZVBhY2thZ2UuZnJvbURpcmVjdG9yeShjbWRMaW5lT3B0cy5zcmNEaXIpXG4gICAgLmNhdGNoKCgpID0+IHtcbiAgICAgICAgcmV0dXJuIFByb21pc2UucmVqZWN0KG5ldyBFcnJvcihgVGhlIGRpcmVjdG9yeSAke2NtZExpbmVPcHRzLnNyY0Rpci50b1N0cmluZygpfSBpcyBub3QgYSBOUE0gcGFja2FnZS5gKSk7XG4gICAgfSk7XG5cbiAgICAvLyBNYWtlIHN1cmUgdGhlIHNwZWNpZmllZCBkaXJlY3RvcnkgaGFzIGEgcHVibGlzaHRvZ2l0Lmpzb24uXG4gICAgY29uc3QgY29uZmlnRmlsZSA9IG5ldyBGaWxlKGNtZExpbmVPcHRzLnNyY0RpciwgXCJwdWJsaXNodG9naXQuanNvblwiKTtcbiAgICBpZiAoIWNvbmZpZ0ZpbGUuZXhpc3RzU3luYygpKSB7XG4gICAgICAgIHJldHVybiBQcm9taXNlLnJlamVjdChuZXcgRXJyb3IoYENvdWxkIG5vdCBmaW5kIGZpbGUgJHtjb25maWdGaWxlLnRvU3RyaW5nKCl9LmApKTtcbiAgICB9XG5cbiAgICBjb25zdCBwdWJsaXNoVG9HaXRDb25maWcgPSBjb25maWdGaWxlLnJlYWRKc29uU3luYzxJUHVibGlzaFRvR2l0Q29uZmlnPigpO1xuICAgIGlmICghcHVibGlzaFRvR2l0Q29uZmlnKSB7XG4gICAgICAgIHJldHVybiBQcm9taXNlLnJlamVjdChuZXcgRXJyb3IoYENvdWxkIG5vdCByZWFkIGNvbmZpZ3VyYXRpb24gZnJvbSAke2NvbmZpZ0ZpbGUudG9TdHJpbmcoKX0uYCkpO1xuICAgIH1cblxuICAgIGNvbnN0IHNlbXZlciA9IFNlbVZlci5mcm9tU3RyaW5nKHBrZy5jb25maWcudmVyc2lvbik7XG4gICAgaWYgKCFzZW12ZXIpXG4gICAge1xuICAgICAgICByZXR1cm4gUHJvbWlzZS5yZWplY3QobmV3IEVycm9yKGBJbnZhbGlkIHNlbXZlciB2ZXJzaW9uIHN0cmluZyAke3BrZy5jb25maWcudmVyc2lvbn0uYCkpO1xuICAgIH1cblxuICAgIHJldHVybiB7XG4gICAgICAgIGRpcjogICAgICAgICAgICAgICAgY21kTGluZU9wdHMuc3JjRGlyLFxuICAgICAgICByZXBvOiAgICAgICAgICAgICAgIHNyY1JlcG8sXG4gICAgICAgIHBrZzogICAgICAgICAgICAgICAgcGtnLFxuICAgICAgICB2ZXJzaW9uOiAgICAgICAgICAgIHNlbXZlcixcbiAgICAgICAgcHVibGlzaFRvR2l0Q29uZmlnOiBwdWJsaXNoVG9HaXRDb25maWdcbiAgICB9O1xufVxuXG5cbmFzeW5jIGZ1bmN0aW9uIG1haW4oKTogUHJvbWlzZTx2b2lkPlxue1xuICAgIC8vXG4gICAgLy8gTWFrZSBzdXJlIHRoZSBnbG9iYWwgdG1wRGlyIGV4aXN0cy5cbiAgICAvL1xuICAgIGdsb2JhbENvbmZpZy50bXBEaXIuZW5zdXJlRXhpc3RzU3luYygpO1xuXG4gICAgY29uc3QgY21kTGluZU9wdHMgPSBwYXJzZUFyZ3MoKTtcbiAgICBpZiAoIWNtZExpbmVPcHRzKVxuICAgIHtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGNvbnN0IHNyYyA9IGF3YWl0IGdldFNyYyhjbWRMaW5lT3B0cyk7XG4gICAgY29uc29sZS5sb2coYFByb2plY3Qgd2lsbCBwdWJsaXNoIHRvIEdpdCByZXBvc2l0b3J5OiAke3NyYy5wdWJsaXNoVG9HaXRDb25maWcucHVibGlzaFJlcG9zaXRvcnl9LmApO1xuXG4gICAgLy9cbiAgICAvLyBUT0RPOiBJZiB0aGUgc291cmNlIHJlcG8gaGFzIGEgQ0hBTkdFTE9HLm1kLCBtYWtlIHN1cmUgaXQgaGFzIGEgc2VjdGlvblxuICAgIC8vIGRlc2NyaWJpbmcgdGhpcyByZWxlYXNlLiAgTWF5YmUgSSBjb3VsZCBoZWxwIGdlbmVyYXRlIGl0IGJ5IHByb3ZpZGluZyBhbGxcbiAgICAvLyBjb21taXRzIHNpbmNlIGxhc3QgbGFiZWw/XG4gICAgLy9cblxuICAgIC8vXG4gICAgLy8gRmlndXJlIG91dCB3aGF0IHRoZSBwdWJsaXNoIHJlcG8gZGlyZWN0b3J5IGFuZCBudWtlIGl0IGlmIGl0IGFscmVhZHlcbiAgICAvLyBleGlzdHMuXG4gICAgLy9cbiAgICBjb25zdCBwdWJsaXNoUHJvak5hbWUgPSBnaXRVcmxUb1Byb2plY3ROYW1lKHNyYy5wdWJsaXNoVG9HaXRDb25maWcucHVibGlzaFJlcG9zaXRvcnkpO1xuICAgIGNvbnN0IHB1Ymxpc2hEaXIgPSBuZXcgRGlyZWN0b3J5KGdsb2JhbENvbmZpZy50bXBEaXIsIHB1Ymxpc2hQcm9qTmFtZSk7XG4gICAgcHVibGlzaERpci5kZWxldGVTeW5jKCk7XG4gICAgY29uc29sZS5sb2coYFRlbXAgcHVibGlzaCBkaXJlY3Rvcnk6ICR7cHVibGlzaERpci50b1N0cmluZygpfWApO1xuXG4gICAgLy9cbiAgICAvLyBDbG9uZSB0aGUgcHVibGlzaCByZXBvLlxuICAgIC8vXG4gICAgY29uc3QgcHVibGlzaFJlcG9QYXRoID0gR2l0UmVwb1BhdGguZnJvbVVybChzcmMucHVibGlzaFRvR2l0Q29uZmlnLnB1Ymxpc2hSZXBvc2l0b3J5KTtcbiAgICBpZiAoIXB1Ymxpc2hSZXBvUGF0aCkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYEludmFsaWQgcHVibGlzaCByZXBvIFVSTCBcIiR7c3JjLnB1Ymxpc2hUb0dpdENvbmZpZy5wdWJsaXNoUmVwb3NpdG9yeX1cIi5gKTtcbiAgICB9XG4gICAgY29uc29sZS5sb2coYENsb25pbmcgcHVibGlzaCByZXBvLi4uYCk7XG4gICAgY29uc3QgcHVibGlzaFJlcG8gPSBhd2FpdCBHaXRSZXBvLmNsb25lKHB1Ymxpc2hSZXBvUGF0aCwgZ2xvYmFsQ29uZmlnLnRtcERpcik7XG5cbiAgICAvL1xuICAgIC8vIENoZWNrIHRvIHNlZSBpZiB0aGUgY3VycmVudCB2ZXJzaW9uIGhhcyBhbHJlYWR5IGJlZW4gcHVibGlzaGVkIHNvXG4gICAgLy8gdGhhdCB3ZSBjYW4gcmV0dXJuIGFuIGVycm9yIGJlZm9yZSB0YWtpbmcgYW55IGZ1cnRoZXIgYWN0aW9uLlxuICAgIC8vXG4gICAgY29uc3QgbmV3VGFnTmFtZSA9IGB2JHtzcmMucGtnLmNvbmZpZy52ZXJzaW9ufWA7XG4gICAgY29uc3QgaGFzVGFnID0gYXdhaXQgcHVibGlzaFJlcG8uaGFzVGFnKG5ld1RhZ05hbWUpO1xuICAgIGlmIChoYXNUYWcpXG4gICAge1xuICAgICAgICBjb25zdCBtc2cgPSBgVGhlIHB1Ymxpc2ggcmVwbyBhbHJlYWR5IGhhcyB0YWcgJHtzcmMudmVyc2lvbi5nZXRQYXRjaFZlcnNpb25TdHJpbmcoKX0uIGAgK1xuICAgICAgICAgICAgXCJIYXZlIHlvdSBmb3Jnb3R0ZW4gdG8gYnVtcCB0aGUgdmVyc2lvbiBudW1iZXI/XCI7XG4gICAgICAgIGNvbnNvbGUubG9nKG1zZyk7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihtc2cpO1xuICAgIH1cblxuICAgIC8vXG4gICAgLy8gVG8gbWFrZSB2aWV3aW5nIGRpZmZlcmVuY2VzIGJldHdlZW4gcmVsZWFzZXMgYSBsaXR0bGUgZWFzaWVyLCBjaGVja291dFxuICAgIC8vIHRoZSBicmFuY2ggbmFtZWQgYWZ0ZXIgdGhlIG1ham9yIHZlcnNpb24gYW5kIHRoZW4gdGhlIG1ham9yLm1pbm9yXG4gICAgLy8gdmVyc2lvbi5cbiAgICAvL1xuICAgIGNvbnN0IG1ham9yQnJhbmNoTmFtZSA9IHNyYy52ZXJzaW9uLmdldE1ham9yVmVyc2lvblN0cmluZygpO1xuICAgIGNvbnNvbGUubG9nKGBDaGVja2luZyBvdXQgYnJhbmNoOiAke21ham9yQnJhbmNoTmFtZX1gKTtcbiAgICBjb25zdCBtYWpvckJyYW5jaCA9IGF3YWl0IEdpdEJyYW5jaC5jcmVhdGUocHVibGlzaFJlcG8sIG1ham9yQnJhbmNoTmFtZSk7XG4gICAgYXdhaXQgcHVibGlzaFJlcG8uY2hlY2tvdXQobWFqb3JCcmFuY2gsIHRydWUpO1xuICAgIGF3YWl0IHB1Ymxpc2hSZXBvLnB1c2hDdXJyZW50QnJhbmNoKFwib3JpZ2luXCIsIHRydWUpO1xuXG4gICAgY29uc3QgbWlub3JCcmFuY2hOYW1lID0gc3JjLnZlcnNpb24uZ2V0TWlub3JWZXJzaW9uU3RyaW5nKCk7XG4gICAgY29uc29sZS5sb2coYENoZWNraW5nIG91dCBicmFuY2g6ICR7bWlub3JCcmFuY2hOYW1lfWApO1xuICAgIGNvbnN0IG1pbm9yQnJhbmNoID0gYXdhaXQgR2l0QnJhbmNoLmNyZWF0ZShwdWJsaXNoUmVwbywgbWlub3JCcmFuY2hOYW1lKTtcbiAgICBhd2FpdCBwdWJsaXNoUmVwby5jaGVja291dChtaW5vckJyYW5jaCwgdHJ1ZSk7XG4gICAgYXdhaXQgcHVibGlzaFJlcG8ucHVzaEN1cnJlbnRCcmFuY2goXCJvcmlnaW5cIiwgdHJ1ZSk7XG5cbiAgICAvL1xuICAgIC8vIFJlbW92ZSBhbGwgZmlsZXMgdW5kZXIgdmVyc2lvbiBjb250cm9sIGFuZCBwcnVuZSBkaXJlY3RvcmllcyB0aGF0IGFyZVxuICAgIC8vIGVtcHR5LlxuICAgIC8vXG4gICAgY29uc29sZS5sb2coXCJEZWxldGluZyBhbGwgZmlsZXMuLi5cIik7XG4gICAgYXdhaXQgZGVsZXRlVHJhY2tlZEZpbGVzKHB1Ymxpc2hSZXBvKTtcbiAgICBhd2FpdCBwdWJsaXNoRGlyLnBydW5lKCk7XG5cbiAgICAvL1xuICAgIC8vIFB1Ymxpc2ggdGhlIHNvdXJjZSByZXBvIHRvIHRoZSBwdWJsaXNoIGRpcmVjdG9yeS5cbiAgICAvL1xuICAgIGNvbnNvbGUubG9nKFwiUHVibGlzaGluZyBwYWNrYWdlIGNvbnRlbnRzIHRvIHB1Ymxpc2ggcmVwb3NpdG9yeS4uLlwiKTtcbiAgICBhd2FpdCBzcmMucGtnLnB1Ymxpc2gocHVibGlzaERpciwgZmFsc2UpO1xuXG4gICAgLy9cbiAgICAvLyBNb2RpZnkgdGhlIHBhY2thZ2UuanNvbiBmaWxlIHNvIHRoYXQgdGhlIHB1Ymxpc2ggcmVwbyBwYWNrYWdlXG4gICAgLy8gLSBpcyBuYW1lZCBhZnRlciB0aGUgcHVibGlzaCByZXBvXG4gICAgLy8gLSB0aGUgcmVwb3NpdG9yeSB1cmwgcG9pbnRzIHRvIHRoZSBwdWJsaXNoIHJlcG8gaW5zdGVhZCBvZiB0aGUgc291cmNlIHJlcG9cbiAgICAvL1xuICAgIGNvbnNvbGUubG9nKFwiVXBkYXRpbmcgcHVibGlzaCBwYWNrYWdlLmpzb24uLi5cIik7XG4gICAgY29uc3QgcHVibGlzaFBhY2thZ2VKc29uRmlsZSA9IG5ldyBGaWxlKHB1Ymxpc2hEaXIsIFwicGFja2FnZS5qc29uXCIpO1xuICAgIGNvbnN0IHB1Ymxpc2hQYWNrYWdlSnNvbiA9IHB1Ymxpc2hQYWNrYWdlSnNvbkZpbGUucmVhZEpzb25TeW5jPElQYWNrYWdlSnNvbj4oKTtcbiAgICBwdWJsaXNoUGFja2FnZUpzb24ucmVwb3NpdG9yeS51cmwgPSBzcmMucHVibGlzaFRvR2l0Q29uZmlnLnB1Ymxpc2hSZXBvc2l0b3J5O1xuICAgIHB1Ymxpc2hQYWNrYWdlSnNvbi5uYW1lID0gcHVibGlzaFByb2pOYW1lO1xuICAgIHB1Ymxpc2hQYWNrYWdlSnNvbkZpbGUud3JpdGVKc29uU3luYyhwdWJsaXNoUGFja2FnZUpzb24pO1xuXG4gICAgLy9cbiAgICAvLyBTdGFnZSBhbmQgY29tbWl0IHRoZSBwdWJsaXNoZWQgZmlsZXMuXG4gICAgLy9cbiAgICBjb25zb2xlLmxvZyhcIkNvbW1pdGluZyBwdWJsaXNoZWQgZmlsZXMuLi5cIik7XG4gICAgYXdhaXQgcHVibGlzaFJlcG8uc3RhZ2VBbGwoKTtcbiAgICBjb25zdCBjb21taXRNc2cgPSBgcHVibGlzaC10by1naXQgcHVibGlzaGluZyB2ZXJzaW9uICR7c3JjLnZlcnNpb24uZ2V0UGF0Y2hWZXJzaW9uU3RyaW5nKCl9LmA7XG4gICAgYXdhaXQgcHVibGlzaFJlcG8uY29tbWl0KGNvbW1pdE1zZyk7XG5cbiAgICAvLyBUT0RPOiBJZiB0aGUgc291cmNlIHJlcG8gaGFzIGEgQ0hBTkdFTE9HLm1kLCBhZGQgaXRzIGNvbnRlbnRzIGFzIHRoZSBhbm5vdGF0ZWQgdGFnIG1lc3NhZ2UuXG5cbiAgICAvL1xuICAgIC8vIEFwcGx5IHRhZ3MuXG4gICAgLy8gV2Uga25vdyB0aGF0IG5ld1RhZ05hbWUgZG9lcyBub3QgZXhpc3QsIGJlY2F1c2UgaXQgd2FzIGNoZWNrZWQgZm9yIGVhcmxpZXIuXG4gICAgLy8gV2Ugd2lsbCBcImZvcmNlXCIgdGFnIGNyZWF0aW9uIGZvciBhZGRpdGlvbmFsIHRhZ3MsIGFzc3VtaW5nIHRoZSB1c2VyIHdhbnRzXG4gICAgLy8gdG8gbW92ZSBpdCBpZiBpdCBhbHJlYWR5IGV4aXN0cy5cbiAgICAvL1xuICAgIGxldCB0YWdzID0gW25ld1RhZ05hbWVdO1xuXG4gICAgaWYgKGNtZExpbmVPcHRzLmFkZGl0aW9uYWxUYWdzKSB7XG4gICAgICAgdGFncyA9IHRhZ3MuY29uY2F0KGNtZExpbmVPcHRzLmFkZGl0aW9uYWxUYWdzKTtcbiAgICB9XG5cbiAgICBhd2FpdCBQcm9taXNlLmFsbChfLm1hcCh0YWdzLCAoY3VyVGFnKSA9PiB7XG4gICAgICAgIGNvbnNvbGUubG9nKGBDcmVhdGluZyB0YWc6ICR7Y3VyVGFnfWApO1xuICAgICAgICByZXR1cm4gcHVibGlzaFJlcG8uY3JlYXRlVGFnKGN1clRhZywgXCJcIiwgdHJ1ZSk7XG4gICAgfSkpO1xuXG4gICAgLy9cbiAgICAvLyBJZiBkb2luZyBhIFwiZHJ5IHJ1blwiLCBzdG9wLlxuICAgIC8vXG4gICAgaWYgKGNtZExpbmVPcHRzLmRyeVJ1bilcbiAgICB7XG4gICAgICAgIGNvbnN0IG1zZyA9IFtcbiAgICAgICAgICAgIFwiUnVubmluZyBpbiBkcnktcnVuIG1vZGUuICBUaGUgcmVwb3NpdG9yeSBpbiB0aGUgZm9sbG93aW5nIHRlbXBvcmFyeSBkaXJlY3RvcnlcIixcbiAgICAgICAgICAgIFwiaGFzIGJlZW4gbGVmdCByZWFkeSB0byBwdXNoIHRvIGEgcHVibGljIHNlcnZlci5cIixcbiAgICAgICAgICAgIHB1Ymxpc2hEaXIudG9TdHJpbmcoKVxuICAgICAgICBdO1xuICAgICAgICBjb25zb2xlLmxvZyhtc2cuam9pbihcIlxcblwiKSk7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICAvL1xuICAgIC8vIFB1c2ggdGhlIGJyYW5jaC5cbiAgICAvL1xuICAgIGNvbnNvbGUubG9nKFwiUHVzaGluZyBicmFuY2ggdG8gb3JpZ2luLi4uXCIpO1xuICAgIGF3YWl0IHB1Ymxpc2hSZXBvLnB1c2hDdXJyZW50QnJhbmNoKFwib3JpZ2luXCIpO1xuXG4gICAgLy9cbiAgICAvLyBQdXNoIGFsbCB0YWdzLlxuICAgIC8vXG4gICAgYXdhaXQgUHJvbWlzZS5hbGwoXy5tYXAodGFncywgKGN1clRhZykgPT4ge1xuICAgICAgICBjb25zb2xlLmxvZyhgUHVzaGluZyB0YWcgJHtjdXJUYWd9IHRvIG9yaWdpbi5gKTtcbiAgICAgICAgcmV0dXJuIHB1Ymxpc2hSZXBvLnB1c2hUYWcoY3VyVGFnLCBcIm9yaWdpblwiLCB0cnVlKTtcbiAgICB9KSk7XG5cbiAgICAvL1xuICAgIC8vIFByaW50IGEgY29tcGxldGlvbiBtZXNzYWdlLlxuICAgIC8vIFRlbGwgdGhlIHVzZXIgaG93IHRvIGluY2x1ZGUgdGhlIHB1Ymxpc2hlZCByZXBvc2l0b3J5IGludG8gYW5vdGhlclxuICAgIC8vIHByb2plY3QncyBkZXBlbmRlbmNpZXMuXG4gICAgLy9cbiAgICBjb25zdCBkZXBlbmRlbmN5VXJsID0gVXJsLnNldFByb3RvY29sKHNyYy5wdWJsaXNoVG9HaXRDb25maWcucHVibGlzaFJlcG9zaXRvcnksIFwiZ2l0K2h0dHBzXCIpO1xuICAgIGNvbnN0IG5wbUluc3RhbGxDbWQgPSBgbnBtIGluc3RhbGwgJHtkZXBlbmRlbmN5VXJsfSMke25ld1RhZ05hbWV9YDtcbiAgICBjb25zdCBkb25lTWVzc2FnZSA9IFtcbiAgICAgICAgXCJEb25lLlwiLFxuICAgICAgICBcIlRvIGluY2x1ZGUgdGhlIHB1Ymxpc2hlZCBsaWJyYXJ5IGluIGEgTm9kZS5qcyBwcm9qZWN0LCBleGVjdXRlIHRoZSBmb2xsb3dpbmcgY29tbWFuZDpcIixcbiAgICAgICAgbnBtSW5zdGFsbENtZFxuICAgIF07XG4gICAgY29uc29sZS5sb2coZG9uZU1lc3NhZ2Uuam9pbihcIlxcblwiKSk7XG5cbiAgICAvLyBcImVuaXBqcy1jb3JlXCI6IFwiZ2l0K2h0dHBzOi8vbWZ0LnJhLWludC5jb20vZ2l0bGFiL2FwcC1wbGF0Zm9ybS9lbmlwanMtY29yZS5naXQjNTlmMDliN1wiXG59XG5cblxuLyoqXG4gKiBEZWxldGVzIGFsbCB0cmFja2VkIGZpbGVzIHdpdGhpbiBhIHJlcG8uXG4gKiBAcGFyYW0gcmVwbyAtIFRoZSByZXBvIHRvIGNsZWFyXG4gKiBAcmV0dXJuIEEgUHJvbWlzZSB0aGF0IGlzIHJlc29sdmVkIHdoZW4gYWxsIGZpbGVzIGhhdmUgYmVlbiBkZWxldGVkLlxuICovXG5hc3luYyBmdW5jdGlvbiBkZWxldGVUcmFja2VkRmlsZXMocmVwbzogR2l0UmVwbyk6IFByb21pc2U8dm9pZD5cbntcbiAgICBjb25zdCBmaWxlcyA9IGF3YWl0IHJlcG8uZmlsZXMoKTtcbiAgICBjb25zdCBkZWxldGVQcm9taXNlcyA9IF8ubWFwKGZpbGVzLCAoY3VyRmlsZSkgPT4ge1xuICAgICAgICByZXR1cm4gY3VyRmlsZS5kZWxldGUoKTtcbiAgICB9KTtcblxuICAgIGF3YWl0IFByb21pc2UuYWxsKGRlbGV0ZVByb21pc2VzKTtcbn1cblxuXG5tYWluKCk7XG4iXX0=
