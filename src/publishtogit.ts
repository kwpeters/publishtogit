#!/usr/bin/env node

import {userInfo} from "os";
import * as _ from "lodash";
import * as yargs from "yargs";
import {Directory} from "./depot/directory";
import {File} from "./depot/file";
import {NodePackage} from "./depot/nodePackage";
import {Url} from "./depot/url";
import {GitRepo} from "./depot/gitRepo";
import {GitBranch} from "./depot/gitBranch";
import {config as globalConfig} from "./publishToGitConfig";


////////////////////////////////////////////////////////////////////////////////
// Types
////////////////////////////////////////////////////////////////////////////////

interface IInstanceConfig
{
    devRepo: GitRepo;
    pkg: NodePackage;
    dryRun: boolean;
    tags: Array<string>;
    forceTags: boolean;
    removeTypes: boolean;
}


////////////////////////////////////////////////////////////////////////////////
// Helper Functions
////////////////////////////////////////////////////////////////////////////////

function getArgs(): yargs.Arguments
{
    return yargs
    .usage("Publishes a Node.js package to a project's Git repository.")
    .help()
    .option("tag",
        {
            demandOption: false,
            describe: "Apply the specified tag to the publish commit (can be used multiple times)."
        }
    )
    .option("tag-version",
        {
            type: "boolean",
            default: false,
            demandOption: false,
            describe: "Apply a tag with the project's version number (from package.json) to the publish commit"
        }
    )
    .option("force-tags",
        {
            type: "boolean",
            default: false,
            demandOption: false,
            describe: "Forces tags to be applied, moving any that already exist"
        }
    )
    .option("dry-run",
        {
            type: "boolean",
            default: false,
            demandOption: false,
            describe: "Perform all operations but do not push the publish commit to the project's repo"
        }
    )
    .option("remove-types",
        {
            type: "boolean",
            default: false,
            demandOption: false,
            describe: "Remove '@types' packages from package.json in published commit"
        }
    )
    .version()  // version will be read from package.json!
    .wrap(80)
    .argv;
}


async function getInstanceConfig(argv: yargs.Arguments): Promise<IInstanceConfig>
{
    const devDir = new Directory(".");
    const devRepo = await GitRepo.fromDirectory(devDir);
    const pkg = await NodePackage.fromDirectory(devDir);

    // Build the array of tags that will be applied to the publish commit.
    let tags: Array<string> = [].concat(argv.tag || []);
    if (argv["tag-version"])
    {
        tags.push(`v${pkg.config.version}`);
    }

    // Make sure we have at least 1 tag to apply.  Otherwise git might garbage
    // collect the publish commit we are about to create.
    if (tags.length === 0)
    {
        throw new Error("At least one tag must be applied by using either --tag-version or --tag.");
    }

    return {
        dryRun: argv["dry-run"],
        tags: tags,
        devRepo: devRepo,
        pkg: pkg,
        forceTags: argv["force-tags"],
        removeTypes: argv["remove-types"]
    };
}


async function checkInitialConditions(instanceConfig: IInstanceConfig): Promise<void>
{
    // TODO: We should make sure that the origin remote...
    //  $ git remote -vv
    //  origin  https://github.com/kwpeters/publishtogit.git (fetch)
    //  origin  https://github.com/kwpeters/publishtogit.git (push)
    //  ... points to the same repo as package.json
    //  (instanceConfig.pkg.config.repository.url)...
    //  "repository": {
    //      "type": "git",
    //      "url": "git+https://github.com/kwpeters/publishtogit.git"
    //    }

    // TODO: We could just figure out what branch is being tracked using the
    //  following command.  Then, get the remote's name and the remote's URL.
    //  $ git branch -vv
    //    develop                  caff9f1 [origin/develop: behind 2] Merge branch 'feature/193_production_outages/code' into 'develop'
    //  * todo/ts_support          4f203d1 [origin/todo/ts_support] Reverted the repository property after testing.
    // ... or even better ...
    // $ git status -sb
    // ## todo/ts_support...origin/todo/ts_support

    // Make sure there are no modified files.
    const modifiedFiles = await instanceConfig.devRepo.modifiedFiles();
    if (modifiedFiles.length > 0 )
    {
        throw new Error("This repository contains modified files.");
    }

    // Make sure there are no untracked files.
    const untrackedFiles = await instanceConfig.devRepo.untrackedFiles();
    if (untrackedFiles.length > 0 )
    {
        throw new Error("This repository contains untracked files.");
    }

    // The development repo should be at the head of a Git branch.
    const devBranch = await instanceConfig.devRepo.getCurrentBranch();
    if (!devBranch)
    {
        throw new Error("HEAD does not currently point to a branch.");
    }

    // The development repo should be pushed to origin.
    // Note:  Here we are assuming that origin in dev repo points to the Git
    // repository specified in package.json's `repository` property.
    const deltas = await instanceConfig.devRepo.getCommitDeltas("origin");
    if ((deltas.ahead > 0) || (deltas.behind > 0))
    {
        throw new Error(`The branch is ${deltas.ahead} commits ahead and ${deltas.behind} commits behind.`);
    }

    // Make sure the directory is a Node package.
    if (!instanceConfig.pkg.config.version)
    {
        throw new Error("Package does not have a version.");
    }

    // If we are not forcing (i.e. moving) tags, then make sure none of the tags
    // we are applying already exist.
    if (!instanceConfig.forceTags)
    {
        const existingTags = await instanceConfig.devRepo.tags();
        const alreadyExist = _.intersection(existingTags, instanceConfig.tags);
        if (alreadyExist.length > 0)
        {
            throw new Error(`The following tags already exist: ${alreadyExist.join(", ")}`);
        }
    }
}


