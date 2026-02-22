#!/usr/bin/env ts-node

/**
 * Bloom QA Agent
 *
 * An automated code quality and QA agent powered by Claude AI.
 * It reviews the codebase for:
 * - TypeScript type safety issues
 * - React Native best practices
 * - Security vulnerabilities (API key exposure, injection risks)
 * - Accessibility compliance
 * - Performance anti-patterns
 * - Data accuracy in health/medical content
 * - UI/UX consistency
 *
 * Usage:
 *   npx ts-node index.ts              # Standard review
 *   npx ts-node index.ts --quick      # Quick review (fewer files)
 *   npx ts-node index.ts --full       # Full comprehensive review
 *   npx ts-node index.ts --file <path> # Review a specific file
 */

import Anthropic from '@anthropic-ai/sdk';
import * as fs from 'fs';
import * as path from 'path';
import dotenv from 'dotenv';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const client = new Anthropic();

// ─── Configuration ───────────────────────────────────────────────

const PROJECT_ROOT = path.resolve(__dirname, '..');

const FILE_PATTERNS = {
  quick: ['app/(tabs)/*.tsx', 'server/routes/*.ts'],
  standard: [
    'app/**/*.tsx',
    'src/**/*.ts',
    'server/**/*.ts',
  ],
  full: [
    'app/**/*.tsx',
    'src/**/*.ts',
    'server/**/*.ts',
    'qa-agent/**/*.ts',
  ],
};

interface ReviewResult {
  file: string;
  category: string;
  severity: 'critical' | 'warning' | 'suggestion' | 'info';
  message: string;
  line?: number;
  fix?: string;
}

interface QAReport {
  timestamp: string;
  mode: string;
  filesReviewed: number;
  results: ReviewResult[];
  summary: {
    critical: number;
    warnings: number;
    suggestions: number;
    info: number;
  };
  overallScore: string;
}

// ─── File Discovery ─────────────────────────────────────────────

function findFiles(baseDir: string, patterns: string[]): string[] {
  const files: string[] = [];

  function walkDir(dir: string): void {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        if (!['node_modules', '.git', 'dist', '.expo', 'ios', 'android'].includes(entry.name)) {
          walkDir(fullPath);
        }
      } else if (entry.isFile() && (entry.name.endsWith('.ts') || entry.name.endsWith('.tsx'))) {
        files.push(fullPath);
      }
    }
  }

  walkDir(baseDir);
  return files;
}

// ─── Review Prompts ─────────────────────────────────────────────

const REVIEW_SYSTEM_PROMPT = `You are an expert QA engineer reviewing a React Native + TypeScript mobile app
called "Bloom" — a postpartum care application. Your review must be thorough, actionable, and prioritized.

Review each file for these categories:

1. **TYPE SAFETY**: Missing types, any usage, unsafe casts, potential null/undefined errors
2. **SECURITY**: API key exposure, injection vulnerabilities, insecure data storage, privacy concerns
3. **REACT NATIVE BEST PRACTICES**: Performance (unnecessary re-renders, large lists without virtualization),
   platform-specific issues, navigation patterns, state management
4. **ACCESSIBILITY**: Missing accessibility labels, touch target sizes, screen reader support, color contrast
5. **MEDICAL CONTENT ACCURACY**: Ensure health information is presented with appropriate disclaimers,
   crisis resources are correct and up-to-date, no content could be interpreted as medical diagnosis
6. **CODE QUALITY**: Dead code, inconsistent patterns, missing error handling, unclear naming
7. **UX CONSISTENCY**: Inconsistent styling, missing loading/error states, navigation edge cases

For each issue found, provide:
- The file path
- The category (from the list above)
- Severity: critical (must fix), warning (should fix), suggestion (nice to have), info (informational)
- A clear description of the issue
- The approximate line number if applicable
- A suggested fix if applicable

Respond ONLY with a valid JSON array of objects matching this schema:
{
  "file": "string",
  "category": "string",
  "severity": "critical|warning|suggestion|info",
  "message": "string",
  "line": number|null,
  "fix": "string|null"
}`;

// ─── Review Execution ───────────────────────────────────────────

async function reviewFiles(files: string[]): Promise<ReviewResult[]> {
  const allResults: ReviewResult[] = [];

  // Process files in batches to manage context window
  const BATCH_SIZE = 5;
  for (let i = 0; i < files.length; i += BATCH_SIZE) {
    const batch = files.slice(i, i + BATCH_SIZE);
    const batchContent = batch
      .map((file) => {
        const content = fs.readFileSync(file, 'utf-8');
        const relativePath = path.relative(PROJECT_ROOT, file);
        return `--- FILE: ${relativePath} ---\n${content}\n--- END FILE ---`;
      })
      .join('\n\n');

    console.log(
      `  Reviewing batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(files.length / BATCH_SIZE)}: ${batch.map((f) => path.relative(PROJECT_ROOT, f)).join(', ')}`
    );

    try {
      const response = await client.messages.create({
        model: 'claude-opus-4-6',
        max_tokens: 8192,
        thinking: { type: 'adaptive' },
        system: REVIEW_SYSTEM_PROMPT,
        messages: [
          {
            role: 'user',
            content: `Review the following files from the Bloom postpartum care app:\n\n${batchContent}`,
          },
        ],
      });

      const textBlock = response.content.find((block) => block.type === 'text');
      if (textBlock && textBlock.type === 'text') {
        // Extract JSON from the response (handle markdown code blocks)
        let jsonText = textBlock.text;
        const jsonMatch = jsonText.match(/```(?:json)?\s*([\s\S]*?)```/);
        if (jsonMatch) {
          jsonText = jsonMatch[1];
        }

        const results: ReviewResult[] = JSON.parse(jsonText.trim());
        allResults.push(...results);
      }
    } catch (error) {
      console.error(`  Error reviewing batch: ${error}`);
    }
  }

  return allResults;
}

