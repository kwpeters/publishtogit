import * as path from "path";
import {Directory} from "./directory";
import {File} from "./file";
import {GitRepo, gitUrlToProjectName} from "./gitRepo";
import {config} from "./publishToGitConfig";
import {IPackageJson, IPublishToGitConfig, readConfig} from "./configHelpers";
import {NodePackage} from "./nodePackage";


async function main(): Promise<void>
{
    if (!process.argv[2])
    {
        console.error("Source directory argument not specified!");
        return;
    }

    const srcDir = new Directory(process.argv[2]);

    const publishConfig = readConfig<IPublishToGitConfig>(new File(srcDir, "publishtogit.json"));
    const packageConfig = readConfig<IPackageJson>(new File(srcDir, "package.json"));

    if (!publishConfig || !packageConfig)
    {
        console.error("Cannot find publishtogit.json or package.json");
        return;
    }

    const tmpDir = config.tmpDir;
    const publishRepoDir = new Directory(tmpDir, gitUrlToProjectName(publishConfig.publishRepository));

    await tmpDir.ensureExists();

    // Delete the temporary publishing directory if it already exists.
    await publishRepoDir.delete();

    // Clone the publishing repo.
    const publishRepo: GitRepo = await GitRepo.clone(publishConfig.publishRepository, tmpDir);

    // Get the tags in the repo so we can check if there is already one with
    // the version number.
    const hasTag = await publishRepo.hasTag(packageConfig.version);
    if (hasTag)
    {
        throw new Error(`The publish repo already has the tag ${packageConfig.version}.  Publish aborted.`);
    }

    // Delete all files in the publish repo.
    await deleteTrackedFiles(publishRepo);

    const pkg: NodePackage = await NodePackage.fromDirectory(srcDir);
    await pkg.publish(publishRepoDir, false);
    await publishRepo.stageAll();


    // TODO: Drop a label
    // publishRepo.createTag()


    // TODO: Tags are not pushed by default.  You must push them like branches.
    // publishRepo.pushTag()


    // TODO: Print a message about how to include the project in another
    // project
    // "enipjs-core": "git+https://mft.ra-int.com/gitlab/app-platform/enipjs-core.git#59f09b7"
    // or how to install globally.
}


/**
 * Deletes all tracked files within a repo.
 * @param repo - The repo to clear
 * @return A Promise that is resolved when all files have been deleted.
 */
function deleteTrackedFiles(repo: GitRepo): Promise<void>
{
    const repoAbsPath = repo.directory.absPath();

    return repo.files()
    .then((relFilePaths) => {
        const deletePromises = relFilePaths.map((curRelPath) => {
            // Make the relative file paths absolute.
            return path.join(repoAbsPath, curRelPath);
        })
        .map((curAbsPath) => {
            // Delete
            const curFile = new File(curAbsPath);
            return curFile.delete();
        });

        return Promise.all(deletePromises);
    })
    .then(() => {
    });
}


main();
