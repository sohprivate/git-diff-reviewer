"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GitDiffParser = void 0;
class GitDiffParser {
    static parse(diffText) {
        const files = [];
        const fileBlocks = diffText.split(/^diff --git /m).filter(block => block.trim());
        for (const block of fileBlocks) {
            const file = this.parseFileBlock(block);
            if (file) {
                files.push(file);
            }
        }
        return files;
    }
    static parseFileBlock(block) {
        const lines = block.split('\n');
        if (lines.length === 0)
            return null;
        const firstLine = lines[0];
        const pathMatch = firstLine.match(/^a\/(.+) b\/(.+)$/);
        if (!pathMatch)
            return null;
        const oldPath = pathMatch[1];
        const newPath = pathMatch[2];
        const file = {
            path: newPath,
            oldPath: oldPath !== newPath ? oldPath : undefined,
            isNew: false,
            isDeleted: false,
            isRenamed: oldPath !== newPath,
            hunks: []
        };
        let currentHunk = null;
        let i = 1;
        while (i < lines.length) {
            const line = lines[i];
            if (line.startsWith('new file mode')) {
                file.isNew = true;
            }
            else if (line.startsWith('deleted file mode')) {
                file.isDeleted = true;
            }
            else if (line.startsWith('@@')) {
                if (currentHunk) {
                    file.hunks.push(currentHunk);
                }
                currentHunk = this.parseHunkHeader(line);
            }
            else if (currentHunk && (line.startsWith(' ') || line.startsWith('+') || line.startsWith('-'))) {
                const diffLine = this.parseDiffLine(line, currentHunk);
                if (diffLine) {
                    currentHunk.lines.push(diffLine);
                }
            }
            i++;
        }
        if (currentHunk) {
            file.hunks.push(currentHunk);
        }
        return file;
    }
    static parseHunkHeader(line) {
        const match = line.match(/^@@ -(\d+)(?:,(\d+))? \+(\d+)(?:,(\d+))? @@/);
        if (!match) {
            throw new Error(`Invalid hunk header: ${line}`);
        }
        return {
            oldStart: parseInt(match[1]),
            oldLines: parseInt(match[2] || '1'),
            newStart: parseInt(match[3]),
            newLines: parseInt(match[4] || '1'),
            lines: []
        };
    }
    static parseDiffLine(line, hunk) {
        if (line.length === 0)
            return null;
        const type = line[0];
        const content = line.slice(1);
        switch (type) {
            case ' ':
                return {
                    type: 'context',
                    content,
                    oldNumber: this.getNextOldLineNumber(hunk),
                    newNumber: this.getNextNewLineNumber(hunk)
                };
            case '+':
                return {
                    type: 'added',
                    content,
                    newNumber: this.getNextNewLineNumber(hunk)
                };
            case '-':
                return {
                    type: 'removed',
                    content,
                    oldNumber: this.getNextOldLineNumber(hunk)
                };
            default:
                return null;
        }
    }
    static getNextOldLineNumber(hunk) {
        let oldLineCount = 0;
        for (const line of hunk.lines) {
            if (line.type === 'context' || line.type === 'removed') {
                oldLineCount++;
            }
        }
        return hunk.oldStart + oldLineCount;
    }
    static getNextNewLineNumber(hunk) {
        let newLineCount = 0;
        for (const line of hunk.lines) {
            if (line.type === 'context' || line.type === 'added') {
                newLineCount++;
            }
        }
        return hunk.newStart + newLineCount;
    }
}
exports.GitDiffParser = GitDiffParser;
//# sourceMappingURL=git-parser.js.map