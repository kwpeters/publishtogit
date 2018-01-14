import {GitBranch} from "../src/gitBranch";
import {GitRepo} from "../src/gitRepo";
import {Directory} from "../src/directory";


describe("GitBranch", () => {


    describe("static", () => {


        describe("isValidBranchName()", () => {


            it("will return false when any path component starts with a '.'", async () => {
                const illegalBranchName = "this/.is_illegal";
                expect(await GitBranch.isValidBranchName(illegalBranchName)).toBeFalsy();
            });


            it("will return false when the branch name contains '..'", async () => {
                const illegalBranchName = "this.._is_illegal";
                expect(await GitBranch.isValidBranchName(illegalBranchName)).toBeFalsy();
            });


            it("will return false when the branch name ends with '/'", async () => {
                const illegalBranchName = "this_is_illegal/";
                expect(await GitBranch.isValidBranchName(illegalBranchName)).toBeFalsy();
            });


            it("will return false when the branch name ends with '.lock'", async () => {
                const illegalBranchName = "this_is_illegal.lock";
                expect(await GitBranch.isValidBranchName(illegalBranchName)).toBeFalsy();
            });


            it("will return false when the branch name contains a '~'", async () => {
                const illegalBranchName = "this~_is_illegal";
                expect(await GitBranch.isValidBranchName(illegalBranchName)).toBeFalsy();
            });


            it("will return false when the branch name contains a '^'", async () => {
                const illegalBranchName = "this^_is_illegal";
                expect(await GitBranch.isValidBranchName(illegalBranchName)).toBeFalsy();
            });


            it("will return false when the branch name contains a ':'", async () => {
                const illegalBranchName = "this:_is_illegal";
                expect(await GitBranch.isValidBranchName(illegalBranchName)).toBeFalsy();
            });


            it("will return false when the branch name contains a space", async () => {
                const illegalBranchName = "spaces are_illegal";
                expect(await GitBranch.isValidBranchName(illegalBranchName)).toBeFalsy();
            });


            it("will return false when the branch name contains a '\\'", async () => {
                const illegalBranchName = "backslashes\\_are_illegal";
                expect(await GitBranch.isValidBranchName(illegalBranchName)).toBeFalsy();
            });


            it("will return false when the branch name contains any whitespace", async () => {
                const illegalBranchName = "whitespace\tis\tillegal";
                expect(await GitBranch.isValidBranchName(illegalBranchName)).toBeFalsy();
            });


            it("will return true when the branch name contains a '/'", async () => {
                const legalBranchName = "feature/feature_name";
                expect(await GitBranch.isValidBranchName(legalBranchName)).toBeTruthy();
            });


        });



        describe("create()", () => {

            it("will resolve to undefined when given an illegal branch name", async () => {
                const repo = await GitRepo.fromDirectory(new Directory(__dirname, ".."));
                const branch = await GitBranch.create(repo, "illegal:branch_name");
                expect(branch).toEqual(undefined);
            });


            it("will resolve to a GitBranch instance when given a valid branch name", async () => {
                const repo = await GitRepo.fromDirectory(new Directory(__dirname, ".."));
                const branch = await GitBranch.create(repo, "feature/feature_name");
                expect(branch).toBeTruthy();
            });


        });

    });


    describe("instance", () => {

        describe("name", () => {


            it("will return the branch's name", async () => {
                const repo = await GitRepo.fromDirectory(new Directory(__dirname, ".."));
                const branch = await GitBranch.create(repo, "feature/featurename", "origin");
                if (!branch)
                {
                    fail("Should have gotten a branch");
                    return;
                }
                expect(branch.name).toEqual("feature/featurename");

            });

        });

    });


});
