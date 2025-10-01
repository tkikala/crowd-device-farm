export interface Node {
  id: string;
  name: string;
  hostname: string;
  ip_address: string;
  platform: string;
  os_version: string;
  architecture: string;
  capabilities: Record<string, any>;
  status: 'offline' | 'online' | 'busy' | 'maintenance';
  last_heartbeat?: Date;
  registered_at: Date;
  created_at: Date;
  updated_at: Date;
}

export interface RegisterNodeRequest {
  name: string;
  hostname: string;
  ip_address: string;
  platform: string;
  os_version: string;
  architecture: string;
  capabilities: Record<string, any>;
}

export interface HeartbeatRequest {
  status?: Node['status'];
  capabilities?: Record<string, any>;
}

