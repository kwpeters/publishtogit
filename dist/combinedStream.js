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
var CombinedStream = (function (_super) {
    __extends(CombinedStream, _super);
    function CombinedStream() {
        var streams = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            streams[_i] = arguments[_i];
        }
        var _this = _super.call(this) || this;
        _this._streams = streams;
        _this.on("pipe", function (source) {
            source.unpipe(_this);
            var streamEnd = source;
            for (var streamIndex = 0; streamIndex < _this._streams.length; ++streamIndex) {
                streamEnd = streamEnd.pipe(_this._streams[streamIndex]);
            }
            _this._streamEnd = streamEnd;
        });
        return _this;
    }
    CombinedStream.prototype.pipe = function (dest, options) {
        return this._streamEnd.pipe(dest, options);
    };
    return CombinedStream;
}(stream_1.PassThrough));
exports.CombinedStream = CombinedStream;

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9jb21iaW5lZFN0cmVhbS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7QUFBQSxpQ0FBK0Q7QUFFL0Q7SUFBb0Msa0NBQVc7SUFLM0M7UUFBWSxpQkFBeUI7YUFBekIsVUFBeUIsRUFBekIscUJBQXlCLEVBQXpCLElBQXlCO1lBQXpCLDRCQUF5Qjs7UUFBckMsWUFFSSxpQkFBTyxTQWVWO1FBZEcsS0FBSSxDQUFDLFFBQVEsR0FBRyxPQUFPLENBQUM7UUFFeEIsS0FBSSxDQUFDLEVBQUUsQ0FBQyxNQUFNLEVBQUUsVUFBQyxNQUFnQjtZQUM3QixNQUFNLENBQUMsTUFBTSxDQUFDLEtBQUksQ0FBQyxDQUFDO1lBRXBCLElBQUksU0FBUyxHQUFXLE1BQU0sQ0FBQztZQUUvQixHQUFHLENBQUMsQ0FBQyxJQUFJLFdBQVcsR0FBVyxDQUFDLEVBQUUsV0FBVyxHQUFHLEtBQUksQ0FBQyxRQUFRLENBQUMsTUFBTSxFQUFFLEVBQUUsV0FBVyxFQUNuRixDQUFDO2dCQUNHLFNBQVMsR0FBRyxTQUFTLENBQUMsSUFBSSxDQUFXLEtBQUksQ0FBQyxRQUFRLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQztZQUNyRSxDQUFDO1lBRUQsS0FBSSxDQUFDLFVBQVUsR0FBRyxTQUFTLENBQUM7UUFDaEMsQ0FBQyxDQUFDLENBQUM7O0lBQ1AsQ0FBQztJQUVNLDZCQUFJLEdBQVgsVUFBNkMsSUFBTyxFQUFFLE9BQTRCO1FBRTlFLE1BQU0sQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsT0FBTyxDQUFDLENBQUM7SUFDL0MsQ0FBQztJQUVMLHFCQUFDO0FBQUQsQ0E3QkEsQUE2QkMsQ0E3Qm1DLG9CQUFXLEdBNkI5QztBQTdCWSx3Q0FBYyIsImZpbGUiOiJjb21iaW5lZFN0cmVhbS5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7UGFzc1Rocm91Z2gsIFJlYWRhYmxlLCBXcml0YWJsZSwgU3RyZWFtfSBmcm9tIFwic3RyZWFtXCI7XG5cbmV4cG9ydCBjbGFzcyBDb21iaW5lZFN0cmVhbSBleHRlbmRzIFBhc3NUaHJvdWdoXG57XG4gICAgcHJpdmF0ZSBfc3RyZWFtczogQXJyYXk8U3RyZWFtPjtcbiAgICBwcml2YXRlIF9zdHJlYW1FbmQ6IFN0cmVhbTtcblxuICAgIGNvbnN0cnVjdG9yKC4uLnN0cmVhbXM6IEFycmF5PFN0cmVhbT4pXG4gICAge1xuICAgICAgICBzdXBlcigpO1xuICAgICAgICB0aGlzLl9zdHJlYW1zID0gc3RyZWFtcztcblxuICAgICAgICB0aGlzLm9uKFwicGlwZVwiLCAoc291cmNlOiBSZWFkYWJsZSkgPT4ge1xuICAgICAgICAgICAgc291cmNlLnVucGlwZSh0aGlzKTtcblxuICAgICAgICAgICAgbGV0IHN0cmVhbUVuZDogU3RyZWFtID0gc291cmNlO1xuXG4gICAgICAgICAgICBmb3IgKGxldCBzdHJlYW1JbmRleDogbnVtYmVyID0gMDsgc3RyZWFtSW5kZXggPCB0aGlzLl9zdHJlYW1zLmxlbmd0aDsgKytzdHJlYW1JbmRleClcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBzdHJlYW1FbmQgPSBzdHJlYW1FbmQucGlwZSg8V3JpdGFibGU+dGhpcy5fc3RyZWFtc1tzdHJlYW1JbmRleF0pO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB0aGlzLl9zdHJlYW1FbmQgPSBzdHJlYW1FbmQ7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIHB1YmxpYyBwaXBlPFQgZXh0ZW5kcyBOb2RlSlMuV3JpdGFibGVTdHJlYW0+KGRlc3Q6IFQsIG9wdGlvbnM/OiB7IGVuZD86IGJvb2xlYW47IH0pOiBUXG4gICAge1xuICAgICAgICByZXR1cm4gdGhpcy5fc3RyZWFtRW5kLnBpcGUoZGVzdCwgb3B0aW9ucyk7XG4gICAgfVxuXG59XG4iXX0=
