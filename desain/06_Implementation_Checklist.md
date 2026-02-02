# IMPLEMENTATION CHECKLIST & ROADMAP
# Sistem Pengukuran CPL - Program Studi Informatika

## PHASE 1: FOUNDATION (Bulan 1-2)

### Week 1-2: Database Setup
- [ ] Install PostgreSQL 14+
- [ ] Create database dan user
- [ ] Execute schema creation script
- [ ] Create indexes
- [ ] Setup migrations tool (e.g., Flyway, Alembic)
- [ ] Seed master data:
  - [ ] Profil Lulusan (PL1-PL4)
  - [ ] CPL (CPL01-CPL11)
  - [ ] Bahan Kajian (BK01-BK32)
  - [ ] Mata Kuliah (semua MK)
  - [ ] Standard Penilaian (konversi nilai)
  - [ ] Users (seed admin, prodi, dosen) with initial credentials
  - [ ] Prodi master entries (kode_prodi, nama_prodi, ketua_prodi)
- [ ] Create mappings:
  - [ ] PL ↔ CPL
  - [ ] CPL ↔ BK
  - [ ] BK ↔ MK
  - [ ] CPL ↔ MK (dengan status I/R/M/A)
  - [ ] PL ↔ MK

### Week 3-4: Backend Foundation
- [ ] Setup project structure
  - [ ] Choose stack (Node.js/Python/Go)
  - [ ] Setup ORM (Prisma/TypeORM/SQLAlchemy)
  - [ ] Configure environment variables
  - [ ] Setup logging (Winston/Loguru)
- [ ] Implement core services:
  - [ ] Database connection pool
  - [ ] Authentication service (JWT)
  - [ ] Authorization middleware (RBAC)
  - [ ] RBAC roles & scoping enforcement (admin, prodi, dosen)
  - [ ] User management service/endpoints (CRUD, role assignment)
  - [ ] Error handling
  - [ ] Validation layer (Joi/Zod/Pydantic)
- [ ] Setup testing framework
  - [ ] Unit tests
  - [ ] Integration tests
  - [ ] Test database

### Week 5-6: Core API - Curriculum Management
- [ ] Implement endpoints:
  - [ ] GET/POST/PUT/DELETE /profil-lulusan
  - [ ] GET/POST/PUT/DELETE /cpl
  - [ ] GET/POST/PUT/DELETE /bahan-kajian
  - [ ] GET/POST/PUT/DELETE /mata-kuliah
  - [ ] POST /prasyarat-mk
- [ ] Implement mapping endpoints:
  - [ ] POST/GET /mapping/pl-cpl
  - [ ] POST/GET /mapping/cpl-bk
  - [ ] POST/GET /mapping/bk-mk
  - [ ] POST/GET /mapping/cpl-mk
  - [ ] POST/GET /mapping/pl-mk
  - [ ] POST/GET /mapping/subcpkm-cpl
  - [ ] Mapping lifecycle endpoints:
    - [ ] POST /mapping/propose (creates draft mapping)
    - [ ] POST /mapping/:id/prodi_approve
    - [ ] POST /mapping/:id/admin_lock
  - [ ] Audit logs endpoints: GET/POST /audit_logs
- [ ] Add validation logic:
  - [ ] Unique codes (PL, CPL, BK, MK)
  - [ ] Semester range (1-8)
  - [ ] SKS range (1-6)
  - [ ] Circular dependency check (prasyarat)
- [ ] Write unit tests for all endpoints

### Week 7-8: Calculation Engine Core
- [ ] Implement calculation classes:
  - [ ] Sub-CPMK calculator
  - [ ] CPMK calculator
  - [ ] CPL per MK calculator
  - [ ] Aggregate CPL calculator
- [ ] Implement helper functions:
  - [ ] Weighted average
  - [ ] Grade conversion (numeric ↔ letter ↔ GPA)
  - [ ] Achievement status determination
