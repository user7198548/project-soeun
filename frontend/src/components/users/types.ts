// src/components/users/types.ts

export interface UserFilters {
  email: string;
  name: string;
  role: string; // "", "ADMIN", "USER"
  from: string; // YYYY-MM-DD
  to: string;   // YYYY-MM-DD
}

export type MeResponse = { id: number; email: string; name: string; role: string };

export type UserListItemResponse = {
  id: number;
  email: string;
  name: string;
  role: string;
  active: boolean;
  createdAt: string;
};

export type Page<T> = {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
};

