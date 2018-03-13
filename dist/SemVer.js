"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var semver = require("semver");
//
// The string that is prefixed onto version strings.
//
var VERSION_STRING_PREFIX = "v";
var SemVer = (function () {
    //endregion
    function SemVer(semver) {
        this._semver = semver;
    }
    SemVer.sort = function (arr) {
        return arr.sort(function (semverA, semverB) {
            return semver.compare(semverA._semver, semverB._semver);
        });
    };
    SemVer.fromString = function (str) {
        var sv = semver.parse(str);
        return sv ? new SemVer(sv) : undefined;
    };
    /**
     * Returns this version as a string (no prefixes)
     * @return A string representation of this version
     */
    SemVer.prototype.toString = function () {
        return this._semver.toString();
    };
    Object.defineProperty(SemVer.prototype, "major", {
        /**
         * Gets the major version number
         */
        get: function () {
            return this._semver.major;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SemVer.prototype, "minor", {
        /**
         * Gets the minor version number
         */
        get: function () {
            return this._semver.minor;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SemVer.prototype, "patch", {
        /**
         * Gets the patch version number
         */
        get: function () {
            return this._semver.patch;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SemVer.prototype, "prerelease", {
        get: function () {
            // The type definition for semver.prerelease is Array<string>, which is
            // wrong.  Unfortunately, in TS, tuples cannot have optional values, so
            // in order to make this more strongly typed we will convert it into an
            // object.  In order to do the conversion, we must temporarily treat the
            // returned array as an Array<any>.
            var prereleaseParts = this._semver.prerelease;
            if (prereleaseParts.length === 0) {
                return undefined;
            }
            var prerelease = { type: prereleaseParts[0] };
            if (prereleaseParts.length >= 2) {
                prerelease.version = prereleaseParts[1];
            }
            return prerelease;
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
        return "" + VERSION_STRING_PREFIX + this._semver.major;
    };
    /**
     * Gets this version as a version string (prefixed), including major and
     * minor version numbers.
     * @return The minor version string (prefixed)
     */
    SemVer.prototype.getMinorVersionString = function () {
        return "" + VERSION_STRING_PREFIX + this._semver.major + "." + this._semver.minor;
    };
    /**
     * Gets this version as a version string (prefixed), including major, minor
     * and patch version numbers.
     * @return The patch version string (prefixed)
     */
    SemVer.prototype.getPatchVersionString = function () {
        return "" + VERSION_STRING_PREFIX + this._semver.major + "." + this._semver.minor + "." + this._semver.patch;
    };
    /**
     * Compares this version with other and determines whether the this version
     * is less, greater or equal to other.
     * @param other - The other version to compare to
     * @return {-1 | 0 | 1} -1 if this version is less than other. 1 if this
     * version is greater than other.  0 if this version equals other.
     */
    SemVer.prototype.compare = function (other) {
        return semver.compare(this._semver, other._semver);
    };
    return SemVer;
}());
exports.SemVer = SemVer;

//# sourceMappingURL=data:application/json;charset=utf8;base64,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QUksQ0FBQyxPQUFPLENBQUMsS0FBTyxDQUFDO0lBQ3ZHLENBQUM7SUFHRDs7Ozs7O09BTUc7SUFDSSx3QkFBTyxHQUFkLFVBQWUsS0FBYTtRQUV4QixNQUFNLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQztJQUN2RCxDQUFDO0lBRUwsYUFBQztBQUFELENBdElBLEFBc0lDLElBQUE7QUF0SVksd0JBQU0iLCJmaWxlIjoiU2VtVmVyLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0ICogYXMgc2VtdmVyIGZyb20gXCJzZW12ZXJcIjtcblxuXG4vL1xuLy8gVGhlIHN0cmluZyB0aGF0IGlzIHByZWZpeGVkIG9udG8gdmVyc2lvbiBzdHJpbmdzLlxuLy9cbmNvbnN0IFZFUlNJT05fU1RSSU5HX1BSRUZJWCA9IFwidlwiO1xuXG5cbmV4cG9ydCBjbGFzcyBTZW1WZXJcbntcbiAgICBwdWJsaWMgc3RhdGljIHNvcnQoYXJyOiBBcnJheTxTZW1WZXI+KTogQXJyYXk8U2VtVmVyPlxuICAgIHtcbiAgICAgICAgcmV0dXJuIGFyci5zb3J0KChzZW12ZXJBLCBzZW12ZXJCKSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gc2VtdmVyLmNvbXBhcmUoc2VtdmVyQS5fc2VtdmVyLCBzZW12ZXJCLl9zZW12ZXIpO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBwdWJsaWMgc3RhdGljIGZyb21TdHJpbmcoc3RyOiBzdHJpbmcpOiBTZW1WZXIgfCB1bmRlZmluZWRcbiAgICB7XG4gICAgICAgIGNvbnN0IHN2ID0gc2VtdmVyLnBhcnNlKHN0cik7XG4gICAgICAgIHJldHVybiBzdiA/IG5ldyBTZW1WZXIoc3YpIDogdW5kZWZpbmVkO1xuICAgIH1cblxuXG4gICAgLy9yZWdpb24gRGF0YSBNZW1iZXJzXG4gICAgcHJpdmF0ZSBfc2VtdmVyOiBzZW12ZXIuU2VtVmVyO1xuICAgIC8vZW5kcmVnaW9uXG5cblxuICAgIHByaXZhdGUgY29uc3RydWN0b3Ioc2VtdmVyOiBzZW12ZXIuU2VtVmVyKVxuICAgIHtcbiAgICAgICAgdGhpcy5fc2VtdmVyID0gc2VtdmVyO1xuICAgIH1cblxuXG4gICAgLyoqXG4gICAgICogUmV0dXJucyB0aGlzIHZlcnNpb24gYXMgYSBzdHJpbmcgKG5vIHByZWZpeGVzKVxuICAgICAqIEByZXR1cm4gQSBzdHJpbmcgcmVwcmVzZW50YXRpb24gb2YgdGhpcyB2ZXJzaW9uXG4gICAgICovXG4gICAgcHVibGljIHRvU3RyaW5nKCk6IHN0cmluZ1xuICAgIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX3NlbXZlci50b1N0cmluZygpO1xuICAgIH1cblxuXG4gICAgLyoqXG4gICAgICogR2V0cyB0aGUgbWFqb3IgdmVyc2lvbiBudW1iZXJcbiAgICAgKi9cbiAgICBwdWJsaWMgZ2V0IG1ham9yKCk6IG51bWJlclxuICAgIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX3NlbXZlci5tYWpvcjtcbiAgICB9XG5cblxuICAgIC8qKlxuICAgICAqIEdldHMgdGhlIG1pbm9yIHZlcnNpb24gbnVtYmVyXG4gICAgICovXG4gICAgcHVibGljIGdldCBtaW5vcigpOiBudW1iZXJcbiAgICB7XG4gICAgICAgIHJldHVybiB0aGlzLl9zZW12ZXIubWlub3I7XG4gICAgfVxuXG5cbiAgICAvKipcbiAgICAgKiBHZXRzIHRoZSBwYXRjaCB2ZXJzaW9uIG51bWJlclxuICAgICAqL1xuICAgIHB1YmxpYyBnZXQgcGF0Y2goKTogbnVtYmVyXG4gICAge1xuICAgICAgICByZXR1cm4gdGhpcy5fc2VtdmVyLnBhdGNoO1xuICAgIH1cblxuXG4gICAgcHVibGljIGdldCBwcmVyZWxlYXNlKCk6IHt0eXBlOiBzdHJpbmcsIHZlcnNpb24/OiBudW1iZXJ9IHwgdW5kZWZpbmVkXG4gICAge1xuICAgICAgICAvLyBUaGUgdHlwZSBkZWZpbml0aW9uIGZvciBzZW12ZXIucHJlcmVsZWFzZSBpcyBBcnJheTxzdHJpbmc+LCB3aGljaCBpc1xuICAgICAgICAvLyB3cm9uZy4gIFVuZm9ydHVuYXRlbHksIGluIFRTLCB0dXBsZXMgY2Fubm90IGhhdmUgb3B0aW9uYWwgdmFsdWVzLCBzb1xuICAgICAgICAvLyBpbiBvcmRlciB0byBtYWtlIHRoaXMgbW9yZSBzdHJvbmdseSB0eXBlZCB3ZSB3aWxsIGNvbnZlcnQgaXQgaW50byBhblxuICAgICAgICAvLyBvYmplY3QuICBJbiBvcmRlciB0byBkbyB0aGUgY29udmVyc2lvbiwgd2UgbXVzdCB0ZW1wb3JhcmlseSB0cmVhdCB0aGVcbiAgICAgICAgLy8gcmV0dXJuZWQgYXJyYXkgYXMgYW4gQXJyYXk8YW55Pi5cbiAgICAgICAgY29uc3QgcHJlcmVsZWFzZVBhcnRzOiBBcnJheTxhbnk+ID0gdGhpcy5fc2VtdmVyLnByZXJlbGVhc2U7XG5cbiAgICAgICAgaWYgKHByZXJlbGVhc2VQYXJ0cy5sZW5ndGggPT09IDApXG4gICAgICAgIHtcbiAgICAgICAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBwcmVyZWxlYXNlOiB7dHlwZTogc3RyaW5nLCB2ZXJzaW9uPzogbnVtYmVyfSA9IHt0eXBlOiBwcmVyZWxlYXNlUGFydHNbMF19O1xuXG4gICAgICAgIGlmIChwcmVyZWxlYXNlUGFydHMubGVuZ3RoID49IDIpXG4gICAgICAgIHtcbiAgICAgICAgICAgIHByZXJlbGVhc2UudmVyc2lvbiA9IHByZXJlbGVhc2VQYXJ0c1sxXTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBwcmVyZWxlYXNlO1xuICAgIH1cblxuXG4gICAgLyoqXG4gICAgICogR2V0cyB0aGlzIHZlcnNpb24gYXMgYSB2ZXJzaW9uIHN0cmluZyAocHJlZml4ZWQpLCBpbmNsdWRpbmcgb25seSB0aGVcbiAgICAgKiBtYWpvciB2ZXJzaW9uIG51bWJlci5cbiAgICAgKiBAcmV0dXJuIFRoZSBtYWpvciB2ZXJzaW9uIHN0cmluZyAocHJlZml4ZWQpXG4gICAgICovXG4gICAgcHVibGljIGdldE1ham9yVmVyc2lvblN0cmluZygpOiBzdHJpbmdcbiAgICB7XG4gICAgICAgIHJldHVybiBgJHtWRVJTSU9OX1NUUklOR19QUkVGSVh9JHt0aGlzLl9zZW12ZXIubWFqb3J9YDtcbiAgICB9XG5cblxuICAgIC8qKlxuICAgICAqIEdldHMgdGhpcyB2ZXJzaW9uIGFzIGEgdmVyc2lvbiBzdHJpbmcgKHByZWZpeGVkKSwgaW5jbHVkaW5nIG1ham9yIGFuZFxuICAgICAqIG1pbm9yIHZlcnNpb24gbnVtYmVycy5cbiAgICAgKiBAcmV0dXJuIFRoZSBtaW5vciB2ZXJzaW9uIHN0cmluZyAocHJlZml4ZWQpXG4gICAgICovXG4gICAgcHVibGljIGdldE1pbm9yVmVyc2lvblN0cmluZygpOiBzdHJpbmdcbiAgICB7XG4gICAgICAgIHJldHVybiBgJHtWRVJTSU9OX1NUUklOR19QUkVGSVh9JHt0aGlzLl9zZW12ZXIubWFqb3J9LiR7dGhpcy5fc2VtdmVyLm1pbm9yfWA7XG4gICAgfVxuXG5cbiAgICAvKipcbiAgICAgKiBHZXRzIHRoaXMgdmVyc2lvbiBhcyBhIHZlcnNpb24gc3RyaW5nIChwcmVmaXhlZCksIGluY2x1ZGluZyBtYWpvciwgbWlub3JcbiAgICAgKiBhbmQgcGF0Y2ggdmVyc2lvbiBudW1iZXJzLlxuICAgICAqIEByZXR1cm4gVGhlIHBhdGNoIHZlcnNpb24gc3RyaW5nIChwcmVmaXhlZClcbiAgICAgKi9cbiAgICBwdWJsaWMgZ2V0UGF0Y2hWZXJzaW9uU3RyaW5nKCk6IHN0cmluZ1xuICAgIHtcbiAgICAgICAgcmV0dXJuIGAke1ZFUlNJT05fU1RSSU5HX1BSRUZJWH0ke3RoaXMuX3NlbXZlci5tYWpvcn0uJHt0aGlzLl9zZW12ZXIubWlub3J9LiR7dGhpcy5fc2VtdmVyLnBhdGNofWA7XG4gICAgfVxuXG5cbiAgICAvKipcbiAgICAgKiBDb21wYXJlcyB0aGlzIHZlcnNpb24gd2l0aCBvdGhlciBhbmQgZGV0ZXJtaW5lcyB3aGV0aGVyIHRoZSB0aGlzIHZlcnNpb25cbiAgICAgKiBpcyBsZXNzLCBncmVhdGVyIG9yIGVxdWFsIHRvIG90aGVyLlxuICAgICAqIEBwYXJhbSBvdGhlciAtIFRoZSBvdGhlciB2ZXJzaW9uIHRvIGNvbXBhcmUgdG9cbiAgICAgKiBAcmV0dXJuIHstMSB8IDAgfCAxfSAtMSBpZiB0aGlzIHZlcnNpb24gaXMgbGVzcyB0aGFuIG90aGVyLiAxIGlmIHRoaXNcbiAgICAgKiB2ZXJzaW9uIGlzIGdyZWF0ZXIgdGhhbiBvdGhlci4gIDAgaWYgdGhpcyB2ZXJzaW9uIGVxdWFscyBvdGhlci5cbiAgICAgKi9cbiAgICBwdWJsaWMgY29tcGFyZShvdGhlcjogU2VtVmVyKTogLTEgfCAwIHwgMVxuICAgIHtcbiAgICAgICAgcmV0dXJuIHNlbXZlci5jb21wYXJlKHRoaXMuX3NlbXZlciwgb3RoZXIuX3NlbXZlcik7XG4gICAgfVxuXG59XG4iXX0=
