import {Directory} from "./directory";
import {isGitRepoDir} from "./gitRepo";


// A regular expression to match valid Git repo URLs.
// match[1]: project name
const gitUrlRegexp = /.*\/(.*)\.git$/;


/**
 * Extracts the project name from a Git URL
 * @param gitUrl - The Git URL for a repository
 * @return The name of the project.  This method will throw an Error if the
 * provided URL is invalid.
 */
export function gitUrlToProjectName(gitUrl: string): string
{
    const match = gitUrl.match(gitUrlRegexp);
    if (!match)
    {
        throw new Error("Tried to get project name from invalid Git URL.");
    }

    return match[1];
}


export class GitRepoPath
{

    /**
     * Creates a GitRepoPath from a local directory
     * @static
     * @method
     * @param repoDir - The directory the path is to represent
     * @return A Promise for the GitRepoPath or undefined if repoDir does not
     * exist or does not contain a Git repository.
     */
    public static fromDirectory(repoDir: Directory): Promise<GitRepoPath>
    {
        return isGitRepoDir(repoDir)
        .then((isGitRepoDir: boolean) => {
            if (isGitRepoDir)
            {
                return new GitRepoPath(repoDir);
            }

            throw new Error("Directory does not contain a Git repository.");

        });
    }


    /**
     * Creates a GitRepoPath from a Git URL
     * @static
     * @method
     * @param url - The URL the path is to represent
     * @return A Promise for the GitRepoPath or undefined if url is not a valid
     * Git repository URL.
     */
    public static fromUrl(url: string): GitRepoPath | undefined
    {
        if (!gitUrlRegexp.test(url))
        {
            return undefined;
        }

        return new GitRepoPath(url);

    }


    //region Data Members
    private _path: Directory | string;
    //endregion


    private constructor(gitRepoPath: Directory | string)
    {
        this._path = gitRepoPath;
    }


    public toString(): string
    {
        if (this._path instanceof Directory)
        {
            return this._path.toString();
        }
        else
        {
            return this._path;
        }
    }


    public getProjectName(): string
    {
        if (this._path instanceof Directory)
        {
            return this._path.dirName;
        }
        else
        {
            const matches = gitUrlRegexp.exec(this._path);
            if (!matches)
            {
                throw new Error("GitRepoPath in invalid state.");
            }

            return matches[1];
        }
    }
}
