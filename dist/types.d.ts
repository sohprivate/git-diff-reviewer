export interface DiffFile {
    path: string;
    oldPath?: string;
    isNew: boolean;
    isDeleted: boolean;
    isRenamed: boolean;
    hunks: DiffHunk[];
}
export interface DiffHunk {
    oldStart: number;
    oldLines: number;
    newStart: number;
    newLines: number;
    lines: DiffLine[];
}
export interface DiffLine {
    type: 'context' | 'added' | 'removed';
    content: string;
    oldNumber?: number;
    newNumber?: number;
}
export interface ReviewComment {
    file: string;
    summary: string;
    concerns: string[];
    suggestions: string[];
    intent: string;
}
export interface AnalysisResult {
    overallSummary: string;
    fileComments: ReviewComment[];
    riskLevel: 'low' | 'medium' | 'high';
}
//# sourceMappingURL=types.d.ts.map