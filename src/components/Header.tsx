import { useApp } from '../context/AppContext';
import { LogIn, LogOut, Terminal, BookOpen, MessageSquare, Briefcase, User as UserIcon, Code } from 'lucide-react';

export default function Header() {
  const { currentUser, logout, activeTab, setActiveTab, setIsAuthOpen } = useApp();

  const navItems = [
    { id: 'materi', label: 'Materi Pelajaran', icon: BookOpen },
    { id: 'coding', label: 'Simulasi Coding', icon: Terminal },
    { id: 'forum', label: 'Forum Diskusi', icon: MessageSquare },
    { id: 'tugas', label: 'Tugas & Evaluasi', icon: Briefcase },
  ];

  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-slate-800/80 px-6 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Brand Logo */}
        <div 
          className="flex items-center gap-3 cursor-pointer group"
          onClick={() => setActiveTab('materi')}
        >
          <div className="w-8 h-8 bg-sky-500 rounded flex items-center justify-center shadow-lg shadow-sky-500/20 group-hover:scale-105 transition-transform">
            <span className="font-mono font-bold text-slate-900 text-sm">IT</span>
          </div>
          <div>
            <div className="flex items-center gap-1.5 focus:outline-none">
              <span className="font-mono text-xl font-extrabold tracking-tight text-white">
                IT<span className="text-sky-400 font-semibold">NextGen</span>.IO
              </span>
              <span className="text-[10px] bg-sky-500/10 text-sky-400 border border-sky-500/20 px-1.5 py-0.5 rounded font-mono font-medium">
                v2.0
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-mono tracking-wider">LEARN. CODE. DISCUSS.</p>
          </div>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all focus:outline-none ${
                  isActive
                    ? 'bg-sky-500/10 text-sky-400 border border-sky-500/25 font-bold'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/40 border border-transparent'
                }`}
              >
                <Icon className={`h-4 w-4 ${isActive ? 'text-sky-400' : 'text-slate-400'}`} />
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* User Status / Login Icon */}
        <div className="flex items-center gap-4">
          {currentUser ? (
            <div className="flex items-center gap-3">
              {/* Profile Card Summary */}
              <div className="hidden sm:flex flex-col text-right font-mono text-xs">
                <span className="text-zinc-200 font-semibold">{currentUser.nama}</span>
                <span className="text-slate-400 flex items-center justify-end gap-1.5">
                  <span className={`inline-block h-1.5 w-1.5 rounded-full ${currentUser.role === 'guru' ? 'bg-indigo-400' : 'bg-sky-400 animate-pulse'}`}></span>
                  {currentUser.role === 'guru' ? '🧑‍🏫 Guru' : `👨‍🎓 Murid (${currentUser.kelas})`}
                </span>
              </div>

              {/* Profile Avatar Trigger / Details */}
              <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 p-1.5 rounded-lg">
                <div className={`h-8 w-8 rounded-md flex items-center justify-center text-sm font-bold font-mono ${
                  currentUser.role === 'guru' ? 'bg-indigo-500/20 text-indigo-300' : 'bg-sky-500/20 text-sky-300'
                }`}>
                  {currentUser.nama.charAt(0)}
                </div>
                
                {/* Logout Icon Button */}
                <button
                  onClick={logout}
                  title="Logout Akun"
                  className="p-1.5 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-md transition"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-1.5">
              <span className="hidden sm:inline text-xs text-slate-400 font-mono">Belum Masuk</span>
              <button
                onClick={() => setIsAuthOpen(true)}
                title="Masuk / Daftar Akun"
                className="flex items-center justify-center h-10 w-10 rounded-xl bg-gradient-to-br from-sky-500/15 via-sky-500/20 to-indigo-500/10 hover:from-sky-400/20 hover:to-indigo-400/20 border border-sky-500/30 hover:border-sky-500/50 text-sky-400 transition shadow-lg shadow-sky-500/5 focus:outline-none"
              >
                <LogIn className="h-5 w-5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