- [ ] Add calculation triggers:
  - [ ] After nilai_instrumen insert/update
  - [ ] Manual recalculation endpoint
- [ ] Write comprehensive tests:
  - [ ] Unit tests for each calculator
  - [ ] Integration tests with sample data
  - [ ] Performance tests (1000+ students)

---

## PHASE 2: LEARNING MANAGEMENT (Bulan 3-4)

### Week 9-10: RPS & CPMK Setup
- [x] Implement CPMK management:
  - [x] POST /mata-kuliah/:id/cpmk
  - [x] GET /mata-kuliah/:id/cpmk
  - [x] PUT /cpmk/:id
  - [x] DELETE /cpmk/:id
  - [ ] POST /cpmk/:id/subcpmk
- [ ] Implement CPMK-CPL mapping:
  - [ ] POST /cpmk-cpl-mapping
  - [ ] Validation: kontribusi_persen total
- [ ] Implement instrumen penilaian:
  - [ ] POST /mata-kuliah/:id/instrumen
  - [ ] GET /mata-kuliah/:id/instrumen
  - [ ] POST /instrumen-subcpmk-mapping
- [ ] Add rubrik penilaian:
  - [ ] POST /instrumen/:id/rubrik
  - [ ] GET /instrumen/:id/rubrik

### Week 11-12: Grade Input System
- [ ] Implement grade input endpoints:
  - [ ] POST /nilai/instrumen/single
  - [ ] POST /nilai/instrumen/batch
  - [ ] PUT /nilai/instrumen/:id
- [ ] Implement Excel / CSV import and templates:
  - [ ] Provide sample CSV/XLSX templates for `scores`, `users`, `courses`
  - [ ] POST /nilai/instrumen/import (with dry-run preview)
  - [ ] Parse Excel/CSV file (xlsx.js/openpyxl)
  - [ ] Validate data before insert (row-level errors)
  - [ ] Return detailed error report with row results
  - [ ] Bulk import endpoints with preview: POST /import/users, POST /import/courses
- [ ] Add validation:
  - [ ] Enrollment exists and active
  - [ ] Nilai range (0-100)
  - [ ] No duplicates
  - [ ] Instrument belongs to MK
- [ ] Trigger automatic calculations:
  - [ ] Queue calculation job
  - [ ] Update Sub-CPMK
  - [ ] Update CPMK
  - [ ] Update CPL per MK
  - [ ] Update aggregate CPL
- [ ] Implement calculation endpoints:
  - [ ] POST /nilai/recalculate/enrollment/:id
  - [ ] POST /nilai/recalculate/mahasiswa/:id
  - [ ] POST /nilai/recalculate/bulk
- [ ] Add logging:
  - [ ] Log all calculations to log_perhitungan_cpl
  - [ ] Audit trail for nilai changes

### Week 13-14: Validation & QA System
- [ ] Implement validation endpoints:
  - [ ] GET /validation/mata-kuliah/:id
    - [ ] Check total bobot CPMK = 100%
    - [ ] Check CPMK mapping to CPL
    - [ ] Check Sub-CPMK coverage in instrumen
    - [ ] Check total bobot instrumen = 100%
  - [ ] GET /validation/curriculum
    - [ ] Check all CPL covered in MK
    - [ ] Check semester distribution
    - [ ] Check I→R→M→A progression
- [ ] Implement data quality checks:
  - [ ] GET /validation/data-quality
    - [ ] Missing grades count
    - [ ] Incomplete CPMK setup
    - [ ] Orphaned records
- [ ] Add automated alerts:
  - [ ] Email notifications for validation failures
  - [ ] Dashboard warnings

---

## PHASE 3: STUDENT VIEWS & ANALYTICS (Bulan 5-6)

### Week 15-16: Student Dashboard API
- [ ] Implement mahasiswa endpoints:
  - [ ] GET /mahasiswa/:id/cpl/overview
  - [ ] GET /mahasiswa/:id/cpl/:cpl_id/detail
  - [ ] GET /mahasiswa/:id/rekomendasi
  - [ ] GET /mahasiswa/:id/timeline
