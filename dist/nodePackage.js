"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var directory_1 = require("./directory");
var file_1 = require("./file");
var spawn_1 = require("./spawn");
var publishToGitConfig_1 = require("./publishToGitConfig");
var NodePackage = (function () {
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
    //endregion
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

//# sourceMappingURL=data:application/json;charset=utf8;base64,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QUUsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQ1gsQ0FBQztnQkFDRyxNQUFNLElBQUksS0FBSyxDQUFDLHVFQUF1RSxDQUFDLENBQUM7WUFDN0YsQ0FBQztZQUVELEVBQUUsQ0FBQyxDQUFDLGVBQWUsQ0FBQyxDQUNwQixDQUFDO2dCQUNHLDREQUE0RDtnQkFDNUQsZ0NBQWdDO2dCQUNoQyxNQUFNLENBQUMsVUFBVSxDQUFDLEtBQUssRUFBRSxDQUFDO1lBQzlCLENBQUM7UUFDTCxDQUFDLENBQUM7YUFDRCxJQUFJLENBQUM7WUFDRixNQUFNLENBQUMsa0JBQWtCLENBQUMsSUFBSSxDQUFDLFVBQVUsRUFBRSxLQUFLLENBQUMsQ0FBQztRQUN0RCxDQUFDLENBQUM7YUFDRCxJQUFJLENBQUM7WUFDRixNQUFNLENBQUMsVUFBVSxDQUFDO1FBQ3RCLENBQUMsQ0FBQyxDQUFDO0lBQ1AsQ0FBQztJQUdMLGtCQUFDO0FBQUQsQ0F2S0EsQUF1S0MsSUFBQTtBQXZLWSxrQ0FBVyIsImZpbGUiOiJub2RlUGFja2FnZS5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCAqIGFzIGZzIGZyb20gXCJmc1wiO1xuaW1wb3J0IHtEaXJlY3Rvcnl9IGZyb20gXCIuL2RpcmVjdG9yeVwiO1xuaW1wb3J0IHtGaWxlfSBmcm9tIFwiLi9maWxlXCI7XG5pbXBvcnQge3NwYXdufSBmcm9tIFwiLi9zcGF3blwiO1xuaW1wb3J0IHtjb25maWd9IGZyb20gXCIuL3B1Ymxpc2hUb0dpdENvbmZpZ1wiO1xuXG5cbmV4cG9ydCBpbnRlcmZhY2UgSVBhY2thZ2VKc29uXG57XG4gICAgbmFtZTogc3RyaW5nO1xuICAgIHZlcnNpb246IHN0cmluZztcbiAgICBkZXNjcmlwdGlvbjogc3RyaW5nO1xuICAgIHJlcG9zaXRvcnk6IHt0eXBlOiBzdHJpbmcsIHVybDogc3RyaW5nfTtcbn1cblxuXG5leHBvcnQgY2xhc3MgTm9kZVBhY2thZ2VcbntcbiAgICAvL3JlZ2lvbiBEYXRhIG1lbWJlcnNcbiAgICBwcml2YXRlIF9wa2dEaXI6IERpcmVjdG9yeTtcbiAgICBwcml2YXRlIF9jb25maWc6IElQYWNrYWdlSnNvbiB8IHVuZGVmaW5lZDtcbiAgICAvL2VuZHJlZ2lvblxuXG5cbiAgICAvKipcbiAgICAgKiBDcmVhdGVzIGEgTm9kZVBhY2thZ2UgcmVwcmVzZW50aW5nIHRoZSBwYWNrYWdlIGluIHRoZSBzcGVjaWZpZWQgZGlyZWN0b3J5LlxuICAgICAqIEBwYXJhbSBwa2dEaXIgLSBUaGUgZGlyZWN0b3J5IGNvbnRhaW5pbmcgdGhlIE5vZGUuanMgcGFja2FnZVxuICAgICAqIEByZXR1cm4gQSBwcm9taXNlIGZvciB0aGUgcmVzdWx0aW5nIE5vZGVQYWNrYWdlLiAgVGhpcyBwcm9taXNlIHdpbGwgYmVcbiAgICAgKiByZWplY3RlZCBpZiB0aGUgc3BlY2lmaWVkIGRpcmVjdG9yeSBkb2VzIG5vdCBleGlzdCBvciBkb2VzIG5vdCBjb250YWluIGFcbiAgICAgKiBwYWNrYWdlLmpzb24gZmlsZS5cbiAgICAgKi9cbiAgICBwdWJsaWMgc3RhdGljIGZyb21EaXJlY3RvcnkocGtnRGlyOiBEaXJlY3RvcnkpOiBQcm9taXNlPE5vZGVQYWNrYWdlPlxuICAgIHtcbiAgICAgICAgLy8gTWFrZSBzdXJlIHRoZSBkaXJlY3RvcnkgZXhpc3RzLlxuICAgICAgICByZXR1cm4gcGtnRGlyLmV4aXN0cygpXG4gICAgICAgIC50aGVuKChzdGF0czogZnMuU3RhdHMgfCB1bmRlZmluZWQpID0+IHtcbiAgICAgICAgICAgIGlmICghc3RhdHMpXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBEaXJlY3RvcnkgJHtwa2dEaXIudG9TdHJpbmcoKX0gZG9lcyBub3QgZXhpc3QuYCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIE1ha2Ugc3VyZSB0aGUgcGFja2FnZSBoYXMgYSBwYWNrYWdlLmpzb24gZmlsZSBpbiBpdC5cbiAgICAgICAgICAgIGNvbnN0IHBhY2thZ2VKc29uID0gbmV3IEZpbGUocGtnRGlyLCBcInBhY2thZ2UuanNvblwiKTtcbiAgICAgICAgICAgIHJldHVybiBwYWNrYWdlSnNvbi5leGlzdHMoKTtcbiAgICAgICAgfSlcbiAgICAgICAgLnRoZW4oKHN0YXRzKSA9PiB7XG4gICAgICAgICAgICBpZiAoIXN0YXRzKVxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIkRpcmVjdG9yeSAke3BrZ0Rpci50b1N0cmluZygpfSBkb2VzIG5vdCBjb250YWluIGEgcGFja2FnZS5qc29uIGZpbGUuXCIpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gbmV3IE5vZGVQYWNrYWdlKHBrZ0Rpcik7XG4gICAgICAgIH0pO1xuXG4gICAgfVxuXG5cbiAgICAvKipcbiAgICAgKiBDb25zdHJ1Y3RzIGEgbmV3IE5vZGVQYWNrYWdlLiAgVGhpcyBjb25zdHJ1Y3RvciBpcyBwcml2YXRlIGFuZCBzaG91bGQgbm90XG4gICAgICogYmUgY2FsbGVkIGJ5IGNsaWVudHMuICBJbnN0ZWFkLCB1c2Ugb25lIG9mIHRoZSBzdGF0aWMgbWV0aG9kcyB0byBjcmVhdGVcbiAgICAgKiBpbnN0YW5jZXMuXG4gICAgICpcbiAgICAgKiBAY2xhc3NcbiAgICAgKiBAY2xhc3NkZXNjIEEgY2xhc3MgdGhhdCByZXByZXNlbnRzIGEgTm9kZS5qcyBwYWNrYWdlLlxuICAgICAqXG4gICAgICogQHBhcmFtIHBrZ0RpciAtIFRoZSBkaXJlY3RvcnkgY29udGFpbmluZyB0aGUgTm9kZS5qcyBwYWNrYWdlXG4gICAgICovXG4gICAgcHJpdmF0ZSBjb25zdHJ1Y3Rvcihwa2dEaXI6IERpcmVjdG9yeSlcbiAgICB7XG4gICAgICAgIHRoaXMuX3BrZ0RpciA9IHBrZ0RpcjtcbiAgICB9XG5cblxuICAgIHB1YmxpYyBnZXQgY29uZmlnKCk6IElQYWNrYWdlSnNvblxuICAgIHtcbiAgICAgICAgLy8gSWYgdGhlIHBhY2thZ2UuanNvbiBmaWxlIGhhcyBub3QgYmVlbiByZWFkIHlldCwgcmVhZCBpdCBub3cuXG4gICAgICAgIGlmICh0aGlzLl9jb25maWcgPT09IHVuZGVmaW5lZClcbiAgICAgICAge1xuICAgICAgICAgICAgdGhpcy5fY29uZmlnID0gbmV3IEZpbGUodGhpcy5fcGtnRGlyLCBcInBhY2thZ2UuanNvblwiKS5yZWFkSnNvblN5bmM8SVBhY2thZ2VKc29uPigpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHRoaXMuX2NvbmZpZyE7XG4gICAgfVxuXG5cbiAgICAvKipcbiAgICAgKiBQYWNrcyB0aGlzIE5vZGUgcGFja2FnZSBpbnRvIGEgLnRneiBmaWxlIHVzaW5nIFwibnBtIHBhY2tcIlxuICAgICAqIEBtZXRob2RcbiAgICAgKiBAcGFyYW0gb3V0RGlyIC0gVGhlIG91dHB1dCBkaXJlY3Rvcnkgd2hlcmUgdG8gcGxhY2UgdGhlIG91dHB1dCBmaWxlLiAgSWZcbiAgICAgKiBub3Qgc3BlY2lmaWVkLCB0aGUgb3V0cHV0IHdpbGwgYmUgcGxhY2VkIGluIHRoZSBwYWNrYWdlJ3MgZm9sZGVyLlxuICAgICAqIEByZXR1cm4gQSBGaWxlIG9iamVjdCByZXByZXNlbnRpbmcgdGhlIG91dHB1dCAudGd6IGZpbGVcbiAgICAgKi9cbiAgICBwdWJsaWMgcGFjayhvdXREaXI/OiBEaXJlY3RvcnkpOiBQcm9taXNlPEZpbGU+XG4gICAge1xuICAgICAgICByZXR1cm4gc3Bhd24oXCJucG1cIiwgW1wicGFja1wiXSwgdGhpcy5fcGtnRGlyLnRvU3RyaW5nKCkpXG4gICAgICAgIC50aGVuKChzdGRvdXQ6IHN0cmluZykgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIG5ldyBGaWxlKHRoaXMuX3BrZ0Rpciwgc3Rkb3V0KTtcbiAgICAgICAgfSlcbiAgICAgICAgLnRoZW4oKHRnekZpbGU6IEZpbGUpID0+IHtcbiAgICAgICAgICAgIGlmIChvdXREaXIpXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRnekZpbGUubW92ZShvdXREaXIpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIHJldHVybiB0Z3pGaWxlO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgIH0pO1xuICAgIH1cblxuXG4gICAgLyoqXG4gICAgICogUHVibGlzaGVzIHRoaXMgTm9kZS5qcyBwYWNrYWdlIHRvIHRoZSBzcGVjaWZpZWQgZGlyZWN0b3J5LlxuICAgICAqIEBwYXJhbSBwdWJsaXNoRGlyIC0gVGhlIGRpcmVjdG9yeSB0aGF0IHdpbGwgY29udGFpbiB0aGUgcHVibGlzaGVkIHZlcnNpb25cbiAgICAgKiBvZiB0aGlzIHBhY2thZ2VcbiAgICAgKiBAcGFyYW0gZW1wdHlQdWJsaXNoRGlyIC0gQSBmbGFnIGluZGljYXRpbmcgd2hldGhlciBwdWJsaXNoRGlyIHNob3VsZCBiZVxuICAgICAqIGVtcHRpZWQgYmVmb3JlIHB1Ymxpc2hpbmcgdG8gaXQuICBJZiBwdWJsaXNoaW5nIHRvIGEgcmVndWxhciBkaXJlY3RvcnksXG4gICAgICogeW91IHByb2JhYmx5IHdhbnQgdG8gcGFzcyB0cnVlIHNvIHRoYXQgYW55IG9sZCBmaWxlcyBhcmUgcmVtb3ZlZC4gIElmXG4gICAgICogcHVibGlzaGluZyB0byBhIEdpdCByZXBvIGRpcmVjdG9yeSwgeW91IHByb2JhYmx5IHdhbnQgZmFsc2UgYmVjYXVzZSB5b3VcbiAgICAgKiBoYXZlIGFscmVhZHkgcmVtb3ZlZCB0aGUgZmlsZXMgdW5kZXIgdmVyc2lvbiBjb250cm9sIGFuZCB3YW50IHRoZSAuZ2l0XG4gICAgICogZGlyZWN0b3J5IHRvIHJlbWFpbi5cbiAgICAgKiBAcmV0dXJuIEEgcHJvbWlzZSBmb3IgcHVibGlzaERpclxuICAgICAqL1xuICAgIHB1YmxpYyBwdWJsaXNoKHB1Ymxpc2hEaXI6IERpcmVjdG9yeSwgZW1wdHlQdWJsaXNoRGlyOiBib29sZWFuKTogUHJvbWlzZTxEaXJlY3Rvcnk+XG4gICAge1xuICAgICAgICBsZXQgcGFja2FnZUJhc2VOYW1lOiBzdHJpbmc7XG4gICAgICAgIGxldCBleHRyYWN0ZWRUYXJGaWxlOiBGaWxlO1xuICAgICAgICBsZXQgdW5wYWNrZWREaXI6IERpcmVjdG9yeTtcbiAgICAgICAgbGV0IHVucGFja2VkUGFja2FnZURpcjogRGlyZWN0b3J5O1xuXG4gICAgICAgIHJldHVybiB0aGlzLnBhY2soY29uZmlnLnRtcERpcilcbiAgICAgICAgLnRoZW4oKHRnekZpbGU6IEZpbGUpID0+IHtcbiAgICAgICAgICAgIHBhY2thZ2VCYXNlTmFtZSA9IHRnekZpbGUuYmFzZU5hbWU7XG5cbiAgICAgICAgICAgIC8vIFJ1bm5pbmcgdGhlIGZvbGxvd2luZyBndW56aXAgY29tbWFuZCB3aWxsIGV4dHJhY3QgdGhlIC50Z3ogZmlsZVxuICAgICAgICAgICAgLy8gdG8gYSAudGFyIGZpbGUgd2l0aCB0aGUgc2FtZSBiYXNlbmFtZS4gIFRoZSBvcmlnaW5hbCAudGd6IGZpbGUgaXNcbiAgICAgICAgICAgIC8vIGRlbGV0ZWQuXG4gICAgICAgICAgICByZXR1cm4gc3Bhd24oXCJndW56aXBcIiwgW1wiLS1mb3JjZVwiLCB0Z3pGaWxlLmZpbGVOYW1lXSwgY29uZmlnLnRtcERpci50b1N0cmluZygpKTtcbiAgICAgICAgfSlcbiAgICAgICAgLnRoZW4oKCkgPT4ge1xuICAgICAgICAgICAgLy8gVGhlIGFib3ZlIGd1bnppcCBjb21tYW5kIHNob3VsZCBoYXZlIGV4dHJhY3RlZCBhIC50YXIgZmlsZS4gIE1ha2VcbiAgICAgICAgICAgIC8vIHN1cmUgdGhpcyBhc3N1bXB0aW9uIGlzIHRydWUuXG4gICAgICAgICAgICBleHRyYWN0ZWRUYXJGaWxlID0gbmV3IEZpbGUoY29uZmlnLnRtcERpciwgcGFja2FnZUJhc2VOYW1lICsgXCIudGFyXCIpO1xuICAgICAgICAgICAgcmV0dXJuIGV4dHJhY3RlZFRhckZpbGUuZXhpc3RzKCk7XG4gICAgICAgIH0pXG4gICAgICAgIC50aGVuKCgpID0+IHtcbiAgICAgICAgICAgIC8vIFdlIGFyZSBhYm91dCB0byB1bnBhY2sgdGhlIHRhciBmaWxlLiAgQ3JlYXRlIGFuIGVtcHR5XG4gICAgICAgICAgICAvLyBkaXJlY3Rvcnkgd2hlcmUgaXRzIGNvbnRlbnRzIHdpbGwgYmUgcGxhY2VkLlxuICAgICAgICAgICAgdW5wYWNrZWREaXIgPSBuZXcgRGlyZWN0b3J5KGNvbmZpZy50bXBEaXIsIHBhY2thZ2VCYXNlTmFtZSk7XG4gICAgICAgICAgICByZXR1cm4gdW5wYWNrZWREaXIuZW1wdHkoKTsgIC8vIENyZWF0ZXMgKGlmIG5lZWRlZCkgYW5kIGVtcHRpZXMgdGhpcyBkaXJlY3RvcnkuXG4gICAgICAgIH0pXG4gICAgICAgIC50aGVuKCgpID0+IHtcbiAgICAgICAgICAgIHJldHVybiBzcGF3bihcInRhclwiLCBbXCIteFwiLCBcIi1DXCIsIHVucGFja2VkRGlyLnRvU3RyaW5nKCksIFwiLWZcIiwgZXh0cmFjdGVkVGFyRmlsZS50b1N0cmluZygpXSwgY29uZmlnLnRtcERpci50b1N0cmluZygpKTtcbiAgICAgICAgfSlcbiAgICAgICAgLnRoZW4oKCkgPT4ge1xuICAgICAgICAgICAgLy8gV2hlbiB1bmNvbXByZXNzZWQsIGFsbCBjb250ZW50IGlzIGNvbnRhaW5lZCB3aXRoaW4gYSBcInBhY2thZ2VcIlxuICAgICAgICAgICAgLy8gZGlyZWN0b3J5LlxuICAgICAgICAgICAgdW5wYWNrZWRQYWNrYWdlRGlyID0gbmV3IERpcmVjdG9yeSh1bnBhY2tlZERpciwgXCJwYWNrYWdlXCIpO1xuICAgICAgICAgICAgcmV0dXJuIHVucGFja2VkUGFja2FnZURpci5leGlzdHMoKTtcbiAgICAgICAgfSlcbiAgICAgICAgLnRoZW4oKHN0YXRzKSA9PiB7XG4gICAgICAgICAgICBpZiAoIXN0YXRzKVxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIlVuY29tcHJlc3NlZCBwYWNrYWdlIGRvZXMgbm90IGhhdmUgYSAncGFja2FnZScgZGlyZWN0b3J5IGFzIGV4cGVjdGVkLlwiKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKGVtcHR5UHVibGlzaERpcilcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAvLyBUaGUgY2FsbGVyIHdhbnRzIHVzIHRvIGVtcHR5IHRoZSBwdWJsaXNoIGRpcmVjdG9yeSBiZWZvcmVcbiAgICAgICAgICAgICAgICAvLyBwdWJsaXNoaW5nIHRvIGl0LiAgRG8gaXQgbm93LlxuICAgICAgICAgICAgICAgIHJldHVybiBwdWJsaXNoRGlyLmVtcHR5KCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pXG4gICAgICAgIC50aGVuKCgpID0+IHtcbiAgICAgICAgICAgIHJldHVybiB1bnBhY2tlZFBhY2thZ2VEaXIuY29weShwdWJsaXNoRGlyLCBmYWxzZSk7XG4gICAgICAgIH0pXG4gICAgICAgIC50aGVuKCgpID0+IHtcbiAgICAgICAgICAgIHJldHVybiBwdWJsaXNoRGlyO1xuICAgICAgICB9KTtcbiAgICB9XG5cblxufVxuIl19
