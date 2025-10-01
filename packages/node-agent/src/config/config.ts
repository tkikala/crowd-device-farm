import dotenv from 'dotenv';
import os from 'os';

dotenv.config();

interface Config {
  controlPlane: {
    url: string;
    apiVersion: string;
    apiPrefix: string;
  };
  node: {
    name: string;
    hostname: string;
    ipAddress: string;
    platform: string;
    osVersion: string;
    architecture: string;
  };
  heartbeat: {
    interval: number;
    timeout: number;
  };
  logging: {
    level: string;
  };
}

const getLocalIPAddress = (): string => {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    const iface = interfaces[name];
    if (iface) {
      for (const alias of iface) {
        if (alias.family === 'IPv4' && !alias.internal) {
          return alias.address;
        }
      }
    }
  }
  return '127.0.0.1';
};

const config: Config = {
  controlPlane: {
    url: process.env.CONTROL_PLANE_URL || 'http://localhost:3000',
    apiVersion: process.env.API_VERSION || 'v1',
    apiPrefix: process.env.API_PREFIX || '/api'
  },
  node: {
    name: process.env.NODE_NAME || `node-${os.hostname()}`,
    hostname: os.hostname(),
    ipAddress: getLocalIPAddress(),
    platform: process.env.NODE_PLATFORM || 'android',
    osVersion: process.env.NODE_OS_VERSION || os.release(),
    architecture: process.env.NODE_ARCHITECTURE || os.arch()
  },
  heartbeat: {
    interval: parseInt(process.env.HEARTBEAT_INTERVAL || '30000', 10),
    timeout: parseInt(process.env.HEARTBEAT_TIMEOUT || '10000', 10)
  },
  logging: {
    level: process.env.LOG_LEVEL || 'info'
  }
};

export default config;

