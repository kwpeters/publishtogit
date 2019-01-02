"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
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

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9kZXBvdC9naXRIZWxwZXJzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQ0EscURBQXFEO0FBQ3JELHlCQUF5QjtBQUN6QixJQUFNLFlBQVksR0FBRyxnQkFBZ0IsQ0FBQztBQUd0Qzs7Ozs7R0FLRztBQUNILDZCQUFvQyxNQUFjO0lBRTlDLElBQU0sS0FBSyxHQUFHLE1BQU0sQ0FBQyxLQUFLLENBQUMsWUFBWSxDQUFDLENBQUM7SUFDekMsSUFBSSxDQUFDLEtBQUssRUFDVjtRQUNJLE1BQU0sSUFBSSxLQUFLLENBQUMsaURBQWlELENBQUMsQ0FBQztLQUN0RTtJQUVELE9BQU8sS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ3BCLENBQUM7QUFURCxrREFTQyIsImZpbGUiOiJkZXBvdC9naXRIZWxwZXJzLmpzIiwic291cmNlc0NvbnRlbnQiOlsiXG4vLyBBIHJlZ3VsYXIgZXhwcmVzc2lvbiB0byBtYXRjaCB2YWxpZCBHaXQgcmVwbyBVUkxzLlxuLy8gbWF0Y2hbMV06IHByb2plY3QgbmFtZVxuY29uc3QgZ2l0VXJsUmVnZXhwID0gLy4qXFwvKC4qKVxcLmdpdCQvO1xuXG5cbi8qKlxuICogRXh0cmFjdHMgdGhlIHByb2plY3QgbmFtZSBmcm9tIGEgR2l0IFVSTFxuICogQHBhcmFtIGdpdFVybCAtIFRoZSBHaXQgVVJMIGZvciBhIHJlcG9zaXRvcnlcbiAqIEByZXR1cm4gVGhlIG5hbWUgb2YgdGhlIHByb2plY3QuICBUaGlzIG1ldGhvZCB3aWxsIHRocm93IGFuIEVycm9yIGlmIHRoZVxuICogcHJvdmlkZWQgVVJMIGlzIGludmFsaWQuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnaXRVcmxUb1Byb2plY3ROYW1lKGdpdFVybDogc3RyaW5nKTogc3RyaW5nXG57XG4gICAgY29uc3QgbWF0Y2ggPSBnaXRVcmwubWF0Y2goZ2l0VXJsUmVnZXhwKTtcbiAgICBpZiAoIW1hdGNoKVxuICAgIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiVHJpZWQgdG8gZ2V0IHByb2plY3QgbmFtZSBmcm9tIGludmFsaWQgR2l0IFVSTC5cIik7XG4gICAgfVxuXG4gICAgcmV0dXJuIG1hdGNoWzFdO1xufVxuIl19
