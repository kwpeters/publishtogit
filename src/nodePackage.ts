import * as fs from "fs";
import {Directory} from "./directory";
import {File} from "./file";
import {spawn} from "./spawn";


export class NodePackage
{
    //region Data members
    private _pkgDir: Directory;
    //endregion


    public static fromDirectory(pkgDir: Directory): Promise<NodePackage>
    {
        // Make sure the directory exists.
        return pkgDir.exists()
        .then((stats: fs.Stats | undefined) => {
            if (!stats)
            {
                throw new Error(`Directory ${pkgDir.toString()} does not exist.`);
            }

            // Make sure the package has a package.json file in it.
            const packageJson = new File(pkgDir, "package.json");
            return packageJson.exists();
        })
        .then((stats) => {
            if (!stats)
            {
                throw new Error("Directory ${pkgDir.toString()} does not contain a package.json file.");
            }

            return new NodePackage(pkgDir);
        });

    }


    public constructor(pkgDir: Directory)
    {
        this._pkgDir = pkgDir;
    }


    public pack(outDir?: Directory): Promise<File>
    {
        return spawn("npm", ["pack"], this._pkgDir.toString())
        .then((stdout: string) => {
            return new File(this._pkgDir, stdout);
        })
        .then((tgzFile: File) => {
            if (outDir)
            {
                return tgzFile.move(outDir);
            }
            else
            {
                return tgzFile;
            }

        });
    }


}
