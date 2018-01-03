import * as path from "path";
import * as fs from "fs";
import {
    deleteFile, deleteDirectory, readDir, pruneDir,
    deleteFileSync, pruneDirSync, readDirSync,
    deleteDirectorySync, Directory, File
} from "../src/fsHelpers";
import {tmpDir, resetTmpFolder} from "./specHelpers";
import {promisify2, sequence} from "../src/promiseHelpers";
import {writeFileSync} from "fs";


const writeFileAsync = promisify2<void, string, string>(fs.writeFile);


describe("Directory", () => {


    describe("static", () => {


        describe("exists()", () => {


            it("will resolve to true for an existing directory", () => {
                return Directory.exists(__dirname)
                .then((isDirectory: boolean) => {
                    expect(isDirectory).toBeTruthy();
                });
            });


            it("will resolve to false for a directory that does not exist", () => {
                return Directory.exists(path.join(__dirname, "xyzzy"))
                .then((isDirectory: boolean) => {
                    expect(isDirectory).toBeFalsy();
                });
            });


            it("will resolve to false for a file with the specified path", () => {
                return Directory.exists(__filename)
                .then((isDirectory: boolean) => {
                    expect(isDirectory).toBeFalsy();
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
                    // TODO: Create exists() existsSync *instance* methods.
                    expect(Directory.existsSync(dir.absPath())).toBeTruthy();
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
                    expect(Directory.existsSync(tmpDir.absPath())).toBeTruthy();  // TODO: Create exists() existsSync *instance* methods.
                    expect(File.existsSync(fileA.absPath())).toBeFalsy();         // TODO: Create exists() existsSync *instance* methods.
                    expect(File.existsSync(fileB.absPath())).toBeFalsy();         // TODO: Create exists() existsSync *instance* methods.
                    expect(File.existsSync(fileC.absPath())).toBeFalsy();         // TODO: Create exists() existsSync *instance* methods.
                });
            });


        });


        describe("emptySync()", () => {


            it("if the specified directory does not exist, will create all needed directories", () => {
                const dir = new Directory(path.join(tmpDir.absPath(), "dir1", "dir2", "dir3"));
                dir.emptySync();
                expect(Directory.existsSync(dir.absPath())).toBeTruthy();
            });


            it("will remove files from the specified directory", () => {

                const fileA = new File(path.join(tmpDir.absPath(), "a.txt"));
                const fileB = new File(path.join(tmpDir.absPath(), "b.txt"));
                const fileC = new File(path.join(tmpDir.absPath(), "c.txt"));

                writeFileSync(fileA.absPath(), "This is file A");   // TODO: Add method to write file contents
                writeFileSync(fileB.absPath(), "This is file B");   // TODO: Add method to write file contents
                writeFileSync(fileC.absPath(), "This is file C");   // TODO: Add method to write file contents

                tmpDir.emptySync();

                expect(Directory.existsSync(tmpDir.absPath())).toBeTruthy();
                expect(File.existsSync(fileA.absPath())).toBeFalsy();
                expect(File.existsSync(fileB.absPath())).toBeFalsy();
                expect(File.existsSync(fileC.absPath())).toBeFalsy();
            });


        });
    });


});



describe("deleteDirectory()", () => {

    it("will completely remove the directory and its contents", () => {

        const testDir = new Directory(path.join(tmpDir.absPath(), "test"));
        const testFile = new File(path.join(testDir.absPath(), "file.txt"));
        const testSubdir = new Directory(path.join(testDir.absPath(), "subdir"));

        testDir.ensureExistsSync();
        writeFileSync(testFile.absPath(), "A test file");
        testSubdir.ensureExistsSync();

        return deleteDirectory(testDir.absPath())
        .then(() => {
            expect(Directory.existsSync(testDir.absPath())).toBeFalsy();
        });
    });


    it("will resolve when the specified directory does not exist", (done) => {
        const dirPath = path.join(tmpDir.absPath(), "xyzzy");

        deleteDirectory(dirPath)
        .then(() => {
            done();
        });

    });

});



describe("deleteDirectorySync()", () => {


    it("will completely remove the directory and its contents", () => {

        const testDir = new Directory(path.join(tmpDir.absPath(), "test"));
        const testFile = new File(path.join(testDir.absPath(), "file.txt"));
        const testSubdir = new Directory(path.join(testDir.absPath(), "subdir"));

        testDir.ensureExistsSync();
        writeFileSync(testFile.absPath(), "A test file");    // TODO: Make a method out of this
        testSubdir.ensureExistsSync();

        deleteDirectorySync(testDir.absPath());
        expect(Directory.existsSync(testDir.absPath())).toBeFalsy();
    });


});


