import * as path from "path";
import {emptyDirectory} from "../src/fsHelpers";


export const TMP_DIR_PATH = path.join(__dirname, "..", "tmp");


export function resetTmpFolder(): Promise<void> {
    return emptyDirectory(TMP_DIR_PATH);
}
