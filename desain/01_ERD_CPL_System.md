# ENTITY RELATIONSHIP DIAGRAM (ERD)
# Sistem Pengukuran CPL - Program Studi Informatika

## CORE ENTITIES

### 1. PROFIL_LULUSAN
```
profil_lulusan
├── id (PK)
├── kode_pl (UNIQUE: PL1, PL2, PL3, PL4)
├── nama_profil
├── deskripsi
├── profesi (TEXT[])
├── created_at
└── updated_at
```

### 2. CPL (Capaian Pembelajaran Lulusan)
```
cpl
├── id (PK)
├── kode_cpl (UNIQUE: CPL01-CPL11)
├── deskripsi (TEXT)
├── kategori (ENUM: 'sikap', 'pengetahuan', 'keterampilan_umum', 'keterampilan_khusus')
├── sumber (ENUM: 'KKNI', 'SN_DIKTI', 'APTIKOM', 'IABEE', 'CC2020')
├── nilai_minimum_kelulusan (DECIMAL: default 2.75)
├── status_aktif (BOOLEAN)
├── created_at
└── updated_at
```

### 3. BAHAN_KAJIAN
```
bahan_kajian
├── id (PK)
├── kode_bk (UNIQUE: BK01-BK32)
├── nama_bahan_kajian
├── kategori (ENUM: 'wajib_informatika', 'tambahan', 'wajib_sn_dikti', 'wajib_umum')
├── bobot_min_sks (INTEGER)
├── bobot_max_sks (INTEGER)
├── deskripsi (TEXT)
├── created_at
└── updated_at
```

### 4. MATA_KULIAH
```
mata_kuliah
├── id (PK)
├── kode_mk (UNIQUE)
├── nama_mk
├── sks (INTEGER)
├── semester (INTEGER: 1-8)
├── jenis (ENUM: 'wajib', 'pilihan')
├── konsentrasi (ENUM: 'umum', 'kecerdasan_buatan', 'multimedia', NULL)
├── deskripsi (TEXT)
├── status_aktif (BOOLEAN)
├── created_at
└── updated_at
```

### 5. PRASYARAT_MK
```
prasyarat_mk
├── id (PK)
├── mk_id (FK → mata_kuliah)
├── prasyarat_mk_id (FK → mata_kuliah)
├── jenis_prasyarat (ENUM: 'wajib', 'atau', 'minimal_sks')
└── created_at
```

## MAPPING ENTITIES (Curriculum Level)

### 6. PL_CPL_MAPPING
```
pl_cpl_mapping
├── id (PK)
├── profil_lulusan_id (FK)
├── cpl_id (FK)
├── created_at
└── UNIQUE(profil_lulusan_id, cpl_id)
```

### 7. CPL_BK_MAPPING
```
cpl_bk_mapping
├── id (PK)
├── cpl_id (FK)
├── bahan_kajian_id (FK)
├── created_at
└── UNIQUE(cpl_id, bahan_kajian_id)
```

### 8. BK_MK_MAPPING
```
bk_mk_mapping
├── id (PK)
├── bahan_kajian_id (FK)
├── mata_kuliah_id (FK)
├── created_at
└── UNIQUE(bahan_kajian_id, mata_kuliah_id)
```

### 9. CPL_MK_MAPPING
```
cpl_mk_mapping
├── id (PK)
├── cpl_id (FK)
├── mata_kuliah_id (FK)
├── status (ENUM: 'I', 'R', 'M', 'A')  -- Introduce, Reinforce, Master, Assess
├── semester_target (INTEGER)
├── bobot_status (DECIMAL: 0.5 untuk I, 1.0 untuk R, 1.5 untuk M, 2.0 untuk A)
├── created_at
└── UNIQUE(cpl_id, mata_kuliah_id)
```

### 10. PL_MK_MAPPING
```
pl_mk_mapping
├── id (PK)
├── profil_lulusan_id (FK)
├── mata_kuliah_id (FK)
├── created_at
└── UNIQUE(profil_lulusan_id, mata_kuliah_id)
```

