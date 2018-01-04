import * as path from "path";
import {Directory} from "../src/directory";


export const tmpDir = new Directory(path.join(__dirname, "..", "tmp"));
