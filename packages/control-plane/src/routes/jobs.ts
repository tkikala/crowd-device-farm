import { Router, Request, Response } from 'express';
import { JobService } from '../services/JobService';
import Joi from 'joi';

const router = Router();
const jobService = new JobService();

// Validation schemas
const createJobSchema = Joi.object({
  name: Joi.string().required().max(255),
  description: Joi.string().optional().max(1000),
  platform: Joi.string().required().valid('android', 'ios', 'windows', 'linux', 'macos'),
  test_type: Joi.string().required().valid('unit', 'integration', 'e2e', 'performance'),
  test_config: Joi.object().required(),
  apk_path: Joi.string().optional(),
  test_apk_path: Joi.string().optional()
});

// POST /jobs - Create a new job
router.post('/', async (req: Request, res: Response) => {
  try {
    const { error, value } = createJobSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        error: 'Validation failed',
        details: error.details.map(d => d.message)
      });
    }

    // For now, we'll use a dummy user ID. In a real app, this would come from authentication
    const userId = '00000000-0000-0000-0000-000000000000'; // TODO: Get from auth middleware

    const job = await jobService.createJob(value, userId);
    res.status(201).json(job);
  } catch (error) {
    console.error('Error creating job:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /jobs/:id - Get a specific job
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    if (!id) {
      return res.status(400).json({ error: 'Job ID is required' });
    }

    const job = await jobService.getJobById(id);
    
    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    res.json(job);
  } catch (error) {
    console.error('Error fetching job:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /jobs - Get jobs for a user (with pagination)
router.get('/', async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 50;
    const offset = parseInt(req.query.offset as string) || 0;
    
    // For now, we'll use a dummy user ID. In a real app, this would come from authentication
    const userId = '00000000-0000-0000-0000-000000000000'; // TODO: Get from auth middleware

    const jobs = await jobService.getJobsByUserId(userId, limit, offset);
    res.json({
      jobs,
      pagination: {
        limit,
        offset,
        total: jobs.length
      }
    });
  } catch (error) {
    console.error('Error fetching jobs:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;

