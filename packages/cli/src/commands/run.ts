import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import fs from 'fs-extra';
import path from 'path';
import { ApiClient } from '../utils/ApiClient';
import { FileUploader } from '../utils/FileUploader';

interface RunOptions {
  apk: string;
  tests: string;
  platform: string;
  testType: string;
  name: string;
  description?: string;
  timeout?: number;
  config?: string;
}

export const runCommand = new Command('run')
  .description('Run automated tests on the crowd device farm')
  .option('-a, --apk <path>', 'Path to the APK file')
  .option('-t, --tests <path>', 'Path to the test APK file')
  .option('-p, --platform <platform>', 'Target platform', 'android')
  .option('--test-type <type>', 'Type of tests to run', 'e2e')
  .option('-n, --name <name>', 'Job name')
  .option('-d, --description <description>', 'Job description')
  .option('--timeout <seconds>', 'Test timeout in seconds', '300')
  .option('-c, --config <path>', 'Path to test configuration file')
  .action(async (options: RunOptions) => {
    try {
      console.log(chalk.blue.bold('🚀 Crowd Device Farm - Test Runner'));
      console.log(chalk.gray('=====================================\n'));

      // Validate inputs
      await validateOptions(options);

      // Initialize API client
      const apiClient = new ApiClient();
      const fileUploader = new FileUploader(apiClient);

      // Upload files
      const spinner = ora('Uploading test files...').start();
      
      let apkPath: string | undefined;
      let testApkPath: string | undefined;

      if (options.apk) {
        apkPath = await fileUploader.uploadFile(options.apk, 'apk');
        spinner.text = 'APK uploaded, uploading test APK...';
      }

      if (options.tests) {
        testApkPath = await fileUploader.uploadFile(options.tests, 'test_apk');
      }

      spinner.succeed('Files uploaded successfully');

      // Create job
      const createJobSpinner = ora('Creating test job...').start();

      const jobData = {
        name: options.name || `Test Job - ${new Date().toISOString()}`,
        description: options.description,
        platform: options.platform,
        test_type: options.testType,
        test_config: {
          apk_path: apkPath,
          test_apk_path: testApkPath,
          timeout: parseInt(options.timeout || '300', 10),
          ...(options.config ? await loadConfigFile(options.config) : {})
        }
      };

      const job = await apiClient.createJob(jobData);
      createJobSpinner.succeed(`Job created: ${job.id}`);

      // Monitor job
      await monitorJob(apiClient, job.id);

    } catch (error: any) {
      console.error(chalk.red.bold('❌ Error:'), error.message);
      process.exit(1);
    }
  });

async function validateOptions(options: RunOptions): Promise<void> {
  // Check if at least one file is provided
  if (!options.apk && !options.tests) {
    throw new Error('At least one of --apk or --tests must be provided');
  }

  // Validate file paths
  if (options.apk && !(await fs.pathExists(options.apk))) {
    throw new Error(`APK file not found: ${options.apk}`);
  }

  if (options.tests && !(await fs.pathExists(options.tests))) {
    throw new Error(`Test APK file not found: ${options.tests}`);
  }

  // Validate platform
  const validPlatforms = ['android', 'ios', 'windows', 'linux', 'macos'];
  if (!validPlatforms.includes(options.platform)) {
    throw new Error(`Invalid platform: ${options.platform}. Valid platforms: ${validPlatforms.join(', ')}`);
  }

  // Validate test type
  const validTestTypes = ['unit', 'integration', 'e2e', 'performance'];
  if (!validTestTypes.includes(options.testType)) {
    throw new Error(`Invalid test type: ${options.testType}. Valid types: ${validTestTypes.join(', ')}`);
  }
}

async function loadConfigFile(configPath: string): Promise<any> {
  if (!(await fs.pathExists(configPath))) {
    throw new Error(`Configuration file not found: ${configPath}`);
  }

  const ext = path.extname(configPath).toLowerCase();
  
  try {
    if (ext === '.json') {
      return await fs.readJson(configPath);
    } else if (ext === '.yaml' || ext === '.yml') {
      // In a real implementation, you would use a YAML parser
      throw new Error('YAML configuration files are not yet supported');
    } else {
      throw new Error(`Unsupported configuration file format: ${ext}`);
    }
  } catch (error) {
    throw new Error(`Failed to load configuration file: ${error}`);
  }
}

async function monitorJob(apiClient: ApiClient, jobId: string): Promise<void> {
  const spinner = ora('Waiting for job to start...').start();
  
  let lastStatus = 'pending';
  const startTime = Date.now();

  while (true) {
    try {
      const job = await apiClient.getJob(jobId);
      
      if (job.status !== lastStatus) {
        switch (job.status) {
          case 'pending':
            spinner.text = 'Job is pending...';
            break;
          case 'running':
            spinner.text = 'Job is running...';
            break;
          case 'completed':
            spinner.succeed(chalk.green.bold('✅ Job completed successfully!'));
            console.log(chalk.gray(`Job ID: ${jobId}`));
            console.log(chalk.gray(`Duration: ${Math.round((Date.now() - startTime) / 1000)}s`));
            return;
          case 'failed':
            spinner.fail(chalk.red.bold('❌ Job failed'));
            console.log(chalk.gray(`Job ID: ${jobId}`));
            console.log(chalk.gray(`Duration: ${Math.round((Date.now() - startTime) / 1000)}s`));
            return;
          case 'cancelled':
            spinner.warn(chalk.yellow.bold('⚠️  Job was cancelled'));
            console.log(chalk.gray(`Job ID: ${jobId}`));
            return;
        }
        lastStatus = job.status;
      }

      // Wait before next check
      await new Promise(resolve => setTimeout(resolve, 2000));
    } catch (error) {
      spinner.fail('Failed to check job status');
      throw error;
    }
  }
}