## LEARNING MEASUREMENT ENTITIES

### 11. CPMK (Capaian Pembelajaran Mata Kuliah)
```
cpmk
├── id (PK)
├── mata_kuliah_id (FK)
├── kode_cpmk (VARCHAR: "CPMK1", "CPMK2")
├── deskripsi (TEXT)
├── bobot_persen (DECIMAL: sum must = 100 per MK)
├── urutan (INTEGER)
├── status_aktif (BOOLEAN)
├── created_at
└── updated_at
```

### 12. CPMK_CPL_MAPPING
```
cpmk_cpl_mapping
├── id (PK)
├── cpmk_id (FK)
├── cpl_id (FK)
├── kontribusi_persen (DECIMAL: 0-100, sum can > 100 if multiple CPLs)
├── created_at
└── updated_at
```

### 13. SUB_CPMK
```
sub_cpmk
├── id (PK)
├── cpmk_id (FK)
├── kode_sub_cpmk (VARCHAR: "Sub-CPMK 1.1")
├── deskripsi (TEXT)
├── bobot_persen (DECIMAL: sum must = 100 per CPMK)
├── pertemuan_ke (INTEGER[])
├── urutan (INTEGER)
├── created_at
└── updated_at
```

### 14. INSTRUMEN_PENILAIAN
```
instrumen_penilaian
├── id (PK)
├── mata_kuliah_id (FK)
├── semester_tahun (VARCHAR: "Gasal 2024/2025")
├── nama_instrumen (VARCHAR: "UTS", "Quiz 1", "Tugas Akhir")
├── jenis_penilaian (ENUM: 'tes_tulis', 'tes_lisan', 'unjuk_kerja', 'portofolio', 
│                            'observasi', 'penugasan', 'penilaian_diri')
├── bobot_persen (DECIMAL: sum must = 100 per MK per semester)
├── tanggal_pelaksanaan (DATE)
├── nilai_maksimal (INTEGER: default 100)
├── deskripsi (TEXT)
├── created_at
└── updated_at
```

### 15. INSTRUMEN_SUBCPMK_MAPPING
```
instrumen_subcpmk_mapping
├── id (PK)
├── instrumen_id (FK)
├── sub_cpmk_id (FK)
├── bobot_soal_persen (DECIMAL: portion of instrument dedicated to this sub-CPMK)
├── nomor_soal (VARCHAR: "1-5, 7")
├── created_at
└── UNIQUE(instrumen_id, sub_cpmk_id)
```

### 16. RUBRIK_PENILAIAN
```
rubrik_penilaian
├── id (PK)
├── instrumen_id (FK)
├── sub_cpmk_id (FK)
├── level_pencapaian (ENUM: 'sangat_baik', 'baik', 'cukup', 'kurang')
├── skor_numerik (DECIMAL: 4.0, 3.0, 2.0, 1.0)
├── deskriptor (TEXT)
├── created_at
└── UNIQUE(instrumen_id, sub_cpmk_id, level_pencapaian)
```

## STUDENT ENTITIES

### 17. MAHASISWA
```
mahasiswa
├── id (PK)
├── nim (UNIQUE)
├── nama_lengkap
├── email (UNIQUE)
├── angkatan (INTEGER)
├── semester_aktif (INTEGER)
├── konsentrasi (ENUM: 'kecerdasan_buatan', 'multimedia', NULL)
├── status (ENUM: 'aktif', 'cuti', 'lulus', 'DO', 'mengundurkan_diri')
├── ipk (DECIMAL: calculated)
├── total_sks (INTEGER: calculated)
├── tanggal_masuk (DATE)
├── tanggal_lulus (DATE, NULL)
├── created_at
└── updated_at
```

