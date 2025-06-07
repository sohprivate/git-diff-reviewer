import { DiffFile, AnalysisResult } from './types.js';
export declare class AIAnalyzer {
    private apiKey;
    private apiUrl;
    constructor(apiKey?: string, apiUrl?: string);
    analyzeDiff(files: DiffFile[]): Promise<AnalysisResult>;
    private analyzeFile;
    private generateOverallSummary;
    private formatFileForAnalysis;
    private calculateRiskLevel;
}
//# sourceMappingURL=ai-analyzer.d.ts.map