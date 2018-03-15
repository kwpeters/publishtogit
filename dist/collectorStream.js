"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var stream_1 = require("stream");
var deferred_1 = require("./deferred");
var CollectorStream = (function (_super) {
    __extends(CollectorStream, _super);
    //endregion
    function CollectorStream() {
        var _this = _super.call(this) || this;
        _this._collected = new Buffer("");
        _this._flushedDeferred = new deferred_1.Deferred();
        return _this;
    }
    CollectorStream.prototype._transform = function (chunk, encoding, done) {
        // Convert to a Buffer.
        var chunkBuf = typeof chunk === "string" ? Buffer.from(chunk) : chunk;
        this._collected = Buffer.concat([this._collected, chunkBuf]);
        this.push(chunkBuf);
        done();
    };
    CollectorStream.prototype._flush = function (done) {
        this._flushedDeferred.resolve(undefined);
        done();
    };
    Object.defineProperty(CollectorStream.prototype, "collected", {
        get: function () {
            return this._collected.toString();
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(CollectorStream.prototype, "flushedPromise", {
        get: function () {
            return this._flushedDeferred.promise;
        },
        enumerable: true,
        configurable: true
    });
    return CollectorStream;
}(stream_1.Transform));
exports.CollectorStream = CollectorStream;

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9jb2xsZWN0b3JTdHJlYW0udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7O0FBQUEsaUNBQWlDO0FBQ2pDLHVDQUFvQztBQUdwQztJQUFxQyxtQ0FBUztJQUsxQyxXQUFXO0lBR1g7UUFBQSxZQUVJLGlCQUFPLFNBR1Y7UUFGRyxLQUFJLENBQUMsVUFBVSxHQUFHLElBQUksTUFBTSxDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBQ2pDLEtBQUksQ0FBQyxnQkFBZ0IsR0FBRyxJQUFJLG1CQUFRLEVBQVEsQ0FBQzs7SUFDakQsQ0FBQztJQUdNLG9DQUFVLEdBQWpCLFVBQWtCLEtBQXNCLEVBQUUsUUFBZ0IsRUFBRSxJQUFjO1FBRXRFLHVCQUF1QjtRQUN2QixJQUFNLFFBQVEsR0FBVyxPQUFPLEtBQUssS0FBSyxRQUFRLEdBQUcsTUFBTSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsR0FBRyxLQUFLLENBQUM7UUFFaEYsSUFBSSxDQUFDLFVBQVUsR0FBRyxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUMsSUFBSSxDQUFDLFVBQVUsRUFBRSxRQUFRLENBQUMsQ0FBQyxDQUFDO1FBQzdELElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUM7UUFDcEIsSUFBSSxFQUFFLENBQUM7SUFDWCxDQUFDO0lBR00sZ0NBQU0sR0FBYixVQUFjLElBQWM7UUFFeEIsSUFBSSxDQUFDLGdCQUFnQixDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUMsQ0FBQztRQUN6QyxJQUFJLEVBQUUsQ0FBQztJQUNYLENBQUM7SUFHRCxzQkFBVyxzQ0FBUzthQUFwQjtZQUVJLE1BQU0sQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLFFBQVEsRUFBRSxDQUFDO1FBQ3RDLENBQUM7OztPQUFBO0lBR0Qsc0JBQVcsMkNBQWM7YUFBekI7WUFFSSxNQUFNLENBQUMsSUFBSSxDQUFDLGdCQUFnQixDQUFDLE9BQU8sQ0FBQztRQUN6QyxDQUFDOzs7T0FBQTtJQUNMLHNCQUFDO0FBQUQsQ0E1Q0EsQUE0Q0MsQ0E1Q29DLGtCQUFTLEdBNEM3QztBQTVDWSwwQ0FBZSIsImZpbGUiOiJjb2xsZWN0b3JTdHJlYW0uanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge1RyYW5zZm9ybX0gZnJvbSBcInN0cmVhbVwiO1xuaW1wb3J0IHtEZWZlcnJlZH0gZnJvbSBcIi4vZGVmZXJyZWRcIjtcblxuXG5leHBvcnQgY2xhc3MgQ29sbGVjdG9yU3RyZWFtIGV4dGVuZHMgVHJhbnNmb3JtXG57XG4gICAgLy9yZWdpb24gUHJpdmF0ZSBNZW1iZXJzXG4gICAgcHJpdmF0ZSBfY29sbGVjdGVkOiBCdWZmZXI7XG4gICAgcHJpdmF0ZSBfZmx1c2hlZERlZmVycmVkOiBEZWZlcnJlZDx2b2lkPjtcbiAgICAvL2VuZHJlZ2lvblxuXG5cbiAgICBjb25zdHJ1Y3RvcigpXG4gICAge1xuICAgICAgICBzdXBlcigpO1xuICAgICAgICB0aGlzLl9jb2xsZWN0ZWQgPSBuZXcgQnVmZmVyKFwiXCIpO1xuICAgICAgICB0aGlzLl9mbHVzaGVkRGVmZXJyZWQgPSBuZXcgRGVmZXJyZWQ8dm9pZD4oKTtcbiAgICB9XG5cblxuICAgIHB1YmxpYyBfdHJhbnNmb3JtKGNodW5rOiBCdWZmZXIgfCBzdHJpbmcsIGVuY29kaW5nOiBzdHJpbmcsIGRvbmU6IEZ1bmN0aW9uKTogdm9pZFxuICAgIHtcbiAgICAgICAgLy8gQ29udmVydCB0byBhIEJ1ZmZlci5cbiAgICAgICAgY29uc3QgY2h1bmtCdWY6IEJ1ZmZlciA9IHR5cGVvZiBjaHVuayA9PT0gXCJzdHJpbmdcIiA/IEJ1ZmZlci5mcm9tKGNodW5rKSA6IGNodW5rO1xuXG4gICAgICAgIHRoaXMuX2NvbGxlY3RlZCA9IEJ1ZmZlci5jb25jYXQoW3RoaXMuX2NvbGxlY3RlZCwgY2h1bmtCdWZdKTtcbiAgICAgICAgdGhpcy5wdXNoKGNodW5rQnVmKTtcbiAgICAgICAgZG9uZSgpO1xuICAgIH1cblxuXG4gICAgcHVibGljIF9mbHVzaChkb25lOiBGdW5jdGlvbik6IHZvaWRcbiAgICB7XG4gICAgICAgIHRoaXMuX2ZsdXNoZWREZWZlcnJlZC5yZXNvbHZlKHVuZGVmaW5lZCk7XG4gICAgICAgIGRvbmUoKTtcbiAgICB9XG5cblxuICAgIHB1YmxpYyBnZXQgY29sbGVjdGVkKCk6IHN0cmluZ1xuICAgIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2NvbGxlY3RlZC50b1N0cmluZygpO1xuICAgIH1cblxuXG4gICAgcHVibGljIGdldCBmbHVzaGVkUHJvbWlzZSgpOiBQcm9taXNlPHZvaWQ+XG4gICAge1xuICAgICAgICByZXR1cm4gdGhpcy5fZmx1c2hlZERlZmVycmVkLnByb21pc2U7XG4gICAgfVxufVxuIl19
