import axios from 'axios';
import { DiffFile, AnalysisResult, ReviewComment } from './types.js';

export class AIAnalyzer {
  private apiKey: string;
  private apiUrl: string;

  constructor(apiKey?: string, apiUrl?: string) {
    this.apiKey = apiKey || process.env.OPENAI_API_KEY || '';
    this.apiUrl = apiUrl || 'https://api.openai.com/v1/chat/completions';
  }

  async analyzeDiff(files: DiffFile[]): Promise<AnalysisResult> {
    if (!this.apiKey) {
      throw new Error('APIキーが設定されていません。OPENAI_API_KEYを環境変数に設定するか、--api-keyオプションを使用してください。');
    }

    const fileComments: ReviewComment[] = [];
    
    for (const file of files) {
      const comment = await this.analyzeFile(file);
      fileComments.push(comment);
    }

    const overallSummary = await this.generateOverallSummary(files, fileComments);
    const riskLevel = this.calculateRiskLevel(fileComments);

    return {
      overallSummary,
      fileComments,
      riskLevel
    };
  }

  private async analyzeFile(file: DiffFile): Promise<ReviewComment> {
    const diffText = this.formatFileForAnalysis(file);
    
    const prompt = `
以下のGitのdiffを分析し、Pull Requestのレビューコメントを生成してください。
日本語で回答してください。

ファイル: ${file.path}
${file.isNew ? '（新規ファイル）' : ''}
${file.isDeleted ? '（削除されたファイル）' : ''}
${file.isRenamed ? `（${file.oldPath} から ${file.path} にリネーム）` : ''}

Diff:
${diffText}

以下の形式でJSONを返してください：
{
  "summary": "変更の概要（1-2文）",
  "intent": "変更の意図や目的",
  "concerns": ["懸念点1", "懸念点2"],
  "suggestions": ["提案1", "提案2"]
}

注意点：
- コードの品質、セキュリティ、パフォーマンス、保守性の観点から分析してください
- 具体的で建設的なフィードバックを提供してください
- バグの可能性や改善提案があれば含めてください
`;

    try {
      const response = await axios.post(this.apiUrl, {
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'あなたは経験豊富なソフトウェア開発者で、コードレビューの専門家です。コードの変更を分析し、建設的なフィードバックを提供します。'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3
      }, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      const content = response.data.choices[0].message.content;
      const result = JSON.parse(content);

      return {
        file: file.path,
        summary: result.summary,
        intent: result.intent,
        concerns: result.concerns || [],
        suggestions: result.suggestions || []
      };

    } catch (error) {
      console.warn(`ファイル ${file.path} の分析中にエラーが発生しました:`, error);
      
      return {
        file: file.path,
        summary: '分析できませんでした',
        intent: '不明',
        concerns: ['分析中にエラーが発生しました'],
        suggestions: []
      };
    }
  }

  private async generateOverallSummary(files: DiffFile[], comments: ReviewComment[]): Promise<string> {
    const summary = `
変更されたファイル数: ${files.length}
新規ファイル: ${files.filter(f => f.isNew).length}
削除されたファイル: ${files.filter(f => f.isDeleted).length}
リネームされたファイル: ${files.filter(f => f.isRenamed).length}

主な変更:
${comments.map(c => `- ${c.file}: ${c.summary}`).join('\n')}
`;

    const prompt = `
以下のPull Requestの変更内容を要約してください。全体的な変更の目的と影響を1-2段落で説明してください。
日本語で回答してください。

${summary}

主な懸念事項:
${comments.flatMap(c => c.concerns).join('\n- ')}
`;

    try {
      const response = await axios.post(this.apiUrl, {
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'あなたはコードレビューの専門家で、Pull Requestの全体的な変更を要約します。'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3
      }, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      return response.data.choices[0].message.content;
    } catch (error) {
      return '全体的な要約の生成中にエラーが発生しました。';
    }
  }

  private formatFileForAnalysis(file: DiffFile): string {
    let result = '';
    
    for (const hunk of file.hunks) {
      result += `@@ -${hunk.oldStart},${hunk.oldLines} +${hunk.newStart},${hunk.newLines} @@\n`;
      
      for (const line of hunk.lines) {
        const prefix = line.type === 'added' ? '+' : line.type === 'removed' ? '-' : ' ';
        result += `${prefix}${line.content}\n`;
      }
    }
    
    return result;
  }

  private calculateRiskLevel(comments: ReviewComment[]): 'low' | 'medium' | 'high' {
    const totalConcerns = comments.reduce((sum, comment) => sum + comment.concerns.length, 0);
    const avgConcerns = totalConcerns / Math.max(comments.length, 1);

    if (avgConcerns >= 3) return 'high';
    if (avgConcerns >= 1.5) return 'medium';
    return 'low';
  }
}