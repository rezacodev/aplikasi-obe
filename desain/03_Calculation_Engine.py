"""
==============================================================================
CALCULATION ENGINE: CPL MEASUREMENT SYSTEM
Program Studi Informatika - UIN K.H. Abdurrahman Wahid Pekalongan
Python Implementation with PostgreSQL
==============================================================================
"""

from decimal import Decimal, ROUND_HALF_UP
from typing import List, Dict, Optional, Tuple
from dataclasses import dataclass
from datetime import datetime
import json


@dataclass
class WeightedValue:
    """Represents a weighted value in calculations"""
    value: Decimal
    weight: Decimal
    
    def contribution(self) -> Decimal:
        """Calculate weighted contribution"""
        return self.value * self.weight


class CPLCalculationEngine:
    """
    Main engine for calculating CPL achievements
    Implements OBE calculation formulas
    """
    
    def __init__(self, db_connection):
        self.db = db_connection
        self.precision = Decimal('0.01')  # 2 decimal places
    
    # =========================================================================
    # LEVEL 1: Sub-CPMK Calculation
    # =========================================================================
    
    def calculate_subcpmk_from_instruments(
        self, 
        enrollment_id: int, 
        sub_cpmk_id: int
    ) -> Decimal:
        """
        Calculate Sub-CPMK value from multiple assessment instruments
        
        Formula:
        NilaiSubCPMK = Σ(NilaiInstrumen × BobotInstrumen) / Σ(BobotInstrumen)
        
        Example:
        Sub-CPMK1 assessed in:
        - Quiz: 80 (weight 20%)
        - UTS: 85 (weight 30%)
        Result = (80×20 + 85×30) / (20+30) = 83
        """
        query = """
            SELECT 
                ni.nilai_angka,
                ism.bobot_soal_persen as bobot
            FROM nilai_instrumen ni
            JOIN instrumen_penilaian ip ON ni.instrumen_id = ip.id
            JOIN instrumen_subcpmk_mapping ism ON ip.id = ism.instrumen_id
            WHERE ni.enrollment_id = %s 
              AND ism.sub_cpmk_id = %s
              AND ni.nilai_angka IS NOT NULL
        """
        
        results = self.db.execute(query, (enrollment_id, sub_cpmk_id))
        
        if not results:
            return None
        
        total_weighted = Decimal('0')
        total_weight = Decimal('0')
        
        for row in results:
            nilai = Decimal(str(row['nilai_angka']))
            bobot = Decimal(str(row['bobot']))
            
            total_weighted += nilai * bobot
            total_weight += bobot
        
        if total_weight == 0:
            return None
        
        result = (total_weighted / total_weight).quantize(self.precision, ROUND_HALF_UP)
        
        # Update database
        self._save_subcpmk_value(enrollment_id, sub_cpmk_id, result, len(results))
        
        return result
    
    def _save_subcpmk_value(
        self, 
        enrollment_id: int, 
        sub_cpmk_id: int, 
        nilai: Decimal,
        jumlah_instrumen: int
    ):
        """Save calculated Sub-CPMK value"""
        status = self._get_achievement_status(nilai)
        
        query = """
            INSERT INTO nilai_subcpmk (
                enrollment_id, sub_cpmk_id, nilai_kumulatif, 
                jumlah_instrumen, status_pencapaian, last_calculated
            ) VALUES (%s, %s, %s, %s, %s, NOW())
            ON CONFLICT (enrollment_id, sub_cpmk_id) 
            DO UPDATE SET 
                nilai_kumulatif = EXCLUDED.nilai_kumulatif,
                jumlah_instrumen = EXCLUDED.jumlah_instrumen,
                status_pencapaian = EXCLUDED.status_pencapaian,
                last_calculated = NOW()
        """
        
        self.db.execute(query, (enrollment_id, sub_cpmk_id, nilai, jumlah_instrumen, status))
    
    # =========================================================================
    # LEVEL 2: CPMK Calculation
    # =========================================================================
    
    def calculate_cpmk_from_subcpmk(
        self, 
        enrollment_id: int, 
        cpmk_id: int
    ) -> Decimal:
        """
        Calculate CPMK value from Sub-CPMKs
        
        Formula:
        NilaiCPMK = Σ(NilaiSubCPMK × BobotSubCPMK) / 100
        
        Example:
        CPMK1 has 3 Sub-CPMKs:
        - Sub1: 85 (weight 30%)
        - Sub2: 90 (weight 40%)
        - Sub3: 80 (weight 30%)
        Result = (85×0.3 + 90×0.4 + 80×0.3) = 85.5
        """
        query = """
            SELECT 
                ns.nilai_kumulatif,
                sc.bobot_persen
            FROM nilai_subcpmk ns
            JOIN sub_cpmk sc ON ns.sub_cpmk_id = sc.id
            WHERE ns.enrollment_id = %s 
              AND sc.cpmk_id = %s
              AND ns.nilai_kumulatif IS NOT NULL
        """
        
        results = self.db.execute(query, (enrollment_id, cpmk_id))
        
        if not results:
            return None
        
        weighted_values = [
            WeightedValue(
                value=Decimal(str(row['nilai_kumulatif'])),
                weight=Decimal(str(row['bobot_persen'])) / 100
            )
            for row in results
        ]
        
        result = self._weighted_average(weighted_values)
        
        # Update database
        self._save_cpmk_value(enrollment_id, cpmk_id, result)
        
        return result
    
    def _save_cpmk_value(
        self, 
        enrollment_id: int, 
        cpmk_id: int, 
        nilai: Decimal
    ):
        """Save calculated CPMK value"""
        status = self._get_achievement_status(nilai)
        
        query = """
            INSERT INTO nilai_cpmk (
                enrollment_id, cpmk_id, nilai_kumulatif, 
                status_pencapaian, last_calculated
            ) VALUES (%s, %s, %s, %s, NOW())
            ON CONFLICT (enrollment_id, cpmk_id) 
            DO UPDATE SET 
                nilai_kumulatif = EXCLUDED.nilai_kumulatif,
                status_pencapaian = EXCLUDED.status_pencapaian,
                last_calculated = NOW()
        """
        
        self.db.execute(query, (enrollment_id, cpmk_id, nilai, status))
    
    # =========================================================================
    # LEVEL 3: CPL per Mata Kuliah
    # =========================================================================
    
    def calculate_cpl_from_mk(
        self, 
        enrollment_id: int, 
        cpl_id: int,
        mata_kuliah_id: int
    ) -> Optional[Decimal]:
        """
        Calculate CPL achievement in a specific course
        
        Formula:
        1. Get all CPMKs that contribute to this CPL
        2. For each CPMK: contribution = NilaiCPMK × KontribusiPersen
        3. NilaiCPL_dalam_MK = Σ(contributions) / Σ(KontribusiPersen) × 100
        
        Example:
        In one course:
        - CPMK1 (nilai 85.5) → CPL04 (60%): contribution = 51.3
        - CPMK2 (nilai 75.0) → CPL04 (40%): contribution = 30.0
        Result = (51.3 + 30.0) / (60 + 40) × 100 = 81.3
        """
        query = """
            SELECT 
                nc.nilai_kumulatif as nilai_cpmk,
                ccm.kontribusi_persen
            FROM nilai_cpmk nc
            JOIN cpmk c ON nc.cpmk_id = c.id
            JOIN cpmk_cpl_mapping ccm ON c.id = ccm.cpmk_id
            WHERE nc.enrollment_id = %s 
              AND ccm.cpl_id = %s
              AND c.mata_kuliah_id = %s
              AND nc.nilai_kumulatif IS NOT NULL
        """
        
        results = self.db.execute(query, (enrollment_id, cpl_id, mata_kuliah_id))
        
        if not results:
            return None
        
        total_contribution = Decimal('0')
        total_percent = Decimal('0')
        
        for row in results:
            nilai_cpmk = Decimal(str(row['nilai_cpmk']))
            kontribusi = Decimal(str(row['kontribusi_persen']))
            
            total_contribution += nilai_cpmk * kontribusi
            total_percent += kontribusi
        
        if total_percent == 0:
            return None
        
        # Normalize to 0-100 scale
        result = (total_contribution / total_percent).quantize(self.precision, ROUND_HALF_UP)
        
        # Get CPL-MK mapping status (I/R/M/A)
        status_query = """
            SELECT status, bobot_status, semester_target
            FROM cpl_mk_mapping
            WHERE cpl_id = %s AND mata_kuliah_id = %s
        """
        mapping = self.db.execute_one(status_query, (cpl_id, mata_kuliah_id))
        
        # Save to database
        self._save_cpl_per_mk(
            enrollment_id, cpl_id, mata_kuliah_id, result, 
            mapping['status'] if mapping else 'R',
            Decimal(str(mapping['bobot_status'])) if mapping else Decimal('1.0')
        )
        
        return result
    
    def _save_cpl_per_mk(
        self, 
        enrollment_id: int,
        cpl_id: int,
        mata_kuliah_id: int,
        nilai: Decimal,
        status: str,
        bobot: Decimal
    ):
        """Save CPL achievement per course"""
        # Get enrollment details
        enroll_query = """
            SELECT mahasiswa_id, semester_tahun
            FROM enrollment e
            JOIN mata_kuliah mk ON e.mata_kuliah_id = mk.id
            WHERE e.id = %s
        """
        enroll_data = self.db.execute_one(enroll_query, (enrollment_id,))
        
        mk_query = "SELECT sks FROM mata_kuliah WHERE id = %s"
        mk_data = self.db.execute_one(mk_query, (mata_kuliah_id,))
        
        query = """
            INSERT INTO capaian_cpl_per_mk (
                enrollment_id, mahasiswa_id, cpl_id, mata_kuliah_id,
                nilai_kontribusi, status_dalam_mk, semester_tahun,
                sks_mk, bobot_status, last_calculated
            ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, NOW())
            ON CONFLICT (enrollment_id, cpl_id)
            DO UPDATE SET
                nilai_kontribusi = EXCLUDED.nilai_kontribusi,
                status_dalam_mk = EXCLUDED.status_dalam_mk,
                last_calculated = NOW()
        """
        
        self.db.execute(query, (
            enrollment_id,
            enroll_data['mahasiswa_id'],
            cpl_id,
            mata_kuliah_id,
            nilai,
            status,
            enroll_data['semester_tahun'],
            mk_data['sks'],
            bobot
        ))
    
    # =========================================================================
    # LEVEL 4: CPL Aggregate (Student Level)
    # =========================================================================
    
    def calculate_aggregate_cpl(
        self, 
        mahasiswa_id: int, 
        cpl_id: int,
        method: str = 'weighted_by_status'  # 'simple', 'weighted_by_sks', 'weighted_by_status', 'last_assessment'
    ) -> Optional[Decimal]:
        """
        Calculate aggregate CPL achievement for a student
        
        Methods:
        1. Simple Average: NilaiCPL = Σ(NilaiCPL_MK) / JumlahMK
        2. Weighted by SKS: NilaiCPL = Σ(NilaiCPL_MK × SKS) / Σ(SKS)
        3. Weighted by Status (RECOMMENDED): 
           - I = 0.5, R = 1.0, M = 1.5, A = 2.0
           - NilaiCPL = Σ(NilaiCPL_MK × Bobot) / Σ(Bobot)
        4. Last Assessment: Only use MK with status 'A'
        """
        query = """
            SELECT 
                nilai_kontribusi,
                status_dalam_mk,
                sks_mk,
                bobot_status
            FROM capaian_cpl_per_mk ccpm
            JOIN enrollment e ON ccpm.enrollment_id = e.id
            WHERE ccpm.mahasiswa_id = %s 
              AND ccpm.cpl_id = %s
              AND e.status IN ('lulus', 'aktif')
              AND ccpm.nilai_kontribusi IS NOT NULL
        """
        
        results = self.db.execute(query, (mahasiswa_id, cpl_id))
        
        if not results:
            return None
        
        if method == 'simple':
            values = [Decimal(str(row['nilai_kontribusi'])) for row in results]
            result = sum(values) / len(values)
        
        elif method == 'weighted_by_sks':
            weighted_values = [
                WeightedValue(
                    value=Decimal(str(row['nilai_kontribusi'])),
                    weight=Decimal(str(row['sks_mk']))
                )
                for row in results
            ]
            result = self._weighted_average(weighted_values)
        
        elif method == 'weighted_by_status':
            weighted_values = [
                WeightedValue(
                    value=Decimal(str(row['nilai_kontribusi'])),
                    weight=Decimal(str(row['bobot_status']))
                )
                for row in results
            ]
            result = self._weighted_average(weighted_values)
        
        elif method == 'last_assessment':
            assessed = [
                Decimal(str(row['nilai_kontribusi'])) 
                for row in results 
                if row['status_dalam_mk'] == 'A'
            ]
            if not assessed:
                return None
            result = sum(assessed) / len(assessed)
        
        else:
            raise ValueError(f"Unknown calculation method: {method}")
        
        # Convert to 4.0 scale
        result_4scale = (result / Decimal('25')).quantize(self.precision, ROUND_HALF_UP)
        
        # Get threshold for this CPL
        threshold_query = "SELECT nilai_minimum_kelulusan FROM cpl WHERE id = %s"
        threshold_data = self.db.execute_one(threshold_query, (cpl_id,))
        threshold = Decimal(str(threshold_data['nilai_minimum_kelulusan']))
        
        # Determine status
        status = self._get_cpl_status(results)
        is_passing = result_4scale >= threshold
        
        # Save aggregate
        self._save_aggregate_cpl(
            mahasiswa_id, cpl_id, result_4scale, 
            len(results), sum(int(r['sks_mk']) for r in results),
            status, is_passing
        )
        
        return result_4scale
    
    def _save_aggregate_cpl(
        self,
        mahasiswa_id: int,
        cpl_id: int,
        nilai: Decimal,
        jumlah_mk: int,
        total_sks: int,
        status: str,
        is_passing: bool
    ):
        """Save aggregate CPL achievement"""
        # Get current semester
        semester_query = """
            SELECT semester_tahun 
            FROM enrollment 
            WHERE mahasiswa_id = %s 
            ORDER BY tanggal_daftar DESC 
            LIMIT 1
        """
        semester_data = self.db.execute_one(semester_query, (mahasiswa_id,))
        
        query = """
            INSERT INTO capaian_cpl_mahasiswa (
                mahasiswa_id, cpl_id, nilai_kumulatif,
                jumlah_mk_berkontribusi, total_sks_berkontribusi,
                status_pencapaian, is_memenuhi_standard,
                semester_terakhir_update, last_calculated
            ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, NOW())
            ON CONFLICT (mahasiswa_id, cpl_id)
            DO UPDATE SET
                nilai_kumulatif = EXCLUDED.nilai_kumulatif,
                jumlah_mk_berkontribusi = EXCLUDED.jumlah_mk_berkontribusi,
                total_sks_berkontribusi = EXCLUDED.total_sks_berkontribusi,
                status_pencapaian = EXCLUDED.status_pencapaian,
                is_memenuhi_standard = EXCLUDED.is_memenuhi_standard,
                semester_terakhir_update = EXCLUDED.semester_terakhir_update,
                last_calculated = NOW()
        """
        
        self.db.execute(query, (
            mahasiswa_id, cpl_id, nilai, jumlah_mk, total_sks,
            status, is_passing, semester_data['semester_tahun'] if semester_data else None
        ))
    
    # =========================================================================
    # COMPLETE RECALCULATION PIPELINE
    # =========================================================================
    
    def recalculate_all_for_enrollment(self, enrollment_id: int):
        """
        Complete recalculation pipeline for an enrollment
        Triggered when new grade is entered or updated
        """
        # Get enrollment details
        query = """
            SELECT e.mahasiswa_id, e.mata_kuliah_id
            FROM enrollment e
            WHERE e.id = %s
        """
        enrollment = self.db.execute_one(query, (enrollment_id,))
        
        if not enrollment:
            raise ValueError(f"Enrollment {enrollment_id} not found")
        
        mahasiswa_id = enrollment['mahasiswa_id']
        mata_kuliah_id = enrollment['mata_kuliah_id']
        
        # Step 1: Calculate all Sub-CPMKs
        subcpmk_query = """
            SELECT DISTINCT sc.id as sub_cpmk_id
            FROM sub_cpmk sc
            JOIN cpmk c ON sc.cpmk_id = c.id
            WHERE c.mata_kuliah_id = %s
        """
        subcpmks = self.db.execute(subcpmk_query, (mata_kuliah_id,))
        
        for row in subcpmks:
            self.calculate_subcpmk_from_instruments(enrollment_id, row['sub_cpmk_id'])
        
        # Step 2: Calculate all CPMKs
        cpmk_query = """
            SELECT id as cpmk_id
            FROM cpmk
            WHERE mata_kuliah_id = %s
        """
        cpmks = self.db.execute(cpmk_query, (mata_kuliah_id,))
        
        for row in cpmks:
            self.calculate_cpmk_from_subcpmk(enrollment_id, row['cpmk_id'])
        
        # Step 3: Calculate CPL per MK
        cpl_query = """
            SELECT DISTINCT cpl_id
            FROM cpl_mk_mapping
            WHERE mata_kuliah_id = %s
        """
        cpls = self.db.execute(cpl_query, (mata_kuliah_id,))
        
        for row in cpls:
            self.calculate_cpl_from_mk(enrollment_id, row['cpl_id'], mata_kuliah_id)
        
        # Step 4: Recalculate aggregate CPL for student
        all_cpls_query = "SELECT id as cpl_id FROM cpl WHERE status_aktif = TRUE"
        all_cpls = self.db.execute(all_cpls_query)
        
        for row in all_cpls:
            self.calculate_aggregate_cpl(mahasiswa_id, row['cpl_id'])
        
        print(f"✓ Recalculation complete for enrollment {enrollment_id}")
    
    def recalculate_all_for_student(self, mahasiswa_id: int):
        """
        Recalculate all CPL achievements for a student
        Use for semester finalization or data correction
        """
        # Get all enrollments
        query = """
            SELECT id as enrollment_id
            FROM enrollment
            WHERE mahasiswa_id = %s
              AND status IN ('lulus', 'aktif')
        """
        enrollments = self.db.execute(query, (mahasiswa_id,))
        
        for row in enrollments:
            self.recalculate_all_for_enrollment(row['enrollment_id'])
        
        print(f"✓ Complete recalculation for mahasiswa {mahasiswa_id}")
    
    # =========================================================================
    # UTILITY METHODS
    # =========================================================================
    
    def _weighted_average(self, weighted_values: List[WeightedValue]) -> Decimal:
        """Calculate weighted average"""
        if not weighted_values:
            return None
        
        total_weighted = sum(wv.contribution() for wv in weighted_values)
        total_weight = sum(wv.weight for wv in weighted_values)
        
        if total_weight == 0:
            return None
        
        return (total_weighted / total_weight).quantize(self.precision, ROUND_HALF_UP)
    
    def _get_achievement_status(self, nilai: Decimal) -> str:
        """Get achievement status from score"""
        if nilai >= 85:
            return 'sangat_baik'
        elif nilai >= 70:
            return 'baik'
        elif nilai >= 55:
            return 'cukup'
        else:
            return 'kurang'
    
    def _get_cpl_status(self, cpl_per_mk_results: List[Dict]) -> str:
        """Determine CPL status based on I/R/M/A distribution"""
        statuses = [row['status_dalam_mk'] for row in cpl_per_mk_results]
        
        if 'A' in statuses:
            return 'assessed'
        elif 'M' in statuses:
            return 'master'
        elif 'R' in statuses:
            return 'reinforce'
        elif 'I' in statuses:
            return 'introduce'
        else:
            return 'belum_dimulai'
    
    def convert_to_letter_grade(self, nilai: Decimal) -> str:
        """Convert numeric score to letter grade"""
        if nilai >= 85:
            return 'A'
        elif nilai >= 80:
            return 'A-'
        elif nilai >= 75:
            return 'B+'
        elif nilai >= 70:
            return 'B'
        elif nilai >= 65:
            return 'B-'
        elif nilai >= 60:
            return 'C+'
        elif nilai >= 55:
            return 'C'
        elif nilai >= 50:
            return 'D'
        else:
            return 'E'
    
    def convert_to_gpa(self, grade: str) -> Decimal:
        """Convert letter grade to GPA (4.0 scale)"""
        conversion = {
            'A': Decimal('4.00'),
            'A-': Decimal('3.75'),
            'B+': Decimal('3.50'),
            'B': Decimal('3.00'),
            'B-': Decimal('2.75'),
            'C+': Decimal('2.50'),
            'C': Decimal('2.00'),
            'D': Decimal('1.00'),
            'E': Decimal('0.00')
        }
        return conversion.get(grade, Decimal('0.00'))


# =============================================================================
# USAGE EXAMPLES
# =============================================================================

if __name__ == "__main__":
    # Example: Calculate when new grade is entered
    
    # Initialize engine (pseudo-code)
    # db = DatabaseConnection()
    # engine = CPLCalculationEngine(db)
    
    # Scenario 1: Dosen input nilai UTS
    # enrollment_id = 123
    # instrumen_id = 456
    # nilai = 85
    
    # 1. Save nilai
    # db.execute("""
    #     INSERT INTO nilai_instrumen (enrollment_id, instrumen_id, nilai_angka)
    #     VALUES (%s, %s, %s)
    # """, (enrollment_id, instrumen_id, nilai))
    
    # 2. Trigger recalculation
    # engine.recalculate_all_for_enrollment(enrollment_id)
    
    # Scenario 2: Finalisasi semester
    # mahasiswa_id = 25010001
    # engine.recalculate_all_for_student(mahasiswa_id)
    
    # Scenario 3: Get CPL dashboard data
    # cpl_data = db.execute("""
    #     SELECT * FROM v_student_cpl_dashboard
    #     WHERE mahasiswa_id = %s
    # """, (mahasiswa_id,))
    
    pass
