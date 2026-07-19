import { ReactNode } from 'react';
import { cn } from '../../lib/utils';

// ─────────────────────────────────────────────────────────────────────────────
// AppShell — Wrapper principal de l'application
// Usage :
//   <AppShell sidebar={<Sidebar />}>
//     <PageHeader title="Arrivées VIP" />
//     <Section>...</Section>
//   </AppShell>
// ─────────────────────────────────────────────────────────────────────────────

interface AppShellProps {
  /** Sidebar gauche (navigation principale) */
  sidebar?: ReactNode;
  /** Topbar (optionnel) */
  topbar?: ReactNode;
  children: ReactNode;
  className?: string;
}

export function AppShell({ sidebar, topbar, children, className }: AppShellProps) {
  return (
    <div className="flex h-screen w-full overflow-hidden bg-obsidian-950 text-text-primary">
      {/* Sidebar */}
      {sidebar && (
        <aside className="hidden lg:flex flex-col w-64 shrink-0 border-r border-border-subtle bg-surface overflow-y-auto">
          {sidebar}
        </aside>
      )}

      {/* Main content column */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        {/* Topbar */}
        {topbar && (
          <header className="shrink-0 h-14 flex items-center border-b border-border-subtle bg-surface px-4 sm:px-6 z-10">
            {topbar}
          </header>
        )}

        {/* Page content */}
        <main className={cn('flex-1 overflow-y-auto', className)}>
          {children}
        </main>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// AppContent — Conteneur de contenu de page avec padding standard
// ─────────────────────────────────────────────────────────────────────────────

export function AppContent({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn('px-4 sm:px-6 py-6 max-w-screen-2xl mx-auto', className)}>
      {children}
    </div>
  );
}
