import * as fs from "fs";
import * as path from "path";
import {promisify1, promisify3} from "./promiseHelpers";
import {Directory} from "./directory";
import {ListenerTracker} from "./listenerTracker";


const unlinkAsync = promisify1<void, string>(fs.unlink);
const statAsync   = promisify1<fs.Stats, string>(fs.stat);
const utimesAsync = promisify3<void, string, string | number | Date, string | number | Date>(fs.utimes);


export class File
{
    //region Data Members
    private _filePath: string;
    //endregion


    public static exists(filePath: string): Promise<fs.Stats | false>
    {
        return new File(filePath).exists();
    }


    public static existsSync(filePath: string): fs.Stats | false
    {
        return new File(filePath).existsSync();
    }


    public constructor(filePath: string)
    {
        this._filePath = filePath;
    }


    /**
     * Gets the directory portion of this file's path (everything before the
     * file name and extension).
     * @return The directory portion of this file's path.  This string will
     * always end with the OS's directory separator ("/").
     */
    public get dirName(): string
    {
        return path.dirname(this._filePath) + path.sep;
    }


    /**
     * Gets this file's base name.  This is the part of the file name preceding
     * the extension.
     * @return This file's base name.
     */
    public get baseName(): string
    {
        const extName: string = path.extname(this._filePath);
        return path.basename(this._filePath, extName);
    }


    /**
     * Gets the full file name of this file.  This includes both the base name
     * and extension.
     * @return This file's file name
     */
    public get fileName(): string
    {
        return path.basename(this._filePath);
    }


    /**
     * Gets the extension of this file.  This includes the initial dot (".").
     * @return This file's extension
     */
    public get extName(): string
    {
        return path.extname(this._filePath);
    }


    /**
     * Gets the directory containing this file
     * @return A Directory object representing this file's directory.
     */
    public get directory(): Directory
    {
        const dirName: string = path.dirname(this._filePath);
        return new Directory(dirName);
    }


    public toString(): string
    {
        return this._filePath;
    }


    public equals(otherFile: File): boolean
    {
        return this.absPath() === otherFile.absPath();
    }


    public exists(): Promise<fs.Stats | false>
    {
        return new Promise<fs.Stats | false>((resolve: (result: fs.Stats | false) => void) => {
            fs.stat(this._filePath, (err: any, stats: fs.Stats) => {

                if (!err && stats.isFile())
                {
                    resolve(stats);
                }
                else
                {
                    resolve(false);
                }

            });
        });
    }


