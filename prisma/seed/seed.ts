import "dotenv/config";
import { PrismaClient, Prisma } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

const connectionString = process.env.DATABASE_URL;

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Starting seeding...');

  // 1. Seed Program Studi (HARUS PERTAMA - karena semua data lain bergantung pada ini)
  await seedProgramStudi();
  
  // 2. Seed Profil Lulusan (per program studi)
  await seedProfilLulusan();
  
  // 3. Seed CPL (per program studi)
  await seedCPL();
  
  // 4. Seed Bahan Kajian (per program studi)
  await seedBahanKajian();
  
  // 5. Seed Mata Kuliah (per program studi)
  await seedMataKuliah();
  
  // 6. Seed Kurikulum (per program studi)
  await seedKurikulum();
  
  // 7. Seed CPMK (tergantung mata kuliah)
  await seedCPMK();
  
  // 8. Seed Kurikulum CPL Mapping
  await seedKurikulumCPLMapping();
  
  // 9. Seed Prasyarat MK
  await seedPrasyaratMK();
  
  // 10. Seed Mappings
  await seedPLCPLMapping();
  await seedCPLCpmkMapping();
  await seedCPLBKMapping();
  await seedBKMKMapping();
  await seedCPLMKMapping();
  await seedPLMKMapping();
  
  // 11. Seed Dosen
  await seedDosen();
  
  // 12. Seed Semester Akademik
  await seedSemesterAkademik();
  
  // 13. Seed Standard Penilaian
  await seedStandardPenilaian();
  
  // 14. Seed Roles and Permissions
  await seedRolesAndPermissions();

  // 15. Seed Users for Authentication
  await seedUsers();

  console.log('✅ Seeding completed successfully!');
}

// ==================== PROGRAM STUDI ====================
async function seedProgramStudi() {
  console.log('🏫 Seeding Program Studi...');

  const programStudiData = [
    {
      kode_program_studi: 'TI',
      nama_program_studi: 'Informatika',
      jenjang: 'S1',
      fakultas: 'Sains dan Teknologi',
      status_aktif: true,
      deskripsi: 'Program Studi Informatika UIN K.H. Abdurrahman Wahid Pekalongan'
    },
    {
      kode_program_studi: 'SD',
      nama_program_studi: 'Sains Data',
      jenjang: 'S1',
      fakultas: 'Sains dan Teknologi',
      status_aktif: true,
      deskripsi: 'Program Studi Sains Data UIN K.H. Abdurrahman Wahid Pekalongan'
    }
  ];

  for (const ps of programStudiData) {
    await prisma.pROGRAM_STUDI.upsert({
      where: { kode_program_studi: ps.kode_program_studi },
      update: {},
      create: ps
    });
  }

  console.log('✓ Program Studi seeded');
}

// ==================== PROFIL LULUSAN ====================
async function seedProfilLulusan() {
  console.log('📋 Seeding Profil Lulusan...');
  
  // Get program studi
  const programStudiTI = await prisma.pROGRAM_STUDI.findUnique({
    where: { kode_program_studi: 'TI' }
  });
  const programStudiSD = await prisma.pROGRAM_STUDI.findUnique({
    where: { kode_program_studi: 'SD' }
  });

  if (!programStudiTI || !programStudiSD) {
    throw new Error('Program Studi not found. Please run seedProgramStudi first.');
  }
  
  const profilLulusanData = [
    // Profil Lulusan untuk Informatika
    {
      kode_pl: 'PL-TI-01',
      nama_profil: 'Software Engineer & Developer',
      deskripsi: 'Lulusan memiliki kemampuan menganalisis persoalan computing serta menerapkan prinsip-prinsip computing dan disiplin ilmu relevan lainnya untuk mengidentifikasi solusi bagi organisasi.',
      profesi: ['Software Engineer', 'Web Developer', 'Mobile Developer', 'Backend Developer', 'Frontend Developer', 'Full Stack Developer'],
      programStudiId: programStudiTI.id
    },
    {
      kode_pl: 'PL-TI-02',
      nama_profil: 'Multimedia & Game Developer',
      deskripsi: 'Lulusan memiliki kemampuan mendesain, mengimplementasi dan mengevaluasi solusi berbasis computing yang memenuhi kebutuhan pengguna dengan pendekatan multimedia dan game.',
      profesi: ['Game Developer', 'Animator', 'Multimedia Programmer', '3D Artist', 'UI/UX Designer', 'VR/AR Developer'],
      programStudiId: programStudiTI.id
    },
    {
      kode_pl: 'PL-TI-03',
      nama_profil: 'IT Consultant & Technopreneur',
      deskripsi: 'Lulusan mampu bertindak dan menilai secara professional dalam bidang teknologi informasi dan kewirausahaan berbasis teknologi.',
      profesi: ['Technology Entrepreneur', 'Startup Founder', 'Digital Business Owner', 'Innovation Consultant', 'IT Consultant'],
      programStudiId: programStudiTI.id
    },
    {
      kode_pl: 'PL-TI-04',
      nama_profil: 'IT Researcher & Educator',
      deskripsi: 'Lulusan mampu berpikir logis, kritis serta sistematis dalam memanfaatkan ilmu pengetahuan informatika untuk menyelesaikan masalah nyata dan mengembangkan ilmu pengetahuan.',
      profesi: ['Instruktur Informatika', 'Peneliti IT', 'Teaching Assistant', 'Research Assistant', 'Academic Staff'],
      programStudiId: programStudiTI.id
    },
    
    // Profil Lulusan untuk Sains Data
    {
      kode_pl: 'PL-SD-01',
      nama_profil: 'Data Scientist & Analyst',
      deskripsi: 'Lulusan memiliki kemampuan menganalisis data kompleks, membangun model prediktif, dan menghasilkan insight bisnis dari data.',
      profesi: ['Data Scientist', 'Data Analyst', 'Business Intelligence Analyst', 'Analytics Consultant', 'Data Engineer'],
      programStudiId: programStudiSD.id
    },
    {
      kode_pl: 'PL-SD-02',
      nama_profil: 'Machine Learning Engineer',
      deskripsi: 'Lulusan mampu merancang, mengembangkan, dan mengimplementasikan sistem machine learning dan artificial intelligence untuk menyelesaikan masalah nyata.',
      profesi: ['Machine Learning Engineer', 'AI Engineer', 'Deep Learning Specialist', 'ML Ops Engineer', 'Computer Vision Engineer'],
      programStudiId: programStudiSD.id
    },
    {
      kode_pl: 'PL-SD-03',
      nama_profil: 'Big Data Specialist',
      deskripsi: 'Lulusan memiliki kemampuan mengelola, memproses, dan menganalisis data dalam skala besar menggunakan teknologi big data modern.',
      profesi: ['Big Data Engineer', 'Data Platform Engineer', 'Cloud Data Architect', 'Database Administrator', 'ETL Developer'],
      programStudiId: programStudiSD.id
    },
    {
      kode_pl: 'PL-SD-04',
      nama_profil: 'Data Science Researcher',
      deskripsi: 'Lulusan mampu melakukan penelitian ilmiah dalam bidang sains data, mengembangkan metodologi baru, dan berkontribusi pada pengembangan ilmu pengetahuan.',
      profesi: ['Data Science Researcher', 'Academic Researcher', 'Research Scientist', 'Data Science Educator', 'Ph.D. Candidate'],
      programStudiId: programStudiSD.id
    }
  ];

  for (const pl of profilLulusanData) {
    await prisma.pROFIL_LULUSAN.upsert({
      where: { kode_pl: pl.kode_pl },
      update: {},
      create: pl
    });
  }
  
  console.log('✓ Profil Lulusan seeded (4 for Informatika, 4 for Sains Data)');
}

// ==================== CPL ====================
async function seedCPL() {
  console.log('📋 Seeding CPL...');
  
  // Get program studi
  const programStudiTI = await prisma.pROGRAM_STUDI.findUnique({
    where: { kode_program_studi: 'TI' }
  });
  const programStudiSD = await prisma.pROGRAM_STUDI.findUnique({
    where: { kode_program_studi: 'SD' }
  });

  if (!programStudiTI || !programStudiSD) {
    throw new Error('Program Studi not found');
  }
  
  const cplData = [
    // CPL INFORMATIKA (TI) - Sikap
    {
      kode_cpl: 'CPL-TI-S01',
      deskripsi: 'Bertakwa Kepada Tuhan Yang Maha Esa, menunjukkan sikap religius, memiliki nilai kemanusiaan yang tinggi dalam menjalankan tugas, taat hukum, dan menghargai keanekaragaman budaya dalam kehidupan bermasyarakat berbangsa dan bernegara yang sesuai dengan moral, etika dan sesuai dengan Pancasila.',
      kategori: 'sikap' as const,
      sumber: 'SN_DIKTI' as const,
      nilai_minimum_kelulusan: 2.75,
      programStudiId: programStudiTI.id
    },
    {
      kode_cpl: 'CPL-TI-S02',
      deskripsi: 'Mampu menunjukkan disiplin yang baik, bertanggung jawab, saling menghormati dan taat hukum dalam kehidupan bermasyarakat, berbangsa, bernegara, dan menjunjung tinggi nilai-nilai kemanusiaan berbasis harmonisasi sains dan agama untuk kemanusiaan berlandaskan budaya bangsa.',
      kategori: 'sikap' as const,
      sumber: 'SN_DIKTI' as const,
      nilai_minimum_kelulusan: 2.75,
      programStudiId: programStudiTI.id
    },
    // CPL INFORMATIKA - Pengetahuan
    {
      kode_cpl: 'CPL-TI-P01',
      deskripsi: 'Menguasai konsep teoritis bidang pengetahuan Ilmu Komputer/Informatika secara umum dan konsep teoritis bagian khusus dalam bidang pengetahuan tersebut secara mendalam, serta mampu memformulasikan penyelesaian masalah prosedural.',
      kategori: 'pengetahuan' as const,
      sumber: 'KKNI' as const,
      nilai_minimum_kelulusan: 2.75,
      programStudiId: programStudiTI.id
    },
    {
      kode_cpl: 'CPL-TI-P02',
      deskripsi: 'Memiliki pengetahuan yang memadai terkait dengan cara kerja sistem komputer dan mampu merancang dan mengembangkan berbagai algoritma/metode untuk memecahkan masalah.',
      kategori: 'pengetahuan' as const,
      sumber: 'KKNI' as const,
      nilai_minimum_kelulusan: 2.75,
      programStudiId: programStudiTI.id
    },
    {
      kode_cpl: 'CPL-TI-P03',
      deskripsi: 'Mempunyai pengetahuan dalam mengembangkan algoritma/metode yang diimplementasikan dalam perangkat lunak berbasis komputer.',
      kategori: 'pengetahuan' as const,
      sumber: 'KKNI' as const,
      nilai_minimum_kelulusan: 2.75,
      programStudiId: programStudiTI.id
    },
    // CPL INFORMATIKA - Keterampilan Umum
    {
      kode_cpl: 'CPL-TI-KU01',
      deskripsi: 'Memiliki kemampuan (pengelolaan) manajerial tim dan kerja sama (team work), manajemen diri, mampu berkomunikasi baik lisan maupun tertulis dengan baik dan mampu melakukan presentasi.',
      kategori: 'keterampilan_umum' as const,
      sumber: 'SN_DIKTI' as const,
      nilai_minimum_kelulusan: 2.75,
      programStudiId: programStudiTI.id
    },
    {
      kode_cpl: 'CPL-TI-KU02',
      deskripsi: 'Menyusun deskripsi saintifik hasil kajian implikasi pengembangan atau implementasi ilmu pengetahuan teknologi dalam bentuk skripsi atau laporan tugas akhir atau artikel ilmiah.',
      kategori: 'keterampilan_umum' as const,
      sumber: 'SN_DIKTI' as const,
      nilai_minimum_kelulusan: 2.75,
      programStudiId: programStudiTI.id
    },
    // CPL INFORMATIKA - Keterampilan Khusus
    {
      kode_cpl: 'CPL-TI-KK01',
      deskripsi: 'Mampu merancang dan mengembangkan algoritma untuk berbagai keperluan seperti Network Security, Data Compression Multimedia Technologies, Mobile Computing Intelligent Systems, Information Management, Algorithms and Complexity, Human-Computer Interaction, Graphics and Visual Computing.',
      kategori: 'keterampilan_khusus' as const,
      sumber: 'KKNI' as const,
      nilai_minimum_kelulusan: 2.75,
      programStudiId: programStudiTI.id
    },
    {
      kode_cpl: 'CPL-TI-KK02',
      deskripsi: 'Lulusan memiliki kemampuan mendesain, mengimplementasi dan mengevaluasi solusi berbasis computing yang memenuhi kebutuhan pengguna dengan pendekatan yang sesuai.',
      kategori: 'keterampilan_khusus' as const,
      sumber: 'IABEE' as const,
      nilai_minimum_kelulusan: 2.75,
      programStudiId: programStudiTI.id
    },
    {
      kode_cpl: 'CPL-TI-KK03',
      deskripsi: 'Kemampuan mendesain, mengembangkan, dan mensimulasikan aplikasi teknologi multi-platform yang relevan dengan kebutuhan industri.',
      kategori: 'keterampilan_khusus' as const,
      sumber: 'CC2020' as const,
      nilai_minimum_kelulusan: 2.75,
      programStudiId: programStudiTI.id
    },

    // CPL SAINS DATA (SD) - Sikap  
    {
      kode_cpl: 'CPL-SD-S01',
      deskripsi: 'Bertakwa Kepada Tuhan Yang Maha Esa, menunjukkan sikap religius, memiliki nilai kemanusiaan yang tinggi dalam menjalankan tugas, taat hukum, dan menghargai keanekaragaman budaya dalam kehidupan bermasyarakat berbangsa dan bernegara yang sesuai dengan moral, etika dan sesuai dengan Pancasila.',
      kategori: 'sikap' as const,
      sumber: 'SN_DIKTI' as const,
      nilai_minimum_kelulusan: 2.75,
      programStudiId: programStudiSD.id
    },
    {
      kode_cpl: 'CPL-SD-S02',
      deskripsi: 'Mampu menunjukkan disiplin yang baik, bertanggung jawab, saling menghormati dan taat hukum dalam kehidupan bermasyarakat, berbangsa, bernegara, dan menjunjung tinggi nilai-nilai kemanusiaan berbasis harmonisasi sains dan agama untuk kemanusiaan berlandaskan budaya bangsa.',
      kategori: 'sikap' as const,
      sumber: 'SN_DIKTI' as const,
      nilai_minimum_kelulusan: 2.75,
      programStudiId: programStudiSD.id
    },
    // CPL SAINS DATA - Pengetahuan
    {
      kode_cpl: 'CPL-SD-P01',
      deskripsi: 'Menguasai konsep teoritis bidang sains data, statistika, dan pembelajaran mesin secara mendalam serta mampu memformulasikan solusi analitik untuk masalah berbasis data.',
      kategori: 'pengetahuan' as const,
      sumber: 'KKNI' as const,
      nilai_minimum_kelulusan: 2.75,
      programStudiId: programStudiSD.id
    },
    {
      kode_cpl: 'CPL-SD-P02',
      deskripsi: 'Memiliki pengetahuan yang memadai tentang metode pengumpulan, pembersihan, transformasi, dan analisis data dalam berbagai skala dan kompleksitas.',
      kategori: 'pengetahuan' as const,
      sumber: 'KKNI' as const,
      nilai_minimum_kelulusan: 2.75,
      programStudiId: programStudiSD.id
    },
    {
      kode_cpl: 'CPL-SD-P03',
      deskripsi: 'Menguasai konsep dan teknologi big data, cloud computing, dan infrastructure untuk pemrosesan data skala besar.',
      kategori: 'pengetahuan' as const,
      sumber: 'KKNI' as const,
      nilai_minimum_kelulusan: 2.75,
      programStudiId: programStudiSD.id
    },
    // CPL SAINS DATA - Keterampilan Umum
    {
      kode_cpl: 'CPL-SD-KU01',
      deskripsi: 'Mampu berkomunikasi dan berkolaborasi dengan stakeholder untuk memahami kebutuhan bisnis dan menyampaikan insight dari data secara efektif.',
      kategori: 'keterampilan_umum' as const,
      sumber: 'SN_DIKTI' as const,
      nilai_minimum_kelulusan: 2.75,
      programStudiId: programStudiSD.id
    },
    {
      kode_cpl: 'CPL-SD-KU02',
      deskripsi: 'Menyusun laporan analisis data, hasil penelitian, dan artikel ilmiah dalam bidang sains data dengan metodologi yang benar.',
      kategori: 'keterampilan_umum' as const,
      sumber: 'SN_DIKTI' as const,
      nilai_minimum_kelulusan: 2.75,
      programStudiId: programStudiSD.id
    },
    // CPL SAINS DATA - Keterampilan Khusus
    {
      kode_cpl: 'CPL-SD-KK01',
      deskripsi: 'Mampu merancang dan mengimplementasikan model machine learning dan deep learning untuk analisis prediktif dan klasifikasi data.',
      kategori: 'keterampilan_khusus' as const,
      sumber: 'KKNI' as const,
      nilai_minimum_kelulusan: 2.75,
      programStudiId: programStudiSD.id
    },
    {
      kode_cpl: 'CPL-SD-KK02',
      deskripsi: 'Mampu melakukan eksplorasi data, visualisasi data, dan menghasilkan insight bisnis dari data kompleks menggunakan tools modern.',
      kategori: 'keterampilan_khusus' as const,
      sumber: 'IABEE' as const,
      nilai_minimum_kelulusan: 2.75,
      programStudiId: programStudiSD.id
    },
    {
      kode_cpl: 'CPL-SD-KK03',
      deskripsi: 'Mampu membangun end-to-end data pipeline, dari pengumpulan data hingga deployment model machine learning di production environment.',
      kategori: 'keterampilan_khusus' as const,
      sumber: 'CC2020' as const,
      nilai_minimum_kelulusan: 2.75,
      programStudiId: programStudiSD.id
    }
  ];

  for (const cpl of cplData) {
    await prisma.cPL.upsert({
      where: { kode_cpl: cpl.kode_cpl },
      update: {},
      create: cpl
    });
  }
  
  console.log('✓ CPL seeded (10 for Informatika, 10 for Sains Data)');
}

