import * as path from "path";
import * as fs from "fs";
import {
    ensureDirectoryExists, emptyDirectory, deleteFile,
    deleteDirectory, readDir, pruneDir,
    ensureDirectoryExistsSync, deleteFileSync,
    pruneDirSync, readDirSync, emptyDirectorySync, deleteDirectorySync,
    Directory, File
} from "../src/fsHelpers";
import {TMP_DIR_PATH, resetTmpFolder} from "./specHelpers";
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
                return resetTmpFolder();
            });


            it("will return false when a directory contains a file", () => {

                writeFileSync(path.join(TMP_DIR_PATH, "foo.txt"), "This is foo.txt");
                const tmpDir = new Directory(TMP_DIR_PATH);

                return tmpDir.isEmpty()
                .then((isEmpty) => {
                    expect(isEmpty).toBeFalsy();
                });
            });


            it("will return false when a directory contains a subdirectory", () => {

                ensureDirectoryExistsSync(path.join(TMP_DIR_PATH, "foo"));
                const tmpDir = new Directory(TMP_DIR_PATH);

                return tmpDir.isEmpty()
                .then((isEmpty) => {
                    expect(isEmpty).toBeFalsy();
                });
            });


            it("will return true when a directory is empty", () => {
                const tmpDir = new Directory(TMP_DIR_PATH);

                return tmpDir.isEmpty()
                .then((isEmpty) => {
                    expect(isEmpty).toBeTruthy();
                });
            });
        });


        describe("isEmptySync()", () => {


            beforeEach(() => {
                return resetTmpFolder();
            });


            it("will return false when a directory contains a file", () => {

                writeFileSync(path.join(TMP_DIR_PATH, "foo.txt"), "This is foo.txt.");
                const tmpDir = new Directory(TMP_DIR_PATH);
                expect(tmpDir.isEmptySync()).toBeFalsy();
            });


            it("will return false when a directory contains a subdirectory", () => {

                ensureDirectoryExistsSync(path.join(TMP_DIR_PATH, "foo"));
                const tmpDir = new Directory(TMP_DIR_PATH);
                expect(tmpDir.isEmptySync()).toBeFalsy();
            });


            it("will return true when a directory is empty", () => {
                const tmpDir = new Directory(TMP_DIR_PATH);
                expect(tmpDir.isEmptySync()).toBeTruthy();
            });


        });


    });


});


describe("ensureDirectoryExists()", () => {


    it("will make sure all necessary directories exist", () => {
        const dirPath = path.join(TMP_DIR_PATH, "dir1", "dir2", "dir3");

        return ensureDirectoryExists(dirPath)
        .then(() => {
            expect(Directory.existsSync(dirPath)).toBeTruthy();
        });
    });


});


describe("ensureDirectoryExistsSync()", () => {


    it("will make sure all necessary directories exist", () => {
        const dirPath = path.join(TMP_DIR_PATH, "dir1", "dir2", "dir3");
        ensureDirectoryExistsSync(dirPath);
        expect(Directory.existsSync(dirPath)).toBeTruthy();
    });


});


describe("emptyDirectory()", () => {

    it("if the specified directory does not exist, will create all needed directories", () => {

        const dirPath = path.join(TMP_DIR_PATH, "dir1", "dir2", "dir3");

        return emptyDirectory(dirPath)
        .then(() => {
            expect(Directory.existsSync(dirPath)).toBeTruthy();
        });
    });


    it("will remove files from the specified directory", () => {

        const filePathA = path.join(TMP_DIR_PATH, "a.txt");
        const filePathB = path.join(TMP_DIR_PATH, "b.txt");
        const filePathC = path.join(TMP_DIR_PATH, "c.txt");

        writeFileSync(filePathA, "This is file A");
        writeFileSync(filePathB, "This is file B");
        writeFileSync(filePathC, "This is file C");

        return emptyDirectory(TMP_DIR_PATH)
        .then(() => {
            expect(Directory.existsSync(TMP_DIR_PATH)).toBeTruthy();
            expect(File.existsSync(filePathA)).toBeFalsy();
            expect(File.existsSync(filePathB)).toBeFalsy();
            expect(File.existsSync(filePathC)).toBeFalsy();
        });
    });


});


describe("emptyDirectorySync()", () => {

    it("if the specified directory does not exist, will create all needed directories", () => {

        const dirPath = path.join(TMP_DIR_PATH, "dir1", "dir2", "dir3");
        emptyDirectorySync(dirPath);
        expect(Directory.existsSync(dirPath)).toBeTruthy();
    });


    it("will remove files from the specified directory", () => {

        const filePathA = path.join(TMP_DIR_PATH, "a.txt");
        const filePathB = path.join(TMP_DIR_PATH, "b.txt");
        const filePathC = path.join(TMP_DIR_PATH, "c.txt");

        writeFileSync(filePathA, "This is file A");
        writeFileSync(filePathB, "This is file B");
        writeFileSync(filePathC, "This is file C");

        emptyDirectorySync(TMP_DIR_PATH);

        expect(Directory.existsSync(TMP_DIR_PATH)).toBeTruthy();
        expect(File.existsSync(filePathA)).toBeFalsy();
        expect(File.existsSync(filePathB)).toBeFalsy();
        expect(File.existsSync(filePathC)).toBeFalsy();
    });

});


