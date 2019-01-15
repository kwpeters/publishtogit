"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Levels controlling what log messages are written to stdout.
 */
var LogLevel;
(function (LogLevel) {
    LogLevel[LogLevel["OFF_0"] = 0] = "OFF_0";
    LogLevel[LogLevel["ERROR_1"] = 1] = "ERROR_1";
    LogLevel[LogLevel["WARN_2"] = 2] = "WARN_2";
    LogLevel[LogLevel["INFO_3"] = 3] = "INFO_3";
    LogLevel[LogLevel["VERBOSE_4"] = 4] = "VERBOSE_4";
    LogLevel[LogLevel["DEBUG_5"] = 5] = "DEBUG_5";
    LogLevel[LogLevel["SILLY_6"] = 6] = "SILLY_6";
})(LogLevel = exports.LogLevel || (exports.LogLevel = {}));
Object.freeze(LogLevel);
/**
 * Labels used to identify the severity of each log message
 * @type {string[]}
 */
var levelLabels = [
    "OFF",
    "ERROR",
    "WARN",
    "INFO",
    "VERBOSE",
    "DEBUG",
    "SILLY"
];
Object.freeze(levelLabels);
var Logger = /** @class */ (function () {
    // endregion
    function Logger() {
        // region Private Data Members
        this._logLevelStack = [];
        this._defaultLogLevel = LogLevel.WARN_2;
        Object.seal(this);
    }
    /**
     * Resets this logger to its default state.
     */
    Logger.prototype.reset = function () {
        if (this._logLevelStack === undefined) {
            this._logLevelStack = [];
        }
        else {
            this._logLevelStack.length = 0;
        }
    };
    /**
     * Sets this loggers enabled state to newLogLevel.  To put the logger back to
     * its previous state, call pop().
     * @param newLogLevel - The new state of this logger
     */
    Logger.prototype.pushLogLevel = function (newLogLevel) {
        this._logLevelStack.push(newLogLevel);
    };
    /**
     * Restores this logger's state to the previous state.
     */
    Logger.prototype.pop = function () {
        if (this._logLevelStack.length > 0) {
            this._logLevelStack.pop();
        }
    };
    /**
     * Gets the current severity level for this logger.  All messages with a
     * higher or equal severity will be logged.
     * @returns {LogLevel} The current severity level
     */
    Logger.prototype.getCurrentLevel = function () {
        if (this._logLevelStack.length > 0) {
            return this._logLevelStack[this._logLevelStack.length - 1];
        }
        else {
            return this._defaultLogLevel;
        }
    };
    /**
     * Logs a message with severity level ERROR_0.
     * @param msg - The message to be logged
     * @returns {boolean} Whether the message was logged given current logger settings.
     */
    Logger.prototype.error = function (msg) { return this.log(LogLevel.ERROR_1, msg); };
    /**
     * Logs a message with severity level WARN_1.
     * @param msg - The message to be logged
     * @returns {boolean} Whether the message was logged given current logger settings.
     */
    Logger.prototype.warn = function (msg) { return this.log(LogLevel.WARN_2, msg); };
    /**
     * Logs a message with severity level INFO_2.
     * @param msg - The message to be logged
     * @returns {boolean} Whether the message was logged given current logger settings.
     */
    Logger.prototype.info = function (msg) { return this.log(LogLevel.INFO_3, msg); };
    /**
     * Logs a message with severity level VERBOSE_3.
     * @param msg - The message to be logged
     * @returns {boolean} Whether the message was logged given current logger settings.
     */
    Logger.prototype.verbose = function (msg) { return this.log(LogLevel.VERBOSE_4, msg); };
    /**
     * Logs a message with severity level DEBUG_4.
     * @param msg - The message to be logged
     * @returns {boolean} Whether the message was logged given current logger settings.
     */
    Logger.prototype.debug = function (msg) { return this.log(LogLevel.DEBUG_5, msg); };
    /**
     * Logs a message with severity level SILLY_5.
     * @param msg - The message to be logged
     * @returns {boolean} Whether the message was logged given current logger settings.
     */
    Logger.prototype.silly = function (msg) { return this.log(LogLevel.SILLY_6, msg); };
    // region Private Methods
    /**
     * Helper method that implements logging logic
     * @param {LogLevel} level - The severity level of the logged message
     * @param {string} msg - The message to log
     * @returns {boolean} Whether the message was logged.
     */
    Logger.prototype.log = function (level, msg) {
        var curLogLevel = this.getCurrentLevel();
        if (level > curLogLevel) {
            return false;
        }
        if (msg.length > 0) {
            console.log(getTimestamp() + " (" + levelLabels[level] + ") " + msg);
        }
        return true;
    };
    return Logger;
}());
exports.Logger = Logger;
Object.freeze(Logger.prototype);
/**
 * The one-and-only exported instance (singleton).
 * @type {Logger}
 */
