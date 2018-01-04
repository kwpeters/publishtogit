import * as fs from "fs";
import * as path from "path";
import {resetTmpFolder, tmpDir} from "./specHelpers";
import {File} from "../src/file";
import {Directory} from "../src/directory";


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

                fs.writeFileSync(fileA.absPath(), "This is file A");
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
                fs.writeFileSync(fileA.absPath(), "This is file A");

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
