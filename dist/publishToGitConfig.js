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

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9wdWJsaXNoVG9HaXRDb25maWcudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSx5Q0FBc0M7QUFDdEMsdUJBQXlCO0FBR3pCOzs7O0dBSUc7QUFDSDtJQUVJO0lBRUEsQ0FBQztJQUVELHNCQUFXLHNDQUFNO2FBQWpCO1lBRUksTUFBTSxDQUFDLElBQUkscUJBQVMsQ0FBQyxFQUFFLENBQUMsT0FBTyxFQUFFLEVBQUUsZUFBZSxFQUFFLEtBQUssQ0FBQyxDQUFDO1FBQy9ELENBQUM7OztPQUFBO0lBRU0saUNBQUksR0FBWDtRQUVJLElBQUksQ0FBQyxNQUFNLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQztJQUNuQyxDQUFDO0lBQ0wseUJBQUM7QUFBRCxDQWZBLEFBZUMsSUFBQTtBQUdELCtDQUErQztBQUNsQyxRQUFBLE1BQU0sR0FBRyxJQUFJLGtCQUFrQixFQUFFLENBQUMiLCJmaWxlIjoicHVibGlzaFRvR2l0Q29uZmlnLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtEaXJlY3Rvcnl9IGZyb20gXCIuL2RpcmVjdG9yeVwiO1xuaW1wb3J0ICogYXMgb3MgZnJvbSBcIm9zXCI7XG5cblxuLyoqXG4gKiBAY2xhc3NcbiAqIEBjbGFzc2Rlc2MgQSBzaW5nbGV0b24gdGhhdCBpcyB1c2VkIHRvIGhvbGQgdGhlIGdsb2JhbCBjb25maWd1cmF0aW8gZm9yIHRoaXNcbiAqIGFwcGxpY2F0aW9uLlxuICovXG5jbGFzcyBQdWJsaXNoVG9HaXRDb25maWdcbntcbiAgICBwdWJsaWMgY29uc3RydWN0b3IoKVxuICAgIHtcbiAgICB9XG5cbiAgICBwdWJsaWMgZ2V0IHRtcERpcigpOiBEaXJlY3RvcnlcbiAgICB7XG4gICAgICAgIHJldHVybiBuZXcgRGlyZWN0b3J5KG9zLmhvbWVkaXIoKSwgXCIucHVibGlzaHRvZ2l0XCIsIFwidG1wXCIpO1xuICAgIH1cblxuICAgIHB1YmxpYyBpbml0KCk6IHZvaWRcbiAgICB7XG4gICAgICAgIHRoaXMudG1wRGlyLmVuc3VyZUV4aXN0c1N5bmMoKTtcbiAgICB9XG59XG5cblxuLy8gVGhlIG9uZSBhbmQgb25seSBpbnN0YW5jZSBvZiB0aGlzIHNpbmdsZXRvbi5cbmV4cG9ydCBjb25zdCBjb25maWcgPSBuZXcgUHVibGlzaFRvR2l0Q29uZmlnKCk7XG4iXX0=