// ==================== BAHAN KAJIAN ====================
async function seedBahanKajian() {
  console.log('📋 Seeding Bahan Kajian...');
  
  // Get program studi
  const programStudiTI = await prisma.pROGRAM_STUDI.findUnique({
    where: { kode_program_studi: 'TI' }
  });
  const programStudiSD = await prisma.pROGRAM_STUDI.findUnique({
    where: { kode_program_studi: 'SD' }
  });

  if (!programStudiTI || !programStudiSD) {
    throw new Error('Program Studi not found');
  }

  const bahanKajianTI = [
    // BK Wajib Informatika
    { kode_bk: 'BK-TI-01', nama_bahan_kajian: 'Social Issues and Professional Practice', kategori: 'wajib_informatika' as const, bobot_min_sks: 2, bobot_max_sks: 4, programStudiId: programStudiTI.id },
    { kode_bk: 'BK-TI-02', nama_bahan_kajian: 'Security Policy and Management', kategori: 'wajib_informatika' as const, bobot_min_sks: 2, bobot_max_sks: 3, programStudiId: programStudiTI.id },
    { kode_bk: 'BK-TI-03', nama_bahan_kajian: 'Project Management', kategori: 'wajib_informatika' as const, bobot_min_sks: 2, bobot_max_sks: 3, programStudiId: programStudiTI.id },
    { kode_bk: 'BK-TI-04', nama_bahan_kajian: 'User Experience Design', kategori: 'wajib_informatika' as const, bobot_min_sks: 2, bobot_max_sks: 4, programStudiId: programStudiTI.id },
    { kode_bk: 'BK-TI-05', nama_bahan_kajian: 'Security Issues and Principles', kategori: 'wajib_informatika' as const, bobot_min_sks: 2, bobot_max_sks: 3, programStudiId: programStudiTI.id },
    { kode_bk: 'BK-TI-06', nama_bahan_kajian: 'Data and Information Management', kategori: 'wajib_informatika' as const, bobot_min_sks: 2, bobot_max_sks: 4, programStudiId: programStudiTI.id },
    { kode_bk: 'BK-TI-07', nama_bahan_kajian: 'Parallel and Distributed Computing', kategori: 'wajib_informatika' as const, bobot_min_sks: 2, bobot_max_sks: 4, programStudiId: programStudiTI.id },
    { kode_bk: 'BK-TI-08', nama_bahan_kajian: 'Computer Networks', kategori: 'wajib_informatika' as const, bobot_min_sks: 2, bobot_max_sks: 4, programStudiId: programStudiTI.id },
    { kode_bk: 'BK-TI-09', nama_bahan_kajian: 'Security Technology and Implementation', kategori: 'wajib_informatika' as const, bobot_min_sks: 2, bobot_max_sks: 4, programStudiId: programStudiTI.id },
    { kode_bk: 'BK-TI-10', nama_bahan_kajian: 'Software Design', kategori: 'wajib_informatika' as const, bobot_min_sks: 2, bobot_max_sks: 4, programStudiId: programStudiTI.id },
    { kode_bk: 'BK-TI-11', nama_bahan_kajian: 'Operating Systems', kategori: 'wajib_informatika' as const, bobot_min_sks: 3, bobot_max_sks: 5, programStudiId: programStudiTI.id },
    { kode_bk: 'BK-TI-12', nama_bahan_kajian: 'Data Structures, Algorithms and Complexity', kategori: 'wajib_informatika' as const, bobot_min_sks: 4, bobot_max_sks: 5, programStudiId: programStudiTI.id },
    { kode_bk: 'BK-TI-13', nama_bahan_kajian: 'Programming Languages', kategori: 'wajib_informatika' as const, bobot_min_sks: 3, bobot_max_sks: 5, programStudiId: programStudiTI.id },
    { kode_bk: 'BK-TI-14', nama_bahan_kajian: 'Programming Fundamentals', kategori: 'wajib_informatika' as const, bobot_min_sks: 4, bobot_max_sks: 5, programStudiId: programStudiTI.id },
    { kode_bk: 'BK-TI-15', nama_bahan_kajian: 'Computing Systems Fundamentals', kategori: 'wajib_informatika' as const, bobot_min_sks: 2, bobot_max_sks: 3, programStudiId: programStudiTI.id },
    { kode_bk: 'BK-TI-16', nama_bahan_kajian: 'Architecture and Organization', kategori: 'wajib_informatika' as const, bobot_min_sks: 3, bobot_max_sks: 4, programStudiId: programStudiTI.id },
    { kode_bk: 'BK-TI-17', nama_bahan_kajian: 'Graphics and Visualization', kategori: 'wajib_informatika' as const, bobot_min_sks: 2, bobot_max_sks: 4, programStudiId: programStudiTI.id },
    { kode_bk: 'BK-TI-18', nama_bahan_kajian: 'Intelligent Systems', kategori: 'wajib_informatika' as const, bobot_min_sks: 3, bobot_max_sks: 5, programStudiId: programStudiTI.id },
    { kode_bk: 'BK-TI-19', nama_bahan_kajian: 'Platform-based Development', kategori: 'wajib_informatika' as const, bobot_min_sks: 2, bobot_max_sks: 4, programStudiId: programStudiTI.id },
    
    // BK Tambahan untuk Informatika
    { kode_bk: 'BK-TI-20', nama_bahan_kajian: 'Discrete Structures', kategori: 'tambahan' as const, bobot_min_sks: 2, bobot_max_sks: 3, programStudiId: programStudiTI.id },
    { kode_bk: 'BK-TI-21', nama_bahan_kajian: 'Human-Computer Interaction', kategori: 'tambahan' as const, bobot_min_sks: 2, bobot_max_sks: 3, programStudiId: programStudiTI.id },
    { kode_bk: 'BK-TI-22', nama_bahan_kajian: 'Software Development Fundamentals', kategori: 'tambahan' as const, bobot_min_sks: 2, bobot_max_sks: 3, programStudiId: programStudiTI.id },
    { kode_bk: 'BK-TI-23', nama_bahan_kajian: 'Software Process', kategori: 'tambahan' as const, bobot_min_sks: 2, bobot_max_sks: 3, programStudiId: programStudiTI.id },
    { kode_bk: 'BK-TI-24', nama_bahan_kajian: 'Systems Analysis & Design', kategori: 'tambahan' as const, bobot_min_sks: 2, bobot_max_sks: 3, programStudiId: programStudiTI.id },
    { kode_bk: 'BK-TI-25', nama_bahan_kajian: 'Software Quality, Verification and Validation', kategori: 'tambahan' as const, bobot_min_sks: 2, bobot_max_sks: 3, programStudiId: programStudiTI.id },
    { kode_bk: 'BK-TI-26', nama_bahan_kajian: 'Artificial Intelligence & Machine Learning', kategori: 'tambahan' as const, bobot_min_sks: 3, bobot_max_sks: 4, programStudiId: programStudiTI.id },
    { kode_bk: 'BK-TI-27', nama_bahan_kajian: 'Technopreneurship & Digital Innovation', kategori: 'tambahan' as const, bobot_min_sks: 2, bobot_max_sks: 3, programStudiId: programStudiTI.id },
    { kode_bk: 'BK-TI-28', nama_bahan_kajian: 'Cloud Computing & DevOps', kategori: 'tambahan' as const, bobot_min_sks: 2, bobot_max_sks: 3, programStudiId: programStudiTI.id },
    { kode_bk: 'BK-TI-29', nama_bahan_kajian: 'Data Analytics & Visualization', kategori: 'tambahan' as const, bobot_min_sks: 2, bobot_max_sks: 3, programStudiId: programStudiTI.id },
    { kode_bk: 'BK-TI-30', nama_bahan_kajian: 'Natural Language Processing (NLP)', kategori: 'tambahan' as const, bobot_min_sks: 2, bobot_max_sks: 3, programStudiId: programStudiTI.id },
    
    // BK Wajib SN Dikti dan Umum untuk Informatika
    { kode_bk: 'BK-TI-31', nama_bahan_kajian: 'Pengembangan Diri', kategori: 'wajib_sn_dikti' as const, bobot_min_sks: 2, bobot_max_sks: 2, programStudiId: programStudiTI.id },
    { kode_bk: 'BK-TI-32', nama_bahan_kajian: 'Metodologi Penelitian', kategori: 'wajib_umum' as const, bobot_min_sks: 2, bobot_max_sks: 6, programStudiId: programStudiTI.id }
  ];

  // Bahan Kajian minimal untuk Sains Data
  const bahanKajianSD = [
    { kode_bk: 'BK-SD-01', nama_bahan_kajian: 'Data Collection and Preparation', kategori: 'wajib_informatika' as const, bobot_min_sks: 2, bobot_max_sks: 4, programStudiId: programStudiSD.id },
    { kode_bk: 'BK-SD-02', nama_bahan_kajian: 'Statistical Methods and Analysis', kategori: 'wajib_informatika' as const, bobot_min_sks: 3, bobot_max_sks: 5, programStudiId: programStudiSD.id },
    { kode_bk: 'BK-SD-03', nama_bahan_kajian: 'Machine Learning Algorithms', kategori: 'wajib_informatika' as const, bobot_min_sks: 3, bobot_max_sks: 5, programStudiId: programStudiSD.id },
    { kode_bk: 'BK-SD-04', nama_bahan_kajian: 'Big Data Technologies', kategori: 'wajib_informatika' as const, bobot_min_sks: 2, bobot_max_sks: 4, programStudiId: programStudiSD.id },
    { kode_bk: 'BK-SD-05', nama_bahan_kajian: 'Data Visualization and Communication', kategori: 'wajib_informatika' as const, bobot_min_sks: 2, bobot_max_sks: 3, programStudiId: programStudiSD.id },
    { kode_bk: 'BK-SD-06', nama_bahan_kajian: 'Programming for Data Science', kategori: 'wajib_informatika' as const, bobot_min_sks: 3, bobot_max_sks: 5, programStudiId: programStudiSD.id },
    { kode_bk: 'BK-SD-07', nama_bahan_kajian: 'Deep Learning', kategori: 'tambahan' as const, bobot_min_sks: 3, bobot_max_sks: 4, programStudiId: programStudiSD.id },
    { kode_bk: 'BK-SD-08', nama_bahan_kajian: 'Cloud Computing for Data Science', kategori: 'tambahan' as const, bobot_min_sks: 2, bobot_max_sks: 3, programStudiId: programStudiSD.id },
    { kode_bk: 'BK-SD-09', nama_bahan_kajian: 'Pengembangan Diri', kategori: 'wajib_sn_dikti' as const, bobot_min_sks: 2, bobot_max_sks: 2, programStudiId: programStudiSD.id },
    { kode_bk: 'BK-SD-10', nama_bahan_kajian: 'Metodologi Penelitian', kategori: 'wajib_umum' as const, bobot_min_sks: 2, bobot_max_sks: 6, programStudiId: programStudiSD.id }
  ];

  // Seed Bahan Kajian Informatika
  for (const bk of bahanKajianTI) {
    await prisma.bAHAN_KAJIAN.upsert({
      where: { kode_bk: bk.kode_bk },
      update: {},
      create: bk
    });
  }

  // Seed Bahan Kajian Sains Data
  for (const bk of bahanKajianSD) {
    await prisma.bAHAN_KAJIAN.upsert({
      where: { kode_bk: bk.kode_bk },
      update: {},
      create: bk
    });
  }
  
  console.log('✓ Bahan Kajian seeded (32 for Informatika, 10 for Sains Data)');
}

