"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var _ = require("lodash");
// A regular expression to match valid Git repo URLs.
// match[1]: project name
var gitUrlRegexp = /.*\/(.*)\.git$/;
/**
 * Extracts the project name from a Git URL
 * @param gitUrl - The Git URL for a repository
 * @return The name of the project.  This method will throw an Error if the
 * provided URL is invalid.
 */
function gitUrlToProjectName(gitUrl) {
    var match = gitUrl.match(gitUrlRegexp);
    if (!match) {
        throw new Error("Tried to get project name from invalid Git URL.");
    }
    return match[1];
}
exports.gitUrlToProjectName = gitUrlToProjectName;
//
// A regex that captures the protocol part of a URL (everything up to the
// "://").
// results[1] - The string of all protocols.
//
var urlProtocolRegex = /^([a-zA-Z0-9_+]+?):\/\//;
var Url = (function () {
    //endregion
    function Url(url) {
        this._url = url;
    }
    Url.fromString = function (urlStr) {
        // TODO: Verify that urlStr is a valid URL.
        return new Url(urlStr);
    };
    Url.prototype.toString = function () {
        return this._url;
    };
    Url.prototype.getProtocols = function () {
        var results = urlProtocolRegex.exec(this._url);
        if (!results) {
            return [];
        }
        return results[1].split("+");
    };
    Url.prototype.replaceProtocol = function (newProtocol) {
        if (!_.endsWith(newProtocol, "://")) {
            newProtocol = newProtocol + "://";
        }
        var urlStr = this._url.replace(urlProtocolRegex, newProtocol);
        return new Url(urlStr);
    };
    return Url;
}());
exports.Url = Url;

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy91cmwudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSwwQkFBNEI7QUFHNUIscURBQXFEO0FBQ3JELHlCQUF5QjtBQUN6QixJQUFNLFlBQVksR0FBRyxnQkFBZ0IsQ0FBQztBQUd0Qzs7Ozs7R0FLRztBQUNILDZCQUFvQyxNQUFjO0lBRTlDLElBQU0sS0FBSyxHQUFHLE1BQU0sQ0FBQyxLQUFLLENBQUMsWUFBWSxDQUFDLENBQUM7SUFDekMsRUFBRSxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FDWCxDQUFDO1FBQ0csTUFBTSxJQUFJLEtBQUssQ0FBQyxpREFBaUQsQ0FBQyxDQUFDO0lBQ3ZFLENBQUM7SUFFRCxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ3BCLENBQUM7QUFURCxrREFTQztBQUdELEVBQUU7QUFDRix5RUFBeUU7QUFDekUsVUFBVTtBQUNWLDRDQUE0QztBQUM1QyxFQUFFO0FBQ0YsSUFBTSxnQkFBZ0IsR0FBRyx5QkFBeUIsQ0FBQztBQUduRDtJQVdJLFdBQVc7SUFHWCxhQUFvQixHQUFXO1FBRTNCLElBQUksQ0FBQyxJQUFJLEdBQUcsR0FBRyxDQUFDO0lBQ3BCLENBQUM7SUFmYSxjQUFVLEdBQXhCLFVBQXlCLE1BQWM7UUFFbkMsMkNBQTJDO1FBQzNDLE1BQU0sQ0FBQyxJQUFJLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQztJQUMzQixDQUFDO0lBY00sc0JBQVEsR0FBZjtRQUVJLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDO0lBQ3JCLENBQUM7SUFHTSwwQkFBWSxHQUFuQjtRQUVJLElBQU0sT0FBTyxHQUFHLGdCQUFnQixDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDakQsRUFBRSxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FDYixDQUFDO1lBQ0csTUFBTSxDQUFDLEVBQUUsQ0FBQztRQUNkLENBQUM7UUFFRCxNQUFNLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQztJQUNqQyxDQUFDO0lBR00sNkJBQWUsR0FBdEIsVUFBdUIsV0FBbUI7UUFFdEMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLFdBQVcsRUFBRSxLQUFLLENBQUMsQ0FBQyxDQUNwQyxDQUFDO1lBQ0csV0FBVyxHQUFHLFdBQVcsR0FBRyxLQUFLLENBQUM7UUFDdEMsQ0FBQztRQUVELElBQU0sTUFBTSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLGdCQUFnQixFQUFFLFdBQVcsQ0FBQyxDQUFDO1FBQ2hFLE1BQU0sQ0FBQyxJQUFJLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQztJQUMzQixDQUFDO0lBQ0wsVUFBQztBQUFELENBaERBLEFBZ0RDLElBQUE7QUFoRFksa0JBQUciLCJmaWxlIjoidXJsLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0ICogYXMgXyBmcm9tIFwibG9kYXNoXCI7XG5cblxuLy8gQSByZWd1bGFyIGV4cHJlc3Npb24gdG8gbWF0Y2ggdmFsaWQgR2l0IHJlcG8gVVJMcy5cbi8vIG1hdGNoWzFdOiBwcm9qZWN0IG5hbWVcbmNvbnN0IGdpdFVybFJlZ2V4cCA9IC8uKlxcLyguKilcXC5naXQkLztcblxuXG4vKipcbiAqIEV4dHJhY3RzIHRoZSBwcm9qZWN0IG5hbWUgZnJvbSBhIEdpdCBVUkxcbiAqIEBwYXJhbSBnaXRVcmwgLSBUaGUgR2l0IFVSTCBmb3IgYSByZXBvc2l0b3J5XG4gKiBAcmV0dXJuIFRoZSBuYW1lIG9mIHRoZSBwcm9qZWN0LiAgVGhpcyBtZXRob2Qgd2lsbCB0aHJvdyBhbiBFcnJvciBpZiB0aGVcbiAqIHByb3ZpZGVkIFVSTCBpcyBpbnZhbGlkLlxuICovXG5leHBvcnQgZnVuY3Rpb24gZ2l0VXJsVG9Qcm9qZWN0TmFtZShnaXRVcmw6IHN0cmluZyk6IHN0cmluZ1xue1xuICAgIGNvbnN0IG1hdGNoID0gZ2l0VXJsLm1hdGNoKGdpdFVybFJlZ2V4cCk7XG4gICAgaWYgKCFtYXRjaClcbiAgICB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcIlRyaWVkIHRvIGdldCBwcm9qZWN0IG5hbWUgZnJvbSBpbnZhbGlkIEdpdCBVUkwuXCIpO1xuICAgIH1cblxuICAgIHJldHVybiBtYXRjaFsxXTtcbn1cblxuXG4vL1xuLy8gQSByZWdleCB0aGF0IGNhcHR1cmVzIHRoZSBwcm90b2NvbCBwYXJ0IG9mIGEgVVJMIChldmVyeXRoaW5nIHVwIHRvIHRoZVxuLy8gXCI6Ly9cIikuXG4vLyByZXN1bHRzWzFdIC0gVGhlIHN0cmluZyBvZiBhbGwgcHJvdG9jb2xzLlxuLy9cbmNvbnN0IHVybFByb3RvY29sUmVnZXggPSAvXihbYS16QS1aMC05XytdKz8pOlxcL1xcLy87XG5cblxuZXhwb3J0IGNsYXNzIFVybFxue1xuICAgIHB1YmxpYyBzdGF0aWMgZnJvbVN0cmluZyh1cmxTdHI6IHN0cmluZyk6IFVybCB8IHVuZGVmaW5lZFxuICAgIHtcbiAgICAgICAgLy8gVE9ETzogVmVyaWZ5IHRoYXQgdXJsU3RyIGlzIGEgdmFsaWQgVVJMLlxuICAgICAgICByZXR1cm4gbmV3IFVybCh1cmxTdHIpO1xuICAgIH1cblxuXG4gICAgLy9yZWdpb24gRGF0YSBNZW1iZXJzXG4gICAgcHJpdmF0ZSBfdXJsOiBzdHJpbmc7XG4gICAgLy9lbmRyZWdpb25cblxuXG4gICAgcHJpdmF0ZSBjb25zdHJ1Y3Rvcih1cmw6IHN0cmluZylcbiAgICB7XG4gICAgICAgIHRoaXMuX3VybCA9IHVybDtcbiAgICB9XG5cblxuICAgIHB1YmxpYyB0b1N0cmluZygpOiBzdHJpbmdcbiAgICB7XG4gICAgICAgIHJldHVybiB0aGlzLl91cmw7XG4gICAgfVxuXG5cbiAgICBwdWJsaWMgZ2V0UHJvdG9jb2xzKCk6IEFycmF5PHN0cmluZz5cbiAgICB7XG4gICAgICAgIGNvbnN0IHJlc3VsdHMgPSB1cmxQcm90b2NvbFJlZ2V4LmV4ZWModGhpcy5fdXJsKTtcbiAgICAgICAgaWYgKCFyZXN1bHRzKVxuICAgICAgICB7XG4gICAgICAgICAgICByZXR1cm4gW107XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gcmVzdWx0c1sxXS5zcGxpdChcIitcIik7XG4gICAgfVxuXG5cbiAgICBwdWJsaWMgcmVwbGFjZVByb3RvY29sKG5ld1Byb3RvY29sOiBzdHJpbmcpOiBVcmxcbiAgICB7XG4gICAgICAgIGlmICghXy5lbmRzV2l0aChuZXdQcm90b2NvbCwgXCI6Ly9cIikpXG4gICAgICAgIHtcbiAgICAgICAgICAgIG5ld1Byb3RvY29sID0gbmV3UHJvdG9jb2wgKyBcIjovL1wiO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgdXJsU3RyID0gdGhpcy5fdXJsLnJlcGxhY2UodXJsUHJvdG9jb2xSZWdleCwgbmV3UHJvdG9jb2wpO1xuICAgICAgICByZXR1cm4gbmV3IFVybCh1cmxTdHIpO1xuICAgIH1cbn1cblxuIl19
