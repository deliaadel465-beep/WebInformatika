import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const app = express();
const PORT = 3000;
const DB_FILE = path.join(process.cwd(), 'db.json');

// Middleware to parse JSON
app.use(express.json());

// Initialize Gemini API client lazily to avoid crashing on startup if key is missing
let aiInstance: GoogleGenAI | null = null;
function getGemini(): GoogleGenAI | null {
  if (!aiInstance) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey && apiKey !== "MY_GEMINI_API_KEY" && apiKey.trim() !== "") {
      try {
        aiInstance = new GoogleGenAI({
          apiKey: apiKey,
          httpOptions: {
            headers: {
              'User-Agent': 'aistudio-build',
            }
          }
        });
        console.log("Gemini API initialized successfully.");
      } catch (e) {
        console.error("Failed to initialize Gemini API:", e);
      }
    } else {
      console.warn("GEMINI_API_KEY is not configured or uses placeholder. AI features will run in sandbox/mock mode.");
    }
  }
  return aiInstance;
}

// Ensure database file exists
interface DatabaseSchema {
  users: any[];
  materials: any[];
  tasks: any[];
  submissions: any[];
  forum: any[];
}

const initialDb: DatabaseSchema = {
  users: [
    {
      nisn: '12345678', // Default Student
      nama: 'Andi Saputra',
      kelas: 'XI-RPL-1',
      sekolah: 'SMA Negeri 1 Jakarta',
      gmail: 'student@itnextgen.io',
      password: 'password',
      role: 'murid',
      createdAt: new Date().toISOString()
    },
    {
      nisn: '87654321', // Default Teacher
      nama: 'Budi Hartono, S.Kom',
      kelas: 'XII-RPL & XI-PPLG',
      sekolah: 'SMA Negeri 1 Jakarta',
      gmail: 'teacher@itnextgen.io',
      password: 'password',
      role: 'guru',
      createdAt: new Date().toISOString()
    }
  ],
  materials: [
    {
      id: 'mat-1',
      title: 'Pengenalan Kecerdasan Buatan & Prompt Engineering',
      week: 1,
      topic: 'Kecerdasan Buatan (AI)',
      content: `### Apa itu Artificial Intelligence & LLM?
Artificial Intelligence (AI) atau Kecerdasan Buatan adalah simulasi dari kecerdasan manusia yang diproses oleh mesin, khususnya sistem komputer. Belakangan ini, teknologi Large Language Model (LLM) seperti Gemini merombak lanskap industri teknologi.

Sebagai developer masa depan, kemampuan berinteraksi dengan AI sangat krusial.

### Konsep Dasar Prompt Engineering
Prompt Engineering adalah seni dan teknik merumuskan instruksi (prompt) yang jelas agar model AI dapat menghasilkan output terbaik dan paling akurat sesuai keinginan kita.

#### Aturan Emas Membuat Prompt:
1. **Role (Peran):** Tentukan peran AI (misal: "Anda adalah pakar keamanan siber").
2. **Context (Konteks):** Berikan latar belakang masalah.
3. **Task (Tugas):** Terangkan dengan detail apa yang harus dikerjakan.
4. **Constraint (Batasan):** Berikan batasan (misal: "Tuliskan dalam 3 paragraf saja, hindari kata teknis berlebihan").

### Contoh Praktis dalam Coding
Saat meminta AI menjelaskan kode, gunakan format terstruktur:
\`\`\`text
Anda adalah interpreter JavaScript senior. Jelaskan fungsionalitas dari kode berikut dan telusuri waktu eksekusinya:
const data = [1, 2, 3].map(x => x * 2);
\`\`\`
`,
      summary: 'Mempelajari konsep AI terbaru, cara kerja LLM, dan cara memaksimalkannya lewat Prompt Engineering yang efektif.',
      category: 'AI',
      dateAdded: new Date().toISOString(),
      authorName: 'Budi Hartono, S.Kom'
    },
    {
      id: 'mat-2',
      title: 'Desain Berkelas Menggunakan Tailwind CSS v4',
      week: 2,
      topic: 'Frontend Development',
      content: `### Mengapa Tailwind CSS v4 Menjadi Standar Baru?
Tailwind CSS adalah utility-first CSS framework yang memungkinkan kita membangun tampilan aplikasi web modern langsung di dalam file HTML/JSX tanpa perlu menulis file CSS terpisah. 

Pada versi 4 terbaru, Tailwind memperkenalkan compiler super cepat yang berbasis Rust dan cara integrasi yang jauh lebih simpel tanpa config JS berat.

### Konsep Utility-First
Di CSS tradisional, kita menulis:
\`\`\`css
.button {
  background-color: #3b82f6;
  color: white;
  padding: 8px 16px;
  border-radius: 4px;
}
\`\`\`

Dengan Tailwind CSS, kita cukup memasang class langsung di HTML/JSX:
\`\`\`html
<button class="bg-blue-500 text-white px-4 py-2 rounded-sm hover:bg-blue-600 transition">
  Tombol Modern
</button>
\`\`\`

### Kombinasi Warna & Tipografi Developer
Gaya desain developer khas mengutamakan kontras tinggi:
- **Canvas:** Menggunakan warna slate gelap (\`bg-slate-900\`) atau off-white bersih (\`bg-zinc-50\`).
- **Aksen Neon:** Menggunakan warna Emerald (\`text-emerald-400\`), Cyan, atau Violet.
- **Tipografi Space & Mono:** Font berjenis Monospace (\`font-mono\`) untuk data numerik dan terminal.
`,
      summary: 'Eksplorasi utilitas Tailwind CSS v4 terbaru untuk merancang UI web responsif bertema developer yang artistik dan ergonomis.',
      category: 'Frontend',
      dateAdded: new Date().toISOString(),
      authorName: 'Budi Hartono, S.Kom'
    },
    {
      id: 'mat-3',
      title: 'Fungsi Arrow & State Management di Modern JavaScript',
      week: 3,
      topic: 'Javascript & React',
      content: `### Evolusi Sintaks JavaScript
JavaScript modern memperkenalkan ES6+ yang membawa perubahan luar biasa pada efisiensi penulisan kode. Salah satu fitur utama yang wajib dipahami di SMA & kuliah IT adalah **Arrow Function** dan **Manajemen Data berbasis Array**.

### Sintaks Arrow Function (\`=>\`)
 Arrow function menyederhanakan penulisan fungsi konvensional:
\`\`\`javascript
// Gaya lama
function tambah(a, b) {
  return a + b;
}

// Gaya modern (Arrow Function)
const tambah = (a, b) => a + b;
\`\`\`

### Array Methods yang Sering Digunakan:
1. **.map()** - Mentransformasi setiap elemen array menjadi bentuk baru.
2. **.filter()** - Menyaring elemen array berdasarkan kondisi tertentu.
3. **.reduce()** - Mengakumulasi seluruh elemen array menjadi sebuah nilai tunggal.

Contoh gabungan:
\`\`\`javascript
const nilaiMurid = [75, 80, 90, 60, 85];
// Saring siswa yang lulus (nilai >= 75)
const lulus = nilaiMurid.filter(nilai => nilai >= 75);
console.log(lulus); // [75, 80, 90, 85]
\`\`\`
`,
      summary: 'Menguasai penulisan sintaks modern Javascript ES6+ dan manajemen manipulasi data array secara deklaratif.',
      category: 'Javascript',
      dateAdded: new Date().toISOString(),
      authorName: 'Budi Hartono, S.Kom'
    }
  ],
  tasks: [
    {
      id: 'task-1',
      title: 'Struktur Heading & Modifikasi Tailwind CSS',
      description: 'Cobalah untuk menyusun sebuah elemen heading dengan teks "Belajar Belajar ITNextGen" yang memiliki warna latar belakang oranye-slate (bg-slate-800), warna teks emerald (text-emerald-400), dengan padding luar dalam (p-4), dan dibulatkan (rounded-lg). Pastikan sintaks tag penutup benar.',
      language: 'html',
      codeTemplate: `<div class="">\n  <!-- Tulis elemen heading h1 dengan sintaks Tailwind di sini -->\n  \n</div>`,
      expectedOutput: 'bg-slate-800 text-emerald-400 p-4 rounded-lg',
      dueDate: '2026-05-30',
      weeklyTopic: 'Frontend'
    },
    {
      id: 'task-2',
      title: 'Membuat Arrow Function Penjumlahan',
      description: 'Lengkapi file JavaScript di bawah ini untuk membuat fungsi bernama "hitungITNextGen" yang menggunakan format arrow function, menerima dua parameter (a, b) dan mengembalikan hasil perkalian dari keduanya dikalikan sepuluh (a * b * 10).',
      language: 'javascript',
      codeTemplate: `// Buat arrow function anda di bawah ini\nconst hitungITNextGen = \n\n// Jangan ubah baris di bawah ini\nconsole.log(hitungITNextGen(2, 5));`,
      expectedOutput: '100',
      dueDate: '2026-06-05',
      weeklyTopic: 'Javascript'
    }
  ],
  submissions: [
    {
      id: 'sub-1',
      taskId: 'task-1',
      taskTitle: 'Struktur Heading & Modifikasi Tailwind CSS',
      studentNisn: '12345678',
      studentName: 'Andi Saputra',
      studentKelas: 'XI-RPL-1',
      code: `<div class="">\n  <h1 class="bg-slate-800 text-emerald-400 p-4 rounded-lg">Belajar ITNextGen</h1>\n</div>`,
      status: 'graded',
      score: 95,
      feedback: 'Kerja bagus Andi! Penerapan utility class Tailwind v4 sangat presisi dan rapi. Lanjutkan materi berikutnya!',
      dateSubmitted: new Date().toISOString()
    }
  ],
  forum: [
    {
      id: 'post-1',
      title: 'Bagaimana prospek kerja anak lulusan SMA/SMK jurusan RPL ke depan di era AI?',
      content: 'Halo teman-teman dan Ibu/Bapak guru! Saya ingin berdiskusi mengenai tren AI (seperti GitHub Copilot atau Gemini). Apakah ke depan lapangan pekerjaan untuk junior developer akan menyusut, atau justru kita dituntut untuk melipatgandakan kecepatan coding kita lewat tools AI ini? Bagaimana saran kurikulum belajar kita?',
      category: 'Karir & AI',
      authorName: 'Andi Saputra',
      authorRole: 'murid',
      authorNisn: '12345678',
      date: new Date(Date.now() - 3600000 * 24 * 2).toISOString(), // 2 days ago
      likes: 3,
      likedBy: ['12345678'],
      replies: [
        {
          id: 'rep-1',
          postId: 'post-1',
          content: 'Pertanyaan yang luar biasa, Andi! Di industri saat ini, AI tidak menggantikan programmer, melainkan Programmer yang menggunakan AI akan menggantikan Programmer yang tidak menggunakannya. Fokus kalian sebagai siswa SMA/IT adalah memperkuat fondasi logika pemrograman, analisis kebutuhan pengguna, dan pengenalan prompt engineering tingkat lanjut. Di ITNextGen.IO ini kita justru menyertakan simulasi coding bertenaga AI agar kalian terbiasa!',
          authorName: 'Budi Hartono, S.Kom',
          authorRole: 'guru',
          authorNisn: '87654321',
          date: new Date(Date.now() - 3600000 * 20).toISOString()
        }
      ]
    }
  ]
};

