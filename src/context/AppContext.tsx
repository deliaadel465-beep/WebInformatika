import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Material, Task, TaskSubmission, ForumPost, Role } from '../types';

interface AppContextType {
  currentUser: User | null;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  materials: Material[];
  tasks: Task[];
  submissions: TaskSubmission[];
  posts: ForumPost[];
  isAuthOpen: boolean;
  setIsAuthOpen: (open: boolean) => void;
  isLoading: boolean;
  errorMsg: string | null;
  setErrorMsg: (msg: string | null) => void;
  
  // Actions
  login: (gmail: string, password: string) => Promise<boolean>;
  register: (userData: Omit<User, 'createdAt'>) => Promise<boolean>;
  logout: () => void;
  refreshData: () => Promise<void>;
  
  // Create / interact
  addMaterial: (material: Omit<Material, 'id' | 'dateAdded'>) => Promise<boolean>;
  addTask: (task: Omit<Task, 'id'>) => Promise<boolean>;
  submitTask: (taskId: string, taskTitle: string, code: string) => Promise<boolean>;
  gradeSubmission: (submissionId: string, score: number, feedback: string) => Promise<boolean>;
  createPost: (title: string, content: string, category: string) => Promise<boolean>;
  addReply: (postId: string, content: string) => Promise<boolean>;
  toggleLike: (postId: string) => Promise<void>;
  
