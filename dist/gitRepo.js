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
var oofs_1 = require("oofs");
var asynchrony_1 = require("asynchrony");
var gitBranch_1 = require("./gitBranch");
var _ = require("lodash");
var stringHelpers_1 = require("./stringHelpers");
var url_1 = require("./url");
var commitHash_1 = require("./commitHash");
//
// A regex for parsing "git log" output.
// match[1]: commit hash
// match[2]: author
// match[3]: commit timestamp
// match[4]: commit message (a sequence of lines that are either blank or start with whitespace)
//
var GIT_LOG_ENTRY_REGEX = /commit\s*([0-9a-f]+).*?$\s^Author:\s*(.*?)$\s^Date:\s*(.*?)$\s((?:(?:^\s*$\n?)|(?:^\s+(?:.*)$\s?))+)/gm;
/**
 * Determines whether dir is a directory containing a Git repository.
 * @param dir - The directory to inspect
 * @return A promise for a boolean indicating whether dir contains a Git
 * repository.  This promise will never reject.
 */
function isGitRepoDir(dir) {
    return __awaiter(this, void 0, void 0, function () {
        var _a, dirExists, dotGitExists;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, Promise.all([
                        dir.exists(),
                        new oofs_1.Directory(dir, ".git").exists() // The directory contains a .git directory
                    ])];
                case 1:
                    _a = _b.sent(), dirExists = _a[0], dotGitExists = _a[1];
                    return [2 /*return*/, Boolean(dirExists && dotGitExists)];
            }
        });
    });
}
exports.isGitRepoDir = isGitRepoDir;
var GitRepo = (function () {
    /**
     * Constructs a new GitRepo.  Private in order to provide error checking.
     * See static methods.
     *
     * @param dir - The directory containing the Git repo.
     */
    function GitRepo(dir) {
        this._dir = dir;
    }
    //endregion
    /**
     * Creates a new GitRepo instance, pointing it at a directory containing the
     * wrapped repo.
     * @param dir - The directory containing the repo
     * @return A Promise for the GitRepo.
     */
    GitRepo.fromDirectory = function (dir) {
        return __awaiter(this, void 0, void 0, function () {
            var isGitRepo;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, isGitRepoDir(dir)];
                    case 1:
                        isGitRepo = _a.sent();
                        if (isGitRepo) {
                            return [2 /*return*/, new GitRepo(dir)];
                        }
                        else {
                            throw new Error("Path does not exist or is not a Git repo.");
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Clones a Git repo at the specified location.
     * @param src - The source to clone the repo from
     * @param parentDir - The parent directory where the repo will be placed.
     * The repo will be cloned into a subdirectory named after the project.
     * @return A promise for the cloned Git repo.
     */
    GitRepo.clone = function (src, parentDir) {
        var projName;
        var srcStr;
        if (src instanceof url_1.Url) {
            projName = url_1.gitUrlToProjectName(src.toString());
            var protocols = src.getProtocols();
            srcStr = protocols.length < 2 ?
                src.toString() :
                src.replaceProtocol("https").toString();
        }
        else {
            projName = src.dirName;
            srcStr = src.toString();
        }
        var repoDir = new oofs_1.Directory(parentDir, projName);
        return parentDir.exists()
            .then(function (parentDirExists) {
            if (!parentDirExists) {
                throw new Error(parentDir + " is not a directory.");
            }
        })
            .then(function () {
            return asynchrony_1.spawn("git", ["clone", srcStr, projName], parentDir.toString());
        })
            .then(function () {
            return new GitRepo(repoDir);
        });
    };
    Object.defineProperty(GitRepo.prototype, "directory", {
        /**
         * Gets the directory containing this Git repo.
         * @return The directory containing this git repo.
         */
        get: function () {
            return this._dir;
        },
        enumerable: true,
        configurable: true
    });
    /**
     * Determines whether this GitRepo is equal to another GitRepo.  Two
     * instances are considered equal if they point to the same directory.
     * @method
     * @param other - The other GitRepo to compare with
     * @return Whether the two GitRepo instances are equal
     */
    GitRepo.prototype.equals = function (other) {
        return this._dir.equals(other._dir);
    };
    /**
     * Gets the files that are under Git version control.
     * @return A Promise for an array of files under Git version control.
     */
    GitRepo.prototype.files = function () {
        var _this = this;
        return asynchrony_1.spawn("git", ["ls-files"], this._dir.toString())
            .then(function (stdout) {
            var relativeFilePaths = stdout.split("\n");
            return _.map(relativeFilePaths, function (curRelFilePath) {
                return new oofs_1.File(_this._dir, curRelFilePath);
            });
        });
    };
    // TODO: Write unit tests for this method and make sure the files have the
    // correct preceding path.
    GitRepo.prototype.modifiedFiles = function () {
        var _this = this;
        return asynchrony_1.spawn("git", ["ls-files", "-m"], this._dir.toString())
            .then(function (stdout) {
            if (stdout === "") {
                return [];
            }
            var relativeFilePaths = stdout.split("\n");
            return _.map(relativeFilePaths, function (curRelativeFilePath) {
                return new oofs_1.File(_this._dir, curRelativeFilePath);
            });
        });
    };
    // TODO: Write unit tests for this method and make sure the files have the
    // correct preceding path.
    GitRepo.prototype.untrackedFiles = function () {
        var _this = this;
        return asynchrony_1.spawn("git", ["ls-files", "--others", "--exclude-standard"], this._dir.toString())
            .then(function (stdout) {
            if (stdout === "") {
                return [];
            }
            var relativeFilePaths = stdout.split("\n");
            return _.map(relativeFilePaths, function (curRelativePath) {
                return new oofs_1.File(_this._dir, curRelativePath);
            });
        });
    };
    // TODO: Write unit tests for this method.  Make sure there is no leading or trailing whitespace.
    GitRepo.prototype.currentCommitHash = function () {
        return __awaiter(this, void 0, void 0, function () {
            var stdout, hash;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, asynchrony_1.spawn("git", ["rev-parse", "--verify", "HEAD"], this._dir.toString())];
                    case 1:
                        stdout = _a.sent();
                        hash = commitHash_1.CommitHash.fromString(stdout);
                        if (!hash) {
                            throw new Error("Failed to construct CommitHash.");
                        }
                        return [2 /*return*/, hash];
                }
            });
        });
    };
    /**
     * Get the remotes configured for the Git repo.
     * @return A Promise for an object where the remote names are the keys and
     * the remote URL is the value.
     */
    GitRepo.prototype.remotes = function () {
        return asynchrony_1.spawn("git", ["remote", "-vv"], this._dir.toString())
            .then(function (stdout) {
            var lines = stdout.split("\n");
            var remotes = {};
            lines.forEach(function (curLine) {
                var match = curLine.match(/^(\w+)\s+(.*)\s+\(\w+\)$/);
                if (match) {
                    remotes[match[1]] = match[2];
                }
            });
            return remotes;
        });
    };
    /**
     * Gets the name of this Git repository.  If the repo has a remote, the name
     * is taken from the last part of the remote's URL.  Otherwise, the name
     * will be taken from the "name" property in package.json.  Otherwise, the
     * name will be the name of the folder the repo is in.
     * @return A Promise for the name of this repository.
     */
    GitRepo.prototype.name = function () {
        var _this = this;
        return this.remotes()
            .then(function (remotes) {
            var remoteNames = Object.keys(remotes);
            if (remoteNames.length > 0) {
                var remoteUrl = remotes[remoteNames[0]];
                return url_1.gitUrlToProjectName(remoteUrl);
            }
        })
            .then(function (projName) {
            if (projName) {
                return projName;
            }
            // Look for the project name in package.json.
            var packageJson = new oofs_1.File(_this._dir, "package.json").readJsonSync();
            if (packageJson) {
                return packageJson.name;
            }
        })
            .then(function (projName) {
            if (projName) {
                return projName;
            }
            var dirName = _this._dir.dirName;
            if (dirName === "/") {
                throw new Error("Unable to determine Git repo name.");
            }
            return dirName;
        });
    };
    GitRepo.prototype.tags = function () {
        return asynchrony_1.spawn("git", ["tag"], this._dir.toString())
            .then(function (stdout) {
            if (stdout.length === 0) {
                return [];
            }
            return stdout.split("\n");
        });
    };
    GitRepo.prototype.hasTag = function (tagName) {
        return this.tags()
            .then(function (tags) {
            return tags.indexOf(tagName) >= 0;
        });
    };
    GitRepo.prototype.createTag = function (tagName, message, force) {
        var _this = this;
        if (message === void 0) { message = ""; }
        if (force === void 0) { force = false; }
        var args = ["tag"];
        if (force) {
            args.push("-f");
        }
        args = _.concat(args, "-a", tagName);
        args = _.concat(args, "-m", message);
        return asynchrony_1.spawn("git", args, this._dir.toString())
            .then(function () {
            return _this;
        });
    };
    GitRepo.prototype.deleteTag = function (tagName) {
        var _this = this;
        return asynchrony_1.spawn("git", ["tag", "--delete", tagName], this._dir.toString())
            .catch(function (err) {
            if (err.stderr.includes("not found")) {
                // The specified tag name was not found.  We are still
                // successful.
            }
            else {
                throw err;
            }
        })
            .then(function () {
            return _this;
        });
    };
    GitRepo.prototype.pushTag = function (tagName, remoteName, force) {
        var _this = this;
        if (force === void 0) { force = false; }
        var args = ["push"];
        if (force) {
            args.push("--force");
        }
        args = _.concat(args, remoteName, tagName);
        return asynchrony_1.spawn("git", args, this._dir.toString())
            .then(function () {
            return _this;
        });
    };
    GitRepo.prototype.getBranches = function (forceUpdate) {
        var _this = this;
        if (forceUpdate === void 0) { forceUpdate = false; }
        if (forceUpdate) {
            // Invalidate the cache.  If this update fails, subsequent requests
            // will have to update the cache.
            this._branches = undefined;
        }
        var updatePromise;
        if (this._branches === undefined) {
            // The internal cache of branches needs to be updated.
            updatePromise = gitBranch_1.GitBranch.enumerateGitRepoBranches(this)
                .then(function (branches) {
                _this._branches = branches;
            });
        }
        else {
            // The internal cache does not need to be updated.
            updatePromise = Promise.resolve();
        }
        return updatePromise
            .then(function () {
            // Since updatePromise resolved, we know that this._branches has been
            // set.
            return _this._branches;
        });
    };
    GitRepo.prototype.getCurrentBranch = function () {
        return __awaiter(this, void 0, void 0, function () {
            var branchName, branch;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, asynchrony_1.spawn("git", ["rev-parse", "--abbrev-ref", "HEAD"], this._dir.toString())];
                    case 1:
                        branchName = _a.sent();
                        if (branchName === "HEAD") {
                            // The repo is in detached head state.
                            return [2 /*return*/, undefined];
                        }
                        return [4 /*yield*/, gitBranch_1.GitBranch.create(this, branchName)];
                    case 2:
                        branch = _a.sent();
                        // All is good.
                        return [2 /*return*/, branch];
                }
            });
        });
    };
    GitRepo.prototype.checkoutBranch = function (branch, createIfNonexistent) {
        return __awaiter(this, void 0, void 0, function () {
            var allBranches, args;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!createIfNonexistent) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.getBranches()];
                    case 1:
                        allBranches = _a.sent();
                        if (_.some(allBranches, { name: branch.name })) {
                            createIfNonexistent = false;
                        }
                        _a.label = 2;
                    case 2:
                        args = [
                            "checkout"
                        ].concat((createIfNonexistent ? ["-b"] : []), [
                            branch.name
                        ]);
                        return [4 /*yield*/, asynchrony_1.spawn("git", args, this._dir.toString())];
                    case 3:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    GitRepo.prototype.checkoutCommit = function (commit) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, asynchrony_1.spawn("git", ["checkout", commit.toString()], this._dir.toString())];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    GitRepo.prototype.stageAll = function () {
        var _this = this;
        return asynchrony_1.spawn("git", ["add", "."], this._dir.toString())
            .then(function () {
            return _this;
        });
    };
    GitRepo.prototype.pushCurrentBranch = function (remoteName, setUpstream) {
        if (remoteName === void 0) { remoteName = "origin"; }
        if (setUpstream === void 0) { setUpstream = false; }
        return __awaiter(this, void 0, void 0, function () {
            var curBranch, args;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getCurrentBranch()];
                    case 1:
                        curBranch = _a.sent();
                        if (!curBranch) {
                            throw new Error("There is no current branch to push.");
                        }
                        args = [
                            "push"
                        ].concat((setUpstream ? ["-u"] : []), [
                            remoteName,
                            curBranch.name
                        ]);
                        return [2 /*return*/, asynchrony_1.spawn("git", args, this._dir.toString())
                                .then(function () {
                            })
                                .catch(function (err) {
                                console.log("Error pushing current branch: " + JSON.stringify(err));
                                throw err;
                            })];
                }
            });
        });
    };
    // TODO: Write unit tests for the following method.
    GitRepo.prototype.getCommitDeltas = function (trackingRemote) {
        if (trackingRemote === void 0) { trackingRemote = "origin"; }
        return __awaiter(this, void 0, void 0, function () {
            var branch, thisBranchName, trackingBranchName, numAheadPromise, numBehindPromise;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getCurrentBranch()];
                    case 1:
                        branch = _a.sent();
                        if (!branch) {
                            throw new Error("Cannot getNumCommitsAhead() when HEAD is not on a branch.");
                        }
                        thisBranchName = branch.name;
                        trackingBranchName = trackingRemote + "/" + thisBranchName;
                        numAheadPromise = asynchrony_1.spawn("git", ["rev-list", thisBranchName, "--not", trackingBranchName, "--count"], this._dir.toString());
                        numBehindPromise = asynchrony_1.spawn("git", ["rev-list", trackingBranchName, "--not", thisBranchName, "--count"], this._dir.toString());
                        return [2 /*return*/, Promise.all([numAheadPromise, numBehindPromise])
                                .then(function (results) {
                                return {
                                    ahead: parseInt(results[0], 10),
                                    behind: parseInt(results[1], 10)
                                };
                            })];
                }
            });
        });
    };
    // TODO: To get the staged files:
    // git diff --name-only --cached
    // TODO: Add unit tests for this method.
    GitRepo.prototype.commit = function (msg) {
        var _this = this;
        if (msg === void 0) { msg = ""; }
        return asynchrony_1.spawn("git", ["commit", "-m", msg], this._dir.toString())
            .then(function () {
            // Get the commit hash
            return asynchrony_1.spawn("git", ["rev-parse", "HEAD"], _this._dir.toString());
        })
            .then(function (stdout) {
            var commitHash = _.trim(stdout);
            return asynchrony_1.spawn("git", ["show", commitHash], _this._dir.toString());
        })
            .then(function (stdout) {
            var match = GIT_LOG_ENTRY_REGEX.exec(stdout);
            if (!match) {
                throw new Error("Could not parse \"git show\" output:\n" + stdout);
            }
            return {
                commitHash: match[1],
                author: match[2],
                timestamp: new Date(match[3]),
                message: stringHelpers_1.outdent(stringHelpers_1.trimBlankLines(match[4]))
            };
        });
    };
    GitRepo.prototype.getLog = function (forceUpdate) {
        var _this = this;
        if (forceUpdate) {
            this._log = undefined;
        }
        var updatePromise;
        if (this._log === undefined) {
            updatePromise = this.getLogEntries()
                .then(function (log) {
                _this._log = log;
            });
        }
        else {
            updatePromise = Promise.resolve();
        }
        return updatePromise
            .then(function () {
            return _this._log;
        });
    };
    /**
     * Helper method that retrieves Git log entries
     * @private
     * @method
     * @return A promise for an array of structures describing each commit.
     */
    GitRepo.prototype.getLogEntries = function () {
        return asynchrony_1.spawn("git", ["log"], this._dir.toString())
            .then(function (stdout) {
            var entries = [];
            var match;
            while ((match = GIT_LOG_ENTRY_REGEX.exec(stdout)) !== null) {
                entries.push({
                    commitHash: match[1],
                    author: match[2],
                    timestamp: new Date(match[3]),
                    message: stringHelpers_1.outdent(stringHelpers_1.trimBlankLines(match[4]))
                });
            }
            // Git log lists the most recent entry first.  Reverse the array so
            // that the most recent entry is the last.
            _.reverse(entries);
            return entries;
        });
    };
    return GitRepo;
}());
exports.GitRepo = GitRepo;
// TODO: The following will list all tags pointing to the specified commit.
// git tag --points-at 34b8bff

