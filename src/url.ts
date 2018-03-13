import * as _ from "lodash";


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


//
// A regex that captures the protocol part of a URL (everything up to the
// "://").
// results[1] - The string of all protocols.
//
const urlProtocolRegex = /^([a-zA-Z0-9_+]+?):\/\//;


export class Url
{
    public static fromString(urlStr: string): Url | undefined
    {
        // TODO: Verify that urlStr is a valid URL.
        return new Url(urlStr);
    }


    //region Data Members
    private _url: string;
    //endregion


    private constructor(url: string)
    {
        this._url = url;
    }


    public toString(): string
    {
        return this._url;
    }


    public getProtocols(): Array<string>
    {
        const results = urlProtocolRegex.exec(this._url);
        if (!results)
        {
            return [];
        }

        return results[1].split("+");
    }


    public replaceProtocol(newProtocol: string): Url
    {
        if (!_.endsWith(newProtocol, "://"))
        {
            newProtocol = newProtocol + "://";
        }

        const urlStr = this._url.replace(urlProtocolRegex, newProtocol);
        return new Url(urlStr);
    }
}

