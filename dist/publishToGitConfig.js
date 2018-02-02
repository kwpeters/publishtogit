"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var directory_1 = require("./directory");
var os = require("os");
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
    return PublishToGitConfig;
}());
exports.config = new PublishToGitConfig();

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9wdWJsaXNoVG9HaXRDb25maWcudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSx5Q0FBc0M7QUFDdEMsdUJBQXlCO0FBR3pCO0lBRUk7SUFFQSxDQUFDO0lBRUQsc0JBQVcsc0NBQU07YUFBakI7WUFFSSxNQUFNLENBQUMsSUFBSSxxQkFBUyxDQUFDLEVBQUUsQ0FBQyxPQUFPLEVBQUUsRUFBRSxpQkFBaUIsRUFBRSxLQUFLLENBQUMsQ0FBQztRQUNqRSxDQUFDOzs7T0FBQTtJQUNMLHlCQUFDO0FBQUQsQ0FWQSxBQVVDLElBQUE7QUFHWSxRQUFBLE1BQU0sR0FBRyxJQUFJLGtCQUFrQixFQUFFLENBQUMiLCJmaWxlIjoicHVibGlzaFRvR2l0Q29uZmlnLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtEaXJlY3Rvcnl9IGZyb20gXCIuL2RpcmVjdG9yeVwiO1xuaW1wb3J0ICogYXMgb3MgZnJvbSBcIm9zXCI7XG5cblxuY2xhc3MgUHVibGlzaFRvR2l0Q29uZmlnXG57XG4gICAgcHVibGljIGNvbnN0cnVjdG9yKClcbiAgICB7XG4gICAgfVxuXG4gICAgcHVibGljIGdldCB0bXBEaXIoKTogRGlyZWN0b3J5XG4gICAge1xuICAgICAgICByZXR1cm4gbmV3IERpcmVjdG9yeShvcy5ob21lZGlyKCksIFwiLnB1Ymxpc2gtdG8tZ2l0XCIsIFwidG1wXCIpO1xuICAgIH1cbn1cblxuXG5leHBvcnQgY29uc3QgY29uZmlnID0gbmV3IFB1Ymxpc2hUb0dpdENvbmZpZygpO1xuIl19
