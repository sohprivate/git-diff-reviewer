#!/usr/bin/env node
"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const commander_1 = require("commander");
const fs_1 = require("fs");
const child_process_1 = require("child_process");
const chalk_1 = __importDefault(require("chalk"));
const git_parser_js_1 = require("./git-parser.js");
const ai_analyzer_js_1 = require("./ai-analyzer.js");
const formatter_js_1 = require("./formatter.js");
async function main() {
    commander_1.program
        .name('git-diff-reviewer')
        .description('Analyze git diffs and generate PR comments using AI')
        .version('1.0.0');
    commander_1.program
        .command('analyze')
        .description('Analyze git diff and generate review comments')
        .option('-f, --file <path>', 'Path to diff file (default: read from git diff)')
        .option('-c, --commit <hash>', 'Analyze specific commit')
        .option('-r, --range <range>', 'Analyze commit range (e.g., HEAD~3..HEAD)')
        .option('--staged', 'Analyze staged changes (git diff --cached)')
        .option('--api-key <key>', 'OpenAI API key (or set OPENAI_API_KEY env var)')
        .option('--api-url <url>', 'Custom API URL')
        .option('-o, --output <format>', 'Output format (console|markdown)', 'console')
        .option('--save <path>', 'Save output to file')
        .action(async (options) => {
        try {
            let diffText;
            if (options.file) {
                diffText = (0, fs_1.readFileSync)(options.file, 'utf-8');
            }
            else if (options.commit) {
                diffText = (0, child_process_1.execSync)(`git show ${options.commit}`, { encoding: 'utf-8' });
            }
            else if (options.range) {
                diffText = (0, child_process_1.execSync)(`git diff ${options.range}`, { encoding: 'utf-8' });
            }
            else if (options.staged) {
                diffText = (0, child_process_1.execSync)('git diff --cached', { encoding: 'utf-8' });
            }
            else {
                diffText = (0, child_process_1.execSync)('git diff HEAD~1', { encoding: 'utf-8' });
            }
            if (!diffText.trim()) {
                console.log(chalk_1.default.yellow('No diff found to analyze.'));
                return;
            }
            console.log(chalk_1.default.blue('Parsing diff...'));
            const files = git_parser_js_1.GitDiffParser.parse(diffText);
            if (files.length === 0) {
                console.log(chalk_1.default.yellow('No files found in diff.'));
                return;
            }
            console.log(chalk_1.default.blue(`Found ${files.length} file(s) to analyze...`));
            const analyzer = new ai_analyzer_js_1.AIAnalyzer(options.apiKey, options.apiUrl);
            console.log(chalk_1.default.blue('Analyzing with AI...'));
            const result = await analyzer.analyzeDiff(files);
            const output = formatter_js_1.OutputFormatter.formatAnalysis(result, options.output);
            if (options.save) {
                const { writeFileSync } = await Promise.resolve().then(() => __importStar(require('fs')));
                writeFileSync(options.save, output);
                console.log(chalk_1.default.green(`Analysis saved to ${options.save}`));
            }
            else {
                console.log(output);
            }
        }
        catch (error) {
            console.error(chalk_1.default.red('Error:'), error instanceof Error ? error.message : String(error));
            process.exit(1);
        }
    });
    commander_1.program
        .command('setup')
        .description('Setup the tool with API configuration')
        .action(() => {
        console.log(chalk_1.default.blue('Git Diff Reviewer Setup\n'));
        console.log('To use this tool, you need to set up an OpenAI API key:\n');
        console.log('1. Get an API key from https://platform.openai.com/api-keys');
        console.log('2. Set the environment variable:');
        console.log(chalk_1.default.green('   export OPENAI_API_KEY="your-api-key-here"'));
        console.log('3. Or use the --api-key option when running the tool\n');
        console.log('Example usage:');
        console.log(chalk_1.default.cyan('  git-diff-reviewer analyze'));
        console.log(chalk_1.default.cyan('  git-diff-reviewer analyze --staged'));
        console.log(chalk_1.default.cyan('  git-diff-reviewer analyze --commit HEAD~1'));
        console.log(chalk_1.default.cyan('  git-diff-reviewer analyze --range HEAD~3..HEAD'));
    });
    commander_1.program.parse();
}
main().catch(error => {
    console.error(chalk_1.default.red('Unexpected error:'), error);
    process.exit(1);
});
//# sourceMappingURL=index.js.map