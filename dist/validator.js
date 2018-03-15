"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var _ = require("lodash");
/**
 * A Validator is an object that can evaluate the validity of a subject by
 * invoking an array of validator functions on that subject.  This class is
 * templated on the type of the subject to be validated.
 */
var Validator = (function () {
    //endregion
    /**
     * Constructs a new Validator.
     *
     * @param validatorFuncs - The functions used to validate a subject.  Each
     * function must have a single parameter of the subject type and return a
     * boolean or Promise<boolean> (true=valid, false=invalid).  If an async
     * function rejects, the subject is assumed to be invalid.
     */
    function Validator(validatorFuncs) {
        this._validatorFuncs = validatorFuncs;
    }
    /**
     * Evaluates the validity of subject.
     * @param subject - The data to be validated
     * @return A promise for the validity of subject.  This promise will never
     * reject.
     */
    Validator.prototype.isValid = function (subject) {
        var promises = _.map(this._validatorFuncs, function (curValidatorFunc) {
            var result = curValidatorFunc(subject);
            // Wrap each return value in a Promise.
            return Promise.resolve(result);
        });
        return Promise.all(promises)
            .then(function (validationResults) {
            // Return true only if every validator returned true.
            return _.every(validationResults);
        })
            .catch(function () {
            // One of the validators rejected.  Assume that means a failed validation.
            return false;
        });
    };
    return Validator;
}());
exports.Validator = Validator;

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy92YWxpZGF0b3IudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSwwQkFBNEI7QUFXNUI7Ozs7R0FJRztBQUNIO0lBSUksV0FBVztJQUdYOzs7Ozs7O09BT0c7SUFDSCxtQkFBbUIsY0FBaUQ7UUFFaEUsSUFBSSxDQUFDLGVBQWUsR0FBRyxjQUFjLENBQUM7SUFDMUMsQ0FBQztJQUdEOzs7OztPQUtHO0lBQ0ksMkJBQU8sR0FBZCxVQUFlLE9BQW9CO1FBRS9CLElBQU0sUUFBUSxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLGVBQWUsRUFBRSxVQUFDLGdCQUFnQjtZQUMxRCxJQUFNLE1BQU0sR0FBK0IsZ0JBQWdCLENBQUMsT0FBTyxDQUFDLENBQUM7WUFDckUsdUNBQXVDO1lBQ3ZDLE1BQU0sQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBQ25DLENBQUMsQ0FBQyxDQUFDO1FBRUgsTUFBTSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDO2FBQzNCLElBQUksQ0FBQyxVQUFDLGlCQUFpQztZQUNwQyxxREFBcUQ7WUFDckQsTUFBTSxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsaUJBQWlCLENBQUMsQ0FBQztRQUN0QyxDQUFDLENBQUM7YUFDRCxLQUFLLENBQUM7WUFDSCwwRUFBMEU7WUFDMUUsTUFBTSxDQUFDLEtBQUssQ0FBQztRQUNqQixDQUFDLENBQUMsQ0FBQztJQUNQLENBQUM7SUFDTCxnQkFBQztBQUFELENBN0NBLEFBNkNDLElBQUE7QUE3Q1ksOEJBQVMiLCJmaWxlIjoidmFsaWRhdG9yLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0ICogYXMgXyBmcm9tIFwibG9kYXNoXCI7XG5cblxuLyoqXG4gKiBBIHR5cGUgdGhhdCBkZXNjcmliZXMgYSBmdW5jdGlvbiB0aGF0IHZhbGlkYXRlcyBhIHBhcnRpY3VsYXIgc3ViamVjdC4gIFRoZVxuICogZnVuY3Rpb24gYWNjZXB0cyB0aGUgc3ViamVjdCBhcyBpdHMgb25seSBwYXJhbWV0ZXIgYW5kIHJldHVybnMgYSBib29sZWFuIG9yIGFcbiAqIFByb21pc2UgZm9yIGEgYm9vbGVhbi5cbiAqL1xudHlwZSBWYWxpZGF0b3JGdW5jPFN1YmplY3RUeXBlPiA9IChzdWJqZWN0OiBTdWJqZWN0VHlwZSkgPT4gYm9vbGVhbiB8IFByb21pc2U8Ym9vbGVhbj47XG5cblxuLyoqXG4gKiBBIFZhbGlkYXRvciBpcyBhbiBvYmplY3QgdGhhdCBjYW4gZXZhbHVhdGUgdGhlIHZhbGlkaXR5IG9mIGEgc3ViamVjdCBieVxuICogaW52b2tpbmcgYW4gYXJyYXkgb2YgdmFsaWRhdG9yIGZ1bmN0aW9ucyBvbiB0aGF0IHN1YmplY3QuICBUaGlzIGNsYXNzIGlzXG4gKiB0ZW1wbGF0ZWQgb24gdGhlIHR5cGUgb2YgdGhlIHN1YmplY3QgdG8gYmUgdmFsaWRhdGVkLlxuICovXG5leHBvcnQgY2xhc3MgVmFsaWRhdG9yPFN1YmplY3RUeXBlPlxue1xuICAgIC8vcmVnaW9uIERhdGEgTWVtYmVyc1xuICAgIHByaXZhdGUgX3ZhbGlkYXRvckZ1bmNzOiBBcnJheTxWYWxpZGF0b3JGdW5jPFN1YmplY3RUeXBlPj47XG4gICAgLy9lbmRyZWdpb25cblxuXG4gICAgLyoqXG4gICAgICogQ29uc3RydWN0cyBhIG5ldyBWYWxpZGF0b3IuXG4gICAgICpcbiAgICAgKiBAcGFyYW0gdmFsaWRhdG9yRnVuY3MgLSBUaGUgZnVuY3Rpb25zIHVzZWQgdG8gdmFsaWRhdGUgYSBzdWJqZWN0LiAgRWFjaFxuICAgICAqIGZ1bmN0aW9uIG11c3QgaGF2ZSBhIHNpbmdsZSBwYXJhbWV0ZXIgb2YgdGhlIHN1YmplY3QgdHlwZSBhbmQgcmV0dXJuIGFcbiAgICAgKiBib29sZWFuIG9yIFByb21pc2U8Ym9vbGVhbj4gKHRydWU9dmFsaWQsIGZhbHNlPWludmFsaWQpLiAgSWYgYW4gYXN5bmNcbiAgICAgKiBmdW5jdGlvbiByZWplY3RzLCB0aGUgc3ViamVjdCBpcyBhc3N1bWVkIHRvIGJlIGludmFsaWQuXG4gICAgICovXG4gICAgcHVibGljIGNvbnN0cnVjdG9yKHZhbGlkYXRvckZ1bmNzOiBBcnJheTxWYWxpZGF0b3JGdW5jPFN1YmplY3RUeXBlPj4pXG4gICAge1xuICAgICAgICB0aGlzLl92YWxpZGF0b3JGdW5jcyA9IHZhbGlkYXRvckZ1bmNzO1xuICAgIH1cblxuXG4gICAgLyoqXG4gICAgICogRXZhbHVhdGVzIHRoZSB2YWxpZGl0eSBvZiBzdWJqZWN0LlxuICAgICAqIEBwYXJhbSBzdWJqZWN0IC0gVGhlIGRhdGEgdG8gYmUgdmFsaWRhdGVkXG4gICAgICogQHJldHVybiBBIHByb21pc2UgZm9yIHRoZSB2YWxpZGl0eSBvZiBzdWJqZWN0LiAgVGhpcyBwcm9taXNlIHdpbGwgbmV2ZXJcbiAgICAgKiByZWplY3QuXG4gICAgICovXG4gICAgcHVibGljIGlzVmFsaWQoc3ViamVjdDogU3ViamVjdFR5cGUpOiBQcm9taXNlPGJvb2xlYW4+XG4gICAge1xuICAgICAgICBjb25zdCBwcm9taXNlcyA9IF8ubWFwKHRoaXMuX3ZhbGlkYXRvckZ1bmNzLCAoY3VyVmFsaWRhdG9yRnVuYykgPT4ge1xuICAgICAgICAgICAgY29uc3QgcmVzdWx0OiBQcm9taXNlPGJvb2xlYW4+IHwgYm9vbGVhbiA9IGN1clZhbGlkYXRvckZ1bmMoc3ViamVjdCk7XG4gICAgICAgICAgICAvLyBXcmFwIGVhY2ggcmV0dXJuIHZhbHVlIGluIGEgUHJvbWlzZS5cbiAgICAgICAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUocmVzdWx0KTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgcmV0dXJuIFByb21pc2UuYWxsKHByb21pc2VzKVxuICAgICAgICAudGhlbigodmFsaWRhdGlvblJlc3VsdHM6IEFycmF5PGJvb2xlYW4+KSA9PiB7XG4gICAgICAgICAgICAvLyBSZXR1cm4gdHJ1ZSBvbmx5IGlmIGV2ZXJ5IHZhbGlkYXRvciByZXR1cm5lZCB0cnVlLlxuICAgICAgICAgICAgcmV0dXJuIF8uZXZlcnkodmFsaWRhdGlvblJlc3VsdHMpO1xuICAgICAgICB9KVxuICAgICAgICAuY2F0Y2goKCkgPT4ge1xuICAgICAgICAgICAgLy8gT25lIG9mIHRoZSB2YWxpZGF0b3JzIHJlamVjdGVkLiAgQXNzdW1lIHRoYXQgbWVhbnMgYSBmYWlsZWQgdmFsaWRhdGlvbi5cbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfSk7XG4gICAgfVxufVxuIl19
