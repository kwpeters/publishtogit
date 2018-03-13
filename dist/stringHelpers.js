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

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9zdHJpbmdIZWxwZXJzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsMEJBQTRCO0FBRzVCLG9CQUEyQixHQUFXLEVBQUUsTUFBYztJQUVsRCxFQUFFLENBQUMsQ0FBQyxNQUFNLEtBQUssRUFBRSxDQUFDLENBQ2xCLENBQUM7UUFDRyxNQUFNLENBQUMsQ0FBQyxDQUFDO0lBQ2IsQ0FBQztJQUVELElBQUksTUFBTSxHQUFHLEdBQUcsQ0FBQztJQUNqQixJQUFJLGNBQWMsR0FBRyxDQUFDLENBQUM7SUFFdkIsT0FBTyxDQUFDLENBQUMsVUFBVSxDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUMsRUFDbkMsQ0FBQztRQUNHLEVBQUUsY0FBYyxDQUFDO1FBQ2pCLE1BQU0sR0FBRyxNQUFNLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQztJQUN6QyxDQUFDO0lBRUQsTUFBTSxDQUFDLGNBQWMsQ0FBQztBQUMxQixDQUFDO0FBakJELGdDQWlCQztBQUdELGlCQUF3QixHQUFXLEVBQUUsTUFBb0I7SUFBcEIsdUJBQUEsRUFBQSxZQUFvQjtJQUVyRCxJQUFNLEtBQUssR0FBRyxHQUFHLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDO0lBQzlCLElBQU0sZUFBZSxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsS0FBSyxFQUFFLFVBQUMsT0FBTyxJQUFLLE9BQUEsVUFBVSxDQUFDLE9BQU8sRUFBRSxNQUFNLENBQUMsRUFBM0IsQ0FBMkIsQ0FBQyxDQUFDO0lBQy9FLElBQU0sV0FBVyxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsZUFBZSxDQUFDLENBQUM7SUFDM0MsSUFBTSxnQkFBZ0IsR0FBRyxNQUFNLENBQUMsTUFBTSxHQUFHLFdBQVksQ0FBQztJQUV0RCxJQUFNLFdBQVcsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLEtBQUssRUFBRSxVQUFDLE9BQU8sSUFBSyxPQUFBLE9BQU8sQ0FBQyxLQUFLLENBQUMsZ0JBQWdCLENBQUMsRUFBL0IsQ0FBK0IsQ0FBQyxDQUFDO0lBQy9FLE1BQU0sQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQ2xDLENBQUM7QUFURCwwQkFTQztBQUdELHdCQUErQixHQUFXO0lBRXRDLElBQU0sZ0JBQWdCLEdBQUcsT0FBTyxDQUFDO0lBQ2pDLElBQU0sS0FBSyxHQUFHLEdBQUcsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUM7SUFFOUIsT0FBTyxDQUFDLEtBQUssQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDO1FBQ25CLGdCQUFnQixDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDckMsQ0FBQztRQUNHLEtBQUssQ0FBQyxLQUFLLEVBQUUsQ0FBQztJQUNsQixDQUFDO0lBRUQsT0FBTyxDQUFDLEtBQUssQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDO1FBQ25CLGdCQUFnQixDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBRSxDQUFDLEVBQzNDLENBQUM7UUFDRyxLQUFLLENBQUMsR0FBRyxFQUFFLENBQUM7SUFDaEIsQ0FBQztJQUVELE1BQU0sQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQzVCLENBQUM7QUFsQkQsd0NBa0JDIiwiZmlsZSI6InN0cmluZ0hlbHBlcnMuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgKiBhcyBfIGZyb20gXCJsb2Rhc2hcIjtcblxuXG5leHBvcnQgZnVuY3Rpb24gbnVtSW5pdGlhbChzdHI6IHN0cmluZywgcGFkU3RyOiBzdHJpbmcpOiBudW1iZXJcbntcbiAgICBpZiAocGFkU3RyID09PSBcIlwiKVxuICAgIHtcbiAgICAgICAgcmV0dXJuIDA7XG4gICAgfVxuXG4gICAgbGV0IGN1clN0ciA9IHN0cjtcbiAgICBsZXQgbnVtT2NjdXJyZW5jZXMgPSAwO1xuXG4gICAgd2hpbGUgKF8uc3RhcnRzV2l0aChjdXJTdHIsIHBhZFN0cikpXG4gICAge1xuICAgICAgICArK251bU9jY3VycmVuY2VzO1xuICAgICAgICBjdXJTdHIgPSBjdXJTdHIuc2xpY2UocGFkU3RyLmxlbmd0aCk7XG4gICAgfVxuXG4gICAgcmV0dXJuIG51bU9jY3VycmVuY2VzO1xufVxuXG5cbmV4cG9ydCBmdW5jdGlvbiBvdXRkZW50KHN0cjogc3RyaW5nLCBwYWRTdHI6IHN0cmluZyA9IFwiIFwiKTogc3RyaW5nXG57XG4gICAgY29uc3QgbGluZXMgPSBzdHIuc3BsaXQoXCJcXG5cIik7XG4gICAgY29uc3QgaW5pdE9jY3VycmVuY2VzID0gXy5tYXAobGluZXMsIChjdXJMaW5lKSA9PiBudW1Jbml0aWFsKGN1ckxpbmUsIHBhZFN0cikpO1xuICAgIGNvbnN0IG51bVRvUmVtb3ZlID0gXy5taW4oaW5pdE9jY3VycmVuY2VzKTtcbiAgICBjb25zdCBudW1DaGFyc1RvUmVtb3ZlID0gcGFkU3RyLmxlbmd0aCAqIG51bVRvUmVtb3ZlITtcblxuICAgIGNvbnN0IHJlc3VsdExpbmVzID0gXy5tYXAobGluZXMsIChjdXJMaW5lKSA9PiBjdXJMaW5lLnNsaWNlKG51bUNoYXJzVG9SZW1vdmUpKTtcbiAgICByZXR1cm4gcmVzdWx0TGluZXMuam9pbihcIlxcblwiKTtcbn1cblxuXG5leHBvcnQgZnVuY3Rpb24gdHJpbUJsYW5rTGluZXMoc3RyOiBzdHJpbmcpOiBzdHJpbmdcbntcbiAgICBjb25zdCBCTEFOS19MSU5FX1JFR0VYID0gL15cXHMqJC87XG4gICAgY29uc3QgbGluZXMgPSBzdHIuc3BsaXQoXCJcXG5cIik7XG5cbiAgICB3aGlsZSAoKGxpbmVzLmxlbmd0aCA+IDApICYmXG4gICAgICAgICAgQkxBTktfTElORV9SRUdFWC50ZXN0KGxpbmVzWzBdKSlcbiAgICB7XG4gICAgICAgIGxpbmVzLnNoaWZ0KCk7XG4gICAgfVxuXG4gICAgd2hpbGUgKChsaW5lcy5sZW5ndGggPiAwKSAmJlxuICAgICAgICAgIEJMQU5LX0xJTkVfUkVHRVgudGVzdChfLmxhc3QobGluZXMpISkpXG4gICAge1xuICAgICAgICBsaW5lcy5wb3AoKTtcbiAgICB9XG5cbiAgICByZXR1cm4gbGluZXMuam9pbihcIlxcblwiKTtcbn1cbiJdfQ==