// ─── Report Generation ──────────────────────────────────────────

function generateReport(results: ReviewResult[], mode: string, filesReviewed: number): QAReport {
  const summary = {
    critical: results.filter((r) => r.severity === 'critical').length,
    warnings: results.filter((r) => r.severity === 'warning').length,
    suggestions: results.filter((r) => r.severity === 'suggestion').length,
    info: results.filter((r) => r.severity === 'info').length,
  };

  let overallScore: string;
  if (summary.critical > 0) {
    overallScore = 'NEEDS ATTENTION - Critical issues found';
  } else if (summary.warnings > 3) {
    overallScore = 'FAIR - Several warnings to address';
  } else if (summary.warnings > 0) {
    overallScore = 'GOOD - Minor improvements recommended';
  } else {
    overallScore = 'EXCELLENT - Code quality is strong';
  }

  return {
    timestamp: new Date().toISOString(),
    mode,
    filesReviewed,
    results,
    summary,
    overallScore,
  };
}

function printReport(report: QAReport): void {
  console.log('\n' + '='.repeat(60));
  console.log('  BLOOM QA REPORT');
  console.log('='.repeat(60));
  console.log(`  Timestamp:      ${report.timestamp}`);
  console.log(`  Mode:           ${report.mode}`);
  console.log(`  Files Reviewed: ${report.filesReviewed}`);
  console.log(`  Overall:        ${report.overallScore}`);
  console.log('-'.repeat(60));
  console.log(`  Critical:    ${report.summary.critical}`);
  console.log(`  Warnings:    ${report.summary.warnings}`);
  console.log(`  Suggestions: ${report.summary.suggestions}`);
  console.log(`  Info:        ${report.summary.info}`);
  console.log('='.repeat(60));

  // Print critical and warnings with detail
  const important = report.results.filter(
    (r) => r.severity === 'critical' || r.severity === 'warning'
  );

  if (important.length > 0) {
    console.log('\n  ISSUES TO ADDRESS:');
    console.log('-'.repeat(60));
    for (const result of important) {
      const severity = result.severity === 'critical' ? '[CRITICAL]' : '[WARNING] ';
      console.log(`\n  ${severity} ${result.file}${result.line ? `:${result.line}` : ''}`);
      console.log(`  Category: ${result.category}`);
      console.log(`  ${result.message}`);
      if (result.fix) {
        console.log(`  Fix: ${result.fix}`);
      }
    }
  }

  // Print suggestions summary
  const suggestions = report.results.filter((r) => r.severity === 'suggestion');
  if (suggestions.length > 0) {
    console.log('\n  SUGGESTIONS:');
    console.log('-'.repeat(60));
    for (const result of suggestions) {
      console.log(`  - [${result.file}] ${result.message}`);
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('  Report saved to: qa-report.json');
  console.log('='.repeat(60) + '\n');
}

// ─── Main ───────────────────────────────────────────────────────

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  let mode = 'standard';
  let specificFile: string | null = null;

  if (args.includes('--quick')) mode = 'quick';
  if (args.includes('--full')) mode = 'full';

  const fileIdx = args.indexOf('--file');
  if (fileIdx !== -1 && args[fileIdx + 1]) {
    specificFile = args[fileIdx + 1];
  }

  console.log('\n  Bloom QA Agent');
  console.log(`  Mode: ${mode}\n`);

  let files: string[];
  if (specificFile) {
    const fullPath = path.resolve(PROJECT_ROOT, specificFile);
    if (!fs.existsSync(fullPath)) {
      console.error(`  File not found: ${specificFile}`);
      process.exit(1);
    }
    files = [fullPath];
  } else {
    console.log('  Discovering files...');
    files = findFiles(PROJECT_ROOT, FILE_PATTERNS[mode as keyof typeof FILE_PATTERNS]);
    console.log(`  Found ${files.length} files to review.\n`);
  }

  if (files.length === 0) {
    console.log('  No files found to review.');
    process.exit(0);
  }

  console.log('  Starting review...\n');
  const results = await reviewFiles(files);

  const report = generateReport(results, mode, files.length);
  printReport(report);

  // Save report to file
  const reportPath = path.join(PROJECT_ROOT, 'qa-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
}

main().catch(console.error);
