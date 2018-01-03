import * as path from "path";
import {Directory} from "../src/fsHelpers";


export const tmpDir = new Directory(path.join(__dirname, "..", "tmp"));


export function resetTmpFolder(): void {
    return tmpDir.emptySync();
}
