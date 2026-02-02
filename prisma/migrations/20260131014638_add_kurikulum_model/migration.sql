-- CreateTable
CREATE TABLE "kurikulum" (
    "id" TEXT NOT NULL,
    "kode_kurikulum" TEXT NOT NULL,
    "nama_kurikulum" TEXT NOT NULL,
    "tahun_akademik" TEXT NOT NULL,
    "jurusan" TEXT NOT NULL,
    "program_studi" TEXT NOT NULL,
    "jenjang" TEXT NOT NULL,
    "status_aktif" BOOLEAN NOT NULL DEFAULT true,
    "deskripsi" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "kurikulum_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "kurikulum_cpl_mapping" (
    "id" TEXT NOT NULL,
    "kurikulum_id" TEXT NOT NULL,
    "cpl_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "kurikulum_cpl_mapping_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "kurikulum_kode_kurikulum_key" ON "kurikulum"("kode_kurikulum");

-- CreateIndex
CREATE UNIQUE INDEX "kurikulum_cpl_mapping_kurikulum_id_cpl_id_key" ON "kurikulum_cpl_mapping"("kurikulum_id", "cpl_id");

-- AddForeignKey
ALTER TABLE "kurikulum_cpl_mapping" ADD CONSTRAINT "kurikulum_cpl_mapping_cpl_id_fkey" FOREIGN KEY ("cpl_id") REFERENCES "cpl"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kurikulum_cpl_mapping" ADD CONSTRAINT "kurikulum_cpl_mapping_kurikulum_id_fkey" FOREIGN KEY ("kurikulum_id") REFERENCES "kurikulum"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
