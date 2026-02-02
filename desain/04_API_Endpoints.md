# REST API ENDPOINTS - SISTEM PENGUKURAN CPL
# Program Studi Informatika

## BASE URL
```
Production: https://api-cpl.uingusdur.ac.id/v1
Development: http://localhost:3000/v1
```

## AUTHENTICATION
All endpoints require JWT authentication except public endpoints.

```
Authorization: Bearer <token>
```

---

## 1. CURRICULUM MANAGEMENT

### 1.1 Profil Lulusan

#### GET /profil-lulusan
Get all graduate profiles

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "kode_pl": "PL1",
      "nama_profil": "Software Engineer",
      "deskripsi": "...",
      "profesi": ["Software Developer", "Web Developer"],
      "cpl_count": 8
    }
  ]
}
```

#### POST /profil-lulusan
Create new profile

**Request:**
```json
{
  "kode_pl": "PL5",
  "nama_profil": "Data Scientist",
  "deskripsi": "...",
  "profesi": ["Data Analyst", "ML Engineer"]
}
```

### 1.2 CPL Management

#### GET /cpl
Get all CPL

**Query Parameters:**
- `kategori`: filter by category (sikap, pengetahuan, etc.)
- `status_aktif`: true/false

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "kode_cpl": "CPL01",
      "deskripsi": "Bertakwa kepada Tuhan...",
      "kategori": "sikap",
      "sumber": "SN_DIKTI",
      "nilai_minimum_kelulusan": 2.75,
      "profil_lulusan": ["PL1", "PL2", "PL3"],
      "mata_kuliah_count": 15
    }
  ]
}
```

#### POST /cpl
Create new CPL

#### PUT /cpl/:id
Update CPL

#### DELETE /cpl/:id
Soft delete CPL (set status_aktif = false)

### 1.3 Mata Kuliah

#### GET /mata-kuliah
Get all courses

**Query Parameters:**
- `semester`: 1-8
- `jenis`: wajib/pilihan
- `konsentrasi`: kecerdasan_buatan/multimedia

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "kode_mk": "INF2506",
      "nama_mk": "Algoritma dan Pemrograman",
      "sks": 4,
      "semester": 2,
      "jenis": "wajib",
      "cpl_mapped": 6,
      "cpmk_count": 4,
      "prasyarat": ["INF2502"]
    }
  ]
}
```

---

## 2. MAPPING MANAGEMENT

### 2.1 CPL-MK Mapping

#### GET /mapping/cpl-mk/:mk_id
Get CPL mappings for a course

**Response:**
```json
{
  "success": true,
  "data": {
    "mata_kuliah": {
      "kode_mk": "INF2506",
      "nama_mk": "Algoritma dan Pemrograman"
    },
    "mappings": [
      {
        "cpl_id": 4,
        "kode_cpl": "CPL04",
        "deskripsi": "Menguasai konsep teoritis...",
        "status": "R",
        "semester_target": 2,
        "bobot_status": 1.0
      }
    ]
  }
}
```

#### POST /mapping/cpl-mk
Create/update CPL-MK mapping

**Request:**
```json
{
  "mata_kuliah_id": 13,
  "mappings": [
    {
      "cpl_id": 4,
      "status": "R",
      "semester_target": 2
    },
    {
      "cpl_id": 5,
      "status": "R",
      "semester_target": 2
    }
  ]
}
```

### 2.2 Matrix Views

#### GET /mapping/matrix/cpl-mk
Get complete CPL-MK matrix

**Response:**
```json
{
  "success": true,
  "data": {
    "cpls": ["CPL01", "CPL02", ...],
    "mata_kuliah": ["INF2501", "INF2502", ...],
    "matrix": [
      ["I", null, "R", "M", ...],  // MK 1 vs all CPL
      [null, "I", "R", null, ...],  // MK 2 vs all CPL
      ...
    ]
  }
}
```

---

## 3. RPS & LEARNING DESIGN

### 3.1 CPMK Management

#### POST /mata-kuliah/:mk_id/cpmk
Create CPMK for a course

**Request:**
```json
{
  "kode_cpmk": "CPMK1",
  "deskripsi": "Mahasiswa mampu...",
  "bobot_persen": 30,
  "cpl_mapping": [
    {
      "cpl_id": 4,
      "kontribusi_persen": 60
    },
    {
      "cpl_id": 5,
      "kontribusi_persen": 40
    }
  ]
}
```

#### GET /mata-kuliah/:mk_id/cpmk
Get all CPMK for a course

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "kode_cpmk": "CPMK1",
      "deskripsi": "...",
      "bobot_persen": 30,
      "subcpmk_count": 3,
      "cpl_contribution": [
        {
          "kode_cpl": "CPL04",
          "kontribusi_persen": 60
        }
      ]
    }
  ]
}
```

