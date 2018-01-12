import {GitBranch} from "../src/gitBranch";
import {GitRepo} from "../src/gitRepo";
import {Directory} from "../src/directory";


describe("GitBranch", () => {


    describe("static", () => {

        describe("fromString()", () => {

            xit("will return undefined when the branch string is illegal", () => {
                // TODO: How does one formulate an illegal branch name?
            });


            it("will create a GitBranch instance when given a branch name containing a /", async () => {
                const repo = await GitRepo.create(new Directory(__dirname, ".."));
                const branch = GitBranch.fromString(repo, "remotes/origin/feature/featurename");
                expect(branch).toBeTruthy();
            });


        });

    });


    describe("instance", () => {

        describe("name", () => {


            it("will return the branch's name", async () => {
                const repo = await GitRepo.create(new Directory(__dirname, ".."));
                const branch = GitBranch.fromString(repo, "remotes/origin/feature/featurename");
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
