/**
 * Runs a fire-and-forget store action from an event handler, logging instead of
 * producing an unhandled rejection.
 *
 * Timer actions are async because they write to SQLite, but click handlers
 * cannot await them. Without this the rejection is unobservable.
 */
export function runDetached(
  label: string,
  action: Promise<unknown> | (() => Promise<unknown>),
): void {
  const promise = typeof action === "function" ? action() : action;
  void promise.catch((err) => {
    console.error(`[Timer] ${label} failed:`, err);
  });
}
