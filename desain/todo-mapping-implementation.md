# 📋 Todo Checklist - Implementasi Mapping OBE

## 🎯 **OVERVIEW**
Checklist implementasi mapping yang belum dibuat dalam sistem OBE. Total **8 mapping** yang perlu diimplementasikan dengan prioritas berbeda.

---

## 🔥 **HIGH PRIORITY MAPPINGS**

### 1. **Kurikulum - CPL Mapping**
**Status:** ✅ **SELESAI**  
**Database:** ✅ `KURIKULUM_CPL_MAPPING` sudah ada  
**Prioritas:** 🔥 Tinggi (Fundamental untuk struktur kurikulum)

#### ✅ **Checklist Implementation:**
- [x] Buat halaman UI `/admin/mapping-kurikulum-cpl`
- [x] Implementasikan API routes:
  - [x] `GET /api/mapping/kurikulum-cpl`
  - [x] `POST /api/mapping/kurikulum-cpl/bulk`
  - [x] `DELETE /api/mapping/kurikulum-cpl/[id]`
- [x] Tambahkan menu di sidebar
- [x] Implementasikan modal konfirmasi delete
- [x] Test end-to-end functionality
- [x] Update seed data jika diperlukan

---

### 2. **CPL - Mata Kuliah Mapping**
**Status:** ✅ **SELESAI**  
**Database:** ✅ `CPL_MK_MAPPING` sudah ada  
**Prioritas:** 🔥 Tinggi (Penting untuk assessment dan tracking)

#### 📝 **Requirements:**
- UI untuk mapping CPL ke Mata Kuliah
- Support status CPL per mata kuliah (I/R/M/A)
- Bobot status dan semester target
- API endpoints lengkap dengan bulk operations

#### ✅ **Checklist Implementation:**
- [x] Buat halaman UI `/admin/mapping-cpl-mk`
- [x] Implementasikan API routes:
  - [x] `GET /api/mapping/cpl-mk`
  - [x] `POST /api/mapping/cpl-mk/bulk`
  - [x] `DELETE /api/mapping/cpl-mk/[id]`
- [x] Tambahkan field status (I/R/M/A), bobot, dan semester target
- [x] Tambahkan menu di sidebar
- [x] Implementasikan modal konfirmasi delete
- [x] Test end-to-end functionality
- [x] Update seed data jika diperlukan

---

## 🟡 **MEDIUM PRIORITY MAPPINGS**

### 3. **CPL - Bahan Kajian Mapping**
**Status:** ✅ **SELESAI**  
**Database:** ✅ `CPL_BK_MAPPING` sudah ada  
**Prioritas:** 🟡 Sedang (Penting untuk kurikulum berbasis kompetensi)

#### 📝 **Requirements:**
- UI untuk mapping CPL ke Bahan Kajian
- Menentukan bahan kajian yang diperlukan untuk mencapai CPL
- API endpoints lengkap

#### ✅ **Checklist Implementation:**
- [x] Buat halaman UI `/admin/mapping-cpl-bk`
- [x] Implementasikan API routes:
  - [x] `GET /api/mapping/cpl-bk`
  - [x] `POST /api/mapping/cpl-bk/bulk`
  - [x] `DELETE /api/mapping/cpl-bk/[id]`
- [x] Tambahkan menu di sidebar
- [x] Implementasikan modal konfirmasi delete
- [x] Test end-to-end functionality
- [x] Update seed data jika diperlukan

---

### 4. **Profil Lulusan - Mata Kuliah Mapping**
**Status:** ✅ **SELESAI**  
**Database:** ✅ `PL_MK_MAPPING` sudah ada  
**Prioritas:** 🟡 Sedang (Penting untuk alignment PL-MK)

#### 📝 **Requirements:**
- UI untuk mapping Profil Lulusan ke Mata Kuliah
- Menentukan mata kuliah yang mendukung profil lulusan
- API endpoints lengkap

#### ✅ **Checklist Implementation:**
- [x] Buat halaman UI `/admin/mapping-pl-mk`
- [x] Implementasikan API routes:
  - [x] `GET /api/mapping/pl-mk`
  - [x] `POST /api/mapping/pl-mk/bulk`
  - [x] `DELETE /api/mapping/pl-mk/[id]`
- [x] Tambahkan menu di sidebar
- [x] Implementasikan modal konfirmasi delete
- [x] Test end-to-end functionality
- [x] Update seed data jika diperlukan

---

## 🟢 **LOW PRIORITY MAPPINGS**

### 5. **Bahan Kajian - Mata Kuliah Mapping**
**Status:** ✅ **SELESAI**  
**Database:** ✅ `BK_MK_MAPPING` sudah ada  
**Prioritas:** 🟢 Rendah (Lebih ke operational)

#### 📝 **Requirements:**
- UI untuk mapping Bahan Kajian ke Mata Kuliah
- Menentukan mata kuliah yang menggunakan bahan kajian tertentu
- API endpoints lengkap

#### ✅ **Checklist Implementation:**
- [x] Buat halaman UI `/admin/mapping-bk-mk`
- [x] Implementasikan API routes:
  - [x] `GET /api/mapping/bk-mk`
  - [x] `POST /api/mapping/bk-mk/bulk`
  - [x] `DELETE /api/mapping/bk-mk/[id]`
