import { useState, FormEvent } from 'react';
import { useApp } from '../context/AppContext';
import { Heart, MessageSquare, Send, Sparkles, AlertCircle, Plus, FileText, Loader2, Bot, Calendar, HelpCircle } from 'lucide-react';
import { ForumPost } from '../types';

export default function ForumTab() {
  const { posts, currentUser, createPost, addReply, toggleLike, getAiForumReply, setIsAuthOpen } = useApp();
  const [selectedPost, setSelectedPost] = useState<ForumPost | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Create Post
  const [isOpenForm, setIsOpenForm] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('Pemrograman');
  const [newContent, setNewContent] = useState('');

  // Create Reply
  const [replyContent, setReplyContent] = useState('');
  const [isAiAnswering, setIsAiAnswering] = useState(false);

  const categories = ['Pemrograman', 'Karir & AI', 'Tanya Tugas', 'Diskusi Umum'];

  const filteredPosts = posts.filter(p => {
    return p.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
           p.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
           p.category.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const handleCreatePost = async (e: FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    const success = await createPost(newTitle, newContent, newCategory);
    if (success) {
      setIsOpenForm(false);
      setNewTitle('');
      setNewContent('');
    }
  };

  const handleAddReply = async (e: FormEvent) => {
    e.preventDefault();
    if (!currentUser || !selectedPost || !replyContent.trim()) return;
    const success = await addReply(selectedPost.id, replyContent);
    if (success) {
      setReplyContent('');
      // Find latest updated post in collection and focus on it to show updated replies
      const updatedPost = posts.find(p => p.id === selectedPost.id);
      if (updatedPost) setSelectedPost(updatedPost);
    }
  };

  const handleAskAiMentor = async () => {
    if (!selectedPost) return;
    setIsAiAnswering(true);
    try {
      const gSuggest = await getAiForumReply(selectedPost);
      // Post actual AI reply to forum db
      await addReply(selectedPost.id, `🤖 [RESPON AI MENTOR]:\n${gSuggest}`);
      // Refresh current focus
      const updatedPost = posts.find(p => p.id === selectedPost.id);
      if (updatedPost) setSelectedPost(updatedPost);
    } catch (e) {
      console.error(e);
    } finally {
      setIsAiAnswering(false);
    }
  };

  const currentPost = selectedPost || (filteredPosts.length > 0 ? filteredPosts[0] : null);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* LEFT COLUMN: Posts feed & Ask input */}
      <div className="lg:col-span-5 space-y-5">
        <div>
          <h2 className="text-lg font-mono font-bold text-white flex items-center gap-2">
            <span>{'> DISCUSSION_INDEX_DB'}</span>
          </h2>
          <p className="text-xs text-slate-400 font-mono mt-0.5">Forum tanya jawab siswa SMA dan Mahasiswa IT</p>
        </div>

        {/* Action Button & Search */}
        <div className="space-y-3">
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Cari topik diskusi..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 bg-slate-900 border border-slate-800 focus:border-sky-500/50 rounded-xl px-4 py-2 text-xs font-mono text-white placeholder-slate-500 focus:outline-none"
            />
            {currentUser ? (
              <button
                onClick={() => setIsOpenForm(!isOpenForm)}
                className="py-2 px-3.5 bg-sky-600 hover:bg-sky-500 text-white font-mono text-xs font-bold rounded-xl flex items-center gap-1.5 transition whitespace-nowrap shadow-lg shadow-sky-900/20"
              >
                <Plus className="h-4 w-4" />
                BUAT THREAD
              </button>
            ) : (
              <button
                onClick={() => setIsAuthOpen(true)}
                className="py-2 px-3.5 bg-slate-800 hover:bg-slate-700 text-slate-350 font-mono text-xs rounded-xl flex items-center gap-1.5 transition whitespace-nowrap"
              >
                [ LOGIN_FORUM ]
              </button>
            )}
          </div>
        </div>

        {/* Register Dialog Form inside Column */}
        {isOpenForm && currentUser && (
          <form onSubmit={handleCreatePost} className="p-4 bg-slate-950 border border-sky-500/25 rounded-xl space-y-4">
            <div className="text-[11px] font-mono text-sky-400 font-bold uppercase tracking-wider">
              👉 INSIASI_FORUM_THREAD_BARU
            </div>
            <div>
              <label className="block mb-1 text-[10px] font-mono text-slate-500 uppercase">Judul Diskusi</label>
              <input
                required
                type="text"
                placeholder="E.g., Error Arrow Function di JS"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-xs text-zinc-100 focus:outline-none focus:border-sky-500"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block mb-1 text-[10px] font-mono text-slate-500 uppercase">Kategori</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs font-mono text-white focus:outline-none focus:border-sky-500"
                >
                  {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="flex items-end gap-1 justify-end">
                <button
                  type="button"
                  onClick={() => setIsOpenForm(false)}
                  className="px-3 py-2 bg-slate-905 text-slate-500 rounded-lg text-xs font-mono hover:text-white"
                >
                  BATAL
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-sky-600 text-white rounded-lg text-xs font-mono hover:bg-sky-500 font-bold shadow-lg shadow-sky-900/20"
                >
                  POST_PUBLISH
                </button>
              </div>
            </div>
            <div>
              <label className="block mb-1 text-[10px] font-mono text-slate-500 uppercase">Isi Detail Pertanyaan / Opini</label>
              <textarea
                required
                rows={3}
                placeholder="Tuliskan kesulitan koding atau gagasan kalian disini..."
                value={newContent}
                onChange={(e) => setNewContent(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-zinc-200"
              />
            </div>
          </form>
        )}

        {/* List of posts */}
        <div className="space-y-3 max-h-[55h] overflow-y-auto pr-1">
          {filteredPosts.map((p) => {
            const isSelected = currentPost && currentPost.id === p.id;
            const hasLiked = currentUser && p.likedBy && p.likedBy.includes(currentUser.nisn);
            return (
              <div
                key={p.id}
                onClick={() => { setSelectedPost(p); }}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-sky-950/15 border-sky-500/40'
                    : 'bg-slate-900/50 hover:bg-slate-900 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-[9px] uppercase font-bold text-slate-400 bg-slate-800 rounded px-2 py-0.5 border border-slate-750">
                    {p.category}
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">
                    {p.replies ? p.replies.length : 0} Balasan
                  </span>
                </div>
                <h4 className="text-zinc-100 font-bold text-sm leading-snug mb-1.5">{p.title}</h4>
                <p className="text-slate-455 text-xs line-clamp-2 leading-relaxed mb-3.5">{p.content}</p>

                <div className="flex items-center justify-between pt-3 border-t border-slate-800/60 text-[10px] font-mono text-slate-500" onClick={(e) => e.stopPropagation()}>
                  <div className="flex items-center gap-1">
                    <span className={`inline-block h-1.5 w-1.5 rounded-full ${p.authorRole === 'guru' ? 'bg-indigo-400' : 'bg-sky-400'}`}></span>
                    <span>{p.authorName} ({p.authorRole === 'guru' ? '🧑‍🏫 Guru' : '👨‍🎓 Murid'})</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => toggleLike(p.id)}
                      className={`flex items-center gap-1 hover:text-rose-400 transition-colors focus:outline-none ${
                        hasLiked ? 'text-rose-450' : ''
                      }`}
                    >
                      <Heart className={`h-3 w-3 ${hasLiked ? 'fill-current text-rose-550' : 'text-slate-500'}`} />
                      <span>{p.likes}</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}

          {filteredPosts.length === 0 && (
            <div className="text-center py-10 bg-slate-900/10 border border-slate-800 border-dashed rounded-xl p-4">
              <MessageSquare className="h-6 w-6 text-slate-600 mx-auto mb-2" />
              <p className="text-xs font-mono text-slate-500">Database forum kosong untuk query pencarian Anda.</p>
            </div>
          )}
        </div>
      </div>

      {/* RIGHT COLUMN: Thread Details and Replies List */}
      <div className="lg:col-span-7">
        {currentPost ? (
          <div className="glass-panel p-6 rounded-2xl border border-slate-850 space-y-6">
            {/* Topic Details Header */}
            <div className="border-b border-slate-800 pb-5">
              <div className="flex items-center gap-2 mb-2">
                <span className="font-mono text-[10px] font-bold text-sky-450 px-2 py-0.5 bg-sky-500/10 border border-sky-500/20 rounded">
                  {currentPost.category}
                </span>
                <span className="text-[10px] text-slate-500 font-mono">
                  Post ID: {currentPost.id}
                </span>
              </div>
              <h2 className="text-lg md:text-xl font-bold text-white mb-2 leading-relaxed">
                {currentPost.title}
              </h2>
              <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
                <div className={`h-6 w-6 rounded-md flex items-center justify-center font-bold text-[11px] ${
                  currentPost.authorRole === 'guru' ? 'bg-indigo-500/20 text-indigo-300' : 'bg-sky-500/20 text-sky-300'
                }`}>
                  {currentPost.authorName.charAt(0)}
                </div>
                <div>
                  <span className="text-zinc-200 font-medium">{currentPost.authorName}</span>
                  <span className="text-slate-550 block text-[10px]">
                    {currentPost.authorRole === 'guru' ? '🧑‍🏫 Guru Pembimbing' : '👨‍🎓 Murid Terdaftar'}
                  </span>
                </div>
              </div>

              {/* Main Content Detail */}
              <div className="mt-4 p-4 bg-slate-950 border border-slate-800/80 rounded-xl">
                <p className="text-zinc-300 text-sm leading-relaxed whitespace-pre-wrap font-sans">
                  {currentPost.content}
                </p>
              </div>
            </div>

            {/* Replies section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-mono text-xs text-slate-400 font-bold uppercase">Balasan Diskusi</h4>
                
                {/* Instant AI Mentor response trigger button */}
                {currentUser && (
                  <button
                    onClick={handleAskAiMentor}
                    disabled={isAiAnswering}
                    className="py-1 px-2.5 bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/25 text-indigo-300 rounded-lg text-[10px] font-mono font-bold flex items-center gap-1 shadow-sm transition disabled:opacity-50"
                  >
                    {isAiAnswering ? (
                      <>
                        <Loader2 className="h-3 w-3 animate-spin text-indigo-400" />
                        AI Memproses...
                      </>
                    ) : (
                      <>
                        <Bot className="h-3 w-3 text-indigo-400" />
                        TANYA_AI_MENTOR
                      </>
                    )}
                  </button>
                )}
              </div>

              {/* Reply stream */}
              <div className="space-y-3 max-h-[30vh] overflow-y-auto pr-1">
                {currentPost.replies && currentPost.replies.map((rep) => {
                  const isMentor = rep.content.includes('[RESPON AI MENTOR]');
                  const isGuru = rep.authorRole === 'guru';
                  
                  return (
                    <div 
                      key={rep.id} 
                      className={`p-3.5 rounded-xl border text-xs leading-relaxed ${
                        isMentor 
                          ? 'bg-indigo-950/15 border-indigo-500/20 shadow-sm shadow-indigo-500/2'
                          : isGuru
                            ? 'bg-slate-900 border-indigo-500/10'
                            : 'bg-slate-905 border-slate-800/70'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-1 mb-2">
                        <div className="flex items-center gap-1.5 font-mono text-[10px]">
                          <span className={`inline-block h-1.5 w-1.5 rounded-full ${isMentor ? 'bg-indigo-400 animate-ping' : isGuru ? 'bg-indigo-400' : 'bg-sky-400'}`}></span>
                          <span className="text-zinc-200 font-bold">
                            {isMentor ? '🤖 ITNextGen AI Mentor' : rep.authorName}
                          </span>
                          <span className="text-slate-500">
                            ({isMentor ? 'Asisten Pintar' : rep.authorRole === 'guru' ? '🧑‍🏫 Guru' : '👨‍🎓 Murid'})
                          </span>
                        </div>
                        <span className="text-[9px] text-slate-550 font-mono">Terkirim</span>
                      </div>
                      <p className="text-zinc-300 whitespace-pre-wrap leading-relaxed font-sans">{rep.content}</p>
                    </div>
                  );
                })}

                {(!currentPost.replies || currentPost.replies.length === 0) && (
                  <div className="text-center py-6 bg-slate-950/20 rounded-xl text-slate-550">
                    <HelpCircle className="h-4 w-4 mx-auto text-slate-600 mb-1" />
                    <p className="text-[10px] font-mono">Belum ada tanggapan kelas. Jadilah yang pertama menjawab!</p>
                  </div>
                )}
              </div>

              {/* Reply editor */}
              {currentUser ? (
                <form onSubmit={handleAddReply} className="flex gap-2">
                  <input
                    required
                    type="text"
                    placeholder="Ketik tanggapan atau solusi Anda disini..."
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                    className="flex-grow bg-slate-950 border border-slate-800 focus:border-sky-500/50 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none"
                  />
                  <button
                    type="submit"
                    className="h-10 w-10 sm:w-auto sm:px-4 bg-sky-600 hover:bg-sky-500 text-white font-mono text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition whitespace-nowrap shrink-0 shadow-lg shadow-sky-900/20"
                  >
                    <Send className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">KIRIM</span>
                  </button>
                </form>
              ) : (
                <div className="p-3.5 bg-slate-950 border border-slate-850/50 rounded-xl text-center text-[11px] font-mono text-slate-500">
                  ⚠️ Silakan masuk/registrasi terlebih dahulu untuk menulis balasan atau berdiskusi.
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="glass-panel p-16 text-center rounded-2xl border border-slate-850">
            <MessageSquare className="h-10 w-10 text-slate-600 mx-auto mb-3" />
            <h3 className="font-bold text-white mb-1 font-mono">Forum Diskusi</h3>
            <p className="text-slate-400 text-xs">Pilih salah satu thread postingan di sebelah kiri untuk melihat detail forum.</p>
          </div>
        )}
      </div>
    </div>
  );
}
