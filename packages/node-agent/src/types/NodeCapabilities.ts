export interface NodeCapabilities {
  // Device capabilities
  devices?: DeviceCapability[];
  // Platform-specific capabilities
  android?: AndroidCapabilities;
  ios?: IOSCapabilities;
  windows?: WindowsCapabilities;
  linux?: LinuxCapabilities;
  macos?: MacOSCapabilities;
  // General capabilities
  maxConcurrentJobs?: number;
  availableMemory?: number; // in MB
  availableStorage?: number; // in MB
  cpuCores?: number;
  // Feature flags
  features?: string[];
}

export interface DeviceCapability {
  id: string;
  name: string;
  type: 'emulator' | 'physical';
  platform: string;
  version: string;
  architecture: string;
  status: 'available' | 'busy' | 'offline';
  properties: Record<string, any>;
}

export interface AndroidCapabilities {
  sdkVersion?: string;
  emulators?: AndroidEmulator[];
  adbVersion?: string;
  tools?: string[];
}

export interface AndroidEmulator {
  name: string;
  id: string;
  apiLevel: number;
  target: string;
  abi: string;
  skin?: string;
  status: 'available' | 'running' | 'busy';
}

export interface IOSCapabilities {
  xcodeVersion?: string;
  simulators?: IOSSimulator[];
  iosVersion?: string;
}

export interface IOSSimulator {
  name: string;
  udid: string;
  version: string;
  deviceType: string;
  status: 'available' | 'running' | 'busy';
}

export interface WindowsCapabilities {
  version?: string;
  build?: string;
  edition?: string;
  browsers?: BrowserCapability[];
}

export interface LinuxCapabilities {
  distribution?: string;
  version?: string;
  browsers?: BrowserCapability[];
  desktop?: string;
}

export interface MacOSCapabilities {
  version?: string;
  build?: string;
  browsers?: BrowserCapability[];
  xcodeVersion?: string;
}

export interface BrowserCapability {
  name: string;
  version: string;
  type: 'chromium' | 'firefox' | 'safari' | 'edge';
  status: 'available' | 'busy';
}

