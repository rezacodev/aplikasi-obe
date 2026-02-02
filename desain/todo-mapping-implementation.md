# 📋 Todo Checklist - Implementasi Mapping OBE

## 🎯 **OVERVIEW**
Checklist implementasi mapping yang belum dibuat dalam sistem OBE. Total **6 mapping** yang perlu diimplementasikan dengan prioritas berbeda.

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
**Status:** ❌ Belum Dibuat  
**Database:** ✅ `CPL_BK_MAPPING` sudah ada  
**Prioritas:** 🟡 Sedang (Penting untuk kurikulum berbasis kompetensi)

#### 📝 **Requirements:**
- UI untuk mapping CPL ke Bahan Kajian
- Menentukan bahan kajian yang diperlukan untuk mencapai CPL
- API endpoints lengkap

#### ✅ **Checklist Implementation:**
- [ ] Buat halaman UI `/admin/mapping-cpl-bk`
- [ ] Implementasikan API routes:
  - [ ] `GET /api/mapping/cpl-bk`
  - [ ] `POST /api/mapping/cpl-bk/bulk`
  - [ ] `DELETE /api/mapping/cpl-bk/[id]`
- [ ] Tambahkan menu di sidebar
- [ ] Implementasikan modal konfirmasi delete
- [ ] Test end-to-end functionality
- [ ] Update seed data jika diperlukan

---

### 4. **Profil Lulusan - Mata Kuliah Mapping**
**Status:** ❌ Belum Dibuat  
**Database:** ✅ `PL_MK_MAPPING` sudah ada  
**Prioritas:** 🟡 Sedang (Penting untuk alignment PL-MK)

#### 📝 **Requirements:**
- UI untuk mapping Profil Lulusan ke Mata Kuliah
- Menentukan mata kuliah yang mendukung profil lulusan
- API endpoints lengkap

#### ✅ **Checklist Implementation:**
- [ ] Buat halaman UI `/admin/mapping-pl-mk`
- [ ] Implementasikan API routes:
  - [ ] `GET /api/mapping/pl-mk`
  - [ ] `POST /api/mapping/pl-mk/bulk`
  - [ ] `DELETE /api/mapping/pl-mk/[id]`
- [ ] Tambahkan menu di sidebar
- [ ] Implementasikan modal konfirmasi delete
- [ ] Test end-to-end functionality
- [ ] Update seed data jika diperlukan

---

## 🟢 **LOW PRIORITY MAPPINGS**

### 5. **Bahan Kajian - Mata Kuliah Mapping**
**Status:** ❌ Belum Dibuat  
**Database:** ✅ `BK_MK_MAPPING` sudah ada  
**Prioritas:** 🟢 Rendah (Lebih ke operational)

#### 📝 **Requirements:**
- UI untuk mapping Bahan Kajian ke Mata Kuliah
- Menentukan mata kuliah yang menggunakan bahan kajian tertentu
- API endpoints lengkap

#### ✅ **Checklist Implementation:**
- [ ] Buat halaman UI `/admin/mapping-bk-mk`
- [ ] Implementasikan API routes:
  - [ ] `GET /api/mapping/bk-mk`
  - [ ] `POST /api/mapping/bk-mk/bulk`
  - [ ] `DELETE /api/mapping/bk-mk/[id]`
- [ ] Tambahkan menu di sidebar
- [ ] Implementasikan modal konfirmasi delete
- [ ] Test end-to-end functionality
- [ ] Update seed data jika diperlukan

---

### 6. **Kurikulum - Mata Kuliah Mapping**
**Status:** ❌ Belum Dibuat  
**Database:** ❌ Belum ada (perlu buat model baru)  
**Prioritas:** 🟢 Rendah (Bisa digantikan dengan mapping bertahap)

#### 📝 **Requirements:**
- Buat model database `KURIKULUM_MK_MAPPING`
- UI untuk mapping langsung kurikulum ke mata kuliah
- API endpoints lengkap
- Migration database

#### ✅ **Checklist Implementation:**
- [ ] Buat model database `KURIKULUM_MK_MAPPING`
- [ ] Buat migration database
- [ ] Update Prisma schema
- [ ] Buat halaman UI `/admin/mapping-kurikulum-mk`
- [ ] Implementasikan API routes:
  - [ ] `GET /api/mapping/kurikulum-mk`
  - [ ] `POST /api/mapping/kurikulum-mk/bulk`
  - [ ] `DELETE /api/mapping/kurikulum-mk/[id]`
- [ ] Tambahkan menu di sidebar
- [ ] Implementasikan modal konfirmasi delete
- [ ] Test end-to-end functionality
- [ ] Update seed data jika diperlukan

---

## 📊 **PROGRESS TRACKING**

### **Current Status:**
- ✅ **PL - CPL**: Selesai (UI + API + Database)
- ✅ **CPL - CPMK**: Selesai (UI + API + Database)
- ✅ **Kurikulum - CPL**: Selesai (UI + API + Database) - **BARU SELESAI**
- ✅ **CPL - Mata Kuliah**: Selesai (UI + API + Database) - **BARU SELESAI**
- ❌ **CPL - Bahan Kajian**: Belum dibuat
- ❌ **PL - Mata Kuliah**: Belum dibuat
- ❌ **Bahan Kajian - Mata Kuliah**: Belum dibuat
- ❌ **Kurikulum - Mata Kuliah**: Belum dibuat

### **Completion Rate:**
- **Completed:** 4/8 mappings (50%) ⬆️ **NAIK DARI 25%**
- **Remaining:** 4/8 mappings (50%)
- **High Priority:** 2/2 ✅ **SELESAI**
- **Medium Priority:** 0/2 (Next: CPL - Bahan Kajian)
- **Low Priority:** 0/2

---

## 🚀 **IMPLEMENTATION ORDER RECOMMENDATION**

### **Phase 1 (High Priority - Core Functionality):**
1. **Kurikulum - CPL** ← ✅ **SELESAI**
2. **CPL - Mata Kuliah** ← ✅ **SELESAI**

### **Phase 2 (Medium Priority - Enhanced Functionality):**
3. **CPL - Bahan Kajian**
4. **Profil Lulusan - Mata Kuliah**

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

*Last Updated: January 31, 2026*
*Total Mappings to Implement: 6*
*High Priority Completed: 2/2 ✅*
*Medium Priority Next: CPL - Bahan Kajian*
*Estimated Effort: High (Setiap mapping ~2-3 hari development)*