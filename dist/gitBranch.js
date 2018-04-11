"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = y[op[0] & 2 ? "return" : op[0] ? "throw" : "next"]) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [0, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var _ = require("lodash");
var asynchrony_1 = require("asynchrony");
var validator_1 = require("./validator");
var GitBranch = (function () {
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
    //endregion
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
        // - Have a double dot "…"
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
        return asynchrony_1.spawn("git", ["check-ref-format", "--allow-onelevel", branchName])
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
        return __awaiter(this, void 0, void 0, function () {
            var validator;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        validator = new validator_1.Validator([this.isValidBranchName]);
                        return [4 /*yield*/, validator.isValid(branchName)];
                    case 1:
                        if (!(_a.sent())) {
                            throw new Error("Cannot create GitBranch instance from invalid branch name " + branchName + ".");
                        }
                        return [2 /*return*/, new GitBranch(repo, branchName, remoteName)];
                }
            });
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
        return __awaiter(this, void 0, void 0, function () {
            var stdout;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, asynchrony_1.spawn("git", ["branch", "-a"], repo.directory.toString())];
                    case 1:
                        stdout = _a.sent();
                        return [2 /*return*/, _.chain(stdout.split("\n"))
                                .map(function (curLine) { return curLine.trim(); })
                                .map(function (curLine) { return curLine.replace(/^\*\s+/, ""); })
                                .filter(function (curLine) { return !/^[\w/]+\/HEAD\s+->\s+[\w/]+$/.test(curLine); })
                                .map(function (curLine) { return curLine.trim(); })
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
                                .value()];
                }
            });
        });
    };
    Object.defineProperty(GitBranch.prototype, "name", {
        get: function () {
            return this._name;
        },
        enumerable: true,
        configurable: true
    });
    //region Static Data Members
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

