import db from '../config/database';
import { Node, RegisterNodeRequest, HeartbeatRequest } from '../models/Node';

export class NodeService {
  async registerNode(data: RegisterNodeRequest): Promise<Node> {
    const [node] = await db('nodes')
      .insert({
        name: data.name,
        hostname: data.hostname,
        ip_address: data.ip_address,
        platform: data.platform,
        os_version: data.os_version,
        architecture: data.architecture,
        capabilities: JSON.stringify(data.capabilities),
        status: 'online'
      })
      .returning('*');

    return {
      ...node,
      capabilities: JSON.parse(node.capabilities)
    };
  }

  async getNodeById(id: string): Promise<Node | null> {
    const node = await db('nodes')
      .where({ id })
      .first();

    if (!node) {
      return null;
    }

    return {
      ...node,
      capabilities: JSON.parse(node.capabilities)
    };
  }

  async updateNodeHeartbeat(id: string, data: HeartbeatRequest): Promise<Node | null> {
    const updateData: any = {
      last_heartbeat: new Date(),
      updated_at: new Date()
    };

    if (data.status) {
      updateData.status = data.status;
    }

    if (data.capabilities) {
      updateData.capabilities = JSON.stringify(data.capabilities);
    }

    const [node] = await db('nodes')
      .where({ id })
      .update(updateData)
      .returning('*');

    if (!node) {
      return null;
    }

    return {
      ...node,
      capabilities: JSON.parse(node.capabilities)
    };
  }

  async getAvailableNodes(platform?: string): Promise<Node[]> {
    let query = db('nodes')
      .where({ status: 'online' })
      .orderBy('last_heartbeat', 'desc');

    if (platform) {
      query = query.where({ platform });
    }

    const nodes = await query;

    return nodes.map(node => ({
      ...node,
      capabilities: JSON.parse(node.capabilities)
    }));
  }

  async getOfflineNodes(timeoutMinutes: number = 5): Promise<Node[]> {
    const timeout = new Date();
    timeout.setMinutes(timeout.getMinutes() - timeoutMinutes);

    const nodes = await db('nodes')
      .where('status', '!=', 'offline')
      .where(function() {
        this.whereNull('last_heartbeat')
            .orWhere('last_heartbeat', '<', timeout);
      })
      .update({ status: 'offline' })
      .returning('*');

    return nodes.map(node => ({
      ...node,
      capabilities: JSON.parse(node.capabilities)
    }));
  }

  async updateNodeStatus(id: string, status: Node['status']): Promise<Node | null> {
    const [node] = await db('nodes')
      .where({ id })
      .update({
        status,
        updated_at: new Date()
      })
      .returning('*');

    if (!node) {
      return null;
    }

    return {
      ...node,
      capabilities: JSON.parse(node.capabilities)
    };
  }
}

