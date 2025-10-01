import axios, { AxiosInstance } from 'axios';

export interface JobData {
  name: string;
  description?: string;
  platform: string;
  test_type: string;
  test_config: Record<string, any>;
}

export interface Job {
  id: string;
  name: string;
  description?: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  platform: string;
  test_type: string;
  test_config: Record<string, any>;
  assigned_node_id?: string;
  started_at?: Date;
  completed_at?: Date;
  created_at: Date;
  updated_at: Date;
}

export class ApiClient {
  private client: AxiosInstance;
  private baseUrl: string;

  constructor(baseUrl?: string) {
    this.baseUrl = baseUrl || process.env.CROWD_FARM_API_URL || 'http://localhost:3000';
    
    this.client = axios.create({
      baseURL: `${this.baseUrl}/api/v1`,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'crowd-farm-cli/0.1.0'
      }
    });

    // Add request interceptor for logging in debug mode
    if (process.env.DEBUG) {
      this.client.interceptors.request.use(
        (config) => {
          console.log(`[API] ${config.method?.toUpperCase()} ${config.url}`);
          return config;
        },
        (error) => {
          console.error('[API] Request error:', error.message);
          return Promise.reject(error);
        }
      );
    }

    // Add response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => {
        return response;
      },
      (error) => {
        const errorMessage = error.response?.data?.error || error.message;
        throw new Error(`API Error: ${errorMessage}`);
      }
    );
  }

  async createJob(jobData: JobData): Promise<Job> {
    const response = await this.client.post('/jobs', jobData);
    return response.data;
  }

  async getJob(jobId: string): Promise<Job> {
    const response = await this.client.get(`/jobs/${jobId}`);
    return response.data;
  }

  async getJobs(limit: number = 50, offset: number = 0): Promise<{ jobs: Job[], pagination: any }> {
    const response = await this.client.get('/jobs', {
      params: { limit, offset }
    });
    return response.data;
  }

  async cancelJob(jobId: string): Promise<Job> {
    const response = await this.client.patch(`/jobs/${jobId}`, {
      status: 'cancelled'
    });
    return response.data;
  }

  async uploadFile(filePath: string, type: string): Promise<string> {
    const FormData = require('form-data');
    const fs = require('fs');
    
    const formData = new FormData();
    formData.append('file', fs.createReadStream(filePath));
    formData.append('type', type);

    const response = await this.client.post('/files/upload', formData, {
      headers: {
        ...formData.getHeaders(),
        'Content-Type': 'multipart/form-data'
      }
    });

    return response.data.file_path;
  }

  async getNodes(platform?: string): Promise<{ nodes: any[], total: number }> {
    const params = platform ? { platform } : {};
    const response = await this.client.get('/nodes', { params });
    return response.data;
  }

  async getNode(nodeId: string): Promise<any> {
    const response = await this.client.get(`/nodes/${nodeId}`);
    return response.data;
  }

  async healthCheck(): Promise<{ status: string, timestamp: string, version: string }> {
    const response = await this.client.get('/health');
    return response.data;
  }
}

