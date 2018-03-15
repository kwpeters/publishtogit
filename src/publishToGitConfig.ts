import {Directory} from "./directory";
import * as os from "os";


/**
 * @class
 * @classdesc A singleton that is used to hold the global configuratio for this
 * application.
 */
class PublishToGitConfig
{
    public constructor()
    {
    }

    public get tmpDir(): Directory
    {
        return new Directory(os.homedir(), ".publishtogit", "tmp");
    }

    public init(): void
    {
        this.tmpDir.ensureExistsSync();
    }
}


// The one and only instance of this singleton.
export const config = new PublishToGitConfig();
