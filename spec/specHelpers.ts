import {Directory} from "../src/directory";

export const sampleRepoUrl = "https://github.com/kwpeters/sampleGitRepo.git";
export const sampleRepoDir = new Directory(__dirname, "..", "..", "sampleGitRepo");
export const tmpDir = new Directory(__dirname, "..", "tmp");
