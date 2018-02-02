"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var _ = require("lodash");
//
// A regex that will parse the parts of a version string.
//
// optional non-capturing group - Matches an optional word followed by optional
//     whitespace.
// match[1] - The major version number
// match[2] - The minor version number
// match[3] - The patch version number
//
var SEMVER_REGEXP = /^(?:\w*?\s*?)?(\d+)\.(\d+)\.(\d+)$/;
//
// The string that is prefixed onto version strings.
//
var VERSION_STRING_PREFIX = "v";
var SemVer = (function () {
    //endregion
    function SemVer(major, minor, patch) {
        this._major = major;
        this._minor = minor;
        this._patch = patch;
    }
    SemVer.sort = function (arr) {
        return _.sortBy(arr, [
            function (semver) { return semver.major; },
            function (semver) { return semver.minor; },
            function (semver) { return semver.patch; }
        ]);
    };
    SemVer.fromString = function (str) {
        var matches = SEMVER_REGEXP.exec(str);
        if (matches) {
            return new SemVer(parseInt(matches[1], 10), parseInt(matches[2], 10), parseInt(matches[3], 10));
        }
        else {
            return undefined;
        }
    };
    /**
     * Returns this version as a string (no prefixes)
     * @return A string representation of this version
     */
    SemVer.prototype.toString = function () {
        return this._major + "." + this._minor + "." + this._patch;
    };
    Object.defineProperty(SemVer.prototype, "major", {
        /**
         * Gets the major version number
         */
        get: function () {
            return this._major;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SemVer.prototype, "minor", {
        /**
         * Gets the minor version number
         */
        get: function () {
            return this._minor;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SemVer.prototype, "patch", {
        /**
         * Gets the patch version number
         */
        get: function () {
            return this._patch;
        },
        enumerable: true,
        configurable: true
    });
    /**
     * Gets this version as a version string (prefixed), including only the
     * major version number.
     * @return The major version string (prefixed)
     */
    SemVer.prototype.getMajorVersionString = function () {
        return "" + VERSION_STRING_PREFIX + this._major;
    };
    /**
     * Gets this version as a version string (prefixed), including major and
     * minor version numbers.
     * @return The minor version string (prefixed)
     */
    SemVer.prototype.getMinorVersionString = function () {
        return "" + VERSION_STRING_PREFIX + this._major + "." + this._minor;
    };
    /**
     * Gets this version as a version string (prefixed), including major, minor
     * and patch version numbers.
     * @return The patch version string (prefixed)
     */
    SemVer.prototype.getPatchVersionString = function () {
        return "" + VERSION_STRING_PREFIX + this._major + "." + this._minor + "." + this._patch;
    };
    /**
     * Compares this version with other and determines whether the this version
     * is less, greater or equal to other.
     * @param other - The other version to compare to
     * @return {-1 | 0 | 1} -1 if this version is less than other. 1 if this
     * version is greater than other.  0 if this version equals other.
     */
    SemVer.prototype.compare = function (other) {
        if (this._major < other._major) {
            return -1;
        }
        else if (this._major > other._major) {
            return 1;
        }
        else {
            // Major numbers are equal.
            if (this._minor < other._minor) {
                return -1;
            }
            else if (this._minor > other._minor) {
                return 1;
            }
            else {
                // Major and minor are equal.
                if (this._patch < other._patch) {
                    return -1;
                }
                else if (this._patch > other._patch) {
                    return 1;
                }
                else {
                    return 0;
                }
            }
        }
    };
    return SemVer;
}());
exports.SemVer = SemVer;

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9TZW1WZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSwwQkFBNEI7QUFFNUIsRUFBRTtBQUNGLHlEQUF5RDtBQUN6RCxFQUFFO0FBQ0YsK0VBQStFO0FBQy9FLGtCQUFrQjtBQUNsQixzQ0FBc0M7QUFDdEMsc0NBQXNDO0FBQ3RDLHNDQUFzQztBQUN0QyxFQUFFO0FBQ0YsSUFBTSxhQUFhLEdBQUcsb0NBQW9DLENBQUM7QUFHM0QsRUFBRTtBQUNGLG9EQUFvRDtBQUNwRCxFQUFFO0FBQ0YsSUFBTSxxQkFBcUIsR0FBRyxHQUFHLENBQUM7QUFHbEM7SUFrQ0ksV0FBVztJQUdYLGdCQUFvQixLQUFhLEVBQUUsS0FBYSxFQUFFLEtBQWE7UUFFM0QsSUFBSSxDQUFDLE1BQU0sR0FBRyxLQUFLLENBQUM7UUFDcEIsSUFBSSxDQUFDLE1BQU0sR0FBRyxLQUFLLENBQUM7UUFDcEIsSUFBSSxDQUFDLE1BQU0sR0FBRyxLQUFLLENBQUM7SUFDeEIsQ0FBQztJQXhDYSxXQUFJLEdBQWxCLFVBQW1CLEdBQWtCO1FBRWpDLE1BQU0sQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUNYLEdBQUcsRUFDSDtZQUNJLFVBQUMsTUFBYyxJQUFLLE9BQUEsTUFBTSxDQUFDLEtBQUssRUFBWixDQUFZO1lBQ2hDLFVBQUMsTUFBYyxJQUFLLE9BQUEsTUFBTSxDQUFDLEtBQUssRUFBWixDQUFZO1lBQ2hDLFVBQUMsTUFBYyxJQUFLLE9BQUEsTUFBTSxDQUFDLEtBQUssRUFBWixDQUFZO1NBQ25DLENBQ0osQ0FBQztJQUNOLENBQUM7SUFFYSxpQkFBVSxHQUF4QixVQUF5QixHQUFXO1FBRWhDLElBQU0sT0FBTyxHQUFHLGFBQWEsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDeEMsRUFBRSxDQUFDLENBQUMsT0FBTyxDQUFDLENBQ1osQ0FBQztZQUNHLE1BQU0sQ0FBQyxJQUFJLE1BQU0sQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxFQUN4QixRQUFRLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxFQUN4QixRQUFRLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUM7UUFDaEQsQ0FBQztRQUNELElBQUksQ0FDSixDQUFDO1lBQ0csTUFBTSxDQUFDLFNBQVMsQ0FBQztRQUNyQixDQUFDO0lBQ0wsQ0FBQztJQWtCRDs7O09BR0c7SUFDSSx5QkFBUSxHQUFmO1FBRUksTUFBTSxDQUFJLElBQUksQ0FBQyxNQUFNLFNBQUksSUFBSSxDQUFDLE1BQU0sU0FBSSxJQUFJLENBQUMsTUFBUSxDQUFDO0lBQzFELENBQUM7SUFNRCxzQkFBVyx5QkFBSztRQUhoQjs7V0FFRzthQUNIO1lBRUksTUFBTSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUM7UUFDdkIsQ0FBQzs7O09BQUE7SUFNRCxzQkFBVyx5QkFBSztRQUhoQjs7V0FFRzthQUNIO1lBRUksTUFBTSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUM7UUFDdkIsQ0FBQzs7O09BQUE7SUFNRCxzQkFBVyx5QkFBSztRQUhoQjs7V0FFRzthQUNIO1lBRUksTUFBTSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUM7UUFDdkIsQ0FBQzs7O09BQUE7SUFHRDs7OztPQUlHO0lBQ0ksc0NBQXFCLEdBQTVCO1FBRUksTUFBTSxDQUFDLEtBQUcscUJBQXFCLEdBQUcsSUFBSSxDQUFDLE1BQVEsQ0FBQztJQUNwRCxDQUFDO0lBR0Q7Ozs7T0FJRztJQUNJLHNDQUFxQixHQUE1QjtRQUVJLE1BQU0sQ0FBQyxLQUFHLHFCQUFxQixHQUFHLElBQUksQ0FBQyxNQUFNLFNBQUksSUFBSSxDQUFDLE1BQVEsQ0FBQztJQUNuRSxDQUFDO0lBR0Q7Ozs7T0FJRztJQUNJLHNDQUFxQixHQUE1QjtRQUVJLE1BQU0sQ0FBQyxLQUFHLHFCQUFxQixHQUFHLElBQUksQ0FBQyxNQUFNLFNBQUksSUFBSSxDQUFDLE1BQU0sU0FBSSxJQUFJLENBQUMsTUFBUSxDQUFDO0lBQ2xGLENBQUM7SUFHRDs7Ozs7O09BTUc7SUFDSSx3QkFBTyxHQUFkLFVBQWUsS0FBYTtRQUV4QixFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsTUFBTSxHQUFHLEtBQUssQ0FBQyxNQUFNLENBQUMsQ0FDL0IsQ0FBQztZQUNHLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNkLENBQUM7UUFDRCxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLE1BQU0sR0FBRyxLQUFLLENBQUMsTUFBTSxDQUFDLENBQ3BDLENBQUM7WUFDRyxNQUFNLENBQUMsQ0FBQyxDQUFDO1FBQ2IsQ0FBQztRQUNELElBQUksQ0FDSixDQUFDO1lBQ0csMkJBQTJCO1lBQzNCLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxNQUFNLEdBQUcsS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUMvQixDQUFDO2dCQUNHLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNkLENBQUM7WUFDRCxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLE1BQU0sR0FBRyxLQUFLLENBQUMsTUFBTSxDQUFDLENBQ3BDLENBQUM7Z0JBQ0csTUFBTSxDQUFDLENBQUMsQ0FBQztZQUNiLENBQUM7WUFDRCxJQUFJLENBQ0osQ0FBQztnQkFDRyw2QkFBNkI7Z0JBQzdCLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxNQUFNLEdBQUcsS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUMvQixDQUFDO29CQUNHLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDZCxDQUFDO2dCQUNELElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsTUFBTSxHQUFHLEtBQUssQ0FBQyxNQUFNLENBQUMsQ0FDcEMsQ0FBQztvQkFDRyxNQUFNLENBQUMsQ0FBQyxDQUFDO2dCQUNiLENBQUM7Z0JBQ0QsSUFBSSxDQUNKLENBQUM7b0JBQ0csTUFBTSxDQUFDLENBQUMsQ0FBQztnQkFDYixDQUFDO1lBQ0wsQ0FBQztRQUNMLENBQUM7SUFDTCxDQUFDO0lBQ0wsYUFBQztBQUFELENBaktBLEFBaUtDLElBQUE7QUFqS1ksd0JBQU0iLCJmaWxlIjoiU2VtVmVyLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0ICogYXMgXyBmcm9tIFwibG9kYXNoXCI7XG5cbi8vXG4vLyBBIHJlZ2V4IHRoYXQgd2lsbCBwYXJzZSB0aGUgcGFydHMgb2YgYSB2ZXJzaW9uIHN0cmluZy5cbi8vXG4vLyBvcHRpb25hbCBub24tY2FwdHVyaW5nIGdyb3VwIC0gTWF0Y2hlcyBhbiBvcHRpb25hbCB3b3JkIGZvbGxvd2VkIGJ5IG9wdGlvbmFsXG4vLyAgICAgd2hpdGVzcGFjZS5cbi8vIG1hdGNoWzFdIC0gVGhlIG1ham9yIHZlcnNpb24gbnVtYmVyXG4vLyBtYXRjaFsyXSAtIFRoZSBtaW5vciB2ZXJzaW9uIG51bWJlclxuLy8gbWF0Y2hbM10gLSBUaGUgcGF0Y2ggdmVyc2lvbiBudW1iZXJcbi8vXG5jb25zdCBTRU1WRVJfUkVHRVhQID0gL14oPzpcXHcqP1xccyo/KT8oXFxkKylcXC4oXFxkKylcXC4oXFxkKykkLztcblxuXG4vL1xuLy8gVGhlIHN0cmluZyB0aGF0IGlzIHByZWZpeGVkIG9udG8gdmVyc2lvbiBzdHJpbmdzLlxuLy9cbmNvbnN0IFZFUlNJT05fU1RSSU5HX1BSRUZJWCA9IFwidlwiO1xuXG5cbmV4cG9ydCBjbGFzcyBTZW1WZXJcbntcbiAgICBwdWJsaWMgc3RhdGljIHNvcnQoYXJyOiBBcnJheTxTZW1WZXI+KTogQXJyYXk8U2VtVmVyPlxuICAgIHtcbiAgICAgICAgcmV0dXJuIF8uc29ydEJ5PFNlbVZlcj4oXG4gICAgICAgICAgICBhcnIsXG4gICAgICAgICAgICBbXG4gICAgICAgICAgICAgICAgKHNlbXZlcjogU2VtVmVyKSA9PiBzZW12ZXIubWFqb3IsXG4gICAgICAgICAgICAgICAgKHNlbXZlcjogU2VtVmVyKSA9PiBzZW12ZXIubWlub3IsXG4gICAgICAgICAgICAgICAgKHNlbXZlcjogU2VtVmVyKSA9PiBzZW12ZXIucGF0Y2hcbiAgICAgICAgICAgIF1cbiAgICAgICAgKTtcbiAgICB9XG5cbiAgICBwdWJsaWMgc3RhdGljIGZyb21TdHJpbmcoc3RyOiBzdHJpbmcpOiBTZW1WZXIgfCB1bmRlZmluZWRcbiAgICB7XG4gICAgICAgIGNvbnN0IG1hdGNoZXMgPSBTRU1WRVJfUkVHRVhQLmV4ZWMoc3RyKTtcbiAgICAgICAgaWYgKG1hdGNoZXMpXG4gICAgICAgIHtcbiAgICAgICAgICAgIHJldHVybiBuZXcgU2VtVmVyKHBhcnNlSW50KG1hdGNoZXNbMV0sIDEwKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBhcnNlSW50KG1hdGNoZXNbMl0sIDEwKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBhcnNlSW50KG1hdGNoZXNbM10sIDEwKSk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZVxuICAgICAgICB7XG4gICAgICAgICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgICAgICB9XG4gICAgfVxuXG5cbiAgICAvL3JlZ2lvbiBEYXRhIE1lbWJlcnNcbiAgICBwcml2YXRlIF9tYWpvcjogbnVtYmVyOyAgIC8vIFwiQnJlYWtpbmdcIlxuICAgIHByaXZhdGUgX21pbm9yOiBudW1iZXI7ICAgLy8gXCJGZWF0dXJlXCJcbiAgICBwcml2YXRlIF9wYXRjaDogbnVtYmVyOyAgIC8vIFwiRml4XCJcbiAgICAvL2VuZHJlZ2lvblxuXG5cbiAgICBwcml2YXRlIGNvbnN0cnVjdG9yKG1ham9yOiBudW1iZXIsIG1pbm9yOiBudW1iZXIsIHBhdGNoOiBudW1iZXIpXG4gICAge1xuICAgICAgICB0aGlzLl9tYWpvciA9IG1ham9yO1xuICAgICAgICB0aGlzLl9taW5vciA9IG1pbm9yO1xuICAgICAgICB0aGlzLl9wYXRjaCA9IHBhdGNoO1xuICAgIH1cblxuXG4gICAgLyoqXG4gICAgICogUmV0dXJucyB0aGlzIHZlcnNpb24gYXMgYSBzdHJpbmcgKG5vIHByZWZpeGVzKVxuICAgICAqIEByZXR1cm4gQSBzdHJpbmcgcmVwcmVzZW50YXRpb24gb2YgdGhpcyB2ZXJzaW9uXG4gICAgICovXG4gICAgcHVibGljIHRvU3RyaW5nKCk6IHN0cmluZ1xuICAgIHtcbiAgICAgICAgcmV0dXJuIGAke3RoaXMuX21ham9yfS4ke3RoaXMuX21pbm9yfS4ke3RoaXMuX3BhdGNofWA7XG4gICAgfVxuXG5cbiAgICAvKipcbiAgICAgKiBHZXRzIHRoZSBtYWpvciB2ZXJzaW9uIG51bWJlclxuICAgICAqL1xuICAgIHB1YmxpYyBnZXQgbWFqb3IoKTogbnVtYmVyXG4gICAge1xuICAgICAgICByZXR1cm4gdGhpcy5fbWFqb3I7XG4gICAgfVxuXG5cbiAgICAvKipcbiAgICAgKiBHZXRzIHRoZSBtaW5vciB2ZXJzaW9uIG51bWJlclxuICAgICAqL1xuICAgIHB1YmxpYyBnZXQgbWlub3IoKTogbnVtYmVyXG4gICAge1xuICAgICAgICByZXR1cm4gdGhpcy5fbWlub3I7XG4gICAgfVxuXG5cbiAgICAvKipcbiAgICAgKiBHZXRzIHRoZSBwYXRjaCB2ZXJzaW9uIG51bWJlclxuICAgICAqL1xuICAgIHB1YmxpYyBnZXQgcGF0Y2goKTogbnVtYmVyXG4gICAge1xuICAgICAgICByZXR1cm4gdGhpcy5fcGF0Y2g7XG4gICAgfVxuXG5cbiAgICAvKipcbiAgICAgKiBHZXRzIHRoaXMgdmVyc2lvbiBhcyBhIHZlcnNpb24gc3RyaW5nIChwcmVmaXhlZCksIGluY2x1ZGluZyBvbmx5IHRoZVxuICAgICAqIG1ham9yIHZlcnNpb24gbnVtYmVyLlxuICAgICAqIEByZXR1cm4gVGhlIG1ham9yIHZlcnNpb24gc3RyaW5nIChwcmVmaXhlZClcbiAgICAgKi9cbiAgICBwdWJsaWMgZ2V0TWFqb3JWZXJzaW9uU3RyaW5nKCk6IHN0cmluZ1xuICAgIHtcbiAgICAgICAgcmV0dXJuIGAke1ZFUlNJT05fU1RSSU5HX1BSRUZJWH0ke3RoaXMuX21ham9yfWA7XG4gICAgfVxuXG5cbiAgICAvKipcbiAgICAgKiBHZXRzIHRoaXMgdmVyc2lvbiBhcyBhIHZlcnNpb24gc3RyaW5nIChwcmVmaXhlZCksIGluY2x1ZGluZyBtYWpvciBhbmRcbiAgICAgKiBtaW5vciB2ZXJzaW9uIG51bWJlcnMuXG4gICAgICogQHJldHVybiBUaGUgbWlub3IgdmVyc2lvbiBzdHJpbmcgKHByZWZpeGVkKVxuICAgICAqL1xuICAgIHB1YmxpYyBnZXRNaW5vclZlcnNpb25TdHJpbmcoKTogc3RyaW5nXG4gICAge1xuICAgICAgICByZXR1cm4gYCR7VkVSU0lPTl9TVFJJTkdfUFJFRklYfSR7dGhpcy5fbWFqb3J9LiR7dGhpcy5fbWlub3J9YDtcbiAgICB9XG5cblxuICAgIC8qKlxuICAgICAqIEdldHMgdGhpcyB2ZXJzaW9uIGFzIGEgdmVyc2lvbiBzdHJpbmcgKHByZWZpeGVkKSwgaW5jbHVkaW5nIG1ham9yLCBtaW5vclxuICAgICAqIGFuZCBwYXRjaCB2ZXJzaW9uIG51bWJlcnMuXG4gICAgICogQHJldHVybiBUaGUgcGF0Y2ggdmVyc2lvbiBzdHJpbmcgKHByZWZpeGVkKVxuICAgICAqL1xuICAgIHB1YmxpYyBnZXRQYXRjaFZlcnNpb25TdHJpbmcoKTogc3RyaW5nXG4gICAge1xuICAgICAgICByZXR1cm4gYCR7VkVSU0lPTl9TVFJJTkdfUFJFRklYfSR7dGhpcy5fbWFqb3J9LiR7dGhpcy5fbWlub3J9LiR7dGhpcy5fcGF0Y2h9YDtcbiAgICB9XG5cblxuICAgIC8qKlxuICAgICAqIENvbXBhcmVzIHRoaXMgdmVyc2lvbiB3aXRoIG90aGVyIGFuZCBkZXRlcm1pbmVzIHdoZXRoZXIgdGhlIHRoaXMgdmVyc2lvblxuICAgICAqIGlzIGxlc3MsIGdyZWF0ZXIgb3IgZXF1YWwgdG8gb3RoZXIuXG4gICAgICogQHBhcmFtIG90aGVyIC0gVGhlIG90aGVyIHZlcnNpb24gdG8gY29tcGFyZSB0b1xuICAgICAqIEByZXR1cm4gey0xIHwgMCB8IDF9IC0xIGlmIHRoaXMgdmVyc2lvbiBpcyBsZXNzIHRoYW4gb3RoZXIuIDEgaWYgdGhpc1xuICAgICAqIHZlcnNpb24gaXMgZ3JlYXRlciB0aGFuIG90aGVyLiAgMCBpZiB0aGlzIHZlcnNpb24gZXF1YWxzIG90aGVyLlxuICAgICAqL1xuICAgIHB1YmxpYyBjb21wYXJlKG90aGVyOiBTZW1WZXIpOiAtMSB8IDAgfCAxXG4gICAge1xuICAgICAgICBpZiAodGhpcy5fbWFqb3IgPCBvdGhlci5fbWFqb3IpXG4gICAgICAgIHtcbiAgICAgICAgICAgIHJldHVybiAtMTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmICh0aGlzLl9tYWpvciA+IG90aGVyLl9tYWpvcilcbiAgICAgICAge1xuICAgICAgICAgICAgcmV0dXJuIDE7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZVxuICAgICAgICB7XG4gICAgICAgICAgICAvLyBNYWpvciBudW1iZXJzIGFyZSBlcXVhbC5cbiAgICAgICAgICAgIGlmICh0aGlzLl9taW5vciA8IG90aGVyLl9taW5vcilcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gLTE7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmICh0aGlzLl9taW5vciA+IG90aGVyLl9taW5vcilcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gMTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAvLyBNYWpvciBhbmQgbWlub3IgYXJlIGVxdWFsLlxuICAgICAgICAgICAgICAgIGlmICh0aGlzLl9wYXRjaCA8IG90aGVyLl9wYXRjaClcbiAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiAtMTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSBpZiAodGhpcy5fcGF0Y2ggPiBvdGhlci5fcGF0Y2gpXG4gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gMTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIDA7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxufVxuIl19
