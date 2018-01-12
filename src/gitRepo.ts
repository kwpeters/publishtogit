import {Directory} from "./directory";
import {File} from "./file";
import {spawn} from "./spawn";
import {readConfig} from "./configHelpers";
import {IPackageJson} from "./nodePackage";
import {GitBranch} from "./gitBranch";
import * as _ from "lodash";

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
    private _branches: Array<GitBranch> | undefined;
    //endregion

    // TODO: Rename the following method to fromDirectory()
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


    public tags(): Promise<Array<string>>
    {
        return spawn("git", ["tag"], this._dir.toString())
        .then((stdout) => {
            if (stdout.length === 0)
            {
                return [];
            }

            return stdout.split("\n");
        });
    }


    public hasTag(tagName: string): Promise<boolean>
    {
        return this.tags()
        .then((tags) => {
            return tags.indexOf(tagName) >= 0;
        });
    }


    public createTag(tagName: string, message?: string): Promise<GitRepo>
    {
        if (message === undefined)
        {
            message = "";
        }

        return spawn("git", ["tag", "-a", tagName, "-m", message], this._dir.toString())
        .then(() => {
            return this;
        });
    }


    public deleteTag(tagName: string): Promise<GitRepo>
    {
        return spawn("git", ["tag", "--delete", tagName], this._dir.toString())
        .catch((err) => {
            if (err.stderr.includes("not found"))
            {
                // The specified tag name was not found.  We are still
                // successful.
            }
            else
            {
                throw err;
            }
        })
        .then(() => {
            return this;
        });
    }


    public pushTag(tagName: string, remoteName: string): Promise<GitRepo>
    {
        return spawn("git", ["push", remoteName, tagName], this._dir.toString())
        .then(() => {
            return this;
        });
    }


    public getBranches(forceUpdate: boolean = false): Promise<Array<GitBranch>>
    {
        let updatePromise: Promise<void>;

        if (this._branches === undefined || forceUpdate)
        {
            this._branches = undefined;

            updatePromise = spawn("git", ["branch", "-a"], this._dir.toString())
            .then((stdout) => {
                const branches: Array<GitBranch> = _.chain(stdout.split("\n"))
                .map(curLine => curLine.trim())
                // Replace the "* " that precedes the current working branch
                .map(curLine => curLine.replace(/^\*\s+/, ""))
                // Filter out the line that looks like: remotes/origin/HEAD -> origin/master
                .filter(curLine => !/^[\w/]+\/HEAD\s+->\s+[\w/]+$/.test(curLine))
                .map(curLine => curLine.trim())
                // Create an array of GitBranch objects
                .map(curLine => GitBranch.fromString(this, curLine))
                // Keep only the truthy objects returned from the above GitBranch.fromString().
                .filter<GitBranch | undefined, GitBranch>(
                    (val): val is GitBranch => val instanceof GitBranch
                )
                .value();

                return branches;
            })
            .then((branches) => {
                this._branches = branches;
            });
        }
        else
        {
            // We don't need to update the cached branches.
            updatePromise = Promise.resolve();
        }

        return updatePromise
        .then(() => {
            // If updatePromise resolved, we know that this._branches has been
            // set.
            return this._branches!;
        });
    }


    public stageAll(): Promise<GitRepo>
    {
        return spawn("git", ["add", "."], this._dir.toString())
        .then(() => {
            return this;
        });
    }


    // TODO: To get the staged files:
    // git diff --name-only --cached
}
