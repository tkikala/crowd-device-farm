import * as cron from 'node-cron';
import { ControlPlaneClient } from './services/ControlPlaneClient';
import { NodeManager } from './services/NodeManager';
import config from './config/config';

class NodeAgent {
  private controlPlaneClient: ControlPlaneClient;
  private nodeManager: NodeManager;
  private heartbeatTask: cron.ScheduledTask | null = null;
  private isRegistered: boolean = false;

  constructor() {
    this.controlPlaneClient = new ControlPlaneClient();
    this.nodeManager = new NodeManager();
  }

  async start(): Promise<void> {
    console.log('🚀 Starting Crowd Farm Node Agent...');
    console.log(`📱 Platform: ${config.node.platform}`);
    console.log(`🖥️  Hostname: ${config.node.hostname}`);
    console.log(`🌐 IP Address: ${config.node.ipAddress}`);

    try {
      // Register with control plane
      await this.registerWithControlPlane();
      
      // Start heartbeat
      this.startHeartbeat();
      
      // Start capability refresh task
      this.startCapabilityRefresh();
      
      console.log('✅ Node Agent started successfully');
    } catch (error) {
      console.error('❌ Failed to start Node Agent:', error);
      process.exit(1);
    }
  }

  private async registerWithControlPlane(): Promise<void> {
    try {
      const capabilities = this.nodeManager.getCapabilities();
      const nodeId = await this.controlPlaneClient.registerNode(capabilities);
      
      this.isRegistered = true;
      console.log(`✅ Registered with Control Plane. Node ID: ${nodeId}`);
    } catch (error) {
      console.error('❌ Failed to register with Control Plane:', error);
      throw error;
    }
  }

  private startHeartbeat(): void {
    const intervalSeconds = Math.floor(config.heartbeat.interval / 1000);
    
    this.heartbeatTask = cron.schedule(`*/${intervalSeconds} * * * * *`, async () => {
      try {
        await this.sendHeartbeat();
      } catch (error) {
        console.error('❌ Heartbeat failed:', error);
        
        // If we get multiple heartbeat failures, try to re-register
        if (!this.isRegistered) {
          console.log('🔄 Attempting to re-register with Control Plane...');
          try {
            await this.registerWithControlPlane();
          } catch (reRegisterError) {
            console.error('❌ Re-registration failed:', reRegisterError);
          }
        }
      }
    });

    console.log(`💓 Heartbeat started (every ${intervalSeconds} seconds)`);
  }

  private startCapabilityRefresh(): void {
    // Refresh capabilities every 5 minutes
    cron.schedule('*/5 * * * *', async () => {
      try {
        await this.nodeManager.refreshCapabilities();
        console.log('🔄 Capabilities refreshed');
      } catch (error) {
        console.error('❌ Failed to refresh capabilities:', error);
      }
    });

    console.log('🔄 Capability refresh scheduled (every 5 minutes)');
  }

  private async sendHeartbeat(): Promise<void> {
    if (!this.isRegistered) {
      return;
    }

    try {
      const capabilities = this.nodeManager.getCapabilities();
      await this.controlPlaneClient.sendHeartbeat('online', capabilities);
      console.log('💓 Heartbeat sent successfully');
    } catch (error) {
      console.error('❌ Heartbeat failed:', error);
      this.isRegistered = false;
      throw error;
    }
  }

  async stop(): Promise<void> {
    console.log('🛑 Stopping Node Agent...');
    
    if (this.heartbeatTask) {
      this.heartbeatTask.stop();
      this.heartbeatTask = null;
    }

    // Send final heartbeat with offline status
    try {
      if (this.isRegistered) {
        await this.controlPlaneClient.sendHeartbeat('offline');
        console.log('📤 Final heartbeat sent');
      }
    } catch (error) {
      console.error('❌ Failed to send final heartbeat:', error);
    }

    console.log('✅ Node Agent stopped');
  }
}

// Handle graceful shutdown
const nodeAgent = new NodeAgent();

process.on('SIGINT', async () => {
  console.log('\n🛑 Received SIGINT, shutting down gracefully...');
  await nodeAgent.stop();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n🛑 Received SIGTERM, shutting down gracefully...');
  await nodeAgent.stop();
  process.exit(0);
});

// Start the agent
nodeAgent.start().catch((error) => {
  console.error('❌ Failed to start Node Agent:', error);
  process.exit(1);
});

