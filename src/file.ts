import * as fs from "fs";
import * as path from "path";
import {promisify1} from "./promiseHelpers";


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


    // TODO: dirName
    // TODO: baseName
    // TODO: fileName
    // TODO: extName
    // TODO: directory


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
