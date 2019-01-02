"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var directory_1 = require("./depot/directory");
var os = require("os");
/**
 * @class
 * @classdesc A singleton that is used to hold the global configuratio for this
 * application.
 */
var PublishToGitConfig = /** @class */ (function () {
    function PublishToGitConfig() {
    }
    Object.defineProperty(PublishToGitConfig.prototype, "tmpDir", {
        get: function () {
            return new directory_1.Directory(os.homedir(), ".publishtogit", "tmp");
        },
        enumerable: true,
        configurable: true
    });
    PublishToGitConfig.prototype.init = function () {
        this.tmpDir.ensureExistsSync();
    };
    return PublishToGitConfig;
}());
// The one and only instance of this singleton.
exports.config = new PublishToGitConfig();

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9wdWJsaXNoVG9HaXRDb25maWcudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSwrQ0FBNEM7QUFDNUMsdUJBQXlCO0FBR3pCOzs7O0dBSUc7QUFDSDtJQUVJO0lBRUEsQ0FBQztJQUVELHNCQUFXLHNDQUFNO2FBQWpCO1lBRUksT0FBTyxJQUFJLHFCQUFTLENBQUMsRUFBRSxDQUFDLE9BQU8sRUFBRSxFQUFFLGVBQWUsRUFBRSxLQUFLLENBQUMsQ0FBQztRQUMvRCxDQUFDOzs7T0FBQTtJQUVNLGlDQUFJLEdBQVg7UUFFSSxJQUFJLENBQUMsTUFBTSxDQUFDLGdCQUFnQixFQUFFLENBQUM7SUFDbkMsQ0FBQztJQUNMLHlCQUFDO0FBQUQsQ0FmQSxBQWVDLElBQUE7QUFHRCwrQ0FBK0M7QUFDbEMsUUFBQSxNQUFNLEdBQUcsSUFBSSxrQkFBa0IsRUFBRSxDQUFDIiwiZmlsZSI6InB1Ymxpc2hUb0dpdENvbmZpZy5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7RGlyZWN0b3J5fSBmcm9tIFwiLi9kZXBvdC9kaXJlY3RvcnlcIjtcbmltcG9ydCAqIGFzIG9zIGZyb20gXCJvc1wiO1xuXG5cbi8qKlxuICogQGNsYXNzXG4gKiBAY2xhc3NkZXNjIEEgc2luZ2xldG9uIHRoYXQgaXMgdXNlZCB0byBob2xkIHRoZSBnbG9iYWwgY29uZmlndXJhdGlvIGZvciB0aGlzXG4gKiBhcHBsaWNhdGlvbi5cbiAqL1xuY2xhc3MgUHVibGlzaFRvR2l0Q29uZmlnXG57XG4gICAgcHVibGljIGNvbnN0cnVjdG9yKClcbiAgICB7XG4gICAgfVxuXG4gICAgcHVibGljIGdldCB0bXBEaXIoKTogRGlyZWN0b3J5XG4gICAge1xuICAgICAgICByZXR1cm4gbmV3IERpcmVjdG9yeShvcy5ob21lZGlyKCksIFwiLnB1Ymxpc2h0b2dpdFwiLCBcInRtcFwiKTtcbiAgICB9XG5cbiAgICBwdWJsaWMgaW5pdCgpOiB2b2lkXG4gICAge1xuICAgICAgICB0aGlzLnRtcERpci5lbnN1cmVFeGlzdHNTeW5jKCk7XG4gICAgfVxufVxuXG5cbi8vIFRoZSBvbmUgYW5kIG9ubHkgaW5zdGFuY2Ugb2YgdGhpcyBzaW5nbGV0b24uXG5leHBvcnQgY29uc3QgY29uZmlnID0gbmV3IFB1Ymxpc2hUb0dpdENvbmZpZygpO1xuIl19
