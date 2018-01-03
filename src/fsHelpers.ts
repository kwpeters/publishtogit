import * as fs from "fs";
import * as path from "path";
import {promisify1, sequence} from "./promiseHelpers";


const mkdirAsync = promisify1<void, string>(fs.mkdir);
const readdirAsync = promisify1<Array<string>, string>(fs.readdir);
const unlinkAsync = promisify1<void, string>(fs.unlink);
const rmdirAsync = promisify1<void, string>(fs.rmdir);
const statAsync  = promisify1<fs.Stats, string>(fs.stat);


export class Directory
{
    //region Data Members
    private _dirPath: string;
    //endregion

    public static exists(dirPath: string): Promise<boolean>
    {
        return new Promise<boolean>((resolve: (isDirectory: boolean) => void) => {
            fs.stat(dirPath, (err: any, stats: fs.Stats) => {
                if (err) {
                    resolve(false);
                } else {
                    resolve(stats.isDirectory());
                }
            });
        });
    }


    public static existsSync(dirPath: string): boolean
    {
        try
        {
            const stats = fs.statSync(dirPath);
            return stats.isDirectory();
        }
        catch (err)
        {
            if (err.code === "ENOENT")
            {
                return false;
            }
            else
            {
                throw err;
            }
        }
    }


    public constructor(dirPath: string)
    {
        this._dirPath = dirPath;
    }


    public toString(): string
    {
        return this._dirPath;
    }


    public absPath(): string
    {
        return path.resolve(this._dirPath);
    }


    public isEmpty(): Promise<boolean>
    {
        return readdirAsync(this._dirPath)
        .then((fsEntries) => {
            return fsEntries.length === 0;
        });
    }


    public isEmptySync(): boolean
    {
        const fsEntries = fs.readdirSync(this._dirPath);
        return fsEntries.length === 0;
    }


    public ensureExists(): Promise<void>
    {
        return Directory.exists(this._dirPath)
        .then((isDirectory: boolean) =>
        {
            if (isDirectory)
            {
                return true;
            } else
            {
                const parts = this._dirPath.split(path.sep);

                // Create an array of successively longer paths, each one adding a
                // new directory onto the end.
                const dirsToCreate = parts.reduce((acc: Array<string>, curPart: string): Array<string> => {
                    if (acc.length === 0)
                    {
                        if (curPart.length === 0)
                        {
                            // The first item is an empty string.  The path must
                            // have started with the directory separator character
                            // (an absolute path was specified).
                            acc.push(path.sep);
                        }
                        else
                        {
                            // The first item contains text.  A relative path must
                            // have been specified.
                            acc.push(curPart);
                        }
                    }
                    else
                    {
                        const last = acc[acc.length - 1];
                        acc.push(path.join(last, curPart));
                    }
                    return acc;
                }, []);

                // Don't attempt to create the root of the filesystem.
                if ((dirsToCreate.length > 0) && (dirsToCreate[0] === path.sep))
                {
                    dirsToCreate.shift();
                }

                // Map each successively longer path to a function that will create
                // it.
                const createFuncs = dirsToCreate.map((dirToCreate: string) =>
                {
                    return (): Promise<void> =>
                    {
                        return mkdirAsync(dirToCreate)
                        .catch((err) =>
                        {
                            // If the directory already exists, just keep going.
                            if (err.code !== "EEXIST")
                            {
                                throw err;
                            }
                        });
                    };
                });

                // Execute the directory creation functions in sequence.
                return sequence(createFuncs, undefined);
            }
        });
    }


    public ensureExistsSync(): void
    {
        if (Directory.existsSync(this._dirPath))
        {
            return;
        }

        const parts = this._dirPath.split(path.sep);

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

        dirsToCreate.forEach((curDir) => {
            try {
                fs.mkdirSync(curDir);
            }
            catch (err) {
                // If the directory already exists, just keep going.
                if (err.code !== "EEXIST") {
                    throw err;
                }
            }
        });
    }


    public empty(): Promise<void>
    {
        return deleteDirectory(this._dirPath)
        .then(() => {
            return this.ensureExists();
        });
    }


    public emptySync(): void
    {
        deleteDirectorySync(this._dirPath);
        this.ensureExistsSync();
    }
}


