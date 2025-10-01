import { Command } from 'commander';
import chalk from 'chalk';
import { ApiClient } from '../utils/ApiClient';

export const nodesCommand = new Command('nodes')
  .description('Manage and view nodes in the device farm')
  .option('-l, --list', 'List all available nodes')
  .option('-p, --platform <platform>', 'Filter nodes by platform')
  .option('-s, --status <status>', 'Filter nodes by status')
  .action(async (options) => {
    try {
      const apiClient = new ApiClient();
      await listNodes(apiClient, options);
    } catch (error: any) {
      console.error(chalk.red.bold('❌ Error:'), error.message);
      process.exit(1);
    }
  });

async function listNodes(apiClient: ApiClient, options: any): Promise<void> {
  console.log(chalk.blue.bold('🖥️  Available Nodes'));
  console.log(chalk.gray('===================\n'));

  try {
    const result = await apiClient.getNodes(options.platform);
    
    if (result.nodes.length === 0) {
      console.log(chalk.gray('No nodes found'));
      if (options.platform) {
        console.log(chalk.gray(`Filter: platform = ${options.platform}`));
      }
      return;
    }

    // Filter by status if specified
    let filteredNodes = result.nodes;
    if (options.status) {
      filteredNodes = result.nodes.filter((node: any) => 
        node.status.toLowerCase() === options.status.toLowerCase()
      );
    }

    console.log(chalk.gray(`Found ${filteredNodes.length} node(s):\n`));
    
    filteredNodes.forEach((node: any) => {
      const statusColors = {
        online: chalk.green,
        busy: chalk.yellow,
        offline: chalk.red,
        maintenance: chalk.blue
      };
      const statusColor = statusColors[node.status as keyof typeof statusColors] || chalk.white;

      const lastHeartbeat = node.last_heartbeat 
        ? new Date(node.last_heartbeat).toLocaleString()
        : 'Never';

      console.log(chalk.gray(`ID: ${node.id}`));
      console.log(chalk.gray(`Name: ${node.name}`));
      console.log(chalk.gray(`Hostname: ${node.hostname}`));
      console.log(chalk.gray(`IP: ${node.ip_address}`));
      console.log(chalk.gray(`Platform: ${node.platform}`));
      console.log(chalk.gray(`OS: ${node.os_version}`));
      console.log(chalk.gray(`Architecture: ${node.architecture}`));
      console.log(chalk.gray(`Status: ${statusColor(node.status)}`));
      console.log(chalk.gray(`Last Heartbeat: ${lastHeartbeat}`));
      
      if (node.capabilities && Object.keys(node.capabilities).length > 0) {
        console.log(chalk.gray(`Capabilities:`));
        Object.entries(node.capabilities).forEach(([key, value]) => {
          if (typeof value === 'object' && value !== null) {
            console.log(chalk.gray(`  ${key}: ${JSON.stringify(value, null, 2).split('\n').join('\n  ')}`));
          } else {
            console.log(chalk.gray(`  ${key}: ${value}`));
          }
        });
      }
      
      console.log(chalk.gray('---'));
    });

    // Summary
    const statusCounts = filteredNodes.reduce((counts: any, node: any) => {
      counts[node.status] = (counts[node.status] || 0) + 1;
      return counts;
    }, {});

    console.log(chalk.gray('\nSummary:'));
    Object.entries(statusCounts).forEach(([status, count]) => {
      const statusColor = {
        online: chalk.green,
        busy: chalk.yellow,
        offline: chalk.red,
        maintenance: chalk.blue
      }[status] || chalk.white;
      
      console.log(chalk.gray(`  ${statusColor(status)}: ${count}`));
    });

  } catch (error: any) {
    console.log(chalk.red.bold('❌ Failed to list nodes'));
    console.log(chalk.red(`Error: ${error.message}`));
  }
}

