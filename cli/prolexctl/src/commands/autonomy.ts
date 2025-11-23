/**
 * Autonomy commands - Manage Prolex autonomy level
 */

import chalk from 'chalk';
import { readFileSync, writeFileSync } from 'fs';
import inquirer from 'inquirer';
import { join } from 'path';

const AUTONOMY_CONFIG_PATH = join(process.cwd(), 'config/autonomy.yml');

export const autonomyCommand = {
  async get() {
    try {
      const config = readFileSync(AUTONOMY_CONFIG_PATH, 'utf-8');
      const match = config.match(/prolex_current_autonomy_level:\s*(\d+)/);

      if (!match) {
        console.error(chalk.red('Error: Could not parse autonomy level from config'));
        process.exit(1);
      }

      const level = parseInt(match[1]);
      const levelNames = ['Read-only', 'Read + Logs', 'Low-risk actions', 'Advanced actions'];

      console.log(chalk.bold('\n🤖 Prolex Autonomy Level\n'));
      console.log(`Current Level: ${chalk.cyan(level)} (${levelNames[level]})`);
      console.log('');
      console.log(chalk.dim('Levels:'));
      console.log(chalk.dim('  0: Read-only (no actions)'));
      console.log(chalk.dim('  1: Read + Logs (logging only)'));
      console.log(chalk.dim('  2: Low-risk actions (daily use)'));
      console.log(chalk.dim('  3: Advanced actions (sandbox + high-risk)'));
      console.log('');
    } catch (error) {
      console.error(chalk.red('Error reading autonomy config:'), (error as Error).message);
      process.exit(1);
    }
  },

  async set(level: string, options: { force?: boolean }) {
    const levelNum = parseInt(level);

    if (isNaN(levelNum) || levelNum < 0 || levelNum > 3) {
      console.error(chalk.red('Error: Level must be between 0 and 3'));
      process.exit(1);
    }

    const levelNames = [
      'Read-only (no actions)',
      'Read + Logs (logging only)',
      'Low-risk actions (daily use)',
      'Advanced actions (sandbox + high-risk)',
    ];

    console.log(chalk.yellow(`\n⚠️  You are about to change autonomy level to: ${levelNum}`));
    console.log(chalk.dim(`   (${levelNames[levelNum]})\n`));

    if (!options.force) {
      const answers = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'confirm',
          message: 'Are you sure you want to proceed?',
          default: false,
        },
      ]);

      if (!answers.confirm) {
        console.log(chalk.gray('Operation cancelled'));
        process.exit(0);
      }
    }

    try {
      let config = readFileSync(AUTONOMY_CONFIG_PATH, 'utf-8');

      // Replace autonomy level
      config = config.replace(
        /prolex_current_autonomy_level:\s*\d+/,
        `prolex_current_autonomy_level: ${levelNum}`
      );

      writeFileSync(AUTONOMY_CONFIG_PATH, config);

      console.log(chalk.green(`\n✓ Autonomy level set to ${levelNum}`));
      console.log(chalk.dim('  Changes will take effect on next Prolex restart'));
    } catch (error) {
      console.error(chalk.red('Error writing autonomy config:'), (error as Error).message);
      process.exit(1);
    }
  },
};
