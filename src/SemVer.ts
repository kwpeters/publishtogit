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


//
// The string that is prefixed onto version strings.
//
const VERSION_STRING_PREFIX = "v";


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


    /**
     * Returns this version as a string (no prefixes)
     * @return A string representation of this version
     */
    public toString(): string
    {
        return `${this._major}.${this._minor}.${this._patch}`;
    }


    /**
     * Gets the major version number
     */
    public get major(): number
    {
        return this._major;
    }


    /**
     * Gets the minor version number
     */
    public get minor(): number
    {
        return this._minor;
    }


    /**
     * Gets the patch version number
     */
    public get patch(): number
    {
        return this._patch;
    }


    /**
     * Gets this version as a version string (prefixed), including only the
     * major version number.
     * @return The major version string (prefixed)
     */
    public getMajorVersionString(): string
    {
        return `${VERSION_STRING_PREFIX}${this._major}`;
    }


    /**
     * Gets this version as a version string (prefixed), including major and
     * minor version numbers.
     * @return The minor version string (prefixed)
     */
    public getMinorVersionString(): string
    {
        return `${VERSION_STRING_PREFIX}${this._major}.${this._minor}`;
    }


    /**
     * Gets this version as a version string (prefixed), including major, minor
     * and patch version numbers.
     * @return The patch version string (prefixed)
     */
    public getPatchVersionString(): string
    {
        return `${VERSION_STRING_PREFIX}${this._major}.${this._minor}.${this._patch}`;
    }


    /**
     * Compares this version with other and determines whether the this version
     * is less, greater or equal to other.
     * @param other - The other version to compare to
     * @return {-1 | 0 | 1} -1 if this version is less than other. 1 if this
     * version is greater than other.  0 if this version equals other.
     */
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
