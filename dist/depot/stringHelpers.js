"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var _ = require("lodash");
function numInitial(str, padStr) {
    if (padStr === "") {
        return 0;
    }
    var curStr = str;
    var numOccurrences = 0;
    while (_.startsWith(curStr, padStr)) {
        ++numOccurrences;
        curStr = curStr.slice(padStr.length);
    }
    return numOccurrences;
}
exports.numInitial = numInitial;
/**
 * Creates a string where each line of src is indented.
 * @param src - The string to be indented
 * @param numSpacesOrPad - The number of spaces to indent each line
 * @param skipFirstLine - If truthy, the first line will not be indented
 * @return A new string where each line is indented
 */
function indent(src, numSpacesOrPad, skipFirstLine) {
    if (skipFirstLine === void 0) { skipFirstLine = false; }
    if (numSpacesOrPad === 0) {
        return src;
    }
    else {
        // If the caller specified a string, use that as the pad.  Otherwise,
        // treat the number as the number of spaces.
        var pad_1 = typeof numSpacesOrPad === "string" ?
            numSpacesOrPad :
            _.repeat(" ", numSpacesOrPad);
        // The only way replace() will replace all instances is to use the "g"
        // flag with replace(). Use the m flag so that ^ and $ match within the
        // string.
        var replaceRegex = /^(.*?)$/gm;
        var replaceFunc = function replaceFunc(match, group1, offset) {
            // If told to skip the first line and this is the first line, skip it.
            return skipFirstLine && (offset === 0) ?
                group1 :
                pad_1 + group1;
        };
        return _.replace(src, replaceRegex, replaceFunc);
    }
}
exports.indent = indent;
function outdent(str, padStr) {
    if (padStr === void 0) { padStr = " "; }
    var lines = str.split("\n");
    var initOccurrences = _.map(lines, function (curLine) { return numInitial(curLine, padStr); });
    var numToRemove = _.min(initOccurrences);
    var numCharsToRemove = padStr.length * numToRemove;
    var resultLines = _.map(lines, function (curLine) { return curLine.slice(numCharsToRemove); });
    return resultLines.join("\n");
}
exports.outdent = outdent;
function trimBlankLines(str) {
    var BLANK_LINE_REGEX = /^\s*$/;
    var lines = str.split("\n");
    while ((lines.length > 0) &&
        BLANK_LINE_REGEX.test(lines[0])) {
        lines.shift();
    }
    while ((lines.length > 0) &&
        BLANK_LINE_REGEX.test(_.last(lines))) {
        lines.pop();
    }
    return lines.join("\n");
}
exports.trimBlankLines = trimBlankLines;
var whitespaceRegex = /\s+/g;
/**
 * Creates a new string in which all whitespace has been removed from str.
 * @param str - The original string to remove whitespace from
 * @return A new string in which all whitespace has been removed.
 */
