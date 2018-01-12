import {File} from "./file";


export interface IPublishToGitConfig
{
    publishRepository: string;
}


export function readConfig<ConfigType>(configFile: File): ConfigType | undefined
{
    if (!configFile.existsSync())
    {
        return undefined;
    }

    try
    {
        const text = configFile.readSync();
        return JSON.parse(text);
    }
    catch (err) {
        return undefined;
    }
}
