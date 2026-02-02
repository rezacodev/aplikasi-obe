/*
  Warnings:

  - You are about to drop the column `program_studi` on the `kurikulum` table. All the data in the column will be lost.
  - Added the required column `programStudiId` to the `bahan_kajian` table without a default value. This is not possible if the table is not empty.
  - Added the required column `programStudiId` to the `cpl` table without a default value. This is not possible if the table is not empty.
  - Added the required column `programStudiId` to the `kurikulum` table without a default value. This is not possible if the table is not empty.
  - Added the required column `programStudiId` to the `mata_kuliah` table without a default value. This is not possible if the table is not empty.
  - Added the required column `programStudiId` to the `profil_lulusan` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "bahan_kajian" ADD COLUMN     "programStudiId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "cpl" ADD COLUMN     "programStudiId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "kurikulum" DROP COLUMN "program_studi",
ADD COLUMN     "programStudiId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "mata_kuliah" ADD COLUMN     "programStudiId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "profil_lulusan" ADD COLUMN     "programStudiId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "user" ADD COLUMN     "programStudiId" TEXT;

-- CreateTable
CREATE TABLE "program_studi" (
    "id" TEXT NOT NULL,
    "kode_program_studi" TEXT NOT NULL,
    "nama_program_studi" TEXT NOT NULL,
    "jenjang" TEXT NOT NULL,
    "fakultas" TEXT NOT NULL,
    "status_aktif" BOOLEAN NOT NULL DEFAULT true,
    "deskripsi" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "program_studi_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "program_studi_kode_program_studi_key" ON "program_studi"("kode_program_studi");

-- AddForeignKey
ALTER TABLE "profil_lulusan" ADD CONSTRAINT "profil_lulusan_programStudiId_fkey" FOREIGN KEY ("programStudiId") REFERENCES "program_studi"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kurikulum" ADD CONSTRAINT "kurikulum_programStudiId_fkey" FOREIGN KEY ("programStudiId") REFERENCES "program_studi"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cpl" ADD CONSTRAINT "cpl_programStudiId_fkey" FOREIGN KEY ("programStudiId") REFERENCES "program_studi"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bahan_kajian" ADD CONSTRAINT "bahan_kajian_programStudiId_fkey" FOREIGN KEY ("programStudiId") REFERENCES "program_studi"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mata_kuliah" ADD CONSTRAINT "mata_kuliah_programStudiId_fkey" FOREIGN KEY ("programStudiId") REFERENCES "program_studi"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user" ADD CONSTRAINT "user_programStudiId_fkey" FOREIGN KEY ("programStudiId") REFERENCES "program_studi"("id") ON DELETE SET NULL ON UPDATE CASCADE;