// ==================== MATA KULIAH ====================
async function seedMataKuliah() {
  console.log('📋 Seeding Mata Kuliah...');
  
  // Get program studi
  const programStudiTI = await prisma.pROGRAM_STUDI.findUnique({
    where: { kode_program_studi: 'TI' }
  });
  const programStudiSD = await prisma.pROGRAM_STUDI.findUnique({
    where: { kode_program_studi: 'SD' }
  });

  if (!programStudiTI || !programStudiSD) {
    throw new Error('Program Studi not found');
  }
  
  // Mata Kuliah untuk INFORMATIKA - Mata Kuliah Wajib Umum (shared dengan SD tapi untuk TI dulu)
  const mataKuliahTI = [
    // Semester 1 - Wajib Umum
    { kode_mk: 'TI-U1', nama_mk: 'Pancasila', sks: 2, semester: 1, jenis: 'wajib' as const, konsentrasi: null, deskripsi: 'Mempelajari nilai-nilai dasar Pancasila sebagai ideologi dan pandangan hidup bangsa Indonesia.', programStudiId: programStudiTI.id },
    { kode_mk: 'TI-U3', nama_mk: 'Bahasa Indonesia', sks: 2, semester: 1, jenis: 'wajib' as const, konsentrasi: null, deskripsi: 'Pengembangan kemampuan berbahasa Indonesia secara efektif dalam konteks akademik dan profesional.', programStudiId: programStudiTI.id },
    { kode_mk: 'TI-U4', nama_mk: 'Metodologi Studi Islam', sks: 3, semester: 1, jenis: 'wajib' as const, konsentrasi: null, deskripsi: 'Pendekatan dan metode ilmiah dalam memahami ajaran Islam secara komprehensif.', programStudiId: programStudiTI.id },
    { kode_mk: 'TI-U7', nama_mk: 'Academic Writing', sks: 3, semester: 1, jenis: 'wajib' as const, konsentrasi: null, deskripsi: 'Teknik dan strategi penulisan ilmiah dalam bahasa Inggris untuk tujuan akademik.', programStudiId: programStudiTI.id },
    { kode_mk: 'TI-U2', nama_mk: 'Kewarganegaraan', sks: 2, semester: 2, jenis: 'wajib' as const, konsentrasi: null, deskripsi: 'Pemahaman hak dan kewajiban sebagai warga negara serta wawasan kebangsaan.', programStudiId: programStudiTI.id },
    { kode_mk: 'TI-U5', nama_mk: 'Moderasi Beragama', sks: 3, semester: 2, jenis: 'wajib' as const, konsentrasi: null, deskripsi: 'Pendekatan moderat dalam beragama untuk membangun toleransi dan harmoni sosial.', programStudiId: programStudiTI.id },
    { kode_mk: 'TI-U6', nama_mk: 'Harmonisasi Sains dan Agama', sks: 3, semester: 2, jenis: 'wajib' as const, konsentrasi: null, deskripsi: 'Menjembatani sains dan ajaran agama dalam kehidupan sehari-hari dan teknologi.', programStudiId: programStudiTI.id },
    
    // Semester 1 - Spesifik Informatika
    { kode_mk: 'INF2501', nama_mk: 'Bahasa Arab', sks: 3, semester: 1, jenis: 'wajib' as const, konsentrasi: null, deskripsi: 'Dasar-dasar bahasa Arab untuk memahami teks-teks keislaman dan konteks akademik.', programStudiId: programStudiTI.id },
    { kode_mk: 'INF2502', nama_mk: 'Pengenalan Pemrograman', sks: 3, semester: 1, jenis: 'wajib' as const, konsentrasi: null, deskripsi: 'Konsep dasar pemrograman menggunakan bahasa pemrograman sederhana.', programStudiId: programStudiTI.id },
    { kode_mk: 'INF2503', nama_mk: 'Kalkulus', sks: 2, semester: 1, jenis: 'wajib' as const, konsentrasi: null, deskripsi: 'Konsep limit, turunan, dan integral untuk mendukung analisis matematis dalam komputasi.', programStudiId: programStudiTI.id },
    { kode_mk: 'INF2504', nama_mk: 'Organisasi dan Arsitektur Komputer', sks: 2, semester: 1, jenis: 'wajib' as const, konsentrasi: null, deskripsi: 'Struktur internal komputer, termasuk CPU, memori, dan sistem I/O.', programStudiId: programStudiTI.id },
    
    // Semester 2 - Spesifik Informatika
    { kode_mk: 'INF2505', nama_mk: 'Hukum dan Kebijakan Teknologi Informasi', sks: 2, semester: 2, jenis: 'wajib' as const, konsentrasi: null, deskripsi: 'Dasar hukum dan regulasi terkait teknologi informasi dan dunia digital.', programStudiId: programStudiTI.id },
    { kode_mk: 'INF2506', nama_mk: 'Algoritma dan Pemrograman', sks: 4, semester: 2, jenis: 'wajib' as const, konsentrasi: null, deskripsi: 'Struktur logika dan algoritma dalam menyelesaikan masalah pemrograman.', programStudiId: programStudiTI.id },
    { kode_mk: 'INF2507', nama_mk: 'Pengantar Multimedia', sks: 3, semester: 2, jenis: 'wajib' as const, konsentrasi: null, deskripsi: 'Dasar multimedia meliputi teks, gambar, audio, video, dan animasi.', programStudiId: programStudiTI.id },
    { kode_mk: 'INF2508', nama_mk: 'Struktur Data', sks: 3, semester: 2, jenis: 'wajib' as const, konsentrasi: null, deskripsi: 'Representasi dan manipulasi data menggunakan struktur seperti array, stack, queue, dan tree.', programStudiId: programStudiTI.id },
    
    // Semester 3-8 (semua MK Informatika dengan programStudiId)
    { kode_mk: 'INF2509', nama_mk: 'Fuzzy Logic', sks: 2, semester: 3, jenis: 'wajib' as const, konsentrasi: null, deskripsi: 'Teori logika fuzzy dan penerapannya dalam sistem cerdas dan pengambilan keputusan.', programStudiId: programStudiTI.id },
    { kode_mk: 'INF2510', nama_mk: 'Analisis dan Desain Perangkat Lunak', sks: 3, semester: 3, jenis: 'wajib' as const, konsentrasi: null, deskripsi: 'Teknik analisis kebutuhan dan perancangan sistem perangkat lunak.', programStudiId: programStudiTI.id },
    { kode_mk: 'INF2511', nama_mk: 'Pemrograman Web I', sks: 3, semester: 3, jenis: 'wajib' as const, konsentrasi: null, deskripsi: 'Dasar-dasar pengembangan web menggunakan HTML, CSS, dan JavaScript.', programStudiId: programStudiTI.id },
    { kode_mk: 'INF2512', nama_mk: 'Aljabar Linier', sks: 3, semester: 3, jenis: 'wajib' as const, konsentrasi: null, deskripsi: 'Konsep vektor, matriks, dan transformasi linier untuk pemrosesan data dan grafis.', programStudiId: programStudiTI.id },
    { kode_mk: 'INF2513', nama_mk: 'Basis Data', sks: 3, semester: 3, jenis: 'wajib' as const, konsentrasi: null, deskripsi: 'Konsep perancangan, manipulasi, dan manajemen sistem basis data relasional.', programStudiId: programStudiTI.id },
    { kode_mk: 'INF2514', nama_mk: 'Rekayasa Perangkat Lunak', sks: 3, semester: 3, jenis: 'wajib' as const, konsentrasi: null, deskripsi: 'Prinsip, model, dan metodologi pengembangan perangkat lunak skala besar.', programStudiId: programStudiTI.id },
    { kode_mk: 'INF2515', nama_mk: 'Bahasa Inggris', sks: 2, semester: 3, jenis: 'wajib' as const, konsentrasi: null, deskripsi: 'Kemampuan membaca dan menulis teks akademik dan teknis dalam bahasa Inggris.', programStudiId: programStudiTI.id },
    { kode_mk: 'INF2516', nama_mk: 'Pemrograman Berorientasi Objek', sks: 3, semester: 3, jenis: 'wajib' as const, konsentrasi: null, deskripsi: 'Paradigma OOP menggunakan bahasa seperti Java atau Python.', programStudiId: programStudiTI.id },
    { kode_mk: 'INF2517', nama_mk: 'Sistem Operasi', sks: 2, semester: 3, jenis: 'wajib' as const, konsentrasi: null, deskripsi: 'Konsep dasar sistem operasi, manajemen proses, memori, dan file.', programStudiId: programStudiTI.id },
    { kode_mk: 'INF2518', nama_mk: 'Pemrograman Web II', sks: 3, semester: 4, jenis: 'wajib' as const, konsentrasi: null, deskripsi: 'Pengembangan web lanjutan dengan backend dan framework modern.', programStudiId: programStudiTI.id },
    { kode_mk: 'INF2519', nama_mk: 'Human-Computer Interaction', sks: 3, semester: 4, jenis: 'wajib' as const, konsentrasi: null, deskripsi: 'Desain dan evaluasi antarmuka pengguna agar efektif dan ramah pengguna.', programStudiId: programStudiTI.id },
    { kode_mk: 'INF2520', nama_mk: 'Modelling 3D', sks: 3, semester: 4, jenis: 'wajib' as const, konsentrasi: null, deskripsi: 'Teknik dasar pemodelan objek tiga dimensi menggunakan perangkat lunak desain.', programStudiId: programStudiTI.id },
    { kode_mk: 'INF2521', nama_mk: 'Kecerdasan Buatan', sks: 2, semester: 4, jenis: 'wajib' as const, konsentrasi: null, deskripsi: 'Dasar AI, termasuk representasi pengetahuan dan teknik pencarian.', programStudiId: programStudiTI.id },
    { kode_mk: 'INF2522', nama_mk: 'Jaringan Komputer I', sks: 3, semester: 4, jenis: 'wajib' as const, konsentrasi: null, deskripsi: 'Arsitektur dan protokol jaringan komputer dasar, seperti TCP/IP.', programStudiId: programStudiTI.id },
    { kode_mk: 'INF2523', nama_mk: 'Animasi 2D', sks: 3, semester: 4, jenis: 'wajib' as const, konsentrasi: null, deskripsi: 'Pembuatan animasi dua dimensi dengan teknik manual dan digital.', programStudiId: programStudiTI.id },
    { kode_mk: 'INF2524', nama_mk: 'Statistika', sks: 2, semester: 4, jenis: 'wajib' as const, konsentrasi: null, deskripsi: 'Analisis data, probabilitas, dan inferensi statistik untuk penelitian.', programStudiId: programStudiTI.id },
    { kode_mk: 'INF2525', nama_mk: 'Matematika Diskrit', sks: 2, semester: 4, jenis: 'wajib' as const, konsentrasi: null, deskripsi: 'Logika matematika, himpunan, relasi, graf, dan kombinatorika.', programStudiId: programStudiTI.id },
    { kode_mk: 'INF2526', nama_mk: 'Technopreneurship', sks: 2, semester: 4, jenis: 'wajib' as const, konsentrasi: null, deskripsi: 'Dasar kewirausahaan berbasis teknologi dan pengembangan startup.', programStudiId: programStudiTI.id },
    { kode_mk: 'INF2527', nama_mk: 'KKL', sks: 1, semester: 4, jenis: 'wajib' as const, konsentrasi: null, deskripsi: 'Kegiatan Kuliah Kerja Lapangan di industri atau institusi mitra.', programStudiId: programStudiTI.id },
    { kode_mk: 'INF2528', nama_mk: 'Pemrograman Berbasis Platform', sks: 4, semester: 5, jenis: 'wajib' as const, konsentrasi: null, deskripsi: 'Pengembangan aplikasi untuk platform tertentu seperti Android atau iOS.', programStudiId: programStudiTI.id },
    { kode_mk: 'INF2529', nama_mk: 'Jaringan Komputer II', sks: 2, semester: 5, jenis: 'wajib' as const, konsentrasi: null, deskripsi: 'Jaringan tingkat lanjut: switching, routing, keamanan, dan topologi.', programStudiId: programStudiTI.id },
    { kode_mk: 'INF2530', nama_mk: 'Sistem Media Interaktif', sks: 3, semester: 5, jenis: 'wajib' as const, konsentrasi: null, deskripsi: 'Desain dan implementasi aplikasi media yang responsif dan interaktif.', programStudiId: programStudiTI.id },
    { kode_mk: 'INF2531', nama_mk: 'Visualisasi Data', sks: 3, semester: 5, jenis: 'wajib' as const, konsentrasi: null, deskripsi: 'Teknik visualisasi untuk menyajikan data kompleks secara informatif.', programStudiId: programStudiTI.id },
    { kode_mk: 'INF2532', nama_mk: 'Metodologi Penelitian', sks: 2, semester: 5, jenis: 'wajib' as const, konsentrasi: null, deskripsi: 'Langkah-langkah ilmiah dalam merancang dan menulis proposal penelitian.', programStudiId: programStudiTI.id },
    { kode_mk: 'INF2533', nama_mk: 'Etika dan Profesi', sks: 2, semester: 5, jenis: 'wajib' as const, konsentrasi: null, deskripsi: 'Etika dalam profesi IT dan tanggung jawab sosial teknologi informasi.', programStudiId: programStudiTI.id },
    { kode_mk: 'INF2534', nama_mk: 'Keamanan Data dan Informasi', sks: 3, semester: 6, jenis: 'wajib' as const, konsentrasi: null, deskripsi: 'Teknik dan konsep keamanan siber dan perlindungan data digital.', programStudiId: programStudiTI.id },
    { kode_mk: 'INF2535', nama_mk: 'Penjaminan Kualitas Perangkat Lunak', sks: 3, semester: 6, jenis: 'wajib' as const, konsentrasi: null, deskripsi: 'Teknik testing dan quality assurance pada pengembangan perangkat lunak.', programStudiId: programStudiTI.id },
    { kode_mk: 'INF2536', nama_mk: 'Cloud Computing', sks: 3, semester: 6, jenis: 'wajib' as const, konsentrasi: null, deskripsi: 'Konsep komputasi awan dan penerapannya dalam infrastruktur TI modern.', programStudiId: programStudiTI.id },
    { kode_mk: 'INF2537', nama_mk: 'Capstone Project', sks: 3, semester: 6, jenis: 'wajib' as const, konsentrasi: null, deskripsi: 'Proyek akhir kelompok berbasis solusi nyata menggunakan seluruh kompetensi yang dimiliki.', programStudiId: programStudiTI.id },
    { kode_mk: 'INF2538', nama_mk: 'PPL', sks: 2, semester: 7, jenis: 'wajib' as const, konsentrasi: null, deskripsi: 'Praktik Pengalaman Lapangan di instansi atau perusahaan mitra.', programStudiId: programStudiTI.id },
    { kode_mk: 'INF2539', nama_mk: 'KKN', sks: 4, semester: 7, jenis: 'wajib' as const, konsentrasi: null, deskripsi: 'Kuliah Kerja Nyata sebagai pengabdian masyarakat berbasis keilmuan.', programStudiId: programStudiTI.id },
    { kode_mk: 'INF2540', nama_mk: 'Skripsi', sks: 6, semester: 8, jenis: 'wajib' as const, konsentrasi: null, deskripsi: 'Penelitian akhir individu sebagai syarat kelulusan program studi.', programStudiId: programStudiTI.id },
    
    // Konsentrasi Kecerdasan Buatan
    { kode_mk: 'INF2541', nama_mk: 'IoT', sks: 4, semester: 5, jenis: 'pilihan' as const, konsentrasi: 'kecerdasan_buatan' as const, deskripsi: 'Teknologi dan arsitektur Internet of Things serta aplikasinya.', programStudiId: programStudiTI.id },
    { kode_mk: 'INF2542', nama_mk: 'Pembelajaran Mesin', sks: 4, semester: 5, jenis: 'pilihan' as const, konsentrasi: 'kecerdasan_buatan' as const, deskripsi: 'Teknik dasar machine learning dan penerapannya dalam klasifikasi dan prediksi.', programStudiId: programStudiTI.id },
    { kode_mk: 'INF2543', nama_mk: 'Big Data', sks: 4, semester: 5, jenis: 'pilihan' as const, konsentrasi: 'kecerdasan_buatan' as const, deskripsi: 'Konsep dan alat untuk memproses data dalam skala besar.', programStudiId: programStudiTI.id },
    { kode_mk: 'INF2544', nama_mk: 'Decision Support System', sks: 4, semester: 6, jenis: 'pilihan' as const, konsentrasi: 'kecerdasan_buatan' as const, deskripsi: 'Sistem pendukung keputusan berbasis data dan model.', programStudiId: programStudiTI.id },
    { kode_mk: 'INF2545', nama_mk: 'Deep Learning', sks: 4, semester: 6, jenis: 'pilihan' as const, konsentrasi: 'kecerdasan_buatan' as const, deskripsi: 'Jaringan saraf dalam dan aplikasinya dalam AI tingkat lanjut.', programStudiId: programStudiTI.id },
    
    // Konsentrasi Multimedia
    { kode_mk: 'INF2546', nama_mk: 'Animasi 3D', sks: 4, semester: 5, jenis: 'pilihan' as const, konsentrasi: 'multimedia' as const, deskripsi: 'Teknik lanjutan dalam pembuatan animasi tiga dimensi.', programStudiId: programStudiTI.id },
    { kode_mk: 'INF2547', nama_mk: 'Game Development', sks: 4, semester: 5, jenis: 'pilihan' as const, konsentrasi: 'multimedia' as const, deskripsi: 'Proses perancangan dan pengembangan game interaktif.', programStudiId: programStudiTI.id },
    { kode_mk: 'INF2548', nama_mk: 'Virtual and Augmented Reality', sks: 4, semester: 5, jenis: 'pilihan' as const, konsentrasi: 'multimedia' as const, deskripsi: 'Teknologi dan pembuatan aplikasi VR dan AR.', programStudiId: programStudiTI.id },
    { kode_mk: 'INF2549', nama_mk: 'Content Creator', sks: 4, semester: 6, jenis: 'pilihan' as const, konsentrasi: 'multimedia' as const, deskripsi: 'Produksi konten digital kreatif untuk berbagai platform media.', programStudiId: programStudiTI.id },
    { kode_mk: 'INF2550', nama_mk: 'Audio Video Editing', sks: 4, semester: 6, jenis: 'pilihan' as const, konsentrasi: 'multimedia' as const, deskripsi: 'Teknik pengeditan audio dan video untuk produksi media.', programStudiId: programStudiTI.id }
  ];

  // Mata Kuliah MINIMAL untuk SAINS DATA
  const mataKuliahSD = [
    // Semester 1 - Wajib Umum (sama untuk SD)
    { kode_mk: 'SD-U1', nama_mk: 'Pancasila', sks: 2, semester: 1, jenis: 'wajib' as const, konsentrasi: null, deskripsi: 'Mempelajari nilai-nilai dasar Pancasila sebagai ideologi dan pandangan hidup bangsa Indonesia.', programStudiId: programStudiSD.id },
    { kode_mk: 'SD-U3', nama_mk: 'Bahasa Indonesia', sks: 2, semester: 1, jenis: 'wajib' as const, konsentrasi: null, deskripsi: 'Pengembangan kemampuan berbahasa Indonesia secara efektif dalam konteks akademik dan profesional.', programStudiId: programStudiSD.id },
    { kode_mk: 'SD-U4', nama_mk: 'Metodologi Studi Islam', sks: 3, semester: 1, jenis: 'wajib' as const, konsentrasi: null, deskripsi: 'Pendekatan dan metode ilmiah dalam memahami ajaran Islam secara komprehensif.', programStudiId: programStudiSD.id },
    { kode_mk: 'SD-U7', nama_mk: 'Academic Writing', sks: 3, semester: 1, jenis: 'wajib' as const, konsentrasi: null, deskripsi: 'Teknik dan strategi penulisan ilmiah dalam bahasa Inggris untuk tujuan akademik.', programStudiId: programStudiSD.id },
    { kode_mk: 'SD-U2', nama_mk: 'Kewarganegaraan', sks: 2, semester: 2, jenis: 'wajib' as const, konsentrasi: null, deskripsi: 'Pemahaman hak dan kewajiban sebagai warga negara serta wawasan kebangsaan.', programStudiId: programStudiSD.id },
    { kode_mk: 'SD-U5', nama_mk: 'Moderasi Beragama', sks: 3, semester: 2, jenis: 'wajib' as const, konsentrasi: null, deskripsi: 'Pendekatan moderat dalam beragama untuk membangun toleransi dan harmoni sosial.', programStudiId: programStudiSD.id },
    { kode_mk: 'SD-U6', nama_mk: 'Harmonisasi Sains dan Agama', sks: 3, semester: 2, jenis: 'wajib' as const, konsentrasi: null, deskripsi: 'Menjembatani sains dan ajaran agama dalam kehidupan sehari-hari dan teknologi.', programStudiId: programStudiSD.id },
    
    // Semester 1-2 - Spesifik Sains Data (Minimal)
    { kode_mk: 'DS2501', nama_mk: 'Kalkulus', sks: 2, semester: 1, jenis: 'wajib' as const, konsentrasi: null, deskripsi: 'Konsep limit, turunan, dan integral untuk mendukung analisis matematis.', programStudiId: programStudiSD.id },
    { kode_mk: 'DS2502', nama_mk: 'Pengenalan Programming', sks: 3, semester: 1, jenis: 'wajib' as const, konsentrasi: null, deskripsi: 'Konsep dasar pemrograman untuk data science menggunakan Python.', programStudiId: programStudiSD.id },
    { kode_mk: 'DS2503', nama_mk: 'Aljabar Linier Terapan', sks: 3, semester: 1, jenis: 'wajib' as const, konsentrasi: null, deskripsi: 'Konsep vektor dan matriks dengan aplikasi langsung pada sains data.', programStudiId: programStudiSD.id },
    { kode_mk: 'DS2504', nama_mk: 'Probabilitas dan Statistika', sks: 3, semester: 2, jenis: 'wajib' as const, konsentrasi: null, deskripsi: 'Fondasi probabilitas dan inferensi statistik untuk analisis data.', programStudiId: programStudiSD.id },
    { kode_mk: 'DS2505', nama_mk: 'SQL dan Database', sks: 2, semester: 2, jenis: 'wajib' as const, konsentrasi: null, deskripsi: 'Query database dan pengelolaan data relasional untuk data science.', programStudiId: programStudiSD.id },
    
    // Semester 3-6 - Spesifik Sains Data (Minimal)
    { kode_mk: 'DS2506', nama_mk: 'Data Visualization', sks: 2, semester: 3, jenis: 'wajib' as const, konsentrasi: null, deskripsi: 'Teknik visualisasi data untuk komunikasi insight bisnis.', programStudiId: programStudiSD.id },
    { kode_mk: 'DS2507', nama_mk: 'Exploratory Data Analysis', sks: 3, semester: 3, jenis: 'wajib' as const, konsentrasi: null, deskripsi: 'Teknik eksplorasi dan pemahaman data sebelum modeling.', programStudiId: programStudiSD.id },
    { kode_mk: 'DS2508', nama_mk: 'Supervised Learning', sks: 4, semester: 4, jenis: 'wajib' as const, konsentrasi: null, deskripsi: 'Teknik machine learning dengan supervised learning untuk prediksi dan klasifikasi.', programStudiId: programStudiSD.id },
    { kode_mk: 'DS2509', nama_mk: 'Unsupervised Learning', sks: 4, semester: 4, jenis: 'wajib' as const, konsentrasi: null, deskripsi: 'Teknik machine learning dengan unsupervised learning untuk clustering dan dimensionality reduction.', programStudiId: programStudiSD.id },
    { kode_mk: 'DS2510', nama_mk: 'Deep Learning Basics', sks: 3, semester: 5, jenis: 'wajib' as const, konsentrasi: null, deskripsi: 'Pengenalan neural networks dan deep learning untuk sains data.', programStudiId: programStudiSD.id },
    { kode_mk: 'DS2511', nama_mk: 'Big Data Technologies', sks: 3, semester: 5, jenis: 'wajib' as const, konsentrasi: null, deskripsi: 'Teknologi big data dan distributed computing untuk processing data besar.', programStudiId: programStudiSD.id },
    { kode_mk: 'DS2512', nama_mk: 'Data Science Project', sks: 4, semester: 6, jenis: 'wajib' as const, konsentrasi: null, deskripsi: 'Proyek akhir menerapkan seluruh teknik data science dalam kasus nyata.', programStudiId: programStudiSD.id },
    { kode_mk: 'DS2513', nama_mk: 'PPL', sks: 2, semester: 7, jenis: 'wajib' as const, konsentrasi: null, deskripsi: 'Praktik Pengalaman Lapangan di industri data science.', programStudiId: programStudiSD.id },
    { kode_mk: 'DS2514', nama_mk: 'Skripsi', sks: 6, semester: 8, jenis: 'wajib' as const, konsentrasi: null, deskripsi: 'Penelitian akhir dalam bidang sains data.', programStudiId: programStudiSD.id }
  ];

  // Seed Mata Kuliah Informatika
  for (const mk of mataKuliahTI) {
    await prisma.mATA_KULIAH.upsert({
      where: { kode_mk: mk.kode_mk },
      update: {},
      create: mk
    });
  }

  // Seed Mata Kuliah Sains Data
  for (const mk of mataKuliahSD) {
    await prisma.mATA_KULIAH.upsert({
      where: { kode_mk: mk.kode_mk },
      update: {},
      create: mk
    });
  }
  
  console.log('✓ Mata Kuliah seeded (50 for Informatika, 20 for Sains Data)');
}