- [ ] Implement enrollment tracking:
  - [ ] GET /mahasiswa/:id/enrollment
  - [ ] POST /enrollment (KRS)
  - [ ] PUT /enrollment/:id/finalize
- [ ] Add notification system:
  - [ ] GET /mahasiswa/:id/notifikasi
  - [ ] POST /notifikasi/:id/read
  - [ ] Trigger notifications:
    - [ ] CPL below threshold
    - [ ] New grade posted
    - [ ] Semester finalized

### Week 17-18: Analytics & Reporting
- [ ] Implement analytics endpoints:
  - [ ] GET /analytics/cpl/aggregate
    - [ ] Filter by angkatan
    - [ ] Filter by konsentrasi
    - [ ] Group by kategori CPL
  - [ ] GET /analytics/cpl/trends
    - [ ] Multi-year comparison
    - [ ] CPL progression over time
  - [ ] GET /analytics/mata-kuliah/:id/impact
    - [ ] CPL contributions
    - [ ] CPMK performance
    - [ ] Student distribution
  - [ ] GET /analytics/cohort/:angkatan
- [ ] Implement export endpoints:
  - [ ] GET /export/transkrip-cpl/:mahasiswa_id (PDF)
  - [ ] GET /export/matrix/cpl-mk (Excel)
  - [ ] GET /export/laporan-prodi (PDF)
  - [ ] GET /export/laporan-akreditasi (Excel)
- [ ] Use libraries:
  - [ ] PDF: pdfkit / ReportLab
  - [ ] Excel: exceljs / openpyxl
  - [ ] Charts: Chart.js (server-side)

### Week 19-20: Caching & Performance
- [ ] Setup Redis cache:
  - [ ] Cache mahasiswa CPL overview (TTL: 1 hour)
  - [ ] Cache analytics aggregate (TTL: 24 hours)
  - [ ] Cache matrix views (TTL: 6 hours)
- [ ] Implement cache invalidation:
  - [ ] On nilai update → invalidate student cache
  - [ ] On finalization → invalidate all related
- [ ] Add database optimizations:
  - [ ] Materialized views for analytics
  - [ ] Partial indexes for active records
  - [ ] Query optimization (EXPLAIN ANALYZE)
- [ ] Setup queue system (Bull/Celery):
  - [ ] Async calculation jobs
  - [ ] Bulk recalculation
  - [ ] Report generation
- [ ] Load testing:
  - [ ] Test with 1000+ concurrent users
  - [ ] Optimize slow queries
  - [ ] Add connection pooling

---

## PHASE 4: FRONTEND DEVELOPMENT (Bulan 7-9)

### Week 21-24: Frontend Foundation
- [ ] Setup React/Vue project:
  - [ ] TypeScript configuration
  - [ ] Routing (React Router/Vue Router)
  - [ ] State management (Redux/Zustand/Pinia)
  - [ ] API client (Axios/Fetch)
- [ ] Setup UI library:
  - [ ] Install Ant Design/Material-UI/Shadcn
  - [ ] Configure theme
  - [ ] Create design tokens
 - [ ] Role-aware layout and navigation
   - [ ] Sidebar visibility filtered by role (admin/prodi/dosen)
   - [ ] Program (Prodi) scoping in UI components and filters
- [ ] Implement authentication:
  - [ ] Login page
  - [ ] JWT storage (httpOnly cookies)
  - [ ] Auto-refresh tokens
  - [ ] Protected routes
- [ ] Create layout components:
  - [ ] Header with navigation
  - [ ] Sidebar menu
  - [ ] Footer
  - [ ] Responsive container

### Week 25-28: Dosen Interface
- [ ] Dashboard overview:
  - [ ] Course list
  - [ ] Assessment progress cards
  - [ ] Quick stats