describe("deleteDirectory()", () => {

    it("will completely remove the directory and its contents", () => {
        const dirPath = path.join(TMP_DIR_PATH, "testDir");
        const filePath = path.join(dirPath, "a.txt");
        const subdirPath = path.join(dirPath, "subdir");

        ensureDirectoryExistsSync(dirPath);
        writeFileSync(filePath, "A test file");
        ensureDirectoryExistsSync(subdirPath);

        return deleteDirectory(dirPath)
        .then(() => {
            expect(Directory.existsSync(dirPath)).toBeFalsy();
        });
    });


    it("will resolve when the specified directory does not exist", (done) => {
        const dirPath = path.join(TMP_DIR_PATH, "xyzzy");

        deleteDirectory(dirPath)
        .then(() => {
            done();
        });

    });

});



describe("deleteDirectorySync()", () => {


    it("will completely remove the directory and its contents", () => {
        const dirPath = path.join(TMP_DIR_PATH, "testDir");
        const filePath = path.join(dirPath, "a.txt");
        const subdirPath = path.join(dirPath, "subdir");

        ensureDirectoryExistsSync(dirPath);
        writeFileSync(filePath, "A test file");
        ensureDirectoryExistsSync(subdirPath);

        deleteDirectorySync(dirPath);

        expect(Directory.existsSync(dirPath)).toBeFalsy();
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
        const filePathA = path.join(TMP_DIR_PATH, "a.txt");

        writeFileSync(filePathA, "This is file A");
        expect(File.existsSync(filePathA)).toBeTruthy();

        return deleteFile(filePathA)
        .then(() => {
            expect(File.existsSync(filePathA)).toBeFalsy();
        });

    });


    it("will resolve when the specified file does not exist", (done) => {
        const filePathA = path.join(TMP_DIR_PATH, "xyzzy.txt");

        expect(File.existsSync(filePathA)).toBeFalsy();

        return deleteFile(filePathA)
        .then(() => {
            done();
        });
    });

});


describe("deleteFileSync()", () => {


    it("will delete the specified file", () => {
        const filePathA = path.join(TMP_DIR_PATH, "a.txt");
        writeFileSync(filePathA, "This is file A");

        expect(File.existsSync(filePathA)).toBeTruthy();

        deleteFileSync(filePathA);

        expect(File.existsSync(filePathA)).toBeFalsy();
    });


    it("will just return when the specified file does not exist", () => {
        const filePathA = path.join(TMP_DIR_PATH, "xyzzy.txt");

        expect(File.existsSync(filePathA)).toBeFalsy();
        deleteFileSync(filePathA);
        expect(File.existsSync(filePathA)).toBeFalsy();
    });

});


describe("readDir()", () => {


    beforeEach(() => {
        return resetTmpFolder();
    });


    it("will read the files and subdirectories within a directory", (done) => {

        const dirA = path.join(TMP_DIR_PATH, "dirA");
        const fileA = path.join(dirA, "a.txt");

        const dirB = path.join(TMP_DIR_PATH, "dirB");
        const fileB = path.join(dirB, "b.txt");

        const fileC = path.join(TMP_DIR_PATH, "c.txt");


        Promise.all([
            ensureDirectoryExists(dirA),
            ensureDirectoryExists(dirB)
        ])
        .then(() => {
            return Promise.all([
                writeFileAsync(fileA, "This is file A"),
                writeFileAsync(fileB, "This is file B"),
                writeFileAsync(fileC, "This is file C")
            ]);
        })
        .then(() => {
            return readDir(TMP_DIR_PATH);
        })
        .then((result) => {
            expect(result.subdirs.length).toEqual(2);
            expect(result.files.length).toEqual(1);
            done();
        });

    });


});


describe("readDirSync()", () => {


    beforeEach(() => {
        return resetTmpFolder();
    });


    it("will read the files and subdirectories within a directory", () => {

        const dirA = path.join(TMP_DIR_PATH, "dirA");
        const fileA = path.join(dirA, "a.txt");

        const dirB = path.join(TMP_DIR_PATH, "dirB");
        const fileB = path.join(dirB, "b.txt");

        const fileC = path.join(TMP_DIR_PATH, "c.txt");

        ensureDirectoryExistsSync(dirA);
        ensureDirectoryExistsSync(dirB);

        writeFileSync(fileA, "file A");
        writeFileSync(fileB, "file B");
        writeFileSync(fileC, "file c");

        const contents = readDirSync(TMP_DIR_PATH);

        expect(contents.subdirs.length).toEqual(2);
        expect(contents.files.length).toEqual(1);
    });


});


