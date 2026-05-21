import { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { Play, RotateCcw, Sparkles, Terminal, Cpu, Check, HelpCircle, Loader2, Code2 } from 'lucide-react';

export default function CodingTab() {
  const { optimizeCode } = useApp();
  
  // Compiler/Code state
  const [language, setLanguage] = useState<'javascript' | 'html'>('javascript');
  const [code, setCode] = useState('');
  const [logs, setLogs] = useState<string[]>([]);
  const [htmlPreview, setHtmlPreview] = useState('');
  
  // AI assist states
  const [aiInstruction, setAiInstruction] = useState('Format dan rapikan sintaks');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiTip, setAiTip] = useState('Gunakan menu AI untuk merapikan, mengonversi arrow function, atau menulis algoritma secara otomatis.');

  // Code Templates
  const templates = {
    javascript: `// SIMULASI JAVASCRIPT - ITNextGen.IO\n// Cobalah memanipulasi data nilai murid SMA berikut:\n\nconst nilaiMurid = [82, 45, 90, 78, 65, 88];\n\n// Saring siswa yang lulus (nilai kkm >= 75)\nconst lulus = nilaiMurid.filter(nilai => nilai >= 75);\n\nconsole.log("=== DAFTAR NILAI LULUS ===");\nconsole.log(lulus);\nconsole.log("Rata-rata Kelompok Lulus:");\nconsole.log(lulus.reduce((acc, curr) => acc + curr, 0) / lulus.length);`,
    html: `<!-- SIMULASI HTML & TAILWIND - ITNextGen.IO -->\n<div class="p-6 bg-slate-900 border border-slate-800 rounded-2xl max-w-md mx-auto shadow-xl">\n  <h1 class="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300 font-sans tracking-tight mb-2">\n    ITNextGen Digital Lab\n  </h1>\n  <p className="text-sm text-slate-300 leading-relaxed font-sans mb-4">\n    Simulasi penggabungan HTML5 dengan kekuatan class utilitas Tailwind CSS v4 terbaru!\n  </p>\n  <div class="flex gap-2">\n    <span class="px-2.5 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs rounded-lg font-mono">HTML5</span>\n    <span class="px-2.5 py-1 bg-teal-500/10 text-teal-400 border border-teal-500/20 text-xs rounded-lg font-mono">Tailwind v4</span>\n  </div>\n</div>`
  };

  // Set default template
  useEffect(() => {
    setCode(templates[language]);
    setLogs([]);
    setHtmlPreview('');
  }, [language]);

  const handleReset = () => {
    if (confirm("Reset seluruh kode Anda kembali ke draf awal template?")) {
      setCode(templates[language]);
      setLogs([]);
      setHtmlPreview('');
    }
  };

  const handleRun = () => {
    setLogs([]);
    setHtmlPreview('');

    if (language === 'javascript') {
      const capturedLogs: string[] = [];
      const originalConsoleLog = console.log;
      
      // Override console.log for capturing output
      console.log = (...args) => {
        const formatted = args.map(arg => {
          if (typeof arg === 'object') return JSON.stringify(arg);
          return String(arg);
        }).join(' ');
        capturedLogs.push(formatted);
        originalConsoleLog.apply(console, args);
      };

      try {
        // Create an isolated function scope for safety
        const runner = new Function(code);
        runner();
        
        if (capturedLogs.length === 0) {
          setLogs(['[SYSTEM] Program berhasil berjalan tanpa output console. Cobalah panggil console.log()!']);
        } else {
          setLogs(capturedLogs);
        }
      } catch (err: any) {
        setLogs([`[EXECUTION ERROR] ${err.message}`]);
      } finally {
        // Restore console.log
        console.log = originalConsoleLog;
      }
    } else if (language === 'html') {
      // Direct render html content
      setHtmlPreview(code);
      setLogs(['[SYSTEM] Pratampilan HTML & Tailwind berhasil dirender di panel visual bawah.']);
    }
  };

  const handleAiOptimize = async () => {
    setIsAiLoading(true);
    setAiTip('Menghubungi Gemini 3.5 Flash di Server...');
    try {
      const optimized = await optimizeCode(code, language, aiInstruction);
      setCode(optimized);
      setAiTip(`Kode berhasil dioptimalkan oleh AI menggunakan instruksi: "${aiInstruction}".`);
    } catch (e) {
      setAiTip('Gagal mengoptimasi kode. Silakan periksa koneksi internet.');
    } finally {
      setIsAiLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header and Quick Stats */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-mono font-bold text-white flex items-center gap-2">
            <span>{'> SIMULATOR_COMPILER_VIRTUAL'}</span>
          </h2>
          <p className="text-xs text-slate-400 font-mono mt-0.5">Uji coba program HTML, CSS, JavaScript tanpa install aplikasi apapun</p>
        </div>

        {/* Language toggler */}
        <div className="flex items-center gap-1.5 bg-slate-950 p-1 border border-slate-850 rounded-xl">
          <button
            onClick={() => setLanguage('javascript')}
            className={`px-4 py-2 font-mono text-xs rounded-lg transition-all focus:outline-none ${
              language === 'javascript'
                ? 'bg-sky-500/10 text-sky-400 border border-sky-500/25'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            [ JAVASCRIPT_ES6 ]
          </button>
          <button
            onClick={() => setLanguage('html')}
            className={`px-4 py-2 font-mono text-xs rounded-lg transition-all focus:outline-none ${
              language === 'html'
                ? 'bg-sky-500/10 text-sky-400 border border-sky-500/25'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            [ HTML_TAILWIND ]
          </button>
        </div>
      </div>

      {/* Editor & AI split screen */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Code Editor block (8 Grid) */}
        <div className="lg:col-span-8 flex flex-col bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
          {/* Editor Header Bar */}
          <div className="flex items-center justify-between bg-slate-900 px-5 py-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <span className="flex items-center h-2.5 w-2.5 rounded-full bg-rose-500"></span>
              <span className="flex items-center h-2.5 w-2.5 rounded-full bg-amber-500"></span>
              <span className="flex items-center h-2.5 w-2.5 rounded-full bg-emerald-500"></span>
              <span className="text-[10px] font-mono text-slate-500 ml-2 uppercase">editor_workspace.{language === 'javascript' ? 'js' : 'html'}</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleReset}
                title="Reset ke Template"
                className="p-1 px-2.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg text-xs font-mono transition"
              >
                <div className="flex items-center gap-1">
                  <RotateCcw className="h-3.5 w-3.5" />
                  RESET
                </div>
              </button>
              <button
                onClick={handleRun}
                className="py-1 px-3.5 bg-sky-600 hover:bg-sky-500 text-white rounded-lg text-xs font-bold font-mono transition flex items-center gap-1.5 shadow-lg shadow-sky-900/20"
              >
                <Play className="h-3.5 w-3.5 fill-current" />
                JALANKAN_CODE
              </button>
            </div>
          </div>

          {/* Text Area Ide Simulation */}
          <div className="relative flex">
            {/* Mock line numbers */}
            <div className="hidden sm:flex flex-col bg-slate-950 text-slate-700 font-mono text-xs text-right pr-3 pl-4 py-4 select-none border-r border-slate-900 text-[11px] leading-relaxed">
              {Array.from({ length: Math.max(12, code.split('\n').length) }).map((_, i) => (
                <div key={i}>{i + 1}</div>
              ))}
            </div>
            
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full bg-slate-950 p-4 font-mono text-emerald-300 text-[13px] leading-relaxed resize-y focus:outline-none min-h-[300px] max-h-[500px]"
              spellCheck={false}
              style={{ tabSize: 2 }}
            />
          </div>
        </div>

        {/* AI GRADER / HELPER Panel (4 Grid) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Gemini Code Optimizer Box */}
          <div className="p-5 rounded-2xl glass-panel border border-slate-855 flex flex-col space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 font-mono text-xs font-bold text-sky-400">
                <Sparkles className="h-4 w-4 animate-pulse text-sky-400" />
                AI_DEVELOPER_ASSISTANT
              </div>
              <span className="text-[9px] bg-sky-500/10 text-sky-400 border border-sky-500/20 px-1.5 rounded font-mono">Gemini 3.5</span>
            </div>

            <div className="space-y-3">
              <label className="block text-[10px] uppercase font-mono text-slate-500">PILIH MODE INSTRUKSI ASISTEN</label>
              <select
                value={aiInstruction}
                onChange={(e) => setAiInstruction(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-sky-500 rounded-xl py-2 px-3 text-xs text-zinc-100 font-mono transition focus:outline-none"
              >
                <option value="Format dan rapikan sintaks">Format & Rapikan Sintaks</option>
                <option value="Tulis penjelasan/komentar singkat di setiap baris">Tambahkan Komentar Baris</option>
                <option value="Optimalkan efisiensi algoritma kode ini">Optimalkan Loop & Efisiensi</option>
                <option value="Konversi kode Javascript biasa menjadi sintaks modern ES6 Arrow Function">Ubah ke Arrow Function / ES6</option>
              </select>

              <button
                onClick={handleAiOptimize}
                disabled={isAiLoading || !code}
                className="w-full py-2.5 bg-gradient-to-r from-sky-500 to-indigo-600 text-white font-mono text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 hover:brightness-110 shadow-lg shadow-sky-500/5 transition disabled:opacity-50"
              >
                {isAiLoading ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    Menyinkronkan AI...
                  </>
                ) : (
                  <>
                    <Cpu className="h-3.5 w-3.5" />
                    [ OPTIMASI_KODE_AI ]
                  </>
                )}
              </button>
            </div>

            <div className="p-3 bg-slate-950 border border-slate-850 rounded-xl">
              <div className="text-[10px] font-mono text-slate-500 uppercase mb-1 flex items-center gap-1">
                <HelpCircle className="h-3 w-3 text-indigo-400" /> AI Log & Tip:
              </div>
              <p className="text-[11px] font-mono text-slate-400 leading-relaxed">{aiTip}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Terminal Output & Visual Preview row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 1. Terminal Panel */}
        <div className="flex flex-col bg-slate-950 border border-slate-850 rounded-2xl overflow-hidden min-h-[160px] max-h-[300px]">
          <div className="flex items-center gap-2 bg-slate-900 px-5 py-2.5 border-b border-slate-850">
            <Terminal className="h-4 w-4 text-slate-400" />
            <span className="text-[10px] font-mono font-bold text-slate-300">INTERACTIVE_TERMINAL_OUTPUT</span>
          </div>

          <div className="p-4 overflow-y-auto font-mono text-xs flex-1 space-y-1.5 select-all">
            {logs.map((log, index) => {
              const isError = log.includes('[EXECUTION ERROR]');
              const isSystem = log.includes('[SYSTEM]');
              return (
                <div 
                  key={index}
                  className={`${
                    isError ? 'text-rose-400' : isSystem ? 'text-indigo-400 font-bold' : 'text-zinc-200'
                  }`}
                >
                  <span className="text-slate-600 mr-2">{'>'}</span>
                  {log}
                </div>
              );
            })}

            {logs.length === 0 && (
              <div className="text-slate-600 text-[11px]">Belum ada data eksekusi. Klik tombol hijau "JALANKAN_CODE" di editor untuk memproses logika program.</div>
            )}
          </div>
        </div>

        {/* 2. Visual HTML Renderer Content */}
        <div className="flex flex-col bg-zinc-950 border border-slate-850 rounded-2xl overflow-hidden min-h-[160px]">
          <div className="flex items-center gap-2 bg-slate-900 px-5 py-2.5 border-b border-slate-850">
            <Code2 className="h-4 w-4 text-sky-400" />
            <span className="text-[10px] font-mono font-bold text-slate-300">SANDBOX_VISUAL_PREVIEW (HTML/HTML5)</span>
          </div>

          <div className="p-4 flex-1 flex items-center justify-center bg-zinc-900/60 overflow-auto">
            {htmlPreview ? (
              <div 
                className="w-full h-full min-h-[120px]" 
                dangerouslySetInnerHTML={{ __html: htmlPreview }} 
              />
            ) : (
              <div className="text-center font-mono text-[11px] text-slate-600">
                Pilih mode [ HTML_TAILWIND ] untuk merender kartu interaktif, form desain, atau tombol buatan kalian disini.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