//# sourceMappingURL=data:application/json;charset=utf8;base64,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QUcsU0FBUyxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUM7Z0NBQzdELEVBQUUsQ0FBQyxDQUFDLENBQUMsWUFBWSxDQUFDLENBQ2xCLENBQUM7b0NBQ0csTUFBTSxJQUFJLEtBQUssQ0FBQyxxQkFBa0IsUUFBUSwwREFBc0QsQ0FBQyxDQUFDO2dDQUN0RyxDQUFDO2dDQUVELElBQU0sVUFBVSxHQUFHLFlBQVksQ0FBQyxDQUFDLENBQUMsQ0FBQztnQ0FDbkMsSUFBTSxVQUFVLEdBQUcsWUFBWSxDQUFDLENBQUMsQ0FBQyxDQUFDO2dDQUVuQyxnRUFBZ0U7Z0NBQ2hFLG1FQUFtRTtnQ0FDbkUsNENBQTRDO2dDQUU1QyxNQUFNLENBQUMsSUFBSSxTQUFTLENBQUMsSUFBSSxFQUFFLFVBQVUsRUFBRSxVQUFVLENBQUMsQ0FBQzs0QkFDdkQsQ0FBQyxDQUFDO2lDQUNELEtBQUssRUFBRSxFQUFDOzs7O0tBQ1o7SUFrQkQsc0JBQVcsMkJBQUk7YUFBZjtZQUVJLE1BQU0sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDO1FBQ3RCLENBQUM7OztPQUFBO0lBeklELDRCQUE0QjtJQUU1Qix5RUFBeUU7SUFDekUsT0FBTztJQUNQLDBDQUEwQztJQUMxQyx1REFBdUQ7SUFDdkQsbURBQW1EO0lBQ25ELG1EQUFtRDtJQUNwQyx3QkFBYyxHQUFXLCtCQUErQixDQUFDO0lBa0k1RSxnQkFBQztDQTVJRCxBQTRJQyxJQUFBO0FBNUlZLDhCQUFTIiwiZmlsZSI6ImdpdEJyYW5jaC5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCAqIGFzIF8gZnJvbSBcImxvZGFzaFwiO1xuaW1wb3J0IHtHaXRSZXBvfSBmcm9tIFwiLi9naXRSZXBvXCI7XG5pbXBvcnQge3NwYXdufSBmcm9tIFwiYXN5bmNocm9ueVwiO1xuaW1wb3J0IHtWYWxpZGF0b3J9IGZyb20gXCIuL3ZhbGlkYXRvclwiO1xuXG5cbmV4cG9ydCBjbGFzcyBHaXRCcmFuY2hcbntcbiAgICAvL3JlZ2lvbiBTdGF0aWMgRGF0YSBNZW1iZXJzXG5cbiAgICAvLyBUaGUgcmVnZXggbmVlZGVkIHRvIHBhcnNlIHRoZSBsb25nIG5hbWUgc3RyaW5ncyBwcmludGVkIGJ5IFwiZ2l0IGJyYW5jaFxuICAgIC8vIC1hXCIuXG4gICAgLy8gSWYgZ2l2ZW4gcmVtb3Rlcy9yZW1vdGVuYW1lL2JyYW5jaC9uYW1lXG4gICAgLy8gZ3JvdXAgMTogXCJyZW1vdGVzL3JlbW90ZW5hbWVcIiAgKG5vdCBhbGwgdGhhdCB1c2VmdWwpXG4gICAgLy8gZ3JvdXAgMjogXCJyZW1vdGVuYW1lXCIgICAgICAgICAgKHRoZSByZW1vdGUgbmFtZSlcbiAgICAvLyBncm91cCAzOiBcImJyYW5jaC9uYW1lXCIgICAgICAgICAodGhlIGJyYW5jaCBuYW1lKVxuICAgIHByaXZhdGUgc3RhdGljIHN0clBhcnNlclJlZ2V4OiBSZWdFeHAgPSAvXihyZW1vdGVzXFwvKFtcXHcuLV0rKVxcLyk/KC4qKSQvO1xuXG4gICAgLy9lbmRyZWdpb25cblxuXG4gICAgLy9yZWdpb24gRGF0YSBNZW1iZXJzXG4gICAgcHJpdmF0ZSBfcmVwbzogR2l0UmVwbztcbiAgICBwcml2YXRlIF9yZW1vdGVOYW1lOiBzdHJpbmcgfCB1bmRlZmluZWQ7XG4gICAgcHJpdmF0ZSBfbmFtZTogc3RyaW5nO1xuICAgIC8vZW5kcmVnaW9uXG5cblxuICAgIC8qKlxuICAgICAqIFZhbGlkYXRlcyB0aGUgc3BlY2lmaWVkIGJyYW5jaCBuYW1lXG4gICAgICogQHN0YXRpY1xuICAgICAqIEBtZXRob2RcbiAgICAgKiBAcGFyYW0gYnJhbmNoTmFtZSAtIFRoZSBuYW1lIHRvIHZhbGlkYXRlXG4gICAgICogQHJldHVybiBBIHByb21pc2UgZm9yIGEgYm9vbGVhbiB0aGF0IHdpbGwgaW5kaWNhdGUgd2hldGhlciBicmFuY2hOYW1lIGlzXG4gICAgICogdmFsaWQuICBUaGlzIHByb21pc2Ugd2lsbCBuZXZlciByZWplY3QuXG4gICAgICovXG4gICAgcHVibGljIHN0YXRpYyBpc1ZhbGlkQnJhbmNoTmFtZShicmFuY2hOYW1lOiBzdHJpbmcpOiBQcm9taXNlPGJvb2xlYW4+XG4gICAge1xuICAgICAgICAvLyBBIEdpdCBicmFuY2ggbmFtZSBjYW5ub3Q6XG4gICAgICAgIC8vIC0gSGF2ZSBhIHBhdGggY29tcG9uZW50IHRoYXQgYmVnaW5zIHdpdGggXCIuXCJcbiAgICAgICAgLy8gLSBIYXZlIGEgZG91YmxlIGRvdCBcIuKAplwiXG4gICAgICAgIC8vIC0gSGF2ZSBhbiBBU0NJSSBjb250cm9sIGNoYXJhY3RlciwgXCJ+XCIsIFwiXlwiLCBcIjpcIiBvciBTUCwgYW55d2hlcmUuXG4gICAgICAgIC8vIC0gRW5kIHdpdGggYSBcIi9cIlxuICAgICAgICAvLyAtIEVuZCB3aXRoIFwiLmxvY2tcIlxuICAgICAgICAvLyAtIENvbnRhaW4gYSBcIlxcXCIgKGJhY2tzbGFzaClcbiAgICAgICAgLy9cbiAgICAgICAgLy8gV2UgY291bGQgY2hlY2sgZm9yIHRoZSBhYm92ZSBvdXJzZWx2ZXMsIG9yIGp1c3QgYXNrIEdpdCB0byB2YWxpZGF0ZVxuICAgICAgICAvLyBicmFuY2hOYW1lIHVzaW5nIHRoZSBjaGVjay1yZWYtZm9ybWF0IGNvbW1hbmQuXG4gICAgICAgIC8vIFRoZSBmb2xsb3dpbmcgY29tbWFuZCByZXR1cm5zIDAgaWYgaXQgaXMgYSB2YWxpZCBuYW1lLlxuICAgICAgICAvLyBnaXQgY2hlY2stcmVmLWZvcm1hdCAtLWFsbG93LW9uZWxldmVsIFwiZm9vYmFyXFxsb2NrXCJcbiAgICAgICAgLy8gKHJldHVybnMgMSBiZWNhdXNlIGJhY2tzbGFzaCBpcyBpbnZhbGlkKVxuXG4gICAgICAgIHJldHVybiBzcGF3bihcImdpdFwiLCBbXCJjaGVjay1yZWYtZm9ybWF0XCIsIFwiLS1hbGxvdy1vbmVsZXZlbFwiLCBicmFuY2hOYW1lXSlcbiAgICAgICAgLnRoZW4oKCkgPT4ge1xuICAgICAgICAgICAgLy8gRXhpdCBjb2RlID09PSAwIG1lYW5zIGJyYW5jaE5hbWUgaXMgdmFsaWQuXG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfSlcbiAgICAgICAgLmNhdGNoKCgpID0+IHtcbiAgICAgICAgICAgIC8vIEV4aXQgY29kZSAhPT0gMCBtZWFucyBicmFuY2hOYW1lIGlzIGludmFsaWQuXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH0pO1xuICAgIH1cblxuXG4gICAgLyoqXG4gICAgICogQ3JlYXRlcyBhIEdpdEJyYW5jaFxuICAgICAqIEBzdGF0aWNcbiAgICAgKiBAbWV0aG9kXG4gICAgICogQHBhcmFtIHJlcG8gLSBUaGUgcmVwbyBhc3NvY2lhdGVkIHdpdGggdGhlIGJyYW5jaFxuICAgICAqIEBwYXJhbSBicmFuY2hOYW1lIC0gVGhlIG5hbWUgb2YgdGhlIGJyYW5jaFxuICAgICAqIEBwYXJhbSByZW1vdGVOYW1lIC0gVGhlIHJlbW90ZSBuYW1lIChpZiBhIHJlbW90ZSBicmFuY2gpXG4gICAgICogQHJldHVybiBBIFByb21pc2UgZm9yIHRoZSBuZXdseSBjcmVhdGVkIEdpdEJyYW5jaCBpbnN0YW5jZS4gIFRoaXMgUHJvbWlzZVxuICAgICAqIHdpbGwgYmUgcmVzb2x2ZWQgd2l0aCB1bmRlZmluZWQgaWYgdGhlIHNwZWNpZmllZCBicmFuY2ggbmFtZSBpcyBpbnZhbGlkLlxuICAgICAqL1xuICAgIHB1YmxpYyBzdGF0aWMgYXN5bmMgY3JlYXRlKHJlcG86IEdpdFJlcG8sIGJyYW5jaE5hbWU6IHN0cmluZywgcmVtb3RlTmFtZT86IHN0cmluZyk6IFByb21pc2U8R2l0QnJhbmNoPlxuICAgIHtcbiAgICAgICAgY29uc3QgdmFsaWRhdG9yID0gbmV3IFZhbGlkYXRvcjxzdHJpbmc+KFt0aGlzLmlzVmFsaWRCcmFuY2hOYW1lXSk7XG4gICAgICAgIGlmICghIGF3YWl0IHZhbGlkYXRvci5pc1ZhbGlkKGJyYW5jaE5hbWUpKVxuICAgICAgICB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYENhbm5vdCBjcmVhdGUgR2l0QnJhbmNoIGluc3RhbmNlIGZyb20gaW52YWxpZCBicmFuY2ggbmFtZSAke2JyYW5jaE5hbWV9LmApO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIG5ldyBHaXRCcmFuY2gocmVwbywgYnJhbmNoTmFtZSwgcmVtb3RlTmFtZSk7XG4gICAgfVxuXG5cbiAgICAvKipcbiAgICAgKiBFbnVtZXJhdGVzIHRoZSBicmFuY2hlcyB0aGF0IGV4aXN0IHdpdGhpbiB0aGUgc3BlY2lmaWVkIHJlcG8uXG4gICAgICogQHN0YXRpY1xuICAgICAqIEBtZXRob2RcbiAgICAgKiBAcGFyYW0gcmVwbyAtIFRoZSByZXBvIGluIHdoaWNoIHRoZSBicmFuY2hlcyBhcmUgdG8gYmUgZW51bWVyYXRlZFxuICAgICAqIEByZXR1cm4gQSBQcm9taXNlIGZvciBhbiBhcnJheSBvZiBicmFuY2hlcyBpbiB0aGUgc3BlY2lmaWVkIHJlcG9cbiAgICAgKi9cbiAgICBwdWJsaWMgc3RhdGljIGFzeW5jIGVudW1lcmF0ZUdpdFJlcG9CcmFuY2hlcyhyZXBvOiBHaXRSZXBvKTogUHJvbWlzZTxBcnJheTxHaXRCcmFuY2g+PlxuICAgIHtcbiAgICAgICAgY29uc3Qgc3Rkb3V0ID0gYXdhaXQgc3Bhd24oXCJnaXRcIiwgW1wiYnJhbmNoXCIsIFwiLWFcIl0sIHJlcG8uZGlyZWN0b3J5LnRvU3RyaW5nKCkpO1xuXG4gICAgICAgIHJldHVybiBfLmNoYWluKHN0ZG91dC5zcGxpdChcIlxcblwiKSlcbiAgICAgICAgLy8gR2V0IHJpZCBvZiBsZWFkaW5nIGFuZCB0cmFpbGluZyB3aGl0ZXNwYWNlXG4gICAgICAgIC5tYXAoY3VyTGluZSA9PiBjdXJMaW5lLnRyaW0oKSlcbiAgICAgICAgLy8gUmVwbGFjZSB0aGUgXCIqIFwiIHRoYXQgcHJlY2VkZXMgdGhlIGN1cnJlbnQgd29ya2luZyBicmFuY2hcbiAgICAgICAgLm1hcChjdXJMaW5lID0+IGN1ckxpbmUucmVwbGFjZSgvXlxcKlxccysvLCBcIlwiKSlcbiAgICAgICAgLy8gRmlsdGVyIG91dCB0aGUgbGluZSB0aGF0IGxvb2tzIGxpa2U6IHJlbW90ZXMvb3JpZ2luL0hFQUQgLT4gb3JpZ2luL21hc3RlclxuICAgICAgICAuZmlsdGVyKGN1ckxpbmUgPT4gIS9eW1xcdy9dK1xcL0hFQURcXHMrLT5cXHMrW1xcdy9dKyQvLnRlc3QoY3VyTGluZSkpXG4gICAgICAgIC8vIEdldCByaWQgb2YgbGVhZGluZyBhbmQgdHJhaWxpbmcgd2hpdGVzcGFjZVxuICAgICAgICAubWFwKGN1ckxpbmUgPT4gY3VyTGluZS50cmltKCkpXG4gICAgICAgIC8vIENyZWF0ZSBhbiBhcnJheSBvZiBHaXRCcmFuY2ggb2JqZWN0c1xuICAgICAgICAubWFwKChsb25nTmFtZSk6IEdpdEJyYW5jaCA9PiB7XG4gICAgICAgICAgICBjb25zdCByZWdleFJlc3VsdHMgPSBHaXRCcmFuY2guc3RyUGFyc2VyUmVnZXguZXhlYyhsb25nTmFtZSk7XG4gICAgICAgICAgICBpZiAoIXJlZ2V4UmVzdWx0cylcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYEVycm9yOiBCcmFuY2ggXCIke2xvbmdOYW1lfVwiIGNvdWxkIG5vdCBiZSBwYXJzZWQgYnkgZW51bWVyYXRlR2l0UmVwb0JyYW5jaGVzKCkuYCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGNvbnN0IHJlbW90ZU5hbWUgPSByZWdleFJlc3VsdHNbMl07XG4gICAgICAgICAgICBjb25zdCBicmFuY2hOYW1lID0gcmVnZXhSZXN1bHRzWzNdO1xuXG4gICAgICAgICAgICAvLyBOb3RlOiBCZWNhdXNlIHRoZSBicmFuY2ggbmFtZXMgYXJlIGNvbWluZyBmcm9tIEdpdCAoYW5kIG5vdCBhXG4gICAgICAgICAgICAvLyB1c2VyKSB0aGUgYnJhbmNoIG5hbWVzIGRvIG5vdCBoYXZlIHRvIGJlIHZhbGlkYXRlZCBhcyBpcyBkb25lIGluXG4gICAgICAgICAgICAvLyBHaXRCcmFuY2guY3JlYXRlKCksIHdoaWNoIHVzZXMgdXNlciBkYXRhLlxuXG4gICAgICAgICAgICByZXR1cm4gbmV3IEdpdEJyYW5jaChyZXBvLCBicmFuY2hOYW1lLCByZW1vdGVOYW1lKTtcbiAgICAgICAgfSlcbiAgICAgICAgLnZhbHVlKCk7XG4gICAgfVxuXG5cbiAgICAvKipcbiAgICAgKiBDb25zdHJ1Y3RzIGEgbmV3IEdpdEJyYW5jaC5cbiAgICAgKlxuICAgICAqIEBwYXJhbSByZXBvIC0gVGhlIHJlcG8gdGhlIGJyYW5jaCBzaG91bGQgYmUgYXNzb2NpYXRlZCB3aXRoXG4gICAgICogQHBhcmFtIGJyYW5jaE5hbWUgLSBUaGUgYnJhbmNoIG5hbWVcbiAgICAgKiBAcGFyYW0gcmVtb3RlTmFtZSAtIFRoZSByZW1vdGUgbmFtZSAoaWYgdGhlIGJyYW5jaCBpcyBhIHJlbW90ZSBicmFuY2gpXG4gICAgICovXG4gICAgcHJpdmF0ZSBjb25zdHJ1Y3RvcihyZXBvOiBHaXRSZXBvLCBicmFuY2hOYW1lOiBzdHJpbmcsIHJlbW90ZU5hbWU/OiBzdHJpbmcpXG4gICAge1xuICAgICAgICB0aGlzLl9yZXBvID0gcmVwbztcbiAgICAgICAgdGhpcy5fbmFtZSA9IGJyYW5jaE5hbWU7XG4gICAgICAgIHRoaXMuX3JlbW90ZU5hbWUgPSByZW1vdGVOYW1lIHx8IHVuZGVmaW5lZDtcbiAgICB9XG5cblxuICAgIHB1YmxpYyBnZXQgbmFtZSgpOiBzdHJpbmdcbiAgICB7XG4gICAgICAgIHJldHVybiB0aGlzLl9uYW1lO1xuICAgIH1cbn1cbiJdfQ==