### 18. ENROLLMENT (KRS)
```
enrollment
├── id (PK)
├── mahasiswa_id (FK)
├── mata_kuliah_id (FK)
├── semester_tahun (VARCHAR: "Gasal 2024/2025")
├── dosen_pengampu_id (FK → dosen)
├── kelas (VARCHAR: "A", "B", NULL)
├── status (ENUM: 'aktif', 'lulus', 'tidak_lulus', 'mengulang', 'batal')
├── nilai_akhir (DECIMAL: 0-100, calculated)
├── nilai_huruf (VARCHAR: 'A', 'B+', etc., calculated)
├── grade_point (DECIMAL: 4.0 scale, calculated)
├── tanggal_daftar (TIMESTAMP)
├── tanggal_finalisasi (TIMESTAMP)
├── created_at
└── updated_at
└── UNIQUE(mahasiswa_id, mata_kuliah_id, semester_tahun)
```

### 19. NILAI_INSTRUMEN
```
nilai_instrumen
├── id (PK)
├── enrollment_id (FK)
├── instrumen_id (FK)
├── nilai_angka (DECIMAL: 0-100)
├── nilai_huruf (VARCHAR: calculated based on rubric)
├── grade_point (DECIMAL: 4.0 scale)
├── catatan_dosen (TEXT, NULL)
├── tanggal_input (TIMESTAMP)
├── input_by (FK → dosen.id)
├── created_at
└── updated_at
└── UNIQUE(enrollment_id, instrumen_id)
```

### 20. NILAI_SUBCPMK
```
nilai_subcpmk
├── id (PK)
├── enrollment_id (FK)
├── sub_cpmk_id (FK)
├── nilai_kumulatif (DECIMAL: weighted average dari instrumen)
├── jumlah_instrumen (INTEGER: count)
├── status_pencapaian (ENUM: 'sangat_baik', 'baik', 'cukup', 'kurang')
├── last_calculated (TIMESTAMP)
├── created_at
└── updated_at
└── UNIQUE(enrollment_id, sub_cpmk_id)
```

### 21. NILAI_CPMK
```
nilai_cpmk
├── id (PK)
├── enrollment_id (FK)
├── cpmk_id (FK)
├── nilai_kumulatif (DECIMAL: weighted average dari sub-CPMK)
├── status_pencapaian (ENUM: 'sangat_baik', 'baik', 'cukup', 'kurang')
├── last_calculated (TIMESTAMP)
├── created_at
└── updated_at
└── UNIQUE(enrollment_id, cpmk_id)
```

## CPL ACHIEVEMENT TRACKING

### 22. CAPAIAN_CPL_PER_MK
```
capaian_cpl_per_mk
├── id (PK)
├── enrollment_id (FK)
├── mahasiswa_id (FK)
├── cpl_id (FK)
├── mata_kuliah_id (FK)
├── nilai_kontribusi (DECIMAL: weighted from CPMK)
├── status_dalam_mk (ENUM: 'I', 'R', 'M', 'A')
├── semester_tahun (VARCHAR)
├── sks_mk (INTEGER)
├── bobot_status (DECIMAL)
├── last_calculated (TIMESTAMP)
├── created_at
└── updated_at
└── UNIQUE(enrollment_id, cpl_id)
```

### 23. CAPAIAN_CPL_MAHASISWA (Aggregate)
```
capaian_cpl_mahasiswa
├── id (PK)
├── mahasiswa_id (FK)
├── cpl_id (FK)
├── nilai_kumulatif (DECIMAL: 0-4.0 scale or 0-100)
├── jumlah_mk_berkontribusi (INTEGER)
├── total_sks_berkontribusi (INTEGER)
├── status_pencapaian (ENUM: 'belum_dimulai', 'introduce', 'reinforce', 'master', 'assessed')
├── is_memenuhi_standard (BOOLEAN: nilai >= threshold)
├── semester_terakhir_update
├── last_calculated (TIMESTAMP)
├── created_at
└── updated_at
└── UNIQUE(mahasiswa_id, cpl_id)
```

