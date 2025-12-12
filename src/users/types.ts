export interface User {
  id: number;
  email: string;
  name: string;
  role: string;
  permissions?: string[];
  isVerified?: boolean;
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
}



