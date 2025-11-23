#!/usr/bin/env tsx
/**
 * Migration Script from v1.x (v4 TypeScript) to v2.0.0
 *
 * This script helps migrate from the old MCP server to the new v2.0.0
 * with all advanced features.
 */

import { existsSync, readFileSync, writeFileSync, copyFileSync } from 'fs';
import { join } from 'path';

interface MigrationResult {
  success: boolean;
  errors: string[];
  warnings: string[];
  changes: string[];
}

class MigrationTool {
  private result: MigrationResult = {
    success: true,
    errors: [],
    warnings: [],
    changes: [],
  };

  /**
   * Run the migration
   */
  async migrate(): Promise<MigrationResult> {
    console.log('🔄 Starting migration from v1.x to v2.0.0...\n');

    // Step 1: Check .env file
    this.migrateEnvFile();

    // Step 2: Check package.json
    this.checkPackageJson();

    // Step 3: Backup old files
    this.backupOldFiles();

    // Step 4: Provide instructions
    this.provideInstructions();

    // Print results
    this.printResults();

    return this.result;
  }

  /**
   * Migrate .env file
   */
  private migrateEnvFile(): void {
    console.log('📝 Checking .env file...');

    const envPath = join(process.cwd(), '.env');
    const envExamplePath = join(process.cwd(), '.env.example');

    if (!existsSync(envPath)) {
      if (existsSync(envExamplePath)) {
        this.result.warnings.push('.env file not found, but .env.example exists');
        console.log('⚠️  .env file not found. Please copy .env.example to .env');
      } else {
        this.result.errors.push('.env file not found');
        this.result.success = false;
      }
      return;
    }

    const envContent = readFileSync(envPath, 'utf-8');
    const newEnvVars: string[] = [];

    // Check for new environment variables
    const newVars = [
      'HEALTHCHECK_PORT=3000',
      'LOG_PATH=./logs',
      'CACHE_TTL=300',
      'CACHE_CHECK_PERIOD=60',
      'RATE_LIMIT_PER_SECOND=10',
      'RATE_LIMIT_MAX_CONCURRENT=5',
      'RATE_LIMIT_QUEUE_SIZE=100',
      'RETRY_MAX_ATTEMPTS=3',
      'RETRY_INITIAL_DELAY=1000',
      'RETRY_MAX_DELAY=10000',
      'RETRY_BACKOFF_MULTIPLIER=2',
      'STREAMING_ENABLED=true',
      'STREAMING_POLL_INTERVAL=1000',
    ];

    for (const varLine of newVars) {
      const varName = varLine.split('=')[0];
      if (!envContent.includes(varName)) {
        newEnvVars.push(varLine);
      }
    }

    if (newEnvVars.length > 0) {
      const backupPath = `${envPath}.v1.backup`;
      copyFileSync(envPath, backupPath);
      this.result.changes.push(`Backed up .env to ${backupPath}`);

      const updatedEnv = envContent + '\n\n# v2.0.0 New Configuration\n' + newEnvVars.join('\n') + '\n';
      writeFileSync(envPath, updatedEnv);

      this.result.changes.push('Added new environment variables to .env');
      console.log(`✅ Added ${newEnvVars.length} new environment variables`);
    } else {
      console.log('✅ .env file is up to date');
    }
  }

  /**
   * Check package.json
   */
  private checkPackageJson(): void {
    console.log('\n📦 Checking package.json...');

    const packagePath = join(process.cwd(), 'package.json');
    if (!existsSync(packagePath)) {
      this.result.errors.push('package.json not found');
      this.result.success = false;
      return;
    }

    const packageJson = JSON.parse(readFileSync(packagePath, 'utf-8'));

    if (packageJson.version === '2.0.0') {
      console.log('✅ Already on v2.0.0');
    } else {
      this.result.warnings.push(`Current version: ${packageJson.version}, target: 2.0.0`);
      console.log(`⚠️  Current version: ${packageJson.version}`);
    }
  }

  /**
   * Backup old files
   */
  private backupOldFiles(): void {
    console.log('\n💾 Backing up old files...');

    const filesToBackup = [
      'src/types.ts',
      'src/n8nClient.ts',
    ];

    for (const file of filesToBackup) {
      const filePath = join(process.cwd(), file);
      if (existsSync(filePath)) {
        const backupPath = `${filePath}.v1.backup`;
        copyFileSync(filePath, backupPath);
        this.result.changes.push(`Backed up ${file} to ${backupPath}`);
        console.log(`✅ Backed up ${file}`);
      }
    }
  }

  /**
   * Provide migration instructions
   */
  private provideInstructions(): void {
    console.log('\n📋 Migration Instructions:\n');

    const instructions = [
      '1. Install new dependencies:',
      '   npm install',
      '',
      '2. Build the project:',
      '   npm run build',
      '',
      '3. Run tests to ensure everything works:',
      '   npm test',
      '',
      '4. Review the new features:',
      '   - 6 MCP tools (list, trigger, get, stop, create, update)',
      '   - Automatic retry with exponential backoff',
      '   - Local workflow cache with hash detection',
      '   - Real-time execution log streaming',
      '   - Intelligent rate limiting',
      '   - SystemJournal v2 structured logging',
      '',
      '5. Update your Claude Desktop config to use the new tools',
      '',
      '6. Optional: Run with Docker:',
      '   npm run docker:build',
      '   npm run docker:run',
      '',
      '7. Check health endpoint:',
      '   curl http://localhost:3000/health',
    ];

    instructions.forEach((line) => console.log(line));
  }

  /**
   * Print migration results
   */
  private printResults(): void {
    console.log('\n' + '='.repeat(60));
    console.log('📊 Migration Summary');
    console.log('='.repeat(60));

    console.log(`\n✅ Changes: ${this.result.changes.length}`);
    this.result.changes.forEach((change) => console.log(`   - ${change}`));

    if (this.result.warnings.length > 0) {
      console.log(`\n⚠️  Warnings: ${this.result.warnings.length}`);
      this.result.warnings.forEach((warning) => console.log(`   - ${warning}`));
    }

    if (this.result.errors.length > 0) {
      console.log(`\n❌ Errors: ${this.result.errors.length}`);
      this.result.errors.forEach((error) => console.log(`   - ${error}`));
    }

    console.log('\n' + '='.repeat(60));

    if (this.result.success) {
      console.log('✅ Migration completed successfully!');
      console.log('   Follow the instructions above to complete the setup.\n');
    } else {
      console.log('❌ Migration completed with errors.');
      console.log('   Please fix the errors before proceeding.\n');
      process.exit(1);
    }
  }
}

// Run migration
const migrationTool = new MigrationTool();
migrationTool.migrate().catch((error) => {
  console.error('❌ Migration failed:', error);
  process.exit(1);
});
