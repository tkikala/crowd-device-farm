export interface Job {
  id: string;
  user_id: string;
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

export interface CreateJobRequest {
  name: string;
  description?: string;
  platform: string;
  test_type: string;
  test_config: Record<string, any>;
  apk_path?: string;
  test_apk_path?: string;
}

export interface UpdateJobRequest {
  status?: Job['status'];
  assigned_node_id?: string;
  started_at?: Date;
  completed_at?: Date;
}