function readDb(): DatabaseSchema {
  try {
    if (!fs.existsSync(DB_FILE)) {
      fs.writeFileSync(DB_FILE, JSON.stringify(initialDb, null, 2), 'utf-8');
      return initialDb;
    }
    const data = fs.readFileSync(DB_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (err) {
    console.error("Error reading database file, using fallback:", err);
    return initialDb;
  }
}

function writeDb(data: DatabaseSchema) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error("Error writing to database file:", err);
  }
}

// Ensure database initialization during server boot
readDb();

// API ROUTES FOR ITNEXTGEN.IO

// 1. Authentications
app.post('/api/auth/register', (req, res) => {
  const { nisn, nama, kelas, sekolah, gmail, password, role } = req.body;
  if (!nisn || !nama || !kelas || !sekolah || !gmail || !password || !role) {
    return res.status(400).json({ error: 'Data registrasi tidak lengkap' });
  }

  const db = readDb();
  const exists = db.users.find(u => u.nisn === nisn || u.gmail.toLowerCase() === gmail.toLowerCase());
  if (exists) {
    return res.status(400).json({ error: 'NISN atau Email sudah terdaftar!' });
  }

  const newUser = {
    nisn,
    nama,
    kelas,
    sekolah,
    gmail: gmail.toLowerCase(),
    password,
    role,
    createdAt: new Date().toISOString()
  };

  db.users.push(newUser);
  writeDb(db);

  // Send back user session (excluding password)
  const { password: _, ...userSession } = newUser;
  res.status(201).json({ success: true, user: userSession });
});

