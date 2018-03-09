#!/usr/bin/env node

import {Directory} from "./directory";
import {File} from "./file";
import {GitRepo} from "./gitRepo";
import {config as globalConfig} from "./publishToGitConfig";
import {IPublishToGitConfig} from "./configHelpers";
import {IPackageJson, NodePackage} from "./nodePackage";
import {GitRepoPath, gitUrlToProjectName} from "./GitRepoPath";
import {SemVer} from "./SemVer";
import {GitBranch} from "./gitBranch";
import * as _ from "lodash";
import {Url} from "./url";
import * as yargs from "yargs";


interface ICmdLineOpts
{
    dryRun: boolean;
    srcDir: Directory;
    additionalTags?: Array<string>;
}


function parseArgs(): ICmdLineOpts | undefined
{
    const argv = yargs
    .usage("Publishes a Node package to a Git repo.\nUsage: $0 [--dry-run] source_directory")
    .help()
    .option(
        "dry-run",
        {
            type: "boolean",
            default: false,
            demandOption: false,
            describe: "Perform all operations but do not push to origin"
        }
    )
    .option(
        "tag",
        {
            demandOption: false,
            describe: "An additional tag to apply to the published commit (can " +
                      "be used multiple times).  If the tag already exists, it " +
                      "will be moved."
        }
    )
    .version()  // version will be read from package.json!
    .demandCommand(1)
    .wrap(80)
    .argv;

    // Get the source project directory from the command line arguments.  If not
    // present, assume the current working directory.
    const srcDirStr = argv._[0] || ".";
    const srcDir = new Directory(srcDirStr);
    if (!srcDir.existsSync())
    {
        console.log(`The directory ${srcDirStr} does not exist.`);
        return undefined;
    }

    const cmdLineOpts: ICmdLineOpts = {
        dryRun: argv["dry-run"],
        srcDir: srcDir
    };

    if (argv.tag) {
        cmdLineOpts.additionalTags = [].concat(argv.tag);
    }

    return cmdLineOpts;
}


async function getSrc(cmdLineOpts: ICmdLineOpts):
Promise<{
    dir: Directory,
    repo: GitRepo,
    pkg: NodePackage,
    version: SemVer,
    publishToGitConfig: IPublishToGitConfig
}>
{
    const srcRepo = await GitRepo.fromDirectory(cmdLineOpts.srcDir);

    // Make sure the specified directory is a NPM project (contains a
    // package.json).
    const pkg = await NodePackage.fromDirectory(cmdLineOpts.srcDir)
    .catch(() => {
        return Promise.reject(new Error(`The directory ${cmdLineOpts.srcDir.toString()} is not a NPM package.`));
    });

    // TODO: Make sure the specified directory does not have any uncommitted
    // files.

    // Make sure the specified directory has a publishtogit.json.
    const configFile = new File(cmdLineOpts.srcDir, "publishtogit.json");
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
        dir:                cmdLineOpts.srcDir,
        repo:               srcRepo,
        pkg:                pkg,
        version:            semver,
        publishToGitConfig: publishToGitConfig
    };
}


