import Link from "next/link";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { signOut } from "@/lib/auth";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session) redirect("/login");

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Sidebar */}
      <aside className="w-56 bg-white border-r border-gray-200 flex flex-col">
        <div className="px-5 py-4 border-b border-gray-200">
          <h1 className="text-lg font-bold text-gray-800">Link Direction</h1>
          <p className="text-xs text-gray-400 mt-0.5">Painel Admin</p>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          <NavLink href="/admin">Dashboard</NavLink>
          <NavLink href="/admin/sellers">Vendedores</NavLink>
          <NavLink href="/admin/groups">Grupos</NavLink>
          <NavLink href="/admin/analytics">Analytics</NavLink>
        </nav>

        <div className="px-3 py-4 border-t border-gray-200">
          <form
            action={async () => {
              "use server";
              await signOut({ redirectTo: "/login" });
            }}
          >
            <button
              type="submit"
              className="w-full text-left text-sm text-gray-500 hover:text-red-600 transition px-2 py-1.5 rounded"
            >
              Sair
            </button>
          </form>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 p-8 overflow-auto">{children}</main>
    </div>
  );
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="block px-3 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition"
    >
      {children}
    </Link>
  );
}