// ==================== KURIKULUM ====================
async function seedKurikulum() {
  console.log('📋 Seeding Kurikulum...');

  // Get program studi IDs
  const programStudiTI = await prisma.pROGRAM_STUDI.findFirst({
    where: { kode_program_studi: 'TI' }
  });
  const programStudiSD = await prisma.pROGRAM_STUDI.findFirst({
    where: { kode_program_studi: 'SD' }
  });

  if (!programStudiTI) {
    throw new Error('Program Studi TI not found');
  }
  if (!programStudiSD) {
    throw new Error('Program Studi SD not found');
  }

  const kurikulumData = [
    {
      kode_kurikulum: 'KUR2024-TI',
      nama_kurikulum: 'Kurikulum Program Studi Informatika 2024',
      tahun_akademik: '2024/2025',
      jurusan: 'Informatika',
      programStudiId: programStudiTI.id,
      jenjang: 'S1',
      status_aktif: true,
      deskripsi: 'Kurikulum berbasis Outcome-Based Education untuk Program Studi Informatika UIN Gusdur'
    },
    {
      kode_kurikulum: 'KUR2024-SD',
      nama_kurikulum: 'Kurikulum Program Studi Sains Data 2024',
      tahun_akademik: '2024/2025',
      jurusan: 'Sains Data',
      programStudiId: programStudiSD.id,
      jenjang: 'S1',
      status_aktif: true,
      deskripsi: 'Kurikulum berbasis Outcome-Based Education untuk Program Studi Sains Data UIN Gusdur'
    }
  ];

  for (const kurikulum of kurikulumData) {
    await prisma.kURIKULUM.upsert({
      where: { kode_kurikulum: kurikulum.kode_kurikulum },
      update: {},
      create: kurikulum
    });
  }

  console.log('✓ Kurikulum seeded');
}

