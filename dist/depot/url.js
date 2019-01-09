"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var _ = require("lodash");
//
// A regex that captures the protocol part of a URL (everything up to the
// "://").
// results[1] - The string of all protocols.
//
var urlProtocolRegex = /^([a-zA-Z0-9_+]+?):\/\//;
var Url = /** @class */ (function () {
    // endregion
    function Url(url) {
        this._url = url;
    }
    Url.is = function (obj) {
        return _.isFunction(obj.toString) &&
            _.isFunction(obj.getProtocols) &&
            _.isFunction(obj.replaceProtocol);
    };
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

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9kZXBvdC91cmwudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSwwQkFBNEI7QUFHNUIsRUFBRTtBQUNGLHlFQUF5RTtBQUN6RSxVQUFVO0FBQ1YsNENBQTRDO0FBQzVDLEVBQUU7QUFDRixJQUFNLGdCQUFnQixHQUFHLHlCQUF5QixDQUFDO0FBR25EO0lBa0JJLFlBQVk7SUFHWixhQUFvQixHQUFXO1FBRTNCLElBQUksQ0FBQyxJQUFJLEdBQUcsR0FBRyxDQUFDO0lBQ3BCLENBQUM7SUF0QmEsTUFBRSxHQUFoQixVQUFpQixHQUFRO1FBQ3JCLE9BQU8sQ0FBQyxDQUFDLFVBQVUsQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDO1lBQzdCLENBQUMsQ0FBQyxVQUFVLENBQUMsR0FBRyxDQUFDLFlBQVksQ0FBQztZQUM5QixDQUFDLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBQyxlQUFlLENBQUMsQ0FBQztJQUMxQyxDQUFDO0lBR2EsY0FBVSxHQUF4QixVQUF5QixNQUFjO1FBRW5DLDJDQUEyQztRQUMzQyxPQUFPLElBQUksR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFDO0lBQzNCLENBQUM7SUFjTSxzQkFBUSxHQUFmO1FBRUksT0FBTyxJQUFJLENBQUMsSUFBSSxDQUFDO0lBQ3JCLENBQUM7SUFHTSwwQkFBWSxHQUFuQjtRQUVJLElBQU0sT0FBTyxHQUFHLGdCQUFnQixDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDakQsSUFBSSxDQUFDLE9BQU8sRUFDWjtZQUNJLE9BQU8sRUFBRSxDQUFDO1NBQ2I7UUFFRCxPQUFPLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUM7SUFDakMsQ0FBQztJQUdNLDZCQUFlLEdBQXRCLFVBQXVCLFdBQW1CO1FBRXRDLElBQUksQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLFdBQVcsRUFBRSxLQUFLLENBQUMsRUFDbkM7WUFDSSxXQUFXLEdBQUcsV0FBVyxHQUFHLEtBQUssQ0FBQztTQUNyQztRQUVELElBQU0sTUFBTSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLGdCQUFnQixFQUFFLFdBQVcsQ0FBQyxDQUFDO1FBQ2hFLE9BQU8sSUFBSSxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUM7SUFDM0IsQ0FBQztJQUNMLFVBQUM7QUFBRCxDQXZEQSxBQXVEQyxJQUFBO0FBdkRZLGtCQUFHIiwiZmlsZSI6ImRlcG90L3VybC5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCAqIGFzIF8gZnJvbSBcImxvZGFzaFwiO1xuXG5cbi8vXG4vLyBBIHJlZ2V4IHRoYXQgY2FwdHVyZXMgdGhlIHByb3RvY29sIHBhcnQgb2YgYSBVUkwgKGV2ZXJ5dGhpbmcgdXAgdG8gdGhlXG4vLyBcIjovL1wiKS5cbi8vIHJlc3VsdHNbMV0gLSBUaGUgc3RyaW5nIG9mIGFsbCBwcm90b2NvbHMuXG4vL1xuY29uc3QgdXJsUHJvdG9jb2xSZWdleCA9IC9eKFthLXpBLVowLTlfK10rPyk6XFwvXFwvLztcblxuXG5leHBvcnQgY2xhc3MgVXJsXG57XG4gICAgcHVibGljIHN0YXRpYyBpcyhvYmo6IGFueSk6IG9iaiBpcyBVcmwge1xuICAgICAgICByZXR1cm4gXy5pc0Z1bmN0aW9uKG9iai50b1N0cmluZykgJiZcbiAgICAgICAgICAgIF8uaXNGdW5jdGlvbihvYmouZ2V0UHJvdG9jb2xzKSAmJlxuICAgICAgICAgICAgXy5pc0Z1bmN0aW9uKG9iai5yZXBsYWNlUHJvdG9jb2wpO1xuICAgIH1cblxuXG4gICAgcHVibGljIHN0YXRpYyBmcm9tU3RyaW5nKHVybFN0cjogc3RyaW5nKTogVXJsIHwgdW5kZWZpbmVkXG4gICAge1xuICAgICAgICAvLyBUT0RPOiBWZXJpZnkgdGhhdCB1cmxTdHIgaXMgYSB2YWxpZCBVUkwuXG4gICAgICAgIHJldHVybiBuZXcgVXJsKHVybFN0cik7XG4gICAgfVxuXG5cbiAgICAvLyByZWdpb24gRGF0YSBNZW1iZXJzXG4gICAgcHJpdmF0ZSByZWFkb25seSBfdXJsOiBzdHJpbmc7XG4gICAgLy8gZW5kcmVnaW9uXG5cblxuICAgIHByaXZhdGUgY29uc3RydWN0b3IodXJsOiBzdHJpbmcpXG4gICAge1xuICAgICAgICB0aGlzLl91cmwgPSB1cmw7XG4gICAgfVxuXG5cbiAgICBwdWJsaWMgdG9TdHJpbmcoKTogc3RyaW5nXG4gICAge1xuICAgICAgICByZXR1cm4gdGhpcy5fdXJsO1xuICAgIH1cblxuXG4gICAgcHVibGljIGdldFByb3RvY29scygpOiBBcnJheTxzdHJpbmc+XG4gICAge1xuICAgICAgICBjb25zdCByZXN1bHRzID0gdXJsUHJvdG9jb2xSZWdleC5leGVjKHRoaXMuX3VybCk7XG4gICAgICAgIGlmICghcmVzdWx0cylcbiAgICAgICAge1xuICAgICAgICAgICAgcmV0dXJuIFtdO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHJlc3VsdHNbMV0uc3BsaXQoXCIrXCIpO1xuICAgIH1cblxuXG4gICAgcHVibGljIHJlcGxhY2VQcm90b2NvbChuZXdQcm90b2NvbDogc3RyaW5nKTogVXJsXG4gICAge1xuICAgICAgICBpZiAoIV8uZW5kc1dpdGgobmV3UHJvdG9jb2wsIFwiOi8vXCIpKVxuICAgICAgICB7XG4gICAgICAgICAgICBuZXdQcm90b2NvbCA9IG5ld1Byb3RvY29sICsgXCI6Ly9cIjtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IHVybFN0ciA9IHRoaXMuX3VybC5yZXBsYWNlKHVybFByb3RvY29sUmVnZXgsIG5ld1Byb3RvY29sKTtcbiAgICAgICAgcmV0dXJuIG5ldyBVcmwodXJsU3RyKTtcbiAgICB9XG59XG5cbiJdfQ==
