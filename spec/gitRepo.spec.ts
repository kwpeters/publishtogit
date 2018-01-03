import * as path from "path";
import {GitRepo, gitUrlToProjectName} from "../src/gitRepo";
import {resetTmpFolder, tmpDir} from "./specHelpers";
import {Directory, File} from "../src/fsHelpers";


describe("GitUrlToProjectName", () => {

    it("will return undefined when given an illegal Git URL", (done) => {

        const shouldThrow = function shouldThrow() {
            // Missing .git at the end of the URL.
            gitUrlToProjectName("https://github.com/kwpeters/publish-to-git");
        };

        expect(shouldThrow).toThrowError(/invalid Git URL/);
        done();
    });


    it("will return the proper name when given a valid URL", (done) => {
        expect(gitUrlToProjectName("https://github.com/kwpeters/publish-to-git.git")).toEqual("publish-to-git");
        done();
    });

});


describe("GitRepo", () => {


    describe("static", () => {

        describe("create()", () => {

            it("will reject when not given a directory that is not a repo directory", (done) => {
                GitRepo.create(__dirname)
                .catch(() => {
                    done();
                });
            });


            it("will create a new instance when given a Git repo directory", (done) => {

                GitRepo.create(path.join(__dirname, ".."))
                .then((inst) => {
                    expect(inst).toBeTruthy();
                    done();
                });

            });

        });


        describe("clone()", () => {


            beforeEach(() => {
                resetTmpFolder();
            });


            it("will clone the specified repository in the specified directory", () => {

                return GitRepo.clone("https://github.com/kwpeters/publish-to-git.git", tmpDir.absPath())
                .then((repo: GitRepo) => {

                    expect(repo).toBeTruthy();

                    expect(Directory.existsSync(path.join(tmpDir.absPath(), "publish-to-git"))).toBeTruthy();
                    expect(File.existsSync(path.join(tmpDir.absPath(), "publish-to-git", "package.json"))).toBeTruthy();
                });
            });


        });


    });


    describe("instance", () => {

        describe("files()", () => {

            beforeEach(() => {
                resetTmpFolder();
            });


            it("will return the files under version control", (done) => {

                GitRepo.clone("https://github.com/kwpeters/publish-to-git.git", tmpDir.absPath())
                .then((repo) => {
                    return repo.files();
                })
                .then((files) => {
                    expect(files).toContain("package.json");
                    expect(files).toContain("README.md");
                    expect(files).toContain("gulpfile.js");
                    done();
                });
            });

        });


        describe("remotes()", () => {

            it("will return the correct map of remotes", (done) => {
                GitRepo.create(path.join(__dirname, ".."))
                .then((repo) => {
                    return repo.remotes();
                })
                .then((remotes) => {
                    expect(Object.keys.length).toEqual(1);
                    expect(remotes.origin).toEqual("https://github.com/kwpeters/publish-to-git.git");
                    done();
                });
            });

        });


        describe("name()", () => {


            it("will return the name of the repo", (done) => {
                GitRepo.create(path.join(__dirname, ".."))
                .then((repo) => {
                    return repo.name();
                })
                .then((repoName) => {
                    expect(repoName).toEqual("publish-to-git");
                    done();
                });
            });


        });


        describe("directory", () => {


            it("will return the directory of the repo", (done) => {
                GitRepo.create(path.join(__dirname, ".."))
                .then((repo) => {
                    expect(repo.directory).toContain("publish-to-git");
                    done();
                });
            });


            it("will return an absolute path", (done) => {
                GitRepo.create(path.join(__dirname, ".."))
                .then((repo) => {
                    // Must start with a slash.
                    expect(repo.directory).toMatch(/^\//);
                    done();
                });
            });



        });

    });


});
