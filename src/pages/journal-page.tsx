import { useState, useEffect, useCallback } from "react";
import { MainLayout } from "@/components/template/main-layout";
import { Button } from "@/components/ui/button";
import { BookOpen, Plus, Trash2, Loader2, Pencil, X } from "lucide-react";
import {
  getJournalEntries,
  addJournalEntry,
  updateJournalEntry,
  deleteJournalEntry,
  getSessionNotes,
} from "@/lib/db";
import type { JournalEntry } from "@/lib/db";
import type { SessionNoteEntry } from "@/lib/db";
import { formatTime } from "@/lib/session-utils";

interface DayGroup {
  date: string;
  label: string;
  journal: JournalEntry[];
  sessionNotes: SessionNoteEntry[];
}

const MOOD_EMOJI: Record<string, string> = {
  focused: "🎯",
  neutral: "😐",
  distracted: "🌀",
};

function formatDayLabel(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  if (d.getTime() === today.getTime()) return "Today";
  if (d.getTime() === yesterday.getTime()) return "Yesterday";
  return d.toLocaleDateString(undefined, {
    weekday: "long",
    month: "short",
    day: "numeric",
    year: d.getFullYear() === today.getFullYear() ? undefined : "numeric",
  });
}

function dateFromISO(startedAt: string): string {
  // started_at may be "YYYY-MM-DD HH:MM:SS" or ISO; normalize to YYYY-MM-DD.
  return startedAt.split("T")[0].split(" ")[0];
}

