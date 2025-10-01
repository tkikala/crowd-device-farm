export interface User {
  id: string;
  email: string;
  name: string;
  password_hash: string;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface CreateUserRequest {
  email: string;
  name: string;
  password: string;
}

export interface UpdateUserRequest {
  name?: string;
  is_active?: boolean;
}

