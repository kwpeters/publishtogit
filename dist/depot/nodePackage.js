"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var BBPromise = require("bluebird");
var directory_1 = require("./directory");
var file_1 = require("./file");
var spawn_1 = require("./spawn");
var gitHelpers_1 = require("./gitHelpers");
var NodePackage = /** @class */ (function () {
    // endregion
    /**
     * Constructs a new NodePackage.  This constructor is private and should not
     * be called by clients.  Instead, use one of the static methods to create
     * instances.
     *
     * @class
     * @classdesc A class that represents a Node.js package.
     *
     * @param pkgDir - The directory containing the Node.js package
     */
    function NodePackage(pkgDir) {
        this._pkgDir = pkgDir.absolute();
    }
    /**
     * Creates a NodePackage representing the package in the specified directory.
     * @param pkgDir - The directory containing the Node.js package
     * @return A promise for the resulting NodePackage.  This promise will be
     * rejected if the specified directory does not exist or does not contain a
     * package.json file.
     */
    NodePackage.fromDirectory = function (pkgDir) {
        // Make sure the directory exists.
        return pkgDir.exists()
            .then(function (stats) {
            if (!stats) {
                throw new Error("Directory " + pkgDir.toString() + " does not exist.");
            }
            // Make sure the package has a package.json file in it.
            var packageJson = new file_1.File(pkgDir, "package.json");
            return packageJson.exists();
        })
            .then(function (stats) {
            if (!stats) {
                throw new Error("Directory " + pkgDir.toString() + " does not contain a package.json file.");
            }
            return new NodePackage(pkgDir);
        });
    };
    Object.defineProperty(NodePackage.prototype, "projectName", {
        // TODO: Write unit tests for the following method.
        get: function () {
            return gitHelpers_1.gitUrlToProjectName(this.config.repository.url);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(NodePackage.prototype, "config", {
        get: function () {
            // If the package.json file has not been read yet, read it now.
            if (this._config === undefined) {
                this._config = new file_1.File(this._pkgDir, "package.json").readJsonSync();
            }
            return this._config;
        },
        enumerable: true,
        configurable: true
    });
    /**
     * Packs this Node package into a .tgz file using "npm pack"
     * @method
     * @param outDir - The output directory where to place the output file.  If
     * not specified, the output will be placed in the package's folder.
     * @return A File object representing the output .tgz file
     */
    NodePackage.prototype.pack = function (outDir) {
        var _this = this;
        return spawn_1.spawn("npm", ["pack"], this._pkgDir.toString())
            .closePromise
            .then(function (stdout) {
            return new file_1.File(_this._pkgDir, stdout);
        })
            .then(function (tgzFile) {
            if (outDir) {
                return tgzFile.move(outDir);
            }
            else {
                return tgzFile;
            }
        });
    };
    /**
     * Publishes this Node.js package to the specified directory.
     * @param publishDir - The directory that will contain the published version
     * of this package
     * @param emptyPublishDir - A flag indicating whether publishDir should be
     * emptied before publishing to it.  If publishing to a regular directory,
     * you probably want to pass true so that any old files are removed.  If
     * publishing to a Git repo directory, you probably want false because you
     * have already removed the files under version control and want the .git
     * directory to remain.
     * @param tmpDir - A temporary directory that can be used when packing and
     * unpacking the package.
     * @return A promise for publishDir
     */
    NodePackage.prototype.publish = function (publishDir, emptyPublishDir, tmpDir) {
        var packageBaseName;
        var extractedTarFile;
        var unpackedDir;
        var unpackedPackageDir;
        // Since we will be executing commands from different directories, make
        // the directories absolute so things don't get confusing.
        publishDir = publishDir.absolute();
        tmpDir = tmpDir.absolute();
        if (publishDir.equals(tmpDir)) {
            return BBPromise.reject("When publishing, publishDir cannot be the same as tmpDir");
        }
        return this.pack(tmpDir)
            .then(function (tgzFile) {
            packageBaseName = tgzFile.baseName;
            // Running the following gunzip command will extract the .tgz file
            // to a .tar file with the same basename.  The original .tgz file is
            // deleted.
            return spawn_1.spawn("gunzip", ["--force", tgzFile.fileName], tmpDir.toString())
                .closePromise;
        })
            .then(function () {
            // The above gunzip command should have extracted a .tar file.  Make
            // sure this assumption is true.
            extractedTarFile = new file_1.File(tmpDir, packageBaseName + ".tar");
            return extractedTarFile.exists()
                .then(function (exists) {
                if (!exists) {
                    throw new Error("Extracted .tar file " + extractedTarFile.toString() + " does not exist.  Aborting.");
                }
            });
        })
            .then(function () {
            // We are about to unpack the tar file.  Create an empty
            // directory where its contents will be placed.
            unpackedDir = new directory_1.Directory(tmpDir, packageBaseName);
            return unpackedDir.empty(); // Creates (if needed) and empties this directory.
        })
            .then(function () {
            return spawn_1.spawn("tar", ["-x", "-C", unpackedDir.toString(), "-f", extractedTarFile.toString()], tmpDir.toString())
                .closePromise;
        })
            .then(function () {
            // When uncompressed, all content is contained within a "package"
            // directory.
            unpackedPackageDir = new directory_1.Directory(unpackedDir, "package");
            return unpackedPackageDir.exists();
        })
            .then(function (stats) {
            if (!stats) {
                throw new Error("Uncompressed package does not have a 'package' directory as expected.");
            }
            if (emptyPublishDir) {
                // The caller wants us to empty the publish directory before
                // publishing to it.  Do it now.
                return publishDir.empty();
            }
        })
            .then(function () {
            return unpackedPackageDir.copy(publishDir, false);
        })
            .then(function () {
            return publishDir;
        });
    };
    return NodePackage;
}());
exports.NodePackage = NodePackage;

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9kZXBvdC9ub2RlUGFja2FnZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUNBLG9DQUFzQztBQUN0Qyx5Q0FBc0M7QUFDdEMsK0JBQTRCO0FBQzVCLGlDQUE4QjtBQUM5QiwyQ0FBaUQ7QUFZakQ7SUF1Q0ksWUFBWTtJQUdaOzs7Ozs7Ozs7T0FTRztJQUNILHFCQUFvQixNQUFpQjtRQUVqQyxJQUFJLENBQUMsT0FBTyxHQUFHLE1BQU0sQ0FBQyxRQUFRLEVBQUUsQ0FBQztJQUNyQyxDQUFDO0lBcEREOzs7Ozs7T0FNRztJQUNXLHlCQUFhLEdBQTNCLFVBQTRCLE1BQWlCO1FBRXpDLGtDQUFrQztRQUNsQyxPQUFPLE1BQU0sQ0FBQyxNQUFNLEVBQUU7YUFDckIsSUFBSSxDQUFDLFVBQUMsS0FBMkI7WUFDOUIsSUFBSSxDQUFDLEtBQUssRUFDVjtnQkFDSSxNQUFNLElBQUksS0FBSyxDQUFDLGVBQWEsTUFBTSxDQUFDLFFBQVEsRUFBRSxxQkFBa0IsQ0FBQyxDQUFDO2FBQ3JFO1lBRUQsdURBQXVEO1lBQ3ZELElBQU0sV0FBVyxHQUFHLElBQUksV0FBSSxDQUFDLE1BQU0sRUFBRSxjQUFjLENBQUMsQ0FBQztZQUNyRCxPQUFPLFdBQVcsQ0FBQyxNQUFNLEVBQUUsQ0FBQztRQUNoQyxDQUFDLENBQUM7YUFDRCxJQUFJLENBQUMsVUFBQyxLQUFLO1lBQ1IsSUFBSSxDQUFDLEtBQUssRUFDVjtnQkFDSSxNQUFNLElBQUksS0FBSyxDQUFDLGVBQWEsTUFBTSxDQUFDLFFBQVEsRUFBRSwyQ0FBd0MsQ0FBQyxDQUFDO2FBQzNGO1lBRUQsT0FBTyxJQUFJLFdBQVcsQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUNuQyxDQUFDLENBQUMsQ0FBQztJQUVQLENBQUM7SUEwQkQsc0JBQVcsb0NBQVc7UUFEdEIsbURBQW1EO2FBQ25EO1lBRUksT0FBTyxnQ0FBbUIsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLFVBQVUsQ0FBQyxHQUFHLENBQUMsQ0FBQztR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QUFFLENBQUMsSUFBSSxFQUFFLElBQUksRUFBRSxXQUFXLENBQUMsUUFBUSxFQUFFLEVBQUUsSUFBSSxFQUFFLGdCQUFnQixDQUFDLFFBQVEsRUFBRSxDQUFDLEVBQUUsTUFBTSxDQUFDLFFBQVEsRUFBRSxDQUFDO2lCQUM5RyxZQUFZLENBQUM7UUFDbEIsQ0FBQyxDQUFDO2FBQ0QsSUFBSSxDQUFDO1lBQ0YsaUVBQWlFO1lBQ2pFLGFBQWE7WUFDYixrQkFBa0IsR0FBRyxJQUFJLHFCQUFTLENBQUMsV0FBVyxFQUFFLFNBQVMsQ0FBQyxDQUFDO1lBQzNELE9BQU8sa0JBQWtCLENBQUMsTUFBTSxFQUFFLENBQUM7UUFDdkMsQ0FBQyxDQUFDO2FBQ0QsSUFBSSxDQUFDLFVBQUMsS0FBSztZQUNSLElBQUksQ0FBQyxLQUFLLEVBQ1Y7Z0JBQ0ksTUFBTSxJQUFJLEtBQUssQ0FBQyx1RUFBdUUsQ0FBQyxDQUFDO2FBQzVGO1lBRUQsSUFBSSxlQUFlLEVBQ25CO2dCQUNJLDREQUE0RDtnQkFDNUQsZ0NBQWdDO2dCQUNoQyxPQUFPLFVBQVUsQ0FBQyxLQUFLLEVBQUUsQ0FBQzthQUM3QjtRQUNMLENBQUMsQ0FBQzthQUNELElBQUksQ0FBQztZQUNGLE9BQU8sa0JBQWtCLENBQUMsSUFBSSxDQUFDLFVBQVUsRUFBRSxLQUFLLENBQUMsQ0FBQztRQUN0RCxDQUFDLENBQUM7YUFDRCxJQUFJLENBQUM7WUFDRixPQUFPLFVBQVUsQ0FBQztRQUN0QixDQUFDLENBQUMsQ0FBQztJQUNQLENBQUM7SUFHTCxrQkFBQztBQUFELENBak1BLEFBaU1DLElBQUE7QUFqTVksa0NBQVciLCJmaWxlIjoiZGVwb3Qvbm9kZVBhY2thZ2UuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgKiBhcyBmcyBmcm9tIFwiZnNcIjtcbmltcG9ydCAqIGFzIEJCUHJvbWlzZSBmcm9tIFwiYmx1ZWJpcmRcIjtcbmltcG9ydCB7RGlyZWN0b3J5fSBmcm9tIFwiLi9kaXJlY3RvcnlcIjtcbmltcG9ydCB7RmlsZX0gZnJvbSBcIi4vZmlsZVwiO1xuaW1wb3J0IHtzcGF3bn0gZnJvbSBcIi4vc3Bhd25cIjtcbmltcG9ydCB7Z2l0VXJsVG9Qcm9qZWN0TmFtZX0gZnJvbSBcIi4vZ2l0SGVscGVyc1wiO1xuXG5cbmV4cG9ydCBpbnRlcmZhY2UgSVBhY2thZ2VKc29uXG57XG4gICAgbmFtZTogc3RyaW5nO1xuICAgIHZlcnNpb246IHN0cmluZztcbiAgICBkZXNjcmlwdGlvbjogc3RyaW5nO1xuICAgIHJlcG9zaXRvcnk6IHt0eXBlOiBzdHJpbmcsIHVybDogc3RyaW5nfTtcbn1cblxuXG5leHBvcnQgY2xhc3MgTm9kZVBhY2thZ2VcbntcblxuICAgIC8qKlxuICAgICAqIENyZWF0ZXMgYSBOb2RlUGFja2FnZSByZXByZXNlbnRpbmcgdGhlIHBhY2thZ2UgaW4gdGhlIHNwZWNpZmllZCBkaXJlY3RvcnkuXG4gICAgICogQHBhcmFtIHBrZ0RpciAtIFRoZSBkaXJlY3RvcnkgY29udGFpbmluZyB0aGUgTm9kZS5qcyBwYWNrYWdlXG4gICAgICogQHJldHVybiBBIHByb21pc2UgZm9yIHRoZSByZXN1bHRpbmcgTm9kZVBhY2thZ2UuICBUaGlzIHByb21pc2Ugd2lsbCBiZVxuICAgICAqIHJlamVjdGVkIGlmIHRoZSBzcGVjaWZpZWQgZGlyZWN0b3J5IGRvZXMgbm90IGV4aXN0IG9yIGRvZXMgbm90IGNvbnRhaW4gYVxuICAgICAqIHBhY2thZ2UuanNvbiBmaWxlLlxuICAgICAqL1xuICAgIHB1YmxpYyBzdGF0aWMgZnJvbURpcmVjdG9yeShwa2dEaXI6IERpcmVjdG9yeSk6IFByb21pc2U8Tm9kZVBhY2thZ2U+XG4gICAge1xuICAgICAgICAvLyBNYWtlIHN1cmUgdGhlIGRpcmVjdG9yeSBleGlzdHMuXG4gICAgICAgIHJldHVybiBwa2dEaXIuZXhpc3RzKClcbiAgICAgICAgLnRoZW4oKHN0YXRzOiBmcy5TdGF0cyB8IHVuZGVmaW5lZCkgPT4ge1xuICAgICAgICAgICAgaWYgKCFzdGF0cylcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYERpcmVjdG9yeSAke3BrZ0Rpci50b1N0cmluZygpfSBkb2VzIG5vdCBleGlzdC5gKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gTWFrZSBzdXJlIHRoZSBwYWNrYWdlIGhhcyBhIHBhY2thZ2UuanNvbiBmaWxlIGluIGl0LlxuICAgICAgICAgICAgY29uc3QgcGFja2FnZUpzb24gPSBuZXcgRmlsZShwa2dEaXIsIFwicGFja2FnZS5qc29uXCIpO1xuICAgICAgICAgICAgcmV0dXJuIHBhY2thZ2VKc29uLmV4aXN0cygpO1xuICAgICAgICB9KVxuICAgICAgICAudGhlbigoc3RhdHMpID0+IHtcbiAgICAgICAgICAgIGlmICghc3RhdHMpXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBEaXJlY3RvcnkgJHtwa2dEaXIudG9TdHJpbmcoKX0gZG9lcyBub3QgY29udGFpbiBhIHBhY2thZ2UuanNvbiBmaWxlLmApO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gbmV3IE5vZGVQYWNrYWdlKHBrZ0Rpcik7XG4gICAgICAgIH0pO1xuXG4gICAgfVxuXG5cbiAgICAvLyByZWdpb24gRGF0YSBtZW1iZXJzXG4gICAgcHJpdmF0ZSBfcGtnRGlyOiBEaXJlY3Rvcnk7XG4gICAgcHJpdmF0ZSBfY29uZmlnOiBJUGFja2FnZUpzb24gfCB1bmRlZmluZWQ7XG4gICAgLy8gZW5kcmVnaW9uXG5cblxuICAgIC8qKlxuICAgICAqIENvbnN0cnVjdHMgYSBuZXcgTm9kZVBhY2thZ2UuICBUaGlzIGNvbnN0cnVjdG9yIGlzIHByaXZhdGUgYW5kIHNob3VsZCBub3RcbiAgICAgKiBiZSBjYWxsZWQgYnkgY2xpZW50cy4gIEluc3RlYWQsIHVzZSBvbmUgb2YgdGhlIHN0YXRpYyBtZXRob2RzIHRvIGNyZWF0ZVxuICAgICAqIGluc3RhbmNlcy5cbiAgICAgKlxuICAgICAqIEBjbGFzc1xuICAgICAqIEBjbGFzc2Rlc2MgQSBjbGFzcyB0aGF0IHJlcHJlc2VudHMgYSBOb2RlLmpzIHBhY2thZ2UuXG4gICAgICpcbiAgICAgKiBAcGFyYW0gcGtnRGlyIC0gVGhlIGRpcmVjdG9yeSBjb250YWluaW5nIHRoZSBOb2RlLmpzIHBhY2thZ2VcbiAgICAgKi9cbiAgICBwcml2YXRlIGNvbnN0cnVjdG9yKHBrZ0RpcjogRGlyZWN0b3J5KVxuICAgIHtcbiAgICAgICAgdGhpcy5fcGtnRGlyID0gcGtnRGlyLmFic29sdXRlKCk7XG4gICAgfVxuXG5cbiAgICAvLyBUT0RPOiBXcml0ZSB1bml0IHRlc3RzIGZvciB0aGUgZm9sbG93aW5nIG1ldGhvZC5cbiAgICBwdWJsaWMgZ2V0IHByb2plY3ROYW1lKCk6IHN0cmluZ1xuICAgIHtcbiAgICAgICAgcmV0dXJuIGdpdFVybFRvUHJvamVjdE5hbWUodGhpcy5jb25maWcucmVwb3NpdG9yeS51cmwpO1xuICAgIH1cblxuXG4gICAgcHVibGljIGdldCBjb25maWcoKTogSVBhY2thZ2VKc29uXG4gICAge1xuICAgICAgICAvLyBJZiB0aGUgcGFja2FnZS5qc29uIGZpbGUgaGFzIG5vdCBiZWVuIHJlYWQgeWV0LCByZWFkIGl0IG5vdy5cbiAgICAgICAgaWYgKHRoaXMuX2NvbmZpZyA9PT0gdW5kZWZpbmVkKVxuICAgICAgICB7XG4gICAgICAgICAgICB0aGlzLl9jb25maWcgPSBuZXcgRmlsZSh0aGlzLl9wa2dEaXIsIFwicGFja2FnZS5qc29uXCIpLnJlYWRKc29uU3luYzxJUGFja2FnZUpzb24+KCk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gdGhpcy5fY29uZmlnITtcbiAgICB9XG5cblxuICAgIC8qKlxuICAgICAqIFBhY2tzIHRoaXMgTm9kZSBwYWNrYWdlIGludG8gYSAudGd6IGZpbGUgdXNpbmcgXCJucG0gcGFja1wiXG4gICAgICogQG1ldGhvZFxuICAgICAqIEBwYXJhbSBvdXREaXIgLSBUaGUgb3V0cHV0IGRpcmVjdG9yeSB3aGVyZSB0byBwbGFjZSB0aGUgb3V0cHV0IGZpbGUuICBJZlxuICAgICAqIG5vdCBzcGVjaWZpZWQsIHRoZSBvdXRwdXQgd2lsbCBiZSBwbGFjZWQgaW4gdGhlIHBhY2thZ2UncyBmb2xkZXIuXG4gICAgICogQHJldHVybiBBIEZpbGUgb2JqZWN0IHJlcHJlc2VudGluZyB0aGUgb3V0cHV0IC50Z3ogZmlsZVxuICAgICAqL1xuICAgIHB1YmxpYyBwYWNrKG91dERpcj86IERpcmVjdG9yeSk6IFByb21pc2U8RmlsZT5cbiAgICB7XG4gICAgICAgIHJldHVybiBzcGF3bihcIm5wbVwiLCBbXCJwYWNrXCJdLCB0aGlzLl9wa2dEaXIudG9TdHJpbmcoKSlcbiAgICAgICAgLmNsb3NlUHJvbWlzZVxuICAgICAgICAudGhlbigoc3Rkb3V0OiBzdHJpbmcpID0+IHtcbiAgICAgICAgICAgIHJldHVybiBuZXcgRmlsZSh0aGlzLl9wa2dEaXIsIHN0ZG91dCk7XG4gICAgICAgIH0pXG4gICAgICAgIC50aGVuKCh0Z3pGaWxlOiBGaWxlKSA9PiB7XG4gICAgICAgICAgICBpZiAob3V0RGlyKVxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIHJldHVybiB0Z3pGaWxlLm1vdmUob3V0RGlyKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGd6RmlsZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfVxuXG5cbiAgICAvKipcbiAgICAgKiBQdWJsaXNoZXMgdGhpcyBOb2RlLmpzIHBhY2thZ2UgdG8gdGhlIHNwZWNpZmllZCBkaXJlY3RvcnkuXG4gICAgICogQHBhcmFtIHB1Ymxpc2hEaXIgLSBUaGUgZGlyZWN0b3J5IHRoYXQgd2lsbCBjb250YWluIHRoZSBwdWJsaXNoZWQgdmVyc2lvblxuICAgICAqIG9mIHRoaXMgcGFja2FnZVxuICAgICAqIEBwYXJhbSBlbXB0eVB1Ymxpc2hEaXIgLSBBIGZsYWcgaW5kaWNhdGluZyB3aGV0aGVyIHB1Ymxpc2hEaXIgc2hvdWxkIGJlXG4gICAgICogZW1wdGllZCBiZWZvcmUgcHVibGlzaGluZyB0byBpdC4gIElmIHB1Ymxpc2hpbmcgdG8gYSByZWd1bGFyIGRpcmVjdG9yeSxcbiAgICAgKiB5b3UgcHJvYmFibHkgd2FudCB0byBwYXNzIHRydWUgc28gdGhhdCBhbnkgb2xkIGZpbGVzIGFyZSByZW1vdmVkLiAgSWZcbiAgICAgKiBwdWJsaXNoaW5nIHRvIGEgR2l0IHJlcG8gZGlyZWN0b3J5LCB5b3UgcHJvYmFibHkgd2FudCBmYWxzZSBiZWNhdXNlIHlvdVxuICAgICAqIGhhdmUgYWxyZWFkeSByZW1vdmVkIHRoZSBmaWxlcyB1bmRlciB2ZXJzaW9uIGNvbnRyb2wgYW5kIHdhbnQgdGhlIC5naXRcbiAgICAgKiBkaXJlY3RvcnkgdG8gcmVtYWluLlxuICAgICAqIEBwYXJhbSB0bXBEaXIgLSBBIHRlbXBvcmFyeSBkaXJlY3RvcnkgdGhhdCBjYW4gYmUgdXNlZCB3aGVuIHBhY2tpbmcgYW5kXG4gICAgICogdW5wYWNraW5nIHRoZSBwYWNrYWdlLlxuICAgICAqIEByZXR1cm4gQSBwcm9taXNlIGZvciBwdWJsaXNoRGlyXG4gICAgICovXG4gICAgcHVibGljIHB1Ymxpc2gocHVibGlzaERpcjogRGlyZWN0b3J5LCBlbXB0eVB1Ymxpc2hEaXI6IGJvb2xlYW4sIHRtcERpcjogRGlyZWN0b3J5KTogUHJvbWlzZTxEaXJlY3Rvcnk+XG4gICAge1xuICAgICAgICBsZXQgcGFja2FnZUJhc2VOYW1lOiBzdHJpbmc7XG4gICAgICAgIGxldCBleHRyYWN0ZWRUYXJGaWxlOiBGaWxlO1xuICAgICAgICBsZXQgdW5wYWNrZWREaXI6IERpcmVjdG9yeTtcbiAgICAgICAgbGV0IHVucGFja2VkUGFja2FnZURpcjogRGlyZWN0b3J5O1xuXG4gICAgICAgIC8vIFNpbmNlIHdlIHdpbGwgYmUgZXhlY3V0aW5nIGNvbW1hbmRzIGZyb20gZGlmZmVyZW50IGRpcmVjdG9yaWVzLCBtYWtlXG4gICAgICAgIC8vIHRoZSBkaXJlY3RvcmllcyBhYnNvbHV0ZSBzbyB0aGluZ3MgZG9uJ3QgZ2V0IGNvbmZ1c2luZy5cbiAgICAgICAgcHVibGlzaERpciA9IHB1Ymxpc2hEaXIuYWJzb2x1dGUoKTtcbiAgICAgICAgdG1wRGlyID0gdG1wRGlyLmFic29sdXRlKCk7XG5cbiAgICAgICAgaWYgKHB1Ymxpc2hEaXIuZXF1YWxzKHRtcERpcikpIHtcbiAgICAgICAgICAgIHJldHVybiBCQlByb21pc2UucmVqZWN0KFwiV2hlbiBwdWJsaXNoaW5nLCBwdWJsaXNoRGlyIGNhbm5vdCBiZSB0aGUgc2FtZSBhcyB0bXBEaXJcIik7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gdGhpcy5wYWNrKHRtcERpcilcbiAgICAgICAgLnRoZW4oKHRnekZpbGU6IEZpbGUpID0+IHtcbiAgICAgICAgICAgIHBhY2thZ2VCYXNlTmFtZSA9IHRnekZpbGUuYmFzZU5hbWU7XG5cbiAgICAgICAgICAgIC8vIFJ1bm5pbmcgdGhlIGZvbGxvd2luZyBndW56aXAgY29tbWFuZCB3aWxsIGV4dHJhY3QgdGhlIC50Z3ogZmlsZVxuICAgICAgICAgICAgLy8gdG8gYSAudGFyIGZpbGUgd2l0aCB0aGUgc2FtZSBiYXNlbmFtZS4gIFRoZSBvcmlnaW5hbCAudGd6IGZpbGUgaXNcbiAgICAgICAgICAgIC8vIGRlbGV0ZWQuXG4gICAgICAgICAgICByZXR1cm4gc3Bhd24oXCJndW56aXBcIiwgW1wiLS1mb3JjZVwiLCB0Z3pGaWxlLmZpbGVOYW1lXSwgdG1wRGlyLnRvU3RyaW5nKCkpXG4gICAgICAgICAgICAuY2xvc2VQcm9taXNlO1xuICAgICAgICB9KVxuICAgICAgICAudGhlbigoKSA9PiB7XG4gICAgICAgICAgICAvLyBUaGUgYWJvdmUgZ3VuemlwIGNvbW1hbmQgc2hvdWxkIGhhdmUgZXh0cmFjdGVkIGEgLnRhciBmaWxlLiAgTWFrZVxuICAgICAgICAgICAgLy8gc3VyZSB0aGlzIGFzc3VtcHRpb24gaXMgdHJ1ZS5cbiAgICAgICAgICAgIGV4dHJhY3RlZFRhckZpbGUgPSBuZXcgRmlsZSh0bXBEaXIsIHBhY2thZ2VCYXNlTmFtZSArIFwiLnRhclwiKTtcbiAgICAgICAgICAgIHJldHVybiBleHRyYWN0ZWRUYXJGaWxlLmV4aXN0cygpXG4gICAgICAgICAgICAudGhlbigoZXhpc3RzKSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKCFleGlzdHMpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBFeHRyYWN0ZWQgLnRhciBmaWxlICR7ZXh0cmFjdGVkVGFyRmlsZS50b1N0cmluZygpfSBkb2VzIG5vdCBleGlzdC4gIEFib3J0aW5nLmApO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KVxuICAgICAgICAudGhlbigoKSA9PiB7XG4gICAgICAgICAgICAvLyBXZSBhcmUgYWJvdXQgdG8gdW5wYWNrIHRoZSB0YXIgZmlsZS4gIENyZWF0ZSBhbiBlbXB0eVxuICAgICAgICAgICAgLy8gZGlyZWN0b3J5IHdoZXJlIGl0cyBjb250ZW50cyB3aWxsIGJlIHBsYWNlZC5cbiAgICAgICAgICAgIHVucGFja2VkRGlyID0gbmV3IERpcmVjdG9yeSh0bXBEaXIsIHBhY2thZ2VCYXNlTmFtZSk7XG4gICAgICAgICAgICByZXR1cm4gdW5wYWNrZWREaXIuZW1wdHkoKTsgIC8vIENyZWF0ZXMgKGlmIG5lZWRlZCkgYW5kIGVtcHRpZXMgdGhpcyBkaXJlY3RvcnkuXG4gICAgICAgIH0pXG4gICAgICAgIC50aGVuKCgpID0+IHtcbiAgICAgICAgICAgIHJldHVybiBzcGF3bihcInRhclwiLCBbXCIteFwiLCBcIi1DXCIsIHVucGFja2VkRGlyLnRvU3RyaW5nKCksIFwiLWZcIiwgZXh0cmFjdGVkVGFyRmlsZS50b1N0cmluZygpXSwgdG1wRGlyLnRvU3RyaW5nKCkpXG4gICAgICAgICAgICAuY2xvc2VQcm9taXNlO1xuICAgICAgICB9KVxuICAgICAgICAudGhlbigoKSA9PiB7XG4gICAgICAgICAgICAvLyBXaGVuIHVuY29tcHJlc3NlZCwgYWxsIGNvbnRlbnQgaXMgY29udGFpbmVkIHdpdGhpbiBhIFwicGFja2FnZVwiXG4gICAgICAgICAgICAvLyBkaXJlY3RvcnkuXG4gICAgICAgICAgICB1bnBhY2tlZFBhY2thZ2VEaXIgPSBuZXcgRGlyZWN0b3J5KHVucGFja2VkRGlyLCBcInBhY2thZ2VcIik7XG4gICAgICAgICAgICByZXR1cm4gdW5wYWNrZWRQYWNrYWdlRGlyLmV4aXN0cygpO1xuICAgICAgICB9KVxuICAgICAgICAudGhlbigoc3RhdHMpID0+IHtcbiAgICAgICAgICAgIGlmICghc3RhdHMpXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiVW5jb21wcmVzc2VkIHBhY2thZ2UgZG9lcyBub3QgaGF2ZSBhICdwYWNrYWdlJyBkaXJlY3RvcnkgYXMgZXhwZWN0ZWQuXCIpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoZW1wdHlQdWJsaXNoRGlyKVxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIC8vIFRoZSBjYWxsZXIgd2FudHMgdXMgdG8gZW1wdHkgdGhlIHB1Ymxpc2ggZGlyZWN0b3J5IGJlZm9yZVxuICAgICAgICAgICAgICAgIC8vIHB1Ymxpc2hpbmcgdG8gaXQuICBEbyBpdCBub3cuXG4gICAgICAgICAgICAgICAgcmV0dXJuIHB1Ymxpc2hEaXIuZW1wdHkoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSlcbiAgICAgICAgLnRoZW4oKCkgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIHVucGFja2VkUGFja2FnZURpci5jb3B5KHB1Ymxpc2hEaXIsIGZhbHNlKTtcbiAgICAgICAgfSlcbiAgICAgICAgLnRoZW4oKCkgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIHB1Ymxpc2hEaXI7XG4gICAgICAgIH0pO1xuICAgIH1cblxuXG59XG4iXX0=
