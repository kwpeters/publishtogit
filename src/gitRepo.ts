import {Directory} from "./directory";
import {File} from "./file";
import {spawn} from "./spawn";
import {IPackageJson} from "./nodePackage";
import {GitBranch} from "./gitBranch";
import {GitRepoPath} from "./GitRepoPath";
import * as _ from "lodash";


/**
 * Determines whether dir is a directory containing a Git repository.
 * @param dir - The directory to inspect
 * @return A promise for a boolean indicating whether dir contains a Git
 * repository.  This promise will never reject.
 */
export async function isGitRepoDir(dir: Directory): Promise<boolean> {

    const [dirExists, dotGitExists] = await Promise.all([
        dir.exists(),                        // The directory exists
        new Directory(dir, ".git").exists()  // The directory contains a .git directory
    ]);

    return Boolean(dirExists && dotGitExists);
}


export class GitRepo
{
    //region Private Data Members
    private _dir: Directory;
    private _branches: Array<GitBranch> | undefined;
    //endregion


    /**
     * Creates a new GitRepo instance, pointing it at a directory containing the
     * wrapped repo.
     * @param dir - The directory containing the repo
     * @return A Promise for the GitRepo.
     */
    public static async fromDirectory(dir: Directory): Promise<GitRepo>
    {
        const isGitRepo = await isGitRepoDir(dir);
        if (isGitRepo)
        {
            return new GitRepo(dir);
        }
        else
        {
            throw new Error("Path does not exist or is not a Git repo.");
        }
    }


    /**
     * Clones a Git repo at the specified location.
     * @param gitRepoPath - The path to the repository to be cloned
     * @param parentDir - The parent directory where the repo will be placed.
     * The repo will be cloned into a subdirectory named after the project.
     * @return A promise for the cloned Git repo.
     */
    public static clone(gitRepoPath: GitRepoPath, parentDir: Directory): Promise<GitRepo>
    {
        const projName = gitRepoPath.getProjectName();

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
                ["clone", gitRepoPath.toString(), projName],
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
     * Determines whether this GitRepo is equal to another GitRepo.  Two
     * instances are considered equal if they point to the same directory.
     * @method
     * @param other - The other GitRepo to compare with
     * @return Whether the two GitRepo instances are equal
     */
    public equals(other: GitRepo): boolean
    {
        return this._dir.equals(other._dir);
    }


    /**
     * Gets the files that are under Git version control.
     * @return A Promise for an array of files under Git version control.  Each
     * string is the file's *relative* path within the repo.
     */
    // TODO: Make the following return an array of File objects.
    public files(): Promise<Array<string>>
    {
        return spawn("git", ["ls-files"], this._dir.toString())
        .then((stdout) => {
            return stdout.split("\n");
        });
    }


    // TODO: Write unit tests for this method and make sure the files have the
    // correct preceding path.
    public modifiedFiles(): Promise<Array<File>>
    {
        return spawn("git", ["ls-files", "-m"], this._dir.toString())
        .then((stdout) => {
            const fileNames = stdout.split("\n");
            return _.map(fileNames, (curFileName) => {
                return new File(this._dir, curFileName);
            });
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
                const gitRepoPath = GitRepoPath.fromUrl(remoteUrl);
                if (gitRepoPath)
                {
                    return gitRepoPath.getProjectName();
                }
            }
        })
        .then((projName) => {
            if (projName) {
                return projName;
            }

            // Look for the project name in package.json.
            const packageJson = new File(this._dir, "package.json").readJsonSync<IPackageJson>();
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
            // Invalidate the cache.  If this update fails, subsequent requests
            // will have to update the cache.
            this._branches = undefined;

            // The internal cache of branches needs to be updated.
            updatePromise = GitBranch.enumerateGitRepoBranches(this)
            .then((branches: Array<GitBranch>) => {
                this._branches = branches;
            });
        }
        else
        {
            // The internal cache does not need to be updated.
            updatePromise = Promise.resolve();
        }

        return updatePromise
        .then(() => {
            // Since updatePromise resolved, we know that this._branches has been
            // set.
            return this._branches!;
        });
    }


    public async getCurrentBranch(): Promise<GitBranch>
    {
        // FUTURE: I don't think the following will work when in detached head state.
        const stdout = await spawn("git", ["rev-parse", "--abbrev-ref", "HEAD"], this._dir.toString());
        const branchName = stdout.trim();
        const branch = await GitBranch.create(this, branchName);
        if (!branch)
        {
            throw new Error("Could not get current branch.");
        }

        // All is good.
        return branch;
    }


    public async checkout(branch: GitBranch, shouldCreate: boolean): Promise<void>
    {
        const args = shouldCreate ?
            ["checkout", "-b", branch.name] :
            ["checkout", branch.name];

        await spawn("git", args, this._dir.toString());
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
