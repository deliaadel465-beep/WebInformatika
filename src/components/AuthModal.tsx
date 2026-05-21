import { useState, FormEvent } from 'react';
import { useApp } from '../context/AppContext';
import { X, Shield, GraduationCap, Eye, EyeOff, Lock, Mail, User, School, Hash, MessageSquare } from 'lucide-react';

export default function AuthModal() {
  const { isAuthOpen, setIsAuthOpen, login, register, errorMsg, setErrorMsg } = useApp();
  const [isLoginView, setIsLoginView] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  
  // Form States
  const [role, setRole] = useState<'guru' | 'murid'>('murid');
  const [gmail, setGmail] = useState('');
  const [password, setPassword] = useState('');
  const [nisn, setNisn] = useState('');
  const [nama, setNama] = useState('');
  const [kelas, setKelas] = useState('');
  const [sekolah, setSekolah] = useState('');

  if (!isAuthOpen) return null;

  const handleClose = () => {
    setIsAuthOpen(false);
    setErrorMsg(null);
    clearForm();
  };

  const clearForm = () => {
    setGmail('');
    setPassword('');
    setNisn('');
    setNama('');
    setKelas('');
    setSekolah('');
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (isLoginView) {
      const success = await login(gmail, password);
      if (success) handleClose();
    } else {
      const success = await register({
        nisn,
        nama,
        kelas: role === 'guru' ? 'Pengajar' : kelas,
        sekolah,
        gmail,
        password,
        role
      });
      if (success) handleClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="w-full max-w-lg overflow-hidden border border-slate-800 rounded-2xl bg-slate-900 shadow-2xl">
        {/* Header decoration bar */}
        <div className="h-1.5 w-full bg-gradient-to-r from-sky-400 via-sky-500 to-indigo-500"></div>

        {/* Modal Controls */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
          <div>
            <h3 className="font-mono text-lg font-bold text-white flex items-center gap-1.5">
              <span>{isLoginView ? '> SESSION_INIT' : '> CREATE_USER_DB'}</span>
            </h3>
            <p className="text-xs text-slate-400 font-mono">ITNextGen.IO Portal</p>
          </div>
          <button 
            onClick={handleClose}
            className="p-1 px-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Main Body */}
        <div className="p-6 max-h-[80vh] overflow-y-auto">
          {errorMsg && (
            <div className="mb-4 p-3.5 bg-rose-500/10 border border-rose-500/30 text-rose-300 rounded-lg text-xs font-mono flex items-center gap-2">
              <span className="shrink-0 inline-block h-2 w-2 rounded-full bg-rose-500 animate-ping"></span>
              <span>ERROR: {errorMsg}</span>
            </div>
          )}

          {/* View Toggles */}
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl mb-6 border border-slate-800">
            <button
              onClick={() => { setIsLoginView(true); setErrorMsg(null); }}
              className={`flex-1 py-2 font-mono text-xs font-medium rounded-lg transition ${
                isLoginView ? 'bg-sky-500/10 text-sky-400 border border-sky-500/30' : 'text-slate-400 hover:text-white'
              }`}
            >
              [ LOGIN_PORTAL ]
            </button>
            <button
              onClick={() => { setIsLoginView(false); setErrorMsg(null); }}
              className={`flex-1 py-2 font-mono text-xs font-medium rounded-lg transition ${
                !isLoginView ? 'bg-sky-500/10 text-sky-400 border border-sky-500/30' : 'text-slate-400 hover:text-white'
              }`}
            >
              [ SIGN_UP_DB ]
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* registration inputs */}
            {!isLoginView && (
              <>
                {/* Role Switcher */}
                <div>
                  <label className="block mb-2 font-mono text-[11px] uppercase tracking-wider text-slate-400">PILIH STATUS KEAHLIAN / PERAN</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setRole('murid')}
                      className={`flex items-center justify-center gap-2 py-3 rounded-xl border font-semibold text-sm transition ${
                        role === 'murid'
                          ? 'bg-sky-500/10 border-sky-500 text-sky-305'
                          : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-zinc-200'
                      }`}
                    >
                      <GraduationCap className="h-4 w-4" />
                      Daftar sebagai Murid
                    </button>
                    <button
                      type="button"
                      onClick={() => setRole('guru')}
                      className={`flex items-center justify-center gap-2 py-3 rounded-xl border font-semibold text-sm transition ${
                        role === 'guru'
                          ? 'bg-indigo-500/10 border-indigo-500 text-indigo-300'
                          : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-zinc-200'
                      }`}
                    >
                      <Shield className="h-4 w-4" />
                      Daftar sebagai Guru
                    </button>
                  </div>
                </div>

                {/* Primary Key - NISN / NIP */}
                <div>
                  <label className="block mb-1.5 font-mono text-[11px] uppercase tracking-wider text-slate-400">
                    {role === 'murid' ? 'ID SISWA / NISN (Primary Key)' : 'ID GURU / NIP / NUPTK (Primary Key)'}
                  </label>
                  <div className="relative">
                    <Hash className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
                    <input
                      required
                      type="text"
                      value={nisn}
                      onChange={(e) => setNisn(e.target.value.replace(/[^0-9]/g, ''))}
                      placeholder={role === 'murid' ? 'Masukkan 8-10 digit NISN Anda' : 'Masukkan NIP/ID Pengajar'}
                      className="w-full bg-slate-950 border border-slate-800 focus:border-sky-500/50 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white placeholder-slate-600 font-mono transition focus:outline-none"
                    />
                  </div>
                </div>

                {/* Full name */}
                <div>
                  <label className="block mb-1.5 font-mono text-[11px] uppercase tracking-wider text-slate-400">NAMA LENGKAP</label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
                    <input
                      required
                      type="text"
                      value={nama}
                      onChange={(e) => setNama(e.target.value)}
                      placeholder="Masukkan nama lengkap sesuai absen"
                      className="w-full bg-slate-950 border border-slate-800 focus:border-sky-500/50 rounded-xl py-2.5 pl-10 pr-4 text-sm text-zinc-100 placeholder-slate-600 transition focus:outline-none"
                    />
                  </div>
                </div>

                {/* Class / Subject */}
                {role === 'murid' && (
                  <div>
                    <label className="block mb-1.5 font-mono text-[11px] uppercase tracking-wider text-slate-400">KELAS AKADEMIK</label>
                    <select
                      required
                      value={kelas}
                      onChange={(e) => setKelas(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 focus:border-sky-500/50 rounded-xl py-2.5 px-4 text-sm text-zinc-100 transition focus:outline-none font-mono"
                    >
                      <option value="" disabled>-- Pilih Kelas --</option>
                      <option value="X-PPLG-1">Kelas X - PPLG 1 (Coding & Dev)</option>
                      <option value="X-PPLG-2">Kelas X - PPLG 2</option>
                      <option value="XI-RPL-1">Kelas XI - Rekayasa Perangkat Lunak 1</option>
                      <option value="XI-RPL-2">Kelas XI - Rekayasa Perangkat Lunak 2</option>
                      <option value="XII-Informatika">Kelas XII - Informatika Peminatan</option>
                      <option value="Mahasiswa-IT">Mahasiswa Komputer / Umum</option>
                    </select>
                  </div>
                )}

                {/* School Name */}
                <div>
                  <label className="block mb-1.5 font-mono text-[11px] uppercase tracking-wider text-slate-400">SEKOLAH / INSTITUSI PENDIDIKAN</label>
                  <div className="relative">
                    <School className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
                    <input
                      required
                      type="text"
                      value={sekolah}
                      onChange={(e) => setSekolah(e.target.value)}
                      placeholder="E.g., SMA Negeri 1 Jakarta / Universitas Indonesia"
                      className="w-full bg-slate-950 border border-slate-800 focus:border-sky-500/50 rounded-xl py-2.5 pl-10 pr-4 text-sm text-zinc-100 placeholder-slate-600 transition focus:outline-none"
                    />
                  </div>
                </div>
              </>
            )}

            {/* Common Auth Fields (Gmail, Password) */}
            <div>
              <label className="block mb-1.5 font-mono text-[11px] uppercase tracking-wider text-slate-400">GMAIL ADDRESS</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
                <input
                  required
                  type="email"
                  value={gmail}
                  onChange={(e) => setGmail(e.target.value)}
                  placeholder="E.g., nama@gmail.com atau student@itnextgen.io"
                  className="w-full bg-slate-950 border border-slate-800 focus:border-sky-500/50 rounded-xl py-2.5 pl-10 pr-4 text-sm text-zinc-100 placeholder-slate-600 font-mono transition focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block mb-1.5 font-mono text-[11px] uppercase tracking-wider text-slate-400 font-medium">PASSWORD AKSES</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
                <input
                  required
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-950 border border-slate-800 focus:border-sky-500/50 rounded-xl py-2.5 pl-10 pr-12 text-sm text-zinc-100 placeholder-slate-600 font-mono transition focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-2.5 p-1 text-slate-500 hover:text-white transition"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Button */}
            <div className="pt-4">
              <button
                type="submit"
                className="w-full py-3 px-4 rounded-xl font-semibold text-center text-sm transition focus:outline-none bg-gradient-to-r from-sky-500 to-indigo-650 text-white hover:from-sky-400 hover:to-indigo-500 shadow-lg shadow-sky-500/10 glow-btn"
              >
                {isLoginView ? '[ AUTHENTICATE_SESSION ]' : '[ COMMIT_NEW_USER_TO_DB ]'}
              </button>
            </div>
          </form>

          {/* Quick Demo Credentials helper */}
          {isLoginView && (
            <div className="mt-5 p-3.5 bg-slate-950 border border-slate-800 rounded-xl font-mono text-[11px]">
              <div className="text-slate-400 mb-1.5 uppercase font-bold text-[10px] tracking-wider">⚡ DEMO_CREDENTIALS / AKUN SEED:</div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-slate-300 font-mono">
                <div className="bg-slate-900 border border-slate-800/60 p-2 rounded">
                  <div className="font-semibold text-sky-400 text-[10px]">👩‍🎓 AKUN MURID (STUDENT):</div>
                  <div>Gmail: <span className="text-white">student@itnextgen.io</span></div>
                  <div>Pass: <span className="text-white">password</span></div>
                </div>
                <div className="bg-slate-900 border border-slate-800/60 p-2 rounded">
                  <div className="font-semibold text-indigo-400 text-[10px]">🧑‍🏫 AKUN GURU (TEACHER):</div>
                  <div>Gmail: <span className="text-white">teacher@itnextgen.io</span></div>
                  <div>Pass: <span className="text-white">password</span></div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
