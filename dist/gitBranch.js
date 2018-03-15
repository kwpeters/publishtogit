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
var spawn_1 = require("./spawn");
var validator_1 = require("./validator");
var _ = require("lodash");
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
        return spawn_1.spawn("git", ["check-ref-format", "--allow-onelevel", branchName])
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
                    case 0: return [4 /*yield*/, spawn_1.spawn("git", ["branch", "-a"], repo.directory.toString())];
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

//# sourceMappingURL=data:application/json;charset=utf8;base64,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LFNBQVMsQ0FBQyxjQUFjLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDO2dDQUM3RCxFQUFFLENBQUMsQ0FBQyxDQUFDLFlBQVksQ0FBQyxDQUNsQixDQUFDO29DQUNHLE1BQU0sSUFBSSxLQUFLLENBQUMscUJBQWtCLFFBQVEsMERBQXNELENBQUMsQ0FBQztnQ0FDdEcsQ0FBQztnQ0FFRCxJQUFNLFVBQVUsR0FBRyxZQUFZLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0NBQ25DLElBQU0sVUFBVSxHQUFHLFlBQVksQ0FBQyxDQUFDLENBQUMsQ0FBQztnQ0FFbkMsZ0VBQWdFO2dDQUNoRSxtRUFBbUU7Z0NBQ25FLDRDQUE0QztnQ0FFNUMsTUFBTSxDQUFDLElBQUksU0FBUyxDQUFDLElBQUksRUFBRSxVQUFVLEVBQUUsVUFBVSxDQUFDLENBQUM7NEJBQ3ZELENBQUMsQ0FBQztpQ0FDRCxLQUFLLEVBQUUsRUFBQzs7OztLQUNaO0lBa0JELHNCQUFXLDJCQUFJO2FBQWY7WUFFSSxNQUFNLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQztRQUN0QixDQUFDOzs7T0FBQTtJQXpJRCw0QkFBNEI7SUFFNUIseUVBQXlFO0lBQ3pFLE9BQU87SUFDUCwwQ0FBMEM7SUFDMUMsdURBQXVEO0lBQ3ZELG1EQUFtRDtJQUNuRCxtREFBbUQ7SUFDcEMsd0JBQWMsR0FBVywrQkFBK0IsQ0FBQztJQWtJNUUsZ0JBQUM7Q0E1SUQsQUE0SUMsSUFBQTtBQTVJWSw4QkFBUyIsImZpbGUiOiJnaXRCcmFuY2guanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge0dpdFJlcG99IGZyb20gXCIuL2dpdFJlcG9cIjtcbmltcG9ydCB7c3Bhd259IGZyb20gXCIuL3NwYXduXCI7XG5pbXBvcnQge1ZhbGlkYXRvcn0gZnJvbSBcIi4vdmFsaWRhdG9yXCI7XG5pbXBvcnQgKiBhcyBfIGZyb20gXCJsb2Rhc2hcIjtcblxuXG5leHBvcnQgY2xhc3MgR2l0QnJhbmNoXG57XG4gICAgLy9yZWdpb24gU3RhdGljIERhdGEgTWVtYmVyc1xuXG4gICAgLy8gVGhlIHJlZ2V4IG5lZWRlZCB0byBwYXJzZSB0aGUgbG9uZyBuYW1lIHN0cmluZ3MgcHJpbnRlZCBieSBcImdpdCBicmFuY2hcbiAgICAvLyAtYVwiLlxuICAgIC8vIElmIGdpdmVuIHJlbW90ZXMvcmVtb3RlbmFtZS9icmFuY2gvbmFtZVxuICAgIC8vIGdyb3VwIDE6IFwicmVtb3Rlcy9yZW1vdGVuYW1lXCIgIChub3QgYWxsIHRoYXQgdXNlZnVsKVxuICAgIC8vIGdyb3VwIDI6IFwicmVtb3RlbmFtZVwiICAgICAgICAgICh0aGUgcmVtb3RlIG5hbWUpXG4gICAgLy8gZ3JvdXAgMzogXCJicmFuY2gvbmFtZVwiICAgICAgICAgKHRoZSBicmFuY2ggbmFtZSlcbiAgICBwcml2YXRlIHN0YXRpYyBzdHJQYXJzZXJSZWdleDogUmVnRXhwID0gL14ocmVtb3Rlc1xcLyhbXFx3Li1dKylcXC8pPyguKikkLztcblxuICAgIC8vZW5kcmVnaW9uXG5cblxuICAgIC8vcmVnaW9uIERhdGEgTWVtYmVyc1xuICAgIHByaXZhdGUgX3JlcG86IEdpdFJlcG87XG4gICAgcHJpdmF0ZSBfcmVtb3RlTmFtZTogc3RyaW5nIHwgdW5kZWZpbmVkO1xuICAgIHByaXZhdGUgX25hbWU6IHN0cmluZztcbiAgICAvL2VuZHJlZ2lvblxuXG5cbiAgICAvKipcbiAgICAgKiBWYWxpZGF0ZXMgdGhlIHNwZWNpZmllZCBicmFuY2ggbmFtZVxuICAgICAqIEBzdGF0aWNcbiAgICAgKiBAbWV0aG9kXG4gICAgICogQHBhcmFtIGJyYW5jaE5hbWUgLSBUaGUgbmFtZSB0byB2YWxpZGF0ZVxuICAgICAqIEByZXR1cm4gQSBwcm9taXNlIGZvciBhIGJvb2xlYW4gdGhhdCB3aWxsIGluZGljYXRlIHdoZXRoZXIgYnJhbmNoTmFtZSBpc1xuICAgICAqIHZhbGlkLiAgVGhpcyBwcm9taXNlIHdpbGwgbmV2ZXIgcmVqZWN0LlxuICAgICAqL1xuICAgIHB1YmxpYyBzdGF0aWMgaXNWYWxpZEJyYW5jaE5hbWUoYnJhbmNoTmFtZTogc3RyaW5nKTogUHJvbWlzZTxib29sZWFuPlxuICAgIHtcbiAgICAgICAgLy8gQSBHaXQgYnJhbmNoIG5hbWUgY2Fubm90OlxuICAgICAgICAvLyAtIEhhdmUgYSBwYXRoIGNvbXBvbmVudCB0aGF0IGJlZ2lucyB3aXRoIFwiLlwiXG4gICAgICAgIC8vIC0gSGF2ZSBhIGRvdWJsZSBkb3QgXCLigKZcIlxuICAgICAgICAvLyAtIEhhdmUgYW4gQVNDSUkgY29udHJvbCBjaGFyYWN0ZXIsIFwiflwiLCBcIl5cIiwgXCI6XCIgb3IgU1AsIGFueXdoZXJlLlxuICAgICAgICAvLyAtIEVuZCB3aXRoIGEgXCIvXCJcbiAgICAgICAgLy8gLSBFbmQgd2l0aCBcIi5sb2NrXCJcbiAgICAgICAgLy8gLSBDb250YWluIGEgXCJcXFwiIChiYWNrc2xhc2gpXG4gICAgICAgIC8vXG4gICAgICAgIC8vIFdlIGNvdWxkIGNoZWNrIGZvciB0aGUgYWJvdmUgb3Vyc2VsdmVzLCBvciBqdXN0IGFzayBHaXQgdG8gdmFsaWRhdGVcbiAgICAgICAgLy8gYnJhbmNoTmFtZSB1c2luZyB0aGUgY2hlY2stcmVmLWZvcm1hdCBjb21tYW5kLlxuICAgICAgICAvLyBUaGUgZm9sbG93aW5nIGNvbW1hbmQgcmV0dXJucyAwIGlmIGl0IGlzIGEgdmFsaWQgbmFtZS5cbiAgICAgICAgLy8gZ2l0IGNoZWNrLXJlZi1mb3JtYXQgLS1hbGxvdy1vbmVsZXZlbCBcImZvb2JhclxcbG9ja1wiXG4gICAgICAgIC8vIChyZXR1cm5zIDEgYmVjYXVzZSBiYWNrc2xhc2ggaXMgaW52YWxpZClcblxuICAgICAgICByZXR1cm4gc3Bhd24oXCJnaXRcIiwgW1wiY2hlY2stcmVmLWZvcm1hdFwiLCBcIi0tYWxsb3ctb25lbGV2ZWxcIiwgYnJhbmNoTmFtZV0pXG4gICAgICAgIC50aGVuKCgpID0+IHtcbiAgICAgICAgICAgIC8vIEV4aXQgY29kZSA9PT0gMCBtZWFucyBicmFuY2hOYW1lIGlzIHZhbGlkLlxuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH0pXG4gICAgICAgIC5jYXRjaCgoKSA9PiB7XG4gICAgICAgICAgICAvLyBFeGl0IGNvZGUgIT09IDAgbWVhbnMgYnJhbmNoTmFtZSBpcyBpbnZhbGlkLlxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9KTtcbiAgICB9XG5cblxuICAgIC8qKlxuICAgICAqIENyZWF0ZXMgYSBHaXRCcmFuY2hcbiAgICAgKiBAc3RhdGljXG4gICAgICogQG1ldGhvZFxuICAgICAqIEBwYXJhbSByZXBvIC0gVGhlIHJlcG8gYXNzb2NpYXRlZCB3aXRoIHRoZSBicmFuY2hcbiAgICAgKiBAcGFyYW0gYnJhbmNoTmFtZSAtIFRoZSBuYW1lIG9mIHRoZSBicmFuY2hcbiAgICAgKiBAcGFyYW0gcmVtb3RlTmFtZSAtIFRoZSByZW1vdGUgbmFtZSAoaWYgYSByZW1vdGUgYnJhbmNoKVxuICAgICAqIEByZXR1cm4gQSBQcm9taXNlIGZvciB0aGUgbmV3bHkgY3JlYXRlZCBHaXRCcmFuY2ggaW5zdGFuY2UuICBUaGlzIFByb21pc2VcbiAgICAgKiB3aWxsIGJlIHJlc29sdmVkIHdpdGggdW5kZWZpbmVkIGlmIHRoZSBzcGVjaWZpZWQgYnJhbmNoIG5hbWUgaXMgaW52YWxpZC5cbiAgICAgKi9cbiAgICBwdWJsaWMgc3RhdGljIGFzeW5jIGNyZWF0ZShyZXBvOiBHaXRSZXBvLCBicmFuY2hOYW1lOiBzdHJpbmcsIHJlbW90ZU5hbWU/OiBzdHJpbmcpOiBQcm9taXNlPEdpdEJyYW5jaD5cbiAgICB7XG4gICAgICAgIGNvbnN0IHZhbGlkYXRvciA9IG5ldyBWYWxpZGF0b3I8c3RyaW5nPihbdGhpcy5pc1ZhbGlkQnJhbmNoTmFtZV0pO1xuICAgICAgICBpZiAoISBhd2FpdCB2YWxpZGF0b3IuaXNWYWxpZChicmFuY2hOYW1lKSlcbiAgICAgICAge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBDYW5ub3QgY3JlYXRlIEdpdEJyYW5jaCBpbnN0YW5jZSBmcm9tIGludmFsaWQgYnJhbmNoIG5hbWUgJHticmFuY2hOYW1lfS5gKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBuZXcgR2l0QnJhbmNoKHJlcG8sIGJyYW5jaE5hbWUsIHJlbW90ZU5hbWUpO1xuICAgIH1cblxuXG4gICAgLyoqXG4gICAgICogRW51bWVyYXRlcyB0aGUgYnJhbmNoZXMgdGhhdCBleGlzdCB3aXRoaW4gdGhlIHNwZWNpZmllZCByZXBvLlxuICAgICAqIEBzdGF0aWNcbiAgICAgKiBAbWV0aG9kXG4gICAgICogQHBhcmFtIHJlcG8gLSBUaGUgcmVwbyBpbiB3aGljaCB0aGUgYnJhbmNoZXMgYXJlIHRvIGJlIGVudW1lcmF0ZWRcbiAgICAgKiBAcmV0dXJuIEEgUHJvbWlzZSBmb3IgYW4gYXJyYXkgb2YgYnJhbmNoZXMgaW4gdGhlIHNwZWNpZmllZCByZXBvXG4gICAgICovXG4gICAgcHVibGljIHN0YXRpYyBhc3luYyBlbnVtZXJhdGVHaXRSZXBvQnJhbmNoZXMocmVwbzogR2l0UmVwbyk6IFByb21pc2U8QXJyYXk8R2l0QnJhbmNoPj5cbiAgICB7XG4gICAgICAgIGNvbnN0IHN0ZG91dCA9IGF3YWl0IHNwYXduKFwiZ2l0XCIsIFtcImJyYW5jaFwiLCBcIi1hXCJdLCByZXBvLmRpcmVjdG9yeS50b1N0cmluZygpKTtcblxuICAgICAgICByZXR1cm4gXy5jaGFpbihzdGRvdXQuc3BsaXQoXCJcXG5cIikpXG4gICAgICAgIC8vIEdldCByaWQgb2YgbGVhZGluZyBhbmQgdHJhaWxpbmcgd2hpdGVzcGFjZVxuICAgICAgICAubWFwKGN1ckxpbmUgPT4gY3VyTGluZS50cmltKCkpXG4gICAgICAgIC8vIFJlcGxhY2UgdGhlIFwiKiBcIiB0aGF0IHByZWNlZGVzIHRoZSBjdXJyZW50IHdvcmtpbmcgYnJhbmNoXG4gICAgICAgIC5tYXAoY3VyTGluZSA9PiBjdXJMaW5lLnJlcGxhY2UoL15cXCpcXHMrLywgXCJcIikpXG4gICAgICAgIC8vIEZpbHRlciBvdXQgdGhlIGxpbmUgdGhhdCBsb29rcyBsaWtlOiByZW1vdGVzL29yaWdpbi9IRUFEIC0+IG9yaWdpbi9tYXN0ZXJcbiAgICAgICAgLmZpbHRlcihjdXJMaW5lID0+ICEvXltcXHcvXStcXC9IRUFEXFxzKy0+XFxzK1tcXHcvXSskLy50ZXN0KGN1ckxpbmUpKVxuICAgICAgICAvLyBHZXQgcmlkIG9mIGxlYWRpbmcgYW5kIHRyYWlsaW5nIHdoaXRlc3BhY2VcbiAgICAgICAgLm1hcChjdXJMaW5lID0+IGN1ckxpbmUudHJpbSgpKVxuICAgICAgICAvLyBDcmVhdGUgYW4gYXJyYXkgb2YgR2l0QnJhbmNoIG9iamVjdHNcbiAgICAgICAgLm1hcCgobG9uZ05hbWUpOiBHaXRCcmFuY2ggPT4ge1xuICAgICAgICAgICAgY29uc3QgcmVnZXhSZXN1bHRzID0gR2l0QnJhbmNoLnN0clBhcnNlclJlZ2V4LmV4ZWMobG9uZ05hbWUpO1xuICAgICAgICAgICAgaWYgKCFyZWdleFJlc3VsdHMpXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBFcnJvcjogQnJhbmNoIFwiJHtsb25nTmFtZX1cIiBjb3VsZCBub3QgYmUgcGFyc2VkIGJ5IGVudW1lcmF0ZUdpdFJlcG9CcmFuY2hlcygpLmApO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBjb25zdCByZW1vdGVOYW1lID0gcmVnZXhSZXN1bHRzWzJdO1xuICAgICAgICAgICAgY29uc3QgYnJhbmNoTmFtZSA9IHJlZ2V4UmVzdWx0c1szXTtcblxuICAgICAgICAgICAgLy8gTm90ZTogQmVjYXVzZSB0aGUgYnJhbmNoIG5hbWVzIGFyZSBjb21pbmcgZnJvbSBHaXQgKGFuZCBub3QgYVxuICAgICAgICAgICAgLy8gdXNlcikgdGhlIGJyYW5jaCBuYW1lcyBkbyBub3QgaGF2ZSB0byBiZSB2YWxpZGF0ZWQgYXMgaXMgZG9uZSBpblxuICAgICAgICAgICAgLy8gR2l0QnJhbmNoLmNyZWF0ZSgpLCB3aGljaCB1c2VzIHVzZXIgZGF0YS5cblxuICAgICAgICAgICAgcmV0dXJuIG5ldyBHaXRCcmFuY2gocmVwbywgYnJhbmNoTmFtZSwgcmVtb3RlTmFtZSk7XG4gICAgICAgIH0pXG4gICAgICAgIC52YWx1ZSgpO1xuICAgIH1cblxuXG4gICAgLyoqXG4gICAgICogQ29uc3RydWN0cyBhIG5ldyBHaXRCcmFuY2guXG4gICAgICpcbiAgICAgKiBAcGFyYW0gcmVwbyAtIFRoZSByZXBvIHRoZSBicmFuY2ggc2hvdWxkIGJlIGFzc29jaWF0ZWQgd2l0aFxuICAgICAqIEBwYXJhbSBicmFuY2hOYW1lIC0gVGhlIGJyYW5jaCBuYW1lXG4gICAgICogQHBhcmFtIHJlbW90ZU5hbWUgLSBUaGUgcmVtb3RlIG5hbWUgKGlmIHRoZSBicmFuY2ggaXMgYSByZW1vdGUgYnJhbmNoKVxuICAgICAqL1xuICAgIHByaXZhdGUgY29uc3RydWN0b3IocmVwbzogR2l0UmVwbywgYnJhbmNoTmFtZTogc3RyaW5nLCByZW1vdGVOYW1lPzogc3RyaW5nKVxuICAgIHtcbiAgICAgICAgdGhpcy5fcmVwbyA9IHJlcG87XG4gICAgICAgIHRoaXMuX25hbWUgPSBicmFuY2hOYW1lO1xuICAgICAgICB0aGlzLl9yZW1vdGVOYW1lID0gcmVtb3RlTmFtZSB8fCB1bmRlZmluZWQ7XG4gICAgfVxuXG5cbiAgICBwdWJsaWMgZ2V0IG5hbWUoKTogc3RyaW5nXG4gICAge1xuICAgICAgICByZXR1cm4gdGhpcy5fbmFtZTtcbiAgICB9XG59XG4iXX0=
