import { AnalysisResult } from './types.js';
export declare class OutputFormatter {
    static formatAnalysis(result: AnalysisResult, format?: 'console' | 'markdown'): string;
    private static formatConsole;
    private static formatFileComment;
    private static formatMarkdown;
}
//# sourceMappingURL=formatter.d.ts.map