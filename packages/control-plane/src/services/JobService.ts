import db from '../config/database';
import { Job, CreateJobRequest, UpdateJobRequest } from '../models/Job';

export class JobService {
  async createJob(data: CreateJobRequest, userId: string): Promise<Job> {
    const [job] = await db('jobs')
      .insert({
        user_id: userId,
        name: data.name,
        description: data.description,
        platform: data.platform,
        test_type: data.test_type,
        test_config: JSON.stringify(data.test_config),
        status: 'pending'
      })
      .returning('*');

    return {
      ...job,
      test_config: JSON.parse(job.test_config)
    };
  }

  async getJobById(id: string): Promise<Job | null> {
    const job = await db('jobs')
      .where({ id })
      .first();

    if (!job) {
      return null;
    }

    return {
      ...job,
      test_config: JSON.parse(job.test_config)
    };
  }

  async updateJob(id: string, data: UpdateJobRequest): Promise<Job | null> {
    const [job] = await db('jobs')
      .where({ id })
      .update({
        ...data,
        updated_at: new Date()
      })
      .returning('*');

    if (!job) {
      return null;
    }

    return {
      ...job,
      test_config: JSON.parse(job.test_config)
    };
  }

  async getJobsByUserId(userId: string, limit: number = 50, offset: number = 0): Promise<Job[]> {
    const jobs = await db('jobs')
      .where({ user_id: userId })
      .orderBy('created_at', 'desc')
      .limit(limit)
      .offset(offset);

    return jobs.map(job => ({
      ...job,
      test_config: JSON.parse(job.test_config)
    }));
  }

  async assignJobToNode(jobId: string, nodeId: string): Promise<Job | null> {
    return this.updateJob(jobId, {
      assigned_node_id: nodeId,
      status: 'running',
      started_at: new Date()
    });
  }

  async completeJob(jobId: string, success: boolean): Promise<Job | null> {
    return this.updateJob(jobId, {
      status: success ? 'completed' : 'failed',
      completed_at: new Date()
    });
  }
}

