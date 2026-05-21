import { useState, FormEvent } from 'react';
import { useApp } from '../context/AppContext';
import { Hash, MapPin, AlignLeft, Calendar, FileCode, CheckCircle, Clock, Sparkles, Loader2, Save, FileSpreadsheet, Send, Award, Trash, Filter } from 'lucide-react';
import { Task, TaskSubmission } from '../types';

export default function TugasTab() {
  const { tasks, submissions, currentUser, addTask, submitTask, gradeSubmission, getAiGradingSuggestion, setIsAuthOpen } = useApp();

  // Selected states
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [activeSubTab, setActiveSubTab] = useState<'daftar' | 'kumpul' | 'penilaian'>('daftar');
  
  // Student Submission Editor
  const [studentCode, setStudentCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Teacher Create Task Form
  const [isOpenForm, setIsOpenForm] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newLang, setNewLang] = useState('javascript');
  const [newTemplate, setNewTemplate] = useState('');
  const [newExpected, setNewExpected] = useState('');
  const [newDue, setNewDue] = useState('2026-06-30');
  const [newTopic, setNewTopic] = useState('Frontend');

  // Teacher Grading States
  const [activeSubmission, setActiveSubmission] = useState<TaskSubmission | null>(null);
  const [inputScore, setInputScore] = useState(90);
  const [inputFeedback, setInputFeedback] = useState('');
  const [isAiGrading, setIsAiGrading] = useState(false);

  const currentTask = selectedTask || (tasks.length > 0 ? tasks[0] : null);

  // Student states helpers
  const getSubmissionForTask = (taskId: string) => {
    return submissions.find(s => s.taskId === taskId);
  };

  const handleCreateTaskByTeacher = async (e: FormEvent) => {
    e.preventDefault();
    const success = await addTask({
      title: newTitle,
      description: newDesc,
      language: newLang,
      codeTemplate: newTemplate,
      expectedOutput: newExpected,
      dueDate: newDue,
      weeklyTopic: newTopic
    });
    if (success) {
      setIsOpenForm(false);
      clearTaskForm();
    }
  };

  const clearTaskForm = () => {
    setNewTitle('');
    setNewDesc('');
    setNewLang('javascript');
    setNewTemplate('');
    setNewExpected('');
    setNewDue('2026-06-15');
    setNewTopic('Frontend');
  };

  const handleStudentSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!currentUser || !currentTask) return;
    setIsSubmitting(true);
    try {
      const success = await submitTask(currentTask.id, currentTask.title, studentCode);
      if (success) {
        alert("Tugas berhasil dikumpulkan ke database ITNextGen.IO! Menunggu evaluasi kelayakan dari Guru.");
        setStudentCode('');
        setActiveSubTab('daftar');
      }
    } catch {
      alert("Gagal mengumpulkan tugas.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAiAutoGrade = async () => {
    if (!activeSubmission || !currentTask) return;
    setIsAiGrading(true);
    try {
      const suggestion = await getAiGradingSuggestion(activeSubmission.code, currentTask);
      setInputScore(suggestion.score);
      setInputFeedback(`🤖 [Saran Evaluator AI Gemini]:\n${suggestion.feedback}`);
    } catch (e) {
      console.error(e);
    } finally {
      setIsAiGrading(false);
    }
  };

  const handlePostGradeByTeacher = async (e: FormEvent) => {
    e.preventDefault();
    if (!activeSubmission) return;
    const success = await gradeSubmission(activeSubmission.id, inputScore, inputFeedback);
    if (success) {
      alert("Nilai akademik siswa berhasil disimpan kedalam database registrasi!");
      setActiveSubmission(null);
      setInputFeedback('');
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* LEFT COLUMN: List of Homework assignments (4 Grid) */}
      <div className="lg:col-span-4 space-y-6">
        <div>
          <h2 className="text-lg font-mono font-bold text-white flex items-center gap-2">
            <span>{'> HOMEWORK_ASSIGNMENT'}</span>
          </h2>
          <p className="text-xs text-slate-400 font-mono mt-0.5">Forum tugas koding untuk asah pemahaman logika</p>
        </div>

        {currentUser && currentUser.role === 'guru' && (
          <button
            onClick={() => { setIsOpenForm(!isOpenForm); clearTaskForm(); }}
            className="w-full py-3 px-4 rounded-xl font-semibold text-center text-xs font-mono transition flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500/10 to-indigo-500/10 border border-indigo-500/30 text-indigo-300 hover:bg-slate-900"
          >
            {isOpenForm ? '[ TUTUP_INPUT_TUGAS ]' : '[ ATUR_TUGAS_KELAS_BARU ]'}
          </button>
        )}

        {/* Task Cards List */}
        <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
          {tasks.map((t) => {
            const isSelected = currentTask && currentTask.id === t.id;
            const sub = getSubmissionForTask(t.id);
            return (
              <div
                key={t.id}
                onClick={() => { setSelectedTask(t); setStudentCode(t.codeTemplate); setActiveSubmission(null); }}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-sky-950/20 border-sky-500/40'
                    : 'bg-slate-900/60 hover:bg-slate-900 border-slate-800'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-[9px] uppercase font-bold text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 rounded px-2 py-0.5">
                    Modul {t.weeklyTopic}
                  </span>
                  {/* Submission badges for murid */}
                  {currentUser && currentUser.role === 'murid' && (
                    sub ? (
                      sub.status === 'graded' ? (
                        <span className="text-[10px] font-bold text-sky-400 font-mono">Nilai: {sub.score}</span>
                      ) : (
                        <span className="text-[9px] text-amber-400 font-mono px-1.5 py-0.5 bg-amber-500/10 rounded">Menunggu</span>
                      )
                    ) : (
                      <span className="text-[9px] text-rose-400 font-mono px-1.5 py-0.5 bg-rose-500/10 rounded">Belum Kumpul</span>
                    )
                  )}
                </div>
                <h4 className="text-zinc-100 font-bold text-sm leading-snug mb-1">{t.title}</h4>
                
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-800/40 text-[10px] font-mono text-slate-500">
                  <span className="flex items-center gap-1"><FileCode className="h-3 w-3" /> Language: {t.language.toUpperCase()}</span>
                  <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> Due: {t.dueDate}</span>
                </div>
              </div>
            );
          })}

          {tasks.length === 0 && (
            <div className="text-center py-10 bg-slate-900/10 border border-slate-800 border-dashed rounded-xl p-4">
              <Calendar className="h-6 w-6 text-slate-600 mx-auto mb-2" />
              <p className="text-xs font-mono text-slate-500">Grup tugas kosong / Guru belum memposting tugas.</p>
            </div>
          )}
        </div>
      </div>

      {/* RIGHT COLUMN: Submission Desk or Assignment Creation Workspace (8 Grid) */}
      <div className="lg:col-span-8">
        {isOpenForm ? (
          /* Teacher Task Creator Form */
          <div className="glass-panel p-6 rounded-2xl border border-slate-800/80 space-y-6">
            <div>
              <h3 className="font-mono text-base font-bold text-indigo-300 flex items-center gap-1.5">
                <span>{'> CREATE_NEW_CODE_CHALLENGE'}</span>
              </h3>
              <p className="text-xs text-slate-400 font-mono">Formulir rancangan soal untuk diselesaikan se-kelas</p>
            </div>

            <form onSubmit={handleCreateTaskByTeacher} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                <div className="md:col-span-8">
                  <label className="block mb-1.5 font-mono text-xs text-slate-450 uppercase">Judul Tugas Pemrograman</label>
                  <input
                    required
                    type="text"
                    placeholder="E.g., Arrow Function Perkalian Dasar"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-zinc-150 focus:border-indigo-500"
                  />
                </div>
                <div className="md:col-span-4 grid grid-cols-2 gap-2">
                  <div>
                    <label className="block mb-1.5 font-mono text-xs text-slate-450 uppercase">Bahasa</label>
                    <select
                      value={newLang}
                      onChange={(e) => setNewLang(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-1 text-sm text-zinc-150 font-mono"
                    >
                      <option value="javascript">JavaScript</option>
                      <option value="html">HTML</option>
                    </select>
                  </div>
                  <div>
                    <label className="block mb-1.5 font-mono text-xs text-slate-450 uppercase">Kategori</label>
                    <select
                      value={newTopic}
                      onChange={(e) => setNewTopic(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-1 text-sm text-zinc-150 font-mono"
                    >
                      <option value="AI">AI</option>
                      <option value="Frontend">Frontend</option>
                      <option value="Backend">Backend</option>
                      <option value="Javascript">Javascript</option>
                    </select>
                  </div>
                </div>
              </div>

              <div>
                <label className="block mb-1.5 font-mono text-xs text-slate-450 uppercase">Deskripsi Penjelasan Tugas</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Instruksi soal, kriteria kelayakan, dan hasil output yang diinginkan untuk dicari siswa..."
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-sm text-zinc-200"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1.5 font-mono text-xs text-slate-450 uppercase">Template Kode Awal (Draf Siswa)</label>
                  <textarea
                    required
                    rows={4}
                    placeholder={`// Template awal yang tampil di editor koding siswa`}
                    value={newTemplate}
                    onChange={(e) => setNewTemplate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs font-mono text-sky-305"
                  />
                </div>
                <div>
                  <label className="block mb-1.5 font-mono text-xs text-slate-450 uppercase">Kata Kunci Output / KKM Validasi (Opsional)</label>
                  <input
                    type="text"
                    placeholder="E.g., bg-sky-400 atau hasil integer '100'"
                    value={newExpected}
                    onChange={(e) => setNewExpected(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-4 text-xs font-mono text-white"
                  />
                  <div className="mt-3">
                    <label className="block mb-1 text-[10px] font-mono text-slate-500 uppercase">Batas Waktu Pengumpulan</label>
                    <input
                      required
                      type="date"
                      value={newDue}
                      onChange={(e) => setNewDue(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white font-mono"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsOpenForm(false)}
                  className="px-4 py-2 bg-slate-950 text-slate-400 text-xs font-mono rounded"
                >
                  BATAL
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 text-white text-xs font-mono rounded font-bold hover:bg-indigo-500"
                >
                  SUBMIT_TUGAS_BARU
                </button>
              </div>
            </form>
          </div>
        ) : (
          /* TASK WORKSPACE LAYOUT */
          currentUser ? (
            currentUser.role === 'murid' ? (              /* STUDENT SUBMISSION WORKSPACE */
              currentTask ? (
                <div className="glass-panel p-6 rounded-2xl border border-slate-850 space-y-6">
                  {/* Task Instructions */}
                  <div className="border-b border-slate-800 pb-5">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-mono text-xs text-sky-400 bg-sky-500/10 px-2 py-0.5 border border-sky-500/20 rounded">
                        MATA PELAJARAN: {currentTask.weeklyTopic}
                      </span>
                      <span className="font-mono text-[10px] text-zinc-500">Task ID: {currentTask.id}</span>
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">{currentTask.title}</h3>
                    <p className="text-sm text-slate-350 leading-relaxed font-sans">{currentTask.description}</p>
                    
                    <div className="flex items-center gap-4 mt-3 text-xs font-mono text-slate-500">
                      <span>Batas Kumpul: <span className="text-rose-450 font-semibold">{currentTask.dueDate}</span></span>
                      <span>Format: {currentTask.language.toUpperCase()}</span>
                    </div>
                  </div>

                  {/* Submission Status Display */}
                  {(() => {
                    const sub = getSubmissionForTask(currentTask.id);
                    if (sub) {
                      return (
                        <div className="space-y-4">
                          <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-3">
                            <div className="flex items-center justify-between">
                              <span className="font-mono text-xs font-bold text-sky-400 flex items-center gap-1.5">
                                <CheckCircle className="h-4 w-4" />
                                TUGAS_TELAH_DIKUMPULKAN
                              </span>
                              <span className="text-[10px] text-slate-500 font-mono">Status: {sub.status === 'graded' ? 'Telah Dinilai' : 'Menunggu Koreksi'}</span>
                            </div>
                            <div className="text-xs">
                              <div className="text-slate-500 font-mono mb-1">LAMPIRAN KODE ANDA:</div>
                              <pre className="p-3 bg-zinc-950 text-sky-300 font-mono rounded-lg border border-slate-900 overflow-x-auto">{sub.code}</pre>
                            </div>
                          </div>

                          {sub.status === 'graded' && (
                            <div className="p-5 bg-gradient-to-br from-indigo-950/20 via-slate-900 to-sky-950/10 border border-indigo-500/30 rounded-2xl space-y-3 shadow-md">
                              <div className="flex items-center justify-between">
                                <span className="font-mono text-xs font-bold text-indigo-300 flex items-center gap-1"><Award className="h-4 w-4" /> EVALUASI_GURU_KELAS_SMA</span>
                                <span className="text-2xl font-mono text-sky-400 font-extrabold font-black bg-sky-500/10 px-4 py-1.5 rounded-xl border border-sky-500/40">{sub.score} / 100</span>
                              </div>
                              <div className="text-xs space-y-1.5">
                                <div className="text-slate-400 font-semibold">Tanggapan & Konstruktif Guru:</div>
                                <p className="text-zinc-250 leading-relaxed whitespace-pre-wrap italic font-sans">{sub.feedback}</p>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    } else {
                      /* Student submission editor form */
                      return (
                        <form onSubmit={handleStudentSubmit} className="space-y-4">
                          <div>
                            <label className="block mb-1.5 font-mono text-xs text-sky-450 uppercase font-bold">KANS LEMBAR JAWABAN KODE</label>
                            <textarea
                              required
                              rows={8}
                              value={studentCode}
                              onChange={(e) => setStudentCode(e.target.value)}
                              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-xs text-sky-305 font-mono"
                              spellCheck={false}
                            />
                          </div>

                          <div className="flex justify-end pt-1">
                            <button
                              type="submit"
                              disabled={isSubmitting}
                              className="py-2.5 px-6 font-mono text-xs font-bold bg-sky-600 hover:bg-sky-500 text-white rounded-xl flex items-center gap-1.5 transition disabled:opacity-50 shadow-lg shadow-sky-900/20"
                            >
                              {isSubmitting ? (
                                <>
                                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                  Memproses Submisi...
                                </>
                              ) : (
                                <>
                                  <Send className="h-3.5 w-3.5" />
                                  [ KIRIM_TUGAS_KE_GURU ]
                                </>
                              )}
                            </button>
                          </div>
                        </form>
                      );
                    }
                  })()}
                </div>
              ) : (
                <div className="glass-panel p-16 text-center rounded-2xl">
                  <Calendar className="h-8 w-8 text-slate-600 mx-auto mb-2" />
                  <p className="text-xs text-slate-400">Pilih tugas yang ingin dimuat.</p>
                </div>
              )
            ) : (
              /* GURU / TEACHER SCREEN: SUBMISSION EVALUATOR & TASK TRACKER */
              <div className="space-y-6">
                {/* Active assessment workspace */}
                {activeSubmission ? (
                  <div className="glass-panel p-6 rounded-2xl border border-indigo-500/30 space-y-5">
                    {/* Header evaluation info */}
                    <div className="border-b border-slate-800 pb-4">
                      <div className="flex items-center justify-between flex-wrap gap-2 mb-2">
                        <span className="font-mono text-xs font-bold text-indigo-400 px-2 py-0.5 bg-indigo-500/10 border border-indigo-500/20 rounded">
                          📚 EVALUASI TUGAS: {activeSubmission.taskTitle}
                        </span>
                        <button
                          onClick={() => setActiveSubmission(null)}
                          className="text-[10px] font-mono text-slate-500 hover:text-white"
                        >
                          [ KEMBALI ]
                        </button>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-xs font-mono text-slate-400 mt-2">
                        <div>Siswa: <span className="text-white font-semibold">{activeSubmission.studentName}</span></div>
                        <div>Kelas: <span className="text-white font-semibold">{activeSubmission.studentKelas}</span></div>
                        <div>NISN: <span className="text-white font-semibold">{activeSubmission.studentNisn}</span></div>
                      </div>
                    </div>

                    {/* View code side by side */}
                    <div className="text-xs space-y-1.5">
                      <div className="text-slate-400 font-mono">KODE HASIL SUBMISI SISWA:</div>
                      <pre className="p-4 bg-slate-950 font-mono text-sky-300 rounded-xl border border-slate-900 overflow-x-auto min-h-[100px] max-h-[250px]">{activeSubmission.code}</pre>
                    </div>

                    {/* Grading Form */}
                    <form onSubmit={handlePostGradeByTeacher} className="space-y-4 pt-3 border-t border-slate-850">
                      {/* AI Assistance Button */}
                      <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-xs text-indigo-300 font-bold flex items-center gap-1.5">
                            <Sparkles className="h-4 w-4 animate-pulse text-indigo-400" />
                            GEMINI_AI_GRADING_SUGGESTION
                          </span>
                          <span className="text-[9px] bg-indigo-500/10 text-indigo-300 px-1.5 py-0.5 rounded border border-indigo-500/20 font-mono">Aktif</span>
                        </div>
                        <p className="text-xs text-slate-400">Guru malas manual? Klik tombol di bawah untuk menyuruh Gemini AI membaca, menganalisis struktur koding, mengecek fungsionalitas, memberikan saran nilai dan masukan instan!</p>
                        
                        <button
                          type="button"
                          disabled={isAiGrading}
                          onClick={handleAiAutoGrade}
                          className="w-full py-2 bg-gradient-to-r from-indigo-600 to-sky-600 text-white font-semibold text-xs font-mono rounded-lg flex items-center justify-center gap-1.5 hover:brightness-110 disabled:opacity-50"
                        >
                          {isAiGrading ? (
                            <>
                              <Loader2 className="h-3.5 w-3.5 animate-spin text-white" />
                              Menyinkronkan Penilaian AI...
                            </>
                          ) : (
                            <>
                              <Sparkles className="h-3.5 w-3.5" />
                              [ RUN_AI_AUTO_GRADER ]
                            </>
                          )}
                        </button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                          <label className="block mb-1.5 font-mono text-xs text-slate-450 uppercase">Input Nilai Murid</label>
                          <input
                            required
                            type="number"
                            min={0}
                            max={100}
                            value={inputScore}
                            onChange={(e) => setInputScore(parseInt(e.target.value))}
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-center text-white font-mono"
                          />
                        </div>
                        <div className="md:col-span-3">
                          <label className="block mb-1.5 font-mono text-xs text-slate-450 uppercase">Tanggapan & Feedback Konstruktif Guru</label>
                          <textarea
                            required
                            rows={3}
                            placeholder="Tuliskan kritikan yang membina, evaluasi algoritma, atau penjelasan pengerjaan..."
                            value={inputFeedback}
                            onChange={(e) => setInputFeedback(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-zinc-150 font-mono focus:outline-none focus:border-indigo-500"
                          />
                        </div>
                      </div>

                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setActiveSubmission(null)}
                          className="px-4 py-2 bg-slate-950 border border-slate-850 text-slate-400 font-mono text-xs rounded hover:text-white"
                        >
                          BATAL
                        </button>
                        <button
                          type="submit"
                          className="px-5 py-2 bg-sky-600 hover:bg-sky-500 text-white text-xs font-mono font-bold rounded flex items-center gap-1.5 shadow-lg shadow-sky-900/20"
                        >
                          <Save className="h-3.5 w-3.5" />
                          PUBLISH_NILAI_FISIK
                        </button>
                      </div>
                    </form>
                  </div>
                ) : (
                  /* List of all submissions to grade */
                  <div className="glass-panel p-6 rounded-2xl border border-slate-850 space-y-4">
                    <div>
                      <h4 className="font-mono text-xs font-bold text-white uppercase flex items-center gap-2">
                        <span>{'> GRADING_PORTAL_STUDENTS'}</span>
                      </h4>
                      <p className="text-xs text-slate-400 font-mono">Daftar lampiran lembar tugas siswa siap dikoreksi</p>
                    </div>

                    <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-1">
                      {submissions.map((sub) => {
                        const isGraded = sub.status === 'graded';
                        return (
                          <div 
                            key={sub.id}
                            className="p-4 bg-slate-900/60 hover:bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl flex items-center justify-between gap-4 flex-wrap"
                          >
                            <div className="space-y-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-mono text-[10px] font-bold text-white">{sub.studentName} ({sub.studentKelas})</span>
                                <span className={`text-[9px] px-2 py-0.5 rounded font-mono ${
                                  isGraded 
                                    ? 'bg-sky-500/10 text-sky-400 border border-sky-500/20'
                                    : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                                }`}>
                                  {isGraded ? 'Telah Dinilai' : 'Belum Dinilai'}
                                </span>
                              </div>
                              <p className="text-xs font-medium text-slate-405">Tugas: {sub.taskTitle}</p>
                              <div className="text-[10px] text-slate-500 font-mono">Diserahkan: {sub.dateSubmitted.slice(0, 10)}</div>
                            </div>

                            <button
                              onClick={() => {
                                setActiveSubmission(sub);
                                setInputScore(sub.score || 90);
                                setInputFeedback(sub.feedback || '');
                              }}
                              className={`py-2 px-3.5 font-mono text-xs font-semibold rounded-lg border transition ${
                                isGraded 
                                  ? 'bg-slate-800 border-slate-700 text-slate-350 hover:bg-slate-705'
                                  : 'bg-indigo-650 hover:bg-indigo-600 border-transparent text-white'
                              }`}
                            >
                              {isGraded ? '[ LIHAT_EDIT_NILAI ]' : '[ JALANKAN_KOREKSI ]'}
                            </button>
                          </div>
                        );
                      })}

                      {submissions.length === 0 && (
                        <div className="text-center py-12 text-slate-550 border border-slate-800 border-dashed rounded-xl">
                          <FileSpreadsheet className="h-6 w-6 mx-auto text-slate-650 mb-1.5" />
                          <p className="text-xs font-mono">Belum ada siswa yang menyetorkan lembar jawaban tugas koding.</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )
          ) : (
            <div className="glass-panel p-16 text-center rounded-2xl border border-slate-850">
              <Clock className="h-10 w-10 text-slate-600 mx-auto mb-3" />
              <h3 className="font-bold text-white mb-1 font-mono">Sistem Evaluasi Tugas</h3>
              <p className="text-slate-400 text-xs mb-4">Silakan login sebagai Murid untuk melihat/mengumpulkan tugas, atau login sebagai Guru untuk mengoreksi tugas murni berbasis AI.</p>
              <button
                onClick={() => setIsAuthOpen(true)}
                className="py-2.5 px-6 font-mono text-xs font-bold rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 text-white transition focus:outline-none shadow-lg shadow-sky-500/5"
              >
                [ LOGIN_ITNEXTGEN_PORTAL ]
              </button>
            </div>
          )
        )}
      </div>
    </div>
  );
}
