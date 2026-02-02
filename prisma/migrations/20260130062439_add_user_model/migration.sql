-- CreateEnum
CREATE TYPE "Role" AS ENUM ('admin', 'dosen', 'mahasiswa');

-- CreateTable
CREATE TABLE "user" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'mahasiswa',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "dosen_id" TEXT,
    "mahasiswa_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_email_key" ON "user"("email");

-- CreateIndex
CREATE UNIQUE INDEX "user_dosen_id_key" ON "user"("dosen_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_mahasiswa_id_key" ON "user"("mahasiswa_id");

-- AddForeignKey
ALTER TABLE "user" ADD CONSTRAINT "user_dosen_id_fkey" FOREIGN KEY ("dosen_id") REFERENCES "dosen"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user" ADD CONSTRAINT "user_mahasiswa_id_fkey" FOREIGN KEY ("mahasiswa_id") REFERENCES "mahasiswa"("id") ON DELETE SET NULL ON UPDATE CASCADE;
