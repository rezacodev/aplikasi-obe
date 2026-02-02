-- CreateEnum
CREATE TYPE "KategoriCPL" AS ENUM ('sikap', 'pengetahuan', 'keterampilan_umum', 'keterampilan_khusus');

-- CreateEnum
CREATE TYPE "SumberCPL" AS ENUM ('KKNI', 'SN_DIKTI', 'APTIKOM', 'IABEE', 'CC2020');

-- CreateEnum
CREATE TYPE "KategoriBahanKajian" AS ENUM ('wajib_informatika', 'tambahan', 'wajib_sn_dikti', 'wajib_umum');

-- CreateEnum
CREATE TYPE "JenisMataKuliah" AS ENUM ('wajib', 'pilihan');

-- CreateEnum
CREATE TYPE "Konsentrasi" AS ENUM ('umum', 'kecerdasan_buatan', 'multimedia');

-- CreateEnum
CREATE TYPE "JenisPrasyarat" AS ENUM ('wajib', 'atau', 'minimal_sks');

-- CreateEnum
CREATE TYPE "StatusCPLMK" AS ENUM ('I', 'R', 'M', 'A');

-- CreateEnum
CREATE TYPE "JenisPenilaian" AS ENUM ('tes_tulis', 'tes_lisan', 'unjuk_kerja', 'portofolio', 'observasi', 'penugasan', 'penilaian_diri');

-- CreateEnum
CREATE TYPE "LevelPencapaian" AS ENUM ('sangat_baik', 'baik', 'cukup', 'kurang');

-- CreateEnum
CREATE TYPE "StatusMahasiswa" AS ENUM ('aktif', 'cuti', 'lulus', 'DO', 'mengundurkan_diri');

-- CreateEnum
CREATE TYPE "StatusEnrollment" AS ENUM ('aktif', 'lulus', 'tidak_lulus', 'mengulang', 'batal');

-- CreateEnum
CREATE TYPE "StatusPencapaian" AS ENUM ('sangat_baik', 'baik', 'cukup', 'kurang');

-- CreateEnum
CREATE TYPE "StatusCPLAchievement" AS ENUM ('belum_dimulai', 'introduce', 'reinforce', 'master', 'assessed');

-- CreateEnum
CREATE TYPE "TriggerEvent" AS ENUM ('nilai_baru', 'finalisasi_mk', 'recalculation', 'manual');

-- CreateEnum
CREATE TYPE "JabatanAkademik" AS ENUM ('asisten_ahli', 'lektor', 'lektor_kepala', 'profesor');

-- CreateEnum
CREATE TYPE "StatusDosen" AS ENUM ('aktif', 'tidak_aktif', 'pensiun');

-- CreateEnum
CREATE TYPE "PeranPengampu" AS ENUM ('koordinator', 'pengampu', 'asisten');

-- CreateEnum
CREATE TYPE "MetodePembelajaran" AS ENUM ('diskusi_kelompok', 'simulasi', 'studi_kasus', 'kolaboratif', 'kooperatif', 'project_based', 'problem_based');

-- CreateEnum
CREATE TYPE "ModusPembelajaran" AS ENUM ('synchronous', 'asynchronous', 'hybrid');

-- CreateEnum
CREATE TYPE "BentukPembelajaran" AS ENUM ('kuliah', 'seminar', 'praktikum', 'praktik_lapangan', 'penelitian', 'perancangan');

-- CreateEnum
CREATE TYPE "TipeStandard" AS ENUM ('grade_to_gpa', 'score_to_grade', 'cpl_threshold');

-- CreateEnum
CREATE TYPE "JenisSemester" AS ENUM ('gasal', 'genap', 'pendek');

-- CreateEnum
CREATE TYPE "StatusSemester" AS ENUM ('draft', 'aktif', 'selesai');

-- CreateEnum
CREATE TYPE "JenisNotifikasi" AS ENUM ('cpl_rendah', 'target_tercapai', 'nilai_baru', 'rekomendasi');