export function deleteDirectory(dirPath: string): Promise<void> {

    return Directory.exists(dirPath)
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


export function deleteDirectorySync(dirPath: string): void {

    if (!Directory.existsSync(dirPath))
    {
        // The directory does not exist.  Do nothing.
        return;
    }

    // First, delete the contents of the specified directory.
    let fsItems: Array<string> = fs.readdirSync(dirPath);
    fsItems = fsItems.map((curFsItem) => {
        return path.join(dirPath, curFsItem);
    });

    fsItems.forEach((curFsItem) => {
        const stats = fs.statSync(curFsItem);
        if (stats.isDirectory()) {
            deleteDirectorySync(curFsItem);
        }
        else {
            fs.unlinkSync(curFsItem);
        }
    });

    // Now that all of the items in the directory have been deleted, delete the
    // directory itself.
    fs.rmdirSync(dirPath);
}


export class File
{
    //region Data Members
    private _filePath: string;
    //endregion


    public static exists(filePath: string): Promise<boolean>
    {
        return new Promise<boolean>((resolve: (isDirectory: boolean) => void) => {
            fs.stat(filePath, (err: any, stats: fs.Stats) => {
                if (err) {
                    resolve(false);
                } else {
                    resolve(stats.isFile());
                }
            });
        });
    }


    public static existsSync(filePath: string): boolean
    {
        try {
            const stats = fs.statSync(filePath);
            return stats.isFile();
        }
        catch (err) {
            if (err.code === "ENOENT")
            {
                return false;
            }
            else
            {
                throw err;
            }
        }
    }


    public constructor(filePath: string)
    {
        this._filePath = filePath;
    }


    public toString(): string
    {
        return this._filePath;
    }


    public absPath(): string
    {
        return path.resolve(this._filePath);
    }

}


export function deleteFile(filePath: string): Promise<void> {
    return File.exists(filePath)
    .then((isFile: boolean) => {
        if (!isFile) {
            return Promise.resolve();
        } else {
            return unlinkAsync(filePath);
        }
    });
}


export function deleteFileSync(filePath: string): void {

    if (!File.existsSync(filePath)) {
        return;
    }

    fs.unlinkSync(filePath);
}


interface IDirectoryContents {
    subdirs: Array<string>;
    files:   Array<string>;
}


/**
 * Reads the contents of the specified directory.
 * @param dirPath - The directory to read
 * @return The contents of the directory, separated into a list of files and a
 * list of subdirectories.  All paths returned are absolute paths.
 */
export function readDir(dirPath: string): Promise<IDirectoryContents> {

    return readdirAsync(dirPath)
    .then((fsEntries) => {
        const absPaths = fsEntries.map((curEntry) => {
            return path.resolve(path.join(dirPath, curEntry));
        });

        const contents: IDirectoryContents = {subdirs: [], files: []};

        const promises = absPaths.map((curAbsPath) => {
            return statAsync(curAbsPath)
            .then((stats) => {
                if (stats.isFile()) {
                    contents.files.push(curAbsPath);
                } else if (stats.isDirectory()) {
                    contents.subdirs.push(curAbsPath);
                }
            });
        });

        return Promise.all(promises)
        .then(() => {
            return contents;
        });
    });
}


/**
 * Reads the contents of the specified directory.
 * @param dirPath - The directory to read
 * @return The contents of the directory, separated into a list of files and a
 * list of subdirectories.  All paths returned are absolute paths.
 */
export function readDirSync(dirPath: string): IDirectoryContents {

    let fsEntries = fs.readdirSync(dirPath);
    fsEntries = fsEntries.map((curFsEntry) => {
        return path.resolve(path.join(dirPath, curFsEntry));
    });

    const contents: IDirectoryContents = {subdirs: [], files: []};
    fsEntries.forEach((curFsEntry) => {
        const stats = fs.statSync(curFsEntry);
        if (stats.isFile())
        {
            contents.files.push(curFsEntry);
        }
        else if (stats.isDirectory())
        {
            contents.subdirs.push(curFsEntry);
        }
    });

    return contents;
}


/**
 * Recursively removes empty subdirectories from within the specified directory.
 * @param dirPath - The directory to prune
 * @return A Promise that is resolved when the directory has been pruned.
 */
export function pruneDir(dirPath: string): Promise<void> {
    
    return readDir(dirPath)
    .then((contents) => {
        const promises = contents.subdirs.map((curSubdir) => {
            const subdir = new Directory(curSubdir);
            //
            // Prune the current subdirectory.
            //
            return pruneDir(curSubdir)
            .then(() => {
                //
                // If the subdirectory is now empty, delete it.
                //
                return subdir.isEmpty();
            })
            .then((dirIsEmpty) => {
                if (dirIsEmpty) {
                    // TODO: Move deleteDirectory() to Directory.
                    return deleteDirectory(curSubdir);
                }
            })
            .then(() => {});
        });

        return Promise.all(promises)
        .then(() => {
        });
    });
}


/**
 * Recursively removes empty subdirectories from within the specified directory.
 * @param dirPath - The directory to prune
 */
export function pruneDirSync(dirPath: string): void {

    const contents = readDirSync(dirPath);
    contents.subdirs.forEach((curSubdir) => {
        const subdir = new Directory(curSubdir);

        pruneDirSync(curSubdir);
        //
        // If the subdirectory is now empty, delete it.
        //
        if (subdir.isEmptySync())
        {
            deleteDirectorySync(curSubdir);
        }
    });
}
