import * as path from "path";
import * as fs from "fs";
import {spawn} from "../src/spawn";
import {TMP_DIR_PATH, resetTmpFolder} from "./specHelpers";

describe("spawn", () => {

    beforeEach((done) => {
        resetTmpFolder()
        .then(done);
    });


    it("will run the specified command", (done) => {
        const testFilePath = path.join(TMP_DIR_PATH, "foo.txt");
        spawn("touch file", "touch", "touch", ["foo.txt"], TMP_DIR_PATH)
        .then(() => {
            const stats = fs.statSync(testFilePath);
            expect(stats.isFile()).toBeTruthy();
            done();
        });
    });


});