-- CreateTable
CREATE TABLE "profil_lulusan" (
    "id" TEXT NOT NULL,
    "kode_pl" TEXT NOT NULL,
    "nama_profil" TEXT NOT NULL,
    "deskripsi" TEXT,
    "profesi" TEXT[],
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "profil_lulusan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cpl" (
    "id" TEXT NOT NULL,
    "kode_cpl" TEXT NOT NULL,
    "deskripsi" TEXT NOT NULL,
    "kategori" "KategoriCPL" NOT NULL,
    "sumber" "SumberCPL" NOT NULL,
    "nilai_minimum_kelulusan" DECIMAL(65,30) NOT NULL DEFAULT 2.75,
    "status_aktif" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cpl_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bahan_kajian" (
    "id" TEXT NOT NULL,
    "kode_bk" TEXT NOT NULL,
    "nama_bahan_kajian" TEXT NOT NULL,
    "kategori" "KategoriBahanKajian" NOT NULL,
    "bobot_min_sks" INTEGER NOT NULL,
    "bobot_max_sks" INTEGER NOT NULL,
    "deskripsi" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "bahan_kajian_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mata_kuliah" (
    "id" TEXT NOT NULL,
    "kode_mk" TEXT NOT NULL,
    "nama_mk" TEXT NOT NULL,
    "sks" INTEGER NOT NULL,
    "semester" INTEGER NOT NULL,
    "jenis" "JenisMataKuliah" NOT NULL,
    "konsentrasi" "Konsentrasi",
    "deskripsi" TEXT,
    "status_aktif" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "mata_kuliah_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "prasyarat_mk" (
    "id" TEXT NOT NULL,
    "mk_id" TEXT NOT NULL,
    "prasyarat_mk_id" TEXT NOT NULL,
    "jenis_prasyarat" "JenisPrasyarat" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "prasyarat_mk_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pl_cpl_mapping" (
    "id" TEXT NOT NULL,
    "profil_lulusan_id" TEXT NOT NULL,
    "cpl_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pl_cpl_mapping_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cpl_bk_mapping" (
    "id" TEXT NOT NULL,
    "cpl_id" TEXT NOT NULL,
    "bahan_kajian_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "cpl_bk_mapping_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bk_mk_mapping" (
    "id" TEXT NOT NULL,
    "bahan_kajian_id" TEXT NOT NULL,
    "mata_kuliah_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "bk_mk_mapping_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cpl_mk_mapping" (
    "id" TEXT NOT NULL,
    "cpl_id" TEXT NOT NULL,
    "mata_kuliah_id" TEXT NOT NULL,
    "status" "StatusCPLMK" NOT NULL,
    "semester_target" INTEGER,
    "bobot_status" DECIMAL(65,30) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "cpl_mk_mapping_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pl_mk_mapping" (
    "id" TEXT NOT NULL,
    "profil_lulusan_id" TEXT NOT NULL,
    "mata_kuliah_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pl_mk_mapping_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cpmk" (
    "id" TEXT NOT NULL,
    "mata_kuliah_id" TEXT NOT NULL,
    "kode_cpmk" TEXT NOT NULL,
    "deskripsi" TEXT NOT NULL,
    "bobot_persen" DECIMAL(65,30) NOT NULL,
    "urutan" INTEGER NOT NULL,
    "status_aktif" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cpmk_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cpmk_cpl_mapping" (
    "id" TEXT NOT NULL,
    "cpmk_id" TEXT NOT NULL,
    "cpl_id" TEXT NOT NULL,
    "kontribusi_persen" DECIMAL(65,30) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "cpmk_cpl_mapping_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sub_cpmk" (
    "id" TEXT NOT NULL,
    "cpmk_id" TEXT NOT NULL,
    "kode_sub_cpmk" TEXT NOT NULL,
    "deskripsi" TEXT NOT NULL,
    "bobot_persen" DECIMAL(65,30) NOT NULL,
    "pertemuan_ke" INTEGER[],
    "urutan" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sub_cpmk_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "instrumen_penilaian" (
    "id" TEXT NOT NULL,
    "mata_kuliah_id" TEXT NOT NULL,
    "semester_tahun" TEXT NOT NULL,
    "nama_instrumen" TEXT NOT NULL,
    "jenis_penilaian" "JenisPenilaian" NOT NULL,
    "bobot_persen" DECIMAL(65,30) NOT NULL,
    "tanggal_pelaksanaan" TIMESTAMP(3),
    "nilai_maksimal" INTEGER NOT NULL DEFAULT 100,
    "deskripsi" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "instrumen_penilaian_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "instrumen_subcpmk_mapping" (
    "id" TEXT NOT NULL,
    "instrumen_id" TEXT NOT NULL,
    "sub_cpmk_id" TEXT NOT NULL,
    "bobot_soal_persen" DECIMAL(65,30) NOT NULL,
    "nomor_soal" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "instrumen_subcpmk_mapping_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rubrik_penilaian" (
    "id" TEXT NOT NULL,
    "instrumen_id" TEXT NOT NULL,
    "sub_cpmk_id" TEXT NOT NULL,
    "level_pencapaian" "LevelPencapaian" NOT NULL,
    "skor_numerik" DECIMAL(65,30) NOT NULL,
    "deskriptor" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "rubrik_penilaian_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mahasiswa" (
    "id" TEXT NOT NULL,
    "nim" TEXT NOT NULL,
    "nama_lengkap" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "angkatan" INTEGER NOT NULL,
    "semester_aktif" INTEGER NOT NULL,
    "konsentrasi" "Konsentrasi",
    "status" "StatusMahasiswa" NOT NULL DEFAULT 'aktif',
    "ipk" DECIMAL(65,30),
    "total_sks" INTEGER,
    "tanggal_masuk" TIMESTAMP(3) NOT NULL,
    "tanggal_lulus" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "mahasiswa_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "enrollment" (
    "id" TEXT NOT NULL,
    "mahasiswa_id" TEXT NOT NULL,
    "mata_kuliah_id" TEXT NOT NULL,
    "semester_tahun" TEXT NOT NULL,
    "dosen_pengampu_id" TEXT NOT NULL,
    "kelas" TEXT,
    "status" "StatusEnrollment" NOT NULL DEFAULT 'aktif',
    "nilai_akhir" DECIMAL(65,30),
    "nilai_huruf" TEXT,
    "grade_point" DECIMAL(65,30),
    "tanggal_daftar" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "tanggal_finalisasi" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "enrollment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "nilai_instrumen" (
    "id" TEXT NOT NULL,
    "enrollment_id" TEXT NOT NULL,
    "instrumen_id" TEXT NOT NULL,
    "nilai_angka" DECIMAL(65,30) NOT NULL,
    "nilai_huruf" TEXT,
    "grade_point" DECIMAL(65,30),
    "catatan_dosen" TEXT,
    "tanggal_input" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "input_by" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "nilai_instrumen_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "nilai_subcpmk" (
    "id" TEXT NOT NULL,
    "enrollment_id" TEXT NOT NULL,
    "sub_cpmk_id" TEXT NOT NULL,
    "nilai_kumulatif" DECIMAL(65,30) NOT NULL,
    "jumlah_instrumen" INTEGER NOT NULL,
    "status_pencapaian" "StatusPencapaian" NOT NULL,
    "last_calculated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "nilai_subcpmk_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "nilai_cpmk" (
    "id" TEXT NOT NULL,
    "enrollment_id" TEXT NOT NULL,
    "cpmk_id" TEXT NOT NULL,
    "nilai_kumulatif" DECIMAL(65,30) NOT NULL,
    "status_pencapaian" "StatusPencapaian" NOT NULL,
    "last_calculated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "nilai_cpmk_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "capaian_cpl_per_mk" (
    "id" TEXT NOT NULL,
    "enrollment_id" TEXT NOT NULL,
    "mahasiswa_id" TEXT NOT NULL,
    "cpl_id" TEXT NOT NULL,
    "mata_kuliah_id" TEXT NOT NULL,
    "nilai_kontribusi" DECIMAL(65,30) NOT NULL,
    "status_dalam_mk" "StatusCPLMK" NOT NULL,
    "semester_tahun" TEXT NOT NULL,
    "sks_mk" INTEGER NOT NULL,
    "bobot_status" DECIMAL(65,30) NOT NULL,
    "last_calculated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "capaian_cpl_per_mk_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "capaian_cpl_mahasiswa" (
    "id" TEXT NOT NULL,
    "mahasiswa_id" TEXT NOT NULL,
    "cpl_id" TEXT NOT NULL,
    "nilai_kumulatif" DECIMAL(65,30) NOT NULL,
    "jumlah_mk_berkontribusi" INTEGER NOT NULL,
    "total_sks_berkontribusi" INTEGER NOT NULL,
    "status_pencapaian" "StatusCPLAchievement" NOT NULL,
    "is_memenuhi_standard" BOOLEAN NOT NULL,
    "semester_terakhir_update" TEXT,
    "last_calculated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "capaian_cpl_mahasiswa_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "log_perhitungan_cpl" (
    "id" TEXT NOT NULL,
    "mahasiswa_id" TEXT NOT NULL,
    "cpl_id" TEXT NOT NULL,
    "nilai_sebelum" DECIMAL(65,30),
    "nilai_sesudah" DECIMAL(65,30) NOT NULL,
    "trigger_event" "TriggerEvent" NOT NULL,
    "mata_kuliah_id" TEXT,
    "detail_perhitungan" JSONB,
    "calculated_by" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "log_perhitungan_cpl_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dosen" (
    "id" TEXT NOT NULL,
    "nidn" TEXT NOT NULL,
    "nama_lengkap" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "bidang_keahlian" TEXT[],
    "jabatan_akademik" "JabatanAkademik" NOT NULL,
    "status" "StatusDosen" NOT NULL DEFAULT 'aktif',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "dosen_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pengampu_mk" (
    "id" TEXT NOT NULL,
    "mata_kuliah_id" TEXT NOT NULL,
    "dosen_id" TEXT NOT NULL,
    "semester_tahun" TEXT NOT NULL,
    "kelas" TEXT,
    "peran" "PeranPengampu" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pengampu_mk_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "metode_pembelajaran" (
    "id" TEXT NOT NULL,
    "mata_kuliah_id" TEXT NOT NULL,
    "metode" "MetodePembelajaran" NOT NULL,
    "modus" "ModusPembelajaran" NOT NULL,
    "bentuk" "BentukPembelajaran" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "metode_pembelajaran_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "standard_penilaian" (
    "id" TEXT NOT NULL,
    "nama_standard" TEXT NOT NULL,
    "tipe" "TipeStandard" NOT NULL,
    "rules" JSONB NOT NULL,
    "status_aktif" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "standard_penilaian_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "semester_akademik" (
    "id" TEXT NOT NULL,
    "kode_semester" TEXT NOT NULL,
    "nama_semester" TEXT NOT NULL,
    "tahun_akademik" TEXT NOT NULL,
    "jenis" "JenisSemester" NOT NULL,
    "tanggal_mulai" TIMESTAMP(3) NOT NULL,
    "tanggal_selesai" TIMESTAMP(3) NOT NULL,
    "status" "StatusSemester" NOT NULL DEFAULT 'draft',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "semester_akademik_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifikasi_cpl" (
    "id" TEXT NOT NULL,
    "mahasiswa_id" TEXT NOT NULL,
    "cpl_id" TEXT,
    "jenis" "JenisNotifikasi" NOT NULL,
    "judul" TEXT NOT NULL,
    "pesan" TEXT NOT NULL,
    "data_terkait" JSONB,
    "is_read" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "notifikasi_cpl_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "profil_lulusan_kode_pl_key" ON "profil_lulusan"("kode_pl");

-- CreateIndex
CREATE UNIQUE INDEX "cpl_kode_cpl_key" ON "cpl"("kode_cpl");

-- CreateIndex
CREATE UNIQUE INDEX "bahan_kajian_kode_bk_key" ON "bahan_kajian"("kode_bk");

-- CreateIndex
CREATE UNIQUE INDEX "mata_kuliah_kode_mk_key" ON "mata_kuliah"("kode_mk");

-- CreateIndex
CREATE UNIQUE INDEX "prasyarat_mk_mk_id_prasyarat_mk_id_key" ON "prasyarat_mk"("mk_id", "prasyarat_mk_id");

-- CreateIndex
CREATE UNIQUE INDEX "pl_cpl_mapping_profil_lulusan_id_cpl_id_key" ON "pl_cpl_mapping"("profil_lulusan_id", "cpl_id");

-- CreateIndex
CREATE UNIQUE INDEX "cpl_bk_mapping_cpl_id_bahan_kajian_id_key" ON "cpl_bk_mapping"("cpl_id", "bahan_kajian_id");

-- CreateIndex
CREATE UNIQUE INDEX "bk_mk_mapping_bahan_kajian_id_mata_kuliah_id_key" ON "bk_mk_mapping"("bahan_kajian_id", "mata_kuliah_id");

-- CreateIndex
CREATE UNIQUE INDEX "cpl_mk_mapping_cpl_id_mata_kuliah_id_key" ON "cpl_mk_mapping"("cpl_id", "mata_kuliah_id");

-- CreateIndex
CREATE UNIQUE INDEX "pl_mk_mapping_profil_lulusan_id_mata_kuliah_id_key" ON "pl_mk_mapping"("profil_lulusan_id", "mata_kuliah_id");

-- CreateIndex
CREATE UNIQUE INDEX "instrumen_subcpmk_mapping_instrumen_id_sub_cpmk_id_key" ON "instrumen_subcpmk_mapping"("instrumen_id", "sub_cpmk_id");

-- CreateIndex
CREATE UNIQUE INDEX "rubrik_penilaian_instrumen_id_sub_cpmk_id_level_pencapaian_key" ON "rubrik_penilaian"("instrumen_id", "sub_cpmk_id", "level_pencapaian");

-- CreateIndex
CREATE UNIQUE INDEX "mahasiswa_nim_key" ON "mahasiswa"("nim");

-- CreateIndex
CREATE UNIQUE INDEX "mahasiswa_email_key" ON "mahasiswa"("email");

-- CreateIndex
CREATE UNIQUE INDEX "enrollment_mahasiswa_id_mata_kuliah_id_semester_tahun_key" ON "enrollment"("mahasiswa_id", "mata_kuliah_id", "semester_tahun");

-- CreateIndex
CREATE UNIQUE INDEX "nilai_instrumen_enrollment_id_instrumen_id_key" ON "nilai_instrumen"("enrollment_id", "instrumen_id");

-- CreateIndex
CREATE UNIQUE INDEX "nilai_subcpmk_enrollment_id_sub_cpmk_id_key" ON "nilai_subcpmk"("enrollment_id", "sub_cpmk_id");

-- CreateIndex
CREATE UNIQUE INDEX "nilai_cpmk_enrollment_id_cpmk_id_key" ON "nilai_cpmk"("enrollment_id", "cpmk_id");

-- CreateIndex
CREATE UNIQUE INDEX "capaian_cpl_per_mk_enrollment_id_cpl_id_key" ON "capaian_cpl_per_mk"("enrollment_id", "cpl_id");

-- CreateIndex
CREATE UNIQUE INDEX "capaian_cpl_mahasiswa_mahasiswa_id_cpl_id_key" ON "capaian_cpl_mahasiswa"("mahasiswa_id", "cpl_id");

-- CreateIndex
CREATE UNIQUE INDEX "dosen_nidn_key" ON "dosen"("nidn");

-- CreateIndex
CREATE UNIQUE INDEX "dosen_email_key" ON "dosen"("email");

-- CreateIndex
CREATE UNIQUE INDEX "pengampu_mk_mata_kuliah_id_dosen_id_semester_tahun_kelas_key" ON "pengampu_mk"("mata_kuliah_id", "dosen_id", "semester_tahun", "kelas");

-- CreateIndex
CREATE UNIQUE INDEX "metode_pembelajaran_mata_kuliah_id_metode_key" ON "metode_pembelajaran"("mata_kuliah_id", "metode");

-- CreateIndex
CREATE UNIQUE INDEX "semester_akademik_kode_semester_key" ON "semester_akademik"("kode_semester");

-- AddForeignKey
ALTER TABLE "prasyarat_mk" ADD CONSTRAINT "prasyarat_mk_mk_id_fkey" FOREIGN KEY ("mk_id") REFERENCES "mata_kuliah"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "prasyarat_mk" ADD CONSTRAINT "prasyarat_mk_prasyarat_mk_id_fkey" FOREIGN KEY ("prasyarat_mk_id") REFERENCES "mata_kuliah"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pl_cpl_mapping" ADD CONSTRAINT "pl_cpl_mapping_profil_lulusan_id_fkey" FOREIGN KEY ("profil_lulusan_id") REFERENCES "profil_lulusan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pl_cpl_mapping" ADD CONSTRAINT "pl_cpl_mapping_cpl_id_fkey" FOREIGN KEY ("cpl_id") REFERENCES "cpl"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cpl_bk_mapping" ADD CONSTRAINT "cpl_bk_mapping_cpl_id_fkey" FOREIGN KEY ("cpl_id") REFERENCES "cpl"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cpl_bk_mapping" ADD CONSTRAINT "cpl_bk_mapping_bahan_kajian_id_fkey" FOREIGN KEY ("bahan_kajian_id") REFERENCES "bahan_kajian"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bk_mk_mapping" ADD CONSTRAINT "bk_mk_mapping_bahan_kajian_id_fkey" FOREIGN KEY ("bahan_kajian_id") REFERENCES "bahan_kajian"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bk_mk_mapping" ADD CONSTRAINT "bk_mk_mapping_mata_kuliah_id_fkey" FOREIGN KEY ("mata_kuliah_id") REFERENCES "mata_kuliah"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cpl_mk_mapping" ADD CONSTRAINT "cpl_mk_mapping_cpl_id_fkey" FOREIGN KEY ("cpl_id") REFERENCES "cpl"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cpl_mk_mapping" ADD CONSTRAINT "cpl_mk_mapping_mata_kuliah_id_fkey" FOREIGN KEY ("mata_kuliah_id") REFERENCES "mata_kuliah"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pl_mk_mapping" ADD CONSTRAINT "pl_mk_mapping_profil_lulusan_id_fkey" FOREIGN KEY ("profil_lulusan_id") REFERENCES "profil_lulusan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pl_mk_mapping" ADD CONSTRAINT "pl_mk_mapping_mata_kuliah_id_fkey" FOREIGN KEY ("mata_kuliah_id") REFERENCES "mata_kuliah"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cpmk" ADD CONSTRAINT "cpmk_mata_kuliah_id_fkey" FOREIGN KEY ("mata_kuliah_id") REFERENCES "mata_kuliah"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cpmk_cpl_mapping" ADD CONSTRAINT "cpmk_cpl_mapping_cpmk_id_fkey" FOREIGN KEY ("cpmk_id") REFERENCES "cpmk"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cpmk_cpl_mapping" ADD CONSTRAINT "cpmk_cpl_mapping_cpl_id_fkey" FOREIGN KEY ("cpl_id") REFERENCES "cpl"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sub_cpmk" ADD CONSTRAINT "sub_cpmk_cpmk_id_fkey" FOREIGN KEY ("cpmk_id") REFERENCES "cpmk"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "instrumen_penilaian" ADD CONSTRAINT "instrumen_penilaian_mata_kuliah_id_fkey" FOREIGN KEY ("mata_kuliah_id") REFERENCES "mata_kuliah"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "instrumen_subcpmk_mapping" ADD CONSTRAINT "instrumen_subcpmk_mapping_instrumen_id_fkey" FOREIGN KEY ("instrumen_id") REFERENCES "instrumen_penilaian"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "instrumen_subcpmk_mapping" ADD CONSTRAINT "instrumen_subcpmk_mapping_sub_cpmk_id_fkey" FOREIGN KEY ("sub_cpmk_id") REFERENCES "sub_cpmk"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rubrik_penilaian" ADD CONSTRAINT "rubrik_penilaian_instrumen_id_fkey" FOREIGN KEY ("instrumen_id") REFERENCES "instrumen_penilaian"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rubrik_penilaian" ADD CONSTRAINT "rubrik_penilaian_sub_cpmk_id_fkey" FOREIGN KEY ("sub_cpmk_id") REFERENCES "sub_cpmk"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "enrollment" ADD CONSTRAINT "enrollment_mahasiswa_id_fkey" FOREIGN KEY ("mahasiswa_id") REFERENCES "mahasiswa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "enrollment" ADD CONSTRAINT "enrollment_mata_kuliah_id_fkey" FOREIGN KEY ("mata_kuliah_id") REFERENCES "mata_kuliah"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "enrollment" ADD CONSTRAINT "enrollment_dosen_pengampu_id_fkey" FOREIGN KEY ("dosen_pengampu_id") REFERENCES "dosen"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "nilai_instrumen" ADD CONSTRAINT "nilai_instrumen_enrollment_id_fkey" FOREIGN KEY ("enrollment_id") REFERENCES "enrollment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "nilai_instrumen" ADD CONSTRAINT "nilai_instrumen_instrumen_id_fkey" FOREIGN KEY ("instrumen_id") REFERENCES "instrumen_penilaian"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "nilai_instrumen" ADD CONSTRAINT "nilai_instrumen_input_by_fkey" FOREIGN KEY ("input_by") REFERENCES "dosen"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "nilai_subcpmk" ADD CONSTRAINT "nilai_subcpmk_enrollment_id_fkey" FOREIGN KEY ("enrollment_id") REFERENCES "enrollment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "nilai_subcpmk" ADD CONSTRAINT "nilai_subcpmk_sub_cpmk_id_fkey" FOREIGN KEY ("sub_cpmk_id") REFERENCES "sub_cpmk"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "nilai_cpmk" ADD CONSTRAINT "nilai_cpmk_enrollment_id_fkey" FOREIGN KEY ("enrollment_id") REFERENCES "enrollment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "nilai_cpmk" ADD CONSTRAINT "nilai_cpmk_cpmk_id_fkey" FOREIGN KEY ("cpmk_id") REFERENCES "cpmk"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "capaian_cpl_per_mk" ADD CONSTRAINT "capaian_cpl_per_mk_enrollment_id_fkey" FOREIGN KEY ("enrollment_id") REFERENCES "enrollment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "capaian_cpl_per_mk" ADD CONSTRAINT "capaian_cpl_per_mk_mahasiswa_id_fkey" FOREIGN KEY ("mahasiswa_id") REFERENCES "mahasiswa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "capaian_cpl_per_mk" ADD CONSTRAINT "capaian_cpl_per_mk_cpl_id_fkey" FOREIGN KEY ("cpl_id") REFERENCES "cpl"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "capaian_cpl_per_mk" ADD CONSTRAINT "capaian_cpl_per_mk_mata_kuliah_id_fkey" FOREIGN KEY ("mata_kuliah_id") REFERENCES "mata_kuliah"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "capaian_cpl_mahasiswa" ADD CONSTRAINT "capaian_cpl_mahasiswa_mahasiswa_id_fkey" FOREIGN KEY ("mahasiswa_id") REFERENCES "mahasiswa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "capaian_cpl_mahasiswa" ADD CONSTRAINT "capaian_cpl_mahasiswa_cpl_id_fkey" FOREIGN KEY ("cpl_id") REFERENCES "cpl"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "log_perhitungan_cpl" ADD CONSTRAINT "log_perhitungan_cpl_mahasiswa_id_fkey" FOREIGN KEY ("mahasiswa_id") REFERENCES "mahasiswa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "log_perhitungan_cpl" ADD CONSTRAINT "log_perhitungan_cpl_cpl_id_fkey" FOREIGN KEY ("cpl_id") REFERENCES "cpl"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "log_perhitungan_cpl" ADD CONSTRAINT "log_perhitungan_cpl_mata_kuliah_id_fkey" FOREIGN KEY ("mata_kuliah_id") REFERENCES "mata_kuliah"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pengampu_mk" ADD CONSTRAINT "pengampu_mk_mata_kuliah_id_fkey" FOREIGN KEY ("mata_kuliah_id") REFERENCES "mata_kuliah"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pengampu_mk" ADD CONSTRAINT "pengampu_mk_dosen_id_fkey" FOREIGN KEY ("dosen_id") REFERENCES "dosen"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "metode_pembelajaran" ADD CONSTRAINT "metode_pembelajaran_mata_kuliah_id_fkey" FOREIGN KEY ("mata_kuliah_id") REFERENCES "mata_kuliah"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifikasi_cpl" ADD CONSTRAINT "notifikasi_cpl_mahasiswa_id_fkey" FOREIGN KEY ("mahasiswa_id") REFERENCES "mahasiswa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifikasi_cpl" ADD CONSTRAINT "notifikasi_cpl_cpl_id_fkey" FOREIGN KEY ("cpl_id") REFERENCES "cpl"("id") ON DELETE SET NULL ON UPDATE CASCADE;