// ==================== CPMK ====================
async function seedCPMK() {
  console.log('📋 Seeding CPMK...');
  
  const cpmkData = [
    // Pengenalan Pemrograman (INF2502)
    {
      mata_kuliah_kode: 'INF2502',
      kode_cpmk: 'CPMK-INF2502-01',
      deskripsi: 'Mahasiswa mampu memahami konsep dasar pemrograman',
      bobot_persen: 25.0,
      urutan: 1
    },
    {
      mata_kuliah_kode: 'INF2502',
      kode_cpmk: 'CPMK-INF2502-02',
      deskripsi: 'Mahasiswa mampu mengimplementasikan algoritma sederhana dalam kode program',
      bobot_persen: 35.0,
      urutan: 2
    },
    {
      mata_kuliah_kode: 'INF2502',
      kode_cpmk: 'CPMK-INF2502-03',
      deskripsi: 'Mahasiswa mampu melakukan debugging dan testing program sederhana',
      bobot_persen: 25.0,
      urutan: 3
    },
    {
      mata_kuliah_kode: 'INF2502',
      kode_cpmk: 'CPMK-INF2502-04',
      deskripsi: 'Mahasiswa mampu mendokumentasikan kode program dengan baik',
      bobot_persen: 15.0,
      urutan: 4
    },

    // Algoritma dan Pemrograman (INF2506)
    {
      mata_kuliah_kode: 'INF2506',
      kode_cpmk: 'CPMK-INF2506-01',
      deskripsi: 'Mahasiswa mampu menganalisis kompleksitas algoritma',
      bobot_persen: 20.0,
      urutan: 1
    },
    {
      mata_kuliah_kode: 'INF2506',
      kode_cpmk: 'CPMK-INF2506-02',
      deskripsi: 'Mahasiswa mampu merancang algoritma untuk menyelesaikan masalah kompleks',
      bobot_persen: 30.0,
      urutan: 2
    },
    {
      mata_kuliah_kode: 'INF2506',
      kode_cpmk: 'CPMK-INF2506-03',
      deskripsi: 'Mahasiswa mampu mengimplementasikan algoritma dalam bahasa pemrograman',
      bobot_persen: 30.0,
      urutan: 3
    },
    {
      mata_kuliah_kode: 'INF2506',
      kode_cpmk: 'CPMK-INF2506-04',
      deskripsi: 'Mahasiswa mampu mengoptimalkan kode program untuk efisiensi',
      bobot_persen: 20.0,
      urutan: 4
    },

    // Struktur Data (INF2508)
    {
      mata_kuliah_kode: 'INF2508',
      kode_cpmk: 'CPMK-INF2508-01',
      deskripsi: 'Mahasiswa mampu memahami berbagai struktur data dan penggunaannya',
      bobot_persen: 25.0,
      urutan: 1
    },
    {
      mata_kuliah_kode: 'INF2508',
      kode_cpmk: 'CPMK-INF2508-02',
      deskripsi: 'Mahasiswa mampu mengimplementasikan struktur data dalam program',
      bobot_persen: 35.0,
      urutan: 2
    },
    {
      mata_kuliah_kode: 'INF2508',
      kode_cpmk: 'CPMK-INF2508-03',
      deskripsi: 'Mahasiswa mampu menganalisis kompleksitas waktu dan ruang struktur data',
      bobot_persen: 25.0,
      urutan: 3
    },
    {
      mata_kuliah_kode: 'INF2508',
      kode_cpmk: 'CPMK-INF2508-04',
      deskripsi: 'Mahasiswa mampu memilih struktur data yang tepat untuk masalah tertentu',
      bobot_persen: 15.0,
      urutan: 4
    },

    // Basis Data (INF2513)
    {
      mata_kuliah_kode: 'INF2513',
      kode_cpmk: 'CPMK-INF2513-01',
      deskripsi: 'Mahasiswa mampu memahami konsep dan prinsip basis data relasional',
      bobot_persen: 20.0,
      urutan: 1
    },
    {
      mata_kuliah_kode: 'INF2513',
      kode_cpmk: 'CPMK-INF2513-02',
      deskripsi: 'Mahasiswa mampu merancang skema basis data menggunakan ERD',
      bobot_persen: 25.0,
      urutan: 2
    },
    {
      mata_kuliah_kode: 'INF2513',
      kode_cpmk: 'CPMK-INF2513-03',
      deskripsi: 'Mahasiswa mampu mengimplementasikan basis data menggunakan SQL',
      bobot_persen: 30.0,
      urutan: 3
    },
    {
      mata_kuliah_kode: 'INF2513',
      kode_cpmk: 'CPMK-INF2513-04',
      deskripsi: 'Mahasiswa mampu melakukan normalisasi dan optimasi query basis data',
      bobot_persen: 25.0,
      urutan: 4
    },

    // Pemrograman Web I (INF2511)
    {
      mata_kuliah_kode: 'INF2511',
      kode_cpmk: 'CPMK-INF2511-01',
      deskripsi: 'Mahasiswa mampu memahami konsep dasar pengembangan web',
      bobot_persen: 20.0,
      urutan: 1
    },
    {
      mata_kuliah_kode: 'INF2511',
      kode_cpmk: 'CPMK-INF2511-02',
      deskripsi: 'Mahasiswa mampu membuat halaman web menggunakan HTML dan CSS',
      bobot_persen: 30.0,
      urutan: 2
    },
    {
      mata_kuliah_kode: 'INF2511',
      kode_cpmk: 'CPMK-INF2511-03',
      deskripsi: 'Mahasiswa mampu mengimplementasikan interaktivitas menggunakan JavaScript',
      bobot_persen: 30.0,
      urutan: 3
    },
    {
      mata_kuliah_kode: 'INF2511',
      kode_cpmk: 'CPMK-INF2511-04',
      deskripsi: 'Mahasiswa mampu membuat aplikasi web sederhana yang responsif',
      bobot_persen: 20.0,
      urutan: 4
    },

    // Rekayasa Perangkat Lunak (INF2514)
    {
      mata_kuliah_kode: 'INF2514',
      kode_cpmk: 'CPMK-INF2514-01',
      deskripsi: 'Mahasiswa mampu memahami metodologi pengembangan perangkat lunak',
      bobot_persen: 20.0,
      urutan: 1
    },
    {
      mata_kuliah_kode: 'INF2514',
      kode_cpmk: 'CPMK-INF2514-02',
      deskripsi: 'Mahasiswa mampu menganalisis kebutuhan pengguna dan merancang solusi',
      bobot_persen: 25.0,
      urutan: 2
    },
    {
      mata_kuliah_kode: 'INF2514',
      kode_cpmk: 'CPMK-INF2514-03',
      deskripsi: 'Mahasiswa mampu membuat dokumentasi teknis dan user manual',
      bobot_persen: 25.0,
      urutan: 3
    },
    {
      mata_kuliah_kode: 'INF2514',
      kode_cpmk: 'CPMK-INF2514-04',
      deskripsi: 'Mahasiswa mampu mengelola proyek pengembangan perangkat lunak',
      bobot_persen: 30.0,
      urutan: 4
    },

    // Kecerdasan Buatan (INF2521)
    {
      mata_kuliah_kode: 'INF2521',
      kode_cpmk: 'CPMK-INF2521-01',
      deskripsi: 'Mahasiswa mampu memahami konsep dasar kecerdasan buatan',
      bobot_persen: 25.0,
      urutan: 1
    },
    {
      mata_kuliah_kode: 'INF2521',
      kode_cpmk: 'CPMK-INF2521-02',
      deskripsi: 'Mahasiswa mampu mengimplementasikan algoritma pencarian dan optimasi',
      bobot_persen: 30.0,
      urutan: 2
    },
    {
      mata_kuliah_kode: 'INF2521',
      kode_cpmk: 'CPMK-INF2521-03',
      deskripsi: 'Mahasiswa mampu menerapkan teknik machine learning sederhana',
      bobot_persen: 30.0,
      urutan: 3
    },
    {
      mata_kuliah_kode: 'INF2521',
      kode_cpmk: 'CPMK-INF2521-04',
      deskripsi: 'Mahasiswa mampu menganalisis dan mengevaluasi solusi AI',
      bobot_persen: 15.0,
      urutan: 4
    },

    // ========== SAINS DATA COURSES ==========
    // Kalkulus (DS2501)
    {
      mata_kuliah_kode: 'DS2501',
      kode_cpmk: 'CPMK-DS2501-01',
      deskripsi: 'Mahasiswa mampu memahami konsep limit, kontinuitas, dan derivatif',
      bobot_persen: 30.0,
      urutan: 1
    },
    {
      mata_kuliah_kode: 'DS2501',
      kode_cpmk: 'CPMK-DS2501-02',
      deskripsi: 'Mahasiswa mampu menghitung integral dan penerapannya dalam analisis data',
      bobot_persen: 35.0,
      urutan: 2
    },
    {
      mata_kuliah_kode: 'DS2501',
      kode_cpmk: 'CPMK-DS2501-03',
      deskripsi: 'Mahasiswa mampu mengaplikasikan kalkulus dalam optimasi dan analisis matematis',
      bobot_persen: 35.0,
      urutan: 3
    },

    // Pengenalan Programming (DS2502)
    {
      mata_kuliah_kode: 'DS2502',
      kode_cpmk: 'CPMK-DS2502-01',
      deskripsi: 'Mahasiswa mampu memahami konsep dasar Python programming',
      bobot_persen: 25.0,
      urutan: 1
    },
    {
      mata_kuliah_kode: 'DS2502',
      kode_cpmk: 'CPMK-DS2502-02',
      deskripsi: 'Mahasiswa mampu menggunakan library data science seperti NumPy dan Pandas',
      bobot_persen: 35.0,
      urutan: 2
    },
    {
      mata_kuliah_kode: 'DS2502',
      kode_cpmk: 'CPMK-DS2502-03',
      deskripsi: 'Mahasiswa mampu menulis kode untuk manipulasi dan analisis data',
      bobot_persen: 30.0,
      urutan: 3
    },
    {
      mata_kuliah_kode: 'DS2502',
      kode_cpmk: 'CPMK-DS2502-04',
      deskripsi: 'Mahasiswa mampu melakukan debugging dan optimasi kode data science',
      bobot_persen: 10.0,
      urutan: 4
    },

    // Aljabar Linier Terapan (DS2503)
    {
      mata_kuliah_kode: 'DS2503',
      kode_cpmk: 'CPMK-DS2503-01',
      deskripsi: 'Mahasiswa mampu memahami konsep vektor, matriks, dan transformasi linier',
      bobot_persen: 25.0,
      urutan: 1
    },
    {
      mata_kuliah_kode: 'DS2503',
      kode_cpmk: 'CPMK-DS2503-02',
      deskripsi: 'Mahasiswa mampu melakukan operasi matriks dan menghitung eigenvalue/eigenvector',
      bobot_persen: 30.0,
      urutan: 2
    },
    {
      mata_kuliah_kode: 'DS2503',
      kode_cpmk: 'CPMK-DS2503-03',
      deskripsi: 'Mahasiswa mampu mengaplikasikan aljabar linier dalam machine learning dan data compression',
      bobot_persen: 45.0,
      urutan: 3
    },

    // Probabilitas dan Statistika (DS2504)
    {
      mata_kuliah_kode: 'DS2504',
      kode_cpmk: 'CPMK-DS2504-01',
      deskripsi: 'Mahasiswa mampu memahami konsep probabilitas, distribusi, dan teorema limit pusat',
      bobot_persen: 30.0,
      urutan: 1
    },
    {
      mata_kuliah_kode: 'DS2504',
      kode_cpmk: 'CPMK-DS2504-02',
      deskripsi: 'Mahasiswa mampu melakukan inferensi statistik dan uji hipotesis',
      bobot_persen: 35.0,
      urutan: 2
    },
    {
      mata_kuliah_kode: 'DS2504',
      kode_cpmk: 'CPMK-DS2504-03',
      deskripsi: 'Mahasiswa mampu menginterpretasikan hasil analisis statistik dan membuat kesimpulan',
      bobot_persen: 35.0,
      urutan: 3
    },

    // SQL dan Database (DS2505)
    {
      mata_kuliah_kode: 'DS2505',
      kode_cpmk: 'CPMK-DS2505-01',
      deskripsi: 'Mahasiswa mampu membuat query SQL untuk mengakses dan mengmanipulasi data',
      bobot_persen: 35.0,
      urutan: 1
    },
    {
      mata_kuliah_kode: 'DS2505',
      kode_cpmk: 'CPMK-DS2505-02',
      deskripsi: 'Mahasiswa mampu merancang skema database dan melakukan normalisasi',
      bobot_persen: 30.0,
      urutan: 2
    },
    {
      mata_kuliah_kode: 'DS2505',
      kode_cpmk: 'CPMK-DS2505-03',
      deskripsi: 'Mahasiswa mampu mengoptimalkan query dan mengelola performa database',
      bobot_persen: 35.0,
      urutan: 3
    },

    // Data Visualization (DS2506)
    {
      mata_kuliah_kode: 'DS2506',
      kode_cpmk: 'CPMK-DS2506-01',
      deskripsi: 'Mahasiswa mampu membuat berbagai jenis visualisasi data menggunakan Matplotlib dan Seaborn',
      bobot_persen: 40.0,
      urutan: 1
    },
    {
      mata_kuliah_kode: 'DS2506',
      kode_cpmk: 'CPMK-DS2506-02',
      deskripsi: 'Mahasiswa mampu mengkomunikasikan insight data melalui visualisasi yang efektif',
      bobot_persen: 30.0,
      urutan: 2
    },
    {
      mata_kuliah_kode: 'DS2506',
      kode_cpmk: 'CPMK-DS2506-03',
      deskripsi: 'Mahasiswa mampu menggunakan interactive visualization tools seperti Plotly dan Bokeh',
      bobot_persen: 30.0,
      urutan: 3
    },

    // Exploratory Data Analysis (DS2507)
    {
      mata_kuliah_kode: 'DS2507',
      kode_cpmk: 'CPMK-DS2507-01',
      deskripsi: 'Mahasiswa mampu melakukan eksplorasi data untuk memahami struktur dan pola data',
      bobot_persen: 35.0,
      urutan: 1
    },
    {
      mata_kuliah_kode: 'DS2507',
      kode_cpmk: 'CPMK-DS2507-02',
      deskripsi: 'Mahasiswa mampu mendeteksi outlier, missing values, dan menangani data quality issues',
      bobot_persen: 30.0,
      urutan: 2
    },
    {
      mata_kuliah_kode: 'DS2507',
      kode_cpmk: 'CPMK-DS2507-03',
      deskripsi: 'Mahasiswa mampu melakukan feature engineering dan data transformation',
      bobot_persen: 35.0,
      urutan: 3
    },

    // Supervised Learning (DS2508)
    {
      mata_kuliah_kode: 'DS2508',
      kode_cpmk: 'CPMK-DS2508-01',
      deskripsi: 'Mahasiswa mampu memahami berbagai algoritma supervised learning seperti regression dan classification',
      bobot_persen: 25.0,
      urutan: 1
    },
    {
      mata_kuliah_kode: 'DS2508',
      kode_cpmk: 'CPMK-DS2508-02',
      deskripsi: 'Mahasiswa mampu melatih dan mengevaluasi model supervised learning dengan metrik yang sesuai',
      bobot_persen: 35.0,
      urutan: 2
    },
    {
      mata_kuliah_kode: 'DS2508',
      kode_cpmk: 'CPMK-DS2508-03',
      deskripsi: 'Mahasiswa mampu melakukan hyperparameter tuning dan cross-validation',
      bobot_persen: 25.0,
      urutan: 3
    },
    {
      mata_kuliah_kode: 'DS2508',
      kode_cpmk: 'CPMK-DS2508-04',
      deskripsi: 'Mahasiswa mampu mengatasi overfitting dan memilih model terbaik',
      bobot_persen: 15.0,
      urutan: 4
    },

    // Unsupervised Learning (DS2509)
    {
      mata_kuliah_kode: 'DS2509',
      kode_cpmk: 'CPMK-DS2509-01',
      deskripsi: 'Mahasiswa mampu memahami algoritma clustering seperti K-Means, Hierarchical, dan DBSCAN',
      bobot_persen: 30.0,
      urutan: 1
    },
    {
      mata_kuliah_kode: 'DS2509',
      kode_cpmk: 'CPMK-DS2509-02',
      deskripsi: 'Mahasiswa mampu melakukan dimensionality reduction menggunakan PCA dan t-SNE',
      bobot_persen: 25.0,
      urutan: 2
    },
    {
      mata_kuliah_kode: 'DS2509',
      kode_cpmk: 'CPMK-DS2509-03',
      deskripsi: 'Mahasiswa mampu mengevaluasi hasil unsupervised learning dengan silhouette score dan elbow method',
      bobot_persen: 25.0,
      urutan: 3
    },
    {
      mata_kuliah_kode: 'DS2509',
      kode_cpmk: 'CPMK-DS2509-04',
      deskripsi: 'Mahasiswa mampu menginterpretasikan hasil clustering dan dimensionality reduction',
      bobot_persen: 20.0,
      urutan: 4
    },

    // Deep Learning Basics (DS2510)
    {
      mata_kuliah_kode: 'DS2510',
      kode_cpmk: 'CPMK-DS2510-01',
      deskripsi: 'Mahasiswa mampu memahami konsep neural networks, activation functions, dan backpropagation',
      bobot_persen: 30.0,
      urutan: 1
    },
    {
      mata_kuliah_kode: 'DS2510',
      kode_cpmk: 'CPMK-DS2510-02',
      deskripsi: 'Mahasiswa mampu membangun dan melatih neural networks menggunakan TensorFlow/Keras',
      bobot_persen: 35.0,
      urutan: 2
    },
    {
      mata_kuliah_kode: 'DS2510',
      kode_cpmk: 'CPMK-DS2510-03',
      deskripsi: 'Mahasiswa mampu menerapkan deep learning untuk computer vision dan natural language processing',
      bobot_persen: 35.0,
      urutan: 3
    },

    // Big Data Technologies (DS2511)
    {
      mata_kuliah_kode: 'DS2511',
      kode_cpmk: 'CPMK-DS2511-01',
      deskripsi: 'Mahasiswa mampu memahami konsep distributed computing dan big data processing',
      bobot_persen: 25.0,
      urutan: 1
    },
    {
      mata_kuliah_kode: 'DS2511',
      kode_cpmk: 'CPMK-DS2511-02',
      deskripsi: 'Mahasiswa mampu menggunakan Apache Spark untuk processing data besar',
      bobot_persen: 40.0,
      urutan: 2
    },
    {
      mata_kuliah_kode: 'DS2511',
      kode_cpmk: 'CPMK-DS2511-03',
      deskripsi: 'Mahasiswa mampu melakukan data pipeline dan ETL dengan big data tools',
      bobot_persen: 35.0,
      urutan: 3
    },

    // Data Science Project (DS2512)
    {
      mata_kuliah_kode: 'DS2512',
      kode_cpmk: 'CPMK-DS2512-01',
      deskripsi: 'Mahasiswa mampu menentukan business problem dan merumuskan pertanyaan data science yang tepat',
      bobot_persen: 20.0,
      urutan: 1
    },
    {
      mata_kuliah_kode: 'DS2512',
      kode_cpmk: 'CPMK-DS2512-02',
      deskripsi: 'Mahasiswa mampu mengeksekusi end-to-end data science project dari eksplorasi hingga deployment',
      bobot_persen: 40.0,
      urutan: 2
    },
    {
      mata_kuliah_kode: 'DS2512',
      kode_cpmk: 'CPMK-DS2512-03',
      deskripsi: 'Mahasiswa mampu mendokumentasikan dan mempresentasikan hasil project dengan baik',
      bobot_persen: 25.0,
      urutan: 3
    },
    {
      mata_kuliah_kode: 'DS2512',
      kode_cpmk: 'CPMK-DS2512-04',
      deskripsi: 'Mahasiswa mampu bekerja dalam tim dan menggunakan version control untuk kolaborasi',
      bobot_persen: 15.0,
      urutan: 4
    },

    // PPL (DS2513)
    {
      mata_kuliah_kode: 'DS2513',
      kode_cpmk: 'CPMK-DS2513-01',
      deskripsi: 'Mahasiswa mampu mengaplikasikan ilmu data science dalam dunia industri nyata',
      bobot_persen: 40.0,
      urutan: 1
    },
    {
      mata_kuliah_kode: 'DS2513',
      kode_cpmk: 'CPMK-DS2513-02',
      deskripsi: 'Mahasiswa mampu berkomunikasi dan berkolaborasi dengan stakeholder industri',
      bobot_persen: 30.0,
      urutan: 2
    },
    {
      mata_kuliah_kode: 'DS2513',
      kode_cpmk: 'CPMK-DS2513-03',
      deskripsi: 'Mahasiswa mampu menyelesaikan masalah data science yang kompleks dalam setting praktis',
      bobot_persen: 30.0,
      urutan: 3
    },

    // Skripsi (DS2514)
    {
      mata_kuliah_kode: 'DS2514',
      kode_cpmk: 'CPMK-DS2514-01',
      deskripsi: 'Mahasiswa mampu melakukan penelitian ilmiah dan mengembangkan metodologi penelitian',
      bobot_persen: 30.0,
      urutan: 1
    },
    {
      mata_kuliah_kode: 'DS2514',
      kode_cpmk: 'CPMK-DS2514-02',
      deskripsi: 'Mahasiswa mampu menulis tesis dengan standar akademik dan ilmiah yang tinggi',
      bobot_persen: 35.0,
      urutan: 2
    },
    {
      mata_kuliah_kode: 'DS2514',
      kode_cpmk: 'CPMK-DS2514-03',
      deskripsi: 'Mahasiswa mampu mempertahankan penelitian di depan dewan penguji',
      bobot_persen: 35.0,
      urutan: 3
    },

    // General Courses (SD-U series)
    // Pancasila (SD-U1)
    {
      mata_kuliah_kode: 'SD-U1',
      kode_cpmk: 'CPMK-SD-U1-01',
      deskripsi: 'Mahasiswa mampu memahami nilai-nilai Pancasila dalam kehidupan sosial dan profesional',
      bobot_persen: 50.0,
      urutan: 1
    },
    {
      mata_kuliah_kode: 'SD-U1',
      kode_cpmk: 'CPMK-SD-U1-02',
      deskripsi: 'Mahasiswa mampu mengaplikasikan Pancasila dalam konteks kemajemukan dan nasionalisme',
      bobot_persen: 50.0,
      urutan: 2
    },

    // Kewarganegaraan (SD-U2)
    {
      mata_kuliah_kode: 'SD-U2',
      kode_cpmk: 'CPMK-SD-U2-01',
      deskripsi: 'Mahasiswa mampu memahami hak dan kewajiban sebagai warga negara',
      bobot_persen: 50.0,
      urutan: 1
    },
    {
      mata_kuliah_kode: 'SD-U2',
      kode_cpmk: 'CPMK-SD-U2-02',
      deskripsi: 'Mahasiswa mampu berpartisipasi aktif dalam kehidupan berbangsa dan bernegara',
      bobot_persen: 50.0,
      urutan: 2
    },

    // Bahasa Indonesia (SD-U3)
    {
      mata_kuliah_kode: 'SD-U3',
      kode_cpmk: 'CPMK-SD-U3-01',
      deskripsi: 'Mahasiswa mampu berkomunikasi secara efektif menggunakan Bahasa Indonesia',
      bobot_persen: 50.0,
      urutan: 1
    },
    {
      mata_kuliah_kode: 'SD-U3',
      kode_cpmk: 'CPMK-SD-U3-02',
      deskripsi: 'Mahasiswa mampu menulis karya ilmiah dan bisnis dengan Bahasa Indonesia yang baik',
      bobot_persen: 50.0,
      urutan: 2
    },

    // Metodologi Studi Islam (SD-U4)
    {
      mata_kuliah_kode: 'SD-U4',
      kode_cpmk: 'CPMK-SD-U4-01',
      deskripsi: 'Mahasiswa mampu memahami metodologi ilmiah dalam studi Islam',
      bobot_persen: 50.0,
      urutan: 1
    },
    {
      mata_kuliah_kode: 'SD-U4',
      kode_cpmk: 'CPMK-SD-U4-02',
      deskripsi: 'Mahasiswa mampu mengaplikasikan ajaran Islam dalam kehidupan modern dan profesional',
      bobot_persen: 50.0,
      urutan: 2
    },

    // Moderasi Beragama (SD-U5)
    {
      mata_kuliah_kode: 'SD-U5',
      kode_cpmk: 'CPMK-SD-U5-01',
      deskripsi: 'Mahasiswa mampu memahami prinsip moderasi dan toleransi dalam beragama',
      bobot_persen: 50.0,
      urutan: 1
    },
    {
      mata_kuliah_kode: 'SD-U5',
      kode_cpmk: 'CPMK-SD-U5-02',
      deskripsi: 'Mahasiswa mampu membangun harmoni sosial melalui sikap moderat dan inklusif',
      bobot_persen: 50.0,
      urutan: 2
    },

    // Harmonisasi Sains dan Agama (SD-U6)
    {
      mata_kuliah_kode: 'SD-U6',
      kode_cpmk: 'CPMK-SD-U6-01',
      deskripsi: 'Mahasiswa mampu memahami hubungan harmonis antara sains dan ajaran agama',
      bobot_persen: 50.0,
      urutan: 1
    },
    {
      mata_kuliah_kode: 'SD-U6',
      kode_cpmk: 'CPMK-SD-U6-02',
      deskripsi: 'Mahasiswa mampu mengintegrasikan perspektif sains dan nilai-nilai agama dalam pemecahan masalah',
      bobot_persen: 50.0,
      urutan: 2
    },

    // Academic Writing (SD-U7)
    {
      mata_kuliah_kode: 'SD-U7',
      kode_cpmk: 'CPMK-SD-U7-01',
      deskripsi: 'Mahasiswa mampu menulis artikel akademik dalam Bahasa Inggris yang baik',
      bobot_persen: 50.0,
      urutan: 1
    },
    {
      mata_kuliah_kode: 'SD-U7',
      kode_cpmk: 'CPMK-SD-U7-02',
      deskripsi: 'Mahasiswa mampu mempresentasikan penelitian dalam forum akademik internasional',
      bobot_persen: 50.0,
      urutan: 2
    }
  ];

  for (const cpmk of cpmkData) {
    // Get mata kuliah ID first
    const mataKuliah = await prisma.mATA_KULIAH.findUnique({
      where: { kode_mk: cpmk.mata_kuliah_kode }
    });

    if (!mataKuliah) {
      console.warn(`Mata kuliah ${cpmk.mata_kuliah_kode} not found, skipping CPMK ${cpmk.kode_cpmk}`);
      continue;
    }

    // Check if CPMK already exists
    const existingCPMK = await prisma.cPMK.findFirst({
      where: { kode_cpmk: cpmk.kode_cpmk }
    });

    if (existingCPMK) {
      // Update existing CPMK
      await prisma.cPMK.update({
        where: { id: existingCPMK.id },
        data: {
          mata_kuliah_id: mataKuliah.id,
          deskripsi: cpmk.deskripsi,
          bobot_persen: cpmk.bobot_persen,
          urutan: cpmk.urutan
        }
      });
    } else {
      // Create new CPMK
      await prisma.cPMK.create({
        data: {
          mata_kuliah_id: mataKuliah.id,
          kode_cpmk: cpmk.kode_cpmk,
          deskripsi: cpmk.deskripsi,
          bobot_persen: cpmk.bobot_persen,
          urutan: cpmk.urutan
        }
      });
    }
  }
  
  console.log('✓ CPMK seeded');
}

