import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import type { Session } from "next-auth"

export { authOptions }

export async function getServerAuthSession() {
  return await getServerSession(authOptions)
}

export function hasRole(session: Session | null, role: string): boolean {
  return session?.user?.roles?.includes(role) || false
}

export function hasPermission(session: Session | null, permission: string): boolean {
  return session?.user?.permissions?.includes(permission) || false
}

export function hasAnyRole(session: Session | null, roles: string[]): boolean {
  return roles.some(role => hasRole(session, role))
}

export function hasAnyPermission(session: Session | null, permissions: string[]): boolean {
  return permissions.some(permission => hasPermission(session, permission))
}

export function isAdmin(session: Session | null): boolean {
  return hasRole(session, 'admin')
}

export function isLecturer(session: Session | null): boolean {
  return hasRole(session, 'lecturer')
}

export function isStudent(session: Session | null): boolean {
  return hasRole(session, 'student')
}

// Permission groups for common checks
export const PERMISSIONS = {
  // User management
  USER_VIEW: 'user.view',
  USER_CREATE: 'user.create',
  USER_EDIT: 'user.edit',
  USER_DELETE: 'user.delete',

  // Student management
  STUDENT_VIEW: 'student.view',
  STUDENT_CREATE: 'student.create',
  STUDENT_EDIT: 'student.edit',
  STUDENT_DELETE: 'student.delete',

  // Lecturer management
  LECTURER_VIEW: 'lecturer.view',
  LECTURER_CREATE: 'lecturer.create',
  LECTURER_EDIT: 'lecturer.edit',
  LECTURER_DELETE: 'lecturer.delete',

  // Course management
  COURSE_VIEW: 'course.view',
  COURSE_CREATE: 'course.create',
  COURSE_EDIT: 'course.edit',
  COURSE_DELETE: 'course.delete',

  // OBE management
  OBE_VIEW: 'obe.view',
  OBE_MANAGE: 'obe.manage',

  // Assessment management
  ASSESSMENT_VIEW: 'assessment.view',
  ASSESSMENT_CREATE: 'assessment.create',
  ASSESSMENT_EDIT: 'assessment.edit',
  ASSESSMENT_GRADE: 'assessment.grade',

  // Report access
  REPORT_VIEW: 'report.view',
  REPORT_GENERATE: 'report.generate',
} as const