### 3.2 Sub-CPMK

#### POST /cpmk/:id/subcpmk
Create Sub-CPMK

**Request:**
```json
{
  "kode_sub_cpmk": "Sub-CPMK 1.1",
  "deskripsi": "...",
  "bobot_persen": 30,
  "pertemuan_ke": [1, 2, 3]
}
```

### 3.3 Assessment Instruments

#### POST /mata-kuliah/:mk_id/instrumen
Create assessment instrument

**Request:**
```json
{
  "semester_tahun": "Gasal 2024/2025",
  "nama_instrumen": "UTS",
  "jenis_penilaian": "tes_tulis",
  "bobot_persen": 30,
  "tanggal_pelaksanaan": "2024-11-15",
  "subcpmk_mapping": [
    {
      "sub_cpmk_id": 1,
      "bobot_soal_persen": 30,
      "nomor_soal": "1-3"
    },
    {
      "sub_cpmk_id": 2,
      "bobot_soal_persen": 40,
      "nomor_soal": "4-6"
    }
  ]
}
```

#### GET /mata-kuliah/:mk_id/instrumen
Get all instruments for a course in a semester

**Query Parameters:**
- `semester_tahun`: required

---

## 4. GRADE INPUT & MANAGEMENT

### 4.1 Input Nilai

#### POST /nilai/instrumen/batch
Batch input nilai for an instrument

**Request:**
```json
{
  "instrumen_id": 123,
  "dosen_id": 5,
  "nilai": [
    {
      "enrollment_id": 1001,
      "nilai_angka": 85,
      "catatan": "Sangat baik"
    },
    {
      "enrollment_id": 1002,
      "nilai_angka": 78
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "inserted": 45,
    "updated": 3,
    "failed": 0
  },
  "message": "48 nilai berhasil disimpan"
}
```

#### POST /nilai/instrumen/import
Import from Excel

**Request:**
```
Content-Type: multipart/form-data

instrumen_id: 123
dosen_id: 5
file: [Excel file]
```

**Excel Format:**
| NIM | Nama | Nilai | Catatan |
|-----|------|-------|---------|
| 25010001 | Ahmad | 85 | - |
| 25010002 | Siti | 78 | - |

### 4.2 Trigger Calculation

#### POST /nilai/recalculate/enrollment/:id
Recalculate all CPL for an enrollment

**Response:**
```json
{
  "success": true,
  "message": "Perhitungan selesai",
  "data": {
    "subcpmk_updated": 12,
    "cpmk_updated": 4,
    "cpl_per_mk_updated": 3,
    "cpl_aggregate_updated": 3
  }
}
```

#### POST /nilai/recalculate/mahasiswa/:id
Recalculate all CPL for a student

---

## 5. STUDENT CPL DASHBOARD

### 5.1 CPL Overview

#### GET /mahasiswa/:id/cpl/overview
Get CPL dashboard for a student

