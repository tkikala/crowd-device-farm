import { Router, Request, Response } from 'express';
import { NodeService } from '../services/NodeService';
import Joi from 'joi';

const router = Router();
const nodeService = new NodeService();

// Validation schemas
const registerNodeSchema = Joi.object({
  name: Joi.string().required().max(255),
  hostname: Joi.string().required().max(255),
  ip_address: Joi.string().ip().required(),
  platform: Joi.string().required().valid('android', 'ios', 'windows', 'linux', 'macos'),
  os_version: Joi.string().required().max(100),
  architecture: Joi.string().required().valid('x86', 'x64', 'arm64'),
  capabilities: Joi.object().required()
});

const heartbeatSchema = Joi.object({
  status: Joi.string().optional().valid('online', 'busy', 'maintenance'),
  capabilities: Joi.object().optional()
});

// POST /nodes/register - Register a new node
router.post('/register', async (req: Request, res: Response) => {
  try {
    const { error, value } = registerNodeSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        error: 'Validation failed',
        details: error.details.map(d => d.message)
      });
    }

    const node = await nodeService.registerNode(value);
    res.status(201).json(node);
  } catch (error) {
    console.error('Error registering node:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /nodes/:id - Get a specific node
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    if (!id) {
      return res.status(400).json({ error: 'Node ID is required' });
    }

    const node = await nodeService.getNodeById(id);
    
    if (!node) {
      return res.status(404).json({ error: 'Node not found' });
    }

    res.json(node);
  } catch (error) {
    console.error('Error fetching node:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /nodes/:id/heartbeat - Update node heartbeat
router.post('/:id/heartbeat', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { error, value } = heartbeatSchema.validate(req.body);
    
    if (error) {
      return res.status(400).json({
        error: 'Validation failed',
        details: error.details.map(d => d.message)
      });
    }

    if (!id) {
      return res.status(400).json({ error: 'Node ID is required' });
    }

    const node = await nodeService.updateNodeHeartbeat(id, value);
    
    if (!node) {
      return res.status(404).json({ error: 'Node not found' });
    }

    res.json(node);
  } catch (error) {
    console.error('Error updating heartbeat:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /nodes - Get available nodes (optionally filtered by platform)
router.get('/', async (req: Request, res: Response) => {
  try {
    const platform = req.query.platform as string;
    
    const nodes = await nodeService.getAvailableNodes(platform);
    res.json({
      nodes,
      total: nodes.length
    });
  } catch (error) {
    console.error('Error fetching nodes:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;

