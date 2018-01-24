const SEMVER_REGEXP = /^(\d+)\.(\d+)\.(\d+)$/;


export class SemVer
{

    public static fromString(str: string): SemVer | undefined
    {
        const matches = SEMVER_REGEXP.exec(str);
        if (matches)
        {
            return new SemVer(parseInt(matches[1], 10),
                              parseInt(matches[2], 10),
                              parseInt(matches[3], 10));
        }
        else
        {
            return undefined;
        }
    }


    //region Data Members
    private _major: number;   // "Breaking"
    private _minor: number;   // "Feature"
    private _patch: number;   // "Fix"
    //endregion


    private constructor(major: number, minor: number, patch: number)
    {
        this._major = major;
        this._minor = minor;
        this._patch = patch;
    }


    public get major(): number
    {
        return this._major;
    }


    public get minor(): number
    {
        return this._minor;
    }


    public get patch(): number
    {
        return this._patch;
    }


    public getMajorVersionString(): string
    {
        return `${this._major}`;
    }


    public getMinorVersionString(): string
    {
        return `${this._major}.${this._minor}`;
    }


    public getPatchVersionString(): string
    {
        return `${this._major}.${this._minor}.${this._patch}`;
    }


    public compare(other: SemVer): -1 | 0 | 1
    {
        if (this._major < other._major)
        {
            return -1;
        }
        else if (this._major > other._major)
        {
            return 1;
        }
        else
        {
            // Major numbers are equal.
            if (this._minor < other._minor)
            {
                return -1;
            }
            else if (this._minor > other._minor)
            {
                return 1;
            }
            else
            {
                // Major and minor are equal.
                if (this._patch < other._patch)
                {
                    return -1;
                }
                else if (this._patch > other._patch)
                {
                    return 1;
                }
                else
                {
                    return 0;
                }
            }
        }
    }
}
