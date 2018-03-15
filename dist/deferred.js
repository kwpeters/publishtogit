"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Deferred = (function () {
    function Deferred() {
        var _this = this;
        this.promise = new Promise(function (resolve, reject) {
            _this.resolve = resolve;
            _this.reject = reject;
        });
    }
    return Deferred;
}());
exports.Deferred = Deferred;

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9kZWZlcnJlZC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUNBO0lBTUk7UUFBQSxpQkFLQztRQUpHLElBQUksQ0FBQyxPQUFPLEdBQUcsSUFBSSxPQUFPLENBQUMsVUFBQyxPQUFzQyxFQUFFLE1BQTBCO1lBQzFGLEtBQUksQ0FBQyxPQUFPLEdBQUcsT0FBTyxDQUFDO1lBQ3ZCLEtBQUksQ0FBQyxNQUFNLEdBQUcsTUFBTSxDQUFDO1FBQ3pCLENBQUMsQ0FBQyxDQUFDO0lBQ1AsQ0FBQztJQUNMLGVBQUM7QUFBRCxDQVpBLEFBWUMsSUFBQTtBQVpZLDRCQUFRIiwiZmlsZSI6ImRlZmVycmVkLmpzIiwic291cmNlc0NvbnRlbnQiOlsiXG5leHBvcnQgY2xhc3MgRGVmZXJyZWQ8UmVzb2x2ZVR5cGU+XG57XG4gICAgcHVibGljIHByb21pc2U6IFByb21pc2U8UmVzb2x2ZVR5cGU+O1xuICAgIHB1YmxpYyByZXNvbHZlOiAocmVzdWx0OiBSZXNvbHZlVHlwZSkgPT4gdm9pZDtcbiAgICBwdWJsaWMgcmVqZWN0OiAoZXJyOiBhbnkpID0+IHZvaWQ7XG5cbiAgICBjb25zdHJ1Y3Rvcigpe1xuICAgICAgICB0aGlzLnByb21pc2UgPSBuZXcgUHJvbWlzZSgocmVzb2x2ZTogKHJlc3VsdDogUmVzb2x2ZVR5cGUpID0+IHZvaWQsIHJlamVjdDogKGVycjogYW55KSA9PiB2b2lkKSA9PiB7XG4gICAgICAgICAgICB0aGlzLnJlc29sdmUgPSByZXNvbHZlO1xuICAgICAgICAgICAgdGhpcy5yZWplY3QgPSByZWplY3Q7XG4gICAgICAgIH0pO1xuICAgIH1cbn1cbiJdfQ==
