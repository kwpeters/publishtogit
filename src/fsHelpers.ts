import * as fs from "fs";
import * as path from "path";
import {promisify1, sequence} from "./promiseHelpers";


const mkdirAsync = promisify1<void, string>(fs.mkdir);
const readdirAsync = promisify1<Array<string>, string>(fs.readdir);
const unlinkAsync = promisify1<void, string>(fs.unlink);
const rmdirAsync = promisify1<void, string>(fs.rmdir);


export function isDirectory(path: string): Promise<boolean> {
    return new Promise<boolean>((resolve: (isDirectory: boolean) => void) => {
        fs.stat(path, (err: any, stats: fs.Stats) => {
            if (err) {
                resolve(false);
            } else {
                resolve(stats.isDirectory());
            }
        });
    });
}


export function ensureDirectoryExists(dirPath: string) {

    return isDirectory(dirPath)
    .then((isDirectory: boolean) => {
        if (isDirectory) {
            return true;
        } else {
            const parts = dirPath.split(path.sep);

            // Create an array of successively longer paths, each one adding a
            // new directory onto the end.
            const dirsToCreate = parts.reduce((acc: Array<string>, curPart: string): Array<string> => {
                if (acc.length === 0) {
                    if (curPart.length === 0) {
                        // The first item is an empty string.  The path must
                        // have started with the directory separator character
                        // (an absolute path was specified).
                        acc.push(path.sep);
                    } else {
                        // The first item contains text.  A relative path must
                        // have been specified.
                        acc.push(curPart);
                    }
                } else {
                    const last = acc[acc.length - 1];
                    acc.push(path.join(last, curPart));
                }
                return acc;
            }, []);

            // Don't attempt to create the root of the filesystem.
            if ((dirsToCreate.length > 0) && (dirsToCreate[0] === path.sep)) {
                dirsToCreate.shift();
            }

            // Map each successively longer path to a function that will create
            // it.
            const createFuncs = dirsToCreate.map((dirToCreate: string) => {
                return () => {
                    return mkdirAsync(dirToCreate)
                    .catch((err) => {
                        // If the directory already exists, just keep going.
                        if (err.code !== "EEXIST") {
                            throw err;
                        }
                    });
                }
            });

            // Execute the directory creation functions in sequence.
            return sequence(createFuncs, undefined);
        }
    });

}


export function emptyDirectory(dirPath: string): Promise<void> {
    return deleteDirectory(dirPath)
    .then(() => {
        return ensureDirectoryExists(dirPath);
    });
}


export function deleteDirectory(dirPath: string): Promise<void> {

    return isDirectory(dirPath)
    .then((isDirectory: boolean) => {
        if (!isDirectory){
            // The specified directory does not exist.  Do nothing.
            return Promise.resolve();
        } else {
            // First, delete the contents of the specified directory.
            return readdirAsync(dirPath)
            .then((items: Array<string>) => {
                const absPaths = items.map((curItem) => {
                    return path.join(dirPath, curItem);
                });

                const deletePromises = absPaths.map((curAbsPath: string) => {
                    if (fs.statSync(curAbsPath).isDirectory()) {
                        return deleteDirectory(curAbsPath);
                    } else {
                        return unlinkAsync(curAbsPath);
                    }
                });

                return Promise.all(deletePromises);
            })
            .then(() => {
                // Now that all of the items in the directory have been deleted, delete
                // the directory itself.
                return rmdirAsync(dirPath);
            });
        }
    });
}


export function isFile(path: string): Promise<boolean> {
    return new Promise<boolean>((resolve: (isDirectory: boolean) => void) => {
        fs.stat(path, (err: any, stats: fs.Stats) => {
            if (err) {
                resolve(false);
            } else {
                resolve(stats.isFile());
            }
        });
    });
}


export function deleteFile(filePath: string): Promise<void> {
    return unlinkAsync(filePath);
}
