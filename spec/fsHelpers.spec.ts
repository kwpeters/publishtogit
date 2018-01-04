import * as path from "path";
import * as fs from "fs";
import {Directory, File} from "../src/fsHelpers";
import {tmpDir, resetTmpFolder} from "./specHelpers";
import {writeFileSync} from "fs";


describe("Directory", () => {


    describe("static", () => {


        describe("exists()", () => {


            it("will resolve to a truthy fs.Stats object for an existing directory", () => {
                return Directory.exists(__dirname)
                .then((stats: fs.Stats | false) => {
                    expect(stats).toBeTruthy();
                });
            });


            it("will resolve to false for a directory that does not exist", () => {
                return Directory.exists(path.join(__dirname, "xyzzy"))
                .then((stats: fs.Stats | false) => {
                    expect(stats).toBeFalsy();
                });
            });


            it("will resolve to false for a file with the specified path", () => {
                return Directory.exists(__filename)
                .then((stats: fs.Stats | false) => {
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
                resetTmpFolder();

                const dir1 = new Directory(path.join(tmpDir.absPath(), "foo", "dir"));
                const dir2 = new Directory(path.join(tmpDir.absPath(), "bar", "dir"));

                expect(dir1.equals(dir2)).toBeFalsy();
            });


        });


        describe("exists()", () => {


            it("will resolve to a truthy fs.Stats object for an existing directory", () => {
                const dir = new Directory(__dirname);
                return dir.exists()
                .then((stats: fs.Stats | false) => {
                    expect(stats).toBeTruthy();
                });
            });


            it("will resolve to false for a directory that does not exist", () => {
                const dir = new Directory(path.join(__dirname, "xyzzy"));
                return dir.exists()
                .then((stats: fs.Stats | false) => {
                    expect(stats).toBeFalsy();
                });
            });


            it("will resolve to false for a file with the specified path", () => {
                const dir = new Directory(__filename);
                return dir.exists()
                .then((stats: fs.Stats | false) => {
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
                resetTmpFolder();
            });


            it("will return false when a directory contains a file", () => {

                writeFileSync(path.join(tmpDir.absPath(), "foo.txt"), "This is foo.txt");

                return tmpDir.isEmpty()
                .then((isEmpty) => {
                    expect(isEmpty).toBeFalsy();
                });
            });


            it("will return false when a directory contains a subdirectory", () => {

                const fooDir = new Directory(path.join(tmpDir.absPath(), "foo"));

                fooDir.ensureExistsSync();

                return tmpDir.isEmpty()
                .then((isEmpty) => {
                    expect(isEmpty).toBeFalsy();
                });
            });


            it("will return true when a directory is empty", () => {
                return tmpDir.isEmpty()
                .then((isEmpty) => {
                    expect(isEmpty).toBeTruthy();
                });
            });
        });


        describe("isEmptySync()", () => {


            beforeEach(() => {
                resetTmpFolder();
            });


            it("will return false when a directory contains a file", () => {

                writeFileSync(path.join(tmpDir.absPath(), "foo.txt"), "This is foo.txt.");
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
                resetTmpFolder();
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

                writeFileSync(fileA.absPath(), "This is file A");  // TODO: Add method to write file contents
                writeFileSync(fileB.absPath(), "This is file B");
                writeFileSync(fileC.absPath(), "This is file C");

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

                writeFileSync(fileA.absPath(), "This is file A");   // TODO: Add method to write file contents
                writeFileSync(fileB.absPath(), "This is file B");   // TODO: Add method to write file contents
                writeFileSync(fileC.absPath(), "This is file C");   // TODO: Add method to write file contents

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
                writeFileSync(testFile.absPath(), "A test file");
                testSubdir.ensureExistsSync();

                return testDir.delete()
                .then(() => {
                    expect(testDir.existsSync()).toBeFalsy();
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
                writeFileSync(testFile.absPath(), "A test file");    // TODO: Make a method out of this
                testSubdir.ensureExistsSync();

                testDir.deleteSync();
                expect(testDir.existsSync()).toBeFalsy();
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
                resetTmpFolder();
            });


            it("will read the files and subdirectories within a directory", (done) => {

                const dirA = path.join(tmpDir.absPath(), "dirA");
                const fileA = path.join(dirA, "a.txt");

                const dirB = path.join(tmpDir.absPath(), "dirB");
                const fileB = path.join(dirB, "b.txt");

                const fileC = path.join(tmpDir.absPath(), "c.txt");

                new Directory(dirA).ensureExistsSync();
                new Directory(dirB).ensureExistsSync();

                writeFileSync(fileA, "This is file A");
                writeFileSync(fileB, "This is file B");
                writeFileSync(fileC, "This is file C");

                tmpDir.contents()
                .then((result) => {
                    expect(result.subdirs.length).toEqual(2);
                    expect(result.files.length).toEqual(1);
                    done();
                });

            });


        });


        describe("contentsSync()", () => {


            beforeEach(() => {
                resetTmpFolder();
            });


            it("will read the files and subdirectories within a directory", () => {

                const dirA = new Directory(path.join(tmpDir.absPath(), "dirA"));
                const fileA = new File(path.join(dirA.absPath(), "a.txt"));

                const dirB = new Directory(path.join(tmpDir.absPath(), "dirB"));
                const fileB = new File(path.join(dirB.absPath(), "b.txt"));

                const fileC = new File(path.join(tmpDir.absPath(), "c.txt"));

                dirA.ensureExistsSync();
                dirB.ensureExistsSync();

                writeFileSync(fileA.absPath(), "file A");
                writeFileSync(fileB.absPath(), "file B");
                writeFileSync(fileC.absPath(), "file c");

                const contents = tmpDir.contentsSync();

                expect(contents.subdirs.length).toEqual(2);
                expect(contents.files.length).toEqual(1);
            });


        });


        describe("prune()", () => {


            beforeEach(() => {
                resetTmpFolder();
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
                writeFileSync(path.join(tmpDir.absPath(), "dirA", "foo.txt"), "This is foo.txt");

                return tmpDir.prune()
                .then(() => {
                    expect(tmpDir.isEmptySync()).toBeFalsy();

                    const contents = tmpDir.contentsSync();
                    expect(contents.subdirs.length).toEqual(1);
                    expect(contents.subdirs[0].absPath()).toEqual(path.join(tmpDir.absPath(), "dirA"));
                    expect(contents.files.length).toEqual(0);

                    expect(Directory.existsSync(path.join(tmpDir.absPath(), "dirA", "dirBa"))).toBeFalsy();
                    expect(Directory.existsSync(path.join(tmpDir.absPath(), "dirA", "dirBb"))).toBeFalsy();
                    expect(File.existsSync(path.join(tmpDir.absPath(), "dirA", "foo.txt"))).toBeTruthy();
                });
            });


        });


        describe("pruneSync()", () => {


            beforeEach(() => {
                resetTmpFolder();
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
                writeFileSync(path.join(tmpDir.absPath(), "dirA", "foo.txt"), "This is foo.txt");

                tmpDir.pruneSync();

                expect(tmpDir.isEmptySync()).toBeFalsy();

                const contents = tmpDir.contentsSync();

                expect(contents.subdirs.length).toEqual(1);
                expect(contents.subdirs[0].absPath()).toEqual(path.join(tmpDir.absPath(), "dirA"));
                expect(contents.files.length).toEqual(0);

                expect(Directory.existsSync(path.join(tmpDir.absPath(), "dirA", "dirBa"))).toBeFalsy();
                expect(Directory.existsSync(path.join(tmpDir.absPath(), "dirA", "dirBb"))).toBeFalsy();
                expect(File.existsSync(path.join(tmpDir.absPath(), "dirA", "foo.txt"))).toBeTruthy();
            });


        });

    });


});


describe("File", () => {


    describe("static", () => {


        describe("exists()", () => {


            it("will resolve to a truthy stats object for an existing file", () => {
                return File.exists(__filename)
                .then((stats: fs.Stats | false) => {
                    expect(stats).toBeTruthy();
                });
            });


            it("will resolve to false for a file that does not exist", () => {
                return File.exists(path.join(__dirname, "xyzzy.txt"))
                .then((stats: fs.Stats | false) => {
                    expect(stats).toBeFalsy();
                });
            });


            it("will resolve to false for a directory with the specified path", () => {
                return File.exists(__dirname)
                .then((stats: fs.Stats | false) => {
                    expect(stats).toBeFalsy();
                });
            });


        });


        describe("existsSync()", () => {


            it("will return a truthy fs.Stats object for an existing file", () => {
                expect(File.existsSync(__filename)).toBeTruthy();
            });


            it("will return false for a file that does not exist", () => {
                expect(File.existsSync(path.join(__dirname, "xyzzy.txt"))).toBeFalsy();
            });


            it("will return false for a directory with the specified path", () => {
                expect(File.existsSync(__dirname)).toBeFalsy();
            });


        });

    });


    describe("instance", () => {


        describe("toString", () => {


            it("will return the string that was passed into the constructor", () => {
                const path = "./foo/bar.txt";
                const file1 = new File(path);
                expect(file1.toString()).toEqual(path);
            });


        });


        describe("equals()", () => {


            it("will return true for 2 files that are equal", () => {
                const file1 = new File(__filename);
                const file2 = new File(__filename);

                expect(file1.equals(file2)).toBeTruthy();
            });


            it("will return false for 2 different files", () => {
                const file1 = new File(path.join(".", "foo.txt"));
                const file2 = new File(path.join(".", "bar.txt"));

                expect(file1.equals(file2)).toBeFalsy();
            });


            it("will return false for two files named the same but in different folders", () => {
                resetTmpFolder();

                const file1 = new File(path.join(tmpDir.absPath(), "foo", "a.txt"));
                const file2 = new File(path.join(tmpDir.absPath(), "bar", "a.txt"));

                expect(file1.equals(file2)).toBeFalsy();
            });


        });


        describe("exists()", () => {


            it("will resolve to a Stats object for an existing file", () => {
                const file = new File(__filename);
                return file.exists()
                .then((stats: fs.Stats | false) => {
                    expect(stats).toBeTruthy();
                });
            });


            it("will resolve to false for a file that does not exist", () => {
                const file = new File(path.join(__dirname, "xyzzy.txt"));
                return file.exists()
                .then((result: fs.Stats | false) => {
                    expect(result).toBeFalsy();
                });
            });


            it("will resolve to false for a directory with the specified path", () => {
                const file = new File(__dirname);
                return file.exists()
                .then((result: fs.Stats | false) => {
                    expect(result).toBeFalsy();
                });
            });


        });


        describe("existsSync()", () => {


            it("will return a truthy fs.Stats object for an existing file", () => {
                expect(new File(__filename).existsSync()).toBeTruthy();
            });


            it("will return false for a file that does not exist", () => {
                expect(new File(path.join(__dirname, "xyzzy.txt")).existsSync()).toBeFalsy();
            });


            it("will return false for a directory with the specified path", () => {
                expect(new File(__dirname).existsSync()).toBeFalsy();
            });


        });


        describe("delete()", () => {


            it("will delete the specified file", () => {
                const fileA = new File(path.join(tmpDir.absPath(), "a.txt"));

                writeFileSync(fileA.absPath(), "This is file A");
                expect(fileA.existsSync()).toBeTruthy();

                return fileA.delete()
                .then(() => {
                    expect(fileA.existsSync()).toBeFalsy();
                });

            });


            it("will resolve when the specified file does not exist", (done) => {
                const fileA = new File(path.join(tmpDir.absPath(), "xyzzy.txt"));

                expect(fileA.existsSync()).toBeFalsy();

                return fileA.delete()
                .then(() => {
                    done();
                });
            });


        });


        describe("deleteSync()", () => {


            it("will delete the specified file", () => {
                const fileA = new File(path.join(tmpDir.absPath(), "a.txt"));
                writeFileSync(fileA.absPath(), "This is file A");

                expect(fileA.existsSync()).toBeTruthy();

                fileA.deleteSync();

                expect(fileA.existsSync()).toBeFalsy();
            });


            it("will just return when the specified file does not exist", () => {
                const fileA = new File(path.join(tmpDir.absPath(), "xyzzy.txt"));

                expect(fileA.existsSync()).toBeFalsy();
                fileA.deleteSync();
                expect(fileA.existsSync()).toBeFalsy();
            });


        });


    });

});
