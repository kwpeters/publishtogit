"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var BBPromise = require("bluebird");
var publishToGitConfig_1 = require("./publishToGitConfig");
var nodePackage_1 = require("./depot/nodePackage");
function publishToDir(packageDir, publishDir) {
    publishToGitConfig_1.config.init();
    return checkInitialConditions(packageDir, publishDir)
        .then(function () {
        return nodePackage_1.NodePackage.fromDirectory(packageDir);
    })
        .then(function (nodePackage) {
        return nodePackage.publish(publishDir, false, publishToGitConfig_1.config.tmpDir);
    })
        .then(function () {
    });
}
exports.publishToDir = publishToDir;
/**
 * Checks the parameters to make sure everything is in a valid state
 * @param packageDir - The directory containing the package to be published
 * @param publishDir - The directory where the package should be published to
 * @return A promise that resolves when all checks pass and rejects with an
 * error message when one or more checks fail.
 */
function checkInitialConditions(packageDir, publishDir) {
    // packageDir should be a directory that contains a valid Node package.
    var packageDirCheckPromise = nodePackage_1.NodePackage.fromDirectory(packageDir);
    // publishDir should not exist.
    var publishDirCheckPromise = publishDir.exists()
        .then(function (stats) {
        if (stats === undefined) {
            // publishDir does not exist.  That is fine.
            return;
        }
        return publishDir.isEmpty()
            .then(function (isEmpty) {
            if (isEmpty) {
                // publishDir is empty.  That is fine.
                return;
            }
            // publishDir exists and is not empty.  This is not allowed.
            throw "The publish directory " + publishDir.toString() + " is not empty.";
        });
    });
    return BBPromise.all([
        packageDirCheckPromise,
        publishDirCheckPromise
    ])
        .then(function () { });
}

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9wdWJsaXNoVG9EaXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSxvQ0FBc0M7QUFFdEMsMkRBQTREO0FBQzVELG1EQUFnRDtBQUdoRCxzQkFBNkIsVUFBcUIsRUFBRSxVQUFxQjtJQUVyRSwyQkFBWSxDQUFDLElBQUksRUFBRSxDQUFDO0lBRXBCLE9BQU8sc0JBQXNCLENBQUMsVUFBVSxFQUFFLFVBQVUsQ0FBQztTQUNwRCxJQUFJLENBQUM7UUFDRixPQUFPLHlCQUFXLENBQUMsYUFBYSxDQUFDLFVBQVUsQ0FBQyxDQUFDO0lBQ2pELENBQUMsQ0FBQztTQUNELElBQUksQ0FBQyxVQUFDLFdBQVc7UUFDZCxPQUFPLFdBQVcsQ0FBQyxPQUFPLENBQUMsVUFBVSxFQUFFLEtBQUssRUFBRSwyQkFBWSxDQUFDLE1BQU0sQ0FBQyxDQUFDO0lBQ3ZFLENBQUMsQ0FBQztTQUNELElBQUksQ0FBQztJQUNOLENBQUMsQ0FBQyxDQUFDO0FBQ1AsQ0FBQztBQWJELG9DQWFDO0FBR0Q7Ozs7OztHQU1HO0FBQ0gsZ0NBQWdDLFVBQXFCLEVBQUUsVUFBcUI7SUFFeEUsdUVBQXVFO0lBQ3ZFLElBQU0sc0JBQXNCLEdBQUcseUJBQVcsQ0FBQyxhQUFhLENBQUMsVUFBVSxDQUFDLENBQUM7SUFFckUsK0JBQStCO0lBQy9CLElBQU0sc0JBQXNCLEdBQUcsVUFBVSxDQUFDLE1BQU0sRUFBRTtTQUNqRCxJQUFJLENBQUMsVUFBQyxLQUFLO1FBQ1IsSUFBSSxLQUFLLEtBQUssU0FBUyxFQUFFO1lBQ3JCLDRDQUE0QztZQUM1QyxPQUFPO1NBQ1Y7UUFFRCxPQUFPLFVBQVUsQ0FBQyxPQUFPLEVBQUU7YUFDMUIsSUFBSSxDQUFDLFVBQUMsT0FBTztZQUNWLElBQUksT0FBTyxFQUFFO2dCQUNULHNDQUFzQztnQkFDdEMsT0FBTzthQUNWO1lBRUQsNERBQTREO1lBQzVELE1BQU0sMkJBQXlCLFVBQVUsQ0FBQyxRQUFRLEVBQUUsbUJBQWdCLENBQUM7UUFDekUsQ0FBQyxDQUFDLENBQUM7SUFFUCxDQUFDLENBQUMsQ0FBQztJQUVILE9BQU8sU0FBUyxDQUFDLEdBQUcsQ0FBQztRQUNqQixzQkFBc0I7UUFDdEIsc0JBQXNCO0tBQ3pCLENBQUM7U0FDRCxJQUFJLENBQUMsY0FBTyxDQUFDLENBQUMsQ0FBQztBQUVwQixDQUFDIiwiZmlsZSI6InB1Ymxpc2hUb0Rpci5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCAqIGFzIEJCUHJvbWlzZSBmcm9tIFwiYmx1ZWJpcmRcIjtcbmltcG9ydCB7RGlyZWN0b3J5fSBmcm9tIFwiLi9kZXBvdC9kaXJlY3RvcnlcIjtcbmltcG9ydCB7Y29uZmlnIGFzIGdsb2JhbENvbmZpZ30gZnJvbSBcIi4vcHVibGlzaFRvR2l0Q29uZmlnXCI7XG5pbXBvcnQge05vZGVQYWNrYWdlfSBmcm9tIFwiLi9kZXBvdC9ub2RlUGFja2FnZVwiO1xuXG5cbmV4cG9ydCBmdW5jdGlvbiBwdWJsaXNoVG9EaXIocGFja2FnZURpcjogRGlyZWN0b3J5LCBwdWJsaXNoRGlyOiBEaXJlY3RvcnkpOiBQcm9taXNlPHZvaWQ+IHtcblxuICAgIGdsb2JhbENvbmZpZy5pbml0KCk7XG5cbiAgICByZXR1cm4gY2hlY2tJbml0aWFsQ29uZGl0aW9ucyhwYWNrYWdlRGlyLCBwdWJsaXNoRGlyKVxuICAgIC50aGVuKCgpID0+IHtcbiAgICAgICAgcmV0dXJuIE5vZGVQYWNrYWdlLmZyb21EaXJlY3RvcnkocGFja2FnZURpcik7XG4gICAgfSlcbiAgICAudGhlbigobm9kZVBhY2thZ2UpID0+IHtcbiAgICAgICAgcmV0dXJuIG5vZGVQYWNrYWdlLnB1Ymxpc2gocHVibGlzaERpciwgZmFsc2UsIGdsb2JhbENvbmZpZy50bXBEaXIpO1xuICAgIH0pXG4gICAgLnRoZW4oKCkgPT4ge1xuICAgIH0pO1xufVxuXG5cbi8qKlxuICogQ2hlY2tzIHRoZSBwYXJhbWV0ZXJzIHRvIG1ha2Ugc3VyZSBldmVyeXRoaW5nIGlzIGluIGEgdmFsaWQgc3RhdGVcbiAqIEBwYXJhbSBwYWNrYWdlRGlyIC0gVGhlIGRpcmVjdG9yeSBjb250YWluaW5nIHRoZSBwYWNrYWdlIHRvIGJlIHB1Ymxpc2hlZFxuICogQHBhcmFtIHB1Ymxpc2hEaXIgLSBUaGUgZGlyZWN0b3J5IHdoZXJlIHRoZSBwYWNrYWdlIHNob3VsZCBiZSBwdWJsaXNoZWQgdG9cbiAqIEByZXR1cm4gQSBwcm9taXNlIHRoYXQgcmVzb2x2ZXMgd2hlbiBhbGwgY2hlY2tzIHBhc3MgYW5kIHJlamVjdHMgd2l0aCBhblxuICogZXJyb3IgbWVzc2FnZSB3aGVuIG9uZSBvciBtb3JlIGNoZWNrcyBmYWlsLlxuICovXG5mdW5jdGlvbiBjaGVja0luaXRpYWxDb25kaXRpb25zKHBhY2thZ2VEaXI6IERpcmVjdG9yeSwgcHVibGlzaERpcjogRGlyZWN0b3J5KTogUHJvbWlzZTx2b2lkPiB7XG5cbiAgICAvLyBwYWNrYWdlRGlyIHNob3VsZCBiZSBhIGRpcmVjdG9yeSB0aGF0IGNvbnRhaW5zIGEgdmFsaWQgTm9kZSBwYWNrYWdlLlxuICAgIGNvbnN0IHBhY2thZ2VEaXJDaGVja1Byb21pc2UgPSBOb2RlUGFja2FnZS5mcm9tRGlyZWN0b3J5KHBhY2thZ2VEaXIpO1xuXG4gICAgLy8gcHVibGlzaERpciBzaG91bGQgbm90IGV4aXN0LlxuICAgIGNvbnN0IHB1Ymxpc2hEaXJDaGVja1Byb21pc2UgPSBwdWJsaXNoRGlyLmV4aXN0cygpXG4gICAgLnRoZW4oKHN0YXRzKSA9PiB7XG4gICAgICAgIGlmIChzdGF0cyA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAvLyBwdWJsaXNoRGlyIGRvZXMgbm90IGV4aXN0LiAgVGhhdCBpcyBmaW5lLlxuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHB1Ymxpc2hEaXIuaXNFbXB0eSgpXG4gICAgICAgIC50aGVuKChpc0VtcHR5KSA9PiB7XG4gICAgICAgICAgICBpZiAoaXNFbXB0eSkge1xuICAgICAgICAgICAgICAgIC8vIHB1Ymxpc2hEaXIgaXMgZW1wdHkuICBUaGF0IGlzIGZpbmUuXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBwdWJsaXNoRGlyIGV4aXN0cyBhbmQgaXMgbm90IGVtcHR5LiAgVGhpcyBpcyBub3QgYWxsb3dlZC5cbiAgICAgICAgICAgIHRocm93IGBUaGUgcHVibGlzaCBkaXJlY3RvcnkgJHtwdWJsaXNoRGlyLnRvU3RyaW5nKCl9IGlzIG5vdCBlbXB0eS5gO1xuICAgICAgICB9KTtcblxuICAgIH0pO1xuXG4gICAgcmV0dXJuIEJCUHJvbWlzZS5hbGwoW1xuICAgICAgICBwYWNrYWdlRGlyQ2hlY2tQcm9taXNlLFxuICAgICAgICBwdWJsaXNoRGlyQ2hlY2tQcm9taXNlXG4gICAgXSlcbiAgICAudGhlbigoKSA9PiB7fSk7XG5cbn1cbiJdfQ==
