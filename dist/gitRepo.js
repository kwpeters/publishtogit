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
var GitRepoPath_1 = require("./GitRepoPath");
var _ = require("lodash");
var stringHelpers_1 = require("./stringHelpers");
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
     * @param gitRepoPath - The path to the repository to be cloned
     * @param parentDir - The parent directory where the repo will be placed.
     * The repo will be cloned into a subdirectory named after the project.
     * @return A promise for the cloned Git repo.
     */
    GitRepo.clone = function (gitRepoPath, parentDir) {
        var projName = gitRepoPath.getProjectName();
        var repoDir = new directory_1.Directory(parentDir, projName);
        return parentDir.exists()
            .then(function (isDirectory) {
            if (!isDirectory) {
                throw new Error(parentDir + " is not a directory.");
            }
        })
            .then(function () {
            return spawn_1.spawn("git", ["clone", gitRepoPath.toString(), projName], parentDir.toString());
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
            var fileNames = stdout.split("\n");
            return _.map(fileNames, function (curFileName) {
                return new file_1.File(_this._dir, curFileName);
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
                var gitRepoPath = GitRepoPath_1.GitRepoPath.fromUrl(remoteUrl);
                if (gitRepoPath) {
                    return gitRepoPath.getProjectName();
                }
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
    GitRepo.prototype.createTag = function (tagName, message) {
        var _this = this;
        if (message === void 0) { message = ""; }
        return spawn_1.spawn("git", ["tag", "-a", tagName, "-m", message], this._dir.toString())
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
    GitRepo.prototype.pushTag = function (tagName, remoteName) {
        var _this = this;
        return spawn_1.spawn("git", ["push", remoteName, tagName], this._dir.toString())
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
    GitRepo.prototype.checkout = function (branch, createIfNonexistent) {
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

//# sourceMappingURL=data:application/json;charset=utf8;base64,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QW1FO1lBQ25FLDBDQUEwQztZQUMxQyxDQUFDLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxDQUFDO1lBQ25CLE1BQU0sQ0FBQyxPQUFPLENBQUM7UUFDbkIsQ0FBQyxDQUFDLENBQUM7SUFDUCxDQUFDO0lBR0wsY0FBQztBQUFELENBcGNBLEFBb2NDLElBQUE7QUFwY1ksMEJBQU8iLCJmaWxlIjoiZ2l0UmVwby5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7RGlyZWN0b3J5fSBmcm9tIFwiLi9kaXJlY3RvcnlcIjtcbmltcG9ydCB7RmlsZX0gZnJvbSBcIi4vZmlsZVwiO1xuaW1wb3J0IHtzcGF3bn0gZnJvbSBcIi4vc3Bhd25cIjtcbmltcG9ydCB7SVBhY2thZ2VKc29ufSBmcm9tIFwiLi9ub2RlUGFja2FnZVwiO1xuaW1wb3J0IHtHaXRCcmFuY2h9IGZyb20gXCIuL2dpdEJyYW5jaFwiO1xuaW1wb3J0IHtHaXRSZXBvUGF0aH0gZnJvbSBcIi4vR2l0UmVwb1BhdGhcIjtcbmltcG9ydCAqIGFzIF8gZnJvbSBcImxvZGFzaFwiO1xuaW1wb3J0IHtvdXRkZW50LCB0cmltQmxhbmtMaW5lc30gZnJvbSBcIi4vc3RyaW5nSGVscGVyc1wiO1xuXG5cbmludGVyZmFjZSBJR2l0TG9nRW50cnlcbntcbiAgICBjb21taXRIYXNoOiBzdHJpbmc7XG4gICAgYXV0aG9yOiBzdHJpbmc7XG4gICAgdGltZXN0YW1wOiBEYXRlO1xuICAgIG1lc3NhZ2U6IHN0cmluZztcbn1cblxuXG4vL1xuLy8gQSByZWdleCBmb3IgcGFyc2luZyBcImdpdCBsb2dcIiBvdXRwdXQuXG4vLyBtYXRjaFsxXTogY29tbWl0IGhhc2hcbi8vIG1hdGNoWzJdOiBhdXRob3Jcbi8vIG1hdGNoWzNdOiBjb21taXQgdGltZXN0YW1wXG4vLyBtYXRjaFs0XTogY29tbWl0IG1lc3NhZ2UgKGEgc2VxdWVuY2Ugb2YgbGluZXMgdGhhdCBhcmUgZWl0aGVyIGJsYW5rIG9yIHN0YXJ0IHdpdGggd2hpdGVzcGFjZSlcbi8vXG5jb25zdCBHSVRfTE9HX0VOVFJZX1JFR0VYID0gL2NvbW1pdFxccyooWzAtOWEtZl0rKS4qPyRcXHNeQXV0aG9yOlxccyooLio/KSRcXHNeRGF0ZTpcXHMqKC4qPykkXFxzKCg/Oig/Ol5cXHMqJFxcbj8pfCg/Ol5cXHMrKD86LiopJFxccz8pKSspL2dtO1xuXG4vKipcbiAqIERldGVybWluZXMgd2hldGhlciBkaXIgaXMgYSBkaXJlY3RvcnkgY29udGFpbmluZyBhIEdpdCByZXBvc2l0b3J5LlxuICogQHBhcmFtIGRpciAtIFRoZSBkaXJlY3RvcnkgdG8gaW5zcGVjdFxuICogQHJldHVybiBBIHByb21pc2UgZm9yIGEgYm9vbGVhbiBpbmRpY2F0aW5nIHdoZXRoZXIgZGlyIGNvbnRhaW5zIGEgR2l0XG4gKiByZXBvc2l0b3J5LiAgVGhpcyBwcm9taXNlIHdpbGwgbmV2ZXIgcmVqZWN0LlxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gaXNHaXRSZXBvRGlyKGRpcjogRGlyZWN0b3J5KTogUHJvbWlzZTxib29sZWFuPiB7XG5cbiAgICBjb25zdCBbZGlyRXhpc3RzLCBkb3RHaXRFeGlzdHNdID0gYXdhaXQgUHJvbWlzZS5hbGwoW1xuICAgICAgICBkaXIuZXhpc3RzKCksICAgICAgICAgICAgICAgICAgICAgICAgLy8gVGhlIGRpcmVjdG9yeSBleGlzdHNcbiAgICAgICAgbmV3IERpcmVjdG9yeShkaXIsIFwiLmdpdFwiKS5leGlzdHMoKSAgLy8gVGhlIGRpcmVjdG9yeSBjb250YWlucyBhIC5naXQgZGlyZWN0b3J5XG4gICAgXSk7XG5cbiAgICByZXR1cm4gQm9vbGVhbihkaXJFeGlzdHMgJiYgZG90R2l0RXhpc3RzKTtcbn1cblxuXG5leHBvcnQgY2xhc3MgR2l0UmVwb1xue1xuICAgIC8vcmVnaW9uIFByaXZhdGUgRGF0YSBNZW1iZXJzXG4gICAgcHJpdmF0ZSBfZGlyOiBEaXJlY3Rvcnk7XG4gICAgcHJpdmF0ZSBfYnJhbmNoZXM6IEFycmF5PEdpdEJyYW5jaD4gfCB1bmRlZmluZWQ7XG4gICAgcHJpdmF0ZSBfbG9nOiBBcnJheTxJR2l0TG9nRW50cnk+IHwgdW5kZWZpbmVkO1xuICAgIC8vZW5kcmVnaW9uXG5cblxuICAgIC8qKlxuICAgICAqIENyZWF0ZXMgYSBuZXcgR2l0UmVwbyBpbnN0YW5jZSwgcG9pbnRpbmcgaXQgYXQgYSBkaXJlY3RvcnkgY29udGFpbmluZyB0aGVcbiAgICAgKiB3cmFwcGVkIHJlcG8uXG4gICAgICogQHBhcmFtIGRpciAtIFRoZSBkaXJlY3RvcnkgY29udGFpbmluZyB0aGUgcmVwb1xuICAgICAqIEByZXR1cm4gQSBQcm9taXNlIGZvciB0aGUgR2l0UmVwby5cbiAgICAgKi9cbiAgICBwdWJsaWMgc3RhdGljIGFzeW5jIGZyb21EaXJlY3RvcnkoZGlyOiBEaXJlY3RvcnkpOiBQcm9taXNlPEdpdFJlcG8+XG4gICAge1xuICAgICAgICBjb25zdCBpc0dpdFJlcG8gPSBhd2FpdCBpc0dpdFJlcG9EaXIoZGlyKTtcbiAgICAgICAgaWYgKGlzR2l0UmVwbylcbiAgICAgICAge1xuICAgICAgICAgICAgcmV0dXJuIG5ldyBHaXRSZXBvKGRpcik7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZVxuICAgICAgICB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJQYXRoIGRvZXMgbm90IGV4aXN0IG9yIGlzIG5vdCBhIEdpdCByZXBvLlwiKTtcbiAgICAgICAgfVxuICAgIH1cblxuXG4gICAgLyoqXG4gICAgICogQ2xvbmVzIGEgR2l0IHJlcG8gYXQgdGhlIHNwZWNpZmllZCBsb2NhdGlvbi5cbiAgICAgKiBAcGFyYW0gZ2l0UmVwb1BhdGggLSBUaGUgcGF0aCB0byB0aGUgcmVwb3NpdG9yeSB0byBiZSBjbG9uZWRcbiAgICAgKiBAcGFyYW0gcGFyZW50RGlyIC0gVGhlIHBhcmVudCBkaXJlY3Rvcnkgd2hlcmUgdGhlIHJlcG8gd2lsbCBiZSBwbGFjZWQuXG4gICAgICogVGhlIHJlcG8gd2lsbCBiZSBjbG9uZWQgaW50byBhIHN1YmRpcmVjdG9yeSBuYW1lZCBhZnRlciB0aGUgcHJvamVjdC5cbiAgICAgKiBAcmV0dXJuIEEgcHJvbWlzZSBmb3IgdGhlIGNsb25lZCBHaXQgcmVwby5cbiAgICAgKi9cbiAgICBwdWJsaWMgc3RhdGljIGNsb25lKGdpdFJlcG9QYXRoOiBHaXRSZXBvUGF0aCwgcGFyZW50RGlyOiBEaXJlY3RvcnkpOiBQcm9taXNlPEdpdFJlcG8+XG4gICAge1xuICAgICAgICBjb25zdCBwcm9qTmFtZSA9IGdpdFJlcG9QYXRoLmdldFByb2plY3ROYW1lKCk7XG5cbiAgICAgICAgY29uc3QgcmVwb0RpciA9IG5ldyBEaXJlY3RvcnkocGFyZW50RGlyLCBwcm9qTmFtZSk7XG5cbiAgICAgICAgcmV0dXJuIHBhcmVudERpci5leGlzdHMoKVxuICAgICAgICAudGhlbigoaXNEaXJlY3RvcnkpID0+IHtcbiAgICAgICAgICAgIGlmICghaXNEaXJlY3RvcnkpXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGAke3BhcmVudERpcn0gaXMgbm90IGEgZGlyZWN0b3J5LmApO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KVxuICAgICAgICAudGhlbigoKSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gc3Bhd24oXG4gICAgICAgICAgICAgICAgXCJnaXRcIixcbiAgICAgICAgICAgICAgICBbXCJjbG9uZVwiLCBnaXRSZXBvUGF0aC50b1N0cmluZygpLCBwcm9qTmFtZV0sXG4gICAgICAgICAgICAgICAgcGFyZW50RGlyLnRvU3RyaW5nKCkpO1xuICAgICAgICB9KVxuICAgICAgICAudGhlbigoKSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gbmV3IEdpdFJlcG8ocmVwb0Rpcik7XG4gICAgICAgIH0pO1xuICAgIH1cblxuXG4gICAgLyoqXG4gICAgICogQ29uc3RydWN0cyBhIG5ldyBHaXRSZXBvLiAgUHJpdmF0ZSBpbiBvcmRlciB0byBwcm92aWRlIGVycm9yIGNoZWNraW5nLlxuICAgICAqIFNlZSBzdGF0aWMgbWV0aG9kcy5cbiAgICAgKlxuICAgICAqIEBwYXJhbSBkaXIgLSBUaGUgZGlyZWN0b3J5IGNvbnRhaW5pbmcgdGhlIEdpdCByZXBvLlxuICAgICAqL1xuICAgIHByaXZhdGUgY29uc3RydWN0b3IoZGlyOiBEaXJlY3RvcnkpXG4gICAge1xuICAgICAgICB0aGlzLl9kaXIgPSBkaXI7XG4gICAgfVxuXG5cbiAgICAvKipcbiAgICAgKiBHZXRzIHRoZSBkaXJlY3RvcnkgY29udGFpbmluZyB0aGlzIEdpdCByZXBvLlxuICAgICAqIEByZXR1cm4gVGhlIGRpcmVjdG9yeSBjb250YWluaW5nIHRoaXMgZ2l0IHJlcG8uXG4gICAgICovXG4gICAgcHVibGljIGdldCBkaXJlY3RvcnkoKTogRGlyZWN0b3J5XG4gICAge1xuICAgICAgICByZXR1cm4gdGhpcy5fZGlyO1xuICAgIH1cblxuXG4gICAgLyoqXG4gICAgICogRGV0ZXJtaW5lcyB3aGV0aGVyIHRoaXMgR2l0UmVwbyBpcyBlcXVhbCB0byBhbm90aGVyIEdpdFJlcG8uICBUd29cbiAgICAgKiBpbnN0YW5jZXMgYXJlIGNvbnNpZGVyZWQgZXF1YWwgaWYgdGhleSBwb2ludCB0byB0aGUgc2FtZSBkaXJlY3RvcnkuXG4gICAgICogQG1ldGhvZFxuICAgICAqIEBwYXJhbSBvdGhlciAtIFRoZSBvdGhlciBHaXRSZXBvIHRvIGNvbXBhcmUgd2l0aFxuICAgICAqIEByZXR1cm4gV2hldGhlciB0aGUgdHdvIEdpdFJlcG8gaW5zdGFuY2VzIGFyZSBlcXVhbFxuICAgICAqL1xuICAgIHB1YmxpYyBlcXVhbHMob3RoZXI6IEdpdFJlcG8pOiBib29sZWFuXG4gICAge1xuICAgICAgICByZXR1cm4gdGhpcy5fZGlyLmVxdWFscyhvdGhlci5fZGlyKTtcbiAgICB9XG5cblxuICAgIC8qKlxuICAgICAqIEdldHMgdGhlIGZpbGVzIHRoYXQgYXJlIHVuZGVyIEdpdCB2ZXJzaW9uIGNvbnRyb2wuXG4gICAgICogQHJldHVybiBBIFByb21pc2UgZm9yIGFuIGFycmF5IG9mIGZpbGVzIHVuZGVyIEdpdCB2ZXJzaW9uIGNvbnRyb2wuXG4gICAgICovXG4gICAgcHVibGljIGZpbGVzKCk6IFByb21pc2U8QXJyYXk8RmlsZT4+XG4gICAge1xuICAgICAgICByZXR1cm4gc3Bhd24oXCJnaXRcIiwgW1wibHMtZmlsZXNcIl0sIHRoaXMuX2Rpci50b1N0cmluZygpKVxuICAgICAgICAudGhlbigoc3Rkb3V0KSA9PiB7XG4gICAgICAgICAgICBjb25zdCByZWxhdGl2ZUZpbGVQYXRocyA9IHN0ZG91dC5zcGxpdChcIlxcblwiKTtcbiAgICAgICAgICAgIHJldHVybiBfLm1hcChyZWxhdGl2ZUZpbGVQYXRocywgKGN1clJlbEZpbGVQYXRoKSA9PiB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIG5ldyBGaWxlKHRoaXMuX2RpciwgY3VyUmVsRmlsZVBhdGgpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuXG4gICAgLy8gVE9ETzogV3JpdGUgdW5pdCB0ZXN0cyBmb3IgdGhpcyBtZXRob2QgYW5kIG1ha2Ugc3VyZSB0aGUgZmlsZXMgaGF2ZSB0aGVcbiAgICAvLyBjb3JyZWN0IHByZWNlZGluZyBwYXRoLlxuICAgIHB1YmxpYyBtb2RpZmllZEZpbGVzKCk6IFByb21pc2U8QXJyYXk8RmlsZT4+XG4gICAge1xuICAgICAgICByZXR1cm4gc3Bhd24oXCJnaXRcIiwgW1wibHMtZmlsZXNcIiwgXCItbVwiXSwgdGhpcy5fZGlyLnRvU3RyaW5nKCkpXG4gICAgICAgIC50aGVuKChzdGRvdXQpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IGZpbGVOYW1lcyA9IHN0ZG91dC5zcGxpdChcIlxcblwiKTtcbiAgICAgICAgICAgIHJldHVybiBfLm1hcChmaWxlTmFtZXMsIChjdXJGaWxlTmFtZSkgPT4ge1xuICAgICAgICAgICAgICAgIHJldHVybiBuZXcgRmlsZSh0aGlzLl9kaXIsIGN1ckZpbGVOYW1lKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICB9XG5cblxuICAgIC8qKlxuICAgICAqIEdldCB0aGUgcmVtb3RlcyBjb25maWd1cmVkIGZvciB0aGUgR2l0IHJlcG8uXG4gICAgICogQHJldHVybiBBIFByb21pc2UgZm9yIGFuIG9iamVjdCB3aGVyZSB0aGUgcmVtb3RlIG5hbWVzIGFyZSB0aGUga2V5cyBhbmRcbiAgICAgKiB0aGUgcmVtb3RlIFVSTCBpcyB0aGUgdmFsdWUuXG4gICAgICovXG4gICAgcHVibGljIHJlbW90ZXMoKTogUHJvbWlzZTx7W25hbWU6IHN0cmluZ106IHN0cmluZ30+XG4gICAge1xuICAgICAgICByZXR1cm4gc3Bhd24oXCJnaXRcIiwgW1wicmVtb3RlXCIsIFwiLXZ2XCJdLCB0aGlzLl9kaXIudG9TdHJpbmcoKSlcbiAgICAgICAgLnRoZW4oKHN0ZG91dCkgPT4ge1xuXG4gICAgICAgICAgICBjb25zdCBsaW5lcyA9IHN0ZG91dC5zcGxpdChcIlxcblwiKTtcbiAgICAgICAgICAgIGxldCByZW1vdGVzOiB7W25hbWU6IHN0cmluZ106IHN0cmluZ30gPSB7fTtcbiAgICAgICAgICAgIGxpbmVzLmZvckVhY2goKGN1ckxpbmUpID0+IHtcbiAgICAgICAgICAgICAgICBjb25zdCBtYXRjaCA9IGN1ckxpbmUubWF0Y2goL14oXFx3KylcXHMrKC4qKVxccytcXChcXHcrXFwpJC8pO1xuICAgICAgICAgICAgICAgIGlmIChtYXRjaClcbiAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgIHJlbW90ZXNbbWF0Y2hbMV1dID0gbWF0Y2hbMl07XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIHJldHVybiByZW1vdGVzO1xuICAgICAgICB9KTtcbiAgICB9XG5cblxuICAgIC8qKlxuICAgICAqIEdldHMgdGhlIG5hbWUgb2YgdGhpcyBHaXQgcmVwb3NpdG9yeS4gIElmIHRoZSByZXBvIGhhcyBhIHJlbW90ZSwgdGhlIG5hbWVcbiAgICAgKiBpcyB0YWtlbiBmcm9tIHRoZSBsYXN0IHBhcnQgb2YgdGhlIHJlbW90ZSdzIFVSTC4gIE90aGVyd2lzZSwgdGhlIG5hbWVcbiAgICAgKiB3aWxsIGJlIHRha2VuIGZyb20gdGhlIFwibmFtZVwiIHByb3BlcnR5IGluIHBhY2thZ2UuanNvbi4gIE90aGVyd2lzZSwgdGhlXG4gICAgICogbmFtZSB3aWxsIGJlIHRoZSBuYW1lIG9mIHRoZSBmb2xkZXIgdGhlIHJlcG8gaXMgaW4uXG4gICAgICogQHJldHVybiBBIFByb21pc2UgZm9yIHRoZSBuYW1lIG9mIHRoaXMgcmVwb3NpdG9yeS5cbiAgICAgKi9cbiAgICBwdWJsaWMgbmFtZSgpOiBQcm9taXNlPHN0cmluZz5cbiAgICB7XG4gICAgICAgIHJldHVybiB0aGlzLnJlbW90ZXMoKVxuICAgICAgICAudGhlbigocmVtb3RlcykgPT4ge1xuICAgICAgICAgICAgY29uc3QgcmVtb3RlTmFtZXMgPSBPYmplY3Qua2V5cyhyZW1vdGVzKTtcbiAgICAgICAgICAgIGlmIChyZW1vdGVOYW1lcy5sZW5ndGggPiAwKVxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIGNvbnN0IHJlbW90ZVVybCA9IHJlbW90ZXNbcmVtb3RlTmFtZXNbMF1dO1xuICAgICAgICAgICAgICAgIGNvbnN0IGdpdFJlcG9QYXRoID0gR2l0UmVwb1BhdGguZnJvbVVybChyZW1vdGVVcmwpO1xuICAgICAgICAgICAgICAgIGlmIChnaXRSZXBvUGF0aClcbiAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBnaXRSZXBvUGF0aC5nZXRQcm9qZWN0TmFtZSgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSlcbiAgICAgICAgLnRoZW4oKHByb2pOYW1lKSA9PiB7XG4gICAgICAgICAgICBpZiAocHJvak5hbWUpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gcHJvak5hbWU7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIExvb2sgZm9yIHRoZSBwcm9qZWN0IG5hbWUgaW4gcGFja2FnZS5qc29uLlxuICAgICAgICAgICAgY29uc3QgcGFja2FnZUpzb24gPSBuZXcgRmlsZSh0aGlzLl9kaXIsIFwicGFja2FnZS5qc29uXCIpLnJlYWRKc29uU3luYzxJUGFja2FnZUpzb24+KCk7XG4gICAgICAgICAgICBpZiAocGFja2FnZUpzb24pIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gcGFja2FnZUpzb24ubmFtZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSlcbiAgICAgICAgLnRoZW4oKHByb2pOYW1lKSA9PiB7XG4gICAgICAgICAgICBpZiAocHJvak5hbWUpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gcHJvak5hbWU7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGNvbnN0IGRpck5hbWUgPSB0aGlzLl9kaXIuZGlyTmFtZTtcbiAgICAgICAgICAgIGlmIChkaXJOYW1lID09PSBcIi9cIilcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJVbmFibGUgdG8gZGV0ZXJtaW5lIEdpdCByZXBvIG5hbWUuXCIpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gZGlyTmFtZTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG5cbiAgICBwdWJsaWMgdGFncygpOiBQcm9taXNlPEFycmF5PHN0cmluZz4+XG4gICAge1xuICAgICAgICByZXR1cm4gc3Bhd24oXCJnaXRcIiwgW1widGFnXCJdLCB0aGlzLl9kaXIudG9TdHJpbmcoKSlcbiAgICAgICAgLnRoZW4oKHN0ZG91dCkgPT4ge1xuICAgICAgICAgICAgaWYgKHN0ZG91dC5sZW5ndGggPT09IDApXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIFtdO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gc3Rkb3V0LnNwbGl0KFwiXFxuXCIpO1xuICAgICAgICB9KTtcbiAgICB9XG5cblxuICAgIHB1YmxpYyBoYXNUYWcodGFnTmFtZTogc3RyaW5nKTogUHJvbWlzZTxib29sZWFuPlxuICAgIHtcbiAgICAgICAgcmV0dXJuIHRoaXMudGFncygpXG4gICAgICAgIC50aGVuKCh0YWdzKSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gdGFncy5pbmRleE9mKHRhZ05hbWUpID49IDA7XG4gICAgICAgIH0pO1xuICAgIH1cblxuXG4gICAgcHVibGljIGNyZWF0ZVRhZyh0YWdOYW1lOiBzdHJpbmcsIG1lc3NhZ2U6IHN0cmluZyA9IFwiXCIpOiBQcm9taXNlPEdpdFJlcG8+XG4gICAge1xuICAgICAgICByZXR1cm4gc3Bhd24oXCJnaXRcIiwgW1widGFnXCIsIFwiLWFcIiwgdGFnTmFtZSwgXCItbVwiLCBtZXNzYWdlXSwgdGhpcy5fZGlyLnRvU3RyaW5nKCkpXG4gICAgICAgIC50aGVuKCgpID0+IHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgICB9KTtcbiAgICB9XG5cblxuICAgIHB1YmxpYyBkZWxldGVUYWcodGFnTmFtZTogc3RyaW5nKTogUHJvbWlzZTxHaXRSZXBvPlxuICAgIHtcbiAgICAgICAgcmV0dXJuIHNwYXduKFwiZ2l0XCIsIFtcInRhZ1wiLCBcIi0tZGVsZXRlXCIsIHRhZ05hbWVdLCB0aGlzLl9kaXIudG9TdHJpbmcoKSlcbiAgICAgICAgLmNhdGNoKChlcnIpID0+IHtcbiAgICAgICAgICAgIGlmIChlcnIuc3RkZXJyLmluY2x1ZGVzKFwibm90IGZvdW5kXCIpKVxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIC8vIFRoZSBzcGVjaWZpZWQgdGFnIG5hbWUgd2FzIG5vdCBmb3VuZC4gIFdlIGFyZSBzdGlsbFxuICAgICAgICAgICAgICAgIC8vIHN1Y2Nlc3NmdWwuXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgdGhyb3cgZXJyO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KVxuICAgICAgICAudGhlbigoKSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgICAgfSk7XG4gICAgfVxuXG5cbiAgICBwdWJsaWMgcHVzaFRhZyh0YWdOYW1lOiBzdHJpbmcsIHJlbW90ZU5hbWU6IHN0cmluZyk6IFByb21pc2U8R2l0UmVwbz5cbiAgICB7XG4gICAgICAgIHJldHVybiBzcGF3bihcImdpdFwiLCBbXCJwdXNoXCIsIHJlbW90ZU5hbWUsIHRhZ05hbWVdLCB0aGlzLl9kaXIudG9TdHJpbmcoKSlcbiAgICAgICAgLnRoZW4oKCkgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICAgIH0pO1xuICAgIH1cblxuXG4gICAgcHVibGljIGdldEJyYW5jaGVzKGZvcmNlVXBkYXRlOiBib29sZWFuID0gZmFsc2UpOiBQcm9taXNlPEFycmF5PEdpdEJyYW5jaD4+XG4gICAge1xuICAgICAgICBpZiAoZm9yY2VVcGRhdGUpXG4gICAgICAgIHtcbiAgICAgICAgICAgIC8vIEludmFsaWRhdGUgdGhlIGNhY2hlLiAgSWYgdGhpcyB1cGRhdGUgZmFpbHMsIHN1YnNlcXVlbnQgcmVxdWVzdHNcbiAgICAgICAgICAgIC8vIHdpbGwgaGF2ZSB0byB1cGRhdGUgdGhlIGNhY2hlLlxuICAgICAgICAgICAgdGhpcy5fYnJhbmNoZXMgPSB1bmRlZmluZWQ7XG4gICAgICAgIH1cblxuICAgICAgICBsZXQgdXBkYXRlUHJvbWlzZTogUHJvbWlzZTx2b2lkPjtcblxuICAgICAgICBpZiAodGhpcy5fYnJhbmNoZXMgPT09IHVuZGVmaW5lZClcbiAgICAgICAge1xuICAgICAgICAgICAgLy8gVGhlIGludGVybmFsIGNhY2hlIG9mIGJyYW5jaGVzIG5lZWRzIHRvIGJlIHVwZGF0ZWQuXG4gICAgICAgICAgICB1cGRhdGVQcm9taXNlID0gR2l0QnJhbmNoLmVudW1lcmF0ZUdpdFJlcG9CcmFuY2hlcyh0aGlzKVxuICAgICAgICAgICAgLnRoZW4oKGJyYW5jaGVzOiBBcnJheTxHaXRCcmFuY2g+KSA9PiB7XG4gICAgICAgICAgICAgICAgdGhpcy5fYnJhbmNoZXMgPSBicmFuY2hlcztcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIGVsc2VcbiAgICAgICAge1xuICAgICAgICAgICAgLy8gVGhlIGludGVybmFsIGNhY2hlIGRvZXMgbm90IG5lZWQgdG8gYmUgdXBkYXRlZC5cbiAgICAgICAgICAgIHVwZGF0ZVByb21pc2UgPSBQcm9taXNlLnJlc29sdmUoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB1cGRhdGVQcm9taXNlXG4gICAgICAgIC50aGVuKCgpID0+IHtcbiAgICAgICAgICAgIC8vIFNpbmNlIHVwZGF0ZVByb21pc2UgcmVzb2x2ZWQsIHdlIGtub3cgdGhhdCB0aGlzLl9icmFuY2hlcyBoYXMgYmVlblxuICAgICAgICAgICAgLy8gc2V0LlxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX2JyYW5jaGVzITtcbiAgICAgICAgfSk7XG4gICAgfVxuXG5cbiAgICBwdWJsaWMgYXN5bmMgZ2V0Q3VycmVudEJyYW5jaCgpOiBQcm9taXNlPEdpdEJyYW5jaD5cbiAgICB7XG4gICAgICAgIC8vIEZVVFVSRTogSSBkb24ndCB0aGluayB0aGUgZm9sbG93aW5nIHdpbGwgd29yayB3aGVuIGluIGRldGFjaGVkIGhlYWQgc3RhdGUuXG4gICAgICAgIGNvbnN0IHN0ZG91dCA9IGF3YWl0IHNwYXduKFwiZ2l0XCIsIFtcInJldi1wYXJzZVwiLCBcIi0tYWJicmV2LXJlZlwiLCBcIkhFQURcIl0sIHRoaXMuX2Rpci50b1N0cmluZygpKTtcbiAgICAgICAgY29uc3QgYnJhbmNoTmFtZSA9IHN0ZG91dC50cmltKCk7XG4gICAgICAgIGNvbnN0IGJyYW5jaCA9IGF3YWl0IEdpdEJyYW5jaC5jcmVhdGUodGhpcywgYnJhbmNoTmFtZSk7XG5cbiAgICAgICAgLy8gQWxsIGlzIGdvb2QuXG4gICAgICAgIHJldHVybiBicmFuY2g7XG4gICAgfVxuXG5cbiAgICBwdWJsaWMgYXN5bmMgY2hlY2tvdXQoYnJhbmNoOiBHaXRCcmFuY2gsIGNyZWF0ZUlmTm9uZXhpc3RlbnQ6IGJvb2xlYW4pOiBQcm9taXNlPHZvaWQ+XG4gICAge1xuICAgICAgICBpZiAoY3JlYXRlSWZOb25leGlzdGVudClcbiAgICAgICAge1xuICAgICAgICAgICAgLy8gSWYgdGhlcmUgaXMgYSBicmFuY2ggd2l0aCB0aGUgc2FtZSBuYW1lLCB3ZSBzaG91bGQgbm90IHRyeSB0b1xuICAgICAgICAgICAgLy8gY3JlYXRlIGl0LiAgSW5zdGVhZCwgd2Ugc2hvdWxkIGp1c3QgY2hlY2sgaXQgb3V0LlxuICAgICAgICAgICAgY29uc3QgYWxsQnJhbmNoZXMgPSBhd2FpdCB0aGlzLmdldEJyYW5jaGVzKCk7XG4gICAgICAgICAgICBpZiAoXy5zb21lKGFsbEJyYW5jaGVzLCB7bmFtZTogYnJhbmNoLm5hbWV9KSlcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBjcmVhdGVJZk5vbmV4aXN0ZW50ID0gZmFsc2U7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBhcmdzID0gW1xuICAgICAgICAgICAgXCJjaGVja291dFwiLFxuICAgICAgICAgICAgLi4uKGNyZWF0ZUlmTm9uZXhpc3RlbnQgPyBbXCItYlwiXSA6IFtdKSxcbiAgICAgICAgICAgIGJyYW5jaC5uYW1lXG4gICAgICAgIF07XG5cbiAgICAgICAgYXdhaXQgc3Bhd24oXCJnaXRcIiwgYXJncywgdGhpcy5fZGlyLnRvU3RyaW5nKCkpO1xuICAgIH1cblxuXG4gICAgcHVibGljIHN0YWdlQWxsKCk6IFByb21pc2U8R2l0UmVwbz5cbiAgICB7XG4gICAgICAgIHJldHVybiBzcGF3bihcImdpdFwiLCBbXCJhZGRcIiwgXCIuXCJdLCB0aGlzLl9kaXIudG9TdHJpbmcoKSlcbiAgICAgICAgLnRoZW4oKCkgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICAgIH0pO1xuICAgIH1cblxuXG4gICAgcHVibGljIGFzeW5jIHB1c2hDdXJyZW50QnJhbmNoKHJlbW90ZU5hbWU6IHN0cmluZyA9IFwib3JpZ2luXCIsIHNldFVwc3RyZWFtOiBib29sZWFuID0gZmFsc2UpOiBQcm9taXNlPHZvaWQ+XG4gICAge1xuICAgICAgICBjb25zdCBjdXJCcmFuY2ggPSBhd2FpdCB0aGlzLmdldEN1cnJlbnRCcmFuY2goKTtcblxuICAgICAgICBjb25zdCBhcmdzID0gW1xuICAgICAgICAgICAgXCJwdXNoXCIsXG4gICAgICAgICAgICAuLi4oc2V0VXBzdHJlYW0gPyBbXCItdVwiXSA6IFtdKSxcbiAgICAgICAgICAgIHJlbW90ZU5hbWUsXG4gICAgICAgICAgICBjdXJCcmFuY2gubmFtZVxuICAgICAgICBdO1xuXG4gICAgICAgIHJldHVybiBzcGF3bihcImdpdFwiLCBhcmdzLCB0aGlzLl9kaXIudG9TdHJpbmcoKSlcbiAgICAgICAgLnRoZW4oKCkgPT4ge1xuICAgICAgICB9KVxuICAgICAgICAuY2F0Y2goKGVycikgPT4ge1xuICAgICAgICAgICAgY29uc29sZS5sb2coYEVycm9yIHB1c2hpbmcgY3VycmVudCBicmFuY2g6ICR7SlNPTi5zdHJpbmdpZnkoZXJyKX1gKTtcbiAgICAgICAgICAgIHRocm93IGVycjtcbiAgICAgICAgfSk7XG4gICAgfVxuXG5cbiAgICAvLyBUT0RPOiBUbyBnZXQgdGhlIHN0YWdlZCBmaWxlczpcbiAgICAvLyBnaXQgZGlmZiAtLW5hbWUtb25seSAtLWNhY2hlZFxuXG5cbiAgICAvLyBUT0RPOiBBZGQgdW5pdCB0ZXN0cyBmb3IgdGhpcyBtZXRob2QuXG4gICAgcHVibGljIGNvbW1pdChtc2c6IHN0cmluZyA9IFwiXCIpOiBQcm9taXNlPElHaXRMb2dFbnRyeT5cbiAgICB7XG4gICAgICAgIHJldHVybiBzcGF3bihcImdpdFwiLCBbXCJjb21taXRcIiwgXCItbVwiLCBtc2ddLCB0aGlzLl9kaXIudG9TdHJpbmcoKSlcbiAgICAgICAgLnRoZW4oKCkgPT4ge1xuICAgICAgICAgICAgLy8gR2V0IHRoZSBjb21taXQgaGFzaFxuICAgICAgICAgICAgcmV0dXJuIHNwYXduKFwiZ2l0XCIsIFtcInJldi1wYXJzZVwiLCBcIkhFQURcIl0sIHRoaXMuX2Rpci50b1N0cmluZygpKTtcbiAgICAgICAgfSlcbiAgICAgICAgLnRoZW4oKHN0ZG91dCkgPT4ge1xuICAgICAgICAgICAgY29uc3QgY29tbWl0SGFzaCA9IF8udHJpbShzdGRvdXQpO1xuICAgICAgICAgICAgcmV0dXJuIHNwYXduKFwiZ2l0XCIsIFtcInNob3dcIiwgY29tbWl0SGFzaF0sIHRoaXMuX2Rpci50b1N0cmluZygpKTtcbiAgICAgICAgfSlcbiAgICAgICAgLnRoZW4oKHN0ZG91dCkgPT4ge1xuICAgICAgICAgICAgY29uc3QgbWF0Y2ggPSBHSVRfTE9HX0VOVFJZX1JFR0VYLmV4ZWMoc3Rkb3V0KTtcbiAgICAgICAgICAgIGlmICghbWF0Y2gpXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBDb3VsZCBub3QgcGFyc2UgXCJnaXQgc2hvd1wiIG91dHB1dDpcXG4ke3N0ZG91dH1gKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgY29tbWl0SGFzaDogbWF0Y2hbMV0sXG4gICAgICAgICAgICAgICAgYXV0aG9yOiAgICAgbWF0Y2hbMl0sXG4gICAgICAgICAgICAgICAgdGltZXN0YW1wOiAgbmV3IERhdGUobWF0Y2hbM10pLFxuICAgICAgICAgICAgICAgIG1lc3NhZ2U6ICAgIG91dGRlbnQodHJpbUJsYW5rTGluZXMobWF0Y2hbNF0pKVxuICAgICAgICAgICAgfTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG5cbiAgICBwdWJsaWMgZ2V0TG9nKGZvcmNlVXBkYXRlPzogYm9vbGVhbik6IFByb21pc2U8QXJyYXk8SUdpdExvZ0VudHJ5Pj5cbiAgICB7XG4gICAgICAgIGlmIChmb3JjZVVwZGF0ZSlcbiAgICAgICAge1xuICAgICAgICAgICAgdGhpcy5fbG9nID0gdW5kZWZpbmVkO1xuICAgICAgICB9XG5cbiAgICAgICAgbGV0IHVwZGF0ZVByb21pc2U6IFByb21pc2U8dm9pZD47XG5cbiAgICAgICAgaWYgKHRoaXMuX2xvZyA9PT0gdW5kZWZpbmVkKVxuICAgICAgICB7XG4gICAgICAgICAgICB1cGRhdGVQcm9taXNlID0gdGhpcy5nZXRMb2dFbnRyaWVzKClcbiAgICAgICAgICAgIC50aGVuKChsb2c6IEFycmF5PElHaXRMb2dFbnRyeT4pID0+IHtcbiAgICAgICAgICAgICAgICB0aGlzLl9sb2cgPSBsb2c7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlXG4gICAgICAgIHtcbiAgICAgICAgICAgIHVwZGF0ZVByb21pc2UgPSBQcm9taXNlLnJlc29sdmUoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB1cGRhdGVQcm9taXNlXG4gICAgICAgIC50aGVuKCgpID0+IHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl9sb2chO1xuICAgICAgICB9KTtcbiAgICB9XG5cblxuICAgIC8qKlxuICAgICAqIEhlbHBlciBtZXRob2QgdGhhdCByZXRyaWV2ZXMgR2l0IGxvZyBlbnRyaWVzXG4gICAgICogQHByaXZhdGVcbiAgICAgKiBAbWV0aG9kXG4gICAgICogQHJldHVybiBBIHByb21pc2UgZm9yIGFuIGFycmF5IG9mIHN0cnVjdHVyZXMgZGVzY3JpYmluZyBlYWNoIGNvbW1pdC5cbiAgICAgKi9cbiAgICBwcml2YXRlIGdldExvZ0VudHJpZXMoKTogUHJvbWlzZTxBcnJheTxJR2l0TG9nRW50cnk+PlxuICAgIHtcbiAgICAgICAgcmV0dXJuIHNwYXduKFwiZ2l0XCIsIFtcImxvZ1wiXSwgdGhpcy5fZGlyLnRvU3RyaW5nKCkpXG4gICAgICAgIC50aGVuKChzdGRvdXQpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IGVudHJpZXM6IEFycmF5PElHaXRMb2dFbnRyeT4gPSBbXTtcbiAgICAgICAgICAgIGxldCBtYXRjaDogUmVnRXhwRXhlY0FycmF5IHwgbnVsbDtcbiAgICAgICAgICAgIHdoaWxlICgobWF0Y2ggPSBHSVRfTE9HX0VOVFJZX1JFR0VYLmV4ZWMoc3Rkb3V0KSkgIT09IG51bGwpIC8vIHRzbGludDpkaXNhYmxlLWxpbmVcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBlbnRyaWVzLnB1c2goXG4gICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbW1pdEhhc2g6IG1hdGNoWzFdLFxuICAgICAgICAgICAgICAgICAgICAgICAgYXV0aG9yOiAgICAgbWF0Y2hbMl0sXG4gICAgICAgICAgICAgICAgICAgICAgICB0aW1lc3RhbXA6ICBuZXcgRGF0ZShtYXRjaFszXSksXG4gICAgICAgICAgICAgICAgICAgICAgICBtZXNzYWdlOiAgICBvdXRkZW50KHRyaW1CbGFua0xpbmVzKG1hdGNoWzRdKSlcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIEdpdCBsb2cgbGlzdHMgdGhlIG1vc3QgcmVjZW50IGVudHJ5IGZpcnN0LiAgUmV2ZXJzZSB0aGUgYXJyYXkgc29cbiAgICAgICAgICAgIC8vIHRoYXQgdGhlIG1vc3QgcmVjZW50IGVudHJ5IGlzIHRoZSBsYXN0LlxuICAgICAgICAgICAgXy5yZXZlcnNlKGVudHJpZXMpO1xuICAgICAgICAgICAgcmV0dXJuIGVudHJpZXM7XG4gICAgICAgIH0pO1xuICAgIH1cblxuXG59XG4iXX0=