### 24. LOG_PERHITUNGAN_CPL
```
log_perhitungan_cpl
├── id (PK)
├── mahasiswa_id (FK)
├── cpl_id (FK)
├── nilai_sebelum (DECIMAL)
├── nilai_sesudah (DECIMAL)
├── trigger_event (ENUM: 'nilai_baru', 'finalisasi_mk', 'recalculation', 'manual')
├── mata_kuliah_id (FK, NULL)
├── detail_perhitungan (JSONB: formula & values used)
├── calculated_by (FK → users.id)
├── created_at
```

## SUPPORTING ENTITIES

### 25. DOSEN
```
dosen
├── id (PK)
├── nidn (UNIQUE)
├── nama_lengkap
├── email (UNIQUE)
├── bidang_keahlian (VARCHAR[])
├── jabatan_akademik (ENUM: 'asisten_ahli', 'lektor', 'lektor_kepala', 'profesor')
├── status (ENUM: 'aktif', 'tidak_aktif', 'pensiun')
├── created_at
└── updated_at
```

### 26. PENGAMPU_MK
```
pengampu_mk
├── id (PK)
├── mata_kuliah_id (FK)
├── dosen_id (FK)
├── semester_tahun (VARCHAR)
├── kelas (VARCHAR)
├── peran (ENUM: 'koordinator', 'pengampu', 'asisten')
├── created_at
└── UNIQUE(mata_kuliah_id, dosen_id, semester_tahun, kelas)
```

### 27. METODE_PEMBELAJARAN
```
metode_pembelajaran
├── id (PK)
├── mata_kuliah_id (FK)
├── metode (ENUM: 'diskusi_kelompok', 'simulasi', 'studi_kasus', 'kolaboratif', 
│                  'kooperatif', 'project_based', 'problem_based')
├── modus (ENUM: 'synchronous', 'asynchronous', 'hybrid')
├── bentuk (ENUM: 'kuliah', 'seminar', 'praktikum', 'praktik_lapangan', 
│                  'penelitian', 'perancangan')
├── created_at
└── UNIQUE(mata_kuliah_id, metode)
```

### 28. STANDARD_PENILAIAN
```
standard_penilaian
├── id (PK)
├── nama_standard (VARCHAR: "Konversi IPK ke Skala 4.0")
├── tipe (ENUM: 'grade_to_gpa', 'score_to_grade', 'cpl_threshold')
├── rules (JSONB: conversion rules)
├── status_aktif (BOOLEAN)
├── created_at
└── updated_at
```

### 29. SEMESTER_AKADEMIK
```
semester_akademik
├── id (PK)
├── kode_semester (UNIQUE: "20241" for Gasal 2024/2025)
├── nama_semester (VARCHAR: "Gasal 2024/2025")
├── tahun_akademik (VARCHAR: "2024/2025")
├── jenis (ENUM: 'gasal', 'genap', 'pendek')
├── tanggal_mulai (DATE)
├── tanggal_selesai (DATE)
├── status (ENUM: 'draft', 'aktif', 'selesai')
├── created_at
└── updated_at
```

### 30. NOTIFIKASI_CPL
```
notifikasi_cpl
├── id (PK)
├── mahasiswa_id (FK)
├── cpl_id (FK, NULL)
├── jenis (ENUM: 'cpl_rendah', 'target_tercapai', 'nilai_baru', 'rekomendasi')
├── judul (VARCHAR)
├── pesan (TEXT)
├── data_terkait (JSONB)
├── is_read (BOOLEAN)
├── created_at
└── updated_at
```

## INDEXES FOR PERFORMANCE

