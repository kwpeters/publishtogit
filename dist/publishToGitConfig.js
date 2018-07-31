"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var oofs_1 = require("oofs");
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
            return new oofs_1.Directory(os.homedir(), ".publishtogit", "tmp");
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

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9wdWJsaXNoVG9HaXRDb25maWcudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSw2QkFBK0I7QUFDL0IsdUJBQXlCO0FBR3pCOzs7O0dBSUc7QUFDSDtJQUVJO0lBRUEsQ0FBQztJQUVELHNCQUFXLHNDQUFNO2FBQWpCO1lBRUksTUFBTSxDQUFDLElBQUksZ0JBQVMsQ0FBQyxFQUFFLENBQUMsT0FBTyxFQUFFLEVBQUUsZUFBZSxFQUFFLEtBQUssQ0FBQyxDQUFDO1FBQy9ELENBQUM7OztPQUFBO0lBRU0saUNBQUksR0FBWDtRQUVJLElBQUksQ0FBQyxNQUFNLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQztJQUNuQyxDQUFDO0lBQ0wseUJBQUM7QUFBRCxDQWZBLEFBZUMsSUFBQTtBQUdELCtDQUErQztBQUNsQyxRQUFBLE1BQU0sR0FBRyxJQUFJLGtCQUFrQixFQUFFLENBQUMiLCJmaWxlIjoicHVibGlzaFRvR2l0Q29uZmlnLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtEaXJlY3Rvcnl9IGZyb20gXCJvb2ZzXCI7XG5pbXBvcnQgKiBhcyBvcyBmcm9tIFwib3NcIjtcblxuXG4vKipcbiAqIEBjbGFzc1xuICogQGNsYXNzZGVzYyBBIHNpbmdsZXRvbiB0aGF0IGlzIHVzZWQgdG8gaG9sZCB0aGUgZ2xvYmFsIGNvbmZpZ3VyYXRpbyBmb3IgdGhpc1xuICogYXBwbGljYXRpb24uXG4gKi9cbmNsYXNzIFB1Ymxpc2hUb0dpdENvbmZpZ1xue1xuICAgIHB1YmxpYyBjb25zdHJ1Y3RvcigpXG4gICAge1xuICAgIH1cblxuICAgIHB1YmxpYyBnZXQgdG1wRGlyKCk6IERpcmVjdG9yeVxuICAgIHtcbiAgICAgICAgcmV0dXJuIG5ldyBEaXJlY3Rvcnkob3MuaG9tZWRpcigpLCBcIi5wdWJsaXNodG9naXRcIiwgXCJ0bXBcIik7XG4gICAgfVxuXG4gICAgcHVibGljIGluaXQoKTogdm9pZFxuICAgIHtcbiAgICAgICAgdGhpcy50bXBEaXIuZW5zdXJlRXhpc3RzU3luYygpO1xuICAgIH1cbn1cblxuXG4vLyBUaGUgb25lIGFuZCBvbmx5IGluc3RhbmNlIG9mIHRoaXMgc2luZ2xldG9uLlxuZXhwb3J0IGNvbnN0IGNvbmZpZyA9IG5ldyBQdWJsaXNoVG9HaXRDb25maWcoKTtcbiJdfQ==
