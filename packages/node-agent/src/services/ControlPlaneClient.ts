import axios, { AxiosInstance, AxiosResponse } from 'axios';
import config from '../config/config';
import { NodeCapabilities } from '../types/NodeCapabilities';

export class ControlPlaneClient {
  private client: AxiosInstance;
  private nodeId: string | null = null;

  constructor() {
    const baseURL = `${config.controlPlane.url}${config.controlPlane.apiPrefix}/${config.controlPlane.apiVersion}`;
    
    this.client = axios.create({
      baseURL,
      timeout: config.heartbeat.timeout,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'crowd-farm-node-agent/0.1.0'
      }
    });

    // Add request interceptor for logging
    this.client.interceptors.request.use(
      (config) => {
        console.log(`[ControlPlane] ${config.method?.toUpperCase()} ${config.url}`);
        return config;
      },
      (error) => {
        console.error('[ControlPlane] Request error:', error.message);
        return Promise.reject(error);
      }
    );

    // Add response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => {
        return response;
      },
      (error) => {
        console.error(`[ControlPlane] Response error:`, {
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data,
          message: error.message
        });
        return Promise.reject(error);
      }
    );
  }

  async registerNode(capabilities: NodeCapabilities): Promise<string> {
    try {
      const response: AxiosResponse = await this.client.post('/nodes/register', {
        name: config.node.name,
        hostname: config.node.hostname,
        ip_address: config.node.ipAddress,
        platform: config.node.platform,
        os_version: config.node.osVersion,
        architecture: config.node.architecture,
        capabilities
      });

      this.nodeId = response.data.id;
      console.log(`[ControlPlane] Node registered successfully with ID: ${this.nodeId}`);
      return this.nodeId;
    } catch (error: any) {
      console.error('[ControlPlane] Failed to register node:', error.message);
      throw error;
    }
  }

  async sendHeartbeat(status?: string, capabilities?: NodeCapabilities): Promise<void> {
    if (!this.nodeId) {
      throw new Error('Node not registered. Call registerNode() first.');
    }

    try {
      await this.client.post(`/nodes/${this.nodeId}/heartbeat`, {
        status,
        capabilities
      });
      console.log(`[ControlPlane] Heartbeat sent successfully`);
    } catch (error: any) {
      console.error('[ControlPlane] Failed to send heartbeat:', error.message);
      throw error;
    }
  }

  async getNodeInfo(): Promise<any> {
    if (!this.nodeId) {
      throw new Error('Node not registered. Call registerNode() first.');
    }

    try {
      const response: AxiosResponse = await this.client.get(`/nodes/${this.nodeId}`);
      return response.data;
    } catch (error: any) {
      console.error('[ControlPlane] Failed to get node info:', error.message);
      throw error;
    }
  }

  getNodeId(): string | null {
    return this.nodeId;
  }

  setNodeId(nodeId: string): void {
    this.nodeId = nodeId;
  }
}