async function main(): Promise<void>
{
    // Get the command line args first.  If the user is just doing --help, we
    // don't want to do anything else.
    const argv = getArgs();

    globalConfig.init();

    // Resolve the command line arguments into a concrete configuration for this
    // instance.
    const instanceConfig = await getInstanceConfig(argv);

    // Given the instance configuration, determine if everything is in a valid
    // state.
    await checkInitialConditions(instanceConfig);

    const devCommitHash = await instanceConfig.devRepo.currentCommitHash();
    const devBranch = (await instanceConfig.devRepo.getCurrentBranch())!;

    // Clear out space for the publish repo.
    const publishDir = new Directory(globalConfig.tmpDir, instanceConfig.pkg.projectName);
    publishDir.deleteSync();

    // TODO: Print out the URL of the repository cloning from (and publishing to).

    // Create a clone of the repo for publishing purposes.
    const repoUrl = Url.fromString(instanceConfig.pkg.config.repository.url);
    if (!repoUrl)
    {
        throw new Error("Invalid repository URL.");
    }
    console.log(`Creating temporary repo clone at ${publishDir.toString()}...`);
    const publishRepo = await GitRepo.clone(repoUrl, globalConfig.tmpDir);

    // Checkout the commit the devRepo is at.
    console.log(`Checking out current development commit ${devCommitHash.toShortString()}...`);
    await publishRepo.checkoutCommit(devCommitHash);

    // Create a temporary branch on which the published files will be committed.
    console.log("Creating temporary branch...");
    await checkoutTempBranch(publishRepo, "publishtogit");

    // Remove all files under version control and prune directories that are
    // empty.
    console.log("Deleting all files...");
    await deleteTrackedFiles(publishRepo);
    await publishRepo.directory.prune();

    // Publish the dev repo to the publish directory.
    console.log("Publishing package contents to publish repository...");
    await instanceConfig.pkg.publish(publishDir, false, globalConfig.tmpDir);

    // If requested, remove all "@types" packages from package.json.
    if (instanceConfig.removeTypes) {
        const pkgJson = new File(publishDir, "package.json");
        const exists = pkgJson.existsSync();
        if (!exists) {
            throw new Error("Did not find a package.json file in the published contents.");
        }

        const pkgJsonContents = pkgJson.readJsonSync<any>();
        // Remove @types from devDependencies
        for (const curPackageName of Object.keys(pkgJsonContents.devDependencies)) {
            if (/^@types\//.test(curPackageName)) {
                delete pkgJsonContents.devDependencies[curPackageName];
            }
        }

        // Remove @types from dependencies
        for (const curPackageName of Object.keys(pkgJsonContents.dependencies)) {
            if (/^@types\//.test(curPackageName)) {
                delete pkgJsonContents.dependencies[curPackageName];
            }
        }

        pkgJson.writeJsonSync(pkgJsonContents);

        process.exit(-1);
    }


    // Stage and commit the published files.
    console.log("Commiting published files...");
    await publishRepo.stageAll();
    await publishRepo.commit("Published using publish-to-git.");

    // TODO: If the source repo has a CHANGELOG.md, add its contents as the annotated tag message.

    const publishCommitHash = await publishRepo.currentCommitHash();

    // Apply tags.
    await Promise.all(_.map(instanceConfig.tags, (curTagName) => {
        console.log(`Creating tag ${curTagName}...`);
        const tagMessage =
            "Published using publishtogit.\n" +
            `Source branch: ${devBranch.name}\n` +
            `Source commit: ${devCommitHash.toString()} [${devCommitHash.toShortString()}]`;
        return publishRepo.createTag(curTagName, tagMessage, true);
    }));

    // If doing a "dry run", stop.
    if (instanceConfig.dryRun)
    {
        const msg = [
            "Running in dry-run mode.  The repository in the following temporary directory",
            "has been left ready to push to a public server.",
            publishRepo.directory.toString()
        ];
        console.log(msg.join("\n"));
        return;
    }

    // Push all tags.
    await Promise.all(_.map(instanceConfig.tags, (curTagName) => {
        // TODO: Change the following "origin" in text output to the repo's URL.
        // Note:  It is ok to keep the "origin" in the pushTag() call.
        console.log(`Pushing tag ${curTagName} to origin.`);
        return publishRepo.pushTag(curTagName, "origin", true);
    }));

    // Fetch the newly created tags into the dev repo.
    // TODO: Change the following remote name to the remote discovered above.
    await instanceConfig.devRepo.fetch("origin", true);

    // Print a completion message.
    // Tell the user how to include the published repository into another
    // project's dependencies.
    const dependencyUrl = repoUrl.replaceProtocol("git+https").toString();
    const doneMessage = [
        "Done.",
        "To include the published library in a Node.js project, execute the following command:"
    ].concat(_.map(instanceConfig.tags, (curTagName) => {
        return `npm install ${dependencyUrl}#${curTagName}`;
    }))
    .concat(`npm install ${dependencyUrl}#${publishCommitHash.toShortString()}`);
    console.log(doneMessage.join("\n"));
}


async function checkoutTempBranch(repo: GitRepo, baseName: string): Promise<GitBranch>
{
    const now = new Date();
    const datestamp =
        now.getFullYear() + "_" + now.getMonth() + "_" + now.getDate() + "_" +
        now.getHours() + "_" + now.getMinutes() + "_" + now.getSeconds() + "." + now.getMilliseconds();

    const user = userInfo();

    const tmpBranchName = `${baseName}-${user.username}-${datestamp}`;
    const tmpBranch = await GitBranch.create(repo, tmpBranchName);
    await repo.checkoutBranch(tmpBranch, true);
    return tmpBranch;
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


main()
.catch((err) => {
    console.log(JSON.stringify(err, undefined, 4));
    throw err;
});
