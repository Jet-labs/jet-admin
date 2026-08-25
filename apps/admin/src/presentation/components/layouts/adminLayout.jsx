import React from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { Boxes, KeyRound, LibraryBig, LogOut, ShieldCheck } from "lucide-react";
import { operatorLogoutAPI } from "../../../data/apis/auth";
import { useAdminStore } from "../../../logic/stores/useAdminStore";

const NAV_ITEMS = [
  { to: "/library", label: "Widget library", icon: LibraryBig },
  { to: "/roles", label: "Roles", icon: ShieldCheck },
  { to: "/permissions", label: "Permissions", icon: KeyRound },
];

export const AdminLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const operator = useAdminStore((s) => s.operator);
  const clearSession = useAdminStore((s) => s.clearSession);

  const _signOut = async () => {
    try {
      await operatorLogoutAPI();
    } catch {
      /* best-effort — clear locally regardless */
    }
    clearSession();
    navigate("/login", { replace: true });
  };

  return (
    <div className="flex h-screen w-full bg-background text-foreground">
      {/* Sidebar */}
      <aside className="flex w-56 shrink-0 flex-col border-r border-border/50">
        <div className="flex items-center gap-2 p-2">
          <Boxes className="h-4 w-4 text-primary" />
          <span className="text-sm font-semibold">Platform Admin</span>
        </div>

        <nav className="flex flex-col gap-0.5 px-1">
          {NAV_ITEMS.map(({ to, label, icon: Icon }) => {
            const isActive = location.pathname.startsWith(to);
            return (
              <Link
                key={to}
                to={to}
                className={`flex items-center gap-2 rounded px-2 py-1.5 text-sm transition-colors ${
                  isActive
                    ? "bg-primary/5 font-semibold text-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <Icon className="h-4 w-4" />
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto border-t border-border/50 p-2">
          <div className="mb-1 flex items-center gap-1.5 px-1 text-xs text-muted-foreground">
            <KeyRound className="h-3 w-3" />
            <span className="truncate">{operator?.email || "signed in"}</span>
          </div>
          <button
            type="button"
            onClick={_signOut}
            className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
        </div>
      </aside>

      {/* Content */}
      <main className="min-w-0 flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
};
