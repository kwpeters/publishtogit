"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var fs = require("fs");
var path = require("path");
var promiseHelpers_1 = require("./promiseHelpers");
var directory_1 = require("./directory");
var listenerTracker_1 = require("./listenerTracker");
var pathHelpers_1 = require("./pathHelpers");
var unlinkAsync = promiseHelpers_1.promisify1(fs.unlink);
var statAsync = promiseHelpers_1.promisify1(fs.stat);
var utimesAsync = promiseHelpers_1.promisify3(fs.utimes);
var writeFileAsync = promiseHelpers_1.promisify3(fs.writeFile);
var File = (function () {
    //endregion
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
    File.prototype.exists = function () {
        var _this = this;
        return new Promise(function (resolve) {
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
    File.prototype.absPath = function () {
        return path.resolve(this._filePath);
    };
    File.prototype.delete = function () {
        var _this = this;
        return this.exists()
            .then(function (stats) {
            if (!stats) {
                return Promise.resolve();
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
     * @return A Promise for a File representing the destination file.
     */
    File.prototype.copy = function (dstDirOrFile, dstFileName) {
        var _this = this;
        //
        // Based on the parameters, figure out what the destination file path is
        // going to be.
        //
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
                destFile = new File(dstDirOrFile, this.fileName);
            }
            else {
                destFile = new File(dstDirOrFile, dstFileName);
            }
        }
        //
        // Before we do anything, make sure that the source file exists.  If it
        // doesn't we should get out before we create the destination file.
        //
        return this.exists()
            .then(function (stats) {
            if (!stats) {
                throw new Error("Source file " + _this._filePath + " does not exist.");
            }
        })
            .then(function () {
            //
            // Make sure the directory for the destination file exists.
            //
            return destFile.directory.ensureExists();
        })
            .then(function () {
            //
            // Do the copy.
            //
            return copyFile(_this._filePath, destFile.toString(), { preserveTimestamps: true });
        })
            .then(function () {
            return destFile;
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
     * @return A File representing the destination file.
     */
    File.prototype.copySync = function (dstDirOrFile, dstFileName) {
        //
        // Based on the parameters, figure out what the destination file path is
        // going to be.
        //
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
                destFile = new File(dstDirOrFile, this.fileName);
            }
            else {
                destFile = new File(dstDirOrFile, dstFileName);
            }
        }
        //
        // Before we do anything, make sure that the source file exists.  If it
        // doesn't we should get out before we create the destination file.
        //
        if (!this.existsSync()) {
            throw new Error("Source file " + this._filePath + " does not exist.");
        }
        //
        // Make sure the directory for the destination file exists.
        //
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
    File.prototype.move = function (dstDirOrFile, dstFileName) {
        var _this = this;
        //
        // Based on the parameters, figure out what the destination file path is
        // going to be.
        //
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
                destFile = new File(dstDirOrFile, this.fileName);
            }
            else {
                destFile = new File(dstDirOrFile, dstFileName);
            }
        }
        //
        // Before we do anything, make sure that the source file exists.  If it
        // doesn't we should get out before we create the destination file.
        //
        return this.exists()
            .then(function (stats) {
            if (!stats) {
                throw new Error("Source file " + _this._filePath + " does not exist.");
            }
        })
            .then(function () {
            //
            // Make sure the directory for the destination file exists.
            //
            return destFile.directory.ensureExists();
        })
            .then(function () {
            //
            // Do the copy.
            //
            return copyFile(_this._filePath, destFile.toString(), { preserveTimestamps: true });
        })
            .then(function () {
            //
            // Delete the source file.
            //
            return _this.delete();
        })
            .then(function () {
            return destFile;
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
    File.prototype.moveSync = function (dstDirOrFile, dstFileName) {
        //
        // Based on the parameters, figure out what the destination file path is
        // going to be.
        //
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
                destFile = new File(dstDirOrFile, this.fileName);
            }
            else {
                destFile = new File(dstDirOrFile, dstFileName);
            }
        }
        //
        // Before we do anything, make sure that the source file exists.  If it
        // doesn't we should get out before we create the destination file.
        //
        if (!this.existsSync()) {
            throw new Error("Source file " + this._filePath + " does not exist.");
        }
        //
        // Make sure the directory for the destination file exists.
        //
        destFile.directory.ensureExistsSync();
        //
        // Do the copy.
        //
        copyFileSync(this._filePath, destFile.toString(), { preserveTimestamps: true });
        //
        // Delete the source file.
        //
        this.deleteSync();
        return destFile;
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
     * Reads the contents of this file as a string.  Rejects if this file does
     * not exist.
     * @return A Promise for the text contents of this file
     */
    File.prototype.read = function () {
        var _this = this;
        return new Promise(function (resolve, reject) {
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
    return new Promise(function (resolve, reject) {
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

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9maWxlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsdUJBQXlCO0FBQ3pCLDJCQUE2QjtBQUM3QixtREFBd0Q7QUFDeEQseUNBQXNDO0FBQ3RDLHFEQUFrRDtBQUNsRCw2Q0FBd0Q7QUFHeEQsSUFBTSxXQUFXLEdBQUcsMkJBQVUsQ0FBZSxFQUFFLENBQUMsTUFBTSxDQUFDLENBQUM7QUFDeEQsSUFBTSxTQUFTLEdBQUssMkJBQVUsQ0FBbUIsRUFBRSxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQzFELElBQU0sV0FBVyxHQUFHLDJCQUFVLENBQStELEVBQUUsQ0FBQyxNQUFNLENBQUMsQ0FBQztBQUN4RyxJQUFNLGNBQWMsR0FBRywyQkFBVSxDQUkzQixFQUFFLENBQUMsU0FBUyxDQUFDLENBQUM7QUFHcEI7SUFJSSxXQUFXO0lBR1gsY0FBbUIsUUFBa0I7UUFBRSxtQkFBd0I7YUFBeEIsVUFBd0IsRUFBeEIscUJBQXdCLEVBQXhCLElBQXdCO1lBQXhCLGtDQUF3Qjs7UUFFM0QsSUFBTSxRQUFRLEdBQWUsQ0FBQyxRQUFRLENBQUMsQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFDLENBQUM7UUFDMUQsSUFBSSxDQUFDLFNBQVMsR0FBRyw2QkFBZSxDQUFDLFFBQVEsQ0FBQyxDQUFDO0lBQy9DLENBQUM7SUFTRCxzQkFBVyx5QkFBTztRQU5sQjs7Ozs7V0FLRzthQUNIO1lBRUksTUFBTSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUM7UUFDbkQsQ0FBQzs7O09BQUE7SUFRRCxzQkFBVywwQkFBUTtRQUxuQjs7OztXQUlHO2FBQ0g7WUFFSSxJQUFNLE9BQU8sR0FBVyxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQztZQUNyRCxNQUFNLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsU0FBUyxFQUFFLE9BQU8sQ0FBQyxDQUFDO1FBQ2xELENBQUM7OztPQUFBO0lBUUQsc0JBQVcsMEJBQVE7UUFMbkI7Ozs7V0FJRzthQUNIO1lBRUksTUFBTSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDO1FBQ3pDLENBQUM7OztPQUFBO0lBT0Qsc0JBQVcseUJBQU87UUFKbEI7OztXQUdHO2FBQ0g7WUFFSSxNQUFNLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUM7UUFDeEMsQ0FBQzs7O09BQUE7SUFPRCxzQkFBVywyQkFBUztRQUpwQjs7O1dBR0c7YUFDSDtZQUVJLElBQU0sT0FBTyxHQUFXLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDO1lBQ3JELE1BQU0sQ0FBQyxJQUFJLHFCQUFTLENBQUMsT0FBTyxDQUFDLENBQUM7UUFDbEMsQ0FBQzs7O09BQUE7SUFHTSx1QkFBUSxHQUFmO1FBRUksTUFBTSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUM7SUFDMUIsQ0FBQztJQUdNLHFCQUFNLEdBQWIsVUFBYyxTQUFlO1FBRXpCLE1BQU0sQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLEtBQUssU0FBUyxDQUFDLE9BQU8sRUFBRSxDQUFDO0lBQ2xELENBQUM7SUFHTSxxQkFBTSxHQUFiO1FBQUEsaUJBZ0JDO1FBZEcsTUFBTSxDQUFDLElBQUksT0FBTyxDQUF1QixVQUFDLE9BQStDO1lBQ3JGLEVBQUUsQ0FBQyxJQUFJLENBQUMsS0FBSSxDQUFDLFNBQVMsRUFBRSxVQUFDLEdBQVEsRUFBRSxLQUFlO2dCQUU5QyxFQUFFLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxLQUFLLENBQUMsTUFBTSxFQUFFLENBQUMsQ0FDM0IsQ0FBQztvQkFDRyxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUM7Z0JBQ25CLENBQUM7Z0JBQ0QsSUFBSSxDQUNKLENBQUM7b0JBQ0csT0FBTyxDQUFDLFNBQVMsQ0FBQyxDQUFDO2dCQUN2QixDQUFDO1lBRUwsQ0FBQyxDQUFDLENBQUM7UUFDUCxDQUFDLENBQUMsQ0FBQztJQUNQLENBQUM7SUFHTSx5QkFBVSxHQUFqQjtRQUVJLElBQUksQ0FBQztZQUNELElBQU0sS0FBSyxHQUFHLEVBQUUsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDO1lBQzFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsTUFBTSxFQUFFLEdBQUcsS0FBSyxHQUFHLFNBQVMsQ0FBQztRQUM5QyxDQUFDO1FBQ0QsS0FBSyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztZQUNULEVBQUUsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxJQUFJLEtBQUssUUFBUSxDQUFDLENBQzFCLENBQUM7Z0JBQ0csTUFBTSxDQUFDLFNBQVMsQ0FBQztZQUNyQixDQUFDO1lBQ0QsSUFBSSxDQUNKLENBQUM7Z0JBQ0csTUFBTSxHQUFHLENBQUM7WUFDZCxDQUFDO1FBQ0wsQ0FBQztJQUNMLENBQUM7SUFHTSxzQkFBTyxHQUFkO1FBRUksTUFBTSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDO0lBQ3hDLENBQUM7SUFHTSxxQkFBTSxHQUFiO1FBQUEsaUJBVUM7UUFSRyxNQUFNLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRTthQUNuQixJQUFJLENBQUMsVUFBQyxLQUFLO1lBQ1IsRUFBRSxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO2dCQUNULE1BQU0sQ0FBQyxPQUFPLENBQUMsT0FBTyxFQUFFLENBQUM7WUFDN0IsQ0FBQztZQUFDLElBQUksQ0FBQyxDQUFDO2dCQUNKLE1BQU0sQ0FBQyxXQUFXLENBQUMsS0FBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDO1lBQ3ZDLENBQUM7UUFDTCxDQUFDLENBQUMsQ0FBQztJQUNQLENBQUM7SUFHTSx5QkFBVSxHQUFqQjtRQUVJLEVBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLFVBQVUsRUFBRSxDQUFDLENBQUMsQ0FBQztZQUNyQixNQUFNLENBQUM7UUFDWCxDQUFDO1FBRUQsRUFBRSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUM7SUFDbEMsQ0FBQztJQUdEOzs7Ozs7Ozs7OztPQVdHO0lBQ0ksbUJBQUksR0FBWCxVQUFZLFlBQThCLEVBQUUsV0FBb0I7UUFBaEUsaUJBa0RDO1FBaERHLEVBQUU7UUFDRix3RUFBd0U7UUFDeEUsZUFBZTtRQUNmLEVBQUU7UUFDRixJQUFJLFFBQWMsQ0FBQztRQUVuQixFQUFFLENBQUMsQ0FBQyxZQUFZLFlBQVksSUFBSSxDQUFDLENBQUMsQ0FBQztZQUMvQiw4REFBOEQ7WUFDOUQsOEJBQThCO1lBQzlCLFFBQVEsR0FBRyxZQUFZLENBQUM7UUFDNUIsQ0FBQztRQUNELElBQUksQ0FDSixDQUFDO1lBQ0cseURBQXlEO1lBQ3pELDhCQUE4QjtZQUM5QixFQUFFLENBQUMsQ0FBQyxXQUFXLEtBQUssU0FBUyxDQUFDLENBQUMsQ0FBQztnQkFDNUIsUUFBUSxHQUFHLElBQUksSUFBSSxDQUFDLFlBQVksRUFBRSxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUM7WUFDckQsQ0FBQztZQUFDLElBQUksQ0FBQyxDQUFDO2dCQUNKLFFBQVEsR0FBRyxJQUFJLElBQUksQ0FBQyxZQUFZLEVBQUUsV0FBVyxDQUFDLENBQUM7WUFDbkQsQ0FBQztRQUNMLENBQUM7UUFFRCxFQUFFO1FBQ0YsdUVBQXVFO1FBQ3ZFLG1FQUFtRTtRQUNuRSxFQUFFO1FBQ0YsTUFBTSxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUU7YUFDbkIsSUFBSSxDQUFDLFVBQUMsS0FBSztZQUNSLEVBQUUsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQ1gsQ0FBQztnQkFDRyxNQUFNLElBQUksS0FBSyxDQUFDLGlCQUFlLEtBQUksQ0FBQyxTQUFTLHFCQUFrQixDQUFDLENBQUM7WUFDckUsQ0FBQztRQUNMLENBQUMsQ0FBQzthQUNELElBQUksQ0FBQztZQUNGLEVBQUU7WUFDRiwyREFBMkQ7WUFDM0QsRUFBRTtZQUNGLE1BQU0sQ0FBQyxRQUFRLENBQUMsU0FBUyxDQUFDLFlBQVksRUFBRSxDQUFDO1FBQzdDLENBQUMsQ0FBQzthQUNELElBQUksQ0FBQztZQUNGLEVBQUU7WUFDRixlQUFlO1lBQ2YsRUFBRTtZQUNGLE1BQU0sQ0FBQyxRQUFRLENBQUMsS0FBSSxDQUFDLFNBQVMsRUFBRSxRQUFRLENBQUMsUUFBUSxFQUFFLEVBQUUsRUFBQyxrQkFBa0IsRUFBRSxJQUFJLEVBQUMsQ0FBQyxDQUFDO1FBQ3JGLENBQUMsQ0FBQzthQUNELElBQUksQ0FBQztZQUNGLE1BQU0sQ0FBQyxRQUFRLENBQUM7UUFDcEIsQ0FBQyxDQUFDLENBQUM7SUFDUCxDQUFDO0lBR0Q7Ozs7Ozs7Ozs7O09BV0c7SUFDSSx1QkFBUSxHQUFmLFVBQWdCLFlBQThCLEVBQUUsV0FBb0I7UUFFaEUsRUFBRTtRQUNGLHdFQUF3RTtRQUN4RSxlQUFlO1FBQ2YsRUFBRTtRQUNGLElBQUksUUFBYyxDQUFDO1FBRW5CLEVBQUUsQ0FBQyxDQUFDLFlBQVksWUFBWSxJQUFJLENBQUMsQ0FBQyxDQUFDO1lBQy9CLDhEQUE4RDtZQUM5RCw4QkFBOEI7WUFDOUIsUUFBUSxHQUFHLFlBQVksQ0FBQztRQUM1QixDQUFDO1FBQUMsSUFBSSxDQUFDLENBQUM7WUFDSix5REFBeUQ7WUFDekQsOEJBQThCO1lBQzlCLEVBQUUsQ0FBQyxDQUFDLFdBQVcsS0FBSyxTQUFTLENBQUMsQ0FBQyxDQUFDO2dCQUM1QixRQUFRLEdBQUcsSUFBSSxJQUFJLENBQUMsWUFBWSxFQUFFLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQztZQUNyRCxDQUFDO1lBQUMsSUFBSSxDQUFDLENBQUM7Z0JBQ0osUUFBUSxHQUFHLElBQUksSUFBSSxDQUFDLFlBQVksRUFBRSxXQUFXLENBQUMsQ0FBQztZQUNuRCxDQUFDO1FBQ0wsQ0FBQztRQUVELEVBQUU7UUFDRix1RUFBdUU7UUFDdkUsbUVBQW1FO1FBQ25FLEVBQUU7UUFDRixFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxVQUFVLEVBQUUsQ0FBQyxDQUN2QixDQUFDO1lBQ0csTUFBTSxJQUFJLEtBQUssQ0FBQyxpQkFBZSxJQUFJLENBQUMsU0FBUyxxQkFBa0IsQ0FBQyxDQUFDO1FBQ3JFLENBQUM7UUFFRCxFQUFFO1FBQ0YsMkRBQTJEO1FBQzNELEVBQUU7UUFDRixRQUFRLENBQUMsU0FBUyxDQUFDLGdCQUFnQixFQUFFLENBQUM7UUFFdEMsRUFBRTtRQUNGLGVBQWU7UUFDZixFQUFFO1FBQ0YsWUFBWSxDQUFDLElBQUksQ0FBQyxTQUFTLEVBQUUsUUFBUSxDQUFDLFFBQVEsRUFBRSxFQUFFLEVBQUMsa0JBQWtCLEVBQUUsSUFBSSxFQUFDLENBQUMsQ0FBQztRQUU5RSxNQUFNLENBQUMsUUFBUSxDQUFDO0lBQ3BCLENBQUM7SUFHRDs7Ozs7Ozs7Ozs7T0FXRztJQUNJLG1CQUFJLEdBQVgsVUFBWSxZQUE4QixFQUFFLFdBQW9CO1FBQWhFLGlCQXdEQztRQXRERyxFQUFFO1FBQ0Ysd0VBQXdFO1FBQ3hFLGVBQWU7UUFDZixFQUFFO1FBQ0YsSUFBSSxRQUFjLENBQUM7UUFFbkIsRUFBRSxDQUFDLENBQUMsWUFBWSxZQUFZLElBQUksQ0FBQyxDQUFDLENBQUM7WUFDL0IsOERBQThEO1lBQzlELDhCQUE4QjtZQUM5QixRQUFRLEdBQUcsWUFBWSxDQUFDO1FBQzVCLENBQUM7UUFDRCxJQUFJLENBQ0osQ0FBQztZQUNHLHlEQUF5RDtZQUN6RCw4QkFBOEI7WUFDOUIsRUFBRSxDQUFDLENBQUMsV0FBVyxLQUFLLFNBQVMsQ0FBQyxDQUFDLENBQUM7Z0JBQzVCLFFBQVEsR0FBRyxJQUFJLElBQUksQ0FBQyxZQUFZLEVBQUUsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1lBQ3JELENBQUM7WUFBQyxJQUFJLENBQUMsQ0FBQztnQkFDSixRQUFRLEdBQUcsSUFBSSxJQUFJLENBQUMsWUFBWSxFQUFFLFdBQVcsQ0FBQyxDQUFDO1lBQ25ELENBQUM7UUFDTCxDQUFDO1FBRUQsRUFBRTtRQUNGLHVFQUF1RTtRQUN2RSxtRUFBbUU7UUFDbkUsRUFBRTtRQUNGLE1BQU0sQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFO2FBQ25CLElBQUksQ0FBQyxVQUFDLEtBQUs7WUFDUixFQUFFLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUNYLENBQUM7Z0JBQ0csTUFBTSxJQUFJLEtBQUssQ0FBQyxpQkFBZSxLQUFJLENBQUMsU0FBUyxxQkFBa0IsQ0FBQyxDQUFDO1lBQ3JFLENBQUM7UUFDTCxDQUFDLENBQUM7YUFDRCxJQUFJLENBQUM7WUFDRixFQUFFO1lBQ0YsMkRBQTJEO1lBQzNELEVBQUU7WUFDRixNQUFNLENBQUMsUUFBUSxDQUFDLFNBQVMsQ0FBQyxZQUFZLEVBQUUsQ0FBQztRQUM3QyxDQUFDLENBQUM7YUFDRCxJQUFJLENBQUM7WUFDRixFQUFFO1lBQ0YsZUFBZTtZQUNmLEVBQUU7WUFDRixNQUFNLENBQUMsUUFBUSxDQUFDLEtBQUksQ0FBQyxTQUFTLEVBQUUsUUFBUSxDQUFDLFFBQVEsRUFBRSxFQUFFLEVBQUMsa0JBQWtCLEVBQUUsSUFBSSxFQUFDLENBQUMsQ0FBQztRQUNyRixDQUFDLENBQUM7YUFDRCxJQUFJLENBQUM7WUFDRixFQUFFO1lBQ0YsMEJBQTBCO1lBQzFCLEVBQUU7WUFDRixNQUFNLENBQUMsS0FBSSxDQUFDLE1BQU0sRUFBRSxDQUFDO1FBQ3pCLENBQUMsQ0FBQzthQUNELElBQUksQ0FBQztZQUNGLE1BQU0sQ0FBQyxRQUFRLENBQUM7UUFDcEIsQ0FBQyxDQUFDLENBQUM7SUFDUCxDQUFDO0lBR0Q7Ozs7Ozs7Ozs7O09BV0c7SUFDSSx1QkFBUSxHQUFmLFVBQWdCLFlBQThCLEVBQUUsV0FBb0I7UUFFaEUsRUFBRTtRQUNGLHdFQUF3RTtRQUN4RSxlQUFlO1FBQ2YsRUFBRTtRQUNGLElBQUksUUFBYyxDQUFDO1FBRW5CLEVBQUUsQ0FBQyxDQUFDLFlBQVksWUFBWSxJQUFJLENBQUMsQ0FBQyxDQUFDO1lBQy9CLDhEQUE4RDtZQUM5RCw4QkFBOEI7WUFDOUIsUUFBUSxHQUFHLFlBQVksQ0FBQztRQUM1QixDQUFDO1FBQUMsSUFBSSxDQUFDLENBQUM7WUFDVyx5REFBeUQ7WUFDekQsOEJBQThCO1lBQzdDLEVBQUUsQ0FBQyxDQUFDLFdBQVcsS0FBSyxTQUFTLENBQUMsQ0FBQyxDQUFDO2dCQUM1QixRQUFRLEdBQUcsSUFBSSxJQUFJLENBQUMsWUFBWSxFQUFFLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQztZQUNyRCxDQUFDO1lBQUMsSUFBSSxDQUFDLENBQUM7Z0JBQ0osUUFBUSxHQUFHLElBQUksSUFBSSxDQUFDLFlBQVksRUFBRSxXQUFXLENBQUMsQ0FBQztZQUNuRCxDQUFDO1FBQ0wsQ0FBQztRQUVELEVBQUU7UUFDRix1RUFBdUU7UUFDdkUsbUVBQW1FO1FBQ25FLEVBQUU7UUFDRixFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxVQUFVLEVBQUUsQ0FBQyxDQUN2QixDQUFDO1lBQ0csTUFBTSxJQUFJLEtBQUssQ0FBQyxpQkFBZSxJQUFJLENBQUMsU0FBUyxxQkFBa0IsQ0FBQyxDQUFDO1FBQ3JFLENBQUM7UUFFRCxFQUFFO1FBQ0YsMkRBQTJEO1FBQzNELEVBQUU7UUFDRixRQUFRLENBQUMsU0FBUyxDQUFDLGdCQUFnQixFQUFFLENBQUM7UUFFdEMsRUFBRTtRQUNGLGVBQWU7UUFDZixFQUFFO1FBQ0YsWUFBWSxDQUFDLElBQUksQ0FBQyxTQUFTLEVBQUUsUUFBUSxDQUFDLFFBQVEsRUFBRSxFQUFFLEVBQUMsa0JBQWtCLEVBQUUsSUFBSSxFQUFDLENBQUMsQ0FBQztRQUU5RSxFQUFFO1FBQ0YsMEJBQTBCO1FBQzFCLEVBQUU7UUFDRixJQUFJLENBQUMsVUFBVSxFQUFFLENBQUM7UUFFbEIsTUFBTSxDQUFDLFFBQVEsQ0FBQztJQUNwQixDQUFDO0lBR0Q7Ozs7O09BS0c7SUFDSSxvQkFBSyxHQUFaLFVBQWEsSUFBWTtRQUF6QixpQkFNQztRQUpHLE1BQU0sQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLFlBQVksRUFBRTthQUNuQyxJQUFJLENBQUM7WUFDRixNQUFNLENBQUMsY0FBYyxDQUFDLEtBQUksQ0FBQyxTQUFTLEVBQUUsSUFBSSxFQUFFLE1BQU0sQ0FBQyxDQUFDO1FBQ3hELENBQUMsQ0FBQyxDQUFDO0lBQ1AsQ0FBQztJQUdEOzs7O09BSUc7SUFDSSx3QkFBUyxHQUFoQixVQUFpQixJQUFZO1FBRXpCLElBQUksQ0FBQyxTQUFTLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQztRQUNsQyxFQUFFLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxTQUFTLEVBQUUsSUFBSSxDQUFDLENBQUM7SUFDM0MsQ0FBQztJQUdEOzs7OztPQUtHO0lBQ0ksd0JBQVMsR0FBaEIsVUFBaUIsSUFBWTtRQUV6QixJQUFNLFFBQVEsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksRUFBRSxTQUFTLEVBQUUsQ0FBQyxDQUFDLENBQUM7UUFDcEQsTUFBTSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLENBQUM7SUFDaEMsQ0FBQztJQUdEOzs7O09BSUc7SUFDSSw0QkFBYSxHQUFwQixVQUFxQixJQUFZO1FBRTdCLElBQU0sUUFBUSxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxFQUFFLFNBQVMsRUFBRSxDQUFDLENBQUMsQ0FBQztRQUNwRCxNQUFNLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxRQUFRLENBQUMsQ0FBQztJQUNwQyxDQUFDO0lBR0Q7Ozs7T0FJRztJQUNJLG1CQUFJLEdBQVg7UUFBQSxpQkFhQztRQVhHLE1BQU0sQ0FBQyxJQUFJLE9BQU8sQ0FBUyxVQUFDLE9BQStCLEVBQUUsTUFBMEI7WUFDbkYsRUFBRSxDQUFDLFFBQVEsQ0FBQyxLQUFJLENBQUMsU0FBUyxFQUFFLEVBQUMsUUFBUSxFQUFFLE1BQU0sRUFBQyxFQUFFLFVBQUMsR0FBRyxFQUFFLElBQUk7Z0JBQ3RELEVBQUUsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUNSLENBQUM7b0JBQ0csTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDO29CQUNaLE1BQU0sQ0FBQztnQkFDWCxDQUFDO2dCQUVELE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUNsQixDQUFDLENBQUMsQ0FBQztRQUNQLENBQUMsQ0FBQyxDQUFDO0lBQ1AsQ0FBQztJQUdEOzs7O09BSUc7SUFDSSx1QkFBUSxHQUFmO1FBRUksTUFBTSxDQUFDLEVBQUUsQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLFNBQVMsRUFBRSxFQUFDLFFBQVEsRUFBRSxNQUFNLEVBQUMsQ0FBQyxDQUFDO0lBQy9ELENBQUM7SUFHRDs7O09BR0c7SUFDSSx1QkFBUSxHQUFmO1FBRUksTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUU7YUFDakIsSUFBSSxDQUFDLFVBQUMsSUFBSTtZQUNQLE1BQU0sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQzVCLENBQUMsQ0FBQyxDQUFDO0lBQ1AsQ0FBQztJQUdEOzs7T0FHRztJQUNJLDJCQUFZLEdBQW5CO1FBRUksSUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDLFFBQVEsRUFBRSxDQUFDO1FBQzdCLE1BQU0sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDO0lBQzVCLENBQUM7SUFFTCxXQUFDO0FBQUQsQ0EvZkEsQUErZkMsSUFBQTtBQS9mWSxvQkFBSTtBQXdnQmpCOzs7Ozs7R0FNRztBQUNILGtCQUFrQixjQUFzQixFQUFFLFlBQW9CLEVBQUUsT0FBc0I7SUFFbEYsRUFBRTtJQUNGLGNBQWM7SUFDZCwyRUFBMkU7SUFDM0UsdUVBQXVFO0lBQ3ZFLHNFQUFzRTtJQUN0RSx5REFBeUQ7SUFDekQsRUFBRTtJQUVGLE1BQU0sQ0FBQyxJQUFJLE9BQU8sQ0FBTyxVQUFDLE9BQW1CLEVBQUUsTUFBMEI7UUFFckUsSUFBTSxVQUFVLEdBQUcsRUFBRSxDQUFDLGdCQUFnQixDQUFDLGNBQWMsQ0FBQyxDQUFDO1FBQ3ZELElBQU0sbUJBQW1CLEdBQUcsSUFBSSxpQ0FBZSxDQUFDLFVBQVUsQ0FBQyxDQUFDO1FBRTVELElBQU0sV0FBVyxHQUFHLEVBQUUsQ0FBQyxpQkFBaUIsQ0FBQyxZQUFZLENBQUMsQ0FBQztRQUN2RCxJQUFNLG9CQUFvQixHQUFHLElBQUksaUNBQWUsQ0FBQyxXQUFXLENBQUMsQ0FBQztRQUU5RCxtQkFBbUIsQ0FBQyxFQUFFLENBQUMsT0FBTyxFQUFFLFVBQUMsR0FBRztZQUNoQyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUM7WUFDWixtQkFBbUIsQ0FBQyxTQUFTLEVBQUUsQ0FBQztZQUNoQyxvQkFBb0IsQ0FBQyxTQUFTLEVBQUUsQ0FBQztRQUNyQyxDQUFDLENBQUMsQ0FBQztRQUVILG9CQUFvQixDQUFDLEVBQUUsQ0FBQyxPQUFPLEVBQUUsVUFBQyxHQUFHO1lBQ2pDLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQztZQUNaLG1CQUFtQixDQUFDLFNBQVMsRUFBRSxDQUFDO1lBQ2hDLG9CQUFvQixDQUFDLFNBQVMsRUFBRSxDQUFDO1FBQ3JDLENBQUMsQ0FBQyxDQUFDO1FBRUgsb0JBQW9CLENBQUMsRUFBRSxDQUFDLE9BQU8sRUFBRTtZQUM3QixPQUFPLEVBQUUsQ0FBQztZQUNWLG1CQUFtQixDQUFDLFNBQVMsRUFBRSxDQUFDO1lBQ2hDLG9CQUFvQixDQUFDLFNBQVMsRUFBRSxDQUFDO1FBQ3JDLENBQUMsQ0FBQyxDQUFDO1FBRUgsVUFBVSxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQztJQUNqQyxDQUFDLENBQUM7U0FDRCxJQUFJLENBQUM7UUFDRixFQUFFLENBQUMsQ0FBQyxPQUFPLElBQUksT0FBTyxDQUFDLGtCQUFrQixDQUFDLENBQzFDLENBQUM7WUFDRyxFQUFFO1lBQ0YsbUVBQW1FO1lBQ25FLG9DQUFvQztZQUNwQyxFQUFFO1lBQ0YsTUFBTSxDQUFDLFNBQVMsQ0FBQyxjQUFjLENBQUM7aUJBQy9CLElBQUksQ0FBQyxVQUFDLFFBQWtCO2dCQUNyQixFQUFFO2dCQUNGLCtEQUErRDtnQkFDL0QsK0RBQStEO2dCQUMvRCxnRUFBZ0U7Z0JBQ2hFLGlEQUFpRDtnQkFDakQsRUFBRTtnQkFDRixNQUFNLENBQUMsV0FBVyxDQUFDLFlBQVksRUFBRSxRQUFRLENBQUMsS0FBSyxDQUFDLE9BQU8sRUFBRSxHQUFHLElBQUksRUFBRSxRQUFRLENBQUMsS0FBSyxDQUFDLE9BQU8sRUFBRSxHQUFHLElBQUksQ0FBQyxDQUFDO1lBQ3ZHLENBQUMsQ0FBQyxDQUFDO1FBQ1AsQ0FBQztJQUNMLENBQUMsQ0FBQyxDQUFDO0FBQ1AsQ0FBQztBQUdEOzs7OztHQUtHO0FBQ0gsc0JBQXNCLGNBQXNCLEVBQUUsWUFBb0IsRUFBRSxPQUFzQjtJQUV0RixJQUFNLElBQUksR0FBVyxFQUFFLENBQUMsWUFBWSxDQUFDLGNBQWMsQ0FBQyxDQUFDO0lBQ3JELEVBQUUsQ0FBQyxhQUFhLENBQUMsWUFBWSxFQUFFLElBQUksQ0FBQyxDQUFDO0lBRXJDLEVBQUUsQ0FBQyxDQUFDLE9BQU8sSUFBSSxPQUFPLENBQUMsa0JBQWtCLENBQUMsQ0FDMUMsQ0FBQztRQUNHLElBQU0sUUFBUSxHQUFHLEVBQUUsQ0FBQyxRQUFRLENBQUMsY0FBYyxDQUFDLENBQUM7UUFDN0MsRUFBRSxDQUFDLFVBQVUsQ0FBQyxZQUFZLEVBQUUsUUFBUSxDQUFDLEtBQUssQ0FBQyxPQUFPLEVBQUUsR0FBRyxJQUFJLEVBQUUsUUFBUSxDQUFDLEtBQUssQ0FBQyxPQUFPLEVBQUUsR0FBRyxJQUFJLENBQUMsQ0FBQztJQUNsRyxDQUFDO0FBQ0wsQ0FBQyIsImZpbGUiOiJmaWxlLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0ICogYXMgZnMgZnJvbSBcImZzXCI7XG5pbXBvcnQgKiBhcyBwYXRoIGZyb20gXCJwYXRoXCI7XG5pbXBvcnQge3Byb21pc2lmeTEsIHByb21pc2lmeTN9IGZyb20gXCIuL3Byb21pc2VIZWxwZXJzXCI7XG5pbXBvcnQge0RpcmVjdG9yeX0gZnJvbSBcIi4vZGlyZWN0b3J5XCI7XG5pbXBvcnQge0xpc3RlbmVyVHJhY2tlcn0gZnJvbSBcIi4vbGlzdGVuZXJUcmFja2VyXCI7XG5pbXBvcnQge1BhdGhQYXJ0LCByZWR1Y2VQYXRoUGFydHN9IGZyb20gXCIuL3BhdGhIZWxwZXJzXCI7XG5cblxuY29uc3QgdW5saW5rQXN5bmMgPSBwcm9taXNpZnkxPHZvaWQsIHN0cmluZz4oZnMudW5saW5rKTtcbmNvbnN0IHN0YXRBc3luYyAgID0gcHJvbWlzaWZ5MTxmcy5TdGF0cywgc3RyaW5nPihmcy5zdGF0KTtcbmNvbnN0IHV0aW1lc0FzeW5jID0gcHJvbWlzaWZ5Mzx2b2lkLCBzdHJpbmcsIHN0cmluZyB8IG51bWJlciB8IERhdGUsIHN0cmluZyB8IG51bWJlciB8IERhdGU+KGZzLnV0aW1lcyk7XG5jb25zdCB3cml0ZUZpbGVBc3luYyA9IHByb21pc2lmeTM8XG4gICAgdm9pZCxcbiAgICBmcy5QYXRoTGlrZSB8IG51bWJlciwgYW55LFxuICAgIHsgZW5jb2Rpbmc/OiBzdHJpbmcgfCBudWxsOyBtb2RlPzogbnVtYmVyIHwgc3RyaW5nOyBmbGFnPzogc3RyaW5nOyB9IHwgc3RyaW5nIHwgdW5kZWZpbmVkIHwgbnVsbFxuICAgID4oZnMud3JpdGVGaWxlKTtcblxuXG5leHBvcnQgY2xhc3MgRmlsZVxue1xuICAgIC8vcmVnaW9uIERhdGEgTWVtYmVyc1xuICAgIHByaXZhdGUgX2ZpbGVQYXRoOiBzdHJpbmc7XG4gICAgLy9lbmRyZWdpb25cblxuXG4gICAgcHVibGljIGNvbnN0cnVjdG9yKHBhdGhQYXJ0OiBQYXRoUGFydCwgLi4ucGF0aFBhcnRzOiBQYXRoUGFydFtdKVxuICAgIHtcbiAgICAgICAgY29uc3QgYWxsUGFydHM6IFBhdGhQYXJ0W10gPSBbcGF0aFBhcnRdLmNvbmNhdChwYXRoUGFydHMpO1xuICAgICAgICB0aGlzLl9maWxlUGF0aCA9IHJlZHVjZVBhdGhQYXJ0cyhhbGxQYXJ0cyk7XG4gICAgfVxuXG5cbiAgICAvKipcbiAgICAgKiBHZXRzIHRoZSBkaXJlY3RvcnkgcG9ydGlvbiBvZiB0aGlzIGZpbGUncyBwYXRoIChldmVyeXRoaW5nIGJlZm9yZSB0aGVcbiAgICAgKiBmaWxlIG5hbWUgYW5kIGV4dGVuc2lvbikuXG4gICAgICogQHJldHVybiBUaGUgZGlyZWN0b3J5IHBvcnRpb24gb2YgdGhpcyBmaWxlJ3MgcGF0aC4gIFRoaXMgc3RyaW5nIHdpbGxcbiAgICAgKiBhbHdheXMgZW5kIHdpdGggdGhlIE9TJ3MgZGlyZWN0b3J5IHNlcGFyYXRvciAoXCIvXCIpLlxuICAgICAqL1xuICAgIHB1YmxpYyBnZXQgZGlyTmFtZSgpOiBzdHJpbmdcbiAgICB7XG4gICAgICAgIHJldHVybiBwYXRoLmRpcm5hbWUodGhpcy5fZmlsZVBhdGgpICsgcGF0aC5zZXA7XG4gICAgfVxuXG5cbiAgICAvKipcbiAgICAgKiBHZXRzIHRoaXMgZmlsZSdzIGJhc2UgbmFtZS4gIFRoaXMgaXMgdGhlIHBhcnQgb2YgdGhlIGZpbGUgbmFtZSBwcmVjZWRpbmdcbiAgICAgKiB0aGUgZXh0ZW5zaW9uLlxuICAgICAqIEByZXR1cm4gVGhpcyBmaWxlJ3MgYmFzZSBuYW1lLlxuICAgICAqL1xuICAgIHB1YmxpYyBnZXQgYmFzZU5hbWUoKTogc3RyaW5nXG4gICAge1xuICAgICAgICBjb25zdCBleHROYW1lOiBzdHJpbmcgPSBwYXRoLmV4dG5hbWUodGhpcy5fZmlsZVBhdGgpO1xuICAgICAgICByZXR1cm4gcGF0aC5iYXNlbmFtZSh0aGlzLl9maWxlUGF0aCwgZXh0TmFtZSk7XG4gICAgfVxuXG5cbiAgICAvKipcbiAgICAgKiBHZXRzIHRoZSBmdWxsIGZpbGUgbmFtZSBvZiB0aGlzIGZpbGUuICBUaGlzIGluY2x1ZGVzIGJvdGggdGhlIGJhc2UgbmFtZVxuICAgICAqIGFuZCBleHRlbnNpb24uXG4gICAgICogQHJldHVybiBUaGlzIGZpbGUncyBmaWxlIG5hbWVcbiAgICAgKi9cbiAgICBwdWJsaWMgZ2V0IGZpbGVOYW1lKCk6IHN0cmluZ1xuICAgIHtcbiAgICAgICAgcmV0dXJuIHBhdGguYmFzZW5hbWUodGhpcy5fZmlsZVBhdGgpO1xuICAgIH1cblxuXG4gICAgLyoqXG4gICAgICogR2V0cyB0aGUgZXh0ZW5zaW9uIG9mIHRoaXMgZmlsZS4gIFRoaXMgaW5jbHVkZXMgdGhlIGluaXRpYWwgZG90IChcIi5cIikuXG4gICAgICogQHJldHVybiBUaGlzIGZpbGUncyBleHRlbnNpb25cbiAgICAgKi9cbiAgICBwdWJsaWMgZ2V0IGV4dE5hbWUoKTogc3RyaW5nXG4gICAge1xuICAgICAgICByZXR1cm4gcGF0aC5leHRuYW1lKHRoaXMuX2ZpbGVQYXRoKTtcbiAgICB9XG5cblxuICAgIC8qKlxuICAgICAqIEdldHMgdGhlIGRpcmVjdG9yeSBjb250YWluaW5nIHRoaXMgZmlsZVxuICAgICAqIEByZXR1cm4gQSBEaXJlY3Rvcnkgb2JqZWN0IHJlcHJlc2VudGluZyB0aGlzIGZpbGUncyBkaXJlY3RvcnkuXG4gICAgICovXG4gICAgcHVibGljIGdldCBkaXJlY3RvcnkoKTogRGlyZWN0b3J5XG4gICAge1xuICAgICAgICBjb25zdCBkaXJOYW1lOiBzdHJpbmcgPSBwYXRoLmRpcm5hbWUodGhpcy5fZmlsZVBhdGgpO1xuICAgICAgICByZXR1cm4gbmV3IERpcmVjdG9yeShkaXJOYW1lKTtcbiAgICB9XG5cblxuICAgIHB1YmxpYyB0b1N0cmluZygpOiBzdHJpbmdcbiAgICB7XG4gICAgICAgIHJldHVybiB0aGlzLl9maWxlUGF0aDtcbiAgICB9XG5cblxuICAgIHB1YmxpYyBlcXVhbHMob3RoZXJGaWxlOiBGaWxlKTogYm9vbGVhblxuICAgIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuYWJzUGF0aCgpID09PSBvdGhlckZpbGUuYWJzUGF0aCgpO1xuICAgIH1cblxuXG4gICAgcHVibGljIGV4aXN0cygpOiBQcm9taXNlPGZzLlN0YXRzIHwgdW5kZWZpbmVkPlxuICAgIHtcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlPGZzLlN0YXRzIHwgdW5kZWZpbmVkPigocmVzb2x2ZTogKHJlc3VsdDogZnMuU3RhdHMgfCB1bmRlZmluZWQpID0+IHZvaWQpID0+IHtcbiAgICAgICAgICAgIGZzLnN0YXQodGhpcy5fZmlsZVBhdGgsIChlcnI6IGFueSwgc3RhdHM6IGZzLlN0YXRzKSA9PiB7XG5cbiAgICAgICAgICAgICAgICBpZiAoIWVyciAmJiBzdGF0cy5pc0ZpbGUoKSlcbiAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgIHJlc29sdmUoc3RhdHMpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICByZXNvbHZlKHVuZGVmaW5lZCk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG5cbiAgICBwdWJsaWMgZXhpc3RzU3luYygpOiBmcy5TdGF0cyB8IHVuZGVmaW5lZFxuICAgIHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGNvbnN0IHN0YXRzID0gZnMuc3RhdFN5bmModGhpcy5fZmlsZVBhdGgpO1xuICAgICAgICAgICAgcmV0dXJuIHN0YXRzLmlzRmlsZSgpID8gc3RhdHMgOiB1bmRlZmluZWQ7XG4gICAgICAgIH1cbiAgICAgICAgY2F0Y2ggKGVycikge1xuICAgICAgICAgICAgaWYgKGVyci5jb2RlID09PSBcIkVOT0VOVFwiKVxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgdGhyb3cgZXJyO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG5cbiAgICBwdWJsaWMgYWJzUGF0aCgpOiBzdHJpbmdcbiAgICB7XG4gICAgICAgIHJldHVybiBwYXRoLnJlc29sdmUodGhpcy5fZmlsZVBhdGgpO1xuICAgIH1cblxuXG4gICAgcHVibGljIGRlbGV0ZSgpOiBQcm9taXNlPHZvaWQ+XG4gICAge1xuICAgICAgICByZXR1cm4gdGhpcy5leGlzdHMoKVxuICAgICAgICAudGhlbigoc3RhdHMpID0+IHtcbiAgICAgICAgICAgIGlmICghc3RhdHMpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKCk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHJldHVybiB1bmxpbmtBc3luYyh0aGlzLl9maWxlUGF0aCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH1cblxuXG4gICAgcHVibGljIGRlbGV0ZVN5bmMoKTogdm9pZFxuICAgIHtcbiAgICAgICAgaWYgKCF0aGlzLmV4aXN0c1N5bmMoKSkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgZnMudW5saW5rU3luYyh0aGlzLl9maWxlUGF0aCk7XG4gICAgfVxuXG5cbiAgICAvKipcbiAgICAgKiBDb3BpZXMgdGhpcyBmaWxlIHRvIHRoZSBzcGVjaWZpZWQgZGVzdGluYXRpb24uICBQcmVzZXJ2ZXMgdGhlIGZpbGUncyBsYXN0XG4gICAgICogYWNjZXNzZWQgdGltZSAoYXRpbWUpIGFuZCBsYXN0IG1vZGlmaWVkIHRpbWUgKG10aW1lKS5cbiAgICAgKiBAcGFyYW0gZHN0RGlyT3JGaWxlIC0gSWYgYSBGaWxlLCBzcGVjaWZpZXMgdGhlXG4gICAgICogZGVzdGluYXRpb24gZGlyZWN0b3J5IGFuZCBmaWxlIG5hbWUuICBJZiBhIGRpcmVjdG9yeSwgc3BlY2lmaWVzIG9ubHkgdGhlXG4gICAgICogZGVzdGluYXRpb24gZGlyZWN0b3J5IGFuZCBkZXN0RmlsZU5hbWUgc3BlY2lmaWVzIHRoZSBkZXN0aW5hdGlvbiBmaWxlXG4gICAgICogbmFtZS5cbiAgICAgKiBAcGFyYW0gZHN0RmlsZU5hbWUgLSBXaGVuIGRlc3REaXJPckZpbGUgaXMgYSBEaXJlY3RvcnksXG4gICAgICogb3B0aW9uYWxseSBzcGVjaWZpZXMgdGhlIGRlc3RpbmF0aW9uIGZpbGUgbmFtZS4gIElmIG9taXR0ZWQsIHRoZVxuICAgICAqIGRlc3RpbmF0aW9uIGZpbGUgbmFtZSB3aWxsIGJlIHRoZSBzYW1lIGFzIHRoZSBzb3VyY2UgKHRoaXMgRmlsZSkuXG4gICAgICogQHJldHVybiBBIFByb21pc2UgZm9yIGEgRmlsZSByZXByZXNlbnRpbmcgdGhlIGRlc3RpbmF0aW9uIGZpbGUuXG4gICAgICovXG4gICAgcHVibGljIGNvcHkoZHN0RGlyT3JGaWxlOiBEaXJlY3RvcnkgfCBGaWxlLCBkc3RGaWxlTmFtZT86IHN0cmluZyk6IFByb21pc2U8RmlsZT5cbiAgICB7XG4gICAgICAgIC8vXG4gICAgICAgIC8vIEJhc2VkIG9uIHRoZSBwYXJhbWV0ZXJzLCBmaWd1cmUgb3V0IHdoYXQgdGhlIGRlc3RpbmF0aW9uIGZpbGUgcGF0aCBpc1xuICAgICAgICAvLyBnb2luZyB0byBiZS5cbiAgICAgICAgLy9cbiAgICAgICAgbGV0IGRlc3RGaWxlOiBGaWxlO1xuXG4gICAgICAgIGlmIChkc3REaXJPckZpbGUgaW5zdGFuY2VvZiBGaWxlKSB7XG4gICAgICAgICAgICAvLyBUaGUgY2FsbGVyIGhhcyBzcGVjaWZpZWQgdGhlIGRlc3RpbmF0aW9uIGRpcmVjdG9yeSBhbmQgZmlsZVxuICAgICAgICAgICAgLy8gbmFtZSBpbiB0aGUgZm9ybSBvZiBhIEZpbGUuXG4gICAgICAgICAgICBkZXN0RmlsZSA9IGRzdERpck9yRmlsZTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlXG4gICAgICAgIHsgICAgICAgICAgIC8vIGRzdERpck9yRmlsZSBpbnN0YW5jZW9mIERpcmVjdG9yeVxuICAgICAgICAgICAgLy8gVGhlIGNhbGxlciBoYXMgc3BlY2lmaWVkIHRoZSBkZXN0aW5hdGlvbiBkaXJlY3RvcnkgYW5kXG4gICAgICAgICAgICAvLyBvcHRpb25hbGx5IGEgbmV3IGZpbGUgbmFtZS5cbiAgICAgICAgICAgIGlmIChkc3RGaWxlTmFtZSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgZGVzdEZpbGUgPSBuZXcgRmlsZShkc3REaXJPckZpbGUsIHRoaXMuZmlsZU5hbWUpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBkZXN0RmlsZSA9IG5ldyBGaWxlKGRzdERpck9yRmlsZSwgZHN0RmlsZU5hbWUpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgLy9cbiAgICAgICAgLy8gQmVmb3JlIHdlIGRvIGFueXRoaW5nLCBtYWtlIHN1cmUgdGhhdCB0aGUgc291cmNlIGZpbGUgZXhpc3RzLiAgSWYgaXRcbiAgICAgICAgLy8gZG9lc24ndCB3ZSBzaG91bGQgZ2V0IG91dCBiZWZvcmUgd2UgY3JlYXRlIHRoZSBkZXN0aW5hdGlvbiBmaWxlLlxuICAgICAgICAvL1xuICAgICAgICByZXR1cm4gdGhpcy5leGlzdHMoKVxuICAgICAgICAudGhlbigoc3RhdHMpID0+IHtcbiAgICAgICAgICAgIGlmICghc3RhdHMpXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBTb3VyY2UgZmlsZSAke3RoaXMuX2ZpbGVQYXRofSBkb2VzIG5vdCBleGlzdC5gKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSlcbiAgICAgICAgLnRoZW4oKCkgPT4ge1xuICAgICAgICAgICAgLy9cbiAgICAgICAgICAgIC8vIE1ha2Ugc3VyZSB0aGUgZGlyZWN0b3J5IGZvciB0aGUgZGVzdGluYXRpb24gZmlsZSBleGlzdHMuXG4gICAgICAgICAgICAvL1xuICAgICAgICAgICAgcmV0dXJuIGRlc3RGaWxlLmRpcmVjdG9yeS5lbnN1cmVFeGlzdHMoKTtcbiAgICAgICAgfSlcbiAgICAgICAgLnRoZW4oKCkgPT4ge1xuICAgICAgICAgICAgLy9cbiAgICAgICAgICAgIC8vIERvIHRoZSBjb3B5LlxuICAgICAgICAgICAgLy9cbiAgICAgICAgICAgIHJldHVybiBjb3B5RmlsZSh0aGlzLl9maWxlUGF0aCwgZGVzdEZpbGUudG9TdHJpbmcoKSwge3ByZXNlcnZlVGltZXN0YW1wczogdHJ1ZX0pO1xuICAgICAgICB9KVxuICAgICAgICAudGhlbigoKSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gZGVzdEZpbGU7XG4gICAgICAgIH0pO1xuICAgIH1cblxuXG4gICAgLyoqXG4gICAgICogQ29waWVzIHRoaXMgZmlsZSB0byB0aGUgc3BlY2lmaWVkIGRlc3RpbmF0aW9uLiAgUHJlc2VydmVzIHRoZSBmaWxlJ3MgbGFzdFxuICAgICAqIGFjY2Vzc2VkIHRpbWUgKGF0aW1lKSBhbmQgbGFzdCBtb2RpZmllZCB0aW1lIChtdGltZSkuXG4gICAgICogQHBhcmFtIGRzdERpck9yRmlsZSAtIElmIGEgRmlsZSwgc3BlY2lmaWVzIHRoZVxuICAgICAqIGRlc3RpbmF0aW9uIGRpcmVjdG9yeSBhbmQgZmlsZSBuYW1lLiAgSWYgYSBkaXJlY3RvcnksIHNwZWNpZmllcyBvbmx5IHRoZVxuICAgICAqIGRlc3RpbmF0aW9uIGRpcmVjdG9yeSBhbmQgZGVzdEZpbGVOYW1lIHNwZWNpZmllcyB0aGUgZGVzdGluYXRpb24gZmlsZVxuICAgICAqIG5hbWUuXG4gICAgICogQHBhcmFtIGRzdEZpbGVOYW1lIC0gV2hlbiBkZXN0RGlyT3JGaWxlIGlzIGEgRGlyZWN0b3J5LFxuICAgICAqIG9wdGlvbmFsbHkgc3BlY2lmaWVzIHRoZSBkZXN0aW5hdGlvbiBmaWxlIG5hbWUuICBJZiBvbWl0dGVkLCB0aGVcbiAgICAgKiBkZXN0aW5hdGlvbiBmaWxlIG5hbWUgd2lsbCBiZSB0aGUgc2FtZSBhcyB0aGUgc291cmNlICh0aGlzIEZpbGUpLlxuICAgICAqIEByZXR1cm4gQSBGaWxlIHJlcHJlc2VudGluZyB0aGUgZGVzdGluYXRpb24gZmlsZS5cbiAgICAgKi9cbiAgICBwdWJsaWMgY29weVN5bmMoZHN0RGlyT3JGaWxlOiBEaXJlY3RvcnkgfCBGaWxlLCBkc3RGaWxlTmFtZT86IHN0cmluZyk6IEZpbGVcbiAgICB7XG4gICAgICAgIC8vXG4gICAgICAgIC8vIEJhc2VkIG9uIHRoZSBwYXJhbWV0ZXJzLCBmaWd1cmUgb3V0IHdoYXQgdGhlIGRlc3RpbmF0aW9uIGZpbGUgcGF0aCBpc1xuICAgICAgICAvLyBnb2luZyB0byBiZS5cbiAgICAgICAgLy9cbiAgICAgICAgbGV0IGRlc3RGaWxlOiBGaWxlO1xuXG4gICAgICAgIGlmIChkc3REaXJPckZpbGUgaW5zdGFuY2VvZiBGaWxlKSB7XG4gICAgICAgICAgICAvLyBUaGUgY2FsbGVyIGhhcyBzcGVjaWZpZWQgdGhlIGRlc3RpbmF0aW9uIGRpcmVjdG9yeSBhbmQgZmlsZVxuICAgICAgICAgICAgLy8gbmFtZSBpbiB0aGUgZm9ybSBvZiBhIEZpbGUuXG4gICAgICAgICAgICBkZXN0RmlsZSA9IGRzdERpck9yRmlsZTtcbiAgICAgICAgfSBlbHNlIHsgICAgICAgICAgIC8vIGRzdERpck9yRmlsZSBpbnN0YW5jZW9mIERpcmVjdG9yeVxuICAgICAgICAgICAgLy8gVGhlIGNhbGxlciBoYXMgc3BlY2lmaWVkIHRoZSBkZXN0aW5hdGlvbiBkaXJlY3RvcnkgYW5kXG4gICAgICAgICAgICAvLyBvcHRpb25hbGx5IGEgbmV3IGZpbGUgbmFtZS5cbiAgICAgICAgICAgIGlmIChkc3RGaWxlTmFtZSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgZGVzdEZpbGUgPSBuZXcgRmlsZShkc3REaXJPckZpbGUsIHRoaXMuZmlsZU5hbWUpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBkZXN0RmlsZSA9IG5ldyBGaWxlKGRzdERpck9yRmlsZSwgZHN0RmlsZU5hbWUpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgLy9cbiAgICAgICAgLy8gQmVmb3JlIHdlIGRvIGFueXRoaW5nLCBtYWtlIHN1cmUgdGhhdCB0aGUgc291cmNlIGZpbGUgZXhpc3RzLiAgSWYgaXRcbiAgICAgICAgLy8gZG9lc24ndCB3ZSBzaG91bGQgZ2V0IG91dCBiZWZvcmUgd2UgY3JlYXRlIHRoZSBkZXN0aW5hdGlvbiBmaWxlLlxuICAgICAgICAvL1xuICAgICAgICBpZiAoIXRoaXMuZXhpc3RzU3luYygpKVxuICAgICAgICB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYFNvdXJjZSBmaWxlICR7dGhpcy5fZmlsZVBhdGh9IGRvZXMgbm90IGV4aXN0LmApO1xuICAgICAgICB9XG5cbiAgICAgICAgLy9cbiAgICAgICAgLy8gTWFrZSBzdXJlIHRoZSBkaXJlY3RvcnkgZm9yIHRoZSBkZXN0aW5hdGlvbiBmaWxlIGV4aXN0cy5cbiAgICAgICAgLy9cbiAgICAgICAgZGVzdEZpbGUuZGlyZWN0b3J5LmVuc3VyZUV4aXN0c1N5bmMoKTtcblxuICAgICAgICAvL1xuICAgICAgICAvLyBEbyB0aGUgY29weS5cbiAgICAgICAgLy9cbiAgICAgICAgY29weUZpbGVTeW5jKHRoaXMuX2ZpbGVQYXRoLCBkZXN0RmlsZS50b1N0cmluZygpLCB7cHJlc2VydmVUaW1lc3RhbXBzOiB0cnVlfSk7XG5cbiAgICAgICAgcmV0dXJuIGRlc3RGaWxlO1xuICAgIH1cblxuXG4gICAgLyoqXG4gICAgICogTW92ZXMgdGhpcyBmaWxlIHRvIHRoZSBzcGVjaWZpZWQgZGVzdGluYXRpb24uICBQcmVzZXJ2ZXMgdGhlIGZpbGUncyBsYXN0XG4gICAgICogYWNjZXNzZWQgdGltZSAoYXRpbWUpIGFuZCBsYXN0IG1vZGlmaWVkIHRpbWUgKG10aW1lKS5cbiAgICAgKiBAcGFyYW0gZHN0RGlyT3JGaWxlIC0gSWYgYSBGaWxlLCBzcGVjaWZpZXMgdGhlXG4gICAgICogZGVzdGluYXRpb24gZGlyZWN0b3J5IGFuZCBmaWxlIG5hbWUuICBJZiBhIGRpcmVjdG9yeSwgc3BlY2lmaWVzIG9ubHkgdGhlXG4gICAgICogZGVzdGluYXRpb24gZGlyZWN0b3J5IGFuZCBkZXN0RmlsZU5hbWUgc3BlY2lmaWVzIHRoZSBkZXN0aW5hdGlvbiBmaWxlXG4gICAgICogbmFtZS5cbiAgICAgKiBAcGFyYW0gZHN0RmlsZU5hbWUgLSBXaGVuIGRlc3REaXJPckZpbGUgaXMgYSBEaXJlY3RvcnksXG4gICAgICogb3B0aW9uYWxseSBzcGVjaWZpZXMgdGhlIGRlc3RpbmF0aW9uIGZpbGUgbmFtZS4gIElmIG9taXR0ZWQsIHRoZVxuICAgICAqIGRlc3RpbmF0aW9uIGZpbGUgbmFtZSB3aWxsIGJlIHRoZSBzYW1lIGFzIHRoZSBzb3VyY2UgKHRoaXMgRmlsZSkuXG4gICAgICogQHJldHVybiBBIFByb21pc2UgZm9yIGEgRmlsZSByZXByZXNlbnRpbmcgdGhlIGRlc3RpbmF0aW9uIGZpbGUuXG4gICAgICovXG4gICAgcHVibGljIG1vdmUoZHN0RGlyT3JGaWxlOiBEaXJlY3RvcnkgfCBGaWxlLCBkc3RGaWxlTmFtZT86IHN0cmluZyk6IFByb21pc2U8RmlsZT5cbiAgICB7XG4gICAgICAgIC8vXG4gICAgICAgIC8vIEJhc2VkIG9uIHRoZSBwYXJhbWV0ZXJzLCBmaWd1cmUgb3V0IHdoYXQgdGhlIGRlc3RpbmF0aW9uIGZpbGUgcGF0aCBpc1xuICAgICAgICAvLyBnb2luZyB0byBiZS5cbiAgICAgICAgLy9cbiAgICAgICAgbGV0IGRlc3RGaWxlOiBGaWxlO1xuXG4gICAgICAgIGlmIChkc3REaXJPckZpbGUgaW5zdGFuY2VvZiBGaWxlKSB7XG4gICAgICAgICAgICAvLyBUaGUgY2FsbGVyIGhhcyBzcGVjaWZpZWQgdGhlIGRlc3RpbmF0aW9uIGRpcmVjdG9yeSBhbmQgZmlsZVxuICAgICAgICAgICAgLy8gbmFtZSBpbiB0aGUgZm9ybSBvZiBhIEZpbGUuXG4gICAgICAgICAgICBkZXN0RmlsZSA9IGRzdERpck9yRmlsZTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlXG4gICAgICAgIHsgICAgICAgICAgIC8vIGRzdERpck9yRmlsZSBpbnN0YW5jZW9mIERpcmVjdG9yeVxuICAgICAgICAgICAgLy8gVGhlIGNhbGxlciBoYXMgc3BlY2lmaWVkIHRoZSBkZXN0aW5hdGlvbiBkaXJlY3RvcnkgYW5kXG4gICAgICAgICAgICAvLyBvcHRpb25hbGx5IGEgbmV3IGZpbGUgbmFtZS5cbiAgICAgICAgICAgIGlmIChkc3RGaWxlTmFtZSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgZGVzdEZpbGUgPSBuZXcgRmlsZShkc3REaXJPckZpbGUsIHRoaXMuZmlsZU5hbWUpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBkZXN0RmlsZSA9IG5ldyBGaWxlKGRzdERpck9yRmlsZSwgZHN0RmlsZU5hbWUpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgLy9cbiAgICAgICAgLy8gQmVmb3JlIHdlIGRvIGFueXRoaW5nLCBtYWtlIHN1cmUgdGhhdCB0aGUgc291cmNlIGZpbGUgZXhpc3RzLiAgSWYgaXRcbiAgICAgICAgLy8gZG9lc24ndCB3ZSBzaG91bGQgZ2V0IG91dCBiZWZvcmUgd2UgY3JlYXRlIHRoZSBkZXN0aW5hdGlvbiBmaWxlLlxuICAgICAgICAvL1xuICAgICAgICByZXR1cm4gdGhpcy5leGlzdHMoKVxuICAgICAgICAudGhlbigoc3RhdHMpID0+IHtcbiAgICAgICAgICAgIGlmICghc3RhdHMpXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBTb3VyY2UgZmlsZSAke3RoaXMuX2ZpbGVQYXRofSBkb2VzIG5vdCBleGlzdC5gKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSlcbiAgICAgICAgLnRoZW4oKCkgPT4ge1xuICAgICAgICAgICAgLy9cbiAgICAgICAgICAgIC8vIE1ha2Ugc3VyZSB0aGUgZGlyZWN0b3J5IGZvciB0aGUgZGVzdGluYXRpb24gZmlsZSBleGlzdHMuXG4gICAgICAgICAgICAvL1xuICAgICAgICAgICAgcmV0dXJuIGRlc3RGaWxlLmRpcmVjdG9yeS5lbnN1cmVFeGlzdHMoKTtcbiAgICAgICAgfSlcbiAgICAgICAgLnRoZW4oKCkgPT4ge1xuICAgICAgICAgICAgLy9cbiAgICAgICAgICAgIC8vIERvIHRoZSBjb3B5LlxuICAgICAgICAgICAgLy9cbiAgICAgICAgICAgIHJldHVybiBjb3B5RmlsZSh0aGlzLl9maWxlUGF0aCwgZGVzdEZpbGUudG9TdHJpbmcoKSwge3ByZXNlcnZlVGltZXN0YW1wczogdHJ1ZX0pO1xuICAgICAgICB9KVxuICAgICAgICAudGhlbigoKSA9PiB7XG4gICAgICAgICAgICAvL1xuICAgICAgICAgICAgLy8gRGVsZXRlIHRoZSBzb3VyY2UgZmlsZS5cbiAgICAgICAgICAgIC8vXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5kZWxldGUoKTtcbiAgICAgICAgfSlcbiAgICAgICAgLnRoZW4oKCkgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIGRlc3RGaWxlO1xuICAgICAgICB9KTtcbiAgICB9XG5cblxuICAgIC8qKlxuICAgICAqIE1vdmVzIHRoaXMgZmlsZSB0byB0aGUgc3BlY2lmaWVkIGRlc3RpbmF0aW9uLiAgUHJlc2VydmVzIHRoZSBmaWxlJ3MgbGFzdFxuICAgICAqIGFjY2Vzc2VkIHRpbWUgKGF0aW1lKSBhbmQgbGFzdCBtb2RpZmllZCB0aW1lIChtdGltZSkuXG4gICAgICogQHBhcmFtIGRzdERpck9yRmlsZSAtIElmIGEgRmlsZSwgc3BlY2lmaWVzIHRoZVxuICAgICAqIGRlc3RpbmF0aW9uIGRpcmVjdG9yeSBhbmQgZmlsZSBuYW1lLiAgSWYgYSBkaXJlY3RvcnksIHNwZWNpZmllcyBvbmx5IHRoZVxuICAgICAqIGRlc3RpbmF0aW9uIGRpcmVjdG9yeSBhbmQgZGVzdEZpbGVOYW1lIHNwZWNpZmllcyB0aGUgZGVzdGluYXRpb24gZmlsZVxuICAgICAqIG5hbWUuXG4gICAgICogQHBhcmFtIGRzdEZpbGVOYW1lIC0gV2hlbiBkZXN0RGlyT3JGaWxlIGlzIGEgRGlyZWN0b3J5LFxuICAgICAqIG9wdGlvbmFsbHkgc3BlY2lmaWVzIHRoZSBkZXN0aW5hdGlvbiBmaWxlIG5hbWUuICBJZiBvbWl0dGVkLCB0aGVcbiAgICAgKiBkZXN0aW5hdGlvbiBmaWxlIG5hbWUgd2lsbCBiZSB0aGUgc2FtZSBhcyB0aGUgc291cmNlICh0aGlzIEZpbGUpLlxuICAgICAqIEByZXR1cm4gQSBGaWxlIHJlcHJlc2VudGluZyB0aGUgZGVzdGluYXRpb24gZmlsZS5cbiAgICAgKi9cbiAgICBwdWJsaWMgbW92ZVN5bmMoZHN0RGlyT3JGaWxlOiBEaXJlY3RvcnkgfCBGaWxlLCBkc3RGaWxlTmFtZT86IHN0cmluZyk6IEZpbGVcbiAgICB7XG4gICAgICAgIC8vXG4gICAgICAgIC8vIEJhc2VkIG9uIHRoZSBwYXJhbWV0ZXJzLCBmaWd1cmUgb3V0IHdoYXQgdGhlIGRlc3RpbmF0aW9uIGZpbGUgcGF0aCBpc1xuICAgICAgICAvLyBnb2luZyB0byBiZS5cbiAgICAgICAgLy9cbiAgICAgICAgbGV0IGRlc3RGaWxlOiBGaWxlO1xuXG4gICAgICAgIGlmIChkc3REaXJPckZpbGUgaW5zdGFuY2VvZiBGaWxlKSB7XG4gICAgICAgICAgICAvLyBUaGUgY2FsbGVyIGhhcyBzcGVjaWZpZWQgdGhlIGRlc3RpbmF0aW9uIGRpcmVjdG9yeSBhbmQgZmlsZVxuICAgICAgICAgICAgLy8gbmFtZSBpbiB0aGUgZm9ybSBvZiBhIEZpbGUuXG4gICAgICAgICAgICBkZXN0RmlsZSA9IGRzdERpck9yRmlsZTtcbiAgICAgICAgfSBlbHNlIHsgICAgICAgICAgIC8vIGRzdERpck9yRmlsZSBpbnN0YW5jZW9mIERpcmVjdG9yeVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gVGhlIGNhbGxlciBoYXMgc3BlY2lmaWVkIHRoZSBkZXN0aW5hdGlvbiBkaXJlY3RvcnkgYW5kXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBvcHRpb25hbGx5IGEgbmV3IGZpbGUgbmFtZS5cbiAgICAgICAgICAgIGlmIChkc3RGaWxlTmFtZSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgZGVzdEZpbGUgPSBuZXcgRmlsZShkc3REaXJPckZpbGUsIHRoaXMuZmlsZU5hbWUpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBkZXN0RmlsZSA9IG5ldyBGaWxlKGRzdERpck9yRmlsZSwgZHN0RmlsZU5hbWUpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgLy9cbiAgICAgICAgLy8gQmVmb3JlIHdlIGRvIGFueXRoaW5nLCBtYWtlIHN1cmUgdGhhdCB0aGUgc291cmNlIGZpbGUgZXhpc3RzLiAgSWYgaXRcbiAgICAgICAgLy8gZG9lc24ndCB3ZSBzaG91bGQgZ2V0IG91dCBiZWZvcmUgd2UgY3JlYXRlIHRoZSBkZXN0aW5hdGlvbiBmaWxlLlxuICAgICAgICAvL1xuICAgICAgICBpZiAoIXRoaXMuZXhpc3RzU3luYygpKVxuICAgICAgICB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYFNvdXJjZSBmaWxlICR7dGhpcy5fZmlsZVBhdGh9IGRvZXMgbm90IGV4aXN0LmApO1xuICAgICAgICB9XG5cbiAgICAgICAgLy9cbiAgICAgICAgLy8gTWFrZSBzdXJlIHRoZSBkaXJlY3RvcnkgZm9yIHRoZSBkZXN0aW5hdGlvbiBmaWxlIGV4aXN0cy5cbiAgICAgICAgLy9cbiAgICAgICAgZGVzdEZpbGUuZGlyZWN0b3J5LmVuc3VyZUV4aXN0c1N5bmMoKTtcblxuICAgICAgICAvL1xuICAgICAgICAvLyBEbyB0aGUgY29weS5cbiAgICAgICAgLy9cbiAgICAgICAgY29weUZpbGVTeW5jKHRoaXMuX2ZpbGVQYXRoLCBkZXN0RmlsZS50b1N0cmluZygpLCB7cHJlc2VydmVUaW1lc3RhbXBzOiB0cnVlfSk7XG5cbiAgICAgICAgLy9cbiAgICAgICAgLy8gRGVsZXRlIHRoZSBzb3VyY2UgZmlsZS5cbiAgICAgICAgLy9cbiAgICAgICAgdGhpcy5kZWxldGVTeW5jKCk7XG5cbiAgICAgICAgcmV0dXJuIGRlc3RGaWxlO1xuICAgIH1cblxuXG4gICAgLyoqXG4gICAgICogV3JpdGVzIHRleHQgdG8gdGhpcyBmaWxlLCByZXBsYWNpbmcgdGhlIGZpbGUgaWYgaXQgZXhpc3RzLiAgSWYgYW55IHBhcmVudFxuICAgICAqIGRpcmVjdG9yaWVzIGRvIG5vdCBleGlzdCwgdGhleSBhcmUgY3JlYXRlZC5cbiAgICAgKiBAcGFyYW0gdGV4dCAtIFRoZSBuZXcgY29udGVudHMgb2YgdGhpcyBmaWxlXG4gICAgICogQHJldHVybiBBIFByb21pc2UgdGhhdCBpcyByZXNvbHZlZCB3aGVuIHRoZSBmaWxlIGhhcyBiZWVuIHdyaXR0ZW4uXG4gICAgICovXG4gICAgcHVibGljIHdyaXRlKHRleHQ6IHN0cmluZyk6IFByb21pc2U8dm9pZD5cbiAgICB7XG4gICAgICAgIHJldHVybiB0aGlzLmRpcmVjdG9yeS5lbnN1cmVFeGlzdHMoKVxuICAgICAgICAudGhlbigoKSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gd3JpdGVGaWxlQXN5bmModGhpcy5fZmlsZVBhdGgsIHRleHQsIFwidXRmOFwiKTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG5cbiAgICAvKipcbiAgICAgKiBXcml0ZXMgdGV4dCB0byB0aGlzIGZpbGUsIHJlcGxhY2luZyB0aGUgZmlsZSBpZiBpdCBleGlzdHMuICBJZiBhbnkgcGFyZW50XG4gICAgICogZGlyZWN0b3JpZXMgZG8gbm90IGV4aXN0LCB0aGV5IGFyZSBjcmVhdGVkLlxuICAgICAqIEBwYXJhbSB0ZXh0IC0gVGhlIG5ldyBjb250ZW50cyBvZiB0aGlzIGZpbGVcbiAgICAgKi9cbiAgICBwdWJsaWMgd3JpdGVTeW5jKHRleHQ6IHN0cmluZyk6IHZvaWRcbiAgICB7XG4gICAgICAgIHRoaXMuZGlyZWN0b3J5LmVuc3VyZUV4aXN0c1N5bmMoKTtcbiAgICAgICAgZnMud3JpdGVGaWxlU3luYyh0aGlzLl9maWxlUGF0aCwgdGV4dCk7XG4gICAgfVxuXG5cbiAgICAvKipcbiAgICAgKiBXcml0ZXMgSlNPTiBkYXRhIHRvIHRoaXMgZmlsZSwgcmVwbGFjaW5nIHRoZSBmaWxlIGlmIGl0IGV4aXN0cy4gIElmIGFueVxuICAgICAqIHBhcmVudCBkaXJlY3RvcmllcyBkbyBub3QgZXhpc3QsIHRoZXkgYXJlIGNyZWF0ZWQuXG4gICAgICogQHBhcmFtIGRhdGEgLSBUaGUgZGF0YSB0byBiZSBzdHJpbmdpZmllZCBhbmQgd3JpdHRlblxuICAgICAqIEByZXR1cm4gQSBQcm9taXNlIHRoYXQgaXMgcmVzb2x2ZWQgd2hlbiB0aGUgZmlsZSBoYXMgYmVlbiB3cml0dGVuXG4gICAgICovXG4gICAgcHVibGljIHdyaXRlSnNvbihkYXRhOiBvYmplY3QpOiBQcm9taXNlPHZvaWQ+XG4gICAge1xuICAgICAgICBjb25zdCBqc29uVGV4dCA9IEpTT04uc3RyaW5naWZ5KGRhdGEsIHVuZGVmaW5lZCwgNCk7XG4gICAgICAgIHJldHVybiB0aGlzLndyaXRlKGpzb25UZXh0KTtcbiAgICB9XG5cblxuICAgIC8qKlxuICAgICAqIFdyaXRlcyBKU09OIGRhdGEgdG8gdGhpcyBmaWxlLCByZXBsYWNpbmcgdGhlIGZpbGUgaWYgaXQgZXhpc3RzLiAgSWYgYW55XG4gICAgICogcGFyZW50IGRpcmVjdG9yaWVzIGRvIG5vdCBleGlzdCwgdGhleSBhcmUgY3JlYXRlZC5cbiAgICAgKiBAcGFyYW0gZGF0YSAtIFRoZSBkYXRhIHRvIGJlIHN0cmluZ2lmaWVkIGFuZCB3cml0dGVuXG4gICAgICovXG4gICAgcHVibGljIHdyaXRlSnNvblN5bmMoZGF0YTogb2JqZWN0KTogdm9pZFxuICAgIHtcbiAgICAgICAgY29uc3QganNvblRleHQgPSBKU09OLnN0cmluZ2lmeShkYXRhLCB1bmRlZmluZWQsIDQpO1xuICAgICAgICByZXR1cm4gdGhpcy53cml0ZVN5bmMoanNvblRleHQpO1xuICAgIH1cblxuXG4gICAgLyoqXG4gICAgICogUmVhZHMgdGhlIGNvbnRlbnRzIG9mIHRoaXMgZmlsZSBhcyBhIHN0cmluZy4gIFJlamVjdHMgaWYgdGhpcyBmaWxlIGRvZXNcbiAgICAgKiBub3QgZXhpc3QuXG4gICAgICogQHJldHVybiBBIFByb21pc2UgZm9yIHRoZSB0ZXh0IGNvbnRlbnRzIG9mIHRoaXMgZmlsZVxuICAgICAqL1xuICAgIHB1YmxpYyByZWFkKCk6IFByb21pc2U8c3RyaW5nPlxuICAgIHtcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlPHN0cmluZz4oKHJlc29sdmU6ICh0ZXh0OiBzdHJpbmcpID0+IHZvaWQsIHJlamVjdDogKGVycjogYW55KSA9PiB2b2lkKSA9PiB7XG4gICAgICAgICAgICBmcy5yZWFkRmlsZSh0aGlzLl9maWxlUGF0aCwge2VuY29kaW5nOiBcInV0ZjhcIn0sIChlcnIsIGRhdGEpID0+IHtcbiAgICAgICAgICAgICAgICBpZiAoZXJyKVxuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgcmVqZWN0KGVycik7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICByZXNvbHZlKGRhdGEpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuXG4gICAgLyoqXG4gICAgICogUmVhZHMgdGhlIGNvbnRlbnRzIG9mIHRoaXMgZmlsZSBhcyBhIHN0cmluZy4gIFRocm93cyBpZiB0aGlzIGZpbGUgZG9lc1xuICAgICAqIG5vdCBleGlzdC5cbiAgICAgKiBAcmV0dXJuIFRoaXMgZmlsZSdzIGNvbnRlbnRzXG4gICAgICovXG4gICAgcHVibGljIHJlYWRTeW5jKCk6IHN0cmluZ1xuICAgIHtcbiAgICAgICAgcmV0dXJuIGZzLnJlYWRGaWxlU3luYyh0aGlzLl9maWxlUGF0aCwge2VuY29kaW5nOiBcInV0ZjhcIn0pO1xuICAgIH1cblxuXG4gICAgLyoqXG4gICAgICogUmVhZHMgSlNPTiBkYXRhIGZyb20gdGhpcyBmaWxlLiAgUmVqZWN0cyBpZiB0aGlzIGZpbGUgZG9lcyBub3QgZXhpc3QuXG4gICAgICogQHJldHVybiB7UHJvbWlzZTxUPn0gQSBwcm9taXNlIGZvciB0aGUgcGFyc2VkIGRhdGEgY29udGFpbmVkIGluIHRoaXMgZmlsZVxuICAgICAqL1xuICAgIHB1YmxpYyByZWFkSnNvbjxUPigpOiBQcm9taXNlPFQ+XG4gICAge1xuICAgICAgICByZXR1cm4gdGhpcy5yZWFkKClcbiAgICAgICAgLnRoZW4oKHRleHQpID0+IHtcbiAgICAgICAgICAgIHJldHVybiBKU09OLnBhcnNlKHRleHQpO1xuICAgICAgICB9KTtcbiAgICB9XG5cblxuICAgIC8qKlxuICAgICAqIFJlYWRzIEpTT04gZGF0YSBmcm9tIHRoaXMgZmlsZS4gIFRocm93cyBpZiB0aGlzIGZpbGUgZG9lcyBub3QgZXhpc3QuXG4gICAgICogQHJldHVybiB7VH0gVGhlIHBhcnNlZCBkYXRhIGNvbnRhaW5lZCBpbiB0aGlzIGZpbGVcbiAgICAgKi9cbiAgICBwdWJsaWMgcmVhZEpzb25TeW5jPFQ+KCk6IFRcbiAgICB7XG4gICAgICAgIGNvbnN0IHRleHQgPSB0aGlzLnJlYWRTeW5jKCk7XG4gICAgICAgIHJldHVybiBKU09OLnBhcnNlKHRleHQpO1xuICAgIH1cblxufVxuXG5cbmV4cG9ydCBpbnRlcmZhY2UgSUNvcHlPcHRpb25zXG57XG4gICAgcHJlc2VydmVUaW1lc3RhbXBzOiBib29sZWFuO1xufVxuXG5cbi8qKlxuICogQ29waWVzIGEgZmlsZS5cbiAqIEBwYXJhbSBzb3VyY2VGaWxlUGF0aCAtIFRoZSBwYXRoIHRvIHRoZSBzb3VyY2UgZmlsZVxuICogQHBhcmFtIGRlc3RGaWxlUGF0aCAtIFRoZSBwYXRoIHRvIHRoZSBkZXN0aW5hdGlvbiBmaWxlXG4gKiBAcGFyYW0gb3B0aW9ucyAtIE9wdGlvbnMgZm9yIHRoZSBjb3B5IG9wZXJhdGlvblxuICogQHJldHVybiBBIFByb21pc2UgdGhhdCBpcyByZXNvbHZlZCB3aGVuIHRoZSBmaWxlIGhhcyBiZWVuIGNvcGllZC5cbiAqL1xuZnVuY3Rpb24gY29weUZpbGUoc291cmNlRmlsZVBhdGg6IHN0cmluZywgZGVzdEZpbGVQYXRoOiBzdHJpbmcsIG9wdGlvbnM/OiBJQ29weU9wdGlvbnMpOiBQcm9taXNlPHZvaWQ+XG57XG4gICAgLy9cbiAgICAvLyBEZXNpZ24gTm90ZVxuICAgIC8vIFdlIGNvdWxkIGhhdmUgdXNlZCBmcy5yZWFkRmlsZSgpIGFuZCBmcy53cml0ZUZpbGUoKSBoZXJlLCBidXQgdGhhdCB3b3VsZFxuICAgIC8vIHJlYWQgdGhlIGVudGlyZSBmaWxlIGNvbnRlbnRzIG9mIHRoZSBzb3VyY2UgZmlsZSBpbnRvIG1lbW9yeS4gIEl0IGlzXG4gICAgLy8gdGhvdWdodCB0aGF0IHVzaW5nIHN0cmVhbXMgaXMgbW9yZSBlZmZpY2llbnQgYW5kIHBlcmZvcm1hbnQgYmVjYXVzZVxuICAgIC8vIHN0cmVhbXMgY2FuIHJlYWQgYW5kIHdyaXRlIHNtYWxsZXIgY2h1bmtzIG9mIHRoZSBkYXRhLlxuICAgIC8vXG5cbiAgICByZXR1cm4gbmV3IFByb21pc2U8dm9pZD4oKHJlc29sdmU6ICgpID0+IHZvaWQsIHJlamVjdDogKGVycjogYW55KSA9PiB2b2lkKSA9PiB7XG5cbiAgICAgICAgY29uc3QgcmVhZFN0cmVhbSA9IGZzLmNyZWF0ZVJlYWRTdHJlYW0oc291cmNlRmlsZVBhdGgpO1xuICAgICAgICBjb25zdCByZWFkTGlzdGVuZXJUcmFja2VyID0gbmV3IExpc3RlbmVyVHJhY2tlcihyZWFkU3RyZWFtKTtcblxuICAgICAgICBjb25zdCB3cml0ZVN0cmVhbSA9IGZzLmNyZWF0ZVdyaXRlU3RyZWFtKGRlc3RGaWxlUGF0aCk7XG4gICAgICAgIGNvbnN0IHdyaXRlTGlzdGVuZXJUcmFja2VyID0gbmV3IExpc3RlbmVyVHJhY2tlcih3cml0ZVN0cmVhbSk7XG5cbiAgICAgICAgcmVhZExpc3RlbmVyVHJhY2tlci5vbihcImVycm9yXCIsIChlcnIpID0+IHtcbiAgICAgICAgICAgIHJlamVjdChlcnIpO1xuICAgICAgICAgICAgcmVhZExpc3RlbmVyVHJhY2tlci5yZW1vdmVBbGwoKTtcbiAgICAgICAgICAgIHdyaXRlTGlzdGVuZXJUcmFja2VyLnJlbW92ZUFsbCgpO1xuICAgICAgICB9KTtcblxuICAgICAgICB3cml0ZUxpc3RlbmVyVHJhY2tlci5vbihcImVycm9yXCIsIChlcnIpID0+IHtcbiAgICAgICAgICAgIHJlamVjdChlcnIpO1xuICAgICAgICAgICAgcmVhZExpc3RlbmVyVHJhY2tlci5yZW1vdmVBbGwoKTtcbiAgICAgICAgICAgIHdyaXRlTGlzdGVuZXJUcmFja2VyLnJlbW92ZUFsbCgpO1xuICAgICAgICB9KTtcblxuICAgICAgICB3cml0ZUxpc3RlbmVyVHJhY2tlci5vbihcImNsb3NlXCIsICgpID0+IHtcbiAgICAgICAgICAgIHJlc29sdmUoKTtcbiAgICAgICAgICAgIHJlYWRMaXN0ZW5lclRyYWNrZXIucmVtb3ZlQWxsKCk7XG4gICAgICAgICAgICB3cml0ZUxpc3RlbmVyVHJhY2tlci5yZW1vdmVBbGwoKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgcmVhZFN0cmVhbS5waXBlKHdyaXRlU3RyZWFtKTtcbiAgICB9KVxuICAgIC50aGVuKCgpID0+IHtcbiAgICAgICAgaWYgKG9wdGlvbnMgJiYgb3B0aW9ucy5wcmVzZXJ2ZVRpbWVzdGFtcHMpXG4gICAgICAgIHtcbiAgICAgICAgICAgIC8vXG4gICAgICAgICAgICAvLyBUaGUgY2FsbGVyIHdhbnRzIHRvIHByZXNlcnZlIHRoZSBzb3VyY2UgZmlsZSdzIHRpbWVzdGFtcHMuICBDb3B5XG4gICAgICAgICAgICAvLyB0aGVtIHRvIHRoZSBkZXN0aW5hdGlvbiBmaWxlIG5vdy5cbiAgICAgICAgICAgIC8vXG4gICAgICAgICAgICByZXR1cm4gc3RhdEFzeW5jKHNvdXJjZUZpbGVQYXRoKVxuICAgICAgICAgICAgLnRoZW4oKHNyY1N0YXRzOiBmcy5TdGF0cykgPT4ge1xuICAgICAgICAgICAgICAgIC8vXG4gICAgICAgICAgICAgICAgLy8gTm90ZTogIFNldHRpbmcgdGhlIHRpbWVzdGFtcHMgb24gZGVzdCByZXF1aXJlcyB1cyB0byBzcGVjaWZ5XG4gICAgICAgICAgICAgICAgLy8gdGhlIHRpbWVzdGFtcCBpbiBzZWNvbmRzIChub3QgbWlsbGlzZWNvbmRzKS4gIFdoZW4gd2UgZGl2aWRlXG4gICAgICAgICAgICAgICAgLy8gYnkgMTAwMCBiZWxvdyBhbmQgdHJ1bmNhdGlvbiBoYXBwZW5zLCB3ZSBhcmUgYWN0dWFsbHkgc2V0dGluZ1xuICAgICAgICAgICAgICAgIC8vIGRlc3QncyB0aW1lc3RhbXBzICpiZWZvcmUqIHRob3NlIG9mIG9mIHNvdXJjZS5cbiAgICAgICAgICAgICAgICAvL1xuICAgICAgICAgICAgICAgIHJldHVybiB1dGltZXNBc3luYyhkZXN0RmlsZVBhdGgsIHNyY1N0YXRzLmF0aW1lLnZhbHVlT2YoKSAvIDEwMDAsIHNyY1N0YXRzLm10aW1lLnZhbHVlT2YoKSAvIDEwMDApO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9KTtcbn1cblxuXG4vKipcbiAqIENvcGllcyBhIGZpbGUgc3luY2hyb25vdXNseS5cbiAqIEBwYXJhbSBzb3VyY2VGaWxlUGF0aCAtIFRoZSBwYXRoIHRvIHRoZSBzb3VyY2UgZmlsZVxuICogQHBhcmFtIGRlc3RGaWxlUGF0aCAtIFRoZSBwYXRoIHRvIHRoZSBkZXN0aW5hdGlvbiBmaWxlXG4gKiBAcGFyYW0gb3B0aW9ucyAtIE9wdGlvbnMgZm9yIHRoZSBjb3B5IG9wZXJhdGlvblxuICovXG5mdW5jdGlvbiBjb3B5RmlsZVN5bmMoc291cmNlRmlsZVBhdGg6IHN0cmluZywgZGVzdEZpbGVQYXRoOiBzdHJpbmcsIG9wdGlvbnM/OiBJQ29weU9wdGlvbnMpOiB2b2lkXG57XG4gICAgY29uc3QgZGF0YTogQnVmZmVyID0gZnMucmVhZEZpbGVTeW5jKHNvdXJjZUZpbGVQYXRoKTtcbiAgICBmcy53cml0ZUZpbGVTeW5jKGRlc3RGaWxlUGF0aCwgZGF0YSk7XG5cbiAgICBpZiAob3B0aW9ucyAmJiBvcHRpb25zLnByZXNlcnZlVGltZXN0YW1wcylcbiAgICB7XG4gICAgICAgIGNvbnN0IHNyY1N0YXRzID0gZnMuc3RhdFN5bmMoc291cmNlRmlsZVBhdGgpO1xuICAgICAgICBmcy51dGltZXNTeW5jKGRlc3RGaWxlUGF0aCwgc3JjU3RhdHMuYXRpbWUudmFsdWVPZigpIC8gMTAwMCwgc3JjU3RhdHMubXRpbWUudmFsdWVPZigpIC8gMTAwMCk7XG4gICAgfVxufVxuIl19
