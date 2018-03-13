"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var directory_1 = require("./directory");
var os = require("os");
/**
 * @class
 * @classdesc A singleton that is used to hold the global configuratio for this
 * application.
 */
var PublishToGitConfig = (function () {
    function PublishToGitConfig() {
    }
    Object.defineProperty(PublishToGitConfig.prototype, "tmpDir", {
        get: function () {
            return new directory_1.Directory(os.homedir(), ".publish-to-git", "tmp");
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

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9wdWJsaXNoVG9HaXRDb25maWcudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSx5Q0FBc0M7QUFDdEMsdUJBQXlCO0FBR3pCOzs7O0dBSUc7QUFDSDtJQUVJO0lBRUEsQ0FBQztJQUVELHNCQUFXLHNDQUFNO2FBQWpCO1lBRUksTUFBTSxDQUFDLElBQUkscUJBQVMsQ0FBQyxFQUFFLENBQUMsT0FBTyxFQUFFLEVBQUUsaUJBQWlCLEVBQUUsS0FBSyxDQUFDLENBQUM7UUFDakUsQ0FBQzs7O09BQUE7SUFFTSxpQ0FBSSxHQUFYO1FBRUksSUFBSSxDQUFDLE1BQU0sQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDO0lBQ25DLENBQUM7SUFDTCx5QkFBQztBQUFELENBZkEsQUFlQyxJQUFBO0FBR0QsK0NBQStDO0FBQ2xDLFFBQUEsTUFBTSxHQUFHLElBQUksa0JBQWtCLEVBQUUsQ0FBQyIsImZpbGUiOiJwdWJsaXNoVG9HaXRDb25maWcuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge0RpcmVjdG9yeX0gZnJvbSBcIi4vZGlyZWN0b3J5XCI7XG5pbXBvcnQgKiBhcyBvcyBmcm9tIFwib3NcIjtcblxuXG4vKipcbiAqIEBjbGFzc1xuICogQGNsYXNzZGVzYyBBIHNpbmdsZXRvbiB0aGF0IGlzIHVzZWQgdG8gaG9sZCB0aGUgZ2xvYmFsIGNvbmZpZ3VyYXRpbyBmb3IgdGhpc1xuICogYXBwbGljYXRpb24uXG4gKi9cbmNsYXNzIFB1Ymxpc2hUb0dpdENvbmZpZ1xue1xuICAgIHB1YmxpYyBjb25zdHJ1Y3RvcigpXG4gICAge1xuICAgIH1cblxuICAgIHB1YmxpYyBnZXQgdG1wRGlyKCk6IERpcmVjdG9yeVxuICAgIHtcbiAgICAgICAgcmV0dXJuIG5ldyBEaXJlY3Rvcnkob3MuaG9tZWRpcigpLCBcIi5wdWJsaXNoLXRvLWdpdFwiLCBcInRtcFwiKTtcbiAgICB9XG5cbiAgICBwdWJsaWMgaW5pdCgpOiB2b2lkXG4gICAge1xuICAgICAgICB0aGlzLnRtcERpci5lbnN1cmVFeGlzdHNTeW5jKCk7XG4gICAgfVxufVxuXG5cbi8vIFRoZSBvbmUgYW5kIG9ubHkgaW5zdGFuY2Ugb2YgdGhpcyBzaW5nbGV0b24uXG5leHBvcnQgY29uc3QgY29uZmlnID0gbmV3IFB1Ymxpc2hUb0dpdENvbmZpZygpO1xuIl19
