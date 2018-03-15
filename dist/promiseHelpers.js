"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var listenerTracker_1 = require("./listenerTracker");
/**
 * Adapts a Node-style async function with any number of arguments and a callback to a
 * function that has the same arguments (minus the callback) and returns a Promise.
 * @param func - The Node-style function that takes arguments followed by a
 * Node-style callback.
 * @return A function that takes the arguments and returns a Promise for the result.
 */
function promisifyN(func) {
    var promisifiedFunc = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        return new Promise(function (resolve, reject) {
            func.apply(undefined, args.concat(function (err, result) {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(result);
                }
            }));
        });
    };
    return promisifiedFunc;
}
exports.promisifyN = promisifyN;
/**
 * Adapts a Node-style async function with one parameter and a callback to a
 * function that takes one parameter and returns a Promise.  This function is
 * similar to promisifyN(), except that it retains type safety.
 * @param func - The Node-style function that takes one argument and a
 * Node-style callback.
 * @return A function that takes the one argument and returns a Promise for the
 * result.
 */
function promisify1(func) {
    var promisifiedFunc = function (arg1) {
        return new Promise(function (resolve, reject) {
            func(arg1, function (err, result) {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(result);
                }
            });
        });
    };
    return promisifiedFunc;
}
exports.promisify1 = promisify1;
/**
 * Adapts a Node-style async function with two parameters and a callback to a function
 * that takes two parameters and returns a Promise.  This function is similar to
 * promisifyN(), except that it retains type safety.
 * @param func - The Node-style function that takes two arguments and a
 * Node-style callback.
 * @return A function that takes the two arguments and returns a Promise for the
 * result.
 */
function promisify2(func) {
    var promisifiedFunc = function (arg1, arg2) {
        return new Promise(function (resolve, reject) {
            func(arg1, arg2, function (err, result) {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(result);
                }
            });
        });
    };
    return promisifiedFunc;
}
exports.promisify2 = promisify2;
/**
 * Adapts a Node-style async function with three parameters and a callback to a function
 * that takes three parameters and returns a Promise.  This function is similar to
 * promisifyN(), except that it retains type safety.
 * @param func - The Node-style function that takes three arguments and a
 * Node-style callback.
 * @return A function that takes the three arguments and returns a Promise for the
 * result.
 */
function promisify3(func) {
    var promisifiedFunc = function (arg1, arg2, arg3) {
        return new Promise(function (resolve, reject) {
            func(arg1, arg2, arg3, function (err, result) {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(result);
                }
            });
        });
    };
    return promisifiedFunc;
}
exports.promisify3 = promisify3;
/**
 * Runs a sequence of functions in order with each returned value feeding into
 * the parameter of the next.
 * @param tasks - The functions to execute in sequence.  Each function will
 * receive 1 parameter, the return value of the previous function.  A function
 * should throw an exception if it wishes to terminate the sequence and reject
 * the returned promise.
 * @param initialValue - The value that will be passed into the first function.
 * @returns {Promise<any>} A promise that will be resolved with the return value
 * of the last function.
 */
function sequence(tasks, initialValue) {
    "use strict";
    return tasks.reduce(function (accumulator, curTask) {
        return accumulator.then(curTask);
    }, Promise.resolve(initialValue));
}
exports.sequence = sequence;
/**
 * Adapts an EventEmitter to a Promise interface
 * @param emitter - The event emitter to listen to
 * @param resolveEventName - The event that will cause the Promise to resolve
 * @param rejectEventName - The event that will cause the Promise to reject
 * @return A Promise that will will resolve and reject as specified
 */
function eventToPromise(emitter, resolveEventName, rejectEventName) {
    return new Promise(function (resolve, reject) {
        var tracker = new listenerTracker_1.ListenerTracker(emitter);
        tracker.once(resolveEventName, function (result) {
            tracker.removeAll();
            resolve(result);
        });
        if (rejectEventName) {
            tracker.once(rejectEventName, function (err) {
                tracker.removeAll();
                reject(err);
            });
        }
    });
}
exports.eventToPromise = eventToPromise;
/**
 * Adapts a stream to a Promise interface.
 * @param stream - The stream to be adapted
 * @return A Promise that will be resolved when the stream emits the "finish"
 * event and rejects when it emits an "error" event.
 */