app.post('/api/auth/login', (req, res) => {
  const { gmail, password } = req.body;
  if (!gmail || !password) {
    return res.status(400).json({ error: 'Gmail dan password harus diisi' });
  }

  const db = readDb();
  const user = db.users.find(u => u.gmail.toLowerCase() === gmail.toLowerCase() && u.password === password);
  if (!user) {
    return res.status(401).json({ error: 'Gmail atau password salah!' });
  }

  const { password: _, ...userSession } = user;
  res.json({ success: true, user: userSession });
});

// 2. Weekly Materials
app.get('/api/materials', (req, res) => {
  const db = readDb();
  res.json(db.materials);
});

app.post('/api/materials', (req, res) => {
  const { title, week, topic, content, summary, category, authorName } = req.body;
  if (!title || !week || !topic || !content || !summary || !category || !authorName) {
    return res.status(400).json({ error: 'Data materi tidak lengkap' });
  }

  const db = readDb();
  const newMaterial = {
    id: `mat-${Date.now()}`,
    title,
    week: parseInt(week),
    topic,
    content,
    summary,
    category,
    dateAdded: new Date().toISOString(),
    authorName
  };

  db.materials.unshift(newMaterial); // Add to beginning so it displays first
  writeDb(db);
  res.status(201).json({ success: true, material: newMaterial });
});

