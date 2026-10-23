# Kairos

Kairos is a Pomodoro-style focus timer for the desktop. It records focus sessions against tasks and reports on focus history.

## Language

**Session**:
A single recorded block of focus work on a task.
_Avoid_: timer record, pomodoro, entry

**Focused time**:
The time actually spent focusing during a session, excluding paused time. This is what a session's duration always means.
_Avoid_: elapsed time, session length, wall-clock duration

**Wall-clock span**:
The real time from when a session started to the moment it was ended, including any paused time. A span may be far longer than the focused time.
_Avoid_: duration (reserved for focused time)

**Planned duration**:
The length a session is set to when it starts, before any adjustments.
_Avoid_: set time, target, total

**Overtime**:
Focused time beyond the planned duration. Counts as focused time.
_Avoid_: extra time, overrun

### Session lifecycle

**Pause**:
A temporary halt of the countdown. Paused time counts toward neither focused time nor overtime.
_Avoid_: break (Break is a scheduled phase, not a user-initiated halt)

**Break**:
The scheduled rest phase that follows a completed focus session.
_Avoid_: pause, rest

**Finish**:
Ending a session before its countdown reaches zero, keeping it in history with its focused time.
_Avoid_: stop, complete (complete means the countdown ran out on its own)

**Abandon**:
Ending a session and discarding it entirely; it never appears in history or stats.
_Avoid_: cancel, delete

**Time adjustment**:
Manually adding or removing planned minutes while a session is running or paused. Applies to the countdown regardless of pause state.
_Avoid_: edit, extend