    public existsSync(): fs.Stats | false
    {
        try {
            const stats = fs.statSync(this._filePath);
            return stats.isFile() ? stats : false;
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


    public absPath(): string
    {
        return path.resolve(this._filePath);
    }


    public delete(): Promise<void>
    {
        return this.exists()
        .then((stats: fs.Stats | false) => {
            if (!stats) {
                return Promise.resolve();
            } else {
                return unlinkAsync(this._filePath);
            }
        });
    }


    public deleteSync(): void
    {
        if (!this.existsSync()) {
            return;
        }

        fs.unlinkSync(this._filePath);
    }


    /**
     * Copies this file to the specified destination.
     * @param dstDirOrFile - If a File, specifies the
     * destination directory and file name.  If a directory, specifies only the
     * destination directory and destFileName specifies the destination file
     * name.
     * @param dstFileName - When destDirOrFile is a Directory,
     * optionally specifies the destination file name.  If omitted, the
     * destination file name will be the same as the source (this File).
     * @return A Promise for a File representing the destination file.
     */
    public copy(dstDirOrFile: Directory | File, dstFileName?: string): Promise<File>
    {
        //
        // Based on the parameters, figure out what the destination file path is
        // going to be.
        //
        let destFile: File;

        if (dstDirOrFile instanceof File) {
            // The caller has specified the destination directory and file
            // name in the form of a File.
            destFile = dstDirOrFile;
        } else {           // dstDirOrFile instanceof Directory
            // The caller has specified the destination directory and
            // optionally a new file name.
            if (dstFileName === undefined) {
                destFile = new File(path.join(dstDirOrFile.toString(), this.fileName));
            } else {
                destFile = new File(path.join(dstDirOrFile.toString(), dstFileName));
            }
        }

        //
        // Before we do anything, make sure that the source file exists.  If it
        // doesn't we should get out before we create the destination file.
        //
        return this.exists()
        .then((stats: fs.Stats | false) => {
            if (!stats)
            {
                throw new Error(`Source file ${this._filePath} does not exist.`);
            }
        })
        .then(() => {
            //
            // Make sure the directory for the destination file exists.
            //
            return destFile.directory.ensureExists();
        })
        .then(() => {
            //
            // Do the copy.
            //
            return copyFile(this._filePath, destFile.toString(), {preserveTimestamps: true});
        })
        .then(() => {
            return destFile;
        });
    }


    // TODO: copySync()
    // TODO: move()
    // TODO: moveSync()


    /**
     * Write text to this file, replacing the file if it exists.  If any parent
     * directories do not exist, they are created.
     * @param text - The new contents of this file
     * @return A Promise that is resolved when the file has been written.
     */
    public write(text: string): Promise<void>
    {
        return this.directory.ensureExists()
        .then(() => {
            fs.writeFile(this._filePath, text, (err) => {
                if (err)
                {
                    throw err;
                }
            });
        });
    }


    /**
     * Writes text to this file, replacing the file if it exists.  If any parent
     * directories do not exist, they are created.
     * @param text - The new contents of this file
     */
    public writeSync(text: string): void
    {
        this.directory.ensureExistsSync();
        fs.writeFileSync(this._filePath, text);
    }


    /**
     * Reads the contents of this file as a string.  Rejects if this file does
     * not exist.
     * @return A Promise for the text contents of this file
     */
    public read(): Promise<string>
    {
        return new Promise<string>((resolve: (text: string) => void, reject: (err: any) => void) => {
            fs.readFile(this._filePath, {encoding: "utf8"}, (err, data) => {
                if (err)
                {
                    reject(err);
                    return;
                }

                resolve(data);
            })
        })
    }


    /**
     * Reads the contents of this file as a string.  Throws if this file does
     * not exist.
     * @return This file's contents
     */
    public readSync(): string
    {
        return fs.readFileSync(this._filePath, {encoding: "utf8"});
    }


}


export interface ICopyOptions
{
    preserveTimestamps: boolean;
}


function copyFile(source: string, dest: string, options?: ICopyOptions): Promise<void>
{
    //
    // Design Note
    // We could have used fs.readFile() and fs.writeFile() here, but that would
    // read the entire file contents of the source file into memory.  It is
    // thought that using streams is more efficient and performant because
    // streams can read and write smaller chunks of the data.
    //

    return new Promise<void>((resolve: () => void, reject: (err: any) => void) => {

        const readStream = fs.createReadStream(source);
        const readListenerTracker = new ListenerTracker(readStream);

        const writeStream = fs.createWriteStream(dest);
        const writeListenerTracker = new ListenerTracker(writeStream);

        readListenerTracker.on("error", (err) => {
            reject(err);
            readListenerTracker.removeAll();
            writeListenerTracker.removeAll();
        });

        writeListenerTracker.on("error", (err) => {
            reject(err);
            readListenerTracker.removeAll();
            writeListenerTracker.removeAll();
        });

        writeListenerTracker.on("close", () => {
            resolve();
            readListenerTracker.removeAll();
            writeListenerTracker.removeAll();
        });

        readStream.pipe(writeStream);
    })
    .then(() => {
        if (options && options.preserveTimestamps)
        {
            //
            // The caller wants to preserve the source file's timestamps.  Copy
            // them to the destination file now.
            //
            return statAsync(source)
            .then((srcStats: fs.Stats) => {
                //
                // Note:  Setting the timestamps on dest requires us to specify
                // the timestamp in seconds (not milliseconds).  When we divide
                // by 1000 below and truncation happes, we are actually setting
                // dest's timestamps *before* those of of source.
                //
                return utimesAsync(dest, srcStats.atime.valueOf()/1000, srcStats.mtime.valueOf()/1000);
            });
        }
    });
}
