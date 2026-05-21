import { AppProvider, useApp } from './context/AppContext';
import Header from './components/Header';
import AuthModal from './components/AuthModal';
import MateriTab from './components/MateriTab';
import CodingTab from './components/CodingTab';
import ForumTab from './components/ForumTab';
import TugasTab from './components/TugasTab';
import { BookOpen, Terminal, MessageSquare, Briefcase, Sparkles, Code2, Users, Database, ShieldCheck } from 'lucide-react';

function AppContent() {
  const { activeTab, currentUser } = useApp();

  return (
    <div className="min-h-screen flex flex-col bg-[#0f172a] text-zinc-150 selection:bg-sky-500/20 selection:text-sky-400">
      {/* Decorative top glowing lines & ambient grids */}
      <div className="absolute top-0 left-1/4 right-1/4 h-[250px] bg-gradient-to-b from-sky-500/5 to-transparent blur-[150px] pointer-events-none z-0"></div>
      <div className="absolute top-1/3 left-10 h-[300px] w-[300px] bg-sky-500/5 blur-[120px] rounded-full pointer-events-none z-0"></div>
      
      {/* Standard Grid overlay for tech feel */}
      <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(to_right,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none z-0"></div>

      {/* Header */}
      <Header />

      {/* Main Container */}
      <main className="relative max-w-7xl mx-auto w-full px-6 py-8 flex-grow z-10">
        
        {/* Welcome Hero Section only displayed on default tab if user is guest */}
        {activeTab === 'materi' && !currentUser && (
          <div className="mb-10 p-6 md:p-8 rounded-3xl bg-gradient-to-br from-slate-900/90 via-slate-900 to-indigo-950/20 border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-6 overflow-hidden relative shadow-2xl">
            <div className="absolute -right-10 -bottom-10 h-40 w-40 bg-sky-500/10 blur-3xl rounded-full"></div>
            <div className="absolute -left-10 -top-10 h-40 w-40 bg-indigo-500/10 blur-3xl rounded-full"></div>
            
            <div className="space-y-4 max-w-2xl relative z-10">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-400 text-xs font-mono font-semibold">
                <Sparkles className="h-3.5 w-3.5 animate-pulse" />
                Platform Belajar Masa Depan IT
              </span>
              <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight font-sans text-white leading-tight">
                Kuasai Pemrograman & Teknologi Baru di <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-sky-305">ITNextGen.IO</span>
              </h1>
              <p className="text-sm md:text-base text-slate-400 leading-relaxed font-sans">
                LMS interaktif khusus siswa SMA dan Mahasiswa IT untuk belajar mengajar pemrograman, kecerdasan buatan (AI), data engineering, dan frontend modular dengan simulasi coding terintegrasi.
              </p>
              
              <div className="flex flex-wrap gap-4 pt-2 font-mono text-[11px] text-slate-400">
                <span className="flex items-center gap-1.5"><Code2 className="h-4 w-4 text-sky-400" /> Simulasi Compiler Praktis</span>
                <span className="flex items-center gap-1.5"><Users className="h-4 w-4 text-indigo-400" /> Forum Diskusi & AI Mentor</span>
                <span className="flex items-center gap-1.5"><Database className="h-4 w-4 text-sky-400" /> Tugas Digital Terkoreksi</span>
              </div>
            </div>

            <div className="relative shrink-0 text-center z-10">
              <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 shadow-xl space-y-3">
                <p className="font-mono text-xs text-slate-400 leading-relaxed">Punya NIK/NISN? Gabung Kelas Sekarang!</p>
                <div className="flex items-center justify-center h-12 w-12 bg-sky-500/10 border border-sky-500/25 text-sky-400 rounded-full mx-auto animate-bounce">
                  <ShieldCheck className="h-6 w-6" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Dynamic content render views */}
        <section className="relative z-10">
          {activeTab === 'materi' && <MateriTab />}
          {activeTab === 'coding' && <CodingTab />}
          {activeTab === 'forum' && <ForumTab />}
          {activeTab === 'tugas' && <TugasTab />}
        </section>
      </main>

      {/* Authentication Gateway Portal Dialock */}
      <AuthModal />

      {/* Aesthetic Developer Footer */}
      <footer className="mt-auto border-t border-slate-900/80 bg-slate-950/80 p-6 md:p-8 font-mono text-xs text-slate-500 z-10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-white font-extrabold tracking-tight">ITNextGen<span className="text-sky-400">.IO</span></span>
            <span>|</span>
            <span>Aplikasi Belajar Mengajar Berbasis IT & AI</span>
          </div>
          <div className="flex gap-4 text-[11px]">
            <span className="hover:text-sky-400 transition cursor-pointer">Kurikulum SMA 2026</span>
            <span className="hover:text-sky-400 transition cursor-pointer">Simulasi Sandbox</span>
            <span className="hover:text-sky-400 transition cursor-pointer">Laporan Akademik</span>
          </div>
          <div className="text-[10px] text-slate-600">
            &copy; {new Date().getFullYear()} ITNextGen. Kelas Lab Digital Terpusat.
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
