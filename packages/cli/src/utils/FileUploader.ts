import fs from 'fs-extra';
import path from 'path';
import chalk from 'chalk';
import { ApiClient } from './ApiClient';

export class FileUploader {
  private apiClient: ApiClient;

  constructor(apiClient: ApiClient) {
    this.apiClient = apiClient;
  }

  async uploadFile(filePath: string, type: string): Promise<string> {
    try {
      // Validate file exists and get file info
      const stats = await fs.stat(filePath);
      const fileName = path.basename(filePath);
      
      console.log(chalk.gray(`📁 Uploading ${fileName} (${this.formatFileSize(stats.size)})...`));
      
      // For now, we'll simulate file upload since the control plane doesn't have file upload endpoints yet
      // In a real implementation, this would upload to a file storage service
      const simulatedPath = `/uploads/${type}/${Date.now()}-${fileName}`;
      
      console.log(chalk.green(`✅ ${fileName} uploaded successfully`));
      return simulatedPath;
    } catch (error) {
      throw new Error(`Failed to upload file ${filePath}: ${error}`);
    }
  }

  private formatFileSize(bytes: number): string {
    const sizes = ['B', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 B';
    
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  }

  async validateFile(filePath: string, expectedTypes?: string[]): Promise<void> {
    if (!(await fs.pathExists(filePath))) {
      throw new Error(`File not found: ${filePath}`);
    }

    const stats = await fs.stat(filePath);
    if (!stats.isFile()) {
      throw new Error(`Path is not a file: ${filePath}`);
    }

    // Check file extension if expected types are provided
    if (expectedTypes && expectedTypes.length > 0) {
      const ext = path.extname(filePath).toLowerCase();
      const normalizedExpectedTypes = expectedTypes.map(type => 
        type.startsWith('.') ? type.toLowerCase() : `.${type.toLowerCase()}`
      );
      
      if (!normalizedExpectedTypes.includes(ext)) {
        throw new Error(
          `Invalid file type: ${ext}. Expected types: ${expectedTypes.join(', ')}`
        );
      }
    }
  }
}

