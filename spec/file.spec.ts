import * as fs from "fs";
import * as path from "path";
import {tmpDir} from "./specHelpers";
import {File} from "../src/file";
import {Directory} from "../src/directory";


describe("File", () => {


    describe("static", () => {


        describe("exists()", () => {


            it("will resolve to a truthy stats object for an existing file", () => {
                return File.exists(__filename)
                .then((stats) => {
                    expect(stats).toBeTruthy();
                });
            });


            it("will resolve to false for a file that does not exist", () => {
                return File.exists(path.join(__dirname, "xyzzy.txt"))
                .then((stats) => {
                    expect(stats).toBeFalsy();
                });
            });


            it("will resolve to false for a directory with the specified path", () => {
                return File.exists(__dirname)
                .then((stats) => {
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


        describe("dirName, baseName, fileName, extName", () => {


            it("will give the correct parts of a normal file path", () => {
                const file1: File = new File(path.join("..", "tmp", "bar", "baz.txt"));
                expect(file1.dirName).toEqual("../tmp/bar/");
                expect(file1.baseName).toEqual("baz");
                expect(file1.fileName).toEqual("baz.txt");
                expect(file1.extName).toEqual(".txt");
            });


            it("will give the correct parts of a file path with no directory", () => {
                const file: File = new File("baz.foo");

                expect(file.dirName).toEqual("./");
                expect(file.baseName).toEqual("baz");
                expect(file.fileName).toEqual("baz.foo");
                expect(file.extName).toEqual(".foo");
            });


            it("will give the correct parts of a file path with no extension", () => {
                const file: File = new File("../tmp/bar/baz");

                expect(file.dirName).toEqual("../tmp/bar/");
                expect(file.baseName).toEqual("baz");
                expect(file.fileName).toEqual("baz");
                expect(file.extName).toEqual("");
            });


            it("will give the correct parts for a dotfile", () => {
                const file: File = new File("../tmp/bar/.baz");

                expect(file.dirName).toEqual("../tmp/bar/");
                expect(file.baseName).toEqual(".baz");
                expect(file.fileName).toEqual(".baz");
                expect(file.extName).toEqual("");
            });


        });


        describe("directory", () => {


            it("will return a Directory object representing the directory containing the file", () => {
                const dir = new Directory("../foo/bar");
                const file = new File(path.join(dir.toString(), "baz.txt"));
                expect(file.directory.toString()).toEqual(dir.toString());
            });


        });


        describe("toString()", () => {


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
                tmpDir.emptySync();

                const file1 = new File(path.join(tmpDir.absPath(), "foo", "a.txt"));
                const file2 = new File(path.join(tmpDir.absPath(), "bar", "a.txt"));

                expect(file1.equals(file2)).toBeFalsy();
            });


        });


        describe("exists()", () => {


            it("will resolve to a Stats object for an existing file", () => {
                const file = new File(__filename);
                return file.exists()
                .then((stats) => {
                    expect(stats).toBeTruthy();
                });
            });


            it("will resolve to false for a file that does not exist", () => {
                const file = new File(path.join(__dirname, "xyzzy.txt"));
                return file.exists()
                .then((result) => {
                    expect(result).toBeFalsy();
                });
            });


            it("will resolve to false for a directory with the specified path", () => {
                const file = new File(__dirname);
                return file.exists()
                .then((result) => {
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
                fileA.writeSync("This is file A");
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
                fileA.writeSync("This is file A");
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


        describe("copy", () => {


            beforeEach(() => {
                tmpDir.emptySync();
            });


            it("will copy the file to the specified destination directory", (done) => {
                const srcFile = new File(path.join(tmpDir.absPath(), "src", "file.txt"));
                srcFile.writeSync("abc");

                const dstDir = new Directory(path.join(tmpDir.absPath(), "dst"));

                srcFile.copy(dstDir)
                .then((dstFile) => {
                    expect(dstFile.existsSync()).toBeTruthy();
                    expect(dstFile.absPath()).toEqual(path.join(dstDir.absPath(), "file.txt"));
                    expect(dstFile.readSync()).toEqual("abc");
                    done();
                });

            });


            it("will rename the file when a directory and filename is specified", (done) => {
                const srcFile = new File(path.join(tmpDir.absPath(), "src", "file.txt"));
                srcFile.writeSync("123");

                const dstDir = new Directory(path.join(tmpDir.absPath(), "dst"));

                srcFile.copy(dstDir, "dest.txt")
                .then((dstFile) => {
                    expect(dstFile.existsSync()).toBeTruthy();
                    expect(dstFile.absPath()).toEqual(path.join(dstDir.absPath(), "dest.txt"));
                    expect(dstFile.readSync()).toEqual("123");
                    done();
                });
            });


            it("will rename the file when a destination File is specified", (done) => {
                const srcFile = new File(path.join(tmpDir.absPath(), "src", "file.txt"));
                srcFile.writeSync("def");

                const dstFile = new File(path.join(tmpDir.absPath(), "dst", "dest.txt"));

                srcFile.copy(dstFile)
                .then((dstFile) => {
                    expect(dstFile.existsSync()).toBeTruthy();
                    expect(dstFile.absPath()).toEqual(path.join(tmpDir.absPath(), "dst", "dest.txt"));
                    expect(dstFile.readSync()).toEqual("def");
                    done();
                });
            });


            it("will reject if the source file does not exist", (done) => {
                const srcFile = new File(path.join(tmpDir.absPath(), "src", "xyzzy.txt"));
                const dstDir = new Directory(path.join(tmpDir.absPath(), "dst"));

                srcFile.copy(dstDir)
                .catch(() => {
                    done();
                });
            });


            it("will not create a destination directory if the source file does not exist", (done) => {
                const srcFile = new File(path.join(tmpDir.absPath(), "src", "xyzzy.txt"));
                const dstDir = new Directory(path.join(tmpDir.absPath(), "dst"));

                srcFile.copy(dstDir)
                .catch(() => {
                    expect(dstDir.existsSync()).toBeFalsy();
                    done();
                });
            });


            it("will not create a destination file if the source file does not exist", (done) => {
                const srcFile = new File(path.join(tmpDir.absPath(), "src", "xyzzy.txt"));
                const dstDir = new Directory(path.join(tmpDir.absPath(), "dst"));

                srcFile.copy(dstDir)
                .catch(() => {
                    const dstFile = new File(path.join(dstDir.absPath(), "xyzzy.txt"));
                    expect(dstFile.existsSync()).toBeFalsy();
                    done();
                });
            });


            it("will overwrite an existing desintation file", (done) => {
                const oldDstFile = new File(path.join(tmpDir.absPath(), "dst", "dst.txt"));
                oldDstFile.writeSync("old");

                const srcFile = new File(path.join(tmpDir.absPath(), "src", "src.txt"));
                srcFile.writeSync("new");

                srcFile.copy(oldDstFile)
                .then((newDstFile) => {
                    expect(newDstFile.existsSync()).toBeTruthy();
                    expect(newDstFile.absPath()).toEqual(oldDstFile.absPath());
                    expect(newDstFile.readSync()).toEqual("new");
                    done();
                });
            });


            it("will copy the atime and mtime from the source file", (done) => {

                const srcFile = new File(path.join(tmpDir.absPath(), "src", "file.txt"));
                srcFile.writeSync("abc");

                const dstFile = new File(path.join(tmpDir.absPath(), "dst", "file.txt"));

                // There is a maximum possible error of 1 second when
                // copying the source's timestamps to the destination.
                // To make sure the timestamps are being copied, we are
                // waiting for 2 seconds before doing the copy and then
                // making sure that the timestamp deltas are within the
                // allowable 1 second.
                setTimeout(() => {
                    srcFile.copy(dstFile)
                    .then(() => {
                        // We get the source file's stats after the copy has
                        // happened, because copying it changes its last access
                        // time (atime).
                        const srcStats = srcFile.existsSync();
                        const dstStats = dstFile.existsSync();

                        if (!srcStats || !dstStats)
                        {
                            fail();
                            return;
                        }

                        expect(dstStats.atime.valueOf() - srcStats.atime.valueOf()).toBeLessThan(1000);
                        expect(dstStats.mtime.valueOf() - srcStats.mtime.valueOf()).toBeLessThan(1000);
                        done();
                    });
                }, 2000);
            });


        });


        describe("copySync()", () => {


            beforeEach(() => {
                tmpDir.emptySync();
            });


            it("will copy the file to the specified destination directory", () => {
                const srcFile = new File(path.join(tmpDir.absPath(), "src", "file.txt"));
                srcFile.writeSync("abc");

                const dstDir = new Directory(path.join(tmpDir.absPath(), "dst"));

                const dstFile = srcFile.copySync(dstDir)

                expect(dstFile.existsSync()).toBeTruthy();
                expect(dstFile.absPath()).toEqual(path.join(dstDir.absPath(), "file.txt"));
                expect(dstFile.readSync()).toEqual("abc");
            });


            it("will rename the file when a directory and filename is specified", () => {
                const srcFile = new File(path.join(tmpDir.absPath(), "src", "file.txt"));
                srcFile.writeSync("123");

                const dstDir = new Directory(path.join(tmpDir.absPath(), "dst"));

                const dstFile = srcFile.copySync(dstDir, "dest.txt");

                expect(dstFile.existsSync()).toBeTruthy();
                expect(dstFile.absPath()).toEqual(path.join(dstDir.absPath(), "dest.txt"));
                expect(dstFile.readSync()).toEqual("123");
            });


            it("will rename the file when a destination File is specified", () => {
                const srcFile = new File(path.join(tmpDir.absPath(), "src", "file.txt"));
                srcFile.writeSync("def");

                let dstFile = new File(path.join(tmpDir.absPath(), "dst", "dest.txt"));

                dstFile = srcFile.copySync(dstFile);

                expect(dstFile.existsSync()).toBeTruthy();
                expect(dstFile.absPath()).toEqual(path.join(tmpDir.absPath(), "dst", "dest.txt"));
                expect(dstFile.readSync()).toEqual("def");
            });


            it("will throw if the source file does not exist", () => {
                const srcFile = new File(path.join(tmpDir.absPath(), "src", "xyzzy.txt"));
                const dstDir = new Directory(path.join(tmpDir.absPath(), "dst"));

                expect(() => {
                    srcFile.copySync(dstDir);
                }).toThrow();
            });


            it("will not create a destination directory if the source file does not exist", () => {
                const srcFile = new File(path.join(tmpDir.absPath(), "src", "xyzzy.txt"));
                const dstDir = new Directory(path.join(tmpDir.absPath(), "dst"));

                expect(() => { srcFile.copySync(dstDir); }).toThrow();
                expect(dstDir.existsSync()).toBeFalsy();
            });


            it("will not create a destination file if the source file does not exist", () => {
                const srcFile = new File(path.join(tmpDir.absPath(), "src", "xyzzy.txt"));
                const dstDir = new Directory(path.join(tmpDir.absPath(), "dst"));

                expect(() => { srcFile.copySync(dstDir); }).toThrow();
                const dstFile = new File(path.join(dstDir.absPath(), "xyzzy.txt"));
                expect(dstFile.existsSync()).toBeFalsy();
            });


            it("will overwrite an existing desintation file", () => {
                const oldDstFile = new File(path.join(tmpDir.absPath(), "dst", "dst.txt"));
                oldDstFile.writeSync("old");

                const srcFile = new File(path.join(tmpDir.absPath(), "src", "src.txt"));
                srcFile.writeSync("new");

                const newDstFile = srcFile.copySync(oldDstFile)
                expect(newDstFile.existsSync()).toBeTruthy();
                expect(newDstFile.absPath()).toEqual(oldDstFile.absPath());
                expect(newDstFile.readSync()).toEqual("new");
            });


            it("will copy the atime and mtime from the source file", (done) => {

                const srcFile = new File(path.join(tmpDir.absPath(), "src", "file.txt"));
                srcFile.writeSync("abc");

                const dstFile = new File(path.join(tmpDir.absPath(), "dst", "file.txt"));

                // There is a maximum possible error of 1 second when
                // copying the source's timestamps to the destination.
                // To make sure the timestamps are being copied, we are
                // waiting for 2 seconds before doing the copy and then
                // making sure that the timestamp deltas are within the
                // allowable 1 second.
                setTimeout(() => {
                    srcFile.copySync(dstFile);

                    // We get the source file's stats after the copy has
                    // happened, because copying it changes its last access
                    // time (atime).
                    const srcStats = srcFile.existsSync();
                    const dstStats = dstFile.existsSync();

                    if (!srcStats || !dstStats)
                    {
                        fail();
                        return;
                    }

                    expect(dstStats.atime.valueOf() - srcStats.atime.valueOf()).toBeLessThan(1000);
                    expect(dstStats.mtime.valueOf() - srcStats.mtime.valueOf()).toBeLessThan(1000);
                    done();

                }, 2000);
            });

        });


        describe("write()", () => {


            it("creates the necessary directories", (done) => {
                const dir = new Directory(path.join(tmpDir.absPath(), "foo", "bar"));
                const file = new File(path.join(dir.absPath(), "file.txt"));

                file.write("hello world")
                .then(() => {
                    expect(dir.existsSync()).toBeTruthy();
                    expect(file.existsSync()).toBeTruthy();
                    done();
                });

            });


            it("writes the specified text to the file", (done) => {
                const dir = new Directory(path.join(tmpDir.absPath(), "foo", "bar"));
                const file = new File(path.join(dir.absPath(), "file.txt"));

                file.write("hello world")
                .then(() => {
                    return file.read();
                })
                .then((text: string) => {
                    expect(text).toEqual("hello world");
                    done();
                });
            });
        });


        describe("writeSync()", () => {


            it("creates the necessary directories", () => {
                const dir = new Directory(path.join(tmpDir.absPath(), "foo", "bar"));
                const file = new File(path.join(dir.absPath(), "file.txt"));

                file.writeSync("hello world");
                expect(dir.existsSync()).toBeTruthy();
                expect(file.existsSync()).toBeTruthy();
            });


            it("writes the specified text to the file", () => {
                const dir = new Directory(path.join(tmpDir.absPath(), "foo", "bar"));
                const file = new File(path.join(dir.absPath(), "file.txt"));

                file.writeSync("hello world");

                expect(file.readSync()).toEqual("hello world");
            });


        });


        describe("read()", () => {


            it("can read the contents of a file", (done) => {
                const dir = new Directory(path.join(tmpDir.absPath(), "foo", "bar"));
                const file = new File(path.join(dir.absPath(), "file.txt"));
                file.writeSync("12345");

                file.read()
                .then((text) => {
                    expect(text).toEqual("12345");
                    done()
                });
            });


            it("will reject if the file being read does not exist", (done) => {
                const file = new File(path.join(tmpDir.absPath(), "xyzzy.txt"));

                file.read()
                .catch(() => {
                    done();
                });
            });


        });


        describe("readSync()", () => {


            it("can read the contents of a file", () => {
                const dir = new Directory(path.join(tmpDir.absPath(), "foo", "bar"));
                const file = new File(path.join(dir.absPath(), "file.txt"));
                file.writeSync("12345");

                expect(file.readSync()).toEqual("12345");
            });


            it("will throw if the file being read does not exist", () => {
                const file = new File(path.join(tmpDir.absPath(), "xyzzy.txt"));
                expect(() => {
                    file.readSync();
                }).toThrow();
            });
        });


    });

});
