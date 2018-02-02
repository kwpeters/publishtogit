"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var fs = require("fs");
var path = require("path");
var _ = require("lodash");
var file_1 = require("./file");
var promiseHelpers_1 = require("./promiseHelpers");
var pathHelpers_1 = require("./pathHelpers");
var unlinkAsync = promiseHelpers_1.promisify1(fs.unlink);
var rmdirAsync = promiseHelpers_1.promisify1(fs.rmdir);
var readdirAsync = promiseHelpers_1.promisify1(fs.readdir);
var mkdirAsync = promiseHelpers_1.promisify1(fs.mkdir);
var statAsync = promiseHelpers_1.promisify1(fs.stat);
var Directory = (function () {
    //endregion
    function Directory(pathPart) {
        var pathParts = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            pathParts[_i - 1] = arguments[_i];
        }
        var allParts = [pathPart].concat(pathParts);
        this._dirPath = pathHelpers_1.reducePathParts(allParts);
        // Remove trailing directory separator characters.
        while (this._dirPath.endsWith(path.sep)) {
            this._dirPath = this._dirPath.slice(0, -1);
        }
    }
    Object.defineProperty(Directory.prototype, "dirName", {
        /**
         * Gets the name of this directory (without the preceding path)
         */
        get: function () {
            if (this._dirPath.length === 0) {
                // This directory represents the root of the filesystem.
                return "/";
            }
            else {
                return _.last(this._dirPath.split(path.sep));
            }
        },
        enumerable: true,
        configurable: true
    });
    Directory.prototype.toString = function () {
        return this._dirPath;
    };
    Directory.prototype.equals = function (otherDir) {
        return this.absPath() === otherDir.absPath();
    };
    Directory.prototype.absPath = function () {
        return path.resolve(this._dirPath);
    };
    Directory.prototype.exists = function () {
        var _this = this;
        return new Promise(function (resolve) {
            fs.stat(_this._dirPath, function (err, stats) {
                if (!err && stats.isDirectory()) {
                    resolve(stats);
                }
                else {
                    resolve(undefined);
                }
            });
        });
    };
    Directory.prototype.existsSync = function () {
        try {
            var stats = fs.statSync(this._dirPath);
            return stats.isDirectory() ? stats : undefined;
        }
        catch (err) {
            if (err.code === "ENOENT") {
                return undefined;
            }
            else {
                throw err;
            }
        }
    };
    Directory.prototype.isEmpty = function () {
        return readdirAsync(this._dirPath)
            .then(function (fsEntries) {
            return fsEntries.length === 0;
        });
    };
    Directory.prototype.isEmptySync = function () {
        var fsEntries = fs.readdirSync(this._dirPath);
        return fsEntries.length === 0;
    };
    Directory.prototype.ensureExists = function () {
        var _this = this;
        return this.exists()
            .then(function (stats) {
            if (stats) {
                return;
            }
            else {
                var parts = _this._dirPath.split(path.sep);
                // Create an array of successively longer paths, each one adding a
                // new directory onto the end.
                var dirsToCreate = parts.reduce(function (acc, curPart) {
                    if (acc.length === 0) {
                        if (curPart.length === 0) {
                            // The first item is an empty string.  The path must
                            // have started with the directory separator character
                            // (an absolute path was specified).
                            acc.push(path.sep);
                        }
                        else {
                            // The first item contains text.  A relative path must
                            // have been specified.
                            acc.push(curPart);
                        }
                    }
                    else {
                        var last = acc[acc.length - 1];
                        acc.push(path.join(last, curPart));
                    }
                    return acc;
                }, []);
                // Don't attempt to create the root of the filesystem.
                if ((dirsToCreate.length > 0) && (dirsToCreate[0] === path.sep)) {
                    dirsToCreate.shift();
                }
                // Map each successively longer path to a function that will create
                // it.
                var createFuncs = dirsToCreate.map(function (dirToCreate) {
                    return function () {
                        return mkdirAsync(dirToCreate)
                            .catch(function (err) {
                            // If the directory already exists, just keep going.
                            if (err.code !== "EEXIST") {
                                throw err;
                            }
                        });
                    };
                });
                // Execute the directory creation functions in sequence.
                return promiseHelpers_1.sequence(createFuncs, undefined);
            }
        });
    };
    Directory.prototype.ensureExistsSync = function () {
        if (this.existsSync()) {
            return;
        }
        var parts = this._dirPath.split(path.sep);
        // Create an array of successively longer paths, each one adding a
        // new directory onto the end.
        var dirsToCreate = parts.reduce(function (acc, curPart) {
            if (acc.length === 0) {
                if (curPart.length === 0) {
                    // The first item is an empty string.  The path must
                    // have started with the directory separator character
                    // (an absolute path was specified).
                    acc.push(path.sep);
                }
                else {
                    // The first item contains text.  A relative path must
                    // have been specified.
                    acc.push(curPart);
                }
            }
            else {
                var last = acc[acc.length - 1];
                acc.push(path.join(last, curPart));
            }
            return acc;
        }, []);
        // Don't attempt to create the root of the filesystem.
        if ((dirsToCreate.length > 0) && (dirsToCreate[0] === path.sep)) {
            dirsToCreate.shift();
        }
        dirsToCreate.forEach(function (curDir) {
            try {
                fs.mkdirSync(curDir);
            }
            catch (err) {
                // If the directory already exists, just keep going.
                if (err.code !== "EEXIST") {
                    throw err;
                }
            }
        });
    };
    Directory.prototype.empty = function () {
        var _this = this;
        return this.delete()
            .then(function () {
            return _this.ensureExists();
        });
    };
    Directory.prototype.emptySync = function () {
        this.deleteSync();
        this.ensureExistsSync();
    };
    Directory.prototype.delete = function () {
        var _this = this;
        return this.exists()
            .then(function (stats) {
            if (!stats) {
                // The specified directory does not exist.  Do nothing.
                return;
            }
            else {
                // First, delete the contents of the specified directory.
                return readdirAsync(_this._dirPath)
                    .then(function (items) {
                    var absPaths = items.map(function (curItem) {
                        return path.join(_this._dirPath, curItem);
                    });
                    var deletePromises = absPaths.map(function (curAbsPath) {
                        if (fs.statSync(curAbsPath).isDirectory()) {
                            var subdir = new Directory(curAbsPath);
                            return subdir.delete();
                        }
                        else {
                            return unlinkAsync(curAbsPath);
                        }
                    });
                    return Promise.all(deletePromises);
                })
                    .then(function () {
                    // Now that all of the items in the directory have been deleted, delete
                    // the directory itself.
                    return rmdirAsync(_this._dirPath);
                });
            }
        });
    };
    Directory.prototype.deleteSync = function () {
        var _this = this;
        if (!this.existsSync()) {
            // The directory does not exist.  Do nothing.
            return;
        }
        // First, delete the contents of the specified directory.
        var fsItems = fs.readdirSync(this._dirPath);
        fsItems = fsItems.map(function (curFsItem) {
            return path.join(_this._dirPath, curFsItem);
        });
        fsItems.forEach(function (curFsItem) {
            var stats = fs.statSync(curFsItem);
            if (stats.isDirectory()) {
                var subdir = new Directory(curFsItem);
                subdir.deleteSync();
            }
            else {
                fs.unlinkSync(curFsItem);
            }
        });
        // Now that all of the items in the directory have been deleted, delete the
        // directory itself.
        fs.rmdirSync(this._dirPath);
    };
    /**
     * Reads the contents of this directory.
     * @return The contents of the directory, separated into a list of files and a
     * list of subdirectories.  All paths returned are absolute paths.
     */
    Directory.prototype.contents = function () {
        var thisAbsPath = this.absPath();
        return readdirAsync(this._dirPath)
            .then(function (fsEntries) {
            var absPaths = fsEntries.map(function (curEntry) {
                return path.join(thisAbsPath, curEntry);
            });
            var contents = { subdirs: [], files: [] };
            var promises = absPaths.map(function (curAbsPath) {
                return statAsync(curAbsPath)
                    .then(function (stats) {
                    if (stats.isFile()) {
                        contents.files.push(new file_1.File(curAbsPath));
                    }
                    else if (stats.isDirectory()) {
                        contents.subdirs.push(new Directory(curAbsPath));
                    }
                });
            });
            return Promise.all(promises)
                .then(function () {
                return contents;
            });
        });
    };
    /**
     * Reads the contents of this directory.
     * @return The contents of the directory, separated into a list of files and a
     * list of subdirectories.  All paths returned are absolute paths.
     */
    Directory.prototype.contentsSync = function () {
        var thisAbsPath = this.absPath();
        var fsEntries = fs.readdirSync(this._dirPath);
        fsEntries = fsEntries.map(function (curFsEntry) {
            return path.join(thisAbsPath, curFsEntry);
        });
        var contents = { subdirs: [], files: [] };
        fsEntries.forEach(function (curFsEntry) {
            var stats = fs.statSync(curFsEntry);
            if (stats.isFile()) {
                contents.files.push(new file_1.File(curFsEntry));
            }
            else if (stats.isDirectory()) {
                contents.subdirs.push(new Directory(curFsEntry));
            }
        });
        return contents;
    };
    /**
     * Recursively removes empty subdirectories from within this directory.
     * @return A Promise that is resolved when this directory has been pruned.
     */
    Directory.prototype.prune = function () {
        return this.contents()
            .then(function (contents) {
            var promises = contents.subdirs.map(function (curSubdir) {
                //
                // Prune the current subdirectory.
                //
                return curSubdir.prune()
                    .then(function () {
                    //
                    // If the subdirectory is now empty, delete it.
                    //
                    return curSubdir.isEmpty();
                })
                    .then(function (dirIsEmpty) {
                    if (dirIsEmpty) {
                        return curSubdir.delete();
                    }
                });
            });
            return Promise.all(promises)
                .then(function () {
            });
        });
    };
    /**
     * Recursively removes empty subdirectories from this directory.
     */
    Directory.prototype.pruneSync = function () {
        var contents = this.contentsSync();
        contents.subdirs.forEach(function (curSubdir) {
            curSubdir.pruneSync();
            //
            // If the subdirectory is now empty, delete it.
            //
            if (curSubdir.isEmptySync()) {
                curSubdir.deleteSync();
            }
        });
    };
    Directory.prototype.copy = function (destDir, copyRoot) {
        var _this = this;
        if (copyRoot) {
            // Copying this directory to the destination with copyRoot true just
            // means creating the counterpart to this directory in the
            // destination and then copying to that directory with copyRoot
            // false.
            var thisDest_1 = new Directory(destDir, this.dirName);
            return thisDest_1.ensureExists()
                .then(function () {
                return _this.copy(thisDest_1, false);
            });
        }
        return this.contents()
            .then(function (contents) {
            // Copy the files in this directory to the destination.
            var fileCopyPromises = contents.files.map(function (curFile) {
                return curFile.copy(destDir, curFile.fileName);
            });
            var dirCopyPromises = contents.subdirs.map(function (curSubdir) {
                return curSubdir.copy(destDir, true);
            });
            return Promise.all(_.concat(fileCopyPromises, dirCopyPromises));
        })
            .then(function () {
        });
    };
    Directory.prototype.copySync = function (destDir, copyRoot) {
        if (copyRoot) {
            // Copying this directory to the destination with copyRoot true just
            // means creating the counterpart to this directory in the
            // destination and then copying to that directory with copyRoot
            // false.
            var thisDest = new Directory(destDir, this.dirName);
            thisDest.ensureExistsSync();
            this.copySync(thisDest, false);
            return;
        }
        var contents = this.contentsSync();
        // Copy the files in this directory to the destination.
        contents.files.forEach(function (curFile) {
            curFile.copySync(destDir, curFile.fileName);
        });
        contents.subdirs.forEach(function (curSubdir) {
            curSubdir.copySync(destDir, true);
        });
    };
    return Directory;
}());
exports.Directory = Directory;