// 3. Forum Discussions
app.get('/api/forum', (req, res) => {
  const db = readDb();
  res.json(db.forum);
});

app.post('/api/forum', (req, res) => {
  const { title, content, category, authorName, authorRole, authorNisn } = req.body;
  if (!title || !content || !category || !authorName || !authorRole || !authorNisn) {
    return res.status(400).json({ error: 'Data postingan forum tidak lengkap' });
  }

  const db = readDb();
  const newPost = {
    id: `post-${Date.now()}`,
    title,
    content,
    category,
    authorName,
    authorRole,
    authorNisn,
    date: new Date().toISOString(),
    likes: 0,
    likedBy: [],
    replies: []
  };

  db.forum.unshift(newPost);
  writeDb(db);
  res.status(201).json({ success: true, post: newPost });
});

app.post('/api/forum/:postId/reply', (req, res) => {
  const { postId } = req.params;
  const { content, authorName, authorRole, authorNisn } = req.body;
  if (!content || !authorName || !authorRole || !authorNisn) {
    return res.status(400).json({ error: 'Keterangan balasan belum lengkap' });
  }

  const db = readDb();
  const post = db.forum.find(p => p.id === postId);
  if (!post) {
    return res.status(404).json({ error: 'Postingan forum tidak ditemukan' });
  }

  const newReply = {
    id: `rep-${Date.now()}`,
    postId,
    content,
    authorName,
    authorRole,
    authorNisn,
    date: new Date().toISOString()
  };

  post.replies.push(newReply);
  writeDb(db);
  res.status(201).json({ success: true, reply: newReply });
});