- [x] Tambahkan menu di sidebar
- [x] Implementasikan modal konfirmasi delete
- [x] Test end-to-end functionality
- [x] Update seed data jika diperlukan

---

### 6. **Kurikulum - Mata Kuliah Mapping**
**Status:** ✅ **SELESAI**  
**Database:** ✅ `KURIKULUM_MK_MAPPING` sudah dibuat  
**Prioritas:** 🟢 Rendah (Bisa digantikan dengan mapping bertahap)

#### 📝 **Requirements:**
- Buat model database `KURIKULUM_MK_MAPPING`
- UI untuk mapping langsung kurikulum ke mata kuliah
- API endpoints lengkap
- Migration database

#### ✅ **Checklist Implementation:**
- [x] Buat model database `KURIKULUM_MK_MAPPING`
- [x] Buat migration database
- [x] Update Prisma schema
- [x] Buat halaman UI `/admin/mapping-kurikulum-mk`
- [x] Implementasikan API routes:
  - [x] `GET /api/mapping/kurikulum-mk`
  - [x] `POST /api/mapping/kurikulum-mk/bulk`
  - [x] `DELETE /api/mapping/kurikulum-mk/[id]`
- [x] Tambahkan menu di sidebar
- [x] Implementasikan modal konfirmasi delete
- [x] Test end-to-end functionality
- [x] Update seed data jika diperlukan

---

## 📊 **PROGRESS TRACKING**

### **Current Status:**
- ✅ **PL - CPL**: Selesai (UI + API + Database)
- ✅ **CPL - CPMK**: Selesai (UI + API + Database)
- ✅ **Kurikulum - CPL**: Selesai (UI + API + Database)
- ✅ **CPL - Mata Kuliah**: Selesai (UI + API + Database)
- ✅ **CPL - Bahan Kajian**: Selesai (UI + API + Database)
- ✅ **PL - Mata Kuliah**: Selesai (UI + API + Database)
- ✅ **Bahan Kajian - Mata Kuliah**: Selesai (UI + API + Database)
- ✅ **Kurikulum - Mata Kuliah**: Selesai (UI + API + Database) - **BARU SELESAI**

### **Completion Rate:**
- **Completed:** 8/8 mappings (100%) ⬆️ **NAIK DARI 87.5%**
- **Remaining:** 0/8 mappings (0%)
- **High Priority:** 2/2 ✅ **SELESAI**
- **Medium Priority:** 2/2 ✅ **SELESAI**
- **Low Priority:** 2/2 ✅ **SELESAI**

---

## 🚀 **IMPLEMENTATION ORDER RECOMMENDATION**

### **Phase 1 (High Priority - Core Functionality):**
1. **Kurikulum - CPL** ← ✅ **SELESAI**
2. **CPL - Mata Kuliah** ← ✅ **SELESAI**

### **Phase 2 (Medium Priority - Enhanced Functionality):**
3. **CPL - Bahan Kajian** ← ✅ **SELESAI**
4. **Profil Lulusan - Mata Kuliah** ← ✅ **SELESAI**

### **Phase 3 (Low Priority - Nice to Have):**
5. **Bahan Kajian - Mata Kuliah**
6. **Kurikulum - Mata Kuliah**

---

## 📋 **STANDARD IMPLEMENTATION STEPS**

Untuk setiap mapping, ikuti langkah-langkah ini:

### **1. Database & API:**
- [ ] Cek model database sudah ada/buat baru
- [ ] Buat API routes (GET, POST bulk, DELETE)
- [ ] Test API dengan Postman/Thunder Client

### **2. UI Components:**
- [ ] Buat halaman mapping dengan layout panel kiri-kanan
- [ ] Implementasikan dialog seleksi
- [ ] Buat DataTable dengan kolom yang sesuai
- [ ] Tambahkan dropdown menu dengan three dots
- [ ] Implementasikan modal konfirmasi delete

### **3. Navigation:**
- [ ] Tambahkan menu di sidebar
- [ ] Update routing jika diperlukan

### **4. Testing & Validation:**
- [ ] Test create, read, update, delete operations
- [ ] Test bulk operations
- [ ] Test error handling
- [ ] Test responsive design
- [ ] Run lint dan build check

### **5. Documentation:**
- [ ] Update README jika diperlukan
- [ ] Dokumentasi API endpoints

---

## 🎯 **SUCCESS CRITERIA**

Setiap mapping dianggap selesai ketika:
- ✅ UI fully functional dengan semua CRUD operations
- ✅ API endpoints lengkap dan terdokumentasi
- ✅ Modal konfirmasi delete berfungsi
- ✅ Dropdown menu dengan three dots
- ✅ Responsive design
- ✅ Lint dan build check passed
- ✅ End-to-end testing berhasil

---

*Last Updated: February 2, 2026*
*Total Mappings to Implement: 8*
*High Priority Completed: 2/2 ✅*
*Medium Priority: 2/2 Selesai, Next: -*
*Progress: 8/8 mappings (100%) ✅*
*Estimated Effort: High (Setiap mapping ~2-3 hari development)*