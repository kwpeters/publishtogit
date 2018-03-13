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
var ListenerTracker = (function () {
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

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9saXN0ZW5lclRyYWNrZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFHQTs7Ozs7Ozs7Ozs7R0FXRztBQUNIO0lBS0k7Ozs7O09BS0c7SUFDSCx5QkFBbUIsT0FBcUI7UUFDcEMsSUFBSSxDQUFDLFFBQVEsR0FBRyxPQUFPLENBQUM7UUFDeEIsSUFBSSxDQUFDLFlBQVksR0FBRyxFQUFFLENBQUM7SUFDM0IsQ0FBQztJQUVEOzs7OztPQUtHO0lBQ0ksNEJBQUUsR0FBVCxVQUFVLFNBQWlCLEVBQUUsZ0JBQTBDO1FBQ25FLElBQUksQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDLFNBQVMsRUFBRSxnQkFBZ0IsQ0FBQyxDQUFDO1FBQzlDLElBQUksQ0FBQyxXQUFXLENBQUMsU0FBUyxFQUFFLGdCQUFnQixDQUFDLENBQUM7UUFDOUMsTUFBTSxDQUFDLElBQUksQ0FBQztJQUNoQixDQUFDO0lBRUQ7Ozs7OztPQU1HO0lBQ0ksOEJBQUksR0FBWCxVQUFZLFNBQWlCLEVBQUUsZ0JBQTBDO1FBQ3JFLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLFNBQVMsRUFBRSxnQkFBZ0IsQ0FBQyxDQUFDO1FBQ2hELElBQUksQ0FBQyxXQUFXLENBQUMsU0FBUyxFQUFFLGdCQUFnQixDQUFDLENBQUM7UUFDOUMsTUFBTSxDQUFDLElBQUksQ0FBQztJQUNoQixDQUFDO0lBRUQ7Ozs7T0FJRztJQUNJLG1DQUFTLEdBQWhCO1FBQUEsaUJBV0M7UUFWRyxNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQyxPQUFPLENBQUMsVUFBQyxTQUFTO1lBRTdDLElBQU0sU0FBUyxHQUFHLEtBQUksQ0FBQyxZQUFZLENBQUMsU0FBUyxDQUFDLENBQUM7WUFDL0MsU0FBUyxDQUFDLE9BQU8sQ0FBQyxVQUFDLFdBQVc7Z0JBQzFCLEtBQUksQ0FBQyxRQUFRLENBQUMsY0FBYyxDQUFDLFNBQVMsRUFBRSxXQUFXLENBQUMsQ0FBQztZQUN6RCxDQUFDLENBQUMsQ0FBQztRQUVQLENBQUMsQ0FBQyxDQUFDO1FBRUgsSUFBSSxDQUFDLFlBQVksR0FBRyxFQUFFLENBQUM7SUFDM0IsQ0FBQztJQUVEOzs7O09BSUc7SUFDSyxxQ0FBVyxHQUFuQixVQUFvQixTQUFpQixFQUFFLGdCQUEwQztRQUM3RSxFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ2hDLElBQUksQ0FBQyxZQUFZLENBQUMsU0FBUyxDQUFDLEdBQUcsRUFBRSxDQUFDO1FBQ3RDLENBQUM7UUFDRCxJQUFJLENBQUMsWUFBWSxDQUFDLFNBQVMsQ0FBQyxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO0lBQ3hELENBQUM7SUFFTCxzQkFBQztBQUFELENBdkVBLEFBdUVDLElBQUE7QUF2RVksMENBQWUiLCJmaWxlIjoibGlzdGVuZXJUcmFja2VyLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtFdmVudEVtaXR0ZXJ9IGZyb20gXCJldmVudHNcIjtcblxuXG4vKipcbiAqIEBjbGFzc1xuICogQGNsYXNzZGVzYyBUaGlzIGNsYXNzIHdhcyBjcmVhdGVkIHRvIGhlbHAgdHJhY2sgdGhlIGxpc3RlbmVycyB0aGF0IGhhdmUgYmVlblxuICogcmVnaXN0ZXJlZCB3aXRoIGFuIEV2ZW50RW1pdHRlci4gIE1vc3Qgb2YgdGhlIHRpbWUgdGhpcyBpcyBub3QgbmVlZGVkLFxuICogYmVjYXVzZSB5b3UgY2FuIHNpbXBseSBjYWxsIGVtaXR0ZXIucmVtb3ZlQWxsTGlzdGVuZXJzKCkuICBJbiBvbGQgdmVyc2lvbnMgb2ZcbiAqIE5vZGUuanMgKGkuZS4gMC4xMC40MCBhbmQgSlhjb3JlKSwgaG93ZXZlciwgdGhlcmUgYXJlIGJ1Z3MgdGhhdCBjYXVzZSBOb2RlLmpzXG4gKiAqaW50ZXJuYWwqIGxpc3RlbmVycyB0byBhbHNvIGJlIHJlbW92ZWQgd2hlbiByZW1vdmVBbGxMaXN0ZW5lcnMoKSBpcyBjYWxsZWRcbiAqIChzcGVjaWZpY2FsbHkgaW4gdGhlIG5ldCBtb2R1bGUncyBUQ1Agc29ja2V0IGltcGxlbWVudGF0aW9uKSwgY2F1c2luZ1xuICogdGhlIHNvY2tldCBvYmplY3QgdG8gc3RvcCB3b3JraW5nIHByb3Blcmx5LiAgVG8gd29yayBhcm91bmQgdGhpcyBwcm9ibGVtLCBhXG4gKiBjbGllbnQgbXVzdCBrZWVwIHRyYWNrIG9mIGVhY2ggbGlzdGVuZXIgYW5kIHJlbW92ZSBlYWNoIG9uZSBpbmRpdmlkdWFsbHkuXG4gKiBUaGlzIGNsYXNzIGhlbHBzIGZhY2lsaXRhdGUgdGhhdCBib29ra2VlcGluZy5cbiAqL1xuZXhwb3J0IGNsYXNzIExpc3RlbmVyVHJhY2tlciB7XG5cbiAgICBwcml2YXRlIF9lbWl0dGVyOiBFdmVudEVtaXR0ZXI7XG4gICAgcHJpdmF0ZSBfbGlzdGVuZXJNYXA6IHtbZXZlbnROYW1lOiBzdHJpbmddOiBBcnJheTwoLi4uYXJnczogYW55W10pID0+IHZvaWQ+fTtcblxuICAgIC8qKlxuICAgICAqIENyZWF0ZXMgYSBuZXcgTGlzdGVuZXJUcmFja2VyIHRoYXQgY2FuIGJlIHVzZWQgdG8gdHJhY2sgbGlzdGVuZXJzIGZvciB0aGVcbiAgICAgKiBzcGVjaWZpZWQgRXZlbnRFbWl0dGVyLiAgT25seSBsaXN0ZW5lcnMgcmVnaXN0ZXJlZCB1c2luZyB0aGUgbWV0aG9kcyBvblxuICAgICAqIHRoaXMgaW5zdGFuY2Ugd2lsbCBiZSB0cmFja2VkLlxuICAgICAqIEBwYXJhbSBlbWl0dGVyIC0gVGhlIEV2ZW50RW1pdHRlciB0byBiZSB3cmFwcGVkXG4gICAgICovXG4gICAgcHVibGljIGNvbnN0cnVjdG9yKGVtaXR0ZXI6IEV2ZW50RW1pdHRlcikge1xuICAgICAgICB0aGlzLl9lbWl0dGVyID0gZW1pdHRlcjtcbiAgICAgICAgdGhpcy5fbGlzdGVuZXJNYXAgPSB7fTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBSZWdpc3RlcnMgYSBuZXcgZXZlbnQgbGlzdGVuZXIuXG4gICAgICogQHBhcmFtIGV2ZW50TmFtZSAtIFRoZSBuYW1lIG9mIHRoZSBldmVudCBiZWluZyBzdWJzY3JpYmVkIHRvXG4gICAgICogQHBhcmFtIGxpc3RlbmVyQ2FsbGJhY2sgLSBUaGUgY2FsbGJhY2sgZnVuY3Rpb24vbGlzdGVuZXJcbiAgICAgKiBAcmV0dXJuIFRoaXMgTGlzdGVuZXJUcmFja2VyIGluc3RhbmNlIHNvIHRoYXQgY2FsbHMgY2FuIGJlIGNoYWluZWQuXG4gICAgICovXG4gICAgcHVibGljIG9uKGV2ZW50TmFtZTogc3RyaW5nLCBsaXN0ZW5lckNhbGxiYWNrOiAoLi4uYXJnczogYW55W10pID0+IHZvaWQpOiB0aGlzIHtcbiAgICAgICAgdGhpcy5fZW1pdHRlci5vbihldmVudE5hbWUsIGxpc3RlbmVyQ2FsbGJhY2spO1xuICAgICAgICB0aGlzLmFkZExpc3RlbmVyKGV2ZW50TmFtZSwgbGlzdGVuZXJDYWxsYmFjayk7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFJlZ2lzdGVycyBhIG5ldyBldmVudCBsaXN0ZW5lciB0aGF0IHdpbGwgYmUgaW52b2tlZCBvbmx5IHRoZSBmaXJzdCB0aW1lXG4gICAgICogdGhlIGV2ZW50IG9jY3Vycy5cbiAgICAgKiBAcGFyYW0gZXZlbnROYW1lIC0gVGhlIG5hbWUgb2YgdGhlIGV2ZW50IGJlaW5nIHN1YnNjcmliZWQgdG9cbiAgICAgKiBAcGFyYW0gbGlzdGVuZXJDYWxsYmFjayAtIFRoZSBjYWxsYmFjayBmdW5jdGlvbi9saXN0ZW5lclxuICAgICAqIEByZXR1cm4gVGhpcyBMaXN0ZW5lclRyYWNrZXIgaW5zdGFuY2Ugc28gdGhhdCBjYWxscyBjYW4gYmUgY2hhaW5lZC5cbiAgICAgKi9cbiAgICBwdWJsaWMgb25jZShldmVudE5hbWU6IHN0cmluZywgbGlzdGVuZXJDYWxsYmFjazogKC4uLmFyZ3M6IGFueVtdKSA9PiB2b2lkKTogdGhpcyB7XG4gICAgICAgIHRoaXMuX2VtaXR0ZXIub25jZShldmVudE5hbWUsIGxpc3RlbmVyQ2FsbGJhY2spO1xuICAgICAgICB0aGlzLmFkZExpc3RlbmVyKGV2ZW50TmFtZSwgbGlzdGVuZXJDYWxsYmFjayk7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFJlbW92ZXMgYWxsIGxpc3RlbmVycyB0aGF0IGhhdmUgYmVlbiByZWdpc3RlcmVkIHVzaW5nIHRoaXNcbiAgICAgKiBMaXN0ZW5lclRyYWNrZXIgb2JqZWN0LiAgTm90ZSwgaWYgdGhlIGNsaWVudCByZWdpc3RlcmVkIGxpc3RlbmVyc1xuICAgICAqIGRpcmVjdGx5IHdpdGggdGhlIHdyYXBwZWQgZW1pdHRlciwgdGhvc2UgbGlzdGVuZXJzIHdpbGwgbm90IGJlIHJlbW92ZWQuXG4gICAgICovXG4gICAgcHVibGljIHJlbW92ZUFsbCgpOiB2b2lkIHtcbiAgICAgICAgT2JqZWN0LmtleXModGhpcy5fbGlzdGVuZXJNYXApLmZvckVhY2goKGV2ZW50TmFtZSkgPT4ge1xuXG4gICAgICAgICAgICBjb25zdCBsaXN0ZW5lcnMgPSB0aGlzLl9saXN0ZW5lck1hcFtldmVudE5hbWVdO1xuICAgICAgICAgICAgbGlzdGVuZXJzLmZvckVhY2goKGN1ckxpc3RlbmVyKSA9PiB7XG4gICAgICAgICAgICAgICAgdGhpcy5fZW1pdHRlci5yZW1vdmVMaXN0ZW5lcihldmVudE5hbWUsIGN1ckxpc3RlbmVyKTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgIH0pO1xuXG4gICAgICAgIHRoaXMuX2xpc3RlbmVyTWFwID0ge307XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogSGVscGVyIGZ1bmN0aW9uIHRoYXQgc3RvcmVzIGluZm9ybWF0aW9uIHRvIHRyYWNrIHRoZSBzcGVjaWZpZWQgbGlzdGVuZXIuXG4gICAgICogQHBhcmFtIGV2ZW50TmFtZSAtIFRoZSBuYW1lIG9mIHRoZSBldmVudCBiZWluZyBzdWJzY3JpYmVkIHRvXG4gICAgICogQHBhcmFtIGxpc3RlbmVyQ2FsbGJhY2sgLSBUaGUgY2FsbGJhY2sgZnVuY3Rpb24vbGlzdGVuZXJcbiAgICAgKi9cbiAgICBwcml2YXRlIGFkZExpc3RlbmVyKGV2ZW50TmFtZTogc3RyaW5nLCBsaXN0ZW5lckNhbGxiYWNrOiAoLi4uYXJnczogYW55W10pID0+IHZvaWQpOiB2b2lkIHtcbiAgICAgICAgaWYgKCF0aGlzLl9saXN0ZW5lck1hcFtldmVudE5hbWVdKSB7XG4gICAgICAgICAgICB0aGlzLl9saXN0ZW5lck1hcFtldmVudE5hbWVdID0gW107XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5fbGlzdGVuZXJNYXBbZXZlbnROYW1lXS5wdXNoKGxpc3RlbmVyQ2FsbGJhY2spO1xuICAgIH1cblxufVxuIl19