// ==================== KURIKULUM CPL MAPPING ====================
async function seedKurikulumCPLMapping() {
  console.log('📋 Seeding Kurikulum CPL Mapping...');
  
  const kurikulums = await prisma.kURIKULUM.findMany();
  const cpls = await prisma.cPL.findMany();

  // Map setiap Kurikulum ke CPL dengan program studi yang sama
  for (const kurikulum of kurikulums) {
    const kuraKodePrefix = kurikulum.kode_kurikulum.split('-')[1]; // Extract 'TI' or 'SD'
    
    // Filter CPL yang sama program studi-nya
    const relevantCpls = cpls.filter(cpl => {
      const cplKodePrefix = cpl.kode_cpl.split('-')[1]; // Extract 'TI' or 'SD'
      return cplKodePrefix === kuraKodePrefix;
    });

    // Map Kurikulum ke semua CPL yang relevan
    for (const cpl of relevantCpls) {
      await prisma.kURIKULUM_CPL_MAPPING.upsert({
        where: {
          kurikulum_id_cpl_id: {
            kurikulum_id: kurikulum.id,
            cpl_id: cpl.id
          }
        },
        update: {},
        create: {
          kurikulum_id: kurikulum.id,
          cpl_id: cpl.id
        }
      });
    }
  }
  
  console.log('✓ Kurikulum CPL Mapping seeded');
}