async function main(): Promise<void>
{
    //
    // Make sure the global tmpDir exists.
    //
    globalConfig.tmpDir.ensureExistsSync();

    const cmdLineOpts = parseArgs();
    if (!cmdLineOpts)
    {
        return;
    }

    const src = await getSrc(cmdLineOpts);
    console.log(`Project will publish to Git repository: ${src.publishToGitConfig.publishRepository}.`);

    //
    // TODO: If the source repo has a CHANGELOG.md, make sure it has a section
    // describing this release.  Maybe I could help generate it by providing all
    // commits since last label?
    //

    //
    // Figure out what the publish repo directory and nuke it if it already
    // exists.
    //
    const publishProjName = gitUrlToProjectName(src.publishToGitConfig.publishRepository);
    const publishDir = new Directory(globalConfig.tmpDir, publishProjName);
    publishDir.deleteSync();
    console.log(`Temp publish directory: ${publishDir.toString()}`);

    //
    // Clone the publish repo.
    //
    const publishRepoPath = GitRepoPath.fromUrl(src.publishToGitConfig.publishRepository);
    if (!publishRepoPath) {
        throw new Error(`Invalid publish repo URL "${src.publishToGitConfig.publishRepository}".`);
    }
    console.log(`Cloning publish repo...`);
    const publishRepo = await GitRepo.clone(publishRepoPath, globalConfig.tmpDir);

    //
    // Check to see if the current version has already been published so
    // that we can return an error before taking any further action.
    //
    const newTagName = `v${src.pkg.config.version}`;
    const hasTag = await publishRepo.hasTag(newTagName);
    if (hasTag)
    {
        const msg = `The publish repo already has tag ${newTagName}. ` +
            "Have you forgotten to bump the version number?";
        console.log(msg);
        throw new Error(msg);
    }

    //
    // To make viewing differences between releases a little easier, checkout
    // the branch named after the major version and then the major.minor
    // version.
    //
    const majorBranchName = src.version.getMajorVersionString();
    console.log(`Checking out branch: ${majorBranchName}`);
    const majorBranch = await GitBranch.create(publishRepo, majorBranchName);
    await publishRepo.checkout(majorBranch, true);
    await publishRepo.pushCurrentBranch("origin", true);

    const minorBranchName = src.version.getMinorVersionString();
    console.log(`Checking out branch: ${minorBranchName}`);
    const minorBranch = await GitBranch.create(publishRepo, minorBranchName);
    await publishRepo.checkout(minorBranch, true);
    await publishRepo.pushCurrentBranch("origin", true);

    //
    // Remove all files under version control and prune directories that are
    // empty.
    //
    console.log("Deleting all files...");
    await deleteTrackedFiles(publishRepo);
    await publishDir.prune();

    //
    // Publish the source repo to the publish directory.
    //
    console.log("Publishing package contents to publish repository...");
    await src.pkg.publish(publishDir, false);

    //
    // Modify the package.json file so that the publish repo package
    // - is named after the publish repo
    // - the repository url points to the publish repo instead of the source repo
    //
    console.log("Updating publish package.json...");
    const publishPackageJsonFile = new File(publishDir, "package.json");
    const publishPackageJson = publishPackageJsonFile.readJsonSync<IPackageJson>();
    publishPackageJson.repository.url = src.publishToGitConfig.publishRepository;
    publishPackageJson.name = publishProjName;
    publishPackageJsonFile.writeJsonSync(publishPackageJson);

    //
    // Stage and commit the published files.
    //
    console.log("Commiting published files...");
    await publishRepo.stageAll();
    const commitMsg = `publish-to-git publishing version ${newTagName}.`;
    await publishRepo.commit(commitMsg);

    // TODO: If the source repo has a CHANGELOG.md, add its contents as the annotated tag message.

    //
    // Apply tags.
    // We know that newTagName does not exist, because it was checked for earlier.
    // We will "force" tag creation for additional tags, assuming the user wants
    // to move it if it already exists.
    //
    let tags = [newTagName];

    if (cmdLineOpts.additionalTags) {
       tags = tags.concat(cmdLineOpts.additionalTags);
    }

    await Promise.all(_.map(tags, (curTag) => {
        console.log(`Creating tag: ${curTag}`);
        return publishRepo.createTag(curTag, "", true);
    }));

    //
    // If doing a "dry run", stop.
    //
    if (cmdLineOpts.dryRun)
    {
        const msg = [
            "Running in dry-run mode.  The repository in the following temporary directory",
            "has been left ready to push to a public server.",
            publishDir.toString()
        ];
        console.log(msg.join("\n"));
        return;
    }

    //
    // Push the branch.
    //
    console.log("Pushing branch to origin...");
    await publishRepo.pushCurrentBranch("origin");

    //
    // Push all tags.
    //
    await Promise.all(_.map(tags, (curTag) => {
        console.log(`Pushing tag ${curTag} to origin.`);
        return publishRepo.pushTag(curTag, "origin", true);
    }));

    //
    // Print a completion message.
    // Tell the user how to include the published repository into another
    // project's dependencies.
    //
    // TODO: Include install commands for commit hash and all tags.
    const dependencyUrl = Url.setProtocol(src.publishToGitConfig.publishRepository, "git+https");
    const npmInstallCmd = `npm install ${dependencyUrl}#${newTagName}`;
    const doneMessage = [
        "Done.",
        "To include the published library in a Node.js project, execute the following command:",
        npmInstallCmd
    ];
    console.log(doneMessage.join("\n"));

    // "enipjs-core": "git+https://mft.ra-int.com/gitlab/app-platform/enipjs-core.git#59f09b7"
}


/**
 * Deletes all tracked files within a repo.
 * @param repo - The repo to clear
 * @return A Promise that is resolved when all files have been deleted.
 */
async function deleteTrackedFiles(repo: GitRepo): Promise<void>
{
    const files = await repo.files();
    const deletePromises = _.map(files, (curFile) => {
        return curFile.delete();
    });

    await Promise.all(deletePromises);
}


main();
