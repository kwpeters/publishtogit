"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var fs = require("fs");
var path = require("path");
var _ = require("lodash");
var BBPromise = require("bluebird");
var file_1 = require("./file");
var promiseHelpers_1 = require("./promiseHelpers");
var pathHelpers_1 = require("./pathHelpers");
var unlinkAsync = promiseHelpers_1.promisify1(fs.unlink);
var rmdirAsync = promiseHelpers_1.promisify1(fs.rmdir);
var readdirAsync = promiseHelpers_1.promisify1(fs.readdir);
var mkdirAsync = promiseHelpers_1.promisify1(fs.mkdir);
var statAsync = promiseHelpers_1.promisify1(fs.stat);
var Directory = /** @class */ (function () {
    // endregion
    function Directory(pathPart) {
        var pathParts = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            pathParts[_i - 1] = arguments[_i];
        }
        var allParts = [pathPart].concat(pathParts);
        this._dirPath = pathHelpers_1.reducePathParts(allParts);
        // Remove trailing directory separator characters.
        while (_.endsWith(this._dirPath, path.sep)) {
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
    /**
     * Gets the absolute path of this Directory.
     * @return The absolute path of this Directory
     */
    Directory.prototype.absPath = function () {
        return path.resolve(this._dirPath);
    };
    /**
     * Makes another Directory instance that is wrapping this Directory's
     * absolute path.
     * @return A new Directory representing this Directory's absolute path.
     */
    Directory.prototype.absolute = function () {
        return new Directory(this.absPath());
    };
    Directory.prototype.exists = function () {
        var _this = this;
        return new BBPromise(function (resolve) {
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
                    return BBPromise.all(deletePromises);
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
        var parentDirPath = this.toString();
        return readdirAsync(this._dirPath)
            .then(function (fsEntries) {
            var absPaths = fsEntries.map(function (curEntry) {
                return path.join(parentDirPath, curEntry);
            });
            var contents = { subdirs: [], files: [] };
            var promises = absPaths.map(function (curPath) {
                return statAsync(curPath)
                    .then(function (stats) {
                    if (stats.isFile()) {
                        contents.files.push(new file_1.File(curPath));
                    }
                    else if (stats.isDirectory()) {
                        contents.subdirs.push(new Directory(curPath));
                    }
                });
            });
            return BBPromise.all(promises)
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
        var parentDirPath = this.toString();
        var fsEntries = fs.readdirSync(this._dirPath);
        fsEntries = fsEntries.map(function (curFsEntry) {
            return path.join(parentDirPath, curFsEntry);
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
     * Enumerates the files in this Directory
     * @param recursive - If true, files in all subdirectories will be returned
     * @return A Promise that is resolved with an array of File objects
     * representing the files in this directory.
     */
    Directory.prototype.files = function (recursive) {
        return this.contents()
            .then(function (contents) {
            var allFiles = contents.files;
            var subdirsPromise = BBPromise.resolve([[]]);
            // If we need to recurse into the subdirectories, then do it.
            if (recursive && contents.subdirs && contents.subdirs.length > 0) {
                var promises = _.map(contents.subdirs, function (curSubdir) {
                    return curSubdir.files(true);
                });
                subdirsPromise = BBPromise.all(promises);
            }
            return subdirsPromise
                .then(function (subdirResults) {
                var subdirFiles = _.flatten(subdirResults);
                allFiles = _.concat(allFiles, subdirFiles);
                return allFiles;
            });
        });
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
            return BBPromise.all(promises)
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
    /**
     * Copies this directory to destDir.
     * @param destDir - The destination directory
     * @param copyRoot - If true, this directory name will be a subdirectory of
     * destDir.  If false, only the contents of this directory will be copied
     * into destDir.
     * @return A promise that is resolved with a Directory object representing
     * the destination directory.  If copyRoot is false, this will be destDir.
     * If copyRoot is true, this will be this Directory's counterpart
     * subdirectory in destDir.
     */
    Directory.prototype.copy = function (destDir, copyRoot) {
        // todo: See if anything would be overwritten.
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
            })
                .then(function () {
                return thisDest_1;
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
            return BBPromise.all(_.concat(fileCopyPromises, dirCopyPromises));
        })
            .then(function () {
            return destDir;
        });
    };
    /**
     * Copies this directory to destDir.
     * @param destDir - The destination directory
     * @param copyRoot - If true, this directory name will be a subdirectory of
     * destDir.  If false, only the contents of this directory will be copied
     * into destDir.
     */
    Directory.prototype.copySync = function (destDir, copyRoot) {
        if (copyRoot) {
            // Copying this directory to the destination with copyRoot true just
            // means creating the counterpart to this directory in the
            // destination and then copying to that directory with copyRoot
            // false.
            var thisDest = new Directory(destDir, this.dirName);
            thisDest.ensureExistsSync();
            this.copySync(thisDest, false);
            return thisDest;
        }
        var contents = this.contentsSync();
        // Copy the files in this directory to the destination.
        contents.files.forEach(function (curFile) {
            curFile.copySync(destDir, curFile.fileName);
        });
        contents.subdirs.forEach(function (curSubdir) {
            curSubdir.copySync(destDir, true);
        });
        return destDir;
    };
    /**
     * Moves this Directory or the contents of this Directory to destDir.
     * @param destDir - The destination directory
     * @param moveRoot - If true, this directory name will be a subdirectory of
     * destDir.  If false, only the contents of this directory will be copied
     * into destDir.
     * @return A promise that is resolved with a Directory object representing
     * the destination directory.  If moveRoot is false, this will be destDir.
     * If moveRoot is true, this will be this Directory's counterpart
     * subdirectory in destDir.
     */
    Directory.prototype.move = function (destDir, moveRoot) {
        var _this = this;
        return destDir.ensureExists()
            .then(function () {
            return _this.copy(destDir, moveRoot);
        })
            .then(function (counterpartDestDir) {
            return _this.delete()
                .then(function () {
                return counterpartDestDir;
            });
        });
    };
    return Directory;
}());
exports.Directory = Directory;

//# sourceMappingURL=data:application/json;charset=utf8;base64,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IGZyb20gXCJmc1wiO1xuaW1wb3J0ICogYXMgcGF0aCBmcm9tIFwicGF0aFwiO1xuaW1wb3J0ICogYXMgXyBmcm9tIFwibG9kYXNoXCI7XG5pbXBvcnQgKiBhcyBCQlByb21pc2UgZnJvbSBcImJsdWViaXJkXCI7XG5pbXBvcnQge0ZpbGV9IGZyb20gXCIuL2ZpbGVcIjtcbmltcG9ydCB7cHJvbWlzaWZ5MSwgc2VxdWVuY2V9IGZyb20gXCIuL3Byb21pc2VIZWxwZXJzXCI7XG5pbXBvcnQge1BhdGhQYXJ0LCByZWR1Y2VQYXRoUGFydHN9IGZyb20gXCIuL3BhdGhIZWxwZXJzXCI7XG5cblxuY29uc3QgdW5saW5rQXN5bmMgPSBwcm9taXNpZnkxPHZvaWQsIHN0cmluZz4oZnMudW5saW5rKTtcbmNvbnN0IHJtZGlyQXN5bmMgPSBwcm9taXNpZnkxPHZvaWQsIHN0cmluZz4oZnMucm1kaXIpO1xuY29uc3QgcmVhZGRpckFzeW5jID0gcHJvbWlzaWZ5MTxBcnJheTxzdHJpbmc+LCBzdHJpbmc+KGZzLnJlYWRkaXIpO1xuY29uc3QgbWtkaXJBc3luYyA9IHByb21pc2lmeTE8dm9pZCwgc3RyaW5nPihmcy5ta2Rpcik7XG5jb25zdCBzdGF0QXN5bmMgID0gcHJvbWlzaWZ5MTxmcy5TdGF0cywgc3RyaW5nPihmcy5zdGF0KTtcblxuXG5leHBvcnQgaW50ZXJmYWNlIElEaXJlY3RvcnlDb250ZW50cyB7XG4gICAgc3ViZGlyczogQXJyYXk8RGlyZWN0b3J5PjtcbiAgICBmaWxlczogICBBcnJheTxGaWxlPjtcbn1cblxuXG5leHBvcnQgY2xhc3MgRGlyZWN0b3J5XG57XG4gICAgLy8gcmVnaW9uIERhdGEgTWVtYmVyc1xuICAgIHByaXZhdGUgcmVhZG9ubHkgX2RpclBhdGg6IHN0cmluZztcbiAgICAvLyBlbmRyZWdpb25cblxuXG4gICAgcHVibGljIGNvbnN0cnVjdG9yKHBhdGhQYXJ0OiBQYXRoUGFydCwgLi4ucGF0aFBhcnRzOiBBcnJheTxQYXRoUGFydD4pXG4gICAge1xuICAgICAgICBjb25zdCBhbGxQYXJ0czogQXJyYXk8UGF0aFBhcnQ+ID0gW3BhdGhQYXJ0XS5jb25jYXQocGF0aFBhcnRzKTtcbiAgICAgICAgdGhpcy5fZGlyUGF0aCA9IHJlZHVjZVBhdGhQYXJ0cyhhbGxQYXJ0cyk7XG5cbiAgICAgICAgLy8gUmVtb3ZlIHRyYWlsaW5nIGRpcmVjdG9yeSBzZXBhcmF0b3IgY2hhcmFjdGVycy5cbiAgICAgICAgd2hpbGUgKF8uZW5kc1dpdGgodGhpcy5fZGlyUGF0aCwgcGF0aC5zZXApKSB7XG4gICAgICAgICAgICB0aGlzLl9kaXJQYXRoID0gdGhpcy5fZGlyUGF0aC5zbGljZSgwLCAtMSk7XG4gICAgICAgIH1cbiAgICB9XG5cblxuICAgIC8qKlxuICAgICAqIEdldHMgdGhlIG5hbWUgb2YgdGhpcyBkaXJlY3RvcnkgKHdpdGhvdXQgdGhlIHByZWNlZGluZyBwYXRoKVxuICAgICAqL1xuICAgIHB1YmxpYyBnZXQgZGlyTmFtZSgpOiBzdHJpbmdcbiAgICB7XG4gICAgICAgIGlmICh0aGlzLl9kaXJQYXRoLmxlbmd0aCA9PT0gMClcbiAgICAgICAge1xuICAgICAgICAgICAgLy8gVGhpcyBkaXJlY3RvcnkgcmVwcmVzZW50cyB0aGUgcm9vdCBvZiB0aGUgZmlsZXN5c3RlbS5cbiAgICAgICAgICAgIHJldHVybiBcIi9cIjtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiBfLmxhc3QodGhpcy5fZGlyUGF0aC5zcGxpdChwYXRoLnNlcCkpITtcbiAgICAgICAgfVxuICAgIH1cblxuXG4gICAgcHVibGljIHRvU3RyaW5nKCk6IHN0cmluZ1xuICAgIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2RpclBhdGg7XG4gICAgfVxuXG5cbiAgICBwdWJsaWMgZXF1YWxzKG90aGVyRGlyOiBEaXJlY3RvcnkpOiBib29sZWFuXG4gICAge1xuICAgICAgICByZXR1cm4gdGhpcy5hYnNQYXRoKCkgPT09IG90aGVyRGlyLmFic1BhdGgoKTtcbiAgICB9XG5cblxuICAgIC8qKlxuICAgICAqIEdldHMgdGhlIGFic29sdXRlIHBhdGggb2YgdGhpcyBEaXJlY3RvcnkuXG4gICAgICogQHJldHVybiBUaGUgYWJzb2x1dGUgcGF0aCBvZiB0aGlzIERpcmVjdG9yeVxuICAgICAqL1xuICAgIHB1YmxpYyBhYnNQYXRoKCk6IHN0cmluZ1xuICAgIHtcbiAgICAgICAgcmV0dXJuIHBhdGgucmVzb2x2ZSh0aGlzLl9kaXJQYXRoKTtcbiAgICB9XG5cblxuICAgIC8qKlxuICAgICAqIE1ha2VzIGFub3RoZXIgRGlyZWN0b3J5IGluc3RhbmNlIHRoYXQgaXMgd3JhcHBpbmcgdGhpcyBEaXJlY3Rvcnknc1xuICAgICAqIGFic29sdXRlIHBhdGguXG4gICAgICogQHJldHVybiBBIG5ldyBEaXJlY3RvcnkgcmVwcmVzZW50aW5nIHRoaXMgRGlyZWN0b3J5J3MgYWJzb2x1dGUgcGF0aC5cbiAgICAgKi9cbiAgICBwdWJsaWMgYWJzb2x1dGUoKTogRGlyZWN0b3J5XG4gICAge1xuICAgICAgICByZXR1cm4gbmV3IERpcmVjdG9yeSh0aGlzLmFic1BhdGgoKSk7XG4gICAgfVxuXG5cbiAgICBwdWJsaWMgZXhpc3RzKCk6IFByb21pc2U8ZnMuU3RhdHMgfCB1bmRlZmluZWQ+XG4gICAge1xuICAgICAgICByZXR1cm4gbmV3IEJCUHJvbWlzZTxmcy5TdGF0cyB8IHVuZGVmaW5lZD4oKHJlc29sdmU6IChyZXN1bHQ6IGZzLlN0YXRzIHwgdW5kZWZpbmVkKSA9PiB2b2lkKSA9PiB7XG4gICAgICAgICAgICBmcy5zdGF0KHRoaXMuX2RpclBhdGgsIChlcnI6IGFueSwgc3RhdHM6IGZzLlN0YXRzKSA9PiB7XG5cbiAgICAgICAgICAgICAgICBpZiAoIWVyciAmJiBzdGF0cy5pc0RpcmVjdG9yeSgpKVxuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZShzdGF0cyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgIHJlc29sdmUodW5kZWZpbmVkKTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICB9XG5cblxuICAgIHB1YmxpYyBleGlzdHNTeW5jKCk6IGZzLlN0YXRzIHwgdW5kZWZpbmVkXG4gICAge1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgY29uc3Qgc3RhdHMgPSBmcy5zdGF0U3luYyh0aGlzLl9kaXJQYXRoKTtcbiAgICAgICAgICAgIHJldHVybiBzdGF0cy5pc0RpcmVjdG9yeSgpID8gc3RhdHMgOiB1bmRlZmluZWQ7XG4gICAgICAgIH1cbiAgICAgICAgY2F0Y2ggKGVycikge1xuICAgICAgICAgICAgaWYgKGVyci5jb2RlID09PSBcIkVOT0VOVFwiKVxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgdGhyb3cgZXJyO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG5cbiAgICBwdWJsaWMgaXNFbXB0eSgpOiBQcm9taXNlPGJvb2xlYW4+XG4gICAge1xuICAgICAgICByZXR1cm4gcmVhZGRpckFzeW5jKHRoaXMuX2RpclBhdGgpXG4gICAgICAgIC50aGVuKChmc0VudHJpZXMpID0+IHtcbiAgICAgICAgICAgIHJldHVybiBmc0VudHJpZXMubGVuZ3RoID09PSAwO1xuICAgICAgICB9KTtcbiAgICB9XG5cblxuICAgIHB1YmxpYyBpc0VtcHR5U3luYygpOiBib29sZWFuXG4gICAge1xuICAgICAgICBjb25zdCBmc0VudHJpZXMgPSBmcy5yZWFkZGlyU3luYyh0aGlzLl9kaXJQYXRoKTtcbiAgICAgICAgcmV0dXJuIGZzRW50cmllcy5sZW5ndGggPT09IDA7XG4gICAgfVxuXG5cbiAgICBwdWJsaWMgZW5zdXJlRXhpc3RzKCk6IFByb21pc2U8dm9pZD5cbiAgICB7XG4gICAgICAgIHJldHVybiB0aGlzLmV4aXN0cygpXG4gICAgICAgIC50aGVuKChzdGF0cykgPT5cbiAgICAgICAge1xuICAgICAgICAgICAgaWYgKHN0YXRzKVxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBjb25zdCBwYXJ0cyA9IHRoaXMuX2RpclBhdGguc3BsaXQocGF0aC5zZXApO1xuXG4gICAgICAgICAgICAgICAgLy8gQ3JlYXRlIGFuIGFycmF5IG9mIHN1Y2Nlc3NpdmVseSBsb25nZXIgcGF0aHMsIGVhY2ggb25lIGFkZGluZyBhXG4gICAgICAgICAgICAgICAgLy8gbmV3IGRpcmVjdG9yeSBvbnRvIHRoZSBlbmQuXG4gICAgICAgICAgICAgICAgY29uc3QgZGlyc1RvQ3JlYXRlID0gcGFydHMucmVkdWNlKChhY2M6IEFycmF5PHN0cmluZz4sIGN1clBhcnQ6IHN0cmluZyk6IEFycmF5PHN0cmluZz4gPT4ge1xuICAgICAgICAgICAgICAgICAgICBpZiAoYWNjLmxlbmd0aCA9PT0gMClcbiAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGN1clBhcnQubGVuZ3RoID09PSAwKVxuICAgICAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIFRoZSBmaXJzdCBpdGVtIGlzIGFuIGVtcHR5IHN0cmluZy4gIFRoZSBwYXRoIG11c3RcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBoYXZlIHN0YXJ0ZWQgd2l0aCB0aGUgZGlyZWN0b3J5IHNlcGFyYXRvciBjaGFyYWN0ZXJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyAoYW4gYWJzb2x1dGUgcGF0aCB3YXMgc3BlY2lmaWVkKS5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBhY2MucHVzaChwYXRoLnNlcCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gVGhlIGZpcnN0IGl0ZW0gY29udGFpbnMgdGV4dC4gIEEgcmVsYXRpdmUgcGF0aCBtdXN0XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gaGF2ZSBiZWVuIHNwZWNpZmllZC5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBhY2MucHVzaChjdXJQYXJ0KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGxhc3QgPSBhY2NbYWNjLmxlbmd0aCAtIDFdO1xuICAgICAgICAgICAgICAgICAgICAgICAgYWNjLnB1c2gocGF0aC5qb2luKGxhc3QsIGN1clBhcnQpKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gYWNjO1xuICAgICAgICAgICAgICAgIH0sIFtdKTtcblxuICAgICAgICAgICAgICAgIC8vIERvbid0IGF0dGVtcHQgdG8gY3JlYXRlIHRoZSByb290IG9mIHRoZSBmaWxlc3lzdGVtLlxuICAgICAgICAgICAgICAgIGlmICgoZGlyc1RvQ3JlYXRlLmxlbmd0aCA+IDApICYmIChkaXJzVG9DcmVhdGVbMF0gPT09IHBhdGguc2VwKSlcbiAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgIGRpcnNUb0NyZWF0ZS5zaGlmdCgpO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIC8vIE1hcCBlYWNoIHN1Y2Nlc3NpdmVseSBsb25nZXIgcGF0aCB0byBhIGZ1bmN0aW9uIHRoYXQgd2lsbCBjcmVhdGVcbiAgICAgICAgICAgICAgICAvLyBpdC5cbiAgICAgICAgICAgICAgICBjb25zdCBjcmVhdGVGdW5jcyA9IGRpcnNUb0NyZWF0ZS5tYXAoKGRpclRvQ3JlYXRlOiBzdHJpbmcpID0+XG4gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gKCk6IFByb21pc2U8dm9pZD4gPT5cbiAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG1rZGlyQXN5bmMoZGlyVG9DcmVhdGUpXG4gICAgICAgICAgICAgICAgICAgICAgICAuY2F0Y2goKGVycikgPT5cbiAgICAgICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBJZiB0aGUgZGlyZWN0b3J5IGFscmVhZHkgZXhpc3RzLCBqdXN0IGtlZXAgZ29pbmcuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGVyci5jb2RlICE9PSBcIkVFWElTVFwiKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhyb3cgZXJyO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgLy8gRXhlY3V0ZSB0aGUgZGlyZWN0b3J5IGNyZWF0aW9uIGZ1bmN0aW9ucyBpbiBzZXF1ZW5jZS5cbiAgICAgICAgICAgICAgICByZXR1cm4gc2VxdWVuY2UoY3JlYXRlRnVuY3MsIHVuZGVmaW5lZCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH1cblxuXG4gICAgcHVibGljIGVuc3VyZUV4aXN0c1N5bmMoKTogdm9pZFxuICAgIHtcbiAgICAgICAgaWYgKHRoaXMuZXhpc3RzU3luYygpKVxuICAgICAgICB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBwYXJ0cyA9IHRoaXMuX2RpclBhdGguc3BsaXQocGF0aC5zZXApO1xuXG4gICAgICAgIC8vIENyZWF0ZSBhbiBhcnJheSBvZiBzdWNjZXNzaXZlbHkgbG9uZ2VyIHBhdGhzLCBlYWNoIG9uZSBhZGRpbmcgYVxuICAgICAgICAvLyBuZXcgZGlyZWN0b3J5IG9udG8gdGhlIGVuZC5cbiAgICAgICAgY29uc3QgZGlyc1RvQ3JlYXRlID0gcGFydHMucmVkdWNlKChhY2M6IEFycmF5PHN0cmluZz4sIGN1clBhcnQ6IHN0cmluZyk6IEFycmF5PHN0cmluZz4gPT4ge1xuICAgICAgICAgICAgaWYgKGFjYy5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICAgICAgICBpZiAoY3VyUGFydC5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gVGhlIGZpcnN0IGl0ZW0gaXMgYW4gZW1wdHkgc3RyaW5nLiAgVGhlIHBhdGggbXVzdFxuICAgICAgICAgICAgICAgICAgICAvLyBoYXZlIHN0YXJ0ZWQgd2l0aCB0aGUgZGlyZWN0b3J5IHNlcGFyYXRvciBjaGFyYWN0ZXJcbiAgICAgICAgICAgICAgICAgICAgLy8gKGFuIGFic29sdXRlIHBhdGggd2FzIHNwZWNpZmllZCkuXG4gICAgICAgICAgICAgICAgICAgIGFjYy5wdXNoKHBhdGguc2VwKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAvLyBUaGUgZmlyc3QgaXRlbSBjb250YWlucyB0ZXh0LiAgQSByZWxhdGl2ZSBwYXRoIG11c3RcbiAgICAgICAgICAgICAgICAgICAgLy8gaGF2ZSBiZWVuIHNwZWNpZmllZC5cbiAgICAgICAgICAgICAgICAgICAgYWNjLnB1c2goY3VyUGFydCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBjb25zdCBsYXN0ID0gYWNjW2FjYy5sZW5ndGggLSAxXTtcbiAgICAgICAgICAgICAgICBhY2MucHVzaChwYXRoLmpvaW4obGFzdCwgY3VyUGFydCkpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIGFjYztcbiAgICAgICAgfSwgW10pO1xuXG4gICAgICAgIC8vIERvbid0IGF0dGVtcHQgdG8gY3JlYXRlIHRoZSByb290IG9mIHRoZSBmaWxlc3lzdGVtLlxuICAgICAgICBpZiAoKGRpcnNUb0NyZWF0ZS5sZW5ndGggPiAwKSAmJiAoZGlyc1RvQ3JlYXRlWzBdID09PSBwYXRoLnNlcCkpIHtcbiAgICAgICAgICAgIGRpcnNUb0NyZWF0ZS5zaGlmdCgpO1xuICAgICAgICB9XG5cbiAgICAgICAgZGlyc1RvQ3JlYXRlLmZvckVhY2goKGN1ckRpcikgPT4ge1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICBmcy5ta2RpclN5bmMoY3VyRGlyKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNhdGNoIChlcnIpIHtcbiAgICAgICAgICAgICAgICAvLyBJZiB0aGUgZGlyZWN0b3J5IGFscmVhZHkgZXhpc3RzLCBqdXN0IGtlZXAgZ29pbmcuXG4gICAgICAgICAgICAgICAgaWYgKGVyci5jb2RlICE9PSBcIkVFWElTVFwiKSB7XG4gICAgICAgICAgICAgICAgICAgIHRocm93IGVycjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH1cblxuXG4gICAgcHVibGljIGVtcHR5KCk6IFByb21pc2U8dm9pZD5cbiAgICB7XG4gICAgICAgIHJldHVybiB0aGlzLmRlbGV0ZSgpXG4gICAgICAgIC50aGVuKCgpID0+IHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmVuc3VyZUV4aXN0cygpO1xuICAgICAgICB9KTtcbiAgICB9XG5cblxuICAgIHB1YmxpYyBlbXB0eVN5bmMoKTogdm9pZFxuICAgIHtcbiAgICAgICAgdGhpcy5kZWxldGVTeW5jKCk7XG4gICAgICAgIHRoaXMuZW5zdXJlRXhpc3RzU3luYygpO1xuICAgIH1cblxuXG4gICAgcHVibGljIGRlbGV0ZSgpOiBQcm9taXNlPHZvaWQ+XG4gICAge1xuICAgICAgICByZXR1cm4gdGhpcy5leGlzdHMoKVxuICAgICAgICAudGhlbigoc3RhdHMpID0+IHtcbiAgICAgICAgICAgIGlmICghc3RhdHMpXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgLy8gVGhlIHNwZWNpZmllZCBkaXJlY3RvcnkgZG9lcyBub3QgZXhpc3QuICBEbyBub3RoaW5nLlxuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAvLyBGaXJzdCwgZGVsZXRlIHRoZSBjb250ZW50cyBvZiB0aGUgc3BlY2lmaWVkIGRpcmVjdG9yeS5cbiAgICAgICAgICAgICAgICByZXR1cm4gcmVhZGRpckFzeW5jKHRoaXMuX2RpclBhdGgpXG4gICAgICAgICAgICAgICAgLnRoZW4oKGl0ZW1zOiBBcnJheTxzdHJpbmc+KSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGFic1BhdGhzID0gaXRlbXMubWFwKChjdXJJdGVtKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gcGF0aC5qb2luKHRoaXMuX2RpclBhdGgsIGN1ckl0ZW0pO1xuICAgICAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgICAgICBjb25zdCBkZWxldGVQcm9taXNlcyA9IGFic1BhdGhzLm1hcCgoY3VyQWJzUGF0aDogc3RyaW5nKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoZnMuc3RhdFN5bmMoY3VyQWJzUGF0aCkuaXNEaXJlY3RvcnkoKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHN1YmRpciA9IG5ldyBEaXJlY3RvcnkoY3VyQWJzUGF0aCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHN1YmRpci5kZWxldGUoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHVubGlua0FzeW5jKGN1ckFic1BhdGgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gQkJQcm9taXNlLmFsbChkZWxldGVQcm9taXNlcyk7XG4gICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAudGhlbigoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIC8vIE5vdyB0aGF0IGFsbCBvZiB0aGUgaXRlbXMgaW4gdGhlIGRpcmVjdG9yeSBoYXZlIGJlZW4gZGVsZXRlZCwgZGVsZXRlXG4gICAgICAgICAgICAgICAgICAgIC8vIHRoZSBkaXJlY3RvcnkgaXRzZWxmLlxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gcm1kaXJBc3luYyh0aGlzLl9kaXJQYXRoKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfVxuXG5cbiAgICBwdWJsaWMgZGVsZXRlU3luYygpOiB2b2lkXG4gICAge1xuICAgICAgICBpZiAoIXRoaXMuZXhpc3RzU3luYygpKVxuICAgICAgICB7XG4gICAgICAgICAgICAvLyBUaGUgZGlyZWN0b3J5IGRvZXMgbm90IGV4aXN0LiAgRG8gbm90aGluZy5cbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIEZpcnN0LCBkZWxldGUgdGhlIGNvbnRlbnRzIG9mIHRoZSBzcGVjaWZpZWQgZGlyZWN0b3J5LlxuICAgICAgICBsZXQgZnNJdGVtczogQXJyYXk8c3RyaW5nPiA9IGZzLnJlYWRkaXJTeW5jKHRoaXMuX2RpclBhdGgpO1xuICAgICAgICBmc0l0ZW1zID0gZnNJdGVtcy5tYXAoKGN1ckZzSXRlbSkgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIHBhdGguam9pbih0aGlzLl9kaXJQYXRoLCBjdXJGc0l0ZW0pO1xuICAgICAgICB9KTtcblxuICAgICAgICBmc0l0ZW1zLmZvckVhY2goKGN1ckZzSXRlbSkgPT4ge1xuICAgICAgICAgICAgY29uc3Qgc3RhdHMgPSBmcy5zdGF0U3luYyhjdXJGc0l0ZW0pO1xuICAgICAgICAgICAgaWYgKHN0YXRzLmlzRGlyZWN0b3J5KCkpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBzdWJkaXIgPSBuZXcgRGlyZWN0b3J5KGN1ckZzSXRlbSk7XG4gICAgICAgICAgICAgICAgc3ViZGlyLmRlbGV0ZVN5bmMoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIGZzLnVubGlua1N5bmMoY3VyRnNJdGVtKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG5cbiAgICAgICAgLy8gTm93IHRoYXQgYWxsIG9mIHRoZSBpdGVtcyBpbiB0aGUgZGlyZWN0b3J5IGhhdmUgYmVlbiBkZWxldGVkLCBkZWxldGUgdGhlXG4gICAgICAgIC8vIGRpcmVjdG9yeSBpdHNlbGYuXG4gICAgICAgIGZzLnJtZGlyU3luYyh0aGlzLl9kaXJQYXRoKTtcbiAgICB9XG5cblxuICAgIC8qKlxuICAgICAqIFJlYWRzIHRoZSBjb250ZW50cyBvZiB0aGlzIGRpcmVjdG9yeS5cbiAgICAgKiBAcmV0dXJuIFRoZSBjb250ZW50cyBvZiB0aGUgZGlyZWN0b3J5LCBzZXBhcmF0ZWQgaW50byBhIGxpc3Qgb2YgZmlsZXMgYW5kIGFcbiAgICAgKiBsaXN0IG9mIHN1YmRpcmVjdG9yaWVzLiAgQWxsIHBhdGhzIHJldHVybmVkIGFyZSBhYnNvbHV0ZSBwYXRocy5cbiAgICAgKi9cbiAgICBwdWJsaWMgY29udGVudHMoKTogUHJvbWlzZTxJRGlyZWN0b3J5Q29udGVudHM+XG4gICAge1xuICAgICAgICBjb25zdCBwYXJlbnREaXJQYXRoID0gdGhpcy50b1N0cmluZygpO1xuXG4gICAgICAgIHJldHVybiByZWFkZGlyQXN5bmModGhpcy5fZGlyUGF0aClcbiAgICAgICAgLnRoZW4oKGZzRW50cmllcykgPT4ge1xuICAgICAgICAgICAgY29uc3QgYWJzUGF0aHMgPSBmc0VudHJpZXMubWFwKChjdXJFbnRyeSkgPT4ge1xuICAgICAgICAgICAgICAgIHJldHVybiBwYXRoLmpvaW4ocGFyZW50RGlyUGF0aCwgY3VyRW50cnkpO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIGNvbnN0IGNvbnRlbnRzOiBJRGlyZWN0b3J5Q29udGVudHMgPSB7c3ViZGlyczogW10sIGZpbGVzOiBbXX07XG5cbiAgICAgICAgICAgIGNvbnN0IHByb21pc2VzID0gYWJzUGF0aHMubWFwKChjdXJQYXRoKSA9PiB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHN0YXRBc3luYyhjdXJQYXRoKVxuICAgICAgICAgICAgICAgIC50aGVuKChzdGF0cykgPT4ge1xuICAgICAgICAgICAgICAgICAgICBpZiAoc3RhdHMuaXNGaWxlKCkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRlbnRzLmZpbGVzLnB1c2gobmV3IEZpbGUoY3VyUGF0aCkpO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKHN0YXRzLmlzRGlyZWN0b3J5KCkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRlbnRzLnN1YmRpcnMucHVzaChuZXcgRGlyZWN0b3J5KGN1clBhdGgpKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIHJldHVybiBCQlByb21pc2UuYWxsKHByb21pc2VzKVxuICAgICAgICAgICAgLnRoZW4oKCkgPT4ge1xuICAgICAgICAgICAgICAgIHJldHVybiBjb250ZW50cztcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICB9XG5cblxuICAgIC8qKlxuICAgICAqIFJlYWRzIHRoZSBjb250ZW50cyBvZiB0aGlzIGRpcmVjdG9yeS5cbiAgICAgKiBAcmV0dXJuIFRoZSBjb250ZW50cyBvZiB0aGUgZGlyZWN0b3J5LCBzZXBhcmF0ZWQgaW50byBhIGxpc3Qgb2YgZmlsZXMgYW5kIGFcbiAgICAgKiBsaXN0IG9mIHN1YmRpcmVjdG9yaWVzLiAgQWxsIHBhdGhzIHJldHVybmVkIGFyZSBhYnNvbHV0ZSBwYXRocy5cbiAgICAgKi9cbiAgICBwdWJsaWMgY29udGVudHNTeW5jKCk6IElEaXJlY3RvcnlDb250ZW50c1xuICAgIHtcbiAgICAgICAgY29uc3QgcGFyZW50RGlyUGF0aCA9IHRoaXMudG9TdHJpbmcoKTtcblxuICAgICAgICBsZXQgZnNFbnRyaWVzID0gZnMucmVhZGRpclN5bmModGhpcy5fZGlyUGF0aCk7XG4gICAgICAgIGZzRW50cmllcyA9IGZzRW50cmllcy5tYXAoKGN1ckZzRW50cnkpID0+IHtcbiAgICAgICAgICAgIHJldHVybiBwYXRoLmpvaW4ocGFyZW50RGlyUGF0aCwgY3VyRnNFbnRyeSk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGNvbnN0IGNvbnRlbnRzOiBJRGlyZWN0b3J5Q29udGVudHMgPSB7c3ViZGlyczogW10sIGZpbGVzOiBbXX07XG4gICAgICAgIGZzRW50cmllcy5mb3JFYWNoKChjdXJGc0VudHJ5KSA9PiB7XG4gICAgICAgICAgICBjb25zdCBzdGF0cyA9IGZzLnN0YXRTeW5jKGN1ckZzRW50cnkpO1xuICAgICAgICAgICAgaWYgKHN0YXRzLmlzRmlsZSgpKVxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIGNvbnRlbnRzLmZpbGVzLnB1c2gobmV3IEZpbGUoY3VyRnNFbnRyeSkpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZiAoc3RhdHMuaXNEaXJlY3RvcnkoKSlcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBjb250ZW50cy5zdWJkaXJzLnB1c2gobmV3IERpcmVjdG9yeShjdXJGc0VudHJ5KSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHJldHVybiBjb250ZW50cztcbiAgICB9XG5cblxuICAgIC8qKlxuICAgICAqIEVudW1lcmF0ZXMgdGhlIGZpbGVzIGluIHRoaXMgRGlyZWN0b3J5XG4gICAgICogQHBhcmFtIHJlY3Vyc2l2ZSAtIElmIHRydWUsIGZpbGVzIGluIGFsbCBzdWJkaXJlY3RvcmllcyB3aWxsIGJlIHJldHVybmVkXG4gICAgICogQHJldHVybiBBIFByb21pc2UgdGhhdCBpcyByZXNvbHZlZCB3aXRoIGFuIGFycmF5IG9mIEZpbGUgb2JqZWN0c1xuICAgICAqIHJlcHJlc2VudGluZyB0aGUgZmlsZXMgaW4gdGhpcyBkaXJlY3RvcnkuXG4gICAgICovXG4gICAgcHVibGljIGZpbGVzKHJlY3Vyc2l2ZTogYm9vbGVhbik6IFByb21pc2U8QXJyYXk8RmlsZT4+XG4gICAge1xuICAgICAgICByZXR1cm4gdGhpcy5jb250ZW50cygpXG4gICAgICAgIC50aGVuKChjb250ZW50cykgPT4ge1xuICAgICAgICAgICAgbGV0IGFsbEZpbGVzOiBBcnJheTxGaWxlPiA9IGNvbnRlbnRzLmZpbGVzO1xuXG4gICAgICAgICAgICBsZXQgc3ViZGlyc1Byb21pc2U6IFByb21pc2U8QXJyYXk8QXJyYXk8RmlsZT4+PiA9IEJCUHJvbWlzZS5yZXNvbHZlKFtbXV0pO1xuXG4gICAgICAgICAgICAvLyBJZiB3ZSBuZWVkIHRvIHJlY3Vyc2UgaW50byB0aGUgc3ViZGlyZWN0b3JpZXMsIHRoZW4gZG8gaXQuXG4gICAgICAgICAgICBpZiAocmVjdXJzaXZlICYmIGNvbnRlbnRzLnN1YmRpcnMgJiYgY29udGVudHMuc3ViZGlycy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgcHJvbWlzZXMgPSBfLm1hcChjb250ZW50cy5zdWJkaXJzLCAoY3VyU3ViZGlyKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBjdXJTdWJkaXIuZmlsZXModHJ1ZSk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgc3ViZGlyc1Byb21pc2UgPSBCQlByb21pc2UuYWxsKHByb21pc2VzKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIHN1YmRpcnNQcm9taXNlXG4gICAgICAgICAgICAudGhlbigoc3ViZGlyUmVzdWx0cykgPT4ge1xuICAgICAgICAgICAgICAgIGNvbnN0IHN1YmRpckZpbGVzID0gXy5mbGF0dGVuKHN1YmRpclJlc3VsdHMpO1xuICAgICAgICAgICAgICAgIGFsbEZpbGVzID0gXy5jb25jYXQoYWxsRmlsZXMsIHN1YmRpckZpbGVzKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gYWxsRmlsZXM7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICB9KTtcbiAgICB9XG5cblxuICAgIC8qKlxuICAgICAqIFJlY3Vyc2l2ZWx5IHJlbW92ZXMgZW1wdHkgc3ViZGlyZWN0b3JpZXMgZnJvbSB3aXRoaW4gdGhpcyBkaXJlY3RvcnkuXG4gICAgICogQHJldHVybiBBIFByb21pc2UgdGhhdCBpcyByZXNvbHZlZCB3aGVuIHRoaXMgZGlyZWN0b3J5IGhhcyBiZWVuIHBydW5lZC5cbiAgICAgKi9cbiAgICBwdWJsaWMgcHJ1bmUoKTogUHJvbWlzZTx2b2lkPlxuICAgIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuY29udGVudHMoKVxuICAgICAgICAudGhlbigoY29udGVudHMpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IHByb21pc2VzID0gY29udGVudHMuc3ViZGlycy5tYXAoKGN1clN1YmRpcikgPT4ge1xuICAgICAgICAgICAgICAgIC8vXG4gICAgICAgICAgICAgICAgLy8gUHJ1bmUgdGhlIGN1cnJlbnQgc3ViZGlyZWN0b3J5LlxuICAgICAgICAgICAgICAgIC8vXG4gICAgICAgICAgICAgICAgcmV0dXJuIGN1clN1YmRpci5wcnVuZSgpXG4gICAgICAgICAgICAgICAgLnRoZW4oKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAvL1xuICAgICAgICAgICAgICAgICAgICAvLyBJZiB0aGUgc3ViZGlyZWN0b3J5IGlzIG5vdyBlbXB0eSwgZGVsZXRlIGl0LlxuICAgICAgICAgICAgICAgICAgICAvL1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gY3VyU3ViZGlyLmlzRW1wdHkoKTtcbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgIC50aGVuKChkaXJJc0VtcHR5KSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChkaXJJc0VtcHR5KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gY3VyU3ViZGlyLmRlbGV0ZSgpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgcmV0dXJuIEJCUHJvbWlzZS5hbGwocHJvbWlzZXMpXG4gICAgICAgICAgICAudGhlbigoKSA9PiB7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG5cbiAgICAvKipcbiAgICAgKiBSZWN1cnNpdmVseSByZW1vdmVzIGVtcHR5IHN1YmRpcmVjdG9yaWVzIGZyb20gdGhpcyBkaXJlY3RvcnkuXG4gICAgICovXG4gICAgcHVibGljIHBydW5lU3luYygpOiB2b2lkXG4gICAge1xuICAgICAgICBjb25zdCBjb250ZW50cyA9IHRoaXMuY29udGVudHNTeW5jKCk7XG4gICAgICAgIGNvbnRlbnRzLnN1YmRpcnMuZm9yRWFjaCgoY3VyU3ViZGlyKSA9PiB7XG5cbiAgICAgICAgICAgIGN1clN1YmRpci5wcnVuZVN5bmMoKTtcblxuICAgICAgICAgICAgLy9cbiAgICAgICAgICAgIC8vIElmIHRoZSBzdWJkaXJlY3RvcnkgaXMgbm93IGVtcHR5LCBkZWxldGUgaXQuXG4gICAgICAgICAgICAvL1xuICAgICAgICAgICAgaWYgKGN1clN1YmRpci5pc0VtcHR5U3luYygpKVxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIGN1clN1YmRpci5kZWxldGVTeW5jKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH1cblxuXG4gICAgLyoqXG4gICAgICogQ29waWVzIHRoaXMgZGlyZWN0b3J5IHRvIGRlc3REaXIuXG4gICAgICogQHBhcmFtIGRlc3REaXIgLSBUaGUgZGVzdGluYXRpb24gZGlyZWN0b3J5XG4gICAgICogQHBhcmFtIGNvcHlSb290IC0gSWYgdHJ1ZSwgdGhpcyBkaXJlY3RvcnkgbmFtZSB3aWxsIGJlIGEgc3ViZGlyZWN0b3J5IG9mXG4gICAgICogZGVzdERpci4gIElmIGZhbHNlLCBvbmx5IHRoZSBjb250ZW50cyBvZiB0aGlzIGRpcmVjdG9yeSB3aWxsIGJlIGNvcGllZFxuICAgICAqIGludG8gZGVzdERpci5cbiAgICAgKiBAcmV0dXJuIEEgcHJvbWlzZSB0aGF0IGlzIHJlc29sdmVkIHdpdGggYSBEaXJlY3Rvcnkgb2JqZWN0IHJlcHJlc2VudGluZ1xuICAgICAqIHRoZSBkZXN0aW5hdGlvbiBkaXJlY3RvcnkuICBJZiBjb3B5Um9vdCBpcyBmYWxzZSwgdGhpcyB3aWxsIGJlIGRlc3REaXIuXG4gICAgICogSWYgY29weVJvb3QgaXMgdHJ1ZSwgdGhpcyB3aWxsIGJlIHRoaXMgRGlyZWN0b3J5J3MgY291bnRlcnBhcnRcbiAgICAgKiBzdWJkaXJlY3RvcnkgaW4gZGVzdERpci5cbiAgICAgKi9cbiAgICBwdWJsaWMgY29weShkZXN0RGlyOiBEaXJlY3RvcnksIGNvcHlSb290OiBib29sZWFuKTogUHJvbWlzZTxEaXJlY3Rvcnk+XG4gICAge1xuICAgICAgICAvLyB0b2RvOiBTZWUgaWYgYW55dGhpbmcgd291bGQgYmUgb3ZlcndyaXR0ZW4uXG5cbiAgICAgICAgaWYgKGNvcHlSb290KVxuICAgICAgICB7XG4gICAgICAgICAgICAvLyBDb3B5aW5nIHRoaXMgZGlyZWN0b3J5IHRvIHRoZSBkZXN0aW5hdGlvbiB3aXRoIGNvcHlSb290IHRydWUganVzdFxuICAgICAgICAgICAgLy8gbWVhbnMgY3JlYXRpbmcgdGhlIGNvdW50ZXJwYXJ0IHRvIHRoaXMgZGlyZWN0b3J5IGluIHRoZVxuICAgICAgICAgICAgLy8gZGVzdGluYXRpb24gYW5kIHRoZW4gY29weWluZyB0byB0aGF0IGRpcmVjdG9yeSB3aXRoIGNvcHlSb290XG4gICAgICAgICAgICAvLyBmYWxzZS5cbiAgICAgICAgICAgIGNvbnN0IHRoaXNEZXN0OiBEaXJlY3RvcnkgPSBuZXcgRGlyZWN0b3J5KGRlc3REaXIsIHRoaXMuZGlyTmFtZSk7XG4gICAgICAgICAgICByZXR1cm4gdGhpc0Rlc3QuZW5zdXJlRXhpc3RzKClcbiAgICAgICAgICAgIC50aGVuKCgpID0+IHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5jb3B5KHRoaXNEZXN0LCBmYWxzZSk7XG4gICAgICAgICAgICB9KVxuICAgICAgICAgICAgLnRoZW4oKCkgPT4ge1xuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzRGVzdDtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHRoaXMuY29udGVudHMoKVxuICAgICAgICAudGhlbigoY29udGVudHM6IElEaXJlY3RvcnlDb250ZW50cykgPT4ge1xuICAgICAgICAgICAgLy8gQ29weSB0aGUgZmlsZXMgaW4gdGhpcyBkaXJlY3RvcnkgdG8gdGhlIGRlc3RpbmF0aW9uLlxuICAgICAgICAgICAgY29uc3QgZmlsZUNvcHlQcm9taXNlcyA9IGNvbnRlbnRzLmZpbGVzLm1hcCgoY3VyRmlsZSkgPT4ge1xuICAgICAgICAgICAgICAgIHJldHVybiBjdXJGaWxlLmNvcHkoZGVzdERpciwgY3VyRmlsZS5maWxlTmFtZSk7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgY29uc3QgZGlyQ29weVByb21pc2VzID0gY29udGVudHMuc3ViZGlycy5tYXAoKGN1clN1YmRpcikgPT4ge1xuICAgICAgICAgICAgICAgIHJldHVybiBjdXJTdWJkaXIuY29weShkZXN0RGlyLCB0cnVlKTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICByZXR1cm4gQkJQcm9taXNlLmFsbChfLmNvbmNhdDxhbnk+KGZpbGVDb3B5UHJvbWlzZXMsIGRpckNvcHlQcm9taXNlcykpO1xuICAgICAgICB9KVxuICAgICAgICAudGhlbigoKSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gZGVzdERpcjtcbiAgICAgICAgfSk7XG4gICAgfVxuXG5cbiAgICAvKipcbiAgICAgKiBDb3BpZXMgdGhpcyBkaXJlY3RvcnkgdG8gZGVzdERpci5cbiAgICAgKiBAcGFyYW0gZGVzdERpciAtIFRoZSBkZXN0aW5hdGlvbiBkaXJlY3RvcnlcbiAgICAgKiBAcGFyYW0gY29weVJvb3QgLSBJZiB0cnVlLCB0aGlzIGRpcmVjdG9yeSBuYW1lIHdpbGwgYmUgYSBzdWJkaXJlY3Rvcnkgb2ZcbiAgICAgKiBkZXN0RGlyLiAgSWYgZmFsc2UsIG9ubHkgdGhlIGNvbnRlbnRzIG9mIHRoaXMgZGlyZWN0b3J5IHdpbGwgYmUgY29waWVkXG4gICAgICogaW50byBkZXN0RGlyLlxuICAgICAqL1xuICAgIHB1YmxpYyBjb3B5U3luYyhkZXN0RGlyOiBEaXJlY3RvcnksIGNvcHlSb290OiBib29sZWFuKTogRGlyZWN0b3J5XG4gICAge1xuICAgICAgICBpZiAoY29weVJvb3QpXG4gICAgICAgIHtcbiAgICAgICAgICAgIC8vIENvcHlpbmcgdGhpcyBkaXJlY3RvcnkgdG8gdGhlIGRlc3RpbmF0aW9uIHdpdGggY29weVJvb3QgdHJ1ZSBqdXN0XG4gICAgICAgICAgICAvLyBtZWFucyBjcmVhdGluZyB0aGUgY291bnRlcnBhcnQgdG8gdGhpcyBkaXJlY3RvcnkgaW4gdGhlXG4gICAgICAgICAgICAvLyBkZXN0aW5hdGlvbiBhbmQgdGhlbiBjb3B5aW5nIHRvIHRoYXQgZGlyZWN0b3J5IHdpdGggY29weVJvb3RcbiAgICAgICAgICAgIC8vIGZhbHNlLlxuICAgICAgICAgICAgY29uc3QgdGhpc0Rlc3Q6IERpcmVjdG9yeSA9IG5ldyBEaXJlY3RvcnkoZGVzdERpciwgdGhpcy5kaXJOYW1lKTtcbiAgICAgICAgICAgIHRoaXNEZXN0LmVuc3VyZUV4aXN0c1N5bmMoKTtcbiAgICAgICAgICAgIHRoaXMuY29weVN5bmModGhpc0Rlc3QsIGZhbHNlKTtcbiAgICAgICAgICAgIHJldHVybiB0aGlzRGVzdDtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IGNvbnRlbnRzID0gdGhpcy5jb250ZW50c1N5bmMoKTtcblxuICAgICAgICAvLyBDb3B5IHRoZSBmaWxlcyBpbiB0aGlzIGRpcmVjdG9yeSB0byB0aGUgZGVzdGluYXRpb24uXG4gICAgICAgIGNvbnRlbnRzLmZpbGVzLmZvckVhY2goKGN1ckZpbGUpID0+IHtcbiAgICAgICAgICAgIGN1ckZpbGUuY29weVN5bmMoZGVzdERpciwgY3VyRmlsZS5maWxlTmFtZSk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGNvbnRlbnRzLnN1YmRpcnMuZm9yRWFjaCgoY3VyU3ViZGlyKSA9PiB7XG4gICAgICAgICAgICBjdXJTdWJkaXIuY29weVN5bmMoZGVzdERpciwgdHJ1ZSk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHJldHVybiBkZXN0RGlyO1xuICAgIH1cblxuXG4gICAgLyoqXG4gICAgICogTW92ZXMgdGhpcyBEaXJlY3Rvcnkgb3IgdGhlIGNvbnRlbnRzIG9mIHRoaXMgRGlyZWN0b3J5IHRvIGRlc3REaXIuXG4gICAgICogQHBhcmFtIGRlc3REaXIgLSBUaGUgZGVzdGluYXRpb24gZGlyZWN0b3J5XG4gICAgICogQHBhcmFtIG1vdmVSb290IC0gSWYgdHJ1ZSwgdGhpcyBkaXJlY3RvcnkgbmFtZSB3aWxsIGJlIGEgc3ViZGlyZWN0b3J5IG9mXG4gICAgICogZGVzdERpci4gIElmIGZhbHNlLCBvbmx5IHRoZSBjb250ZW50cyBvZiB0aGlzIGRpcmVjdG9yeSB3aWxsIGJlIGNvcGllZFxuICAgICAqIGludG8gZGVzdERpci5cbiAgICAgKiBAcmV0dXJuIEEgcHJvbWlzZSB0aGF0IGlzIHJlc29sdmVkIHdpdGggYSBEaXJlY3Rvcnkgb2JqZWN0IHJlcHJlc2VudGluZ1xuICAgICAqIHRoZSBkZXN0aW5hdGlvbiBkaXJlY3RvcnkuICBJZiBtb3ZlUm9vdCBpcyBmYWxzZSwgdGhpcyB3aWxsIGJlIGRlc3REaXIuXG4gICAgICogSWYgbW92ZVJvb3QgaXMgdHJ1ZSwgdGhpcyB3aWxsIGJlIHRoaXMgRGlyZWN0b3J5J3MgY291bnRlcnBhcnRcbiAgICAgKiBzdWJkaXJlY3RvcnkgaW4gZGVzdERpci5cbiAgICAgKi9cbiAgICBwdWJsaWMgbW92ZShkZXN0RGlyOiBEaXJlY3RvcnksIG1vdmVSb290OiBib29sZWFuKTogUHJvbWlzZTxEaXJlY3Rvcnk+XG4gICAge1xuICAgICAgICByZXR1cm4gZGVzdERpci5lbnN1cmVFeGlzdHMoKVxuICAgICAgICAudGhlbigoKSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5jb3B5KGRlc3REaXIsIG1vdmVSb290KTtcbiAgICAgICAgfSlcbiAgICAgICAgLnRoZW4oKGNvdW50ZXJwYXJ0RGVzdERpcikgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuZGVsZXRlKClcbiAgICAgICAgICAgIC50aGVuKCgpID0+IHtcbiAgICAgICAgICAgICAgICByZXR1cm4gY291bnRlcnBhcnREZXN0RGlyO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgIH1cbn1cbiJdfQ==