// ==================== PRASYARAT MK ====================
async function seedPrasyaratMK() {
  console.log('📋 Seeding Prasyarat MK...');
  
  // Get MK IDs first
  const pengenalan = await prisma.mATA_KULIAH.findUnique({ where: { kode_mk: 'INF2502' } });
  const algoritma = await prisma.mATA_KULIAH.findUnique({ where: { kode_mk: 'INF2506' } });
  const strukturData = await prisma.mATA_KULIAH.findUnique({ where: { kode_mk: 'INF2508' } });
  const webI = await prisma.mATA_KULIAH.findUnique({ where: { kode_mk: 'INF2511' } });
  const webII = await prisma.mATA_KULIAH.findUnique({ where: { kode_mk: 'INF2518' } });
  const oop = await prisma.mATA_KULIAH.findUnique({ where: { kode_mk: 'INF2516' } });
  const platformDev = await prisma.mATA_KULIAH.findUnique({ where: { kode_mk: 'INF2528' } });
  const jaringanI = await prisma.mATA_KULIAH.findUnique({ where: { kode_mk: 'INF2522' } });
  const jaringanII = await prisma.mATA_KULIAH.findUnique({ where: { kode_mk: 'INF2529' } });

  const prasyarat = [
    // Algoritma memerlukan Pengenalan Pemrograman
    { mk_id: algoritma!.id, prasyarat_mk_id: pengenalan!.id, jenis_prasyarat: 'wajib' as const },
    
    // Struktur Data memerlukan Algoritma
    { mk_id: strukturData!.id, prasyarat_mk_id: algoritma!.id, jenis_prasyarat: 'wajib' as const },
    
    // Web II memerlukan Web I
    { mk_id: webII!.id, prasyarat_mk_id: webI!.id, jenis_prasyarat: 'wajib' as const },
    
    // Pemrograman Berbasis Platform memerlukan OOP
    { mk_id: platformDev!.id, prasyarat_mk_id: oop!.id, jenis_prasyarat: 'wajib' as const },
    
    // Jaringan II memerlukan Jaringan I
    { mk_id: jaringanII!.id, prasyarat_mk_id: jaringanI!.id, jenis_prasyarat: 'wajib' as const },
  ];

  for (const p of prasyarat) {
    await prisma.pRASYARAT_MK.upsert({
      where: {
        mk_id_prasyarat_mk_id: {
          mk_id: p.mk_id,
          prasyarat_mk_id: p.prasyarat_mk_id
        }
      },
      update: {},
      create: p
    });
  }
  
  console.log('✓ Prasyarat MK seeded');
}

// ==================== PL-CPL MAPPING ====================
async function seedPLCPLMapping() {
  console.log('📋 Seeding PL-CPL Mapping...');
  
  const pls = await prisma.pROFIL_LULUSAN.findMany();
  const cpls = await prisma.cPL.findMany();
  
  // Map setiap PL hanya ke CPL dengan program studi yang sama (berdasarkan prefix)
  for (const pl of pls) {
    const plKodePrefix = pl.kode_pl.split('-')[1]; // Extract 'TI' or 'SD'
    
    // Filter CPL yang sama program studi-nya
    const relevantCpls = cpls.filter(cpl => {
      const cplKodePrefix = cpl.kode_cpl.split('-')[1]; // Extract 'TI' or 'SD'
      return cplKodePrefix === plKodePrefix;
    });
    
    // Map PL ke semua CPL yang relevan
    for (const cpl of relevantCpls) {
      await prisma.pL_CPL_MAPPING.upsert({
        where: {
          profil_lulusan_id_cpl_id: {
            profil_lulusan_id: pl.id,
            cpl_id: cpl.id
          }
        },
        update: {},
        create: {
          profil_lulusan_id: pl.id,
          cpl_id: cpl.id
        }
      });
    }
  }
  
  console.log('✓ PL-CPL Mapping seeded');
}

// ==================== CPL-CPMK MAPPING ====================
async function seedCPLCpmkMapping() {
  console.log('📋 Seeding CPL-CPMK Mapping...');

  const cpls = await prisma.cPL.findMany();
  const cpmks = await prisma.cPMK.findMany();

  // Clear existing mappings
  await prisma.cPMK_CPL_MAPPING.deleteMany();

  // Create mappings for each CPL with some CPMKs
  // This is a simplified mapping - in real scenario this would be based on curriculum design
  for (let i = 0; i < cpls.length; i++) {
    const cpl = cpls[i];
    // Each CPL gets mapped to 2-3 CPMKs
    const startIndex = i * 2;
    const endIndex = Math.min(startIndex + 3, cpmks.length);

    for (let j = startIndex; j < endIndex; j++) {
      const cpmk = cpmks[j];
      if (cpmk) {
        await prisma.cPMK_CPL_MAPPING.create({
          data: {
            cpl_id: cpl.id,
            cpmk_id: cpmk.id,
            kontribusi_persen: new Prisma.Decimal(100 / (endIndex - startIndex))
          }
        });
      }
    }
  }

  console.log('✓ CPL-CPMK Mapping seeded');
}

// ==================== CPL-BK MAPPING ====================
async function seedCPLBKMapping() {
  console.log('📋 Seeding CPL-BK Mapping...');
  
  // Get all CPL and BK
  const cpls = await prisma.cPL.findMany();
  const bks = await prisma.bAHAN_KAJIAN.findMany();
  
  // Create mappings based on program studi prefix
  for (let i = 0; i < cpls.length; i++) {
    const cpl = cpls[i];
    const cplKodePrefix = cpl.kode_cpl.split('-')[1]; // Extract 'TI' or 'SD'
    const relevantBks = bks.filter(bk => {
      const bkKodePrefix = bk.kode_bk.split('-')[1];
      return cplKodePrefix === bkKodePrefix;
    });
    
    // Map CPL to some of its relevant BK
    const mappedBkCount = Math.min(3, relevantBks.length);
    for (let j = 0; j < mappedBkCount; j++) {
      const bk = relevantBks[j];
      if (bk) {
        await prisma.cPL_BK_MAPPING.upsert({
          where: {
            cpl_id_bahan_kajian_id: {
              cpl_id: cpl.id,
              bahan_kajian_id: bk.id
            }
          },
          update: {},
          create: {
            cpl_id: cpl.id,
            bahan_kajian_id: bk.id
          }
        });
      }
    }
  }
  
  console.log('✓ CPL-BK Mapping seeded');
}

// ==================== BK-MK MAPPING ====================
async function seedBKMKMapping() {
  console.log('📋 Seeding BK-MK Mapping...');
  
  // Get all BK and MK
  const bks = await prisma.bAHAN_KAJIAN.findMany();
  const mks = await prisma.mATA_KULIAH.findMany();
  
  // Create mappings based on program studi prefix
  for (const bk of bks) {
    const bkKodePrefix = bk.kode_bk.split('-')[1]; // Extract 'TI' or 'SD'
    
    // Filter MK berdasarkan prefix yang sama
    const relevantMks = mks.filter(mk => {
      if (bkKodePrefix === 'TI') {
        return mk.kode_mk.startsWith('TI-') || mk.kode_mk.startsWith('INF2');
      } else if (bkKodePrefix === 'SD') {
        return mk.kode_mk.startsWith('SD-') || mk.kode_mk.startsWith('DS2');
      }
      return false;
    });
    
    // Map BK to some of its relevant MK
    const mappedMkCount = Math.min(2, relevantMks.length);
    for (let i = 0; i < mappedMkCount; i++) {
      const mk = relevantMks[i];
      if (mk) {
        await prisma.bK_MK_MAPPING.upsert({
          where: {
            bahan_kajian_id_mata_kuliah_id: {
              bahan_kajian_id: bk.id,
              mata_kuliah_id: mk.id
            }
          },
          update: {},
          create: {
            bahan_kajian_id: bk.id,
            mata_kuliah_id: mk.id
          }
        });
      }
    }
  }
  
  console.log('✓ BK-MK Mapping seeded');
}

// ==================== CPL-MK MAPPING ====================
async function seedCPLMKMapping() {
  console.log('📋 Seeding CPL-MK Mapping...');
  
  // Get all CPL and MK
  const cpls = await prisma.cPL.findMany();
  const mks = await prisma.mATA_KULIAH.findMany();
  
  // Create mappings based on program studi
  for (let i = 0; i < cpls.length; i++) {
    const cpl = cpls[i];
    const cplKodePrefix = cpl.kode_cpl.split('-')[1]; // Extract 'TI' or 'SD'
    
    // Filter MK berdasarkan prefix yang sama
    const relevantMks = mks.filter(mk => {
      if (cplKodePrefix === 'TI') {
        return mk.kode_mk.startsWith('TI-') || mk.kode_mk.startsWith('INF2');
      } else if (cplKodePrefix === 'SD') {
        return mk.kode_mk.startsWith('SD-') || mk.kode_mk.startsWith('DS2');
      }
      return false;
    });
    
    // Map CPL to some of its relevant MK
    const mappedMkCount = Math.min(4, relevantMks.length);
    for (let j = 0; j < mappedMkCount; j++) {
      const mk = relevantMks[j];
      const semester = ((i % 8) + 1); // Distribute across 8 semesters
      const statusOptions: Array<'I' | 'R' | 'M' | 'A'> = ['I', 'R', 'M', 'A'];
      const status = statusOptions[j % statusOptions.length];
      const bobot = status === 'I' ? 0.5 : status === 'R' ? 1.0 : status === 'M' ? 1.5 : 2.0;
      
      if (mk) {
        await prisma.cPL_MK_MAPPING.upsert({
          where: {
            cpl_id_mata_kuliah_id: {
              cpl_id: cpl.id,
              mata_kuliah_id: mk.id
            }
          },
          update: {},
          create: {
            cpl_id: cpl.id,
            mata_kuliah_id: mk.id,
            status: status,
            semester_target: semester,
            bobot_status: new Prisma.Decimal(bobot)
          }
        });
      }
    }
  }
  
  console.log('✓ CPL-MK Mapping seeded');
}

// ==================== PL-MK MAPPING ====================
async function seedPLMKMapping() {
  console.log('📋 Seeding PL-MK Mapping...');
  
  // Get all PL and MK
  const pls = await prisma.pROFIL_LULUSAN.findMany();
  const mks = await prisma.mATA_KULIAH.findMany();
  
  // Create mappings based on program studi
  for (const pl of pls) {
    const plKodePrefix = pl.kode_pl.split('-')[1]; // Extract 'TI' or 'SD'
    
    // Filter MK berdasarkan program studi yang sama
    const relevantMks = mks.filter(mk => {
      if (plKodePrefix === 'TI') {
        return mk.kode_mk.startsWith('TI-') || mk.kode_mk.startsWith('INF2');
      } else if (plKodePrefix === 'SD') {
        return mk.kode_mk.startsWith('SD-') || mk.kode_mk.startsWith('DS2');
      }
      return false;
    });
    
    // Map PL to all relevant MK for that program studi
    for (const mk of relevantMks) {
      await prisma.pL_MK_MAPPING.upsert({
        where: {
          profil_lulusan_id_mata_kuliah_id: {
            profil_lulusan_id: pl.id,
            mata_kuliah_id: mk.id
          }
        },
        update: {},
        create: {
          profil_lulusan_id: pl.id,
          mata_kuliah_id: mk.id
        }
      });
    }
  }
  
  console.log('✓ PL-MK Mapping seeded');
}

// ==================== DOSEN ====================
async function seedDosen() {
  console.log('📋 Seeding Dosen...');
  
  const dosen = [
    {
      nidn: '0631128801',
      nama_lengkap: 'Muhammad Rikzam Kamal, M.Kom.',
      email: 'rikzam@uingusdur.ac.id',
      bidang_keahlian: ['Data Mining', 'Artificial Intelligence', 'Multimedia'],
      jabatan_akademik: 'lektor' as const,
      status: 'aktif' as const
    },
    {
      nidn: '0606018803',
      nama_lengkap: 'Rohmad Abidin, M.Kom.',
      email: 'rohmad@uingusdur.ac.id',
      bidang_keahlian: ['Sistem Informasi', 'Database', 'Programming'],
      jabatan_akademik: 'lektor' as const,
      status: 'aktif' as const
    },
    {
      nidn: '2012118302',
      nama_lengkap: 'Abdul Majid, M.Kom',
      email: 'majid@uingusdur.ac.id',
      bidang_keahlian: ['Teknologi Sistem Informasi', 'Computer Science'],
      jabatan_akademik: 'lektor' as const,
      status: 'aktif' as const
    },
    {
      nidn: '0000000001',
      nama_lengkap: 'Agus Susilo Nugroho, M.Kom.',
      email: 'agus@uingusdur.ac.id',
      bidang_keahlian: ['Kecerdasan Buatan', 'Big Data', 'Neural Network'],
      jabatan_akademik: 'asisten_ahli' as const,
      status: 'aktif' as const
    },
    {
      nidn: '0000000002',
      nama_lengkap: 'Akrim Teguh Suseno, M.Kom.',
      email: 'akrim@uingusdur.ac.id',
      bidang_keahlian: ['Data Analytics', 'Tata Kelola TI', 'Software Engineering'],
      jabatan_akademik: 'asisten_ahli' as const,
      status: 'aktif' as const
    },
    {
      nidn: '2006039306',
      nama_lengkap: 'Dicky Anggriawan Nugroho, M.Kom.',
      email: 'dicky@uingusdur.ac.id',
      bidang_keahlian: ['Software Engineering', 'Web Development'],
      jabatan_akademik: 'asisten_ahli' as const,
      status: 'aktif' as const
    },
    {
      nidn: '2007019401',
      nama_lengkap: 'Imam Prayogo Pujiono, M.Kom.',
      email: 'imam@uingusdur.ac.id',
      bidang_keahlian: ['Programming', 'Database', 'Algorithm'],
      jabatan_akademik: 'asisten_ahli' as const,
      status: 'aktif' as const
    },
    {
      nidn: '0000000003',
      nama_lengkap: 'Indra Kurniawan, M.Kom.',
      email: 'indra@uingusdur.ac.id',
      bidang_keahlian: ['Software Engineering', 'Project Management'],
      jabatan_akademik: 'asisten_ahli' as const,
      status: 'aktif' as const
    },
    {
      nidn: '0000000004',
      nama_lengkap: 'Mohammad Reza Maulana, M.Kom.',
      email: 'reza@uingusdur.ac.id',
      bidang_keahlian: ['Software Engineering', 'Programming', 'UI/UX Design'],
      jabatan_akademik: 'asisten_ahli' as const,
      status: 'aktif' as const
    },
    {
      nidn: '2006099101',
      nama_lengkap: 'Nurul Husnah Mustika Sari, M.Pd.',
      email: 'nurul@uingusdur.ac.id',
      bidang_keahlian: ['Kalkulus', 'Aljabar', 'Statistika'],
      jabatan_akademik: 'lektor' as const,
      status: 'aktif' as const
    },
    {
      nidn: '0000000005',
      nama_lengkap: 'Qorry Aina Fitroh, M.Kom.',
      email: 'qorry@uingusdur.ac.id',
      bidang_keahlian: ['Matematika Komputasi', 'Kalkulus', 'Statistika'],
      jabatan_akademik: 'asisten_ahli' as const,
      status: 'aktif' as const
    },
    {
      nidn: '2010078404',
      nama_lengkap: 'Umi Mahmudah, Ph.D',
      email: 'umi@uingusdur.ac.id',
      bidang_keahlian: ['Kalkulus', 'Aljabar', 'Statistika'],
      jabatan_akademik: 'lektor' as const,
      status: 'aktif' as const
    }
  ];

  for (const d of dosen) {
    await prisma.dOSEN.upsert({
      where: { nidn: d.nidn },
      update: {},
      create: d
    });
  }
  
  console.log('✓ Dosen seeded');
}

