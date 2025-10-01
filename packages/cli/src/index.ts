#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import { runCommand } from './commands/run';
import { statusCommand } from './commands/status';
import { nodesCommand } from './commands/nodes';

const program = new Command();

program
  .name('crowdtest')
  .description('Crowd Device Farm CLI - Run automated tests on real and virtual devices')
  .version('0.1.0')
  .addCommand(runCommand)
  .addCommand(statusCommand)
  .addCommand(nodesCommand);

// Global error handler
program.exitOverride();

try {
  program.parse();
} catch (error: any) {
  console.error(chalk.red.bold('❌ Error:'), error.message);
  process.exit(1);
}