function streamToPromise(stream) {
    return eventToPromise(stream, "finish", "error");
}
exports.streamToPromise = streamToPromise;

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9wcm9taXNlSGVscGVycy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUVBLHFEQUFrRDtBQU1sRDs7Ozs7O0dBTUc7QUFDSCxvQkFDSSxJQUFtQztJQUduQyxJQUFNLGVBQWUsR0FBRztRQUFVLGNBQW1CO2FBQW5CLFVBQW1CLEVBQW5CLHFCQUFtQixFQUFuQixJQUFtQjtZQUFuQix5QkFBbUI7O1FBRWpELE1BQU0sQ0FBQyxJQUFJLE9BQU8sQ0FBYSxVQUFDLE9BQXFDLEVBQUUsTUFBMEI7WUFDN0YsSUFBSSxDQUFDLEtBQUssQ0FBQyxTQUFTLEVBQUUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxVQUFDLEdBQVEsRUFBRSxNQUFrQjtnQkFDM0QsRUFBRSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztvQkFDTixNQUFNLENBQUMsR0FBRyxDQUFDLENBQUM7Z0JBQ2hCLENBQUM7Z0JBQUMsSUFBSSxDQUFDLENBQUM7b0JBQ0osT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDO2dCQUNwQixDQUFDO1lBQ0wsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNSLENBQUMsQ0FBQyxDQUFDO0lBQ1AsQ0FBQyxDQUFDO0lBQ0YsTUFBTSxDQUFDLGVBQWUsQ0FBQztBQUMzQixDQUFDO0FBakJELGdDQWlCQztBQUVEOzs7Ozs7OztHQVFHO0FBQ0gsb0JBQ0ksSUFBNkQ7SUFHN0QsSUFBTSxlQUFlLEdBQUcsVUFBVSxJQUFjO1FBQzVDLE1BQU0sQ0FBQyxJQUFJLE9BQU8sQ0FBYSxVQUFDLE9BQXFDLEVBQUUsTUFBMEI7WUFDN0YsSUFBSSxDQUFDLElBQUksRUFBRSxVQUFDLEdBQVEsRUFBRSxNQUFtQjtnQkFDckMsRUFBRSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztvQkFDTixNQUFNLENBQUMsR0FBRyxDQUFDLENBQUM7Z0JBQ2hCLENBQUM7Z0JBQUMsSUFBSSxDQUFDLENBQUM7b0JBQ0osT0FBTyxDQUFDLE1BQU8sQ0FBQyxDQUFDO2dCQUNyQixDQUFDO1lBQ0wsQ0FBQyxDQUFDLENBQUM7UUFDUCxDQUFDLENBQUMsQ0FBQztJQUNQLENBQUMsQ0FBQztJQUNGLE1BQU0sQ0FBQyxlQUFlLENBQUM7QUFFM0IsQ0FBQztBQWpCRCxnQ0FpQkM7QUFHRDs7Ozs7Ozs7R0FRRztBQUNILG9CQUNJLElBQTZFO0lBRzdFLElBQU0sZUFBZSxHQUFHLFVBQVUsSUFBYyxFQUFFLElBQWM7UUFDNUQsTUFBTSxDQUFDLElBQUksT0FBTyxDQUFhLFVBQUMsT0FBcUMsRUFBRSxNQUEwQjtZQUM3RixJQUFJLENBQUMsSUFBSSxFQUFFLElBQUksRUFBRSxVQUFDLEdBQVEsRUFBRSxNQUFtQjtnQkFDM0MsRUFBRSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztvQkFDTixNQUFNLENBQUMsR0FBRyxDQUFDLENBQUM7Z0JBQ2hCLENBQUM7Z0JBQUMsSUFBSSxDQUFDLENBQUM7b0JBQ0osT0FBTyxDQUFDLE1BQU8sQ0FBQyxDQUFDO2dCQUNyQixDQUFDO1lBQ0wsQ0FBQyxDQUFDLENBQUM7UUFDUCxDQUFDLENBQUMsQ0FBQztJQUNQLENBQUMsQ0FBQztJQUNGLE1BQU0sQ0FBQyxlQUFlLENBQUM7QUFDM0IsQ0FBQztBQWhCRCxnQ0FnQkM7QUFHRDs7Ozs7Ozs7R0FRRztBQUNILG9CQUNJLElBQTZGO0lBRzdGLElBQU0sZUFBZSxHQUFHLFVBQVUsSUFBYyxFQUFFLElBQWMsRUFBRSxJQUFjO1FBQzVFLE1BQU0sQ0FBQyxJQUFJLE9BQU8sQ0FBYSxVQUFDLE9BQXFDLEVBQUUsTUFBMEI7WUFDN0YsSUFBSSxDQUFDLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLFVBQUMsR0FBUSxFQUFFLE1BQW1CO2dCQUNqRCxFQUFFLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO29CQUNOLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQztnQkFDaEIsQ0FBQztnQkFBQyxJQUFJLENBQUMsQ0FBQztvQkFDSixPQUFPLENBQUMsTUFBTyxDQUFDLENBQUM7Z0JBQ3JCLENBQUM7WUFDTCxDQUFDLENBQUMsQ0FBQztRQUNQLENBQUMsQ0FBQyxDQUFDO0lBQ1AsQ0FBQyxDQUFDO0lBQ0YsTUFBTSxDQUFDLGVBQWUsQ0FBQztBQUMzQixDQUFDO0FBaEJELGdDQWdCQztBQUdEOzs7Ozs7Ozs7O0dBVUc7QUFDSCxrQkFDSSxLQUF5QyxFQUN6QyxZQUFpQjtJQUVqQixZQUFZLENBQUM7SUFFYixNQUFNLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FDZixVQUFDLFdBQVcsRUFBRSxPQUFPO1FBQ2pCLE1BQU0sQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDO0lBQ3JDLENBQUMsRUFDRCxPQUFPLENBQUMsT0FBTyxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUM7QUFDdkMsQ0FBQztBQVhELDRCQVdDO0FBR0Q7Ozs7OztHQU1HO0FBQ0gsd0JBQ0ksT0FBcUIsRUFDckIsZ0JBQXdCLEVBQ3hCLGVBQXdCO0lBR3hCLE1BQU0sQ0FBQyxJQUFJLE9BQU8sQ0FDZCxVQUFDLE9BQXNDLEVBQUUsTUFBMEI7UUFDL0QsSUFBTSxPQUFPLEdBQUcsSUFBSSxpQ0FBZSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBRTdDLE9BQU8sQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLEVBQUUsVUFBQyxNQUFtQjtZQUMvQyxPQUFPLENBQUMsU0FBUyxFQUFFLENBQUM7WUFDcEIsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBQ3BCLENBQUMsQ0FBQyxDQUFDO1FBRUgsRUFBRSxDQUFDLENBQUMsZUFBZSxDQUFDLENBQ3BCLENBQUM7WUFDRyxPQUFPLENBQUMsSUFBSSxDQUFDLGVBQWUsRUFBRSxVQUFDLEdBQVE7Z0JBQ25DLE9BQU8sQ0FBQyxTQUFTLEVBQUUsQ0FBQztnQkFDcEIsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBQ2hCLENBQUMsQ0FBQyxDQUFDO1FBQ1AsQ0FBQztJQUNMLENBQUMsQ0FDSixDQUFDO0FBQ04sQ0FBQztBQXhCRCx3Q0F3QkM7QUFHRDs7Ozs7R0FLRztBQUNILHlCQUFnQyxNQUFnQjtJQUM1QyxNQUFNLENBQUMsY0FBYyxDQUFDLE1BQU0sRUFBRSxRQUFRLEVBQUUsT0FBTyxDQUFDLENBQUM7QUFDckQsQ0FBQztBQUZELDBDQUVDIiwiZmlsZSI6InByb21pc2VIZWxwZXJzLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtXcml0YWJsZX0gZnJvbSBcInN0cmVhbVwiO1xuaW1wb3J0IHtFdmVudEVtaXR0ZXJ9IGZyb20gXCJldmVudHNcIjtcbmltcG9ydCB7TGlzdGVuZXJUcmFja2VyfSBmcm9tIFwiLi9saXN0ZW5lclRyYWNrZXJcIjtcblxuXG50eXBlIENhbGxCYWNrVHlwZTxSZXN1bHRUeXBlPiA9IChlcnI6IGFueSwgcmVzdWx0PzogUmVzdWx0VHlwZSkgPT4gdm9pZDtcblxuXG4vKipcbiAqIEFkYXB0cyBhIE5vZGUtc3R5bGUgYXN5bmMgZnVuY3Rpb24gd2l0aCBhbnkgbnVtYmVyIG9mIGFyZ3VtZW50cyBhbmQgYSBjYWxsYmFjayB0byBhXG4gKiBmdW5jdGlvbiB0aGF0IGhhcyB0aGUgc2FtZSBhcmd1bWVudHMgKG1pbnVzIHRoZSBjYWxsYmFjaykgYW5kIHJldHVybnMgYSBQcm9taXNlLlxuICogQHBhcmFtIGZ1bmMgLSBUaGUgTm9kZS1zdHlsZSBmdW5jdGlvbiB0aGF0IHRha2VzIGFyZ3VtZW50cyBmb2xsb3dlZCBieSBhXG4gKiBOb2RlLXN0eWxlIGNhbGxiYWNrLlxuICogQHJldHVybiBBIGZ1bmN0aW9uIHRoYXQgdGFrZXMgdGhlIGFyZ3VtZW50cyBhbmQgcmV0dXJucyBhIFByb21pc2UgZm9yIHRoZSByZXN1bHQuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBwcm9taXNpZnlOPFJlc3VsdFR5cGU+KFxuICAgIGZ1bmM6ICguLi5hcmdzOiBBcnJheTxhbnk+KSA9PiB2b2lkXG4pOiAoLi4uYXJnczogQXJyYXk8YW55PikgPT4gUHJvbWlzZTxSZXN1bHRUeXBlPiB7XG5cbiAgICBjb25zdCBwcm9taXNpZmllZEZ1bmMgPSBmdW5jdGlvbiAoLi4uYXJnczogQXJyYXk8YW55Pik6IFByb21pc2U8UmVzdWx0VHlwZT4ge1xuXG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZTxSZXN1bHRUeXBlPigocmVzb2x2ZTogKHJlc3VsdDogUmVzdWx0VHlwZSkgPT4gdm9pZCwgcmVqZWN0OiAoZXJyOiBhbnkpID0+IHZvaWQpID0+IHtcbiAgICAgICAgICAgIGZ1bmMuYXBwbHkodW5kZWZpbmVkLCBhcmdzLmNvbmNhdCgoZXJyOiBhbnksIHJlc3VsdDogUmVzdWx0VHlwZSkgPT4ge1xuICAgICAgICAgICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICAgICAgICAgICAgcmVqZWN0KGVycik7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZShyZXN1bHQpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pKTtcbiAgICAgICAgfSk7XG4gICAgfTtcbiAgICByZXR1cm4gcHJvbWlzaWZpZWRGdW5jO1xufVxuXG4vKipcbiAqIEFkYXB0cyBhIE5vZGUtc3R5bGUgYXN5bmMgZnVuY3Rpb24gd2l0aCBvbmUgcGFyYW1ldGVyIGFuZCBhIGNhbGxiYWNrIHRvIGFcbiAqIGZ1bmN0aW9uIHRoYXQgdGFrZXMgb25lIHBhcmFtZXRlciBhbmQgcmV0dXJucyBhIFByb21pc2UuICBUaGlzIGZ1bmN0aW9uIGlzXG4gKiBzaW1pbGFyIHRvIHByb21pc2lmeU4oKSwgZXhjZXB0IHRoYXQgaXQgcmV0YWlucyB0eXBlIHNhZmV0eS5cbiAqIEBwYXJhbSBmdW5jIC0gVGhlIE5vZGUtc3R5bGUgZnVuY3Rpb24gdGhhdCB0YWtlcyBvbmUgYXJndW1lbnQgYW5kIGFcbiAqIE5vZGUtc3R5bGUgY2FsbGJhY2suXG4gKiBAcmV0dXJuIEEgZnVuY3Rpb24gdGhhdCB0YWtlcyB0aGUgb25lIGFyZ3VtZW50IGFuZCByZXR1cm5zIGEgUHJvbWlzZSBmb3IgdGhlXG4gKiByZXN1bHQuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBwcm9taXNpZnkxPFJlc3VsdFR5cGUsIEFyZzFUeXBlPihcbiAgICBmdW5jOiAoYXJnMTogQXJnMVR5cGUsIGNiOiBDYWxsQmFja1R5cGU8UmVzdWx0VHlwZT4gKSA9PiB2b2lkXG4pOiAoYXJnMTogQXJnMVR5cGUpID0+IFByb21pc2U8UmVzdWx0VHlwZT4ge1xuXG4gICAgY29uc3QgcHJvbWlzaWZpZWRGdW5jID0gZnVuY3Rpb24gKGFyZzE6IEFyZzFUeXBlKTogUHJvbWlzZTxSZXN1bHRUeXBlPiB7XG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZTxSZXN1bHRUeXBlPigocmVzb2x2ZTogKHJlc3VsdDogUmVzdWx0VHlwZSkgPT4gdm9pZCwgcmVqZWN0OiAoZXJyOiBhbnkpID0+IHZvaWQpID0+IHtcbiAgICAgICAgICAgIGZ1bmMoYXJnMSwgKGVycjogYW55LCByZXN1bHQ/OiBSZXN1bHRUeXBlKSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKGVycikge1xuICAgICAgICAgICAgICAgICAgICByZWplY3QoZXJyKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICByZXNvbHZlKHJlc3VsdCEpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICB9O1xuICAgIHJldHVybiBwcm9taXNpZmllZEZ1bmM7XG5cbn1cblxuXG4vKipcbiAqIEFkYXB0cyBhIE5vZGUtc3R5bGUgYXN5bmMgZnVuY3Rpb24gd2l0aCB0d28gcGFyYW1ldGVycyBhbmQgYSBjYWxsYmFjayB0byBhIGZ1bmN0aW9uXG4gKiB0aGF0IHRha2VzIHR3byBwYXJhbWV0ZXJzIGFuZCByZXR1cm5zIGEgUHJvbWlzZS4gIFRoaXMgZnVuY3Rpb24gaXMgc2ltaWxhciB0b1xuICogcHJvbWlzaWZ5TigpLCBleGNlcHQgdGhhdCBpdCByZXRhaW5zIHR5cGUgc2FmZXR5LlxuICogQHBhcmFtIGZ1bmMgLSBUaGUgTm9kZS1zdHlsZSBmdW5jdGlvbiB0aGF0IHRha2VzIHR3byBhcmd1bWVudHMgYW5kIGFcbiAqIE5vZGUtc3R5bGUgY2FsbGJhY2suXG4gKiBAcmV0dXJuIEEgZnVuY3Rpb24gdGhhdCB0YWtlcyB0aGUgdHdvIGFyZ3VtZW50cyBhbmQgcmV0dXJucyBhIFByb21pc2UgZm9yIHRoZVxuICogcmVzdWx0LlxuICovXG5leHBvcnQgZnVuY3Rpb24gcHJvbWlzaWZ5MjxSZXN1bHRUeXBlLCBBcmcxVHlwZSwgQXJnMlR5cGU+KFxuICAgIGZ1bmM6IChhcmcxOiBBcmcxVHlwZSwgYXJnMjogQXJnMlR5cGUsIGNiOiBDYWxsQmFja1R5cGU8UmVzdWx0VHlwZT4gKSA9PiB2b2lkXG4pOiAoYXJnMTogQXJnMVR5cGUsIGFyZzI6IEFyZzJUeXBlKSA9PiBQcm9taXNlPFJlc3VsdFR5cGU+IHtcblxuICAgIGNvbnN0IHByb21pc2lmaWVkRnVuYyA9IGZ1bmN0aW9uIChhcmcxOiBBcmcxVHlwZSwgYXJnMjogQXJnMlR5cGUpOiBQcm9taXNlPFJlc3VsdFR5cGU+IHtcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlPFJlc3VsdFR5cGU+KChyZXNvbHZlOiAocmVzdWx0OiBSZXN1bHRUeXBlKSA9PiB2b2lkLCByZWplY3Q6IChlcnI6IGFueSkgPT4gdm9pZCkgPT4ge1xuICAgICAgICAgICAgZnVuYyhhcmcxLCBhcmcyLCAoZXJyOiBhbnksIHJlc3VsdD86IFJlc3VsdFR5cGUpID0+IHtcbiAgICAgICAgICAgICAgICBpZiAoZXJyKSB7XG4gICAgICAgICAgICAgICAgICAgIHJlamVjdChlcnIpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHJlc29sdmUocmVzdWx0ISk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgIH07XG4gICAgcmV0dXJuIHByb21pc2lmaWVkRnVuYztcbn1cblxuXG4vKipcbiAqIEFkYXB0cyBhIE5vZGUtc3R5bGUgYXN5bmMgZnVuY3Rpb24gd2l0aCB0aHJlZSBwYXJhbWV0ZXJzIGFuZCBhIGNhbGxiYWNrIHRvIGEgZnVuY3Rpb25cbiAqIHRoYXQgdGFrZXMgdGhyZWUgcGFyYW1ldGVycyBhbmQgcmV0dXJucyBhIFByb21pc2UuICBUaGlzIGZ1bmN0aW9uIGlzIHNpbWlsYXIgdG9cbiAqIHByb21pc2lmeU4oKSwgZXhjZXB0IHRoYXQgaXQgcmV0YWlucyB0eXBlIHNhZmV0eS5cbiAqIEBwYXJhbSBmdW5jIC0gVGhlIE5vZGUtc3R5bGUgZnVuY3Rpb24gdGhhdCB0YWtlcyB0aHJlZSBhcmd1bWVudHMgYW5kIGFcbiAqIE5vZGUtc3R5bGUgY2FsbGJhY2suXG4gKiBAcmV0dXJuIEEgZnVuY3Rpb24gdGhhdCB0YWtlcyB0aGUgdGhyZWUgYXJndW1lbnRzIGFuZCByZXR1cm5zIGEgUHJvbWlzZSBmb3IgdGhlXG4gKiByZXN1bHQuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBwcm9taXNpZnkzPFJlc3VsdFR5cGUsIEFyZzFUeXBlLCBBcmcyVHlwZSwgQXJnM1R5cGU+KFxuICAgIGZ1bmM6IChhcmcxOiBBcmcxVHlwZSwgYXJnMjogQXJnMlR5cGUsIGFyZzM6IEFyZzNUeXBlLCBjYjogQ2FsbEJhY2tUeXBlPFJlc3VsdFR5cGU+ICkgPT4gdm9pZFxuKTogKGFyZzE6IEFyZzFUeXBlLCBhcmcyOiBBcmcyVHlwZSwgYXJnMzogQXJnM1R5cGUpID0+IFByb21pc2U8UmVzdWx0VHlwZT4ge1xuXG4gICAgY29uc3QgcHJvbWlzaWZpZWRGdW5jID0gZnVuY3Rpb24gKGFyZzE6IEFyZzFUeXBlLCBhcmcyOiBBcmcyVHlwZSwgYXJnMzogQXJnM1R5cGUpOiBQcm9taXNlPFJlc3VsdFR5cGU+IHtcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlPFJlc3VsdFR5cGU+KChyZXNvbHZlOiAocmVzdWx0OiBSZXN1bHRUeXBlKSA9PiB2b2lkLCByZWplY3Q6IChlcnI6IGFueSkgPT4gdm9pZCkgPT4ge1xuICAgICAgICAgICAgZnVuYyhhcmcxLCBhcmcyLCBhcmczLCAoZXJyOiBhbnksIHJlc3VsdD86IFJlc3VsdFR5cGUpID0+IHtcbiAgICAgICAgICAgICAgICBpZiAoZXJyKSB7XG4gICAgICAgICAgICAgICAgICAgIHJlamVjdChlcnIpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHJlc29sdmUocmVzdWx0ISk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgIH07XG4gICAgcmV0dXJuIHByb21pc2lmaWVkRnVuYztcbn1cblxuXG4vKipcbiAqIFJ1bnMgYSBzZXF1ZW5jZSBvZiBmdW5jdGlvbnMgaW4gb3JkZXIgd2l0aCBlYWNoIHJldHVybmVkIHZhbHVlIGZlZWRpbmcgaW50b1xuICogdGhlIHBhcmFtZXRlciBvZiB0aGUgbmV4dC5cbiAqIEBwYXJhbSB0YXNrcyAtIFRoZSBmdW5jdGlvbnMgdG8gZXhlY3V0ZSBpbiBzZXF1ZW5jZS4gIEVhY2ggZnVuY3Rpb24gd2lsbFxuICogcmVjZWl2ZSAxIHBhcmFtZXRlciwgdGhlIHJldHVybiB2YWx1ZSBvZiB0aGUgcHJldmlvdXMgZnVuY3Rpb24uICBBIGZ1bmN0aW9uXG4gKiBzaG91bGQgdGhyb3cgYW4gZXhjZXB0aW9uIGlmIGl0IHdpc2hlcyB0byB0ZXJtaW5hdGUgdGhlIHNlcXVlbmNlIGFuZCByZWplY3RcbiAqIHRoZSByZXR1cm5lZCBwcm9taXNlLlxuICogQHBhcmFtIGluaXRpYWxWYWx1ZSAtIFRoZSB2YWx1ZSB0aGF0IHdpbGwgYmUgcGFzc2VkIGludG8gdGhlIGZpcnN0IGZ1bmN0aW9uLlxuICogQHJldHVybnMge1Byb21pc2U8YW55Pn0gQSBwcm9taXNlIHRoYXQgd2lsbCBiZSByZXNvbHZlZCB3aXRoIHRoZSByZXR1cm4gdmFsdWVcbiAqIG9mIHRoZSBsYXN0IGZ1bmN0aW9uLlxuICovXG5leHBvcnQgZnVuY3Rpb24gc2VxdWVuY2UoXG4gICAgdGFza3M6IEFycmF5PChwcmV2aW91c1ZhbHVlOiBhbnkpID0+IGFueT4sXG4gICAgaW5pdGlhbFZhbHVlOiBhbnlcbik6IFByb21pc2U8YW55PiB7XG4gICAgXCJ1c2Ugc3RyaWN0XCI7XG5cbiAgICByZXR1cm4gdGFza3MucmVkdWNlKFxuICAgICAgICAoYWNjdW11bGF0b3IsIGN1clRhc2spID0+IHtcbiAgICAgICAgICAgIHJldHVybiBhY2N1bXVsYXRvci50aGVuKGN1clRhc2spO1xuICAgICAgICB9LFxuICAgICAgICBQcm9taXNlLnJlc29sdmUoaW5pdGlhbFZhbHVlKSk7XG59XG5cblxuLyoqXG4gKiBBZGFwdHMgYW4gRXZlbnRFbWl0dGVyIHRvIGEgUHJvbWlzZSBpbnRlcmZhY2VcbiAqIEBwYXJhbSBlbWl0dGVyIC0gVGhlIGV2ZW50IGVtaXR0ZXIgdG8gbGlzdGVuIHRvXG4gKiBAcGFyYW0gcmVzb2x2ZUV2ZW50TmFtZSAtIFRoZSBldmVudCB0aGF0IHdpbGwgY2F1c2UgdGhlIFByb21pc2UgdG8gcmVzb2x2ZVxuICogQHBhcmFtIHJlamVjdEV2ZW50TmFtZSAtIFRoZSBldmVudCB0aGF0IHdpbGwgY2F1c2UgdGhlIFByb21pc2UgdG8gcmVqZWN0XG4gKiBAcmV0dXJuIEEgUHJvbWlzZSB0aGF0IHdpbGwgd2lsbCByZXNvbHZlIGFuZCByZWplY3QgYXMgc3BlY2lmaWVkXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBldmVudFRvUHJvbWlzZTxSZXNvbHZlVHlwZT4oXG4gICAgZW1pdHRlcjogRXZlbnRFbWl0dGVyLFxuICAgIHJlc29sdmVFdmVudE5hbWU6IHN0cmluZyxcbiAgICByZWplY3RFdmVudE5hbWU/OiBzdHJpbmdcbik6IFByb21pc2U8UmVzb2x2ZVR5cGU+XG57XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlPFJlc29sdmVUeXBlPihcbiAgICAgICAgKHJlc29sdmU6IChyZXN1bHQ6IFJlc29sdmVUeXBlKSA9PiB2b2lkLCByZWplY3Q6IChlcnI6IGFueSkgPT4gdm9pZCkgPT4ge1xuICAgICAgICAgICAgY29uc3QgdHJhY2tlciA9IG5ldyBMaXN0ZW5lclRyYWNrZXIoZW1pdHRlcik7XG5cbiAgICAgICAgICAgIHRyYWNrZXIub25jZShyZXNvbHZlRXZlbnROYW1lLCAocmVzdWx0OiBSZXNvbHZlVHlwZSkgPT4ge1xuICAgICAgICAgICAgICAgIHRyYWNrZXIucmVtb3ZlQWxsKCk7XG4gICAgICAgICAgICAgICAgcmVzb2x2ZShyZXN1bHQpO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIGlmIChyZWplY3RFdmVudE5hbWUpXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgdHJhY2tlci5vbmNlKHJlamVjdEV2ZW50TmFtZSwgKGVycjogYW55KSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHRyYWNrZXIucmVtb3ZlQWxsKCk7XG4gICAgICAgICAgICAgICAgICAgIHJlamVjdChlcnIpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgKTtcbn1cblxuXG4vKipcbiAqIEFkYXB0cyBhIHN0cmVhbSB0byBhIFByb21pc2UgaW50ZXJmYWNlLlxuICogQHBhcmFtIHN0cmVhbSAtIFRoZSBzdHJlYW0gdG8gYmUgYWRhcHRlZFxuICogQHJldHVybiBBIFByb21pc2UgdGhhdCB3aWxsIGJlIHJlc29sdmVkIHdoZW4gdGhlIHN0cmVhbSBlbWl0cyB0aGUgXCJmaW5pc2hcIlxuICogZXZlbnQgYW5kIHJlamVjdHMgd2hlbiBpdCBlbWl0cyBhbiBcImVycm9yXCIgZXZlbnQuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBzdHJlYW1Ub1Byb21pc2Uoc3RyZWFtOiBXcml0YWJsZSk6IFByb21pc2U8dm9pZD4ge1xuICAgIHJldHVybiBldmVudFRvUHJvbWlzZShzdHJlYW0sIFwiZmluaXNoXCIsIFwiZXJyb3JcIik7XG59XG4iXX0=