app.post('/api/forum/:postId/like', (req, res) => {
  const { postId } = req.params;
  const { studentNisn } = req.body;
  if (!studentNisn) {
    return res.status(400).json({ error: 'Otorisasi menyukai diperlukan' });
  }

  const db = readDb();
  const post = db.forum.find(p => p.id === postId);
  if (!post) {
    return res.status(404).json({ error: 'Postingan forum tidak ditemukan' });
  }

  if (!post.likedBy) {
    post.likedBy = [];
  }

  const index = post.likedBy.indexOf(studentNisn);
  if (index === -1) {
    post.likedBy.push(studentNisn);
    post.likes = post.likedBy.length;
  } else {
    post.likedBy.splice(index, 1);
    post.likes = post.likedBy.length;
  }

  writeDb(db);
  res.json({ success: true, likes: post.likes, likedBy: post.likedBy });
});

// 4. Tasks & Practical Coding Submissions
app.get('/api/tasks', (req, res) => {
  const db = readDb();
  res.json(db.tasks);
});

app.post('/api/tasks', (req, res) => {
  const { title, description, language, codeTemplate, expectedOutput, dueDate, weeklyTopic } = req.body;
  if (!title || !description || !language || !codeTemplate || !dueDate || !weeklyTopic) {
    return res.status(400).json({ error: 'Data tugas tidak lengkap' });
  }

  const db = readDb();
  const newTask = {
    id: `task-${Date.now()}`,
    title,
    description,
    language,
    codeTemplate,
    expectedOutput: expectedOutput || "",
    dueDate,
    weeklyTopic
  };

  db.tasks.unshift(newTask);
  writeDb(db);
  res.status(201).json({ success: true, task: newTask });
});

app.get('/api/submissions', (req, res) => {
  const { nisn } = req.query;
  const db = readDb();
  if (nisn) {
    const list = db.submissions.filter(s => s.studentNisn === nisn);
    return res.json(list);
  }
  res.json(db.submissions);
});

app.post('/api/submissions', (req, res) => {
  const { taskId, taskTitle, studentNisn, studentName, studentKelas, code } = req.body;
  if (!taskId || !taskTitle || !studentNisn || !studentName || !code) {
    return res.status(400).json({ error: 'Informasi pengumpulan tugas belum lengkap' });
  }

  const db = readDb();
  // Remove existing submission for this student on this task if any, to allow re-submission
  const filtered = db.submissions.filter(s => !(s.taskId === taskId && s.studentNisn === studentNisn));
  
  const newSubmission = {
    id: `sub-${Date.now()}`,
    taskId,
    taskTitle,
    studentNisn,
    studentName,
    studentKelas: studentKelas || 'Umum',
    code,
    status: 'submitted',
    dateSubmitted: new Date().toISOString()
  };

  filtered.push(newSubmission);
  db.submissions = filtered;
  writeDb(db);
  res.status(201).json({ success: true, submission: newSubmission });
});

app.post('/api/submissions/:id/grade', (req, res) => {
  const { id } = req.params;
  const { score, feedback } = req.body;
  if (score === undefined || !feedback) {
    return res.status(400).json({ error: 'Masukkan nilai dan masukan guru' });
  }

  const db = readDb();
  const submission = db.submissions.find(s => s.id === id);
  if (!submission) {
    return res.status(404).json({ error: 'Pengumpulan tugas tidak ditemukan' });
  }

  submission.status = 'graded';
  submission.score = parseInt(score);
  submission.feedback = feedback;

  writeDb(db);
  res.json({ success: true, submission });
});


