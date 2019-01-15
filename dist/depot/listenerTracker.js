"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * @class
 * @classdesc This class was created to help track the listeners that have been
 * registered with an EventEmitter.  Most of the time this is not needed,
 * because you can simply call emitter.removeAllListeners().  In old versions of
 * Node.js (i.e. 0.10.40 and JXcore), however, there are bugs that cause Node.js
 * *internal* listeners to also be removed when removeAllListeners() is called
 * (specifically in the net module's TCP socket implementation), causing
 * the socket object to stop working properly.  To work around this problem, a
 * client must keep track of each listener and remove each one individually.
 * This class helps facilitate that bookkeeping.
 */
var ListenerTracker = /** @class */ (function () {
    /**
     * Creates a new ListenerTracker that can be used to track listeners for the
     * specified EventEmitter.  Only listeners registered using the methods on
     * this instance will be tracked.
     * @param emitter - The EventEmitter to be wrapped
     */
    function ListenerTracker(emitter) {
        this._emitter = emitter;
        this._listenerMap = {};
    }
    /**
     * Registers a new event listener.
     * @param eventName - The name of the event being subscribed to
     * @param listenerCallback - The callback function/listener
     * @return This ListenerTracker instance so that calls can be chained.
     */
    ListenerTracker.prototype.on = function (eventName, listenerCallback) {
        this._emitter.on(eventName, listenerCallback);
        this.addListener(eventName, listenerCallback);
        return this;
    };
    /**
     * Registers a new event listener that will be invoked only the first time
     * the event occurs.
     * @param eventName - The name of the event being subscribed to
     * @param listenerCallback - The callback function/listener
     * @return This ListenerTracker instance so that calls can be chained.
     */
    ListenerTracker.prototype.once = function (eventName, listenerCallback) {
        this._emitter.once(eventName, listenerCallback);
        this.addListener(eventName, listenerCallback);
        return this;
    };
    /**
     * Removes all listeners that have been registered using this
     * ListenerTracker object.  Note, if the client registered listeners
     * directly with the wrapped emitter, those listeners will not be removed.
     */
    ListenerTracker.prototype.removeAll = function () {
        var _this = this;
        Object.keys(this._listenerMap).forEach(function (eventName) {
            var listeners = _this._listenerMap[eventName];
            listeners.forEach(function (curListener) {
                _this._emitter.removeListener(eventName, curListener);
            });
        });
        this._listenerMap = {};
    };
    /**
     * Helper function that stores information to track the specified listener.
     * @param eventName - The name of the event being subscribed to
     * @param listenerCallback - The callback function/listener
     */
    ListenerTracker.prototype.addListener = function (eventName, listenerCallback) {
        if (!this._listenerMap[eventName]) {
            this._listenerMap[eventName] = [];
        }
        this._listenerMap[eventName].push(listenerCallback);
    };
    return ListenerTracker;
}());
exports.ListenerTracker = ListenerTracker;

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9kZXBvdC9saXN0ZW5lclRyYWNrZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFHQTs7Ozs7Ozs7Ozs7R0FXRztBQUNIO0lBS0k7Ozs7O09BS0c7SUFDSCx5QkFBbUIsT0FBcUI7UUFDcEMsSUFBSSxDQUFDLFFBQVEsR0FBRyxPQUFPLENBQUM7UUFDeEIsSUFBSSxDQUFDLFlBQVksR0FBRyxFQUFFLENBQUM7SUFDM0IsQ0FBQztJQUVEOzs7OztPQUtHO0lBQ0ksNEJBQUUsR0FBVCxVQUFVLFNBQWlCLEVBQUUsZ0JBQStDO1FBQ3hFLElBQUksQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDLFNBQVMsRUFBRSxnQkFBZ0IsQ0FBQyxDQUFDO1FBQzlDLElBQUksQ0FBQyxXQUFXLENBQUMsU0FBUyxFQUFFLGdCQUFnQixDQUFDLENBQUM7UUFDOUMsT0FBTyxJQUFJLENBQUM7SUFDaEIsQ0FBQztJQUVEOzs7Ozs7T0FNRztJQUNJLDhCQUFJLEdBQVgsVUFBWSxTQUFpQixFQUFFLGdCQUErQztRQUMxRSxJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxTQUFTLEVBQUUsZ0JBQWdCLENBQUMsQ0FBQztRQUNoRCxJQUFJLENBQUMsV0FBVyxDQUFDLFNBQVMsRUFBRSxnQkFBZ0IsQ0FBQyxDQUFDO1FBQzlDLE9BQU8sSUFBSSxDQUFDO0lBQ2hCLENBQUM7SUFFRDs7OztPQUlHO0lBQ0ksbUNBQVMsR0FBaEI7UUFBQSxpQkFXQztRQVZHLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDLE9BQU8sQ0FBQyxVQUFDLFNBQVM7WUFFN0MsSUFBTSxTQUFTLEdBQUcsS0FBSSxDQUFDLFlBQVksQ0FBQyxTQUFTLENBQUMsQ0FBQztZQUMvQyxTQUFTLENBQUMsT0FBTyxDQUFDLFVBQUMsV0FBVztnQkFDMUIsS0FBSSxDQUFDLFFBQVEsQ0FBQyxjQUFjLENBQUMsU0FBUyxFQUFFLFdBQVcsQ0FBQyxDQUFDO1lBQ3pELENBQUMsQ0FBQyxDQUFDO1FBRVAsQ0FBQyxDQUFDLENBQUM7UUFFSCxJQUFJLENBQUMsWUFBWSxHQUFHLEVBQUUsQ0FBQztJQUMzQixDQUFDO0lBRUQ7Ozs7T0FJRztJQUNLLHFDQUFXLEdBQW5CLFVBQW9CLFNBQWlCLEVBQUUsZ0JBQStDO1FBQ2xGLElBQUksQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLFNBQVMsQ0FBQyxFQUFFO1lBQy9CLElBQUksQ0FBQyxZQUFZLENBQUMsU0FBUyxDQUFDLEdBQUcsRUFBRSxDQUFDO1NBQ3JDO1FBQ0QsSUFBSSxDQUFDLFlBQVksQ0FBQyxTQUFTLENBQUMsQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztJQUN4RCxDQUFDO0lBRUwsc0JBQUM7QUFBRCxDQXZFQSxBQXVFQyxJQUFBO0FBdkVZLDBDQUFlIiwiZmlsZSI6ImRlcG90L2xpc3RlbmVyVHJhY2tlci5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7RXZlbnRFbWl0dGVyfSBmcm9tIFwiZXZlbnRzXCI7XG5cblxuLyoqXG4gKiBAY2xhc3NcbiAqIEBjbGFzc2Rlc2MgVGhpcyBjbGFzcyB3YXMgY3JlYXRlZCB0byBoZWxwIHRyYWNrIHRoZSBsaXN0ZW5lcnMgdGhhdCBoYXZlIGJlZW5cbiAqIHJlZ2lzdGVyZWQgd2l0aCBhbiBFdmVudEVtaXR0ZXIuICBNb3N0IG9mIHRoZSB0aW1lIHRoaXMgaXMgbm90IG5lZWRlZCxcbiAqIGJlY2F1c2UgeW91IGNhbiBzaW1wbHkgY2FsbCBlbWl0dGVyLnJlbW92ZUFsbExpc3RlbmVycygpLiAgSW4gb2xkIHZlcnNpb25zIG9mXG4gKiBOb2RlLmpzIChpLmUuIDAuMTAuNDAgYW5kIEpYY29yZSksIGhvd2V2ZXIsIHRoZXJlIGFyZSBidWdzIHRoYXQgY2F1c2UgTm9kZS5qc1xuICogKmludGVybmFsKiBsaXN0ZW5lcnMgdG8gYWxzbyBiZSByZW1vdmVkIHdoZW4gcmVtb3ZlQWxsTGlzdGVuZXJzKCkgaXMgY2FsbGVkXG4gKiAoc3BlY2lmaWNhbGx5IGluIHRoZSBuZXQgbW9kdWxlJ3MgVENQIHNvY2tldCBpbXBsZW1lbnRhdGlvbiksIGNhdXNpbmdcbiAqIHRoZSBzb2NrZXQgb2JqZWN0IHRvIHN0b3Agd29ya2luZyBwcm9wZXJseS4gIFRvIHdvcmsgYXJvdW5kIHRoaXMgcHJvYmxlbSwgYVxuICogY2xpZW50IG11c3Qga2VlcCB0cmFjayBvZiBlYWNoIGxpc3RlbmVyIGFuZCByZW1vdmUgZWFjaCBvbmUgaW5kaXZpZHVhbGx5LlxuICogVGhpcyBjbGFzcyBoZWxwcyBmYWNpbGl0YXRlIHRoYXQgYm9va2tlZXBpbmcuXG4gKi9cbmV4cG9ydCBjbGFzcyBMaXN0ZW5lclRyYWNrZXIge1xuXG4gICAgcHJpdmF0ZSBfZW1pdHRlcjogRXZlbnRFbWl0dGVyO1xuICAgIHByaXZhdGUgX2xpc3RlbmVyTWFwOiB7W2V2ZW50TmFtZTogc3RyaW5nXTogQXJyYXk8KC4uLmFyZ3M6IEFycmF5PGFueT4pID0+IHZvaWQ+fTtcblxuICAgIC8qKlxuICAgICAqIENyZWF0ZXMgYSBuZXcgTGlzdGVuZXJUcmFja2VyIHRoYXQgY2FuIGJlIHVzZWQgdG8gdHJhY2sgbGlzdGVuZXJzIGZvciB0aGVcbiAgICAgKiBzcGVjaWZpZWQgRXZlbnRFbWl0dGVyLiAgT25seSBsaXN0ZW5lcnMgcmVnaXN0ZXJlZCB1c2luZyB0aGUgbWV0aG9kcyBvblxuICAgICAqIHRoaXMgaW5zdGFuY2Ugd2lsbCBiZSB0cmFja2VkLlxuICAgICAqIEBwYXJhbSBlbWl0dGVyIC0gVGhlIEV2ZW50RW1pdHRlciB0byBiZSB3cmFwcGVkXG4gICAgICovXG4gICAgcHVibGljIGNvbnN0cnVjdG9yKGVtaXR0ZXI6IEV2ZW50RW1pdHRlcikge1xuICAgICAgICB0aGlzLl9lbWl0dGVyID0gZW1pdHRlcjtcbiAgICAgICAgdGhpcy5fbGlzdGVuZXJNYXAgPSB7fTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBSZWdpc3RlcnMgYSBuZXcgZXZlbnQgbGlzdGVuZXIuXG4gICAgICogQHBhcmFtIGV2ZW50TmFtZSAtIFRoZSBuYW1lIG9mIHRoZSBldmVudCBiZWluZyBzdWJzY3JpYmVkIHRvXG4gICAgICogQHBhcmFtIGxpc3RlbmVyQ2FsbGJhY2sgLSBUaGUgY2FsbGJhY2sgZnVuY3Rpb24vbGlzdGVuZXJcbiAgICAgKiBAcmV0dXJuIFRoaXMgTGlzdGVuZXJUcmFja2VyIGluc3RhbmNlIHNvIHRoYXQgY2FsbHMgY2FuIGJlIGNoYWluZWQuXG4gICAgICovXG4gICAgcHVibGljIG9uKGV2ZW50TmFtZTogc3RyaW5nLCBsaXN0ZW5lckNhbGxiYWNrOiAoLi4uYXJnczogQXJyYXk8YW55PikgPT4gdm9pZCk6IHRoaXMge1xuICAgICAgICB0aGlzLl9lbWl0dGVyLm9uKGV2ZW50TmFtZSwgbGlzdGVuZXJDYWxsYmFjayk7XG4gICAgICAgIHRoaXMuYWRkTGlzdGVuZXIoZXZlbnROYW1lLCBsaXN0ZW5lckNhbGxiYWNrKTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUmVnaXN0ZXJzIGEgbmV3IGV2ZW50IGxpc3RlbmVyIHRoYXQgd2lsbCBiZSBpbnZva2VkIG9ubHkgdGhlIGZpcnN0IHRpbWVcbiAgICAgKiB0aGUgZXZlbnQgb2NjdXJzLlxuICAgICAqIEBwYXJhbSBldmVudE5hbWUgLSBUaGUgbmFtZSBvZiB0aGUgZXZlbnQgYmVpbmcgc3Vic2NyaWJlZCB0b1xuICAgICAqIEBwYXJhbSBsaXN0ZW5lckNhbGxiYWNrIC0gVGhlIGNhbGxiYWNrIGZ1bmN0aW9uL2xpc3RlbmVyXG4gICAgICogQHJldHVybiBUaGlzIExpc3RlbmVyVHJhY2tlciBpbnN0YW5jZSBzbyB0aGF0IGNhbGxzIGNhbiBiZSBjaGFpbmVkLlxuICAgICAqL1xuICAgIHB1YmxpYyBvbmNlKGV2ZW50TmFtZTogc3RyaW5nLCBsaXN0ZW5lckNhbGxiYWNrOiAoLi4uYXJnczogQXJyYXk8YW55PikgPT4gdm9pZCk6IHRoaXMge1xuICAgICAgICB0aGlzLl9lbWl0dGVyLm9uY2UoZXZlbnROYW1lLCBsaXN0ZW5lckNhbGxiYWNrKTtcbiAgICAgICAgdGhpcy5hZGRMaXN0ZW5lcihldmVudE5hbWUsIGxpc3RlbmVyQ2FsbGJhY2spO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBSZW1vdmVzIGFsbCBsaXN0ZW5lcnMgdGhhdCBoYXZlIGJlZW4gcmVnaXN0ZXJlZCB1c2luZyB0aGlzXG4gICAgICogTGlzdGVuZXJUcmFja2VyIG9iamVjdC4gIE5vdGUsIGlmIHRoZSBjbGllbnQgcmVnaXN0ZXJlZCBsaXN0ZW5lcnNcbiAgICAgKiBkaXJlY3RseSB3aXRoIHRoZSB3cmFwcGVkIGVtaXR0ZXIsIHRob3NlIGxpc3RlbmVycyB3aWxsIG5vdCBiZSByZW1vdmVkLlxuICAgICAqL1xuICAgIHB1YmxpYyByZW1vdmVBbGwoKTogdm9pZCB7XG4gICAgICAgIE9iamVjdC5rZXlzKHRoaXMuX2xpc3RlbmVyTWFwKS5mb3JFYWNoKChldmVudE5hbWUpID0+IHtcblxuICAgICAgICAgICAgY29uc3QgbGlzdGVuZXJzID0gdGhpcy5fbGlzdGVuZXJNYXBbZXZlbnROYW1lXTtcbiAgICAgICAgICAgIGxpc3RlbmVycy5mb3JFYWNoKChjdXJMaXN0ZW5lcikgPT4ge1xuICAgICAgICAgICAgICAgIHRoaXMuX2VtaXR0ZXIucmVtb3ZlTGlzdGVuZXIoZXZlbnROYW1lLCBjdXJMaXN0ZW5lcik7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICB9KTtcblxuICAgICAgICB0aGlzLl9saXN0ZW5lck1hcCA9IHt9O1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEhlbHBlciBmdW5jdGlvbiB0aGF0IHN0b3JlcyBpbmZvcm1hdGlvbiB0byB0cmFjayB0aGUgc3BlY2lmaWVkIGxpc3RlbmVyLlxuICAgICAqIEBwYXJhbSBldmVudE5hbWUgLSBUaGUgbmFtZSBvZiB0aGUgZXZlbnQgYmVpbmcgc3Vic2NyaWJlZCB0b1xuICAgICAqIEBwYXJhbSBsaXN0ZW5lckNhbGxiYWNrIC0gVGhlIGNhbGxiYWNrIGZ1bmN0aW9uL2xpc3RlbmVyXG4gICAgICovXG4gICAgcHJpdmF0ZSBhZGRMaXN0ZW5lcihldmVudE5hbWU6IHN0cmluZywgbGlzdGVuZXJDYWxsYmFjazogKC4uLmFyZ3M6IEFycmF5PGFueT4pID0+IHZvaWQpOiB2b2lkIHtcbiAgICAgICAgaWYgKCF0aGlzLl9saXN0ZW5lck1hcFtldmVudE5hbWVdKSB7XG4gICAgICAgICAgICB0aGlzLl9saXN0ZW5lck1hcFtldmVudE5hbWVdID0gW107XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5fbGlzdGVuZXJNYXBbZXZlbnROYW1lXS5wdXNoKGxpc3RlbmVyQ2FsbGJhY2spO1xuICAgIH1cblxufVxuIl19
