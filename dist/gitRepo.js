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
var spawn_1 = require("./spawn");
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
                        new directory_1.Directory(dir, ".git").exists() // The directory contains a .git directory
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
        var repoDir = new directory_1.Directory(parentDir, projName);
        return parentDir.exists()
            .then(function (parentDirExists) {
            if (!parentDirExists) {
                throw new Error(parentDir + " is not a directory.");
            }
        })
            .then(function () {
            return spawn_1.spawn("git", ["clone", srcStr, projName], parentDir.toString());
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
        return spawn_1.spawn("git", ["ls-files"], this._dir.toString())
            .then(function (stdout) {
            var relativeFilePaths = stdout.split("\n");
            return _.map(relativeFilePaths, function (curRelFilePath) {
                return new file_1.File(_this._dir, curRelFilePath);
            });
        });
    };
    // TODO: Write unit tests for this method and make sure the files have the
    // correct preceding path.
    GitRepo.prototype.modifiedFiles = function () {
        var _this = this;
        return spawn_1.spawn("git", ["ls-files", "-m"], this._dir.toString())
            .then(function (stdout) {
            if (stdout === "") {
                return [];
            }
            var relativeFilePaths = stdout.split("\n");
            return _.map(relativeFilePaths, function (curRelativeFilePath) {
                return new file_1.File(_this._dir, curRelativeFilePath);
            });
        });
    };
    // TODO: Write unit tests for this method and make sure the files have the
    // correct preceding path.
    GitRepo.prototype.untrackedFiles = function () {
        var _this = this;
        return spawn_1.spawn("git", ["ls-files", "--others", "--exclude-standard"], this._dir.toString())
            .then(function (stdout) {
            if (stdout === "") {
                return [];
            }
            var relativeFilePaths = stdout.split("\n");
            return _.map(relativeFilePaths, function (curRelativePath) {
                return new file_1.File(_this._dir, curRelativePath);
            });
        });
    };
    // TODO: Write unit tests for this method.  Make sure there is no leading or trailing whiespace.
    GitRepo.prototype.currentCommitHash = function () {
        return __awaiter(this, void 0, void 0, function () {
            var stdout, hash;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, spawn_1.spawn("git", ["rev-parse", "--verify", "HEAD"], this._dir.toString())];
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
        return spawn_1.spawn("git", ["remote", "-vv"], this._dir.toString())
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
            var packageJson = new file_1.File(_this._dir, "package.json").readJsonSync();
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
        return spawn_1.spawn("git", ["tag"], this._dir.toString())
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
        return spawn_1.spawn("git", args, this._dir.toString())
            .then(function () {
            return _this;
        });
    };
    GitRepo.prototype.deleteTag = function (tagName) {
        var _this = this;
        return spawn_1.spawn("git", ["tag", "--delete", tagName], this._dir.toString())
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
        return spawn_1.spawn("git", args, this._dir.toString())
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
            var stdout, branchName, branch;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, spawn_1.spawn("git", ["rev-parse", "--abbrev-ref", "HEAD"], this._dir.toString())];
                    case 1:
                        stdout = _a.sent();
                        branchName = stdout.trim();
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
                        return [4 /*yield*/, spawn_1.spawn("git", args, this._dir.toString())];
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
                    case 0: return [4 /*yield*/, spawn_1.spawn("git", ["checkout", commit.toString()], this._dir.toString())];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    GitRepo.prototype.stageAll = function () {
        var _this = this;
        return spawn_1.spawn("git", ["add", "."], this._dir.toString())
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
                        args = [
                            "push"
                        ].concat((setUpstream ? ["-u"] : []), [
                            remoteName,
                            curBranch.name
                        ]);
                        return [2 /*return*/, spawn_1.spawn("git", args, this._dir.toString())
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
    // TODO: To get the staged files:
    // git diff --name-only --cached
    // TODO: Add unit tests for this method.
    GitRepo.prototype.commit = function (msg) {
        var _this = this;
        if (msg === void 0) { msg = ""; }
        return spawn_1.spawn("git", ["commit", "-m", msg], this._dir.toString())
            .then(function () {
            // Get the commit hash
            return spawn_1.spawn("git", ["rev-parse", "HEAD"], _this._dir.toString());
        })
            .then(function (stdout) {
            var commitHash = _.trim(stdout);
            return spawn_1.spawn("git", ["show", commitHash], _this._dir.toString());
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
        return spawn_1.spawn("git", ["log"], this._dir.toString())
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

//# sourceMappingURL=data:application/json;charset=utf8;base64,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QUFLLHVCQUFPLENBQUMsOEJBQWMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztpQkFDaEQsQ0FDSixDQUFDO1lBQ04sQ0FBQztZQUVELG1FQUFtRTtZQUNuRSwwQ0FBMEM7WUFDMUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsQ0FBQztZQUNuQixNQUFNLENBQUMsT0FBTyxDQUFDO1FBQ25CLENBQUMsQ0FBQyxDQUFDO0lBQ1AsQ0FBQztJQUdMLGNBQUM7QUFBRCxDQXpnQkEsQUF5Z0JDLElBQUE7QUF6Z0JZLDBCQUFPIiwiZmlsZSI6ImdpdFJlcG8uanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge0RpcmVjdG9yeX0gZnJvbSBcIi4vZGlyZWN0b3J5XCI7XG5pbXBvcnQge0ZpbGV9IGZyb20gXCIuL2ZpbGVcIjtcbmltcG9ydCB7c3Bhd259IGZyb20gXCIuL3NwYXduXCI7XG5pbXBvcnQge0lQYWNrYWdlSnNvbn0gZnJvbSBcIi4vbm9kZVBhY2thZ2VcIjtcbmltcG9ydCB7R2l0QnJhbmNofSBmcm9tIFwiLi9naXRCcmFuY2hcIjtcbmltcG9ydCAqIGFzIF8gZnJvbSBcImxvZGFzaFwiO1xuaW1wb3J0IHtvdXRkZW50LCB0cmltQmxhbmtMaW5lc30gZnJvbSBcIi4vc3RyaW5nSGVscGVyc1wiO1xuaW1wb3J0IHtVcmwsIGdpdFVybFRvUHJvamVjdE5hbWV9IGZyb20gXCIuL3VybFwiO1xuaW1wb3J0IHtDb21taXRIYXNofSBmcm9tIFwiLi9jb21taXRIYXNoXCI7XG5cblxuaW50ZXJmYWNlIElHaXRMb2dFbnRyeVxue1xuICAgIGNvbW1pdEhhc2g6IHN0cmluZztcbiAgICBhdXRob3I6IHN0cmluZztcbiAgICB0aW1lc3RhbXA6IERhdGU7XG4gICAgbWVzc2FnZTogc3RyaW5nO1xufVxuXG5cbi8vXG4vLyBBIHJlZ2V4IGZvciBwYXJzaW5nIFwiZ2l0IGxvZ1wiIG91dHB1dC5cbi8vIG1hdGNoWzFdOiBjb21taXQgaGFzaFxuLy8gbWF0Y2hbMl06IGF1dGhvclxuLy8gbWF0Y2hbM106IGNvbW1pdCB0aW1lc3RhbXBcbi8vIG1hdGNoWzRdOiBjb21taXQgbWVzc2FnZSAoYSBzZXF1ZW5jZSBvZiBsaW5lcyB0aGF0IGFyZSBlaXRoZXIgYmxhbmsgb3Igc3RhcnQgd2l0aCB3aGl0ZXNwYWNlKVxuLy9cbmNvbnN0IEdJVF9MT0dfRU5UUllfUkVHRVggPSAvY29tbWl0XFxzKihbMC05YS1mXSspLio/JFxcc15BdXRob3I6XFxzKiguKj8pJFxcc15EYXRlOlxccyooLio/KSRcXHMoKD86KD86XlxccyokXFxuPyl8KD86XlxccysoPzouKikkXFxzPykpKykvZ207XG5cbi8qKlxuICogRGV0ZXJtaW5lcyB3aGV0aGVyIGRpciBpcyBhIGRpcmVjdG9yeSBjb250YWluaW5nIGEgR2l0IHJlcG9zaXRvcnkuXG4gKiBAcGFyYW0gZGlyIC0gVGhlIGRpcmVjdG9yeSB0byBpbnNwZWN0XG4gKiBAcmV0dXJuIEEgcHJvbWlzZSBmb3IgYSBib29sZWFuIGluZGljYXRpbmcgd2hldGhlciBkaXIgY29udGFpbnMgYSBHaXRcbiAqIHJlcG9zaXRvcnkuICBUaGlzIHByb21pc2Ugd2lsbCBuZXZlciByZWplY3QuXG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBpc0dpdFJlcG9EaXIoZGlyOiBEaXJlY3RvcnkpOiBQcm9taXNlPGJvb2xlYW4+IHtcblxuICAgIGNvbnN0IFtkaXJFeGlzdHMsIGRvdEdpdEV4aXN0c10gPSBhd2FpdCBQcm9taXNlLmFsbChbXG4gICAgICAgIGRpci5leGlzdHMoKSwgICAgICAgICAgICAgICAgICAgICAgICAvLyBUaGUgZGlyZWN0b3J5IGV4aXN0c1xuICAgICAgICBuZXcgRGlyZWN0b3J5KGRpciwgXCIuZ2l0XCIpLmV4aXN0cygpICAvLyBUaGUgZGlyZWN0b3J5IGNvbnRhaW5zIGEgLmdpdCBkaXJlY3RvcnlcbiAgICBdKTtcblxuICAgIHJldHVybiBCb29sZWFuKGRpckV4aXN0cyAmJiBkb3RHaXRFeGlzdHMpO1xufVxuXG5cbmV4cG9ydCBjbGFzcyBHaXRSZXBvXG57XG4gICAgLy9yZWdpb24gUHJpdmF0ZSBEYXRhIE1lbWJlcnNcbiAgICBwcml2YXRlIF9kaXI6IERpcmVjdG9yeTtcbiAgICBwcml2YXRlIF9icmFuY2hlczogQXJyYXk8R2l0QnJhbmNoPiB8IHVuZGVmaW5lZDtcbiAgICBwcml2YXRlIF9sb2c6IEFycmF5PElHaXRMb2dFbnRyeT4gfCB1bmRlZmluZWQ7XG4gICAgLy9lbmRyZWdpb25cblxuXG4gICAgLyoqXG4gICAgICogQ3JlYXRlcyBhIG5ldyBHaXRSZXBvIGluc3RhbmNlLCBwb2ludGluZyBpdCBhdCBhIGRpcmVjdG9yeSBjb250YWluaW5nIHRoZVxuICAgICAqIHdyYXBwZWQgcmVwby5cbiAgICAgKiBAcGFyYW0gZGlyIC0gVGhlIGRpcmVjdG9yeSBjb250YWluaW5nIHRoZSByZXBvXG4gICAgICogQHJldHVybiBBIFByb21pc2UgZm9yIHRoZSBHaXRSZXBvLlxuICAgICAqL1xuICAgIHB1YmxpYyBzdGF0aWMgYXN5bmMgZnJvbURpcmVjdG9yeShkaXI6IERpcmVjdG9yeSk6IFByb21pc2U8R2l0UmVwbz5cbiAgICB7XG4gICAgICAgIGNvbnN0IGlzR2l0UmVwbyA9IGF3YWl0IGlzR2l0UmVwb0RpcihkaXIpO1xuICAgICAgICBpZiAoaXNHaXRSZXBvKVxuICAgICAgICB7XG4gICAgICAgICAgICByZXR1cm4gbmV3IEdpdFJlcG8oZGlyKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlXG4gICAgICAgIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIlBhdGggZG9lcyBub3QgZXhpc3Qgb3IgaXMgbm90IGEgR2l0IHJlcG8uXCIpO1xuICAgICAgICB9XG4gICAgfVxuXG5cbiAgICAvKipcbiAgICAgKiBDbG9uZXMgYSBHaXQgcmVwbyBhdCB0aGUgc3BlY2lmaWVkIGxvY2F0aW9uLlxuICAgICAqIEBwYXJhbSBzcmMgLSBUaGUgc291cmNlIHRvIGNsb25lIHRoZSByZXBvIGZyb21cbiAgICAgKiBAcGFyYW0gcGFyZW50RGlyIC0gVGhlIHBhcmVudCBkaXJlY3Rvcnkgd2hlcmUgdGhlIHJlcG8gd2lsbCBiZSBwbGFjZWQuXG4gICAgICogVGhlIHJlcG8gd2lsbCBiZSBjbG9uZWQgaW50byBhIHN1YmRpcmVjdG9yeSBuYW1lZCBhZnRlciB0aGUgcHJvamVjdC5cbiAgICAgKiBAcmV0dXJuIEEgcHJvbWlzZSBmb3IgdGhlIGNsb25lZCBHaXQgcmVwby5cbiAgICAgKi9cbiAgICBwdWJsaWMgc3RhdGljIGNsb25lKHNyYzogVXJsIHwgRGlyZWN0b3J5LCBwYXJlbnREaXI6IERpcmVjdG9yeSk6IFByb21pc2U8R2l0UmVwbz5cbiAgICB7XG4gICAgICAgIGxldCBwcm9qTmFtZTogc3RyaW5nO1xuICAgICAgICBsZXQgc3JjU3RyOiBzdHJpbmc7XG5cbiAgICAgICAgaWYgKHNyYyBpbnN0YW5jZW9mIFVybClcbiAgICAgICAge1xuICAgICAgICAgICAgcHJvak5hbWUgPSBnaXRVcmxUb1Byb2plY3ROYW1lKHNyYy50b1N0cmluZygpKTtcbiAgICAgICAgICAgIGNvbnN0IHByb3RvY29scyA9IHNyYy5nZXRQcm90b2NvbHMoKTtcbiAgICAgICAgICAgIHNyY1N0ciA9IHByb3RvY29scy5sZW5ndGggPCAyID9cbiAgICAgICAgICAgICAgICBzcmMudG9TdHJpbmcoKSA6XG4gICAgICAgICAgICAgICAgc3JjLnJlcGxhY2VQcm90b2NvbChcImh0dHBzXCIpLnRvU3RyaW5nKCk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZVxuICAgICAgICB7XG4gICAgICAgICAgICBwcm9qTmFtZSA9IHNyYy5kaXJOYW1lO1xuICAgICAgICAgICAgc3JjU3RyID0gc3JjLnRvU3RyaW5nKCk7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCByZXBvRGlyID0gbmV3IERpcmVjdG9yeShwYXJlbnREaXIsIHByb2pOYW1lKTtcblxuICAgICAgICByZXR1cm4gcGFyZW50RGlyLmV4aXN0cygpXG4gICAgICAgIC50aGVuKChwYXJlbnREaXJFeGlzdHMpID0+IHtcbiAgICAgICAgICAgIGlmICghcGFyZW50RGlyRXhpc3RzKVxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgJHtwYXJlbnREaXJ9IGlzIG5vdCBhIGRpcmVjdG9yeS5gKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSlcbiAgICAgICAgLnRoZW4oKCkgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIHNwYXduKFxuICAgICAgICAgICAgICAgIFwiZ2l0XCIsXG4gICAgICAgICAgICAgICAgW1wiY2xvbmVcIiwgc3JjU3RyLCBwcm9qTmFtZV0sXG4gICAgICAgICAgICAgICAgcGFyZW50RGlyLnRvU3RyaW5nKCkpO1xuICAgICAgICB9KVxuICAgICAgICAudGhlbigoKSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gbmV3IEdpdFJlcG8ocmVwb0Rpcik7XG4gICAgICAgIH0pO1xuICAgIH1cblxuXG4gICAgLyoqXG4gICAgICogQ29uc3RydWN0cyBhIG5ldyBHaXRSZXBvLiAgUHJpdmF0ZSBpbiBvcmRlciB0byBwcm92aWRlIGVycm9yIGNoZWNraW5nLlxuICAgICAqIFNlZSBzdGF0aWMgbWV0aG9kcy5cbiAgICAgKlxuICAgICAqIEBwYXJhbSBkaXIgLSBUaGUgZGlyZWN0b3J5IGNvbnRhaW5pbmcgdGhlIEdpdCByZXBvLlxuICAgICAqL1xuICAgIHByaXZhdGUgY29uc3RydWN0b3IoZGlyOiBEaXJlY3RvcnkpXG4gICAge1xuICAgICAgICB0aGlzLl9kaXIgPSBkaXI7XG4gICAgfVxuXG5cbiAgICAvKipcbiAgICAgKiBHZXRzIHRoZSBkaXJlY3RvcnkgY29udGFpbmluZyB0aGlzIEdpdCByZXBvLlxuICAgICAqIEByZXR1cm4gVGhlIGRpcmVjdG9yeSBjb250YWluaW5nIHRoaXMgZ2l0IHJlcG8uXG4gICAgICovXG4gICAgcHVibGljIGdldCBkaXJlY3RvcnkoKTogRGlyZWN0b3J5XG4gICAge1xuICAgICAgICByZXR1cm4gdGhpcy5fZGlyO1xuICAgIH1cblxuXG4gICAgLyoqXG4gICAgICogRGV0ZXJtaW5lcyB3aGV0aGVyIHRoaXMgR2l0UmVwbyBpcyBlcXVhbCB0byBhbm90aGVyIEdpdFJlcG8uICBUd29cbiAgICAgKiBpbnN0YW5jZXMgYXJlIGNvbnNpZGVyZWQgZXF1YWwgaWYgdGhleSBwb2ludCB0byB0aGUgc2FtZSBkaXJlY3RvcnkuXG4gICAgICogQG1ldGhvZFxuICAgICAqIEBwYXJhbSBvdGhlciAtIFRoZSBvdGhlciBHaXRSZXBvIHRvIGNvbXBhcmUgd2l0aFxuICAgICAqIEByZXR1cm4gV2hldGhlciB0aGUgdHdvIEdpdFJlcG8gaW5zdGFuY2VzIGFyZSBlcXVhbFxuICAgICAqL1xuICAgIHB1YmxpYyBlcXVhbHMob3RoZXI6IEdpdFJlcG8pOiBib29sZWFuXG4gICAge1xuICAgICAgICByZXR1cm4gdGhpcy5fZGlyLmVxdWFscyhvdGhlci5fZGlyKTtcbiAgICB9XG5cblxuICAgIC8qKlxuICAgICAqIEdldHMgdGhlIGZpbGVzIHRoYXQgYXJlIHVuZGVyIEdpdCB2ZXJzaW9uIGNvbnRyb2wuXG4gICAgICogQHJldHVybiBBIFByb21pc2UgZm9yIGFuIGFycmF5IG9mIGZpbGVzIHVuZGVyIEdpdCB2ZXJzaW9uIGNvbnRyb2wuXG4gICAgICovXG4gICAgcHVibGljIGZpbGVzKCk6IFByb21pc2U8QXJyYXk8RmlsZT4+XG4gICAge1xuICAgICAgICByZXR1cm4gc3Bhd24oXCJnaXRcIiwgW1wibHMtZmlsZXNcIl0sIHRoaXMuX2Rpci50b1N0cmluZygpKVxuICAgICAgICAudGhlbigoc3Rkb3V0KSA9PiB7XG4gICAgICAgICAgICBjb25zdCByZWxhdGl2ZUZpbGVQYXRocyA9IHN0ZG91dC5zcGxpdChcIlxcblwiKTtcbiAgICAgICAgICAgIHJldHVybiBfLm1hcChyZWxhdGl2ZUZpbGVQYXRocywgKGN1clJlbEZpbGVQYXRoKSA9PiB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIG5ldyBGaWxlKHRoaXMuX2RpciwgY3VyUmVsRmlsZVBhdGgpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuXG4gICAgLy8gVE9ETzogV3JpdGUgdW5pdCB0ZXN0cyBmb3IgdGhpcyBtZXRob2QgYW5kIG1ha2Ugc3VyZSB0aGUgZmlsZXMgaGF2ZSB0aGVcbiAgICAvLyBjb3JyZWN0IHByZWNlZGluZyBwYXRoLlxuICAgIHB1YmxpYyBtb2RpZmllZEZpbGVzKCk6IFByb21pc2U8QXJyYXk8RmlsZT4+XG4gICAge1xuICAgICAgICByZXR1cm4gc3Bhd24oXCJnaXRcIiwgW1wibHMtZmlsZXNcIiwgXCItbVwiXSwgdGhpcy5fZGlyLnRvU3RyaW5nKCkpXG4gICAgICAgIC50aGVuKChzdGRvdXQpID0+IHtcbiAgICAgICAgICAgIGlmIChzdGRvdXQgPT09IFwiXCIpXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIFtdO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY29uc3QgcmVsYXRpdmVGaWxlUGF0aHMgPSBzdGRvdXQuc3BsaXQoXCJcXG5cIik7XG4gICAgICAgICAgICByZXR1cm4gXy5tYXAocmVsYXRpdmVGaWxlUGF0aHMsIChjdXJSZWxhdGl2ZUZpbGVQYXRoKSA9PiB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIG5ldyBGaWxlKHRoaXMuX2RpciwgY3VyUmVsYXRpdmVGaWxlUGF0aCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG5cbiAgICAvLyBUT0RPOiBXcml0ZSB1bml0IHRlc3RzIGZvciB0aGlzIG1ldGhvZCBhbmQgbWFrZSBzdXJlIHRoZSBmaWxlcyBoYXZlIHRoZVxuICAgIC8vIGNvcnJlY3QgcHJlY2VkaW5nIHBhdGguXG4gICAgcHVibGljIHVudHJhY2tlZEZpbGVzKCk6IFByb21pc2U8QXJyYXk8RmlsZT4+XG4gICAge1xuICAgICAgICByZXR1cm4gc3Bhd24oXCJnaXRcIiwgW1wibHMtZmlsZXNcIiwgIFwiLS1vdGhlcnNcIiwgIFwiLS1leGNsdWRlLXN0YW5kYXJkXCJdLCB0aGlzLl9kaXIudG9TdHJpbmcoKSlcbiAgICAgICAgLnRoZW4oKHN0ZG91dCkgPT4ge1xuICAgICAgICAgICAgaWYgKHN0ZG91dCA9PT0gXCJcIilcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gW107XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjb25zdCByZWxhdGl2ZUZpbGVQYXRocyA9IHN0ZG91dC5zcGxpdChcIlxcblwiKTtcbiAgICAgICAgICAgIHJldHVybiBfLm1hcChyZWxhdGl2ZUZpbGVQYXRocywgKGN1clJlbGF0aXZlUGF0aCkgPT4ge1xuICAgICAgICAgICAgICAgIHJldHVybiBuZXcgRmlsZSh0aGlzLl9kaXIsIGN1clJlbGF0aXZlUGF0aCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG5cbiAgICAvLyBUT0RPOiBXcml0ZSB1bml0IHRlc3RzIGZvciB0aGlzIG1ldGhvZC4gIE1ha2Ugc3VyZSB0aGVyZSBpcyBubyBsZWFkaW5nIG9yIHRyYWlsaW5nIHdoaWVzcGFjZS5cbiAgICBwdWJsaWMgYXN5bmMgY3VycmVudENvbW1pdEhhc2goKTogUHJvbWlzZTxDb21taXRIYXNoPlxuICAgIHtcbiAgICAgICAgY29uc3Qgc3Rkb3V0ID0gYXdhaXQgc3Bhd24oXCJnaXRcIiwgW1wicmV2LXBhcnNlXCIsIFwiLS12ZXJpZnlcIiwgXCJIRUFEXCJdLCB0aGlzLl9kaXIudG9TdHJpbmcoKSk7XG4gICAgICAgIGNvbnN0IGhhc2ggPSBDb21taXRIYXNoLmZyb21TdHJpbmcoc3Rkb3V0KTtcbiAgICAgICAgaWYgKCFoYXNoKVxuICAgICAgICB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJGYWlsZWQgdG8gY29uc3RydWN0IENvbW1pdEhhc2guXCIpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBoYXNoO1xuICAgIH1cblxuXG4gICAgLyoqXG4gICAgICogR2V0IHRoZSByZW1vdGVzIGNvbmZpZ3VyZWQgZm9yIHRoZSBHaXQgcmVwby5cbiAgICAgKiBAcmV0dXJuIEEgUHJvbWlzZSBmb3IgYW4gb2JqZWN0IHdoZXJlIHRoZSByZW1vdGUgbmFtZXMgYXJlIHRoZSBrZXlzIGFuZFxuICAgICAqIHRoZSByZW1vdGUgVVJMIGlzIHRoZSB2YWx1ZS5cbiAgICAgKi9cbiAgICBwdWJsaWMgcmVtb3RlcygpOiBQcm9taXNlPHtbbmFtZTogc3RyaW5nXTogc3RyaW5nfT5cbiAgICB7XG4gICAgICAgIHJldHVybiBzcGF3bihcImdpdFwiLCBbXCJyZW1vdGVcIiwgXCItdnZcIl0sIHRoaXMuX2Rpci50b1N0cmluZygpKVxuICAgICAgICAudGhlbigoc3Rkb3V0KSA9PiB7XG5cbiAgICAgICAgICAgIGNvbnN0IGxpbmVzID0gc3Rkb3V0LnNwbGl0KFwiXFxuXCIpO1xuICAgICAgICAgICAgbGV0IHJlbW90ZXM6IHtbbmFtZTogc3RyaW5nXTogc3RyaW5nfSA9IHt9O1xuICAgICAgICAgICAgbGluZXMuZm9yRWFjaCgoY3VyTGluZSkgPT4ge1xuICAgICAgICAgICAgICAgIGNvbnN0IG1hdGNoID0gY3VyTGluZS5tYXRjaCgvXihcXHcrKVxccysoLiopXFxzK1xcKFxcdytcXCkkLyk7XG4gICAgICAgICAgICAgICAgaWYgKG1hdGNoKVxuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgcmVtb3Rlc1ttYXRjaFsxXV0gPSBtYXRjaFsyXTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgcmV0dXJuIHJlbW90ZXM7XG4gICAgICAgIH0pO1xuICAgIH1cblxuXG4gICAgLyoqXG4gICAgICogR2V0cyB0aGUgbmFtZSBvZiB0aGlzIEdpdCByZXBvc2l0b3J5LiAgSWYgdGhlIHJlcG8gaGFzIGEgcmVtb3RlLCB0aGUgbmFtZVxuICAgICAqIGlzIHRha2VuIGZyb20gdGhlIGxhc3QgcGFydCBvZiB0aGUgcmVtb3RlJ3MgVVJMLiAgT3RoZXJ3aXNlLCB0aGUgbmFtZVxuICAgICAqIHdpbGwgYmUgdGFrZW4gZnJvbSB0aGUgXCJuYW1lXCIgcHJvcGVydHkgaW4gcGFja2FnZS5qc29uLiAgT3RoZXJ3aXNlLCB0aGVcbiAgICAgKiBuYW1lIHdpbGwgYmUgdGhlIG5hbWUgb2YgdGhlIGZvbGRlciB0aGUgcmVwbyBpcyBpbi5cbiAgICAgKiBAcmV0dXJuIEEgUHJvbWlzZSBmb3IgdGhlIG5hbWUgb2YgdGhpcyByZXBvc2l0b3J5LlxuICAgICAqL1xuICAgIHB1YmxpYyBuYW1lKCk6IFByb21pc2U8c3RyaW5nPlxuICAgIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucmVtb3RlcygpXG4gICAgICAgIC50aGVuKChyZW1vdGVzKSA9PiB7XG4gICAgICAgICAgICBjb25zdCByZW1vdGVOYW1lcyA9IE9iamVjdC5rZXlzKHJlbW90ZXMpO1xuICAgICAgICAgICAgaWYgKHJlbW90ZU5hbWVzLmxlbmd0aCA+IDApXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgY29uc3QgcmVtb3RlVXJsID0gcmVtb3Rlc1tyZW1vdGVOYW1lc1swXV07XG4gICAgICAgICAgICAgICAgcmV0dXJuIGdpdFVybFRvUHJvamVjdE5hbWUocmVtb3RlVXJsKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSlcbiAgICAgICAgLnRoZW4oKHByb2pOYW1lKSA9PiB7XG4gICAgICAgICAgICBpZiAocHJvak5hbWUpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gcHJvak5hbWU7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIExvb2sgZm9yIHRoZSBwcm9qZWN0IG5hbWUgaW4gcGFja2FnZS5qc29uLlxuICAgICAgICAgICAgY29uc3QgcGFja2FnZUpzb24gPSBuZXcgRmlsZSh0aGlzLl9kaXIsIFwicGFja2FnZS5qc29uXCIpLnJlYWRKc29uU3luYzxJUGFja2FnZUpzb24+KCk7XG4gICAgICAgICAgICBpZiAocGFja2FnZUpzb24pIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gcGFja2FnZUpzb24ubmFtZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSlcbiAgICAgICAgLnRoZW4oKHByb2pOYW1lKSA9PiB7XG4gICAgICAgICAgICBpZiAocHJvak5hbWUpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gcHJvak5hbWU7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGNvbnN0IGRpck5hbWUgPSB0aGlzLl9kaXIuZGlyTmFtZTtcbiAgICAgICAgICAgIGlmIChkaXJOYW1lID09PSBcIi9cIilcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJVbmFibGUgdG8gZGV0ZXJtaW5lIEdpdCByZXBvIG5hbWUuXCIpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gZGlyTmFtZTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG5cbiAgICBwdWJsaWMgdGFncygpOiBQcm9taXNlPEFycmF5PHN0cmluZz4+XG4gICAge1xuICAgICAgICByZXR1cm4gc3Bhd24oXCJnaXRcIiwgW1widGFnXCJdLCB0aGlzLl9kaXIudG9TdHJpbmcoKSlcbiAgICAgICAgLnRoZW4oKHN0ZG91dCkgPT4ge1xuICAgICAgICAgICAgaWYgKHN0ZG91dC5sZW5ndGggPT09IDApXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIFtdO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gc3Rkb3V0LnNwbGl0KFwiXFxuXCIpO1xuICAgICAgICB9KTtcbiAgICB9XG5cblxuICAgIHB1YmxpYyBoYXNUYWcodGFnTmFtZTogc3RyaW5nKTogUHJvbWlzZTxib29sZWFuPlxuICAgIHtcbiAgICAgICAgcmV0dXJuIHRoaXMudGFncygpXG4gICAgICAgIC50aGVuKCh0YWdzKSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gdGFncy5pbmRleE9mKHRhZ05hbWUpID49IDA7XG4gICAgICAgIH0pO1xuICAgIH1cblxuXG4gICAgcHVibGljIGNyZWF0ZVRhZyh0YWdOYW1lOiBzdHJpbmcsIG1lc3NhZ2U6IHN0cmluZyA9IFwiXCIsIGZvcmNlOiBib29sZWFuID0gZmFsc2UpOiBQcm9taXNlPEdpdFJlcG8+XG4gICAge1xuICAgICAgICBsZXQgYXJncyA9IFtcInRhZ1wiXTtcblxuICAgICAgICBpZiAoZm9yY2UpIHtcbiAgICAgICAgICAgIGFyZ3MucHVzaChcIi1mXCIpO1xuICAgICAgICB9XG5cbiAgICAgICAgYXJncyA9IF8uY29uY2F0KGFyZ3MsIFwiLWFcIiwgdGFnTmFtZSk7XG4gICAgICAgIGFyZ3MgPSBfLmNvbmNhdChhcmdzLCBcIi1tXCIsIG1lc3NhZ2UpO1xuXG4gICAgICAgIHJldHVybiBzcGF3bihcImdpdFwiLCBhcmdzLCB0aGlzLl9kaXIudG9TdHJpbmcoKSlcbiAgICAgICAgLnRoZW4oKCkgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICAgIH0pO1xuICAgIH1cblxuXG4gICAgcHVibGljIGRlbGV0ZVRhZyh0YWdOYW1lOiBzdHJpbmcpOiBQcm9taXNlPEdpdFJlcG8+XG4gICAge1xuICAgICAgICByZXR1cm4gc3Bhd24oXCJnaXRcIiwgW1widGFnXCIsIFwiLS1kZWxldGVcIiwgdGFnTmFtZV0sIHRoaXMuX2Rpci50b1N0cmluZygpKVxuICAgICAgICAuY2F0Y2goKGVycikgPT4ge1xuICAgICAgICAgICAgaWYgKGVyci5zdGRlcnIuaW5jbHVkZXMoXCJub3QgZm91bmRcIikpXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgLy8gVGhlIHNwZWNpZmllZCB0YWcgbmFtZSB3YXMgbm90IGZvdW5kLiAgV2UgYXJlIHN0aWxsXG4gICAgICAgICAgICAgICAgLy8gc3VjY2Vzc2Z1bC5cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICB0aHJvdyBlcnI7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pXG4gICAgICAgIC50aGVuKCgpID0+IHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgICB9KTtcbiAgICB9XG5cblxuICAgIHB1YmxpYyBwdXNoVGFnKHRhZ05hbWU6IHN0cmluZywgcmVtb3RlTmFtZTogc3RyaW5nLCBmb3JjZTogYm9vbGVhbiA9IGZhbHNlKTogUHJvbWlzZTxHaXRSZXBvPlxuICAgIHtcbiAgICAgICAgbGV0IGFyZ3MgPSBbXCJwdXNoXCJdO1xuXG4gICAgICAgIGlmIChmb3JjZSkge1xuICAgICAgICAgICAgYXJncy5wdXNoKFwiLS1mb3JjZVwiKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGFyZ3MgPSBfLmNvbmNhdChhcmdzLCByZW1vdGVOYW1lLCB0YWdOYW1lKTtcblxuICAgICAgICByZXR1cm4gc3Bhd24oXCJnaXRcIiwgYXJncywgdGhpcy5fZGlyLnRvU3RyaW5nKCkpXG4gICAgICAgIC50aGVuKCgpID0+IHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgICB9KTtcbiAgICB9XG5cblxuICAgIHB1YmxpYyBnZXRCcmFuY2hlcyhmb3JjZVVwZGF0ZTogYm9vbGVhbiA9IGZhbHNlKTogUHJvbWlzZTxBcnJheTxHaXRCcmFuY2g+PlxuICAgIHtcbiAgICAgICAgaWYgKGZvcmNlVXBkYXRlKVxuICAgICAgICB7XG4gICAgICAgICAgICAvLyBJbnZhbGlkYXRlIHRoZSBjYWNoZS4gIElmIHRoaXMgdXBkYXRlIGZhaWxzLCBzdWJzZXF1ZW50IHJlcXVlc3RzXG4gICAgICAgICAgICAvLyB3aWxsIGhhdmUgdG8gdXBkYXRlIHRoZSBjYWNoZS5cbiAgICAgICAgICAgIHRoaXMuX2JyYW5jaGVzID0gdW5kZWZpbmVkO1xuICAgICAgICB9XG5cbiAgICAgICAgbGV0IHVwZGF0ZVByb21pc2U6IFByb21pc2U8dm9pZD47XG5cbiAgICAgICAgaWYgKHRoaXMuX2JyYW5jaGVzID09PSB1bmRlZmluZWQpXG4gICAgICAgIHtcbiAgICAgICAgICAgIC8vIFRoZSBpbnRlcm5hbCBjYWNoZSBvZiBicmFuY2hlcyBuZWVkcyB0byBiZSB1cGRhdGVkLlxuICAgICAgICAgICAgdXBkYXRlUHJvbWlzZSA9IEdpdEJyYW5jaC5lbnVtZXJhdGVHaXRSZXBvQnJhbmNoZXModGhpcylcbiAgICAgICAgICAgIC50aGVuKChicmFuY2hlczogQXJyYXk8R2l0QnJhbmNoPikgPT4ge1xuICAgICAgICAgICAgICAgIHRoaXMuX2JyYW5jaGVzID0gYnJhbmNoZXM7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlXG4gICAgICAgIHtcbiAgICAgICAgICAgIC8vIFRoZSBpbnRlcm5hbCBjYWNoZSBkb2VzIG5vdCBuZWVkIHRvIGJlIHVwZGF0ZWQuXG4gICAgICAgICAgICB1cGRhdGVQcm9taXNlID0gUHJvbWlzZS5yZXNvbHZlKCk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gdXBkYXRlUHJvbWlzZVxuICAgICAgICAudGhlbigoKSA9PiB7XG4gICAgICAgICAgICAvLyBTaW5jZSB1cGRhdGVQcm9taXNlIHJlc29sdmVkLCB3ZSBrbm93IHRoYXQgdGhpcy5fYnJhbmNoZXMgaGFzIGJlZW5cbiAgICAgICAgICAgIC8vIHNldC5cbiAgICAgICAgICAgIHJldHVybiB0aGlzLl9icmFuY2hlcyE7XG4gICAgICAgIH0pO1xuICAgIH1cblxuXG4gICAgcHVibGljIGFzeW5jIGdldEN1cnJlbnRCcmFuY2goKTogUHJvbWlzZTxHaXRCcmFuY2g+XG4gICAge1xuICAgICAgICAvLyBGVVRVUkU6IEkgZG9uJ3QgdGhpbmsgdGhlIGZvbGxvd2luZyB3aWxsIHdvcmsgd2hlbiBpbiBkZXRhY2hlZCBoZWFkIHN0YXRlLlxuICAgICAgICBjb25zdCBzdGRvdXQgPSBhd2FpdCBzcGF3bihcImdpdFwiLCBbXCJyZXYtcGFyc2VcIiwgXCItLWFiYnJldi1yZWZcIiwgXCJIRUFEXCJdLCB0aGlzLl9kaXIudG9TdHJpbmcoKSk7XG4gICAgICAgIGNvbnN0IGJyYW5jaE5hbWUgPSBzdGRvdXQudHJpbSgpO1xuICAgICAgICBjb25zdCBicmFuY2ggPSBhd2FpdCBHaXRCcmFuY2guY3JlYXRlKHRoaXMsIGJyYW5jaE5hbWUpO1xuXG4gICAgICAgIC8vIEFsbCBpcyBnb29kLlxuICAgICAgICByZXR1cm4gYnJhbmNoO1xuICAgIH1cblxuXG4gICAgcHVibGljIGFzeW5jIGNoZWNrb3V0QnJhbmNoKGJyYW5jaDogR2l0QnJhbmNoLCBjcmVhdGVJZk5vbmV4aXN0ZW50OiBib29sZWFuKTogUHJvbWlzZTx2b2lkPlxuICAgIHtcbiAgICAgICAgaWYgKGNyZWF0ZUlmTm9uZXhpc3RlbnQpXG4gICAgICAgIHtcbiAgICAgICAgICAgIC8vIElmIHRoZXJlIGlzIGEgYnJhbmNoIHdpdGggdGhlIHNhbWUgbmFtZSwgd2Ugc2hvdWxkIG5vdCB0cnkgdG9cbiAgICAgICAgICAgIC8vIGNyZWF0ZSBpdC4gIEluc3RlYWQsIHdlIHNob3VsZCBqdXN0IGNoZWNrIGl0IG91dC5cbiAgICAgICAgICAgIGNvbnN0IGFsbEJyYW5jaGVzID0gYXdhaXQgdGhpcy5nZXRCcmFuY2hlcygpO1xuICAgICAgICAgICAgaWYgKF8uc29tZShhbGxCcmFuY2hlcywge25hbWU6IGJyYW5jaC5uYW1lfSkpXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgY3JlYXRlSWZOb25leGlzdGVudCA9IGZhbHNlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgYXJncyA9IFtcbiAgICAgICAgICAgIFwiY2hlY2tvdXRcIixcbiAgICAgICAgICAgIC4uLihjcmVhdGVJZk5vbmV4aXN0ZW50ID8gW1wiLWJcIl0gOiBbXSksXG4gICAgICAgICAgICBicmFuY2gubmFtZVxuICAgICAgICBdO1xuXG4gICAgICAgIGF3YWl0IHNwYXduKFwiZ2l0XCIsIGFyZ3MsIHRoaXMuX2Rpci50b1N0cmluZygpKTtcbiAgICB9XG5cblxuICAgIHB1YmxpYyBhc3luYyBjaGVja291dENvbW1pdChjb21taXQ6IENvbW1pdEhhc2gpOiBQcm9taXNlPHZvaWQ+XG4gICAge1xuICAgICAgICBhd2FpdCBzcGF3bihcImdpdFwiLCBbXCJjaGVja291dFwiLCBjb21taXQudG9TdHJpbmcoKV0sIHRoaXMuX2Rpci50b1N0cmluZygpKTtcbiAgICB9XG5cblxuICAgIHB1YmxpYyBzdGFnZUFsbCgpOiBQcm9taXNlPEdpdFJlcG8+XG4gICAge1xuICAgICAgICByZXR1cm4gc3Bhd24oXCJnaXRcIiwgW1wiYWRkXCIsIFwiLlwiXSwgdGhpcy5fZGlyLnRvU3RyaW5nKCkpXG4gICAgICAgIC50aGVuKCgpID0+IHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgICB9KTtcbiAgICB9XG5cblxuICAgIHB1YmxpYyBhc3luYyBwdXNoQ3VycmVudEJyYW5jaChyZW1vdGVOYW1lOiBzdHJpbmcgPSBcIm9yaWdpblwiLCBzZXRVcHN0cmVhbTogYm9vbGVhbiA9IGZhbHNlKTogUHJvbWlzZTx2b2lkPlxuICAgIHtcbiAgICAgICAgY29uc3QgY3VyQnJhbmNoID0gYXdhaXQgdGhpcy5nZXRDdXJyZW50QnJhbmNoKCk7XG5cbiAgICAgICAgY29uc3QgYXJncyA9IFtcbiAgICAgICAgICAgIFwicHVzaFwiLFxuICAgICAgICAgICAgLi4uKHNldFVwc3RyZWFtID8gW1wiLXVcIl0gOiBbXSksXG4gICAgICAgICAgICByZW1vdGVOYW1lLFxuICAgICAgICAgICAgY3VyQnJhbmNoLm5hbWVcbiAgICAgICAgXTtcblxuICAgICAgICByZXR1cm4gc3Bhd24oXCJnaXRcIiwgYXJncywgdGhpcy5fZGlyLnRvU3RyaW5nKCkpXG4gICAgICAgIC50aGVuKCgpID0+IHtcbiAgICAgICAgfSlcbiAgICAgICAgLmNhdGNoKChlcnIpID0+IHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGBFcnJvciBwdXNoaW5nIGN1cnJlbnQgYnJhbmNoOiAke0pTT04uc3RyaW5naWZ5KGVycil9YCk7XG4gICAgICAgICAgICB0aHJvdyBlcnI7XG4gICAgICAgIH0pO1xuICAgIH1cblxuXG4gICAgLy8gVE9ETzogVG8gZ2V0IHRoZSBzdGFnZWQgZmlsZXM6XG4gICAgLy8gZ2l0IGRpZmYgLS1uYW1lLW9ubHkgLS1jYWNoZWRcblxuXG4gICAgLy8gVE9ETzogQWRkIHVuaXQgdGVzdHMgZm9yIHRoaXMgbWV0aG9kLlxuICAgIHB1YmxpYyBjb21taXQobXNnOiBzdHJpbmcgPSBcIlwiKTogUHJvbWlzZTxJR2l0TG9nRW50cnk+XG4gICAge1xuICAgICAgICByZXR1cm4gc3Bhd24oXCJnaXRcIiwgW1wiY29tbWl0XCIsIFwiLW1cIiwgbXNnXSwgdGhpcy5fZGlyLnRvU3RyaW5nKCkpXG4gICAgICAgIC50aGVuKCgpID0+IHtcbiAgICAgICAgICAgIC8vIEdldCB0aGUgY29tbWl0IGhhc2hcbiAgICAgICAgICAgIHJldHVybiBzcGF3bihcImdpdFwiLCBbXCJyZXYtcGFyc2VcIiwgXCJIRUFEXCJdLCB0aGlzLl9kaXIudG9TdHJpbmcoKSk7XG4gICAgICAgIH0pXG4gICAgICAgIC50aGVuKChzdGRvdXQpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IGNvbW1pdEhhc2ggPSBfLnRyaW0oc3Rkb3V0KTtcbiAgICAgICAgICAgIHJldHVybiBzcGF3bihcImdpdFwiLCBbXCJzaG93XCIsIGNvbW1pdEhhc2hdLCB0aGlzLl9kaXIudG9TdHJpbmcoKSk7XG4gICAgICAgIH0pXG4gICAgICAgIC50aGVuKChzdGRvdXQpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IG1hdGNoID0gR0lUX0xPR19FTlRSWV9SRUdFWC5leGVjKHN0ZG91dCk7XG4gICAgICAgICAgICBpZiAoIW1hdGNoKVxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgQ291bGQgbm90IHBhcnNlIFwiZ2l0IHNob3dcIiBvdXRwdXQ6XFxuJHtzdGRvdXR9YCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIGNvbW1pdEhhc2g6IG1hdGNoWzFdLFxuICAgICAgICAgICAgICAgIGF1dGhvcjogICAgIG1hdGNoWzJdLFxuICAgICAgICAgICAgICAgIHRpbWVzdGFtcDogIG5ldyBEYXRlKG1hdGNoWzNdKSxcbiAgICAgICAgICAgICAgICBtZXNzYWdlOiAgICBvdXRkZW50KHRyaW1CbGFua0xpbmVzKG1hdGNoWzRdKSlcbiAgICAgICAgICAgIH07XG4gICAgICAgIH0pO1xuICAgIH1cblxuXG4gICAgcHVibGljIGdldExvZyhmb3JjZVVwZGF0ZT86IGJvb2xlYW4pOiBQcm9taXNlPEFycmF5PElHaXRMb2dFbnRyeT4+XG4gICAge1xuICAgICAgICBpZiAoZm9yY2VVcGRhdGUpXG4gICAgICAgIHtcbiAgICAgICAgICAgIHRoaXMuX2xvZyA9IHVuZGVmaW5lZDtcbiAgICAgICAgfVxuXG4gICAgICAgIGxldCB1cGRhdGVQcm9taXNlOiBQcm9taXNlPHZvaWQ+O1xuXG4gICAgICAgIGlmICh0aGlzLl9sb2cgPT09IHVuZGVmaW5lZClcbiAgICAgICAge1xuICAgICAgICAgICAgdXBkYXRlUHJvbWlzZSA9IHRoaXMuZ2V0TG9nRW50cmllcygpXG4gICAgICAgICAgICAudGhlbigobG9nOiBBcnJheTxJR2l0TG9nRW50cnk+KSA9PiB7XG4gICAgICAgICAgICAgICAgdGhpcy5fbG9nID0gbG9nO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZVxuICAgICAgICB7XG4gICAgICAgICAgICB1cGRhdGVQcm9taXNlID0gUHJvbWlzZS5yZXNvbHZlKCk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gdXBkYXRlUHJvbWlzZVxuICAgICAgICAudGhlbigoKSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fbG9nITtcbiAgICAgICAgfSk7XG4gICAgfVxuXG5cbiAgICAvKipcbiAgICAgKiBIZWxwZXIgbWV0aG9kIHRoYXQgcmV0cmlldmVzIEdpdCBsb2cgZW50cmllc1xuICAgICAqIEBwcml2YXRlXG4gICAgICogQG1ldGhvZFxuICAgICAqIEByZXR1cm4gQSBwcm9taXNlIGZvciBhbiBhcnJheSBvZiBzdHJ1Y3R1cmVzIGRlc2NyaWJpbmcgZWFjaCBjb21taXQuXG4gICAgICovXG4gICAgcHJpdmF0ZSBnZXRMb2dFbnRyaWVzKCk6IFByb21pc2U8QXJyYXk8SUdpdExvZ0VudHJ5Pj5cbiAgICB7XG4gICAgICAgIHJldHVybiBzcGF3bihcImdpdFwiLCBbXCJsb2dcIl0sIHRoaXMuX2Rpci50b1N0cmluZygpKVxuICAgICAgICAudGhlbigoc3Rkb3V0KSA9PiB7XG4gICAgICAgICAgICBjb25zdCBlbnRyaWVzOiBBcnJheTxJR2l0TG9nRW50cnk+ID0gW107XG4gICAgICAgICAgICBsZXQgbWF0Y2g6IFJlZ0V4cEV4ZWNBcnJheSB8IG51bGw7XG4gICAgICAgICAgICB3aGlsZSAoKG1hdGNoID0gR0lUX0xPR19FTlRSWV9SRUdFWC5leGVjKHN0ZG91dCkpICE9PSBudWxsKSAvLyB0c2xpbnQ6ZGlzYWJsZS1saW5lXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgZW50cmllcy5wdXNoKFxuICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb21taXRIYXNoOiBtYXRjaFsxXSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGF1dGhvcjogICAgIG1hdGNoWzJdLFxuICAgICAgICAgICAgICAgICAgICAgICAgdGltZXN0YW1wOiAgbmV3IERhdGUobWF0Y2hbM10pLFxuICAgICAgICAgICAgICAgICAgICAgICAgbWVzc2FnZTogICAgb3V0ZGVudCh0cmltQmxhbmtMaW5lcyhtYXRjaFs0XSkpXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBHaXQgbG9nIGxpc3RzIHRoZSBtb3N0IHJlY2VudCBlbnRyeSBmaXJzdC4gIFJldmVyc2UgdGhlIGFycmF5IHNvXG4gICAgICAgICAgICAvLyB0aGF0IHRoZSBtb3N0IHJlY2VudCBlbnRyeSBpcyB0aGUgbGFzdC5cbiAgICAgICAgICAgIF8ucmV2ZXJzZShlbnRyaWVzKTtcbiAgICAgICAgICAgIHJldHVybiBlbnRyaWVzO1xuICAgICAgICB9KTtcbiAgICB9XG5cblxufVxuIl19
