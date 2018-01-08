import {Directory} from "./directory";
import {File} from "./file";
import {spawn} from "./spawn";
import {readConfig, IPackageJson} from "./configHelpers";


/**
 * Extracts the project name from a Git URL
 * @param gitUrl - The Git URL for a repository
 * @return The name of the project.  This method will throw an Error if the
 * provided URL is invalid.
 */
export function gitUrlToProjectName(gitUrl: string): string
{
    const match = gitUrl.match(/.*\/(.*)\.git$/);
    if (!match)
    {
        throw new Error("Tried to get project name from invalid Git URL.");
    }

    return match[1];
}


export class GitRepo
{
    //region Private Data Members
    private _dir: Directory;
    //endregion

    /**
     * Creates a new GitRepo instance, pointing it at a directory containing the
     * wrapped repo.
     * @param dir - The directory containing the repo
     * @return A Promise for the GitRepo.
     */
    public static create(dir: Directory): Promise<GitRepo>
    {
        return Promise.all([
            dir.exists(),                         // Directory specified by the user must exist
            new Directory(dir, ".git").exists()   // The directory must contain a .git folder
        ])
        .then((results) => {
            if (!results[0] || !results[1])
            {
                throw new Error("Path does not exist or is not a Git repo.");
            }
            return new GitRepo(dir);
        });
    }


    /**
     * Clones a Git repo at the specified location.
     * @param gitUrl - The URL to the remote repo
     * @param parentDir - The parent directory where the repo will be cloned
     * @return A promise for the cloned Git repo.
     */
    public static clone(gitUrl: string, parentDir: Directory): Promise<GitRepo>
    {
        const projName = gitUrlToProjectName(gitUrl);
        if (projName === undefined)
        {
            return Promise.reject(new Error("Invalid Git URL."));
        }

        const repoDir = new Directory(parentDir, projName);

        return parentDir.exists()
        .then((isDirectory) => {
            if (!isDirectory)
            {
                throw new Error(`${parentDir} is not a directory.`);
            }
        })
        .then(() => {
            return spawn(
                "git",
                ["clone", gitUrl, projName],
                parentDir.toString());
        })
        .then(() => {
            return new GitRepo(repoDir);
        });
    }


    /**
     * Constructs a new GitRepo.  Private in order to provide error checking.
     * See static methods.
     *
     * @param dir - The directory containing the Git repo.
     */
    private constructor(dir: Directory)
    {
        this._dir = dir;
    }


    /**
     * Gets the directory containing this Git repo.
     * @return The directory containing this git repo.
     */
    public get directory(): Directory
    {
        return this._dir;
    }


    /**
     * Gets the files that are under Git version control.
     * @return A Promise for an array of files under Git version control.  Each
     * string is the file's *relative* path within the repo.
     */
    public files(): Promise<Array<string>>
    {
        return spawn("git", ["ls-files"], this._dir.toString())
        .then((stdout) => {
            return stdout.split("\n");
        });
    }


    /**
     * Get the remotes configured for the Git repo.
     * @return A Promise for an object where the remote names are the keys and
     * the remote URL is the value.
     */
    public remotes(): Promise<{[name: string]: string}>
    {
        return spawn("git", ["remote", "-vv"], this._dir.toString())
        .then((stdout) => {

            const lines = stdout.split("\n");
            let remotes: {[name: string]: string} = {};
            lines.forEach((curLine) => {
                const match = curLine.match(/^(\w+)\s+(.*)\s+\(\w+\)$/);
                if (match)
                {
                    remotes[match[1]] = match[2];
                }
            });

            return remotes;
        });
    }


    /**
     * Gets the name of this Git repository.  If the repo has a remote, the name
     * is taken from the last part of the remote's URL.  Otherwise, the name
     * will be taken from the "name" property in package.json.  Otherwise, the
     * name will be the name of the folder the repo is in.
     * @return A Promise for the name of this repository.
     */
    public name(): Promise<string>
    {
        return this.remotes()
        .then((remotes) => {
            const remoteNames = Object.keys(remotes);
            if (remoteNames.length > 0)
            {
                const remoteUrl = remotes[remoteNames[0]];
                return gitUrlToProjectName(remoteUrl);
            }
        })
        .then((projName) => {
            if (projName) {
                return projName;
            }

            // Look for the project name in package.json.
            const packageJson = readConfig<IPackageJson>(new File(this._dir, "package.json"));
            if (packageJson) {
                return packageJson.name;
            }
        })
        .then((projName) => {
            if (projName) {
                return projName;
            }

            const dirName = this._dir.dirName;
            if (dirName === "/")
            {
                throw new Error("Unable to determine Git repo name.");
            }

            return dirName;
        });
    }
}
