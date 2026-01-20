import { auth0 } from "@/lib/auth0";

export async function AuthButton() {
  const session = await auth0.getSession();

  if (session) {
    return (
      <div className="flex items-center gap-4">
        <span className="text-sm text-gray-600">{session.user.email}</span>
        <a
          href="/auth/logout"
          className="text-sm text-blue-600 hover:underline"
        >
          Logout
        </a>
      </div>
    );
  }

  return (
    <a
      href="/auth/login"
      className="text-sm text-blue-600 hover:underline"
    >
      Login
    </a>
  );
}
