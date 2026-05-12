import { auth, currentUser } from '@clerk/nextjs/server';

export type UserRole = 'admin' | 'nurse' | 'patient';

/**
 * Get the current user's role from Clerk publicMetadata
 */
export async function getUserRole(): Promise<UserRole | null> {
  const user = await currentUser();
  if (!user) return null;

  const role = user.publicMetadata?.role as UserRole | undefined;
  return role || 'patient'; // Default to patient if no role is set
}

/**
 * Check if the current user has admin or nurse privileges
 */
export async function isClinicStaff(): Promise<boolean> {
  const role = await getUserRole();
  return role === 'admin' || role === 'nurse';
}

/**
 * Check if the current user is an admin
 */
export async function isAdmin(): Promise<boolean> {
  const role = await getUserRole();
  return role === 'admin';
}

/**
 * Require clinic staff authentication. Throws error if unauthorized.
 */
export async function requireClinicStaff() {
  const { userId } = await auth();
  
  if (!userId) {
    throw new Error('Unauthorized');
  }

  const isStaff = await isClinicStaff();
  if (!isStaff) {
    throw new Error('Forbidden: Requires clinic staff privileges');
  }
  
  return userId;
}
