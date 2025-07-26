export interface UserData {
  id: string;
  name: string;
  email: string;
  profilePicture?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  age: number;
  gender: string;
  profilePicture?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalUsers: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  age: number;
  gender: string;
  profilePicture?: string;
}

export interface SignupData {
  name: string;
  email: string;
  password: string;
  age?: number;
  gender?: string;
  profilePicture?: string
}

export interface LoginData {
  email: string;
  password: string;
}