//# sourceMappingURL=data:application/json;charset=utf8;base64,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LE9BQWtCLEVBQUUsUUFBaUI7UUFFakQsRUFBRSxDQUFDLENBQUMsUUFBUSxDQUFDLENBQ2IsQ0FBQztZQUNHLG9FQUFvRTtZQUNwRSwwREFBMEQ7WUFDMUQsK0RBQStEO1lBQy9ELFNBQVM7WUFDVCxJQUFNLFFBQVEsR0FBYyxJQUFJLFNBQVMsQ0FBQyxPQUFPLEVBQUUsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1lBQ2pFLFFBQVEsQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDO1lBQzVCLElBQUksQ0FBQyxRQUFRLENBQUMsUUFBUSxFQUFFLEtBQUssQ0FBQyxDQUFDO1lBQy9CLE1BQU0sQ0FBQztRQUNYLENBQUM7UUFFRCxJQUFNLFFBQVEsR0FBRyxJQUFJLENBQUMsWUFBWSxFQUFFLENBQUM7UUFFckMsdURBQXVEO1FBQ3ZELFFBQVEsQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLFVBQUMsT0FBTztZQUMzQixPQUFPLENBQUMsUUFBUSxDQUFDLE9BQU8sRUFBRSxPQUFPLENBQUMsUUFBUSxDQUFDLENBQUM7UUFDaEQsQ0FBQyxDQUFDLENBQUM7UUFFSCxRQUFRLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxVQUFDLFNBQVM7WUFDL0IsU0FBUyxDQUFDLFFBQVEsQ0FBQyxPQUFPLEVBQUUsSUFBSSxDQUFDLENBQUM7UUFDdEMsQ0FBQyxDQUFDLENBQUM7SUFDUCxDQUFDO0lBRUwsZ0JBQUM7QUFBRCxDQTNlQSxBQTJlQyxJQUFBO0FBM2VZLDhCQUFTIiwiZmlsZSI6ImRpcmVjdG9yeS5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCAqIGFzIGZzIGZyb20gXCJmc1wiO1xuaW1wb3J0ICogYXMgcGF0aCBmcm9tIFwicGF0aFwiO1xuaW1wb3J0ICogYXMgXyBmcm9tIFwibG9kYXNoXCI7XG5pbXBvcnQge0ZpbGV9IGZyb20gXCIuL2ZpbGVcIjtcbmltcG9ydCB7cHJvbWlzaWZ5MSwgc2VxdWVuY2V9IGZyb20gXCIuL3Byb21pc2VIZWxwZXJzXCI7XG5pbXBvcnQge1BhdGhQYXJ0LCByZWR1Y2VQYXRoUGFydHN9IGZyb20gXCIuL3BhdGhIZWxwZXJzXCI7XG5cblxuY29uc3QgdW5saW5rQXN5bmMgPSBwcm9taXNpZnkxPHZvaWQsIHN0cmluZz4oZnMudW5saW5rKTtcbmNvbnN0IHJtZGlyQXN5bmMgPSBwcm9taXNpZnkxPHZvaWQsIHN0cmluZz4oZnMucm1kaXIpO1xuY29uc3QgcmVhZGRpckFzeW5jID0gcHJvbWlzaWZ5MTxBcnJheTxzdHJpbmc+LCBzdHJpbmc+KGZzLnJlYWRkaXIpO1xuY29uc3QgbWtkaXJBc3luYyA9IHByb21pc2lmeTE8dm9pZCwgc3RyaW5nPihmcy5ta2Rpcik7XG5jb25zdCBzdGF0QXN5bmMgID0gcHJvbWlzaWZ5MTxmcy5TdGF0cywgc3RyaW5nPihmcy5zdGF0KTtcblxuXG5leHBvcnQgaW50ZXJmYWNlIElEaXJlY3RvcnlDb250ZW50cyB7XG4gICAgc3ViZGlyczogQXJyYXk8RGlyZWN0b3J5PjtcbiAgICBmaWxlczogICBBcnJheTxGaWxlPjtcbn1cblxuXG5leHBvcnQgY2xhc3MgRGlyZWN0b3J5XG57XG4gICAgLy9yZWdpb24gRGF0YSBNZW1iZXJzXG4gICAgcHJpdmF0ZSBfZGlyUGF0aDogc3RyaW5nO1xuICAgIC8vZW5kcmVnaW9uXG5cblxuICAgIHB1YmxpYyBjb25zdHJ1Y3RvcihwYXRoUGFydDogUGF0aFBhcnQsIC4uLnBhdGhQYXJ0czogUGF0aFBhcnRbXSlcbiAgICB7XG4gICAgICAgIGNvbnN0IGFsbFBhcnRzOiBQYXRoUGFydFtdID0gW3BhdGhQYXJ0XS5jb25jYXQocGF0aFBhcnRzKTtcbiAgICAgICAgdGhpcy5fZGlyUGF0aCA9IHJlZHVjZVBhdGhQYXJ0cyhhbGxQYXJ0cyk7XG5cbiAgICAgICAgLy8gUmVtb3ZlIHRyYWlsaW5nIGRpcmVjdG9yeSBzZXBhcmF0b3IgY2hhcmFjdGVycy5cbiAgICAgICAgd2hpbGUgKHRoaXMuX2RpclBhdGguZW5kc1dpdGgocGF0aC5zZXApKSB7XG4gICAgICAgICAgICB0aGlzLl9kaXJQYXRoID0gdGhpcy5fZGlyUGF0aC5zbGljZSgwLCAtMSk7XG4gICAgICAgIH1cbiAgICB9XG5cblxuICAgIC8qKlxuICAgICAqIEdldHMgdGhlIG5hbWUgb2YgdGhpcyBkaXJlY3RvcnkgKHdpdGhvdXQgdGhlIHByZWNlZGluZyBwYXRoKVxuICAgICAqL1xuICAgIHB1YmxpYyBnZXQgZGlyTmFtZSgpOiBzdHJpbmdcbiAgICB7XG4gICAgICAgIGlmICh0aGlzLl9kaXJQYXRoLmxlbmd0aCA9PT0gMClcbiAgICAgICAge1xuICAgICAgICAgICAgLy8gVGhpcyBkaXJlY3RvcnkgcmVwcmVzZW50cyB0aGUgcm9vdCBvZiB0aGUgZmlsZXN5c3RlbS5cbiAgICAgICAgICAgIHJldHVybiBcIi9cIjtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiBfLmxhc3QodGhpcy5fZGlyUGF0aC5zcGxpdChwYXRoLnNlcCkpITtcbiAgICAgICAgfVxuICAgIH1cblxuXG4gICAgcHVibGljIHRvU3RyaW5nKCk6IHN0cmluZ1xuICAgIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2RpclBhdGg7XG4gICAgfVxuXG5cbiAgICBwdWJsaWMgZXF1YWxzKG90aGVyRGlyOiBEaXJlY3RvcnkpOiBib29sZWFuXG4gICAge1xuICAgICAgICByZXR1cm4gdGhpcy5hYnNQYXRoKCkgPT09IG90aGVyRGlyLmFic1BhdGgoKTtcbiAgICB9XG5cblxuICAgIHB1YmxpYyBhYnNQYXRoKCk6IHN0cmluZ1xuICAgIHtcbiAgICAgICAgcmV0dXJuIHBhdGgucmVzb2x2ZSh0aGlzLl9kaXJQYXRoKTtcbiAgICB9XG5cblxuICAgIHB1YmxpYyBleGlzdHMoKTogUHJvbWlzZTxmcy5TdGF0cyB8IHVuZGVmaW5lZD5cbiAgICB7XG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZTxmcy5TdGF0cyB8IHVuZGVmaW5lZD4oKHJlc29sdmU6IChyZXN1bHQ6IGZzLlN0YXRzIHwgdW5kZWZpbmVkKSA9PiB2b2lkKSA9PiB7XG4gICAgICAgICAgICBmcy5zdGF0KHRoaXMuX2RpclBhdGgsIChlcnI6IGFueSwgc3RhdHM6IGZzLlN0YXRzKSA9PiB7XG5cbiAgICAgICAgICAgICAgICBpZiAoIWVyciAmJiBzdGF0cy5pc0RpcmVjdG9yeSgpKVxuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZShzdGF0cyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgIHJlc29sdmUodW5kZWZpbmVkKTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICB9XG5cblxuICAgIHB1YmxpYyBleGlzdHNTeW5jKCk6IGZzLlN0YXRzIHwgdW5kZWZpbmVkXG4gICAge1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgY29uc3Qgc3RhdHMgPSBmcy5zdGF0U3luYyh0aGlzLl9kaXJQYXRoKTtcbiAgICAgICAgICAgIHJldHVybiBzdGF0cy5pc0RpcmVjdG9yeSgpID8gc3RhdHMgOiB1bmRlZmluZWQ7XG4gICAgICAgIH1cbiAgICAgICAgY2F0Y2ggKGVycikge1xuICAgICAgICAgICAgaWYgKGVyci5jb2RlID09PSBcIkVOT0VOVFwiKVxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgdGhyb3cgZXJyO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG5cbiAgICBwdWJsaWMgaXNFbXB0eSgpOiBQcm9taXNlPGJvb2xlYW4+XG4gICAge1xuICAgICAgICByZXR1cm4gcmVhZGRpckFzeW5jKHRoaXMuX2RpclBhdGgpXG4gICAgICAgIC50aGVuKChmc0VudHJpZXMpID0+IHtcbiAgICAgICAgICAgIHJldHVybiBmc0VudHJpZXMubGVuZ3RoID09PSAwO1xuICAgICAgICB9KTtcbiAgICB9XG5cblxuICAgIHB1YmxpYyBpc0VtcHR5U3luYygpOiBib29sZWFuXG4gICAge1xuICAgICAgICBjb25zdCBmc0VudHJpZXMgPSBmcy5yZWFkZGlyU3luYyh0aGlzLl9kaXJQYXRoKTtcbiAgICAgICAgcmV0dXJuIGZzRW50cmllcy5sZW5ndGggPT09IDA7XG4gICAgfVxuXG5cbiAgICBwdWJsaWMgZW5zdXJlRXhpc3RzKCk6IFByb21pc2U8dm9pZD5cbiAgICB7XG4gICAgICAgIHJldHVybiB0aGlzLmV4aXN0cygpXG4gICAgICAgIC50aGVuKChzdGF0cykgPT5cbiAgICAgICAge1xuICAgICAgICAgICAgaWYgKHN0YXRzKVxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBjb25zdCBwYXJ0cyA9IHRoaXMuX2RpclBhdGguc3BsaXQocGF0aC5zZXApO1xuXG4gICAgICAgICAgICAgICAgLy8gQ3JlYXRlIGFuIGFycmF5IG9mIHN1Y2Nlc3NpdmVseSBsb25nZXIgcGF0aHMsIGVhY2ggb25lIGFkZGluZyBhXG4gICAgICAgICAgICAgICAgLy8gbmV3IGRpcmVjdG9yeSBvbnRvIHRoZSBlbmQuXG4gICAgICAgICAgICAgICAgY29uc3QgZGlyc1RvQ3JlYXRlID0gcGFydHMucmVkdWNlKChhY2M6IEFycmF5PHN0cmluZz4sIGN1clBhcnQ6IHN0cmluZyk6IEFycmF5PHN0cmluZz4gPT4ge1xuICAgICAgICAgICAgICAgICAgICBpZiAoYWNjLmxlbmd0aCA9PT0gMClcbiAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGN1clBhcnQubGVuZ3RoID09PSAwKVxuICAgICAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIFRoZSBmaXJzdCBpdGVtIGlzIGFuIGVtcHR5IHN0cmluZy4gIFRoZSBwYXRoIG11c3RcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBoYXZlIHN0YXJ0ZWQgd2l0aCB0aGUgZGlyZWN0b3J5IHNlcGFyYXRvciBjaGFyYWN0ZXJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyAoYW4gYWJzb2x1dGUgcGF0aCB3YXMgc3BlY2lmaWVkKS5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBhY2MucHVzaChwYXRoLnNlcCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gVGhlIGZpcnN0IGl0ZW0gY29udGFpbnMgdGV4dC4gIEEgcmVsYXRpdmUgcGF0aCBtdXN0XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gaGF2ZSBiZWVuIHNwZWNpZmllZC5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBhY2MucHVzaChjdXJQYXJ0KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGxhc3QgPSBhY2NbYWNjLmxlbmd0aCAtIDFdO1xuICAgICAgICAgICAgICAgICAgICAgICAgYWNjLnB1c2gocGF0aC5qb2luKGxhc3QsIGN1clBhcnQpKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gYWNjO1xuICAgICAgICAgICAgICAgIH0sIFtdKTtcblxuICAgICAgICAgICAgICAgIC8vIERvbid0IGF0dGVtcHQgdG8gY3JlYXRlIHRoZSByb290IG9mIHRoZSBmaWxlc3lzdGVtLlxuICAgICAgICAgICAgICAgIGlmICgoZGlyc1RvQ3JlYXRlLmxlbmd0aCA+IDApICYmIChkaXJzVG9DcmVhdGVbMF0gPT09IHBhdGguc2VwKSlcbiAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgIGRpcnNUb0NyZWF0ZS5zaGlmdCgpO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIC8vIE1hcCBlYWNoIHN1Y2Nlc3NpdmVseSBsb25nZXIgcGF0aCB0byBhIGZ1bmN0aW9uIHRoYXQgd2lsbCBjcmVhdGVcbiAgICAgICAgICAgICAgICAvLyBpdC5cbiAgICAgICAgICAgICAgICBjb25zdCBjcmVhdGVGdW5jcyA9IGRpcnNUb0NyZWF0ZS5tYXAoKGRpclRvQ3JlYXRlOiBzdHJpbmcpID0+XG4gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gKCk6IFByb21pc2U8dm9pZD4gPT5cbiAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG1rZGlyQXN5bmMoZGlyVG9DcmVhdGUpXG4gICAgICAgICAgICAgICAgICAgICAgICAuY2F0Y2goKGVycikgPT5cbiAgICAgICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBJZiB0aGUgZGlyZWN0b3J5IGFscmVhZHkgZXhpc3RzLCBqdXN0IGtlZXAgZ29pbmcuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGVyci5jb2RlICE9PSBcIkVFWElTVFwiKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhyb3cgZXJyO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgLy8gRXhlY3V0ZSB0aGUgZGlyZWN0b3J5IGNyZWF0aW9uIGZ1bmN0aW9ucyBpbiBzZXF1ZW5jZS5cbiAgICAgICAgICAgICAgICByZXR1cm4gc2VxdWVuY2UoY3JlYXRlRnVuY3MsIHVuZGVmaW5lZCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH1cblxuXG4gICAgcHVibGljIGVuc3VyZUV4aXN0c1N5bmMoKTogdm9pZFxuICAgIHtcbiAgICAgICAgaWYgKHRoaXMuZXhpc3RzU3luYygpKVxuICAgICAgICB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBwYXJ0cyA9IHRoaXMuX2RpclBhdGguc3BsaXQocGF0aC5zZXApO1xuXG4gICAgICAgIC8vIENyZWF0ZSBhbiBhcnJheSBvZiBzdWNjZXNzaXZlbHkgbG9uZ2VyIHBhdGhzLCBlYWNoIG9uZSBhZGRpbmcgYVxuICAgICAgICAvLyBuZXcgZGlyZWN0b3J5IG9udG8gdGhlIGVuZC5cbiAgICAgICAgY29uc3QgZGlyc1RvQ3JlYXRlID0gcGFydHMucmVkdWNlKChhY2M6IEFycmF5PHN0cmluZz4sIGN1clBhcnQ6IHN0cmluZyk6IEFycmF5PHN0cmluZz4gPT4ge1xuICAgICAgICAgICAgaWYgKGFjYy5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICAgICAgICBpZiAoY3VyUGFydC5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gVGhlIGZpcnN0IGl0ZW0gaXMgYW4gZW1wdHkgc3RyaW5nLiAgVGhlIHBhdGggbXVzdFxuICAgICAgICAgICAgICAgICAgICAvLyBoYXZlIHN0YXJ0ZWQgd2l0aCB0aGUgZGlyZWN0b3J5IHNlcGFyYXRvciBjaGFyYWN0ZXJcbiAgICAgICAgICAgICAgICAgICAgLy8gKGFuIGFic29sdXRlIHBhdGggd2FzIHNwZWNpZmllZCkuXG4gICAgICAgICAgICAgICAgICAgIGFjYy5wdXNoKHBhdGguc2VwKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAvLyBUaGUgZmlyc3QgaXRlbSBjb250YWlucyB0ZXh0LiAgQSByZWxhdGl2ZSBwYXRoIG11c3RcbiAgICAgICAgICAgICAgICAgICAgLy8gaGF2ZSBiZWVuIHNwZWNpZmllZC5cbiAgICAgICAgICAgICAgICAgICAgYWNjLnB1c2goY3VyUGFydCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBjb25zdCBsYXN0ID0gYWNjW2FjYy5sZW5ndGggLSAxXTtcbiAgICAgICAgICAgICAgICBhY2MucHVzaChwYXRoLmpvaW4obGFzdCwgY3VyUGFydCkpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIGFjYztcbiAgICAgICAgfSwgW10pO1xuXG4gICAgICAgIC8vIERvbid0IGF0dGVtcHQgdG8gY3JlYXRlIHRoZSByb290IG9mIHRoZSBmaWxlc3lzdGVtLlxuICAgICAgICBpZiAoKGRpcnNUb0NyZWF0ZS5sZW5ndGggPiAwKSAmJiAoZGlyc1RvQ3JlYXRlWzBdID09PSBwYXRoLnNlcCkpIHtcbiAgICAgICAgICAgIGRpcnNUb0NyZWF0ZS5zaGlmdCgpO1xuICAgICAgICB9XG5cbiAgICAgICAgZGlyc1RvQ3JlYXRlLmZvckVhY2goKGN1ckRpcikgPT4ge1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICBmcy5ta2RpclN5bmMoY3VyRGlyKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNhdGNoIChlcnIpIHtcbiAgICAgICAgICAgICAgICAvLyBJZiB0aGUgZGlyZWN0b3J5IGFscmVhZHkgZXhpc3RzLCBqdXN0IGtlZXAgZ29pbmcuXG4gICAgICAgICAgICAgICAgaWYgKGVyci5jb2RlICE9PSBcIkVFWElTVFwiKSB7XG4gICAgICAgICAgICAgICAgICAgIHRocm93IGVycjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH1cblxuXG4gICAgcHVibGljIGVtcHR5KCk6IFByb21pc2U8dm9pZD5cbiAgICB7XG4gICAgICAgIHJldHVybiB0aGlzLmRlbGV0ZSgpXG4gICAgICAgIC50aGVuKCgpID0+IHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmVuc3VyZUV4aXN0cygpO1xuICAgICAgICB9KTtcbiAgICB9XG5cblxuICAgIHB1YmxpYyBlbXB0eVN5bmMoKTogdm9pZFxuICAgIHtcbiAgICAgICAgdGhpcy5kZWxldGVTeW5jKCk7XG4gICAgICAgIHRoaXMuZW5zdXJlRXhpc3RzU3luYygpO1xuICAgIH1cblxuXG4gICAgcHVibGljIGRlbGV0ZSgpOiBQcm9taXNlPHZvaWQ+XG4gICAge1xuICAgICAgICByZXR1cm4gdGhpcy5leGlzdHMoKVxuICAgICAgICAudGhlbigoc3RhdHMpID0+IHtcbiAgICAgICAgICAgIGlmICghc3RhdHMpXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgLy8gVGhlIHNwZWNpZmllZCBkaXJlY3RvcnkgZG9lcyBub3QgZXhpc3QuICBEbyBub3RoaW5nLlxuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAvLyBGaXJzdCwgZGVsZXRlIHRoZSBjb250ZW50cyBvZiB0aGUgc3BlY2lmaWVkIGRpcmVjdG9yeS5cbiAgICAgICAgICAgICAgICByZXR1cm4gcmVhZGRpckFzeW5jKHRoaXMuX2RpclBhdGgpXG4gICAgICAgICAgICAgICAgLnRoZW4oKGl0ZW1zOiBBcnJheTxzdHJpbmc+KSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGFic1BhdGhzID0gaXRlbXMubWFwKChjdXJJdGVtKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gcGF0aC5qb2luKHRoaXMuX2RpclBhdGgsIGN1ckl0ZW0pO1xuICAgICAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgICAgICBjb25zdCBkZWxldGVQcm9taXNlcyA9IGFic1BhdGhzLm1hcCgoY3VyQWJzUGF0aDogc3RyaW5nKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoZnMuc3RhdFN5bmMoY3VyQWJzUGF0aCkuaXNEaXJlY3RvcnkoKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHN1YmRpciA9IG5ldyBEaXJlY3RvcnkoY3VyQWJzUGF0aCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHN1YmRpci5kZWxldGUoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHVubGlua0FzeW5jKGN1ckFic1BhdGgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gUHJvbWlzZS5hbGwoZGVsZXRlUHJvbWlzZXMpO1xuICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgLnRoZW4oKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAvLyBOb3cgdGhhdCBhbGwgb2YgdGhlIGl0ZW1zIGluIHRoZSBkaXJlY3RvcnkgaGF2ZSBiZWVuIGRlbGV0ZWQsIGRlbGV0ZVxuICAgICAgICAgICAgICAgICAgICAvLyB0aGUgZGlyZWN0b3J5IGl0c2VsZi5cbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHJtZGlyQXN5bmModGhpcy5fZGlyUGF0aCk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH1cblxuXG4gICAgcHVibGljIGRlbGV0ZVN5bmMoKTogdm9pZFxuICAgIHtcbiAgICAgICAgaWYgKCF0aGlzLmV4aXN0c1N5bmMoKSlcbiAgICAgICAge1xuICAgICAgICAgICAgLy8gVGhlIGRpcmVjdG9yeSBkb2VzIG5vdCBleGlzdC4gIERvIG5vdGhpbmcuXG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICAvLyBGaXJzdCwgZGVsZXRlIHRoZSBjb250ZW50cyBvZiB0aGUgc3BlY2lmaWVkIGRpcmVjdG9yeS5cbiAgICAgICAgbGV0IGZzSXRlbXM6IEFycmF5PHN0cmluZz4gPSBmcy5yZWFkZGlyU3luYyh0aGlzLl9kaXJQYXRoKTtcbiAgICAgICAgZnNJdGVtcyA9IGZzSXRlbXMubWFwKChjdXJGc0l0ZW0pID0+IHtcbiAgICAgICAgICAgIHJldHVybiBwYXRoLmpvaW4odGhpcy5fZGlyUGF0aCwgY3VyRnNJdGVtKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgZnNJdGVtcy5mb3JFYWNoKChjdXJGc0l0ZW0pID0+IHtcbiAgICAgICAgICAgIGNvbnN0IHN0YXRzID0gZnMuc3RhdFN5bmMoY3VyRnNJdGVtKTtcbiAgICAgICAgICAgIGlmIChzdGF0cy5pc0RpcmVjdG9yeSgpKSB7XG4gICAgICAgICAgICAgICAgY29uc3Qgc3ViZGlyID0gbmV3IERpcmVjdG9yeShjdXJGc0l0ZW0pO1xuICAgICAgICAgICAgICAgIHN1YmRpci5kZWxldGVTeW5jKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICBmcy51bmxpbmtTeW5jKGN1ckZzSXRlbSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG4gICAgICAgIC8vIE5vdyB0aGF0IGFsbCBvZiB0aGUgaXRlbXMgaW4gdGhlIGRpcmVjdG9yeSBoYXZlIGJlZW4gZGVsZXRlZCwgZGVsZXRlIHRoZVxuICAgICAgICAvLyBkaXJlY3RvcnkgaXRzZWxmLlxuICAgICAgICBmcy5ybWRpclN5bmModGhpcy5fZGlyUGF0aCk7XG4gICAgfVxuXG5cbiAgICAvKipcbiAgICAgKiBSZWFkcyB0aGUgY29udGVudHMgb2YgdGhpcyBkaXJlY3RvcnkuXG4gICAgICogQHJldHVybiBUaGUgY29udGVudHMgb2YgdGhlIGRpcmVjdG9yeSwgc2VwYXJhdGVkIGludG8gYSBsaXN0IG9mIGZpbGVzIGFuZCBhXG4gICAgICogbGlzdCBvZiBzdWJkaXJlY3Rvcmllcy4gIEFsbCBwYXRocyByZXR1cm5lZCBhcmUgYWJzb2x1dGUgcGF0aHMuXG4gICAgICovXG4gICAgcHVibGljIGNvbnRlbnRzKCk6IFByb21pc2U8SURpcmVjdG9yeUNvbnRlbnRzPlxuICAgIHtcbiAgICAgICAgY29uc3QgdGhpc0Fic1BhdGggPSB0aGlzLmFic1BhdGgoKTtcblxuICAgICAgICByZXR1cm4gcmVhZGRpckFzeW5jKHRoaXMuX2RpclBhdGgpXG4gICAgICAgIC50aGVuKChmc0VudHJpZXMpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IGFic1BhdGhzID0gZnNFbnRyaWVzLm1hcCgoY3VyRW50cnkpID0+IHtcbiAgICAgICAgICAgICAgICByZXR1cm4gcGF0aC5qb2luKHRoaXNBYnNQYXRoLCBjdXJFbnRyeSk7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgY29uc3QgY29udGVudHM6IElEaXJlY3RvcnlDb250ZW50cyA9IHtzdWJkaXJzOiBbXSwgZmlsZXM6IFtdfTtcblxuICAgICAgICAgICAgY29uc3QgcHJvbWlzZXMgPSBhYnNQYXRocy5tYXAoKGN1ckFic1BhdGgpID0+IHtcbiAgICAgICAgICAgICAgICByZXR1cm4gc3RhdEFzeW5jKGN1ckFic1BhdGgpXG4gICAgICAgICAgICAgICAgLnRoZW4oKHN0YXRzKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChzdGF0cy5pc0ZpbGUoKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29udGVudHMuZmlsZXMucHVzaChuZXcgRmlsZShjdXJBYnNQYXRoKSk7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoc3RhdHMuaXNEaXJlY3RvcnkoKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29udGVudHMuc3ViZGlycy5wdXNoKG5ldyBEaXJlY3RvcnkoY3VyQWJzUGF0aCkpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgcmV0dXJuIFByb21pc2UuYWxsKHByb21pc2VzKVxuICAgICAgICAgICAgLnRoZW4oKCkgPT4ge1xuICAgICAgICAgICAgICAgIHJldHVybiBjb250ZW50cztcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICB9XG5cblxuICAgIC8qKlxuICAgICAqIFJlYWRzIHRoZSBjb250ZW50cyBvZiB0aGlzIGRpcmVjdG9yeS5cbiAgICAgKiBAcmV0dXJuIFRoZSBjb250ZW50cyBvZiB0aGUgZGlyZWN0b3J5LCBzZXBhcmF0ZWQgaW50byBhIGxpc3Qgb2YgZmlsZXMgYW5kIGFcbiAgICAgKiBsaXN0IG9mIHN1YmRpcmVjdG9yaWVzLiAgQWxsIHBhdGhzIHJldHVybmVkIGFyZSBhYnNvbHV0ZSBwYXRocy5cbiAgICAgKi9cbiAgICBwdWJsaWMgY29udGVudHNTeW5jKCk6IElEaXJlY3RvcnlDb250ZW50c1xuICAgIHtcbiAgICAgICAgY29uc3QgdGhpc0Fic1BhdGggPSB0aGlzLmFic1BhdGgoKTtcbiAgICAgICAgbGV0IGZzRW50cmllcyA9IGZzLnJlYWRkaXJTeW5jKHRoaXMuX2RpclBhdGgpO1xuICAgICAgICBmc0VudHJpZXMgPSBmc0VudHJpZXMubWFwKChjdXJGc0VudHJ5KSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gcGF0aC5qb2luKHRoaXNBYnNQYXRoLCBjdXJGc0VudHJ5KTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgY29uc3QgY29udGVudHM6IElEaXJlY3RvcnlDb250ZW50cyA9IHtzdWJkaXJzOiBbXSwgZmlsZXM6IFtdfTtcbiAgICAgICAgZnNFbnRyaWVzLmZvckVhY2goKGN1ckZzRW50cnkpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IHN0YXRzID0gZnMuc3RhdFN5bmMoY3VyRnNFbnRyeSk7XG4gICAgICAgICAgICBpZiAoc3RhdHMuaXNGaWxlKCkpXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgY29udGVudHMuZmlsZXMucHVzaChuZXcgRmlsZShjdXJGc0VudHJ5KSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmIChzdGF0cy5pc0RpcmVjdG9yeSgpKVxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIGNvbnRlbnRzLnN1YmRpcnMucHVzaChuZXcgRGlyZWN0b3J5KGN1ckZzRW50cnkpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG5cbiAgICAgICAgcmV0dXJuIGNvbnRlbnRzO1xuICAgIH1cblxuXG4gICAgLyoqXG4gICAgICogUmVjdXJzaXZlbHkgcmVtb3ZlcyBlbXB0eSBzdWJkaXJlY3RvcmllcyBmcm9tIHdpdGhpbiB0aGlzIGRpcmVjdG9yeS5cbiAgICAgKiBAcmV0dXJuIEEgUHJvbWlzZSB0aGF0IGlzIHJlc29sdmVkIHdoZW4gdGhpcyBkaXJlY3RvcnkgaGFzIGJlZW4gcHJ1bmVkLlxuICAgICAqL1xuICAgIHB1YmxpYyBwcnVuZSgpOiBQcm9taXNlPHZvaWQ+XG4gICAge1xuICAgICAgICByZXR1cm4gdGhpcy5jb250ZW50cygpXG4gICAgICAgIC50aGVuKChjb250ZW50cykgPT4ge1xuICAgICAgICAgICAgY29uc3QgcHJvbWlzZXMgPSBjb250ZW50cy5zdWJkaXJzLm1hcCgoY3VyU3ViZGlyKSA9PiB7XG4gICAgICAgICAgICAgICAgLy9cbiAgICAgICAgICAgICAgICAvLyBQcnVuZSB0aGUgY3VycmVudCBzdWJkaXJlY3RvcnkuXG4gICAgICAgICAgICAgICAgLy9cbiAgICAgICAgICAgICAgICByZXR1cm4gY3VyU3ViZGlyLnBydW5lKClcbiAgICAgICAgICAgICAgICAudGhlbigoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIC8vXG4gICAgICAgICAgICAgICAgICAgIC8vIElmIHRoZSBzdWJkaXJlY3RvcnkgaXMgbm93IGVtcHR5LCBkZWxldGUgaXQuXG4gICAgICAgICAgICAgICAgICAgIC8vXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBjdXJTdWJkaXIuaXNFbXB0eSgpO1xuICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgLnRoZW4oKGRpcklzRW1wdHkpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGRpcklzRW1wdHkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBjdXJTdWJkaXIuZGVsZXRlKCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICByZXR1cm4gUHJvbWlzZS5hbGwocHJvbWlzZXMpXG4gICAgICAgICAgICAudGhlbigoKSA9PiB7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG5cbiAgICAvKipcbiAgICAgKiBSZWN1cnNpdmVseSByZW1vdmVzIGVtcHR5IHN1YmRpcmVjdG9yaWVzIGZyb20gdGhpcyBkaXJlY3RvcnkuXG4gICAgICovXG4gICAgcHVibGljIHBydW5lU3luYygpOiB2b2lkXG4gICAge1xuICAgICAgICBjb25zdCBjb250ZW50cyA9IHRoaXMuY29udGVudHNTeW5jKCk7XG4gICAgICAgIGNvbnRlbnRzLnN1YmRpcnMuZm9yRWFjaCgoY3VyU3ViZGlyKSA9PiB7XG5cbiAgICAgICAgICAgIGN1clN1YmRpci5wcnVuZVN5bmMoKTtcblxuICAgICAgICAgICAgLy9cbiAgICAgICAgICAgIC8vIElmIHRoZSBzdWJkaXJlY3RvcnkgaXMgbm93IGVtcHR5LCBkZWxldGUgaXQuXG4gICAgICAgICAgICAvL1xuICAgICAgICAgICAgaWYgKGN1clN1YmRpci5pc0VtcHR5U3luYygpKVxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIGN1clN1YmRpci5kZWxldGVTeW5jKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH1cblxuXG4gICAgcHVibGljIGNvcHkoZGVzdERpcjogRGlyZWN0b3J5LCBjb3B5Um9vdDogYm9vbGVhbik6IFByb21pc2U8dm9pZD5cbiAgICB7XG4gICAgICAgIGlmIChjb3B5Um9vdClcbiAgICAgICAge1xuICAgICAgICAgICAgLy8gQ29weWluZyB0aGlzIGRpcmVjdG9yeSB0byB0aGUgZGVzdGluYXRpb24gd2l0aCBjb3B5Um9vdCB0cnVlIGp1c3RcbiAgICAgICAgICAgIC8vIG1lYW5zIGNyZWF0aW5nIHRoZSBjb3VudGVycGFydCB0byB0aGlzIGRpcmVjdG9yeSBpbiB0aGVcbiAgICAgICAgICAgIC8vIGRlc3RpbmF0aW9uIGFuZCB0aGVuIGNvcHlpbmcgdG8gdGhhdCBkaXJlY3Rvcnkgd2l0aCBjb3B5Um9vdFxuICAgICAgICAgICAgLy8gZmFsc2UuXG4gICAgICAgICAgICBjb25zdCB0aGlzRGVzdDogRGlyZWN0b3J5ID0gbmV3IERpcmVjdG9yeShkZXN0RGlyLCB0aGlzLmRpck5hbWUpO1xuICAgICAgICAgICAgcmV0dXJuIHRoaXNEZXN0LmVuc3VyZUV4aXN0cygpXG4gICAgICAgICAgICAudGhlbigoKSA9PiB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuY29weSh0aGlzRGVzdCwgZmFsc2UpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIHJldHVybiB0aGlzLmNvbnRlbnRzKClcbiAgICAgICAgLnRoZW4oKGNvbnRlbnRzOiBJRGlyZWN0b3J5Q29udGVudHMpID0+IHtcbiAgICAgICAgICAgIC8vIENvcHkgdGhlIGZpbGVzIGluIHRoaXMgZGlyZWN0b3J5IHRvIHRoZSBkZXN0aW5hdGlvbi5cbiAgICAgICAgICAgIGNvbnN0IGZpbGVDb3B5UHJvbWlzZXMgPSBjb250ZW50cy5maWxlcy5tYXAoKGN1ckZpbGUpID0+IHtcbiAgICAgICAgICAgICAgICByZXR1cm4gY3VyRmlsZS5jb3B5KGRlc3REaXIsIGN1ckZpbGUuZmlsZU5hbWUpO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIGNvbnN0IGRpckNvcHlQcm9taXNlcyA9IGNvbnRlbnRzLnN1YmRpcnMubWFwKChjdXJTdWJkaXIpID0+IHtcbiAgICAgICAgICAgICAgICByZXR1cm4gY3VyU3ViZGlyLmNvcHkoZGVzdERpciwgdHJ1ZSk7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgcmV0dXJuIFByb21pc2UuYWxsKF8uY29uY2F0PGFueT4oZmlsZUNvcHlQcm9taXNlcywgZGlyQ29weVByb21pc2VzKSk7XG4gICAgICAgIH0pXG4gICAgICAgIC50aGVuKCgpID0+IHtcbiAgICAgICAgfSk7XG4gICAgfVxuXG5cbiAgICBwdWJsaWMgY29weVN5bmMoZGVzdERpcjogRGlyZWN0b3J5LCBjb3B5Um9vdDogYm9vbGVhbik6IHZvaWRcbiAgICB7XG4gICAgICAgIGlmIChjb3B5Um9vdClcbiAgICAgICAge1xuICAgICAgICAgICAgLy8gQ29weWluZyB0aGlzIGRpcmVjdG9yeSB0byB0aGUgZGVzdGluYXRpb24gd2l0aCBjb3B5Um9vdCB0cnVlIGp1c3RcbiAgICAgICAgICAgIC8vIG1lYW5zIGNyZWF0aW5nIHRoZSBjb3VudGVycGFydCB0byB0aGlzIGRpcmVjdG9yeSBpbiB0aGVcbiAgICAgICAgICAgIC8vIGRlc3RpbmF0aW9uIGFuZCB0aGVuIGNvcHlpbmcgdG8gdGhhdCBkaXJlY3Rvcnkgd2l0aCBjb3B5Um9vdFxuICAgICAgICAgICAgLy8gZmFsc2UuXG4gICAgICAgICAgICBjb25zdCB0aGlzRGVzdDogRGlyZWN0b3J5ID0gbmV3IERpcmVjdG9yeShkZXN0RGlyLCB0aGlzLmRpck5hbWUpO1xuICAgICAgICAgICAgdGhpc0Rlc3QuZW5zdXJlRXhpc3RzU3luYygpO1xuICAgICAgICAgICAgdGhpcy5jb3B5U3luYyh0aGlzRGVzdCwgZmFsc2UpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgY29udGVudHMgPSB0aGlzLmNvbnRlbnRzU3luYygpO1xuXG4gICAgICAgIC8vIENvcHkgdGhlIGZpbGVzIGluIHRoaXMgZGlyZWN0b3J5IHRvIHRoZSBkZXN0aW5hdGlvbi5cbiAgICAgICAgY29udGVudHMuZmlsZXMuZm9yRWFjaCgoY3VyRmlsZSkgPT4ge1xuICAgICAgICAgICAgY3VyRmlsZS5jb3B5U3luYyhkZXN0RGlyLCBjdXJGaWxlLmZpbGVOYW1lKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgY29udGVudHMuc3ViZGlycy5mb3JFYWNoKChjdXJTdWJkaXIpID0+IHtcbiAgICAgICAgICAgIGN1clN1YmRpci5jb3B5U3luYyhkZXN0RGlyLCB0cnVlKTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG59XG4iXX0=
