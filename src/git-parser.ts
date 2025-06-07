import { DiffFile, DiffHunk, DiffLine } from './types.js';

export class GitDiffParser {
  static parse(diffText: string): DiffFile[] {
    const files: DiffFile[] = [];
    const fileBlocks = diffText.split(/^diff --git /m).filter(block => block.trim());

    for (const block of fileBlocks) {
      const file = this.parseFileBlock(block);
      if (file) {
        files.push(file);
      }
    }

    return files;
  }

  private static parseFileBlock(block: string): DiffFile | null {
    const lines = block.split('\n');
    if (lines.length === 0) return null;

    const firstLine = lines[0];
    const pathMatch = firstLine.match(/^a\/(.+) b\/(.+)$/);
    if (!pathMatch) return null;

    const oldPath = pathMatch[1];
    const newPath = pathMatch[2];

    const file: DiffFile = {
      path: newPath,
      oldPath: oldPath !== newPath ? oldPath : undefined,
      isNew: false,
      isDeleted: false,
      isRenamed: oldPath !== newPath,
      hunks: []
    };

    let currentHunk: DiffHunk | null = null;
    let i = 1;

    while (i < lines.length) {
      const line = lines[i];

      if (line.startsWith('new file mode')) {
        file.isNew = true;
      } else if (line.startsWith('deleted file mode')) {
        file.isDeleted = true;
      } else if (line.startsWith('@@')) {
        if (currentHunk) {
          file.hunks.push(currentHunk);
        }
        currentHunk = this.parseHunkHeader(line);
      } else if (currentHunk && (line.startsWith(' ') || line.startsWith('+') || line.startsWith('-'))) {
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

  private static parseHunkHeader(line: string): DiffHunk {
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

  private static parseDiffLine(line: string, hunk: DiffHunk): DiffLine | null {
    if (line.length === 0) return null;

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

  private static getNextOldLineNumber(hunk: DiffHunk): number {
    let oldLineCount = 0;
    for (const line of hunk.lines) {
      if (line.type === 'context' || line.type === 'removed') {
        oldLineCount++;
      }
    }
    return hunk.oldStart + oldLineCount;
  }

  private static getNextNewLineNumber(hunk: DiffHunk): number {
    let newLineCount = 0;
    for (const line of hunk.lines) {
      if (line.type === 'context' || line.type === 'added') {
        newLineCount++;
      }
    }
    return hunk.newStart + newLineCount;
  }
}