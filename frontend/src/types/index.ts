// User types
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'admin';
}

// Issue types
export type Category = 'Electrical' | 'Water' | 'Internet' | 'Infrastructure';
export type IssueStatus = 'Open' | 'In Progress' | 'Resolved';

export interface Remark {
  text: string;
  addedBy: string;
  addedAt: string;
}

export interface Issue {
  _id: string;
  title: string;
  description: string;
  category: Category;
  status: IssueStatus;
  imageUrl?: string;
  createdBy: string;
  remarks: Remark[];
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

// Request types
export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface CreateIssueRequest {
  title: string;
  description: string;
  category: Category;
  image?: File | Blob;
}