describe("File", () => {

    describe("static", () => {


        describe("exists()", () => {

            it("will resolve to true for an existing file", () => {
                return File.exists(__filename)
                .then((isFile: boolean) => {
                    expect(isFile).toBeTruthy();
                });
            });


            it("will resolve to false for a file that does not exist", () => {
                return File.exists(path.join(__dirname, "xyzzy.txt"))
                .then((isFile: boolean) => {
                    expect(isFile).toBeFalsy();
                });
            });


            it("will resolve to false for a directory with the specified path", () => {
                return File.exists(__dirname)
                .then((isFile: boolean) => {
                    expect(isFile).toBeFalsy();
                });
            });

        });


        describe("existsSync()", () => {


            it("will return true for an existing file", () => {
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

});


describe("deleteFile()", () => {

    it("will delete the specified file", () => {
        const filePathA = path.join(tmpDir.absPath(), "a.txt");

        writeFileSync(filePathA, "This is file A");
        expect(File.existsSync(filePathA)).toBeTruthy();

        return deleteFile(filePathA)
        .then(() => {
            expect(File.existsSync(filePathA)).toBeFalsy();
        });

    });


    it("will resolve when the specified file does not exist", (done) => {
        const filePathA = path.join(tmpDir.absPath(), "xyzzy.txt");

        expect(File.existsSync(filePathA)).toBeFalsy();

        return deleteFile(filePathA)
        .then(() => {
            done();
        });
    });

});


describe("deleteFileSync()", () => {


    it("will delete the specified file", () => {
        const filePathA = path.join(tmpDir.absPath(), "a.txt");
        writeFileSync(filePathA, "This is file A");

        expect(File.existsSync(filePathA)).toBeTruthy();

        deleteFileSync(filePathA);

        expect(File.existsSync(filePathA)).toBeFalsy();
    });


    it("will just return when the specified file does not exist", () => {
        const filePathA = path.join(tmpDir.absPath(), "xyzzy.txt");

        expect(File.existsSync(filePathA)).toBeFalsy();
        deleteFileSync(filePathA);
        expect(File.existsSync(filePathA)).toBeFalsy();
    });

});


describe("readDir()", () => {


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

        readDir(tmpDir.absPath())
        .then((result) => {
            expect(result.subdirs.length).toEqual(2);
            expect(result.files.length).toEqual(1);
            done();
        });

    });


});


describe("readDirSync()", () => {


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

        const contents = readDirSync(tmpDir.absPath());

        expect(contents.subdirs.length).toEqual(2);
        expect(contents.files.length).toEqual(1);
    });


});


describe("pruneDir()", function () {


    beforeEach(() => {
        resetTmpFolder();
    });


    it("will recursively remove all subdirectories", () => {

        new Directory(path.join(tmpDir.absPath(), "dirA", "dirBa", "dirC")).ensureExistsSync();
        new Directory(path.join(tmpDir.absPath(), "dirA", "dirBb", "dirE")).ensureExistsSync();
        new Directory(path.join(tmpDir.absPath(), "dir1", "dir2a", "dir3")).ensureExistsSync();
        new Directory(path.join(tmpDir.absPath(), "dir1", "dir2b", "dir4")).ensureExistsSync();

        return pruneDir(tmpDir.absPath())
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

        return pruneDir(tmpDir.absPath())
        .then(() => {
            expect(tmpDir.isEmptySync()).toBeFalsy();

            const contents = readDirSync(tmpDir.absPath());
            expect(contents.subdirs.length).toEqual(1);
            expect(contents.subdirs).toContain(path.join(tmpDir.absPath(), "dirA"));
            expect(contents.files.length).toEqual(0);

            expect(Directory.existsSync(path.join(tmpDir.absPath(), "dirA", "dirBa"))).toBeFalsy();
            expect(Directory.existsSync(path.join(tmpDir.absPath(), "dirA", "dirBb"))).toBeFalsy();
            expect(File.existsSync(path.join(tmpDir.absPath(), "dirA", "foo.txt"))).toBeTruthy();
        });
    });


});


describe("pruneDirSync()", function () {


    beforeEach(() => {
        resetTmpFolder();
    });


    it("will recursiveely remove all subdirectories", () => {

        new Directory(path.join(tmpDir.absPath(), "dirA", "dirBa", "dirC")).ensureExistsSync();
        new Directory(path.join(tmpDir.absPath(), "dirA", "dirBb", "dirE")).ensureExistsSync();
        new Directory(path.join(tmpDir.absPath(), "dir1", "dir2a", "dir3")).ensureExistsSync();
        new Directory(path.join(tmpDir.absPath(), "dir1", "dir2b", "dir4")).ensureExistsSync();

        pruneDirSync(tmpDir.absPath());

        expect(tmpDir.isEmptySync()).toBeTruthy();
    });


    it("will not prune directories containing files", () => {

        new Directory(path.join(tmpDir.absPath(), "dirA", "dirBa", "dirC")).ensureExistsSync();
        new Directory(path.join(tmpDir.absPath(), "dirA", "dirBb", "dirE")).ensureExistsSync();
        new Directory(path.join(tmpDir.absPath(), "dir1", "dir2a", "dir3")).ensureExistsSync();
        new Directory(path.join(tmpDir.absPath(), "dir1", "dir2b", "dir4")).ensureExistsSync();
        writeFileSync(path.join(tmpDir.absPath(), "dirA", "foo.txt"), "This is foo.txt");

        pruneDirSync(tmpDir.absPath());

        expect(tmpDir.isEmptySync()).toBeFalsy();

        const contents = readDirSync(tmpDir.absPath());

        expect(contents.subdirs.length).toEqual(1);
        expect(contents.subdirs).toContain(path.join(tmpDir.absPath(), "dirA"));
        expect(contents.files.length).toEqual(0);

        expect(Directory.existsSync(path.join(tmpDir.absPath(), "dirA", "dirBa"))).toBeFalsy();
        expect(Directory.existsSync(path.join(tmpDir.absPath(), "dirA", "dirBb"))).toBeFalsy();
        expect(File.existsSync(path.join(tmpDir.absPath(), "dirA", "foo.txt"))).toBeTruthy();
    });


});
