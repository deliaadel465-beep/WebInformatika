export type Role = 'guru' | 'murid';

export interface User {
  nisn: string; // Used as primary key (NISN/NIS for murid, NIP/NIDN or unique ID for guru)
  nama: string;
  kelas: string;
  sekolah: string;
  gmail: string;
  password?: string;
  role: Role;
  createdAt: string;
}

export interface Material {
  id: string;
  title: string;
  week: number;
  topic: string;
  content: string; // Markdown supported
  summary: string;
  category: string; // "Frontend" | "Backend" | "AI" | "Database"
  dateAdded: string;
  authorName: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  language: string; // "javascript" | "html" | "css"
  codeTemplate: string;
  expectedOutput: string;
  dueDate: string;
  weeklyTopic: string;
}

export interface TaskSubmission {
  id: string;
  taskId: string;
  taskTitle: string;
  studentNisn: string;
  studentName: string;
  studentKelas: string;
  code: string;
  status: 'submitted' | 'graded';
  score?: number;
  feedback?: string;
  dateSubmitted: string;
}

export interface ForumPost {
  id: string;
  title: string;
  content: string;
  category: string;
  authorName: string;
  authorRole: Role;
  authorNisn: string;
  date: string;
  likes: number;
  likedBy: string[]; // List of user NISNs
  replies: ForumReply[];
}

export interface ForumReply {
  id: string;
  postId: string;
  content: string;
  authorName: string;
  authorRole: Role;
  authorNisn: string;
  date: string;
}

export interface CodeEvaluation {
  status: 'success' | 'failed' | 'error';
  output: string;
  score?: number;
  grade_feedback?: string;
}
