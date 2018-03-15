"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var commitHashRegexp = /^[0-9a-fA-F]{7,40}$/;
var CommitHash = (function () {
    //endregion
    function CommitHash(hash) {
        this._hash = hash;
    }
    CommitHash.fromString = function (hash) {
        var results = commitHashRegexp.exec(hash);
        return results ? new CommitHash(hash) : undefined;
    };
    CommitHash.prototype.toString = function () {
        return this._hash;
    };
    CommitHash.prototype.toShortString = function () {
        return this._hash.slice(0, 7);
    };
    return CommitHash;
}());
exports.CommitHash = CommitHash;

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9jb21taXRIYXNoLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBRUEsSUFBTSxnQkFBZ0IsR0FBRyxxQkFBcUIsQ0FBQztBQUUvQztJQVlJLFdBQVc7SUFHWCxvQkFBb0IsSUFBWTtRQUU1QixJQUFJLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQztJQUN0QixDQUFDO0lBZmEscUJBQVUsR0FBeEIsVUFBeUIsSUFBWTtRQUVqQyxJQUFNLE9BQU8sR0FBRyxnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDNUMsTUFBTSxDQUFDLE9BQU8sR0FBRyxJQUFJLFVBQVUsQ0FBQyxJQUFJLENBQUMsR0FBRyxTQUFTLENBQUM7SUFDdEQsQ0FBQztJQWNNLDZCQUFRLEdBQWY7UUFFSSxNQUFNLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQztJQUN0QixDQUFDO0lBR00sa0NBQWEsR0FBcEI7UUFFSSxNQUFNLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO0lBQ2xDLENBQUM7SUFDTCxpQkFBQztBQUFELENBL0JBLEFBK0JDLElBQUE7QUEvQlksZ0NBQVUiLCJmaWxlIjoiY29tbWl0SGFzaC5qcyIsInNvdXJjZXNDb250ZW50IjpbIlxuXG5jb25zdCBjb21taXRIYXNoUmVnZXhwID0gL15bMC05YS1mQS1GXXs3LDQwfSQvO1xuXG5leHBvcnQgY2xhc3MgQ29tbWl0SGFzaFxue1xuXG4gICAgcHVibGljIHN0YXRpYyBmcm9tU3RyaW5nKGhhc2g6IHN0cmluZyk6IENvbW1pdEhhc2ggfCB1bmRlZmluZWRcbiAgICB7XG4gICAgICAgIGNvbnN0IHJlc3VsdHMgPSBjb21taXRIYXNoUmVnZXhwLmV4ZWMoaGFzaCk7XG4gICAgICAgIHJldHVybiByZXN1bHRzID8gbmV3IENvbW1pdEhhc2goaGFzaCkgOiB1bmRlZmluZWQ7XG4gICAgfVxuXG5cbiAgICAvL3JlZ2lvbiBEYXRhIE1lbWJlcnNcbiAgICBwcml2YXRlIF9oYXNoOiBzdHJpbmc7XG4gICAgLy9lbmRyZWdpb25cblxuXG4gICAgcHJpdmF0ZSBjb25zdHJ1Y3RvcihoYXNoOiBzdHJpbmcpXG4gICAge1xuICAgICAgICB0aGlzLl9oYXNoID0gaGFzaDtcbiAgICB9XG5cblxuICAgIHB1YmxpYyB0b1N0cmluZygpOiBzdHJpbmdcbiAgICB7XG4gICAgICAgIHJldHVybiB0aGlzLl9oYXNoO1xuICAgIH1cblxuXG4gICAgcHVibGljIHRvU2hvcnRTdHJpbmcoKTogc3RyaW5nXG4gICAge1xuICAgICAgICByZXR1cm4gdGhpcy5faGFzaC5zbGljZSgwLCA3KTtcbiAgICB9XG59XG4iXX0=
