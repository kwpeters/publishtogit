import * as path from "path";
import {GitRepo, gitUrlToProjectName} from "../src/gitRepo";
import {tmpDir} from "./specHelpers";
import {Directory} from "../src/directory";
import {File} from "../src/file";
import * as _ from "lodash";


describe("GitUrlToProjectName", () => {

    it("will return undefined when given an illegal Git URL", () => {

        expect(() => {
            // Missing .git at the end of the URL.
            gitUrlToProjectName("https://github.com/kwpeters/publish-to-git-src");
        }).toThrowError(/invalid Git URL/);
    });


    it("will return the proper name when given a valid URL", () => {
        expect(gitUrlToProjectName("https://github.com/kwpeters/publish-to-git-src.git")).toEqual("publish-to-git-src");
    });


});


describe("GitRepo", () => {


    describe("static", () => {


        describe("create()", () => {

            it("will reject when not given a directory that is not a repo directory", (done) => {
                GitRepo.fromDirectory(new Directory(__dirname))
                .catch(() => {
                    done();
                });
            });


            it("will create a new instance when given a Git repo directory", (done) => {
                GitRepo.fromDirectory(new Directory(__dirname, ".."))
                .then((inst) => {
                    expect(inst).toBeTruthy();
                    done();
                });

            });

        });


        describe("clone()", () => {


            beforeEach(() => {
                tmpDir.emptySync();
            });


            it("will clone the specified repository in the specified directory", () => {

                return GitRepo.clone("https://github.com/kwpeters/publish-to-git-src.git", tmpDir)
                .then((repo: GitRepo) => {

                    expect(repo).toBeTruthy();

                    expect(Directory.existsSync(path.join(tmpDir.absPath(), "publish-to-git-src"))).toBeTruthy();
                    expect(File.existsSync(path.join(tmpDir.absPath(), "publish-to-git-src", "package.json"))).toBeTruthy();
                });
            });


        });


    });


    describe("instance", () => {


        describe("files()", () => {

            beforeEach(() => {
                tmpDir.emptySync();
            });


            it("will return the files under version control", (done) => {

                GitRepo.clone("https://github.com/kwpeters/publish-to-git-src.git", tmpDir)
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
                GitRepo.fromDirectory(new Directory(__dirname, ".."))
                .then((repo) => {
                    return repo.remotes();
                })
                .then((remotes) => {
                    expect(Object.keys.length).toEqual(1);
                    expect(remotes.origin).toEqual("https://github.com/kwpeters/publish-to-git-src.git");
                    done();
                });
            });

        });


        describe("name()", () => {


            it("will return the name of the repo", (done) => {
                GitRepo.fromDirectory(new Directory(__dirname, ".."))
                .then((repo) => {
                    return repo.name();
                })
                .then((repoName) => {
                    expect(repoName).toEqual("publish-to-git-src");
                    done();
                });
            });


        });


        describe("directory", () => {


            it("will return the directory of the repo", (done) => {
                GitRepo.fromDirectory(new Directory(__dirname, ".."))
                .then((repo) => {
                    expect(repo.directory).toBeTruthy();
                    expect(repo.directory.absPath()).toContain("publish-to-git");
                    done();
                });
            });


        });


        describe("tags()", () => {


            it("will list the tags applied to the repository", (done) => {
                GitRepo.fromDirectory(new Directory(__dirname, ".."))
                .then((repo) => {
                    return repo.tags();
                })
                .then((tags) => {
                    expect(tags).toContain("test");
                    done();
                });
            });


        });


        describe("hasTag()", () => {


            it("will return true for a tag that exists", (done) => {
                GitRepo.fromDirectory(new Directory(__dirname, ".."))
                .then((repo) => {
                    return repo.hasTag("test");
                })
                .then((hasTag) => {
                    expect(hasTag).toBeTruthy();
                    done();
                });
            });


            it("will return false for a tag that does not exists", (done) => {
                GitRepo.fromDirectory(new Directory(__dirname, ".."))
                .then((repo) => {
                    return repo.hasTag("xyzzy");
                })
                .then((hasTag) => {
                    expect(hasTag).toBeFalsy();
                    done();
                });
            });


        });


        describe("createTag()", () => {


            let theRepo: GitRepo;


            beforeEach((done) => {
                GitRepo.fromDirectory(new Directory(__dirname, ".."))
                .then((repo) => {
                    theRepo = repo;
                    return repo.deleteTag("unittest_tag");
                })
                .then(() => {
                    done();
                });
            });


            it("will resolve when the specified tag is created", (done) => {
                theRepo.createTag("unittest_tag")
                .then(() => {
                    return theRepo.hasTag("unittest_tag");
                })
                .then((hasTag) => {
                    expect(hasTag).toBeTruthy();
                    done();
                });
            });


            it("will reject when the tag already exists", (done) => {
                theRepo.createTag("unittest_tag")
                .then(() => {
                    return theRepo.createTag("unittest_tag");
                })
                .catch(() => {
                    done();
                });
            });


        });


        describe("deleteTag()", () => {


            let theRepo: GitRepo;


            beforeEach(() => {
                return GitRepo.fromDirectory(new Directory(__dirname, ".."))
                .then((repo) => {
                    theRepo = repo;
                    return repo.deleteTag("unittest_tag");
                });
            });


            afterEach(() => {
                return theRepo.deleteTag("unittest_tag");
            });


            it("will resolve if the specified tag does not exist", (done) => {
                theRepo.deleteTag("xyzzy")
                .then(() => {
                    done();
                });
            });


            it("will resolve when the tag is deleted", (done) => {
                theRepo.createTag("unittest_tag")
                .then(() => {
                    return theRepo.deleteTag("unittest_tag");
                })
                .then(() => {
                    return theRepo.hasTag("unittest_tag");
                })
                .then((hasTag) => {
                    expect(hasTag).toBeFalsy();
                    done();
                });
            });

        });


        describe("getBranches", () => {

            it("will return the branches", async () => {
                const repo = await GitRepo.fromDirectory(new Directory(__dirname, ".."));
                const branches = await repo.getBranches();
                expect(branches.length).toBeGreaterThan(0);
                expect(_.map(branches, "name")).toContain("master");
            });


        });


    });


});
