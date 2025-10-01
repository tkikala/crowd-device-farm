export interface Artifact {
  id: string;
  job_id: string;
  name: string;
  type: string;
  file_path: string;
  file_size: string;
  mime_type: string;
  checksum: string;
  created_at: Date;
  updated_at: Date;
}

export interface CreateArtifactRequest {
  job_id: string;
  name: string;
  type: string;
  file_path: string;
  file_size: string;
  mime_type: string;
  checksum: string;
}