// ==================== SEMESTER AKADEMIK ====================
async function seedSemesterAkademik() {
  console.log('📋 Seeding Semester Akademik...');
  
  const semesterData = [
    {
      kode_semester: '20241',
      nama_semester: 'Gasal 2024/2025',
      tahun_akademik: '2024/2025',
      jenis: 'gasal' as const,
      tanggal_mulai: new Date('2024-09-01'),
      tanggal_selesai: new Date('2025-01-31'),
      status: 'aktif' as const
    },
    {
      kode_semester: '20242',
      nama_semester: 'Genap 2024/2025',
      tahun_akademik: '2024/2025',
      jenis: 'genap' as const,
      tanggal_mulai: new Date('2025-02-01'),
      tanggal_selesai: new Date('2025-06-30'),
      status: 'draft' as const
    },
    {
      kode_semester: '20251',
      nama_semester: 'Gasal 2025/2026',
      tahun_akademik: '2025/2026',
      jenis: 'gasal' as const,
      tanggal_mulai: new Date('2025-09-01'),
      tanggal_selesai: new Date('2026-01-31'),
      status: 'draft' as const
    }
  ];

  for (const sem of semesterData) {
    await prisma.sEMESTER_AKADEMIK.upsert({
      where: { kode_semester: sem.kode_semester },
      update: {},
      create: sem
    });
  }
  
  console.log('✓ Semester Akademik seeded');
}

// ==================== STANDARD PENILAIAN ====================
async function seedStandardPenilaian() {
  console.log('📋 Seeding Standard Penilaian...');
  
  const standards = [
    {
      nama_standard: 'Konversi Nilai Angka ke Huruf',
      tipe: 'score_to_grade' as const,
      rules: {
        ranges: [
          { min: 85, max: 100, grade: 'A' },
          { min: 80, max: 84.99, grade: 'A-' },
          { min: 75, max: 79.99, grade: 'B+' },
          { min: 70, max: 74.99, grade: 'B' },
          { min: 65, max: 69.99, grade: 'B-' },
          { min: 60, max: 64.99, grade: 'C+' },
          { min: 55, max: 59.99, grade: 'C' },
          { min: 50, max: 54.99, grade: 'C-' },
          { min: 45, max: 49.99, grade: 'D' },
          { min: 0, max: 44.99, grade: 'E' }
        ]
      },
      status_aktif: true
    },
    {
      nama_standard: 'Konversi Nilai Huruf ke GPA (Skala 4.0)',
      tipe: 'grade_to_gpa' as const,
      rules: {
        conversion: {
          'A': 4.0,
          'A-': 3.7,
          'B+': 3.3,
          'B': 3.0,
          'B-': 2.7,
          'C+': 2.3,
          'C': 2.0,
          'C-': 1.7,
          'D': 1.0,
          'E': 0.0
        }
      },
      status_aktif: true
    },
    {
      nama_standard: 'Threshold Nilai CPL',
      tipe: 'cpl_threshold' as const,
      rules: {
        minimum_cpl: 2.75,
        level_pencapaian: {
          sangat_baik: { min: 3.5, max: 4.0 },
          baik: { min: 3.0, max: 3.49 },
          cukup: { min: 2.75, max: 2.99 },
          kurang: { min: 0, max: 2.74 }
        }
      },
      status_aktif: true
    }
  ];

  for (const std of standards) {
    await prisma.sTANDARD_PENILAIAN.create({
      data: std
    });
  }
  
  console.log('✓ Standard Penilaian seeded');
}

// ==================== USERS FOR AUTHENTICATION ====================
async function seedRolesAndPermissions() {
  console.log('🔐 Seeding Roles and Permissions...');

  // Create permissions
  const permissions = [
    // User management
    { name: 'user.view', resource: 'user', action: 'view', description: 'View users' },
    { name: 'user.create', resource: 'user', action: 'create', description: 'Create users' },
    { name: 'user.edit', resource: 'user', action: 'edit', description: 'Edit users' },
    { name: 'user.delete', resource: 'user', action: 'delete', description: 'Delete users' },

    // Student management
    { name: 'student.view', resource: 'student', action: 'view', description: 'View students' },
    { name: 'student.create', resource: 'student', action: 'create', description: 'Create students' },
    { name: 'student.edit', resource: 'student', action: 'edit', description: 'Edit students' },
    { name: 'student.delete', resource: 'student', action: 'delete', description: 'Delete students' },

    // Lecturer management
    { name: 'lecturer.view', resource: 'lecturer', action: 'view', description: 'View lecturers' },
    { name: 'lecturer.create', resource: 'lecturer', action: 'create', description: 'Create lecturers' },
    { name: 'lecturer.edit', resource: 'lecturer', action: 'edit', description: 'Edit lecturers' },
    { name: 'lecturer.delete', resource: 'lecturer', action: 'delete', description: 'Delete lecturers' },

    // Course management
    { name: 'course.view', resource: 'course', action: 'view', description: 'View courses' },
    { name: 'course.create', resource: 'course', action: 'create', description: 'Create courses' },
    { name: 'course.edit', resource: 'course', action: 'edit', description: 'Edit courses' },
    { name: 'course.delete', resource: 'course', action: 'delete', description: 'Delete courses' },

    // OBE management
    { name: 'obe.view', resource: 'obe', action: 'view', description: 'View OBE data' },
    { name: 'obe.manage', resource: 'obe', action: 'manage', description: 'Manage OBE data' },

    // Assessment management
    { name: 'assessment.view', resource: 'assessment', action: 'view', description: 'View assessments' },
    { name: 'assessment.create', resource: 'assessment', action: 'create', description: 'Create assessments' },
    { name: 'assessment.edit', resource: 'assessment', action: 'edit', description: 'Edit assessments' },
    { name: 'assessment.grade', resource: 'assessment', action: 'grade', description: 'Grade assessments' },

    // Report access
    { name: 'report.view', resource: 'report', action: 'view', description: 'View reports' },
    { name: 'report.generate', resource: 'report', action: 'generate', description: 'Generate reports' },
  ];

  for (const perm of permissions) {
    await prisma.permission.upsert({
      where: { name: perm.name },
      update: perm,
      create: perm,
    });
  }

  // Create roles
  const roles = [
    { name: 'admin', description: 'Administrator with full access' },
    { name: 'prodi', description: 'Program Studi Administrator' },
    { name: 'lecturer', description: 'Lecturer with teaching and assessment access' },
    { name: 'student', description: 'Student with limited access' },
  ];

  for (const role of roles) {
    await prisma.role.upsert({
      where: { name: role.name },
      update: role,
      create: role,
    });
  }

  // Assign permissions to roles
  const rolePermissions = [
    // Admin permissions - only user and program studi management
    {
      roleName: 'admin',
      permissions: [
        'user.view',
        'user.create',
        'user.edit',
        'user.delete',
        'program_studi.view',
        'program_studi.create',
        'program_studi.edit',
        'program_studi.delete',
      ]
    },

    // Prodi permissions - academic data management
    {
      roleName: 'prodi',
      permissions: [
        'kurikulum.view',
        'kurikulum.create',
        'kurikulum.edit',
        'cpl.view',
        'cpl.create',
        'cpl.edit',
        'mata_kuliah.view',
        'mata_kuliah.create',
        'mata_kuliah.edit',
        'cpmk.view',
        'cpmk.create',
        'cpmk.edit',
        'obe.view',
        'report.view',
      ]
    },

    // Lecturer permissions
    {
      roleName: 'lecturer',
      permissions: [
        'student.view',
        'course.view',
        'course.edit',
        'obe.view',
        'assessment.view',
        'assessment.create',
        'assessment.edit',
        'assessment.grade',
        'report.view',
      ]
    },

    // Student permissions
    {
      roleName: 'student',
      permissions: [
        'course.view',
        'obe.view',
        'assessment.view',
        'report.view',
      ]
    },
  ];

  for (const rp of rolePermissions) {
    const role = await prisma.role.findUnique({ where: { name: rp.roleName } });
    if (!role) continue;

    for (const permName of rp.permissions) {
      const permission = await prisma.permission.findUnique({ where: { name: permName } });
      if (!permission) continue;

      await prisma.rolePermission.upsert({
        where: {
          roleId_permissionId: {
            roleId: role.id,
            permissionId: permission.id,
          }
        },
        update: {},
        create: {
          roleId: role.id,
          permissionId: permission.id,
        },
      });
    }
  }

  console.log('✅ Roles and Permissions seeded successfully!');
}

async function seedUsers() {
  console.log('👤 Seeding Users for Authentication...');

  // Hash password for demo users
  const hashedPassword = await bcrypt.hash('password123', 10);

  // Get existing dosen and mahasiswa
  const dosen1 = await prisma.dOSEN.findFirst({ where: { nidn: '1234567890' } });

  // Get program studi
  const programStudiTI = await prisma.pROGRAM_STUDI.findFirst({ where: { kode_program_studi: 'TI' } });
  const programStudiSD = await prisma.pROGRAM_STUDI.findFirst({ where: { kode_program_studi: 'SD' } });
  if (!programStudiTI) {
    throw new Error('Program Studi TI not found');
  }
  if (!programStudiSD) {
    throw new Error('Program Studi SD not found');
  }

  // Get roles
  const adminRole = await prisma.role.findUnique({ where: { name: 'admin' } });
  const prodiRole = await prisma.role.findUnique({ where: { name: 'prodi' } });
  const lecturerRole = await prisma.role.findUnique({ where: { name: 'lecturer' } });

  // Create users
  const users = [
    {
      email: 'admin@obe.com',
      name: 'Administrator',
      role: adminRole!,
      profileType: 'admin' as const,
      programStudiId: null, // Admin tidak relate dengan prodi
    },
    {
      email: 'prodi.ti@obe.com',
      name: 'Admin Informatika',
      role: prodiRole!,
      profileType: 'admin' as const,
      programStudiId: programStudiTI.id,
    },
    {
      email: 'prodi.sd@obe.com',
      name: 'Admin Sains Data',
      role: prodiRole!,
      profileType: 'admin' as const,
      programStudiId: programStudiSD.id,
    },
    {
      email: 'dosen.ti@obe.com',
      name: 'Dosen Informatika',
      role: lecturerRole!,
      profileType: 'lecturer' as const,
      dosen: dosen1,
      programStudiId: programStudiTI.id,
    },
    {
      email: 'dosen.sd@obe.com',
      name: 'Dosen Sains Data',
      role: lecturerRole!,
      profileType: 'lecturer' as const,
      dosen: null, // Belum ada dosen SD di seed
      programStudiId: programStudiSD.id,
    },
  ];

  for (const userData of users) {
    // Create user
    const user = await prisma.user.upsert({
      where: { email: userData.email },
      update: {},
      create: {
        email: userData.email,
        password: hashedPassword,
        programStudiId: userData.programStudiId,
      },
    });

    // Assign role to user
    await prisma.userRole.upsert({
      where: {
        userId_roleId: {
          userId: user.id,
          roleId: userData.role.id,
        }
      },
      update: {},
      create: {
        userId: user.id,
        roleId: userData.role.id,
      },
    });

    // Create user profile
    if (userData.dosen) {
      await prisma.userProfile.upsert({
        where: { userId: user.id },
        update: {
          type: userData.profileType,
          fullName: userData.dosen.nama_lengkap,
          nidn: userData.dosen.nidn,
          expertise: userData.dosen.bidang_keahlian,
          academicPosition: userData.dosen.jabatan_akademik,
        },
        create: {
          userId: user.id,
          type: userData.profileType,
          fullName: userData.dosen.nama_lengkap,
          nidn: userData.dosen.nidn,
          expertise: userData.dosen.bidang_keahlian,
          academicPosition: userData.dosen.jabatan_akademik,
        },
      });
    } else if ('mahasiswa' in userData && userData.mahasiswa) {
      const mahasiswa = userData.mahasiswa as { nama_lengkap: string; nim: string; angkatan: number; konsentrasi: 'umum' | 'kecerdasan_buatan' | 'multimedia' }
      await prisma.userProfile.upsert({
        where: { userId: user.id },
        update: {
          type: userData.profileType,
          fullName: mahasiswa.nama_lengkap,
          nim: mahasiswa.nim,
          angkatan: mahasiswa.angkatan,
          konsentrasi: mahasiswa.konsentrasi,
        },
        create: {
          userId: user.id,
          type: userData.profileType,
          fullName: mahasiswa.nama_lengkap,
          nim: mahasiswa.nim,
          angkatan: mahasiswa.angkatan,
          konsentrasi: mahasiswa.konsentrasi,
        },
      });
    } else {
      await prisma.userProfile.upsert({
        where: { userId: user.id },
        update: {
          type: userData.profileType,
          fullName: userData.name,
        },
        create: {
          userId: user.id,
          type: userData.profileType,
          fullName: userData.name,
        },
      });
    }
  }

  console.log('✅ Users seeded successfully!');
}

// ==================== MAIN EXECUTION ====================
main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