export function JournalPage() {
  const [groups, setGroups] = useState<DayGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [composing, setComposing] = useState(false);
  const [draft, setDraft] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editDraft, setEditDraft] = useState("");
  const [saving, setSaving] = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    const [journal, sessionNotes] = await Promise.all([
      getJournalEntries().catch(() => [] as JournalEntry[]),
      getSessionNotes().catch(() => [] as SessionNoteEntry[]),
    ]);

    // Merge journal entries + session notes by day.
    const byDay = new Map<string, DayGroup>();
    for (const j of journal) {
      const key = j.date;
      if (!byDay.has(key)) {
        byDay.set(key, { date: key, label: formatDayLabel(key), journal: [], sessionNotes: [] });
      }
      byDay.get(key)!.journal.push(j);
    }
    for (const n of sessionNotes) {
      const key = dateFromISO(n.started_at);
      if (!byDay.has(key)) {
        byDay.set(key, { date: key, label: formatDayLabel(key), journal: [], sessionNotes: [] });
      }
      byDay.get(key)!.sessionNotes.push(n);
    }

    const sorted = Array.from(byDay.values()).sort((a, b) =>
      a.date < b.date ? 1 : -1,
    );
    setGroups(sorted);
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const handleSaveNew = async () => {
    const trimmed = draft.trim();
    if (!trimmed) return;
    setSaving(true);
    try {
      await addJournalEntry(trimmed);
      setDraft("");
      setComposing(false);
      await refresh();
    } finally {
      setSaving(false);
    }
  };

  const handleSaveEdit = async (id: number) => {
    const trimmed = editDraft.trim();
    if (!trimmed) return;
    setSaving(true);
    try {
      await updateJournalEntry(id, trimmed);
      setEditingId(null);
      setEditDraft("");
      await refresh();
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    await deleteJournalEntry(id);
    await refresh();
  };

  const startEdit = (entry: JournalEntry) => {
    setEditingId(entry.id);
    setEditDraft(entry.content);
  };

  const hasAny = groups.some(
    (g) => g.journal.length > 0 || g.sessionNotes.length > 0,
  );

  return (
    <MainLayout>
      <div className="px-4 sm:px-6 md:px-12 py-6 md:py-12 max-w-4xl mx-auto h-full overflow-y-auto">
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-8 md:mb-12">
          <div>
            <p className="text-[10px] font-bold text-sahara-text-muted uppercase tracking-[0.2em] mb-1">
              Reflection
            </p>
            <h1 className="font-serif text-2xl md:text-4xl text-sahara-text">
              Journal
            </h1>
          </div>
          <Button
            variant="solid"
            intent="sahara"
            size="sm"
            shape="rounded-full"
            onClick={() => {
              setComposing((v) => !v);
              setDraft("");
            }}
            className="gap-1.5 px-4 shadow-lg shadow-sahara-primary/20 text-[10px] sm:text-xs font-bold tracking-widest uppercase"
          >
            <Plus className="size-3.5" />
            New Entry
          </Button>
        </header>

        {/* Composer */}
        {composing && (
          <div className="mb-8 bg-sahara-surface border border-sahara-border/20 rounded-2xl p-4 md:p-5">
            <textarea
              autoFocus
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="What's on your mind? Capture a win, a lesson, or a distraction to avoid next time…"
              rows={4}
              className="w-full bg-transparent text-sm text-sahara-text placeholder:text-sahara-text-muted resize-none focus:outline-none"
            />
            <div className="flex justify-end gap-2 mt-3 pt-3 border-t border-sahara-border/15">
              <Button
                variant="ghost"
                intent="default"
                size="xs"
                onClick={() => {
                  setComposing(false);
                  setDraft("");
                }}
                className="text-[10px]"
              >
                Cancel
              </Button>
              <Button
                variant="solid"
                intent="sahara"
                size="xs"
                onClick={handleSaveNew}
                disabled={saving || !draft.trim()}
                className="text-[10px]"
              >
                {saving ? "Saving…" : "Save"}
              </Button>
            </div>
          </div>
        )}

        {/* Entries */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 className="size-8 text-sahara-primary animate-spin" />
            <p className="text-xs font-semibold text-sahara-text-muted uppercase tracking-wider">
              Loading journal…
            </p>
          </div>
        ) : !hasAny ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
            <div className="size-16 rounded-full bg-sahara-primary-light/40 flex items-center justify-center">
              <BookOpen className="size-7 text-sahara-primary" />
            </div>
            <div>
              <p className="font-serif text-lg text-sahara-text mb-1">
                Your journal is empty
              </p>
              <p className="text-xs text-sahara-text-muted max-w-xs">
                Write a reflection, or complete a focus session with a note — it'll appear here.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-8 md:space-y-10">
            {groups.map((group) => (
              <section key={group.date}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-1.5 h-5 bg-sahara-primary rounded-full" />
                  <h2 className="font-serif text-base md:text-lg font-semibold text-sahara-text">
                    {group.label}
                  </h2>
                  <span className="text-[10px] text-sahara-text-muted uppercase tracking-widest">
                    {group.date}
                  </span>
                </div>

                <div className="space-y-3">
                  {/* Journal entries */}
                  {group.journal.map((entry) => (
                    <div
                      key={entry.id}
                      className="bg-sahara-surface border border-sahara-border/20 rounded-xl p-4 md:p-5"
                    >
                      {editingId === entry.id ? (
                        <div>
                          <textarea
                            autoFocus
                            value={editDraft}
                            onChange={(e) => setEditDraft(e.target.value)}
                            rows={3}
                            className="w-full bg-transparent text-sm text-sahara-text resize-none focus:outline-none"
                          />
                          <div className="flex justify-end gap-2 mt-2">
                            <Button
                              variant="ghost"
                              intent="default"
                              size="xs"
                              onClick={() => setEditingId(null)}
                              className="text-[10px]"
                            >
                              <X className="size-3" />
                            </Button>
                            <Button
                              variant="solid"
                              intent="sahara"
                              size="xs"
                              onClick={() => handleSaveEdit(entry.id)}
                              disabled={saving || !editDraft.trim()}
                              className="text-[10px]"
                            >
                              Save
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <p className="text-sm text-sahara-text leading-relaxed whitespace-pre-wrap">
                            {entry.content}
                          </p>
                          <div className="flex items-center justify-between mt-3 pt-3 border-t border-sahara-border/10">
                            <span className="text-[10px] text-sahara-text-muted uppercase tracking-widest">
                              Journal
                            </span>
                            <div className="flex gap-1">
                              <button
                                onClick={() => startEdit(entry)}
                                className="p-1.5 rounded-md text-sahara-text-muted hover:text-sahara-primary hover:bg-sahara-card transition-colors"
                                title="Edit"
                              >
                                <Pencil className="size-3.5" />
                              </button>
                              <button
                                onClick={() => handleDelete(entry.id)}
                                className="p-1.5 rounded-md text-sahara-text-muted hover:text-red-500 hover:bg-red-500/10 transition-colors"
                                title="Delete"
                              >
                                <Trash2 className="size-3.5" />
                              </button>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  ))}

                  {/* Session notes (read-only, from completed sessions) */}
                  {group.sessionNotes.map((note) => (
                    <div
                      key={`s-${note.id}`}
                      className="bg-sahara-card/40 border border-sahara-border/15 rounded-xl p-4 md:p-5"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-base">
                          {note.mood ? MOOD_EMOJI[note.mood] ?? "✨" : "✨"}
                        </span>
                        <span className="text-[10px] font-bold text-sahara-text-muted uppercase tracking-widest">
                          {note.category_name ?? "Session"}
                          {note.task_name ? ` · ${note.task_name}` : ""}
                        </span>
                        <span className="text-[10px] text-sahara-text-muted ml-auto tabular-nums">
                          {formatTime(note.started_at)}
                        </span>
                      </div>
                      <p className="text-sm text-sahara-text-secondary leading-relaxed whitespace-pre-wrap">
                        {note.notes}
                      </p>
                    </div>
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
}
