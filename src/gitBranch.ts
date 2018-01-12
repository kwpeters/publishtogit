import {GitRepo} from "./gitRepo";

export class GitBranch
{
    //region Static Data Members
    //
    // The regex needed to parse the id string
    // If given remotes/remotename/feature/branchname
    // group 1: "remotes/remotename"
    // group 2: "remotename"
    // group 3: "feature/branchname"
    //
    private static strParserRegex: RegExp = /^(remotes\/([\w.-]+)\/)?(.*)$/;

    //endregion


    //region Data Members
    private _repo: GitRepo;
    private _remoteName: string;
    private _name: string;
    //endregion


    public static fromString(repo: GitRepo, str: string): GitBranch | undefined
    {
        const results = GitBranch.strParserRegex.exec(str);
        if (!results)
        {
            return undefined;
        }

        const remoteName = results[2];
        const branchName = results[3];
        return new GitBranch(repo, remoteName, branchName);
    }


    private constructor(repo: GitRepo, remoteName: string, branchName: string)
    {
        this._repo = repo;
        this._remoteName = remoteName;
        this._name = branchName;
    }


    public get name(): string
    {
        return this._name;
    }
}