- [ ] CPMK setup wizard:
  - [ ] Step 1: Create CPMK
  - [ ] Step 2: Map to CPL (drag & drop)
  - [ ] Step 3: Create Sub-CPMK
  - [ ] Step 4: Review & validate
- [ ] Assessment instruments:
  - [ ] Create instrument form
  - [ ] Map to Sub-CPMK
  - [ ] Upload rubrik (optional)
- [ ] Grade input interface:
  - [ ] Table view with inline editing
  - [ ] Excel import with preview
  - [ ] Batch save with progress
  - [ ] Real-time CPL delta preview
- [ ] Dosen: ability to create mapping proposals (draft) for Prodi review
- [ ] Visualization:
  - [ ] Class distribution chart
  - [ ] CPMK performance bars
  - [ ] CPL impact per student

### Week 29-32: Mahasiswa Interface
- [ ] Dashboard:
  - [ ] CPL radar chart (Recharts/Chart.js)
  - [ ] Summary cards
  - [ ] Alerts for weak CPL
- [ ] CPL detail page:
  - [ ] Timeline chart
  - [ ] Course contributions table
  - [ ] CPMK breakdown tree
  - [ ] Download transcript button
- [ ] Course view:
  - [ ] Enrollment history
  - [ ] Grades per assessment
  - [ ] CPL progress in course
- [ ] Recommendations:
  - [ ] Weak CPL identification
  - [ ] Suggested courses
  - [ ] Graduation forecast

### Week 33-36: Kaprodi Interface
- [ ] Analytics dashboard:
  - [ ] KPI cards
  - [ ] CPL category bars
  - [ ] Trend line charts (multi-year)
  - [ ] Heatmap (CPL vs Angkatan)
- [ ] Course impact analysis:
  - [ ] Select course dropdown
  - [ ] CPL contribution chart
  - [ ] CPMK performance
  - [ ] Recommendations panel
- [ ] Cohort comparison:
  - [ ] Select multiple angkatan
  - [ ] Side-by-side comparison
  - [ ] Statistical tests (t-test)
- [ ] Export tools:
  - [ ] PDF report generator
  - [ ] Excel data export
  - [ ] Presentation slides (pptx)
 - [ ] Prodi: Mapping approval UI (list of proposals, approve/reject with comments)
 - [ ] Admin: Management pages for `Users` and `Prodi` (CRUD with role assignment)

---

## PHASE 5: TESTING & DEPLOYMENT (Bulan 10-11)

### Week 37-38: Comprehensive Testing
- [ ] Backend testing:
  - [ ] Unit tests coverage ≥ 80%
  - [ ] Integration tests for all flows
  - [ ] API contract tests (Pact)
  - [ ] Load tests (k6/Locust)
- [ ] Frontend testing:
  - [ ] Unit tests (Jest/Vitest)
  - [ ] Component tests (React Testing Library)
  - [ ] E2E tests (Playwright/Cypress)
    - [ ] Dosen flow: Setup CPMK → Input nilai → View results
    - [ ] Mahasiswa flow: View dashboard → Detail CPL
    - [ ] Kaprodi flow: Analytics → Export
- [ ] Data validation:
  - [ ] Import real data from existing system
  - [ ] Verify calculation accuracy
  - [ ] Compare with manual calculations

### Week 39-40: User Acceptance Testing (UAT)
- [ ] Prepare UAT environment:
  - [ ] Copy production-like data
  - [ ] Create test users (dosen, mahasiswa, kaprodi)
- [ ] Conduct UAT sessions:
  - [ ] Session 1: Dosen (5-10 users)
  - [ ] Session 2: Mahasiswa (20-30 users)
  - [ ] Session 3: Kaprodi & Admin (3-5 users)
- [ ] Collect feedback:
  - [ ] Bug reports
  - [ ] Feature requests
  - [ ] UX improvements
- [ ] Fix critical issues
- [ ] Iterate and re-test

