"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var directory_1 = require("./directory");
var gitRepo_1 = require("./gitRepo");
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
var GitRepoPath = (function () {
    //endregion
    function GitRepoPath(gitRepoPath) {
        this._path = gitRepoPath;
    }
    /**
     * Creates a GitRepoPath from a local directory
     * @static
     * @method
     * @param repoDir - The directory the path is to represent
     * @return A Promise for the GitRepoPath or undefined if repoDir does not
     * exist or does not contain a Git repository.
     */
    GitRepoPath.fromDirectory = function (repoDir) {
        return gitRepo_1.isGitRepoDir(repoDir)
            .then(function (isGitRepoDir) {
            if (isGitRepoDir) {
                return new GitRepoPath(repoDir);
            }
            throw new Error("Directory does not contain a Git repository.");
        });
    };
    /**
     * Creates a GitRepoPath from a Git URL
     * @static
     * @method
     * @param url - The URL the path is to represent
     * @return A Promise for the GitRepoPath or undefined if url is not a valid
     * Git repository URL.
     */
    GitRepoPath.fromUrl = function (url) {
        if (!gitUrlRegexp.test(url)) {
            return undefined;
        }
        return new GitRepoPath(url);
    };
    GitRepoPath.prototype.toString = function () {
        if (this._path instanceof directory_1.Directory) {
            return this._path.toString();
        }
        else {
            return this._path;
        }
    };
    GitRepoPath.prototype.getProjectName = function () {
        if (this._path instanceof directory_1.Directory) {
            return this._path.dirName;
        }
        else {
            var matches = gitUrlRegexp.exec(this._path);
            if (!matches) {
                throw new Error("GitRepoPath in invalid state.");
            }
            return matches[1];
        }
    };
    return GitRepoPath;
}());
exports.GitRepoPath = GitRepoPath;

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9HaXRSZXBvUGF0aC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLHlDQUFzQztBQUN0QyxxQ0FBdUM7QUFHdkMscURBQXFEO0FBQ3JELHlCQUF5QjtBQUN6QixJQUFNLFlBQVksR0FBRyxnQkFBZ0IsQ0FBQztBQUd0Qzs7Ozs7R0FLRztBQUNILDZCQUFvQyxNQUFjO0lBRTlDLElBQU0sS0FBSyxHQUFHLE1BQU0sQ0FBQyxLQUFLLENBQUMsWUFBWSxDQUFDLENBQUM7SUFDekMsRUFBRSxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FDWCxDQUFDO1FBQ0csTUFBTSxJQUFJLEtBQUssQ0FBQyxpREFBaUQsQ0FBQyxDQUFDO0lBQ3ZFLENBQUM7SUFFRCxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ3BCLENBQUM7QUFURCxrREFTQztBQUdEO0lBZ0RJLFdBQVc7SUFHWCxxQkFBb0IsV0FBK0I7UUFFL0MsSUFBSSxDQUFDLEtBQUssR0FBRyxXQUFXLENBQUM7SUFDN0IsQ0FBQztJQW5ERDs7Ozs7OztPQU9HO0lBQ1cseUJBQWEsR0FBM0IsVUFBNEIsT0FBa0I7UUFFMUMsTUFBTSxDQUFDLHNCQUFZLENBQUMsT0FBTyxDQUFDO2FBQzNCLElBQUksQ0FBQyxVQUFDLFlBQXFCO1lBQ3hCLEVBQUUsQ0FBQyxDQUFDLFlBQVksQ0FBQyxDQUNqQixDQUFDO2dCQUNHLE1BQU0sQ0FBQyxJQUFJLFdBQVcsQ0FBQyxPQUFPLENBQUMsQ0FBQztZQUNwQyxDQUFDO1lBRUQsTUFBTSxJQUFJLEtBQUssQ0FBQyw4Q0FBOEMsQ0FBQyxDQUFDO1FBRXBFLENBQUMsQ0FBQyxDQUFDO0lBQ1AsQ0FBQztJQUdEOzs7Ozs7O09BT0c7SUFDVyxtQkFBTyxHQUFyQixVQUFzQixHQUFXO1FBRTdCLEVBQUUsQ0FBQyxDQUFDLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUM1QixDQUFDO1lBQ0csTUFBTSxDQUFDLFNBQVMsQ0FBQztRQUNyQixDQUFDO1FBRUQsTUFBTSxDQUFDLElBQUksV0FBVyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0lBRWhDLENBQUM7SUFjTSw4QkFBUSxHQUFmO1FBRUksRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLEtBQUssWUFBWSxxQkFBUyxDQUFDLENBQ3BDLENBQUM7WUFDRyxNQUFNLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxRQUFRLEVBQUUsQ0FBQztRQUNqQyxDQUFDO1FBQ0QsSUFBSSxDQUNKLENBQUM7WUFDRyxNQUFNLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQztRQUN0QixDQUFDO0lBQ0wsQ0FBQztJQUdNLG9DQUFjLEdBQXJCO1FBRUksRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLEtBQUssWUFBWSxxQkFBUyxDQUFDLENBQ3BDLENBQUM7WUFDRyxNQUFNLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUM7UUFDOUIsQ0FBQztRQUNELElBQUksQ0FDSixDQUFDO1lBQ0csSUFBTSxPQUFPLEdBQUcsWUFBWSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7WUFDOUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FDYixDQUFDO2dCQUNHLE1BQU0sSUFBSSxLQUFLLENBQUMsK0JBQStCLENBQUMsQ0FBQztZQUNyRCxDQUFDO1lBRUQsTUFBTSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUN0QixDQUFDO0lBQ0wsQ0FBQztJQUNMLGtCQUFDO0FBQUQsQ0F2RkEsQUF1RkMsSUFBQTtBQXZGWSxrQ0FBVyIsImZpbGUiOiJHaXRSZXBvUGF0aC5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7RGlyZWN0b3J5fSBmcm9tIFwiLi9kaXJlY3RvcnlcIjtcbmltcG9ydCB7aXNHaXRSZXBvRGlyfSBmcm9tIFwiLi9naXRSZXBvXCI7XG5cblxuLy8gQSByZWd1bGFyIGV4cHJlc3Npb24gdG8gbWF0Y2ggdmFsaWQgR2l0IHJlcG8gVVJMcy5cbi8vIG1hdGNoWzFdOiBwcm9qZWN0IG5hbWVcbmNvbnN0IGdpdFVybFJlZ2V4cCA9IC8uKlxcLyguKilcXC5naXQkLztcblxuXG4vKipcbiAqIEV4dHJhY3RzIHRoZSBwcm9qZWN0IG5hbWUgZnJvbSBhIEdpdCBVUkxcbiAqIEBwYXJhbSBnaXRVcmwgLSBUaGUgR2l0IFVSTCBmb3IgYSByZXBvc2l0b3J5XG4gKiBAcmV0dXJuIFRoZSBuYW1lIG9mIHRoZSBwcm9qZWN0LiAgVGhpcyBtZXRob2Qgd2lsbCB0aHJvdyBhbiBFcnJvciBpZiB0aGVcbiAqIHByb3ZpZGVkIFVSTCBpcyBpbnZhbGlkLlxuICovXG5leHBvcnQgZnVuY3Rpb24gZ2l0VXJsVG9Qcm9qZWN0TmFtZShnaXRVcmw6IHN0cmluZyk6IHN0cmluZ1xue1xuICAgIGNvbnN0IG1hdGNoID0gZ2l0VXJsLm1hdGNoKGdpdFVybFJlZ2V4cCk7XG4gICAgaWYgKCFtYXRjaClcbiAgICB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcIlRyaWVkIHRvIGdldCBwcm9qZWN0IG5hbWUgZnJvbSBpbnZhbGlkIEdpdCBVUkwuXCIpO1xuICAgIH1cblxuICAgIHJldHVybiBtYXRjaFsxXTtcbn1cblxuXG5leHBvcnQgY2xhc3MgR2l0UmVwb1BhdGhcbntcblxuICAgIC8qKlxuICAgICAqIENyZWF0ZXMgYSBHaXRSZXBvUGF0aCBmcm9tIGEgbG9jYWwgZGlyZWN0b3J5XG4gICAgICogQHN0YXRpY1xuICAgICAqIEBtZXRob2RcbiAgICAgKiBAcGFyYW0gcmVwb0RpciAtIFRoZSBkaXJlY3RvcnkgdGhlIHBhdGggaXMgdG8gcmVwcmVzZW50XG4gICAgICogQHJldHVybiBBIFByb21pc2UgZm9yIHRoZSBHaXRSZXBvUGF0aCBvciB1bmRlZmluZWQgaWYgcmVwb0RpciBkb2VzIG5vdFxuICAgICAqIGV4aXN0IG9yIGRvZXMgbm90IGNvbnRhaW4gYSBHaXQgcmVwb3NpdG9yeS5cbiAgICAgKi9cbiAgICBwdWJsaWMgc3RhdGljIGZyb21EaXJlY3RvcnkocmVwb0RpcjogRGlyZWN0b3J5KTogUHJvbWlzZTxHaXRSZXBvUGF0aD5cbiAgICB7XG4gICAgICAgIHJldHVybiBpc0dpdFJlcG9EaXIocmVwb0RpcilcbiAgICAgICAgLnRoZW4oKGlzR2l0UmVwb0RpcjogYm9vbGVhbikgPT4ge1xuICAgICAgICAgICAgaWYgKGlzR2l0UmVwb0RpcilcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gbmV3IEdpdFJlcG9QYXRoKHJlcG9EaXIpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJEaXJlY3RvcnkgZG9lcyBub3QgY29udGFpbiBhIEdpdCByZXBvc2l0b3J5LlwiKTtcblxuICAgICAgICB9KTtcbiAgICB9XG5cblxuICAgIC8qKlxuICAgICAqIENyZWF0ZXMgYSBHaXRSZXBvUGF0aCBmcm9tIGEgR2l0IFVSTFxuICAgICAqIEBzdGF0aWNcbiAgICAgKiBAbWV0aG9kXG4gICAgICogQHBhcmFtIHVybCAtIFRoZSBVUkwgdGhlIHBhdGggaXMgdG8gcmVwcmVzZW50XG4gICAgICogQHJldHVybiBBIFByb21pc2UgZm9yIHRoZSBHaXRSZXBvUGF0aCBvciB1bmRlZmluZWQgaWYgdXJsIGlzIG5vdCBhIHZhbGlkXG4gICAgICogR2l0IHJlcG9zaXRvcnkgVVJMLlxuICAgICAqL1xuICAgIHB1YmxpYyBzdGF0aWMgZnJvbVVybCh1cmw6IHN0cmluZyk6IEdpdFJlcG9QYXRoIHwgdW5kZWZpbmVkXG4gICAge1xuICAgICAgICBpZiAoIWdpdFVybFJlZ2V4cC50ZXN0KHVybCkpXG4gICAgICAgIHtcbiAgICAgICAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gbmV3IEdpdFJlcG9QYXRoKHVybCk7XG5cbiAgICB9XG5cblxuICAgIC8vcmVnaW9uIERhdGEgTWVtYmVyc1xuICAgIHByaXZhdGUgX3BhdGg6IERpcmVjdG9yeSB8IHN0cmluZztcbiAgICAvL2VuZHJlZ2lvblxuXG5cbiAgICBwcml2YXRlIGNvbnN0cnVjdG9yKGdpdFJlcG9QYXRoOiBEaXJlY3RvcnkgfCBzdHJpbmcpXG4gICAge1xuICAgICAgICB0aGlzLl9wYXRoID0gZ2l0UmVwb1BhdGg7XG4gICAgfVxuXG5cbiAgICBwdWJsaWMgdG9TdHJpbmcoKTogc3RyaW5nXG4gICAge1xuICAgICAgICBpZiAodGhpcy5fcGF0aCBpbnN0YW5jZW9mIERpcmVjdG9yeSlcbiAgICAgICAge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX3BhdGgudG9TdHJpbmcoKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlXG4gICAgICAgIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl9wYXRoO1xuICAgICAgICB9XG4gICAgfVxuXG5cbiAgICBwdWJsaWMgZ2V0UHJvamVjdE5hbWUoKTogc3RyaW5nXG4gICAge1xuICAgICAgICBpZiAodGhpcy5fcGF0aCBpbnN0YW5jZW9mIERpcmVjdG9yeSlcbiAgICAgICAge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX3BhdGguZGlyTmFtZTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlXG4gICAgICAgIHtcbiAgICAgICAgICAgIGNvbnN0IG1hdGNoZXMgPSBnaXRVcmxSZWdleHAuZXhlYyh0aGlzLl9wYXRoKTtcbiAgICAgICAgICAgIGlmICghbWF0Y2hlcylcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJHaXRSZXBvUGF0aCBpbiBpbnZhbGlkIHN0YXRlLlwiKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIG1hdGNoZXNbMV07XG4gICAgICAgIH1cbiAgICB9XG59XG4iXX0=
