"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var _ = require("lodash");
var listenerTracker_1 = require("./listenerTracker");
var BBPromise = require("bluebird");
var logger_1 = require("./logger");
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
        return new BBPromise(function (resolve, reject) {
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
        return new BBPromise(function (resolve, reject) {
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
        return new BBPromise(function (resolve, reject) {
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
        return new BBPromise(function (resolve, reject) {
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
    }, BBPromise.resolve(initialValue));
}
exports.sequence = sequence;
/**
 *  Creates a promise that is resolved when all input promises have been
 *  settled (resolved or rejected).  The returned Promise is resolved with an
 *  array of BBPromise.Inspection objects.
 *
 *  This is the commonly accepted way of implementing allSettled() in Bluebird.
 *  See:  http://bluebirdjs.com/docs/api/reflect.html
 *
 * @param promises - The array of input promises.
 * @returns A promise that will be resolved with an inspection object for each
 * input promise.
 */
function allSettled(promises) {
    "use strict";
    var wrappedPromises = _.map(promises, function (curPromise) { return BBPromise.resolve(curPromise).reflect(); });
    return BBPromise.all(wrappedPromises);
}
exports.allSettled = allSettled;
/**
 * Gets a Promise that will resolve with resolveValue after the specified number
 * of milliseconds.
 *
 * @param ms - The number of milliseconds to delay before the Promise will be
 * resolved.
 * @param resolveValue - The value the Promise will be resolved with.
 * @returns A Promise that will be resolved with the specified value
 * after the specified delay
 */
function getTimerPromise(ms, resolveValue) {
    "use strict";
    return new BBPromise(function (resolve) {
        setTimeout(function () {
            resolve(resolveValue);
        }, ms);
    });
}
exports.getTimerPromise = getTimerPromise;
/**
 * Adapts an EventEmitter to a Promise interface
 * @param emitter - The event emitter to listen to
 * @param resolveEventName - The event that will cause the Promise to resolve
 * @param rejectEventName - The event that will cause the Promise to reject
 * @return A Promise that will will resolve and reject as specified
 */
function eventToPromise(emitter, resolveEventName, rejectEventName) {
    return new BBPromise(function (resolve, reject) {
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
/**
 * Adapts a promise-returning function into a promise-returning function that
 * will retry the operation up to maxNumAttempts times before rejecting.
 * Retries are performed using exponential backoff.
 *
 * @param theFunc - The promise-returning function that will be retried multiple
 * times
 *
 * @param maxNumAttempts - The maximum number of times to invoke theFunc before
 * rejecting the returned Promise.  This argument should always be greater than
 * or equal to 1.  If it is not, theFunc will be tried only once.
 *
 * @returns {Promise} A Promise that will be resolved immediately (with the same
 * value) when the promise returned by the Func resolves.  If the Promise
 * returned by theFunc rejects, it will be retried up to maxNumAttempts
 * invocations.  If the Promise returned by the last invocation of theFunc
 * rejects, the returned Promise will be rejected with the same value.
 */
function retry(theFunc, maxNumAttempts) {
    "use strict";
    return retryWhileImpl(theFunc, function () { return true; }, maxNumAttempts, 0);
}
exports.retry = retry;
/**
 * Adapts a promise-returning function into a promise-returning function that
 * will continue to retry the operation as long as whilePredicate returns true
 * up to maxNumAttempts attempts before rejecting.  Retries are performed using
 * exponential backoff.
 *
 * @param theFunc - The promise-returning function that will be retried multiple
 * times
 *
 * @param whilePredicate - A function that determines whether the operation
 * should continue being retried.  This function takes the value returned by the
 * last rejection and returns true if retrying should continue or false otherwise.
 *
 * @param maxNumAttempts - The maximum number of times to invoke theFunc before
 * rejecting the returned Promise.  This argument should always be greater than
 * or equal to 1.  If it is not, theFunc will be tried only once.
 *
 * @returns {Promise} A Promise that will be resolved immediately (with the same
 * value) when the promise returned by the Func resolves.  If the Promise
 * returned by theFunc rejects, it will be retried up to maxNumAttempts
 * invocations.  If the Promise returned by the last invocation of theFunc
 * rejects, the returned Promise will be rejected with the same value.
 */
function retryWhile(theFunc, whilePredicate, maxNumAttempts) {
    "use strict";
    return retryWhileImpl(theFunc, whilePredicate, maxNumAttempts, 0);
}
exports.retryWhile = retryWhile;
/**
 * The value that will be multiplied by successively higher powers of 2 when
 * calculating delay time during exponential backoff.
 * @type {number}
 */
var BACKOFF_MULTIPLIER = 20;
/**
 * Recursive implementation of retryWhile(), allowing for additional
 * implementation specific arguments.
 * @param theFunc - The operation to perform
 * @param whilePredicate - Predicate that determines whether to retry
 * @param maxNumAttempts - Maximum number of invocations of theFunc
 * @param attemptsSoFar - Number of theFunc invocations so far
 * @returns {Promise} The Promise returned to the client
 */
function retryWhileImpl(theFunc, whilePredicate, maxNumAttempts, attemptsSoFar) {
    "use strict";
    return new BBPromise(function (resolve, reject) {
        ++attemptsSoFar;
        theFunc()
            .then(function (value) {
            // The current iteration resolved.  Return the value to the client
            // immediately.
            resolve(value);
        }, function (err) {
            // The promise was rejected.
            if (attemptsSoFar >= maxNumAttempts) {
                logger_1.logger.error("Retry operation failed after " + maxNumAttempts + " attempts.");
                reject(err);
            }
            else if (!whilePredicate(err)) {
                logger_1.logger.error("Stopped retrying operation because while predicate returned false." + err);
                reject(err);
            }
            else {
                var backoffBaseMs = Math.pow(2, attemptsSoFar - 1) * BACKOFF_MULTIPLIER;
                // A random amount of time should be added to or
                // subtracted from the base so that multiple retries
                // don't get stacked on top of each other, making
                // the congestion even worse.  This random range
                // should be either the multiplier or 25% of the
                // calculated base, whichever is larger.
                var randomHalfRange = Math.max(BACKOFF_MULTIPLIER, 0.25 * backoffBaseMs);
                var randomMs = _.random(-1 * randomHalfRange, randomHalfRange);
                var delayMs = backoffBaseMs + randomMs;
                logger_1.logger.info("Failed. Queuing next attempt in " + backoffBaseMs + " + " + randomMs + " (" + delayMs + ") ms\n");
                var timerPromise = getTimerPromise(delayMs, undefined);
                resolve(timerPromise
                    .then(function () {
                    return retryWhileImpl(theFunc, whilePredicate, maxNumAttempts, attemptsSoFar);
                }));
            }
        });
    });
}
/**
 * A promise version of a while() {} loop
 * @param predicate - A predicate that will be invoked before each iteration of
 * body.  Iteration will stop when this function returns false.
 * @param body - A promise returning function that will be invoked for each
 * iteration.  This function is responsible for making predicate eventually return false.
 * @returns {Promise<void>} A Promise that is resolved when all iterations have
 * successfully completed or will be rejected when body returns a rejected promise.
 */
function promiseWhile(predicate, body) {
    "use strict";
    return new BBPromise(function (resolve, reject) {
        function loop() {
            if (!predicate()) {
                // We are done iterating.  Resolve with a void value.
                return resolve();
            }
            // We are not done iterating.  Invoke body() and execute this loop
            // again when it resolves.  Note: The value returned from body() is
            // wrapped in a promise in case it doesn't return a promise.
            BBPromise.resolve(body())
                .then(loop, reject);
        }
        // Get things started.  loop() will queue itself to run for further
        // iterations.
        setTimeout(loop, 0);
    });
}
exports.promiseWhile = promiseWhile;

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9kZXBvdC9wcm9taXNlSGVscGVycy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUVBLDBCQUE0QjtBQUM1QixxREFBa0Q7QUFDbEQsb0NBQXNDO0FBQ3RDLG1DQUFnQztBQU1oQzs7Ozs7O0dBTUc7QUFDSCxvQkFDSSxJQUFtQztJQUduQyxJQUFNLGVBQWUsR0FBRztRQUFVLGNBQW1CO2FBQW5CLFVBQW1CLEVBQW5CLHFCQUFtQixFQUFuQixJQUFtQjtZQUFuQix5QkFBbUI7O1FBRWpELE9BQU8sSUFBSSxTQUFTLENBQWEsVUFBQyxPQUFxQyxFQUFFLE1BQTBCO1lBQy9GLElBQUksQ0FBQyxLQUFLLENBQUMsU0FBUyxFQUFFLElBQUksQ0FBQyxNQUFNLENBQUMsVUFBQyxHQUFRLEVBQUUsTUFBa0I7Z0JBQzNELElBQUksR0FBRyxFQUFFO29CQUNMLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQztpQkFDZjtxQkFBTTtvQkFDSCxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUM7aUJBQ25CO1lBQ0wsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNSLENBQUMsQ0FBQyxDQUFDO0lBQ1AsQ0FBQyxDQUFDO0lBQ0YsT0FBTyxlQUFlLENBQUM7QUFDM0IsQ0FBQztBQWpCRCxnQ0FpQkM7QUFHRDs7Ozs7Ozs7R0FRRztBQUNILG9CQUNJLElBQTZEO0lBRzdELElBQU0sZUFBZSxHQUFHLFVBQVUsSUFBYztRQUM1QyxPQUFPLElBQUksU0FBUyxDQUFhLFVBQUMsT0FBcUMsRUFBRSxNQUEwQjtZQUMvRixJQUFJLENBQUMsSUFBSSxFQUFFLFVBQUMsR0FBUSxFQUFFLE1BQW1CO2dCQUNyQyxJQUFJLEdBQUcsRUFBRTtvQkFDTCxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUM7aUJBQ2Y7cUJBQU07b0JBQ0gsT0FBTyxDQUFDLE1BQU8sQ0FBQyxDQUFDO2lCQUNwQjtZQUNMLENBQUMsQ0FBQyxDQUFDO1FBQ1AsQ0FBQyxDQUFDLENBQUM7SUFDUCxDQUFDLENBQUM7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LEdBQWtCLGVBQWUsQ0FBQyxPQUFPLEVBQUUsU0FBUyxDQUFDLENBQUM7Z0JBQ3hFLE9BQU8sQ0FDSCxZQUFZO3FCQUNYLElBQUksQ0FBQztvQkFDRixPQUFPLGNBQWMsQ0FBQyxPQUFPLEVBQUUsY0FBYyxFQUFFLGNBQWMsRUFBRSxhQUFhLENBQUMsQ0FBQztnQkFDbEYsQ0FBQyxDQUFDLENBQ0wsQ0FBQzthQUNMO1FBQ0wsQ0FBQyxDQUNKLENBQUM7SUFDTixDQUFDLENBQ0osQ0FBQztBQUNOLENBQUM7QUFHRDs7Ozs7Ozs7R0FRRztBQUNILHNCQUE2QixTQUF3QixFQUFFLElBQWdCO0lBQ25FLFlBQVksQ0FBQztJQUViLE9BQU8sSUFBSSxTQUFTLENBQU8sVUFBQyxPQUFtQixFQUFFLE1BQWtCO1FBRS9EO1lBQ0ksSUFBSSxDQUFDLFNBQVMsRUFBRSxFQUFFO2dCQUNkLHFEQUFxRDtnQkFDckQsT0FBTyxPQUFPLEVBQUUsQ0FBQzthQUNwQjtZQUVELGtFQUFrRTtZQUNsRSxtRUFBbUU7WUFDbkUsNERBQTREO1lBQzVELFNBQVMsQ0FBQyxPQUFPLENBQUMsSUFBSSxFQUFFLENBQUM7aUJBQ3hCLElBQUksQ0FBQyxJQUFJLEVBQUUsTUFBTSxDQUFDLENBQUM7UUFDeEIsQ0FBQztRQUVELG1FQUFtRTtRQUNuRSxjQUFjO1FBQ2QsVUFBVSxDQUFDLElBQUksRUFBRSxDQUFDLENBQUMsQ0FBQztJQUN4QixDQUFDLENBQUMsQ0FBQztBQUNQLENBQUM7QUF0QkQsb0NBc0JDIiwiZmlsZSI6ImRlcG90L3Byb21pc2VIZWxwZXJzLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtXcml0YWJsZX0gZnJvbSBcInN0cmVhbVwiO1xuaW1wb3J0IHtFdmVudEVtaXR0ZXJ9IGZyb20gXCJldmVudHNcIjtcbmltcG9ydCAqIGFzIF8gZnJvbSBcImxvZGFzaFwiO1xuaW1wb3J0IHtMaXN0ZW5lclRyYWNrZXJ9IGZyb20gXCIuL2xpc3RlbmVyVHJhY2tlclwiO1xuaW1wb3J0ICogYXMgQkJQcm9taXNlIGZyb20gXCJibHVlYmlyZFwiO1xuaW1wb3J0IHtsb2dnZXJ9IGZyb20gXCIuL2xvZ2dlclwiO1xuXG5cbmV4cG9ydCB0eXBlIENhbGxCYWNrVHlwZTxSZXN1bHRUeXBlPiA9IChlcnI6IGFueSwgcmVzdWx0PzogUmVzdWx0VHlwZSkgPT4gdm9pZDtcblxuXG4vKipcbiAqIEFkYXB0cyBhIE5vZGUtc3R5bGUgYXN5bmMgZnVuY3Rpb24gd2l0aCBhbnkgbnVtYmVyIG9mIGFyZ3VtZW50cyBhbmQgYSBjYWxsYmFjayB0byBhXG4gKiBmdW5jdGlvbiB0aGF0IGhhcyB0aGUgc2FtZSBhcmd1bWVudHMgKG1pbnVzIHRoZSBjYWxsYmFjaykgYW5kIHJldHVybnMgYSBQcm9taXNlLlxuICogQHBhcmFtIGZ1bmMgLSBUaGUgTm9kZS1zdHlsZSBmdW5jdGlvbiB0aGF0IHRha2VzIGFyZ3VtZW50cyBmb2xsb3dlZCBieSBhXG4gKiBOb2RlLXN0eWxlIGNhbGxiYWNrLlxuICogQHJldHVybiBBIGZ1bmN0aW9uIHRoYXQgdGFrZXMgdGhlIGFyZ3VtZW50cyBhbmQgcmV0dXJucyBhIFByb21pc2UgZm9yIHRoZSByZXN1bHQuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBwcm9taXNpZnlOPFJlc3VsdFR5cGU+KFxuICAgIGZ1bmM6ICguLi5hcmdzOiBBcnJheTxhbnk+KSA9PiB2b2lkXG4pOiAoLi4uYXJnczogQXJyYXk8YW55PikgPT4gUHJvbWlzZTxSZXN1bHRUeXBlPiB7XG5cbiAgICBjb25zdCBwcm9taXNpZmllZEZ1bmMgPSBmdW5jdGlvbiAoLi4uYXJnczogQXJyYXk8YW55Pik6IFByb21pc2U8UmVzdWx0VHlwZT4ge1xuXG4gICAgICAgIHJldHVybiBuZXcgQkJQcm9taXNlPFJlc3VsdFR5cGU+KChyZXNvbHZlOiAocmVzdWx0OiBSZXN1bHRUeXBlKSA9PiB2b2lkLCByZWplY3Q6IChlcnI6IGFueSkgPT4gdm9pZCkgPT4ge1xuICAgICAgICAgICAgZnVuYy5hcHBseSh1bmRlZmluZWQsIGFyZ3MuY29uY2F0KChlcnI6IGFueSwgcmVzdWx0OiBSZXN1bHRUeXBlKSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKGVycikge1xuICAgICAgICAgICAgICAgICAgICByZWplY3QoZXJyKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICByZXNvbHZlKHJlc3VsdCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSkpO1xuICAgICAgICB9KTtcbiAgICB9O1xuICAgIHJldHVybiBwcm9taXNpZmllZEZ1bmM7XG59XG5cblxuLyoqXG4gKiBBZGFwdHMgYSBOb2RlLXN0eWxlIGFzeW5jIGZ1bmN0aW9uIHdpdGggb25lIHBhcmFtZXRlciBhbmQgYSBjYWxsYmFjayB0byBhXG4gKiBmdW5jdGlvbiB0aGF0IHRha2VzIG9uZSBwYXJhbWV0ZXIgYW5kIHJldHVybnMgYSBQcm9taXNlLiAgVGhpcyBmdW5jdGlvbiBpc1xuICogc2ltaWxhciB0byBwcm9taXNpZnlOKCksIGV4Y2VwdCB0aGF0IGl0IHJldGFpbnMgdHlwZSBzYWZldHkuXG4gKiBAcGFyYW0gZnVuYyAtIFRoZSBOb2RlLXN0eWxlIGZ1bmN0aW9uIHRoYXQgdGFrZXMgb25lIGFyZ3VtZW50IGFuZCBhXG4gKiBOb2RlLXN0eWxlIGNhbGxiYWNrLlxuICogQHJldHVybiBBIGZ1bmN0aW9uIHRoYXQgdGFrZXMgdGhlIG9uZSBhcmd1bWVudCBhbmQgcmV0dXJucyBhIFByb21pc2UgZm9yIHRoZVxuICogcmVzdWx0LlxuICovXG5leHBvcnQgZnVuY3Rpb24gcHJvbWlzaWZ5MTxSZXN1bHRUeXBlLCBBcmcxVHlwZT4oXG4gICAgZnVuYzogKGFyZzE6IEFyZzFUeXBlLCBjYjogQ2FsbEJhY2tUeXBlPFJlc3VsdFR5cGU+ICkgPT4gdm9pZFxuKTogKGFyZzE6IEFyZzFUeXBlKSA9PiBQcm9taXNlPFJlc3VsdFR5cGU+IHtcblxuICAgIGNvbnN0IHByb21pc2lmaWVkRnVuYyA9IGZ1bmN0aW9uIChhcmcxOiBBcmcxVHlwZSk6IFByb21pc2U8UmVzdWx0VHlwZT4ge1xuICAgICAgICByZXR1cm4gbmV3IEJCUHJvbWlzZTxSZXN1bHRUeXBlPigocmVzb2x2ZTogKHJlc3VsdDogUmVzdWx0VHlwZSkgPT4gdm9pZCwgcmVqZWN0OiAoZXJyOiBhbnkpID0+IHZvaWQpID0+IHtcbiAgICAgICAgICAgIGZ1bmMoYXJnMSwgKGVycjogYW55LCByZXN1bHQ/OiBSZXN1bHRUeXBlKSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKGVycikge1xuICAgICAgICAgICAgICAgICAgICByZWplY3QoZXJyKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICByZXNvbHZlKHJlc3VsdCEpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICB9O1xuICAgIHJldHVybiBwcm9taXNpZmllZEZ1bmM7XG5cbn1cblxuXG4vKipcbiAqIEFkYXB0cyBhIE5vZGUtc3R5bGUgYXN5bmMgZnVuY3Rpb24gd2l0aCB0d28gcGFyYW1ldGVycyBhbmQgYSBjYWxsYmFjayB0byBhIGZ1bmN0aW9uXG4gKiB0aGF0IHRha2VzIHR3byBwYXJhbWV0ZXJzIGFuZCByZXR1cm5zIGEgUHJvbWlzZS4gIFRoaXMgZnVuY3Rpb24gaXMgc2ltaWxhciB0b1xuICogcHJvbWlzaWZ5TigpLCBleGNlcHQgdGhhdCBpdCByZXRhaW5zIHR5cGUgc2FmZXR5LlxuICogQHBhcmFtIGZ1bmMgLSBUaGUgTm9kZS1zdHlsZSBmdW5jdGlvbiB0aGF0IHRha2VzIHR3byBhcmd1bWVudHMgYW5kIGFcbiAqIE5vZGUtc3R5bGUgY2FsbGJhY2suXG4gKiBAcmV0dXJuIEEgZnVuY3Rpb24gdGhhdCB0YWtlcyB0aGUgdHdvIGFyZ3VtZW50cyBhbmQgcmV0dXJucyBhIFByb21pc2UgZm9yIHRoZVxuICogcmVzdWx0LlxuICovXG5leHBvcnQgZnVuY3Rpb24gcHJvbWlzaWZ5MjxSZXN1bHRUeXBlLCBBcmcxVHlwZSwgQXJnMlR5cGU+KFxuICAgIGZ1bmM6IChhcmcxOiBBcmcxVHlwZSwgYXJnMjogQXJnMlR5cGUsIGNiOiBDYWxsQmFja1R5cGU8UmVzdWx0VHlwZT4gKSA9PiB2b2lkXG4pOiAoYXJnMTogQXJnMVR5cGUsIGFyZzI6IEFyZzJUeXBlKSA9PiBQcm9taXNlPFJlc3VsdFR5cGU+IHtcblxuICAgIGNvbnN0IHByb21pc2lmaWVkRnVuYyA9IGZ1bmN0aW9uIChhcmcxOiBBcmcxVHlwZSwgYXJnMjogQXJnMlR5cGUpOiBQcm9taXNlPFJlc3VsdFR5cGU+IHtcbiAgICAgICAgcmV0dXJuIG5ldyBCQlByb21pc2U8UmVzdWx0VHlwZT4oKHJlc29sdmU6IChyZXN1bHQ6IFJlc3VsdFR5cGUpID0+IHZvaWQsIHJlamVjdDogKGVycjogYW55KSA9PiB2b2lkKSA9PiB7XG4gICAgICAgICAgICBmdW5jKGFyZzEsIGFyZzIsIChlcnI6IGFueSwgcmVzdWx0PzogUmVzdWx0VHlwZSkgPT4ge1xuICAgICAgICAgICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICAgICAgICAgICAgcmVqZWN0KGVycik7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZShyZXN1bHQhKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgfTtcbiAgICByZXR1cm4gcHJvbWlzaWZpZWRGdW5jO1xufVxuXG5cbi8qKlxuICogQWRhcHRzIGEgTm9kZS1zdHlsZSBhc3luYyBmdW5jdGlvbiB3aXRoIHRocmVlIHBhcmFtZXRlcnMgYW5kIGEgY2FsbGJhY2sgdG8gYSBmdW5jdGlvblxuICogdGhhdCB0YWtlcyB0aHJlZSBwYXJhbWV0ZXJzIGFuZCByZXR1cm5zIGEgUHJvbWlzZS4gIFRoaXMgZnVuY3Rpb24gaXMgc2ltaWxhciB0b1xuICogcHJvbWlzaWZ5TigpLCBleGNlcHQgdGhhdCBpdCByZXRhaW5zIHR5cGUgc2FmZXR5LlxuICogQHBhcmFtIGZ1bmMgLSBUaGUgTm9kZS1zdHlsZSBmdW5jdGlvbiB0aGF0IHRha2VzIHRocmVlIGFyZ3VtZW50cyBhbmQgYVxuICogTm9kZS1zdHlsZSBjYWxsYmFjay5cbiAqIEByZXR1cm4gQSBmdW5jdGlvbiB0aGF0IHRha2VzIHRoZSB0aHJlZSBhcmd1bWVudHMgYW5kIHJldHVybnMgYSBQcm9taXNlIGZvciB0aGVcbiAqIHJlc3VsdC5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHByb21pc2lmeTM8UmVzdWx0VHlwZSwgQXJnMVR5cGUsIEFyZzJUeXBlLCBBcmczVHlwZT4oXG4gICAgZnVuYzogKGFyZzE6IEFyZzFUeXBlLCBhcmcyOiBBcmcyVHlwZSwgYXJnMzogQXJnM1R5cGUsIGNiOiBDYWxsQmFja1R5cGU8UmVzdWx0VHlwZT4gKSA9PiB2b2lkXG4pOiAoYXJnMTogQXJnMVR5cGUsIGFyZzI6IEFyZzJUeXBlLCBhcmczOiBBcmczVHlwZSkgPT4gUHJvbWlzZTxSZXN1bHRUeXBlPiB7XG5cbiAgICBjb25zdCBwcm9taXNpZmllZEZ1bmMgPSBmdW5jdGlvbiAoYXJnMTogQXJnMVR5cGUsIGFyZzI6IEFyZzJUeXBlLCBhcmczOiBBcmczVHlwZSk6IFByb21pc2U8UmVzdWx0VHlwZT4ge1xuICAgICAgICByZXR1cm4gbmV3IEJCUHJvbWlzZTxSZXN1bHRUeXBlPigocmVzb2x2ZTogKHJlc3VsdDogUmVzdWx0VHlwZSkgPT4gdm9pZCwgcmVqZWN0OiAoZXJyOiBhbnkpID0+IHZvaWQpID0+IHtcbiAgICAgICAgICAgIGZ1bmMoYXJnMSwgYXJnMiwgYXJnMywgKGVycjogYW55LCByZXN1bHQ/OiBSZXN1bHRUeXBlKSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKGVycikge1xuICAgICAgICAgICAgICAgICAgICByZWplY3QoZXJyKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICByZXNvbHZlKHJlc3VsdCEpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICB9O1xuICAgIHJldHVybiBwcm9taXNpZmllZEZ1bmM7XG59XG5cblxuLyoqXG4gKiBBIHRhc2sgaXMgYW55IG9wZXJhdGlvbiB0aGF0IGNhbiBiZSBzdGFydGVkIChpLmUuIGNhbGxlZCkgd2hpY2ggY29tcGxldGVzIGF0XG4gKiBzb21lIHBvaW50IGluIHRoZSBmdXR1cmUuXG4gKi9cbmV4cG9ydCB0eXBlIFRhc2s8UmVzb2x2ZVR5cGU+ID0gKCkgPT4gUHJvbWlzZTxSZXNvbHZlVHlwZT47XG5cblxuLyoqXG4gKiBSdW5zIGEgc2VxdWVuY2Ugb2YgZnVuY3Rpb25zIGluIG9yZGVyIHdpdGggZWFjaCByZXR1cm5lZCB2YWx1ZSBmZWVkaW5nIGludG9cbiAqIHRoZSBwYXJhbWV0ZXIgb2YgdGhlIG5leHQuXG4gKiBAcGFyYW0gdGFza3MgLSBUaGUgZnVuY3Rpb25zIHRvIGV4ZWN1dGUgaW4gc2VxdWVuY2UuICBFYWNoIGZ1bmN0aW9uIHdpbGxcbiAqIHJlY2VpdmUgMSBwYXJhbWV0ZXIsIHRoZSByZXR1cm4gdmFsdWUgb2YgdGhlIHByZXZpb3VzIGZ1bmN0aW9uLiAgQSBmdW5jdGlvblxuICogc2hvdWxkIHRocm93IGFuIGV4Y2VwdGlvbiBpZiBpdCB3aXNoZXMgdG8gdGVybWluYXRlIHRoZSBzZXF1ZW5jZSBhbmQgcmVqZWN0XG4gKiB0aGUgcmV0dXJuZWQgcHJvbWlzZS5cbiAqIEBwYXJhbSBpbml0aWFsVmFsdWUgLSBUaGUgdmFsdWUgdGhhdCB3aWxsIGJlIHBhc3NlZCBpbnRvIHRoZSBmaXJzdCBmdW5jdGlvbi5cbiAqIEByZXR1cm5zIHtQcm9taXNlPGFueT59IEEgcHJvbWlzZSB0aGF0IHdpbGwgYmUgcmVzb2x2ZWQgd2l0aCB0aGUgcmV0dXJuIHZhbHVlXG4gKiBvZiB0aGUgbGFzdCBmdW5jdGlvbi5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHNlcXVlbmNlKFxuICAgIHRhc2tzOiBBcnJheTwocHJldmlvdXNWYWx1ZTogYW55KSA9PiBhbnk+LFxuICAgIGluaXRpYWxWYWx1ZTogYW55XG4pOiBQcm9taXNlPGFueT4ge1xuICAgIFwidXNlIHN0cmljdFwiO1xuXG4gICAgcmV0dXJuIHRhc2tzLnJlZHVjZShcbiAgICAgICAgKGFjY3VtdWxhdG9yLCBjdXJUYXNrKSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gYWNjdW11bGF0b3IudGhlbihjdXJUYXNrKTtcbiAgICAgICAgfSxcbiAgICAgICAgQkJQcm9taXNlLnJlc29sdmUoaW5pdGlhbFZhbHVlKSk7XG59XG5cblxuLyoqXG4gKiAgQ3JlYXRlcyBhIHByb21pc2UgdGhhdCBpcyByZXNvbHZlZCB3aGVuIGFsbCBpbnB1dCBwcm9taXNlcyBoYXZlIGJlZW5cbiAqICBzZXR0bGVkIChyZXNvbHZlZCBvciByZWplY3RlZCkuICBUaGUgcmV0dXJuZWQgUHJvbWlzZSBpcyByZXNvbHZlZCB3aXRoIGFuXG4gKiAgYXJyYXkgb2YgQkJQcm9taXNlLkluc3BlY3Rpb24gb2JqZWN0cy5cbiAqXG4gKiAgVGhpcyBpcyB0aGUgY29tbW9ubHkgYWNjZXB0ZWQgd2F5IG9mIGltcGxlbWVudGluZyBhbGxTZXR0bGVkKCkgaW4gQmx1ZWJpcmQuXG4gKiAgU2VlOiAgaHR0cDovL2JsdWViaXJkanMuY29tL2RvY3MvYXBpL3JlZmxlY3QuaHRtbFxuICpcbiAqIEBwYXJhbSBwcm9taXNlcyAtIFRoZSBhcnJheSBvZiBpbnB1dCBwcm9taXNlcy5cbiAqIEByZXR1cm5zIEEgcHJvbWlzZSB0aGF0IHdpbGwgYmUgcmVzb2x2ZWQgd2l0aCBhbiBpbnNwZWN0aW9uIG9iamVjdCBmb3IgZWFjaFxuICogaW5wdXQgcHJvbWlzZS5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGFsbFNldHRsZWQocHJvbWlzZXM6IEFycmF5PFByb21pc2U8YW55Pj4pOiBQcm9taXNlPEFycmF5PEJCUHJvbWlzZS5JbnNwZWN0aW9uPGFueT4+PiAge1xuICAgIFwidXNlIHN0cmljdFwiO1xuXG4gICAgY29uc3Qgd3JhcHBlZFByb21pc2VzOiBBcnJheTxCQlByb21pc2UuSW5zcGVjdGlvbjxhbnk+PiA9IF8ubWFwKFxuICAgICAgICBwcm9taXNlcyxcbiAgICAgICAgKGN1clByb21pc2U6IFByb21pc2U8YW55PikgPT4gQkJQcm9taXNlLnJlc29sdmUoY3VyUHJvbWlzZSkucmVmbGVjdCgpKTtcbiAgICByZXR1cm4gQkJQcm9taXNlLmFsbCh3cmFwcGVkUHJvbWlzZXMpO1xufVxuXG5cbi8qKlxuICogR2V0cyBhIFByb21pc2UgdGhhdCB3aWxsIHJlc29sdmUgd2l0aCByZXNvbHZlVmFsdWUgYWZ0ZXIgdGhlIHNwZWNpZmllZCBudW1iZXJcbiAqIG9mIG1pbGxpc2Vjb25kcy5cbiAqXG4gKiBAcGFyYW0gbXMgLSBUaGUgbnVtYmVyIG9mIG1pbGxpc2Vjb25kcyB0byBkZWxheSBiZWZvcmUgdGhlIFByb21pc2Ugd2lsbCBiZVxuICogcmVzb2x2ZWQuXG4gKiBAcGFyYW0gcmVzb2x2ZVZhbHVlIC0gVGhlIHZhbHVlIHRoZSBQcm9taXNlIHdpbGwgYmUgcmVzb2x2ZWQgd2l0aC5cbiAqIEByZXR1cm5zIEEgUHJvbWlzZSB0aGF0IHdpbGwgYmUgcmVzb2x2ZWQgd2l0aCB0aGUgc3BlY2lmaWVkIHZhbHVlXG4gKiBhZnRlciB0aGUgc3BlY2lmaWVkIGRlbGF5XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXRUaW1lclByb21pc2U8UmVzb2x2ZVR5cGU+KFxuICAgIG1zOiAgICAgICAgICAgIG51bWJlcixcbiAgICByZXNvbHZlVmFsdWU6ICBSZXNvbHZlVHlwZVxuKTogUHJvbWlzZTxSZXNvbHZlVHlwZT4ge1xuICAgIFwidXNlIHN0cmljdFwiO1xuXG4gICAgcmV0dXJuIG5ldyBCQlByb21pc2UoXG4gICAgICAgIChyZXNvbHZlOiAocmVzb2x2ZVZhbHVlOiBSZXNvbHZlVHlwZSkgPT4gdm9pZCkgPT4ge1xuICAgICAgICAgICAgc2V0VGltZW91dChcbiAgICAgICAgICAgICAgICAoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHJlc29sdmUocmVzb2x2ZVZhbHVlKTtcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIG1zXG4gICAgICAgICAgICApO1xuICAgICAgICB9XG4gICAgKTtcblxufVxuXG5cbi8qKlxuICogQWRhcHRzIGFuIEV2ZW50RW1pdHRlciB0byBhIFByb21pc2UgaW50ZXJmYWNlXG4gKiBAcGFyYW0gZW1pdHRlciAtIFRoZSBldmVudCBlbWl0dGVyIHRvIGxpc3RlbiB0b1xuICogQHBhcmFtIHJlc29sdmVFdmVudE5hbWUgLSBUaGUgZXZlbnQgdGhhdCB3aWxsIGNhdXNlIHRoZSBQcm9taXNlIHRvIHJlc29sdmVcbiAqIEBwYXJhbSByZWplY3RFdmVudE5hbWUgLSBUaGUgZXZlbnQgdGhhdCB3aWxsIGNhdXNlIHRoZSBQcm9taXNlIHRvIHJlamVjdFxuICogQHJldHVybiBBIFByb21pc2UgdGhhdCB3aWxsIHdpbGwgcmVzb2x2ZSBhbmQgcmVqZWN0IGFzIHNwZWNpZmllZFxuICovXG5leHBvcnQgZnVuY3Rpb24gZXZlbnRUb1Byb21pc2U8UmVzb2x2ZVR5cGU+KFxuICAgIGVtaXR0ZXI6IEV2ZW50RW1pdHRlcixcbiAgICByZXNvbHZlRXZlbnROYW1lOiBzdHJpbmcsXG4gICAgcmVqZWN0RXZlbnROYW1lPzogc3RyaW5nXG4pOiBQcm9taXNlPFJlc29sdmVUeXBlPlxue1xuICAgIHJldHVybiBuZXcgQkJQcm9taXNlPFJlc29sdmVUeXBlPihcbiAgICAgICAgKHJlc29sdmU6IChyZXN1bHQ6IFJlc29sdmVUeXBlKSA9PiB2b2lkLCByZWplY3Q6IChlcnI6IGFueSkgPT4gdm9pZCkgPT4ge1xuICAgICAgICAgICAgY29uc3QgdHJhY2tlciA9IG5ldyBMaXN0ZW5lclRyYWNrZXIoZW1pdHRlcik7XG5cbiAgICAgICAgICAgIHRyYWNrZXIub25jZShyZXNvbHZlRXZlbnROYW1lLCAocmVzdWx0OiBSZXNvbHZlVHlwZSkgPT4ge1xuICAgICAgICAgICAgICAgIHRyYWNrZXIucmVtb3ZlQWxsKCk7XG4gICAgICAgICAgICAgICAgcmVzb2x2ZShyZXN1bHQpO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIGlmIChyZWplY3RFdmVudE5hbWUpXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgdHJhY2tlci5vbmNlKHJlamVjdEV2ZW50TmFtZSwgKGVycjogYW55KSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHRyYWNrZXIucmVtb3ZlQWxsKCk7XG4gICAgICAgICAgICAgICAgICAgIHJlamVjdChlcnIpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgKTtcbn1cblxuXG4vKipcbiAqIEFkYXB0cyBhIHN0cmVhbSB0byBhIFByb21pc2UgaW50ZXJmYWNlLlxuICogQHBhcmFtIHN0cmVhbSAtIFRoZSBzdHJlYW0gdG8gYmUgYWRhcHRlZFxuICogQHJldHVybiBBIFByb21pc2UgdGhhdCB3aWxsIGJlIHJlc29sdmVkIHdoZW4gdGhlIHN0cmVhbSBlbWl0cyB0aGUgXCJmaW5pc2hcIlxuICogZXZlbnQgYW5kIHJlamVjdHMgd2hlbiBpdCBlbWl0cyBhbiBcImVycm9yXCIgZXZlbnQuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBzdHJlYW1Ub1Byb21pc2Uoc3RyZWFtOiBXcml0YWJsZSk6IFByb21pc2U8dm9pZD4ge1xuICAgIHJldHVybiBldmVudFRvUHJvbWlzZShzdHJlYW0sIFwiZmluaXNoXCIsIFwiZXJyb3JcIik7XG59XG5cblxuLyoqXG4gKiBBZGFwdHMgYSBwcm9taXNlLXJldHVybmluZyBmdW5jdGlvbiBpbnRvIGEgcHJvbWlzZS1yZXR1cm5pbmcgZnVuY3Rpb24gdGhhdFxuICogd2lsbCByZXRyeSB0aGUgb3BlcmF0aW9uIHVwIHRvIG1heE51bUF0dGVtcHRzIHRpbWVzIGJlZm9yZSByZWplY3RpbmcuXG4gKiBSZXRyaWVzIGFyZSBwZXJmb3JtZWQgdXNpbmcgZXhwb25lbnRpYWwgYmFja29mZi5cbiAqXG4gKiBAcGFyYW0gdGhlRnVuYyAtIFRoZSBwcm9taXNlLXJldHVybmluZyBmdW5jdGlvbiB0aGF0IHdpbGwgYmUgcmV0cmllZCBtdWx0aXBsZVxuICogdGltZXNcbiAqXG4gKiBAcGFyYW0gbWF4TnVtQXR0ZW1wdHMgLSBUaGUgbWF4aW11bSBudW1iZXIgb2YgdGltZXMgdG8gaW52b2tlIHRoZUZ1bmMgYmVmb3JlXG4gKiByZWplY3RpbmcgdGhlIHJldHVybmVkIFByb21pc2UuICBUaGlzIGFyZ3VtZW50IHNob3VsZCBhbHdheXMgYmUgZ3JlYXRlciB0aGFuXG4gKiBvciBlcXVhbCB0byAxLiAgSWYgaXQgaXMgbm90LCB0aGVGdW5jIHdpbGwgYmUgdHJpZWQgb25seSBvbmNlLlxuICpcbiAqIEByZXR1cm5zIHtQcm9taXNlfSBBIFByb21pc2UgdGhhdCB3aWxsIGJlIHJlc29sdmVkIGltbWVkaWF0ZWx5ICh3aXRoIHRoZSBzYW1lXG4gKiB2YWx1ZSkgd2hlbiB0aGUgcHJvbWlzZSByZXR1cm5lZCBieSB0aGUgRnVuYyByZXNvbHZlcy4gIElmIHRoZSBQcm9taXNlXG4gKiByZXR1cm5lZCBieSB0aGVGdW5jIHJlamVjdHMsIGl0IHdpbGwgYmUgcmV0cmllZCB1cCB0byBtYXhOdW1BdHRlbXB0c1xuICogaW52b2NhdGlvbnMuICBJZiB0aGUgUHJvbWlzZSByZXR1cm5lZCBieSB0aGUgbGFzdCBpbnZvY2F0aW9uIG9mIHRoZUZ1bmNcbiAqIHJlamVjdHMsIHRoZSByZXR1cm5lZCBQcm9taXNlIHdpbGwgYmUgcmVqZWN0ZWQgd2l0aCB0aGUgc2FtZSB2YWx1ZS5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHJldHJ5PFJlc29sdmVUeXBlPihcbiAgICB0aGVGdW5jOiAgICAgICAgICgpID0+IFByb21pc2U8UmVzb2x2ZVR5cGU+LFxuICAgIG1heE51bUF0dGVtcHRzOiAgbnVtYmVyXG4pOiBQcm9taXNlPFJlc29sdmVUeXBlPiB7XG4gICAgXCJ1c2Ugc3RyaWN0XCI7XG4gICAgcmV0dXJuIHJldHJ5V2hpbGVJbXBsKHRoZUZ1bmMsICgpID0+IHRydWUsIG1heE51bUF0dGVtcHRzLCAwKTtcbn1cblxuXG4vKipcbiAqIEFkYXB0cyBhIHByb21pc2UtcmV0dXJuaW5nIGZ1bmN0aW9uIGludG8gYSBwcm9taXNlLXJldHVybmluZyBmdW5jdGlvbiB0aGF0XG4gKiB3aWxsIGNvbnRpbnVlIHRvIHJldHJ5IHRoZSBvcGVyYXRpb24gYXMgbG9uZyBhcyB3aGlsZVByZWRpY2F0ZSByZXR1cm5zIHRydWVcbiAqIHVwIHRvIG1heE51bUF0dGVtcHRzIGF0dGVtcHRzIGJlZm9yZSByZWplY3RpbmcuICBSZXRyaWVzIGFyZSBwZXJmb3JtZWQgdXNpbmdcbiAqIGV4cG9uZW50aWFsIGJhY2tvZmYuXG4gKlxuICogQHBhcmFtIHRoZUZ1bmMgLSBUaGUgcHJvbWlzZS1yZXR1cm5pbmcgZnVuY3Rpb24gdGhhdCB3aWxsIGJlIHJldHJpZWQgbXVsdGlwbGVcbiAqIHRpbWVzXG4gKlxuICogQHBhcmFtIHdoaWxlUHJlZGljYXRlIC0gQSBmdW5jdGlvbiB0aGF0IGRldGVybWluZXMgd2hldGhlciB0aGUgb3BlcmF0aW9uXG4gKiBzaG91bGQgY29udGludWUgYmVpbmcgcmV0cmllZC4gIFRoaXMgZnVuY3Rpb24gdGFrZXMgdGhlIHZhbHVlIHJldHVybmVkIGJ5IHRoZVxuICogbGFzdCByZWplY3Rpb24gYW5kIHJldHVybnMgdHJ1ZSBpZiByZXRyeWluZyBzaG91bGQgY29udGludWUgb3IgZmFsc2Ugb3RoZXJ3aXNlLlxuICpcbiAqIEBwYXJhbSBtYXhOdW1BdHRlbXB0cyAtIFRoZSBtYXhpbXVtIG51bWJlciBvZiB0aW1lcyB0byBpbnZva2UgdGhlRnVuYyBiZWZvcmVcbiAqIHJlamVjdGluZyB0aGUgcmV0dXJuZWQgUHJvbWlzZS4gIFRoaXMgYXJndW1lbnQgc2hvdWxkIGFsd2F5cyBiZSBncmVhdGVyIHRoYW5cbiAqIG9yIGVxdWFsIHRvIDEuICBJZiBpdCBpcyBub3QsIHRoZUZ1bmMgd2lsbCBiZSB0cmllZCBvbmx5IG9uY2UuXG4gKlxuICogQHJldHVybnMge1Byb21pc2V9IEEgUHJvbWlzZSB0aGF0IHdpbGwgYmUgcmVzb2x2ZWQgaW1tZWRpYXRlbHkgKHdpdGggdGhlIHNhbWVcbiAqIHZhbHVlKSB3aGVuIHRoZSBwcm9taXNlIHJldHVybmVkIGJ5IHRoZSBGdW5jIHJlc29sdmVzLiAgSWYgdGhlIFByb21pc2VcbiAqIHJldHVybmVkIGJ5IHRoZUZ1bmMgcmVqZWN0cywgaXQgd2lsbCBiZSByZXRyaWVkIHVwIHRvIG1heE51bUF0dGVtcHRzXG4gKiBpbnZvY2F0aW9ucy4gIElmIHRoZSBQcm9taXNlIHJldHVybmVkIGJ5IHRoZSBsYXN0IGludm9jYXRpb24gb2YgdGhlRnVuY1xuICogcmVqZWN0cywgdGhlIHJldHVybmVkIFByb21pc2Ugd2lsbCBiZSByZWplY3RlZCB3aXRoIHRoZSBzYW1lIHZhbHVlLlxuICovXG5leHBvcnQgZnVuY3Rpb24gcmV0cnlXaGlsZTxSZXNvbHZlVHlwZT4oXG4gICAgdGhlRnVuYzogKCkgPT4gUHJvbWlzZTxSZXNvbHZlVHlwZT4sXG4gICAgd2hpbGVQcmVkaWNhdGU6IChlcnI6IGFueSkgPT4gYm9vbGVhbixcbiAgICBtYXhOdW1BdHRlbXB0czogbnVtYmVyXG4pOiBQcm9taXNlPFJlc29sdmVUeXBlPiB7XG4gICAgXCJ1c2Ugc3RyaWN0XCI7XG4gICAgcmV0dXJuIHJldHJ5V2hpbGVJbXBsKHRoZUZ1bmMsIHdoaWxlUHJlZGljYXRlLCBtYXhOdW1BdHRlbXB0cywgMCk7XG59XG5cbi8qKlxuICogVGhlIHZhbHVlIHRoYXQgd2lsbCBiZSBtdWx0aXBsaWVkIGJ5IHN1Y2Nlc3NpdmVseSBoaWdoZXIgcG93ZXJzIG9mIDIgd2hlblxuICogY2FsY3VsYXRpbmcgZGVsYXkgdGltZSBkdXJpbmcgZXhwb25lbnRpYWwgYmFja29mZi5cbiAqIEB0eXBlIHtudW1iZXJ9XG4gKi9cbmNvbnN0IEJBQ0tPRkZfTVVMVElQTElFUjogbnVtYmVyID0gMjA7XG5cblxuLyoqXG4gKiBSZWN1cnNpdmUgaW1wbGVtZW50YXRpb24gb2YgcmV0cnlXaGlsZSgpLCBhbGxvd2luZyBmb3IgYWRkaXRpb25hbFxuICogaW1wbGVtZW50YXRpb24gc3BlY2lmaWMgYXJndW1lbnRzLlxuICogQHBhcmFtIHRoZUZ1bmMgLSBUaGUgb3BlcmF0aW9uIHRvIHBlcmZvcm1cbiAqIEBwYXJhbSB3aGlsZVByZWRpY2F0ZSAtIFByZWRpY2F0ZSB0aGF0IGRldGVybWluZXMgd2hldGhlciB0byByZXRyeVxuICogQHBhcmFtIG1heE51bUF0dGVtcHRzIC0gTWF4aW11bSBudW1iZXIgb2YgaW52b2NhdGlvbnMgb2YgdGhlRnVuY1xuICogQHBhcmFtIGF0dGVtcHRzU29GYXIgLSBOdW1iZXIgb2YgdGhlRnVuYyBpbnZvY2F0aW9ucyBzbyBmYXJcbiAqIEByZXR1cm5zIHtQcm9taXNlfSBUaGUgUHJvbWlzZSByZXR1cm5lZCB0byB0aGUgY2xpZW50XG4gKi9cbmZ1bmN0aW9uIHJldHJ5V2hpbGVJbXBsPFJlc29sdmVUeXBlPihcbiAgICB0aGVGdW5jOiAgICAgICAgICgpID0+IFByb21pc2U8UmVzb2x2ZVR5cGU+LFxuICAgIHdoaWxlUHJlZGljYXRlOiAgKGVycjogYW55KSA9PiBib29sZWFuLFxuICAgIG1heE51bUF0dGVtcHRzOiAgbnVtYmVyLFxuICAgIGF0dGVtcHRzU29GYXI6ICAgbnVtYmVyXG4pOiBQcm9taXNlPFJlc29sdmVUeXBlPiB7XG4gICAgXCJ1c2Ugc3RyaWN0XCI7XG4gICAgcmV0dXJuIG5ldyBCQlByb21pc2UoXG4gICAgICAgIChyZXNvbHZlOiAodmFsdWU6IFJlc29sdmVUeXBlfFByb21pc2U8UmVzb2x2ZVR5cGU+KSA9PiB2b2lkLCByZWplY3Q6IChlcnI6IGFueSkgPT4gdm9pZCkgPT4ge1xuXG4gICAgICAgICAgICArK2F0dGVtcHRzU29GYXI7XG4gICAgICAgICAgICB0aGVGdW5jKClcbiAgICAgICAgICAgIC50aGVuKFxuICAgICAgICAgICAgICAgICh2YWx1ZTogUmVzb2x2ZVR5cGUpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgLy8gVGhlIGN1cnJlbnQgaXRlcmF0aW9uIHJlc29sdmVkLiAgUmV0dXJuIHRoZSB2YWx1ZSB0byB0aGUgY2xpZW50XG4gICAgICAgICAgICAgICAgICAgIC8vIGltbWVkaWF0ZWx5LlxuICAgICAgICAgICAgICAgICAgICByZXNvbHZlKHZhbHVlKTtcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIChlcnI6IGFueSk6IHZvaWQgPT4ge1xuICAgICAgICAgICAgICAgICAgICAvLyBUaGUgcHJvbWlzZSB3YXMgcmVqZWN0ZWQuXG4gICAgICAgICAgICAgICAgICAgIGlmIChhdHRlbXB0c1NvRmFyID49IG1heE51bUF0dGVtcHRzKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBsb2dnZXIuZXJyb3IoXCJSZXRyeSBvcGVyYXRpb24gZmFpbGVkIGFmdGVyIFwiICsgbWF4TnVtQXR0ZW1wdHMgKyBcIiBhdHRlbXB0cy5cIik7XG4gICAgICAgICAgICAgICAgICAgICAgICByZWplY3QoZXJyKTtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmICghd2hpbGVQcmVkaWNhdGUoZXJyKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgbG9nZ2VyLmVycm9yKFwiU3RvcHBlZCByZXRyeWluZyBvcGVyYXRpb24gYmVjYXVzZSB3aGlsZSBwcmVkaWNhdGUgcmV0dXJuZWQgZmFsc2UuXCIgKyBlcnIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgcmVqZWN0KGVycik7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBiYWNrb2ZmQmFzZU1zOiBudW1iZXIgPSBNYXRoLnBvdygyLCBhdHRlbXB0c1NvRmFyIC0gMSkgKiBCQUNLT0ZGX01VTFRJUExJRVI7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIEEgcmFuZG9tIGFtb3VudCBvZiB0aW1lIHNob3VsZCBiZSBhZGRlZCB0byBvclxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gc3VidHJhY3RlZCBmcm9tIHRoZSBiYXNlIHNvIHRoYXQgbXVsdGlwbGUgcmV0cmllc1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gZG9uJ3QgZ2V0IHN0YWNrZWQgb24gdG9wIG9mIGVhY2ggb3RoZXIsIG1ha2luZ1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gdGhlIGNvbmdlc3Rpb24gZXZlbiB3b3JzZS4gIFRoaXMgcmFuZG9tIHJhbmdlXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBzaG91bGQgYmUgZWl0aGVyIHRoZSBtdWx0aXBsaWVyIG9yIDI1JSBvZiB0aGVcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIGNhbGN1bGF0ZWQgYmFzZSwgd2hpY2hldmVyIGlzIGxhcmdlci5cblxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgcmFuZG9tSGFsZlJhbmdlOiBudW1iZXIgPSBNYXRoLm1heChCQUNLT0ZGX01VTFRJUExJRVIsIDAuMjUgKiBiYWNrb2ZmQmFzZU1zKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHJhbmRvbU1zOiBudW1iZXIgPSBfLnJhbmRvbSgtMSAqIHJhbmRvbUhhbGZSYW5nZSwgcmFuZG9tSGFsZlJhbmdlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGRlbGF5TXM6IG51bWJlciA9IGJhY2tvZmZCYXNlTXMgKyByYW5kb21NcztcblxuICAgICAgICAgICAgICAgICAgICAgICAgbG9nZ2VyLmluZm8oXCJGYWlsZWQuIFF1ZXVpbmcgbmV4dCBhdHRlbXB0IGluIFwiICsgYmFja29mZkJhc2VNcyArIFwiICsgXCIgKyByYW5kb21NcyArIFwiIChcIiArIGRlbGF5TXMgKyBcIikgbXNcXG5cIik7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCB0aW1lclByb21pc2U6IFByb21pc2U8dm9pZD4gPSBnZXRUaW1lclByb21pc2UoZGVsYXlNcywgdW5kZWZpbmVkKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlc29sdmUoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGltZXJQcm9taXNlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLnRoZW4oKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gcmV0cnlXaGlsZUltcGwodGhlRnVuYywgd2hpbGVQcmVkaWNhdGUsIG1heE51bUF0dGVtcHRzLCBhdHRlbXB0c1NvRmFyKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICk7XG4gICAgICAgIH1cbiAgICApO1xufVxuXG5cbi8qKlxuICogQSBwcm9taXNlIHZlcnNpb24gb2YgYSB3aGlsZSgpIHt9IGxvb3BcbiAqIEBwYXJhbSBwcmVkaWNhdGUgLSBBIHByZWRpY2F0ZSB0aGF0IHdpbGwgYmUgaW52b2tlZCBiZWZvcmUgZWFjaCBpdGVyYXRpb24gb2ZcbiAqIGJvZHkuICBJdGVyYXRpb24gd2lsbCBzdG9wIHdoZW4gdGhpcyBmdW5jdGlvbiByZXR1cm5zIGZhbHNlLlxuICogQHBhcmFtIGJvZHkgLSBBIHByb21pc2UgcmV0dXJuaW5nIGZ1bmN0aW9uIHRoYXQgd2lsbCBiZSBpbnZva2VkIGZvciBlYWNoXG4gKiBpdGVyYXRpb24uICBUaGlzIGZ1bmN0aW9uIGlzIHJlc3BvbnNpYmxlIGZvciBtYWtpbmcgcHJlZGljYXRlIGV2ZW50dWFsbHkgcmV0dXJuIGZhbHNlLlxuICogQHJldHVybnMge1Byb21pc2U8dm9pZD59IEEgUHJvbWlzZSB0aGF0IGlzIHJlc29sdmVkIHdoZW4gYWxsIGl0ZXJhdGlvbnMgaGF2ZVxuICogc3VjY2Vzc2Z1bGx5IGNvbXBsZXRlZCBvciB3aWxsIGJlIHJlamVjdGVkIHdoZW4gYm9keSByZXR1cm5zIGEgcmVqZWN0ZWQgcHJvbWlzZS5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHByb21pc2VXaGlsZShwcmVkaWNhdGU6ICgpID0+IGJvb2xlYW4sIGJvZHk6IFRhc2s8dm9pZD4pOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBcInVzZSBzdHJpY3RcIjtcblxuICAgIHJldHVybiBuZXcgQkJQcm9taXNlPHZvaWQ+KChyZXNvbHZlOiAoKSA9PiB2b2lkLCByZWplY3Q6ICgpID0+IHZvaWQpID0+IHtcblxuICAgICAgICBmdW5jdGlvbiBsb29wKCk6IHZvaWQge1xuICAgICAgICAgICAgaWYgKCFwcmVkaWNhdGUoKSkge1xuICAgICAgICAgICAgICAgIC8vIFdlIGFyZSBkb25lIGl0ZXJhdGluZy4gIFJlc29sdmUgd2l0aCBhIHZvaWQgdmFsdWUuXG4gICAgICAgICAgICAgICAgcmV0dXJuIHJlc29sdmUoKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gV2UgYXJlIG5vdCBkb25lIGl0ZXJhdGluZy4gIEludm9rZSBib2R5KCkgYW5kIGV4ZWN1dGUgdGhpcyBsb29wXG4gICAgICAgICAgICAvLyBhZ2FpbiB3aGVuIGl0IHJlc29sdmVzLiAgTm90ZTogVGhlIHZhbHVlIHJldHVybmVkIGZyb20gYm9keSgpIGlzXG4gICAgICAgICAgICAvLyB3cmFwcGVkIGluIGEgcHJvbWlzZSBpbiBjYXNlIGl0IGRvZXNuJ3QgcmV0dXJuIGEgcHJvbWlzZS5cbiAgICAgICAgICAgIEJCUHJvbWlzZS5yZXNvbHZlKGJvZHkoKSlcbiAgICAgICAgICAgIC50aGVuKGxvb3AsIHJlamVjdCk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBHZXQgdGhpbmdzIHN0YXJ0ZWQuICBsb29wKCkgd2lsbCBxdWV1ZSBpdHNlbGYgdG8gcnVuIGZvciBmdXJ0aGVyXG4gICAgICAgIC8vIGl0ZXJhdGlvbnMuXG4gICAgICAgIHNldFRpbWVvdXQobG9vcCwgMCk7XG4gICAgfSk7XG59XG4iXX0=