//# sourceMappingURL=data:application/json;charset=utf8;base64,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Q0ksVUFBVSxFQUFFLEtBQUssQ0FBQyxDQUFDLENBQUM7b0JBQ3BCLE1BQU0sRUFBTSxLQUFLLENBQUMsQ0FBQyxDQUFDO29CQUNwQixTQUFTLEVBQUcsSUFBSSxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO29CQUM5QixPQUFPLEVBQUssdUJBQU8sQ0FBQyw4QkFBYyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO2lCQUNoRCxDQUNKLENBQUM7WUFDTixDQUFDO1lBRUQsbUVBQW1FO1lBQ25FLDBDQUEwQztZQUMxQyxDQUFDLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxDQUFDO1lBQ25CLE1BQU0sQ0FBQyxPQUFPLENBQUM7UUFDbkIsQ0FBQyxDQUFDLENBQUM7SUFDUCxDQUFDO0lBR0wsY0FBQztBQUFELENBaGtCQSxBQWdrQkMsSUFBQTtBQWhrQlksMEJBQU87QUFra0JwQiwyRUFBMkU7QUFDM0UsOEJBQThCIiwiZmlsZSI6ImdpdFJlcG8uanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge0RpcmVjdG9yeSwgRmlsZX0gZnJvbSBcIm9vZnNcIjtcbmltcG9ydCB7c3Bhd259IGZyb20gXCJhc3luY2hyb255XCI7XG5pbXBvcnQge0lQYWNrYWdlSnNvbn0gZnJvbSBcIi4vbm9kZVBhY2thZ2VcIjtcbmltcG9ydCB7R2l0QnJhbmNofSBmcm9tIFwiLi9naXRCcmFuY2hcIjtcbmltcG9ydCAqIGFzIF8gZnJvbSBcImxvZGFzaFwiO1xuaW1wb3J0IHtvdXRkZW50LCB0cmltQmxhbmtMaW5lc30gZnJvbSBcIi4vc3RyaW5nSGVscGVyc1wiO1xuaW1wb3J0IHtVcmwsIGdpdFVybFRvUHJvamVjdE5hbWV9IGZyb20gXCIuL3VybFwiO1xuaW1wb3J0IHtDb21taXRIYXNofSBmcm9tIFwiLi9jb21taXRIYXNoXCI7XG5cblxuaW50ZXJmYWNlIElHaXRMb2dFbnRyeVxue1xuICAgIC8vIFRPRE86IENoYW5nZSB0aGUgZm9sbG93aW5nIHRvIGFuIGluc3RhbmNlIG9mIENvbW1pdEhhc2guXG4gICAgY29tbWl0SGFzaDogc3RyaW5nO1xuICAgIGF1dGhvcjogc3RyaW5nO1xuICAgIHRpbWVzdGFtcDogRGF0ZTtcbiAgICBtZXNzYWdlOiBzdHJpbmc7XG59XG5cblxuLy9cbi8vIEEgcmVnZXggZm9yIHBhcnNpbmcgXCJnaXQgbG9nXCIgb3V0cHV0LlxuLy8gbWF0Y2hbMV06IGNvbW1pdCBoYXNoXG4vLyBtYXRjaFsyXTogYXV0aG9yXG4vLyBtYXRjaFszXTogY29tbWl0IHRpbWVzdGFtcFxuLy8gbWF0Y2hbNF06IGNvbW1pdCBtZXNzYWdlIChhIHNlcXVlbmNlIG9mIGxpbmVzIHRoYXQgYXJlIGVpdGhlciBibGFuayBvciBzdGFydCB3aXRoIHdoaXRlc3BhY2UpXG4vL1xuY29uc3QgR0lUX0xPR19FTlRSWV9SRUdFWCA9IC9jb21taXRcXHMqKFswLTlhLWZdKykuKj8kXFxzXkF1dGhvcjpcXHMqKC4qPykkXFxzXkRhdGU6XFxzKiguKj8pJFxccygoPzooPzpeXFxzKiRcXG4/KXwoPzpeXFxzKyg/Oi4qKSRcXHM/KSkrKS9nbTtcblxuLyoqXG4gKiBEZXRlcm1pbmVzIHdoZXRoZXIgZGlyIGlzIGEgZGlyZWN0b3J5IGNvbnRhaW5pbmcgYSBHaXQgcmVwb3NpdG9yeS5cbiAqIEBwYXJhbSBkaXIgLSBUaGUgZGlyZWN0b3J5IHRvIGluc3BlY3RcbiAqIEByZXR1cm4gQSBwcm9taXNlIGZvciBhIGJvb2xlYW4gaW5kaWNhdGluZyB3aGV0aGVyIGRpciBjb250YWlucyBhIEdpdFxuICogcmVwb3NpdG9yeS4gIFRoaXMgcHJvbWlzZSB3aWxsIG5ldmVyIHJlamVjdC5cbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGlzR2l0UmVwb0RpcihkaXI6IERpcmVjdG9yeSk6IFByb21pc2U8Ym9vbGVhbj4ge1xuXG4gICAgY29uc3QgW2RpckV4aXN0cywgZG90R2l0RXhpc3RzXSA9IGF3YWl0IFByb21pc2UuYWxsKFtcbiAgICAgICAgZGlyLmV4aXN0cygpLCAgICAgICAgICAgICAgICAgICAgICAgIC8vIFRoZSBkaXJlY3RvcnkgZXhpc3RzXG4gICAgICAgIG5ldyBEaXJlY3RvcnkoZGlyLCBcIi5naXRcIikuZXhpc3RzKCkgIC8vIFRoZSBkaXJlY3RvcnkgY29udGFpbnMgYSAuZ2l0IGRpcmVjdG9yeVxuICAgIF0pO1xuXG4gICAgcmV0dXJuIEJvb2xlYW4oZGlyRXhpc3RzICYmIGRvdEdpdEV4aXN0cyk7XG59XG5cblxuZXhwb3J0IGNsYXNzIEdpdFJlcG9cbntcbiAgICAvL3JlZ2lvbiBQcml2YXRlIERhdGEgTWVtYmVyc1xuICAgIHByaXZhdGUgX2RpcjogRGlyZWN0b3J5O1xuICAgIHByaXZhdGUgX2JyYW5jaGVzOiBBcnJheTxHaXRCcmFuY2g+IHwgdW5kZWZpbmVkO1xuICAgIHByaXZhdGUgX2xvZzogQXJyYXk8SUdpdExvZ0VudHJ5PiB8IHVuZGVmaW5lZDtcbiAgICAvL2VuZHJlZ2lvblxuXG5cbiAgICAvKipcbiAgICAgKiBDcmVhdGVzIGEgbmV3IEdpdFJlcG8gaW5zdGFuY2UsIHBvaW50aW5nIGl0IGF0IGEgZGlyZWN0b3J5IGNvbnRhaW5pbmcgdGhlXG4gICAgICogd3JhcHBlZCByZXBvLlxuICAgICAqIEBwYXJhbSBkaXIgLSBUaGUgZGlyZWN0b3J5IGNvbnRhaW5pbmcgdGhlIHJlcG9cbiAgICAgKiBAcmV0dXJuIEEgUHJvbWlzZSBmb3IgdGhlIEdpdFJlcG8uXG4gICAgICovXG4gICAgcHVibGljIHN0YXRpYyBhc3luYyBmcm9tRGlyZWN0b3J5KGRpcjogRGlyZWN0b3J5KTogUHJvbWlzZTxHaXRSZXBvPlxuICAgIHtcbiAgICAgICAgY29uc3QgaXNHaXRSZXBvID0gYXdhaXQgaXNHaXRSZXBvRGlyKGRpcik7XG4gICAgICAgIGlmIChpc0dpdFJlcG8pXG4gICAgICAgIHtcbiAgICAgICAgICAgIHJldHVybiBuZXcgR2l0UmVwbyhkaXIpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2VcbiAgICAgICAge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiUGF0aCBkb2VzIG5vdCBleGlzdCBvciBpcyBub3QgYSBHaXQgcmVwby5cIik7XG4gICAgICAgIH1cbiAgICB9XG5cblxuICAgIC8qKlxuICAgICAqIENsb25lcyBhIEdpdCByZXBvIGF0IHRoZSBzcGVjaWZpZWQgbG9jYXRpb24uXG4gICAgICogQHBhcmFtIHNyYyAtIFRoZSBzb3VyY2UgdG8gY2xvbmUgdGhlIHJlcG8gZnJvbVxuICAgICAqIEBwYXJhbSBwYXJlbnREaXIgLSBUaGUgcGFyZW50IGRpcmVjdG9yeSB3aGVyZSB0aGUgcmVwbyB3aWxsIGJlIHBsYWNlZC5cbiAgICAgKiBUaGUgcmVwbyB3aWxsIGJlIGNsb25lZCBpbnRvIGEgc3ViZGlyZWN0b3J5IG5hbWVkIGFmdGVyIHRoZSBwcm9qZWN0LlxuICAgICAqIEByZXR1cm4gQSBwcm9taXNlIGZvciB0aGUgY2xvbmVkIEdpdCByZXBvLlxuICAgICAqL1xuICAgIHB1YmxpYyBzdGF0aWMgY2xvbmUoc3JjOiBVcmwgfCBEaXJlY3RvcnksIHBhcmVudERpcjogRGlyZWN0b3J5KTogUHJvbWlzZTxHaXRSZXBvPlxuICAgIHtcbiAgICAgICAgbGV0IHByb2pOYW1lOiBzdHJpbmc7XG4gICAgICAgIGxldCBzcmNTdHI6IHN0cmluZztcblxuICAgICAgICBpZiAoc3JjIGluc3RhbmNlb2YgVXJsKVxuICAgICAgICB7XG4gICAgICAgICAgICBwcm9qTmFtZSA9IGdpdFVybFRvUHJvamVjdE5hbWUoc3JjLnRvU3RyaW5nKCkpO1xuICAgICAgICAgICAgY29uc3QgcHJvdG9jb2xzID0gc3JjLmdldFByb3RvY29scygpO1xuICAgICAgICAgICAgc3JjU3RyID0gcHJvdG9jb2xzLmxlbmd0aCA8IDIgP1xuICAgICAgICAgICAgICAgIHNyYy50b1N0cmluZygpIDpcbiAgICAgICAgICAgICAgICBzcmMucmVwbGFjZVByb3RvY29sKFwiaHR0cHNcIikudG9TdHJpbmcoKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlXG4gICAgICAgIHtcbiAgICAgICAgICAgIHByb2pOYW1lID0gc3JjLmRpck5hbWU7XG4gICAgICAgICAgICBzcmNTdHIgPSBzcmMudG9TdHJpbmcoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IHJlcG9EaXIgPSBuZXcgRGlyZWN0b3J5KHBhcmVudERpciwgcHJvak5hbWUpO1xuXG4gICAgICAgIHJldHVybiBwYXJlbnREaXIuZXhpc3RzKClcbiAgICAgICAgLnRoZW4oKHBhcmVudERpckV4aXN0cykgPT4ge1xuICAgICAgICAgICAgaWYgKCFwYXJlbnREaXJFeGlzdHMpXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGAke3BhcmVudERpcn0gaXMgbm90IGEgZGlyZWN0b3J5LmApO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KVxuICAgICAgICAudGhlbigoKSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gc3Bhd24oXG4gICAgICAgICAgICAgICAgXCJnaXRcIixcbiAgICAgICAgICAgICAgICBbXCJjbG9uZVwiLCBzcmNTdHIsIHByb2pOYW1lXSxcbiAgICAgICAgICAgICAgICBwYXJlbnREaXIudG9TdHJpbmcoKSk7XG4gICAgICAgIH0pXG4gICAgICAgIC50aGVuKCgpID0+IHtcbiAgICAgICAgICAgIHJldHVybiBuZXcgR2l0UmVwbyhyZXBvRGlyKTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG5cbiAgICAvKipcbiAgICAgKiBDb25zdHJ1Y3RzIGEgbmV3IEdpdFJlcG8uICBQcml2YXRlIGluIG9yZGVyIHRvIHByb3ZpZGUgZXJyb3IgY2hlY2tpbmcuXG4gICAgICogU2VlIHN0YXRpYyBtZXRob2RzLlxuICAgICAqXG4gICAgICogQHBhcmFtIGRpciAtIFRoZSBkaXJlY3RvcnkgY29udGFpbmluZyB0aGUgR2l0IHJlcG8uXG4gICAgICovXG4gICAgcHJpdmF0ZSBjb25zdHJ1Y3RvcihkaXI6IERpcmVjdG9yeSlcbiAgICB7XG4gICAgICAgIHRoaXMuX2RpciA9IGRpcjtcbiAgICB9XG5cblxuICAgIC8qKlxuICAgICAqIEdldHMgdGhlIGRpcmVjdG9yeSBjb250YWluaW5nIHRoaXMgR2l0IHJlcG8uXG4gICAgICogQHJldHVybiBUaGUgZGlyZWN0b3J5IGNvbnRhaW5pbmcgdGhpcyBnaXQgcmVwby5cbiAgICAgKi9cbiAgICBwdWJsaWMgZ2V0IGRpcmVjdG9yeSgpOiBEaXJlY3RvcnlcbiAgICB7XG4gICAgICAgIHJldHVybiB0aGlzLl9kaXI7XG4gICAgfVxuXG5cbiAgICAvKipcbiAgICAgKiBEZXRlcm1pbmVzIHdoZXRoZXIgdGhpcyBHaXRSZXBvIGlzIGVxdWFsIHRvIGFub3RoZXIgR2l0UmVwby4gIFR3b1xuICAgICAqIGluc3RhbmNlcyBhcmUgY29uc2lkZXJlZCBlcXVhbCBpZiB0aGV5IHBvaW50IHRvIHRoZSBzYW1lIGRpcmVjdG9yeS5cbiAgICAgKiBAbWV0aG9kXG4gICAgICogQHBhcmFtIG90aGVyIC0gVGhlIG90aGVyIEdpdFJlcG8gdG8gY29tcGFyZSB3aXRoXG4gICAgICogQHJldHVybiBXaGV0aGVyIHRoZSB0d28gR2l0UmVwbyBpbnN0YW5jZXMgYXJlIGVxdWFsXG4gICAgICovXG4gICAgcHVibGljIGVxdWFscyhvdGhlcjogR2l0UmVwbyk6IGJvb2xlYW5cbiAgICB7XG4gICAgICAgIHJldHVybiB0aGlzLl9kaXIuZXF1YWxzKG90aGVyLl9kaXIpO1xuICAgIH1cblxuXG4gICAgLyoqXG4gICAgICogR2V0cyB0aGUgZmlsZXMgdGhhdCBhcmUgdW5kZXIgR2l0IHZlcnNpb24gY29udHJvbC5cbiAgICAgKiBAcmV0dXJuIEEgUHJvbWlzZSBmb3IgYW4gYXJyYXkgb2YgZmlsZXMgdW5kZXIgR2l0IHZlcnNpb24gY29udHJvbC5cbiAgICAgKi9cbiAgICBwdWJsaWMgZmlsZXMoKTogUHJvbWlzZTxBcnJheTxGaWxlPj5cbiAgICB7XG4gICAgICAgIHJldHVybiBzcGF3bihcImdpdFwiLCBbXCJscy1maWxlc1wiXSwgdGhpcy5fZGlyLnRvU3RyaW5nKCkpXG4gICAgICAgIC50aGVuKChzdGRvdXQpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IHJlbGF0aXZlRmlsZVBhdGhzID0gc3Rkb3V0LnNwbGl0KFwiXFxuXCIpO1xuICAgICAgICAgICAgcmV0dXJuIF8ubWFwKHJlbGF0aXZlRmlsZVBhdGhzLCAoY3VyUmVsRmlsZVBhdGgpID0+IHtcbiAgICAgICAgICAgICAgICByZXR1cm4gbmV3IEZpbGUodGhpcy5fZGlyLCBjdXJSZWxGaWxlUGF0aCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG5cbiAgICAvLyBUT0RPOiBXcml0ZSB1bml0IHRlc3RzIGZvciB0aGlzIG1ldGhvZCBhbmQgbWFrZSBzdXJlIHRoZSBmaWxlcyBoYXZlIHRoZVxuICAgIC8vIGNvcnJlY3QgcHJlY2VkaW5nIHBhdGguXG4gICAgcHVibGljIG1vZGlmaWVkRmlsZXMoKTogUHJvbWlzZTxBcnJheTxGaWxlPj5cbiAgICB7XG4gICAgICAgIHJldHVybiBzcGF3bihcImdpdFwiLCBbXCJscy1maWxlc1wiLCBcIi1tXCJdLCB0aGlzLl9kaXIudG9TdHJpbmcoKSlcbiAgICAgICAgLnRoZW4oKHN0ZG91dCkgPT4ge1xuICAgICAgICAgICAgaWYgKHN0ZG91dCA9PT0gXCJcIilcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gW107XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjb25zdCByZWxhdGl2ZUZpbGVQYXRocyA9IHN0ZG91dC5zcGxpdChcIlxcblwiKTtcbiAgICAgICAgICAgIHJldHVybiBfLm1hcChyZWxhdGl2ZUZpbGVQYXRocywgKGN1clJlbGF0aXZlRmlsZVBhdGgpID0+IHtcbiAgICAgICAgICAgICAgICByZXR1cm4gbmV3IEZpbGUodGhpcy5fZGlyLCBjdXJSZWxhdGl2ZUZpbGVQYXRoKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICB9XG5cblxuICAgIC8vIFRPRE86IFdyaXRlIHVuaXQgdGVzdHMgZm9yIHRoaXMgbWV0aG9kIGFuZCBtYWtlIHN1cmUgdGhlIGZpbGVzIGhhdmUgdGhlXG4gICAgLy8gY29ycmVjdCBwcmVjZWRpbmcgcGF0aC5cbiAgICBwdWJsaWMgdW50cmFja2VkRmlsZXMoKTogUHJvbWlzZTxBcnJheTxGaWxlPj5cbiAgICB7XG4gICAgICAgIHJldHVybiBzcGF3bihcImdpdFwiLCBbXCJscy1maWxlc1wiLCAgXCItLW90aGVyc1wiLCAgXCItLWV4Y2x1ZGUtc3RhbmRhcmRcIl0sIHRoaXMuX2Rpci50b1N0cmluZygpKVxuICAgICAgICAudGhlbigoc3Rkb3V0KSA9PiB7XG4gICAgICAgICAgICBpZiAoc3Rkb3V0ID09PSBcIlwiKVxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIHJldHVybiBbXTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNvbnN0IHJlbGF0aXZlRmlsZVBhdGhzID0gc3Rkb3V0LnNwbGl0KFwiXFxuXCIpO1xuICAgICAgICAgICAgcmV0dXJuIF8ubWFwKHJlbGF0aXZlRmlsZVBhdGhzLCAoY3VyUmVsYXRpdmVQYXRoKSA9PiB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIG5ldyBGaWxlKHRoaXMuX2RpciwgY3VyUmVsYXRpdmVQYXRoKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICB9XG5cblxuICAgIC8vIFRPRE86IFdyaXRlIHVuaXQgdGVzdHMgZm9yIHRoaXMgbWV0aG9kLiAgTWFrZSBzdXJlIHRoZXJlIGlzIG5vIGxlYWRpbmcgb3IgdHJhaWxpbmcgd2hpdGVzcGFjZS5cbiAgICBwdWJsaWMgYXN5bmMgY3VycmVudENvbW1pdEhhc2goKTogUHJvbWlzZTxDb21taXRIYXNoPlxuICAgIHtcbiAgICAgICAgY29uc3Qgc3Rkb3V0ID0gYXdhaXQgc3Bhd24oXCJnaXRcIiwgW1wicmV2LXBhcnNlXCIsIFwiLS12ZXJpZnlcIiwgXCJIRUFEXCJdLCB0aGlzLl9kaXIudG9TdHJpbmcoKSk7XG4gICAgICAgIGNvbnN0IGhhc2ggPSBDb21taXRIYXNoLmZyb21TdHJpbmcoc3Rkb3V0KTtcbiAgICAgICAgaWYgKCFoYXNoKVxuICAgICAgICB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJGYWlsZWQgdG8gY29uc3RydWN0IENvbW1pdEhhc2guXCIpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBoYXNoO1xuICAgIH1cblxuXG4gICAgLyoqXG4gICAgICogR2V0IHRoZSByZW1vdGVzIGNvbmZpZ3VyZWQgZm9yIHRoZSBHaXQgcmVwby5cbiAgICAgKiBAcmV0dXJuIEEgUHJvbWlzZSBmb3IgYW4gb2JqZWN0IHdoZXJlIHRoZSByZW1vdGUgbmFtZXMgYXJlIHRoZSBrZXlzIGFuZFxuICAgICAqIHRoZSByZW1vdGUgVVJMIGlzIHRoZSB2YWx1ZS5cbiAgICAgKi9cbiAgICBwdWJsaWMgcmVtb3RlcygpOiBQcm9taXNlPHtbbmFtZTogc3RyaW5nXTogc3RyaW5nfT5cbiAgICB7XG4gICAgICAgIHJldHVybiBzcGF3bihcImdpdFwiLCBbXCJyZW1vdGVcIiwgXCItdnZcIl0sIHRoaXMuX2Rpci50b1N0cmluZygpKVxuICAgICAgICAudGhlbigoc3Rkb3V0KSA9PiB7XG5cbiAgICAgICAgICAgIGNvbnN0IGxpbmVzID0gc3Rkb3V0LnNwbGl0KFwiXFxuXCIpO1xuICAgICAgICAgICAgbGV0IHJlbW90ZXM6IHtbbmFtZTogc3RyaW5nXTogc3RyaW5nfSA9IHt9O1xuICAgICAgICAgICAgbGluZXMuZm9yRWFjaCgoY3VyTGluZSkgPT4ge1xuICAgICAgICAgICAgICAgIGNvbnN0IG1hdGNoID0gY3VyTGluZS5tYXRjaCgvXihcXHcrKVxccysoLiopXFxzK1xcKFxcdytcXCkkLyk7XG4gICAgICAgICAgICAgICAgaWYgKG1hdGNoKVxuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgcmVtb3Rlc1ttYXRjaFsxXV0gPSBtYXRjaFsyXTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgcmV0dXJuIHJlbW90ZXM7XG4gICAgICAgIH0pO1xuICAgIH1cblxuXG4gICAgLyoqXG4gICAgICogR2V0cyB0aGUgbmFtZSBvZiB0aGlzIEdpdCByZXBvc2l0b3J5LiAgSWYgdGhlIHJlcG8gaGFzIGEgcmVtb3RlLCB0aGUgbmFtZVxuICAgICAqIGlzIHRha2VuIGZyb20gdGhlIGxhc3QgcGFydCBvZiB0aGUgcmVtb3RlJ3MgVVJMLiAgT3RoZXJ3aXNlLCB0aGUgbmFtZVxuICAgICAqIHdpbGwgYmUgdGFrZW4gZnJvbSB0aGUgXCJuYW1lXCIgcHJvcGVydHkgaW4gcGFja2FnZS5qc29uLiAgT3RoZXJ3aXNlLCB0aGVcbiAgICAgKiBuYW1lIHdpbGwgYmUgdGhlIG5hbWUgb2YgdGhlIGZvbGRlciB0aGUgcmVwbyBpcyBpbi5cbiAgICAgKiBAcmV0dXJuIEEgUHJvbWlzZSBmb3IgdGhlIG5hbWUgb2YgdGhpcyByZXBvc2l0b3J5LlxuICAgICAqL1xuICAgIHB1YmxpYyBuYW1lKCk6IFByb21pc2U8c3RyaW5nPlxuICAgIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucmVtb3RlcygpXG4gICAgICAgIC50aGVuKChyZW1vdGVzKSA9PiB7XG4gICAgICAgICAgICBjb25zdCByZW1vdGVOYW1lcyA9IE9iamVjdC5rZXlzKHJlbW90ZXMpO1xuICAgICAgICAgICAgaWYgKHJlbW90ZU5hbWVzLmxlbmd0aCA+IDApXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgY29uc3QgcmVtb3RlVXJsID0gcmVtb3Rlc1tyZW1vdGVOYW1lc1swXV07XG4gICAgICAgICAgICAgICAgcmV0dXJuIGdpdFVybFRvUHJvamVjdE5hbWUocmVtb3RlVXJsKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSlcbiAgICAgICAgLnRoZW4oKHByb2pOYW1lKSA9PiB7XG4gICAgICAgICAgICBpZiAocHJvak5hbWUpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gcHJvak5hbWU7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIExvb2sgZm9yIHRoZSBwcm9qZWN0IG5hbWUgaW4gcGFja2FnZS5qc29uLlxuICAgICAgICAgICAgY29uc3QgcGFja2FnZUpzb24gPSBuZXcgRmlsZSh0aGlzLl9kaXIsIFwicGFja2FnZS5qc29uXCIpLnJlYWRKc29uU3luYzxJUGFja2FnZUpzb24+KCk7XG4gICAgICAgICAgICBpZiAocGFja2FnZUpzb24pIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gcGFja2FnZUpzb24ubmFtZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSlcbiAgICAgICAgLnRoZW4oKHByb2pOYW1lKSA9PiB7XG4gICAgICAgICAgICBpZiAocHJvak5hbWUpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gcHJvak5hbWU7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGNvbnN0IGRpck5hbWUgPSB0aGlzLl9kaXIuZGlyTmFtZTtcbiAgICAgICAgICAgIGlmIChkaXJOYW1lID09PSBcIi9cIilcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJVbmFibGUgdG8gZGV0ZXJtaW5lIEdpdCByZXBvIG5hbWUuXCIpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gZGlyTmFtZTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG5cbiAgICBwdWJsaWMgdGFncygpOiBQcm9taXNlPEFycmF5PHN0cmluZz4+XG4gICAge1xuICAgICAgICByZXR1cm4gc3Bhd24oXCJnaXRcIiwgW1widGFnXCJdLCB0aGlzLl9kaXIudG9TdHJpbmcoKSlcbiAgICAgICAgLnRoZW4oKHN0ZG91dCkgPT4ge1xuICAgICAgICAgICAgaWYgKHN0ZG91dC5sZW5ndGggPT09IDApXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIFtdO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gc3Rkb3V0LnNwbGl0KFwiXFxuXCIpO1xuICAgICAgICB9KTtcbiAgICB9XG5cblxuICAgIHB1YmxpYyBoYXNUYWcodGFnTmFtZTogc3RyaW5nKTogUHJvbWlzZTxib29sZWFuPlxuICAgIHtcbiAgICAgICAgcmV0dXJuIHRoaXMudGFncygpXG4gICAgICAgIC50aGVuKCh0YWdzKSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gdGFncy5pbmRleE9mKHRhZ05hbWUpID49IDA7XG4gICAgICAgIH0pO1xuICAgIH1cblxuXG4gICAgcHVibGljIGNyZWF0ZVRhZyh0YWdOYW1lOiBzdHJpbmcsIG1lc3NhZ2U6IHN0cmluZyA9IFwiXCIsIGZvcmNlOiBib29sZWFuID0gZmFsc2UpOiBQcm9taXNlPEdpdFJlcG8+XG4gICAge1xuICAgICAgICBsZXQgYXJncyA9IFtcInRhZ1wiXTtcblxuICAgICAgICBpZiAoZm9yY2UpIHtcbiAgICAgICAgICAgIGFyZ3MucHVzaChcIi1mXCIpO1xuICAgICAgICB9XG5cbiAgICAgICAgYXJncyA9IF8uY29uY2F0KGFyZ3MsIFwiLWFcIiwgdGFnTmFtZSk7XG4gICAgICAgIGFyZ3MgPSBfLmNvbmNhdChhcmdzLCBcIi1tXCIsIG1lc3NhZ2UpO1xuXG4gICAgICAgIHJldHVybiBzcGF3bihcImdpdFwiLCBhcmdzLCB0aGlzLl9kaXIudG9TdHJpbmcoKSlcbiAgICAgICAgLnRoZW4oKCkgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICAgIH0pO1xuICAgIH1cblxuXG4gICAgcHVibGljIGRlbGV0ZVRhZyh0YWdOYW1lOiBzdHJpbmcpOiBQcm9taXNlPEdpdFJlcG8+XG4gICAge1xuICAgICAgICByZXR1cm4gc3Bhd24oXCJnaXRcIiwgW1widGFnXCIsIFwiLS1kZWxldGVcIiwgdGFnTmFtZV0sIHRoaXMuX2Rpci50b1N0cmluZygpKVxuICAgICAgICAuY2F0Y2goKGVycikgPT4ge1xuICAgICAgICAgICAgaWYgKGVyci5zdGRlcnIuaW5jbHVkZXMoXCJub3QgZm91bmRcIikpXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgLy8gVGhlIHNwZWNpZmllZCB0YWcgbmFtZSB3YXMgbm90IGZvdW5kLiAgV2UgYXJlIHN0aWxsXG4gICAgICAgICAgICAgICAgLy8gc3VjY2Vzc2Z1bC5cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICB0aHJvdyBlcnI7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pXG4gICAgICAgIC50aGVuKCgpID0+IHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgICB9KTtcbiAgICB9XG5cblxuICAgIHB1YmxpYyBwdXNoVGFnKHRhZ05hbWU6IHN0cmluZywgcmVtb3RlTmFtZTogc3RyaW5nLCBmb3JjZTogYm9vbGVhbiA9IGZhbHNlKTogUHJvbWlzZTxHaXRSZXBvPlxuICAgIHtcbiAgICAgICAgbGV0IGFyZ3MgPSBbXCJwdXNoXCJdO1xuXG4gICAgICAgIGlmIChmb3JjZSkge1xuICAgICAgICAgICAgYXJncy5wdXNoKFwiLS1mb3JjZVwiKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGFyZ3MgPSBfLmNvbmNhdChhcmdzLCByZW1vdGVOYW1lLCB0YWdOYW1lKTtcblxuICAgICAgICByZXR1cm4gc3Bhd24oXCJnaXRcIiwgYXJncywgdGhpcy5fZGlyLnRvU3RyaW5nKCkpXG4gICAgICAgIC50aGVuKCgpID0+IHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgICB9KTtcbiAgICB9XG5cblxuICAgIHB1YmxpYyBnZXRCcmFuY2hlcyhmb3JjZVVwZGF0ZTogYm9vbGVhbiA9IGZhbHNlKTogUHJvbWlzZTxBcnJheTxHaXRCcmFuY2g+PlxuICAgIHtcbiAgICAgICAgaWYgKGZvcmNlVXBkYXRlKVxuICAgICAgICB7XG4gICAgICAgICAgICAvLyBJbnZhbGlkYXRlIHRoZSBjYWNoZS4gIElmIHRoaXMgdXBkYXRlIGZhaWxzLCBzdWJzZXF1ZW50IHJlcXVlc3RzXG4gICAgICAgICAgICAvLyB3aWxsIGhhdmUgdG8gdXBkYXRlIHRoZSBjYWNoZS5cbiAgICAgICAgICAgIHRoaXMuX2JyYW5jaGVzID0gdW5kZWZpbmVkO1xuICAgICAgICB9XG5cbiAgICAgICAgbGV0IHVwZGF0ZVByb21pc2U6IFByb21pc2U8dm9pZD47XG5cbiAgICAgICAgaWYgKHRoaXMuX2JyYW5jaGVzID09PSB1bmRlZmluZWQpXG4gICAgICAgIHtcbiAgICAgICAgICAgIC8vIFRoZSBpbnRlcm5hbCBjYWNoZSBvZiBicmFuY2hlcyBuZWVkcyB0byBiZSB1cGRhdGVkLlxuICAgICAgICAgICAgdXBkYXRlUHJvbWlzZSA9IEdpdEJyYW5jaC5lbnVtZXJhdGVHaXRSZXBvQnJhbmNoZXModGhpcylcbiAgICAgICAgICAgIC50aGVuKChicmFuY2hlczogQXJyYXk8R2l0QnJhbmNoPikgPT4ge1xuICAgICAgICAgICAgICAgIHRoaXMuX2JyYW5jaGVzID0gYnJhbmNoZXM7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlXG4gICAgICAgIHtcbiAgICAgICAgICAgIC8vIFRoZSBpbnRlcm5hbCBjYWNoZSBkb2VzIG5vdCBuZWVkIHRvIGJlIHVwZGF0ZWQuXG4gICAgICAgICAgICB1cGRhdGVQcm9taXNlID0gUHJvbWlzZS5yZXNvbHZlKCk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gdXBkYXRlUHJvbWlzZVxuICAgICAgICAudGhlbigoKSA9PiB7XG4gICAgICAgICAgICAvLyBTaW5jZSB1cGRhdGVQcm9taXNlIHJlc29sdmVkLCB3ZSBrbm93IHRoYXQgdGhpcy5fYnJhbmNoZXMgaGFzIGJlZW5cbiAgICAgICAgICAgIC8vIHNldC5cbiAgICAgICAgICAgIHJldHVybiB0aGlzLl9icmFuY2hlcyE7XG4gICAgICAgIH0pO1xuICAgIH1cblxuXG4gICAgcHVibGljIGFzeW5jIGdldEN1cnJlbnRCcmFuY2goKTogUHJvbWlzZTxHaXRCcmFuY2ggfCB1bmRlZmluZWQ+XG4gICAge1xuICAgICAgICAvLyBXaGVuIG9uIG1hc3RlcjpcbiAgICAgICAgLy8gZ2l0IHN5bWJvbGljLXJlZiBIRUFEXG4gICAgICAgIC8vIHJlZnMvaGVhZHMvbWFzdGVyXG5cbiAgICAgICAgLy8gV2hlbiBpbiBkZXRhY2hlZCBoZWFkIHN0YXRlOlxuICAgICAgICAvLyBnaXQgc3ltYm9saWMtcmVmIEhFQURcbiAgICAgICAgLy8gZmF0YWw6IHJlZiBIRUFEIGlzIG5vdCBhIHN5bWJvbGljIHJlZlxuXG4gICAgICAgIC8vIFRoZSBiZWxvdyBjb21tYW5kIHdoZW4gaW4gZGV0YWNoZWQgSEVBRCBzdGF0ZVxuICAgICAgICAvLyAkIGdpdCByZXYtcGFyc2UgLS1hYmJyZXYtcmVmIEhFQURcbiAgICAgICAgLy8gSEVBRFxuXG4gICAgICAgIGNvbnN0IGJyYW5jaE5hbWUgPSBhd2FpdCBzcGF3bihcImdpdFwiLCBbXCJyZXYtcGFyc2VcIiwgXCItLWFiYnJldi1yZWZcIiwgXCJIRUFEXCJdLCB0aGlzLl9kaXIudG9TdHJpbmcoKSk7XG4gICAgICAgIGlmIChicmFuY2hOYW1lID09PSBcIkhFQURcIilcbiAgICAgICAge1xuICAgICAgICAgICAgLy8gVGhlIHJlcG8gaXMgaW4gZGV0YWNoZWQgaGVhZCBzdGF0ZS5cbiAgICAgICAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBicmFuY2ggPSBhd2FpdCBHaXRCcmFuY2guY3JlYXRlKHRoaXMsIGJyYW5jaE5hbWUpO1xuXG4gICAgICAgIC8vIEFsbCBpcyBnb29kLlxuICAgICAgICByZXR1cm4gYnJhbmNoO1xuICAgIH1cblxuXG4gICAgcHVibGljIGFzeW5jIGNoZWNrb3V0QnJhbmNoKGJyYW5jaDogR2l0QnJhbmNoLCBjcmVhdGVJZk5vbmV4aXN0ZW50OiBib29sZWFuKTogUHJvbWlzZTx2b2lkPlxuICAgIHtcbiAgICAgICAgaWYgKGNyZWF0ZUlmTm9uZXhpc3RlbnQpXG4gICAgICAgIHtcbiAgICAgICAgICAgIC8vIElmIHRoZXJlIGlzIGEgYnJhbmNoIHdpdGggdGhlIHNhbWUgbmFtZSwgd2Ugc2hvdWxkIG5vdCB0cnkgdG9cbiAgICAgICAgICAgIC8vIGNyZWF0ZSBpdC4gIEluc3RlYWQsIHdlIHNob3VsZCBqdXN0IGNoZWNrIGl0IG91dC5cbiAgICAgICAgICAgIGNvbnN0IGFsbEJyYW5jaGVzID0gYXdhaXQgdGhpcy5nZXRCcmFuY2hlcygpO1xuICAgICAgICAgICAgaWYgKF8uc29tZShhbGxCcmFuY2hlcywge25hbWU6IGJyYW5jaC5uYW1lfSkpXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgY3JlYXRlSWZOb25leGlzdGVudCA9IGZhbHNlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgYXJncyA9IFtcbiAgICAgICAgICAgIFwiY2hlY2tvdXRcIixcbiAgICAgICAgICAgIC4uLihjcmVhdGVJZk5vbmV4aXN0ZW50ID8gW1wiLWJcIl0gOiBbXSksXG4gICAgICAgICAgICBicmFuY2gubmFtZVxuICAgICAgICBdO1xuXG4gICAgICAgIGF3YWl0IHNwYXduKFwiZ2l0XCIsIGFyZ3MsIHRoaXMuX2Rpci50b1N0cmluZygpKTtcbiAgICB9XG5cblxuICAgIHB1YmxpYyBhc3luYyBjaGVja291dENvbW1pdChjb21taXQ6IENvbW1pdEhhc2gpOiBQcm9taXNlPHZvaWQ+XG4gICAge1xuICAgICAgICBhd2FpdCBzcGF3bihcImdpdFwiLCBbXCJjaGVja291dFwiLCBjb21taXQudG9TdHJpbmcoKV0sIHRoaXMuX2Rpci50b1N0cmluZygpKTtcbiAgICB9XG5cblxuICAgIHB1YmxpYyBzdGFnZUFsbCgpOiBQcm9taXNlPEdpdFJlcG8+XG4gICAge1xuICAgICAgICByZXR1cm4gc3Bhd24oXCJnaXRcIiwgW1wiYWRkXCIsIFwiLlwiXSwgdGhpcy5fZGlyLnRvU3RyaW5nKCkpXG4gICAgICAgIC50aGVuKCgpID0+IHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgICB9KTtcbiAgICB9XG5cblxuICAgIHB1YmxpYyBhc3luYyBwdXNoQ3VycmVudEJyYW5jaChyZW1vdGVOYW1lOiBzdHJpbmcgPSBcIm9yaWdpblwiLCBzZXRVcHN0cmVhbTogYm9vbGVhbiA9IGZhbHNlKTogUHJvbWlzZTx2b2lkPlxuICAgIHtcbiAgICAgICAgY29uc3QgY3VyQnJhbmNoID0gYXdhaXQgdGhpcy5nZXRDdXJyZW50QnJhbmNoKCk7XG4gICAgICAgIGlmICghY3VyQnJhbmNoKVxuICAgICAgICB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJUaGVyZSBpcyBubyBjdXJyZW50IGJyYW5jaCB0byBwdXNoLlwiKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IGFyZ3MgPSBbXG4gICAgICAgICAgICBcInB1c2hcIixcbiAgICAgICAgICAgIC4uLihzZXRVcHN0cmVhbSA/IFtcIi11XCJdIDogW10pLFxuICAgICAgICAgICAgcmVtb3RlTmFtZSxcbiAgICAgICAgICAgIGN1ckJyYW5jaC5uYW1lXG4gICAgICAgIF07XG5cbiAgICAgICAgcmV0dXJuIHNwYXduKFwiZ2l0XCIsIGFyZ3MsIHRoaXMuX2Rpci50b1N0cmluZygpKVxuICAgICAgICAudGhlbigoKSA9PiB7XG4gICAgICAgIH0pXG4gICAgICAgIC5jYXRjaCgoZXJyKSA9PiB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhgRXJyb3IgcHVzaGluZyBjdXJyZW50IGJyYW5jaDogJHtKU09OLnN0cmluZ2lmeShlcnIpfWApO1xuICAgICAgICAgICAgdGhyb3cgZXJyO1xuICAgICAgICB9KTtcbiAgICB9XG5cblxuICAgIC8vIFRPRE86IFdyaXRlIHVuaXQgdGVzdHMgZm9yIHRoZSBmb2xsb3dpbmcgbWV0aG9kLlxuICAgIHB1YmxpYyBhc3luYyBnZXRDb21taXREZWx0YXModHJhY2tpbmdSZW1vdGU6IHN0cmluZyA9IFwib3JpZ2luXCIpOiBQcm9taXNlPHthaGVhZDogbnVtYmVyLCBiZWhpbmQ6IG51bWJlcn0+XG4gICAge1xuICAgICAgICBjb25zdCBicmFuY2ggPSBhd2FpdCB0aGlzLmdldEN1cnJlbnRCcmFuY2goKTtcbiAgICAgICAgaWYgKCFicmFuY2gpXG4gICAgICAgIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIkNhbm5vdCBnZXROdW1Db21taXRzQWhlYWQoKSB3aGVuIEhFQUQgaXMgbm90IG9uIGEgYnJhbmNoLlwiKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIFRoZSBuYW1lcyBvZiB0aGUgdHdvIGJyYW5jaGVzIGluIHF1ZXN0aW9uLlxuICAgICAgICBjb25zdCB0aGlzQnJhbmNoTmFtZSA9IGJyYW5jaC5uYW1lO1xuICAgICAgICBjb25zdCB0cmFja2luZ0JyYW5jaE5hbWUgPSBgJHt0cmFja2luZ1JlbW90ZX0vJHt0aGlzQnJhbmNoTmFtZX1gO1xuXG4gICAgICAgIGNvbnN0IG51bUFoZWFkUHJvbWlzZSA9IHNwYXduKFxuICAgICAgICAgICAgXCJnaXRcIixcbiAgICAgICAgICAgIFtcInJldi1saXN0XCIsIHRoaXNCcmFuY2hOYW1lLCBcIi0tbm90XCIsIHRyYWNraW5nQnJhbmNoTmFtZSwgXCItLWNvdW50XCJdLFxuICAgICAgICAgICAgdGhpcy5fZGlyLnRvU3RyaW5nKClcbiAgICAgICAgKTtcblxuICAgICAgICBjb25zdCBudW1CZWhpbmRQcm9taXNlID0gc3Bhd24oXG4gICAgICAgICAgICBcImdpdFwiLFxuICAgICAgICAgICAgW1wicmV2LWxpc3RcIiwgdHJhY2tpbmdCcmFuY2hOYW1lLCBcIi0tbm90XCIsIHRoaXNCcmFuY2hOYW1lLCBcIi0tY291bnRcIl0sXG4gICAgICAgICAgICB0aGlzLl9kaXIudG9TdHJpbmcoKVxuICAgICAgICApO1xuXG4gICAgICAgIHJldHVybiBQcm9taXNlLmFsbChbbnVtQWhlYWRQcm9taXNlLCBudW1CZWhpbmRQcm9taXNlXSlcbiAgICAgICAgLnRoZW4oKHJlc3VsdHMpID0+IHtcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgYWhlYWQ6IHBhcnNlSW50KHJlc3VsdHNbMF0sIDEwKSxcbiAgICAgICAgICAgICAgICBiZWhpbmQ6IHBhcnNlSW50KHJlc3VsdHNbMV0sIDEwKVxuICAgICAgICAgICAgfTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG5cbiAgICAvLyBUT0RPOiBUbyBnZXQgdGhlIHN0YWdlZCBmaWxlczpcbiAgICAvLyBnaXQgZGlmZiAtLW5hbWUtb25seSAtLWNhY2hlZFxuXG5cbiAgICAvLyBUT0RPOiBBZGQgdW5pdCB0ZXN0cyBmb3IgdGhpcyBtZXRob2QuXG4gICAgcHVibGljIGNvbW1pdChtc2c6IHN0cmluZyA9IFwiXCIpOiBQcm9taXNlPElHaXRMb2dFbnRyeT5cbiAgICB7XG4gICAgICAgIHJldHVybiBzcGF3bihcImdpdFwiLCBbXCJjb21taXRcIiwgXCItbVwiLCBtc2ddLCB0aGlzLl9kaXIudG9TdHJpbmcoKSlcbiAgICAgICAgLnRoZW4oKCkgPT4ge1xuICAgICAgICAgICAgLy8gR2V0IHRoZSBjb21taXQgaGFzaFxuICAgICAgICAgICAgcmV0dXJuIHNwYXduKFwiZ2l0XCIsIFtcInJldi1wYXJzZVwiLCBcIkhFQURcIl0sIHRoaXMuX2Rpci50b1N0cmluZygpKTtcbiAgICAgICAgfSlcbiAgICAgICAgLnRoZW4oKHN0ZG91dCkgPT4ge1xuICAgICAgICAgICAgY29uc3QgY29tbWl0SGFzaCA9IF8udHJpbShzdGRvdXQpO1xuICAgICAgICAgICAgcmV0dXJuIHNwYXduKFwiZ2l0XCIsIFtcInNob3dcIiwgY29tbWl0SGFzaF0sIHRoaXMuX2Rpci50b1N0cmluZygpKTtcbiAgICAgICAgfSlcbiAgICAgICAgLnRoZW4oKHN0ZG91dCkgPT4ge1xuICAgICAgICAgICAgY29uc3QgbWF0Y2ggPSBHSVRfTE9HX0VOVFJZX1JFR0VYLmV4ZWMoc3Rkb3V0KTtcbiAgICAgICAgICAgIGlmICghbWF0Y2gpXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBDb3VsZCBub3QgcGFyc2UgXCJnaXQgc2hvd1wiIG91dHB1dDpcXG4ke3N0ZG91dH1gKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgY29tbWl0SGFzaDogbWF0Y2hbMV0sXG4gICAgICAgICAgICAgICAgYXV0aG9yOiAgICAgbWF0Y2hbMl0sXG4gICAgICAgICAgICAgICAgdGltZXN0YW1wOiAgbmV3IERhdGUobWF0Y2hbM10pLFxuICAgICAgICAgICAgICAgIG1lc3NhZ2U6ICAgIG91dGRlbnQodHJpbUJsYW5rTGluZXMobWF0Y2hbNF0pKVxuICAgICAgICAgICAgfTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG5cbiAgICBwdWJsaWMgZ2V0TG9nKGZvcmNlVXBkYXRlPzogYm9vbGVhbik6IFByb21pc2U8QXJyYXk8SUdpdExvZ0VudHJ5Pj5cbiAgICB7XG4gICAgICAgIGlmIChmb3JjZVVwZGF0ZSlcbiAgICAgICAge1xuICAgICAgICAgICAgdGhpcy5fbG9nID0gdW5kZWZpbmVkO1xuICAgICAgICB9XG5cbiAgICAgICAgbGV0IHVwZGF0ZVByb21pc2U6IFByb21pc2U8dm9pZD47XG5cbiAgICAgICAgaWYgKHRoaXMuX2xvZyA9PT0gdW5kZWZpbmVkKVxuICAgICAgICB7XG4gICAgICAgICAgICB1cGRhdGVQcm9taXNlID0gdGhpcy5nZXRMb2dFbnRyaWVzKClcbiAgICAgICAgICAgIC50aGVuKChsb2c6IEFycmF5PElHaXRMb2dFbnRyeT4pID0+IHtcbiAgICAgICAgICAgICAgICB0aGlzLl9sb2cgPSBsb2c7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlXG4gICAgICAgIHtcbiAgICAgICAgICAgIHVwZGF0ZVByb21pc2UgPSBQcm9taXNlLnJlc29sdmUoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB1cGRhdGVQcm9taXNlXG4gICAgICAgIC50aGVuKCgpID0+IHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl9sb2chO1xuICAgICAgICB9KTtcbiAgICB9XG5cblxuICAgIC8qKlxuICAgICAqIEhlbHBlciBtZXRob2QgdGhhdCByZXRyaWV2ZXMgR2l0IGxvZyBlbnRyaWVzXG4gICAgICogQHByaXZhdGVcbiAgICAgKiBAbWV0aG9kXG4gICAgICogQHJldHVybiBBIHByb21pc2UgZm9yIGFuIGFycmF5IG9mIHN0cnVjdHVyZXMgZGVzY3JpYmluZyBlYWNoIGNvbW1pdC5cbiAgICAgKi9cbiAgICBwcml2YXRlIGdldExvZ0VudHJpZXMoKTogUHJvbWlzZTxBcnJheTxJR2l0TG9nRW50cnk+PlxuICAgIHtcbiAgICAgICAgcmV0dXJuIHNwYXduKFwiZ2l0XCIsIFtcImxvZ1wiXSwgdGhpcy5fZGlyLnRvU3RyaW5nKCkpXG4gICAgICAgIC50aGVuKChzdGRvdXQpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IGVudHJpZXM6IEFycmF5PElHaXRMb2dFbnRyeT4gPSBbXTtcbiAgICAgICAgICAgIGxldCBtYXRjaDogUmVnRXhwRXhlY0FycmF5IHwgbnVsbDtcbiAgICAgICAgICAgIHdoaWxlICgobWF0Y2ggPSBHSVRfTE9HX0VOVFJZX1JFR0VYLmV4ZWMoc3Rkb3V0KSkgIT09IG51bGwpIC8vIHRzbGludDpkaXNhYmxlLWxpbmVcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBlbnRyaWVzLnB1c2goXG4gICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbW1pdEhhc2g6IG1hdGNoWzFdLFxuICAgICAgICAgICAgICAgICAgICAgICAgYXV0aG9yOiAgICAgbWF0Y2hbMl0sXG4gICAgICAgICAgICAgICAgICAgICAgICB0aW1lc3RhbXA6ICBuZXcgRGF0ZShtYXRjaFszXSksXG4gICAgICAgICAgICAgICAgICAgICAgICBtZXNzYWdlOiAgICBvdXRkZW50KHRyaW1CbGFua0xpbmVzKG1hdGNoWzRdKSlcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIEdpdCBsb2cgbGlzdHMgdGhlIG1vc3QgcmVjZW50IGVudHJ5IGZpcnN0LiAgUmV2ZXJzZSB0aGUgYXJyYXkgc29cbiAgICAgICAgICAgIC8vIHRoYXQgdGhlIG1vc3QgcmVjZW50IGVudHJ5IGlzIHRoZSBsYXN0LlxuICAgICAgICAgICAgXy5yZXZlcnNlKGVudHJpZXMpO1xuICAgICAgICAgICAgcmV0dXJuIGVudHJpZXM7XG4gICAgICAgIH0pO1xuICAgIH1cblxuXG59XG5cbi8vIFRPRE86IFRoZSBmb2xsb3dpbmcgd2lsbCBsaXN0IGFsbCB0YWdzIHBvaW50aW5nIHRvIHRoZSBzcGVjaWZpZWQgY29tbWl0LlxuLy8gZ2l0IHRhZyAtLXBvaW50cy1hdCAzNGI4YmZmXG4iXX0=