// 5. GEMINI AI POWERED ENDPOINTS
// 5a. AI Optimizer for Coding Simulation
app.post('/api/ai/optimize-code', async (req, res) => {
  const { code, language, instruction } = req.body;
  if (!code) {
    return res.status(400).json({ error: 'Kode program kosong' });
  }

  const gemini = getGemini();
  if (!gemini) {
    // Graceful offline mock response
    const mockOptimized = `// [MOCK OPTIMIZED] (Aktifkan Kunci API Gemini untuk optimalisasi nyata)\n${code}\n\n// Tips Guru: Pastikan penataan indentasi rapi dan penulisan kurung kurawal konsisten.`;
    return res.json({ status: 'success', output: mockOptimized, message: 'Berjalan dalam mode sandbox karena API Key belum dikonfigurasi.' });
  }

  try {
    const prompt = `Anda adalah Asisten Coding Senior & Guru IT Berpengalaman Bahasa Indonesia di ITNextGen.IO.
Tugas Anda: Format, bersihkan, optimalkan, atau tambahkan penjelasan singkat pada kode ${language} yang diberikan murid berikut. 
Sesuai instruksi khusus: "${instruction || 'Optimalkan kode'}"

Harap berikan hasil perbaikan kode langsung di dalam blok kode pemrograman dan letakkan saran perbaikan di komentar kode bagian bawah agar mudah di-copy oleh murid SMA.

KODE MURID:
\`\`\`${language}
${code}
\`\`\`
`;

    const response = await gemini.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
    });

    const aiText = response.text || "";
    // Clean up markdown block wrapping if gemini wraps it to make it copyable
    let cleanCode = aiText;
    const match = aiText.match(/```(?:[a-zA-Z0-9]+)?\s*([\s\S]*?)```/);
    if (match && match[1]) {
      cleanCode = match[1].trim();
    }

    res.json({ status: 'success', output: cleanCode });
  } catch (error: any) {
    console.error("Gemini optimization error:", error);
    res.status(500).json({ error: 'Gagal mengoptimasi kode menggunakan AI', details: error.message });
  }
});

// 5b. AI Grading Assistance (Automatically suggests score & critique for student code submission)
app.post('/api/ai/auto-grade', async (req, res) => {
  const { code, taskTitle, description, expectedOutput, language } = req.body;
  if (!code) {
    return res.status(400).json({ error: 'Kode pengumpulan kosong' });
  }

  const gemini = getGemini();
  if (!gemini) {
    // Offline simulation
    const simulatedScore = code.includes(expectedOutput || 'nextgen') ? 95 : 80;
    return res.json({
      score: simulatedScore,
      feedback: `[MOCK AI EVALUASI] Kode telah diperiksa secara lokal. Logika penulisan cukup baik. Struktur kodenya valid untuk bahasa ${language}. (Atur Kunci API Gemini di menu Settings -> Secrets untuk evaluasi menggunakan AI yang mendalam)`
    });
  }

  try {
    const prompt = `Anda adalah Guru Evaluator Pemrograman untuk SMA/Mahasiswa di ITNextGen.IO.
Evaluasi tugas pemrograman berikut ini:
Judul Tugas: ${taskTitle}
Deskripsi Tugas: ${description}
Bahasa Pemrograman: ${language}
Output yang diharapkan menyertakan/berpola: ${expectedOutput}

KODE SISWA:
\`\`\`${language}
${code}
\`\`\`

Tugas Anda adalah:
1. Berikan nilai numerik berupa angka integer dari rentang 0 hingga 100 berdasarkan ketepatan logika, sintaks, kebersihan kode, dan kesesuaian output.
2. Tulis masukan/umpan balik atau kritik membangun dalam Bahasa Indonesia yang ramah, memotivasi, santun, khas seorang guru pembimbing SMA yang menyenangkan.

Format output Anda harus berupa dokumen JSON murni dengan schema:
{
  "score": number, // Nilai integer contoh: 90
  "feedback": string // Teks penjelasan detail evaluasi programnya
}
`;

    const response = await gemini.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json"
      }
    });

    const resultText = response.text || "{}";
    try {
      const evaluation = JSON.parse(resultText);
      res.json({
        score: evaluation.score || 85,
        feedback: evaluation.feedback || "Tugas berhasil diserahkan dan dinilai otomatis."
      });
    } catch {
      res.json({
        score: 85,
        feedback: "Evaluasi AI berhasil dibuat namun format JSON perlu dibersihkan: \n" + resultText
      });
    }
  } catch (error: any) {
    console.error("AI auto grading error:", error);
    res.status(500).json({ error: 'Evaluasi AI gagal berjalan', details: error.message });
  }
});

