import { useState, FormEvent } from 'react';
import { useApp } from '../context/AppContext';
import { BookOpen, Calendar, User, Tag, Plus, Loader2, Sparkles, Filter, CheckCircle } from 'lucide-react';
import { Material } from '../types';

export default function MateriTab() {
  const { materials, currentUser, addMaterial, aiGenerateMaterial } = useApp();
  const [selectedMaterial, setSelectedMaterial] = useState<Material | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Semua');

  // New Material Form
  const [isOpenForm, setIsOpenForm] = useState(false);
  const [title, setTitle] = useState('');
  const [topic, setTopic] = useState('');
  const [week, setWeek] = useState(4);
  const [category, setCategory] = useState('Frontend');
  const [summary, setSummary] = useState('');
  const [content, setContent] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  // Filter Categories
  const categories = ['Semua', 'AI', 'Frontend', 'Backend', 'Javascript', 'Database'];

  const filteredMaterials = materials.filter(m => {
    const matchesSearch = m.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          m.topic.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          m.summary.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'Semua' || m.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleCreate = async (e: FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    const success = await addMaterial({
      title,
      week,
      topic,
      content,
      summary,
      category,
      authorName: currentUser.nama
    });
    if (success) {
      setIsOpenForm(false);
      clearForm();
    }
  };

  const clearForm = () => {
    setTitle('');
    setTopic('');
    setWeek(4);
    setCategory('Frontend');
    setSummary('');
    setContent('');
  };

  const handleAiDraft = async () => {
    if (!topic || !category) {
      alert("Harap tentukan 'Topik Pemrograman' dan 'Kategori' terlebih dahulu agar AI memahami modul yang Anda inginkan!");
      return;
    }
    setIsGenerating(true);
    try {
      const draft = await aiGenerateMaterial(topic, category, week);
      setTitle(draft.title);
      setSummary(draft.summary);
      setContent(draft.content);
    } catch (e) {
      console.error(e);
    } finally {
      setIsGenerating(false);
    }
  };

  // Helper custom parser for simple markdown content
  const renderMarkdown = (text: string) => {
    return text.split('\n').map((line, idx) => {
      if (line.startsWith('### ')) {
        return <h3 key={idx} className="text-xl font-bold font-sans text-sky-400 mt-6 mb-3 border-b border-sky-500/10 pb-1">{line.slice(4)}</h3>;
      }
      if (line.startsWith('#### ')) {
        return <h4 key={idx} className="text-lg font-semibold font-sans text-sky-350 mt-4 mb-2">{line.slice(5)}</h4>;
      }
      if (line.startsWith('1. ') || line.startsWith('2. ') || line.startsWith('3. ') || line.startsWith('4. ')) {
        return <li key={idx} className="ml-6 list-decimal text-slate-300 leading-relaxed my-1 font-sans">{line.slice(3)}</li>;
      }
      if (line.startsWith('- ')) {
        return <li key={idx} className="ml-6 list-disc text-slate-300 leading-relaxed my-1 font-sans">{line.slice(2)}</li>;
      }
      if (line.startsWith('`') && line.endsWith('`')) {
        return <pre key={idx} className="my-2 bg-slate-950 p-2 rounded-lg border border-slate-900 font-mono text-sky-300 text-xs overflow-x-auto">{line.replace(/`/g, '')}</pre>;
      }
      if (line.includes('```')) {
        return null; // Skip raw code blocks opening/closing
      }
      // Return paragraphs
      if (line.trim() === '') return <div key={idx} className="h-2"></div>;
      return <p key={idx} className="text-slate-300 text-sm md:text-base leading-relaxed my-2 font-sans">{line}</p>;
    });
  };

  const currentModule = selectedMaterial || (materials.length > 0 ? materials[0] : null);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* LEFT COLUMN: List & Search (4 grid space) */}
      <div className="lg:col-span-4 space-y-6">
        <div>
          <h2 className="text-lg font-mono font-bold text-white flex items-center gap-2">
            <span>{'> LIST_WEEKLY_MODULES'}</span>
          </h2>
          <p className="text-xs text-slate-400 font-mono mt-0.5">Modul materi rujukan diperbaharui berkala</p>
        </div>

        {/* Search */}
        <div className="space-y-3">
          <input
            type="text"
            placeholder="Cari teori / konsep teknologi..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 focus:border-sky-500/50 rounded-xl px-4 py-2.5 text-sm font-mono text-white placeholder-slate-500 transition focus:outline-none"
          />

          {/* Categories Horizontal */}
          <div className="flex flex-wrap gap-1.5 pt-1">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1 text-[11px] font-mono rounded-lg border transition ${
                  selectedCategory === cat
                    ? 'bg-sky-500/10 border-sky-500/50 text-sky-400'
                    : 'bg-slate-950 border-slate-800/80 text-slate-400 hover:text-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Teacher Panel to Add Material */}
        {currentUser && currentUser.role === 'guru' && (
          <button
            onClick={() => { setIsOpenForm(!isOpenForm); clearForm(); }}
            className="w-full py-3 px-4 rounded-xl font-semibold text-center text-xs font-mono transition flex items-center justify-center gap-2 bg-gradient-to-r from-sky-500/15 to-indigo-500/15 border border-sky-500/40 text-sky-400 hover:bg-sky-500/20"
          >
            <Plus className="h-4 w-4" />
            {isOpenForm ? '[ TUTUP_FORM_BARU ]' : '[ TAMBAH_MATERI_AJAR ]'}
          </button>
        )}

        {/* Modules List Cards */}
        <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
          {filteredMaterials.map((m) => {
            const isSelected = currentModule && currentModule.id === m.id;
            return (
              <div
                key={m.id}
                onClick={() => { setSelectedMaterial(m); setIsOpenForm(false); }}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-sky-950/20 border-sky-500/40 shadow-md shadow-sky-500/2'
                    : 'bg-slate-900/60 hover:bg-slate-900 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-[10px] uppercase font-bold text-sky-400 px-2 py-0.5 bg-sky-500/10 border border-sky-500/20 rounded">
                    Mgg {m.week} - {m.category}
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">Verifikasi Guru</span>
                </div>
                <h4 className="text-zinc-100 font-bold text-sm leading-snug hover:text-sky-400 transition mb-1">{m.title}</h4>
                <p className="text-slate-400 text-xs line-clamp-2 leading-relaxed">{m.summary}</p>
                
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-800/40 text-[10px] font-mono text-slate-500">
                  <span className="flex items-center gap-1"><User className="h-3 w-3" /> {m.authorName}</span>
                  <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> 2026</span>
                </div>
              </div>
            );
          })}

          {filteredMaterials.length === 0 && (
            <div className="text-center py-10 bg-slate-900/10 border border-slate-800 border-dashed rounded-xl p-4">
              <BookOpen className="h-6 w-6 text-slate-600 mx-auto mb-2" />
              <p className="text-xs font-mono text-slate-500">Kamera database kosong / tidak ditemukan materi terkait.</p>
            </div>
          )}
        </div>
      </div>

      {/* RIGHT COLUMN: Read View OR Form View (8 grid space) */}
      <div className="lg:col-span-8">
        {isOpenForm ? (
          /* Form to Publish New Material */
          <div className="glass-panel p-6 rounded-2xl border border-slate-800/80 space-y-6">
            <div>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-mono text-base font-bold text-white flex items-center gap-1.5">
                    <span>{'> INIT_NEW_LEARNING_MODULE'}</span>
                  </h3>
                  <p className="text-xs text-indigo-400 font-mono">Panel Administrasi Ajar Guru</p>
                </div>
                <span className="text-xs bg-indigo-500/15 text-indigo-400 border border-indigo-500/30 px-3 py-1 rounded-full font-mono">
                  👨‍🏫 Guru Mode
                </span>
              </div>
            </div>

            <form onSubmit={handleCreate} className="space-y-4">
            {/* Draft with Gemini Helper Drawer/Box */}
            <div className="p-4 bg-slate-950 border border-sky-500/20 rounded-xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-sky-400 flex items-center gap-1.5">
                  <Sparkles className="h-4 w-4 animate-pulse" />
                  AUTODRAFT_GEMINI_AI
                </span>
                <span className="text-[9px] bg-sky-500/10 text-sky-400 px-1.5 py-0.5 rounded border border-sky-500/20 font-mono">Aktif</span>
              </div>
              <p className="text-xs text-slate-400">Guru cukup ketik Topik pelajaran di bawah, beralih ke Kategori, lalu klik 'AI Draft'. Gemini AI akan otomatis merancang draf deskripsi, rangkuman, dan isi sub-bab latihan koding praktis siap pakai!</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block mb-1 text-[10px] font-mono text-slate-500 uppercase">Topik Pemrograman / IT</label>
                  <input
                    type="text"
                    placeholder="E.g., Docker Containerization / REST API"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs font-mono text-white"
                  />
                </div>
                <div className="flex items-end">
                  <button
                    type="button"
                    disabled={isGenerating}
                    onClick={handleAiDraft}
                    className="w-full py-2 bg-gradient-to-r from-sky-500 to-indigo-600 text-white rounded-lg text-xs font-semibold font-mono flex items-center justify-center gap-1.5 transition hover:brightness-110 disabled:opacity-50"
                  >
                      {isGenerating ? (
                        <>
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          Membuat Modul...
                        </>
                      ) : (
                        <>
                          <Sparkles className="h-3.5 w-3.5" />
                          [ RANCANG_DRAFT_AI ]
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Standard inputs */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                <div className="md:col-span-8">
                  <label className="block mb-1.5 font-mono text-xs text-slate-400 uppercase">Judul Publikasi Materi</label>
                  <input
                    required
                    type="text"
                    placeholder="Masukkan judul bab materi"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-3.5 py-2 text-sm text-zinc-100"
                  />
                </div>
                <div className="md:col-span-4 grid grid-cols-2 gap-2">
                  <div>
                    <label className="block mb-1.5 font-mono text-xs text-slate-400 uppercase">Mgg Ke-</label>
                    <input
                      required
                      type="number"
                      min={1}
                      max={52}
                      value={week}
                      onChange={(e) => setWeek(parseInt(e.target.value))}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-center text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block mb-1.5 font-mono text-xs text-slate-400 uppercase">Kategori</label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-1 text-sm text-zinc-100 font-mono"
                    >
                      <option value="AI">AI</option>
                      <option value="Frontend">Frontend</option>
                      <option value="Backend">Backend</option>
                      <option value="Javascript">Javascript</option>
                      <option value="Database">Database</option>
                    </select>
                  </div>
                </div>
              </div>

              <div>
                <label className="block mb-1.5 font-mono text-xs text-slate-400 uppercase">Ringkasan / Sinopsis Singkat (Summary)</label>
                <input
                  required
                  type="text"
                  placeholder="Deskripsi singkat yang tampil sebagai kutipan awal di daftar modul"
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-3.5 py-2 text-sm text-zinc-100"
                />
              </div>

              <div>
                <label className="block mb-1.5 font-mono text-xs text-slate-400 uppercase">Isi Modul Lengkap (Mendukung Markdown Sederhana)</label>
                <textarea
                  required
                  rows={8}
                  placeholder={`Gunakan ### Judul SubBab\n- Poin detail\nUntuk menulis bagian isi ajar.`}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl p-3.5 text-sm text-zinc-200 font-mono transition focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-3 pt-2 justify-end">
                <button
                  type="button"
                  onClick={() => { setIsOpenForm(false); clearForm(); }}
                  className="px-4 py-2 bg-slate-950 border border-slate-850 hover:bg-slate-900 font-mono text-xs text-slate-400 rounded-lg transition"
                >
                  BATAL
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-mono text-xs rounded-lg transition font-bold"
                >
                  PUBLISH_MODULE
                </button>
              </div>
            </form>
          </div>
        ) : (
          /* Render Selected Material details */
          currentModule ? (
            <div className="glass-panel p-6 md:p-8 rounded-2xl border border-slate-850 space-y-6">
              {/* Header Details */}
              <div className="border-b border-slate-800/80 pb-6">
                <div className="flex flex-wrap gap-2 items-center mb-3">
                  <span className="font-mono text-xs text-sky-400 bg-sky-500/10 border border-sky-500/25 px-2.5 py-0.5 rounded">
                    Minggu {currentModule.week}
                  </span>
                  <span className="font-mono text-xs text-slate-400 flex items-center gap-1.5 px-2 py-0.5 bg-slate-900 border border-slate-800 rounded">
                    <Tag className="h-3 w-3" /> {currentModule.category}
                  </span>
                </div>
                <h1 className="text-2xl md:text-3xl font-sans font-extrabold tracking-tight text-white mb-3">
                  {currentModule.title}
                </h1>
                
                <div className="flex flex-wrap items-center justify-between gap-4 text-xs font-mono text-slate-400">
                  <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1.5"><User className="h-3.5 w-3.5 text-sky-400" /> {currentModule.authorName}</span>
                    <span className="text-slate-600">|</span>
                    <span className="flex items-center gap-1.5 text-slate-400 font-mono">SMA Negeri 1 Jakarta</span>
                  </div>
                  <span className="text-[10px] text-sky-450 bg-sky-505/5 px-2.5 py-1 rounded border border-sky-500/10 font-mono flex items-center gap-1">
                    <CheckCircle className="h-3.5 w-3.5 text-sky-400" /> Modul Terverifikasi ITNextGen
                  </span>
                </div>
              </div>

              {/* Summary Block */}
              <div className="p-4 bg-sky-950/15 border border-sky-500/10 rounded-xl">
                <p className="text-zinc-350 text-sm leading-relaxed italic">
                  &ldquo;{currentModule.summary}&rdquo;
                </p>
              </div>

              {/* Rich Body Content */}
              <div className="prose prose-invert max-w-none">
                {renderMarkdown(currentModule.content)}
              </div>
            </div>
          ) : (
            <div className="glass-panel p-16 text-center rounded-2xl border border-slate-850">
              <BookOpen className="h-10 w-10 text-slate-600 mx-auto mb-3" />
              <h3 className="font-bold text-white mb-1">Materi Sedang Dimuat</h3>
              <p className="text-slate-400 text-xs font-mono">Memeriksa database ITNextGen.IO...</p>
            </div>
          )
        )}
      </div>
    </div>
  );
}
