"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var oofs_1 = require("oofs");
var asynchrony_1 = require("asynchrony");
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
            var packageJson = new oofs_1.File(pkgDir, "package.json");
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
                this._config = new oofs_1.File(this._pkgDir, "package.json").readJsonSync();
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
        return asynchrony_1.spawn("npm", ["pack"], this._pkgDir.toString())
            .then(function (stdout) {
            return new oofs_1.File(_this._pkgDir, stdout);
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
            return asynchrony_1.spawn("gunzip", ["--force", tgzFile.fileName], publishToGitConfig_1.config.tmpDir.toString());
        })
            .then(function () {
            // The above gunzip command should have extracted a .tar file.  Make
            // sure this assumption is true.
            extractedTarFile = new oofs_1.File(publishToGitConfig_1.config.tmpDir, packageBaseName + ".tar");
            return extractedTarFile.exists();
        })
            .then(function () {
            // We are about to unpack the tar file.  Create an empty
            // directory where its contents will be placed.
            unpackedDir = new oofs_1.Directory(publishToGitConfig_1.config.tmpDir, packageBaseName);
            return unpackedDir.empty(); // Creates (if needed) and empties this directory.
        })
            .then(function () {
            return asynchrony_1.spawn("tar", ["-x", "-C", unpackedDir.toString(), "-f", extractedTarFile.toString()], publishToGitConfig_1.config.tmpDir.toString());
        })
            .then(function () {
            // When uncompressed, all content is contained within a "package"
            // directory.
            unpackedPackageDir = new oofs_1.Directory(unpackedDir, "package");
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

//# sourceMappingURL=data:application/json;charset=utf8;base64,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SSxnQkFBUyxDQUFDLFdBQVcsRUFBRSxTQUFTLENBQUMsQ0FBQztZQUMzRCxNQUFNLENBQUMsa0JBQWtCLENBQUMsTUFBTSxFQUFFLENBQUM7UUFDdkMsQ0FBQyxDQUFDO2FBQ0QsSUFBSSxDQUFDLFVBQUMsS0FBSztZQUNSLEVBQUUsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQ1gsQ0FBQztnQkFDRyxNQUFNLElBQUksS0FBSyxDQUFDLHVFQUF1RSxDQUFDLENBQUM7WUFDN0YsQ0FBQztZQUVELEVBQUUsQ0FBQyxDQUFDLGVBQWUsQ0FBQyxDQUNwQixDQUFDO2dCQUNHLDREQUE0RDtnQkFDNUQsZ0NBQWdDO2dCQUNoQyxNQUFNLENBQUMsVUFBVSxDQUFDLEtBQUssRUFBRSxDQUFDO1lBQzlCLENBQUM7UUFDTCxDQUFDLENBQUM7YUFDRCxJQUFJLENBQUM7WUFDRixNQUFNLENBQUMsa0JBQWtCLENBQUMsSUFBSSxDQUFDLFVBQVUsRUFBRSxLQUFLLENBQUMsQ0FBQztRQUN0RCxDQUFDLENBQUM7YUFDRCxJQUFJLENBQUM7WUFDRixNQUFNLENBQUMsVUFBVSxDQUFDO1FBQ3RCLENBQUMsQ0FBQyxDQUFDO0lBQ1AsQ0FBQztJQUdMLGtCQUFDO0FBQUQsQ0EvS0EsQUErS0MsSUFBQTtBQS9LWSxrQ0FBVyIsImZpbGUiOiJub2RlUGFja2FnZS5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCAqIGFzIGZzIGZyb20gXCJmc1wiO1xuaW1wb3J0IHtEaXJlY3RvcnksIEZpbGV9IGZyb20gXCJvb2ZzXCI7XG5pbXBvcnQge3NwYXdufSBmcm9tIFwiYXN5bmNocm9ueVwiO1xuaW1wb3J0IHtjb25maWd9IGZyb20gXCIuL3B1Ymxpc2hUb0dpdENvbmZpZ1wiO1xuaW1wb3J0IHtnaXRVcmxUb1Byb2plY3ROYW1lfSBmcm9tIFwiLi91cmxcIjtcblxuXG5leHBvcnQgaW50ZXJmYWNlIElQYWNrYWdlSnNvblxue1xuICAgIG5hbWU6IHN0cmluZztcbiAgICB2ZXJzaW9uOiBzdHJpbmc7XG4gICAgZGVzY3JpcHRpb246IHN0cmluZztcbiAgICByZXBvc2l0b3J5OiB7dHlwZTogc3RyaW5nLCB1cmw6IHN0cmluZ307XG59XG5cblxuZXhwb3J0IGNsYXNzIE5vZGVQYWNrYWdlXG57XG5cbiAgICAvKipcbiAgICAgKiBDcmVhdGVzIGEgTm9kZVBhY2thZ2UgcmVwcmVzZW50aW5nIHRoZSBwYWNrYWdlIGluIHRoZSBzcGVjaWZpZWQgZGlyZWN0b3J5LlxuICAgICAqIEBwYXJhbSBwa2dEaXIgLSBUaGUgZGlyZWN0b3J5IGNvbnRhaW5pbmcgdGhlIE5vZGUuanMgcGFja2FnZVxuICAgICAqIEByZXR1cm4gQSBwcm9taXNlIGZvciB0aGUgcmVzdWx0aW5nIE5vZGVQYWNrYWdlLiAgVGhpcyBwcm9taXNlIHdpbGwgYmVcbiAgICAgKiByZWplY3RlZCBpZiB0aGUgc3BlY2lmaWVkIGRpcmVjdG9yeSBkb2VzIG5vdCBleGlzdCBvciBkb2VzIG5vdCBjb250YWluIGFcbiAgICAgKiBwYWNrYWdlLmpzb24gZmlsZS5cbiAgICAgKi9cbiAgICBwdWJsaWMgc3RhdGljIGZyb21EaXJlY3RvcnkocGtnRGlyOiBEaXJlY3RvcnkpOiBQcm9taXNlPE5vZGVQYWNrYWdlPlxuICAgIHtcbiAgICAgICAgLy8gTWFrZSBzdXJlIHRoZSBkaXJlY3RvcnkgZXhpc3RzLlxuICAgICAgICByZXR1cm4gcGtnRGlyLmV4aXN0cygpXG4gICAgICAgIC50aGVuKChzdGF0czogZnMuU3RhdHMgfCB1bmRlZmluZWQpID0+IHtcbiAgICAgICAgICAgIGlmICghc3RhdHMpXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBEaXJlY3RvcnkgJHtwa2dEaXIudG9TdHJpbmcoKX0gZG9lcyBub3QgZXhpc3QuYCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIE1ha2Ugc3VyZSB0aGUgcGFja2FnZSBoYXMgYSBwYWNrYWdlLmpzb24gZmlsZSBpbiBpdC5cbiAgICAgICAgICAgIGNvbnN0IHBhY2thZ2VKc29uID0gbmV3IEZpbGUocGtnRGlyLCBcInBhY2thZ2UuanNvblwiKTtcbiAgICAgICAgICAgIHJldHVybiBwYWNrYWdlSnNvbi5leGlzdHMoKTtcbiAgICAgICAgfSlcbiAgICAgICAgLnRoZW4oKHN0YXRzKSA9PiB7XG4gICAgICAgICAgICBpZiAoIXN0YXRzKVxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIkRpcmVjdG9yeSAke3BrZ0Rpci50b1N0cmluZygpfSBkb2VzIG5vdCBjb250YWluIGEgcGFja2FnZS5qc29uIGZpbGUuXCIpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gbmV3IE5vZGVQYWNrYWdlKHBrZ0Rpcik7XG4gICAgICAgIH0pO1xuXG4gICAgfVxuXG5cbiAgICAvL3JlZ2lvbiBEYXRhIG1lbWJlcnNcbiAgICBwcml2YXRlIF9wa2dEaXI6IERpcmVjdG9yeTtcbiAgICBwcml2YXRlIF9jb25maWc6IElQYWNrYWdlSnNvbiB8IHVuZGVmaW5lZDtcbiAgICAvL2VuZHJlZ2lvblxuXG5cbiAgICAvKipcbiAgICAgKiBDb25zdHJ1Y3RzIGEgbmV3IE5vZGVQYWNrYWdlLiAgVGhpcyBjb25zdHJ1Y3RvciBpcyBwcml2YXRlIGFuZCBzaG91bGQgbm90XG4gICAgICogYmUgY2FsbGVkIGJ5IGNsaWVudHMuICBJbnN0ZWFkLCB1c2Ugb25lIG9mIHRoZSBzdGF0aWMgbWV0aG9kcyB0byBjcmVhdGVcbiAgICAgKiBpbnN0YW5jZXMuXG4gICAgICpcbiAgICAgKiBAY2xhc3NcbiAgICAgKiBAY2xhc3NkZXNjIEEgY2xhc3MgdGhhdCByZXByZXNlbnRzIGEgTm9kZS5qcyBwYWNrYWdlLlxuICAgICAqXG4gICAgICogQHBhcmFtIHBrZ0RpciAtIFRoZSBkaXJlY3RvcnkgY29udGFpbmluZyB0aGUgTm9kZS5qcyBwYWNrYWdlXG4gICAgICovXG4gICAgcHJpdmF0ZSBjb25zdHJ1Y3Rvcihwa2dEaXI6IERpcmVjdG9yeSlcbiAgICB7XG4gICAgICAgIHRoaXMuX3BrZ0RpciA9IHBrZ0RpcjtcbiAgICB9XG5cblxuICAgIC8vIFRPRE86IFdyaXRlIHVuaXQgdGVzdHMgZm9yIHRoZSBmb2xsb3dpbmcgbWV0aG9kLlxuICAgIHB1YmxpYyBnZXQgcHJvamVjdE5hbWUoKTogc3RyaW5nXG4gICAge1xuICAgICAgICByZXR1cm4gZ2l0VXJsVG9Qcm9qZWN0TmFtZSh0aGlzLmNvbmZpZy5yZXBvc2l0b3J5LnVybCk7XG4gICAgfVxuXG5cbiAgICBwdWJsaWMgZ2V0IGNvbmZpZygpOiBJUGFja2FnZUpzb25cbiAgICB7XG4gICAgICAgIC8vIElmIHRoZSBwYWNrYWdlLmpzb24gZmlsZSBoYXMgbm90IGJlZW4gcmVhZCB5ZXQsIHJlYWQgaXQgbm93LlxuICAgICAgICBpZiAodGhpcy5fY29uZmlnID09PSB1bmRlZmluZWQpXG4gICAgICAgIHtcbiAgICAgICAgICAgIHRoaXMuX2NvbmZpZyA9IG5ldyBGaWxlKHRoaXMuX3BrZ0RpciwgXCJwYWNrYWdlLmpzb25cIikucmVhZEpzb25TeW5jPElQYWNrYWdlSnNvbj4oKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB0aGlzLl9jb25maWchO1xuICAgIH1cblxuXG4gICAgLyoqXG4gICAgICogUGFja3MgdGhpcyBOb2RlIHBhY2thZ2UgaW50byBhIC50Z3ogZmlsZSB1c2luZyBcIm5wbSBwYWNrXCJcbiAgICAgKiBAbWV0aG9kXG4gICAgICogQHBhcmFtIG91dERpciAtIFRoZSBvdXRwdXQgZGlyZWN0b3J5IHdoZXJlIHRvIHBsYWNlIHRoZSBvdXRwdXQgZmlsZS4gIElmXG4gICAgICogbm90IHNwZWNpZmllZCwgdGhlIG91dHB1dCB3aWxsIGJlIHBsYWNlZCBpbiB0aGUgcGFja2FnZSdzIGZvbGRlci5cbiAgICAgKiBAcmV0dXJuIEEgRmlsZSBvYmplY3QgcmVwcmVzZW50aW5nIHRoZSBvdXRwdXQgLnRneiBmaWxlXG4gICAgICovXG4gICAgcHVibGljIHBhY2sob3V0RGlyPzogRGlyZWN0b3J5KTogUHJvbWlzZTxGaWxlPlxuICAgIHtcbiAgICAgICAgcmV0dXJuIHNwYXduKFwibnBtXCIsIFtcInBhY2tcIl0sIHRoaXMuX3BrZ0Rpci50b1N0cmluZygpKVxuICAgICAgICAudGhlbigoc3Rkb3V0OiBzdHJpbmcpID0+IHtcbiAgICAgICAgICAgIHJldHVybiBuZXcgRmlsZSh0aGlzLl9wa2dEaXIsIHN0ZG91dCk7XG4gICAgICAgIH0pXG4gICAgICAgIC50aGVuKCh0Z3pGaWxlOiBGaWxlKSA9PiB7XG4gICAgICAgICAgICBpZiAob3V0RGlyKVxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIHJldHVybiB0Z3pGaWxlLm1vdmUob3V0RGlyKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGd6RmlsZTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICB9KTtcbiAgICB9XG5cblxuICAgIC8qKlxuICAgICAqIFB1Ymxpc2hlcyB0aGlzIE5vZGUuanMgcGFja2FnZSB0byB0aGUgc3BlY2lmaWVkIGRpcmVjdG9yeS5cbiAgICAgKiBAcGFyYW0gcHVibGlzaERpciAtIFRoZSBkaXJlY3RvcnkgdGhhdCB3aWxsIGNvbnRhaW4gdGhlIHB1Ymxpc2hlZCB2ZXJzaW9uXG4gICAgICogb2YgdGhpcyBwYWNrYWdlXG4gICAgICogQHBhcmFtIGVtcHR5UHVibGlzaERpciAtIEEgZmxhZyBpbmRpY2F0aW5nIHdoZXRoZXIgcHVibGlzaERpciBzaG91bGQgYmVcbiAgICAgKiBlbXB0aWVkIGJlZm9yZSBwdWJsaXNoaW5nIHRvIGl0LiAgSWYgcHVibGlzaGluZyB0byBhIHJlZ3VsYXIgZGlyZWN0b3J5LFxuICAgICAqIHlvdSBwcm9iYWJseSB3YW50IHRvIHBhc3MgdHJ1ZSBzbyB0aGF0IGFueSBvbGQgZmlsZXMgYXJlIHJlbW92ZWQuICBJZlxuICAgICAqIHB1Ymxpc2hpbmcgdG8gYSBHaXQgcmVwbyBkaXJlY3RvcnksIHlvdSBwcm9iYWJseSB3YW50IGZhbHNlIGJlY2F1c2UgeW91XG4gICAgICogaGF2ZSBhbHJlYWR5IHJlbW92ZWQgdGhlIGZpbGVzIHVuZGVyIHZlcnNpb24gY29udHJvbCBhbmQgd2FudCB0aGUgLmdpdFxuICAgICAqIGRpcmVjdG9yeSB0byByZW1haW4uXG4gICAgICogQHJldHVybiBBIHByb21pc2UgZm9yIHB1Ymxpc2hEaXJcbiAgICAgKi9cbiAgICBwdWJsaWMgcHVibGlzaChwdWJsaXNoRGlyOiBEaXJlY3RvcnksIGVtcHR5UHVibGlzaERpcjogYm9vbGVhbik6IFByb21pc2U8RGlyZWN0b3J5PlxuICAgIHtcbiAgICAgICAgbGV0IHBhY2thZ2VCYXNlTmFtZTogc3RyaW5nO1xuICAgICAgICBsZXQgZXh0cmFjdGVkVGFyRmlsZTogRmlsZTtcbiAgICAgICAgbGV0IHVucGFja2VkRGlyOiBEaXJlY3Rvcnk7XG4gICAgICAgIGxldCB1bnBhY2tlZFBhY2thZ2VEaXI6IERpcmVjdG9yeTtcblxuICAgICAgICByZXR1cm4gdGhpcy5wYWNrKGNvbmZpZy50bXBEaXIpXG4gICAgICAgIC50aGVuKCh0Z3pGaWxlOiBGaWxlKSA9PiB7XG4gICAgICAgICAgICBwYWNrYWdlQmFzZU5hbWUgPSB0Z3pGaWxlLmJhc2VOYW1lO1xuXG4gICAgICAgICAgICAvLyBSdW5uaW5nIHRoZSBmb2xsb3dpbmcgZ3VuemlwIGNvbW1hbmQgd2lsbCBleHRyYWN0IHRoZSAudGd6IGZpbGVcbiAgICAgICAgICAgIC8vIHRvIGEgLnRhciBmaWxlIHdpdGggdGhlIHNhbWUgYmFzZW5hbWUuICBUaGUgb3JpZ2luYWwgLnRneiBmaWxlIGlzXG4gICAgICAgICAgICAvLyBkZWxldGVkLlxuICAgICAgICAgICAgcmV0dXJuIHNwYXduKFwiZ3VuemlwXCIsIFtcIi0tZm9yY2VcIiwgdGd6RmlsZS5maWxlTmFtZV0sIGNvbmZpZy50bXBEaXIudG9TdHJpbmcoKSk7XG4gICAgICAgIH0pXG4gICAgICAgIC50aGVuKCgpID0+IHtcbiAgICAgICAgICAgIC8vIFRoZSBhYm92ZSBndW56aXAgY29tbWFuZCBzaG91bGQgaGF2ZSBleHRyYWN0ZWQgYSAudGFyIGZpbGUuICBNYWtlXG4gICAgICAgICAgICAvLyBzdXJlIHRoaXMgYXNzdW1wdGlvbiBpcyB0cnVlLlxuICAgICAgICAgICAgZXh0cmFjdGVkVGFyRmlsZSA9IG5ldyBGaWxlKGNvbmZpZy50bXBEaXIsIHBhY2thZ2VCYXNlTmFtZSArIFwiLnRhclwiKTtcbiAgICAgICAgICAgIHJldHVybiBleHRyYWN0ZWRUYXJGaWxlLmV4aXN0cygpO1xuICAgICAgICB9KVxuICAgICAgICAudGhlbigoKSA9PiB7XG4gICAgICAgICAgICAvLyBXZSBhcmUgYWJvdXQgdG8gdW5wYWNrIHRoZSB0YXIgZmlsZS4gIENyZWF0ZSBhbiBlbXB0eVxuICAgICAgICAgICAgLy8gZGlyZWN0b3J5IHdoZXJlIGl0cyBjb250ZW50cyB3aWxsIGJlIHBsYWNlZC5cbiAgICAgICAgICAgIHVucGFja2VkRGlyID0gbmV3IERpcmVjdG9yeShjb25maWcudG1wRGlyLCBwYWNrYWdlQmFzZU5hbWUpO1xuICAgICAgICAgICAgcmV0dXJuIHVucGFja2VkRGlyLmVtcHR5KCk7ICAvLyBDcmVhdGVzIChpZiBuZWVkZWQpIGFuZCBlbXB0aWVzIHRoaXMgZGlyZWN0b3J5LlxuICAgICAgICB9KVxuICAgICAgICAudGhlbigoKSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gc3Bhd24oXCJ0YXJcIiwgW1wiLXhcIiwgXCItQ1wiLCB1bnBhY2tlZERpci50b1N0cmluZygpLCBcIi1mXCIsIGV4dHJhY3RlZFRhckZpbGUudG9TdHJpbmcoKV0sIGNvbmZpZy50bXBEaXIudG9TdHJpbmcoKSk7XG4gICAgICAgIH0pXG4gICAgICAgIC50aGVuKCgpID0+IHtcbiAgICAgICAgICAgIC8vIFdoZW4gdW5jb21wcmVzc2VkLCBhbGwgY29udGVudCBpcyBjb250YWluZWQgd2l0aGluIGEgXCJwYWNrYWdlXCJcbiAgICAgICAgICAgIC8vIGRpcmVjdG9yeS5cbiAgICAgICAgICAgIHVucGFja2VkUGFja2FnZURpciA9IG5ldyBEaXJlY3RvcnkodW5wYWNrZWREaXIsIFwicGFja2FnZVwiKTtcbiAgICAgICAgICAgIHJldHVybiB1bnBhY2tlZFBhY2thZ2VEaXIuZXhpc3RzKCk7XG4gICAgICAgIH0pXG4gICAgICAgIC50aGVuKChzdGF0cykgPT4ge1xuICAgICAgICAgICAgaWYgKCFzdGF0cylcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJVbmNvbXByZXNzZWQgcGFja2FnZSBkb2VzIG5vdCBoYXZlIGEgJ3BhY2thZ2UnIGRpcmVjdG9yeSBhcyBleHBlY3RlZC5cIik7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChlbXB0eVB1Ymxpc2hEaXIpXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgLy8gVGhlIGNhbGxlciB3YW50cyB1cyB0byBlbXB0eSB0aGUgcHVibGlzaCBkaXJlY3RvcnkgYmVmb3JlXG4gICAgICAgICAgICAgICAgLy8gcHVibGlzaGluZyB0byBpdC4gIERvIGl0IG5vdy5cbiAgICAgICAgICAgICAgICByZXR1cm4gcHVibGlzaERpci5lbXB0eSgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KVxuICAgICAgICAudGhlbigoKSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gdW5wYWNrZWRQYWNrYWdlRGlyLmNvcHkocHVibGlzaERpciwgZmFsc2UpO1xuICAgICAgICB9KVxuICAgICAgICAudGhlbigoKSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gcHVibGlzaERpcjtcbiAgICAgICAgfSk7XG4gICAgfVxuXG5cbn1cbiJdfQ==
