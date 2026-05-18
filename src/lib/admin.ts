import { auth } from "@/auth";
import { isAdminEmail } from "@/lib/admin-access";
import { ApiError, requireUser } from "@/lib/auth";

export { getAdminEmails, isAdminEmail } from "@/lib/admin-access";

export async function requireAdmin() {
  const user = await requireUser();
  if (!isAdminEmail(user.email)) {
    throw new ApiError("Accès administrateur refusé", 403);
  }
  return user;
}

export async function getAdminSession() {
  const session = await auth();
  if (!session?.user?.id) return null;
  if (!isAdminEmail(session.user.email)) return null;
  return session;
}
