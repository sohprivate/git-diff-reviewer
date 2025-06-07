#!/usr/bin/env node

import { program } from 'commander';
import { readFileSync } from 'fs';
import { execSync } from 'child_process';
import chalk from 'chalk';
import { GitDiffParser } from './git-parser.js';
import { AIAnalyzer } from './ai-analyzer.js';
import { OutputFormatter } from './formatter.js';

async function main() {
  program
    .name('git-diff-reviewer')
    .description('Analyze git diffs and generate PR comments using AI')
    .version('1.0.0');

  program
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
        let diffText: string;

        if (options.file) {
          diffText = readFileSync(options.file, 'utf-8');
        } else if (options.commit) {
          diffText = execSync(`git show ${options.commit}`, { encoding: 'utf-8' });
        } else if (options.range) {
          diffText = execSync(`git diff ${options.range}`, { encoding: 'utf-8' });
        } else if (options.staged) {
          diffText = execSync('git diff --cached', { encoding: 'utf-8' });
        } else {
          diffText = execSync('git diff HEAD~1', { encoding: 'utf-8' });
        }

        if (!diffText.trim()) {
          console.log(chalk.yellow('No diff found to analyze.'));
          return;
        }

        console.log(chalk.blue('Parsing diff...'));
        const files = GitDiffParser.parse(diffText);

        if (files.length === 0) {
          console.log(chalk.yellow('No files found in diff.'));
          return;
        }

        console.log(chalk.blue(`Found ${files.length} file(s) to analyze...`));
        const analyzer = new AIAnalyzer(options.apiKey, options.apiUrl);
        
        console.log(chalk.blue('Analyzing with AI...'));
        const result = await analyzer.analyzeDiff(files);

        const output = OutputFormatter.formatAnalysis(result, options.output);

        if (options.save) {
          const { writeFileSync } = await import('fs');
          writeFileSync(options.save, output);
          console.log(chalk.green(`Analysis saved to ${options.save}`));
        } else {
          console.log(output);
        }

      } catch (error) {
        console.error(chalk.red('Error:'), error instanceof Error ? error.message : String(error));
        process.exit(1);
      }
    });

  program
    .command('setup')
    .description('Setup the tool with API configuration')
    .action(() => {
      console.log(chalk.blue('Git Diff Reviewer Setup\n'));
      console.log('To use this tool, you need to set up an OpenAI API key:\n');
      console.log('1. Get an API key from https://platform.openai.com/api-keys');
      console.log('2. Set the environment variable:');
      console.log(chalk.green('   export OPENAI_API_KEY="your-api-key-here"'));
      console.log('3. Or use the --api-key option when running the tool\n');
      console.log('Example usage:');
      console.log(chalk.cyan('  git-diff-reviewer analyze'));
      console.log(chalk.cyan('  git-diff-reviewer analyze --staged'));
      console.log(chalk.cyan('  git-diff-reviewer analyze --commit HEAD~1'));
      console.log(chalk.cyan('  git-diff-reviewer analyze --range HEAD~3..HEAD'));
    });

  program.parse();
}

main().catch(error => {
  console.error(chalk.red('Unexpected error:'), error);
  process.exit(1);
});