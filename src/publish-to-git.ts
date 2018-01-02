import * as path from "path";
import * as os from "os";
import {spawn} from "./spawn";
import {deleteDirectory, deleteFile, ensureDirectoryExists} from "./fsHelpers";
import {GitRepo, gitUrlToProjectName} from "./gitRepo";
import {IPackageJson, IPublishToGitConfig, readConfig} from "./configHelpers";



function main(): void
{
    const srcDir = process.argv[2];
    if (!srcDir) {
        console.error("Source directory argument not specified!");
        return;
    }

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

        //
        // Delete all files in the publish repo.
        //
        return deleteTrackedFiles(publishRepo);
    })
    .then(() => {
        console.log("Done.");
    });
}


/**
 * Deletes all tracked files within a repo.
 * @param repo - The repo to clear
 * @return A Promise that is resolved when all files have been deleted.
 */
function deleteTrackedFiles(repo: GitRepo): Promise<void>
{
    return repo.files()
    .then((relFilePaths) => {
        const deletePromises = relFilePaths.map((curRelPath) => {
            // Make the relative file paths absolute.
            return path.join(repo.directory, curRelPath);
        })
        .map((curAbsPath) => {
            // Delete
            return deleteFile(curAbsPath);
        });

        return Promise.all(deletePromises);
    })
    .then(() => {
    });
}


main();
