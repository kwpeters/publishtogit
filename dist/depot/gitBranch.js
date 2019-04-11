"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var _ = require("lodash");
var spawn_1 = require("./spawn");
var validator_1 = require("./validator");
// TODO: To get the branches that are pointing at a given commit:
// git show-ref | grep -i "70e423e654f3a3"
// This would be useful when creating a SourceTree custom action that would
// allow the user to right click on a commit and copy the branch names that
// refer to that commit.
var GitBranch = /** @class */ (function () {
    // endregion
    /**
     * Constructs a new GitBranch.
     *
     * @param repo - The repo the branch should be associated with
     * @param branchName - The branch name
     * @param remoteName - The remote name (if the branch is a remote branch)
     */
    function GitBranch(repo, branchName, remoteName) {
        this._repo = repo;
        this._name = branchName;
        this._remoteName = remoteName || undefined;
    }
    // endregion
    /**
     * Validates the specified branch name
     * @static
     * @method
     * @param branchName - The name to validate
     * @return A promise for a boolean that will indicate whether branchName is
     * valid.  This promise will never reject.
     */
    GitBranch.isValidBranchName = function (branchName) {
        // A Git branch name cannot:
        // - Have a path component that begins with "."
        // - Have a double dot ".."
        // - Have an ASCII control character, "~", "^", ":" or SP, anywhere.
        // - End with a "/"
        // - End with ".lock"
        // - Contain a "\" (backslash)
        //
        // We could check for the above ourselves, or just ask Git to validate
        // branchName using the check-ref-format command.
        // The following command returns 0 if it is a valid name.
        // git check-ref-format --allow-onelevel "foobar\lock"
        // (returns 1 because backslash is invalid)
        return spawn_1.spawn("git", ["check-ref-format", "--allow-onelevel", branchName])
            .closePromise
            .then(function () {
            // Exit code === 0 means branchName is valid.
            return true;
        })
            .catch(function () {
            // Exit code !== 0 means branchName is invalid.
            return false;
        });
    };
    /**
     * Creates a GitBranch
     * @static
     * @method
     * @param repo - The repo associated with the branch
     * @param branchName - The name of the branch
     * @param remoteName - The remote name (if a remote branch)
     * @return A Promise for the newly created GitBranch instance.  This Promise
     * will be resolved with undefined if the specified branch name is invalid.
     */
    GitBranch.create = function (repo, branchName, remoteName) {
        var validator = new validator_1.Validator([this.isValidBranchName]);
        return validator.isValid(branchName)
            .then(function (branchNameIsValid) {
            if (!branchNameIsValid) {
                throw new Error("Cannot create GitBranch instance from invalid branch name " + branchName + ".");
            }
            return new GitBranch(repo, branchName, remoteName);
        });
    };
    /**
     * Enumerates the branches that exist within the specified repo.
     * @static
     * @method
     * @param repo - The repo in which the branches are to be enumerated
     * @return A Promise for an array of branches in the specified repo
     */
    GitBranch.enumerateGitRepoBranches = function (repo) {
        return spawn_1.spawn("git", ["branch", "-a"], repo.directory.toString()).closePromise
            .then(function (stdout) {
            return _.chain(stdout.split("\n"))
                // Get rid of leading and trailing whitespace
                .map(function (curLine) { return curLine.trim(); })
                // Replace the "* " that precedes the current working branch
                .map(function (curLine) { return curLine.replace(/^\*\s+/, ""); })
                // Filter out the line that looks like: remotes/origin/HEAD -> origin/master
                .filter(function (curLine) { return !/^[\w/]+\/HEAD\s+->\s+[\w/]+$/.test(curLine); })
                // Get rid of leading and trailing whitespace
                .map(function (curLine) { return curLine.trim(); })
                // Create an array of GitBranch objects
                .map(function (longName) {
                var regexResults = GitBranch.strParserRegex.exec(longName);
                if (!regexResults) {
                    throw new Error("Error: Branch \"" + longName + "\" could not be parsed by enumerateGitRepoBranches().");
                }
                var remoteName = regexResults[2];
                var branchName = regexResults[3];
                // Note: Because the branch names are coming from Git (and not a
                // user) the branch names do not have to be validated as is done in
                // GitBranch.create(), which uses user data.
                return new GitBranch(repo, branchName, remoteName);
            })
                .value();
        });
    };
    Object.defineProperty(GitBranch.prototype, "repo", {
        get: function () {
            return this._repo;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(GitBranch.prototype, "remoteName", {
        get: function () {
            return this._remoteName;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(GitBranch.prototype, "name", {
        get: function () {
            return this._name;
        },
        enumerable: true,
        configurable: true
    });
    // region Static Data Members
    // The regex needed to parse the long name strings printed by "git branch
    // -a".
    // If given remotes/remotename/branch/name
    // group 1: "remotes/remotename"  (not all that useful)
    // group 2: "remotename"          (the remote name)
    // group 3: "branch/name"         (the branch name)
    GitBranch.strParserRegex = /^(remotes\/([\w.-]+)\/)?(.*)$/;
    return GitBranch;
}());
exports.GitBranch = GitBranch;

//# sourceMappingURL=data:application/json;charset=utf8;base64,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cmFuY2guanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgKiBhcyBfIGZyb20gXCJsb2Rhc2hcIjtcbmltcG9ydCB7R2l0UmVwb30gZnJvbSBcIi4vZ2l0UmVwb1wiO1xuaW1wb3J0IHtzcGF3bn0gZnJvbSBcIi4vc3Bhd25cIjtcbmltcG9ydCB7VmFsaWRhdG9yfSBmcm9tIFwiLi92YWxpZGF0b3JcIjtcblxuXG4vLyBUT0RPOiBUbyBnZXQgdGhlIGJyYW5jaGVzIHRoYXQgYXJlIHBvaW50aW5nIGF0IGEgZ2l2ZW4gY29tbWl0OlxuLy8gZ2l0IHNob3ctcmVmIHwgZ3JlcCAtaSBcIjcwZTQyM2U2NTRmM2EzXCJcbi8vIFRoaXMgd291bGQgYmUgdXNlZnVsIHdoZW4gY3JlYXRpbmcgYSBTb3VyY2VUcmVlIGN1c3RvbSBhY3Rpb24gdGhhdCB3b3VsZFxuLy8gYWxsb3cgdGhlIHVzZXIgdG8gcmlnaHQgY2xpY2sgb24gYSBjb21taXQgYW5kIGNvcHkgdGhlIGJyYW5jaCBuYW1lcyB0aGF0XG4vLyByZWZlciB0byB0aGF0IGNvbW1pdC5cblxuZXhwb3J0IGNsYXNzIEdpdEJyYW5jaFxue1xuICAgIC8vIHJlZ2lvbiBTdGF0aWMgRGF0YSBNZW1iZXJzXG5cbiAgICAvLyBUaGUgcmVnZXggbmVlZGVkIHRvIHBhcnNlIHRoZSBsb25nIG5hbWUgc3RyaW5ncyBwcmludGVkIGJ5IFwiZ2l0IGJyYW5jaFxuICAgIC8vIC1hXCIuXG4gICAgLy8gSWYgZ2l2ZW4gcmVtb3Rlcy9yZW1vdGVuYW1lL2JyYW5jaC9uYW1lXG4gICAgLy8gZ3JvdXAgMTogXCJyZW1vdGVzL3JlbW90ZW5hbWVcIiAgKG5vdCBhbGwgdGhhdCB1c2VmdWwpXG4gICAgLy8gZ3JvdXAgMjogXCJyZW1vdGVuYW1lXCIgICAgICAgICAgKHRoZSByZW1vdGUgbmFtZSlcbiAgICAvLyBncm91cCAzOiBcImJyYW5jaC9uYW1lXCIgICAgICAgICAodGhlIGJyYW5jaCBuYW1lKVxuICAgIHByaXZhdGUgc3RhdGljIHN0clBhcnNlclJlZ2V4OiBSZWdFeHAgPSAvXihyZW1vdGVzXFwvKFtcXHcuLV0rKVxcLyk/KC4qKSQvO1xuICAgIC8vIGVuZHJlZ2lvblxuXG5cbiAgICAvKipcbiAgICAgKiBWYWxpZGF0ZXMgdGhlIHNwZWNpZmllZCBicmFuY2ggbmFtZVxuICAgICAqIEBzdGF0aWNcbiAgICAgKiBAbWV0aG9kXG4gICAgICogQHBhcmFtIGJyYW5jaE5hbWUgLSBUaGUgbmFtZSB0byB2YWxpZGF0ZVxuICAgICAqIEByZXR1cm4gQSBwcm9taXNlIGZvciBhIGJvb2xlYW4gdGhhdCB3aWxsIGluZGljYXRlIHdoZXRoZXIgYnJhbmNoTmFtZSBpc1xuICAgICAqIHZhbGlkLiAgVGhpcyBwcm9taXNlIHdpbGwgbmV2ZXIgcmVqZWN0LlxuICAgICAqL1xuICAgIHB1YmxpYyBzdGF0aWMgaXNWYWxpZEJyYW5jaE5hbWUoYnJhbmNoTmFtZTogc3RyaW5nKTogUHJvbWlzZTxib29sZWFuPlxuICAgIHtcbiAgICAgICAgLy8gQSBHaXQgYnJhbmNoIG5hbWUgY2Fubm90OlxuICAgICAgICAvLyAtIEhhdmUgYSBwYXRoIGNvbXBvbmVudCB0aGF0IGJlZ2lucyB3aXRoIFwiLlwiXG4gICAgICAgIC8vIC0gSGF2ZSBhIGRvdWJsZSBkb3QgXCIuLlwiXG4gICAgICAgIC8vIC0gSGF2ZSBhbiBBU0NJSSBjb250cm9sIGNoYXJhY3RlciwgXCJ+XCIsIFwiXlwiLCBcIjpcIiBvciBTUCwgYW55d2hlcmUuXG4gICAgICAgIC8vIC0gRW5kIHdpdGggYSBcIi9cIlxuICAgICAgICAvLyAtIEVuZCB3aXRoIFwiLmxvY2tcIlxuICAgICAgICAvLyAtIENvbnRhaW4gYSBcIlxcXCIgKGJhY2tzbGFzaClcbiAgICAgICAgLy9cbiAgICAgICAgLy8gV2UgY291bGQgY2hlY2sgZm9yIHRoZSBhYm92ZSBvdXJzZWx2ZXMsIG9yIGp1c3QgYXNrIEdpdCB0byB2YWxpZGF0ZVxuICAgICAgICAvLyBicmFuY2hOYW1lIHVzaW5nIHRoZSBjaGVjay1yZWYtZm9ybWF0IGNvbW1hbmQuXG4gICAgICAgIC8vIFRoZSBmb2xsb3dpbmcgY29tbWFuZCByZXR1cm5zIDAgaWYgaXQgaXMgYSB2YWxpZCBuYW1lLlxuICAgICAgICAvLyBnaXQgY2hlY2stcmVmLWZvcm1hdCAtLWFsbG93LW9uZWxldmVsIFwiZm9vYmFyXFxsb2NrXCJcbiAgICAgICAgLy8gKHJldHVybnMgMSBiZWNhdXNlIGJhY2tzbGFzaCBpcyBpbnZhbGlkKVxuXG4gICAgICAgIHJldHVybiBzcGF3bihcImdpdFwiLCBbXCJjaGVjay1yZWYtZm9ybWF0XCIsIFwiLS1hbGxvdy1vbmVsZXZlbFwiLCBicmFuY2hOYW1lXSlcbiAgICAgICAgLmNsb3NlUHJvbWlzZVxuICAgICAgICAudGhlbigoKSA9PiB7XG4gICAgICAgICAgICAvLyBFeGl0IGNvZGUgPT09IDAgbWVhbnMgYnJhbmNoTmFtZSBpcyB2YWxpZC5cbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9KVxuICAgICAgICAuY2F0Y2goKCkgPT4ge1xuICAgICAgICAgICAgLy8gRXhpdCBjb2RlICE9PSAwIG1lYW5zIGJyYW5jaE5hbWUgaXMgaW52YWxpZC5cbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG5cbiAgICAvKipcbiAgICAgKiBDcmVhdGVzIGEgR2l0QnJhbmNoXG4gICAgICogQHN0YXRpY1xuICAgICAqIEBtZXRob2RcbiAgICAgKiBAcGFyYW0gcmVwbyAtIFRoZSByZXBvIGFzc29jaWF0ZWQgd2l0aCB0aGUgYnJhbmNoXG4gICAgICogQHBhcmFtIGJyYW5jaE5hbWUgLSBUaGUgbmFtZSBvZiB0aGUgYnJhbmNoXG4gICAgICogQHBhcmFtIHJlbW90ZU5hbWUgLSBUaGUgcmVtb3RlIG5hbWUgKGlmIGEgcmVtb3RlIGJyYW5jaClcbiAgICAgKiBAcmV0dXJuIEEgUHJvbWlzZSBmb3IgdGhlIG5ld2x5IGNyZWF0ZWQgR2l0QnJhbmNoIGluc3RhbmNlLiAgVGhpcyBQcm9taXNlXG4gICAgICogd2lsbCBiZSByZXNvbHZlZCB3aXRoIHVuZGVmaW5lZCBpZiB0aGUgc3BlY2lmaWVkIGJyYW5jaCBuYW1lIGlzIGludmFsaWQuXG4gICAgICovXG4gICAgcHVibGljIHN0YXRpYyBjcmVhdGUocmVwbzogR2l0UmVwbywgYnJhbmNoTmFtZTogc3RyaW5nLCByZW1vdGVOYW1lPzogc3RyaW5nKTogUHJvbWlzZTxHaXRCcmFuY2g+XG4gICAge1xuICAgICAgICBjb25zdCB2YWxpZGF0b3IgPSBuZXcgVmFsaWRhdG9yPHN0cmluZz4oW3RoaXMuaXNWYWxpZEJyYW5jaE5hbWVdKTtcblxuICAgICAgICByZXR1cm4gdmFsaWRhdG9yLmlzVmFsaWQoYnJhbmNoTmFtZSlcbiAgICAgICAgLnRoZW4oKGJyYW5jaE5hbWVJc1ZhbGlkKSA9PiB7XG4gICAgICAgICAgICBpZiAoIWJyYW5jaE5hbWVJc1ZhbGlkKSB7XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBDYW5ub3QgY3JlYXRlIEdpdEJyYW5jaCBpbnN0YW5jZSBmcm9tIGludmFsaWQgYnJhbmNoIG5hbWUgJHticmFuY2hOYW1lfS5gKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIG5ldyBHaXRCcmFuY2gocmVwbywgYnJhbmNoTmFtZSwgcmVtb3RlTmFtZSk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuXG4gICAgLyoqXG4gICAgICogRW51bWVyYXRlcyB0aGUgYnJhbmNoZXMgdGhhdCBleGlzdCB3aXRoaW4gdGhlIHNwZWNpZmllZCByZXBvLlxuICAgICAqIEBzdGF0aWNcbiAgICAgKiBAbWV0aG9kXG4gICAgICogQHBhcmFtIHJlcG8gLSBUaGUgcmVwbyBpbiB3aGljaCB0aGUgYnJhbmNoZXMgYXJlIHRvIGJlIGVudW1lcmF0ZWRcbiAgICAgKiBAcmV0dXJuIEEgUHJvbWlzZSBmb3IgYW4gYXJyYXkgb2YgYnJhbmNoZXMgaW4gdGhlIHNwZWNpZmllZCByZXBvXG4gICAgICovXG4gICAgcHVibGljIHN0YXRpYyBlbnVtZXJhdGVHaXRSZXBvQnJhbmNoZXMocmVwbzogR2l0UmVwbyk6IFByb21pc2U8QXJyYXk8R2l0QnJhbmNoPj5cbiAgICB7XG4gICAgICAgIHJldHVybiBzcGF3bihcImdpdFwiLCBbXCJicmFuY2hcIiwgXCItYVwiXSwgcmVwby5kaXJlY3RvcnkudG9TdHJpbmcoKSkuY2xvc2VQcm9taXNlXG4gICAgICAgIC50aGVuKChzdGRvdXQpID0+IHtcbiAgICAgICAgICAgIHJldHVybiBfLmNoYWluKHN0ZG91dC5zcGxpdChcIlxcblwiKSlcbiAgICAgICAgICAgIC8vIEdldCByaWQgb2YgbGVhZGluZyBhbmQgdHJhaWxpbmcgd2hpdGVzcGFjZVxuICAgICAgICAgICAgLm1hcCgoY3VyTGluZSkgPT4gY3VyTGluZS50cmltKCkpXG4gICAgICAgICAgICAvLyBSZXBsYWNlIHRoZSBcIiogXCIgdGhhdCBwcmVjZWRlcyB0aGUgY3VycmVudCB3b3JraW5nIGJyYW5jaFxuICAgICAgICAgICAgLm1hcCgoY3VyTGluZSkgPT4gY3VyTGluZS5yZXBsYWNlKC9eXFwqXFxzKy8sIFwiXCIpKVxuICAgICAgICAgICAgLy8gRmlsdGVyIG91dCB0aGUgbGluZSB0aGF0IGxvb2tzIGxpa2U6IHJlbW90ZXMvb3JpZ2luL0hFQUQgLT4gb3JpZ2luL21hc3RlclxuICAgICAgICAgICAgLmZpbHRlcigoY3VyTGluZSkgPT4gIS9eW1xcdy9dK1xcL0hFQURcXHMrLT5cXHMrW1xcdy9dKyQvLnRlc3QoY3VyTGluZSkpXG4gICAgICAgICAgICAvLyBHZXQgcmlkIG9mIGxlYWRpbmcgYW5kIHRyYWlsaW5nIHdoaXRlc3BhY2VcbiAgICAgICAgICAgIC5tYXAoKGN1ckxpbmUpID0+IGN1ckxpbmUudHJpbSgpKVxuICAgICAgICAgICAgLy8gQ3JlYXRlIGFuIGFycmF5IG9mIEdpdEJyYW5jaCBvYmplY3RzXG4gICAgICAgICAgICAubWFwKChsb25nTmFtZSk6IEdpdEJyYW5jaCA9PiB7XG4gICAgICAgICAgICAgICAgY29uc3QgcmVnZXhSZXN1bHRzID0gR2l0QnJhbmNoLnN0clBhcnNlclJlZ2V4LmV4ZWMobG9uZ05hbWUpO1xuICAgICAgICAgICAgICAgIGlmICghcmVnZXhSZXN1bHRzKVxuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBFcnJvcjogQnJhbmNoIFwiJHtsb25nTmFtZX1cIiBjb3VsZCBub3QgYmUgcGFyc2VkIGJ5IGVudW1lcmF0ZUdpdFJlcG9CcmFuY2hlcygpLmApO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGNvbnN0IHJlbW90ZU5hbWUgPSByZWdleFJlc3VsdHNbMl07XG4gICAgICAgICAgICAgICAgY29uc3QgYnJhbmNoTmFtZSA9IHJlZ2V4UmVzdWx0c1szXTtcblxuICAgICAgICAgICAgICAgIC8vIE5vdGU6IEJlY2F1c2UgdGhlIGJyYW5jaCBuYW1lcyBhcmUgY29taW5nIGZyb20gR2l0IChhbmQgbm90IGFcbiAgICAgICAgICAgICAgICAvLyB1c2VyKSB0aGUgYnJhbmNoIG5hbWVzIGRvIG5vdCBoYXZlIHRvIGJlIHZhbGlkYXRlZCBhcyBpcyBkb25lIGluXG4gICAgICAgICAgICAgICAgLy8gR2l0QnJhbmNoLmNyZWF0ZSgpLCB3aGljaCB1c2VzIHVzZXIgZGF0YS5cblxuICAgICAgICAgICAgICAgIHJldHVybiBuZXcgR2l0QnJhbmNoKHJlcG8sIGJyYW5jaE5hbWUsIHJlbW90ZU5hbWUpO1xuICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIC52YWx1ZSgpO1xuXG4gICAgICAgIH0pO1xuICAgIH1cblxuXG4gICAgLy8gcmVnaW9uIERhdGEgTWVtYmVyc1xuICAgIHByaXZhdGUgcmVhZG9ubHkgX3JlcG86IEdpdFJlcG87XG4gICAgcHJpdmF0ZSByZWFkb25seSBfcmVtb3RlTmFtZTogc3RyaW5nIHwgdW5kZWZpbmVkO1xuICAgIHByaXZhdGUgcmVhZG9ubHkgX25hbWU6IHN0cmluZztcbiAgICAvLyBlbmRyZWdpb25cblxuXG4gICAgLyoqXG4gICAgICogQ29uc3RydWN0cyBhIG5ldyBHaXRCcmFuY2guXG4gICAgICpcbiAgICAgKiBAcGFyYW0gcmVwbyAtIFRoZSByZXBvIHRoZSBicmFuY2ggc2hvdWxkIGJlIGFzc29jaWF0ZWQgd2l0aFxuICAgICAqIEBwYXJhbSBicmFuY2hOYW1lIC0gVGhlIGJyYW5jaCBuYW1lXG4gICAgICogQHBhcmFtIHJlbW90ZU5hbWUgLSBUaGUgcmVtb3RlIG5hbWUgKGlmIHRoZSBicmFuY2ggaXMgYSByZW1vdGUgYnJhbmNoKVxuICAgICAqL1xuICAgIHByaXZhdGUgY29uc3RydWN0b3IocmVwbzogR2l0UmVwbywgYnJhbmNoTmFtZTogc3RyaW5nLCByZW1vdGVOYW1lPzogc3RyaW5nKVxuICAgIHtcbiAgICAgICAgdGhpcy5fcmVwbyA9IHJlcG87XG4gICAgICAgIHRoaXMuX25hbWUgPSBicmFuY2hOYW1lO1xuICAgICAgICB0aGlzLl9yZW1vdGVOYW1lID0gcmVtb3RlTmFtZSB8fCB1bmRlZmluZWQ7XG4gICAgfVxuXG5cbiAgICBwdWJsaWMgZ2V0IHJlcG8oKTogR2l0UmVwb1xuICAgIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX3JlcG87XG4gICAgfVxuXG5cbiAgICBwdWJsaWMgZ2V0IHJlbW90ZU5hbWUoKTogc3RyaW5nIHwgdW5kZWZpbmVkXG4gICAge1xuICAgICAgICByZXR1cm4gdGhpcy5fcmVtb3RlTmFtZTtcbiAgICB9XG5cblxuICAgIHB1YmxpYyBnZXQgbmFtZSgpOiBzdHJpbmdcbiAgICB7XG4gICAgICAgIHJldHVybiB0aGlzLl9uYW1lO1xuICAgIH1cblxufVxuIl19