// 5c. AI Forum Mentor / Chat (Instant reply inside forum thread)
app.post('/api/ai/forum-reply', async (req, res) => {
  const { postTitle, postContent, threadCategory } = req.body;
  if (!postContent) {
    return res.status(400).json({ error: 'Isi postingan kosong' });
  }

  const gemini = getGemini();
  if (!gemini) {
    return res.json({
      reply: "Halo teman-teman! Saya adalah AI Mentor ITNextGen.IO. Diskusi kalian sangat menarik. Ingat bahwa industri IT berkembang pesat dengan AI, sehingga belajar skill fundamental sangat krusial! (Konfigurasikan API Key Gemini di Settings -> Secrets untuk mendapatkan instruksi AI Mentor instan di kelas ini)"
    });
  }

  try {
    const prompt = `Anda adalah "AI Mentor ITNextGen.IO", seorang asisten guru AI yang gaul, cerdas, bersahabat, menggunakan gaya bahasa santun tapi modern (kadang menggunakan bahasa campuran anak muda produktif beraksen guru bijaksana).
Berikan tanggapan inspiratif, edukatif, dan solutif pada posingan murid di forum belajar berikut ini:
Kategori Diskusi: ${threadCategory}
Judul Post: ${postTitle}
Isi Post: ${postContent}

Berikan tanggapan yang detail, beri rekomendasi roadmap belajar atau solusi koding jika relevan, dan akhiri dengan kutipan penyemangat belajar teknologi masa depan. Jawab dalam 2-3 paragraf pendek saja agar mudah dibaca.`;

    const response = await gemini.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
    });

    res.json({ reply: response.text });
  } catch (error: any) {
    console.error("AI Forum reply error:", error);
    res.status(500).json({ error: 'Gagal menggenerasi masukan AI', details: error.message });
  }
});

// 5d. AI Weekly Material Generator (For teachers who want to instantly build high-quality modules)
app.post('/api/ai/generate-material', async (req, res) => {
  const { topic, category, week } = req.body;
  if (!topic || !category) {
    return res.status(400).json({ error: 'Topik dan kategori materi harus ditentukan' });
  }

  const gemini = getGemini();
  if (!gemini) {
    return res.json({
      title: `Panduan Mendalam tentang ${topic}`,
      summary: `Materi pembelajaran mingguan interaktif yang membahas seluk-beluk topik ${topic} untuk siswa SMA dan Mahasiswa IT.`,
      content: `### Pengenalan Lebih Dekat: ${topic}\n\nPembelajaran ini mencakup definisi dasar, contoh skenario di dunia kerja IT, dan tips coding terkait ${topic}.\n\n*(Catatan: Segera daftarkan Kunci API Gemini Anda di server agar AI membuat keseluruhan draf buku panduan interaktif secara instan!)*`
    });
  }

  try {
    const prompt = `Anda adalah "Guru Besar ITNextGen.IO", kurator kurikulum SMA peminatan informatika dan dosen komputer praktis.
Buatlah materi pelajaran mingguan lengkap, interaktif, mendalam, dan seru dalam format Markdown Bahasa Indonesia mengenai topik berikut:
Topik: ${topic}
Kategori: ${category}
Minggu Ke: ${week || 4}

Tugas Anda adalah memproduksi output JSON dengan schema:
{
  "title": string, // Judul bab yang atraktif
  "summary": string, // 1-2 kalimat deskripsi singkat/sinopsis materi
  "content": string // Isi materi lengkap dalam format Markdown murni yang rapi, menyertakan penjelasan teori dasar, studi kasus dunia nyata di startup/perusahaan, dan contoh kode program sederhana yang clean.
}
`;

    const response = await gemini.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json"
      }
    });

    const materialText = response.text || "{}";
    const generated = JSON.parse(materialText);
    res.json({
      title: generated.title || `Panduan ${topic}`,
      summary: generated.summary || `Materi rujukan praktis bertema ${topic}.`,
      content: generated.content || `Isi materi komprehensif mengenai ${topic}.`
    });
  } catch (error: any) {
    console.error("Weekly Material generation error:", error);
    res.status(500).json({ error: 'Gagal merancang materi menggunakan AI', details: error.message });
  }
});

// Support standard Vite client server integration (Single Core Server config)
async function startServer() {
  const isProd = process.env.NODE_ENV === "production";
  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    // Let react router handle it in the standard single page app form
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  // Bind to port 3000 on all hosts for the reverse-proxy setup
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[ITNextGen.IO] Full-stack Server running at http://localhost:${PORT}`);
  });
}

startServer();
