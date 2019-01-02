"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var fs = require("fs");
var path = require("path");
var crypto = require("crypto");
var _ = require("lodash");
var BBPromise = require("bluebird");
var listenerTracker_1 = require("./listenerTracker");
var promiseHelpers_1 = require("./promiseHelpers");
var directory_1 = require("./directory");
var pathHelpers_1 = require("./pathHelpers");
var unlinkAsync = promiseHelpers_1.promisify1(fs.unlink);
var statAsync = promiseHelpers_1.promisify1(fs.stat);
var utimesAsync = promiseHelpers_1.promisify3(fs.utimes);
var writeFileAsync = promiseHelpers_1.promisify3(fs.writeFile);
/**
 * Calculates the destination file name when a source file is copied.
 * @param srcFile - The file being copied
 * @param dstDirOrFile - If a File, specifies the destination directory and file
 * name.  If a directory, specifies only the destination directory and
 * destFileName specifies the destination file name.
 * @param dstFileName - When destDirOrFile is a Directory, optionally specifies
 * the destination file name.  If omitted, the destination file name will be the
 * same as the source.
 * @return The destination file
 */
function calcDestFile(srcFile, dstDirOrFile, dstFileName) {
    var destFile;
    if (dstDirOrFile instanceof File) {
        // The caller has specified the destination directory and file
        // name in the form of a File.
        destFile = dstDirOrFile;
    }
    else {
        // The caller has specified the destination directory and
        // optionally a new file name.
        if (dstFileName === undefined) {
            destFile = new File(dstDirOrFile, srcFile.fileName);
        }
        else {
            destFile = new File(dstDirOrFile, dstFileName);
        }
    }
    return destFile;
}
var File = /** @class */ (function () {
    // endregion
    function File(pathPart) {
        var pathParts = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            pathParts[_i - 1] = arguments[_i];
        }
        var allParts = [pathPart].concat(pathParts);
        this._filePath = pathHelpers_1.reducePathParts(allParts);
    }
    Object.defineProperty(File.prototype, "dirName", {
        /**
         * Gets the directory portion of this file's path (everything before the
         * file name and extension).
         * @return The directory portion of this file's path.  This string will
         * always end with the OS's directory separator ("/").
         */
        get: function () {
            return path.dirname(this._filePath) + path.sep;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(File.prototype, "baseName", {
        /**
         * Gets this file's base name.  This is the part of the file name preceding
         * the extension.
         * @return This file's base name.
         */
        get: function () {
            var extName = path.extname(this._filePath);
            return path.basename(this._filePath, extName);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(File.prototype, "fileName", {
        /**
         * Gets the full file name of this file.  This includes both the base name
         * and extension.
         * @return This file's file name
         */
        get: function () {
            return path.basename(this._filePath);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(File.prototype, "extName", {
        /**
         * Gets the extension of this file.  This includes the initial dot (".").
         * @return This file's extension
         */
        get: function () {
            return path.extname(this._filePath);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(File.prototype, "directory", {
        /**
         * Gets the directory containing this file
         * @return A Directory object representing this file's directory.
         */
        get: function () {
            var dirName = path.dirname(this._filePath);
            return new directory_1.Directory(dirName);
        },
        enumerable: true,
        configurable: true
    });
    File.prototype.toString = function () {
        return this._filePath;
    };
    File.prototype.equals = function (otherFile) {
        return this.absPath() === otherFile.absPath();
    };
    /**
     * Checks to see if this File exists.
     * @return A Promise that is always resolved.  It is resolved with a truthy
     * fs.Stats object if it exists.  Otherwise, it is resolved with undefined.
     */
    File.prototype.exists = function () {
        var _this = this;
        return new BBPromise(function (resolve) {
            fs.stat(_this._filePath, function (err, stats) {
                if (!err && stats.isFile()) {
                    resolve(stats);
                }
                else {
                    resolve(undefined);
                }
            });
        });
    };
    File.prototype.existsSync = function () {
        try {
            var stats = fs.statSync(this._filePath);
            return stats.isFile() ? stats : undefined;
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
    /**
     * Sets the access mode bits for this file
     * @param mode - Numeric value representing the new access modes.  See
     * fs.constants.S_I*.
     * @return A promise for this file (for easy chaining)
     */
    File.prototype.chmod = function (mode) {
        var _this = this;
        return new BBPromise(function (resolve, reject) {
            fs.chmod(_this._filePath, mode, function (err) {
                if (err) {
                    reject(err);
                    return;
                }
                resolve(_this);
            });
        });
    };
    /**
     * Sets the access mode bits for this file
     * @param mode - Numeric value representing the new access modes.  See
     * fs.constants.S_I*.
     * @return A promise for this file (for easy chaining)
     */
    File.prototype.chmodSync = function (mode) {
        fs.chmodSync(this._filePath, mode);
    };
    File.prototype.absPath = function () {
        return path.resolve(this._filePath);
    };
    File.prototype.absolute = function () {
        return new File(this.absPath());
    };
    File.prototype.delete = function () {
        var _this = this;
        return this.exists()
            .then(function (stats) {
            if (!stats) {
                return BBPromise.resolve();
            }
            else {
                return unlinkAsync(_this._filePath);
            }
        });
    };
    File.prototype.deleteSync = function () {
        if (!this.existsSync()) {
            return;
        }
        fs.unlinkSync(this._filePath);
    };
    /**
     * Copies this file to the specified destination.  Preserves the file's last
     * accessed time (atime) and last modified time (mtime).
     * @param dstDirOrFile - If a File, specifies the
     * destination directory and file name.  If a directory, specifies only the
     * destination directory and destFileName specifies the destination file
     * name.
     * @param dstFileName - When destDirOrFile is a Directory,
     * optionally specifies the destination file name.  If omitted, the
     * destination file name will be the same as the source (this File).
     * @param options - Options for copying the file
     * @return A Promise for a File representing the destination file.
     */
    File.prototype.copy = function (dstDirOrFile, dstFileName, options) {
        var _this = this;
        var realOptions = _.defaults(options, { overwrite: false });
        //
        // Based on the parameters, figure out what the destination file path is
        // going to be.
        //
        var destFile = calcDestFile(this, dstDirOrFile, dstFileName);
        return promiseHelpers_1.allSettled([this.getHash(), destFile.getHash()])
            .then(function (_a) {
            var srcHashInspection = _a[0], destHashInspection = _a[1];
            if (srcHashInspection.isRejected()) {
                // The source file does not exist.
                throw new Error("Source file " + _this._filePath + " does not exist.");
            }
            else if (destHashInspection.isFulfilled()) {
                // The destination file already exists.
                if (srcHashInspection.value() === destHashInspection.value()) {
                    // The files are identical, so there is nothing to do.
                    return destFile;
                }
                else if (!realOptions.overwrite) {
                    throw new Error("Source file " + _this._filePath + " cannot be copied because it would overwrite " + destFile._filePath + ".");
                }
            }
            // At this point, it is ok to continue with the file copy.
            // Make sure the directory for the destination file exists.
            return destFile.directory.ensureExists()
                .then(function () {
                //
                // Do the copy.
                //
                return copyFile(_this._filePath, destFile.toString(), { preserveTimestamps: true });
            })
                .then(function () {
                return destFile;
            });
        });
    };
    /**
     * Copies this file to the specified destination.  Preserves the file's last
     * accessed time (atime) and last modified time (mtime).
     * @param dstDirOrFile - If a File, specifies the
     * destination directory and file name.  If a directory, specifies only the
     * destination directory and destFileName specifies the destination file
     * name.
     * @param dstFileName - When destDirOrFile is a Directory,
     * optionally specifies the destination file name.  If omitted, the
     * destination file name will be the same as the source (this File).
     * @param options - Options for copying the file
     * @return A File representing the destination file.
     */
    File.prototype.copySync = function (dstDirOrFile, dstFileName, options) {
        var realOptions = _.defaults(options, { overwrite: false });
        //
        // Based on the parameters, figure out what the destination file path is
        // going to be.
        //
        var destFile = calcDestFile(this, dstDirOrFile, dstFileName);
        var srcHash;
        var dstHash;
        // Make sure the source file exists.
        try {
            srcHash = this.getHashSync();
        }
        catch (err) {
            throw new Error("Source file " + this._filePath + " does not exist.");
        }
        try {
            dstHash = destFile.getHashSync();
        }
        catch (err) {
            // The destination file does not exists.  That's completely ok.
            // Just eat the exception.
        }
        // This if statement is moved outside of the above try/catch so that the
        // thrown Error object will not be caught locally.
        if (dstHash) {
            // The destination file exists.
            if (srcHash === dstHash) {
                // The files are identical, so there is nothing to do.
                return destFile;
            }
            else if (!realOptions.overwrite) {
                throw new Error("Source file " + this._filePath + " cannot be copied because it would overwrite " + destFile._filePath + ".");
            }
        }
        // At this point is is ok to go ahead with the file copy.
        // Make sure the directory for the destination file exists.
        destFile.directory.ensureExistsSync();
        //
        // Do the copy.
        //
        copyFileSync(this._filePath, destFile.toString(), { preserveTimestamps: true });
        return destFile;
    };
    /**
     * Moves this file to the specified destination.  Preserves the file's last
     * accessed time (atime) and last modified time (mtime).
     * @param dstDirOrFile - If a File, specifies the
     * destination directory and file name.  If a directory, specifies only the
     * destination directory and destFileName specifies the destination file
     * name.
     * @param dstFileName - When destDirOrFile is a Directory,
     * optionally specifies the destination file name.  If omitted, the
     * destination file name will be the same as the source (this File).
     * @return A Promise for a File representing the destination file.
     */
    File.prototype.move = function (dstDirOrFile, dstFileName, options) {
        var _this = this;
        // Copy the file.
        return this.copy(dstDirOrFile, dstFileName, options)
            .then(function (dstFile) {
            //
            // Delete the source file.
            //
            return _this.delete()
                .then(function () {
                return dstFile;
            });
        });
    };
    /**
     * Moves this file to the specified destination.  Preserves the file's last
     * accessed time (atime) and last modified time (mtime).
     * @param dstDirOrFile - If a File, specifies the
     * destination directory and file name.  If a directory, specifies only the
     * destination directory and destFileName specifies the destination file
     * name.
     * @param dstFileName - When destDirOrFile is a Directory,
     * optionally specifies the destination file name.  If omitted, the
     * destination file name will be the same as the source (this File).
     * @return A File representing the destination file.
     */
    File.prototype.moveSync = function (dstDirOrFile, dstFileName, options) {
        //
        // Do the copy.
        //
        var dstFile = this.copySync(dstDirOrFile, dstFileName, options);
        //
        // Delete the source file.
        //
        this.deleteSync();
        return dstFile;
    };
    /**
     * Writes text to this file, replacing the file if it exists.  If any parent
     * directories do not exist, they are created.
     * @param text - The new contents of this file
     * @return A Promise that is resolved when the file has been written.
     */
    File.prototype.write = function (text) {
        var _this = this;
        return this.directory.ensureExists()
            .then(function () {
            return writeFileAsync(_this._filePath, text, "utf8");
        });
    };
    /**
     * Writes text to this file, replacing the file if it exists.  If any parent
     * directories do not exist, they are created.
     * @param text - The new contents of this file
     */
    File.prototype.writeSync = function (text) {
        this.directory.ensureExistsSync();
        fs.writeFileSync(this._filePath, text);
    };
    /**
     * Writes JSON data to this file, replacing the file if it exists.  If any
     * parent directories do not exist, they are created.
     * @param data - The data to be stringified and written
     * @return A Promise that is resolved when the file has been written
     */
    File.prototype.writeJson = function (data) {
        var jsonText = JSON.stringify(data, undefined, 4);
        return this.write(jsonText);
    };
    /**
     * Writes JSON data to this file, replacing the file if it exists.  If any
     * parent directories do not exist, they are created.
     * @param data - The data to be stringified and written
     */
    File.prototype.writeJsonSync = function (data) {
        var jsonText = JSON.stringify(data, undefined, 4);
        return this.writeSync(jsonText);
    };
    /**
     * Calculates a hash of this file's content
     * @param algorithm - The hashing algorithm to use.  For example, "md5",
     * "sha256", "sha512".  To see algorithms available on your platform, run
     * `openssl list-message-digest-algorithms`.
     * @return A Promise for a hexadecimal string containing the hash
     */
    File.prototype.getHash = function (algorithm) {
        var _this = this;
        if (algorithm === void 0) { algorithm = "md5"; }
        return new BBPromise(function (resolve, reject) {
            var input = fs.createReadStream(_this._filePath);
            var hash = crypto.createHash(algorithm);
            hash.setEncoding("hex");
            input
                .on("error", function (error) {
                reject(new Error(error));
            })
                .on("end", function () {
                hash.end();
                var hashValue = hash.read();
                resolve(hashValue);
            });
            input
                .pipe(hash);
        });
    };
    /**
     * Calculates a hash of this file's content
     * @param algorithm - The hashing algorithm to use.  For example, "md5",
     * "sha256", "sha512".  To see algorithms available on your platform, run
     * `openssl list-message-digest-algorithms`.
     * @return A hexadecimal string containing the hash
     */
    File.prototype.getHashSync = function (algorithm) {
        if (algorithm === void 0) { algorithm = "md5"; }
        var fileData = fs.readFileSync(this._filePath);
        var hash = crypto.createHash(algorithm);
        hash.update(fileData);
        return hash.digest("hex");
    };
    /**
     * Reads the contents of this file as a string.  Rejects if this file does
     * not exist.
     * @return A Promise for the text contents of this file
     */
    File.prototype.read = function () {
        var _this = this;
        return new BBPromise(function (resolve, reject) {
            fs.readFile(_this._filePath, { encoding: "utf8" }, function (err, data) {
                if (err) {
                    reject(err);
                    return;
                }
                resolve(data);
            });
        });
    };
    /**
     * Reads the contents of this file as a string.  Throws if this file does
     * not exist.
     * @return This file's contents
     */
    File.prototype.readSync = function () {
        return fs.readFileSync(this._filePath, { encoding: "utf8" });
    };
    /**
     * Reads JSON data from this file.  Rejects if this file does not exist.
     * @return {Promise<T>} A promise for the parsed data contained in this file
     */
    File.prototype.readJson = function () {
        return this.read()
            .then(function (text) {
            return JSON.parse(text);
        });
    };
    /**
     * Reads JSON data from this file.  Throws if this file does not exist.
     * @return {T} The parsed data contained in this file
     */
    File.prototype.readJsonSync = function () {
        var text = this.readSync();
        return JSON.parse(text);
    };
    return File;
}());
exports.File = File;
/**
 * Copies a file.
 * @param sourceFilePath - The path to the source file
 * @param destFilePath - The path to the destination file
 * @param options - Options for the copy operation
 * @return A Promise that is resolved when the file has been copied.
 */
function copyFile(sourceFilePath, destFilePath, options) {
    //
    // Design Note
    // We could have used fs.readFile() and fs.writeFile() here, but that would
    // read the entire file contents of the source file into memory.  It is
    // thought that using streams is more efficient and performant because
    // streams can read and write smaller chunks of the data.
    //
    return new BBPromise(function (resolve, reject) {
        var readStream = fs.createReadStream(sourceFilePath);
        var readListenerTracker = new listenerTracker_1.ListenerTracker(readStream);
        var writeStream = fs.createWriteStream(destFilePath);
        var writeListenerTracker = new listenerTracker_1.ListenerTracker(writeStream);
        readListenerTracker.on("error", function (err) {
            reject(err);
            readListenerTracker.removeAll();
            writeListenerTracker.removeAll();
        });
        writeListenerTracker.on("error", function (err) {
            reject(err);
            readListenerTracker.removeAll();
            writeListenerTracker.removeAll();
        });
        writeListenerTracker.on("close", function () {
            resolve();
            readListenerTracker.removeAll();
            writeListenerTracker.removeAll();
        });
        readStream.pipe(writeStream);
    })
        .then(function () {
        if (options && options.preserveTimestamps) {
            //
            // The caller wants to preserve the source file's timestamps.  Copy
            // them to the destination file now.
            //
            return statAsync(sourceFilePath)
                .then(function (srcStats) {
                //
                // Note:  Setting the timestamps on dest requires us to specify
                // the timestamp in seconds (not milliseconds).  When we divide
                // by 1000 below and truncation happens, we are actually setting
                // dest's timestamps *before* those of of source.
                //
                return utimesAsync(destFilePath, srcStats.atime.valueOf() / 1000, srcStats.mtime.valueOf() / 1000);
            });
        }
    });
}
/**
 * Copies a file synchronously.
 * @param sourceFilePath - The path to the source file
 * @param destFilePath - The path to the destination file
 * @param options - Options for the copy operation
 */
function copyFileSync(sourceFilePath, destFilePath, options) {
    var data = fs.readFileSync(sourceFilePath);
    fs.writeFileSync(destFilePath, data);
    if (options && options.preserveTimestamps) {
        var srcStats = fs.statSync(sourceFilePath);
        fs.utimesSync(destFilePath, srcStats.atime.valueOf() / 1000, srcStats.mtime.valueOf() / 1000);
    }
}

//# sourceMappingURL=data:application/json;charset=utf8;base64,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Z0VBQWdFO2dCQUNoRSxpREFBaUQ7Z0JBQ2pELEVBQUU7Z0JBQ0YsT0FBTyxXQUFXLENBQUMsWUFBWSxFQUFFLFFBQVEsQ0FBQyxLQUFLLENBQUMsT0FBTyxFQUFFLEdBQUcsSUFBSSxFQUFFLFFBQVEsQ0FBQyxLQUFLLENBQUMsT0FBTyxFQUFFLEdBQUcsSUFBSSxDQUFDLENBQUM7WUFDdkcsQ0FBQyxDQUFDLENBQUM7U0FDTjtJQUNMLENBQUMsQ0FBQyxDQUFDO0FBQ1AsQ0FBQztBQUdEOzs7OztHQUtHO0FBQ0gsc0JBQXNCLGNBQXNCLEVBQUUsWUFBb0IsRUFBRSxPQUFzQjtJQUV0RixJQUFNLElBQUksR0FBVyxFQUFFLENBQUMsWUFBWSxDQUFDLGNBQWMsQ0FBQyxDQUFDO0lBQ3JELEVBQUUsQ0FBQyxhQUFhLENBQUMsWUFBWSxFQUFFLElBQUksQ0FBQyxDQUFDO0lBRXJDLElBQUksT0FBTyxJQUFJLE9BQU8sQ0FBQyxrQkFBa0IsRUFDekM7UUFDSSxJQUFNLFFBQVEsR0FBRyxFQUFFLENBQUMsUUFBUSxDQUFDLGNBQWMsQ0FBQyxDQUFDO1FBQzdDLEVBQUUsQ0FBQyxVQUFVLENBQUMsWUFBWSxFQUFFLFFBQVEsQ0FBQyxLQUFLLENBQUMsT0FBTyxFQUFFLEdBQUcsSUFBSSxFQUFFLFFBQVEsQ0FBQyxLQUFLLENBQUMsT0FBTyxFQUFFLEdBQUcsSUFBSSxDQUFDLENBQUM7S0FDakc7QUFDTCxDQUFDIiwiZmlsZSI6ImRlcG90L2ZpbGUuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgKiBhcyBmcyBmcm9tIFwiZnNcIjtcbmltcG9ydCAqIGFzIHBhdGggZnJvbSBcInBhdGhcIjtcbmltcG9ydCAqIGFzIGNyeXB0byBmcm9tIFwiY3J5cHRvXCI7XG5pbXBvcnQgKiBhcyBfIGZyb20gXCJsb2Rhc2hcIjtcbmltcG9ydCAqIGFzIEJCUHJvbWlzZSBmcm9tIFwiYmx1ZWJpcmRcIjtcbmltcG9ydCB7TGlzdGVuZXJUcmFja2VyfSBmcm9tIFwiLi9saXN0ZW5lclRyYWNrZXJcIjtcbmltcG9ydCB7cHJvbWlzaWZ5MSwgcHJvbWlzaWZ5MywgYWxsU2V0dGxlZH0gZnJvbSBcIi4vcHJvbWlzZUhlbHBlcnNcIjtcbmltcG9ydCB7RGlyZWN0b3J5fSBmcm9tIFwiLi9kaXJlY3RvcnlcIjtcbmltcG9ydCB7UGF0aFBhcnQsIHJlZHVjZVBhdGhQYXJ0c30gZnJvbSBcIi4vcGF0aEhlbHBlcnNcIjtcblxuXG5jb25zdCB1bmxpbmtBc3luYyA9IHByb21pc2lmeTE8dm9pZCwgc3RyaW5nPihmcy51bmxpbmspO1xuY29uc3Qgc3RhdEFzeW5jICAgPSBwcm9taXNpZnkxPGZzLlN0YXRzLCBzdHJpbmc+KGZzLnN0YXQpO1xuY29uc3QgdXRpbWVzQXN5bmMgPSBwcm9taXNpZnkzPHZvaWQsIHN0cmluZywgc3RyaW5nIHwgbnVtYmVyIHwgRGF0ZSwgc3RyaW5nIHwgbnVtYmVyIHwgRGF0ZT4oZnMudXRpbWVzKTtcbmNvbnN0IHdyaXRlRmlsZUFzeW5jID0gcHJvbWlzaWZ5MzxcbiAgICB2b2lkLFxuICAgIGZzLlBhdGhMaWtlIHwgbnVtYmVyLCBhbnksXG4gICAgeyBlbmNvZGluZz86IHN0cmluZyB8IG51bGw7IG1vZGU/OiBudW1iZXIgfCBzdHJpbmc7IGZsYWc/OiBzdHJpbmc7IH0gfCBzdHJpbmcgfCB1bmRlZmluZWQgfCBudWxsXG4gICAgPihmcy53cml0ZUZpbGUpO1xuXG5cbmV4cG9ydCBpbnRlcmZhY2UgSUZpbGVDb3B5T3B0aW9uc1xue1xuICAgIG92ZXJ3cml0ZTogYm9vbGVhbjtcbn1cblxuXG4vKipcbiAqIENhbGN1bGF0ZXMgdGhlIGRlc3RpbmF0aW9uIGZpbGUgbmFtZSB3aGVuIGEgc291cmNlIGZpbGUgaXMgY29waWVkLlxuICogQHBhcmFtIHNyY0ZpbGUgLSBUaGUgZmlsZSBiZWluZyBjb3BpZWRcbiAqIEBwYXJhbSBkc3REaXJPckZpbGUgLSBJZiBhIEZpbGUsIHNwZWNpZmllcyB0aGUgZGVzdGluYXRpb24gZGlyZWN0b3J5IGFuZCBmaWxlXG4gKiBuYW1lLiAgSWYgYSBkaXJlY3RvcnksIHNwZWNpZmllcyBvbmx5IHRoZSBkZXN0aW5hdGlvbiBkaXJlY3RvcnkgYW5kXG4gKiBkZXN0RmlsZU5hbWUgc3BlY2lmaWVzIHRoZSBkZXN0aW5hdGlvbiBmaWxlIG5hbWUuXG4gKiBAcGFyYW0gZHN0RmlsZU5hbWUgLSBXaGVuIGRlc3REaXJPckZpbGUgaXMgYSBEaXJlY3RvcnksIG9wdGlvbmFsbHkgc3BlY2lmaWVzXG4gKiB0aGUgZGVzdGluYXRpb24gZmlsZSBuYW1lLiAgSWYgb21pdHRlZCwgdGhlIGRlc3RpbmF0aW9uIGZpbGUgbmFtZSB3aWxsIGJlIHRoZVxuICogc2FtZSBhcyB0aGUgc291cmNlLlxuICogQHJldHVybiBUaGUgZGVzdGluYXRpb24gZmlsZVxuICovXG5mdW5jdGlvbiBjYWxjRGVzdEZpbGUoc3JjRmlsZTogRmlsZSwgZHN0RGlyT3JGaWxlOiBEaXJlY3RvcnkgfCBGaWxlLCBkc3RGaWxlTmFtZT86IHN0cmluZyk6IEZpbGVcbntcbiAgICBsZXQgZGVzdEZpbGU6IEZpbGU7XG5cbiAgICBpZiAoZHN0RGlyT3JGaWxlIGluc3RhbmNlb2YgRmlsZSkge1xuICAgICAgICAvLyBUaGUgY2FsbGVyIGhhcyBzcGVjaWZpZWQgdGhlIGRlc3RpbmF0aW9uIGRpcmVjdG9yeSBhbmQgZmlsZVxuICAgICAgICAvLyBuYW1lIGluIHRoZSBmb3JtIG9mIGEgRmlsZS5cbiAgICAgICAgZGVzdEZpbGUgPSBkc3REaXJPckZpbGU7XG4gICAgfVxuICAgIGVsc2VcbiAgICB7XG4gICAgICAgIC8vIFRoZSBjYWxsZXIgaGFzIHNwZWNpZmllZCB0aGUgZGVzdGluYXRpb24gZGlyZWN0b3J5IGFuZFxuICAgICAgICAvLyBvcHRpb25hbGx5IGEgbmV3IGZpbGUgbmFtZS5cbiAgICAgICAgaWYgKGRzdEZpbGVOYW1lID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIGRlc3RGaWxlID0gbmV3IEZpbGUoZHN0RGlyT3JGaWxlLCBzcmNGaWxlLmZpbGVOYW1lKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGRlc3RGaWxlID0gbmV3IEZpbGUoZHN0RGlyT3JGaWxlLCBkc3RGaWxlTmFtZSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gZGVzdEZpbGU7XG59XG5cblxuZXhwb3J0IGNsYXNzIEZpbGVcbntcbiAgICAvLyByZWdpb24gRGF0YSBNZW1iZXJzXG4gICAgcHJpdmF0ZSByZWFkb25seSBfZmlsZVBhdGg6IHN0cmluZztcbiAgICAvLyBlbmRyZWdpb25cblxuXG4gICAgcHVibGljIGNvbnN0cnVjdG9yKHBhdGhQYXJ0OiBQYXRoUGFydCwgLi4ucGF0aFBhcnRzOiBBcnJheTxQYXRoUGFydD4pXG4gICAge1xuICAgICAgICBjb25zdCBhbGxQYXJ0czogQXJyYXk8UGF0aFBhcnQ+ID0gW3BhdGhQYXJ0XS5jb25jYXQocGF0aFBhcnRzKTtcbiAgICAgICAgdGhpcy5fZmlsZVBhdGggPSByZWR1Y2VQYXRoUGFydHMoYWxsUGFydHMpO1xuICAgIH1cblxuXG4gICAgLyoqXG4gICAgICogR2V0cyB0aGUgZGlyZWN0b3J5IHBvcnRpb24gb2YgdGhpcyBmaWxlJ3MgcGF0aCAoZXZlcnl0aGluZyBiZWZvcmUgdGhlXG4gICAgICogZmlsZSBuYW1lIGFuZCBleHRlbnNpb24pLlxuICAgICAqIEByZXR1cm4gVGhlIGRpcmVjdG9yeSBwb3J0aW9uIG9mIHRoaXMgZmlsZSdzIHBhdGguICBUaGlzIHN0cmluZyB3aWxsXG4gICAgICogYWx3YXlzIGVuZCB3aXRoIHRoZSBPUydzIGRpcmVjdG9yeSBzZXBhcmF0b3IgKFwiL1wiKS5cbiAgICAgKi9cbiAgICBwdWJsaWMgZ2V0IGRpck5hbWUoKTogc3RyaW5nXG4gICAge1xuICAgICAgICByZXR1cm4gcGF0aC5kaXJuYW1lKHRoaXMuX2ZpbGVQYXRoKSArIHBhdGguc2VwO1xuICAgIH1cblxuXG4gICAgLyoqXG4gICAgICogR2V0cyB0aGlzIGZpbGUncyBiYXNlIG5hbWUuICBUaGlzIGlzIHRoZSBwYXJ0IG9mIHRoZSBmaWxlIG5hbWUgcHJlY2VkaW5nXG4gICAgICogdGhlIGV4dGVuc2lvbi5cbiAgICAgKiBAcmV0dXJuIFRoaXMgZmlsZSdzIGJhc2UgbmFtZS5cbiAgICAgKi9cbiAgICBwdWJsaWMgZ2V0IGJhc2VOYW1lKCk6IHN0cmluZ1xuICAgIHtcbiAgICAgICAgY29uc3QgZXh0TmFtZTogc3RyaW5nID0gcGF0aC5leHRuYW1lKHRoaXMuX2ZpbGVQYXRoKTtcbiAgICAgICAgcmV0dXJuIHBhdGguYmFzZW5hbWUodGhpcy5fZmlsZVBhdGgsIGV4dE5hbWUpO1xuICAgIH1cblxuXG4gICAgLyoqXG4gICAgICogR2V0cyB0aGUgZnVsbCBmaWxlIG5hbWUgb2YgdGhpcyBmaWxlLiAgVGhpcyBpbmNsdWRlcyBib3RoIHRoZSBiYXNlIG5hbWVcbiAgICAgKiBhbmQgZXh0ZW5zaW9uLlxuICAgICAqIEByZXR1cm4gVGhpcyBmaWxlJ3MgZmlsZSBuYW1lXG4gICAgICovXG4gICAgcHVibGljIGdldCBmaWxlTmFtZSgpOiBzdHJpbmdcbiAgICB7XG4gICAgICAgIHJldHVybiBwYXRoLmJhc2VuYW1lKHRoaXMuX2ZpbGVQYXRoKTtcbiAgICB9XG5cblxuICAgIC8qKlxuICAgICAqIEdldHMgdGhlIGV4dGVuc2lvbiBvZiB0aGlzIGZpbGUuICBUaGlzIGluY2x1ZGVzIHRoZSBpbml0aWFsIGRvdCAoXCIuXCIpLlxuICAgICAqIEByZXR1cm4gVGhpcyBmaWxlJ3MgZXh0ZW5zaW9uXG4gICAgICovXG4gICAgcHVibGljIGdldCBleHROYW1lKCk6IHN0cmluZ1xuICAgIHtcbiAgICAgICAgcmV0dXJuIHBhdGguZXh0bmFtZSh0aGlzLl9maWxlUGF0aCk7XG4gICAgfVxuXG5cbiAgICAvKipcbiAgICAgKiBHZXRzIHRoZSBkaXJlY3RvcnkgY29udGFpbmluZyB0aGlzIGZpbGVcbiAgICAgKiBAcmV0dXJuIEEgRGlyZWN0b3J5IG9iamVjdCByZXByZXNlbnRpbmcgdGhpcyBmaWxlJ3MgZGlyZWN0b3J5LlxuICAgICAqL1xuICAgIHB1YmxpYyBnZXQgZGlyZWN0b3J5KCk6IERpcmVjdG9yeVxuICAgIHtcbiAgICAgICAgY29uc3QgZGlyTmFtZTogc3RyaW5nID0gcGF0aC5kaXJuYW1lKHRoaXMuX2ZpbGVQYXRoKTtcbiAgICAgICAgcmV0dXJuIG5ldyBEaXJlY3RvcnkoZGlyTmFtZSk7XG4gICAgfVxuXG5cbiAgICBwdWJsaWMgdG9TdHJpbmcoKTogc3RyaW5nXG4gICAge1xuICAgICAgICByZXR1cm4gdGhpcy5fZmlsZVBhdGg7XG4gICAgfVxuXG5cbiAgICBwdWJsaWMgZXF1YWxzKG90aGVyRmlsZTogRmlsZSk6IGJvb2xlYW5cbiAgICB7XG4gICAgICAgIHJldHVybiB0aGlzLmFic1BhdGgoKSA9PT0gb3RoZXJGaWxlLmFic1BhdGgoKTtcbiAgICB9XG5cblxuICAgIC8qKlxuICAgICAqIENoZWNrcyB0byBzZWUgaWYgdGhpcyBGaWxlIGV4aXN0cy5cbiAgICAgKiBAcmV0dXJuIEEgUHJvbWlzZSB0aGF0IGlzIGFsd2F5cyByZXNvbHZlZC4gIEl0IGlzIHJlc29sdmVkIHdpdGggYSB0cnV0aHlcbiAgICAgKiBmcy5TdGF0cyBvYmplY3QgaWYgaXQgZXhpc3RzLiAgT3RoZXJ3aXNlLCBpdCBpcyByZXNvbHZlZCB3aXRoIHVuZGVmaW5lZC5cbiAgICAgKi9cbiAgICBwdWJsaWMgZXhpc3RzKCk6IFByb21pc2U8ZnMuU3RhdHMgfCB1bmRlZmluZWQ+XG4gICAge1xuICAgICAgICByZXR1cm4gbmV3IEJCUHJvbWlzZTxmcy5TdGF0cyB8IHVuZGVmaW5lZD4oKHJlc29sdmU6IChyZXN1bHQ6IGZzLlN0YXRzIHwgdW5kZWZpbmVkKSA9PiB2b2lkKSA9PiB7XG4gICAgICAgICAgICBmcy5zdGF0KHRoaXMuX2ZpbGVQYXRoLCAoZXJyOiBhbnksIHN0YXRzOiBmcy5TdGF0cykgPT4ge1xuXG4gICAgICAgICAgICAgICAgaWYgKCFlcnIgJiYgc3RhdHMuaXNGaWxlKCkpXG4gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICByZXNvbHZlKHN0YXRzKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZSh1bmRlZmluZWQpO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuXG4gICAgcHVibGljIGV4aXN0c1N5bmMoKTogZnMuU3RhdHMgfCB1bmRlZmluZWRcbiAgICB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBjb25zdCBzdGF0cyA9IGZzLnN0YXRTeW5jKHRoaXMuX2ZpbGVQYXRoKTtcbiAgICAgICAgICAgIHJldHVybiBzdGF0cy5pc0ZpbGUoKSA/IHN0YXRzIDogdW5kZWZpbmVkO1xuICAgICAgICB9XG4gICAgICAgIGNhdGNoIChlcnIpIHtcbiAgICAgICAgICAgIGlmIChlcnIuY29kZSA9PT0gXCJFTk9FTlRcIilcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIHRocm93IGVycjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuXG4gICAgLyoqXG4gICAgICogU2V0cyB0aGUgYWNjZXNzIG1vZGUgYml0cyBmb3IgdGhpcyBmaWxlXG4gICAgICogQHBhcmFtIG1vZGUgLSBOdW1lcmljIHZhbHVlIHJlcHJlc2VudGluZyB0aGUgbmV3IGFjY2VzcyBtb2Rlcy4gIFNlZVxuICAgICAqIGZzLmNvbnN0YW50cy5TX0kqLlxuICAgICAqIEByZXR1cm4gQSBwcm9taXNlIGZvciB0aGlzIGZpbGUgKGZvciBlYXN5IGNoYWluaW5nKVxuICAgICAqL1xuICAgIHB1YmxpYyBjaG1vZChtb2RlOiBudW1iZXIpOiBQcm9taXNlPEZpbGU+XG4gICAge1xuICAgICAgICByZXR1cm4gbmV3IEJCUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICAgICAgICBmcy5jaG1vZCh0aGlzLl9maWxlUGF0aCwgbW9kZSwgKGVycikgPT4ge1xuICAgICAgICAgICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICAgICAgICAgICAgcmVqZWN0KGVycik7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICByZXNvbHZlKHRoaXMpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuXG4gICAgLyoqXG4gICAgICogU2V0cyB0aGUgYWNjZXNzIG1vZGUgYml0cyBmb3IgdGhpcyBmaWxlXG4gICAgICogQHBhcmFtIG1vZGUgLSBOdW1lcmljIHZhbHVlIHJlcHJlc2VudGluZyB0aGUgbmV3IGFjY2VzcyBtb2Rlcy4gIFNlZVxuICAgICAqIGZzLmNvbnN0YW50cy5TX0kqLlxuICAgICAqIEByZXR1cm4gQSBwcm9taXNlIGZvciB0aGlzIGZpbGUgKGZvciBlYXN5IGNoYWluaW5nKVxuICAgICAqL1xuICAgIHB1YmxpYyBjaG1vZFN5bmMobW9kZTogbnVtYmVyKTogdm9pZCB7XG4gICAgICAgIGZzLmNobW9kU3luYyh0aGlzLl9maWxlUGF0aCwgbW9kZSk7XG4gICAgfVxuXG5cbiAgICBwdWJsaWMgYWJzUGF0aCgpOiBzdHJpbmdcbiAgICB7XG4gICAgICAgIHJldHVybiBwYXRoLnJlc29sdmUodGhpcy5fZmlsZVBhdGgpO1xuICAgIH1cblxuXG4gICAgcHVibGljIGFic29sdXRlKCk6IEZpbGVcbiAgICB7XG4gICAgICAgIHJldHVybiBuZXcgRmlsZSh0aGlzLmFic1BhdGgoKSk7XG4gICAgfVxuXG5cbiAgICBwdWJsaWMgZGVsZXRlKCk6IFByb21pc2U8dm9pZD5cbiAgICB7XG4gICAgICAgIHJldHVybiB0aGlzLmV4aXN0cygpXG4gICAgICAgIC50aGVuKChzdGF0cykgPT4ge1xuICAgICAgICAgICAgaWYgKCFzdGF0cykge1xuICAgICAgICAgICAgICAgIHJldHVybiBCQlByb21pc2UucmVzb2x2ZSgpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdW5saW5rQXN5bmModGhpcy5fZmlsZVBhdGgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9XG5cblxuICAgIHB1YmxpYyBkZWxldGVTeW5jKCk6IHZvaWRcbiAgICB7XG4gICAgICAgIGlmICghdGhpcy5leGlzdHNTeW5jKCkpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGZzLnVubGlua1N5bmModGhpcy5fZmlsZVBhdGgpO1xuICAgIH1cblxuXG4gICAgLyoqXG4gICAgICogQ29waWVzIHRoaXMgZmlsZSB0byB0aGUgc3BlY2lmaWVkIGRlc3RpbmF0aW9uLiAgUHJlc2VydmVzIHRoZSBmaWxlJ3MgbGFzdFxuICAgICAqIGFjY2Vzc2VkIHRpbWUgKGF0aW1lKSBhbmQgbGFzdCBtb2RpZmllZCB0aW1lIChtdGltZSkuXG4gICAgICogQHBhcmFtIGRzdERpck9yRmlsZSAtIElmIGEgRmlsZSwgc3BlY2lmaWVzIHRoZVxuICAgICAqIGRlc3RpbmF0aW9uIGRpcmVjdG9yeSBhbmQgZmlsZSBuYW1lLiAgSWYgYSBkaXJlY3RvcnksIHNwZWNpZmllcyBvbmx5IHRoZVxuICAgICAqIGRlc3RpbmF0aW9uIGRpcmVjdG9yeSBhbmQgZGVzdEZpbGVOYW1lIHNwZWNpZmllcyB0aGUgZGVzdGluYXRpb24gZmlsZVxuICAgICAqIG5hbWUuXG4gICAgICogQHBhcmFtIGRzdEZpbGVOYW1lIC0gV2hlbiBkZXN0RGlyT3JGaWxlIGlzIGEgRGlyZWN0b3J5LFxuICAgICAqIG9wdGlvbmFsbHkgc3BlY2lmaWVzIHRoZSBkZXN0aW5hdGlvbiBmaWxlIG5hbWUuICBJZiBvbWl0dGVkLCB0aGVcbiAgICAgKiBkZXN0aW5hdGlvbiBmaWxlIG5hbWUgd2lsbCBiZSB0aGUgc2FtZSBhcyB0aGUgc291cmNlICh0aGlzIEZpbGUpLlxuICAgICAqIEBwYXJhbSBvcHRpb25zIC0gT3B0aW9ucyBmb3IgY29weWluZyB0aGUgZmlsZVxuICAgICAqIEByZXR1cm4gQSBQcm9taXNlIGZvciBhIEZpbGUgcmVwcmVzZW50aW5nIHRoZSBkZXN0aW5hdGlvbiBmaWxlLlxuICAgICAqL1xuICAgIHB1YmxpYyBjb3B5KGRzdERpck9yRmlsZTogRGlyZWN0b3J5IHwgRmlsZSwgZHN0RmlsZU5hbWU/OiBzdHJpbmcsIG9wdGlvbnM/OiBJRmlsZUNvcHlPcHRpb25zKTogUHJvbWlzZTxGaWxlPlxuICAgIHtcbiAgICAgICAgY29uc3QgcmVhbE9wdGlvbnM6IElGaWxlQ29weU9wdGlvbnMgPSBfLmRlZmF1bHRzKG9wdGlvbnMsIHtvdmVyd3JpdGU6IGZhbHNlfSk7XG5cbiAgICAgICAgLy9cbiAgICAgICAgLy8gQmFzZWQgb24gdGhlIHBhcmFtZXRlcnMsIGZpZ3VyZSBvdXQgd2hhdCB0aGUgZGVzdGluYXRpb24gZmlsZSBwYXRoIGlzXG4gICAgICAgIC8vIGdvaW5nIHRvIGJlLlxuICAgICAgICAvL1xuICAgICAgICBjb25zdCBkZXN0RmlsZTogRmlsZSA9IGNhbGNEZXN0RmlsZSh0aGlzLCBkc3REaXJPckZpbGUsIGRzdEZpbGVOYW1lKTtcblxuICAgICAgICByZXR1cm4gYWxsU2V0dGxlZChbdGhpcy5nZXRIYXNoKCksIGRlc3RGaWxlLmdldEhhc2goKV0pXG4gICAgICAgIC50aGVuKChbc3JjSGFzaEluc3BlY3Rpb24sIGRlc3RIYXNoSW5zcGVjdGlvbl0pID0+IHtcblxuICAgICAgICAgICAgaWYgKHNyY0hhc2hJbnNwZWN0aW9uLmlzUmVqZWN0ZWQoKSkge1xuICAgICAgICAgICAgICAgIC8vIFRoZSBzb3VyY2UgZmlsZSBkb2VzIG5vdCBleGlzdC5cbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYFNvdXJjZSBmaWxlICR7dGhpcy5fZmlsZVBhdGh9IGRvZXMgbm90IGV4aXN0LmApO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZiAoZGVzdEhhc2hJbnNwZWN0aW9uLmlzRnVsZmlsbGVkKCkpIHtcbiAgICAgICAgICAgICAgICAvLyBUaGUgZGVzdGluYXRpb24gZmlsZSBhbHJlYWR5IGV4aXN0cy5cbiAgICAgICAgICAgICAgICBpZiAoc3JjSGFzaEluc3BlY3Rpb24udmFsdWUoKSA9PT0gZGVzdEhhc2hJbnNwZWN0aW9uLnZhbHVlKCkpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gVGhlIGZpbGVzIGFyZSBpZGVudGljYWwsIHNvIHRoZXJlIGlzIG5vdGhpbmcgdG8gZG8uXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBkZXN0RmlsZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSBpZiAoIXJlYWxPcHRpb25zLm92ZXJ3cml0ZSkge1xuICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYFNvdXJjZSBmaWxlICR7dGhpcy5fZmlsZVBhdGh9IGNhbm5vdCBiZSBjb3BpZWQgYmVjYXVzZSBpdCB3b3VsZCBvdmVyd3JpdGUgJHtkZXN0RmlsZS5fZmlsZVBhdGh9LmApO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gQXQgdGhpcyBwb2ludCwgaXQgaXMgb2sgdG8gY29udGludWUgd2l0aCB0aGUgZmlsZSBjb3B5LlxuICAgICAgICAgICAgLy8gTWFrZSBzdXJlIHRoZSBkaXJlY3RvcnkgZm9yIHRoZSBkZXN0aW5hdGlvbiBmaWxlIGV4aXN0cy5cbiAgICAgICAgICAgIHJldHVybiBkZXN0RmlsZS5kaXJlY3RvcnkuZW5zdXJlRXhpc3RzKClcbiAgICAgICAgICAgIC50aGVuKCgpID0+IHtcbiAgICAgICAgICAgICAgICAvL1xuICAgICAgICAgICAgICAgIC8vIERvIHRoZSBjb3B5LlxuICAgICAgICAgICAgICAgIC8vXG4gICAgICAgICAgICAgICAgcmV0dXJuIGNvcHlGaWxlKHRoaXMuX2ZpbGVQYXRoLCBkZXN0RmlsZS50b1N0cmluZygpLCB7cHJlc2VydmVUaW1lc3RhbXBzOiB0cnVlfSk7XG4gICAgICAgICAgICB9KVxuICAgICAgICAgICAgLnRoZW4oKCkgPT4ge1xuICAgICAgICAgICAgICAgIHJldHVybiBkZXN0RmlsZTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICB9XG5cblxuICAgIC8qKlxuICAgICAqIENvcGllcyB0aGlzIGZpbGUgdG8gdGhlIHNwZWNpZmllZCBkZXN0aW5hdGlvbi4gIFByZXNlcnZlcyB0aGUgZmlsZSdzIGxhc3RcbiAgICAgKiBhY2Nlc3NlZCB0aW1lIChhdGltZSkgYW5kIGxhc3QgbW9kaWZpZWQgdGltZSAobXRpbWUpLlxuICAgICAqIEBwYXJhbSBkc3REaXJPckZpbGUgLSBJZiBhIEZpbGUsIHNwZWNpZmllcyB0aGVcbiAgICAgKiBkZXN0aW5hdGlvbiBkaXJlY3RvcnkgYW5kIGZpbGUgbmFtZS4gIElmIGEgZGlyZWN0b3J5LCBzcGVjaWZpZXMgb25seSB0aGVcbiAgICAgKiBkZXN0aW5hdGlvbiBkaXJlY3RvcnkgYW5kIGRlc3RGaWxlTmFtZSBzcGVjaWZpZXMgdGhlIGRlc3RpbmF0aW9uIGZpbGVcbiAgICAgKiBuYW1lLlxuICAgICAqIEBwYXJhbSBkc3RGaWxlTmFtZSAtIFdoZW4gZGVzdERpck9yRmlsZSBpcyBhIERpcmVjdG9yeSxcbiAgICAgKiBvcHRpb25hbGx5IHNwZWNpZmllcyB0aGUgZGVzdGluYXRpb24gZmlsZSBuYW1lLiAgSWYgb21pdHRlZCwgdGhlXG4gICAgICogZGVzdGluYXRpb24gZmlsZSBuYW1lIHdpbGwgYmUgdGhlIHNhbWUgYXMgdGhlIHNvdXJjZSAodGhpcyBGaWxlKS5cbiAgICAgKiBAcGFyYW0gb3B0aW9ucyAtIE9wdGlvbnMgZm9yIGNvcHlpbmcgdGhlIGZpbGVcbiAgICAgKiBAcmV0dXJuIEEgRmlsZSByZXByZXNlbnRpbmcgdGhlIGRlc3RpbmF0aW9uIGZpbGUuXG4gICAgICovXG4gICAgcHVibGljIGNvcHlTeW5jKGRzdERpck9yRmlsZTogRGlyZWN0b3J5IHwgRmlsZSwgZHN0RmlsZU5hbWU/OiBzdHJpbmcsIG9wdGlvbnM/OiBJRmlsZUNvcHlPcHRpb25zKTogRmlsZVxuICAgIHtcbiAgICAgICAgY29uc3QgcmVhbE9wdGlvbnMgPSBfLmRlZmF1bHRzKG9wdGlvbnMsIHtvdmVyd3JpdGU6IGZhbHNlfSk7XG5cbiAgICAgICAgLy9cbiAgICAgICAgLy8gQmFzZWQgb24gdGhlIHBhcmFtZXRlcnMsIGZpZ3VyZSBvdXQgd2hhdCB0aGUgZGVzdGluYXRpb24gZmlsZSBwYXRoIGlzXG4gICAgICAgIC8vIGdvaW5nIHRvIGJlLlxuICAgICAgICAvL1xuICAgICAgICBjb25zdCBkZXN0RmlsZTogRmlsZSA9IGNhbGNEZXN0RmlsZSh0aGlzLCBkc3REaXJPckZpbGUsIGRzdEZpbGVOYW1lKTtcblxuICAgICAgICBsZXQgc3JjSGFzaDogc3RyaW5nIHwgdW5kZWZpbmVkO1xuICAgICAgICBsZXQgZHN0SGFzaDogc3RyaW5nIHwgdW5kZWZpbmVkO1xuXG4gICAgICAgIC8vIE1ha2Ugc3VyZSB0aGUgc291cmNlIGZpbGUgZXhpc3RzLlxuICAgICAgICB0cnkge1xuICAgICAgICAgICAgc3JjSGFzaCA9IHRoaXMuZ2V0SGFzaFN5bmMoKTtcbiAgICAgICAgfVxuICAgICAgICBjYXRjaCAoZXJyKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYFNvdXJjZSBmaWxlICR7dGhpcy5fZmlsZVBhdGh9IGRvZXMgbm90IGV4aXN0LmApO1xuICAgICAgICB9XG5cbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGRzdEhhc2ggPSBkZXN0RmlsZS5nZXRIYXNoU3luYygpO1xuICAgICAgICB9XG4gICAgICAgIGNhdGNoIChlcnIpIHtcbiAgICAgICAgICAgIC8vIFRoZSBkZXN0aW5hdGlvbiBmaWxlIGRvZXMgbm90IGV4aXN0cy4gIFRoYXQncyBjb21wbGV0ZWx5IG9rLlxuICAgICAgICAgICAgLy8gSnVzdCBlYXQgdGhlIGV4Y2VwdGlvbi5cbiAgICAgICAgfVxuXG4gICAgICAgIC8vIFRoaXMgaWYgc3RhdGVtZW50IGlzIG1vdmVkIG91dHNpZGUgb2YgdGhlIGFib3ZlIHRyeS9jYXRjaCBzbyB0aGF0IHRoZVxuICAgICAgICAvLyB0aHJvd24gRXJyb3Igb2JqZWN0IHdpbGwgbm90IGJlIGNhdWdodCBsb2NhbGx5LlxuICAgICAgICBpZiAoZHN0SGFzaCkge1xuICAgICAgICAgICAgLy8gVGhlIGRlc3RpbmF0aW9uIGZpbGUgZXhpc3RzLlxuICAgICAgICAgICAgaWYgKHNyY0hhc2ggPT09IGRzdEhhc2gpIHtcbiAgICAgICAgICAgICAgICAvLyBUaGUgZmlsZXMgYXJlIGlkZW50aWNhbCwgc28gdGhlcmUgaXMgbm90aGluZyB0byBkby5cbiAgICAgICAgICAgICAgICByZXR1cm4gZGVzdEZpbGU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmICghcmVhbE9wdGlvbnMub3ZlcndyaXRlKSB7XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBTb3VyY2UgZmlsZSAke3RoaXMuX2ZpbGVQYXRofSBjYW5ub3QgYmUgY29waWVkIGJlY2F1c2UgaXQgd291bGQgb3ZlcndyaXRlICR7ZGVzdEZpbGUuX2ZpbGVQYXRofS5gKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIC8vIEF0IHRoaXMgcG9pbnQgaXMgaXMgb2sgdG8gZ28gYWhlYWQgd2l0aCB0aGUgZmlsZSBjb3B5LlxuICAgICAgICAvLyBNYWtlIHN1cmUgdGhlIGRpcmVjdG9yeSBmb3IgdGhlIGRlc3RpbmF0aW9uIGZpbGUgZXhpc3RzLlxuICAgICAgICBkZXN0RmlsZS5kaXJlY3RvcnkuZW5zdXJlRXhpc3RzU3luYygpO1xuXG4gICAgICAgIC8vXG4gICAgICAgIC8vIERvIHRoZSBjb3B5LlxuICAgICAgICAvL1xuICAgICAgICBjb3B5RmlsZVN5bmModGhpcy5fZmlsZVBhdGgsIGRlc3RGaWxlLnRvU3RyaW5nKCksIHtwcmVzZXJ2ZVRpbWVzdGFtcHM6IHRydWV9KTtcblxuICAgICAgICByZXR1cm4gZGVzdEZpbGU7XG4gICAgfVxuXG5cbiAgICAvKipcbiAgICAgKiBNb3ZlcyB0aGlzIGZpbGUgdG8gdGhlIHNwZWNpZmllZCBkZXN0aW5hdGlvbi4gIFByZXNlcnZlcyB0aGUgZmlsZSdzIGxhc3RcbiAgICAgKiBhY2Nlc3NlZCB0aW1lIChhdGltZSkgYW5kIGxhc3QgbW9kaWZpZWQgdGltZSAobXRpbWUpLlxuICAgICAqIEBwYXJhbSBkc3REaXJPckZpbGUgLSBJZiBhIEZpbGUsIHNwZWNpZmllcyB0aGVcbiAgICAgKiBkZXN0aW5hdGlvbiBkaXJlY3RvcnkgYW5kIGZpbGUgbmFtZS4gIElmIGEgZGlyZWN0b3J5LCBzcGVjaWZpZXMgb25seSB0aGVcbiAgICAgKiBkZXN0aW5hdGlvbiBkaXJlY3RvcnkgYW5kIGRlc3RGaWxlTmFtZSBzcGVjaWZpZXMgdGhlIGRlc3RpbmF0aW9uIGZpbGVcbiAgICAgKiBuYW1lLlxuICAgICAqIEBwYXJhbSBkc3RGaWxlTmFtZSAtIFdoZW4gZGVzdERpck9yRmlsZSBpcyBhIERpcmVjdG9yeSxcbiAgICAgKiBvcHRpb25hbGx5IHNwZWNpZmllcyB0aGUgZGVzdGluYXRpb24gZmlsZSBuYW1lLiAgSWYgb21pdHRlZCwgdGhlXG4gICAgICogZGVzdGluYXRpb24gZmlsZSBuYW1lIHdpbGwgYmUgdGhlIHNhbWUgYXMgdGhlIHNvdXJjZSAodGhpcyBGaWxlKS5cbiAgICAgKiBAcmV0dXJuIEEgUHJvbWlzZSBmb3IgYSBGaWxlIHJlcHJlc2VudGluZyB0aGUgZGVzdGluYXRpb24gZmlsZS5cbiAgICAgKi9cbiAgICBwdWJsaWMgbW92ZShkc3REaXJPckZpbGU6IERpcmVjdG9yeSB8IEZpbGUsIGRzdEZpbGVOYW1lPzogc3RyaW5nLCBvcHRpb25zPzogSUZpbGVDb3B5T3B0aW9ucyk6IFByb21pc2U8RmlsZT5cbiAgICB7XG4gICAgICAgIC8vIENvcHkgdGhlIGZpbGUuXG4gICAgICAgIHJldHVybiB0aGlzLmNvcHkoZHN0RGlyT3JGaWxlLCBkc3RGaWxlTmFtZSwgb3B0aW9ucylcbiAgICAgICAgLnRoZW4oKGRzdEZpbGUpID0+IHtcbiAgICAgICAgICAgIC8vXG4gICAgICAgICAgICAvLyBEZWxldGUgdGhlIHNvdXJjZSBmaWxlLlxuICAgICAgICAgICAgLy9cbiAgICAgICAgICAgIHJldHVybiB0aGlzLmRlbGV0ZSgpXG4gICAgICAgICAgICAudGhlbigoKSA9PiB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGRzdEZpbGU7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG5cbiAgICAvKipcbiAgICAgKiBNb3ZlcyB0aGlzIGZpbGUgdG8gdGhlIHNwZWNpZmllZCBkZXN0aW5hdGlvbi4gIFByZXNlcnZlcyB0aGUgZmlsZSdzIGxhc3RcbiAgICAgKiBhY2Nlc3NlZCB0aW1lIChhdGltZSkgYW5kIGxhc3QgbW9kaWZpZWQgdGltZSAobXRpbWUpLlxuICAgICAqIEBwYXJhbSBkc3REaXJPckZpbGUgLSBJZiBhIEZpbGUsIHNwZWNpZmllcyB0aGVcbiAgICAgKiBkZXN0aW5hdGlvbiBkaXJlY3RvcnkgYW5kIGZpbGUgbmFtZS4gIElmIGEgZGlyZWN0b3J5LCBzcGVjaWZpZXMgb25seSB0aGVcbiAgICAgKiBkZXN0aW5hdGlvbiBkaXJlY3RvcnkgYW5kIGRlc3RGaWxlTmFtZSBzcGVjaWZpZXMgdGhlIGRlc3RpbmF0aW9uIGZpbGVcbiAgICAgKiBuYW1lLlxuICAgICAqIEBwYXJhbSBkc3RGaWxlTmFtZSAtIFdoZW4gZGVzdERpck9yRmlsZSBpcyBhIERpcmVjdG9yeSxcbiAgICAgKiBvcHRpb25hbGx5IHNwZWNpZmllcyB0aGUgZGVzdGluYXRpb24gZmlsZSBuYW1lLiAgSWYgb21pdHRlZCwgdGhlXG4gICAgICogZGVzdGluYXRpb24gZmlsZSBuYW1lIHdpbGwgYmUgdGhlIHNhbWUgYXMgdGhlIHNvdXJjZSAodGhpcyBGaWxlKS5cbiAgICAgKiBAcmV0dXJuIEEgRmlsZSByZXByZXNlbnRpbmcgdGhlIGRlc3RpbmF0aW9uIGZpbGUuXG4gICAgICovXG4gICAgcHVibGljIG1vdmVTeW5jKGRzdERpck9yRmlsZTogRGlyZWN0b3J5IHwgRmlsZSwgZHN0RmlsZU5hbWU/OiBzdHJpbmcsIG9wdGlvbnM/OiBJRmlsZUNvcHlPcHRpb25zKTogRmlsZVxuICAgIHtcbiAgICAgICAgLy9cbiAgICAgICAgLy8gRG8gdGhlIGNvcHkuXG4gICAgICAgIC8vXG4gICAgICAgIGNvbnN0IGRzdEZpbGUgPSB0aGlzLmNvcHlTeW5jKGRzdERpck9yRmlsZSwgZHN0RmlsZU5hbWUsIG9wdGlvbnMpO1xuXG4gICAgICAgIC8vXG4gICAgICAgIC8vIERlbGV0ZSB0aGUgc291cmNlIGZpbGUuXG4gICAgICAgIC8vXG4gICAgICAgIHRoaXMuZGVsZXRlU3luYygpO1xuXG4gICAgICAgIHJldHVybiBkc3RGaWxlO1xuICAgIH1cblxuXG4gICAgLyoqXG4gICAgICogV3JpdGVzIHRleHQgdG8gdGhpcyBmaWxlLCByZXBsYWNpbmcgdGhlIGZpbGUgaWYgaXQgZXhpc3RzLiAgSWYgYW55IHBhcmVudFxuICAgICAqIGRpcmVjdG9yaWVzIGRvIG5vdCBleGlzdCwgdGhleSBhcmUgY3JlYXRlZC5cbiAgICAgKiBAcGFyYW0gdGV4dCAtIFRoZSBuZXcgY29udGVudHMgb2YgdGhpcyBmaWxlXG4gICAgICogQHJldHVybiBBIFByb21pc2UgdGhhdCBpcyByZXNvbHZlZCB3aGVuIHRoZSBmaWxlIGhhcyBiZWVuIHdyaXR0ZW4uXG4gICAgICovXG4gICAgcHVibGljIHdyaXRlKHRleHQ6IHN0cmluZyk6IFByb21pc2U8dm9pZD5cbiAgICB7XG4gICAgICAgIHJldHVybiB0aGlzLmRpcmVjdG9yeS5lbnN1cmVFeGlzdHMoKVxuICAgICAgICAudGhlbigoKSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gd3JpdGVGaWxlQXN5bmModGhpcy5fZmlsZVBhdGgsIHRleHQsIFwidXRmOFwiKTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG5cbiAgICAvKipcbiAgICAgKiBXcml0ZXMgdGV4dCB0byB0aGlzIGZpbGUsIHJlcGxhY2luZyB0aGUgZmlsZSBpZiBpdCBleGlzdHMuICBJZiBhbnkgcGFyZW50XG4gICAgICogZGlyZWN0b3JpZXMgZG8gbm90IGV4aXN0LCB0aGV5IGFyZSBjcmVhdGVkLlxuICAgICAqIEBwYXJhbSB0ZXh0IC0gVGhlIG5ldyBjb250ZW50cyBvZiB0aGlzIGZpbGVcbiAgICAgKi9cbiAgICBwdWJsaWMgd3JpdGVTeW5jKHRleHQ6IHN0cmluZyk6IHZvaWRcbiAgICB7XG4gICAgICAgIHRoaXMuZGlyZWN0b3J5LmVuc3VyZUV4aXN0c1N5bmMoKTtcbiAgICAgICAgZnMud3JpdGVGaWxlU3luYyh0aGlzLl9maWxlUGF0aCwgdGV4dCk7XG4gICAgfVxuXG5cbiAgICAvKipcbiAgICAgKiBXcml0ZXMgSlNPTiBkYXRhIHRvIHRoaXMgZmlsZSwgcmVwbGFjaW5nIHRoZSBmaWxlIGlmIGl0IGV4aXN0cy4gIElmIGFueVxuICAgICAqIHBhcmVudCBkaXJlY3RvcmllcyBkbyBub3QgZXhpc3QsIHRoZXkgYXJlIGNyZWF0ZWQuXG4gICAgICogQHBhcmFtIGRhdGEgLSBUaGUgZGF0YSB0byBiZSBzdHJpbmdpZmllZCBhbmQgd3JpdHRlblxuICAgICAqIEByZXR1cm4gQSBQcm9taXNlIHRoYXQgaXMgcmVzb2x2ZWQgd2hlbiB0aGUgZmlsZSBoYXMgYmVlbiB3cml0dGVuXG4gICAgICovXG4gICAgcHVibGljIHdyaXRlSnNvbihkYXRhOiBvYmplY3QpOiBQcm9taXNlPHZvaWQ+XG4gICAge1xuICAgICAgICBjb25zdCBqc29uVGV4dCA9IEpTT04uc3RyaW5naWZ5KGRhdGEsIHVuZGVmaW5lZCwgNCk7XG4gICAgICAgIHJldHVybiB0aGlzLndyaXRlKGpzb25UZXh0KTtcbiAgICB9XG5cblxuICAgIC8qKlxuICAgICAqIFdyaXRlcyBKU09OIGRhdGEgdG8gdGhpcyBmaWxlLCByZXBsYWNpbmcgdGhlIGZpbGUgaWYgaXQgZXhpc3RzLiAgSWYgYW55XG4gICAgICogcGFyZW50IGRpcmVjdG9yaWVzIGRvIG5vdCBleGlzdCwgdGhleSBhcmUgY3JlYXRlZC5cbiAgICAgKiBAcGFyYW0gZGF0YSAtIFRoZSBkYXRhIHRvIGJlIHN0cmluZ2lmaWVkIGFuZCB3cml0dGVuXG4gICAgICovXG4gICAgcHVibGljIHdyaXRlSnNvblN5bmMoZGF0YTogb2JqZWN0KTogdm9pZFxuICAgIHtcbiAgICAgICAgY29uc3QganNvblRleHQgPSBKU09OLnN0cmluZ2lmeShkYXRhLCB1bmRlZmluZWQsIDQpO1xuICAgICAgICByZXR1cm4gdGhpcy53cml0ZVN5bmMoanNvblRleHQpO1xuICAgIH1cblxuXG4gICAgLyoqXG4gICAgICogQ2FsY3VsYXRlcyBhIGhhc2ggb2YgdGhpcyBmaWxlJ3MgY29udGVudFxuICAgICAqIEBwYXJhbSBhbGdvcml0aG0gLSBUaGUgaGFzaGluZyBhbGdvcml0aG0gdG8gdXNlLiAgRm9yIGV4YW1wbGUsIFwibWQ1XCIsXG4gICAgICogXCJzaGEyNTZcIiwgXCJzaGE1MTJcIi4gIFRvIHNlZSBhbGdvcml0aG1zIGF2YWlsYWJsZSBvbiB5b3VyIHBsYXRmb3JtLCBydW5cbiAgICAgKiBgb3BlbnNzbCBsaXN0LW1lc3NhZ2UtZGlnZXN0LWFsZ29yaXRobXNgLlxuICAgICAqIEByZXR1cm4gQSBQcm9taXNlIGZvciBhIGhleGFkZWNpbWFsIHN0cmluZyBjb250YWluaW5nIHRoZSBoYXNoXG4gICAgICovXG4gICAgcHVibGljIGdldEhhc2goYWxnb3JpdGhtOiBzdHJpbmcgPSBcIm1kNVwiKTogUHJvbWlzZTxzdHJpbmc+XG4gICAge1xuICAgICAgICByZXR1cm4gbmV3IEJCUHJvbWlzZTxzdHJpbmc+KChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IGlucHV0ID0gZnMuY3JlYXRlUmVhZFN0cmVhbSh0aGlzLl9maWxlUGF0aCk7XG4gICAgICAgICAgICBjb25zdCBoYXNoID0gY3J5cHRvLmNyZWF0ZUhhc2goYWxnb3JpdGhtKTtcbiAgICAgICAgICAgIGhhc2guc2V0RW5jb2RpbmcoXCJoZXhcIik7XG5cbiAgICAgICAgICAgIGlucHV0XG4gICAgICAgICAgICAub24oXCJlcnJvclwiLCAoZXJyb3IpID0+IHtcbiAgICAgICAgICAgICAgICByZWplY3QobmV3IEVycm9yKGVycm9yKSk7XG4gICAgICAgICAgICB9KVxuICAgICAgICAgICAgLm9uKFwiZW5kXCIsICgpID0+IHtcbiAgICAgICAgICAgICAgICBoYXNoLmVuZCgpO1xuICAgICAgICAgICAgICAgIGNvbnN0IGhhc2hWYWx1ZSA9IGhhc2gucmVhZCgpIGFzIHN0cmluZztcbiAgICAgICAgICAgICAgICByZXNvbHZlKGhhc2hWYWx1ZSk7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgaW5wdXRcbiAgICAgICAgICAgIC5waXBlKGhhc2gpO1xuICAgICAgICB9KTtcbiAgICB9XG5cblxuICAgIC8qKlxuICAgICAqIENhbGN1bGF0ZXMgYSBoYXNoIG9mIHRoaXMgZmlsZSdzIGNvbnRlbnRcbiAgICAgKiBAcGFyYW0gYWxnb3JpdGhtIC0gVGhlIGhhc2hpbmcgYWxnb3JpdGhtIHRvIHVzZS4gIEZvciBleGFtcGxlLCBcIm1kNVwiLFxuICAgICAqIFwic2hhMjU2XCIsIFwic2hhNTEyXCIuICBUbyBzZWUgYWxnb3JpdGhtcyBhdmFpbGFibGUgb24geW91ciBwbGF0Zm9ybSwgcnVuXG4gICAgICogYG9wZW5zc2wgbGlzdC1tZXNzYWdlLWRpZ2VzdC1hbGdvcml0aG1zYC5cbiAgICAgKiBAcmV0dXJuIEEgaGV4YWRlY2ltYWwgc3RyaW5nIGNvbnRhaW5pbmcgdGhlIGhhc2hcbiAgICAgKi9cbiAgICBwdWJsaWMgZ2V0SGFzaFN5bmMoYWxnb3JpdGhtOiBzdHJpbmcgPSBcIm1kNVwiKTogc3RyaW5nIHtcbiAgICAgICAgY29uc3QgZmlsZURhdGEgPSBmcy5yZWFkRmlsZVN5bmModGhpcy5fZmlsZVBhdGgpO1xuICAgICAgICBjb25zdCBoYXNoID0gY3J5cHRvLmNyZWF0ZUhhc2goYWxnb3JpdGhtKTtcbiAgICAgICAgaGFzaC51cGRhdGUoZmlsZURhdGEpO1xuICAgICAgICByZXR1cm4gaGFzaC5kaWdlc3QoXCJoZXhcIik7XG4gICAgfVxuXG5cbiAgICAvKipcbiAgICAgKiBSZWFkcyB0aGUgY29udGVudHMgb2YgdGhpcyBmaWxlIGFzIGEgc3RyaW5nLiAgUmVqZWN0cyBpZiB0aGlzIGZpbGUgZG9lc1xuICAgICAqIG5vdCBleGlzdC5cbiAgICAgKiBAcmV0dXJuIEEgUHJvbWlzZSBmb3IgdGhlIHRleHQgY29udGVudHMgb2YgdGhpcyBmaWxlXG4gICAgICovXG4gICAgcHVibGljIHJlYWQoKTogUHJvbWlzZTxzdHJpbmc+XG4gICAge1xuICAgICAgICByZXR1cm4gbmV3IEJCUHJvbWlzZTxzdHJpbmc+KChyZXNvbHZlOiAodGV4dDogc3RyaW5nKSA9PiB2b2lkLCByZWplY3Q6IChlcnI6IGFueSkgPT4gdm9pZCkgPT4ge1xuICAgICAgICAgICAgZnMucmVhZEZpbGUodGhpcy5fZmlsZVBhdGgsIHtlbmNvZGluZzogXCJ1dGY4XCJ9LCAoZXJyLCBkYXRhKSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKGVycilcbiAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgIHJlamVjdChlcnIpO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgcmVzb2x2ZShkYXRhKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICB9XG5cblxuICAgIC8qKlxuICAgICAqIFJlYWRzIHRoZSBjb250ZW50cyBvZiB0aGlzIGZpbGUgYXMgYSBzdHJpbmcuICBUaHJvd3MgaWYgdGhpcyBmaWxlIGRvZXNcbiAgICAgKiBub3QgZXhpc3QuXG4gICAgICogQHJldHVybiBUaGlzIGZpbGUncyBjb250ZW50c1xuICAgICAqL1xuICAgIHB1YmxpYyByZWFkU3luYygpOiBzdHJpbmdcbiAgICB7XG4gICAgICAgIHJldHVybiBmcy5yZWFkRmlsZVN5bmModGhpcy5fZmlsZVBhdGgsIHtlbmNvZGluZzogXCJ1dGY4XCJ9KTtcbiAgICB9XG5cblxuICAgIC8qKlxuICAgICAqIFJlYWRzIEpTT04gZGF0YSBmcm9tIHRoaXMgZmlsZS4gIFJlamVjdHMgaWYgdGhpcyBmaWxlIGRvZXMgbm90IGV4aXN0LlxuICAgICAqIEByZXR1cm4ge1Byb21pc2U8VD59IEEgcHJvbWlzZSBmb3IgdGhlIHBhcnNlZCBkYXRhIGNvbnRhaW5lZCBpbiB0aGlzIGZpbGVcbiAgICAgKi9cbiAgICBwdWJsaWMgcmVhZEpzb248VD4oKTogUHJvbWlzZTxUPlxuICAgIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucmVhZCgpXG4gICAgICAgIC50aGVuKCh0ZXh0KSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gSlNPTi5wYXJzZSh0ZXh0KTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG5cbiAgICAvKipcbiAgICAgKiBSZWFkcyBKU09OIGRhdGEgZnJvbSB0aGlzIGZpbGUuICBUaHJvd3MgaWYgdGhpcyBmaWxlIGRvZXMgbm90IGV4aXN0LlxuICAgICAqIEByZXR1cm4ge1R9IFRoZSBwYXJzZWQgZGF0YSBjb250YWluZWQgaW4gdGhpcyBmaWxlXG4gICAgICovXG4gICAgcHVibGljIHJlYWRKc29uU3luYzxUPigpOiBUXG4gICAge1xuICAgICAgICBjb25zdCB0ZXh0ID0gdGhpcy5yZWFkU3luYygpO1xuICAgICAgICByZXR1cm4gSlNPTi5wYXJzZSh0ZXh0KTtcbiAgICB9XG5cbn1cblxuXG5leHBvcnQgaW50ZXJmYWNlIElDb3B5T3B0aW9uc1xue1xuICAgIHByZXNlcnZlVGltZXN0YW1wczogYm9vbGVhbjtcbn1cblxuXG4vKipcbiAqIENvcGllcyBhIGZpbGUuXG4gKiBAcGFyYW0gc291cmNlRmlsZVBhdGggLSBUaGUgcGF0aCB0byB0aGUgc291cmNlIGZpbGVcbiAqIEBwYXJhbSBkZXN0RmlsZVBhdGggLSBUaGUgcGF0aCB0byB0aGUgZGVzdGluYXRpb24gZmlsZVxuICogQHBhcmFtIG9wdGlvbnMgLSBPcHRpb25zIGZvciB0aGUgY29weSBvcGVyYXRpb25cbiAqIEByZXR1cm4gQSBQcm9taXNlIHRoYXQgaXMgcmVzb2x2ZWQgd2hlbiB0aGUgZmlsZSBoYXMgYmVlbiBjb3BpZWQuXG4gKi9cbmZ1bmN0aW9uIGNvcHlGaWxlKHNvdXJjZUZpbGVQYXRoOiBzdHJpbmcsIGRlc3RGaWxlUGF0aDogc3RyaW5nLCBvcHRpb25zPzogSUNvcHlPcHRpb25zKTogUHJvbWlzZTx2b2lkPlxue1xuICAgIC8vXG4gICAgLy8gRGVzaWduIE5vdGVcbiAgICAvLyBXZSBjb3VsZCBoYXZlIHVzZWQgZnMucmVhZEZpbGUoKSBhbmQgZnMud3JpdGVGaWxlKCkgaGVyZSwgYnV0IHRoYXQgd291bGRcbiAgICAvLyByZWFkIHRoZSBlbnRpcmUgZmlsZSBjb250ZW50cyBvZiB0aGUgc291cmNlIGZpbGUgaW50byBtZW1vcnkuICBJdCBpc1xuICAgIC8vIHRob3VnaHQgdGhhdCB1c2luZyBzdHJlYW1zIGlzIG1vcmUgZWZmaWNpZW50IGFuZCBwZXJmb3JtYW50IGJlY2F1c2VcbiAgICAvLyBzdHJlYW1zIGNhbiByZWFkIGFuZCB3cml0ZSBzbWFsbGVyIGNodW5rcyBvZiB0aGUgZGF0YS5cbiAgICAvL1xuXG4gICAgcmV0dXJuIG5ldyBCQlByb21pc2U8dm9pZD4oKHJlc29sdmU6ICgpID0+IHZvaWQsIHJlamVjdDogKGVycjogYW55KSA9PiB2b2lkKSA9PiB7XG5cbiAgICAgICAgY29uc3QgcmVhZFN0cmVhbSA9IGZzLmNyZWF0ZVJlYWRTdHJlYW0oc291cmNlRmlsZVBhdGgpO1xuICAgICAgICBjb25zdCByZWFkTGlzdGVuZXJUcmFja2VyID0gbmV3IExpc3RlbmVyVHJhY2tlcihyZWFkU3RyZWFtKTtcblxuICAgICAgICBjb25zdCB3cml0ZVN0cmVhbSA9IGZzLmNyZWF0ZVdyaXRlU3RyZWFtKGRlc3RGaWxlUGF0aCk7XG4gICAgICAgIGNvbnN0IHdyaXRlTGlzdGVuZXJUcmFja2VyID0gbmV3IExpc3RlbmVyVHJhY2tlcih3cml0ZVN0cmVhbSk7XG5cbiAgICAgICAgcmVhZExpc3RlbmVyVHJhY2tlci5vbihcImVycm9yXCIsIChlcnIpID0+IHtcbiAgICAgICAgICAgIHJlamVjdChlcnIpO1xuICAgICAgICAgICAgcmVhZExpc3RlbmVyVHJhY2tlci5yZW1vdmVBbGwoKTtcbiAgICAgICAgICAgIHdyaXRlTGlzdGVuZXJUcmFja2VyLnJlbW92ZUFsbCgpO1xuICAgICAgICB9KTtcblxuICAgICAgICB3cml0ZUxpc3RlbmVyVHJhY2tlci5vbihcImVycm9yXCIsIChlcnIpID0+IHtcbiAgICAgICAgICAgIHJlamVjdChlcnIpO1xuICAgICAgICAgICAgcmVhZExpc3RlbmVyVHJhY2tlci5yZW1vdmVBbGwoKTtcbiAgICAgICAgICAgIHdyaXRlTGlzdGVuZXJUcmFja2VyLnJlbW92ZUFsbCgpO1xuICAgICAgICB9KTtcblxuICAgICAgICB3cml0ZUxpc3RlbmVyVHJhY2tlci5vbihcImNsb3NlXCIsICgpID0+IHtcbiAgICAgICAgICAgIHJlc29sdmUoKTtcbiAgICAgICAgICAgIHJlYWRMaXN0ZW5lclRyYWNrZXIucmVtb3ZlQWxsKCk7XG4gICAgICAgICAgICB3cml0ZUxpc3RlbmVyVHJhY2tlci5yZW1vdmVBbGwoKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgcmVhZFN0cmVhbS5waXBlKHdyaXRlU3RyZWFtKTtcbiAgICB9KVxuICAgIC50aGVuKCgpID0+IHtcbiAgICAgICAgaWYgKG9wdGlvbnMgJiYgb3B0aW9ucy5wcmVzZXJ2ZVRpbWVzdGFtcHMpXG4gICAgICAgIHtcbiAgICAgICAgICAgIC8vXG4gICAgICAgICAgICAvLyBUaGUgY2FsbGVyIHdhbnRzIHRvIHByZXNlcnZlIHRoZSBzb3VyY2UgZmlsZSdzIHRpbWVzdGFtcHMuICBDb3B5XG4gICAgICAgICAgICAvLyB0aGVtIHRvIHRoZSBkZXN0aW5hdGlvbiBmaWxlIG5vdy5cbiAgICAgICAgICAgIC8vXG4gICAgICAgICAgICByZXR1cm4gc3RhdEFzeW5jKHNvdXJjZUZpbGVQYXRoKVxuICAgICAgICAgICAgLnRoZW4oKHNyY1N0YXRzOiBmcy5TdGF0cykgPT4ge1xuICAgICAgICAgICAgICAgIC8vXG4gICAgICAgICAgICAgICAgLy8gTm90ZTogIFNldHRpbmcgdGhlIHRpbWVzdGFtcHMgb24gZGVzdCByZXF1aXJlcyB1cyB0byBzcGVjaWZ5XG4gICAgICAgICAgICAgICAgLy8gdGhlIHRpbWVzdGFtcCBpbiBzZWNvbmRzIChub3QgbWlsbGlzZWNvbmRzKS4gIFdoZW4gd2UgZGl2aWRlXG4gICAgICAgICAgICAgICAgLy8gYnkgMTAwMCBiZWxvdyBhbmQgdHJ1bmNhdGlvbiBoYXBwZW5zLCB3ZSBhcmUgYWN0dWFsbHkgc2V0dGluZ1xuICAgICAgICAgICAgICAgIC8vIGRlc3QncyB0aW1lc3RhbXBzICpiZWZvcmUqIHRob3NlIG9mIG9mIHNvdXJjZS5cbiAgICAgICAgICAgICAgICAvL1xuICAgICAgICAgICAgICAgIHJldHVybiB1dGltZXNBc3luYyhkZXN0RmlsZVBhdGgsIHNyY1N0YXRzLmF0aW1lLnZhbHVlT2YoKSAvIDEwMDAsIHNyY1N0YXRzLm10aW1lLnZhbHVlT2YoKSAvIDEwMDApO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9KTtcbn1cblxuXG4vKipcbiAqIENvcGllcyBhIGZpbGUgc3luY2hyb25vdXNseS5cbiAqIEBwYXJhbSBzb3VyY2VGaWxlUGF0aCAtIFRoZSBwYXRoIHRvIHRoZSBzb3VyY2UgZmlsZVxuICogQHBhcmFtIGRlc3RGaWxlUGF0aCAtIFRoZSBwYXRoIHRvIHRoZSBkZXN0aW5hdGlvbiBmaWxlXG4gKiBAcGFyYW0gb3B0aW9ucyAtIE9wdGlvbnMgZm9yIHRoZSBjb3B5IG9wZXJhdGlvblxuICovXG5mdW5jdGlvbiBjb3B5RmlsZVN5bmMoc291cmNlRmlsZVBhdGg6IHN0cmluZywgZGVzdEZpbGVQYXRoOiBzdHJpbmcsIG9wdGlvbnM/OiBJQ29weU9wdGlvbnMpOiB2b2lkXG57XG4gICAgY29uc3QgZGF0YTogQnVmZmVyID0gZnMucmVhZEZpbGVTeW5jKHNvdXJjZUZpbGVQYXRoKTtcbiAgICBmcy53cml0ZUZpbGVTeW5jKGRlc3RGaWxlUGF0aCwgZGF0YSk7XG5cbiAgICBpZiAob3B0aW9ucyAmJiBvcHRpb25zLnByZXNlcnZlVGltZXN0YW1wcylcbiAgICB7XG4gICAgICAgIGNvbnN0IHNyY1N0YXRzID0gZnMuc3RhdFN5bmMoc291cmNlRmlsZVBhdGgpO1xuICAgICAgICBmcy51dGltZXNTeW5jKGRlc3RGaWxlUGF0aCwgc3JjU3RhdHMuYXRpbWUudmFsdWVPZigpIC8gMTAwMCwgc3JjU3RhdHMubXRpbWUudmFsdWVPZigpIC8gMTAwMCk7XG4gICAgfVxufVxuIl19
