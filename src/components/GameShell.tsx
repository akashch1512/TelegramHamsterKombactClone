import type { ReactNode } from 'react';

/**
 * The game surface (Plan.md §2.2, A7): full-bleed on phones, a centered column from
 * 600 px wide, and a framed phone shape when there is also enough height. Everything
 * outside the surface is a blurred, non-interactive backdrop.
 */
export function GameShell({ dim = false, children }: { dim?: boolean; children: ReactNode }) {
  return (
    <div className="app-root">
      <div className="backdrop" aria-hidden="true" />
      <div className="surface">
        <div className={`surface-art${dim ? ' surface-art--dim' : ''}`} aria-hidden="true" />
        <div className="safe flex h-full min-h-0 flex-col">{children}</div>
      </div>
    </div>
  );
}
