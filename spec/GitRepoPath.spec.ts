import {Directory} from "../src/directory";
import {tmpDir} from "./specHelpers";
import {gitUrlToProjectName, GitRepoPath} from "../src/GitRepoPath";


describe("GitUrlToProjectName", () => {


    it("will return undefined when given an illegal Git URL", () => {
        expect(() => {
            // Missing .git at the end of the URL.
            gitUrlToProjectName("https://github.com/kwpeters/publish-to-git");
        }).toThrowError(/invalid Git URL/);
    });


    it("will return the proper name when given a valid URL", () => {
        expect(gitUrlToProjectName("https://github.com/kwpeters/publish-to-git.git")).toEqual("publish-to-git");
    });


});


describe("GitRepoPath", () => {


    describe("static", () => {


        describe("fromDirectory()", () => {
            
            
            it("will reject when given a nonexistent directory", async () => {
                const dir = new Directory(tmpDir, "xyzzy");

                try
                {
                    await GitRepoPath.fromDirectory(dir);
                    fail("Should never get here.");
                }
                catch (err)
                {
                }

            });


            it("will return undefined when the directory exists but does not have a .git folder in it", async () => {
                const dir = new Directory(tmpDir);

                try
                {
                    await GitRepoPath.fromDirectory(dir);
                    fail("Should never get here.");
                }
                catch (err)
                {
                }
            });


            it("will return a GitRepoPath instance when the directory exists and it has a .git folder in it", async () => {
                const dir = new Directory(__dirname, "..");
                expect(await GitRepoPath.fromDirectory(dir)).toBeTruthy();
            });


        });


        describe("fromUrl()", () => {


            it("will return undefined when given an invalid URL", () => {
                const url = "https://github.com/kwpeters/publish-to-git";
                expect(GitRepoPath.fromUrl(url)).toEqual(undefined);
            });


            it("will return a GitRepoPath instance when given a valid URL", () => {
                const url = "https://github.com/kwpeters/publish-to-git.git";
                expect(GitRepoPath.fromUrl(url)).toBeTruthy();
            });


        });


    });


    describe("instance", () => {


        describe("toString()", () => {


            it("will return the expected string when constructed with a directory", async () => {
                const dir = new Directory(__dirname, "..");
                const gitRepoPath = await GitRepoPath.fromDirectory(dir);
                expect(gitRepoPath.toString()).toEqual(dir.toString());
            });


            it("will return the expected string when constructed with a URL", () => {
                const url = "https://github.com/kwpeters/publish-to-git.git";
                const gitRepoPath = GitRepoPath.fromUrl(url);
                expect(gitRepoPath).toBeTruthy();
                expect(gitRepoPath!.toString()).toEqual(url);
            });


        });


        describe("getProjectName()", () => {


            it("will return the expected project name when created from a directory", async () => {
                const dir = new Directory(__dirname, "..");
                const gitRepoPath = await GitRepoPath.fromDirectory(dir);
                expect(gitRepoPath.getProjectName()).toEqual("publish-to-git");
            });


            it("will return the expected project name when created from a URL", () => {
                const url = "https://github.com/kwpeters/publish-to-git.git";
                const gitRepoPath = GitRepoPath.fromUrl(url);
                expect(gitRepoPath!.getProjectName()).toEqual("publish-to-git");
            });


        });

    });


});
