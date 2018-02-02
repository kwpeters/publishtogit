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
var PrefixStream = (function (_super) {
    __extends(PrefixStream, _super);
    //endregion
    function PrefixStream(prefix) {
        var _this = _super.call(this) || this;
        _this._prefixBuf = Buffer.from("[" + prefix + "] ");
        _this._flushedDeferred = new deferred_1.Deferred();
        return _this;
    }
    PrefixStream.prototype._transform = function (chunk, encoding, done) {
        // Convert to a Buffer.
        var chunkBuf = typeof chunk === "string" ? Buffer.from(chunk) : chunk;
        this._partial = this._partial && this._partial.length ?
            Buffer.concat([this._partial, chunkBuf]) :
            chunkBuf;
        // While complete lines exist, push them.
        var index = this._partial.indexOf("\n");
        while (index !== -1) {
            var line = this._partial.slice(0, ++index);
            this._partial = this._partial.slice(index);
            this.push(Buffer.concat([this._prefixBuf, line]));
            index = this._partial.indexOf("\n");
        }
        done();
    };
    PrefixStream.prototype._flush = function (done) {
        if (this._partial && this._partial.length) {
            this.push(Buffer.concat([this._prefixBuf, this._partial]));
        }
        this._flushedDeferred.resolve(undefined);
        done();
    };
    Object.defineProperty(PrefixStream.prototype, "prefix", {
        get: function () {
            return this._prefixBuf.toString();
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PrefixStream.prototype, "flushedPromise", {
        get: function () {
            return this._flushedDeferred.promise;
        },
        enumerable: true,
        configurable: true
    });
    return PrefixStream;
}(stream_1.Transform));
exports.PrefixStream = PrefixStream;

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9wcmVmaXhTdHJlYW0udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7O0FBQUEsaUNBQWlDO0FBQ2pDLHVDQUFvQztBQUdwQztJQUFrQyxnQ0FBUztJQU12QyxXQUFXO0lBR1gsc0JBQVksTUFBYztRQUExQixZQUVJLGlCQUFPLFNBR1Y7UUFGRyxLQUFJLENBQUMsVUFBVSxHQUFHLE1BQU0sQ0FBQyxJQUFJLENBQUMsTUFBSSxNQUFNLE9BQUksQ0FBQyxDQUFDO1FBQzlDLEtBQUksQ0FBQyxnQkFBZ0IsR0FBRyxJQUFJLG1CQUFRLEVBQVEsQ0FBQzs7SUFDakQsQ0FBQztJQUdNLGlDQUFVLEdBQWpCLFVBQWtCLEtBQXNCLEVBQUUsUUFBZ0IsRUFBRSxJQUFjO1FBRXRFLHVCQUF1QjtRQUN2QixJQUFNLFFBQVEsR0FBVyxPQUFPLEtBQUssS0FBSyxRQUFRLEdBQUcsTUFBTSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsR0FBRyxLQUFLLENBQUM7UUFFaEYsSUFBSSxDQUFDLFFBQVEsR0FBRyxJQUFJLENBQUMsUUFBUSxJQUFJLElBQUksQ0FBQyxRQUFRLENBQUMsTUFBTTtZQUNqRCxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUMsSUFBSSxDQUFDLFFBQVEsRUFBRSxRQUFRLENBQUMsQ0FBQztZQUN4QyxRQUFRLENBQUM7UUFFYix5Q0FBeUM7UUFDekMsSUFBSSxLQUFLLEdBQVcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDaEQsT0FBTyxLQUFLLEtBQUssQ0FBQyxDQUFDLEVBQUUsQ0FBQztZQUNsQixJQUFNLElBQUksR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxDQUFDLEVBQUUsRUFBRSxLQUFLLENBQUMsQ0FBQztZQUM3QyxJQUFJLENBQUMsUUFBUSxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDO1lBQzNDLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDLElBQUksQ0FBQyxVQUFVLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBRWxELEtBQUssR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUN4QyxDQUFDO1FBQ0QsSUFBSSxFQUFFLENBQUM7SUFDWCxDQUFDO0lBR00sNkJBQU0sR0FBYixVQUFjLElBQWM7UUFFeEIsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLFFBQVEsSUFBSSxJQUFJLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxDQUMxQyxDQUFDO1lBQ0csSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUMsSUFBSSxDQUFDLFVBQVUsRUFBRSxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQy9ELENBQUM7UUFDRCxJQUFJLENBQUMsZ0JBQWdCLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxDQUFDO1FBRXpDLElBQUksRUFBRSxDQUFDO0lBQ1gsQ0FBQztJQUdELHNCQUFXLGdDQUFNO2FBQWpCO1lBRUksTUFBTSxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsUUFBUSxFQUFFLENBQUM7UUFDdEMsQ0FBQzs7O09BQUE7SUFHRCxzQkFBVyx3Q0FBYzthQUF6QjtZQUVJLE1BQU0sQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsT0FBTyxDQUFDO1FBQ3pDLENBQUM7OztPQUFBO0lBQ0wsbUJBQUM7QUFBRCxDQTdEQSxBQTZEQyxDQTdEaUMsa0JBQVMsR0E2RDFDO0FBN0RZLG9DQUFZIiwiZmlsZSI6InByZWZpeFN0cmVhbS5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7VHJhbnNmb3JtfSBmcm9tIFwic3RyZWFtXCI7XG5pbXBvcnQge0RlZmVycmVkfSBmcm9tIFwiLi9kZWZlcnJlZFwiO1xuXG5cbmV4cG9ydCBjbGFzcyBQcmVmaXhTdHJlYW0gZXh0ZW5kcyBUcmFuc2Zvcm1cbntcbiAgICAvL3JlZ2lvbiBQcml2YXRlIE1lbWJlcnNcbiAgICBwcml2YXRlIF9wcmVmaXhCdWY6IEJ1ZmZlcjtcbiAgICBwcml2YXRlIF9wYXJ0aWFsOiBCdWZmZXI7XG4gICAgcHJpdmF0ZSBfZmx1c2hlZERlZmVycmVkOiBEZWZlcnJlZDx2b2lkPjtcbiAgICAvL2VuZHJlZ2lvblxuXG5cbiAgICBjb25zdHJ1Y3RvcihwcmVmaXg6IHN0cmluZylcbiAgICB7XG4gICAgICAgIHN1cGVyKCk7XG4gICAgICAgIHRoaXMuX3ByZWZpeEJ1ZiA9IEJ1ZmZlci5mcm9tKGBbJHtwcmVmaXh9XSBgKTtcbiAgICAgICAgdGhpcy5fZmx1c2hlZERlZmVycmVkID0gbmV3IERlZmVycmVkPHZvaWQ+KCk7XG4gICAgfVxuXG5cbiAgICBwdWJsaWMgX3RyYW5zZm9ybShjaHVuazogQnVmZmVyIHwgc3RyaW5nLCBlbmNvZGluZzogc3RyaW5nLCBkb25lOiBGdW5jdGlvbik6IHZvaWRcbiAgICB7XG4gICAgICAgIC8vIENvbnZlcnQgdG8gYSBCdWZmZXIuXG4gICAgICAgIGNvbnN0IGNodW5rQnVmOiBCdWZmZXIgPSB0eXBlb2YgY2h1bmsgPT09IFwic3RyaW5nXCIgPyBCdWZmZXIuZnJvbShjaHVuaykgOiBjaHVuaztcblxuICAgICAgICB0aGlzLl9wYXJ0aWFsID0gdGhpcy5fcGFydGlhbCAmJiB0aGlzLl9wYXJ0aWFsLmxlbmd0aCA/XG4gICAgICAgICAgICBCdWZmZXIuY29uY2F0KFt0aGlzLl9wYXJ0aWFsLCBjaHVua0J1Zl0pIDpcbiAgICAgICAgICAgIGNodW5rQnVmO1xuXG4gICAgICAgIC8vIFdoaWxlIGNvbXBsZXRlIGxpbmVzIGV4aXN0LCBwdXNoIHRoZW0uXG4gICAgICAgIGxldCBpbmRleDogbnVtYmVyID0gdGhpcy5fcGFydGlhbC5pbmRleE9mKFwiXFxuXCIpO1xuICAgICAgICB3aGlsZSAoaW5kZXggIT09IC0xKSB7XG4gICAgICAgICAgICBjb25zdCBsaW5lID0gdGhpcy5fcGFydGlhbC5zbGljZSgwLCArK2luZGV4KTtcbiAgICAgICAgICAgIHRoaXMuX3BhcnRpYWwgPSB0aGlzLl9wYXJ0aWFsLnNsaWNlKGluZGV4KTtcbiAgICAgICAgICAgIHRoaXMucHVzaChCdWZmZXIuY29uY2F0KFt0aGlzLl9wcmVmaXhCdWYsIGxpbmVdKSk7XG5cbiAgICAgICAgICAgIGluZGV4ID0gdGhpcy5fcGFydGlhbC5pbmRleE9mKFwiXFxuXCIpO1xuICAgICAgICB9XG4gICAgICAgIGRvbmUoKTtcbiAgICB9XG5cblxuICAgIHB1YmxpYyBfZmx1c2goZG9uZTogRnVuY3Rpb24pOiB2b2lkXG4gICAge1xuICAgICAgICBpZiAodGhpcy5fcGFydGlhbCAmJiB0aGlzLl9wYXJ0aWFsLmxlbmd0aClcbiAgICAgICAge1xuICAgICAgICAgICAgdGhpcy5wdXNoKEJ1ZmZlci5jb25jYXQoW3RoaXMuX3ByZWZpeEJ1ZiwgdGhpcy5fcGFydGlhbF0pKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLl9mbHVzaGVkRGVmZXJyZWQucmVzb2x2ZSh1bmRlZmluZWQpO1xuXG4gICAgICAgIGRvbmUoKTtcbiAgICB9XG5cblxuICAgIHB1YmxpYyBnZXQgcHJlZml4KCk6IHN0cmluZ1xuICAgIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX3ByZWZpeEJ1Zi50b1N0cmluZygpO1xuICAgIH1cblxuXG4gICAgcHVibGljIGdldCBmbHVzaGVkUHJvbWlzZSgpOiBQcm9taXNlPHZvaWQ+XG4gICAge1xuICAgICAgICByZXR1cm4gdGhpcy5fZmx1c2hlZERlZmVycmVkLnByb21pc2U7XG4gICAgfVxufVxuIl19
