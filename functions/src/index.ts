import { initializeApp } from 'firebase-admin/app'
import { getAuth, type UserRecord } from 'firebase-admin/auth'
import { FieldValue, getFirestore } from 'firebase-admin/firestore'
import { HttpsError, onCall } from 'firebase-functions/v2/https'

initializeApp()

const roles = ['super_admin', 'admin', 'project_manager', 'member'] as const
type AgusRole = typeof roles[number]

async function requireSuperAdmin(request: { auth?: { uid: string } | null }) {
  if (!request.auth) throw new HttpsError('unauthenticated', 'Masuk untuk mengelola pengguna.')
  const user = await getAuth().getUser(request.auth.uid)
  if (roleOf(user) !== 'super_admin') {
    throw new HttpsError('permission-denied', 'Hanya Super Admin yang dapat mengelola pengguna.')
  }
  return request.auth
}

function roleOf(user: UserRecord) {
  const role = user.customClaims?.agusRole
  return typeof role === 'string' && roles.includes(role as AgusRole) ? role : 'member'
}

async function audit(actorUid: string, action: string, targetUid: string, details: Record<string, unknown> = {}) {
  await getFirestore().collection('adminAuditLogs').add({
    actorUid,
    action,
    targetUid,
    details,
    createdAt: FieldValue.serverTimestamp(),
  })
}

async function isOnlySuperAdmin(target: UserRecord) {
  if (roleOf(target) !== 'super_admin') return false
  let pageToken: string | undefined
  let count = 0
  do {
    const page = await getAuth().listUsers(1000, pageToken)
    count += page.users.filter(user => roleOf(user) === 'super_admin').length
    pageToken = page.pageToken
  } while (pageToken && count < 2)
  return count <= 1
}

function serializeUser(user: UserRecord) {
  return {
    uid: user.uid,
    email: user.email ?? null,
    displayName: user.displayName ?? null,
    role: roleOf(user),
    disabled: user.disabled,
    createdAt: user.metadata.creationTime || null,
    lastSignInAt: user.metadata.lastSignInTime || null,
  }
}

export const ensureMemberRole = onCall(async request => {
  if (!request.auth) throw new HttpsError('unauthenticated', 'Masuk untuk menyiapkan akun.')
  const auth = getAuth()
  const user = await auth.getUser(request.auth.uid)
  const currentRole = user.customClaims?.agusRole
  if (typeof currentRole === 'string' && roles.includes(currentRole as AgusRole)) {
    return { role: currentRole }
  }
  await auth.setCustomUserClaims(user.uid, { ...user.customClaims, agusRole: 'member' })
  return { role: 'member' }
})

export const listManagedUsers = onCall(async request => {
  await requireSuperAdmin(request)
  const pageToken = request.data?.pageToken
  if (pageToken !== undefined && typeof pageToken !== 'string') {
    throw new HttpsError('invalid-argument', 'Token halaman tidak valid.')
  }
  const page = await getAuth().listUsers(50, pageToken || undefined)
  return { users: page.users.map(serializeUser), nextPageToken: page.pageToken || null }
})

export const setManagedUserRole = onCall(async request => {
  const actor = await requireSuperAdmin(request)
  const { uid, role } = request.data ?? {}
  if (typeof uid !== 'string' || typeof role !== 'string' || !roles.includes(role as AgusRole)) {
    throw new HttpsError('invalid-argument', 'Pengguna atau peran tidak valid.')
  }
  if (uid === actor.uid) throw new HttpsError('failed-precondition', 'Peran akun yang sedang digunakan tidak dapat diubah dari panel ini.')

  const auth = getAuth()
  const user = await auth.getUser(uid)
  if (roleOf(user) === 'super_admin' && role !== 'super_admin' && await isOnlySuperAdmin(user)) {
    throw new HttpsError('failed-precondition', 'Super Admin terakhir tidak dapat diturunkan perannya.')
  }
  await auth.setCustomUserClaims(uid, { ...user.customClaims, agusRole: role })
  await audit(actor.uid, 'role_changed', uid, { role })
  return { success: true }
})

export const setManagedUserDisabled = onCall(async request => {
  const actor = await requireSuperAdmin(request)
  const { uid, disabled } = request.data ?? {}
  if (typeof uid !== 'string' || typeof disabled !== 'boolean') {
    throw new HttpsError('invalid-argument', 'Pengguna atau status akun tidak valid.')
  }
  if (uid === actor.uid) throw new HttpsError('failed-precondition', 'Akun yang sedang digunakan tidak dapat dinonaktifkan.')

  const auth = getAuth()
  const user = await auth.getUser(uid)
  if (roleOf(user) === 'super_admin') {
    throw new HttpsError('failed-precondition', 'Akun Super Admin tidak dapat dinonaktifkan dari panel ini.')
  }
  await auth.updateUser(uid, { disabled })
  await audit(actor.uid, disabled ? 'user_disabled' : 'user_enabled', uid)
  return { success: true }
})

export const deleteManagedUser = onCall(async request => {
  const actor = await requireSuperAdmin(request)
  const { uid } = request.data ?? {}
  if (typeof uid !== 'string') throw new HttpsError('invalid-argument', 'ID pengguna tidak valid.')
  if (uid === actor.uid) throw new HttpsError('failed-precondition', 'Akun yang sedang digunakan tidak dapat dihapus.')

  const auth = getAuth()
  const user = await auth.getUser(uid)
  if (roleOf(user) === 'super_admin') {
    throw new HttpsError('failed-precondition', 'Akun Super Admin tidak dapat dihapus dari panel ini.')
  }
  await audit(actor.uid, 'user_deleted', uid, { email: user.email ?? null })
  await auth.deleteUser(uid)
  await getFirestore().collection('users').doc(uid).delete()
  return { success: true }
})
