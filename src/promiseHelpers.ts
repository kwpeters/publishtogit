import {Writable} from "stream";

type CallBackType<ResultType> = (err: any, result?: ResultType) => void;


/**
 * Takes a Node-style async function with any number of arguments and a callback
 * and returns a function that accepts the same number of arguments (minus the
 * callback) and returns a promise for the result.
 * @param func - The Node-style function that takes arguments followed by a
 * Node-style callback.
 * @return A function that takes the arguments and returns a Promise for the result.
 */
export function promisifyN<ResultType>(
    func: (...args: Array<any>) => void
): (...args: Array<any>) => Promise<ResultType> {

    const promisifiedFunc = function (...args: Array<any>): Promise<ResultType> {

        return new Promise<ResultType>((resolve: (result: ResultType) => void, reject: (err: any) => void) => {
            func.apply(undefined, args.concat((err: any, result: ResultType) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(result);
                }
            }));
        });
    };
    return promisifiedFunc;
}

/**
 * Takes a Node-style async function with one argument and a callback and returns
 * a function that accepts that one argument and returns a promise for the result.
 * This function is similar to promisifyN(), except that it retains type safety.
 * @param func - The Node-style function that takes one argument and a
 * Node-style callback.
 * @return A function that takes the one argument and returns a Promise for the
 * result.
 */
export function promisify1<ResultType, Arg1Type>(
    func: (arg1: Arg1Type, cb: CallBackType<ResultType> ) => void
): (arg1: Arg1Type) => Promise<ResultType> {

    const promisifiedFunc = function (arg1: Arg1Type): Promise<ResultType> {
        return new Promise<ResultType>((resolve: (result: ResultType) => void, reject: (err: any) => void) => {
            func(arg1, (err: any, result: ResultType) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(result);
                }
            });
        })
    };
    return promisifiedFunc;

}


/**
 * Takes a Node-style async function with two arguments and a callback and returns
 * a function that accepts the two arguments and returns a promise for the result.
 * This function is similar to promisifyN(), except that it retains type safety.
 * @param func - The Node-style function that takes two arguments and a
 * Node-style callback.
 * @return A function that takes the two arguments and returns a Promise for the
 * result.
 */
export function promisify2<ResultType, Arg1Type, Arg2Type>(
    func: (arg1: Arg1Type, arg2: Arg2Type, cb: CallBackType<ResultType> ) => void
): (arg1: Arg1Type, arg2: Arg2Type) => Promise<ResultType> {

    const promisifiedFunc = function (arg1: Arg1Type, arg2: Arg2Type): Promise<ResultType> {
        return new Promise<ResultType>((resolve: (result: ResultType) => void, reject: (err: any) => void) => {
            func(arg1, arg2, (err: any, result: ResultType) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(result);
                }
            });
        })
    };
    return promisifiedFunc;
}


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
export function sequence(
    tasks: Array<(previousValue: any) => any>,
    initialValue: any
): Promise<any> {
    "use strict";

    return tasks.reduce(
        (accumulator, curTask) => {
            return accumulator.then(curTask);
        },
        Promise.resolve(initialValue));
}


export function streamToPromise(stream: Writable): Promise<void> {
     return new Promise<void>((resolve: () => void, reject: (err: any) => void) => {
         stream.on("finish", () => {
             resolve();
         });

         stream.on("error", (err) => {
             reject(err);
         });
     });
}
