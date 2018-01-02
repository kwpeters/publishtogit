import * as path from "path";
import * as fs from "fs";
import * as stripJsonComments from "strip-json-comments";


export interface IPackageJson
{
    name: string;
    version: string;
    description: string;
    repository: {type: "string", url: string};
}


export interface IPublishToGitConfig
{
    publishRepository: string;
}


export function readConfig<ConfigType>(sourceDir: string, filename: string): ConfigType | undefined {
    try
    {
        let absPath = path.resolve(sourceDir);
        absPath = path.join(absPath, filename);

        // Now we better have the path to a file.
        const stat = fs.statSync(absPath);
        if (!stat.isFile())
        {
            return undefined;
        }

        // Read the file, remove comments and parse into JSON.
        const contents = fs.readFileSync(absPath).toString();
        const config = JSON.parse(stripJsonComments(contents));
        return config;
    }
    catch (err) {
        return undefined;
    }
}
