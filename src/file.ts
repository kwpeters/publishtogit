import * as fs from "fs";
import * as path from "path";
import {promisify1} from "./promiseHelpers";
import {Directory} from "./directory";


const unlinkAsync = promisify1<void, string>(fs.unlink);


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


    // TODO: copy()
    // TODO: copySync()
    // TODO: move()
    // TODO: moveSync()
    // TODO: write()
    // TODO: writeSync()
    // TODO: read()
    // TODO: readSync()

}
