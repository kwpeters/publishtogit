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
var SourceStream = (function (_super) {
    __extends(SourceStream, _super);
    //endregion
    function SourceStream(data, opts) {
        var _this = _super.call(this, opts) || this;
        _this._curIndex = 0;
        if (Array.isArray(data)) {
            _this._data = data;
        }
        else {
            _this._data = [data];
        }
        return _this;
    }
    SourceStream.prototype._read = function () {
        if (this._curIndex >= this._data.length) {
            this.push(null);
        }
        else {
            var buf = Buffer.from(this._data[this._curIndex]);
            this.push(buf);
        }
        this._curIndex++;
    };
    return SourceStream;
}(stream_1.Readable));
exports.SourceStream = SourceStream;

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9zb3VyY2VTdHJlYW0udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7O0FBQUEsaUNBQWlEO0FBRWpEO0lBQWtDLGdDQUFRO0lBS3RDLFdBQVc7SUFHWCxzQkFBWSxJQUE0QixFQUFFLElBQXNCO1FBQWhFLFlBQ0ksa0JBQU0sSUFBSSxDQUFDLFNBV2Q7UUFoQk8sZUFBUyxHQUFXLENBQUMsQ0FBQztRQU8xQixFQUFFLENBQUMsQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQ3hCLENBQUM7WUFDRyxLQUFJLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQztRQUN0QixDQUFDO1FBQ0QsSUFBSSxDQUNKLENBQUM7WUFDRyxLQUFJLENBQUMsS0FBSyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDeEIsQ0FBQzs7SUFFTCxDQUFDO0lBR00sNEJBQUssR0FBWjtRQUVJLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxTQUFTLElBQUksSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsQ0FDeEMsQ0FBQztZQUNHLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDcEIsQ0FBQztRQUNELElBQUksQ0FDSixDQUFDO1lBQ0csSUFBTSxHQUFHLEdBQUcsTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDO1lBQ3BELElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDbkIsQ0FBQztRQUVELElBQUksQ0FBQyxTQUFTLEVBQUUsQ0FBQztJQUNyQixDQUFDO0lBQ0wsbUJBQUM7QUFBRCxDQXJDQSxBQXFDQyxDQXJDaUMsaUJBQVEsR0FxQ3pDO0FBckNZLG9DQUFZIiwiZmlsZSI6InNvdXJjZVN0cmVhbS5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7UmVhZGFibGUsIFJlYWRhYmxlT3B0aW9uc30gZnJvbSBcInN0cmVhbVwiO1xuXG5leHBvcnQgY2xhc3MgU291cmNlU3RyZWFtIGV4dGVuZHMgUmVhZGFibGVcbntcbiAgICAvL3JlZ2lvbiBQcml2YXRlIERhdGEgTWVtYmVyc1xuICAgIHByaXZhdGUgX2RhdGE6IEFycmF5PHN0cmluZz47XG4gICAgcHJpdmF0ZSBfY3VySW5kZXg6IG51bWJlciA9IDA7XG4gICAgLy9lbmRyZWdpb25cblxuXG4gICAgY29uc3RydWN0b3IoZGF0YTogQXJyYXk8c3RyaW5nPiB8IHN0cmluZywgb3B0cz86IFJlYWRhYmxlT3B0aW9ucykge1xuICAgICAgICBzdXBlcihvcHRzKTtcblxuICAgICAgICBpZiAoQXJyYXkuaXNBcnJheShkYXRhKSlcbiAgICAgICAge1xuICAgICAgICAgICAgdGhpcy5fZGF0YSA9IGRhdGE7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZVxuICAgICAgICB7XG4gICAgICAgICAgICB0aGlzLl9kYXRhID0gW2RhdGFdO1xuICAgICAgICB9XG5cbiAgICB9XG5cblxuICAgIHB1YmxpYyBfcmVhZCgpOiB2b2lkIHtcblxuICAgICAgICBpZiAodGhpcy5fY3VySW5kZXggPj0gdGhpcy5fZGF0YS5sZW5ndGgpXG4gICAgICAgIHtcbiAgICAgICAgICAgIHRoaXMucHVzaChudWxsKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlXG4gICAgICAgIHtcbiAgICAgICAgICAgIGNvbnN0IGJ1ZiA9IEJ1ZmZlci5mcm9tKHRoaXMuX2RhdGFbdGhpcy5fY3VySW5kZXhdKTtcbiAgICAgICAgICAgIHRoaXMucHVzaChidWYpO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5fY3VySW5kZXgrKztcbiAgICB9XG59XG4iXX0=