exports.logger = new Logger();
////////////////////////////////////////////////////////////////////////////////
// Helper methods
////////////////////////////////////////////////////////////////////////////////
function getTimestamp() {
    "use strict";
    return new Date().toISOString();
}
Object.freeze(exports);

//# sourceMappingURL=data:application/json;charset=utf8;base64,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LEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUU5RTs7OztPQUlHO0lBQ0ksc0JBQUssR0FBWixVQUFhLEdBQVcsSUFBYSxPQUFPLElBQUksQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLE9BQU8sRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFHOUUseUJBQXlCO0lBRXpCOzs7OztPQUtHO0lBQ0ssb0JBQUcsR0FBWCxVQUFZLEtBQWUsRUFBRSxHQUFXO1FBRXBDLElBQU0sV0FBVyxHQUFhLElBQUksQ0FBQyxlQUFlLEVBQUUsQ0FBQztRQUVyRCxJQUFJLEtBQUssR0FBRyxXQUFXLEVBQUU7WUFDckIsT0FBTyxLQUFLLENBQUM7U0FDaEI7UUFFRCxJQUFJLEdBQUcsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFO1lBQ2hCLE9BQU8sQ0FBQyxHQUFHLENBQUMsWUFBWSxFQUFFLEdBQUcsSUFBSSxHQUFHLFdBQVcsQ0FBQyxLQUFLLENBQUMsR0FBRyxJQUFJLEdBQUcsR0FBRyxDQUFDLENBQUM7U0FDeEU7UUFFRCxPQUFPLElBQUksQ0FBQztJQUNoQixDQUFDO0lBSUwsYUFBQztBQUFELENBL0hBLEFBK0hDLElBQUE7QUEvSFksd0JBQU07QUFnSW5CLE1BQU0sQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxDQUFDO0FBR2hDOzs7R0FHRztBQUNVLFFBQUEsTUFBTSxHQUFXLElBQUksTUFBTSxFQUFFLENBQUM7QUFHM0MsZ0ZBQWdGO0FBQ2hGLGlCQUFpQjtBQUNqQixnRkFBZ0Y7QUFFaEY7SUFDSSxZQUFZLENBQUM7SUFDYixPQUFPLElBQUksSUFBSSxFQUFFLENBQUMsV0FBVyxFQUFFLENBQUM7QUFDcEMsQ0FBQztBQUdELE1BQU0sQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLENBQUMiLCJmaWxlIjoiZGVwb3QvbG9nZ2VyLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBMZXZlbHMgY29udHJvbGxpbmcgd2hhdCBsb2cgbWVzc2FnZXMgYXJlIHdyaXR0ZW4gdG8gc3Rkb3V0LlxuICovXG5leHBvcnQgZW51bSBMb2dMZXZlbCB7XG4gICAgT0ZGXzAgICAgID0gMCxcbiAgICBFUlJPUl8xICAgPSAxLFxuICAgIFdBUk5fMiAgICA9IDIsXG4gICAgSU5GT18zICAgID0gMyxcbiAgICBWRVJCT1NFXzQgPSA0LFxuICAgIERFQlVHXzUgICA9IDUsXG4gICAgU0lMTFlfNiAgID0gNlxufVxuT2JqZWN0LmZyZWV6ZShMb2dMZXZlbCk7XG5cblxuLyoqXG4gKiBMYWJlbHMgdXNlZCB0byBpZGVudGlmeSB0aGUgc2V2ZXJpdHkgb2YgZWFjaCBsb2cgbWVzc2FnZVxuICogQHR5cGUge3N0cmluZ1tdfVxuICovXG5jb25zdCBsZXZlbExhYmVsczogQXJyYXk8c3RyaW5nPiA9IFtcbiAgICBcIk9GRlwiLFxuICAgIFwiRVJST1JcIixcbiAgICBcIldBUk5cIixcbiAgICBcIklORk9cIixcbiAgICBcIlZFUkJPU0VcIixcbiAgICBcIkRFQlVHXCIsXG4gICAgXCJTSUxMWVwiXG5dO1xuT2JqZWN0LmZyZWV6ZShsZXZlbExhYmVscyk7XG5cblxuZXhwb3J0IGNsYXNzIExvZ2dlciB7XG5cbiAgICAvLyByZWdpb24gUHJpdmF0ZSBEYXRhIE1lbWJlcnNcbiAgICBwcml2YXRlIF9sb2dMZXZlbFN0YWNrOiBBcnJheTxMb2dMZXZlbD4gPSBbXTtcbiAgICBwcml2YXRlIF9kZWZhdWx0TG9nTGV2ZWw6IExvZ0xldmVsID0gTG9nTGV2ZWwuV0FSTl8yO1xuICAgIC8vIGVuZHJlZ2lvblxuXG5cbiAgICBwdWJsaWMgY29uc3RydWN0b3IoKSB7XG4gICAgICAgIE9iamVjdC5zZWFsKHRoaXMpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFJlc2V0cyB0aGlzIGxvZ2dlciB0byBpdHMgZGVmYXVsdCBzdGF0ZS5cbiAgICAgKi9cbiAgICBwdWJsaWMgcmVzZXQoKTogdm9pZCB7XG5cbiAgICAgICAgaWYgKHRoaXMuX2xvZ0xldmVsU3RhY2sgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgdGhpcy5fbG9nTGV2ZWxTdGFjayA9IFtdO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5fbG9nTGV2ZWxTdGFjay5sZW5ndGggPSAwO1xuICAgICAgICB9XG4gICAgfVxuXG5cbiAgICAvKipcbiAgICAgKiBTZXRzIHRoaXMgbG9nZ2VycyBlbmFibGVkIHN0YXRlIHRvIG5ld0xvZ0xldmVsLiAgVG8gcHV0IHRoZSBsb2dnZXIgYmFjayB0b1xuICAgICAqIGl0cyBwcmV2aW91cyBzdGF0ZSwgY2FsbCBwb3AoKS5cbiAgICAgKiBAcGFyYW0gbmV3TG9nTGV2ZWwgLSBUaGUgbmV3IHN0YXRlIG9mIHRoaXMgbG9nZ2VyXG4gICAgICovXG4gICAgcHVibGljIHB1c2hMb2dMZXZlbChuZXdMb2dMZXZlbDogTG9nTGV2ZWwpOiB2b2lkIHtcbiAgICAgICAgdGhpcy5fbG9nTGV2ZWxTdGFjay5wdXNoKG5ld0xvZ0xldmVsKTtcbiAgICB9XG5cblxuICAgIC8qKlxuICAgICAqIFJlc3RvcmVzIHRoaXMgbG9nZ2VyJ3Mgc3RhdGUgdG8gdGhlIHByZXZpb3VzIHN0YXRlLlxuICAgICAqL1xuICAgIHB1YmxpYyBwb3AoKTogdm9pZCB7XG4gICAgICAgIGlmICh0aGlzLl9sb2dMZXZlbFN0YWNrLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgIHRoaXMuX2xvZ0xldmVsU3RhY2sucG9wKCk7XG4gICAgICAgIH1cbiAgICB9XG5cblxuICAgIC8qKlxuICAgICAqIEdldHMgdGhlIGN1cnJlbnQgc2V2ZXJpdHkgbGV2ZWwgZm9yIHRoaXMgbG9nZ2VyLiAgQWxsIG1lc3NhZ2VzIHdpdGggYVxuICAgICAqIGhpZ2hlciBvciBlcXVhbCBzZXZlcml0eSB3aWxsIGJlIGxvZ2dlZC5cbiAgICAgKiBAcmV0dXJucyB7TG9nTGV2ZWx9IFRoZSBjdXJyZW50IHNldmVyaXR5IGxldmVsXG4gICAgICovXG4gICAgcHVibGljIGdldEN1cnJlbnRMZXZlbCgpOiBMb2dMZXZlbCB7XG4gICAgICAgIGlmICh0aGlzLl9sb2dMZXZlbFN0YWNrLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl9sb2dMZXZlbFN0YWNrW3RoaXMuX2xvZ0xldmVsU3RhY2subGVuZ3RoIC0gMV07XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fZGVmYXVsdExvZ0xldmVsO1xuICAgICAgICB9XG5cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBMb2dzIGEgbWVzc2FnZSB3aXRoIHNldmVyaXR5IGxldmVsIEVSUk9SXzAuXG4gICAgICogQHBhcmFtIG1zZyAtIFRoZSBtZXNzYWdlIHRvIGJlIGxvZ2dlZFxuICAgICAqIEByZXR1cm5zIHtib29sZWFufSBXaGV0aGVyIHRoZSBtZXNzYWdlIHdhcyBsb2dnZWQgZ2l2ZW4gY3VycmVudCBsb2dnZXIgc2V0dGluZ3MuXG4gICAgICovXG4gICAgcHVibGljIGVycm9yKG1zZzogc3RyaW5nKTogYm9vbGVhbiB7IHJldHVybiB0aGlzLmxvZyhMb2dMZXZlbC5FUlJPUl8xLCBtc2cpOyB9XG5cbiAgICAvKipcbiAgICAgKiBMb2dzIGEgbWVzc2FnZSB3aXRoIHNldmVyaXR5IGxldmVsIFdBUk5fMS5cbiAgICAgKiBAcGFyYW0gbXNnIC0gVGhlIG1lc3NhZ2UgdG8gYmUgbG9nZ2VkXG4gICAgICogQHJldHVybnMge2Jvb2xlYW59IFdoZXRoZXIgdGhlIG1lc3NhZ2Ugd2FzIGxvZ2dlZCBnaXZlbiBjdXJyZW50IGxvZ2dlciBzZXR0aW5ncy5cbiAgICAgKi9cbiAgICBwdWJsaWMgd2Fybihtc2c6IHN0cmluZyk6IGJvb2xlYW4geyByZXR1cm4gdGhpcy5sb2coTG9nTGV2ZWwuV0FSTl8yLCBtc2cpOyB9XG5cbiAgICAvKipcbiAgICAgKiBMb2dzIGEgbWVzc2FnZSB3aXRoIHNldmVyaXR5IGxldmVsIElORk9fMi5cbiAgICAgKiBAcGFyYW0gbXNnIC0gVGhlIG1lc3NhZ2UgdG8gYmUgbG9nZ2VkXG4gICAgICogQHJldHVybnMge2Jvb2xlYW59IFdoZXRoZXIgdGhlIG1lc3NhZ2Ugd2FzIGxvZ2dlZCBnaXZlbiBjdXJyZW50IGxvZ2dlciBzZXR0aW5ncy5cbiAgICAgKi9cbiAgICBwdWJsaWMgaW5mbyhtc2c6IHN0cmluZyk6IGJvb2xlYW4geyByZXR1cm4gdGhpcy5sb2coTG9nTGV2ZWwuSU5GT18zLCBtc2cpOyB9XG5cbiAgICAvKipcbiAgICAgKiBMb2dzIGEgbWVzc2FnZSB3aXRoIHNldmVyaXR5IGxldmVsIFZFUkJPU0VfMy5cbiAgICAgKiBAcGFyYW0gbXNnIC0gVGhlIG1lc3NhZ2UgdG8gYmUgbG9nZ2VkXG4gICAgICogQHJldHVybnMge2Jvb2xlYW59IFdoZXRoZXIgdGhlIG1lc3NhZ2Ugd2FzIGxvZ2dlZCBnaXZlbiBjdXJyZW50IGxvZ2dlciBzZXR0aW5ncy5cbiAgICAgKi9cbiAgICBwdWJsaWMgdmVyYm9zZShtc2c6IHN0cmluZyk6IGJvb2xlYW4geyByZXR1cm4gdGhpcy5sb2coTG9nTGV2ZWwuVkVSQk9TRV80LCBtc2cpOyB9XG5cbiAgICAvKipcbiAgICAgKiBMb2dzIGEgbWVzc2FnZSB3aXRoIHNldmVyaXR5IGxldmVsIERFQlVHXzQuXG4gICAgICogQHBhcmFtIG1zZyAtIFRoZSBtZXNzYWdlIHRvIGJlIGxvZ2dlZFxuICAgICAqIEByZXR1cm5zIHtib29sZWFufSBXaGV0aGVyIHRoZSBtZXNzYWdlIHdhcyBsb2dnZWQgZ2l2ZW4gY3VycmVudCBsb2dnZXIgc2V0dGluZ3MuXG4gICAgICovXG4gICAgcHVibGljIGRlYnVnKG1zZzogc3RyaW5nKTogYm9vbGVhbiB7IHJldHVybiB0aGlzLmxvZyhMb2dMZXZlbC5ERUJVR181LCBtc2cpOyB9XG5cbiAgICAvKipcbiAgICAgKiBMb2dzIGEgbWVzc2FnZSB3aXRoIHNldmVyaXR5IGxldmVsIFNJTExZXzUuXG4gICAgICogQHBhcmFtIG1zZyAtIFRoZSBtZXNzYWdlIHRvIGJlIGxvZ2dlZFxuICAgICAqIEByZXR1cm5zIHtib29sZWFufSBXaGV0aGVyIHRoZSBtZXNzYWdlIHdhcyBsb2dnZWQgZ2l2ZW4gY3VycmVudCBsb2dnZXIgc2V0dGluZ3MuXG4gICAgICovXG4gICAgcHVibGljIHNpbGx5KG1zZzogc3RyaW5nKTogYm9vbGVhbiB7IHJldHVybiB0aGlzLmxvZyhMb2dMZXZlbC5TSUxMWV82LCBtc2cpOyB9XG5cblxuICAgIC8vIHJlZ2lvbiBQcml2YXRlIE1ldGhvZHNcblxuICAgIC8qKlxuICAgICAqIEhlbHBlciBtZXRob2QgdGhhdCBpbXBsZW1lbnRzIGxvZ2dpbmcgbG9naWNcbiAgICAgKiBAcGFyYW0ge0xvZ0xldmVsfSBsZXZlbCAtIFRoZSBzZXZlcml0eSBsZXZlbCBvZiB0aGUgbG9nZ2VkIG1lc3NhZ2VcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gbXNnIC0gVGhlIG1lc3NhZ2UgdG8gbG9nXG4gICAgICogQHJldHVybnMge2Jvb2xlYW59IFdoZXRoZXIgdGhlIG1lc3NhZ2Ugd2FzIGxvZ2dlZC5cbiAgICAgKi9cbiAgICBwcml2YXRlIGxvZyhsZXZlbDogTG9nTGV2ZWwsIG1zZzogc3RyaW5nKTogYm9vbGVhbiB7XG5cbiAgICAgICAgY29uc3QgY3VyTG9nTGV2ZWw6IExvZ0xldmVsID0gdGhpcy5nZXRDdXJyZW50TGV2ZWwoKTtcblxuICAgICAgICBpZiAobGV2ZWwgPiBjdXJMb2dMZXZlbCkge1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKG1zZy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhnZXRUaW1lc3RhbXAoKSArIFwiIChcIiArIGxldmVsTGFiZWxzW2xldmVsXSArIFwiKSBcIiArIG1zZyk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG5cbiAgICAvLyBlbmRyZWdpb25cblxufVxuT2JqZWN0LmZyZWV6ZShMb2dnZXIucHJvdG90eXBlKTtcblxuXG4vKipcbiAqIFRoZSBvbmUtYW5kLW9ubHkgZXhwb3J0ZWQgaW5zdGFuY2UgKHNpbmdsZXRvbikuXG4gKiBAdHlwZSB7TG9nZ2VyfVxuICovXG5leHBvcnQgY29uc3QgbG9nZ2VyOiBMb2dnZXIgPSBuZXcgTG9nZ2VyKCk7XG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIEhlbHBlciBtZXRob2RzXG4vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuXG5mdW5jdGlvbiBnZXRUaW1lc3RhbXAoKTogc3RyaW5nIHtcbiAgICBcInVzZSBzdHJpY3RcIjtcbiAgICByZXR1cm4gbmV3IERhdGUoKS50b0lTT1N0cmluZygpO1xufVxuXG5cbk9iamVjdC5mcmVlemUoZXhwb3J0cyk7XG4iXX0=
