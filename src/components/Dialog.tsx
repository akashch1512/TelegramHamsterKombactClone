import { useEffect, useRef } from 'react';
import type { ReactNode } from 'react';

interface Props {
  labelledBy: string;
  onClose: () => void;
  children: ReactNode;
}

/**
 * Modal dialog on the native <dialog> element: it traps focus and makes the page inert.
 * Esc or a tap on the backdrop closes it, and focus returns to where it was (Plan.md §6).
 * Render it only while it should be open.
 */
export function Dialog({ labelledBy, onClose, children }: Props) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    const returnTo = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    if (!dialog.open) dialog.showModal();
    return () => {
      if (dialog.open) dialog.close();
      if (returnTo?.isConnected) returnTo.focus({ preventScroll: true });
    };
  }, []);

  return (
    <dialog
      ref={ref}
      className="sheet"
      aria-labelledby={labelledBy}
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose(); // backdrop
      }}
    >
      <div className="rounded-3xl bg-panel p-5 text-cream shadow-2xl ring-1 ring-gold/30">{children}</div>
    </dialog>
  );
}