  // Gemini Utilities
  optimizeCode: (code: string, language: string, instruction: string) => Promise<string>;
  getAiGradingSuggestion: (code: string, task: Task) => Promise<{ score: number; feedback: string }>;
  getAiForumReply: (post: ForumPost) => Promise<string>;
  aiGenerateMaterial: (topic: string, category: string, week: number) => Promise<{ title: string; summary: string; content: string }>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<string>('materi');
  const [materials, setMaterials] = useState<Material[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [submissions, setSubmissions] = useState<TaskSubmission[]>([]);
  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [isAuthOpen, setIsAuthOpen] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Load user session from localStorage on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('itnextgen_user');
    if (savedUser) {
      try {
        setCurrentUser(JSON.parse(savedUser));
      } catch (e) {
        localStorage.removeItem('itnextgen_user');
      }
    }
    refreshData();
  }, []);

  const refreshData = async () => {
    setIsLoading(true);
    try {
      const [matRes, taskRes, postRes] = await Promise.all([
        fetch('/api/materials'),
        fetch('/api/tasks'),
        fetch('/api/forum')
      ]);

      if (matRes.ok) setMaterials(await matRes.json());
      if (taskRes.ok) setTasks(await taskRes.json());
      if (postRes.ok) setPosts(await postRes.json());

      // If user is logged in, load submissions
      const savedUser = localStorage.getItem('itnextgen_user');
      if (savedUser) {
        const u = JSON.parse(savedUser) as User;
        const subUrl = u.role === 'guru' ? '/api/submissions' : `/api/submissions?nisn=${u.nisn}`;
        const subRes = await fetch(subUrl);
        if (subRes.ok) setSubmissions(await subRes.json());
      }
    } catch (err) {
      console.error("Error refreshing data:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (gmail: string, password: string): Promise<boolean> => {
    setErrorMsg(null);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gmail, password })
      });
      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || 'Autentikasi gagal');
        return false;
      }
      setCurrentUser(data.user);
      localStorage.setItem('itnextgen_user', JSON.stringify(data.user));
      
      // Fetch submissions for this user
      const subUrl = data.user.role === 'guru' ? '/api/submissions' : `/api/submissions?nisn=${data.user.nisn}`;
      const subRes = await fetch(subUrl);
      if (subRes.ok) setSubmissions(await subRes.json());
      
      return true;
    } catch (err) {
      setErrorMsg('Koneksi server gagal');
      return false;
    }
  };

  const register = async (userData: Omit<User, 'createdAt'>): Promise<boolean> => {
    setErrorMsg(null);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });
      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || 'Pendaftaran gagal');
        return false;
      }
      setCurrentUser(data.user);
      localStorage.setItem('itnextgen_user', JSON.stringify(data.user));
      setSubmissions([]);
      return true;
    } catch (err) {
      setErrorMsg('Koneksi server gagal');
      return false;
    }
  };

  const logout = () => {
    setCurrentUser(null);
    setSubmissions([]);
    localStorage.removeItem('itnextgen_user');
    setActiveTab('materi');
  };

  const addMaterial = async (material: Omit<Material, 'id' | 'dateAdded'>): Promise<boolean> => {
    try {
      const res = await fetch('/api/materials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(material)
      });
      if (res.ok) {
        await refreshData();
        return true;
      }
      return false;
    } catch (e) {
      return false;
    }
  };

  const addTask = async (task: Omit<Task, 'id'>): Promise<boolean> => {
    try {
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(task)
      });
      if (res.ok) {
        await refreshData();
        return true;
      }
      return false;
    } catch (e) {
      return false;
    }
  };

  const submitTask = async (taskId: string, taskTitle: string, code: string): Promise<boolean> => {
    if (!currentUser) return false;
    try {
      const res = await fetch('/api/submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          taskId,
          taskTitle,
          studentNisn: currentUser.nisn,
          studentName: currentUser.nama,
          studentKelas: currentUser.kelas,
          code
        })
      });
      if (res.ok) {
        await refreshData();
        return true;
      }
      return false;
    } catch (e) {
      return false;
    }
  };

  const gradeSubmission = async (submissionId: string, score: number, feedback: string): Promise<boolean> => {
    try {
      const res = await fetch(`/api/submissions/${submissionId}/grade`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ score, feedback })
      });
      if (res.ok) {
        await refreshData();
        return true;
      }
      return false;
    } catch (e) {
      return false;
    }
  };

  const createPost = async (title: string, content: string, category: string): Promise<boolean> => {
    if (!currentUser) return false;
    try {
      const res = await fetch('/api/forum', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          content,
          category,
          authorName: currentUser.nama,
          authorRole: currentUser.role,
          authorNisn: currentUser.nisn
        })
      });
      if (res.ok) {
        await refreshData();
        return true;
      }
      return false;
    } catch (e) {
      return false;
    }
  };

  const addReply = async (postId: string, content: string): Promise<boolean> => {
    if (!currentUser) return false;
    try {
      const res = await fetch(`/api/forum/${postId}/reply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content,
          authorName: currentUser.nama,
          authorRole: currentUser.role,
          authorNisn: currentUser.nisn
        })
      });
      if (res.ok) {
        await refreshData();
        return true;
      }
      return false;
    } catch (e) {
      return false;
    }
  };

  const toggleLike = async (postId: string): Promise<void> => {
    if (!currentUser) return;
    try {
      await fetch(`/api/forum/${postId}/like`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentNisn: currentUser.nisn })
      });
      await refreshData();
    } catch (e) {
      console.error(e);
    }
  };

  // AI Helpers
  const optimizeCode = async (code: string, language: string, instruction: string): Promise<string> => {
    try {
      const res = await fetch('/api/ai/optimize-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, language, instruction })
      });
      if (res.ok) {
        const data = await res.json();
        return data.output || code;
      }
    } catch (e) {
      console.error(e);
    }
    return code;
  };

  const getAiGradingSuggestion = async (code: string, task: Task): Promise<{ score: number; feedback: string }> => {
    try {
      const res = await fetch('/api/ai/auto-grade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code,
          taskTitle: task.title,
          description: task.description,
          expectedOutput: task.expectedOutput,
          language: task.language
        })
      });
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {
      console.error(e);
    }
    return { score: 85, feedback: "Gagal memanggil evaluasi AI secara live. Anda dapat memberikan nilai manual." };
  };

  const getAiForumReply = async (post: ForumPost): Promise<string> => {
    try {
      const res = await fetch('/api/ai/forum-reply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          postTitle: post.title,
          postContent: post.content,
          threadCategory: post.category
        })
      });
      if (res.ok) {
        const data = await res.json();
        return data.reply;
      }
    } catch (e) {
      console.error(e);
    }
    return "Maaf, integrasi AI Mentor sedang offline. Mohon periksa setup API Key di Settings.";
  };

  const aiGenerateMaterial = async (topic: string, category: string, week: number): Promise<{ title: string; summary: string; content: string }> => {
    try {
      const res = await fetch('/api/ai/generate-material', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic, category, week })
      });
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {
      console.error(e);
    }
    return {
      title: `Panduan Praktis: ${topic}`,
      summary: `Materi modular berfokus pada teknik dan penerapan praktis ${topic}.`,
      content: `### Pengenalan ${topic}\n\nMateri ini dirancang untuk memberikan instruksi dasar pemrograman terkait ${topic}.`
    };
  };

  return (
    <AppContext.Provider value={{
      currentUser,
      activeTab,
      setActiveTab,
      materials,
      tasks,
      submissions,
      posts,
      isAuthOpen,
      setIsAuthOpen,
      isLoading,
      errorMsg,
      setErrorMsg,
      login,
      register,
      logout,
      refreshData,
      addMaterial,
      addTask,
      submitTask,
      gradeSubmission,
      createPost,
      addReply,
      toggleLike,
      optimizeCode,
      getAiGradingSuggestion,
      getAiForumReply,
      aiGenerateMaterial
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
