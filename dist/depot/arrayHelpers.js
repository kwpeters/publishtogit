"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Tests the strings in `strings` and returns the first non-null match.
 * @param strings - The array of strings to search
 * @param regex - The pattern to search for
 * @returns The first match found.  null if no match was found.
 */
function anyMatchRegex(strings, regex) {
    "use strict";
    for (var _i = 0, strings_1 = strings; _i < strings_1.length; _i++) {
        var curString = strings_1[_i];
        var curMatch = regex.exec(curString);
        if (curMatch) {
            return curMatch;
        }
    }
    return undefined;
}
exports.anyMatchRegex = anyMatchRegex;
/**
 * Returns `items` when `condition` is true and returns [] when it is false.
 * This function and the array spread operator can be used together to
 * conditionally including array items in an array literal.  Inspired by
 * http://2ality.com/2017/04/conditional-literal-entries.html.
 *
 * @example
 * const arr = [
 *     ...insertIf(cond, "a", "b", "c")
 * ];
 *
 * @param condition - The condition that controls whether to insert the items
 * @param items - The items that will be in the returned array if `condition` is
 * true
 * @return An array containing `items` if `condition` is true.  An empty array
 * if `condition` is false.
 */
function insertIf(condition) {
    var items = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        items[_i - 1] = arguments[_i];
    }
    return condition ? items : [];
}
exports.insertIf = insertIf;

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9kZXBvdC9hcnJheUhlbHBlcnMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQTs7Ozs7R0FLRztBQUNILHVCQUE4QixPQUFzQixFQUFFLEtBQWE7SUFDL0QsWUFBWSxDQUFDO0lBRWIsS0FBd0IsVUFBTyxFQUFQLG1CQUFPLEVBQVAscUJBQU8sRUFBUCxJQUFPLEVBQUU7UUFBNUIsSUFBTSxTQUFTLGdCQUFBO1FBQ2hCLElBQU0sUUFBUSxHQUF5QixLQUFLLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDO1FBQzdELElBQUksUUFBUSxFQUFFO1lBQ1YsT0FBTyxRQUFRLENBQUM7U0FDbkI7S0FDSjtJQUVELE9BQU8sU0FBUyxDQUFDO0FBQ3JCLENBQUM7QUFYRCxzQ0FXQztBQUdEOzs7Ozs7Ozs7Ozs7Ozs7O0dBZ0JHO0FBQ0gsa0JBQW1DLFNBQWtCO0lBQUUsZUFBeUI7U0FBekIsVUFBeUIsRUFBekIscUJBQXlCLEVBQXpCLElBQXlCO1FBQXpCLDhCQUF5Qjs7SUFDNUUsT0FBTyxTQUFTLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDO0FBQ2xDLENBQUM7QUFGRCw0QkFFQyIsImZpbGUiOiJkZXBvdC9hcnJheUhlbHBlcnMuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIFRlc3RzIHRoZSBzdHJpbmdzIGluIGBzdHJpbmdzYCBhbmQgcmV0dXJucyB0aGUgZmlyc3Qgbm9uLW51bGwgbWF0Y2guXG4gKiBAcGFyYW0gc3RyaW5ncyAtIFRoZSBhcnJheSBvZiBzdHJpbmdzIHRvIHNlYXJjaFxuICogQHBhcmFtIHJlZ2V4IC0gVGhlIHBhdHRlcm4gdG8gc2VhcmNoIGZvclxuICogQHJldHVybnMgVGhlIGZpcnN0IG1hdGNoIGZvdW5kLiAgbnVsbCBpZiBubyBtYXRjaCB3YXMgZm91bmQuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBhbnlNYXRjaFJlZ2V4KHN0cmluZ3M6IEFycmF5PHN0cmluZz4sIHJlZ2V4OiBSZWdFeHApOiBSZWdFeHBFeGVjQXJyYXkgfCB1bmRlZmluZWQge1xuICAgIFwidXNlIHN0cmljdFwiO1xuXG4gICAgZm9yIChjb25zdCBjdXJTdHJpbmcgb2Ygc3RyaW5ncykge1xuICAgICAgICBjb25zdCBjdXJNYXRjaDogUmVnRXhwRXhlY0FycmF5fG51bGwgPSByZWdleC5leGVjKGN1clN0cmluZyk7XG4gICAgICAgIGlmIChjdXJNYXRjaCkge1xuICAgICAgICAgICAgcmV0dXJuIGN1ck1hdGNoO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIHVuZGVmaW5lZDtcbn1cblxuXG4vKipcbiAqIFJldHVybnMgYGl0ZW1zYCB3aGVuIGBjb25kaXRpb25gIGlzIHRydWUgYW5kIHJldHVybnMgW10gd2hlbiBpdCBpcyBmYWxzZS5cbiAqIFRoaXMgZnVuY3Rpb24gYW5kIHRoZSBhcnJheSBzcHJlYWQgb3BlcmF0b3IgY2FuIGJlIHVzZWQgdG9nZXRoZXIgdG9cbiAqIGNvbmRpdGlvbmFsbHkgaW5jbHVkaW5nIGFycmF5IGl0ZW1zIGluIGFuIGFycmF5IGxpdGVyYWwuICBJbnNwaXJlZCBieVxuICogaHR0cDovLzJhbGl0eS5jb20vMjAxNy8wNC9jb25kaXRpb25hbC1saXRlcmFsLWVudHJpZXMuaHRtbC5cbiAqXG4gKiBAZXhhbXBsZVxuICogY29uc3QgYXJyID0gW1xuICogICAgIC4uLmluc2VydElmKGNvbmQsIFwiYVwiLCBcImJcIiwgXCJjXCIpXG4gKiBdO1xuICpcbiAqIEBwYXJhbSBjb25kaXRpb24gLSBUaGUgY29uZGl0aW9uIHRoYXQgY29udHJvbHMgd2hldGhlciB0byBpbnNlcnQgdGhlIGl0ZW1zXG4gKiBAcGFyYW0gaXRlbXMgLSBUaGUgaXRlbXMgdGhhdCB3aWxsIGJlIGluIHRoZSByZXR1cm5lZCBhcnJheSBpZiBgY29uZGl0aW9uYCBpc1xuICogdHJ1ZVxuICogQHJldHVybiBBbiBhcnJheSBjb250YWluaW5nIGBpdGVtc2AgaWYgYGNvbmRpdGlvbmAgaXMgdHJ1ZS4gIEFuIGVtcHR5IGFycmF5XG4gKiBpZiBgY29uZGl0aW9uYCBpcyBmYWxzZS5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGluc2VydElmPEl0ZW1UeXBlPihjb25kaXRpb246IGJvb2xlYW4sIC4uLml0ZW1zOiBBcnJheTxJdGVtVHlwZT4pOiBBcnJheTxJdGVtVHlwZT4ge1xuICAgIHJldHVybiBjb25kaXRpb24gPyBpdGVtcyA6IFtdO1xufVxuIl19
