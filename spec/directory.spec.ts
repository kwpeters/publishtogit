import {tmpDir} from "./specHelpers";
import * as path from "path";
import {File} from "../src/file";
import {Directory, IDirectoryContents} from "../src/directory";


describe("Directory", () => {


    describe("static", () => {


        describe("exists()", () => {


            it("will resolve to a truthy fs.Stats object for an existing directory", () => {
                return Directory.exists(__dirname)
                .then((stats) => {
                    expect(stats).toBeTruthy();
                });
            });


            it("will resolve to false for a directory that does not exist", () => {
                return Directory.exists(path.join(__dirname, "xyzzy"))
                .then((stats) => {
                    expect(stats).toBeFalsy();
                });
            });


            it("will resolve to false for a file with the specified path", () => {
                return Directory.exists(__filename)
                .then((stats) => {
                    expect(stats).toBeFalsy();
                });
            });


        });


        describe("existsSync()", () => {


            it("will return true for an existing directory", () => {
                expect(Directory.existsSync(__dirname)).toBeTruthy();
            });


            it("will resolve to false for a directory that does not exist", () => {
                expect(Directory.existsSync(path.join(__dirname, "xyzzy"))).toBeFalsy();
            });


            it("will resolve to false for a file with the specified path", () => {
                expect(Directory.existsSync(__filename)).toBeFalsy();
            });

        });


    });


    describe("instance", () => {


        describe("toString", () => {


            it("will return the string that was passed into the constructor", () => {
                const path = "./foo/bar";
                const dir1 = new Directory(path);
                expect(dir1.toString()).toEqual(path);
            });


        });


        describe("equals()", () => {


            it("will return true for 2 directories that are equal", () => {
                const dir1 = new Directory(__dirname);
                const dir2 = new Directory(__dirname);

                expect(dir1.equals(dir2)).toBeTruthy();
            });


            it("will return false for 2 different directories", () => {
                const dir1 = new Directory(__dirname);
                const dir2 = new Directory(path.join(__dirname, ".."));

                expect(dir1.equals(dir2)).toBeFalsy();
            });


            it("will return false for two directories named the same but in different folders", () => {
                tmpDir.emptySync();

                const dir1 = new Directory(path.join(tmpDir.absPath(), "foo", "dir"));
                const dir2 = new Directory(path.join(tmpDir.absPath(), "bar", "dir"));

                expect(dir1.equals(dir2)).toBeFalsy();
            });


        });


        describe("exists()", () => {


            it("will resolve to a truthy fs.Stats object for an existing directory", () => {
                const dir = new Directory(__dirname);
                return dir.exists()
                .then((stats) => {
                    expect(stats).toBeTruthy();
                });
            });


            it("will resolve to false for a directory that does not exist", () => {
                const dir = new Directory(path.join(__dirname, "xyzzy"));
                return dir.exists()
                .then((stats) => {
                    expect(stats).toBeFalsy();
                });
            });


            it("will resolve to false for a file with the specified path", () => {
                const dir = new Directory(__filename);
                return dir.exists()
                .then((stats) => {
                    expect(stats).toBeFalsy();
                });
            });

        });


        describe("existsSync()", () => {


            it("will return a truthy fs.Stats object for an existing directory", () => {
                const dir = new Directory(__dirname);
                expect(dir.existsSync()).toBeTruthy();
            });


            it("will return false for a directory that does not exist", () => {
                const dir = new Directory(path.join(__dirname, "xyzzy"));
                expect(dir.existsSync()).toBeFalsy();
            });


            it("will return false for a file with the specified path", () => {
                const dir = new Directory(__filename);
                expect(dir.existsSync()).toBeFalsy();
            });


        });


        describe("isEmpty()", () => {

            beforeEach(() => {
                tmpDir.emptySync();
            });


            it("will return false when a directory contains a file", () => {

                new File(path.join(tmpDir.absPath(), "foo.txt")).writeSync("This is foo.txt");

                return tmpDir.isEmpty()
                .then((isEmpty: boolean) => {
                    expect(isEmpty).toBeFalsy();
                });
            });


            it("will return false when a directory contains a subdirectory", () => {

                const fooDir = new Directory(path.join(tmpDir.absPath(), "foo"));

                fooDir.ensureExistsSync();

                return tmpDir.isEmpty()
                .then((isEmpty: boolean) => {
                    expect(isEmpty).toBeFalsy();
                });
            });


            it("will return true when a directory is empty", () => {
                return tmpDir.isEmpty()
                .then((isEmpty: boolean) => {
                    expect(isEmpty).toBeTruthy();
                });
            });
        });


        describe("isEmptySync()", () => {


            beforeEach(() => {
                tmpDir.emptySync();
            });


            it("will return false when a directory contains a file", () => {

                const file = new File(path.join(tmpDir.absPath(), "foo.txt"));
                file.writeSync("This is foo.txt");
                expect(tmpDir.isEmptySync()).toBeFalsy();
            });


            it("will return false when a directory contains a subdirectory", () => {
                const fooDir = new Directory(path.join(tmpDir.absPath(), "foo"));

                fooDir.ensureExistsSync();

                expect(tmpDir.isEmptySync()).toBeFalsy();
            });


            it("will return true when a directory is empty", () => {
                expect(tmpDir.isEmptySync()).toBeTruthy();
            });


        });


        describe("ensureExists()", () => {


            beforeEach(() => {
                tmpDir.emptySync();
            });


            it("will make sure all necessary directories exist when given an absolute path", () => {
                const dirPath = path.join(tmpDir.absPath(), "dir1", "dir2", "dir3");
                const dir = new Directory(dirPath);

                return dir.ensureExists()
                .then(() => {
                    expect(Directory.existsSync(dirPath)).toBeTruthy();
                });
            });


            it("will make sure all necessary directories exist when given a relative path", () => {
                const dirPath = path.join("tmp", "dir1", "dir2", "dir3");
                const dir = new Directory(dirPath);

                return dir.ensureExists()
                .then(() => {
                    expect(Directory.existsSync(dirPath)).toBeTruthy();
                });
            });


        });


        describe("ensureExistsSync()", () => {


            it("will make sure all necessary directories exist when given an absolute path", () => {
                const dirPath = path.join(tmpDir.absPath(), "dir1", "dir2", "dir3");
                const dir = new Directory(dirPath);
                dir.ensureExistsSync();
                expect(Directory.existsSync(dirPath)).toBeTruthy();
            });


            it("will make sure all necessary directories exist when given a relative path", () => {
                const dirPath = path.join("tmp", "dir1", "dir2", "dir3");
                const dir = new Directory(dirPath);
                dir.ensureExistsSync();
                expect(Directory.existsSync(dirPath)).toBeTruthy();
            });


        });


        describe("empty()", () => {


            it("if the directory does not exist, will create all needed directories", () => {

                const dir = new Directory(path.join(tmpDir.absPath(), "dir1", "dir2", "dir3"));

                return dir.empty()
                .then(() => {
                    expect(dir.existsSync()).toBeTruthy();
                });
            });


            it("will remove files from the specified directory", () => {

                const fileA = new File(path.join(tmpDir.absPath(), "a.txt"));
                const fileB = new File(path.join(tmpDir.absPath(), "b.txt"));
                const fileC = new File(path.join(tmpDir.absPath(), "c.txt"));

                fileA.writeSync("This is file A");
                fileB.writeSync("This is file B");
                fileC.writeSync("This if file C");

                return tmpDir.empty()
                .then(() => {
                    expect(tmpDir.existsSync()).toBeTruthy();
                    expect(fileA.existsSync()).toBeFalsy();
                    expect(fileB.existsSync()).toBeFalsy();
                    expect(fileC.existsSync()).toBeFalsy();
                });
            });


        });


        describe("emptySync()", () => {


            it("if the specified directory does not exist, will create all needed directories", () => {
                const dir = new Directory(path.join(tmpDir.absPath(), "dir1", "dir2", "dir3"));
                dir.emptySync();
                expect(dir.existsSync()).toBeTruthy();
            });


            it("will remove files from the specified directory", () => {

                const fileA = new File(path.join(tmpDir.absPath(), "a.txt"));
                const fileB = new File(path.join(tmpDir.absPath(), "b.txt"));
                const fileC = new File(path.join(tmpDir.absPath(), "c.txt"));

                fileA.writeSync("This is file A");
                fileB.writeSync("This is file B");
                fileC.writeSync("This is file C");

                tmpDir.emptySync();

                expect(tmpDir.existsSync()).toBeTruthy();
                expect(fileA.existsSync()).toBeFalsy();
                expect(fileB.existsSync()).toBeFalsy();
                expect(fileC.existsSync()).toBeFalsy();
            });


        });


        describe("delete()", () => {


            it("will completely remove the directory and its contents", () => {

                const testDir = new Directory(path.join(tmpDir.absPath(), "test"));
                const testFile = new File(path.join(testDir.absPath(), "file.txt"));
                const testSubdir = new Directory(path.join(testDir.absPath(), "subdir"));

                testDir.ensureExistsSync();
                testFile.writeSync("A test file");
                testSubdir.ensureExistsSync();

                return testDir.delete()
                .then(() => {
                    expect(testDir.existsSync()).toBeFalsy();
                    expect(testFile.existsSync()).toBeFalsy();
                    expect(testSubdir.existsSync()).toBeFalsy();
                });
            });


            it("will resolve when the specified directory does not exist", (done) => {
                const dir = new Directory(path.join(tmpDir.absPath(), "xyzzy"));
                dir.delete()
                .then(() => {
                    done();
                });

            });


        });


        describe("deleteSync()", () => {


            it("will completely remove the directory and its contents", () => {

                const testDir = new Directory(path.join(tmpDir.absPath(), "test"));
                const testFile = new File(path.join(testDir.absPath(), "file.txt"));
                const testSubdir = new Directory(path.join(testDir.absPath(), "subdir"));

                testDir.ensureExistsSync();
                testFile.writeSync("A test file");
                testSubdir.ensureExistsSync();

                testDir.deleteSync();
                expect(testDir.existsSync()).toBeFalsy();
                expect(testFile.existsSync()).toBeFalsy();
                expect(testSubdir.existsSync()).toBeFalsy();
            });


            it("will not throw when the specified directory does not exist", () => {
                const dir = new Directory(path.join(tmpDir.absPath(), "xyzzy"));

                expect(() => {
                    dir.deleteSync();
                }).not.toThrow();
            });


        });


        describe("contents()", () => {


            beforeEach(() => {
                tmpDir.emptySync();
            });


            it("will read the files and subdirectories within a directory", (done) => {

                const dirA = new Directory(path.join(tmpDir.absPath(), "dirA"));
                const fileA = new File(path.join(dirA.absPath(), "a.txt"));

                const dirB = new Directory(path.join(tmpDir.absPath(), "dirB"));
                const fileB = new File(path.join(dirB.absPath(), "b.txt"));

                const fileC = new File(path.join(tmpDir.absPath(), "c.txt"));

                dirA.ensureExistsSync();
                dirB.ensureExistsSync();

                fileA.writeSync("File A");
                fileB.writeSync("File B");
                fileC.writeSync("File C");

                tmpDir.contents()
                .then((result: IDirectoryContents) => {
                    expect(result.subdirs.length).toEqual(2);
                    expect(result.files.length).toEqual(1);
                    done();
                });
            });


        });


        describe("contentsSync()", () => {


            beforeEach(() => {
                tmpDir.emptySync();
            });


            it("will read the files and subdirectories within a directory", () => {

                const dirA = new Directory(path.join(tmpDir.absPath(), "dirA"));
                const fileA = new File(path.join(dirA.absPath(), "a.txt"));

                const dirB = new Directory(path.join(tmpDir.absPath(), "dirB"));
                const fileB = new File(path.join(dirB.absPath(), "b.txt"));

                const fileC = new File(path.join(tmpDir.absPath(), "c.txt"));

                dirA.ensureExistsSync();
                dirB.ensureExistsSync();

                fileA.writeSync("File A");
                fileB.writeSync("File B");
                fileC.writeSync("File C");

                const contents = tmpDir.contentsSync();

                expect(contents.subdirs.length).toEqual(2);
                expect(contents.files.length).toEqual(1);
            });


        });


        describe("prune()", () => {


            beforeEach(() => {
                tmpDir.emptySync();
            });


            it("will recursively remove all subdirectories", () => {

                new Directory(path.join(tmpDir.absPath(), "dirA", "dirBa", "dirC")).ensureExistsSync();
                new Directory(path.join(tmpDir.absPath(), "dirA", "dirBb", "dirE")).ensureExistsSync();
                new Directory(path.join(tmpDir.absPath(), "dir1", "dir2a", "dir3")).ensureExistsSync();
                new Directory(path.join(tmpDir.absPath(), "dir1", "dir2b", "dir4")).ensureExistsSync();

                return tmpDir.prune()
                .then(() => {
                    expect(tmpDir.isEmptySync()).toBeTruthy();
                });
            });


            it("will not prune directories containing files", () => {

                new Directory(path.join(tmpDir.absPath(), "dirA", "dirBa", "dirC")).ensureExistsSync();
                new Directory(path.join(tmpDir.absPath(), "dirA", "dirBb", "dirE")).ensureExistsSync();
                new Directory(path.join(tmpDir.absPath(), "dir1", "dir2a", "dir3")).ensureExistsSync();
                new Directory(path.join(tmpDir.absPath(), "dir1", "dir2b", "dir4")).ensureExistsSync();
                const file = new File(path.join(tmpDir.absPath(), "dirA", "foo.txt"));
                file.writeSync("This is foo.txt");

                return tmpDir.prune()
                .then(() => {
                    expect(tmpDir.isEmptySync()).toBeFalsy();

                    const contents = tmpDir.contentsSync();
                    expect(contents.subdirs.length).toEqual(1);
                    expect(contents.subdirs[0].absPath()).toEqual(path.join(tmpDir.absPath(), "dirA"));
                    expect(contents.files.length).toEqual(0);

                    expect(Directory.existsSync(path.join(tmpDir.absPath(), "dirA", "dirBa"))).toBeFalsy();
                    expect(Directory.existsSync(path.join(tmpDir.absPath(), "dirA", "dirBb"))).toBeFalsy();
                    expect(file.existsSync()).toBeTruthy();
                });
            });


        });


        describe("pruneSync()", () => {


            beforeEach(() => {
                tmpDir.emptySync();
            });


            it("will recursiveely remove all subdirectories", () => {

                new Directory(path.join(tmpDir.absPath(), "dirA", "dirBa", "dirC")).ensureExistsSync();
                new Directory(path.join(tmpDir.absPath(), "dirA", "dirBb", "dirE")).ensureExistsSync();
                new Directory(path.join(tmpDir.absPath(), "dir1", "dir2a", "dir3")).ensureExistsSync();
                new Directory(path.join(tmpDir.absPath(), "dir1", "dir2b", "dir4")).ensureExistsSync();

                tmpDir.pruneSync();

                expect(tmpDir.isEmptySync()).toBeTruthy();
            });


            it("will not prune directories containing files", () => {

                new Directory(path.join(tmpDir.absPath(), "dirA", "dirBa", "dirC")).ensureExistsSync();
                new Directory(path.join(tmpDir.absPath(), "dirA", "dirBb", "dirE")).ensureExistsSync();
                new Directory(path.join(tmpDir.absPath(), "dir1", "dir2a", "dir3")).ensureExistsSync();
                new Directory(path.join(tmpDir.absPath(), "dir1", "dir2b", "dir4")).ensureExistsSync();
                const file = new File(path.join(tmpDir.absPath(), "dirA", "foo.txt"));
                file.writeSync("This is foo.txt");

                tmpDir.pruneSync();

                expect(tmpDir.isEmptySync()).toBeFalsy();

                const contents = tmpDir.contentsSync();

                expect(contents.subdirs.length).toEqual(1);
                expect(contents.subdirs[0].absPath()).toEqual(path.join(tmpDir.absPath(), "dirA"));
                expect(contents.files.length).toEqual(0);

                expect(Directory.existsSync(path.join(tmpDir.absPath(), "dirA", "dirBa"))).toBeFalsy();
                expect(Directory.existsSync(path.join(tmpDir.absPath(), "dirA", "dirBb"))).toBeFalsy();
                expect(file.existsSync()).toBeTruthy();
            });


        });

    });


});
