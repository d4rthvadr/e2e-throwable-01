export type UserRecord = {
  id: string;
  username: string;
  password_hash: string;
  created_at: number;
};

export type User = {
  id: string;
  username: string;
  createdAt: number;
};

export type Task = {
  id: string;
  userId: string;
  title: string;
  description: string;
  completed: boolean;
  createdAt: number;
  updatedAt: number;
};

export type UserPreference = {
  id: string;
  userId: string;
  theme: string;
  notificationsEnabled: boolean;
  createdAt: number;
};
