import {Directory} from "./directory";
import * as os from "os";


class PublishToGitConfig
{
    public constructor()
    {
    }

    public get tmpDir(): Directory
    {
        return new Directory(os.homedir(), ".publish-to-git", "tmp");
    }
}


export const config = new PublishToGitConfig();
