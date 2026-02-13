export interface User {
  _id: string;
  name: string;
  email: string;
  githubId?: string;
  password: string;
  createdAt: Date;
}

export interface Project {
  _id: string;
  userId: string;
  title: string;
  description: string;
  category: string;
  priority: "낮음" | "보통" | "높음";
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Retro {
  _id: string;
  userId: string;
  projectId?: string;
  content: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Schedule {
  _id: string;
  userId: string;
  title: string;
  date: Date;
  category: string;
  memo?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Task {
  _id: string;
  projectId: string;
  title: string;
  status: "todo" | "doing" | "done";
  dueDate?: Date;
  memo?: string;
  createdAt?: Date;
}
