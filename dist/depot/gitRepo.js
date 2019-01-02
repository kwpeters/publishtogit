"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
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

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9kZXBvdC9naXRSZXBvLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEseUNBQXNDO0FBQ3RDLCtCQUE0QjtBQUM1QixpQ0FBOEI7QUFDOUIseUNBQXNDO0FBQ3RDLDBCQUE0QjtBQUM1QixpREFBd0Q7QUFDeEQsNkJBQTBCO0FBQzFCLDJDQUFpRDtBQUVqRCwyQ0FBd0M7QUFDeEMsb0NBQXNDO0FBYXRDLEVBQUU7QUFDRix3Q0FBd0M7QUFDeEMsd0JBQXdCO0FBQ3hCLG1CQUFtQjtBQUNuQiw2QkFBNkI7QUFDN0IsZ0dBQWdHO0FBQ2hHLEVBQUU7QUFDRixJQUFNLG1CQUFtQixHQUFHLHdHQUF3RyxDQUFDO0FBRXJJOzs7OztHQUtHO0FBQ0gsc0JBQTZCLEdBQWM7SUFFdkMsT0FBTyxTQUFTLENBQUMsR0FBRyxDQUFDO1FBQ2pCLEdBQUcsQ0FBQyxNQUFNLEVBQUU7UUFDWixJQUFJLHFCQUFTLENBQUMsR0FBRyxFQUFFLE1BQU0sQ0FBQyxDQUFDLE1BQU0sRUFBRSxDQUFFLDBDQUEwQztLQUNsRixDQUFDO1NBQ0QsSUFBSSxDQUFDLFVBQUMsRUFBeUI7WUFBeEIsaUJBQVMsRUFBRSxvQkFBWTtRQUMzQixPQUFPLE9BQU8sQ0FBQyxTQUFTLElBQUksWUFBWSxDQUFDLENBQUM7SUFDOUMsQ0FBQyxDQUFDLENBQUM7QUFDUCxDQUFDO0FBVEQsb0NBU0M7QUFHRDtJQTRFSSxZQUFZO0lBR1o7Ozs7O09BS0c7SUFDSCxpQkFBb0IsR0FBYztRQUU5QixJQUFJLENBQUMsSUFBSSxHQUFHLEdBQUcsQ0FBQztJQUNwQixDQUFDO0lBckZEOzs7OztPQUtHO0lBQ1cscUJBQWEsR0FBM0IsVUFBNEIsR0FBYztRQUV0QyxPQUFPLFlBQVksQ0FBQyxHQUFHLENBQUM7YUFDdkIsSUFBSSxDQUFDLFVBQUMsU0FBUztZQUNaLElBQUksU0FBUyxFQUFFO2dCQUNYLE9BQU8sSUFBSSxPQUFPLENBQUMsR0FBRyxDQUFDLENBQUM7YUFDM0I7aUJBRUQ7Z0JB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Z2l0UmVwby5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7RGlyZWN0b3J5fSBmcm9tIFwiLi9kaXJlY3RvcnlcIjtcbmltcG9ydCB7RmlsZX0gZnJvbSBcIi4vZmlsZVwiO1xuaW1wb3J0IHtzcGF3bn0gZnJvbSBcIi4vc3Bhd25cIjtcbmltcG9ydCB7R2l0QnJhbmNofSBmcm9tIFwiLi9naXRCcmFuY2hcIjtcbmltcG9ydCAqIGFzIF8gZnJvbSBcImxvZGFzaFwiO1xuaW1wb3J0IHtvdXRkZW50LCB0cmltQmxhbmtMaW5lc30gZnJvbSBcIi4vc3RyaW5nSGVscGVyc1wiO1xuaW1wb3J0IHtVcmx9IGZyb20gXCIuL3VybFwiO1xuaW1wb3J0IHtnaXRVcmxUb1Byb2plY3ROYW1lfSBmcm9tIFwiLi9naXRIZWxwZXJzXCI7XG5pbXBvcnQge0lQYWNrYWdlSnNvbn0gZnJvbSBcIi4vbm9kZVBhY2thZ2VcIjtcbmltcG9ydCB7Q29tbWl0SGFzaH0gZnJvbSBcIi4vY29tbWl0SGFzaFwiO1xuaW1wb3J0ICogYXMgQkJQcm9taXNlIGZyb20gXCJibHVlYmlyZFwiO1xuXG5cbmludGVyZmFjZSBJR2l0TG9nRW50cnlcbntcbiAgICAvLyBUT0RPOiBDaGFuZ2UgdGhlIGZvbGxvd2luZyB0byBhbiBpbnN0YW5jZSBvZiBDb21taXRIYXNoLlxuICAgIGNvbW1pdEhhc2g6IHN0cmluZztcbiAgICBhdXRob3I6IHN0cmluZztcbiAgICB0aW1lc3RhbXA6IERhdGU7XG4gICAgbWVzc2FnZTogc3RyaW5nO1xufVxuXG5cbi8vXG4vLyBBIHJlZ2V4IGZvciBwYXJzaW5nIFwiZ2l0IGxvZ1wiIG91dHB1dC5cbi8vIG1hdGNoWzFdOiBjb21taXQgaGFzaFxuLy8gbWF0Y2hbMl06IGF1dGhvclxuLy8gbWF0Y2hbM106IGNvbW1pdCB0aW1lc3RhbXBcbi8vIG1hdGNoWzRdOiBjb21taXQgbWVzc2FnZSAoYSBzZXF1ZW5jZSBvZiBsaW5lcyB0aGF0IGFyZSBlaXRoZXIgYmxhbmsgb3Igc3RhcnQgd2l0aCB3aGl0ZXNwYWNlKVxuLy9cbmNvbnN0IEdJVF9MT0dfRU5UUllfUkVHRVggPSAvY29tbWl0XFxzKihbMC05YS1mXSspLio/JFxcc15BdXRob3I6XFxzKiguKj8pJFxcc15EYXRlOlxccyooLio/KSRcXHMoKD86KD86XlxccyokXFxuPyl8KD86XlxccysoPzouKikkXFxzPykpKykvZ207XG5cbi8qKlxuICogRGV0ZXJtaW5lcyB3aGV0aGVyIGRpciBpcyBhIGRpcmVjdG9yeSBjb250YWluaW5nIGEgR2l0IHJlcG9zaXRvcnkuXG4gKiBAcGFyYW0gZGlyIC0gVGhlIGRpcmVjdG9yeSB0byBpbnNwZWN0XG4gKiBAcmV0dXJuIEEgcHJvbWlzZSBmb3IgYSBib29sZWFuIGluZGljYXRpbmcgd2hldGhlciBkaXIgY29udGFpbnMgYSBHaXRcbiAqIHJlcG9zaXRvcnkuICBUaGlzIHByb21pc2Ugd2lsbCBuZXZlciByZWplY3QuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBpc0dpdFJlcG9EaXIoZGlyOiBEaXJlY3RvcnkpOiBQcm9taXNlPGJvb2xlYW4+IHtcblxuICAgIHJldHVybiBCQlByb21pc2UuYWxsKFtcbiAgICAgICAgZGlyLmV4aXN0cygpLCAgICAgICAgICAgICAgICAgICAgICAgIC8vIFRoZSBkaXJlY3RvcnkgZXhpc3RzXG4gICAgICAgIG5ldyBEaXJlY3RvcnkoZGlyLCBcIi5naXRcIikuZXhpc3RzKCkgIC8vIFRoZSBkaXJlY3RvcnkgY29udGFpbnMgYSAuZ2l0IGRpcmVjdG9yeVxuICAgIF0pXG4gICAgLnRoZW4oKFtkaXJFeGlzdHMsIGRvdEdpdEV4aXN0c10pID0+IHtcbiAgICAgICAgcmV0dXJuIEJvb2xlYW4oZGlyRXhpc3RzICYmIGRvdEdpdEV4aXN0cyk7XG4gICAgfSk7XG59XG5cblxuZXhwb3J0IGNsYXNzIEdpdFJlcG9cbntcblxuICAgIC8qKlxuICAgICAqIENyZWF0ZXMgYSBuZXcgR2l0UmVwbyBpbnN0YW5jZSwgcG9pbnRpbmcgaXQgYXQgYSBkaXJlY3RvcnkgY29udGFpbmluZyB0aGVcbiAgICAgKiB3cmFwcGVkIHJlcG8uXG4gICAgICogQHBhcmFtIGRpciAtIFRoZSBkaXJlY3RvcnkgY29udGFpbmluZyB0aGUgcmVwb1xuICAgICAqIEByZXR1cm4gQSBQcm9taXNlIGZvciB0aGUgR2l0UmVwby5cbiAgICAgKi9cbiAgICBwdWJsaWMgc3RhdGljIGZyb21EaXJlY3RvcnkoZGlyOiBEaXJlY3RvcnkpOiBQcm9taXNlPEdpdFJlcG8+XG4gICAge1xuICAgICAgICByZXR1cm4gaXNHaXRSZXBvRGlyKGRpcilcbiAgICAgICAgLnRoZW4oKGlzR2l0UmVwbykgPT4ge1xuICAgICAgICAgICAgaWYgKGlzR2l0UmVwbykge1xuICAgICAgICAgICAgICAgIHJldHVybiBuZXcgR2l0UmVwbyhkaXIpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIlBhdGggZG9lcyBub3QgZXhpc3Qgb3IgaXMgbm90IGEgR2l0IHJlcG8uXCIpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9XG5cblxuICAgIC8qKlxuICAgICAqIENsb25lcyBhIEdpdCByZXBvIGF0IHRoZSBzcGVjaWZpZWQgbG9jYXRpb24uXG4gICAgICogQHBhcmFtIHNyYyAtIFRoZSBzb3VyY2UgdG8gY2xvbmUgdGhlIHJlcG8gZnJvbVxuICAgICAqIEBwYXJhbSBwYXJlbnREaXIgLSBUaGUgcGFyZW50IGRpcmVjdG9yeSB3aGVyZSB0aGUgcmVwbyB3aWxsIGJlIHBsYWNlZC5cbiAgICAgKiBUaGUgcmVwbyB3aWxsIGJlIGNsb25lZCBpbnRvIGEgc3ViZGlyZWN0b3J5IG5hbWVkIGFmdGVyIHRoZSBwcm9qZWN0LlxuICAgICAqIEByZXR1cm4gQSBwcm9taXNlIGZvciB0aGUgY2xvbmVkIEdpdCByZXBvLlxuICAgICAqL1xuICAgIHB1YmxpYyBzdGF0aWMgY2xvbmUoc3JjOiBVcmwgfCBEaXJlY3RvcnksIHBhcmVudERpcjogRGlyZWN0b3J5KTogUHJvbWlzZTxHaXRSZXBvPlxuICAgIHtcbiAgICAgICAgbGV0IHByb2pOYW1lOiBzdHJpbmc7XG4gICAgICAgIGxldCBzcmNTdHI6IHN0cmluZztcblxuICAgICAgICBpZiAoc3JjIGluc3RhbmNlb2YgVXJsKVxuICAgICAgICB7XG4gICAgICAgICAgICBwcm9qTmFtZSA9IGdpdFVybFRvUHJvamVjdE5hbWUoc3JjLnRvU3RyaW5nKCkpO1xuICAgICAgICAgICAgY29uc3QgcHJvdG9jb2xzID0gc3JjLmdldFByb3RvY29scygpO1xuICAgICAgICAgICAgc3JjU3RyID0gcHJvdG9jb2xzLmxlbmd0aCA8IDIgP1xuICAgICAgICAgICAgICAgIHNyYy50b1N0cmluZygpIDpcbiAgICAgICAgICAgICAgICBzcmMucmVwbGFjZVByb3RvY29sKFwiaHR0cHNcIikudG9TdHJpbmcoKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlXG4gICAgICAgIHtcbiAgICAgICAgICAgIHByb2pOYW1lID0gc3JjLmRpck5hbWU7XG4gICAgICAgICAgICBzcmNTdHIgPSBzcmMudG9TdHJpbmcoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IHJlcG9EaXIgPSBuZXcgRGlyZWN0b3J5KHBhcmVudERpciwgcHJvak5hbWUpO1xuXG4gICAgICAgIHJldHVybiBwYXJlbnREaXIuZXhpc3RzKClcbiAgICAgICAgLnRoZW4oKHBhcmVudERpckV4aXN0cykgPT4ge1xuICAgICAgICAgICAgaWYgKCFwYXJlbnREaXJFeGlzdHMpXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGAke3BhcmVudERpcn0gaXMgbm90IGEgZGlyZWN0b3J5LmApO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KVxuICAgICAgICAudGhlbigoKSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gc3Bhd24oXG4gICAgICAgICAgICAgICAgXCJnaXRcIixcbiAgICAgICAgICAgICAgICBbXCJjbG9uZVwiLCBzcmNTdHIsIHByb2pOYW1lXSxcbiAgICAgICAgICAgICAgICBwYXJlbnREaXIudG9TdHJpbmcoKSlcbiAgICAgICAgICAgIC5jbG9zZVByb21pc2U7XG4gICAgICAgIH0pXG4gICAgICAgIC50aGVuKCgpID0+IHtcbiAgICAgICAgICAgIHJldHVybiBuZXcgR2l0UmVwbyhyZXBvRGlyKTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG5cbiAgICAvLyByZWdpb24gUHJpdmF0ZSBEYXRhIE1lbWJlcnNcbiAgICBwcml2YXRlIHJlYWRvbmx5IF9kaXI6IERpcmVjdG9yeTtcbiAgICBwcml2YXRlIF9icmFuY2hlczogQXJyYXk8R2l0QnJhbmNoPiB8IHVuZGVmaW5lZDtcbiAgICBwcml2YXRlIF9sb2c6IEFycmF5PElHaXRMb2dFbnRyeT4gfCB1bmRlZmluZWQ7XG4gICAgLy8gZW5kcmVnaW9uXG5cblxuICAgIC8qKlxuICAgICAqIENvbnN0cnVjdHMgYSBuZXcgR2l0UmVwby4gIFByaXZhdGUgaW4gb3JkZXIgdG8gcHJvdmlkZSBlcnJvciBjaGVja2luZy5cbiAgICAgKiBTZWUgc3RhdGljIG1ldGhvZHMuXG4gICAgICpcbiAgICAgKiBAcGFyYW0gZGlyIC0gVGhlIGRpcmVjdG9yeSBjb250YWluaW5nIHRoZSBHaXQgcmVwby5cbiAgICAgKi9cbiAgICBwcml2YXRlIGNvbnN0cnVjdG9yKGRpcjogRGlyZWN0b3J5KVxuICAgIHtcbiAgICAgICAgdGhpcy5fZGlyID0gZGlyO1xuICAgIH1cblxuXG4gICAgLyoqXG4gICAgICogR2V0cyB0aGUgZGlyZWN0b3J5IGNvbnRhaW5pbmcgdGhpcyBHaXQgcmVwby5cbiAgICAgKiBAcmV0dXJuIFRoZSBkaXJlY3RvcnkgY29udGFpbmluZyB0aGlzIGdpdCByZXBvLlxuICAgICAqL1xuICAgIHB1YmxpYyBnZXQgZGlyZWN0b3J5KCk6IERpcmVjdG9yeVxuICAgIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2RpcjtcbiAgICB9XG5cblxuICAgIC8qKlxuICAgICAqIERldGVybWluZXMgd2hldGhlciB0aGlzIEdpdFJlcG8gaXMgZXF1YWwgdG8gYW5vdGhlciBHaXRSZXBvLiAgVHdvXG4gICAgICogaW5zdGFuY2VzIGFyZSBjb25zaWRlcmVkIGVxdWFsIGlmIHRoZXkgcG9pbnQgdG8gdGhlIHNhbWUgZGlyZWN0b3J5LlxuICAgICAqIEBtZXRob2RcbiAgICAgKiBAcGFyYW0gb3RoZXIgLSBUaGUgb3RoZXIgR2l0UmVwbyB0byBjb21wYXJlIHdpdGhcbiAgICAgKiBAcmV0dXJuIFdoZXRoZXIgdGhlIHR3byBHaXRSZXBvIGluc3RhbmNlcyBhcmUgZXF1YWxcbiAgICAgKi9cbiAgICBwdWJsaWMgZXF1YWxzKG90aGVyOiBHaXRSZXBvKTogYm9vbGVhblxuICAgIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2Rpci5lcXVhbHMob3RoZXIuX2Rpcik7XG4gICAgfVxuXG5cbiAgICAvKipcbiAgICAgKiBHZXRzIHRoZSBmaWxlcyB0aGF0IGFyZSB1bmRlciBHaXQgdmVyc2lvbiBjb250cm9sLlxuICAgICAqIEByZXR1cm4gQSBQcm9taXNlIGZvciBhbiBhcnJheSBvZiBmaWxlcyB1bmRlciBHaXQgdmVyc2lvbiBjb250cm9sLlxuICAgICAqL1xuICAgIHB1YmxpYyBmaWxlcygpOiBQcm9taXNlPEFycmF5PEZpbGU+PlxuICAgIHtcbiAgICAgICAgcmV0dXJuIHNwYXduKFwiZ2l0XCIsIFtcImxzLWZpbGVzXCJdLCB0aGlzLl9kaXIudG9TdHJpbmcoKSlcbiAgICAgICAgLmNsb3NlUHJvbWlzZVxuICAgICAgICAudGhlbigoc3Rkb3V0KSA9PiB7XG4gICAgICAgICAgICBjb25zdCByZWxhdGl2ZUZpbGVQYXRocyA9IHN0ZG91dC5zcGxpdChcIlxcblwiKTtcbiAgICAgICAgICAgIHJldHVybiBfLm1hcChyZWxhdGl2ZUZpbGVQYXRocywgKGN1clJlbEZpbGVQYXRoKSA9PiB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIG5ldyBGaWxlKHRoaXMuX2RpciwgY3VyUmVsRmlsZVBhdGgpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuXG4gICAgLy8gVE9ETzogV3JpdGUgdW5pdCB0ZXN0cyBmb3IgdGhpcyBtZXRob2QgYW5kIG1ha2Ugc3VyZSB0aGUgZmlsZXMgaGF2ZSB0aGVcbiAgICAvLyBjb3JyZWN0IHByZWNlZGluZyBwYXRoLlxuICAgIHB1YmxpYyBtb2RpZmllZEZpbGVzKCk6IFByb21pc2U8QXJyYXk8RmlsZT4+XG4gICAge1xuICAgICAgICByZXR1cm4gc3Bhd24oXCJnaXRcIiwgW1wibHMtZmlsZXNcIiwgXCItbVwiXSwgdGhpcy5fZGlyLnRvU3RyaW5nKCkpXG4gICAgICAgIC5jbG9zZVByb21pc2VcbiAgICAgICAgLnRoZW4oKHN0ZG91dCkgPT4ge1xuICAgICAgICAgICAgaWYgKHN0ZG91dCA9PT0gXCJcIilcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gW107XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjb25zdCByZWxhdGl2ZUZpbGVQYXRocyA9IHN0ZG91dC5zcGxpdChcIlxcblwiKTtcbiAgICAgICAgICAgIHJldHVybiBfLm1hcChyZWxhdGl2ZUZpbGVQYXRocywgKGN1clJlbGF0aXZlRmlsZVBhdGgpID0+IHtcbiAgICAgICAgICAgICAgICByZXR1cm4gbmV3IEZpbGUodGhpcy5fZGlyLCBjdXJSZWxhdGl2ZUZpbGVQYXRoKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICB9XG5cblxuICAgIC8vIFRPRE86IFdyaXRlIHVuaXQgdGVzdHMgZm9yIHRoaXMgbWV0aG9kIGFuZCBtYWtlIHN1cmUgdGhlIGZpbGVzIGhhdmUgdGhlXG4gICAgLy8gY29ycmVjdCBwcmVjZWRpbmcgcGF0aC5cbiAgICBwdWJsaWMgdW50cmFja2VkRmlsZXMoKTogUHJvbWlzZTxBcnJheTxGaWxlPj5cbiAgICB7XG4gICAgICAgIHJldHVybiBzcGF3bihcImdpdFwiLCBbXCJscy1maWxlc1wiLCAgXCItLW90aGVyc1wiLCAgXCItLWV4Y2x1ZGUtc3RhbmRhcmRcIl0sIHRoaXMuX2Rpci50b1N0cmluZygpKVxuICAgICAgICAuY2xvc2VQcm9taXNlXG4gICAgICAgIC50aGVuKChzdGRvdXQpID0+IHtcbiAgICAgICAgICAgIGlmIChzdGRvdXQgPT09IFwiXCIpXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIFtdO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY29uc3QgcmVsYXRpdmVGaWxlUGF0aHMgPSBzdGRvdXQuc3BsaXQoXCJcXG5cIik7XG4gICAgICAgICAgICByZXR1cm4gXy5tYXAocmVsYXRpdmVGaWxlUGF0aHMsIChjdXJSZWxhdGl2ZVBhdGgpID0+IHtcbiAgICAgICAgICAgICAgICByZXR1cm4gbmV3IEZpbGUodGhpcy5fZGlyLCBjdXJSZWxhdGl2ZVBhdGgpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuXG4gICAgLy8gVE9ETzogV3JpdGUgdW5pdCB0ZXN0cyBmb3IgdGhpcyBtZXRob2QuICBNYWtlIHN1cmUgdGhlcmUgaXMgbm8gbGVhZGluZyBvciB0cmFpbGluZyB3aGl0ZXNwYWNlLlxuICAgIHB1YmxpYyBjdXJyZW50Q29tbWl0SGFzaCgpOiBQcm9taXNlPENvbW1pdEhhc2g+XG4gICAge1xuICAgICAgICByZXR1cm4gc3Bhd24oXCJnaXRcIiwgW1wicmV2LXBhcnNlXCIsIFwiLS12ZXJpZnlcIiwgXCJIRUFEXCJdLCB0aGlzLl9kaXIudG9TdHJpbmcoKSlcbiAgICAgICAgLmNsb3NlUHJvbWlzZVxuICAgICAgICAudGhlbigoc3Rkb3V0KSA9PiB7XG4gICAgICAgICAgICBjb25zdCBoYXNoID0gQ29tbWl0SGFzaC5mcm9tU3RyaW5nKHN0ZG91dCk7XG4gICAgICAgICAgICBpZiAoIWhhc2gpXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiRmFpbGVkIHRvIGNvbnN0cnVjdCBDb21taXRIYXNoLlwiKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBoYXNoO1xuICAgICAgICB9KTtcbiAgICB9XG5cblxuICAgIC8qKlxuICAgICAqIEdldCB0aGUgcmVtb3RlcyBjb25maWd1cmVkIGZvciB0aGUgR2l0IHJlcG8uXG4gICAgICogQHJldHVybiBBIFByb21pc2UgZm9yIGFuIG9iamVjdCB3aGVyZSB0aGUgcmVtb3RlIG5hbWVzIGFyZSB0aGUga2V5cyBhbmRcbiAgICAgKiB0aGUgcmVtb3RlIFVSTCBpcyB0aGUgdmFsdWUuXG4gICAgICovXG4gICAgcHVibGljIHJlbW90ZXMoKTogUHJvbWlzZTx7W25hbWU6IHN0cmluZ106IHN0cmluZ30+XG4gICAge1xuICAgICAgICByZXR1cm4gc3Bhd24oXCJnaXRcIiwgW1wicmVtb3RlXCIsIFwiLXZ2XCJdLCB0aGlzLl9kaXIudG9TdHJpbmcoKSlcbiAgICAgICAgLmNsb3NlUHJvbWlzZVxuICAgICAgICAudGhlbigoc3Rkb3V0KSA9PiB7XG5cbiAgICAgICAgICAgIGNvbnN0IGxpbmVzID0gc3Rkb3V0LnNwbGl0KFwiXFxuXCIpO1xuICAgICAgICAgICAgY29uc3QgcmVtb3Rlczoge1tuYW1lOiBzdHJpbmddOiBzdHJpbmd9ID0ge307XG4gICAgICAgICAgICBsaW5lcy5mb3JFYWNoKChjdXJMaW5lKSA9PiB7XG4gICAgICAgICAgICAgICAgY29uc3QgbWF0Y2ggPSBjdXJMaW5lLm1hdGNoKC9eKFxcdyspXFxzKyguKilcXHMrXFwoXFx3K1xcKSQvKTtcbiAgICAgICAgICAgICAgICBpZiAobWF0Y2gpXG4gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICByZW1vdGVzW21hdGNoWzFdXSA9IG1hdGNoWzJdO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICByZXR1cm4gcmVtb3RlcztcbiAgICAgICAgfSk7XG4gICAgfVxuXG5cbiAgICAvKipcbiAgICAgKiBHZXRzIHRoZSBuYW1lIG9mIHRoaXMgR2l0IHJlcG9zaXRvcnkuICBJZiB0aGUgcmVwbyBoYXMgYSByZW1vdGUsIHRoZSBuYW1lXG4gICAgICogaXMgdGFrZW4gZnJvbSB0aGUgbGFzdCBwYXJ0IG9mIHRoZSByZW1vdGUncyBVUkwuICBPdGhlcndpc2UsIHRoZSBuYW1lXG4gICAgICogd2lsbCBiZSB0YWtlbiBmcm9tIHRoZSBcIm5hbWVcIiBwcm9wZXJ0eSBpbiBwYWNrYWdlLmpzb24uICBPdGhlcndpc2UsIHRoZVxuICAgICAqIG5hbWUgd2lsbCBiZSB0aGUgbmFtZSBvZiB0aGUgZm9sZGVyIHRoZSByZXBvIGlzIGluLlxuICAgICAqIEByZXR1cm4gQSBQcm9taXNlIGZvciB0aGUgbmFtZSBvZiB0aGlzIHJlcG9zaXRvcnkuXG4gICAgICovXG4gICAgcHVibGljIG5hbWUoKTogUHJvbWlzZTxzdHJpbmc+XG4gICAge1xuICAgICAgICByZXR1cm4gdGhpcy5yZW1vdGVzKClcbiAgICAgICAgLnRoZW4oKHJlbW90ZXMpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IHJlbW90ZU5hbWVzID0gT2JqZWN0LmtleXMocmVtb3Rlcyk7XG4gICAgICAgICAgICBpZiAocmVtb3RlTmFtZXMubGVuZ3RoID4gMClcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBjb25zdCByZW1vdGVVcmwgPSByZW1vdGVzW3JlbW90ZU5hbWVzWzBdXTtcbiAgICAgICAgICAgICAgICByZXR1cm4gZ2l0VXJsVG9Qcm9qZWN0TmFtZShyZW1vdGVVcmwpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KVxuICAgICAgICAudGhlbigocHJvak5hbWUpID0+IHtcbiAgICAgICAgICAgIGlmIChwcm9qTmFtZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBwcm9qTmFtZTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gTG9vayBmb3IgdGhlIHByb2plY3QgbmFtZSBpbiBwYWNrYWdlLmpzb24uXG4gICAgICAgICAgICBjb25zdCBwYWNrYWdlSnNvbiA9IG5ldyBGaWxlKHRoaXMuX2RpciwgXCJwYWNrYWdlLmpzb25cIikucmVhZEpzb25TeW5jPElQYWNrYWdlSnNvbj4oKTtcbiAgICAgICAgICAgIGlmIChwYWNrYWdlSnNvbikge1xuICAgICAgICAgICAgICAgIHJldHVybiBwYWNrYWdlSnNvbi5uYW1lO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KVxuICAgICAgICAudGhlbigocHJvak5hbWUpID0+IHtcbiAgICAgICAgICAgIGlmIChwcm9qTmFtZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBwcm9qTmFtZTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgY29uc3QgZGlyTmFtZSA9IHRoaXMuX2Rpci5kaXJOYW1lO1xuICAgICAgICAgICAgaWYgKGRpck5hbWUgPT09IFwiL1wiKVxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIlVuYWJsZSB0byBkZXRlcm1pbmUgR2l0IHJlcG8gbmFtZS5cIik7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiBkaXJOYW1lO1xuICAgICAgICB9KTtcbiAgICB9XG5cblxuICAgIHB1YmxpYyB0YWdzKCk6IFByb21pc2U8QXJyYXk8c3RyaW5nPj5cbiAgICB7XG4gICAgICAgIHJldHVybiBzcGF3bihcImdpdFwiLCBbXCJ0YWdcIl0sIHRoaXMuX2Rpci50b1N0cmluZygpKVxuICAgICAgICAuY2xvc2VQcm9taXNlXG4gICAgICAgIC50aGVuKChzdGRvdXQpID0+IHtcbiAgICAgICAgICAgIGlmIChzdGRvdXQubGVuZ3RoID09PSAwKVxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIHJldHVybiBbXTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIHN0ZG91dC5zcGxpdChcIlxcblwiKTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG5cbiAgICBwdWJsaWMgaGFzVGFnKHRhZ05hbWU6IHN0cmluZyk6IFByb21pc2U8Ym9vbGVhbj5cbiAgICB7XG4gICAgICAgIHJldHVybiB0aGlzLnRhZ3MoKVxuICAgICAgICAudGhlbigodGFncykgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIHRhZ3MuaW5kZXhPZih0YWdOYW1lKSA+PSAwO1xuICAgICAgICB9KTtcbiAgICB9XG5cblxuICAgIHB1YmxpYyBjcmVhdGVUYWcodGFnTmFtZTogc3RyaW5nLCBtZXNzYWdlOiBzdHJpbmcgPSBcIlwiLCBmb3JjZTogYm9vbGVhbiA9IGZhbHNlKTogUHJvbWlzZTxHaXRSZXBvPlxuICAgIHtcbiAgICAgICAgbGV0IGFyZ3MgPSBbXCJ0YWdcIl07XG5cbiAgICAgICAgaWYgKGZvcmNlKSB7XG4gICAgICAgICAgICBhcmdzLnB1c2goXCItZlwiKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGFyZ3MgPSBfLmNvbmNhdChhcmdzLCBcIi1hXCIsIHRhZ05hbWUpO1xuICAgICAgICBhcmdzID0gXy5jb25jYXQoYXJncywgXCItbVwiLCBtZXNzYWdlKTtcblxuICAgICAgICByZXR1cm4gc3Bhd24oXCJnaXRcIiwgYXJncywgdGhpcy5fZGlyLnRvU3RyaW5nKCkpXG4gICAgICAgIC5jbG9zZVByb21pc2VcbiAgICAgICAgLnRoZW4oKCkgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICAgIH0pO1xuICAgIH1cblxuXG4gICAgcHVibGljIGRlbGV0ZVRhZyh0YWdOYW1lOiBzdHJpbmcpOiBQcm9taXNlPEdpdFJlcG8+XG4gICAge1xuICAgICAgICByZXR1cm4gc3Bhd24oXCJnaXRcIiwgW1widGFnXCIsIFwiLS1kZWxldGVcIiwgdGFnTmFtZV0sIHRoaXMuX2Rpci50b1N0cmluZygpKVxuICAgICAgICAuY2xvc2VQcm9taXNlXG4gICAgICAgIC5jYXRjaCgoZXJyKSA9PiB7XG4gICAgICAgICAgICBpZiAoZXJyLnN0ZGVyci5pbmNsdWRlcyhcIm5vdCBmb3VuZFwiKSlcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAvLyBUaGUgc3BlY2lmaWVkIHRhZyBuYW1lIHdhcyBub3QgZm91bmQuICBXZSBhcmUgc3RpbGxcbiAgICAgICAgICAgICAgICAvLyBzdWNjZXNzZnVsLlxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIHRocm93IGVycjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSlcbiAgICAgICAgLnRoZW4oKCkgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICAgIH0pO1xuICAgIH1cblxuXG4gICAgcHVibGljIHB1c2hUYWcodGFnTmFtZTogc3RyaW5nLCByZW1vdGVOYW1lOiBzdHJpbmcsIGZvcmNlOiBib29sZWFuID0gZmFsc2UpOiBQcm9taXNlPEdpdFJlcG8+XG4gICAge1xuICAgICAgICBsZXQgYXJncyA9IFtcInB1c2hcIl07XG5cbiAgICAgICAgaWYgKGZvcmNlKSB7XG4gICAgICAgICAgICBhcmdzLnB1c2goXCItLWZvcmNlXCIpO1xuICAgICAgICB9XG5cbiAgICAgICAgYXJncyA9IF8uY29uY2F0KGFyZ3MsIHJlbW90ZU5hbWUsIHRhZ05hbWUpO1xuXG4gICAgICAgIHJldHVybiBzcGF3bihcImdpdFwiLCBhcmdzLCB0aGlzLl9kaXIudG9TdHJpbmcoKSlcbiAgICAgICAgLmNsb3NlUHJvbWlzZVxuICAgICAgICAudGhlbigoKSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgICAgfSk7XG4gICAgfVxuXG5cbiAgICBwdWJsaWMgZ2V0QnJhbmNoZXMoZm9yY2VVcGRhdGU6IGJvb2xlYW4gPSBmYWxzZSk6IFByb21pc2U8QXJyYXk8R2l0QnJhbmNoPj5cbiAgICB7XG4gICAgICAgIGlmIChmb3JjZVVwZGF0ZSlcbiAgICAgICAge1xuICAgICAgICAgICAgLy8gSW52YWxpZGF0ZSB0aGUgY2FjaGUuICBJZiB0aGlzIHVwZGF0ZSBmYWlscywgc3Vic2VxdWVudCByZXF1ZXN0c1xuICAgICAgICAgICAgLy8gd2lsbCBoYXZlIHRvIHVwZGF0ZSB0aGUgY2FjaGUuXG4gICAgICAgICAgICB0aGlzLl9icmFuY2hlcyA9IHVuZGVmaW5lZDtcbiAgICAgICAgfVxuXG4gICAgICAgIGxldCB1cGRhdGVQcm9taXNlOiBQcm9taXNlPHZvaWQ+O1xuXG4gICAgICAgIGlmICh0aGlzLl9icmFuY2hlcyA9PT0gdW5kZWZpbmVkKVxuICAgICAgICB7XG4gICAgICAgICAgICAvLyBUaGUgaW50ZXJuYWwgY2FjaGUgb2YgYnJhbmNoZXMgbmVlZHMgdG8gYmUgdXBkYXRlZC5cbiAgICAgICAgICAgIHVwZGF0ZVByb21pc2UgPSBHaXRCcmFuY2guZW51bWVyYXRlR2l0UmVwb0JyYW5jaGVzKHRoaXMpXG4gICAgICAgICAgICAudGhlbigoYnJhbmNoZXM6IEFycmF5PEdpdEJyYW5jaD4pID0+IHtcbiAgICAgICAgICAgICAgICB0aGlzLl9icmFuY2hlcyA9IGJyYW5jaGVzO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZVxuICAgICAgICB7XG4gICAgICAgICAgICAvLyBUaGUgaW50ZXJuYWwgY2FjaGUgZG9lcyBub3QgbmVlZCB0byBiZSB1cGRhdGVkLlxuICAgICAgICAgICAgdXBkYXRlUHJvbWlzZSA9IEJCUHJvbWlzZS5yZXNvbHZlKCk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gdXBkYXRlUHJvbWlzZVxuICAgICAgICAudGhlbigoKSA9PiB7XG4gICAgICAgICAgICAvLyBTaW5jZSB1cGRhdGVQcm9taXNlIHJlc29sdmVkLCB3ZSBrbm93IHRoYXQgdGhpcy5fYnJhbmNoZXMgaGFzIGJlZW5cbiAgICAgICAgICAgIC8vIHNldC5cbiAgICAgICAgICAgIHJldHVybiB0aGlzLl9icmFuY2hlcyE7XG4gICAgICAgIH0pO1xuICAgIH1cblxuXG4gICAgcHVibGljIGdldEN1cnJlbnRCcmFuY2goKTogUHJvbWlzZTxHaXRCcmFuY2ggfCB1bmRlZmluZWQ+XG4gICAge1xuICAgICAgICAvLyBXaGVuIG9uIG1hc3RlcjpcbiAgICAgICAgLy8gZ2l0IHN5bWJvbGljLXJlZiBIRUFEXG4gICAgICAgIC8vIHJlZnMvaGVhZHMvbWFzdGVyXG5cbiAgICAgICAgLy8gV2hlbiBpbiBkZXRhY2hlZCBoZWFkIHN0YXRlOlxuICAgICAgICAvLyBnaXQgc3ltYm9saWMtcmVmIEhFQURcbiAgICAgICAgLy8gZmF0YWw6IHJlZiBIRUFEIGlzIG5vdCBhIHN5bWJvbGljIHJlZlxuXG4gICAgICAgIC8vIFRoZSBiZWxvdyBjb21tYW5kIHdoZW4gaW4gZGV0YWNoZWQgSEVBRCBzdGF0ZVxuICAgICAgICAvLyAkIGdpdCByZXYtcGFyc2UgLS1hYmJyZXYtcmVmIEhFQURcbiAgICAgICAgLy8gSEVBRFxuXG4gICAgICAgIHJldHVybiBzcGF3bihcImdpdFwiLCBbXCJyZXYtcGFyc2VcIiwgXCItLWFiYnJldi1yZWZcIiwgXCJIRUFEXCJdLCB0aGlzLl9kaXIudG9TdHJpbmcoKSkuY2xvc2VQcm9taXNlXG4gICAgICAgIC50aGVuKChicmFuY2hOYW1lKSA9PiB7XG4gICAgICAgICAgICBpZiAoYnJhbmNoTmFtZSA9PT0gXCJIRUFEXCIpIHtcbiAgICAgICAgICAgICAgICAvLyBUaGUgcmVwbyBpcyBpbiBkZXRhY2hlZCBoZWFkIHN0YXRlLlxuICAgICAgICAgICAgICAgIHJldHVybiBCQlByb21pc2UucmVzb2x2ZSh1bmRlZmluZWQpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIEdpdEJyYW5jaC5jcmVhdGUodGhpcywgYnJhbmNoTmFtZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH1cblxuXG4gICAgcHVibGljIGNoZWNrb3V0QnJhbmNoKGJyYW5jaDogR2l0QnJhbmNoLCBjcmVhdGVJZk5vbmV4aXN0ZW50OiBib29sZWFuKTogUHJvbWlzZTx2b2lkPlxuICAgIHtcblxuICAgICAgICByZXR1cm4gdGhpcy5nZXRCcmFuY2hlcygpXG4gICAgICAgIC50aGVuKChhbGxCcmFuY2hlcykgPT4ge1xuICAgICAgICAgICAgLy8gSWYgdGhlcmUgaXMgYSBicmFuY2ggd2l0aCB0aGUgc2FtZSBuYW1lLCB3ZSBzaG91bGQgbm90IHRyeSB0b1xuICAgICAgICAgICAgLy8gY3JlYXRlIGl0LiAgSW5zdGVhZCwgd2Ugc2hvdWxkIGp1c3QgY2hlY2sgaXQgb3V0LlxuICAgICAgICAgICAgaWYgKF8uc29tZShhbGxCcmFuY2hlcywge25hbWU6IGJyYW5jaC5uYW1lfSkpXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgY3JlYXRlSWZOb25leGlzdGVudCA9IGZhbHNlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KVxuICAgICAgICAudGhlbigoKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBhcmdzID0gW1xuICAgICAgICAgICAgICAgIFwiY2hlY2tvdXRcIixcbiAgICAgICAgICAgICAgICAuLi4oY3JlYXRlSWZOb25leGlzdGVudCA/IFtcIi1iXCJdIDogW10pLFxuICAgICAgICAgICAgICAgIGJyYW5jaC5uYW1lXG4gICAgICAgICAgICBdO1xuXG4gICAgICAgICAgICByZXR1cm4gc3Bhd24oXCJnaXRcIiwgYXJncywgdGhpcy5fZGlyLnRvU3RyaW5nKCkpLmNsb3NlUHJvbWlzZTtcbiAgICAgICAgfSlcbiAgICAgICAgLnRoZW4oKCkgPT4ge30pO1xuICAgIH1cblxuXG4gICAgcHVibGljIGNoZWNrb3V0Q29tbWl0KGNvbW1pdDogQ29tbWl0SGFzaCk6IFByb21pc2U8dm9pZD5cbiAgICB7XG4gICAgICAgIHJldHVybiBzcGF3bihcImdpdFwiLCBbXCJjaGVja291dFwiLCBjb21taXQudG9TdHJpbmcoKV0sIHRoaXMuX2Rpci50b1N0cmluZygpKS5jbG9zZVByb21pc2VcbiAgICAgICAgLnRoZW4oKCkgPT4ge30pO1xuICAgIH1cblxuXG4gICAgcHVibGljIHN0YWdlQWxsKCk6IFByb21pc2U8R2l0UmVwbz5cbiAgICB7XG4gICAgICAgIHJldHVybiBzcGF3bihcImdpdFwiLCBbXCJhZGRcIiwgXCIuXCJdLCB0aGlzLl9kaXIudG9TdHJpbmcoKSlcbiAgICAgICAgLmNsb3NlUHJvbWlzZVxuICAgICAgICAudGhlbigoKSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgICAgfSk7XG4gICAgfVxuXG5cbiAgICBwdWJsaWMgcHVzaEN1cnJlbnRCcmFuY2gocmVtb3RlTmFtZTogc3RyaW5nID0gXCJvcmlnaW5cIiwgc2V0VXBzdHJlYW06IGJvb2xlYW4gPSBmYWxzZSk6IFByb21pc2U8dm9pZD5cbiAgICB7XG4gICAgICAgIHJldHVybiB0aGlzLmdldEN1cnJlbnRCcmFuY2goKVxuICAgICAgICAudGhlbigoY3VyQnJhbmNoKSA9PiB7XG4gICAgICAgICAgICBpZiAoIWN1ckJyYW5jaClcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJUaGVyZSBpcyBubyBjdXJyZW50IGJyYW5jaCB0byBwdXNoLlwiKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgY29uc3QgYXJncyA9IFtcbiAgICAgICAgICAgICAgICBcInB1c2hcIixcbiAgICAgICAgICAgICAgICAuLi4oc2V0VXBzdHJlYW0gPyBbXCItdVwiXSA6IFtdKSxcbiAgICAgICAgICAgICAgICByZW1vdGVOYW1lLFxuICAgICAgICAgICAgICAgIGN1ckJyYW5jaC5uYW1lXG4gICAgICAgICAgICBdO1xuICAgICAgICAgICAgcmV0dXJuIHNwYXduKFwiZ2l0XCIsIGFyZ3MsIHRoaXMuX2Rpci50b1N0cmluZygpKS5jbG9zZVByb21pc2U7XG4gICAgICAgIH0pXG4gICAgICAgIC50aGVuKCgpID0+IHtcbiAgICAgICAgfSlcbiAgICAgICAgLmNhdGNoKChlcnIpID0+IHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGBFcnJvciBwdXNoaW5nIGN1cnJlbnQgYnJhbmNoOiAke0pTT04uc3RyaW5naWZ5KGVycil9YCk7XG4gICAgICAgICAgICB0aHJvdyBlcnI7XG4gICAgICAgIH0pO1xuICAgIH1cblxuXG4gICAgLy8gVE9ETzogV3JpdGUgdW5pdCB0ZXN0cyBmb3IgdGhlIGZvbGxvd2luZyBtZXRob2QuXG4gICAgcHVibGljIGdldENvbW1pdERlbHRhcyh0cmFja2luZ1JlbW90ZTogc3RyaW5nID0gXCJvcmlnaW5cIik6IFByb21pc2U8e2FoZWFkOiBudW1iZXIsIGJlaGluZDogbnVtYmVyfT5cbiAgICB7XG4gICAgICAgIHJldHVybiB0aGlzLmdldEN1cnJlbnRCcmFuY2goKVxuICAgICAgICAudGhlbigoYnJhbmNoKSA9PiB7XG4gICAgICAgICAgICBpZiAoIWJyYW5jaClcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJDYW5ub3QgZ2V0TnVtQ29tbWl0c0FoZWFkKCkgd2hlbiBIRUFEIGlzIG5vdCBvbiBhIGJyYW5jaC5cIik7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIFRoZSBuYW1lcyBvZiB0aGUgdHdvIGJyYW5jaGVzIGluIHF1ZXN0aW9uLlxuICAgICAgICAgICAgY29uc3QgdGhpc0JyYW5jaE5hbWUgPSBicmFuY2gubmFtZTtcbiAgICAgICAgICAgIGNvbnN0IHRyYWNraW5nQnJhbmNoTmFtZSA9IGAke3RyYWNraW5nUmVtb3RlfS8ke3RoaXNCcmFuY2hOYW1lfWA7XG5cbiAgICAgICAgICAgIGNvbnN0IG51bUFoZWFkUHJvbWlzZSA9IHNwYXduKFxuICAgICAgICAgICAgICAgIFwiZ2l0XCIsXG4gICAgICAgICAgICAgICAgW1wicmV2LWxpc3RcIiwgdGhpc0JyYW5jaE5hbWUsIFwiLS1ub3RcIiwgdHJhY2tpbmdCcmFuY2hOYW1lLCBcIi0tY291bnRcIl0sXG4gICAgICAgICAgICAgICAgdGhpcy5fZGlyLnRvU3RyaW5nKClcbiAgICAgICAgICAgICkuY2xvc2VQcm9taXNlO1xuXG4gICAgICAgICAgICBjb25zdCBudW1CZWhpbmRQcm9taXNlID0gc3Bhd24oXG4gICAgICAgICAgICAgICAgXCJnaXRcIixcbiAgICAgICAgICAgICAgICBbXCJyZXYtbGlzdFwiLCB0cmFja2luZ0JyYW5jaE5hbWUsIFwiLS1ub3RcIiwgdGhpc0JyYW5jaE5hbWUsIFwiLS1jb3VudFwiXSxcbiAgICAgICAgICAgICAgICB0aGlzLl9kaXIudG9TdHJpbmcoKVxuICAgICAgICAgICAgKS5jbG9zZVByb21pc2U7XG5cbiAgICAgICAgICAgIHJldHVybiBCQlByb21pc2UuYWxsKFtudW1BaGVhZFByb21pc2UsIG51bUJlaGluZFByb21pc2VdKTtcbiAgICAgICAgfSlcbiAgICAgICAgLnRoZW4oKHJlc3VsdHMpID0+IHtcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgYWhlYWQ6IHBhcnNlSW50KHJlc3VsdHNbMF0sIDEwKSxcbiAgICAgICAgICAgICAgICBiZWhpbmQ6IHBhcnNlSW50KHJlc3VsdHNbMV0sIDEwKVxuICAgICAgICAgICAgfTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG5cbiAgICAvLyBUT0RPOiBUbyBnZXQgdGhlIHN0YWdlZCBmaWxlczpcbiAgICAvLyBnaXQgZGlmZiAtLW5hbWUtb25seSAtLWNhY2hlZFxuXG5cbiAgICAvLyBUT0RPOiBBZGQgdW5pdCB0ZXN0cyBmb3IgdGhpcyBtZXRob2QuXG4gICAgcHVibGljIGNvbW1pdChtc2c6IHN0cmluZyA9IFwiXCIpOiBQcm9taXNlPElHaXRMb2dFbnRyeT5cbiAgICB7XG4gICAgICAgIHJldHVybiBzcGF3bihcImdpdFwiLCBbXCJjb21taXRcIiwgXCItbVwiLCBtc2ddLCB0aGlzLl9kaXIudG9TdHJpbmcoKSlcbiAgICAgICAgLmNsb3NlUHJvbWlzZVxuICAgICAgICAudGhlbigoKSA9PiB7XG4gICAgICAgICAgICAvLyBHZXQgdGhlIGNvbW1pdCBoYXNoXG4gICAgICAgICAgICByZXR1cm4gc3Bhd24oXCJnaXRcIiwgW1wicmV2LXBhcnNlXCIsIFwiSEVBRFwiXSwgdGhpcy5fZGlyLnRvU3RyaW5nKCkpLmNsb3NlUHJvbWlzZTtcbiAgICAgICAgfSlcbiAgICAgICAgLnRoZW4oKHN0ZG91dCkgPT4ge1xuICAgICAgICAgICAgY29uc3QgY29tbWl0SGFzaCA9IF8udHJpbShzdGRvdXQpO1xuICAgICAgICAgICAgcmV0dXJuIHNwYXduKFwiZ2l0XCIsIFtcInNob3dcIiwgY29tbWl0SGFzaF0sIHRoaXMuX2Rpci50b1N0cmluZygpKS5jbG9zZVByb21pc2U7XG4gICAgICAgIH0pXG4gICAgICAgIC50aGVuKChzdGRvdXQpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IG1hdGNoID0gR0lUX0xPR19FTlRSWV9SRUdFWC5leGVjKHN0ZG91dCk7XG4gICAgICAgICAgICBpZiAoIW1hdGNoKVxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgQ291bGQgbm90IHBhcnNlIFwiZ2l0IHNob3dcIiBvdXRwdXQ6XFxuJHtzdGRvdXR9YCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIGNvbW1pdEhhc2g6IG1hdGNoWzFdLFxuICAgICAgICAgICAgICAgIGF1dGhvcjogICAgIG1hdGNoWzJdLFxuICAgICAgICAgICAgICAgIHRpbWVzdGFtcDogIG5ldyBEYXRlKG1hdGNoWzNdKSxcbiAgICAgICAgICAgICAgICBtZXNzYWdlOiAgICBvdXRkZW50KHRyaW1CbGFua0xpbmVzKG1hdGNoWzRdKSlcbiAgICAgICAgICAgIH07XG4gICAgICAgIH0pO1xuICAgIH1cblxuXG4gICAgcHVibGljIGdldExvZyhmb3JjZVVwZGF0ZT86IGJvb2xlYW4pOiBQcm9taXNlPEFycmF5PElHaXRMb2dFbnRyeT4+XG4gICAge1xuICAgICAgICBpZiAoZm9yY2VVcGRhdGUpXG4gICAgICAgIHtcbiAgICAgICAgICAgIHRoaXMuX2xvZyA9IHVuZGVmaW5lZDtcbiAgICAgICAgfVxuXG4gICAgICAgIGxldCB1cGRhdGVQcm9taXNlOiBQcm9taXNlPHZvaWQ+O1xuXG4gICAgICAgIGlmICh0aGlzLl9sb2cgPT09IHVuZGVmaW5lZClcbiAgICAgICAge1xuICAgICAgICAgICAgdXBkYXRlUHJvbWlzZSA9IHRoaXMuZ2V0TG9nRW50cmllcygpXG4gICAgICAgICAgICAudGhlbigobG9nOiBBcnJheTxJR2l0TG9nRW50cnk+KSA9PiB7XG4gICAgICAgICAgICAgICAgdGhpcy5fbG9nID0gbG9nO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZVxuICAgICAgICB7XG4gICAgICAgICAgICB1cGRhdGVQcm9taXNlID0gQkJQcm9taXNlLnJlc29sdmUoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB1cGRhdGVQcm9taXNlXG4gICAgICAgIC50aGVuKCgpID0+IHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl9sb2chO1xuICAgICAgICB9KTtcbiAgICB9XG5cblxuICAgIC8qKlxuICAgICAqIEhlbHBlciBtZXRob2QgdGhhdCByZXRyaWV2ZXMgR2l0IGxvZyBlbnRyaWVzXG4gICAgICogQHByaXZhdGVcbiAgICAgKiBAbWV0aG9kXG4gICAgICogQHJldHVybiBBIHByb21pc2UgZm9yIGFuIGFycmF5IG9mIHN0cnVjdHVyZXMgZGVzY3JpYmluZyBlYWNoIGNvbW1pdC5cbiAgICAgKi9cbiAgICBwcml2YXRlIGdldExvZ0VudHJpZXMoKTogUHJvbWlzZTxBcnJheTxJR2l0TG9nRW50cnk+PlxuICAgIHtcbiAgICAgICAgcmV0dXJuIHNwYXduKFwiZ2l0XCIsIFtcImxvZ1wiXSwgdGhpcy5fZGlyLnRvU3RyaW5nKCkpXG4gICAgICAgIC5jbG9zZVByb21pc2VcbiAgICAgICAgLnRoZW4oKHN0ZG91dCkgPT4ge1xuICAgICAgICAgICAgY29uc3QgZW50cmllczogQXJyYXk8SUdpdExvZ0VudHJ5PiA9IFtdO1xuICAgICAgICAgICAgbGV0IG1hdGNoOiBSZWdFeHBFeGVjQXJyYXkgfCBudWxsO1xuICAgICAgICAgICAgd2hpbGUgKChtYXRjaCA9IEdJVF9MT0dfRU5UUllfUkVHRVguZXhlYyhzdGRvdXQpKSAhPT0gbnVsbCkgLy8gdHNsaW50OmRpc2FibGUtbGluZVxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIGVudHJpZXMucHVzaChcbiAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29tbWl0SGFzaDogbWF0Y2hbMV0sXG4gICAgICAgICAgICAgICAgICAgICAgICBhdXRob3I6ICAgICBtYXRjaFsyXSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHRpbWVzdGFtcDogIG5ldyBEYXRlKG1hdGNoWzNdKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIG1lc3NhZ2U6ICAgIG91dGRlbnQodHJpbUJsYW5rTGluZXMobWF0Y2hbNF0pKVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gR2l0IGxvZyBsaXN0cyB0aGUgbW9zdCByZWNlbnQgZW50cnkgZmlyc3QuICBSZXZlcnNlIHRoZSBhcnJheSBzb1xuICAgICAgICAgICAgLy8gdGhhdCB0aGUgbW9zdCByZWNlbnQgZW50cnkgaXMgdGhlIGxhc3QuXG4gICAgICAgICAgICBfLnJldmVyc2UoZW50cmllcyk7XG4gICAgICAgICAgICByZXR1cm4gZW50cmllcztcbiAgICAgICAgfSk7XG4gICAgfVxuXG5cbn1cblxuLy8gVE9ETzogVGhlIGZvbGxvd2luZyB3aWxsIGxpc3QgYWxsIHRhZ3MgcG9pbnRpbmcgdG8gdGhlIHNwZWNpZmllZCBjb21taXQuXG4vLyBnaXQgdGFnIC0tcG9pbnRzLWF0IDM0YjhiZmZcbiJdfQ==
