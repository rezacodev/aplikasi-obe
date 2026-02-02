-- CreateTable
CREATE TABLE "kurikulum_mk_mapping" (
    "id" TEXT NOT NULL,
    "kurikulum_id" TEXT NOT NULL,
    "mata_kuliah_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "kurikulum_mk_mapping_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "kurikulum_mk_mapping_kurikulum_id_mata_kuliah_id_key" ON "kurikulum_mk_mapping"("kurikulum_id", "mata_kuliah_id");

-- AddForeignKey
ALTER TABLE "kurikulum_mk_mapping" ADD CONSTRAINT "kurikulum_mk_mapping_kurikulum_id_fkey" FOREIGN KEY ("kurikulum_id") REFERENCES "kurikulum"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kurikulum_mk_mapping" ADD CONSTRAINT "kurikulum_mk_mapping_mata_kuliah_id_fkey" FOREIGN KEY ("mata_kuliah_id") REFERENCES "mata_kuliah"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
