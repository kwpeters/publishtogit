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
var CollectorStream = /** @class */ (function (_super) {
    __extends(CollectorStream, _super);
    // endregion
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

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9kZXBvdC9jb2xsZWN0b3JTdHJlYW0udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7O0FBQUEsaUNBQWlDO0FBQ2pDLHVDQUFvQztBQUdwQztJQUFxQyxtQ0FBUztJQUsxQyxZQUFZO0lBR1o7UUFBQSxZQUVJLGlCQUFPLFNBR1Y7UUFGRyxLQUFJLENBQUMsVUFBVSxHQUFHLElBQUksTUFBTSxDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBQ2pDLEtBQUksQ0FBQyxnQkFBZ0IsR0FBRyxJQUFJLG1CQUFRLEVBQVEsQ0FBQzs7SUFDakQsQ0FBQztJQUdNLG9DQUFVLEdBQWpCLFVBQWtCLEtBQXNCLEVBQUUsUUFBZ0IsRUFBRSxJQUFlO1FBRXZFLHVCQUF1QjtRQUN2QixJQUFNLFFBQVEsR0FBVyxPQUFPLEtBQUssS0FBSyxRQUFRLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQztRQUVoRixJQUFJLENBQUMsVUFBVSxHQUFHLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQyxJQUFJLENBQUMsVUFBVSxFQUFFLFFBQVEsQ0FBQyxDQUFDLENBQUM7UUFDN0QsSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUNwQixJQUFJLEVBQUUsQ0FBQztJQUNYLENBQUM7SUFHTSxnQ0FBTSxHQUFiLFVBQWMsSUFBZTtRQUV6QixJQUFJLENBQUMsZ0JBQWdCLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxDQUFDO1FBQ3pDLElBQUksRUFBRSxDQUFDO0lBQ1gsQ0FBQztJQUdELHNCQUFXLHNDQUFTO2FBQXBCO1lBRUksT0FBTyxJQUFJLENBQUMsVUFBVSxDQUFDLFFBQVEsRUFBRSxDQUFDO1FBQ3RDLENBQUM7OztPQUFBO0lBR0Qsc0JBQVcsMkNBQWM7YUFBekI7WUFFSSxPQUFPLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxPQUFPLENBQUM7UUFDekMsQ0FBQzs7O09BQUE7SUFDTCxzQkFBQztBQUFELENBNUNBLEFBNENDLENBNUNvQyxrQkFBUyxHQTRDN0M7QUE1Q1ksMENBQWUiLCJmaWxlIjoiZGVwb3QvY29sbGVjdG9yU3RyZWFtLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtUcmFuc2Zvcm19IGZyb20gXCJzdHJlYW1cIjtcbmltcG9ydCB7RGVmZXJyZWR9IGZyb20gXCIuL2RlZmVycmVkXCI7XG5cblxuZXhwb3J0IGNsYXNzIENvbGxlY3RvclN0cmVhbSBleHRlbmRzIFRyYW5zZm9ybVxue1xuICAgIC8vIHJlZ2lvbiBQcml2YXRlIE1lbWJlcnNcbiAgICBwcml2YXRlIF9jb2xsZWN0ZWQ6IEJ1ZmZlcjtcbiAgICBwcml2YXRlIF9mbHVzaGVkRGVmZXJyZWQ6IERlZmVycmVkPHZvaWQ+O1xuICAgIC8vIGVuZHJlZ2lvblxuXG5cbiAgICBjb25zdHJ1Y3RvcigpXG4gICAge1xuICAgICAgICBzdXBlcigpO1xuICAgICAgICB0aGlzLl9jb2xsZWN0ZWQgPSBuZXcgQnVmZmVyKFwiXCIpO1xuICAgICAgICB0aGlzLl9mbHVzaGVkRGVmZXJyZWQgPSBuZXcgRGVmZXJyZWQ8dm9pZD4oKTtcbiAgICB9XG5cblxuICAgIHB1YmxpYyBfdHJhbnNmb3JtKGNodW5rOiBCdWZmZXIgfCBzdHJpbmcsIGVuY29kaW5nOiBzdHJpbmcsIGRvbmU6ICgpID0+IGFueSk6IHZvaWRcbiAgICB7XG4gICAgICAgIC8vIENvbnZlcnQgdG8gYSBCdWZmZXIuXG4gICAgICAgIGNvbnN0IGNodW5rQnVmOiBCdWZmZXIgPSB0eXBlb2YgY2h1bmsgPT09IFwic3RyaW5nXCIgPyBCdWZmZXIuZnJvbShjaHVuaykgOiBjaHVuaztcblxuICAgICAgICB0aGlzLl9jb2xsZWN0ZWQgPSBCdWZmZXIuY29uY2F0KFt0aGlzLl9jb2xsZWN0ZWQsIGNodW5rQnVmXSk7XG4gICAgICAgIHRoaXMucHVzaChjaHVua0J1Zik7XG4gICAgICAgIGRvbmUoKTtcbiAgICB9XG5cblxuICAgIHB1YmxpYyBfZmx1c2goZG9uZTogKCkgPT4gYW55KTogdm9pZFxuICAgIHtcbiAgICAgICAgdGhpcy5fZmx1c2hlZERlZmVycmVkLnJlc29sdmUodW5kZWZpbmVkKTtcbiAgICAgICAgZG9uZSgpO1xuICAgIH1cblxuXG4gICAgcHVibGljIGdldCBjb2xsZWN0ZWQoKTogc3RyaW5nXG4gICAge1xuICAgICAgICByZXR1cm4gdGhpcy5fY29sbGVjdGVkLnRvU3RyaW5nKCk7XG4gICAgfVxuXG5cbiAgICBwdWJsaWMgZ2V0IGZsdXNoZWRQcm9taXNlKCk6IFByb21pc2U8dm9pZD5cbiAgICB7XG4gICAgICAgIHJldHVybiB0aGlzLl9mbHVzaGVkRGVmZXJyZWQucHJvbWlzZTtcbiAgICB9XG59XG4iXX0=
