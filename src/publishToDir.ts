import * as BBPromise from "bluebird";
import {Directory} from "./depot/directory";
import {config as globalConfig} from "./publishToGitConfig";
import {NodePackage} from "./depot/nodePackage";


export function publishToDir(packageDir: Directory, publishDir: Directory): Promise<void> {

    globalConfig.init();

    return checkInitialConditions(packageDir, publishDir)
    .then(() => {
        return NodePackage.fromDirectory(packageDir);
    })
    .then((nodePackage) => {
        return nodePackage.publish(publishDir, false, globalConfig.tmpDir);
    })
    .then(() => {
    });
}


/**
 * Checks the parameters to make sure everything is in a valid state
 * @param packageDir - The directory containing the package to be published
 * @param publishDir - The directory where the package should be published to
 * @return A promise that resolves when all checks pass and rejects with an
 * error message when one or more checks fail.
 */
function checkInitialConditions(packageDir: Directory, publishDir: Directory): Promise<void> {

    // packageDir should be a directory that contains a valid Node package.
    const packageDirCheckPromise = NodePackage.fromDirectory(packageDir);

    // publishDir should not exist.
    const publishDirCheckPromise = publishDir.exists()
    .then((stats) => {
        if (stats === undefined) {
            // publishDir does not exist.  That is fine.
            return;
        }

        return publishDir.isEmpty()
        .then((isEmpty) => {
            if (isEmpty) {
                // publishDir is empty.  That is fine.
                return;
            }

            // publishDir exists and is not empty.  This is not allowed.
            throw `The publish directory ${publishDir.toString()} is not empty.`;
        });

    });

    return BBPromise.all([
        packageDirCheckPromise,
        publishDirCheckPromise
    ])
    .then(() => {});

}