```sql
-- High-priority indexes
CREATE INDEX idx_enrollment_mahasiswa ON enrollment(mahasiswa_id);
CREATE INDEX idx_enrollment_mk ON enrollment(mata_kuliah_id);
CREATE INDEX idx_enrollment_semester ON enrollment(semester_tahun);
CREATE INDEX idx_nilai_instrumen_enrollment ON nilai_instrumen(enrollment_id);
CREATE INDEX idx_capaian_cpl_mahasiswa ON capaian_cpl_mahasiswa(mahasiswa_id);
CREATE INDEX idx_capaian_cpl_per_mk_mahasiswa ON capaian_cpl_per_mk(mahasiswa_id);
CREATE INDEX idx_capaian_cpl_per_mk_cpl ON capaian_cpl_per_mk(cpl_id);

-- Composite indexes
CREATE INDEX idx_enrollment_lookup ON enrollment(mahasiswa_id, semester_tahun);
CREATE INDEX idx_cpl_mk_status ON cpl_mk_mapping(mata_kuliah_id, status);
CREATE INDEX idx_instrumen_mk_semester ON instrumen_penilaian(mata_kuliah_id, semester_tahun);
```

## RELATIONSHIPS SUMMARY

```
PROFIL_LULUSAN ←→ CPL (many-to-many via pl_cpl_mapping)
CPL ←→ BAHAN_KAJIAN (many-to-many via cpl_bk_mapping)
BAHAN_KAJIAN ←→ MATA_KULIAH (many-to-many via bk_mk_mapping)
CPL ←→ MATA_KULIAH (many-to-many via cpl_mk_mapping)
PROFIL_LULUSAN ←→ MATA_KULIAH (many-to-many via pl_mk_mapping)

MATA_KULIAH → CPMK (one-to-many)
CPMK ←→ CPL (many-to-many via cpmk_cpl_mapping)
CPMK → SUB_CPMK (one-to-many)
MATA_KULIAH → INSTRUMEN_PENILAIAN (one-to-many)
INSTRUMEN_PENILAIAN ←→ SUB_CPMK (many-to-many via instrumen_subcpmk_mapping)

MAHASISWA → ENROLLMENT (one-to-many)
ENROLLMENT → MATA_KULIAH (many-to-one)
ENROLLMENT → NILAI_INSTRUMEN (one-to-many)
ENROLLMENT → NILAI_CPMK (one-to-many)
ENROLLMENT → CAPAIAN_CPL_PER_MK (one-to-many)

MAHASISWA → CAPAIAN_CPL_MAHASISWA (one-to-many)
CPL → CAPAIAN_CPL_MAHASISWA (one-to-many)
```

## DATA INTEGRITY CONSTRAINTS

```sql
-- Validation constraints
ALTER TABLE cpmk ADD CONSTRAINT chk_bobot_cpmk CHECK (bobot_persen >= 0 AND bobot_persen <= 100);
ALTER TABLE sub_cpmk ADD CONSTRAINT chk_bobot_subcpmk CHECK (bobot_persen >= 0 AND bobot_persen <= 100);
ALTER TABLE instrumen_penilaian ADD CONSTRAINT chk_bobot_instrumen CHECK (bobot_persen >= 0 AND bobot_persen <= 100);
ALTER TABLE nilai_instrumen ADD CONSTRAINT chk_nilai_range CHECK (nilai_angka >= 0 AND nilai_angka <= 100);
ALTER TABLE capaian_cpl_mahasiswa ADD CONSTRAINT chk_nilai_cpl CHECK (nilai_kumulatif >= 0 AND nilai_kumulatif <= 4.0);

-- Cascading deletes
ALTER TABLE cpmk ADD CONSTRAINT fk_cpmk_mk 
    FOREIGN KEY (mata_kuliah_id) REFERENCES mata_kuliah(id) ON DELETE CASCADE;
    
ALTER TABLE enrollment ADD CONSTRAINT fk_enrollment_mahasiswa 
    FOREIGN KEY (mahasiswa_id) REFERENCES mahasiswa(id) ON DELETE RESTRICT;
```

---
**Total Entities: 30**
**Total Relationships: 15+ mapping tables**
**Estimated Tables: 45-50 including junction tables**
