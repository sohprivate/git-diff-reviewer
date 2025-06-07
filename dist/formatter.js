"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OutputFormatter = void 0;
const chalk_1 = __importDefault(require("chalk"));
class OutputFormatter {
    static formatAnalysis(result, format = 'console') {
        if (format === 'markdown') {
            return this.formatMarkdown(result);
        }
        return this.formatConsole(result);
    }
    static formatConsole(result) {
        let output = '';
        output += chalk_1.default.bold.blue('🔍 Git Diff Review Analysis\n');
        output += chalk_1.default.gray('================================\n\n');
        output += chalk_1.default.bold('📋 Overall Summary:\n');
        output += `${result.overallSummary}\n\n`;
        const riskColor = result.riskLevel === 'high' ? chalk_1.default.red :
            result.riskLevel === 'medium' ? chalk_1.default.yellow : chalk_1.default.green;
        output += chalk_1.default.bold('⚠️  Risk Level: ') + riskColor(`${result.riskLevel.toUpperCase()}\n\n`);
        output += chalk_1.default.bold('📁 File Analysis:\n');
        output += chalk_1.default.gray('------------------\n');
        for (const comment of result.fileComments) {
            output += this.formatFileComment(comment);
            output += '\n';
        }
        return output;
    }
    static formatFileComment(comment) {
        let output = '';
        output += chalk_1.default.bold.cyan(`📄 ${comment.file}\n`);
        output += chalk_1.default.bold('Summary: ') + `${comment.summary}\n`;
        output += chalk_1.default.bold('Intent: ') + `${comment.intent}\n`;
        if (comment.concerns.length > 0) {
            output += chalk_1.default.bold.red('⚠️  Concerns:\n');
            for (const concern of comment.concerns) {
                output += chalk_1.default.red(`  • ${concern}\n`);
            }
        }
        if (comment.suggestions.length > 0) {
            output += chalk_1.default.bold.green('💡 Suggestions:\n');
            for (const suggestion of comment.suggestions) {
                output += chalk_1.default.green(`  • ${suggestion}\n`);
            }
        }
        output += chalk_1.default.gray('---\n');
        return output;
    }
    static formatMarkdown(result) {
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
exports.OutputFormatter = OutputFormatter;
//# sourceMappingURL=formatter.js.map