"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var directory_1 = require("./directory");
var file_1 = require("./file");
var spawn_1 = require("./spawn");
var publishToGitConfig_1 = require("./publishToGitConfig");
var url_1 = require("./url");
var NodePackage = (function () {
    //endregion
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
        this._pkgDir = pkgDir;
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
                throw new Error("Directory ${pkgDir.toString()} does not contain a package.json file.");
            }
            return new NodePackage(pkgDir);
        });
    };
    Object.defineProperty(NodePackage.prototype, "projectName", {
        // TODO: Write unit tests for the following method.
        get: function () {
            return url_1.gitUrlToProjectName(this.config.repository.url);
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
     * @return A promise for publishDir
     */
    NodePackage.prototype.publish = function (publishDir, emptyPublishDir) {
        var packageBaseName;
        var extractedTarFile;
        var unpackedDir;
        var unpackedPackageDir;
        return this.pack(publishToGitConfig_1.config.tmpDir)
            .then(function (tgzFile) {
            packageBaseName = tgzFile.baseName;
            // Running the following gunzip command will extract the .tgz file
            // to a .tar file with the same basename.  The original .tgz file is
            // deleted.
            return spawn_1.spawn("gunzip", ["--force", tgzFile.fileName], publishToGitConfig_1.config.tmpDir.toString());
        })
            .then(function () {
            // The above gunzip command should have extracted a .tar file.  Make
            // sure this assumption is true.
            extractedTarFile = new file_1.File(publishToGitConfig_1.config.tmpDir, packageBaseName + ".tar");
            return extractedTarFile.exists();
        })
            .then(function () {
            // We are about to unpack the tar file.  Create an empty
            // directory where its contents will be placed.
            unpackedDir = new directory_1.Directory(publishToGitConfig_1.config.tmpDir, packageBaseName);
            return unpackedDir.empty(); // Creates (if needed) and empties this directory.
        })
            .then(function () {
            return spawn_1.spawn("tar", ["-x", "-C", unpackedDir.toString(), "-f", extractedTarFile.toString()], publishToGitConfig_1.config.tmpDir.toString());
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

//# sourceMappingURL=data:application/json;charset=utf8;base64,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QixHQUFHLElBQUkscUJBQVMsQ0FBQyxXQUFXLEVBQUUsU0FBUyxDQUFDLENBQUM7WUFDM0QsTUFBTSxDQUFDLGtCQUFrQixDQUFDLE1BQU0sRUFBRSxDQUFDO1FBQ3ZDLENBQUMsQ0FBQzthQUNELElBQUksQ0FBQyxVQUFDLEtBQUs7WUFDUixFQUFFLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUNYLENBQUM7Z0JBQ0csTUFBTSxJQUFJLEtBQUssQ0FBQyx1RUFBdUUsQ0FBQyxDQUFDO1lBQzdGLENBQUM7WUFFRCxFQUFFLENBQUMsQ0FBQyxlQUFlLENBQUMsQ0FDcEIsQ0FBQztnQkFDRyw0REFBNEQ7Z0JBQzVELGdDQUFnQztnQkFDaEMsTUFBTSxDQUFDLFVBQVUsQ0FBQyxLQUFLLEVBQUUsQ0FBQztZQUM5QixDQUFDO1FBQ0wsQ0FBQyxDQUFDO2FBQ0QsSUFBSSxDQUFDO1lBQ0YsTUFBTSxDQUFDLGtCQUFrQixDQUFDLElBQUksQ0FBQyxVQUFVLEVBQUUsS0FBSyxDQUFDLENBQUM7UUFDdEQsQ0FBQyxDQUFDO2FBQ0QsSUFBSSxDQUFDO1lBQ0YsTUFBTSxDQUFDLFVBQVUsQ0FBQztRQUN0QixDQUFDLENBQUMsQ0FBQztJQUNQLENBQUM7SUFHTCxrQkFBQztBQUFELENBL0tBLEFBK0tDLElBQUE7QUEvS1ksa0NBQVciLCJmaWxlIjoibm9kZVBhY2thZ2UuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgKiBhcyBmcyBmcm9tIFwiZnNcIjtcbmltcG9ydCB7RGlyZWN0b3J5fSBmcm9tIFwiLi9kaXJlY3RvcnlcIjtcbmltcG9ydCB7RmlsZX0gZnJvbSBcIi4vZmlsZVwiO1xuaW1wb3J0IHtzcGF3bn0gZnJvbSBcIi4vc3Bhd25cIjtcbmltcG9ydCB7Y29uZmlnfSBmcm9tIFwiLi9wdWJsaXNoVG9HaXRDb25maWdcIjtcbmltcG9ydCB7Z2l0VXJsVG9Qcm9qZWN0TmFtZX0gZnJvbSBcIi4vdXJsXCI7XG5cblxuZXhwb3J0IGludGVyZmFjZSBJUGFja2FnZUpzb25cbntcbiAgICBuYW1lOiBzdHJpbmc7XG4gICAgdmVyc2lvbjogc3RyaW5nO1xuICAgIGRlc2NyaXB0aW9uOiBzdHJpbmc7XG4gICAgcmVwb3NpdG9yeToge3R5cGU6IHN0cmluZywgdXJsOiBzdHJpbmd9O1xufVxuXG5cbmV4cG9ydCBjbGFzcyBOb2RlUGFja2FnZVxue1xuXG4gICAgLyoqXG4gICAgICogQ3JlYXRlcyBhIE5vZGVQYWNrYWdlIHJlcHJlc2VudGluZyB0aGUgcGFja2FnZSBpbiB0aGUgc3BlY2lmaWVkIGRpcmVjdG9yeS5cbiAgICAgKiBAcGFyYW0gcGtnRGlyIC0gVGhlIGRpcmVjdG9yeSBjb250YWluaW5nIHRoZSBOb2RlLmpzIHBhY2thZ2VcbiAgICAgKiBAcmV0dXJuIEEgcHJvbWlzZSBmb3IgdGhlIHJlc3VsdGluZyBOb2RlUGFja2FnZS4gIFRoaXMgcHJvbWlzZSB3aWxsIGJlXG4gICAgICogcmVqZWN0ZWQgaWYgdGhlIHNwZWNpZmllZCBkaXJlY3RvcnkgZG9lcyBub3QgZXhpc3Qgb3IgZG9lcyBub3QgY29udGFpbiBhXG4gICAgICogcGFja2FnZS5qc29uIGZpbGUuXG4gICAgICovXG4gICAgcHVibGljIHN0YXRpYyBmcm9tRGlyZWN0b3J5KHBrZ0RpcjogRGlyZWN0b3J5KTogUHJvbWlzZTxOb2RlUGFja2FnZT5cbiAgICB7XG4gICAgICAgIC8vIE1ha2Ugc3VyZSB0aGUgZGlyZWN0b3J5IGV4aXN0cy5cbiAgICAgICAgcmV0dXJuIHBrZ0Rpci5leGlzdHMoKVxuICAgICAgICAudGhlbigoc3RhdHM6IGZzLlN0YXRzIHwgdW5kZWZpbmVkKSA9PiB7XG4gICAgICAgICAgICBpZiAoIXN0YXRzKVxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgRGlyZWN0b3J5ICR7cGtnRGlyLnRvU3RyaW5nKCl9IGRvZXMgbm90IGV4aXN0LmApO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBNYWtlIHN1cmUgdGhlIHBhY2thZ2UgaGFzIGEgcGFja2FnZS5qc29uIGZpbGUgaW4gaXQuXG4gICAgICAgICAgICBjb25zdCBwYWNrYWdlSnNvbiA9IG5ldyBGaWxlKHBrZ0RpciwgXCJwYWNrYWdlLmpzb25cIik7XG4gICAgICAgICAgICByZXR1cm4gcGFja2FnZUpzb24uZXhpc3RzKCk7XG4gICAgICAgIH0pXG4gICAgICAgIC50aGVuKChzdGF0cykgPT4ge1xuICAgICAgICAgICAgaWYgKCFzdGF0cylcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJEaXJlY3RvcnkgJHtwa2dEaXIudG9TdHJpbmcoKX0gZG9lcyBub3QgY29udGFpbiBhIHBhY2thZ2UuanNvbiBmaWxlLlwiKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIG5ldyBOb2RlUGFja2FnZShwa2dEaXIpO1xuICAgICAgICB9KTtcblxuICAgIH1cblxuXG4gICAgLy9yZWdpb24gRGF0YSBtZW1iZXJzXG4gICAgcHJpdmF0ZSBfcGtnRGlyOiBEaXJlY3Rvcnk7XG4gICAgcHJpdmF0ZSBfY29uZmlnOiBJUGFja2FnZUpzb24gfCB1bmRlZmluZWQ7XG4gICAgLy9lbmRyZWdpb25cblxuXG4gICAgLyoqXG4gICAgICogQ29uc3RydWN0cyBhIG5ldyBOb2RlUGFja2FnZS4gIFRoaXMgY29uc3RydWN0b3IgaXMgcHJpdmF0ZSBhbmQgc2hvdWxkIG5vdFxuICAgICAqIGJlIGNhbGxlZCBieSBjbGllbnRzLiAgSW5zdGVhZCwgdXNlIG9uZSBvZiB0aGUgc3RhdGljIG1ldGhvZHMgdG8gY3JlYXRlXG4gICAgICogaW5zdGFuY2VzLlxuICAgICAqXG4gICAgICogQGNsYXNzXG4gICAgICogQGNsYXNzZGVzYyBBIGNsYXNzIHRoYXQgcmVwcmVzZW50cyBhIE5vZGUuanMgcGFja2FnZS5cbiAgICAgKlxuICAgICAqIEBwYXJhbSBwa2dEaXIgLSBUaGUgZGlyZWN0b3J5IGNvbnRhaW5pbmcgdGhlIE5vZGUuanMgcGFja2FnZVxuICAgICAqL1xuICAgIHByaXZhdGUgY29uc3RydWN0b3IocGtnRGlyOiBEaXJlY3RvcnkpXG4gICAge1xuICAgICAgICB0aGlzLl9wa2dEaXIgPSBwa2dEaXI7XG4gICAgfVxuXG5cbiAgICAvLyBUT0RPOiBXcml0ZSB1bml0IHRlc3RzIGZvciB0aGUgZm9sbG93aW5nIG1ldGhvZC5cbiAgICBwdWJsaWMgZ2V0IHByb2plY3ROYW1lKCk6IHN0cmluZ1xuICAgIHtcbiAgICAgICAgcmV0dXJuIGdpdFVybFRvUHJvamVjdE5hbWUodGhpcy5jb25maWcucmVwb3NpdG9yeS51cmwpO1xuICAgIH1cblxuXG4gICAgcHVibGljIGdldCBjb25maWcoKTogSVBhY2thZ2VKc29uXG4gICAge1xuICAgICAgICAvLyBJZiB0aGUgcGFja2FnZS5qc29uIGZpbGUgaGFzIG5vdCBiZWVuIHJlYWQgeWV0LCByZWFkIGl0IG5vdy5cbiAgICAgICAgaWYgKHRoaXMuX2NvbmZpZyA9PT0gdW5kZWZpbmVkKVxuICAgICAgICB7XG4gICAgICAgICAgICB0aGlzLl9jb25maWcgPSBuZXcgRmlsZSh0aGlzLl9wa2dEaXIsIFwicGFja2FnZS5qc29uXCIpLnJlYWRKc29uU3luYzxJUGFja2FnZUpzb24+KCk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gdGhpcy5fY29uZmlnITtcbiAgICB9XG5cblxuICAgIC8qKlxuICAgICAqIFBhY2tzIHRoaXMgTm9kZSBwYWNrYWdlIGludG8gYSAudGd6IGZpbGUgdXNpbmcgXCJucG0gcGFja1wiXG4gICAgICogQG1ldGhvZFxuICAgICAqIEBwYXJhbSBvdXREaXIgLSBUaGUgb3V0cHV0IGRpcmVjdG9yeSB3aGVyZSB0byBwbGFjZSB0aGUgb3V0cHV0IGZpbGUuICBJZlxuICAgICAqIG5vdCBzcGVjaWZpZWQsIHRoZSBvdXRwdXQgd2lsbCBiZSBwbGFjZWQgaW4gdGhlIHBhY2thZ2UncyBmb2xkZXIuXG4gICAgICogQHJldHVybiBBIEZpbGUgb2JqZWN0IHJlcHJlc2VudGluZyB0aGUgb3V0cHV0IC50Z3ogZmlsZVxuICAgICAqL1xuICAgIHB1YmxpYyBwYWNrKG91dERpcj86IERpcmVjdG9yeSk6IFByb21pc2U8RmlsZT5cbiAgICB7XG4gICAgICAgIHJldHVybiBzcGF3bihcIm5wbVwiLCBbXCJwYWNrXCJdLCB0aGlzLl9wa2dEaXIudG9TdHJpbmcoKSlcbiAgICAgICAgLnRoZW4oKHN0ZG91dDogc3RyaW5nKSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gbmV3IEZpbGUodGhpcy5fcGtnRGlyLCBzdGRvdXQpO1xuICAgICAgICB9KVxuICAgICAgICAudGhlbigodGd6RmlsZTogRmlsZSkgPT4ge1xuICAgICAgICAgICAgaWYgKG91dERpcilcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGd6RmlsZS5tb3ZlKG91dERpcik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRnekZpbGU7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgfSk7XG4gICAgfVxuXG5cbiAgICAvKipcbiAgICAgKiBQdWJsaXNoZXMgdGhpcyBOb2RlLmpzIHBhY2thZ2UgdG8gdGhlIHNwZWNpZmllZCBkaXJlY3RvcnkuXG4gICAgICogQHBhcmFtIHB1Ymxpc2hEaXIgLSBUaGUgZGlyZWN0b3J5IHRoYXQgd2lsbCBjb250YWluIHRoZSBwdWJsaXNoZWQgdmVyc2lvblxuICAgICAqIG9mIHRoaXMgcGFja2FnZVxuICAgICAqIEBwYXJhbSBlbXB0eVB1Ymxpc2hEaXIgLSBBIGZsYWcgaW5kaWNhdGluZyB3aGV0aGVyIHB1Ymxpc2hEaXIgc2hvdWxkIGJlXG4gICAgICogZW1wdGllZCBiZWZvcmUgcHVibGlzaGluZyB0byBpdC4gIElmIHB1Ymxpc2hpbmcgdG8gYSByZWd1bGFyIGRpcmVjdG9yeSxcbiAgICAgKiB5b3UgcHJvYmFibHkgd2FudCB0byBwYXNzIHRydWUgc28gdGhhdCBhbnkgb2xkIGZpbGVzIGFyZSByZW1vdmVkLiAgSWZcbiAgICAgKiBwdWJsaXNoaW5nIHRvIGEgR2l0IHJlcG8gZGlyZWN0b3J5LCB5b3UgcHJvYmFibHkgd2FudCBmYWxzZSBiZWNhdXNlIHlvdVxuICAgICAqIGhhdmUgYWxyZWFkeSByZW1vdmVkIHRoZSBmaWxlcyB1bmRlciB2ZXJzaW9uIGNvbnRyb2wgYW5kIHdhbnQgdGhlIC5naXRcbiAgICAgKiBkaXJlY3RvcnkgdG8gcmVtYWluLlxuICAgICAqIEByZXR1cm4gQSBwcm9taXNlIGZvciBwdWJsaXNoRGlyXG4gICAgICovXG4gICAgcHVibGljIHB1Ymxpc2gocHVibGlzaERpcjogRGlyZWN0b3J5LCBlbXB0eVB1Ymxpc2hEaXI6IGJvb2xlYW4pOiBQcm9taXNlPERpcmVjdG9yeT5cbiAgICB7XG4gICAgICAgIGxldCBwYWNrYWdlQmFzZU5hbWU6IHN0cmluZztcbiAgICAgICAgbGV0IGV4dHJhY3RlZFRhckZpbGU6IEZpbGU7XG4gICAgICAgIGxldCB1bnBhY2tlZERpcjogRGlyZWN0b3J5O1xuICAgICAgICBsZXQgdW5wYWNrZWRQYWNrYWdlRGlyOiBEaXJlY3Rvcnk7XG5cbiAgICAgICAgcmV0dXJuIHRoaXMucGFjayhjb25maWcudG1wRGlyKVxuICAgICAgICAudGhlbigodGd6RmlsZTogRmlsZSkgPT4ge1xuICAgICAgICAgICAgcGFja2FnZUJhc2VOYW1lID0gdGd6RmlsZS5iYXNlTmFtZTtcblxuICAgICAgICAgICAgLy8gUnVubmluZyB0aGUgZm9sbG93aW5nIGd1bnppcCBjb21tYW5kIHdpbGwgZXh0cmFjdCB0aGUgLnRneiBmaWxlXG4gICAgICAgICAgICAvLyB0byBhIC50YXIgZmlsZSB3aXRoIHRoZSBzYW1lIGJhc2VuYW1lLiAgVGhlIG9yaWdpbmFsIC50Z3ogZmlsZSBpc1xuICAgICAgICAgICAgLy8gZGVsZXRlZC5cbiAgICAgICAgICAgIHJldHVybiBzcGF3bihcImd1bnppcFwiLCBbXCItLWZvcmNlXCIsIHRnekZpbGUuZmlsZU5hbWVdLCBjb25maWcudG1wRGlyLnRvU3RyaW5nKCkpO1xuICAgICAgICB9KVxuICAgICAgICAudGhlbigoKSA9PiB7XG4gICAgICAgICAgICAvLyBUaGUgYWJvdmUgZ3VuemlwIGNvbW1hbmQgc2hvdWxkIGhhdmUgZXh0cmFjdGVkIGEgLnRhciBmaWxlLiAgTWFrZVxuICAgICAgICAgICAgLy8gc3VyZSB0aGlzIGFzc3VtcHRpb24gaXMgdHJ1ZS5cbiAgICAgICAgICAgIGV4dHJhY3RlZFRhckZpbGUgPSBuZXcgRmlsZShjb25maWcudG1wRGlyLCBwYWNrYWdlQmFzZU5hbWUgKyBcIi50YXJcIik7XG4gICAgICAgICAgICByZXR1cm4gZXh0cmFjdGVkVGFyRmlsZS5leGlzdHMoKTtcbiAgICAgICAgfSlcbiAgICAgICAgLnRoZW4oKCkgPT4ge1xuICAgICAgICAgICAgLy8gV2UgYXJlIGFib3V0IHRvIHVucGFjayB0aGUgdGFyIGZpbGUuICBDcmVhdGUgYW4gZW1wdHlcbiAgICAgICAgICAgIC8vIGRpcmVjdG9yeSB3aGVyZSBpdHMgY29udGVudHMgd2lsbCBiZSBwbGFjZWQuXG4gICAgICAgICAgICB1bnBhY2tlZERpciA9IG5ldyBEaXJlY3RvcnkoY29uZmlnLnRtcERpciwgcGFja2FnZUJhc2VOYW1lKTtcbiAgICAgICAgICAgIHJldHVybiB1bnBhY2tlZERpci5lbXB0eSgpOyAgLy8gQ3JlYXRlcyAoaWYgbmVlZGVkKSBhbmQgZW1wdGllcyB0aGlzIGRpcmVjdG9yeS5cbiAgICAgICAgfSlcbiAgICAgICAgLnRoZW4oKCkgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIHNwYXduKFwidGFyXCIsIFtcIi14XCIsIFwiLUNcIiwgdW5wYWNrZWREaXIudG9TdHJpbmcoKSwgXCItZlwiLCBleHRyYWN0ZWRUYXJGaWxlLnRvU3RyaW5nKCldLCBjb25maWcudG1wRGlyLnRvU3RyaW5nKCkpO1xuICAgICAgICB9KVxuICAgICAgICAudGhlbigoKSA9PiB7XG4gICAgICAgICAgICAvLyBXaGVuIHVuY29tcHJlc3NlZCwgYWxsIGNvbnRlbnQgaXMgY29udGFpbmVkIHdpdGhpbiBhIFwicGFja2FnZVwiXG4gICAgICAgICAgICAvLyBkaXJlY3RvcnkuXG4gICAgICAgICAgICB1bnBhY2tlZFBhY2thZ2VEaXIgPSBuZXcgRGlyZWN0b3J5KHVucGFja2VkRGlyLCBcInBhY2thZ2VcIik7XG4gICAgICAgICAgICByZXR1cm4gdW5wYWNrZWRQYWNrYWdlRGlyLmV4aXN0cygpO1xuICAgICAgICB9KVxuICAgICAgICAudGhlbigoc3RhdHMpID0+IHtcbiAgICAgICAgICAgIGlmICghc3RhdHMpXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiVW5jb21wcmVzc2VkIHBhY2thZ2UgZG9lcyBub3QgaGF2ZSBhICdwYWNrYWdlJyBkaXJlY3RvcnkgYXMgZXhwZWN0ZWQuXCIpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoZW1wdHlQdWJsaXNoRGlyKVxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIC8vIFRoZSBjYWxsZXIgd2FudHMgdXMgdG8gZW1wdHkgdGhlIHB1Ymxpc2ggZGlyZWN0b3J5IGJlZm9yZVxuICAgICAgICAgICAgICAgIC8vIHB1Ymxpc2hpbmcgdG8gaXQuICBEbyBpdCBub3cuXG4gICAgICAgICAgICAgICAgcmV0dXJuIHB1Ymxpc2hEaXIuZW1wdHkoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSlcbiAgICAgICAgLnRoZW4oKCkgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIHVucGFja2VkUGFja2FnZURpci5jb3B5KHB1Ymxpc2hEaXIsIGZhbHNlKTtcbiAgICAgICAgfSlcbiAgICAgICAgLnRoZW4oKCkgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIHB1Ymxpc2hEaXI7XG4gICAgICAgIH0pO1xuICAgIH1cblxuXG59XG4iXX0=
