"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var arrayHelpers_1 = require("./arrayHelpers");
var directory_1 = require("./directory");
var file_1 = require("./file");
var spawn_1 = require("./spawn");
var gitBranch_1 = require("./gitBranch");
var _ = require("lodash");
var stringHelpers_1 = require("./stringHelpers");
var url_1 = require("./url");
var gitHelpers_1 = require("./gitHelpers");
var commitHash_1 = require("./commitHash");
var BBPromise = require("bluebird");
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
    return BBPromise.all([
        dir.exists(),
        new directory_1.Directory(dir, ".git").exists() // The directory contains a .git directory
    ])
        .then(function (_a) {
        var dirExists = _a[0], dotGitExists = _a[1];
        return Boolean(dirExists && dotGitExists);
    });
}
exports.isGitRepoDir = isGitRepoDir;
var GitRepo = /** @class */ (function () {
    // endregion
    /**
     * Constructs a new GitRepo.  Private in order to provide error checking.
     * See static methods.
     *
     * @param dir - The directory containing the Git repo.
     */
    function GitRepo(dir) {
        this._dir = dir;
    }
    /**
     * Creates a new GitRepo instance, pointing it at a directory containing the
     * wrapped repo.
     * @param dir - The directory containing the repo
     * @return A Promise for the GitRepo.
     */
    GitRepo.fromDirectory = function (dir) {
        return isGitRepoDir(dir)
            .then(function (isGitRepo) {
            if (isGitRepo) {
                return new GitRepo(dir);
            }
            else {
                throw new Error("Path does not exist or is not a Git repo.");
            }
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
            projName = gitHelpers_1.gitUrlToProjectName(src.toString());
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
            return spawn_1.spawn("git", ["clone", srcStr, projName], parentDir.toString())
                .closePromise;
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
            .closePromise
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
            .closePromise
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
            .closePromise
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
    // TODO: Write unit tests for this method.  Make sure there is no leading or trailing whitespace.
    GitRepo.prototype.currentCommitHash = function () {
        return spawn_1.spawn("git", ["rev-parse", "--verify", "HEAD"], this._dir.toString())
            .closePromise
            .then(function (stdout) {
            var hash = commitHash_1.CommitHash.fromString(stdout);
            if (!hash) {
                throw new Error("Failed to construct CommitHash.");
            }
            return hash;
        });
    };
    /**
     * Get the remotes configured for the Git repo.
     * @return A Promise for an object where the remote names are the keys and
     * the remote URL is the value.
     */
    GitRepo.prototype.remotes = function () {
        return spawn_1.spawn("git", ["remote", "-vv"], this._dir.toString())
            .closePromise
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
                return gitHelpers_1.gitUrlToProjectName(remoteUrl);
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
            .closePromise
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
            .closePromise
            .then(function () {
            return _this;
        });
    };
    GitRepo.prototype.deleteTag = function (tagName) {
        var _this = this;
        return spawn_1.spawn("git", ["tag", "--delete", tagName], this._dir.toString())
            .closePromise
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
            .closePromise
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
            updatePromise = BBPromise.resolve();
        }
        return updatePromise
            .then(function () {
            // Since updatePromise resolved, we know that this._branches has been
            // set.
            return _this._branches;
        });
    };
    GitRepo.prototype.getCurrentBranch = function () {
        // When on master:
        // git symbolic-ref HEAD
        // refs/heads/master
        var _this = this;
        // When in detached head state:
        // git symbolic-ref HEAD
        // fatal: ref HEAD is not a symbolic ref
        // The below command when in detached HEAD state
        // $ git rev-parse --abbrev-ref HEAD
        // HEAD
        return spawn_1.spawn("git", ["rev-parse", "--abbrev-ref", "HEAD"], this._dir.toString()).closePromise
            .then(function (branchName) {
            if (branchName === "HEAD") {
                // The repo is in detached head state.
                return BBPromise.resolve(undefined);
            }
            else {
                return gitBranch_1.GitBranch.create(_this, branchName);
            }
        });
    };
    GitRepo.prototype.checkoutBranch = function (branch, createIfNonexistent) {
        var _this = this;
        return this.getBranches()
            .then(function (allBranches) {
            // If there is a branch with the same name, we should not try to
            // create it.  Instead, we should just check it out.
            if (_.some(allBranches, { name: branch.name })) {
                createIfNonexistent = false;
            }
        })
            .then(function () {
            var args = [
                "checkout"
            ].concat((createIfNonexistent ? ["-b"] : []), [
                branch.name
            ]);
            return spawn_1.spawn("git", args, _this._dir.toString()).closePromise;
        })
            .then(function () { });
    };
    GitRepo.prototype.checkoutCommit = function (commit) {
        return spawn_1.spawn("git", ["checkout", commit.toString()], this._dir.toString()).closePromise
            .then(function () { });
    };
    GitRepo.prototype.stageAll = function () {
        var _this = this;
        return spawn_1.spawn("git", ["add", "."], this._dir.toString())
            .closePromise
            .then(function () {
            return _this;
        });
    };
    GitRepo.prototype.pushCurrentBranch = function (remoteName, setUpstream) {
        var _this = this;
        if (remoteName === void 0) { remoteName = "origin"; }
        if (setUpstream === void 0) { setUpstream = false; }
        return this.getCurrentBranch()
            .then(function (curBranch) {
            if (!curBranch) {
                throw new Error("There is no current branch to push.");
            }
            var args = [
                "push"
            ].concat((setUpstream ? ["-u"] : []), [
                remoteName,
                curBranch.name
            ]);
            return spawn_1.spawn("git", args, _this._dir.toString()).closePromise;
        })
            .then(function () {
        })
            .catch(function (err) {
            console.log("Error pushing current branch: " + JSON.stringify(err));
            throw err;
        });
    };
    // TODO: Write unit tests for the following method.
    GitRepo.prototype.getCommitDeltas = function (trackingRemote) {
        var _this = this;
        if (trackingRemote === void 0) { trackingRemote = "origin"; }
        return this.getCurrentBranch()
            .then(function (branch) {
            if (!branch) {
                throw new Error("Cannot getNumCommitsAhead() when HEAD is not on a branch.");
            }
            // The names of the two branches in question.
            var thisBranchName = branch.name;
            var trackingBranchName = trackingRemote + "/" + thisBranchName;
            var numAheadPromise = spawn_1.spawn("git", ["rev-list", thisBranchName, "--not", trackingBranchName, "--count"], _this._dir.toString()).closePromise;
            var numBehindPromise = spawn_1.spawn("git", ["rev-list", trackingBranchName, "--not", thisBranchName, "--count"], _this._dir.toString()).closePromise;
            return BBPromise.all([numAheadPromise, numBehindPromise]);
        })
            .then(function (results) {
            return {
                ahead: parseInt(results[0], 10),
                behind: parseInt(results[1], 10)
            };
        });
    };
    // TODO: To get the staged files:
    // git diff --name-only --cached
    // TODO: Add unit tests for this method.
    GitRepo.prototype.commit = function (msg) {
        var _this = this;
        if (msg === void 0) { msg = ""; }
        return spawn_1.spawn("git", ["commit", "-m", msg], this._dir.toString())
            .closePromise
            .then(function () {
            // Get the commit hash
            return spawn_1.spawn("git", ["rev-parse", "HEAD"], _this._dir.toString()).closePromise;
        })
            .then(function (stdout) {
            var commitHash = _.trim(stdout);
            return spawn_1.spawn("git", ["show", commitHash], _this._dir.toString()).closePromise;
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
    /**
     * Fetches from the specified remote.
     * @param remoteName - The remote to fetch from
     * @param fetchTags - Set to true in order to fetch tags that point to
     * objects that are not downloaded (see git fetch docs).
     * @return A promise that is resolved when the command completes
     * successfully
     */
    GitRepo.prototype.fetch = function (remoteName, fetchTags) {
        if (remoteName === void 0) { remoteName = "origin"; }
        if (fetchTags === void 0) { fetchTags = false; }
        var args = [
            "fetch"
        ].concat(arrayHelpers_1.insertIf(fetchTags, "--tags"), [
            remoteName
        ]);
        return spawn_1.spawn("git", args, this._dir.toString()).closePromise
            .then(function () { }, function (err) {
            console.log("Error fetching from " + remoteName + " remote: " + JSON.stringify(err));
            throw err;
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
            updatePromise = BBPromise.resolve();
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
            .closePromise
            .then(function (stdout) {
            var entries = [];
            var match;
            while ((match = GIT_LOG_ENTRY_REGEX.exec(stdout)) !== null) // tslint:disable-line
             {
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

//# sourceMappingURL=data:application/json;charset=utf8;base64,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bEY7Z0JBQ0ksT0FBTyxDQUFDLElBQUksQ0FDUjtvQkFDSSxVQUFVLEVBQUUsS0FBSyxDQUFDLENBQUMsQ0FBQztvQkFDcEIsTUFBTSxFQUFNLEtBQUssQ0FBQyxDQUFDLENBQUM7b0JBQ3BCLFNBQVMsRUFBRyxJQUFJLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7b0JBQzlCLE9BQU8sRUFBSyx1QkFBTyxDQUFDLDhCQUFjLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7aUJBQ2hELENBQ0osQ0FBQzthQUNMO1lBRUQsbUVBQW1FO1lBQ25FLDBDQUEwQztZQUMxQyxDQUFDLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxDQUFDO1lBQ25CLE9BQU8sT0FBTyxDQUFDO1FBQ25CLENBQUMsQ0FBQyxDQUFDO0lBQ1AsQ0FBQztJQUdMLGNBQUM7QUFBRCxDQWhuQkEsQUFnbkJDLElBQUE7QUFobkJZLDBCQUFPO0FBa25CcEIsMkVBQTJFO0FBQzNFLDhCQUE4QiIsImZpbGUiOiJkZXBvdC9naXRSZXBvLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtpbnNlcnRJZn0gZnJvbSBcIi4vYXJyYXlIZWxwZXJzXCI7XG5pbXBvcnQge0RpcmVjdG9yeX0gZnJvbSBcIi4vZGlyZWN0b3J5XCI7XG5pbXBvcnQge0ZpbGV9IGZyb20gXCIuL2ZpbGVcIjtcbmltcG9ydCB7c3Bhd259IGZyb20gXCIuL3NwYXduXCI7XG5pbXBvcnQge0dpdEJyYW5jaH0gZnJvbSBcIi4vZ2l0QnJhbmNoXCI7XG5pbXBvcnQgKiBhcyBfIGZyb20gXCJsb2Rhc2hcIjtcbmltcG9ydCB7b3V0ZGVudCwgdHJpbUJsYW5rTGluZXN9IGZyb20gXCIuL3N0cmluZ0hlbHBlcnNcIjtcbmltcG9ydCB7VXJsfSBmcm9tIFwiLi91cmxcIjtcbmltcG9ydCB7Z2l0VXJsVG9Qcm9qZWN0TmFtZX0gZnJvbSBcIi4vZ2l0SGVscGVyc1wiO1xuaW1wb3J0IHtJUGFja2FnZUpzb259IGZyb20gXCIuL25vZGVQYWNrYWdlXCI7XG5pbXBvcnQge0NvbW1pdEhhc2h9IGZyb20gXCIuL2NvbW1pdEhhc2hcIjtcbmltcG9ydCAqIGFzIEJCUHJvbWlzZSBmcm9tIFwiYmx1ZWJpcmRcIjtcblxuXG5pbnRlcmZhY2UgSUdpdExvZ0VudHJ5XG57XG4gICAgLy8gVE9ETzogQ2hhbmdlIHRoZSBmb2xsb3dpbmcgdG8gYW4gaW5zdGFuY2Ugb2YgQ29tbWl0SGFzaC5cbiAgICBjb21taXRIYXNoOiBzdHJpbmc7XG4gICAgYXV0aG9yOiBzdHJpbmc7XG4gICAgdGltZXN0YW1wOiBEYXRlO1xuICAgIG1lc3NhZ2U6IHN0cmluZztcbn1cblxuXG4vL1xuLy8gQSByZWdleCBmb3IgcGFyc2luZyBcImdpdCBsb2dcIiBvdXRwdXQuXG4vLyBtYXRjaFsxXTogY29tbWl0IGhhc2hcbi8vIG1hdGNoWzJdOiBhdXRob3Jcbi8vIG1hdGNoWzNdOiBjb21taXQgdGltZXN0YW1wXG4vLyBtYXRjaFs0XTogY29tbWl0IG1lc3NhZ2UgKGEgc2VxdWVuY2Ugb2YgbGluZXMgdGhhdCBhcmUgZWl0aGVyIGJsYW5rIG9yIHN0YXJ0IHdpdGggd2hpdGVzcGFjZSlcbi8vXG5jb25zdCBHSVRfTE9HX0VOVFJZX1JFR0VYID0gL2NvbW1pdFxccyooWzAtOWEtZl0rKS4qPyRcXHNeQXV0aG9yOlxccyooLio/KSRcXHNeRGF0ZTpcXHMqKC4qPykkXFxzKCg/Oig/Ol5cXHMqJFxcbj8pfCg/Ol5cXHMrKD86LiopJFxccz8pKSspL2dtO1xuXG4vKipcbiAqIERldGVybWluZXMgd2hldGhlciBkaXIgaXMgYSBkaXJlY3RvcnkgY29udGFpbmluZyBhIEdpdCByZXBvc2l0b3J5LlxuICogQHBhcmFtIGRpciAtIFRoZSBkaXJlY3RvcnkgdG8gaW5zcGVjdFxuICogQHJldHVybiBBIHByb21pc2UgZm9yIGEgYm9vbGVhbiBpbmRpY2F0aW5nIHdoZXRoZXIgZGlyIGNvbnRhaW5zIGEgR2l0XG4gKiByZXBvc2l0b3J5LiAgVGhpcyBwcm9taXNlIHdpbGwgbmV2ZXIgcmVqZWN0LlxuICovXG5leHBvcnQgZnVuY3Rpb24gaXNHaXRSZXBvRGlyKGRpcjogRGlyZWN0b3J5KTogUHJvbWlzZTxib29sZWFuPiB7XG5cbiAgICByZXR1cm4gQkJQcm9taXNlLmFsbChbXG4gICAgICAgIGRpci5leGlzdHMoKSwgICAgICAgICAgICAgICAgICAgICAgICAvLyBUaGUgZGlyZWN0b3J5IGV4aXN0c1xuICAgICAgICBuZXcgRGlyZWN0b3J5KGRpciwgXCIuZ2l0XCIpLmV4aXN0cygpICAvLyBUaGUgZGlyZWN0b3J5IGNvbnRhaW5zIGEgLmdpdCBkaXJlY3RvcnlcbiAgICBdKVxuICAgIC50aGVuKChbZGlyRXhpc3RzLCBkb3RHaXRFeGlzdHNdKSA9PiB7XG4gICAgICAgIHJldHVybiBCb29sZWFuKGRpckV4aXN0cyAmJiBkb3RHaXRFeGlzdHMpO1xuICAgIH0pO1xufVxuXG5cbmV4cG9ydCBjbGFzcyBHaXRSZXBvXG57XG5cbiAgICAvKipcbiAgICAgKiBDcmVhdGVzIGEgbmV3IEdpdFJlcG8gaW5zdGFuY2UsIHBvaW50aW5nIGl0IGF0IGEgZGlyZWN0b3J5IGNvbnRhaW5pbmcgdGhlXG4gICAgICogd3JhcHBlZCByZXBvLlxuICAgICAqIEBwYXJhbSBkaXIgLSBUaGUgZGlyZWN0b3J5IGNvbnRhaW5pbmcgdGhlIHJlcG9cbiAgICAgKiBAcmV0dXJuIEEgUHJvbWlzZSBmb3IgdGhlIEdpdFJlcG8uXG4gICAgICovXG4gICAgcHVibGljIHN0YXRpYyBmcm9tRGlyZWN0b3J5KGRpcjogRGlyZWN0b3J5KTogUHJvbWlzZTxHaXRSZXBvPlxuICAgIHtcbiAgICAgICAgcmV0dXJuIGlzR2l0UmVwb0RpcihkaXIpXG4gICAgICAgIC50aGVuKChpc0dpdFJlcG8pID0+IHtcbiAgICAgICAgICAgIGlmIChpc0dpdFJlcG8pIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gbmV3IEdpdFJlcG8oZGlyKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJQYXRoIGRvZXMgbm90IGV4aXN0IG9yIGlzIG5vdCBhIEdpdCByZXBvLlwiKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfVxuXG5cbiAgICAvKipcbiAgICAgKiBDbG9uZXMgYSBHaXQgcmVwbyBhdCB0aGUgc3BlY2lmaWVkIGxvY2F0aW9uLlxuICAgICAqIEBwYXJhbSBzcmMgLSBUaGUgc291cmNlIHRvIGNsb25lIHRoZSByZXBvIGZyb21cbiAgICAgKiBAcGFyYW0gcGFyZW50RGlyIC0gVGhlIHBhcmVudCBkaXJlY3Rvcnkgd2hlcmUgdGhlIHJlcG8gd2lsbCBiZSBwbGFjZWQuXG4gICAgICogVGhlIHJlcG8gd2lsbCBiZSBjbG9uZWQgaW50byBhIHN1YmRpcmVjdG9yeSBuYW1lZCBhZnRlciB0aGUgcHJvamVjdC5cbiAgICAgKiBAcmV0dXJuIEEgcHJvbWlzZSBmb3IgdGhlIGNsb25lZCBHaXQgcmVwby5cbiAgICAgKi9cbiAgICBwdWJsaWMgc3RhdGljIGNsb25lKHNyYzogVXJsIHwgRGlyZWN0b3J5LCBwYXJlbnREaXI6IERpcmVjdG9yeSk6IFByb21pc2U8R2l0UmVwbz5cbiAgICB7XG4gICAgICAgIGxldCBwcm9qTmFtZTogc3RyaW5nO1xuICAgICAgICBsZXQgc3JjU3RyOiBzdHJpbmc7XG5cbiAgICAgICAgaWYgKHNyYyBpbnN0YW5jZW9mIFVybClcbiAgICAgICAge1xuICAgICAgICAgICAgcHJvak5hbWUgPSBnaXRVcmxUb1Byb2plY3ROYW1lKHNyYy50b1N0cmluZygpKTtcbiAgICAgICAgICAgIGNvbnN0IHByb3RvY29scyA9IHNyYy5nZXRQcm90b2NvbHMoKTtcbiAgICAgICAgICAgIHNyY1N0ciA9IHByb3RvY29scy5sZW5ndGggPCAyID9cbiAgICAgICAgICAgICAgICBzcmMudG9TdHJpbmcoKSA6XG4gICAgICAgICAgICAgICAgc3JjLnJlcGxhY2VQcm90b2NvbChcImh0dHBzXCIpLnRvU3RyaW5nKCk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZVxuICAgICAgICB7XG4gICAgICAgICAgICBwcm9qTmFtZSA9IHNyYy5kaXJOYW1lO1xuICAgICAgICAgICAgc3JjU3RyID0gc3JjLnRvU3RyaW5nKCk7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCByZXBvRGlyID0gbmV3IERpcmVjdG9yeShwYXJlbnREaXIsIHByb2pOYW1lKTtcblxuICAgICAgICByZXR1cm4gcGFyZW50RGlyLmV4aXN0cygpXG4gICAgICAgIC50aGVuKChwYXJlbnREaXJFeGlzdHMpID0+IHtcbiAgICAgICAgICAgIGlmICghcGFyZW50RGlyRXhpc3RzKVxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgJHtwYXJlbnREaXJ9IGlzIG5vdCBhIGRpcmVjdG9yeS5gKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSlcbiAgICAgICAgLnRoZW4oKCkgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIHNwYXduKFxuICAgICAgICAgICAgICAgIFwiZ2l0XCIsXG4gICAgICAgICAgICAgICAgW1wiY2xvbmVcIiwgc3JjU3RyLCBwcm9qTmFtZV0sXG4gICAgICAgICAgICAgICAgcGFyZW50RGlyLnRvU3RyaW5nKCkpXG4gICAgICAgICAgICAuY2xvc2VQcm9taXNlO1xuICAgICAgICB9KVxuICAgICAgICAudGhlbigoKSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gbmV3IEdpdFJlcG8ocmVwb0Rpcik7XG4gICAgICAgIH0pO1xuICAgIH1cblxuXG4gICAgLy8gcmVnaW9uIFByaXZhdGUgRGF0YSBNZW1iZXJzXG4gICAgcHJpdmF0ZSByZWFkb25seSBfZGlyOiBEaXJlY3Rvcnk7XG4gICAgcHJpdmF0ZSBfYnJhbmNoZXM6IEFycmF5PEdpdEJyYW5jaD4gfCB1bmRlZmluZWQ7XG4gICAgcHJpdmF0ZSBfbG9nOiBBcnJheTxJR2l0TG9nRW50cnk+IHwgdW5kZWZpbmVkO1xuICAgIC8vIGVuZHJlZ2lvblxuXG5cbiAgICAvKipcbiAgICAgKiBDb25zdHJ1Y3RzIGEgbmV3IEdpdFJlcG8uICBQcml2YXRlIGluIG9yZGVyIHRvIHByb3ZpZGUgZXJyb3IgY2hlY2tpbmcuXG4gICAgICogU2VlIHN0YXRpYyBtZXRob2RzLlxuICAgICAqXG4gICAgICogQHBhcmFtIGRpciAtIFRoZSBkaXJlY3RvcnkgY29udGFpbmluZyB0aGUgR2l0IHJlcG8uXG4gICAgICovXG4gICAgcHJpdmF0ZSBjb25zdHJ1Y3RvcihkaXI6IERpcmVjdG9yeSlcbiAgICB7XG4gICAgICAgIHRoaXMuX2RpciA9IGRpcjtcbiAgICB9XG5cblxuICAgIC8qKlxuICAgICAqIEdldHMgdGhlIGRpcmVjdG9yeSBjb250YWluaW5nIHRoaXMgR2l0IHJlcG8uXG4gICAgICogQHJldHVybiBUaGUgZGlyZWN0b3J5IGNvbnRhaW5pbmcgdGhpcyBnaXQgcmVwby5cbiAgICAgKi9cbiAgICBwdWJsaWMgZ2V0IGRpcmVjdG9yeSgpOiBEaXJlY3RvcnlcbiAgICB7XG4gICAgICAgIHJldHVybiB0aGlzLl9kaXI7XG4gICAgfVxuXG5cbiAgICAvKipcbiAgICAgKiBEZXRlcm1pbmVzIHdoZXRoZXIgdGhpcyBHaXRSZXBvIGlzIGVxdWFsIHRvIGFub3RoZXIgR2l0UmVwby4gIFR3b1xuICAgICAqIGluc3RhbmNlcyBhcmUgY29uc2lkZXJlZCBlcXVhbCBpZiB0aGV5IHBvaW50IHRvIHRoZSBzYW1lIGRpcmVjdG9yeS5cbiAgICAgKiBAbWV0aG9kXG4gICAgICogQHBhcmFtIG90aGVyIC0gVGhlIG90aGVyIEdpdFJlcG8gdG8gY29tcGFyZSB3aXRoXG4gICAgICogQHJldHVybiBXaGV0aGVyIHRoZSB0d28gR2l0UmVwbyBpbnN0YW5jZXMgYXJlIGVxdWFsXG4gICAgICovXG4gICAgcHVibGljIGVxdWFscyhvdGhlcjogR2l0UmVwbyk6IGJvb2xlYW5cbiAgICB7XG4gICAgICAgIHJldHVybiB0aGlzLl9kaXIuZXF1YWxzKG90aGVyLl9kaXIpO1xuICAgIH1cblxuXG4gICAgLyoqXG4gICAgICogR2V0cyB0aGUgZmlsZXMgdGhhdCBhcmUgdW5kZXIgR2l0IHZlcnNpb24gY29udHJvbC5cbiAgICAgKiBAcmV0dXJuIEEgUHJvbWlzZSBmb3IgYW4gYXJyYXkgb2YgZmlsZXMgdW5kZXIgR2l0IHZlcnNpb24gY29udHJvbC5cbiAgICAgKi9cbiAgICBwdWJsaWMgZmlsZXMoKTogUHJvbWlzZTxBcnJheTxGaWxlPj5cbiAgICB7XG4gICAgICAgIHJldHVybiBzcGF3bihcImdpdFwiLCBbXCJscy1maWxlc1wiXSwgdGhpcy5fZGlyLnRvU3RyaW5nKCkpXG4gICAgICAgIC5jbG9zZVByb21pc2VcbiAgICAgICAgLnRoZW4oKHN0ZG91dCkgPT4ge1xuICAgICAgICAgICAgY29uc3QgcmVsYXRpdmVGaWxlUGF0aHMgPSBzdGRvdXQuc3BsaXQoXCJcXG5cIik7XG4gICAgICAgICAgICByZXR1cm4gXy5tYXAocmVsYXRpdmVGaWxlUGF0aHMsIChjdXJSZWxGaWxlUGF0aCkgPT4ge1xuICAgICAgICAgICAgICAgIHJldHVybiBuZXcgRmlsZSh0aGlzLl9kaXIsIGN1clJlbEZpbGVQYXRoKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICB9XG5cblxuICAgIC8vIFRPRE86IFdyaXRlIHVuaXQgdGVzdHMgZm9yIHRoaXMgbWV0aG9kIGFuZCBtYWtlIHN1cmUgdGhlIGZpbGVzIGhhdmUgdGhlXG4gICAgLy8gY29ycmVjdCBwcmVjZWRpbmcgcGF0aC5cbiAgICBwdWJsaWMgbW9kaWZpZWRGaWxlcygpOiBQcm9taXNlPEFycmF5PEZpbGU+PlxuICAgIHtcbiAgICAgICAgcmV0dXJuIHNwYXduKFwiZ2l0XCIsIFtcImxzLWZpbGVzXCIsIFwiLW1cIl0sIHRoaXMuX2Rpci50b1N0cmluZygpKVxuICAgICAgICAuY2xvc2VQcm9taXNlXG4gICAgICAgIC50aGVuKChzdGRvdXQpID0+IHtcbiAgICAgICAgICAgIGlmIChzdGRvdXQgPT09IFwiXCIpXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIFtdO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY29uc3QgcmVsYXRpdmVGaWxlUGF0aHMgPSBzdGRvdXQuc3BsaXQoXCJcXG5cIik7XG4gICAgICAgICAgICByZXR1cm4gXy5tYXAocmVsYXRpdmVGaWxlUGF0aHMsIChjdXJSZWxhdGl2ZUZpbGVQYXRoKSA9PiB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIG5ldyBGaWxlKHRoaXMuX2RpciwgY3VyUmVsYXRpdmVGaWxlUGF0aCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG5cbiAgICAvLyBUT0RPOiBXcml0ZSB1bml0IHRlc3RzIGZvciB0aGlzIG1ldGhvZCBhbmQgbWFrZSBzdXJlIHRoZSBmaWxlcyBoYXZlIHRoZVxuICAgIC8vIGNvcnJlY3QgcHJlY2VkaW5nIHBhdGguXG4gICAgcHVibGljIHVudHJhY2tlZEZpbGVzKCk6IFByb21pc2U8QXJyYXk8RmlsZT4+XG4gICAge1xuICAgICAgICByZXR1cm4gc3Bhd24oXCJnaXRcIiwgW1wibHMtZmlsZXNcIiwgIFwiLS1vdGhlcnNcIiwgIFwiLS1leGNsdWRlLXN0YW5kYXJkXCJdLCB0aGlzLl9kaXIudG9TdHJpbmcoKSlcbiAgICAgICAgLmNsb3NlUHJvbWlzZVxuICAgICAgICAudGhlbigoc3Rkb3V0KSA9PiB7XG4gICAgICAgICAgICBpZiAoc3Rkb3V0ID09PSBcIlwiKVxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIHJldHVybiBbXTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNvbnN0IHJlbGF0aXZlRmlsZVBhdGhzID0gc3Rkb3V0LnNwbGl0KFwiXFxuXCIpO1xuICAgICAgICAgICAgcmV0dXJuIF8ubWFwKHJlbGF0aXZlRmlsZVBhdGhzLCAoY3VyUmVsYXRpdmVQYXRoKSA9PiB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIG5ldyBGaWxlKHRoaXMuX2RpciwgY3VyUmVsYXRpdmVQYXRoKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICB9XG5cblxuICAgIC8vIFRPRE86IFdyaXRlIHVuaXQgdGVzdHMgZm9yIHRoaXMgbWV0aG9kLiAgTWFrZSBzdXJlIHRoZXJlIGlzIG5vIGxlYWRpbmcgb3IgdHJhaWxpbmcgd2hpdGVzcGFjZS5cbiAgICBwdWJsaWMgY3VycmVudENvbW1pdEhhc2goKTogUHJvbWlzZTxDb21taXRIYXNoPlxuICAgIHtcbiAgICAgICAgcmV0dXJuIHNwYXduKFwiZ2l0XCIsIFtcInJldi1wYXJzZVwiLCBcIi0tdmVyaWZ5XCIsIFwiSEVBRFwiXSwgdGhpcy5fZGlyLnRvU3RyaW5nKCkpXG4gICAgICAgIC5jbG9zZVByb21pc2VcbiAgICAgICAgLnRoZW4oKHN0ZG91dCkgPT4ge1xuICAgICAgICAgICAgY29uc3QgaGFzaCA9IENvbW1pdEhhc2guZnJvbVN0cmluZyhzdGRvdXQpO1xuICAgICAgICAgICAgaWYgKCFoYXNoKVxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIkZhaWxlZCB0byBjb25zdHJ1Y3QgQ29tbWl0SGFzaC5cIik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gaGFzaDtcbiAgICAgICAgfSk7XG4gICAgfVxuXG5cbiAgICAvKipcbiAgICAgKiBHZXQgdGhlIHJlbW90ZXMgY29uZmlndXJlZCBmb3IgdGhlIEdpdCByZXBvLlxuICAgICAqIEByZXR1cm4gQSBQcm9taXNlIGZvciBhbiBvYmplY3Qgd2hlcmUgdGhlIHJlbW90ZSBuYW1lcyBhcmUgdGhlIGtleXMgYW5kXG4gICAgICogdGhlIHJlbW90ZSBVUkwgaXMgdGhlIHZhbHVlLlxuICAgICAqL1xuICAgIHB1YmxpYyByZW1vdGVzKCk6IFByb21pc2U8e1tuYW1lOiBzdHJpbmddOiBzdHJpbmd9PlxuICAgIHtcbiAgICAgICAgcmV0dXJuIHNwYXduKFwiZ2l0XCIsIFtcInJlbW90ZVwiLCBcIi12dlwiXSwgdGhpcy5fZGlyLnRvU3RyaW5nKCkpXG4gICAgICAgIC5jbG9zZVByb21pc2VcbiAgICAgICAgLnRoZW4oKHN0ZG91dCkgPT4ge1xuXG4gICAgICAgICAgICBjb25zdCBsaW5lcyA9IHN0ZG91dC5zcGxpdChcIlxcblwiKTtcbiAgICAgICAgICAgIGNvbnN0IHJlbW90ZXM6IHtbbmFtZTogc3RyaW5nXTogc3RyaW5nfSA9IHt9O1xuICAgICAgICAgICAgbGluZXMuZm9yRWFjaCgoY3VyTGluZSkgPT4ge1xuICAgICAgICAgICAgICAgIGNvbnN0IG1hdGNoID0gY3VyTGluZS5tYXRjaCgvXihcXHcrKVxccysoLiopXFxzK1xcKFxcdytcXCkkLyk7XG4gICAgICAgICAgICAgICAgaWYgKG1hdGNoKVxuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgcmVtb3Rlc1ttYXRjaFsxXV0gPSBtYXRjaFsyXTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgcmV0dXJuIHJlbW90ZXM7XG4gICAgICAgIH0pO1xuICAgIH1cblxuXG4gICAgLyoqXG4gICAgICogR2V0cyB0aGUgbmFtZSBvZiB0aGlzIEdpdCByZXBvc2l0b3J5LiAgSWYgdGhlIHJlcG8gaGFzIGEgcmVtb3RlLCB0aGUgbmFtZVxuICAgICAqIGlzIHRha2VuIGZyb20gdGhlIGxhc3QgcGFydCBvZiB0aGUgcmVtb3RlJ3MgVVJMLiAgT3RoZXJ3aXNlLCB0aGUgbmFtZVxuICAgICAqIHdpbGwgYmUgdGFrZW4gZnJvbSB0aGUgXCJuYW1lXCIgcHJvcGVydHkgaW4gcGFja2FnZS5qc29uLiAgT3RoZXJ3aXNlLCB0aGVcbiAgICAgKiBuYW1lIHdpbGwgYmUgdGhlIG5hbWUgb2YgdGhlIGZvbGRlciB0aGUgcmVwbyBpcyBpbi5cbiAgICAgKiBAcmV0dXJuIEEgUHJvbWlzZSBmb3IgdGhlIG5hbWUgb2YgdGhpcyByZXBvc2l0b3J5LlxuICAgICAqL1xuICAgIHB1YmxpYyBuYW1lKCk6IFByb21pc2U8c3RyaW5nPlxuICAgIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucmVtb3RlcygpXG4gICAgICAgIC50aGVuKChyZW1vdGVzKSA9PiB7XG4gICAgICAgICAgICBjb25zdCByZW1vdGVOYW1lcyA9IE9iamVjdC5rZXlzKHJlbW90ZXMpO1xuICAgICAgICAgICAgaWYgKHJlbW90ZU5hbWVzLmxlbmd0aCA+IDApXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgY29uc3QgcmVtb3RlVXJsID0gcmVtb3Rlc1tyZW1vdGVOYW1lc1swXV07XG4gICAgICAgICAgICAgICAgcmV0dXJuIGdpdFVybFRvUHJvamVjdE5hbWUocmVtb3RlVXJsKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSlcbiAgICAgICAgLnRoZW4oKHByb2pOYW1lKSA9PiB7XG4gICAgICAgICAgICBpZiAocHJvak5hbWUpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gcHJvak5hbWU7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIExvb2sgZm9yIHRoZSBwcm9qZWN0IG5hbWUgaW4gcGFja2FnZS5qc29uLlxuICAgICAgICAgICAgY29uc3QgcGFja2FnZUpzb24gPSBuZXcgRmlsZSh0aGlzLl9kaXIsIFwicGFja2FnZS5qc29uXCIpLnJlYWRKc29uU3luYzxJUGFja2FnZUpzb24+KCk7XG4gICAgICAgICAgICBpZiAocGFja2FnZUpzb24pIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gcGFja2FnZUpzb24ubmFtZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSlcbiAgICAgICAgLnRoZW4oKHByb2pOYW1lKSA9PiB7XG4gICAgICAgICAgICBpZiAocHJvak5hbWUpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gcHJvak5hbWU7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGNvbnN0IGRpck5hbWUgPSB0aGlzLl9kaXIuZGlyTmFtZTtcbiAgICAgICAgICAgIGlmIChkaXJOYW1lID09PSBcIi9cIilcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJVbmFibGUgdG8gZGV0ZXJtaW5lIEdpdCByZXBvIG5hbWUuXCIpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gZGlyTmFtZTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG5cbiAgICBwdWJsaWMgdGFncygpOiBQcm9taXNlPEFycmF5PHN0cmluZz4+XG4gICAge1xuICAgICAgICByZXR1cm4gc3Bhd24oXCJnaXRcIiwgW1widGFnXCJdLCB0aGlzLl9kaXIudG9TdHJpbmcoKSlcbiAgICAgICAgLmNsb3NlUHJvbWlzZVxuICAgICAgICAudGhlbigoc3Rkb3V0KSA9PiB7XG4gICAgICAgICAgICBpZiAoc3Rkb3V0Lmxlbmd0aCA9PT0gMClcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gW107XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiBzdGRvdXQuc3BsaXQoXCJcXG5cIik7XG4gICAgICAgIH0pO1xuICAgIH1cblxuXG4gICAgcHVibGljIGhhc1RhZyh0YWdOYW1lOiBzdHJpbmcpOiBQcm9taXNlPGJvb2xlYW4+XG4gICAge1xuICAgICAgICByZXR1cm4gdGhpcy50YWdzKClcbiAgICAgICAgLnRoZW4oKHRhZ3MpID0+IHtcbiAgICAgICAgICAgIHJldHVybiB0YWdzLmluZGV4T2YodGFnTmFtZSkgPj0gMDtcbiAgICAgICAgfSk7XG4gICAgfVxuXG5cbiAgICBwdWJsaWMgY3JlYXRlVGFnKHRhZ05hbWU6IHN0cmluZywgbWVzc2FnZTogc3RyaW5nID0gXCJcIiwgZm9yY2U6IGJvb2xlYW4gPSBmYWxzZSk6IFByb21pc2U8R2l0UmVwbz5cbiAgICB7XG4gICAgICAgIGxldCBhcmdzID0gW1widGFnXCJdO1xuXG4gICAgICAgIGlmIChmb3JjZSkge1xuICAgICAgICAgICAgYXJncy5wdXNoKFwiLWZcIik7XG4gICAgICAgIH1cblxuICAgICAgICBhcmdzID0gXy5jb25jYXQoYXJncywgXCItYVwiLCB0YWdOYW1lKTtcbiAgICAgICAgYXJncyA9IF8uY29uY2F0KGFyZ3MsIFwiLW1cIiwgbWVzc2FnZSk7XG5cbiAgICAgICAgcmV0dXJuIHNwYXduKFwiZ2l0XCIsIGFyZ3MsIHRoaXMuX2Rpci50b1N0cmluZygpKVxuICAgICAgICAuY2xvc2VQcm9taXNlXG4gICAgICAgIC50aGVuKCgpID0+IHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgICB9KTtcbiAgICB9XG5cblxuICAgIHB1YmxpYyBkZWxldGVUYWcodGFnTmFtZTogc3RyaW5nKTogUHJvbWlzZTxHaXRSZXBvPlxuICAgIHtcbiAgICAgICAgcmV0dXJuIHNwYXduKFwiZ2l0XCIsIFtcInRhZ1wiLCBcIi0tZGVsZXRlXCIsIHRhZ05hbWVdLCB0aGlzLl9kaXIudG9TdHJpbmcoKSlcbiAgICAgICAgLmNsb3NlUHJvbWlzZVxuICAgICAgICAuY2F0Y2goKGVycikgPT4ge1xuICAgICAgICAgICAgaWYgKGVyci5zdGRlcnIuaW5jbHVkZXMoXCJub3QgZm91bmRcIikpXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgLy8gVGhlIHNwZWNpZmllZCB0YWcgbmFtZSB3YXMgbm90IGZvdW5kLiAgV2UgYXJlIHN0aWxsXG4gICAgICAgICAgICAgICAgLy8gc3VjY2Vzc2Z1bC5cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICB0aHJvdyBlcnI7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pXG4gICAgICAgIC50aGVuKCgpID0+IHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgICB9KTtcbiAgICB9XG5cblxuICAgIHB1YmxpYyBwdXNoVGFnKHRhZ05hbWU6IHN0cmluZywgcmVtb3RlTmFtZTogc3RyaW5nLCBmb3JjZTogYm9vbGVhbiA9IGZhbHNlKTogUHJvbWlzZTxHaXRSZXBvPlxuICAgIHtcbiAgICAgICAgbGV0IGFyZ3MgPSBbXCJwdXNoXCJdO1xuXG4gICAgICAgIGlmIChmb3JjZSkge1xuICAgICAgICAgICAgYXJncy5wdXNoKFwiLS1mb3JjZVwiKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGFyZ3MgPSBfLmNvbmNhdChhcmdzLCByZW1vdGVOYW1lLCB0YWdOYW1lKTtcblxuICAgICAgICByZXR1cm4gc3Bhd24oXCJnaXRcIiwgYXJncywgdGhpcy5fZGlyLnRvU3RyaW5nKCkpXG4gICAgICAgIC5jbG9zZVByb21pc2VcbiAgICAgICAgLnRoZW4oKCkgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICAgIH0pO1xuICAgIH1cblxuXG4gICAgcHVibGljIGdldEJyYW5jaGVzKGZvcmNlVXBkYXRlOiBib29sZWFuID0gZmFsc2UpOiBQcm9taXNlPEFycmF5PEdpdEJyYW5jaD4+XG4gICAge1xuICAgICAgICBpZiAoZm9yY2VVcGRhdGUpXG4gICAgICAgIHtcbiAgICAgICAgICAgIC8vIEludmFsaWRhdGUgdGhlIGNhY2hlLiAgSWYgdGhpcyB1cGRhdGUgZmFpbHMsIHN1YnNlcXVlbnQgcmVxdWVzdHNcbiAgICAgICAgICAgIC8vIHdpbGwgaGF2ZSB0byB1cGRhdGUgdGhlIGNhY2hlLlxuICAgICAgICAgICAgdGhpcy5fYnJhbmNoZXMgPSB1bmRlZmluZWQ7XG4gICAgICAgIH1cblxuICAgICAgICBsZXQgdXBkYXRlUHJvbWlzZTogUHJvbWlzZTx2b2lkPjtcblxuICAgICAgICBpZiAodGhpcy5fYnJhbmNoZXMgPT09IHVuZGVmaW5lZClcbiAgICAgICAge1xuICAgICAgICAgICAgLy8gVGhlIGludGVybmFsIGNhY2hlIG9mIGJyYW5jaGVzIG5lZWRzIHRvIGJlIHVwZGF0ZWQuXG4gICAgICAgICAgICB1cGRhdGVQcm9taXNlID0gR2l0QnJhbmNoLmVudW1lcmF0ZUdpdFJlcG9CcmFuY2hlcyh0aGlzKVxuICAgICAgICAgICAgLnRoZW4oKGJyYW5jaGVzOiBBcnJheTxHaXRCcmFuY2g+KSA9PiB7XG4gICAgICAgICAgICAgICAgdGhpcy5fYnJhbmNoZXMgPSBicmFuY2hlcztcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIGVsc2VcbiAgICAgICAge1xuICAgICAgICAgICAgLy8gVGhlIGludGVybmFsIGNhY2hlIGRvZXMgbm90IG5lZWQgdG8gYmUgdXBkYXRlZC5cbiAgICAgICAgICAgIHVwZGF0ZVByb21pc2UgPSBCQlByb21pc2UucmVzb2x2ZSgpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHVwZGF0ZVByb21pc2VcbiAgICAgICAgLnRoZW4oKCkgPT4ge1xuICAgICAgICAgICAgLy8gU2luY2UgdXBkYXRlUHJvbWlzZSByZXNvbHZlZCwgd2Uga25vdyB0aGF0IHRoaXMuX2JyYW5jaGVzIGhhcyBiZWVuXG4gICAgICAgICAgICAvLyBzZXQuXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fYnJhbmNoZXMhO1xuICAgICAgICB9KTtcbiAgICB9XG5cblxuICAgIHB1YmxpYyBnZXRDdXJyZW50QnJhbmNoKCk6IFByb21pc2U8R2l0QnJhbmNoIHwgdW5kZWZpbmVkPlxuICAgIHtcbiAgICAgICAgLy8gV2hlbiBvbiBtYXN0ZXI6XG4gICAgICAgIC8vIGdpdCBzeW1ib2xpYy1yZWYgSEVBRFxuICAgICAgICAvLyByZWZzL2hlYWRzL21hc3RlclxuXG4gICAgICAgIC8vIFdoZW4gaW4gZGV0YWNoZWQgaGVhZCBzdGF0ZTpcbiAgICAgICAgLy8gZ2l0IHN5bWJvbGljLXJlZiBIRUFEXG4gICAgICAgIC8vIGZhdGFsOiByZWYgSEVBRCBpcyBub3QgYSBzeW1ib2xpYyByZWZcblxuICAgICAgICAvLyBUaGUgYmVsb3cgY29tbWFuZCB3aGVuIGluIGRldGFjaGVkIEhFQUQgc3RhdGVcbiAgICAgICAgLy8gJCBnaXQgcmV2LXBhcnNlIC0tYWJicmV2LXJlZiBIRUFEXG4gICAgICAgIC8vIEhFQURcblxuICAgICAgICByZXR1cm4gc3Bhd24oXCJnaXRcIiwgW1wicmV2LXBhcnNlXCIsIFwiLS1hYmJyZXYtcmVmXCIsIFwiSEVBRFwiXSwgdGhpcy5fZGlyLnRvU3RyaW5nKCkpLmNsb3NlUHJvbWlzZVxuICAgICAgICAudGhlbigoYnJhbmNoTmFtZSkgPT4ge1xuICAgICAgICAgICAgaWYgKGJyYW5jaE5hbWUgPT09IFwiSEVBRFwiKSB7XG4gICAgICAgICAgICAgICAgLy8gVGhlIHJlcG8gaXMgaW4gZGV0YWNoZWQgaGVhZCBzdGF0ZS5cbiAgICAgICAgICAgICAgICByZXR1cm4gQkJQcm9taXNlLnJlc29sdmUodW5kZWZpbmVkKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIHJldHVybiBHaXRCcmFuY2guY3JlYXRlKHRoaXMsIGJyYW5jaE5hbWUpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9XG5cblxuICAgIHB1YmxpYyBjaGVja291dEJyYW5jaChicmFuY2g6IEdpdEJyYW5jaCwgY3JlYXRlSWZOb25leGlzdGVudDogYm9vbGVhbik6IFByb21pc2U8dm9pZD5cbiAgICB7XG5cbiAgICAgICAgcmV0dXJuIHRoaXMuZ2V0QnJhbmNoZXMoKVxuICAgICAgICAudGhlbigoYWxsQnJhbmNoZXMpID0+IHtcbiAgICAgICAgICAgIC8vIElmIHRoZXJlIGlzIGEgYnJhbmNoIHdpdGggdGhlIHNhbWUgbmFtZSwgd2Ugc2hvdWxkIG5vdCB0cnkgdG9cbiAgICAgICAgICAgIC8vIGNyZWF0ZSBpdC4gIEluc3RlYWQsIHdlIHNob3VsZCBqdXN0IGNoZWNrIGl0IG91dC5cbiAgICAgICAgICAgIGlmIChfLnNvbWUoYWxsQnJhbmNoZXMsIHtuYW1lOiBicmFuY2gubmFtZX0pKVxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIGNyZWF0ZUlmTm9uZXhpc3RlbnQgPSBmYWxzZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSlcbiAgICAgICAgLnRoZW4oKCkgPT4ge1xuICAgICAgICAgICAgY29uc3QgYXJncyA9IFtcbiAgICAgICAgICAgICAgICBcImNoZWNrb3V0XCIsXG4gICAgICAgICAgICAgICAgLi4uKGNyZWF0ZUlmTm9uZXhpc3RlbnQgPyBbXCItYlwiXSA6IFtdKSxcbiAgICAgICAgICAgICAgICBicmFuY2gubmFtZVxuICAgICAgICAgICAgXTtcblxuICAgICAgICAgICAgcmV0dXJuIHNwYXduKFwiZ2l0XCIsIGFyZ3MsIHRoaXMuX2Rpci50b1N0cmluZygpKS5jbG9zZVByb21pc2U7XG4gICAgICAgIH0pXG4gICAgICAgIC50aGVuKCgpID0+IHt9KTtcbiAgICB9XG5cblxuICAgIHB1YmxpYyBjaGVja291dENvbW1pdChjb21taXQ6IENvbW1pdEhhc2gpOiBQcm9taXNlPHZvaWQ+XG4gICAge1xuICAgICAgICByZXR1cm4gc3Bhd24oXCJnaXRcIiwgW1wiY2hlY2tvdXRcIiwgY29tbWl0LnRvU3RyaW5nKCldLCB0aGlzLl9kaXIudG9TdHJpbmcoKSkuY2xvc2VQcm9taXNlXG4gICAgICAgIC50aGVuKCgpID0+IHt9KTtcbiAgICB9XG5cblxuICAgIHB1YmxpYyBzdGFnZUFsbCgpOiBQcm9taXNlPEdpdFJlcG8+XG4gICAge1xuICAgICAgICByZXR1cm4gc3Bhd24oXCJnaXRcIiwgW1wiYWRkXCIsIFwiLlwiXSwgdGhpcy5fZGlyLnRvU3RyaW5nKCkpXG4gICAgICAgIC5jbG9zZVByb21pc2VcbiAgICAgICAgLnRoZW4oKCkgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICAgIH0pO1xuICAgIH1cblxuXG4gICAgcHVibGljIHB1c2hDdXJyZW50QnJhbmNoKHJlbW90ZU5hbWU6IHN0cmluZyA9IFwib3JpZ2luXCIsIHNldFVwc3RyZWFtOiBib29sZWFuID0gZmFsc2UpOiBQcm9taXNlPHZvaWQ+XG4gICAge1xuICAgICAgICByZXR1cm4gdGhpcy5nZXRDdXJyZW50QnJhbmNoKClcbiAgICAgICAgLnRoZW4oKGN1ckJyYW5jaCkgPT4ge1xuICAgICAgICAgICAgaWYgKCFjdXJCcmFuY2gpXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiVGhlcmUgaXMgbm8gY3VycmVudCBicmFuY2ggdG8gcHVzaC5cIik7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGNvbnN0IGFyZ3MgPSBbXG4gICAgICAgICAgICAgICAgXCJwdXNoXCIsXG4gICAgICAgICAgICAgICAgLi4uKHNldFVwc3RyZWFtID8gW1wiLXVcIl0gOiBbXSksXG4gICAgICAgICAgICAgICAgcmVtb3RlTmFtZSxcbiAgICAgICAgICAgICAgICBjdXJCcmFuY2gubmFtZVxuICAgICAgICAgICAgXTtcbiAgICAgICAgICAgIHJldHVybiBzcGF3bihcImdpdFwiLCBhcmdzLCB0aGlzLl9kaXIudG9TdHJpbmcoKSkuY2xvc2VQcm9taXNlO1xuICAgICAgICB9KVxuICAgICAgICAudGhlbigoKSA9PiB7XG4gICAgICAgIH0pXG4gICAgICAgIC5jYXRjaCgoZXJyKSA9PiB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhgRXJyb3IgcHVzaGluZyBjdXJyZW50IGJyYW5jaDogJHtKU09OLnN0cmluZ2lmeShlcnIpfWApO1xuICAgICAgICAgICAgdGhyb3cgZXJyO1xuICAgICAgICB9KTtcbiAgICB9XG5cblxuICAgIC8vIFRPRE86IFdyaXRlIHVuaXQgdGVzdHMgZm9yIHRoZSBmb2xsb3dpbmcgbWV0aG9kLlxuICAgIHB1YmxpYyBnZXRDb21taXREZWx0YXModHJhY2tpbmdSZW1vdGU6IHN0cmluZyA9IFwib3JpZ2luXCIpOiBQcm9taXNlPHthaGVhZDogbnVtYmVyLCBiZWhpbmQ6IG51bWJlcn0+XG4gICAge1xuICAgICAgICByZXR1cm4gdGhpcy5nZXRDdXJyZW50QnJhbmNoKClcbiAgICAgICAgLnRoZW4oKGJyYW5jaCkgPT4ge1xuICAgICAgICAgICAgaWYgKCFicmFuY2gpXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiQ2Fubm90IGdldE51bUNvbW1pdHNBaGVhZCgpIHdoZW4gSEVBRCBpcyBub3Qgb24gYSBicmFuY2guXCIpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBUaGUgbmFtZXMgb2YgdGhlIHR3byBicmFuY2hlcyBpbiBxdWVzdGlvbi5cbiAgICAgICAgICAgIGNvbnN0IHRoaXNCcmFuY2hOYW1lID0gYnJhbmNoLm5hbWU7XG4gICAgICAgICAgICBjb25zdCB0cmFja2luZ0JyYW5jaE5hbWUgPSBgJHt0cmFja2luZ1JlbW90ZX0vJHt0aGlzQnJhbmNoTmFtZX1gO1xuXG4gICAgICAgICAgICBjb25zdCBudW1BaGVhZFByb21pc2UgPSBzcGF3bihcbiAgICAgICAgICAgICAgICBcImdpdFwiLFxuICAgICAgICAgICAgICAgIFtcInJldi1saXN0XCIsIHRoaXNCcmFuY2hOYW1lLCBcIi0tbm90XCIsIHRyYWNraW5nQnJhbmNoTmFtZSwgXCItLWNvdW50XCJdLFxuICAgICAgICAgICAgICAgIHRoaXMuX2Rpci50b1N0cmluZygpXG4gICAgICAgICAgICApLmNsb3NlUHJvbWlzZTtcblxuICAgICAgICAgICAgY29uc3QgbnVtQmVoaW5kUHJvbWlzZSA9IHNwYXduKFxuICAgICAgICAgICAgICAgIFwiZ2l0XCIsXG4gICAgICAgICAgICAgICAgW1wicmV2LWxpc3RcIiwgdHJhY2tpbmdCcmFuY2hOYW1lLCBcIi0tbm90XCIsIHRoaXNCcmFuY2hOYW1lLCBcIi0tY291bnRcIl0sXG4gICAgICAgICAgICAgICAgdGhpcy5fZGlyLnRvU3RyaW5nKClcbiAgICAgICAgICAgICkuY2xvc2VQcm9taXNlO1xuXG4gICAgICAgICAgICByZXR1cm4gQkJQcm9taXNlLmFsbChbbnVtQWhlYWRQcm9taXNlLCBudW1CZWhpbmRQcm9taXNlXSk7XG4gICAgICAgIH0pXG4gICAgICAgIC50aGVuKChyZXN1bHRzKSA9PiB7XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIGFoZWFkOiBwYXJzZUludChyZXN1bHRzWzBdLCAxMCksXG4gICAgICAgICAgICAgICAgYmVoaW5kOiBwYXJzZUludChyZXN1bHRzWzFdLCAxMClcbiAgICAgICAgICAgIH07XG4gICAgICAgIH0pO1xuICAgIH1cblxuXG4gICAgLy8gVE9ETzogVG8gZ2V0IHRoZSBzdGFnZWQgZmlsZXM6XG4gICAgLy8gZ2l0IGRpZmYgLS1uYW1lLW9ubHkgLS1jYWNoZWRcblxuXG4gICAgLy8gVE9ETzogQWRkIHVuaXQgdGVzdHMgZm9yIHRoaXMgbWV0aG9kLlxuICAgIHB1YmxpYyBjb21taXQobXNnOiBzdHJpbmcgPSBcIlwiKTogUHJvbWlzZTxJR2l0TG9nRW50cnk+XG4gICAge1xuICAgICAgICByZXR1cm4gc3Bhd24oXCJnaXRcIiwgW1wiY29tbWl0XCIsIFwiLW1cIiwgbXNnXSwgdGhpcy5fZGlyLnRvU3RyaW5nKCkpXG4gICAgICAgIC5jbG9zZVByb21pc2VcbiAgICAgICAgLnRoZW4oKCkgPT4ge1xuICAgICAgICAgICAgLy8gR2V0IHRoZSBjb21taXQgaGFzaFxuICAgICAgICAgICAgcmV0dXJuIHNwYXduKFwiZ2l0XCIsIFtcInJldi1wYXJzZVwiLCBcIkhFQURcIl0sIHRoaXMuX2Rpci50b1N0cmluZygpKS5jbG9zZVByb21pc2U7XG4gICAgICAgIH0pXG4gICAgICAgIC50aGVuKChzdGRvdXQpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IGNvbW1pdEhhc2ggPSBfLnRyaW0oc3Rkb3V0KTtcbiAgICAgICAgICAgIHJldHVybiBzcGF3bihcImdpdFwiLCBbXCJzaG93XCIsIGNvbW1pdEhhc2hdLCB0aGlzLl9kaXIudG9TdHJpbmcoKSkuY2xvc2VQcm9taXNlO1xuICAgICAgICB9KVxuICAgICAgICAudGhlbigoc3Rkb3V0KSA9PiB7XG4gICAgICAgICAgICBjb25zdCBtYXRjaCA9IEdJVF9MT0dfRU5UUllfUkVHRVguZXhlYyhzdGRvdXQpO1xuICAgICAgICAgICAgaWYgKCFtYXRjaClcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYENvdWxkIG5vdCBwYXJzZSBcImdpdCBzaG93XCIgb3V0cHV0OlxcbiR7c3Rkb3V0fWApO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBjb21taXRIYXNoOiBtYXRjaFsxXSxcbiAgICAgICAgICAgICAgICBhdXRob3I6ICAgICBtYXRjaFsyXSxcbiAgICAgICAgICAgICAgICB0aW1lc3RhbXA6ICBuZXcgRGF0ZShtYXRjaFszXSksXG4gICAgICAgICAgICAgICAgbWVzc2FnZTogICAgb3V0ZGVudCh0cmltQmxhbmtMaW5lcyhtYXRjaFs0XSkpXG4gICAgICAgICAgICB9O1xuICAgICAgICB9KTtcbiAgICB9XG5cblxuICAgIC8qKlxuICAgICAqIEZldGNoZXMgZnJvbSB0aGUgc3BlY2lmaWVkIHJlbW90ZS5cbiAgICAgKiBAcGFyYW0gcmVtb3RlTmFtZSAtIFRoZSByZW1vdGUgdG8gZmV0Y2ggZnJvbVxuICAgICAqIEBwYXJhbSBmZXRjaFRhZ3MgLSBTZXQgdG8gdHJ1ZSBpbiBvcmRlciB0byBmZXRjaCB0YWdzIHRoYXQgcG9pbnQgdG9cbiAgICAgKiBvYmplY3RzIHRoYXQgYXJlIG5vdCBkb3dubG9hZGVkIChzZWUgZ2l0IGZldGNoIGRvY3MpLlxuICAgICAqIEByZXR1cm4gQSBwcm9taXNlIHRoYXQgaXMgcmVzb2x2ZWQgd2hlbiB0aGUgY29tbWFuZCBjb21wbGV0ZXNcbiAgICAgKiBzdWNjZXNzZnVsbHlcbiAgICAgKi9cbiAgICBwdWJsaWMgZmV0Y2gocmVtb3RlTmFtZTogc3RyaW5nID0gXCJvcmlnaW5cIiwgZmV0Y2hUYWdzOiBib29sZWFuID0gZmFsc2UpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICAgICAgY29uc3QgYXJncyA9IFtcbiAgICAgICAgICAgIFwiZmV0Y2hcIixcbiAgICAgICAgICAgIC4uLmluc2VydElmKGZldGNoVGFncywgXCItLXRhZ3NcIiksXG4gICAgICAgICAgICByZW1vdGVOYW1lXG4gICAgICAgIF07XG5cbiAgICAgICAgcmV0dXJuIHNwYXduKFwiZ2l0XCIsIGFyZ3MsIHRoaXMuX2Rpci50b1N0cmluZygpKS5jbG9zZVByb21pc2VcbiAgICAgICAgLnRoZW4oXG4gICAgICAgICAgICAoKSA9PiB7fSxcbiAgICAgICAgICAgIChlcnIpID0+IHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhgRXJyb3IgZmV0Y2hpbmcgZnJvbSAke3JlbW90ZU5hbWV9IHJlbW90ZTogJHtKU09OLnN0cmluZ2lmeShlcnIpfWApO1xuICAgICAgICAgICAgICAgIHRocm93IGVycjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgKTtcbiAgICB9XG5cblxuICAgIHB1YmxpYyBnZXRMb2coZm9yY2VVcGRhdGU/OiBib29sZWFuKTogUHJvbWlzZTxBcnJheTxJR2l0TG9nRW50cnk+PlxuICAgIHtcbiAgICAgICAgaWYgKGZvcmNlVXBkYXRlKVxuICAgICAgICB7XG4gICAgICAgICAgICB0aGlzLl9sb2cgPSB1bmRlZmluZWQ7XG4gICAgICAgIH1cblxuICAgICAgICBsZXQgdXBkYXRlUHJvbWlzZTogUHJvbWlzZTx2b2lkPjtcblxuICAgICAgICBpZiAodGhpcy5fbG9nID09PSB1bmRlZmluZWQpXG4gICAgICAgIHtcbiAgICAgICAgICAgIHVwZGF0ZVByb21pc2UgPSB0aGlzLmdldExvZ0VudHJpZXMoKVxuICAgICAgICAgICAgLnRoZW4oKGxvZzogQXJyYXk8SUdpdExvZ0VudHJ5PikgPT4ge1xuICAgICAgICAgICAgICAgIHRoaXMuX2xvZyA9IGxvZztcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIGVsc2VcbiAgICAgICAge1xuICAgICAgICAgICAgdXBkYXRlUHJvbWlzZSA9IEJCUHJvbWlzZS5yZXNvbHZlKCk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gdXBkYXRlUHJvbWlzZVxuICAgICAgICAudGhlbigoKSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fbG9nITtcbiAgICAgICAgfSk7XG4gICAgfVxuXG5cbiAgICAvKipcbiAgICAgKiBIZWxwZXIgbWV0aG9kIHRoYXQgcmV0cmlldmVzIEdpdCBsb2cgZW50cmllc1xuICAgICAqIEBwcml2YXRlXG4gICAgICogQG1ldGhvZFxuICAgICAqIEByZXR1cm4gQSBwcm9taXNlIGZvciBhbiBhcnJheSBvZiBzdHJ1Y3R1cmVzIGRlc2NyaWJpbmcgZWFjaCBjb21taXQuXG4gICAgICovXG4gICAgcHJpdmF0ZSBnZXRMb2dFbnRyaWVzKCk6IFByb21pc2U8QXJyYXk8SUdpdExvZ0VudHJ5Pj5cbiAgICB7XG4gICAgICAgIHJldHVybiBzcGF3bihcImdpdFwiLCBbXCJsb2dcIl0sIHRoaXMuX2Rpci50b1N0cmluZygpKVxuICAgICAgICAuY2xvc2VQcm9taXNlXG4gICAgICAgIC50aGVuKChzdGRvdXQpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IGVudHJpZXM6IEFycmF5PElHaXRMb2dFbnRyeT4gPSBbXTtcbiAgICAgICAgICAgIGxldCBtYXRjaDogUmVnRXhwRXhlY0FycmF5IHwgbnVsbDtcbiAgICAgICAgICAgIHdoaWxlICgobWF0Y2ggPSBHSVRfTE9HX0VOVFJZX1JFR0VYLmV4ZWMoc3Rkb3V0KSkgIT09IG51bGwpIC8vIHRzbGludDpkaXNhYmxlLWxpbmVcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBlbnRyaWVzLnB1c2goXG4gICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbW1pdEhhc2g6IG1hdGNoWzFdLFxuICAgICAgICAgICAgICAgICAgICAgICAgYXV0aG9yOiAgICAgbWF0Y2hbMl0sXG4gICAgICAgICAgICAgICAgICAgICAgICB0aW1lc3RhbXA6ICBuZXcgRGF0ZShtYXRjaFszXSksXG4gICAgICAgICAgICAgICAgICAgICAgICBtZXNzYWdlOiAgICBvdXRkZW50KHRyaW1CbGFua0xpbmVzKG1hdGNoWzRdKSlcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIEdpdCBsb2cgbGlzdHMgdGhlIG1vc3QgcmVjZW50IGVudHJ5IGZpcnN0LiAgUmV2ZXJzZSB0aGUgYXJyYXkgc29cbiAgICAgICAgICAgIC8vIHRoYXQgdGhlIG1vc3QgcmVjZW50IGVudHJ5IGlzIHRoZSBsYXN0LlxuICAgICAgICAgICAgXy5yZXZlcnNlKGVudHJpZXMpO1xuICAgICAgICAgICAgcmV0dXJuIGVudHJpZXM7XG4gICAgICAgIH0pO1xuICAgIH1cblxuXG59XG5cbi8vIFRPRE86IFRoZSBmb2xsb3dpbmcgd2lsbCBsaXN0IGFsbCB0YWdzIHBvaW50aW5nIHRvIHRoZSBzcGVjaWZpZWQgY29tbWl0LlxuLy8gZ2l0IHRhZyAtLXBvaW50cy1hdCAzNGI4YmZmXG4iXX0=