**Response:**
```json
{
  "success": true,
  "data": {
    "mahasiswa": {
      "nim": "25010001",
      "nama": "Ahmad Fauzi",
      "semester": 4,
      "ipk": 3.45
    },
    "cpl_achievement": [
      {
        "cpl_id": 1,
        "kode_cpl": "CPL01",
        "kategori": "sikap",
        "nilai_kumulatif": 3.5,
        "status_pencapaian": "assessed",
        "threshold": 2.75,
        "is_passing": true,
        "mk_count": 12,
        "sks_count": 36,
        "progress_percent": 87.5
      }
    ],
    "summary": {
      "total_cpl": 11,
      "cpl_passing": 9,
      "cpl_not_passing": 2,
      "rata_rata": 3.1
    }
  }
}
```

### 5.2 CPL Detail

#### GET /mahasiswa/:id/cpl/:cpl_id/detail
Get detailed CPL achievement

**Response:**
```json
{
  "success": true,
  "data": {
    "cpl": {
      "kode_cpl": "CPL04",
      "deskripsi": "...",
      "nilai_kumulatif": 3.1,
      "threshold": 2.75,
      "status": "reinforce"
    },
    "per_mata_kuliah": [
      {
        "semester": 1,
        "kode_mk": "INF2502",
        "nama_mk": "Pengenalan Pemrograman",
        "sks": 3,
        "nilai_kontribusi": 3.2,
        "nilai_mk": 82,
        "status": "I"
      },
      {
        "semester": 2,
        "kode_mk": "INF2506",
        "nama_mk": "Algoritma dan Pemrograman",
        "sks": 4,
        "nilai_kontribusi": 3.3,
        "nilai_mk": 85,
        "status": "R",
        "cpmk_breakdown": [
          {
            "kode_cpmk": "CPMK1",
            "nilai": 3.5,
            "kontribusi_ke_cpl": 60
          }
        ]
      }
    ],
    "timeline": [
      {"semester": "2024/2025 Gasal", "nilai": 3.0},
      {"semester": "2024/2025 Genap", "nilai": 3.2}
    ]
  }
}
```

### 5.3 Recommendations

#### GET /mahasiswa/:id/rekomendasi
Get academic recommendations based on CPL

**Response:**
```json
{
  "success": true,
  "data": {
    "weak_cpls": [
      {
        "kode_cpl": "CPL10",
        "nilai": 2.6,
        "threshold": 2.75,
        "gap": -0.15
      }
    ],
    "recommended_courses": [
      {
        "kode_mk": "INF2541",
        "nama_mk": "IoT",
        "reason": "Meningkatkan CPL10",
        "potential_impact": "+0.3"
      }
    ],
    "graduation_forecast": {
      "can_graduate": false,
      "missing_requirements": [
        "CPL10 di bawah threshold"
      ]
    }
  }
}
```

---

## 6. ANALYTICS & REPORTS

### 6.1 Prodi Dashboard

#### GET /analytics/cpl/aggregate
Get aggregate CPL statistics

**Query Parameters:**
- `angkatan`: 2024
- `konsentrasi`: kecerdasan_buatan/multimedia

**Response:**
```json
{
  "success": true,
  "data": {
    "summary": {
      "total_mahasiswa": 150,
      "avg_cpl_all": 3.2,
      "completion_rate": 87.5
    },
    "by_category": [
      {
        "kategori": "sikap",
        "avg_nilai": 3.4,
        "completion_rate": 92
      }
    ],
    "by_cpl": [
      {
        "kode_cpl": "CPL01",
        "avg_nilai": 3.5,
        "mahasiswa_passing": 145,
        "mahasiswa_not_passing": 5
      }
    ],
    "trends": [
      {
        "tahun": 2020,
        "avg_cpl": 2.9
      },
      {
        "tahun": 2021,
        "avg_cpl": 3.0
      }
    ]
  }
}
```

### 6.2 Course Analysis

#### GET /analytics/mata-kuliah/:id/cpl-impact
Analyze CPL achievement in a course

**Response:**
```json
{
  "success": true,
  "data": {
    "mata_kuliah": {...},
    "cpl_contributions": [
      {
        "kode_cpl": "CPL04",
        "avg_contribution": 82.5,
        "status_in_mk": "R",
        "students_above_threshold": 45,
        "students_below_threshold": 3
      }
    ],
    "cpmk_performance": [
      {
        "kode_cpmk": "CPMK1",
        "avg_nilai": 78.5,
        "difficulty_level": "medium"
      }
    ]
  }
}
```

