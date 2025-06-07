import chalk from 'chalk';
import { AnalysisResult, ReviewComment } from './types.js';

export class OutputFormatter {
  static formatAnalysis(result: AnalysisResult, format: 'console' | 'markdown' = 'console'): string {
    if (format === 'markdown') {
      return this.formatMarkdown(result);
    }
    return this.formatConsole(result);
  }

  private static formatConsole(result: AnalysisResult): string {
    let output = '';

    output += chalk.bold.blue('🔍 Git Diff Review Analysis\n');
    output += chalk.gray('================================\n\n');

    output += chalk.bold('📋 Overall Summary:\n');
    output += `${result.overallSummary}\n\n`;

    const riskColor = result.riskLevel === 'high' ? chalk.red : 
                     result.riskLevel === 'medium' ? chalk.yellow : chalk.green;
    output += chalk.bold('⚠️  Risk Level: ') + riskColor(`${result.riskLevel.toUpperCase()}\n\n`);

    output += chalk.bold('📁 File Analysis:\n');
    output += chalk.gray('------------------\n');

    for (const comment of result.fileComments) {
      output += this.formatFileComment(comment);
      output += '\n';
    }

    return output;
  }

  private static formatFileComment(comment: ReviewComment): string {
    let output = '';

    output += chalk.bold.cyan(`📄 ${comment.file}\n`);
    output += chalk.bold('Summary: ') + `${comment.summary}\n`;
    output += chalk.bold('Intent: ') + `${comment.intent}\n`;

    if (comment.concerns.length > 0) {
      output += chalk.bold.red('⚠️  Concerns:\n');
      for (const concern of comment.concerns) {
        output += chalk.red(`  • ${concern}\n`);
      }
    }

    if (comment.suggestions.length > 0) {
      output += chalk.bold.green('💡 Suggestions:\n');
      for (const suggestion of comment.suggestions) {
        output += chalk.green(`  • ${suggestion}\n`);
      }
    }

    output += chalk.gray('---\n');
    return output;
  }

  private static formatMarkdown(result: AnalysisResult): string {
    let output = '';

    output += '# 🔍 Git Diff Review Analysis\n\n';

    output += '## 📋 Overall Summary\n\n';
    output += `${result.overallSummary}\n\n`;

    const riskEmoji = result.riskLevel === 'high' ? '🔴' : 
                     result.riskLevel === 'medium' ? '🟡' : '🟢';
    output += `## ⚠️ Risk Level: ${riskEmoji} ${result.riskLevel.toUpperCase()}\n\n`;

    output += '## 📁 File Analysis\n\n';

    for (const comment of result.fileComments) {
      output += `### 📄 \`${comment.file}\`\n\n`;
      output += `**Summary:** ${comment.summary}\n\n`;
      output += `**Intent:** ${comment.intent}\n\n`;

      if (comment.concerns.length > 0) {
        output += '#### ⚠️ Concerns\n\n';
        for (const concern of comment.concerns) {
          output += `- ${concern}\n`;
        }
        output += '\n';
      }

      if (comment.suggestions.length > 0) {
        output += '#### 💡 Suggestions\n\n';
        for (const suggestion of comment.suggestions) {
          output += `- ${suggestion}\n`;
        }
        output += '\n';
      }

      output += '---\n\n';
    }

    return output;
  }
}