function removeWhitespace(str) {
    return str.replace(whitespaceRegex, "");
}
exports.removeWhitespace = removeWhitespace;

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9kZXBvdC9zdHJpbmdIZWxwZXJzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsMEJBQTRCO0FBRzVCLG9CQUEyQixHQUFXLEVBQUUsTUFBYztJQUVsRCxJQUFJLE1BQU0sS0FBSyxFQUFFLEVBQ2pCO1FBQ0ksT0FBTyxDQUFDLENBQUM7S0FDWjtJQUVELElBQUksTUFBTSxHQUFHLEdBQUcsQ0FBQztJQUNqQixJQUFJLGNBQWMsR0FBRyxDQUFDLENBQUM7SUFFdkIsT0FBTyxDQUFDLENBQUMsVUFBVSxDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUMsRUFDbkM7UUFDSSxFQUFFLGNBQWMsQ0FBQztRQUNqQixNQUFNLEdBQUcsTUFBTSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUM7S0FDeEM7SUFFRCxPQUFPLGNBQWMsQ0FBQztBQUMxQixDQUFDO0FBakJELGdDQWlCQztBQUdEOzs7Ozs7R0FNRztBQUNILGdCQUNJLEdBQVcsRUFDWCxjQUErQixFQUMvQixhQUE4QjtJQUE5Qiw4QkFBQSxFQUFBLHFCQUE4QjtJQUU5QixJQUFJLGNBQWMsS0FBSyxDQUFDLEVBQUU7UUFDdEIsT0FBTyxHQUFHLENBQUM7S0FDZDtTQUVEO1FBQ0kscUVBQXFFO1FBQ3JFLDRDQUE0QztRQUM1QyxJQUFNLEtBQUcsR0FBVyxPQUFPLGNBQWMsS0FBSyxRQUFRLENBQUMsQ0FBQztZQUNwQyxjQUFjLENBQUMsQ0FBQztZQUNoQixDQUFDLENBQUMsTUFBTSxDQUFDLEdBQUcsRUFBRSxjQUFjLENBQUMsQ0FBQztRQUVsRCxzRUFBc0U7UUFDdEUsdUVBQXVFO1FBQ3ZFLFVBQVU7UUFDVixJQUFNLFlBQVksR0FBVyxXQUFXLENBQUM7UUFDekMsSUFBTSxXQUFXLEdBQUcscUJBQ2hCLEtBQVUsRUFDVixNQUFjLEVBQ2QsTUFBYztZQUVkLHNFQUFzRTtZQUN0RSxPQUFPLGFBQWEsSUFBSSxDQUFDLE1BQU0sS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUNqQyxNQUFNLENBQUMsQ0FBQztnQkFDUixLQUFHLEdBQUcsTUFBTSxDQUFDO1FBQ3hCLENBQUMsQ0FBQztRQUVGLE9BQU8sQ0FBQyxDQUFDLE9BQU8sQ0FBQyxHQUFHLEVBQUUsWUFBWSxFQUFFLFdBQVcsQ0FBQyxDQUFDO0tBQ3BEO0FBQ0wsQ0FBQztBQWpDRCx3QkFpQ0M7QUFFRCxpQkFBd0IsR0FBVyxFQUFFLE1BQW9CO0lBQXBCLHVCQUFBLEVBQUEsWUFBb0I7SUFFckQsSUFBTSxLQUFLLEdBQUcsR0FBRyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUM5QixJQUFNLGVBQWUsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLEtBQUssRUFBRSxVQUFDLE9BQU8sSUFBSyxPQUFBLFVBQVUsQ0FBQyxPQUFPLEVBQUUsTUFBTSxDQUFDLEVBQTNCLENBQTJCLENBQUMsQ0FBQztJQUMvRSxJQUFNLFdBQVcsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLGVBQWUsQ0FBQyxDQUFDO0lBQzNDLElBQU0sZ0JBQWdCLEdBQUcsTUFBTSxDQUFDLE1BQU0sR0FBRyxXQUFZLENBQUM7SUFFdEQsSUFBTSxXQUFXLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxLQUFLLEVBQUUsVUFBQyxPQUFPLElBQUssT0FBQSxPQUFPLENBQUMsS0FBSyxDQUFDLGdCQUFnQixDQUFDLEVBQS9CLENBQStCLENBQUMsQ0FBQztJQUMvRSxPQUFPLFdBQVcsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDbEMsQ0FBQztBQVRELDBCQVNDO0FBR0Qsd0JBQStCLEdBQVc7SUFFdEMsSUFBTSxnQkFBZ0IsR0FBRyxPQUFPLENBQUM7SUFDakMsSUFBTSxLQUFLLEdBQUcsR0FBRyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUU5QixPQUFPLENBQUMsS0FBSyxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUM7UUFDbkIsZ0JBQWdCLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNyQztRQUNJLEtBQUssQ0FBQyxLQUFLLEVBQUUsQ0FBQztLQUNqQjtJQUVELE9BQU8sQ0FBQyxLQUFLLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQztRQUNuQixnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUUsQ0FBQyxFQUMzQztRQUNJLEtBQUssQ0FBQyxHQUFHLEVBQUUsQ0FBQztLQUNmO0lBRUQsT0FBTyxLQUFLLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQzVCLENBQUM7QUFsQkQsd0NBa0JDO0FBR0QsSUFBTSxlQUFlLEdBQUcsTUFBTSxDQUFDO0FBRy9COzs7O0dBSUc7QUFDSCwwQkFBaUMsR0FBVztJQUV4QyxPQUFPLEdBQUcsQ0FBQyxPQUFPLENBQUMsZUFBZSxFQUFFLEVBQUUsQ0FBQyxDQUFDO0FBQzVDLENBQUM7QUFIRCw0Q0FHQyIsImZpbGUiOiJkZXBvdC9zdHJpbmdIZWxwZXJzLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0ICogYXMgXyBmcm9tIFwibG9kYXNoXCI7XG5cblxuZXhwb3J0IGZ1bmN0aW9uIG51bUluaXRpYWwoc3RyOiBzdHJpbmcsIHBhZFN0cjogc3RyaW5nKTogbnVtYmVyXG57XG4gICAgaWYgKHBhZFN0ciA9PT0gXCJcIilcbiAgICB7XG4gICAgICAgIHJldHVybiAwO1xuICAgIH1cblxuICAgIGxldCBjdXJTdHIgPSBzdHI7XG4gICAgbGV0IG51bU9jY3VycmVuY2VzID0gMDtcblxuICAgIHdoaWxlIChfLnN0YXJ0c1dpdGgoY3VyU3RyLCBwYWRTdHIpKVxuICAgIHtcbiAgICAgICAgKytudW1PY2N1cnJlbmNlcztcbiAgICAgICAgY3VyU3RyID0gY3VyU3RyLnNsaWNlKHBhZFN0ci5sZW5ndGgpO1xuICAgIH1cblxuICAgIHJldHVybiBudW1PY2N1cnJlbmNlcztcbn1cblxuXG4vKipcbiAqIENyZWF0ZXMgYSBzdHJpbmcgd2hlcmUgZWFjaCBsaW5lIG9mIHNyYyBpcyBpbmRlbnRlZC5cbiAqIEBwYXJhbSBzcmMgLSBUaGUgc3RyaW5nIHRvIGJlIGluZGVudGVkXG4gKiBAcGFyYW0gbnVtU3BhY2VzT3JQYWQgLSBUaGUgbnVtYmVyIG9mIHNwYWNlcyB0byBpbmRlbnQgZWFjaCBsaW5lXG4gKiBAcGFyYW0gc2tpcEZpcnN0TGluZSAtIElmIHRydXRoeSwgdGhlIGZpcnN0IGxpbmUgd2lsbCBub3QgYmUgaW5kZW50ZWRcbiAqIEByZXR1cm4gQSBuZXcgc3RyaW5nIHdoZXJlIGVhY2ggbGluZSBpcyBpbmRlbnRlZFxuICovXG5leHBvcnQgZnVuY3Rpb24gaW5kZW50KFxuICAgIHNyYzogc3RyaW5nLFxuICAgIG51bVNwYWNlc09yUGFkOiBudW1iZXIgfCBzdHJpbmcsXG4gICAgc2tpcEZpcnN0TGluZTogYm9vbGVhbiA9IGZhbHNlXG4pOiBzdHJpbmcge1xuICAgIGlmIChudW1TcGFjZXNPclBhZCA9PT0gMCkge1xuICAgICAgICByZXR1cm4gc3JjO1xuICAgIH1cbiAgICBlbHNlXG4gICAge1xuICAgICAgICAvLyBJZiB0aGUgY2FsbGVyIHNwZWNpZmllZCBhIHN0cmluZywgdXNlIHRoYXQgYXMgdGhlIHBhZC4gIE90aGVyd2lzZSxcbiAgICAgICAgLy8gdHJlYXQgdGhlIG51bWJlciBhcyB0aGUgbnVtYmVyIG9mIHNwYWNlcy5cbiAgICAgICAgY29uc3QgcGFkOiBzdHJpbmcgPSB0eXBlb2YgbnVtU3BhY2VzT3JQYWQgPT09IFwic3RyaW5nXCIgP1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG51bVNwYWNlc09yUGFkIDpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBfLnJlcGVhdChcIiBcIiwgbnVtU3BhY2VzT3JQYWQpO1xuXG4gICAgICAgIC8vIFRoZSBvbmx5IHdheSByZXBsYWNlKCkgd2lsbCByZXBsYWNlIGFsbCBpbnN0YW5jZXMgaXMgdG8gdXNlIHRoZSBcImdcIlxuICAgICAgICAvLyBmbGFnIHdpdGggcmVwbGFjZSgpLiBVc2UgdGhlIG0gZmxhZyBzbyB0aGF0IF4gYW5kICQgbWF0Y2ggd2l0aGluIHRoZVxuICAgICAgICAvLyBzdHJpbmcuXG4gICAgICAgIGNvbnN0IHJlcGxhY2VSZWdleDogUmVnRXhwID0gL14oLio/KSQvZ207XG4gICAgICAgIGNvbnN0IHJlcGxhY2VGdW5jID0gZnVuY3Rpb24gcmVwbGFjZUZ1bmMoXG4gICAgICAgICAgICBtYXRjaDogYW55LFxuICAgICAgICAgICAgZ3JvdXAxOiBzdHJpbmcsXG4gICAgICAgICAgICBvZmZzZXQ6IG51bWJlclxuICAgICAgICApOiBzdHJpbmcge1xuICAgICAgICAgICAgLy8gSWYgdG9sZCB0byBza2lwIHRoZSBmaXJzdCBsaW5lIGFuZCB0aGlzIGlzIHRoZSBmaXJzdCBsaW5lLCBza2lwIGl0LlxuICAgICAgICAgICAgcmV0dXJuIHNraXBGaXJzdExpbmUgJiYgKG9mZnNldCA9PT0gMCkgP1xuICAgICAgICAgICAgICAgICAgIGdyb3VwMSA6XG4gICAgICAgICAgICAgICAgICAgcGFkICsgZ3JvdXAxO1xuICAgICAgICB9O1xuXG4gICAgICAgIHJldHVybiBfLnJlcGxhY2Uoc3JjLCByZXBsYWNlUmVnZXgsIHJlcGxhY2VGdW5jKTtcbiAgICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBvdXRkZW50KHN0cjogc3RyaW5nLCBwYWRTdHI6IHN0cmluZyA9IFwiIFwiKTogc3RyaW5nXG57XG4gICAgY29uc3QgbGluZXMgPSBzdHIuc3BsaXQoXCJcXG5cIik7XG4gICAgY29uc3QgaW5pdE9jY3VycmVuY2VzID0gXy5tYXAobGluZXMsIChjdXJMaW5lKSA9PiBudW1Jbml0aWFsKGN1ckxpbmUsIHBhZFN0cikpO1xuICAgIGNvbnN0IG51bVRvUmVtb3ZlID0gXy5taW4oaW5pdE9jY3VycmVuY2VzKTtcbiAgICBjb25zdCBudW1DaGFyc1RvUmVtb3ZlID0gcGFkU3RyLmxlbmd0aCAqIG51bVRvUmVtb3ZlITtcblxuICAgIGNvbnN0IHJlc3VsdExpbmVzID0gXy5tYXAobGluZXMsIChjdXJMaW5lKSA9PiBjdXJMaW5lLnNsaWNlKG51bUNoYXJzVG9SZW1vdmUpKTtcbiAgICByZXR1cm4gcmVzdWx0TGluZXMuam9pbihcIlxcblwiKTtcbn1cblxuXG5leHBvcnQgZnVuY3Rpb24gdHJpbUJsYW5rTGluZXMoc3RyOiBzdHJpbmcpOiBzdHJpbmdcbntcbiAgICBjb25zdCBCTEFOS19MSU5FX1JFR0VYID0gL15cXHMqJC87XG4gICAgY29uc3QgbGluZXMgPSBzdHIuc3BsaXQoXCJcXG5cIik7XG5cbiAgICB3aGlsZSAoKGxpbmVzLmxlbmd0aCA+IDApICYmXG4gICAgICAgICAgQkxBTktfTElORV9SRUdFWC50ZXN0KGxpbmVzWzBdKSlcbiAgICB7XG4gICAgICAgIGxpbmVzLnNoaWZ0KCk7XG4gICAgfVxuXG4gICAgd2hpbGUgKChsaW5lcy5sZW5ndGggPiAwKSAmJlxuICAgICAgICAgIEJMQU5LX0xJTkVfUkVHRVgudGVzdChfLmxhc3QobGluZXMpISkpXG4gICAge1xuICAgICAgICBsaW5lcy5wb3AoKTtcbiAgICB9XG5cbiAgICByZXR1cm4gbGluZXMuam9pbihcIlxcblwiKTtcbn1cblxuXG5jb25zdCB3aGl0ZXNwYWNlUmVnZXggPSAvXFxzKy9nO1xuXG5cbi8qKlxuICogQ3JlYXRlcyBhIG5ldyBzdHJpbmcgaW4gd2hpY2ggYWxsIHdoaXRlc3BhY2UgaGFzIGJlZW4gcmVtb3ZlZCBmcm9tIHN0ci5cbiAqIEBwYXJhbSBzdHIgLSBUaGUgb3JpZ2luYWwgc3RyaW5nIHRvIHJlbW92ZSB3aGl0ZXNwYWNlIGZyb21cbiAqIEByZXR1cm4gQSBuZXcgc3RyaW5nIGluIHdoaWNoIGFsbCB3aGl0ZXNwYWNlIGhhcyBiZWVuIHJlbW92ZWQuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiByZW1vdmVXaGl0ZXNwYWNlKHN0cjogc3RyaW5nKTogc3RyaW5nXG57XG4gICAgcmV0dXJuIHN0ci5yZXBsYWNlKHdoaXRlc3BhY2VSZWdleCwgXCJcIik7XG59XG4iXX0=