### 6.3 Export Reports

#### GET /export/transkrip-cpl/:mahasiswa_id
Download CPL transcript (PDF)

#### GET /export/matrix/cpl-mk
Download CPL-MK matrix (Excel)

#### GET /export/laporan-akreditasi
Download accreditation report

---

## 7. VALIDATION & QA

### 7.1 Validate Curriculum

#### GET /validation/mata-kuliah/:id
Validate course setup

**Response:**
```json
{
  "success": true,
  "data": {
    "is_valid": false,
    "errors": [
      "Total bobot CPMK: 95% (harus 100%)",
      "CPMK3 tidak mapping ke CPL"
    ],
    "warnings": [
      "Sub-CPMK 2.3 tidak dinilai di instrumen manapun"
    ]
  }
}
```

### 7.2 Data Quality Check

#### GET /validation/data-quality
Overall data quality dashboard

**Response:**
```json
{
  "success": true,
  "data": {
    "incomplete_grades": 12,
    "invalid_mappings": 3,
    "missing_cpmk": 5,
    "courses_needing_attention": [...]
  }
}
```

---

## 8. NOTIFICATIONS

#### GET /mahasiswa/:id/notifikasi
Get notifications for a student

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "jenis": "cpl_rendah",
      "judul": "CPL10 di Bawah Threshold",
      "pesan": "CPL10 Anda saat ini 2.6, di bawah...",
      "is_read": false,
      "created_at": "2024-11-20T10:30:00Z"
    }
  ],
  "unread_count": 3
}
```

#### POST /notifikasi/:id/read
Mark notification as read

---

## ERROR RESPONSES

All endpoints return errors in this format:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Total bobot CPMK must equal 100%",
    "details": {
      "field": "cpmk.bobot_persen",
      "current_total": 95
    }
  }
}
```

**Error Codes:**
- `VALIDATION_ERROR`: Input validation failed
- `NOT_FOUND`: Resource not found
- `UNAUTHORIZED`: Authentication required
- `FORBIDDEN`: Insufficient permissions
- `CONFLICT`: Data conflict (duplicate, constraint violation)
- `CALCULATION_ERROR`: CPL calculation failed
- `SERVER_ERROR`: Internal server error

---

## PAGINATION

List endpoints support pagination:

```
GET /api/v1/mahasiswa?page=2&limit=50
```

**Response includes:**
```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "page": 2,
    "limit": 50,
    "total_items": 250,
    "total_pages": 5,
    "has_next": true,
    "has_prev": true
  }
}
```

---

## RATE LIMITING

- Standard: 100 requests/minute per user
- Calculation endpoints: 10 requests/minute
- Export endpoints: 5 requests/minute

**Response Header:**
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 87
X-RateLimit-Reset: 1637251200
```

---

## WEBHOOKS (Optional)

Register webhooks for events:

**Events:**
- `nilai.created`: New grade entered
- `cpl.calculated`: CPL recalculated
- `cpl.threshold_failed`: Student CPL below threshold
- `semester.finalized`: Semester grades finalized

---

## SDK / CLIENT LIBRARIES

```javascript
// JavaScript/TypeScript
import { CPLClient } from '@uingusdur/cpl-sdk';

const client = new CPLClient({
  apiKey: 'your-api-key',
  baseUrl: 'https://api-cpl.uingusdur.ac.id/v1'
});

// Get student CPL
const cplData = await client.mahasiswa.getCPLOverview('25010001');

// Input nilai
await client.nilai.inputBatch(instrumenId, [
  { enrollment_id: 1001, nilai_angka: 85 }
]);
```

```python
# Python
from uingusdur_cpl import CPLClient

client = CPLClient(api_key='your-api-key')

# Get CPL overview
cpl_data = client.mahasiswa.get_cpl_overview('25010001')

# Recalculate
client.nilai.recalculate_enrollment(enrollment_id)
```
