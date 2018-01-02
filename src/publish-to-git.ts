import * as path from "path";
import * as os from "os";
import {spawn} from "./spawn";
import {deleteDirectory, deleteFile, ensureDirectoryExists} from "./fsHelpers";
import {GitRepo, gitUrlToProjectName} from "./gitRepo";
import {IPackageJson, IPublishToGitConfig, readConfig} from "./configHelpers";



function main(): void
{
    const srcDir = process.argv[2];

    const publishConfig = readConfig<IPublishToGitConfig>(srcDir, "publishtogit.json");
    const packageConfig = readConfig<IPackageJson>(srcDir, "package.json");

    if (!publishConfig || !packageConfig)
    {
        console.error("Cannot find publishtogit.json or package.json");
        return;
    }

    const tmpDir = path.join(os.homedir(), ".publish-to-git", "tmp");
    const publishRepoDir = path.join(tmpDir, gitUrlToProjectName(publishConfig.publishRepository));

    let publishRepo: GitRepo;

    ensureDirectoryExists(tmpDir)
    .then(() => {
        //
        // Delete the temporary publishing directory if it already exists.
        //
        return deleteDirectory(publishRepoDir);
    })
    .then(() => {
        //
        // Clone the publishing repo.
        //
        return GitRepo.clone(publishConfig.publishRepository, tmpDir);
    })
    .then((repo) => {
        publishRepo = repo;

        return publishRepo.files();
    })
    .then((files) => {
        console.log(`files: ${JSON.stringify(files, undefined, 2)}`);
        const deletePromises = files.map((curFile) => {
            return deleteFile(curFile);
        });
    })
    .then(() => {
        console.log("Done.");
    });


}


main();
