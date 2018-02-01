import * as path from "path";
import {Directory} from "./directory";
import {File} from "./file";
import {GitRepo} from "./gitRepo";
import {config as globalConfig} from "./publishToGitConfig";
import {IPublishToGitConfig} from "./configHelpers";
import {IPackageJson, NodePackage} from "./nodePackage";
import {GitRepoPath, gitUrlToProjectName} from "./GitRepoPath";
import {SemVer} from "./SemVer";
import {GitBranch} from "./gitBranch";


async function getSrc():
Promise<{
    dir: Directory,
    repo: GitRepo,
    pkg: NodePackage,
    version: SemVer,
    publishToGitConfig: IPublishToGitConfig
}>
{
    // Get the source project directory from the command line arguments.  If not
    // present, assume the current working directory.
    const srcDirString = process.argv[2] || ".";

    // Make sure the specified directory exists.
    const srcDir = new Directory(srcDirString);
    if (!srcDir.existsSync()) {
        return Promise.reject(new Error(`The directory "${srcDirString}" does not exist.`));
    }

    const srcRepo = await GitRepo.fromDirectory(srcDir);

    // Make sure the specified directory is a NPM project (contains a
    // package.json).
    const pkg = await NodePackage.fromDirectory(srcDir)
    .catch(() => {
        return Promise.reject(new Error(`The directory ${srcDirString} is not a NPM package.`));
    });

    // Make sure the specified directory has a publishtogit.json.
    const configFile = new File(srcDir, "publishtogit.json");
    if (!configFile.existsSync()) {
        return Promise.reject(new Error(`Could not find file ${configFile.toString()}.`));
    }

    const publishToGitConfig = configFile.readJsonSync<IPublishToGitConfig>();
    if (!publishToGitConfig) {
        return Promise.reject(new Error(`Could not read configuration from ${configFile.toString()}.`));
    }

    const semver = SemVer.fromString(pkg.config.version);
    if (!semver)
    {
        return Promise.reject(new Error(`Invalid semver version string ${pkg.config.version}.`));
    }

    return {
        dir:  srcDir,
        repo: srcRepo,
        pkg:  pkg,
        version: semver,
        publishToGitConfig: publishToGitConfig
    };
}


async function main(): Promise<void>
{
    const src = await getSrc();

    //
    // Make sure the global tmpDir exists.
    //
    globalConfig.tmpDir.ensureExistsSync();

    //
    // Figure out what the publish repo directory and nuke it if it already
    // exists.
    //
    const publishProjName = gitUrlToProjectName(src.publishToGitConfig.publishRepository);
    const publishDir = new Directory(globalConfig.tmpDir, publishProjName);
    publishDir.deleteSync();

    //
    // Clone the publish repo.
    //
    const publishRepoPath = GitRepoPath.fromUrl(src.publishToGitConfig.publishRepository);
    if (!publishRepoPath) {
        throw new Error(`Invalid publish repo URL "${src.publishToGitConfig.publishRepository}".`);
    }
    const publishRepo = await GitRepo.clone(publishRepoPath, globalConfig.tmpDir);

    //
    // Check to see if the current version has already been published so
    // that we can return an error before taking any further action.
    //
    const hasTag = await publishRepo.hasTag(src.version.getPatchVersionString());
    if (hasTag)
    {
        const msg = `The publish repo already has tag ${src.version.getPatchVersionString()}. ` +
            "Have you forgotten to bump the version number?";
        throw new Error(msg);
    }

    //
    // To make viewing differences between releases a little easier, checkout
    // the branch named after the major version and then the major.minor
    // version.
    //
    const majorBranch = await GitBranch.create(publishRepo, src.version.getMajorVersionString());
    if (!majorBranch)
    {
        throw new Error("Unable to construct GitBranch.");
    }
    await publishRepo.checkout(majorBranch, true);

    const minorBranch = await GitBranch.create(publishRepo, src.version.getMinorVersionString());
    if (!minorBranch)
    {
        throw new Error("Unable to construct GitBranch.");
    }
    await publishRepo.checkout(minorBranch, true);

    //
    // Remove all files under version control and prune directories that are
    // empty.
    //
    await deleteTrackedFiles(publishRepo);
    await publishDir.prune();

    //
    // Publish the source repo to the publish directory.
    //
    await src.pkg.publish(publishDir, false);

    //
    // Modify the package.json file so that the publish repo package
    // - is named after the publish repo
    // - the repository url points to the publish repo instead of the source repo
    //
    const publishPackageJsonFile = new File(publishDir, "package.json");
    const publishPackageJson = publishPackageJsonFile.readJsonSync<IPackageJson>();
    publishPackageJson.repository.url = src.publishToGitConfig.publishRepository;
    publishPackageJson.name = gitUrlToProjectName(src.publishToGitConfig.publishRepository);
    publishPackageJsonFile.writeJsonSync(publishPackageJson);

    //
    // Stage and commit the published files.
    //
    await publishRepo.stageAll();



    // Drop a tag with the version number (publishRepo.createTag())
    // Push the branch and the tag (publishRepo.pushTag())

    // Print a message about how to include the project in another
    // project
    // "enipjs-core": "git+https://mft.ra-int.com/gitlab/app-platform/enipjs-core.git#59f09b7"
    // or how to install globally.


    // await publishRepo.stageAll();



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