describe("pruneDir()", function () {


    beforeEach(() => {
        return resetTmpFolder();
    });


    it("will recursively remove all subdirectories", () => {

        return sequence([
            () => { return ensureDirectoryExists(path.join(TMP_DIR_PATH, "dirA", "dirBa", "dirC")); },
            () => { return ensureDirectoryExists(path.join(TMP_DIR_PATH, "dirA", "dirBb", "dirE")); },
            () => { return ensureDirectoryExists(path.join(TMP_DIR_PATH, "dir1", "dir2a", "dir3")); },
            () => { return ensureDirectoryExists(path.join(TMP_DIR_PATH, "dir1", "dir2b", "dir4")); }
        ], undefined)
        .then(() => {
            return pruneDir(TMP_DIR_PATH);
        })
        .then(() => {
            const tmpDir = new Directory(TMP_DIR_PATH);
            return tmpDir.isEmptySync();
        })
        .then((isEmpty) => {
            expect(isEmpty).toBeTruthy();
        });
    });


    it("will not prune directories containing files", () => {

        // TODO: Replace async calls with sync calls.

        return sequence([
            () => { return ensureDirectoryExists(path.join(TMP_DIR_PATH, "dirA", "dirBa", "dirC")); },
            () => { return ensureDirectoryExists(path.join(TMP_DIR_PATH, "dirA", "dirBb", "dirE")); },
            () => { return ensureDirectoryExists(path.join(TMP_DIR_PATH, "dir1", "dir2a", "dir3")); },
            () => { return ensureDirectoryExists(path.join(TMP_DIR_PATH, "dir1", "dir2b", "dir4")); },
            () => { return writeFileAsync(path.join(TMP_DIR_PATH, "dirA", "foo.txt"), "This is foo.txt"); }
        ], undefined)
        .then(() => {
            return pruneDir(TMP_DIR_PATH);
        })
        .then(() => {
            const tmpDir = new Directory(TMP_DIR_PATH);
            return tmpDir.isEmpty();
        })
        .then((isEmpty) => {
            expect(isEmpty).toBeFalsy();
            return readDir(TMP_DIR_PATH);
        })
        .then((contents) => {
            expect(contents.subdirs.length).toEqual(1);
            expect(contents.subdirs).toContain(path.join(TMP_DIR_PATH, "dirA"));
            expect(contents.files.length).toEqual(0);

            expect(Directory.existsSync(path.join(TMP_DIR_PATH, "dirA", "dirBa"))).toBeFalsy();
            expect(Directory.existsSync(path.join(TMP_DIR_PATH, "dirA", "dirBb"))).toBeFalsy();
            expect(File.existsSync(path.join(TMP_DIR_PATH, "dirA", "foo.txt"))).toBeTruthy();
        });
    });


});


describe("pruneDirSync()", function () {


    beforeEach(() => {
        return resetTmpFolder();
    });


    it("will recursiveely remove all subdirectories", () => {

        ensureDirectoryExistsSync(path.join(TMP_DIR_PATH, "dirA", "dirBa", "dirC"));
        ensureDirectoryExistsSync(path.join(TMP_DIR_PATH, "dirA", "dirBb", "dirE"));
        ensureDirectoryExistsSync(path.join(TMP_DIR_PATH, "dir1", "dir2a", "dir3"));
        ensureDirectoryExistsSync(path.join(TMP_DIR_PATH, "dir1", "dir2b", "dir4"));

        pruneDirSync(TMP_DIR_PATH);

        const tmpDir = new Directory(TMP_DIR_PATH);
        expect(tmpDir.isEmptySync()).toBeTruthy();
    });


    it("will not prune directories containing files", () => {

        ensureDirectoryExistsSync(path.join(TMP_DIR_PATH, "dirA", "dirBa", "dirC"));
        ensureDirectoryExistsSync(path.join(TMP_DIR_PATH, "dirA", "dirBb", "dirE"));
        ensureDirectoryExistsSync(path.join(TMP_DIR_PATH, "dir1", "dir2a", "dir3"));
        ensureDirectoryExistsSync(path.join(TMP_DIR_PATH, "dir1", "dir2b", "dir4"));
        writeFileSync(path.join(TMP_DIR_PATH, "dirA", "foo.txt"), "This is foo.txt");

        pruneDirSync(TMP_DIR_PATH);

        const tmpDir = new Directory(TMP_DIR_PATH);
        expect(tmpDir.isEmptySync()).toBeFalsy();

        const contents = readDirSync(TMP_DIR_PATH);

        expect(contents.subdirs.length).toEqual(1);
        expect(contents.subdirs).toContain(path.join(TMP_DIR_PATH, "dirA"));
        expect(contents.files.length).toEqual(0);

        expect(Directory.existsSync(path.join(TMP_DIR_PATH, "dirA", "dirBa"))).toBeFalsy();
        expect(Directory.existsSync(path.join(TMP_DIR_PATH, "dirA", "dirBb"))).toBeFalsy();
        expect(File.existsSync(path.join(TMP_DIR_PATH, "dirA", "foo.txt"))).toBeTruthy();
    });


});
