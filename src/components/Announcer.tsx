export interface Announcement {
  text: string;
  /** Visible toast as well as a screen-reader announcement. */
  visible: boolean;
}

/**
 * One polite live region for the whole game (Plan.md §6). It is always rendered so
 * screen readers pick up changes; visible messages also appear as a toast.
 */
export function Announcer({ message }: { message: Announcement | null }) {
  return (
    <div role="status" aria-live="polite" aria-atomic="true" className={message?.visible ? 'toast' : 'sr-only'}>
      {message?.text ?? ''}
    </div>
  );
}
