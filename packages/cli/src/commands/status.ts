import { Command } from 'commander';
import chalk from 'chalk';
import { ApiClient } from '../utils/ApiClient';

export const statusCommand = new Command('status')
  .description('Check the status of a job or the system')
  .option('-j, --job-id <id>', 'Check status of a specific job')
  .option('-l, --list', 'List recent jobs')
  .option('--health', 'Check system health')
  .action(async (options) => {
    try {
      const apiClient = new ApiClient();

      if (options.health) {
        await checkSystemHealth(apiClient);
      } else if (options.jobId) {
        await checkJobStatus(apiClient, options.jobId);
      } else if (options.list) {
        await listJobs(apiClient);
      } else {
        // Default: check system health
        await checkSystemHealth(apiClient);
      }
    } catch (error: any) {
      console.error(chalk.red.bold('❌ Error:'), error.message);
      process.exit(1);
    }
  });

async function checkSystemHealth(apiClient: ApiClient): Promise<void> {
  console.log(chalk.blue.bold('🏥 System Health Check'));
  console.log(chalk.gray('========================\n'));

  try {
    const health = await apiClient.healthCheck();
    console.log(chalk.green.bold('✅ System is healthy'));
    console.log(chalk.gray(`Status: ${health.status}`));
    console.log(chalk.gray(`Version: ${health.version}`));
    console.log(chalk.gray(`Timestamp: ${health.timestamp}`));

    // Also check available nodes
    const nodes = await apiClient.getNodes();
    console.log(chalk.gray(`\nAvailable nodes: ${nodes.total}`));
    
    if (nodes.nodes.length > 0) {
      console.log(chalk.gray('Node status:'));
      nodes.nodes.forEach((node: any) => {
        const statusColor = node.status === 'online' ? chalk.green : 
                           node.status === 'busy' ? chalk.yellow : chalk.red;
        console.log(chalk.gray(`  - ${node.name} (${node.platform}): ${statusColor(node.status)}`));
      });
    }
  } catch (error: any) {
    console.log(chalk.red.bold('❌ System is unhealthy'));
    console.log(chalk.red(`Error: ${error.message}`));
  }
}

async function checkJobStatus(apiClient: ApiClient, jobId: string): Promise<void> {
  console.log(chalk.blue.bold(`📊 Job Status: ${jobId}`));
  console.log(chalk.gray('=====================\n'));

  try {
    const job = await apiClient.getJob(jobId);
    
    const statusColor = {
      pending: chalk.yellow,
      running: chalk.blue,
      completed: chalk.green,
      failed: chalk.red,
      cancelled: chalk.gray
    }[job.status] || chalk.white;

    console.log(chalk.gray(`Name: ${job.name}`));
    console.log(chalk.gray(`Status: ${statusColor(job.status)}`));
    console.log(chalk.gray(`Platform: ${job.platform}`));
    console.log(chalk.gray(`Test Type: ${job.test_type}`));
    
    if (job.description) {
      console.log(chalk.gray(`Description: ${job.description}`));
    }
    
    if (job.assigned_node_id) {
      console.log(chalk.gray(`Assigned Node: ${job.assigned_node_id}`));
    }
    
    console.log(chalk.gray(`Created: ${new Date(job.created_at).toLocaleString()}`));
    
    if (job.started_at) {
      console.log(chalk.gray(`Started: ${new Date(job.started_at).toLocaleString()}`));
    }
    
    if (job.completed_at) {
      console.log(chalk.gray(`Completed: ${new Date(job.completed_at).toLocaleString()}`));
    }
  } catch (error: any) {
    console.log(chalk.red.bold('❌ Failed to get job status'));
    console.log(chalk.red(`Error: ${error.message}`));
  }
}

async function listJobs(apiClient: ApiClient): Promise<void> {
  console.log(chalk.blue.bold('📋 Recent Jobs'));
  console.log(chalk.gray('===============\n'));

  try {
    const result = await apiClient.getJobs(20, 0);
    
    if (result.jobs.length === 0) {
      console.log(chalk.gray('No jobs found'));
      return;
    }

    console.log(chalk.gray(`Showing ${result.jobs.length} recent jobs:\n`));
    
    result.jobs.forEach((job: any) => {
      const statusColor = {
        pending: chalk.yellow,
        running: chalk.blue,
        completed: chalk.green,
        failed: chalk.red,
        cancelled: chalk.gray
      }[job.status] || chalk.white;

      console.log(chalk.gray(`ID: ${job.id}`));
      console.log(chalk.gray(`Name: ${job.name}`));
      console.log(chalk.gray(`Status: ${statusColor(job.status)}`));
      console.log(chalk.gray(`Platform: ${job.platform}`));
      console.log(chalk.gray(`Created: ${new Date(job.created_at).toLocaleString()}`));
      console.log(chalk.gray('---'));
    });
  } catch (error: any) {
    console.log(chalk.red.bold('❌ Failed to list jobs'));
    console.log(chalk.red(`Error: ${error.message}`));
  }
}