### Week 41-42: Deployment Preparation
- [ ] Setup production infrastructure:
  - [ ] Web server (Nginx/Apache)
  - [ ] Application server (PM2/Gunicorn)
  - [ ] Database server (PostgreSQL)
  - [ ] Redis cache server
  - [ ] Queue worker (Bull/Celery)
- [ ] Configure CI/CD pipeline:
  - [ ] GitHub Actions / GitLab CI
  - [ ] Automated tests on PR
  - [ ] Automated deployment to staging
  - [ ] Manual approval for production
- [ ] Setup monitoring:
  - [ ] Application monitoring (Sentry)
  - [ ] Server monitoring (Prometheus + Grafana)
  - [ ] Database monitoring (pg_stat_statements)
  - [ ] Uptime monitoring (UptimeRobot)
- [ ] Security hardening:
  - [ ] SSL/TLS certificates
  - [ ] Rate limiting
  - [ ] SQL injection prevention
  - [ ] XSS protection
  - [ ] CSRF tokens
  - [ ] Input sanitization
- [ ] Backup strategy:
  - [ ] Daily database backups
  - [ ] Backup retention: 30 days
  - [ ] Test restore procedure

### Week 43-44: Production Deployment
- [ ] Pre-deployment checklist:
  - [ ] All tests passing
  - [ ] UAT sign-off
  - [ ] Backup current system
  - [ ] Deployment runbook ready
- [ ] Deploy to production:
  - [ ] Database migration
  - [ ] Data import
  - [ ] Application deployment
  - [ ] Smoke tests
- [ ] Post-deployment verification:
  - [ ] All endpoints responding
  - [ ] Calculations accurate
  - [ ] Performance acceptable
  - [ ] No critical errors in logs
- [ ] User training:
  - [ ] Dosen workshop (2 hours)
  - [ ] Mahasiswa tutorial video
  - [ ] Kaprodi demo session
  - [ ] Documentation site
- [ ] Go-live announcement:
  - [ ] Email to all users
  - [ ] Banner in old system
  - [ ] Support channel info

---

## PHASE 6: MAINTENANCE & ENHANCEMENT (Ongoing)

### Month 12+: Continuous Improvement
- [ ] Monitor system health:
  - [ ] Daily error log review
  - [ ] Weekly performance metrics
  - [ ] Monthly usage analytics
- [ ] Collect user feedback:
  - [ ] In-app feedback form
  - [ ] Quarterly survey
  - [ ] User interviews
- [ ] Implement enhancements:
  - [ ] Feature requests (prioritized)
  - [ ] UX improvements
  - [ ] Performance optimizations
- [ ] Regular maintenance:
  - [ ] Security patches
  - [ ] Dependency updates
  - [ ] Database optimization
  - [ ] Backup verification
- [ ] Plan v2.0 features:
  - [ ] Predictive analytics (ML)
  - [ ] Mobile app
  - [ ] API for external systems
  - [ ] Peer comparison
  - [ ] Digital badges

---

## RESOURCES NEEDED

### Team Structure
```
Product Owner (1)
├─ Backend Team (2-3)
│  ├─ Lead Backend Engineer
│  ├─ Backend Engineer
│  └─ DevOps Engineer (part-time)
├─ Frontend Team (2)
│  ├─ Lead Frontend Engineer
│  └─ Frontend Engineer
├─ QA Team (1-2)
│  ├─ QA Engineer
│  └─ Manual Tester (part-time)
└─ UI/UX Designer (1, part-time)
```

### Infrastructure
- Database server: PostgreSQL 14+ (4 vCPU, 8GB RAM)
- Application server: 2x (4 vCPU, 8GB RAM)
- Redis cache: 1x (2 vCPU, 4GB RAM)
- Storage: 100GB SSD
- Bandwidth: 1TB/month
- SSL certificate
- Domain name

