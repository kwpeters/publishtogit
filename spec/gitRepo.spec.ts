import {GitRepo} from "../src/gitRepo";
import {sampleRepoDir, sampleRepoUrl, tmpDir} from "./specHelpers";
import {Directory} from "../src/directory";
import {File} from "../src/file";
import * as _ from "lodash";
import {GitRepoPath} from "../src/GitRepoPath";


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


            it("will clone a repository on the Internet", async () => {
                const gitRepoPath = GitRepoPath.fromUrl(sampleRepoUrl);
                expect(gitRepoPath).toBeTruthy();

                const repo = await GitRepo.clone(gitRepoPath!, tmpDir);
                expect(repo).toBeTruthy();

                expect(new Directory(tmpDir, "sampleGitRepo-src").existsSync()).toBeTruthy();
                expect(new File(tmpDir, "sampleGitRepo-src", "README.md").existsSync()).toBeTruthy();
            });


            it("will clone a repository from a local directory", async () => {
                const gitRepoPath = await GitRepoPath.fromDirectory(sampleRepoDir);
                const repo = await GitRepo.clone(gitRepoPath, tmpDir);

                expect(repo).toBeTruthy();
                expect(new Directory(tmpDir, "sampleGitRepo-src").existsSync()).toBeTruthy();
                expect(new File(tmpDir, "sampleGitRepo-src", "README.md").existsSync()).toBeTruthy();
            });


        });


    });


    describe("instance", () => {


        beforeEach(() => {
            tmpDir.emptySync();
        });


        describe("files()", () => {


            it("will return the files under version control", async () => {
                const gitRepoPath = await GitRepoPath.fromDirectory(sampleRepoDir);

                const repo = await GitRepo.clone(gitRepoPath, tmpDir);
                const files = await repo.files();

                expect(_.findIndex(files, {fileName: "package.json"})).toBeGreaterThanOrEqual(0);
                expect(_.findIndex(files, {fileName: "README.md"})).toBeGreaterThanOrEqual(0);
                expect(_.findIndex(files, {fileName: "LICENSE"})).toBeGreaterThanOrEqual(0);
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
                    expect(remotes.origin).toEqual("https://github.com/kwpeters/publish-to-git.git");
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
                    expect(repoName).toEqual("publish-to-git");
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


        describe("equals()", () => {


            it("will return true for two GitRepos pointing at the same directory", async () => {
                const repo1 = await GitRepo.fromDirectory(new Directory(__dirname, ".."));
                const repo2 = await GitRepo.fromDirectory(new Directory(__dirname, ".."));
                expect(repo1.equals(repo2)).toBeTruthy();
            });


            it("will return false for two GitRepos pointing at different directories", async () => {
                tmpDir.emptySync();

                const gitRepoPath = await GitRepoPath.fromDirectory(sampleRepoDir);

                const dir1 = new Directory(tmpDir, "dir1");
                dir1.ensureExistsSync();

                const dir2 = new Directory(tmpDir, "dir2");
                dir2.ensureExistsSync();

                const repo1 = await GitRepo.clone(gitRepoPath, dir1);
                const repo2 = await GitRepo.clone(gitRepoPath, dir2);
                expect(repo1.equals(repo2)).toBeFalsy();
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


        describe("getCurrentBranch()", () => {


            it("will return the current branch", async () => {
                const repo = await GitRepo.fromDirectory(new Directory(__dirname, ".."));
                const curBranch = await repo.getCurrentBranch();
                expect(curBranch.name).toEqual("master");
            });


        });


        describe("getLog()", () => {


            it("returns the expected entries", async () => {
                const path = await GitRepoPath.fromDirectory(sampleRepoDir);
                const repo = await GitRepo.clone(path, tmpDir);

                const log = await repo.getLog();
                expect(log.length).toBeGreaterThan(0);

                expect(log[0].commitHash).toEqual("a5206775d3e67a4282a07f15f18eb44bca8d52c8");
                expect(log[0].author).toContain("kwpeters");
                expect(log[0].timestamp instanceof Date).toBeTruthy();
                expect(log[0].message).toBe("Initial commit");

                expect(log[1].commitHash).toEqual("bf60e95d83e63a807dfc072a90ba70d7c7597135");
                expect(log[1].author).toContain("kwpeters");
                expect(log[1].timestamp instanceof Date).toBeTruthy();
                expect(log[1].message).toBe("Created README.md.");

                expect(log[5].commitHash).toEqual("74a66ef9f2751b843b166d33a2f48c81d420fde2");
                expect(log[5].author).toContain("kwpeters");
                expect(log[5].timestamp instanceof Date).toBeTruthy();
                expect(log[5].message).toBe("A dummy checking done solely for\nthe purpose of making\na multi-line commit message.");
            });



        });

    });


});
