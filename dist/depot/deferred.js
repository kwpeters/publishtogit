"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var BBPromise = require("bluebird");
var Deferred = /** @class */ (function () {
    function Deferred() {
        var _this = this;
        // The following temporary assignments are here to get rid of a bogus TS
        // error: "TS2564: Property 'resolve' has no initializer and is not
        // definitely assigned in the constructor."
        this.resolve = function () { };
        this.reject = function () { };
        this.promise = new BBPromise(function (resolve, reject) {
            _this.resolve = resolve;
            _this.reject = reject;
        });
        // Make this object immutable.
        Object.freeze(this);
    }
    return Deferred;
}());
exports.Deferred = Deferred;

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9kZXBvdC9kZWZlcnJlZC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLG9DQUFzQztBQUd0QztJQU1JO1FBQUEsaUJBZUM7UUFiRyx3RUFBd0U7UUFDeEUsbUVBQW1FO1FBQ25FLDJDQUEyQztRQUMzQyxJQUFJLENBQUMsT0FBTyxHQUFHLGNBQWEsQ0FBQyxDQUFDO1FBQzlCLElBQUksQ0FBQyxNQUFNLEdBQUcsY0FBYSxDQUFDLENBQUM7UUFFN0IsSUFBSSxDQUFDLE9BQU8sR0FBRyxJQUFJLFNBQVMsQ0FBQyxVQUFDLE9BQXNDLEVBQUUsTUFBMEI7WUFDNUYsS0FBSSxDQUFDLE9BQU8sR0FBRyxPQUFPLENBQUM7WUFDdkIsS0FBSSxDQUFDLE1BQU0sR0FBRyxNQUFNLENBQUM7UUFDekIsQ0FBQyxDQUFDLENBQUM7UUFFSCw4QkFBOEI7UUFDOUIsTUFBTSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUN4QixDQUFDO0lBQ0wsZUFBQztBQUFELENBdEJBLEFBc0JDLElBQUE7QUF0QlksNEJBQVEiLCJmaWxlIjoiZGVwb3QvZGVmZXJyZWQuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgKiBhcyBCQlByb21pc2UgZnJvbSBcImJsdWViaXJkXCI7XG5cblxuZXhwb3J0IGNsYXNzIERlZmVycmVkPFJlc29sdmVUeXBlPlxue1xuICAgIHB1YmxpYyBwcm9taXNlOiBQcm9taXNlPFJlc29sdmVUeXBlPjtcbiAgICBwdWJsaWMgcmVzb2x2ZTogKHJlc3VsdDogUmVzb2x2ZVR5cGUpID0+IHZvaWQ7XG4gICAgcHVibGljIHJlamVjdDogKGVycjogYW55KSA9PiB2b2lkO1xuXG4gICAgY29uc3RydWN0b3IoKVxuICAgIHtcbiAgICAgICAgLy8gVGhlIGZvbGxvd2luZyB0ZW1wb3JhcnkgYXNzaWdubWVudHMgYXJlIGhlcmUgdG8gZ2V0IHJpZCBvZiBhIGJvZ3VzIFRTXG4gICAgICAgIC8vIGVycm9yOiBcIlRTMjU2NDogUHJvcGVydHkgJ3Jlc29sdmUnIGhhcyBubyBpbml0aWFsaXplciBhbmQgaXMgbm90XG4gICAgICAgIC8vIGRlZmluaXRlbHkgYXNzaWduZWQgaW4gdGhlIGNvbnN0cnVjdG9yLlwiXG4gICAgICAgIHRoaXMucmVzb2x2ZSA9ICgpOiB2b2lkID0+IHt9O1xuICAgICAgICB0aGlzLnJlamVjdCA9ICgpOiB2b2lkID0+IHt9O1xuXG4gICAgICAgIHRoaXMucHJvbWlzZSA9IG5ldyBCQlByb21pc2UoKHJlc29sdmU6IChyZXN1bHQ6IFJlc29sdmVUeXBlKSA9PiB2b2lkLCByZWplY3Q6IChlcnI6IGFueSkgPT4gdm9pZCkgPT4ge1xuICAgICAgICAgICAgdGhpcy5yZXNvbHZlID0gcmVzb2x2ZTtcbiAgICAgICAgICAgIHRoaXMucmVqZWN0ID0gcmVqZWN0O1xuICAgICAgICB9KTtcblxuICAgICAgICAvLyBNYWtlIHRoaXMgb2JqZWN0IGltbXV0YWJsZS5cbiAgICAgICAgT2JqZWN0LmZyZWV6ZSh0aGlzKTtcbiAgICB9XG59XG4iXX0=