### Software Licenses
- None (all open-source stack recommended)
- Optional: Monitoring tools (Sentry, Datadog)

### Budget Estimate (Illustrative)
- Development: 6-9 months × Team cost
- Infrastructure: $200-500/month
- Monitoring tools: $50-100/month
- Training & documentation: 1-2 weeks

---

## SUCCESS CRITERIA

### Technical Metrics
- [ ] API response time < 200ms (p95)
- [ ] Database query time < 50ms (p95)
- [ ] Calculation accuracy: 100%
- [ ] Uptime: 99.5%+
- [ ] Test coverage: ≥80%

### User Metrics
- [ ] Dosen adoption: ≥90% within 1 month
- [ ] Mahasiswa login rate: ≥70% per month
- [ ] User satisfaction: ≥4.0/5.0
- [ ] Support tickets: <10 per week after month 2

### Business Metrics
- [ ] Replace manual CPL tracking
- [ ] Reduce time to generate transcripts: from days to seconds
- [ ] Enable data-driven curriculum improvement
- [ ] Support accreditation with automated reports

---

## CURRENT IMPLEMENTATION STATUS (Updated: January 31, 2026)

### ✅ COMPLETED FEATURES
- [x] **Database Setup**: PostgreSQL with Prisma ORM
- [x] **Authentication**: NextAuth.js with JWT and role-based access
- [x] **User Management**: Admin, Prodi, Dosen, Mahasiswa roles
- [x] **Dashboard Layout**: Responsive layout with sidebar navigation
- [x] **Profil Lulusan CRUD**: Complete management interface
- [x] **CPL CRUD**: Complete management interface with validation
- [x] **CPMK CRUD**: Complete management interface with mata kuliah relation
- [x] **API Endpoints**: RESTful APIs for all CRUD operations
- [x] **Role-based Access Control**: Proper authorization for all endpoints
- [x] **Data Seeding**: Master data populated for testing

### 🔄 IN PROGRESS
- [ ] **CPMK-CPL Mapping**: Relationship management between CPMK and CPL
- [ ] **Sub-CPMK Management**: Detailed learning outcomes breakdown
- [ ] **Assessment Instruments**: Rubrics and evaluation tools
- [ ] **Grade Input System**: Student performance data entry
- [ ] **Reporting System**: Analytics and accreditation reports

### 📋 NEXT PRIORITIES
1. Implement CPMK-CPL mapping interface
2. Add Sub-CPMK management
3. Create assessment instrument setup
4. Build grade input workflows
5. Develop reporting dashboards

---

## RISK MITIGATION

| Risk | Impact | Mitigation |
|------|--------|------------|
| Data migration errors | High | Extensive testing, parallel run |
| Performance issues with 1000+ users | High | Load testing, caching, optimization |
| User resistance to new system | Medium | Training, gradual rollout, support |
| Calculation bugs | High | Comprehensive testing, manual verification |
| Server downtime | Medium | Redundancy, monitoring, quick restore |
| Security breach | High | Security audit, penetration testing |

---

## DECISION LOG

| Date | Decision | Rationale | Owner |
|------|----------|-----------|-------|
| TBD | Database: PostgreSQL | Robust, supports JSON, good performance | Backend Lead |
| TBD | Backend: Node.js/Python | Team expertise, large ecosystem | Backend Lead |
| TBD | Frontend: React | Popular, good ecosystem, TypeScript support | Frontend Lead |
| TBD | UI Library: Ant Design | Comprehensive, professional look | UI/UX Designer |
| TBD | Calculation method: Weighted by status | Best reflects OBE philosophy | Product Owner |

---

## CONTACT & SUPPORT

**Project Manager**: [Name]
**Email**: [email]
**Slack Channel**: #cpl-system
**Documentation**: https://docs.cpl.uingusdur.ac.id
**Issue Tracker**: https://github.com/uingusdur/cpl-system/issues

---

**Last Updated**: [Date]
**Version**: 1.0
