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
  createdAt: Date;
}

export interface Retro {
  _id: string;
  userId: string;
  projectId: string;
  content: string;
  createdAt: Date;
}

export interface Schedule {
  _id: string;
  userId: string;
  title: string;
  date: Date;
  category: string;
}

export interface Task {
  _id: string;
  projectId: string;
  title: string;
  status: "할 일" | "진행 중" | "완료";
  dueDate: Date;
}
