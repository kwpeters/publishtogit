import * as _ from "lodash";

//
// A regex that will parse the parts of a version string.
//
// optional non-capturing group - Matches an optional word followed by optional
//     whitespace.
// match[1] - The major version number
// match[2] - The minor version number
// match[3] - The patch version number
//
const SEMVER_REGEXP = /^(?:\w*?\s*?)?(\d+)\.(\d+)\.(\d+)$/;


export class SemVer
{
    public static sort(arr: Array<SemVer>): Array<SemVer>
    {
        return _.sortBy<SemVer>(
            arr,
            [
                (semver: SemVer) => semver.major,
                (semver: SemVer) => semver.minor,
                (semver: SemVer) => semver.patch
            ]
        );
    }

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


    public toString(): string
    {
        // TODO: This should not include the version prefix.
        return this.getPatchVersionString();
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
        // TODO: This should include the version prefix.
        return `${this._major}`;
    }


    public getMinorVersionString(): string
    {
        // TODO: This should include the version prefix.
        return `${this._major}.${this._minor}`;
    }


    public getPatchVersionString(): string
    {
        // TODO: This should include the version prefix.
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
