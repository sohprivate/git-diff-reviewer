import { DiffFile } from './types.js';
export declare class GitDiffParser {
    static parse(diffText: string): DiffFile[];
    private static parseFileBlock;
    private static parseHunkHeader;
    private static parseDiffLine;
    private static getNextOldLineNumber;
    private static getNextNewLineNumber;
}
//# sourceMappingURL=git-parser.d.ts.map