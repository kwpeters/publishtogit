import * as path from "path";
import * as fs from "fs";
import {
    isDirectory, isFile, ensureDirectoryExists, emptyDirectory, deleteFile,
    deleteDirectory, readDir, dirIsEmpty, pruneDir
} from "../src/fsHelpers";
import {TMP_DIR_PATH, resetTmpFolder} from "./specHelpers";
import {promisify2, sequence} from "../src/promiseHelpers";


const writeFileAsync = promisify2<void, string, string>(fs.writeFile);


describe("isDirectory()", () => {


    it("will resolve to true for an existing directory", (done) => {
        isDirectory(__dirname)
        .then((isDirectory: boolean) => {
            expect(isDirectory).toBeTruthy();
            done();
        });
    });


    it("will resolve to false for a directory that does not exist", (done) => {
        isDirectory(path.join(__dirname, "xyzzy"))
        .then((isDirectory: boolean) => {
            expect(isDirectory).toBeFalsy();
            done();
        });
    });


    it("will resolve to false for a file with the specified path", (done) => {
        isDirectory(__filename)
        .then((isDirectory: boolean) => {
            expect(isDirectory).toBeFalsy();
            done();
        });
    });


});


describe("ensureDirectoryExists()", () => {


    it("will make sure all necessary directories exist", (done) => {
        const dirPath = path.join(TMP_DIR_PATH, "dir1", "dir2", "dir3");

        ensureDirectoryExists(dirPath)
        .then(() => {
            return isDirectory(dirPath);
        })
        .then((isDirectory) => {
            expect(isDirectory).toBeTruthy();
            done();
        });
    });


});


describe("emptyDirectory()", () => {

    it("if the specified directory does not exist, will create all needed directories", (done) => {

        const dirPath = path.join(TMP_DIR_PATH, "dir1", "dir2", "dir3");

        emptyDirectory(dirPath)
        .then(() => {
            return isDirectory(dirPath);
        })
        .then((isDirectory: boolean) => {
            expect(isDirectory).toBeTruthy();
            done();
        });
    });


    it("will remove files from the specified directory", (done) => {

        const filePathA = path.join(TMP_DIR_PATH, "a.txt");
        const filePathB = path.join(TMP_DIR_PATH, "b.txt");
        const filePathC = path.join(TMP_DIR_PATH, "c.txt");

        Promise.all([
            writeFileAsync(filePathA, "This is file A"),
            writeFileAsync(filePathB, "This is file B"),
            writeFileAsync(filePathC, "This is file C")
        ])
        .then(() => {
            return emptyDirectory(TMP_DIR_PATH);
        })
        .then(() => {
            return Promise.all([
                isDirectory(TMP_DIR_PATH),
                isFile(filePathA),
                isFile(filePathB),
                isFile(filePathC)
            ]);
        })
        .then((results: Array<boolean>) => {
            expect(results[0]).toBeTruthy();
            expect(results[1]).toBeFalsy();
            expect(results[2]).toBeFalsy();
            expect(results[3]).toBeFalsy();
            done();
        });

    });

});


describe("deleteDirectory()", () => {

    it("will completely remove the directory and its contents", (done) => {
        const dirPath = path.join(TMP_DIR_PATH, "testDir");
        const filePath = path.join(dirPath, "a.txt");
        const subdirPath = path.join(dirPath, "subdir");

        ensureDirectoryExists(dirPath)
        .then(() => {
            return writeFileAsync(filePath, "A test file");
        })
        .then(() => {
            return ensureDirectoryExists(subdirPath);
        })
        .then(() => {
            return deleteDirectory(dirPath);
        })
        .then(() => {
            return isDirectory(dirPath);
        })
        .then((isDirectory: boolean) => {
            expect(isDirectory).toBeFalsy();
            done();
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


describe("isFile()", () => {


    it("will resolve to true for an existing file", (done) => {
        isFile(__filename)
        .then((isFile: boolean) => {
            expect(isFile).toBeTruthy();
            done();
        });
    });


    it("will resolve to false for a file that does not exist", (done) => {
        isFile(path.join(__dirname, "xyzzy.txt"))
        .then((isFile: boolean) => {
            expect(isFile).toBeFalsy();
            done();
        });
    });


    it("will resolve to false for a directory with the specified path", (done) => {
        isFile(__dirname)
        .then((isFile: boolean) => {
            expect(isFile).toBeFalsy();
            done();
        });
    });


});


describe("deleteFile()", () => {

    it("will delete the specified file", (done) => {
        const filePathA = path.join(TMP_DIR_PATH, "a.txt");

        writeFileAsync(filePathA, "This is file A")
        .then(() => {
            return isFile(filePathA);
        })
        .then((isFile: boolean) => {
            expect(isFile).toBeTruthy();
        })
        .then(() => {
            return deleteFile(filePathA);
        })
        .then(() => {
            return isFile(filePathA);
        })
        .then((isFile: boolean) => {
            expect(isFile).toBeFalsy();
            done();
        });

    });


    it("will resolve when the specified file does not exist", (done) => {
        const filePathA = path.join(TMP_DIR_PATH, "xyzzy.txt");

        isFile(filePathA)
        .then((isFile: boolean) => {
            expect(isFile).toBeFalsy();
            return deleteFile(filePathA);
        })
        .then(() => {
            done();
        });
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
        const fileB = path.join(dirA, "b.txt");

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


describe("dirIsEmpty()", () => {


    beforeEach(() => {
        return resetTmpFolder();
    });


    it("will return false when a directory contains a file", (done) => {

        writeFileAsync(path.join(TMP_DIR_PATH, "foo.txt"), "This is foo.txt")
        .then(() => {
            return dirIsEmpty(TMP_DIR_PATH);
        })
        .then((isEmpty) => {
            expect(isEmpty).toBeFalsy();
            done();
        });
    });


    it("will return false when a directory contains a subdirectory", (done) => {

        ensureDirectoryExists(path.join(TMP_DIR_PATH, "foo"))
        .then(() => {
            return dirIsEmpty(TMP_DIR_PATH);
        })
        .then((isEmpty) => {
            expect(isEmpty).toBeFalsy();
            done();
        });
    });


    it("will return true when a directory is empty", (done) => {
        dirIsEmpty(TMP_DIR_PATH)
        .then((isEmpty) => {
            expect(isEmpty).toBeTruthy();
            done();
        });
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
            return dirIsEmpty(TMP_DIR_PATH);
        })
        .then((isEmpty) => {
            expect(isEmpty).toBeTruthy();
        });
    });


    it("will not prune directories containing files", () => {

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
            return dirIsEmpty(TMP_DIR_PATH);
        })
        .then((isEmpty) => {
            expect(isEmpty).toBeFalsy();
            return readDir(TMP_DIR_PATH);
        })
        .then((contents) => {
            expect(contents.subdirs.length).toEqual(1);
            expect(contents.subdirs).toContain(path.join(TMP_DIR_PATH, "dirA"));
            expect(contents.files.length).toEqual(0);

            return Promise.all([
                isDirectory(path.join(TMP_DIR_PATH, "dirA", "dirBa")),
                isDirectory(path.join(TMP_DIR_PATH, "dirA", "dirBb")),
                isFile(path.join(TMP_DIR_PATH, "dirA", "foo.txt"))
            ]);
        })
        .then((results) => {
            expect(results[0]).toBeFalsy();
            expect(results[1]).toBeFalsy();
            expect(results[2]).toBeTruthy();
        });
    });


});
